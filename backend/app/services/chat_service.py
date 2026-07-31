"""
Chat-Service: Streaming-Chat mit Projektkontext und Normen.

- Modell: claude-haiku-4-5 (kostengünstig)
- Prompt Caching auf System-Prompt (~90% Input-Cost-Ersparnis)
- Normen aus project_norms, nicht aus standards
- Letzte Analyse-Findings als Kontext
- Cost-Tracking in chat_messages.cost_usd
"""
from __future__ import annotations
from uuid import UUID
from collections.abc import AsyncGenerator

import anthropic
from supabase import Client
from app.core.config import settings

MODEL = "claude-haiku-4-5-20251001"
PRICE_IN  = 0.80 / 1_000_000   # $ per input token
PRICE_OUT = 4.00 / 1_000_000   # $ per output token


def _build_system_prompt(
    project: dict,
    norm_rows: list[dict],
    last_items: list[dict],
) -> str:
    name      = project.get("name", "")
    location  = project.get("location") or {}
    gemeinde  = location.get("municipality", "unbekannt")
    kanton    = location.get("canton", "unbekannt")
    bauzone   = project.get("bauzone") or "nicht ermittelt"

    norms = [r.get("norms") or r for r in norm_rows if r.get("norms") or r.get("title")]
    normen_liste = (
        "\n".join(
            f"- [{n.get('category', '')}] {n.get('title', '')}: {n.get('text', '')[:200]}"
            for n in norms
        )
        if norms
        else "Noch keine Normen zugewiesen."
    )

    fail_warn = [i for i in last_items if i.get("status") in ("fail", "warn")]
    analyse_summary = (
        "\n".join(
            f"- [{i['status'].upper()}] {i.get('norm_title') or 'Norm'}: {i.get('note', '')}"
            for i in fail_warn
        )
        if fail_warn
        else "Keine offenen Prüfpunkte aus der letzten Analyse."
    )

    return f"""Du bist ein Baurechtsassistent für das Projekt "{name}" in {gemeinde}, Kanton {kanton}, Bauzone {bauzone}.

Projektkontext:

Zugewiesene Normen:
{normen_liste}

Letzte Analyse:
{analyse_summary}

Du kannst:
- Fragen zum Projekt und den festgestellten Prüfpunkten beantworten
- Allgemeine Fragen zu Schweizer Baurecht, SIA-Normen und kantonalen Baugesetzen beantworten
- Verbesserungsvorschläge bei Norm-Verstössen erläutern

Du kannst nicht:
- Rechtsverbindliche Aussagen machen (weise darauf hin)
- Auf Dokumente ausserhalb des Projekts zugreifen

Antworte auf Deutsch. Sei präzise und praxisorientiert."""


class ChatService:
    def __init__(self, db: Client) -> None:
        self.db = db
        self.claude = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    def _load_project(self, project_id: UUID) -> dict:
        res = (
            self.db.table("projects")
            .select("name, domain, location, bauzone")
            .eq("id", str(project_id))
            .limit(1)
            .execute()
        )
        return res.data[0] if (res and res.data) else {}

    def _load_norms(self, project_id: UUID) -> list[dict]:
        res = (
            self.db.table("project_norms")
            .select("norms(id, title, category, text)")
            .eq("project_id", str(project_id))
            .execute()
        )
        return res.data or []

    def _load_last_items(self, project_id: UUID) -> list[dict]:
        docs = (
            self.db.table("documents")
            .select("id")
            .eq("project_id", str(project_id))
            .execute()
        )
        doc_ids = [d["id"] for d in (docs.data or [])]
        if not doc_ids:
            return []

        latest = (
            self.db.table("analyses")
            .select("id")
            .in_("document_id", doc_ids)
            .eq("status", "done")
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if not (latest and latest.data):
            return []

        analysis_id = latest.data[0]["id"]
        items = (
            self.db.table("analysis_items")
            .select("status, note, norm_title")
            .eq("analysis_id", analysis_id)
            .in_("status", ["fail", "warn"])
            .execute()
        )
        return items.data or []

    async def get_history(self, project_id: UUID) -> list[dict]:
        res = (
            self.db.table("chat_messages")
            .select("role, content")
            .eq("project_id", str(project_id))
            .order("created_at")
            .limit(20)
            .execute()
        )
        return res.data or []

    async def stream_response(
        self, project_id: UUID, user_message: str
    ) -> AsyncGenerator[str, None]:
        # Save user message
        self.db.table("chat_messages").insert(
            {"project_id": str(project_id), "role": "user", "content": user_message}
        ).execute()

        # Load context
        project    = self._load_project(project_id)
        norm_rows  = self._load_norms(project_id)
        last_items = self._load_last_items(project_id)
        history    = await self.get_history(project_id)
        system     = _build_system_prompt(project, norm_rows, last_items)

        full_response = ""
        total_input = total_output = 0

        with self.claude.messages.stream(
            model=MODEL,
            max_tokens=2048,
            system=[{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}],
            messages=history,
        ) as stream:
            for text in stream.text_stream:
                full_response += text
                yield f"data: {text}\n\n"

            usage = stream.get_final_message().usage
            total_input  = usage.input_tokens
            total_output = usage.output_tokens

        cost_usd = total_input * PRICE_IN + total_output * PRICE_OUT

        self.db.table("chat_messages").insert(
            {
                "project_id": str(project_id),
                "role": "assistant",
                "content": full_response,
                "cost_usd": cost_usd,
            }
        ).execute()
