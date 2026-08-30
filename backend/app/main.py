from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import projects, standards, standards_admin, admin_norms, analyses, chat, auth

app = FastAPI(
    title="KI Analyse Plattform API",
    version="0.1.0",
    description="API für automatische Prüfung von Bauplänen gegen Normen und Vorschriften",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(projects.router, prefix=API_PREFIX)
app.include_router(standards_admin.router, prefix=API_PREFIX)
app.include_router(admin_norms.router, prefix=API_PREFIX)
app.include_router(standards.router, prefix=API_PREFIX)
app.include_router(analyses.router, prefix=API_PREFIX)
app.include_router(chat.router, prefix=API_PREFIX)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}
