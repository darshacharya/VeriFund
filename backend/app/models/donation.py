import enum
from datetime import datetime

from sqlalchemy import String, Numeric, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class DonationStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class Donation(Base):
    __tablename__ = "donations"

    id: Mapped[int] = mapped_column(primary_key=True)
    donor_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    case_id: Mapped[int] = mapped_column(Integer, ForeignKey("cases.id"))
    amount: Mapped[float] = mapped_column(Numeric(12, 2))
    payment_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default=DonationStatus.PENDING.value)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    donor = relationship("User", back_populates="donations", lazy="selectin")
    case = relationship("Case", back_populates="donations")
