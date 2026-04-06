from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field

from app.schemas.user import UserOut


class FundBreakdownCreate(BaseModel):
    label: str = Field(..., min_length=1, max_length=255)
    amount: float = Field(..., gt=0)


class FundBreakdownOut(BaseModel):
    id: int
    label: str
    amount: float
    model_config = {"from_attributes": True}


class CaseCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: str = Field(..., min_length=10)
    category: Literal["medical", "death"]
    target_amount: float = Field(..., gt=0)
    urgency: Literal["low", "medium", "high", "critical"] = "medium"
    fund_breakdowns: list[FundBreakdownCreate] = []


class CaseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    target_amount: float | None = None
    urgency: str | None = None


class DocumentOut(BaseModel):
    id: int
    doc_type: str
    original_filename: str
    admin_verified: bool
    donor_visible: bool
    model_config = {"from_attributes": True}


class DonationOut(BaseModel):
    id: int
    donor_id: int
    amount: float
    status: str
    created_at: datetime
    donor: UserOut | None = None
    model_config = {"from_attributes": True}


class FundUsageOut(BaseModel):
    id: int
    description: str
    amount: float
    receipt_path: str | None = None
    created_at: datetime
    model_config = {"from_attributes": True}


class CaseUpdateOut(BaseModel):
    id: int
    content: str
    update_type: str
    created_at: datetime
    model_config = {"from_attributes": True}


class CaseOut(BaseModel):
    id: int
    seeker_id: int
    title: str
    description: str
    category: str
    target_amount: float
    raised_amount: float
    status: str
    urgency: str
    admin_notes: str | None = None
    created_at: datetime
    seeker: UserOut | None = None
    fund_breakdowns: list[FundBreakdownOut] = []

    model_config = {"from_attributes": True}


class CaseDetailOut(CaseOut):
    documents: list[DocumentOut] = []
    donations: list[DonationOut] = []
    fund_usages: list[FundUsageOut] = []
    updates: list[CaseUpdateOut] = []
