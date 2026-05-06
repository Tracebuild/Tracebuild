from __future__ import annotations
from datetime import datetime
from typing import Any
from uuid import UUID
from pydantic import BaseModel


# ── Generic API Response ─────────────────────────────────────────────────────

class APIResponse(BaseModel):
    data: Any | None = None
    error: str | None = None


# ── Projects ─────────────────────────────────────────────────────────────────

class LocationSchema(BaseModel):
    canton: str
    municipality: str
    country: str = "CH"


class ProjectCreate(BaseModel):
    name: str
    domain: str = "bau"
    location: LocationSchema


class ProjectOut(BaseModel):
    id: UUID
    org_id: UUID
    name: str
    domain: str
    location: dict[str, Any]
    status: str
    created_at: datetime


# ── Documents ─────────────────────────────────────────────────────────────────

class DocumentOut(BaseModel):
    id: UUID
    project_id: UUID
    file_url: str
    doc_type: str
    pages: int | None
    uploaded_at: datetime


# ── Standards ─────────────────────────────────────────────────────────────────

class StandardOut(BaseModel):
    id: UUID
    domain: str
    layer: int
    jurisdiction_type: str
    jurisdiction_name: str | None
    org_id: UUID | None = None
    category: str
    text: str
    source_url: str | None
    source_doc: str | None = None
    valid_from: str | None = None


class StandardsResearchRequest(BaseModel):
    location: LocationSchema


# ── Analyses ─────────────────────────────────────────────────────────────────

class AnalysisItemOut(BaseModel):
    id: UUID
    analysis_id: UUID
    standard_id: UUID | None
    status: str  # 'ok' | 'fail' | 'warn'
    note: str
    suggestion: str | None


class AnalysisOut(BaseModel):
    id: UUID
    document_id: UUID
    status: str
    cost_usd: float | None
    created_at: datetime
    items: list[AnalysisItemOut] = []


# ── Chat ──────────────────────────────────────────────────────────────────────

class ChatMessageCreate(BaseModel):
    content: str


class ChatMessageOut(BaseModel):
    id: UUID
    project_id: UUID
    role: str
    content: str
    created_at: datetime
