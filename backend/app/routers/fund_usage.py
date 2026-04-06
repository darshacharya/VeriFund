from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models.case import Case
from app.models.fund_usage import FundUsage
from app.models.user import User
from app.schemas.fund_usage import FundUsageOut
from app.services.storage import storage

router = APIRouter(prefix="/api/cases/{case_id}/fund-usage", tags=["fund-usage"])


@router.post("", response_model=FundUsageOut, status_code=201)
async def add_fund_usage(
    case_id: int,
    description: str = Form(...),
    amount: float = Form(...),
    receipt: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("seeker")),
):
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if case.seeker_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your case")

    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    receipt_path = None
    if receipt:
        receipt_path = await storage.save(receipt, subdir=f"cases/{case_id}/receipts")

    usage = FundUsage(
        case_id=case_id,
        description=description,
        amount=amount,
        receipt_path=receipt_path,
    )
    db.add(usage)
    await db.flush()
    await db.refresh(usage)
    return usage


@router.get("", response_model=list[FundUsageOut])
async def list_fund_usage(
    case_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.case import CaseStatus
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    is_owner = current_user.id == case.seeker_id
    is_admin = current_user.role == "admin"
    if not is_owner and not is_admin and case.status != CaseStatus.VERIFIED.value:
        raise HTTPException(status_code=403, detail="Case not accessible")

    usage_result = await db.execute(
        select(FundUsage)
        .where(FundUsage.case_id == case_id)
        .order_by(FundUsage.created_at.desc())
    )
    return usage_result.scalars().all()
