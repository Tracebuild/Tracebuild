import json
from uuid import UUID
import anthropic
from supabase import Client
from app.core.config import settings
from app.domains import get_domain
from app.models.schemas import StandardOut, LocationSchema


class StandardsService:
    def __init__(self, db: Client) -> None:
        self.db = db
        self.claude = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    async def research_standards(
        self, project_id: UUID, location: LocationSchema, domain_id: str
    ) -> list[StandardOut]:
        domain = get_domain(domain_id)
        prompt = domain.get_standards_search_prompt(location.model_dump())

        response = self.claude.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            tools=[{"type": "web_search_20250305", "name": "web_search"}],
            messages=[{"role": "user", "content": prompt}],
        )

        result_text = ""
        for block in response.content:
            if hasattr(block, "text"):
                result_text = block.text

        try:
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            standards_data = json.loads(result_text)
        except Exception:
            standards_data = []

        saved: list[StandardOut] = []
        for item in standards_data:
            payload = {
                "domain": domain_id,
                "layer": 2,
                "jurisdiction_type": "cantonal",
                "jurisdiction_name": location.canton.upper(),
                "category": item.get("category", "allgemein"),
                "text": item.get("text", ""),
                "source_url": item.get("source_url"),
            }
            res = self.db.table("standards").insert(payload).execute()
            if res.data:
                saved.append(StandardOut(**res.data[0]))

        return saved

    async def get_standards(
        self,
        domain: str,
        jurisdiction_type: str | None = None,
        jurisdiction_name: str | None = None,
    ) -> list[StandardOut]:
        query = self.db.table("standards").select("*").eq("domain", domain)
        if jurisdiction_type:
            query = query.eq("jurisdiction_type", jurisdiction_type)
        if jurisdiction_name:
            query = query.eq("jurisdiction_name", jurisdiction_name)
        res = query.execute()
        return [StandardOut(**row) for row in res.data]
