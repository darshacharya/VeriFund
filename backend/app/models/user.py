import enum
from datetime import datetime

from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserRole(str, enum.Enum):
    SEEKER = "seeker"
    DONOR = "donor"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default=UserRole.SEEKER.value)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    cases = relationship("Case", back_populates="seeker", lazy="selectin")
    donations = relationship("Donation", back_populates="donor", lazy="selectin")
    notifications = relationship("Notification", back_populates="user", lazy="selectin")
