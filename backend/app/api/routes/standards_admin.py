from fastapi import APIRouter, Query, UploadFile, File, Form, HTTPException
from app.core.auth import AuthDep, CurrentUser
from app.core.supabase import get_supabase
from app.models.schemas import APIResponse
from app.services.standards_upload_service import StandardsUploadService

router = APIRouter(prefix="/standards", tags=["standards-admin"])


@router.get("", response_model=APIResponse)
async def list_standards(
    domain: str | None = Query(None),
    jurisdiction_type: str | None = Query(None),
    jurisdiction_name: str | None = Query(None),
    user: CurrentUser = AuthDep,
):
    service = StandardsUploadService(get_supabase())
    standards = await service.list_all(
        domain=domain,
        jurisdiction_type=jurisdiction_type,
        jurisdiction_name=jurisdiction_name,
    )
    return APIResponse(data=[s.model_dump() for s in standards])


@router.post("/upload", response_model=APIResponse, status_code=201)
async def upload_standards(
    file: UploadFile = File(...),
    domain: str = Form("bau"),
    layer: int = Form(2),
    jurisdiction_type: str = Form("cantonal"),
    jurisdiction_name: str = Form(""),
    category: str = Form(...),
    source_name: str = Form(""),
    user: CurrentUser = AuthDep,
):
    allowed = {
        "application/pdf", "text/plain", "text/csv",
        "application/octet-stream",
    }
    if file.content_type and file.content_type not in allowed:
        if not (file.filename or "").lower().endswith((".pdf", ".txt", ".csv")):
            raise HTTPException(
                status_code=422, detail="Only PDF or text files are allowed."
            )

    file_bytes = await file.read()

    service = StandardsUploadService(get_supabase())
    saved = await service.upload(
        file_bytes=file_bytes,
        filename=file.filename or "upload",
        domain=domain,
        layer=layer,
        jurisdiction_type=jurisdiction_type,
        jurisdiction_name=jurisdiction_name or None,
        category=category,
        source_name=source_name,
    )

    return APIResponse(data={
        "count": len(saved),
        "jurisdiction_name": jurisdiction_name,
        "category": category,
    })


@router.delete("/{standard_id}", response_model=APIResponse)
async def delete_standard(standard_id: str, user: CurrentUser = AuthDep):
    service = StandardsUploadService(get_supabase())
    await service.delete(standard_id)
    return APIResponse(data={"deleted": True})
