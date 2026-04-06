from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models.case import Case
from app.models.case_update import CaseUpdate
from app.models.user import User
from app.schemas.case_update import CaseUpdateCreate, CaseUpdateOut
from app.services.notification import create_notification

router = APIRouter(prefix="/api/cases/{case_id}/updates", tags=["updates"])


@router.post("", response_model=CaseUpdateOut, status_code=201)
async def add_update(
    case_id: int,
    data: CaseUpdateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("seeker")),
):
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if case.seeker_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your case")

    update = CaseUpdate(
        case_id=case_id,
        content=data.content,
        update_type=data.update_type,
    )
    db.add(update)

    from app.models.donation import Donation
    donor_result = await db.execute(
        select(Donation.donor_id).where(Donation.case_id == case_id).distinct()
    )
    donor_ids = [row[0] for row in donor_result.all()]
    for donor_id in donor_ids:
        await create_notification(
            db, donor_id,
            f"New update on case '{case.title}': {data.content[:80]}",
            link=f"/cases/{case_id}",
        )

    await db.flush()
    await db.refresh(update)
    return update


@router.get("", response_model=list[CaseUpdateOut])
async def list_updates(
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

    updates_result = await db.execute(
        select(CaseUpdate)
        .where(CaseUpdate.case_id == case_id)
        .order_by(CaseUpdate.created_at.asc())
    )
    return updates_result.scalars().all()
