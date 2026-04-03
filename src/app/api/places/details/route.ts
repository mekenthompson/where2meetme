import { NextRequest, NextResponse } from "next/server";

const MAPBOX_TOKEN = process.env.MAPBOX_SECRET_TOKEN ?? "";

export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get("placeId");
  if (!placeId) {
    return NextResponse.json({ error: "placeId required" }, { status: 400 });
  }

  try {
    // Use Mapbox Retrieve API to get feature details by ID
    const url = `https://api.mapbox.com/search/geocode/v6/retrieve/${encodeURIComponent(placeId)}?access_token=${MAPBOX_TOKEN}`;

    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch details" },
        { status: 500 }
      );
    }

    const data = await res.json();
    const feature = data.features?.[0];

    if (!feature) {
      return NextResponse.json(
        { error: "Place not found" },
        { status: 404 }
      );
    }

    const [lng, lat] = feature.geometry.coordinates;
    return NextResponse.json({ lat, lng });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch details" },
      { status: 500 }
    );
  }
}
