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
    parcel_number: str | None = None
    bauzone: str | None = None


class ProjectOut(BaseModel):
    id: UUID
    org_id: UUID
    name: str
    domain: str
    location: dict[str, Any]
    status: str
    parcel_number: str | None = None
    bauzone: str | None = None
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

VALID_CATEGORIES = frozenset(
    {"grenzabstand", "gebaeudehöhe", "erschliessung", "brandschutz", "parkierung", "andere"}
)
VALID_STATUSES = frozenset({"ok", "fail", "warn"})
VALID_CONFIDENCES = frozenset({"high", "medium", "low"})


class AnalysisCheckItem(BaseModel):
    """Structured output from Claude — one check point per norm."""
    check_id: str
    norm_id: str | None = None
    norm_title: str
    category: str           # must be one of VALID_CATEGORIES
    status: str             # ok | fail | warn
    finding: str            # what Claude saw in the plan
    suggestion: str | None  # only for fail/warn
    confidence: str         # high | medium | low
    page_reference: int | None = None

    def normalize(self) -> "AnalysisCheckItem":
        return self.model_copy(update={
            "category":   self.category   if self.category   in VALID_CATEGORIES  else "andere",
            "status":     self.status     if self.status     in VALID_STATUSES    else "warn",
            "confidence": self.confidence if self.confidence in VALID_CONFIDENCES else "medium",
        })


class AnalysisItemOut(BaseModel):
    id: UUID
    analysis_id: UUID
    standard_id: UUID | None
    norm_id: UUID | None = None
    norm_title: str | None = None
    category: str | None = None
    confidence: str | None = None
    page_reference: int | None = None
    status: str  # 'ok' | 'fail' | 'warn'
    note: str    # stores the 'finding' text
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
