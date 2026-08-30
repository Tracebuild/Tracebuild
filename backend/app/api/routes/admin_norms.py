from fastapi import APIRouter, Query, UploadFile, File, Form, HTTPException
from app.core.auth import AuthDep, CurrentUser
from app.core.supabase import get_supabase
from app.models.schemas import APIResponse
from app.services.standards_upload_service import StandardsUploadService

router = APIRouter(prefix="/admin/norms", tags=["admin-norms"])


def _require_super_admin(user: CurrentUser) -> None:
    if user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Zugriff verweigert")


@router.get("", response_model=APIResponse)
async def list_all_norms(
    domain: str | None = Query(None),
    jurisdiction_type: str | None = Query(None),
    jurisdiction_name: str | None = Query(None),
    org_id: str | None = Query(None),
    platform_only: bool = Query(False),
    user: CurrentUser = AuthDep,
):
    """Every norm across every organization (super_admin only), annotated with
    owner org name / promotion provenance."""
    _require_super_admin(user)
    service = StandardsUploadService(get_supabase())
    norms = await service.list_all_admin(
        domain=domain,
        jurisdiction_type=jurisdiction_type,
        jurisdiction_name=jurisdiction_name,
        org_id=org_id,
        platform_only=platform_only,
    )
    return APIResponse(data=norms)


@router.post("/upload", response_model=APIResponse, status_code=201)
async def upload_platform_norm(
    file: UploadFile = File(...),
    domain: str = Form("bau"),
    jurisdiction_type: str = Form("cantonal"),
    jurisdiction_name: str = Form(""),
    category: str = Form(...),
    source_name: str = Form(""),
    zone: str = Form(""),
    user: CurrentUser = AuthDep,
):
    """Uploads a norm directly as platform-wide (org_id=None), super_admin only."""
    _require_super_admin(user)

    allowed = {
        "application/pdf", "text/plain", "text/csv",
        "application/octet-stream",
    }
    if file.content_type and file.content_type not in allowed:
        if not (file.filename or "").lower().endswith((".pdf", ".txt", ".csv")):
            raise HTTPException(
                status_code=422, detail="Only PDF or text files are allowed."
            )
    if jurisdiction_type != "national" and not jurisdiction_name:
        raise HTTPException(status_code=422, detail="Kanton/Gemeinde fehlt")

    file_bytes = await file.read()

    service = StandardsUploadService(get_supabase())
    saved = await service.upload(
        file_bytes=file_bytes,
        filename=file.filename or "upload",
        domain=domain,
        jurisdiction_type=jurisdiction_type,
        jurisdiction_name=jurisdiction_name or None,
        org_id=None,
        category=category,
        source_name=source_name,
        zone=zone or None,
    )

    return APIResponse(data={
        "count": len(saved),
        "jurisdiction_name": jurisdiction_name,
        "category": category,
    })


@router.post("/{norm_id}/promote", response_model=APIResponse)
async def promote_norm(norm_id: str, user: CurrentUser = AuthDep):
    """Makes an org-owned norm platform-wide. super_admin only."""
    _require_super_admin(user)
    service = StandardsUploadService(get_supabase())
    try:
        updated = await service.promote(norm_id)
    except ValueError as e:
        if str(e) == "not_found":
            raise HTTPException(status_code=404, detail="Norm nicht gefunden")
        raise HTTPException(status_code=400, detail="Norm ist bereits plattformweit")
    return APIResponse(data=updated)


@router.delete("/{norm_id}", response_model=APIResponse)
async def delete_norm(norm_id: str, user: CurrentUser = AuthDep):
    """Deletes any norm regardless of owning org. super_admin only."""
    _require_super_admin(user)
    service = StandardsUploadService(get_supabase())
    await service.delete_any(norm_id)
    return APIResponse(data={"deleted": True})
