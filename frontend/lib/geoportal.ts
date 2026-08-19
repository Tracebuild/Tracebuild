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
  url.searchParams.set("maxfeatures", "1");

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const xml = await res.text();
  const match = /<ms:CH_Hauptnutzung_Name>([^<]*)<\/ms:CH_Hauptnutzung_Name>/.exec(xml);
  if (!match || !match[1]) return null;
  const name = match[1];
  return { bauzone: name, zoneBezeichnung: name, hauptnutzung: name, kanton: "GR", documents: [] };
}

async function getZoneDetails(east: number, north: number): Promise<Omit<ParcelLookupResult, "egrid"> | null> {
  const d = 50;
  const url = new URL(GEODIENSTE);
  url.searchParams.set("bbox", `${east - d},${north - d},${east + d},${north + d}`);
  url.searchParams.set("bbox-crs", LV95_CRS);
  url.searchParams.set("crs", LV95_CRS);
  url.searchParams.set("f", "json");
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const json = await res.json();
  const props = json.features?.[0]?.properties;
  if (!props) return null;
  return {
    bauzone: props.typ_kantonal_code ?? null,
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
