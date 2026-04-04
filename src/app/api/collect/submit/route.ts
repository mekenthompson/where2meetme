import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, originLat, originLng, originDisplayName, travelMode } = body;

    if (!token || !originLat || !originLng || !originDisplayName || !travelMode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find participant by collect_token
    const { data: participant, error: findError } = await supabaseServer
      .from("participants")
      .select("*, search:searches!participants_search_id_fkey(id, short_code)")
      .eq("collect_token", token)
      .single();

    if (findError || !participant) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 404 }
      );
    }

    // Check if already submitted
    if (participant.origin_lat !== null) {
      return NextResponse.json(
        { error: "This invite has already been used" },
        { status: 400 }
      );
    }

    // Update participant with origin data
    const { error: updateError } = await supabaseServer
      .from("participants")
      .update({
        origin_lat: originLat,
        origin_lng: originLng,
        origin_display_name: originDisplayName,
        travel_mode: travelMode,
        submitted_at: new Date().toISOString(),
      })
      .eq("collect_token", token);

    if (updateError) {
      console.error("Failed to update participant:", updateError);
      return NextResponse.json(
        { error: "Failed to submit response" },
        { status: 500 }
      );
    }

    // Check if all participants have submitted
    const { data: allParticipants, error: checkError } = await supabaseServer
      .from("participants")
      .select("origin_lat")
      .eq("search_id", (participant.search as any).id);

    if (checkError) {
      console.error("Failed to check participants:", checkError);
      return NextResponse.json({ success: true, allSubmitted: false });
    }

    const allSubmitted = allParticipants.every((p) => p.origin_lat !== null);

    // If all submitted, update search status to 'ready'
    if (allSubmitted) {
      await supabaseServer
        .from("searches")
        .update({ status: "ready" })
        .eq("id", (participant.search as any).id);
    }

    return NextResponse.json({
      success: true,
      allSubmitted,
      shortCode: (participant.search as any).short_code,
    });
  } catch (error) {
    console.error("Error submitting collection:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
