from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, get_optional_user, require_role
from app.models.case import Case, CaseStatus
from app.models.fund_breakdown import FundBreakdown
from app.models.user import User
from app.schemas.case import CaseCreate, CaseUpdate, CaseOut, CaseDetailOut, DocumentOut

router = APIRouter(prefix="/api/cases", tags=["cases"])


@router.post("", response_model=CaseOut, status_code=status.HTTP_201_CREATED)
async def create_case(
    data: CaseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("seeker")),
):
    if data.target_amount <= 0:
        raise HTTPException(status_code=400, detail="Target amount must be positive")

    if data.fund_breakdowns:
        breakdown_total = sum(b.amount for b in data.fund_breakdowns)
        if abs(breakdown_total - data.target_amount) > 1:
            raise HTTPException(
                status_code=400,
                detail=f"Fund breakdown total ({breakdown_total}) must match target amount ({data.target_amount})",
            )

    case = Case(
        seeker_id=current_user.id,
        title=data.title,
        description=data.description,
        category=data.category,
        target_amount=data.target_amount,
        urgency=data.urgency,
    )
    db.add(case)
    await db.flush()

    for bd in data.fund_breakdowns:
        db.add(FundBreakdown(case_id=case.id, label=bd.label, amount=bd.amount))
    await db.flush()
    await db.refresh(case)
    return case


@router.get("", response_model=list[CaseOut])
async def list_cases(
    category: str | None = Query(None),
    urgency: str | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    query = select(Case)

    if current_user is None or current_user.role == "donor":
        query = query.where(Case.status == CaseStatus.VERIFIED.value)
    elif current_user.role == "seeker":
        query = query.where(Case.seeker_id == current_user.id)
    elif current_user.role == "admin":
        if status_filter:
            query = query.where(Case.status == status_filter)

    if category:
        query = query.where(Case.category == category)
    if urgency:
        query = query.where(Case.urgency == urgency)

    query = query.order_by(Case.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{case_id}", response_model=CaseDetailOut)
async def get_case(
    case_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    is_owner = current_user and current_user.id == case.seeker_id
    is_admin = current_user and current_user.role == "admin"

    if not is_owner and not is_admin and case.status != CaseStatus.VERIFIED.value:
        raise HTTPException(status_code=403, detail="Case not accessible")

    case_dict = CaseDetailOut.model_validate(case)

    if not is_admin and not is_owner:
        case_dict.documents = [
            DocumentOut.model_validate(d) for d in case.documents if d.donor_visible
        ]
        case_dict.admin_notes = None

    return case_dict


@router.patch("/{case_id}", response_model=CaseOut)
async def update_case(
    case_id: int,
    data: CaseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("seeker")),
):
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if case.seeker_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your case")
    if case.status != CaseStatus.PENDING.value:
        raise HTTPException(status_code=400, detail="Can only edit pending cases")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(case, field, value)

    await db.flush()
    await db.refresh(case)
    return case
