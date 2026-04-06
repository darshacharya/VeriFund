from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models.case import Case, CaseStatus
from app.models.donation import Donation, DonationStatus
from app.models.user import User
from app.schemas.donation import DonationCreate, DonationOut
from app.services.notification import create_notification
from app.services.payment import payment_gateway

router = APIRouter(prefix="/api/donations", tags=["donations"])


@router.post("", response_model=DonationOut, status_code=201)
async def create_donation(
    data: DonationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("donor")),
):
    result = await db.execute(select(Case).where(Case.id == data.case_id))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if case.status != CaseStatus.VERIFIED.value:
        raise HTTPException(status_code=400, detail="Case is not accepting donations")
    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    payment = await payment_gateway.create_payment(
        amount=data.amount,
        metadata={"case_id": case.id, "donor_id": current_user.id},
    )

    donation = Donation(
        donor_id=current_user.id,
        case_id=case.id,
        amount=data.amount,
        payment_id=payment["payment_id"],
        status=DonationStatus.COMPLETED.value,
    )
    db.add(donation)

    case.raised_amount = (case.raised_amount or 0) + data.amount

    await create_notification(
        db, case.seeker_id,
        f"{current_user.name} donated ₹{data.amount:,.0f} to your case '{case.title}'.",
        link=f"/cases/{case.id}",
    )

    await db.flush()
    await db.refresh(donation)
    return donation


@router.get("/my", response_model=list[DonationOut])
async def my_donations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Donation)
        .where(Donation.donor_id == current_user.id)
        .order_by(Donation.created_at.desc())
        .offset(skip).limit(limit)
    )
    return result.scalars().all()


@router.get("/case/{case_id}", response_model=list[DonationOut])
async def case_donations(
    case_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case_result = await db.execute(select(Case).where(Case.id == case_id))
    case = case_result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    is_owner = current_user.id == case.seeker_id
    is_admin = current_user.role == "admin"
    if not is_owner and not is_admin and case.status != CaseStatus.VERIFIED.value:
        raise HTTPException(status_code=403, detail="Case not accessible")

    result = await db.execute(
        select(Donation)
        .where(Donation.case_id == case_id)
        .order_by(Donation.created_at.desc())
    )
    return result.scalars().all()
