from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import auth, cases, documents, admin, donations, fund_usage, updates, notifications


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(cases.router)
app.include_router(documents.router)
app.include_router(admin.router)
app.include_router(donations.router)
app.include_router(fund_usage.router)
app.include_router(updates.router)
app.include_router(notifications.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}
