# TechShop Workspace

Monorepo containing a Next.js backend API and a Next.js frontend storefront.

## Apps

- `backend` (port `4000`): API routes, authentication, Prisma, admin-side data operations.
- `frontend` (port `3000`): Customer-facing site that calls backend APIs.

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Prisma + PostgreSQL
- NextAuth (credentials auth)
- Zustand (frontend cart state)
- Tailwind CSS (frontend)

## Project Structure

```text
.
|- backend/
|  |- app/api/
|  |- prisma/
|  |- lib/
|- frontend/
|  |- app/
|  |- components/
|  |- lib/
|- package.json
```

## Prerequisites

- Node.js 18+ (or newer LTS)
- npm 9+
- A running PostgreSQL instance

## Install Dependencies

From workspace root:

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

## Environment Variables

### 1) Backend env file

Create `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/techshop?schema=public"
NEXTAUTH_URL="http://localhost:4000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"

# Optional: needed only for image upload endpoint
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

### 2) Frontend env file

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"
```

## Database Setup

Run:

```bash
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:migrate -- --name init
npm --prefix backend run prisma:seed
```

Seed script creates a default admin user:

- Email: `admin@techshop.com`
- Password: `admin123`

Change this password after first login in non-local environments.

## Run in Development

Start both apps together from root:

```bash
npm run dev
```

Or run separately:

```bash
npm run dev:backend
npm run dev:frontend
```

## Build

Build both apps from root:

```bash
npm run build
```

Build each app individually:

```bash
npm --prefix backend run build
npm --prefix frontend run build
```

## API Routing in Frontend

Frontend rewrites `/api/*` to backend using `NEXT_PUBLIC_API_BASE_URL`.

- If backend runs on another host/port, update `frontend/.env.local`.

## Useful Scripts

Root `package.json`:

- `npm run dev`: run backend and frontend concurrently
- `npm run build`: build backend then frontend
- `npm run dev:backend`: run backend only
- `npm run dev:frontend`: run frontend only

Backend `package.json`:

- `npm --prefix backend run prisma:generate`
- `npm --prefix backend run prisma:migrate`
- `npm --prefix backend run prisma:seed`

---

If you want, this README can be extended with deployment steps (Vercel + managed Postgres) and a route-by-route API reference.
