# urbanStay

**Renting and buying a home in India's tier-2 and tier-3 cities, without middlemen.**

urbanStay is a mobile-first proptech application that connects property owners directly with tenants and buyers. No brokers, no listing commissions, no gatekeepers — just verified listings, direct messaging, and an AI agent that does the heavy lifting on both sides of the transaction.

---

## The problem

In cities like Warangal, Vijayawada, Nashik or Kochi, finding a place to live still runs through brokers who charge one to two months of rent, gate the owner's phone number, and inflate prices. Owners, in turn, struggle to write a listing, take good photos, or reach anyone beyond a WhatsApp group.

## What urbanStay does

- **For seekers** — search, filter, compare and shortlist real listings, talk to the owner directly in-app, and get an AI agent that understands "2BHK under ₹20k near Gachibowli with parking" and returns actual listings, not chatter.
- **For owners** — post a property in under two minutes. Either fill the manual form, or hand photos and a few basics to the AI, which writes the entire listing and submits it. An AI moderator then reviews the photos for authenticity and publishes the listing automatically.
- **For the platform** — moderation, verification and quality control are algorithmic, so listing volume scales without a human review team.

---

## Feature overview

### Discovery
- Full-text and faceted search across rent, buy, PG and commercial listings
- Advanced filter chips: price, bedrooms, area, amenities, furnishing, property type
- Map search with clustered pins, heatmap view and radius search
- Popular localities, personalised to the user's location within a 5–10 km radius once location access is granted
- Featured homes grid, recently viewed, saved searches with new-match notifications
- Wishlist collections and side-by-side property comparison with PDF export
- Voice search and geolocation-based auto-detection of the current city

### Listing and ownership
- Six-step guided manual posting flow with image upload, map pin picker and amenity selection
- **AI Post** — the owner supplies photos, type, location, rate, phone and amenities; a vision model writes the title, description, category, bedroom/bathroom count and area, and detects additional amenities from the photographs
- Bulk upload for owners with multiple units
- Owner dashboard with per-property views, enquiries, conversion charts and lease/renewal reminders
- Property editing, visibility toggles and availability calendars

### Trust and safety
- **AI image moderation** — every submitted listing is scored 0–100 for photographic authenticity; stock imagery, AI-generated renders and duplicated marketing photos are rejected with a reason, genuine photos are approved and published instantly
- Verified-owner badges, tenant verification and property reporting flows
- Role-based admin panel for manual overrides, user management and bans
- Row-level security on every table; profile email and phone are never readable by anonymous visitors

### Communication
- Real-time one-to-one messaging between seekers and owners, backed by Supabase Realtime broadcast
- Typing indicators, read state, message and conversation deletion, and persistent history
- Push notifications for new messages, booking requests and listing approvals
- Click-to-call and WhatsApp deep links where the owner has opted in

### Tools
Rent receipts, rent agreement generation with regional templates, EMI and stamp duty calculators, rent-vs-buy analysis, rental yield, area unit conversion, move-in and handover checklists, locality and safety scorecards, commute estimation, Vastu tips and a document vault.

### Platform
- Progressive Web App with offline indicator and a custom platform-aware install flow
- Native Android build via Capacitor, with splash screen, camera and push notification plugins
- Trilingual interface: English, Hindi and Telugu
- Public MCP server, so external AI agents can search urbanStay listings over an authenticated OAuth 2.1 endpoint

---

## Architecture

urbanStay is a single-page React application talking directly to a managed Postgres backend, with stateless edge functions handling everything that needs a secret or a model call.

```
┌──────────────────────────────────────────────────────────┐
│  Client — React 18 + Vite + TypeScript                   │
│                                                          │
│  Routing (React Router) ── AppShell + bottom navigation  │
│  State: TanStack Query (server) + Context (auth, i18n)   │
│  UI: Tailwind CSS + shadcn/ui (Radix primitives)         │
│  Maps: Leaflet · Charts: Recharts · Forms: RHF + Zod     │
│                                                          │
│  Packaged as a PWA, and wrapped by Capacitor for Android │
└───────────────┬──────────────────────┬───────────────────┘
                │ supabase-js          │ functions.invoke
                ▼                      ▼
┌───────────────────────────┐  ┌───────────────────────────┐
│  Postgres + PostgREST     │  │  Deno Edge Functions      │
│                           │  │                           │
│  • RLS on every table     │  │  • ai-listing-draft       │
│  • SECURITY DEFINER       │  │  • ai-property-review     │
│    helpers (has_role,     │  │  • property-chat          │
│    is_user_banned)        │  │  • notify-saved-searches  │
│  • Triggers: profiles,    │  │  • mcp (OAuth 2.1)        │
│    notifications, updated │  └────────────┬──────────────┘
│  • Realtime broadcast     │               │
│  • Storage buckets        │               ▼
└───────────────────────────┘  ┌───────────────────────────┐
                               │  AI Gateway → Gemini      │
                               │  vision + tool calling    │
                               └───────────────────────────┘
```

### Data model (core tables)

| Table | Purpose |
| --- | --- |
| `profiles` | User display data, contact details, verification and ban state |
| `user_roles` | Roles (`admin`, `owner`, `client`) held in a separate table to prevent privilege escalation |
| `properties` | Listings with type, category, price, geo coordinates, amenities, images, `status` (`pending` / `approved` / `rejected`) and visibility |
| `messages` / `conversations` | Direct chat history between seekers and owners |
| `bookings` | Visit requests against a property |
| `notifications` | In-app notification feed, written by database triggers |
| `saved_searches`, `wishlists`, `reviews`, `reports` | Engagement and moderation surfaces |

### Security model

- Every public table has row-level security enabled with explicit grants; nothing is readable by default.
- Roles live in `user_roles` and are checked through the `has_role(uuid, app_role)` SECURITY DEFINER function, so policies never recurse.
- Anonymous visitors can read approved, visible listings and only the display fields of a profile — email and phone are unreachable.
- Owner ban checks run through `is_user_banned(uuid)` so listing policies never need to read the private profile table.
- The profile-photos and document-vault buckets are private; the client renders them through short-lived signed URLs.
- The MCP endpoint requires an OAuth 2.1 bearer token and returns `401` with a `WWW-Authenticate` challenge otherwise.

### AI subsystem

Three distinct AI surfaces, each with its own contract:

1. **Property Assistant** (`property-chat`) — a conversational agent with real tools: `search_properties`, `get_property_details`, `compare_properties` and `calculate_emi`. It streams responses and renders live property cards inline, so answers are grounded in the database rather than generated prose.
2. **AI Post** (`ai-listing-draft`) — a one-shot structured generator. Photos and raw owner inputs go in; a strict JSON listing comes out (title, description, category, bedrooms, bathrooms, area, detected amenities), validated and clamped server-side before it reaches the client. The owner reviews, edits or regenerates, then publishes.
3. **AI Moderator** (`ai-property-review`) — a vision reviewer that scores photographic realness. It runs automatically the moment a listing is submitted, and can also be run in queue mode from the admin panel to sweep every pending listing one by one, backing off gracefully on rate limits. A score at or above the threshold flips the listing to `approved` and fires the owner notification trigger; below it, the listing is rejected with a human-readable reason.

---

## Technologies

**Languages** — TypeScript, SQL (PostgreSQL), CSS, a little Java/Kotlin scaffolding from the Capacitor Android shell.

**Frontend** — React 18, Vite 5, React Router, TanStack Query, Tailwind CSS 3, shadcn/ui on Radix UI, Lucide icons, React Hook Form with Zod validation, Recharts, Leaflet, Embla carousel, Sonner toasts, `next-themes`.

**Backend** — PostgreSQL with row-level security, PostgREST, Supabase Auth (email/password and Google OAuth), Supabase Realtime, Supabase Storage, Deno edge functions.

**AI** — Google Gemini (vision and tool-calling) via a managed AI gateway; `@lovable.dev/mcp-js` for the agent-facing MCP server.

**Mobile** — Capacitor 8 with splash screen, camera and push notification plugins; PWA manifest and service worker for installable web.

**Testing and tooling** — Vitest, Testing Library, ESLint, TypeScript strict tooling.

---

## Design system

urbanStay uses a *Warm Editorial* identity, deliberately unlike the blue-and-white template look of most listing sites.

- **Palette** — paper `#faf8f5`, ink `#0d0d0d`, and a clay-gold accent. No blue primary, no purple gradients.
- **Type** — Space Grotesk for headings, DM Sans for body.
- **Layout** — mobile-first, high-contrast editorial grids, two listings per row, generous whitespace and photography-led cards.

All colour, gradient and shadow values are semantic tokens defined in the global stylesheet and consumed through component variants, so theming and dark mode stay consistent.

---

## Repository layout

```
src/
  pages/            Route-level screens
    app/            Authenticated app shell screens (home, search, post,
                    chat, profile, owner + admin dashboards, tools)
  components/       Feature components and the shadcn/ui primitives
  contexts/         Auth and internationalisation providers
  hooks/            Data hooks (properties, wishlist, engagement, deep links)
  lib/              Utilities: MCP tools, app-mode detection, signed URLs
  integrations/     Generated backend client and typed database schema
  test/             Vitest suites, including the approval lifecycle test
supabase/
  functions/        Deno edge functions
  migrations/       Versioned SQL schema, policies and triggers
```

---

## Project status

urbanStay is live as a progressive web app and as an Android build. Core discovery, listing, messaging, moderation and owner analytics are shipped. Payments, brokerage and agent marketplaces are intentionally out of scope — removing the middleman is the product.
