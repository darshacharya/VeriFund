from datetime import datetime
from pydantic import BaseModel


class CaseUpdateCreate(BaseModel):
    content: str
    update_type: str = "general"


class CaseUpdateOut(BaseModel):
    id: int
    case_id: int
    content: str
    update_type: str
    created_at: datetime

    model_config = {"from_attributes": True}
