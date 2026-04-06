"""Seed script to create the initial admin user."""
import asyncio

from app.database import init_db, async_session
from app.models.user import User, UserRole
from app.services.auth import hash_password
from sqlalchemy import select


async def seed():
    await init_db()

    async with async_session() as session:
        result = await session.execute(select(User).where(User.role == UserRole.ADMIN.value))
        if result.scalar_one_or_none():
            print("Admin user already exists.")
            return

        admin = User(
            email="admin@verifund.org",
            name="Admin",
            hashed_password=hash_password("admin123"),
            role=UserRole.ADMIN.value,
        )
        session.add(admin)
        await session.commit()
        print("Admin user created: admin@verifund.org / admin123")


if __name__ == "__main__":
    asyncio.run(seed())
