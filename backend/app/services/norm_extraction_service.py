"""
Extracts concrete building-law rules (Grenzabstand, Gebäudehöhe, Ausnützungsziffer, etc.)
from a legal document linked from a geoportal zone record, scoped to a specific zone —
norm by norm, in German, ready to store as individual `norms` rows.
"""
from __future__ import annotations
import base64
import json
import re
from urllib.parse import urljoin

import anthropic
import httpx

from app.core.config import settings

_TIMEOUT = 20.0
_MAX_PDF_BYTES = 25 * 1024 * 1024

# Anchor text that marks the actual regulation (what we want), vs. the approval
# decree/decision paperwork that a legal-basis registry (e.g. an SG "OEREBlex" record)
# often links first (scanned, not useful for extracting numeric rules from).
_REGULATION_LINK_RE = re.compile(r"reglement|verordnung|erlass|gesetz", re.IGNORECASE)
_APPROVAL_DECREE_RE = re.compile(r"genehmigung", re.IGNORECASE)
_ANCHOR_RE = re.compile(r'<a[^>]+href="([^"]+)"[^>]*>([^<]*)</a>', re.IGNORECASE)


def _find_regulation_link(html: str, base_url: str) -> str | None:
    """Finds the best "this is the actual regulation" link inside an HTML registry/index page."""
    best: tuple[str, int] | None = None
    for href, anchor_text in _ANCHOR_RE.findall(html):
        if not _REGULATION_LINK_RE.search(anchor_text):
            continue
        score = 0 if _APPROVAL_DECREE_RE.search(anchor_text) else 1  # prefer the regulation over its approval decree
        if best is None or score > best[1]:
            best = (urljoin(base_url, href), score)
    return best[0] if best else None


async def _fetch_raw(url: str) -> tuple[str, bytes] | None:
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.get(url)
        if resp.status_code != 200:
            return None
        return resp.headers.get("content-type", ""), resp.content


def _to_fetched(content_type: str, url: str, data: bytes) -> tuple[str, str] | None:
    """Returns (kind, payload): kind is 'pdf' (payload=base64) or 'text' (payload=stripped text)."""
    if "pdf" in content_type.lower() or url.lower().endswith(".pdf"):
        if len(data) > _MAX_PDF_BYTES:
            return None
        return "pdf", base64.standard_b64encode(data).decode("utf-8")
    html = data.decode("utf-8", errors="ignore")
    text = re.sub(r"<script[\s\S]*?</script>", "", html, flags=re.IGNORECASE)
    text = re.sub(r"<style[\s\S]*?</style>", "", text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return "text", text


async def _fetch_document(url: str) -> tuple[str, str] | None:
    """
    Some geoportal-linked "documents" are actually registry/index pages (e.g. an SG
    "OEREBlex" legal-basis record) that only describe a decision and link out to the real
    regulation PDF, rather than containing any rule text themselves. This follows one such
    hop when it finds a clearly-labelled regulation link, so extraction reads the actual
    Baureglement/Verordnung instead of an administrative cover page.
    """
    first = await _fetch_raw(url)
    if not first:
        return None
    content_type, data = first

    if "pdf" not in content_type.lower() and not url.lower().endswith(".pdf"):
        html = data.decode("utf-8", errors="ignore")
        regulation_url = _find_regulation_link(html, url)
        if regulation_url and regulation_url != url:
            second = await _fetch_raw(regulation_url)
            if second:
                return _to_fetched(second[0], regulation_url, second[1])

    return _to_fetched(content_type, url, data)


def _parse_rules(raw_text: str) -> list[dict]:
    match = re.search(r"\{[\s\S]*\}", raw_text)
    if not match:
        return []
    try:
        parsed = json.loads(match.group(0))
    except json.JSONDecodeError:
        return []
    rules = parsed.get("rules")
    if not isinstance(rules, list):
        return []
    out = []
    for r in rules:
        if isinstance(r, dict) and r.get("title") and r.get("category") and r.get("text"):
            out.append({"title": r["title"], "category": r["category"], "text": r["text"]})
    return out


async def extract_norms_from_document(doc: dict, zone: dict) -> list[dict]:
    """
    Fetches a legal document (PDF or HTML) linked from a geoportal zone record and asks
    Claude to pull out the concrete, numbered rules that apply to the given zone — not
    just "see the law", but the actual Grenzabstand/Gebäudehöhe/etc. values.
    `doc`: {typ, titel, link, ...}. `zone`: {code, label, kanton, gemeinde}.
    Returns [] on any failure (fetch error, empty doc, no rules found) so the caller can
    fall back to a plain reference norm rather than lose the norm entirely.
    """
    link = doc.get("link")
    if not link:
        return []

    try:
        fetched = await _fetch_document(link)
    except Exception:
        return []
    if not fetched or not fetched[1]:
        return []
    kind, payload = fetched

    zone_desc = " – ".join(filter(None, [zone.get("code"), zone.get("label")])) or "unbekannte Zone"
    instruction = (
        f"Dies ist \"{doc.get('titel')}\" ({doc.get('typ')}), gültig für {zone.get('gemeinde')}, "
        f"Kanton {zone.get('kanton')}. Die betroffene Parzelle liegt in der Zonenkategorie \"{zone_desc}\". "
        f"Extrahiere die konkreten, für einen Architekten/Zeichner beim Bauen in dieser Zone verbindlichen "
        f"Vorschriften (z.B. Grenzabstand, Gebäudehöhe, Ausnützungsziffer, Geschosszahl, Dachneigung, Firsthöhe). "
        f"Falls die Zonenkategorie nicht auf eine exakte Ziffer/Unterzone eingrenzt ist (z.B. nur \"Wohnzone\" "
        f"statt \"Wohnzone W2\") und das Dokument mehrere Varianten dieser Kategorie mit unterschiedlichen Werten "
        f"enthält (z.B. W2, W3, W4), extrahiere JEDE Variante als eigene Regel und benenne sie eindeutig mit "
        f"ihrer jeweiligen Unterzone im Titel. Ignoriere Verfahrensvorschriften, Definitionen und Vorschriften, "
        f"die eindeutig zu einer völlig anderen Zonenkategorie gehören. Falls keine konkreten Werte auffindbar "
        f"sind, gib eine leere Liste zurück — erfinde nichts.\n\n"
        f"Antworte AUSSCHLIESSLICH mit einem JSON-Objekt der Form "
        f'{{"rules": [{{"title": string, "category": string, "text": string}}]}}, ohne weiteren Text.'
    )

    if kind == "pdf":
        content = [
            {"type": "document", "source": {"type": "base64", "media_type": "application/pdf", "data": payload}},
            {"type": "text", "text": instruction},
        ]
    else:
        content = [{"type": "text", "text": f"{instruction}\n\n---\nDokument-Inhalt:\n{payload[:150000]}"}]

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    try:
        response = client.messages.create(
            model="claude-sonnet-5",
            max_tokens=4096,
            messages=[{"role": "user", "content": content}],
        )
        raw_text = next((b.text for b in response.content if hasattr(b, "text")), "{}")
        return _parse_rules(raw_text)
    except Exception:
        return []
