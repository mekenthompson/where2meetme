# middl — Product Requirements Document (Original Reference)

> This is the original PRD from the base44 "middl" prototype, used as a reference starting point for Where2Meet.Me. It documents the initial concept before our redesign.

**Version:** 1.0
**Date:** April 2026
**Status:** Reference Only — superseded by [PRD-where2meetme.md](PRD-where2meetme.md)

---

## Executive Summary

middl is a web application that solves the "where should we meet?" problem by calculating a genuinely fair meeting point between two people based on real travel times — not just geographic distance. It then surfaces relevant venue recommendations near that fair midpoint.

---

## Jobs To Be Done (JTBD)

### Primary JTBD

"When I need to meet someone who lives or works far from me, I want to find a venue that is equally convenient for both of us, so that neither person feels like they made a disproportionate effort to show up."

This is the core job. The user is not just looking for a map midpoint — they want travel-time fairness, which is a fundamentally different and more nuanced problem.

### Supporting JTBD (Full Spectrum)

#### 1. The Fairness Seeker

"When I'm meeting a friend/colleague and I don't want it to seem like I'm making them come all the way to me, I want a neutral third party (the app) to calculate who goes where, so that the decision feels objective and unbiased."

- **Trigger:** Feeling social pressure or guilt about suggesting a venue that favours your location.
- **Outcome:** A recommendation the user can share confidently, saying "the app says this is the fairest spot."
- **Metric:** Both travel times shown explicitly and visibly on each result card.

#### 2. The Logistics Coordinator

"When I'm arranging a catch-up between two people with different commute profiles (e.g., one drives, one takes transit), I want the app to account for their different travel modes, so that the meeting point is fair given how each person actually travels."

- **Trigger:** Knowing that a geographic midpoint is meaningless when one person drives 80km/h on a freeway and the other walks or takes a tram.
- **Outcome:** An iterated, travel-mode-aware midpoint that reflects actual door-to-door time.
- **Metric:** Each person's travel mode is individually configurable. The algorithm runs up to 7 iterations to converge on a ≤2-minute difference in travel time.

#### 3. The Venue Discoverer

"When I know roughly where we should meet, I want to see curated venue options (cafes, restaurants, parks, etc.) near that point, so I don't have to manually search in Google Maps after finding the midpoint."

- **Trigger:** The frustration of finding a midpoint on a map and then still having to open a separate app to find somewhere to go.
- **Outcome:** A results page that shows venue cards with photos, ratings, addresses, and both travel times — eliminating the second search step.
- **Metric:** Up to 9 venue recommendations, sorted by travel-time balance (smallest difference first).

#### 4. The Meeting Planner (Repeat User)

"When I frequently arrange meetings with the same people (colleagues, recurring clients, regular friends), I want to be able to see my past searches, so I don't have to re-enter the same locations every time."

- **Trigger:** Returning to the app after a previous search, needing to repeat or slightly modify a past query.
- **Outcome:** A History page that stores past MeetingSearch records associated with the user's account.
- **Metric:** History page showing previous searches with locations, travel modes, and venue type.

#### 5. The Decision Sharer

"When I've found a good venue option, I want to be able to send the details to the other person easily, so they can navigate there without needing to use the app themselves."

- **Trigger:** Found the perfect venue, now need to communicate it to the other party.
- **Outcome:** Direct links to Google Maps directions ("Get Directions") and the venue's Google Maps listing ("More Details") embedded in each venue card's modal.
- **Metric:** External link CTAs available on every result without additional steps.

#### 6. The Skeptic / Validator

"When I see a recommended meeting spot, I want to see photos, reviews, and ratings of the venue before agreeing to go there, so that I'm not walking into a bad or closed venue."

- **Trigger:** Distrust of unfamiliar venue recommendations without social proof.
- **Outcome:** A detailed modal per venue showing a photo carousel, star rating, review snippets, and full address.
- **Metric:** Up to 5 photos, up to 2 review snippets, numeric rating displayed per venue.

---

## User Personas

### Persona 1: "The Urban Professional" — Alex, 32

Lives in the inner suburbs, works in the CBD. Regularly catches up with friends or clients spread across the metro area. Values efficiency and fairness. Dislikes the social awkwardness of "you come to me." Primarily drives or uses public transit.

**Core Job:** Fairness Seeker + Venue Discoverer.

### Persona 2: "The Social Coordinator" — Jordan, 27

Organises group hangs and regularly acts as the planner in their friend group. Friends are spread across different suburbs with different commute styles. Wants a shareable, defensible answer to "where should we meet?"

**Core Job:** Logistics Coordinator + Decision Sharer.

### Persona 3: "The Regular Connector" — Sam, 45

Has recurring meetings (clients, mentees, coffee chats). Same people, slightly different locations week to week. Values speed — wants to repeat or tweak past searches without starting from scratch.

**Core Job:** Meeting Planner (Repeat User).

---

## Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| Location Autocomplete | Google Places-powered address input with debounced suggestions | Live |
| Travel Mode Selection | Per-person travel mode (driving, transit, walking, cycling) | Live |
| Venue Type Selection | Cafe, restaurant, bar, park, library, gym, shopping | Live |
| Iterative Fair Midpoint | Up to 7 iterations to find ≤2min travel-time balance | Live |
| Venue Recommendations | Up to 9 venues sorted by fairness, with photos & reviews | Live |
| Static Map Preview | Google Static Maps showing both pins and midpoint marker | Live |
| Venue Detail Modal | Photo carousel, reviews, ratings, directions link | Live |
| Search History | Persisted past searches per user account | Live |

---

## Algorithm: The Fair Midpoint Engine

This is middl's core differentiator and deserves detailed documentation.

### Problem

A geographic midpoint (average of lat/lng) does not account for:

- Road networks (you can't travel in a straight line)
- Different travel modes (one person drives, one walks)
- Asymmetric infrastructure (freeways on one side, no transit on the other)

### Solution: Iterative Travel-Time Balancing

1. Start at the geometric midpoint of the two coordinates.
2. Query Google Distance Matrix API for both persons' travel times to the current midpoint.
3. Check tolerance: If |time_A - time_B| < 120 seconds (2 minutes), stop — this is fair enough.
4. Adjust: If one person has a significantly shorter travel time, shift the midpoint toward the other person's origin by a factor of 0.5 / 2^i (halving each iteration to converge).
5. Repeat for up to 7 iterations.
6. Fallback: If any iteration fails (e.g., no route found), revert to the last valid midpoint.

### Why This Matters

The result is a midpoint that genuinely reflects real-world travel equity, not just geographic centre — the core emotional and practical value proposition of the product.

---

## Data Model

### MeetingSearch Entity

| Field | Type | Description |
|-------|------|-------------|
| location_a | string | Address for Person A |
| location_b | string | Address for Person B |
| travel_mode_a | enum | driving / walking / bicycling / transit |
| travel_mode_b | enum | driving / walking / bicycling / transit |
| venue_type | enum | cafe / restaurant / bar / park / library / gym / shopping |
| search_results | array | Full venue recommendation objects |

Each result object includes: name, address, short_address, image_urls[], travel_time_a, travel_time_b, rating, description, reviews[].

---

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Autocomplete latency | < 400ms (300ms debounce + API call) |
| Search completion time | < 8 seconds end-to-end |
| Mobile responsiveness | Full support, touch-friendly |
| API key security | Server-side only, never exposed to client |
| Data privacy | Search results scoped to created_by user |

---

## Future Opportunities (Backlog)

- **Group meetups (3+ people):** Extend the algorithm to balance travel times across 3 or more origins.
- **Shareable link:** Generate a public URL for a search result that the other person can open without an account.
- **Saved favourites:** Bookmark venues or searches for quick re-access.
- **Time-aware search:** "Meet at 6pm on Friday" — factor in real-time traffic conditions.
- **Radius control:** Let users adjust the venue search radius (currently fixed at 3km).
- **Notifications:** "Your meeting at X is in 1 hour — here's your route."
- **Mobile app:** The React codebase is mobile-compatible; a native wrapper (PWA or React Native) is a natural extension.

---

*This PRD reflects the initial middl prototype as of April 2026.*
