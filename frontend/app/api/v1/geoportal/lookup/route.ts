import { getAuthUser, ok, unauthorized, err } from "@/lib/auth";
import { lookupParcel } from "@/lib/geoportal";

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const body = await request.json();
  const { parcel_number, municipality } = body;
  if (!parcel_number || !municipality) return err("parcel_number und municipality erforderlich");

  const result = await lookupParcel(parcel_number, municipality);
  return ok(result);
}
