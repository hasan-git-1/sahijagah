urbanStay

**AI-powered rental platform for finding and listing homes without middlemen.**

urbanStay is a mobile-first proptech platform that connects property owners directly with tenants and home seekers. By removing brokers and simplifying the rental process with AI, urbanStay makes property discovery faster, listing creation easier, and rental decisions more transparent.

---

The Problem

In major cities like **Hyderabad, Bengaluru, Delhi, Mumbai, and Noida**, finding a rental home often depends on brokers who charge high commissions, limit direct communication with owners, and make the search process slow and inefficient. At the same time, many property owners struggle to create quality listings, attract genuine tenants, and manage inquiries beyond local advertising or WhatsApp groups.

---

What urbanStay Does

**For Property Seekers**

* Search, filter, compare, and shortlist verified properties.
* Chat directly with property owners inside the app.
* Use AI-powered natural language search, such as *"2BHK under ₹20,000 near Gachibowli with parking,"* to instantly discover relevant listings.

**For Property Owners**

* Publish a property in under two minutes.
* Create listings manually or let AI generate professional titles, descriptions, property details, and amenities from uploaded images and basic information.
* AI automatically reviews uploaded photos before publishing to maintain listing quality.

**For the Platform**

* AI-driven moderation, verification, and quality control help maintain trustworthy listings while enabling the platform to scale efficiently.

---

Feature Overview

### Discovery

* Full-text search across rental, PG, hostel, and property listings
* Smart filters for price, bedrooms, area, amenities, furnishing, and property type
* Interactive map search with clustered markers and radius search
* Personalized nearby localities based on the user's location
* Featured properties, recently viewed listings, saved searches, and new-match notifications
* Wishlist collections and side-by-side property comparison with PDF export
* Voice search and automatic city detection using location services

### Listing & Ownership

* Guided multi-step property posting with image upload, map location, and amenity selection
* **AI Listing Generator** that creates property titles, descriptions, categories, room details, area information, and detects amenities from uploaded images
* Bulk property upload for owners managing multiple listings
* Owner dashboard with property views, inquiries, performance insights, and renewal reminders
* Property editing, availability management, and visibility controls

### Trust & Safety

* **AI Image Verification** that detects AI-generated images, stock photos, watermarked content, duplicate images, and suspicious uploads before publishing
* Verified owner badges, tenant verification, and property reporting
* Role-based admin dashboard for moderation and user management
* Secure access control to protect owner contact information and user data

### Communication

* Real-time in-app messaging between owners and seekers
* Typing indicators, read receipts, conversation history, and message management
* Push notifications for messages, listing approvals, and booking requests
* Optional click-to-call and WhatsApp integration

### Tools

* Rent receipt generation
* Rental agreement templates
* EMI and stamp duty calculators
* Rent vs. Buy analysis
* Rental yield calculator
* Area unit conversion
* Move-in and handover checklists
* Locality insights and safety scores
* Commute estimation
* Vastu suggestions
* Secure document vault

### Platform

* Progressive Web App (PWA) with offline support and install prompts
* Native Android application built with Capacitor
* Multilingual interface supporting English, Hindi, and Telugu
* Public MCP server with authenticated OAuth 2.1 APIs for AI agent integration


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
