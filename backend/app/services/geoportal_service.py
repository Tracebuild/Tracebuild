"""
Swiss geoportal lookups: parcel → LV95 coordinates → zone details + legal-basis documents.

Step 1  geo.admin.ch SearchServer: parcel number + municipality → LV95 (east, north) + EGRID
Step 2  geodienste.ch NPL API:     bbox around coordinate → zone code/label + Dokumente

Both steps use a short timeout so a slow external API never blocks project
creation. Any failure returns None/empty; callers fall back to manual input.
"""
from __future__ import annotations
import json
import math
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


# --- Point-in-polygon / nearest-polygon verification -------------------------------
#
# The upstream OGC services (both the national geodienste.ch federation and Kanton
# Graubünden's own WFS) have been observed, via direct testing, to sometimes return a
# "bbox-filtered" feature that does not actually intersect the requested box — in one
# reproduced case the returned zone polygon was over 1km from the query point. Blindly
# trusting the first result previously surfaced wrong zones (e.g. a forest/notice area
# instead of the parcel's real residential zone) with false confidence. Every candidate
# is now geometrically verified before being trusted; if none is close enough, we
# honestly report "not found" rather than show a wrong zone.
NEAREST_ZONE_THRESHOLD_M = 60


def _point_in_ring(x: float, y: float, ring: list[list[float]]) -> bool:
    inside = False
    n = len(ring)
    for i in range(n):
        x1, y1 = ring[i][0], ring[i][1]
        x2, y2 = ring[(i + 1) % n][0], ring[(i + 1) % n][1]
        if (y1 > y) != (y2 > y):
            x_intersect = x1 + (y - y1) * (x2 - x1) / (y2 - y1)
            if x < x_intersect:
                inside = not inside
    return inside


def _geometry_contains(x: float, y: float, geom: dict) -> bool:
    coords = geom.get("coordinates", [])
    polys = coords if geom.get("type") == "MultiPolygon" else [coords]
    return any(_point_in_ring(x, y, poly[0]) for poly in polys if poly)


def _distance_to_ring(x: float, y: float, ring: list[list[float]]) -> float:
    best = float("inf")
    for i in range(len(ring) - 1):
        x1, y1 = ring[i][0], ring[i][1]
        x2, y2 = ring[i + 1][0], ring[i + 1][1]
        dx, dy = x2 - x1, y2 - y1
        len_sq = dx * dx + dy * dy
        t = 0.0 if len_sq == 0 else max(0.0, min(1.0, ((x - x1) * dx + (y - y1) * dy) / len_sq))
        px, py = x1 + t * dx, y1 + t * dy
        dist = math.hypot(x - px, y - py)
        best = min(best, dist)
    return best


def _distance_to_geometry(x: float, y: float, geom: dict) -> float:
    coords = geom.get("coordinates", [])
    polys = coords if geom.get("type") == "MultiPolygon" else [coords]
    best = float("inf")
    for poly in polys:
        for ring in poly:
            best = min(best, _distance_to_ring(x, y, ring))
    return best


# Per-canton fallbacks for municipalities not yet covered by the national
# geodienste.ch "grundnutzung" layer (data is rolled out commune-by-commune;
# coverage is genuinely patchy, not a bug). Add more cantons here as gaps are found.
_GR_MAPSERV_PROXY = "https://map.geo.gr.ch/mapserv_proxy"
_GR_OGCSERVER = "Kanton Graubünden, Bauzonen Graubuenden"
_GR_FEATURE_RE = re.compile(r"<gml:featureMember>(.*?)</gml:featureMember>", re.DOTALL)
_GR_NAME_RE = re.compile(r"<ms:CH_Hauptnutzung_Name>([^<]*)</ms:CH_Hauptnutzung_Name>")
_GR_POSLIST_RE = re.compile(r"<gml:posList[^>]*>([^<]+)</gml:posList>")


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
        "maxfeatures": 10,
    }
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.get(_GR_MAPSERV_PROXY, params=params)
        resp.raise_for_status()

    best_name: str | None = None
    best_dist = float("inf")
    for block in _GR_FEATURE_RE.findall(resp.text):
        name_match = _GR_NAME_RE.search(block)
        if not name_match or not name_match.group(1):
            continue
        min_dist = float("inf")
        for pos_list in _GR_POSLIST_RE.findall(block):
            nums = [float(n) for n in pos_list.split()]
            for i in range(0, len(nums) - 1, 2):
                min_dist = min(min_dist, math.hypot(nums[i] - east, nums[i + 1] - north))
        if min_dist <= NEAREST_ZONE_THRESHOLD_M and min_dist < best_dist:
            best_name, best_dist = name_match.group(1), min_dist

    if best_name is None:
        return None
    return {
        "bauzone": best_name, "zone_bezeichnung": best_name, "hauptnutzung": best_name,
        "kanton": "GR", "documents": [],
    }


_CANTON_FALLBACKS = {"GR": _get_gr_zone_details}


# A small local abbreviation like "W2" is more useful to show than a canton-internal
# numeric code (e.g. St. Gallen publishes "1402" instead of a readable short code).
def _display_zone(code: str | None, label: str | None) -> str | None:
    if code and not code.isdigit():
        return code
    return label.replace("_", " ") if label else code


async def get_zone_details(east: float, north: float, canton: str | None = None) -> dict | None:
    """Return zone code/label + legal-basis documents at LV95 coordinate (east, north)."""
    delta = 50
    params = {
        "bbox": f"{east - delta},{north - delta},{east + delta},{north + delta}",
        "bbox-crs": _LV95_CRS,
        "crs": _LV95_CRS,
        "f": "json",
        "limit": 10,
    }
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.get(_GEODIENSTE, params=params)
        resp.raise_for_status()

    features = resp.json().get("features", [])

    # Multiple zone/notice polygons can overlap a small bbox near zone boundaries — only
    # trust a polygon that actually contains the point, or failing that, the nearest one
    # within threshold; prefer a real building-law zone ("BauG_...") over a "Hinweis."
    # (informational overlay) on ties.
    candidates = [f for f in features if _geometry_contains(east, north, f.get("geometry", {}))]
    if not candidates:
        scored = sorted(
            (f for f in features if _distance_to_geometry(east, north, f.get("geometry", {})) <= NEAREST_ZONE_THRESHOLD_M),
            key=lambda f: _distance_to_geometry(east, north, f.get("geometry", {})),
        )
        candidates = scored

    if not candidates:
        fallback = _CANTON_FALLBACKS.get(canton or "")
        if fallback:
            return await fallback(east, north)
        return None

    props = next(
        (f["properties"] for f in candidates if not str(f["properties"].get("typ_kantonal_bezeichnung", "")).startswith("Hinweis.")),
        candidates[0]["properties"],
    )
    return {
        "bauzone": _display_zone(props.get("typ_kantonal_code"), props.get("typ_kantonal_bezeichnung")),
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
