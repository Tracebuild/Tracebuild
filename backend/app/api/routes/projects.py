from uuid import UUID
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.auth import AuthDep, CurrentUser
from app.core.supabase import get_supabase
from app.models.schemas import APIResponse, ProjectCreate
from app.models.norm import ProjectNormCreate
from app.services.project_service import ProjectService
from app.services.norm_assignment_service import assign_norms_to_project

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=APIResponse)
async def list_projects(user: CurrentUser = AuthDep):
    service = ProjectService(get_supabase())
    projects = await service.list_projects(user.org_id)
    return APIResponse(data=[p.model_dump() for p in projects])


@router.post("", response_model=APIResponse, status_code=201)
async def create_project(body: ProjectCreate, user: CurrentUser = AuthDep):
    service = ProjectService(get_supabase())
    project = await service.create_project(user.org_id, body)
    return APIResponse(data=project.model_dump())


@router.get("/{project_id}", response_model=APIResponse)
async def get_project(project_id: UUID, user: CurrentUser = AuthDep):
    service = ProjectService(get_supabase())
    project = await service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projekt nicht gefunden")
    if project.org_id != user.org_id:
        raise HTTPException(status_code=403, detail="Kein Zugriff")
    return APIResponse(data=project.model_dump())


@router.delete("/{project_id}", response_model=APIResponse)
async def delete_project(project_id: UUID, user: CurrentUser = AuthDep):
    service = ProjectService(get_supabase())
    project = await service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projekt nicht gefunden")
    if project.org_id != user.org_id:
        raise HTTPException(status_code=403, detail="Kein Zugriff")
    await service.delete_project(project_id)
    return APIResponse(data={"deleted": True})


# ── Project Norms ─────────────────────────────────────────────────────────────

@router.get("/{project_id}/norms", response_model=APIResponse)
async def list_project_norms(project_id: UUID, user: CurrentUser = AuthDep):
    db = get_supabase()
    proj = db.table("projects").select("id").eq("id", str(project_id)).eq("org_id", str(user.org_id)).single().execute()
    if not proj.data:
        raise HTTPException(status_code=404, detail="Projekt nicht gefunden")

    res = db.table("project_norms").select("*, norms(*)").eq("project_id", str(project_id)).execute()
    return APIResponse(data=res.data)


@router.post("/{project_id}/norms", response_model=APIResponse, status_code=201)
async def add_project_norm(project_id: UUID, body: ProjectNormCreate, user: CurrentUser = AuthDep):
    db = get_supabase()
    proj = db.table("projects").select("id").eq("id", str(project_id)).eq("org_id", str(user.org_id)).single().execute()
    if not proj.data:
        raise HTTPException(status_code=404, detail="Projekt nicht gefunden")

    res = db.table("project_norms").upsert(
        {"project_id": str(project_id), "norm_id": str(body.norm_id), "added_by": "user"},
        on_conflict="project_id,norm_id",
        ignore_duplicates=True,
    ).execute()
    return APIResponse(data=res.data[0] if res.data else {"norm_id": str(body.norm_id)})


@router.post("/{project_id}/norms/refresh", response_model=APIResponse)
async def refresh_project_norms(project_id: UUID, user: CurrentUser = AuthDep):
    """Re-run automatic norm assignment for a project."""
    db = get_supabase()
    proj = db.table("projects").select("location, domain, org_id").eq("id", str(project_id)).eq("org_id", str(user.org_id)).single().execute()
    if not proj.data:
        raise HTTPException(status_code=404, detail="Projekt nicht gefunden")

    loc = proj.data.get("location", {})
    count = assign_norms_to_project(
        db,
        project_id=str(project_id),
        org_id=str(user.org_id),
        canton=loc.get("canton", ""),
        municipality=loc.get("municipality", ""),
        domain=proj.data.get("domain", "bau"),
    )
    return APIResponse(data={"assigned": count})
