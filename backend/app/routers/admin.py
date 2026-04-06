from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_role
from app.models.case import Case
from app.models.document import Document
from app.models.user import User
from app.schemas.admin import CaseVerifyRequest, DocumentVerifyRequest
from app.schemas.case import CaseOut, DocumentOut
from app.services.notification import create_notification

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/cases", response_model=list[CaseOut])
async def list_all_cases(
    status_filter: str | None = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_role("admin")),
):
    query = select(Case)
    if status_filter:
        query = query.where(Case.status == status_filter)
    query = query.order_by(Case.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.patch("/cases/{case_id}/verify", response_model=CaseOut)
async def verify_case(
    case_id: int,
    data: CaseVerifyRequest,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_role("admin")),
):
    if data.status not in ("verified", "rejected"):
        raise HTTPException(status_code=400, detail="Status must be 'verified' or 'rejected'")

    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    case.status = data.status
    if data.admin_notes is not None:
        case.admin_notes = data.admin_notes

    status_label = "approved" if data.status == "verified" else "rejected"
    await create_notification(
        db, case.seeker_id,
        f"Your case '{case.title}' has been {status_label}.",
        link=f"/cases/{case.id}",
    )

    await db.flush()
    await db.refresh(case)
    return case


@router.patch("/documents/{doc_id}/verify", response_model=DocumentOut)
async def verify_document(
    doc_id: int,
    data: DocumentVerifyRequest,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_role("admin")),
):
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    doc.admin_verified = data.admin_verified
    doc.donor_visible = data.donor_visible
    await db.flush()
    await db.refresh(doc)
    return doc
