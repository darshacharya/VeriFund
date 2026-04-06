from datetime import datetime
from pydantic import BaseModel


class FundUsageCreate(BaseModel):
    description: str
    amount: float


class FundUsageOut(BaseModel):
    id: int
    case_id: int
    description: str
    amount: float
    receipt_path: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
