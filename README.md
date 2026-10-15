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

   Visit [http://localhost:3009](http://localhost:3009) — it redirects to `/ku`.

Environment variables live in `.env` (see `.env.example`). Besides `DATABASE_URL`, the admin
dashboard needs `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` (32+ characters,
e.g. `openssl rand -base64 48`); `/admin/login` tells you which ones are missing.

## Product catalog + admin dashboard

- **Public pages** (`/{ku,ar,en}/products`, `/…/products/[category]`, `/…/products/[category]/[product]`)
  render at request time from the database (`lib/catalog/data.ts` calls `connection()`), so the
  build never needs a database. Unpublished products 404; a product URL with the wrong category
  redirects to the right one. Empty translations fall back to ar → ku → en.
- **Admin** (`/admin`, Arabic RTL, `noindex`) manages categories, products, product images and
  certificate PDFs. Login is `ADMIN_EMAIL` / `ADMIN_PASSWORD`; the session is an HMAC-signed
  httpOnly cookie (7 days), login attempts are rate-limited. `proxy.ts` guards `/admin/*`, and every
  admin page, Server Action and upload route checks the session again.
- **Uploads** go through route handlers (`/api/admin/uploads/image|certificate`, outside the proxy
  matcher so large bodies aren't truncated). Images are rotated, resized to ≤1600px and stored as
  WebP (max 15MB); PDFs are checked for the `%PDF-` header (max 20MB). Files are written to
  `UPLOAD_DIR` (default `./storage/uploads`, git-ignored) and served by `app/uploads/[...path]/route.ts`
  with immutable caching.
- **Schema:** `Category`, `Product`, `ProductImage`, `Certificate` in `prisma/schema.prisma`. The
  `…_catalog` migration also seeds the 4 categories (names, icons, colors; descriptions are left empty
  to be written from `/admin`).

## Deployment (Docker Compose)

```bash
# 1. Set POSTGRES_*, DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET
cp .env.production.example .env

# 2. Build and start. The `migrate` service runs first on every `up` (applies pending database
#    migrations; the first run creates the tables and seeds the categories) and the app starts
#    only after it succeeds. If it fails, `docker compose logs migrate` shows why.
docker compose up -d --build
```

Uploaded files live in the `idvet_uploads` volume (mounted at `/app/storage/uploads`); back it up
together with the database. `.env` is excluded from the image (`.dockerignore`), so secrets only
ever come from the container environment.

## Project structure

- `app/[locale]/` — the locale routes (`ku`, `ar`, `en`), sharing one root layout; `products/` holds
  the catalog pages
- `app/admin/` — the admin dashboard (its own root layout) and its Server Actions (`actions.ts`)
- `app/api/admin/uploads/` — image and certificate upload route handlers; `app/uploads/` serves files
- `components/site/products/` — catalog UI; `components/admin/` — dashboard UI
- `lib/catalog/` — public data layer, translation fallback, brand logos/countries, formatting
- `lib/admin/` — session/token, rate limiting, form helpers, admin queries; `lib/storage.ts` — uploads
- `components/site/` — the page sections (Header, Hero, About, Services, Brands, WhyUs,
  Gallery, Contact, Footer) plus `FigmaCanvas` (the responsive scaling wrapper) and the
  contact modal
- `lib/content/` — typed per-locale copy (`ku.ts`, `ar.ts`) consumed by every section component
- `app/api/contact/route.ts` — validates (Zod) and persists contact form submissions
- `prisma/schema.prisma` — `ContactMessage`, `QuoteRequest`, `Category`, `Product`, `ProductImage`, `Certificate`
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
