import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase-server";
import type { TravelMode, VenueType } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      participants,
      venueType,
    }: {
      participants: { label: string; travelMode: TravelMode }[];
      venueType: VenueType;
    } = body;

    if (!participants || participants.length < 2) {
      return NextResponse.json(
        { error: "At least 2 participants required" },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const shortCode = nanoid(8);

    // Create search with status='collecting'
    const { data: search, error: searchError } = await supabase
      .from("searches")
      .insert({
        short_code: shortCode,
        venue_type: venueType,
        status: "collecting",
      })
      .select()
      .single();

    if (searchError || !search) {
      console.error("Failed to create search:", searchError);
      return NextResponse.json(
        { error: "Failed to create search" },
        { status: 500 }
      );
    }

    // Create participant rows with collect_tokens
    const participantRows = participants.map((p) => ({
      search_id: search.id,
      label: p.label,
      travel_mode: p.travelMode,
      collect_token: nanoid(16), // Generate unique token for each participant
    }));

    const { data: createdParticipants, error: participantsError } =
      await supabase
        .from("participants")
        .insert(participantRows)
        .select();

    if (participantsError || !createdParticipants) {
      console.error("Failed to create participants:", participantsError);
      return NextResponse.json(
        { error: "Failed to create participants" },
        { status: 500 }
      );
    }

    // Return shortCode and participant tokens
    const participantTokens = createdParticipants.map((p) => ({
      id: p.id,
      label: p.label,
      token: p.collect_token,
    }));

    return NextResponse.json({
      shortCode,
      participantTokens,
    });
  } catch (err) {
    console.error("Collection create error:", err);
    return NextResponse.json(
      { error: "Failed to create collection" },
      { status: 500 }
    );
  }
}
