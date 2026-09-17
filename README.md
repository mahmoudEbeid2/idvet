# IDVET Website

Next.js 16 (App Router, TypeScript, Turbopack) + Tailwind CSS v4 implementation of the
[IDVET Figma design](https://www.figma.com/design/Tf75R2z4aWzgtEx0yUqde7/Untitled?node-id=0-1),
pixel-matched against the `Desktop - 2` (Kurdish, default/visible) frame, with an Arabic
translation served at `/ar` reusing the same verified layout. Backed by PostgreSQL (via
Docker Compose + Prisma) for the contact form.

## Stack

- **Frontend:** Next.js 16 App Router, React 19, Tailwind CSS v4
- **Backend:** Next.js API route (`/api/contact`) + Prisma 7 (driver adapter: `@prisma/adapter-pg`)
- **Database:** PostgreSQL 16, run via Docker Compose
- **i18n:** route-based locales, `/ku` (default, Kurdish Sorani) and `/ar` (Arabic), both RTL

## Getting started

1. **Start the database**

   ```bash
   docker compose up -d
   ```

   This starts Postgres on `localhost:5434` and [Adminer](http://localhost:8091) (DB browser,
   login with server `db`, user `idvet`, password `idvet`, database `idvet`).

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Apply the database schema**

   ```bash
   npx prisma migrate dev
   ```

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) — it redirects to `/ku`.

Environment variables live in `.env` (already set up for the local Docker Postgres instance;
see `.env.example` for the shape).

## Project structure

- `app/[locale]/` — the two locale routes (`ku`, `ar`), sharing one root layout
- `components/site/` — the page sections (Header, Hero, About, Services, Brands, WhyUs,
  Gallery, Contact, Footer) plus `FigmaCanvas` (the responsive scaling wrapper) and the
  contact modal
- `lib/content/` — typed per-locale copy (`ku.ts`, `ar.ts`) consumed by every section component
- `app/api/contact/route.ts` — validates (Zod) and persists contact form submissions
- `prisma/schema.prisma` — `ContactSubmission` model
- `public/assets/` — images/icons exported from Figma

## Design fidelity notes

- The design is a fixed 1440px desktop frame with no responsive breakpoints defined in
  Figma. `FigmaCanvas` renders the exact 1440-wide/6058-tall canvas and scales it uniformly
  to fit the viewport (like Figma's own "fit" zoom), so pixel ratios stay correct at every
  screen size instead of drifting into an invented responsive layout.
- The Figma file contains two frames: `Desktop - 2` (Kurdish, visible) and `Desktop - 1`
  (Arabic, marked hidden in Figma — an earlier/alternate draft with slightly different
  hand-tuned spacing and font sizes in a few sections). Both locales here share the
  `Desktop - 2` layout and styling, verified pixel-for-pixel via Figma's own screenshot
  tool, with only the copy swapped for `/ar`. This was a deliberate call: the hidden frame
  reads as superseded, so pixel-matching a stale draft would be verifying the wrong thing.
- The Figma design has no input-field contact form — only a "message us" call-to-action.
  The modal form (name/email/phone/message) is a necessary addition to make the CTA
  functional, styled to match the site's palette.
- The header's `العربية` / `ENGLISH` language-switch button is reused as a `/ku` ↔ `/ar`
  toggle. No English frame exists in the design, so the hidden frame's "ENGLISH" label
  (which had no working destination) was replaced with the Kurdish label instead.

## Verifying against Figma

Re-fetch the reference screenshot at any time with the Figma MCP `get_screenshot` tool on
node `2:106` (file `Tf75R2z4aWzgtEx0yUqde7`) and compare against `/ku` at 1440px viewport
width (scale = 1 at that width, so it renders unscaled).
