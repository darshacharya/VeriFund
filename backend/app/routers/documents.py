import os

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from jose import JWTError, jwt as jose_jwt

from app.config import settings
from app.database import get_db
from app.dependencies import get_optional_user, require_role
from app.models.case import Case
from app.models.document import Document
from app.models.user import User
from app.schemas.case import DocumentOut
from app.services.storage import storage

router = APIRouter(prefix="/api", tags=["documents"])


@router.post("/cases/{case_id}/documents", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    case_id: int,
    doc_type: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("seeker")),
):
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if case.seeker_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your case")

    file_path = await storage.save(file, subdir=f"cases/{case_id}")
    doc = Document(
        case_id=case_id,
        doc_type=doc_type,
        file_path=file_path,
        original_filename=file.filename or "file",
    )
    db.add(doc)
    await db.flush()
    await db.refresh(doc)
    return doc


@router.get("/documents/{doc_id}/file")
async def get_document_file(
    doc_id: int,
    token: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    # Fallback: resolve user from ?token= query param (for <img src> tags that can't send headers)
    if current_user is None and token:
        try:
            payload = jose_jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id = payload.get("sub")
            if user_id:
                user_result = await db.execute(select(User).where(User.id == int(user_id)))
                current_user = user_result.scalar_one_or_none()
        except JWTError:
            pass

    if current_user is None:
        raise HTTPException(status_code=401, detail="Authentication required")

    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if current_user.role == "donor" and not doc.donor_visible:
        raise HTTPException(status_code=403, detail="Document not accessible")

    if current_user.role == "seeker":
        case_result = await db.execute(select(Case).where(Case.id == doc.case_id))
        case = case_result.scalar_one_or_none()
        if case and case.seeker_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not your document")

    file_path = os.path.realpath(os.path.join(settings.UPLOAD_DIR, doc.file_path))
    if not file_path.startswith(os.path.realpath(settings.UPLOAD_DIR)):
        raise HTTPException(status_code=403, detail="Access denied")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")

    import mimetypes
    import re
    media_type, _ = mimetypes.guess_type(doc.original_filename)
    safe_filename = re.sub(r'[^\w\-. ]', '_', doc.original_filename)
    return FileResponse(
        file_path,
        media_type=media_type or "application/octet-stream",
        headers={"Content-Disposition": f'inline; filename="{safe_filename}"'},
    )
