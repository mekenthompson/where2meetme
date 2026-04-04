import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

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

    // Find participant by collect_token with search data
    const findResult = await pool.query(
      `SELECT p.*, s.id as search_id, s.short_code
       FROM participants p
       JOIN searches s ON p.search_id = s.id
       WHERE p.collect_token = $1`,
      [token]
    );

    const participant = findResult.rows[0];
    if (!participant) {
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
    await pool.query(
      `UPDATE participants
       SET origin_lat = $1, origin_lng = $2, origin_display_name = $3, travel_mode = $4, submitted_at = NOW()
       WHERE collect_token = $5`,
      [originLat, originLng, originDisplayName, travelMode, token]
    );

    // Check if all participants have submitted
    const checkResult = await pool.query(
      `SELECT origin_lat FROM participants WHERE search_id = $1`,
      [participant.search_id]
    );

    const allSubmitted = checkResult.rows.every((p) => p.origin_lat !== null);

    // If all submitted, update search status to 'ready'
    if (allSubmitted) {
      await pool.query(
        `UPDATE searches SET status = 'ready' WHERE id = $1`,
        [participant.search_id]
      );
    }

    return NextResponse.json({
      success: true,
      allSubmitted,
      shortCode: participant.short_code,
    });
  } catch (error) {
    console.error("Error submitting collection:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
