import { NextRequest, NextResponse } from "next/server";

const MAPBOX_TOKEN = process.env.MAPBOX_SECRET_TOKEN ?? "";

export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get("input");
  if (!input || input.length < 3) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    // Use Mapbox Geocoding API for autocomplete (cheaper than Google)
    const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(input)}&country=au&limit=5&types=address,place,poi,neighborhood,locality&access_token=${MAPBOX_TOKEN}`;

    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ suggestions: [] });
    }

    const data = await res.json();
    const suggestions = (data.features ?? []).map(
      (feature: {
        id: string;
        properties: {
          name: string;
          full_address: string;
          place_formatted?: string;
        };
      }) => ({
        placeId: feature.id,
        description: feature.properties.full_address,
        mainText: feature.properties.name,
        secondaryText:
          feature.properties.place_formatted ??
          feature.properties.full_address,
      })
    );

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
