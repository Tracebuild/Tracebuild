"""
Swiss geoportal lookups: parcel → LV95 coordinates → Bauzone.

Step 1  geo.admin.ch SearchServer: parcel number + municipality → LV95 (E, N)
Step 2  geodienste.ch NPL API:     bbox around coordinate → typ_kt (zone code)

Both steps use a short timeout so a slow external API never blocks project
creation. Any failure returns None; callers fall back to manual input.
"""
from __future__ import annotations
import httpx

_GEO_ADMIN = "https://api3.geo.admin.ch/rest/services/api/SearchServer"
_GEODIENSTE = (
    "https://geodienste.ch/db/npl_nutzungsplanung_v1_2_0/deu/ogcapi"
    "/collections/LandUsePlans/items"
)
_TIMEOUT = 8.0


async def get_parcel_coordinates(
    parcel_number: str,
    municipality: str,
) -> tuple[float, float] | None:
    """Return (x_east, y_north) in LV95 for the given parcel, or None."""
    params = {
        "searchText": f"{parcel_number} {municipality}",
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
    return float(x), float(y)


async def get_bauzone(x: float, y: float) -> str | None:
    """Return the cantonal zone type (typ_kt) at LV95 coordinate (x, y)."""
    delta = 50
    params = {
        "bbox": f"{x - delta},{y - delta},{x + delta},{y + delta}",
        "f": "json",
        "limit": 1,
    }
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.get(_GEODIENSTE, params=params)
        resp.raise_for_status()

    features = resp.json().get("features", [])
    if not features:
        return None
    return features[0].get("properties", {}).get("typ_kt")


async def lookup_parcel(
    parcel_number: str,
    municipality: str,
) -> dict[str, float | str | None]:
    """
    Full lookup: parcel number + municipality → {x, y, bauzone}.
    Any key is None when the corresponding API call fails or returns no data.
    Errors are swallowed so callers can always continue with a fallback.
    """
    result: dict[str, float | str | None] = {"x": None, "y": None, "bauzone": None}
    try:
        coords = await get_parcel_coordinates(parcel_number, municipality)
        if coords:
            result["x"], result["y"] = coords
            try:
                result["bauzone"] = await get_bauzone(coords[0], coords[1])
            except Exception:
                pass
    except Exception:
        pass
    return result
