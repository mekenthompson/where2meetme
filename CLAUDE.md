# Where2Meet.Me

Fair meeting point finder for 2-6 people based on real travel times.

## Architecture

- **Next.js 15** App Router, TypeScript, standalone Docker output
- **Tailwind CSS v4** with custom design tokens (no tailwind.config — uses CSS `@theme`)
- **Zustand** for client state management
- **Mapbox** for map tiles, geocoding, address autocomplete, driving/walking/cycling routing
- **Google Maps Platform** for transit routing (Mapbox doesn't support transit), Places API (venue search, photos, ratings)
- **Supabase** for PostgreSQL + Realtime (shared links, collection flow)
- **Coolify** for self-hosted deployment via Docker

## Project Structure

```
src/
  app/
    page.tsx                     # Home/search screen
    layout.tsx                   # Root layout (fonts, metadata)
    globals.css                  # Design system tokens + utility classes
    api/
      search/route.ts            # Midpoint calculation + venue search
      places/autocomplete/       # Mapbox geocoding proxy
      places/details/            # Place coordinate lookup
      places/photo/              # Google Places photo proxy
    results/[shortCode]/         # Results page (client-side)
    m/[shortCode]/               # Shared results page (SSR + OG tags)
  components/
    TravelerCard.tsx             # Dynamic traveler input card
    LocationInput.tsx            # Address autocomplete component
    TravelModeChips.tsx          # Car/Bus/Walk/Bike selector
    VenueTypeSelector.tsx        # Venue category pills
    VenueCard.tsx                # Result card with parity meter
    VenueDetail.tsx              # Full venue view with share/directions
    ParityMeter.tsx              # Multi-person travel time visualization
    Icon.tsx                     # Material Symbols wrapper
  lib/
    midpoint.ts                  # Iterative minimax fair midpoint algorithm
    types.ts                     # Shared TypeScript types
  store/
    search.ts                    # Zustand store for search flow state
supabase/
  schema.sql                     # Database schema with RLS policies
```

## Design System ("The Objective Concierge")

Reference prototypes are in the parent `stitch_designs/` directory. Key rules:

- **Fonts:** Manrope (headlines, `font-headline`), Inter (body, `font-body`), Material Symbols Outlined (icons)
- **Colors:** Deep Navy `#000666` (primary), Fairness Green `#1b6d24` (balance indicators)
- **No-Line Rule:** Zero 1px borders. Boundaries via background color shifts only.
- **Surface hierarchy:** `surface` → `surface-low` → `surface-lowest` (cards) → `surface-high` (elevated)
- **Elevation:** Tonal layering (paper stacking), ambient shadows (blur 32px, 6% opacity, tinted not black)
- **Glass:** `backdrop-filter: blur(20px)` for floating elements over maps
- **Gradients:** Primary CTAs use `linear-gradient(135deg, #000666, #1a237e)`
- **Text:** Never pure black — use `#1a1c1d` (`on-surface`)

## API Strategy (Hybrid Mapbox + Google)

Mapbox is used for everything except transit routing and venue data (which require Google).

| Use Case | Provider | Why |
|----------|----------|-----|
| Map tiles | Mapbox | 50k free loads/mo, cheaper |
| Geocoding/autocomplete | Mapbox | $0.75 vs $5/1k, 100k free |
| Routing (drive/walk/cycle) | Mapbox | $2 vs $5-10/1k |
| Routing (transit) | Google | Mapbox doesn't support transit |
| Venue search + photos | Google | Best AU POI data |

All API keys are server-side only. Client-side code never sees raw keys.

## Environment Variables

Copy `.env.example` to `.env.local`:
- `MAPBOX_SECRET_TOKEN` — Mapbox secret token (server-side)
- `GOOGLE_MAPS_API_KEY` — Google Maps Platform key (server-side)
- Supabase vars are optional until DB is connected

## Commands

```bash
npm run dev       # Development server (http://localhost:3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint
```

## Key Algorithms

The fair midpoint algorithm (`lib/midpoint.ts`) uses iterative minimax optimization:
1. Seed with geographic centroid of all origins
2. Fetch real travel times via Distance Matrix APIs
3. If max delta between any two participants < 2 minutes, converge
4. Shift midpoint toward the participant with the longest travel time
5. Halve step size each iteration; max 5 iterations

For 3+ people, fairness = minimize the **maximum** travel time (nobody gets screwed).

## Contributing

- Keep the design system rules strict — they are intentional
- Australia-first: default map views, transit data, venue coverage
- Cost-conscious: cache aggressively, batch API calls, only call Google when Mapbox can't do it
