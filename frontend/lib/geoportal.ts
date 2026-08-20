const GEO_ADMIN = "https://api3.geo.admin.ch/rest/services/api/SearchServer";
const GEODIENSTE =
  "https://geodienste.ch/db/npl_nutzungsplanung_v1_2_0/deu/ogcapi/collections/grundnutzung/items";
const LV95_CRS = "http://www.opengis.net/def/crs/EPSG/0/2056";

// Only these two document types from the federal "MGDM Nutzungsplanung" schema are
// binding legal bases (Gesetz/Verordnung/Bauordnung). "Hinweis" entries are informational
// only and are deliberately excluded so we don't import non-binding norms.
const BINDING_DOC_TYPES = new Set(["GesetzlicheGrundlage", "Rechtsvorschrift"]);

export interface GeoportalDocument {
  typ: string;
  titel: string;
  abkuerzung: string | null;
  link: string | null;
  offizielleNr: string | null;
}

export interface ParcelLookupResult {
  bauzone: string | null;
  zoneBezeichnung: string | null;
  hauptnutzung: string | null;
  kanton: string | null;
  egrid: string | null;
  documents: GeoportalDocument[];
}

const EMPTY_RESULT: ParcelLookupResult = {
  bauzone: null, zoneBezeichnung: null, hauptnutzung: null, kanton: null, egrid: null, documents: [],
};

async function getParcelCoords(
  parcelNumber: string,
  municipality: string
): Promise<{ east: number; north: number; egrid: string | null } | null> {
  const url = new URL(GEO_ADMIN);
  // geo.admin.ch only matches "<Gemeinde> <Parzellennummer>", not the reverse order.
  url.searchParams.set("searchText", `${municipality} ${parcelNumber}`);
  url.searchParams.set("origins", "parcel");
  url.searchParams.set("type", "locations");
  url.searchParams.set("limit", "1");
  url.searchParams.set("sr", "2056");

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const json = await res.json();
  const attrs = json.results?.[0]?.attrs;
  if (!attrs?.x || !attrs?.y) return null;
  // The EGRID is embedded in the free-text "detail" field (e.g. "580 bern 351 ch828910463504").
  const egridMatch = /ch\d{12}/i.exec(attrs.detail ?? "");
  return {
    // Swiss LV95 convention: geo.admin.ch's "x" is Northing, "y" is Easting.
    east: Number(attrs.y),
    north: Number(attrs.x),
    egrid: egridMatch ? egridMatch[0].toUpperCase() : null,
  };
}

function parseDocuments(raw: unknown): GeoportalDocument[] {
  if (typeof raw !== "string" || !raw) return [];
  try {
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed?.Dokumente) ? parsed.Dokumente : [];
    return list
      .filter((d: any) => BINDING_DOC_TYPES.has(d?.Typ) && d?.Titel && d?.Link)
      .map((d: any) => ({
        typ: d.Typ,
        titel: d.Titel,
        abkuerzung: d.Abkuerzung ?? null,
        link: d.Link,
        offizielleNr: d.OffizielleNr ?? null,
      }));
  } catch {
    return [];
  }
}

// Per-canton fallbacks for municipalities not yet covered by the national
// geodienste.ch "grundnutzung" layer (data is rolled out commune-by-commune;
// coverage is genuinely patchy, not a bug). Add more cantons here as gaps are found.
type ZoneDetails = Omit<ParcelLookupResult, "egrid">;
const CANTON_FALLBACKS: Record<string, (east: number, north: number) => Promise<ZoneDetails | null>> = {
  GR: getGrZoneDetails,
};

// Kanton Graubünden runs its own GeoMapFish/c2cgeoportal instance (map.geo.gr.ch),
// independent of the national geodienste.ch federation. Its "Bauzonen_Hauptnutzungen"
// WFS layer only exposes the coarse Hauptnutzung label (e.g. "Wohnzonen"), not a
// short zone code or legal-basis documents — still far better than no data at all.
const GR_MAPSERV_PROXY = "https://map.geo.gr.ch/mapserv_proxy";
const GR_OGCSERVER = "Kanton Graubünden, Bauzonen Graubuenden";

// Same rationale as NEAREST_ZONE_THRESHOLD_M below: GR's own WFS has also been observed
// to return a feature that doesn't actually contain the query point, so every candidate
// is verified by distance-to-vertex before being trusted.
const GR_NEAREST_ZONE_THRESHOLD_M = 60;

async function getGrZoneDetails(east: number, north: number): Promise<ZoneDetails | null> {
  const d = 50;
  const url = new URL(GR_MAPSERV_PROXY);
  url.searchParams.set("ogcserver", GR_OGCSERVER);
  url.searchParams.set("SERVICE", "WFS");
  url.searchParams.set("VERSION", "1.1.0");
  url.searchParams.set("REQUEST", "GetFeature");
  url.searchParams.set("TYPENAME", "Bauzonen_Hauptnutzungen");
  url.searchParams.set("BBOX", `${east - d},${north - d},${east + d},${north + d},urn:ogc:def:crs:EPSG::2056`);
  url.searchParams.set("SRSNAME", "urn:ogc:def:crs:EPSG::2056");
  url.searchParams.set("maxfeatures", "10");

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const xml = await res.text();

  let best: { name: string; dist: number } | null = null;
  for (const featureBlock of xml.split("<gml:featureMember>").slice(1)) {
    const nameMatch = /<ms:CH_Hauptnutzung_Name>([^<]*)<\/ms:CH_Hauptnutzung_Name>/.exec(featureBlock);
    if (!nameMatch || !nameMatch[1]) continue;
    let minDist = Infinity;
    for (const posListMatch of Array.from(featureBlock.matchAll(/<gml:posList[^>]*>([^<]+)<\/gml:posList>/g))) {
      const nums = posListMatch[1].trim().split(/\s+/).map(Number);
      for (let i = 0; i < nums.length - 1; i += 2) {
        const dist = Math.hypot(nums[i] - east, nums[i + 1] - north);
        if (dist < minDist) minDist = dist;
      }
    }
    if (minDist <= GR_NEAREST_ZONE_THRESHOLD_M && (!best || minDist < best.dist)) {
      best = { name: nameMatch[1], dist: minDist };
    }
  }
  if (!best) return null;
  return { bauzone: best.name, zoneBezeichnung: best.name, hauptnutzung: best.name, kanton: "GR", documents: [] };
}

type GeoJsonPolygon = { type: "Polygon"; coordinates: number[][][] } | { type: "MultiPolygon"; coordinates: number[][][][] };

// Standard ray-casting point-in-polygon test (ignores holes — irrelevant for zone parcels).
function ringContains(x: number, y: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y) {
      const xIntersect = xi + ((y - yi) * (xj - xi)) / (yj - yi);
      if (x < xIntersect) inside = !inside;
    }
  }
  return inside;
}

function geometryContains(x: number, y: number, geom: GeoJsonPolygon): boolean {
  const polys = geom.type === "MultiPolygon" ? geom.coordinates : [geom.coordinates];
  return polys.some((poly) => ringContains(x, y, poly[0]));
}

// Shortest distance from a point to a ring's boundary (point-to-segment, minimised over all edges).
function distanceToRing(x: number, y: number, ring: number[][]): number {
  let min = Infinity;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / lenSq));
    const dist = Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
    if (dist < min) min = dist;
  }
  return min;
}

function distanceToGeometry(x: number, y: number, geom: GeoJsonPolygon): number {
  const polys = geom.type === "MultiPolygon" ? geom.coordinates : [geom.coordinates];
  let min = Infinity;
  for (const poly of polys) {
    for (const ring of poly) {
      const d = distanceToRing(x, y, ring);
      if (d < min) min = d;
    }
  }
  return min;
}

// A small local abbreviation like "W2" is more useful to show than a canton-internal
// numeric code (e.g. St. Gallen publishes "1402" instead of a readable short code).
function displayZone(code: string | null, label: string | null): string | null {
  if (code && !/^\d+$/.test(code)) return code;
  return label ? label.replace(/_/g, " ") : code;
}

// geo.admin.ch's parcel locator point is a search/label point, not always precisely
// inside the parcel — and the upstream OGC service itself has been observed to return
// bbox-filtered results that do not actually intersect the requested box. Accepting a
// "nearest" polygon within this radius absorbs normal locator imprecision without
// papering over the server's occasional multi-hundred-metre misses.
const NEAREST_ZONE_THRESHOLD_M = 60;

async function getZoneDetails(east: number, north: number): Promise<Omit<ParcelLookupResult, "egrid"> | null> {
  const d = 50;
  const url = new URL(GEODIENSTE);
  url.searchParams.set("bbox", `${east - d},${north - d},${east + d},${north + d}`);
  url.searchParams.set("bbox-crs", LV95_CRS);
  url.searchParams.set("crs", LV95_CRS);
  url.searchParams.set("f", "json");
  url.searchParams.set("limit", "10");

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const json = await res.json();
  const features: { geometry: GeoJsonPolygon; properties: any }[] = json.features ?? [];

  // Multiple zone/notice polygons can overlap a small bbox near zone boundaries (village
  // edges, forest lines, etc.) — picking "the first hit" there is a coin flip and has
  // returned wrong zones in the wild. Only trust a polygon that actually contains the
  // parcel's point (or, failing that, one close enough to plausibly be it); prefer a real
  // building-law zone ("BauG_...") over a "Hinweis." (informational overlay) on ties.
  let candidates = features.filter((f) => geometryContains(east, north, f.geometry));
  if (!candidates.length) {
    candidates = features
      .map((f) => ({ f, dist: distanceToGeometry(east, north, f.geometry) }))
      .filter(({ dist }) => dist <= NEAREST_ZONE_THRESHOLD_M)
      .sort((a, b) => a.dist - b.dist)
      .map(({ f }) => f);
  }
  if (!candidates.length) return null;
  const props =
    candidates.find((f) => !String(f.properties?.typ_kantonal_bezeichnung ?? "").startsWith("Hinweis."))
      ?.properties ?? candidates[0].properties;

  return {
    bauzone: displayZone(props.typ_kantonal_code ?? null, props.typ_kantonal_bezeichnung ?? null),
    zoneBezeichnung: props.typ_kantonal_bezeichnung ?? null,
    hauptnutzung: props.hauptnutzung_bezeichnung ?? null,
    kanton: props.kanton ?? null,
    documents: parseDocuments(props.dokument),
  };
}

export async function lookupParcel(
  parcelNumber: string,
  municipality: string,
  canton?: string
): Promise<ParcelLookupResult> {
  try {
    const coords = await getParcelCoords(parcelNumber, municipality);
    if (!coords) return EMPTY_RESULT;
    let zone = await getZoneDetails(coords.east, coords.north).catch(() => null);
    const fallback = canton ? CANTON_FALLBACKS[canton] : undefined;
    if (!zone && fallback) {
      zone = await fallback(coords.east, coords.north).catch(() => null);
    }
    return { ...EMPTY_RESULT, egrid: coords.egrid, ...(zone ?? {}) };
  } catch {
    return EMPTY_RESULT;
  }
}
