import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { venueType, participants } = body;

    if (!venueType || !Array.isArray(participants) || participants.length < 2) {
      return NextResponse.json(
        { error: "Invalid request: venueType and participants (2+) required" },
        { status: 400 }
      );
    }

    const shortCode = nanoid(8);

    // Create search with status='collecting'
    const { data: search, error: searchError } = await supabaseServer
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

    // Create participant slots with collect_tokens
    const participantRows = participants.map((p: { label: string }) => ({
      search_id: search.id,
      label: p.label,
      collect_token: nanoid(16),
      travel_mode: "driving",
    }));

    const { data: createdParticipants, error: participantsError } =
      await supabaseServer
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

    return NextResponse.json({
      shortCode,
      participants: createdParticipants.map((p) => ({
        id: p.id,
        label: p.label,
        collectToken: p.collect_token,
      })),
    });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
