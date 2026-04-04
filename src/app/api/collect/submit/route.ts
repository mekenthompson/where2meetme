import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import type { TravelMode } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      token,
      originLat,
      originLng,
      originDisplayName,
      originPlaceId,
      travelMode,
    }: {
      token: string;
      originLat: number;
      originLng: number;
      originDisplayName: string;
      originPlaceId: string | null;
      travelMode: TravelMode;
    } = body;

    if (!token || originLat == null || originLng == null) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Find participant by token
    const { data: participant, error: findError } = await supabase
      .from("participants")
      .select("id, search_id, origin_lat")
      .eq("collect_token", token)
      .single();

    if (findError || !participant) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 404 }
      );
    }

    // Check if already submitted
    if (participant.origin_lat != null) {
      return NextResponse.json(
        { error: "Location already submitted" },
        { status: 400 }
      );
    }

    // Update participant with origin data
    const { error: updateError } = await supabase
      .from("participants")
      .update({
        origin_lat: originLat,
        origin_lng: originLng,
        origin_display_name: originDisplayName,
        origin_place_id: originPlaceId,
        travel_mode: travelMode,
      })
      .eq("id", participant.id);

    if (updateError) {
      console.error("Failed to update participant:", updateError);
      return NextResponse.json(
        { error: "Failed to submit location" },
        { status: 500 }
      );
    }

    // Check if all participants have origins now
    const { data: allParticipants, error: checkError } = await supabase
      .from("participants")
      .select("origin_lat")
      .eq("search_id", participant.search_id);

    if (checkError) {
      console.error("Failed to check participants:", checkError);
      // Don't fail the request, just skip status update
    } else if (allParticipants?.every((p) => p.origin_lat != null)) {
      // All participants have submitted, mark search as ready
      await supabase
        .from("searches")
        .update({ status: "ready" })
        .eq("id", participant.search_id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Collection submit error:", err);
    return NextResponse.json(
      { error: "Failed to submit location" },
      { status: 500 }
    );
  }
}
