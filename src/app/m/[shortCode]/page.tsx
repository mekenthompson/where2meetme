import { notFound } from "next/navigation";
import { pool } from "@/lib/db";
import { Icon } from "@/components/Icon";
import { SharedResultsClient } from "./SharedResultsClient";
import type { Metadata } from "next";
import type { VenueResult, Participant } from "@/lib/types";

interface SharedPageProps {
  params: Promise<{ shortCode: string }>;
}

export async function generateMetadata({
  params,
}: SharedPageProps): Promise<Metadata> {
  const { shortCode } = await params;

  try {
    // Fetch search and top venue for OG tags
    const searchResult = await pool.query(
      `SELECT * FROM searches WHERE short_code = $1`,
      [shortCode]
    );
    const search = searchResult.rows[0];

    if (!search) {
      return {
        title: "Where2Meet.Me — Fair Meeting Point",
        description: "Find fair meeting spots for your group.",
      };
    }

    const participantsResult = await pool.query(
      `SELECT * FROM participants WHERE search_id = $1`,
      [search.id]
    );

    const topVenueResult = await pool.query(
      `SELECT * FROM venues WHERE search_id = $1 ORDER BY fairness_score DESC LIMIT 1`,
      [search.id]
    );
    const topVenue = topVenueResult.rows[0];

    const participantCount = participantsResult.rows?.length ?? 0;
    const title = topVenue
      ? `Meet at ${topVenue.name} — Where2Meet.Me`
      : "Where2Meet.Me — Fair Meeting Point";

    const description = topVenue
      ? `${Math.round(topVenue.fairness_score)}% fair for ${participantCount} ${participantCount === 1 ? "person" : "people"}. Balanced travel times for everyone.`
      : "A fair meeting spot calculated for your group.";

    const ogImage = topVenue?.photo_reference
      ? `${process.env.NEXT_PUBLIC_BASE_URL || "https://where2meet.me"}/api/places/photo?ref=${encodeURIComponent(topVenue.photo_reference)}`
      : undefined;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        url: `https://where2meet.me/m/${shortCode}`,
        images: ogImage ? [{ url: ogImage }] : undefined,
      },
    };
  } catch {
    return {
      title: "Where2Meet.Me — Fair Meeting Point",
      description: "Find fair meeting spots for your group.",
    };
  }
}

export default async function SharedResultPage({ params }: SharedPageProps) {
  const { shortCode } = await params;

  // Fetch search data from database
  const searchResult = await pool.query(
    `SELECT * FROM searches WHERE short_code = $1`,
    [shortCode]
  );
  const search = searchResult.rows[0];

  if (!search) {
    notFound();
  }

  // Fetch participants
  const participantsResult = await pool.query(
    `SELECT * FROM participants WHERE search_id = $1`,
    [search.id]
  );

  // Fetch venues
  const venuesResult = await pool.query(
    `SELECT * FROM venues WHERE search_id = $1 ORDER BY fairness_score DESC`,
    [search.id]
  );

  // Transform database records to application types
  const participants: Participant[] =
    participantsResult.rows?.map((p) => ({
      id: p.id,
      label: p.label,
      originPlaceId: p.origin_place_id,
      originLat: p.origin_lat,
      originLng: p.origin_lng,
      originDisplayName: p.origin_display_name ?? "",
      travelMode: p.travel_mode,
      travelTimeSeconds: p.travel_time_seconds,
    })) ?? [];

  const venues: VenueResult[] =
    venuesResult.rows?.map((v) => ({
      placeId: v.place_id,
      name: v.name,
      address: v.address ?? "",
      shortAddress: v.short_address ?? "",
      lat: v.lat,
      lng: v.lng,
      rating: v.rating,
      userRatingsTotal: v.user_ratings_total,
      photoReference: v.photo_reference,
      fairnessScore: v.fairness_score ?? 0,
      travelTimes: v.travel_times as Record<string, number>,
    })) ?? [];

  return (
    <div className="flex flex-col min-h-dvh bg-surface">
      {/* Header */}
      <header className="bg-surface-lowest px-5 py-4 shadow-ambient">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="location_on" size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-headline text-on-surface">
              Fair Meeting Point
            </h1>
            <p className="text-xs text-on-surface-variant font-body">
              {participants.length} {participants.length === 1 ? "person" : "people"} · {search.venue_type}
            </p>
          </div>
        </div>
      </header>

      {/* Client-side results */}
      <SharedResultsClient
        venues={venues}
        participants={participants}
        shortCode={shortCode}
      />

      {/* CTA */}
      <section className="px-5 py-8 mt-auto bg-surface-lowest">
        <a
          href="/"
          className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base font-semibold font-headline"
        >
          Find your own fair midpoint
          <Icon name="arrow_forward" size={20} />
        </a>
      </section>
    </div>
  );
}
