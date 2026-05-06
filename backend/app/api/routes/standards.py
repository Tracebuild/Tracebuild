from uuid import UUID
from fastapi import APIRouter, HTTPException
from app.core.auth import AuthDep, CurrentUser
from app.core.supabase import get_supabase
from app.models.schemas import APIResponse
from app.services.standards_upload_service import StandardsUploadService

router = APIRouter(prefix="/projects/{project_id}/standards", tags=["standards"])


def _get_project(project_id: UUID, user: CurrentUser) -> dict:
    db = get_supabase()
    proj = (
        db.table("projects")
        .select("domain, org_id, location")
        .eq("id", str(project_id))
        .single()
        .execute()
    )
    if not proj.data:
        raise HTTPException(status_code=404, detail="Projekt nicht gefunden")
    if proj.data["org_id"] != str(user.org_id):
        raise HTTPException(status_code=403, detail="Kein Zugriff")
    return proj.data


@router.get("", response_model=APIResponse)
async def list_project_standards(
    project_id: UUID,
    user: CurrentUser = AuthDep,
):
    """Gibt Normen aus der DB zurück, gefiltert nach Domain + Region des Projekts."""
    proj = _get_project(project_id, user)
    location = proj.get("location") or {}
    canton = location.get("canton", "")

    service = StandardsUploadService(get_supabase())
    standards = await service.list_all(
        domain=proj["domain"],
        jurisdiction_type="cantonal" if canton else None,
        jurisdiction_name=canton if canton else None,
    )
    return APIResponse(data=[s.model_dump() for s in standards])
