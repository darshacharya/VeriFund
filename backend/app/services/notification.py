from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification


async def create_notification(
    db: AsyncSession,
    user_id: int,
    message: str,
    link: str | None = None,
):
    notif = Notification(user_id=user_id, message=message, link=link)
    db.add(notif)
