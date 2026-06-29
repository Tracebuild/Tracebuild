from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "tracebuild",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Europe/Zurich",
)


@celery_app.task(name="run_analysis_async")
def run_analysis_async(document_id: str, project_id: str, domain_id: str) -> dict:
    """Async Analyse-Task für Batch-Verarbeitung."""
    import asyncio
    from uuid import UUID
    from app.core.supabase import get_supabase
    from app.services.analysis_service import AnalysisService

    async def _run():
        service = AnalysisService(get_supabase())
        result = await service.run_analysis(
            UUID(document_id), UUID(project_id), domain_id
        )
        return result.model_dump()

    return asyncio.run(_run())
