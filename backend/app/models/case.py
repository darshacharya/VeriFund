import enum
from datetime import datetime

from sqlalchemy import String, Numeric, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CaseCategory(str, enum.Enum):
    MEDICAL = "medical"
    DEATH = "death"


class CaseStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"


class CaseUrgency(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Case(Base):
    __tablename__ = "cases"

    id: Mapped[int] = mapped_column(primary_key=True)
    seeker_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(500))
    description: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(20))
    target_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    raised_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    status: Mapped[str] = mapped_column(String(20), default=CaseStatus.PENDING.value)
    urgency: Mapped[str] = mapped_column(String(20), default=CaseUrgency.MEDIUM.value)
    admin_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    seeker = relationship("User", back_populates="cases", lazy="selectin")
    fund_breakdowns = relationship("FundBreakdown", back_populates="case", lazy="selectin", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="case", lazy="selectin", cascade="all, delete-orphan")
    donations = relationship("Donation", back_populates="case", lazy="selectin")
    fund_usages = relationship("FundUsage", back_populates="case", lazy="selectin")
    updates = relationship("CaseUpdate", back_populates="case", lazy="selectin")
