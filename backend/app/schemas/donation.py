from datetime import datetime
from pydantic import BaseModel


class DonationCreate(BaseModel):
    case_id: int
    amount: float


class DonationOut(BaseModel):
    id: int
    donor_id: int
    case_id: int
    amount: float
    payment_id: str | None = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
