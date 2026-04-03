import { Icon } from "@/components/Icon";
import { ParityMeter } from "@/components/ParityMeter";
import type { Metadata } from "next";

// TODO: Fetch from Supabase when configured
// For now, this is a placeholder page that will work once
// we persist search results to the database.

interface SharedPageProps {
  params: Promise<{ shortCode: string }>;
}

export async function generateMetadata({
  params,
}: SharedPageProps): Promise<Metadata> {
  const { shortCode } = await params;
  // TODO: Fetch result from DB and generate dynamic OG tags
  return {
    title: "Where2Meet.Me — Fair Meeting Point",
    description:
      "Someone found a fair meeting spot for your group. See the details and get directions.",
    openGraph: {
      title: "Where2Meet.Me — Fair Meeting Point",
      description: "A fair meeting spot calculated for your group.",
      type: "website",
      url: `https://where2meet.me/m/${shortCode}`,
    },
  };
}

export default async function SharedResultPage({ params }: SharedPageProps) {
  const { shortCode } = await params;

  // TODO: Fetch from Supabase
  // For MVP, show a placeholder that redirects to the app

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-5 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
        <Icon name="location_on" size={32} className="text-primary" />
      </div>

      <h1 className="text-2xl font-bold font-headline text-on-surface">
        Fair Meeting Point
      </h1>
      <p className="text-sm text-on-surface-variant mt-2 max-w-xs font-body">
        Someone shared a meeting spot with you. Once the database is connected,
        you'll see the full details here.
      </p>

      <div className="bg-surface-lowest rounded-2xl p-5 shadow-ambient mt-6 w-full max-w-sm">
        <p className="text-xs text-on-surface-variant font-body">
          Share code: <span className="font-mono font-medium">{shortCode}</span>
        </p>
      </div>

      <div className="mt-8 space-y-3 w-full max-w-sm">
        <a
          href="/"
          className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base font-semibold font-headline"
        >
          Find your own fair midpoint
          <Icon name="arrow_forward" size={20} />
        </a>
      </div>
    </div>
  );
}
