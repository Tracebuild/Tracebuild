from __future__ import annotations
from datetime import datetime, date
from uuid import UUID
from pydantic import BaseModel


# ── Layer helpers ─────────────────────────────────────────────────────────────

_LAYER_LABELS: dict[int, str] = {
    1: "International",
    2: "National",
    3: "Kantonal / Branche",
    4: "Kommunal",
    5: "Organisation",
}


# ── Norms ─────────────────────────────────────────────────────────────────────

class NormCreate(BaseModel):
    title: str
    domain: str = "bau"
    layer: int = 2
    jurisdiction_type: str
    jurisdiction_name: str | None = None
    category: str
    text: str
    source_url: str | None = None
    source_doc: str | None = None
    valid_from: date | None = None


class NormRead(BaseModel):
    id: UUID
    title: str
    domain: str
    layer: int
    jurisdiction_type: str
    jurisdiction_name: str | None
    org_id: UUID | None
    category: str
    text: str
    source_url: str | None
    source_doc: str | None
    valid_from: date | None
    created_at: datetime


class NormWithLayer(NormRead):
    layer_label: str

    @classmethod
    def from_norm(cls, norm: NormRead) -> "NormWithLayer":
        return cls(
            **norm.model_dump(),
            layer_label=_LAYER_LABELS.get(norm.layer, f"Layer {norm.layer}"),
        )


# ── Project ↔ Norm ────────────────────────────────────────────────────────────

class ProjectNormCreate(BaseModel):
    norm_id: UUID


class ProjectNormRead(BaseModel):
    id: UUID
    project_id: UUID
    norm_id: UUID
    added_at: datetime
    norm: NormRead | None = None
