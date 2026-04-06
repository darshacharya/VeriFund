from datetime import datetime
from pydantic import BaseModel


class NotificationOut(BaseModel):
    id: int
    message: str
    link: str | None = None
    read: bool
    created_at: datetime

    model_config = {"from_attributes": True}
