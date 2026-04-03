# Where2Meet.Me

**Find the perfectly fair meeting point for 2-6 people based on real travel times.**

Where2Meet.Me calculates a genuinely fair meeting spot by accounting for how each person actually travels -- not just geographic distance. One person drives, another takes the bus? The app finds the point where everyone spends roughly the same time getting there, then recommends great venues nearby.

## The Problem

Geographic midpoints are useless. A point equidistant on a map ignores freeways, public transit routes, and the fact that driving 10km takes 10 minutes while walking it takes 2 hours. Where2Meet.Me solves this by iterating on real travel times until the meeting point is genuinely fair for everyone.

## Features

- **2-6 people** -- not just pairs. Add travelers dynamically, each with their own starting point and travel mode.
- **Per-person travel modes** -- driving, transit, walking, or cycling. Mix and match.
- **Iterative minimax algorithm** -- minimizes the maximum travel time so nobody gets screwed. Converges within 5 iterations to < 2 minute delta.
- **Venue recommendations** -- cafes, restaurants, bars, parks, coworking spaces, and libraries near the fair midpoint. Sorted by fairness score.
- **Parity visualization** -- see each person's travel time as color-coded bars. Green = fair, yellow = okay, red = someone's getting a raw deal.
- **Shareable links** -- every result generates a unique URL with server-rendered Open Graph previews for WhatsApp, iMessage, etc.
- **Mobile-first PWA** -- designed for phones. Installable to your home screen.

## Quick Start

```bash
# Clone the repo
git clone https://github.com/mekenthompson/where2meetme.git
cd where2meetme/app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys (see below)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Keys Required

You need accounts with two providers:

### Mapbox (maps, geocoding, non-transit routing)

1. Sign up at [mapbox.com](https://www.mapbox.com/)
2. Create a secret access token
3. Set `MAPBOX_SECRET_TOKEN` in `.env.local`

Free tier: 50k map loads, 100k geocoding requests, 100k matrix elements per month.

### Google Maps Platform (transit routing, venue search)

1. Enable these APIs in [Google Cloud Console](https://console.cloud.google.com/):
   - Distance Matrix API
   - Places API
2. Create an API key and restrict it to these APIs
3. Set `GOOGLE_MAPS_API_KEY` in `.env.local`

Free tier: 10k requests/month per API. Transit routing and Places are the main cost drivers.

### Why two providers?

Mapbox is 3-5x cheaper for maps, geocoding, and driving/walking/cycling routing. But Mapbox doesn't support transit routing at all, and Google has the best venue data (ratings, photos, reviews) especially in Australia. The hybrid approach keeps costs low while maintaining data quality.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Maps | Mapbox GL JS |
| Geocoding | Mapbox Geocoding API |
| Routing | Mapbox Matrix (drive/walk/cycle), Google Distance Matrix (transit) |
| Venues | Google Places API |
| Database | Supabase (PostgreSQL + Realtime) |
| Deployment | Docker (Coolify-ready) |

## Design System

The UI follows "The Objective Concierge" -- an editorial design system built with [Google Stitch](https://stitch.withgoogle.com/). Key characteristics:

- **Deep Navy** (`#000666`) primary with **Fairness Green** (`#1b6d24`) for balance indicators
- **No borders** -- boundaries defined by background color shifts (tonal layering)
- **Manrope** for headlines, **Inter** for body text
- Glassmorphism for floating elements, gradient CTAs, ambient shadows

See [CLAUDE.md](CLAUDE.md) for the full design system specification.

## How the Algorithm Works

1. **Seed** with the geographic centroid of all participant origins
2. **Query** real travel times from each origin to the current midpoint (Mapbox for driving/walking/cycling, Google for transit)
3. **Check** if the maximum delta between any two participants is < 2 minutes -- if so, converge
4. **Shift** the midpoint toward the participant with the longest travel time
5. **Halve** the step size and repeat (max 5 iterations)

For 2 people this finds a balanced midpoint. For 3+ people it minimizes the **maximum** travel time -- fairness means nobody gets an unfair deal, not that it averages out.

## Deployment

### Docker (Coolify / self-hosted)

```bash
docker build -t where2meetme .
docker run -p 3000:3000 \
  -e MAPBOX_SECRET_TOKEN=your_token \
  -e GOOGLE_MAPS_API_KEY=your_key \
  where2meetme
```

The Dockerfile uses a multi-stage build with Next.js standalone output for a minimal production image.

## Project Structure

```
src/
  app/
    page.tsx                     # Home/search screen
    api/search/                  # Midpoint calculation + venue search
    api/places/                  # Geocoding and photo proxies
    results/[shortCode]/         # Results page
    m/[shortCode]/               # Shared results (SSR + OG tags)
  components/                    # UI components
  lib/
    midpoint.ts                  # Fair midpoint algorithm
    types.ts                     # TypeScript types
  store/
    search.ts                    # Zustand state
supabase/
  schema.sql                     # Database schema
```

## Roadmap

- [ ] Interactive Mapbox map on results screen
- [ ] Supabase integration for persistent shared links
- [ ] Location collection links (others submit their starting point via a shared URL)
- [ ] PWA manifest + service worker
- [ ] User accounts and search history
- [ ] RSVP on shared plans
- [ ] Time-aware search (factor in traffic for specific departure times)
- [ ] Dark mode

## Contributing

Contributions are welcome! Please read [CLAUDE.md](CLAUDE.md) for architecture details and design system rules before submitting PRs.

## License

MIT
