from pydantic import BaseModel


class CaseVerifyRequest(BaseModel):
    status: str  # "verified" or "rejected"
    admin_notes: str | None = None


class DocumentVerifyRequest(BaseModel):
    admin_verified: bool
    donor_visible: bool
