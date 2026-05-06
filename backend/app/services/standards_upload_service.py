import io
from supabase import Client
from app.models.schemas import StandardOut


class StandardsUploadService:
    def __init__(self, db: Client) -> None:
        self.db = db

    def _extract_text_from_pdf(self, file_bytes: bytes) -> str:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(file_bytes))
        pages = []
        for page in reader.pages:
            text = page.extract_text() or ""
            text = text.strip()
            if text:
                pages.append(text)
        return "\n\n".join(pages)

    async def upload(
        self,
        file_bytes: bytes,
        filename: str,
        domain: str,
        layer: int,
        jurisdiction_type: str,
        jurisdiction_name: str | None,
        category: str,
        source_name: str = "",
    ) -> list[StandardOut]:
        """One file = one DB row (no chunking)."""
        lower = filename.lower()

        if lower.endswith(".pdf"):
            text = self._extract_text_from_pdf(file_bytes)
        else:
            text = file_bytes.decode("utf-8", errors="replace")

        if not text.strip():
            return []

        row = {
            "domain": domain,
            "layer": layer,
            "jurisdiction_type": jurisdiction_type,
            "jurisdiction_name": jurisdiction_name or None,
            "category": category,
            "text": text[:100_000],
            "source_url": source_name or filename,
        }

        res = self.db.table("standards").insert(row).execute()
        return [StandardOut(**r) for r in (res.data or [])]

    async def list_all(
        self,
        domain: str | None = None,
        jurisdiction_type: str | None = None,
        jurisdiction_name: str | None = None,
    ) -> list[StandardOut]:
        query = self.db.table("standards").select("*").order("created_at", desc=True)
        if domain:
            query = query.eq("domain", domain)
        if jurisdiction_type:
            query = query.eq("jurisdiction_type", jurisdiction_type)
        if jurisdiction_name:
            query = query.eq("jurisdiction_name", jurisdiction_name)
        res = query.execute()
        return [StandardOut(**row) for row in (res.data or [])]

    async def delete(self, standard_id: str) -> None:
        self.db.table("standards").delete().eq("id", standard_id).execute()
