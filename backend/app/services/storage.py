import os
import uuid
from typing import Protocol

from fastapi import UploadFile, HTTPException

from app.config import settings

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

ALLOWED_CONTENT_TYPES = {
    "image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/svg+xml",
    "application/pdf",
}

ALLOWED_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg", ".pdf",
}


class StorageBackend(Protocol):
    async def save(self, file: UploadFile, subdir: str = "") -> str: ...
    def get_url(self, path: str) -> str: ...


class LocalStorage:
    def __init__(self, base_dir: str = settings.UPLOAD_DIR):
        self.base_dir = base_dir
        os.makedirs(base_dir, exist_ok=True)

    async def save(self, file: UploadFile, subdir: str = "") -> str:
        ext = os.path.splitext(file.filename or "file")[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File type '{ext}' not allowed. Accepted: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
            )

        if file.content_type and file.content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(status_code=400, detail=f"Content type '{file.content_type}' not allowed")

        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 10 MB")

        filename = f"{uuid.uuid4().hex}{ext}"
        dir_path = os.path.join(self.base_dir, subdir)
        os.makedirs(dir_path, exist_ok=True)
        file_path = os.path.join(dir_path, filename)

        with open(file_path, "wb") as f:
            f.write(content)

        return os.path.join(subdir, filename) if subdir else filename

    def get_url(self, path: str) -> str:
        return f"/api/documents/file/{path}"


storage = LocalStorage()
