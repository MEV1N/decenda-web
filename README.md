# DECENDA — CTF Platform

A narrative-driven, mystery-themed Capture The Flag (CTF) web platform set in the world of **"The Shepherd Case"**. Teams investigate crime scenes, collect evidence (challenges), submit flags, and unlock new locations in a graph-based progression system.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
  - [Root Files](#root-files)
  - [Prisma — Database Layer](#prisma--database-layer)
  - [Server — Backend](#server--backend)
  - [Frontend Source — `src/`](#frontend-source--src)
  - [Public Assets](#public-assets)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Game Progression Logic](#game-progression-logic)
- [Flag Format](#flag-format)
- [Challenge Locations](#challenge-locations)

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│              Browser (React SPA)            │
│  Vite + React + TailwindCSS + Framer Motion │
└──────────────────┬──────────────────────────┘
                   │ HTTP (Axios)
┌──────────────────▼──────────────────────────┐
│          Express.js API Server              │
│  Port 3000 · JWT Auth · Prisma ORM          │
└──────────────────┬──────────────────────────┘
                   │ Prisma Client
┌──────────────────▼──────────────────────────┐
│           PostgreSQL Database               │
│  (Hosted on Neon / local Docker)            │
└─────────────────────────────────────────────┘
```

- The **Express server** both serves the API (`/api/*`) and the compiled React static files.
- The **React SPA** communicates over Axios with a JWT token stored in `localStorage`.
- **Prisma ORM** manages all database queries and migrations.

---

## Tech Stack

| Layer      | Technology                                 |
|------------|--------------------------------------------|
| Frontend   | React 19, TypeScript, Vite, TailwindCSS 3  |
| Animations | Framer Motion                              |
| HTTP       | Axios                                      |
| Backend    | Express.js, TypeScript, tsx (hot reload)   |
| Auth       | JSON Web Tokens (JWT), bcryptjs            |
| Database   | PostgreSQL via Prisma ORM                  |
| Dev Tools  | concurrently, ESLint, tsx watch            |

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Docker — see `docker-compose.yml`)

### Installation

```bash
# Install all dependencies
npm install

# Set up the database (copy .env and fill in DATABASE_URL)
cp .env.example .env

# Push the Prisma schema to the database
npm run db:push

# Seed the database with locations and challenges
npm run db:seed

# Run both frontend (port 5173) and backend (port 3000) concurrently
npm run dev
```

### Available Scripts

| Script          | Description                                       |
|-----------------|---------------------------------------------------|
| `npm run dev`   | Runs both server and client concurrently          |
| `npm run dev:server` | Runs only the Express server with hot reload |
| `npm run dev:client` | Runs only the Vite frontend dev server       |
| `npm run build` | Compiles TypeScript and builds the Vite bundle    |
| `npm run db:push` | Applies Prisma schema changes to the database  |
| `npm run db:seed` | Seeds the database with all locations and challenges |

---

## Project Structure

```
Decenta/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   ├── paper.txt              # Downloadable CTF hint file (The Ritual)
│   └── vite.svg               # Vite default asset
├── server/
│   ├── middleware/
│   │   └── auth.ts            # JWT authentication middleware
│   ├── routes/
│   │   ├── admin.ts           # Admin-only CRUD routes
│   │   ├── auth.ts            # Team create/join routes
│   │   ├── game.ts            # Core game logic routes
│   │   └── leaderboard.ts     # Leaderboard route
│   ├── check.ts               # Database connectivity check utility
│   ├── seed.ts                # Database seeder (all locations + challenges)
│   └── server.ts              # Express app entry point
├── src/
│   ├── context/
│   │   ├── AuthContext.tsx    # Global auth state (team, token, login, logout)
│   │   └── ToastContext.tsx   # Global toast notification system
│   ├── pages/
│   │   ├── Leaderboard.tsx    # Global rankings table
│   │   ├── Location.tsx       # Location detail + challenge modal
│   │   ├── Login.tsx          # Team create / join page
│   │   ├── Map.tsx            # Investigation Board (location grid)
│   │   └── Register.tsx       # Legacy user register page (unused in current flow)
│   ├── App.css                # App-level animations/overrides
│   ├── App.tsx                # Root component, router, layout, header
│   ├── api.ts                 # Axios instance with base URL and JWT interceptor
│   ├── index.css              # Global CSS (Tailwind directives, custom vars)
│   └── main.tsx               # React DOM entry point
├── .env                       # Environment variables (DATABASE_URL, JWT_SECRET)
├── .gitignore                 # Git ignore rules
├── check_db.ts                # Root-level DB check script
├── DEPLOYMENT.md              # Deployment instructions
├── docker-compose.yml         # Docker Compose config for local PostgreSQL
├── eslint.config.js           # ESLint configuration
├── index.html                 # Vite HTML entry point
├── package.json               # NPM scripts and dependencies
├── postcss.config.js          # PostCSS config (required for Tailwind)
├── tailwind.config.js         # Tailwind CSS configuration + custom tokens
├── tsconfig.app.json          # TypeScript config for the frontend (src/)
├── tsconfig.json              # Root TypeScript config
├── tsconfig.node.json         # TypeScript config for server/vite config files
└── vite.config.ts             # Vite bundler configuration
```

---

## Root Files

### `.env`
Environment variables loaded by `dotenv`. Must include:
```
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=your-secret-key
PORT=3000
VITE_API_URL=http://localhost:3000/api
```

### `.gitignore`
Standard Node.js gitignore — excludes `node_modules/`, `.env`, `dist/`, and build artifacts.

### `check_db.ts`
A standalone TypeScript script at the project root that connects to the database via Prisma and logs a success/failure message. Used for quick connectivity checks during setup.

### `DEPLOYMENT.md`
Documents how to deploy the platform to a production environment, including build steps, environment variable setup, and server configuration.

### `docker-compose.yml`
Defines a local PostgreSQL service for development. Run with `docker-compose up -d` to spin up a local database without needing a cloud provider.

```yaml
# Exposes PostgreSQL on port 5432 with credentials for local dev
```

### `eslint.config.js`
ESLint configuration using the flat config format. Enables TypeScript-aware linting rules via `@typescript-eslint` and React-specific lint rules.

### `index.html`
The HTML shell for the Vite React app. Contains the `<div id="root">` mount point and the `<script type="module" src="/src/main.tsx">` entry reference.

### `package.json`
Defines all npm scripts, runtime dependencies, and dev dependencies. Key entries:
- `"type": "module"` — project uses ES modules throughout
- Scripts: `dev`, `dev:server`, `dev:client`, `build`, `db:push`, `db:seed`

### `package-lock.json`
Auto-generated npm lockfile. Ensures reproducible installs.

### `postcss.config.js`
Required by Tailwind CSS. Registers `tailwindcss` and `autoprefixer` as PostCSS plugins.

### `tailwind.config.js`
Tailwind configuration with custom design tokens used throughout the app:
- **`font-heading`** — display typeface for titles
- **`font-body`** — body/paragraph typeface
- **`text-accent`** — primary red accent color
- **`text-dimmed`** — muted zinc text
- **`bg-background`** — page background color
- **`bg-foreground`** — foreground surface color

### `tsconfig.json`
Root TypeScript config. References `tsconfig.app.json` (frontend) and `tsconfig.node.json` (server/configs).

### `tsconfig.app.json`
TypeScript config for `src/` (the React frontend). Targets ES2020, enables JSX, strict mode, and path aliases.

### `tsconfig.node.json`
TypeScript config for server-side files and Vite's config itself. Uses `bundler` module resolution.

### `vite.config.ts`
Vite bundler configuration. Uses `@vitejs/plugin-react` for fast React HMR. Proxies are not configured — the API URL is set via `VITE_API_URL` env variable.

---

## Prisma — Database Layer

### `prisma/schema.prisma`
The single source of truth for the database structure. Defines all models:

| Model              | Description                                                    |
|--------------------|----------------------------------------------------------------|
| `Team`             | A CTF team with name, password hash, invite code, points, role |
| `Role` (enum)      | `PLAYER` or `ADMIN`                                            |
| `Location`         | A crime scene / investigation node on the map                  |
| `Challenge`        | A CTF challenge (evidence) belonging to a location             |
| `Solve`            | Records when a team solves a challenge (many-to-many join)     |
| `UnlockedLocation` | Tracks which locations are accessible for each team            |
| `Hint`             | Optional hints attached to challenges (penalty-based)          |

**Key relationships:**
- A `Team` has many `Solve`s and many `UnlockedLocation`s
- A `Location` has many `Challenge`s
- A `Challenge` stores `unlocksLocations` (String array) — IDs of locations unlocked when this challenge is solved
- `unlocksPoints` (Boolean) — controls whether points are awarded on solve

---

## Server — Backend

### `server/server.ts`
**Express application entry point.** Responsibilities:
- Creates and exports the `PrismaClient` instance (`export const prisma`)
- Loads `.env` via `dotenv`
- Configures CORS for `http://localhost:5173` (Vite dev server)
- Mounts all routers under `/api/*`
- Serves compiled React static files from `/dist` for production
- Catch-all route sends `index.html` for React Router to handle client-side routing

**Mounts:**
```
/api/auth        → auth.ts router
/api/game        → game.ts router
/api/leaderboard → leaderboard.ts router
/api/admin       → admin.ts router
/api/health      → inline health check endpoint
```

### `server/seed.ts`
**Database seeder.** Drops all existing data (solves, hints, challenges, locations) and re-seeds from scratch.

- Defines `LOCATIONS` array — 12 crime scene locations
- Defines `CHALLENGES` array — 57 CTF challenges across all locations
- Stores flags as **plain text** in the `flag_hash` column (no hashing)
- Each challenge includes `unlocksLocations` — an array of location IDs unlocked on solve
- The prologue location has 5 challenges worth 0 points each (narrative only)
- Other challenges range from 5 to 1000 points

### `server/check.ts`
Small diagnostic script that queries the database to verify the Prisma connection is healthy. Logs the number of teams found. Used during development to confirm DB connectivity before running the full server.

---

### `server/middleware/auth.ts`
**JWT authentication middleware.**

- Exports `AuthRequest` interface — extends Express `Request` with `team?: { teamId: string; role: string }`
- `authenticate` middleware: reads `Authorization: Bearer <token>` header, verifies with `JWT_SECRET`, attaches decoded payload to `req.team`
- `requireAdmin` middleware: checks `req.team.role === 'ADMIN'`, returns 403 otherwise
- Used as route-level middleware in all protected routes

---

### `server/routes/auth.ts`
**Team authentication routes.** (`/api/auth/*`)

| Method | Path           | Description                                                   |
|--------|----------------|---------------------------------------------------------------|
| POST   | `/auth/create` | Creates a new team (name + password). Returns JWT + team data |
| POST   | `/auth/join`   | Joins an existing team using a 6-digit invite code. Returns JWT |

**Behaviour:**
- `create`: hashes password with `bcryptjs` (10 rounds), generates a unique 6-digit `invite_code`, creates `Team` record, returns JWT signed with `{ teamId, role }`
- `join`: looks up team by `invite_code`, enforces max team size of 2, increments `members_count`, returns JWT
- Both routes return a JWT with `expiresIn: '24h'`

---

### `server/routes/game.ts`
**Core game logic routes.** (`/api/game/*`) — All routes require `authenticate` middleware.

| Method | Path                  | Description                                                    |
|--------|-----------------------|----------------------------------------------------------------|
| GET    | `/game/map`           | Returns all locations with unlocked status for the team        |
| GET    | `/game/location/:id`  | Returns location details + challenges (solved status per team) |
| POST   | `/game/submit-flag`   | Validates a submitted flag and records the solve               |
| POST   | `/game/prologue`      | Marks the team as having seen the prologue                     |

**`/game/map` detail:**
- Fetches all locations from DB
- Returns each location with `unlocked: true/false` based on team's `UnlockedLocation` records and `is_starting` flag
- Also returns `edges` (source→target unlock relationships) derived from challenge `unlocksLocations`

**`/game/location/:id` detail:**
- Checks location exists; if not `is_starting`, verifies team has unlocked it
- Returns challenges formatted with `solved` boolean (based on team's `Solve` records)
- Never returns raw `flag_hash` to the client

**`/game/submit-flag` detail:**
- Validates `teamId` exists in JWT (returns 401 if missing/stale token)
- Fetches challenge by `challengeId`
- Compares `flag === challenge.flag_hash` (plain text comparison)
- Creates a `Solve` record
- Awards points if `challenge.unlocksPoints && challenge.points > 0`
- Unlocks new locations listed in `challenge.unlocksLocations`
- Points and unlock operations are individually try/caught — a failure there won't prevent the solve from being recorded

---

### `server/routes/leaderboard.ts`
**Leaderboard route.** (`/api/leaderboard`) — Public, no auth required.

- Fetches all `PLAYER` teams with their solve count and last solve timestamp
- Sorts by: **points DESC**, then **last solve timestamp ASC** (earlier = better tiebreaker)
- Returns ranked list: `{ rank, id, name, points, solvesCount, lastSolve }`

---

### `server/routes/admin.ts`
**Admin management routes.** (`/api/admin/*`) — Requires both `authenticate` and `requireAdmin`.

| Method | Path                 | Description                              |
|--------|----------------------|------------------------------------------|
| POST   | `/admin/location`    | Create or update a location (upsert)     |
| POST   | `/admin/challenge`   | Create or update a challenge (upsert)    |

Used to modify game content without reseeding. Only accessible to teams with `role: 'ADMIN'`.

---

## Frontend Source — `src/`

### `src/main.tsx`
React DOM entry point. Calls `ReactDOM.createRoot(...).render(<App />)`. Imports `index.css` for global styles.

### `src/index.css`
Global stylesheet. Contains:
- `@tailwind base/components/utilities` directives
- CSS custom properties for the design system (colors, fonts)
- Custom utility classes like `.glow-hover`, `.custom-scrollbar`

### `src/App.css`
Additional app-level CSS for animations and keyframes not covered by Tailwind utilities.

### `src/api.ts`
**Axios HTTP client singleton.**
- Base URL: `VITE_API_URL` env var, falls back to `http://localhost:3000/api`
- **Request interceptor**: automatically reads JWT from `localStorage` and attaches it as `Authorization: Bearer <token>` header on every outgoing request
- Exported as default — imported by all pages/contexts that make API calls

---

### `src/App.tsx`
**Root React component and application shell.**

- Wraps everything in `AuthProvider` → `ToastProvider` → `BrowserRouter`
- `MainLayout` component renders:
  - **Header**: DECENDA title, team invite code (hover-to-reveal), Leaderboard link, Logout button
  - **Routes**: `/login`, `/` (Map), `/location/:id`, `/leaderboard`
  - **Vignette overlay**: fixed full-screen shadow for the atmospheric dark aesthetic
- `ProtectedRoute` component: redirects unauthenticated users to `/login`

---

### `src/context/AuthContext.tsx`
**Global authentication state provider.**

- Stores `team` object and `token` string in both React state and `localStorage`
- On mount, restores session from `localStorage`; detects and clears stale sessions missing `invite_code`
- Sets `api.defaults.headers.common['Authorization']` when token is present
- Exports:
  - `AuthProvider` — wraps the app
  - `useAuth()` — hook returning `{ team, token, login, logout, isAuthenticated }`
- `login(token, team)` — saves to localStorage + state
- `logout()` — clears localStorage + state, redirects to `/login`

---

### `src/context/ToastContext.tsx`
**Global toast notification system.**

- Uses Framer Motion `AnimatePresence` for smooth slide-in/fade-out animations
- Toasts auto-dismiss after 5 seconds
- Supports 4 types: `success` (green), `error` (red), `warning` (yellow), `info` (zinc)
- Themed labels: `success` → "New Lead Found", `info` → "System Alert"
- Toasts stack in the bottom-right corner
- Exports:
  - `ToastProvider` — wraps the app
  - `useToast()` — hook returning `{ addToast(message, type) }`

---

### `src/pages/Login.tsx`
**Team entry page.** Route: `/login`

Two-tab interface — **Create** and **Join**:
- **Create tab**: team name + password → `POST /api/auth/create`
- **Join tab**: 6-digit invite code → `POST /api/auth/join`
- On success: saves token/team via `useAuth().login()`, navigates to `/`
- Error messages displayed inline below the tabs

---

### `src/pages/Register.tsx`
**Legacy registration page.** Route: not actively routed in the current `App.tsx`.

Originally a simple user registration form (`username` + `password`) calling `POST /api/auth/register`. Superseded by the team-based `Login.tsx` flow. Kept in the codebase for reference.

---

### `src/pages/Map.tsx`
**Investigation Board.** Route: `/` (protected)

- Fetches all locations from `GET /api/game/map` on mount
- Filters out `prologue` from the main grid (it has its own dedicated button)
- Sorts locations: unlocked first
- Renders:
  - **"Access Prologue (CSP #112)"** button — navigates to `/location/prologue`
  - **Unlocked locations**: green border, clickable cards → navigate to `/location/:id`
  - **Locked locations**: red border, 50% opacity, cursor-not-allowed; clicking shows a toast warning
- Uses Framer Motion staggered fade-in animations for cards

---

### `src/pages/Location.tsx`
**Location detail and challenge modal.** Route: `/location/:id` (protected)

- Fetches location info and challenges from `GET /api/game/location/:id`
- Displays location name, description, and a grid of evidence cards
- Solved challenges shown in green; unsolved in default dark style
- Clicking a card opens an **animated modal** (Framer Motion `AnimatePresence`):

**Challenge Modal contents:**
- Challenge title (red accent, uppercase)
- **Special block for "The Ritual"** (always visible, regardless of solved state):
  - Parchment-styled narrative block (dark red background, red borders)
  - Blockquoted inscription with the encoding instructions
  - Python code snippet showing the encoding algorithm
  - Closing narrative lines
  - **📄 paper** download link → downloads `/paper.txt`
- **Solved state**:
  - For "The Ritual": shows the story reveal in styled parchment (white + red text)
  - For all other challenges: shows `activeChallenge.description` as plain text
- **Unsolved state** (non-Ritual): shows `[ EVIDENCE ENCRYPTED ]` placeholder
- Flag input field + Submit button → `POST /api/game/submit-flag`
- On correct flag: marks solved, shows "EVIDENCE ANALYZED" banner, triggers unlock toast if new locations opened

---

### `src/pages/Leaderboard.tsx`
**Global rankings page.** Route: `/leaderboard` (protected)

- Fetches ranked team data from `GET /api/leaderboard`
- Displays a styled monospace table with columns: Rank, Team Name, Score, Solves, Last Activity
- Alternating row backgrounds; red hover highlight
- Shows "No cleared agents found in the system." when empty
- "Return to Board" button navigates back to `/`

---

## Public Assets

### `public/paper.txt`
A downloadable hint file for **The Ritual** challenge in the Prologue. Contains the encoded string:

```
摥捻瑨㍟眴硟氳摟琰彨業䁭扣瑦素
```

This is the CTF challenge output — players must reverse the Python encoding described in the challenge to decode the flag. The file is served at `/paper.txt` and downloaded via the 📄 paper button in the challenge modal.

### `public/vite.svg`
Default Vite project logo. Not actively used in the interface.

---

## Database Schema

### Teams
```
id            UUID (PK)
name          String (unique)
password_hash String
invite_code   String (unique, 6 digits)
members_count Int (1 or 2)
has_seen_prologue Boolean
role          PLAYER | ADMIN
points        Int (accumulated from solves)
created_at    DateTime
```

### Locations
```
id          String (PK, human-readable slug e.g. "old_garage")
name        String
description String
is_starting Boolean (true = visible from day 1)
```

### Challenges
```
id                String (PK)
location_id       String (FK → Location)
title             String
description       String (shown after solving)
flag_hash         String (plain text flag, e.g. dec{...})
points            Int
instance_required Boolean
unlocksPoints     Boolean
unlocksLocations  String[] (location IDs unlocked on solve)
```

### Solves
```
id           UUID
team_id      String (FK → Team)
challenge_id String (FK → Challenge)
solved_at    DateTime
UNIQUE(team_id, challenge_id)
```

### UnlockedLocations
```
id          UUID
team_id     String (FK → Team)
location_id String (FK → Location)
unlocked_at DateTime
UNIQUE(team_id, location_id)
```

### Hints
```
id             UUID
challenge_id   String (FK → Challenge)
hint_text      String
penalty_points Int (default 10)
```

---

## API Reference

| Method | Endpoint                    | Auth     | Description                          |
|--------|-----------------------------|----------|--------------------------------------|
| POST   | `/api/auth/create`          | None     | Create a team                        |
| POST   | `/api/auth/join`            | None     | Join a team via invite code          |
| GET    | `/api/game/map`             | JWT      | Get all locations with unlock status |
| GET    | `/api/game/location/:id`    | JWT      | Get location details + challenges    |
| POST   | `/api/game/submit-flag`     | JWT      | Submit a flag for a challenge        |
| POST   | `/api/game/prologue`        | JWT      | Mark prologue as seen                |
| GET    | `/api/leaderboard`          | JWT      | Get ranked team list                 |
| POST   | `/api/admin/location`       | JWT+Admin| Upsert a location                    |
| POST   | `/api/admin/challenge`      | JWT+Admin| Upsert a challenge                   |
| GET    | `/api/health`               | None     | Server health check                  |

---

## Game Progression Logic

Locations are unlocked through a **directed graph** — solving a challenge can unlock one or more new locations:

```
OLD GARAGE ──[garage_hammer]──→ POLICE ANNEX
           ──[garage_boot]───→ DRAINAGE PIT
           ──[garage_nail]───→ RESIDENTIAL ALLEY
           ──[garage_oil]────→ TRAM STATION

DRAINAGE PIT ──[drainage_boot]──→ RIVERSIDE WALKWAY
             ──[drainage_shoe]──→ TOWN
             ──[drainage_pill]──→ CLINIC
             ...

(and so on through all 12 locations)
```

Starting locations (visible from login): **OLD GARAGE**, **DRAINAGE PIT**, **RESIDENTIAL ALLEY**, and the **PROLOGUE**.

---

## Flag Format

All flags follow the format:
```
dec{content@mbc.ctf}
```

Examples:
- `dec{th3_w4x_l3d_t0_him@mbc.ctf}` — The Ritual (Prologue)
- `dec{tru5t_w4s_th3_w34pon@mbc.ctf}` — The Fourth Body (Prologue)
- `dec{garage_hammer}` — Hammer with blood (Old Garage)
- `dec{somnarch}` — Final Verdict (Your House)

Flags stored as plain text in the database. Comparison is a direct string equality check on the server.

---

## Challenge Locations

| Location             | Starting | Challenges | Notable Unlocks                     |
|----------------------|----------|------------|-------------------------------------|
| PROLOGUE: CSP #112   | ✅       | 5 (0 pts)  | Narrative only                      |
| OLD GARAGE           | ✅       | 7          | Police Annex, Drainage Pit, Alley   |
| DRAINAGE PIT         | ✅       | 9          | Riverside, Town, Clinic, Tram       |
| RESIDENTIAL ALLEY    | ✅       | 7          | Town, Clinic                        |
| RIVERSIDE WALKWAY    | 🔒       | 4          | Detective's Office                  |
| DETECTIVE'S OFFICE   | 🔒       | 7          | Tram, Town, Your House, Police Annex|
| TOWN                 | 🔒       | 3          | Your House                          |
| GRAVENFALL POLICE ANNEX | 🔒    | 4          | Tram, Clinic, Your House            |
| CLINIC               | 🔒       | 6          | Alley, Your Car, Your House, Annex  |
| TRAM STATION         | 🔒       | 4          | Clinic                              |
| YOUR CAR             | 🔒       | 3          | Clinic, Detective's Office          |
| YOUR HOUSE           | 🔒       | 7 (Final)  | Final Verdict (1000 pts)            |
