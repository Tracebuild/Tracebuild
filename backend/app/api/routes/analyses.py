from uuid import UUID, uuid4
from fastapi import APIRouter, HTTPException, UploadFile, File
from app.core.auth import AuthDep, CurrentUser
from app.core.supabase import get_supabase
from app.models.schemas import APIResponse
from app.services.analysis_service import AnalysisService

router = APIRouter(prefix="/projects/{project_id}/analyses", tags=["analyses"])


def _get_project(project_id: UUID, user: CurrentUser) -> dict:
    db = get_supabase()
    proj = (
        db.table("projects")
        .select("domain, org_id, location, bauzone")
        .eq("id", str(project_id))
        .single()
        .execute()
    )
    if not proj.data:
        raise HTTPException(status_code=404, detail="Projekt nicht gefunden")
    if proj.data["org_id"] != str(user.org_id):
        raise HTTPException(status_code=403, detail="Kein Zugriff")
    return proj.data


@router.post("", response_model=APIResponse, status_code=202)
async def create_analysis(
    project_id: UUID,
    file: UploadFile = File(...),
    user: CurrentUser = AuthDep,
):
    db = get_supabase()
    proj = _get_project(project_id, user)

    # PDF in Supabase Storage hochladen (optional — Fehler werden ignoriert)
    file_bytes = await file.read()
    storage_path = f"{project_id}/{uuid4()}_{file.filename}"
    file_url = ""
    try:
        db.storage.from_("documents").upload(
            storage_path, file_bytes, {"content-type": file.content_type}
        )
        file_url = db.storage.from_("documents").get_public_url(storage_path)
    except Exception:
        pass

    # Dokument-Eintrag anlegen
    doc_res = db.table("documents").insert(
        {
            "project_id": str(project_id),
            "file_url": file_url,
            "doc_type": "grundriss",
        }
    ).execute()
    document_id = UUID(doc_res.data[0]["id"])

    service = AnalysisService(db)
    analysis = await service.run_analysis(
        document_id, project_id, proj["domain"],
        file_bytes=file_bytes,
        content_type=file.content_type or "application/pdf",
        location=proj.get("location") or {},
        bauzone=proj.get("bauzone"),
    )
    data = analysis.model_dump()
    data["documents"] = {"file_url": file_url, "doc_type": "grundriss"}
    return APIResponse(data=data)


@router.get("", response_model=APIResponse)
async def list_analyses(project_id: UUID, user: CurrentUser = AuthDep):
    _get_project(project_id, user)
    db = get_supabase()
    res = (
        db.table("analyses")
        .select("*, analysis_items(*), documents!inner(project_id, file_url, doc_type)")
        .eq("documents.project_id", str(project_id))
        .order("created_at", desc=True)
        .execute()
    )
    return APIResponse(data=res.data)
