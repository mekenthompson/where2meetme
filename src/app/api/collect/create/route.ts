import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
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
    const searchResult = await pool.query(
      `INSERT INTO searches (short_code, venue_type, status)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [shortCode, venueType, "collecting"]
    );

    const searchId = searchResult.rows[0]?.id;
    if (!searchId) {
      console.error("Failed to create search: no id returned");
      return NextResponse.json(
        { error: "Failed to create search" },
        { status: 500 }
      );
    }

    // Create participant slots with collect_tokens
    const createdParticipants = [];
    for (const p of participants as { label: string }[]) {
      const collectToken = nanoid(16);
      const participantResult = await pool.query(
        `INSERT INTO participants (search_id, label, collect_token, travel_mode)
         VALUES ($1, $2, $3, $4)
         RETURNING id, label, collect_token`,
        [searchId, p.label, collectToken, "driving"]
      );
      const row = participantResult.rows[0];
      if (row) {
        createdParticipants.push({
          id: row.id,
          label: row.label,
          collectToken: row.collect_token,
        });
      }
    }

    return NextResponse.json({
      shortCode,
      participants: createdParticipants,
    });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
