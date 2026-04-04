# Where2Meet.Me — Product Requirements Document

**Version:** 1.0
**Date:** April 2026
**Status:** Active Development

---

## 1. Product Vision

Where2Meet.Me is the friend who solves "where should we meet?" in 30 seconds. It calculates a genuinely fair meeting point for 2-6 people based on how each person actually travels, then recommends great venues near that point — and makes it dead simple to share the result so plans actually happen instead of dying in group chat.

---

## 2. Jobs To Be Done

### Primary Job (The Emotional Core)

> "When I want to meet up with people but nobody can agree on where, help me be the person who solves it in 30 seconds so plans actually happen."

This is not a logistics tool. It's a **social agency tool** — it makes you the friend who cuts through group chat paralysis.

### Job 1: Make plans happen, not just find a spot

- **Trigger:** Group chat has stalled on "where should we meet?"
- **Outcome:** I send a link that shows everyone a fair spot with proof of fairness
- **Metric:** Time from app open to share < 60 seconds
- **Failure:** I find a spot but can't easily share it, so I screenshot and type it out manually

### Job 2: Remove the guilt of asking someone to travel far

- **Trigger:** I'm about to suggest a place near me because I know it, but I feel bad
- **Outcome:** I point to an objective calculation that proves the spot is fair
- **Metric:** Parity delta < 5 minutes for all participants
- **Failure:** The "fair" midpoint is in a dead zone with no good venues

### Job 3: Discover somewhere new that works for the group

- **Trigger:** We always go to the same 3 places; the midpoint might surface something better
- **Outcome:** I find a well-rated venue in an area I wouldn't have thought of
- **Metric:** User taps a venue they haven't visited before
- **Failure:** Results are all chain restaurants or the area is unfamiliar/unappealing

### Job 4: Understand why this spot was chosen (The Recipient's Job)

- **Trigger:** Someone sent me a Where2Meet link — I need to understand in 5 seconds why this spot is fair and how to get there
- **Outcome:** I see the fairness breakdown, my travel time, and can tap to navigate
- **Metric:** Recipient comprehension < 5 seconds; "Get Directions" tap rate
- **Failure:** The link requires me to download an app or sign up

### Job 5 (V2): Re-use what worked

- **Trigger:** Same group wants to meet again
- **Outcome:** One tap to re-run or tweak a past successful meeting search
- **Metric:** Repeat search in < 10 seconds

---

## 3. User Personas

### The Initiator — Jordan, 27

The social coordinator. Organises group hangs, tired of the "where should we meet?" loop. Wants a shareable, defensible answer. Uses the app to calculate and share. **Core jobs: 1, 2, 3.**

### The Recipient — Alex, 32

Receives a Where2Meet link in a group chat. Doesn't have the app. Needs to instantly understand the recommendation, see it's fair, and get directions. **Core job: 4.**

---

## 4. MVP Scope

### IN (v1.0)

- Search with 2-6 travelers (dynamic traveler cards)
- Per-person: name label, origin (Places autocomplete), travel mode (drive/transit/walk/cycle)
- Iterative fair midpoint calculation (minimax travel time for 3+)
- Venue type selection (coffee, dining, drinks, parks, coworking)
- Results page with interactive map, venue cards with fairness scores
- Multi-person Parity Meter (horizontal bar chart for N people)
- Venue detail view (photo, rating, address, travel times, directions)
- **Shareable results link** (`where2meet.me/m/[shortcode]`) with SSR + OG meta tags
- **Location collection link** for multi-person ("Where are you coming from?")
- Native Web Share API integration
- PWA (installable, offline app shell, add-to-homescreen prompt)
- Mobile-first responsive design per Stitch design system

### OUT (deferred)

- User accounts / auth
- Search history screen
- Favorites / bookmarks
- Dark mode
- RSVP / commitment tracking
- Push notifications
- Calendar integration
- Desktop-optimized layouts
- Native app store presence

---

## 5. Screen-by-Screen Specs

### 5a. Home / Search Screen

**Base:** Stitch home design, modified for 2-6 people.

- Hero: "Equality in every mile" headline (Manrope display-lg)
- **Dynamic traveler list:** 2 cards shown by default. Each card has:
  - Editable name label (tap to rename: "Traveler Alpha" -> "Alex")
  - Origin input (Mapbox geocoding autocomplete)
  - Travel mode chips (Car, Bus, Walk, Bike)
  - Delete button (cards 3-6 only; minimum 2)
- "+ Add person" pill button below cards (max 6)
- **Two ways to add people:**
  - **Manual:** Initiator enters everyone's locations themselves (quick for 2 people or when you know where everyone's coming from)
  - **Invite:** Tap "Send invite link" on an empty traveler card -> generates a collection link to share. The card shows "Waiting for [name]..." until they submit.
- Venue type selector: horizontal scrollable pills (Coffee, Dining, Drinks, Parks, Coworking)
- Primary CTA: "Find the Fair Midpoint" (gradient button) -- enabled when all traveler cards have locations
- Recent spots section (lightweight, local storage, no auth needed)
- Bottom nav: Search, Plans (V2 placeholder), About

### 5b. Results / Map Screen

**Base:** Stitch results design (version 2), extended for N people.

- Interactive map (Mapbox GL JS) showing:
  - N origin markers (labeled with traveler names)
  - Calculated midpoint marker (pulsing green)
  - Connecting lines (optional, subtle)
- Results header: "[Venue type] near the midpoint" + count
- Filter chips (sub-category filters)
- Venue cards (up to 9), each showing:
  - Photo thumbnail
  - Name, short address, rating
  - **Fairness score** (% match -- based on max travel time delta)
  - **Multi-person Parity Meter:** horizontal bars per person, color-coded (green <=5min delta, yellow 5-10min, red >10min)
  - Travel times for each person
- **Share FAB** (more prominent than "New Search" -- sharing is the primary post-result action)
- Sorted by fairness score (smallest max delta first)

### 5c. Venue Detail Screen

**Base:** Stitch details design, simplified.

- Photo hero (single image, full-width)
- Venue name, rating (stars + count), address
- Travel parity card with multi-person bars
- **Primary CTA: "Share this spot"** (generates plan link)
- **Secondary CTA: "Get Directions"** (deep link to Google Maps / Apple Maps)
- Link to full Google Maps listing for reviews/hours

### 5d. Shared Results Page (NEW -- the recipient's view)

- **SSR-rendered** with OG meta tags (venue photo, name, fairness in preview)
- Read-only version of venue detail:
  - Venue photo, name, rating, address
  - Map with all origin markers + venue
  - Each person's name, travel mode, travel time
  - Parity visualization
  - "Get Directions" CTA per person (deep links)
- Footer: "Find your own fair midpoint" CTA (acquisition hook)

### 5e. Location Collection Page (NEW -- multi-person input)

- Minimal, single-purpose:
  - "[Initiator name] is planning a meetup. Where are you starting from?"
  - Places autocomplete input
  - Travel mode chips
  - "Submit" button
- After submission: "Got it! You'll see the results when everyone's in."
- When all participants submit -> results calculate automatically

---

## 6. Design System

Fully defined in the [DESIGN.md](../stitch_fair_meeting_locator%20(2)/DESIGN.md) files within the Stitch design folders. The system is called **"The Objective Concierge"** -- editorial precision with tonal depth.

### Key Principles

| Principle | Rule |
|-----------|------|
| Colors | Deep Navy `#000666` primary, Fairness Green `#1b6d24` for balance indicators |
| No-Line Rule | Zero 1px borders; boundaries via background color shifts only |
| Typography | Manrope (headlines) + Inter (body) + Material Symbols Outlined (icons) |
| Elevation | Tonal layering (stacked paper metaphor), ambient shadows (blur 32px, 6% opacity) |
| Glass | Glassmorphism (`backdrop-filter: blur(20px)`) for floating elements over maps |
| Gradients | Primary -> primary-container at 135deg on CTAs |
| Borders | Ghost borders only (outline-variant `#c6c5d4` at 15% opacity) |
| Text | Never pure black; use `#1a1c1d` (`on-surface`) |

### Surface Hierarchy

| Token | Hex | Use |
|-------|-----|-----|
| `surface` | `#f9f9fb` | Page background |
| `surface-container-low` | `#f3f3f5` | Secondary sections, input fields |
| `surface-container-lowest` | `#ffffff` | Cards, interactive elements |
| `surface-container-high` | `#e8e8ea` | Elevated overlays, unselected chips |

### Design Modifications for Multi-Person

- Parity Meter -> multi-bar horizontal chart for 3+ people
- Traveler cards -> dynamic list with add/remove
- Map markers -> scale to 6 with name labels

---

## 7. Algorithm: Fair Midpoint Engine

### Contract

- **Inputs:** 2-6 origins (lat/lng), each with a travel mode
- **Output:** A single coordinate (lat/lng) that minimizes unfairness
- **Fairness definition:** Minimize the **maximum** travel time across all participants (minimax). Nobody gets screwed.
- **Tolerance:** Converge when max delta between any two participants < 2 minutes
- **Performance:** < 3s for 2 people, < 8s for 6 people
- **Fallback:** If any iteration fails (no route found), use last valid midpoint

### Approach

1. Seed with weighted geographic centroid of all origins
2. Query Distance Matrix API for all participants' travel times to current point
3. If max delta < 120s -> done
4. Shift midpoint toward the participant(s) with longest travel time
5. Repeat (max 5 iterations, halving step size each round)
6. Search for venues near the converged midpoint (Google Places Nearby Search)

### Key Difference from middl

middl uses a simple 2-person midpoint shift. Where2Meet.Me uses **minimax optimization** for 3+ people -- the goal is to minimize the travel time of the person who travels the *longest*, not to average everyone out. This prevents the common failure mode where one person in a group of 4 ends up with a 45-minute commute while others have 10 minutes.

---

## 8. Technical Architecture

### Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js 15 (App Router)** | SSR for shared links (OG previews), API routes, server actions |
| Styling | **Tailwind CSS v4** | Stitch designs already use Tailwind; direct translation |
| State | **Zustand** | Lightweight client state for traveler list, search flow |
| Maps | **Mapbox GL JS** via `react-map-gl` | 50k free map loads/mo (vs 10k Google), much cheaper at scale |
| Database | **Supabase** (PostgreSQL + Realtime) | Searches, shared plans, participant submissions, realtime for collection |
| Auth | **None for MVP** | Zero friction; add Supabase Auth in V2 |
| Hosting | **Coolify** (self-hosted) | Docker-based Next.js deployment |
| PWA | **Serwist** (next-pwa successor) | Service worker, manifest, offline shell |

### Hybrid API Strategy (Mapbox + Google)

Cost research shows a hybrid approach is optimal -- Mapbox for most things, Google only where unavoidable.

| Use Case | Provider | Cost (per 1k) | Free Tier |
|----------|----------|---------------|-----------|
| **Map tiles** | Mapbox | ~$0.50-2 | 50k loads/mo |
| **Geocoding / Autocomplete** | Mapbox | $0.75 | 100k req/mo |
| **Reverse geocoding** | Mapbox | $0.75 | 100k req/mo |
| **Matrix (driving/walking/cycling)** | Mapbox | $2 | 100k elements/mo |
| **Matrix (transit only)** | Google | $5-10 | 10k elements/mo |
| **Places / Venue search** | Google | $10-30 | 10k req/mo |

**Why hybrid:** Mapbox doesn't support transit routing at all -- Google is the only option for transit travel times. Google also has the best Australian venue data (ratings, photos, reviews). Everything else is 3-5x cheaper on Mapbox.

**Cost mitigation:**
- Only call Google Transit Matrix when a participant selects transit mode (don't pre-compute all modes)
- Calculate midpoint with coordinate math first (free), find venues, then batch Distance Matrix for top 10-15 venues only
- Cache venue results by place_id + rounded midpoint (3 decimals) for 24 hours
- At 500 searches/day: ~$0 for Mapbox (within free tiers), ~$300-500/mo for Google (transit + Places)

### Data Model (Core Tables)

```sql
searches
  id            uuid PK
  short_code    text UNIQUE  -- for share URLs (where2meet.me/m/abc123)
  venue_type    text
  status        enum (collecting, calculating, complete)
  midpoint_lat  float
  midpoint_lng  float
  created_at    timestamptz

participants
  id                  uuid PK
  search_id           uuid FK -> searches
  label               text         -- "Alex", "Jordan"
  origin_place_id     text
  origin_lat          float
  origin_lng          float
  origin_display_name text
  travel_mode         enum (driving, transit, walking, bicycling)
  travel_time_seconds int NULL     -- filled after calculation
  submitted_at        timestamptz

venues
  id              uuid PK
  search_id       uuid FK -> searches
  place_id        text
  name            text
  address         text
  lat             float
  lng             float
  rating          float
  photo_reference text
  fairness_score  float          -- 0-100 based on max delta
  travel_times    jsonb          -- { participant_id: seconds, ... }
```

### Key Architecture Decisions

- **API keys server-side only.** All Google/Mapbox API calls (Distance Matrix, Places details) go through Next.js API routes. Only Mapbox GL JS (map rendering) and Mapbox Search Box (autocomplete) run client-side with restricted tokens.
- **Supabase Realtime** for the collection flow: when participant B submits their location via the collection link, the initiator's client receives a realtime update.
- **Short codes** for share URLs generated server-side (nanoid, 8 chars).
- **SSR for shared links** with dynamic OG meta tags so WhatsApp/iMessage previews show venue photo + name.
- **Coolify deployment:** Dockerized Next.js (standalone output mode). Supabase can be self-hosted on Coolify or use Supabase Cloud (managed). Recommend managed Supabase for Realtime reliability.
- **Australia-first:** Default map center on Melbourne/Sydney. Venue search tuned for Australian POI data. Transit data coverage validated for AU metro areas.

---

## 9. Distribution & Growth

**PWA-first.** The primary interaction is: someone sends you a link, you open it. No app store gate.

**Viral loop:**

1. Initiator searches -> gets results
2. Shares link to group chat
3. Recipients open link (zero friction, no install)
4. Recipients see "Find your own fair midpoint" CTA -> become initiators
5. Repeat

**PWA install prompt** after 2nd successful search for repeat users.

**Hosting:** Self-hosted on Coolify via Docker. Next.js standalone output (`output: 'standalone'` in next.config). Reverse proxy handles SSL/domain routing.

**SEO (V2):** Static pages for popular city-pair searches ("fair meeting point between Melbourne CBD and St Kilda").

---

## 10. Analytics Events (MVP)

| Event | Purpose |
|-------|---------|
| `search_initiated` | Core usage |
| `participant_added` | Multi-person adoption |
| `midpoint_calculated` | Algorithm success rate |
| `venue_tapped` | Discovery engagement |
| `share_triggered` | Growth loop entry |
| `shared_link_opened` | Growth loop completion |
| `directions_tapped` | Intent to actually meet |
| `collection_link_sent` | Multi-person flow adoption |
| `collection_submitted` | Multi-person flow completion |
| `pwa_installed` | Retention signal |

---

## 11. V2 Roadmap (Ordered)

1. **User accounts** (Supabase Auth -- Google/Apple sign-in)
2. **Search history** (persisted per account, repeat/tweak past searches)
3. **RSVP on shared plans** (going / not going / maybe)
4. **Push notifications** (plan reminders, "everyone's submitted their location")
5. **Favorites** (bookmark venues)
6. **Dark mode** (design system already defines it)
7. **Time-aware search** (factor in traffic for specific departure times)
8. **Calendar integration** (add meeting to calendar from plan link)
9. **Radius control** (adjustable venue search radius)
10. **Native app wrappers** (TWA for Android, App Clip/native for iOS)

---

## 12. Key Differences from middl (Reference App)

| Aspect | middl (Reference) | Where2Meet.Me |
|--------|-------------------|---------------|
| People | 2 only | 2-6 from day one |
| Algorithm | Shift midpoint between 2 origins | Minimax optimization for N people |
| Sharing | Future backlog item | Core feature -- every result is a shareable link |
| Recipient experience | None (requires app) | Dedicated SSR page with OG previews |
| Multi-person input | N/A | Collection links -- others submit via shared URL |
| Auth | Required | None for MVP (zero friction) |
| Maps | Google Static Maps | Mapbox GL JS (interactive, cheaper) |
| API costs | All Google (~$5-30/1k per API) | Hybrid Mapbox+Google (3-5x cheaper for most calls) |
| Deployment | base44 platform | Self-hosted Docker on Coolify |
| Design system | Standard utility app | "The Objective Concierge" editorial design |

---

## 13. Verification Plan

### How to test end-to-end

1. **Home screen:** Add 3 travelers with different origins and travel modes -> verify autocomplete works, travel mode chips toggle, add/remove traveler cards
2. **Search flow:** Tap "Find the Fair Midpoint" -> verify loading state, API calls, midpoint convergence
3. **Results screen:** Verify map shows all markers, venue cards display fairness scores, parity meter shows N bars
4. **Venue detail:** Tap a venue -> verify photo, travel times, share + directions CTAs
5. **Share flow:** Tap share -> verify short URL generated, OG meta tags render in link preview
6. **Shared link:** Open the link in incognito -> verify SSR renders venue details, directions work
7. **Collection flow:** Generate collection link -> open in separate browser -> submit location -> verify initiator receives realtime update
8. **PWA:** Audit with Lighthouse, verify manifest, service worker, offline shell, install prompt

---

*This PRD reflects the designed and scaffolded state of Where2Meet.Me as of April 2026.*
