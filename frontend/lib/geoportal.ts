const GEO_ADMIN = "https://api3.geo.admin.ch/rest/services/api/SearchServer";
const GEODIENSTE =
  "https://geodienste.ch/db/npl_nutzungsplanung_v1_2_0/deu/ogcapi/collections/LandUsePlans/items";

async function getParcelCoords(
  parcelNumber: string,
  municipality: string
): Promise<[number, number] | null> {
  const url = new URL(GEO_ADMIN);
  url.searchParams.set("searchText", `${parcelNumber} ${municipality}`);
  url.searchParams.set("origins", "parcel");
  url.searchParams.set("type", "locations");
  url.searchParams.set("limit", "1");
  url.searchParams.set("sr", "2056");

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const json = await res.json();
  const attrs = json.results?.[0]?.attrs;
  if (!attrs?.x || !attrs?.y) return null;
  return [Number(attrs.x), Number(attrs.y)];
}

async function getBauzone(x: number, y: number): Promise<string | null> {
  const d = 50;
  const url = new URL(GEODIENSTE);
  url.searchParams.set("bbox", `${x - d},${y - d},${x + d},${y + d}`);
  url.searchParams.set("f", "json");
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const json = await res.json();
  return json.features?.[0]?.properties?.typ_kt ?? null;
}

export async function lookupParcel(
  parcelNumber: string,
  municipality: string
): Promise<{ bauzone: string | null }> {
  try {
    const coords = await getParcelCoords(parcelNumber, municipality);
    if (!coords) return { bauzone: null };
    const bauzone = await getBauzone(coords[0], coords[1]).catch(() => null);
    return { bauzone };
  } catch {
    return { bauzone: null };
  }
}
