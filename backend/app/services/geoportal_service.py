"""
Swiss geoportal lookups: parcel → LV95 coordinates → zone details + legal-basis documents.

Step 1  geo.admin.ch SearchServer: parcel number + municipality → LV95 (east, north) + EGRID
Step 2  geodienste.ch NPL API:     bbox around coordinate → zone code/label + Dokumente

Both steps use a short timeout so a slow external API never blocks project
creation. Any failure returns None/empty; callers fall back to manual input.
"""
from __future__ import annotations
import json
import re
import httpx

_GEO_ADMIN = "https://api3.geo.admin.ch/rest/services/api/SearchServer"
_GEODIENSTE = (
    "https://geodienste.ch/db/npl_nutzungsplanung_v1_2_0/deu/ogcapi"
    "/collections/grundnutzung/items"
)
_LV95_CRS = "http://www.opengis.net/def/crs/EPSG/0/2056"
_TIMEOUT = 8.0
_EGRID_RE = re.compile(r"ch\d{12}", re.IGNORECASE)

# Only these two document types from the federal "MGDM Nutzungsplanung" schema are
# binding legal bases (Gesetz/Verordnung/Bauordnung). "Hinweis" entries are informational
# only and are deliberately excluded so we don't import non-binding norms.
_BINDING_DOC_TYPES = {"GesetzlicheGrundlage", "Rechtsvorschrift"}


async def get_parcel_coordinates(
    parcel_number: str,
    municipality: str,
) -> dict | None:
    """Return {east, north, egrid} in LV95 for the given parcel, or None."""
    params = {
        # geo.admin.ch only matches "<Gemeinde> <Parzellennummer>", not the reverse order.
        "searchText": f"{municipality} {parcel_number}",
        "origins": "parcel",
        "type": "locations",
        "limit": 1,
        "sr": 2056,
    }
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.get(_GEO_ADMIN, params=params)
        resp.raise_for_status()

    results = resp.json().get("results", [])
    if not results:
        return None

    attrs = results[0].get("attrs", {})
    x = attrs.get("x")
    y = attrs.get("y")
    if x is None or y is None:
        return None
    egrid_match = _EGRID_RE.search(attrs.get("detail", "") or "")
    return {
        # Swiss LV95 convention: geo.admin.ch's "x" is Northing, "y" is Easting.
        "east": float(y),
        "north": float(x),
        "egrid": egrid_match.group(0).upper() if egrid_match else None,
    }


def _parse_documents(raw: str | None) -> list[dict]:
    if not raw:
        return []
    try:
        parsed = json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return []
    documents = parsed.get("Dokumente") or []
    out = []
    for d in documents:
        if d.get("Typ") not in _BINDING_DOC_TYPES or not d.get("Titel") or not d.get("Link"):
            continue
        out.append({
            "typ": d["Typ"],
            "titel": d["Titel"],
            "abkuerzung": d.get("Abkuerzung"),
            "link": d["Link"],
            "offizielle_nr": d.get("OffizielleNr"),
        })
    return out


# Per-canton fallbacks for municipalities not yet covered by the national
# geodienste.ch "grundnutzung" layer (data is rolled out commune-by-commune;
# coverage is genuinely patchy, not a bug). Add more cantons here as gaps are found.
_GR_MAPSERV_PROXY = "https://map.geo.gr.ch/mapserv_proxy"
_GR_OGCSERVER = "Kanton Graubünden, Bauzonen Graubuenden"
_GR_ZONE_RE = re.compile(r"<ms:CH_Hauptnutzung_Name>([^<]*)</ms:CH_Hauptnutzung_Name>")


async def _get_gr_zone_details(east: float, north: float) -> dict | None:
    """
    Kanton Graubünden runs its own GeoMapFish/c2cgeoportal instance (map.geo.gr.ch),
    independent of the national geodienste.ch federation. Its "Bauzonen_Hauptnutzungen"
    WFS layer only exposes the coarse Hauptnutzung label (e.g. "Wohnzonen"), not a
    short zone code or legal-basis documents — still far better than no data at all.
    """
    delta = 50
    params = {
        "ogcserver": _GR_OGCSERVER,
        "SERVICE": "WFS",
        "VERSION": "1.1.0",
        "REQUEST": "GetFeature",
        "TYPENAME": "Bauzonen_Hauptnutzungen",
        "BBOX": f"{east - delta},{north - delta},{east + delta},{north + delta},urn:ogc:def:crs:EPSG::2056",
        "SRSNAME": "urn:ogc:def:crs:EPSG::2056",
        "maxfeatures": 1,
    }
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.get(_GR_MAPSERV_PROXY, params=params)
        resp.raise_for_status()

    match = _GR_ZONE_RE.search(resp.text)
    if not match or not match.group(1):
        return None
    name = match.group(1)
    return {
        "bauzone": name, "zone_bezeichnung": name, "hauptnutzung": name,
        "kanton": "GR", "documents": [],
    }


_CANTON_FALLBACKS = {"GR": _get_gr_zone_details}


async def get_zone_details(east: float, north: float, canton: str | None = None) -> dict | None:
    """Return zone code/label + legal-basis documents at LV95 coordinate (east, north)."""
    delta = 50
    params = {
        "bbox": f"{east - delta},{north - delta},{east + delta},{north + delta}",
        "bbox-crs": _LV95_CRS,
        "crs": _LV95_CRS,
        "f": "json",
        "limit": 1,
    }
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.get(_GEODIENSTE, params=params)
        resp.raise_for_status()

    features = resp.json().get("features", [])
    if not features:
        fallback = _CANTON_FALLBACKS.get(canton or "")
        if fallback:
            return await fallback(east, north)
        return None
    props = features[0].get("properties", {})
    return {
        "bauzone": props.get("typ_kantonal_code"),
        "zone_bezeichnung": props.get("typ_kantonal_bezeichnung"),
        "hauptnutzung": props.get("hauptnutzung_bezeichnung"),
        "kanton": props.get("kanton"),
        "documents": _parse_documents(props.get("dokument")),
    }


async def lookup_parcel(
    parcel_number: str,
    municipality: str,
    canton: str | None = None,
) -> dict:
    """
    Full lookup: parcel number + municipality → zone details + legal-basis documents.
    Any key is None/empty when the corresponding API call fails or returns no data.
    Errors are swallowed so callers can always continue with a fallback.
    """
    result: dict = {
        "bauzone": None, "zone_bezeichnung": None, "hauptnutzung": None,
        "kanton": None, "egrid": None, "documents": [],
    }
    try:
        coords = await get_parcel_coordinates(parcel_number, municipality)
        if coords:
            result["egrid"] = coords["egrid"]
            try:
                zone = await get_zone_details(coords["east"], coords["north"], canton)
                if zone:
                    result.update(zone)
            except Exception:
                pass
    except Exception:
        pass
    return result
