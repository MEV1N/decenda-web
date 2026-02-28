# DECENDA Deployment Guide

## Prerequisites
- Docker and Docker Compose (for production/VPS deployment)
- Node.js & npm (for local development)
- PostgreSQL Database (Local or Neon DB)

## Local Development
1. Set your `DATABASE_URL` in `backend/.env`.
2. Run Database Migrations:
   ```bash
   cd backend
   npx prisma db push
   npx tsx src/seed.ts
   ```
3. Start Backend:
   ```bash
   cd backend
   npm run dev
   ```
4. Start Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## Production Deployment (VPS)
1. Ensure your `.env` is configured correctly, or use the `docker-compose.yml` to spin up a local postgres container.
2. Build and run using Docker Compose:
   ```bash
   docker-compose up -d --build
   ```
3. The backend API will be available on port 3000.
4. You will need to build the frontend and serve it using Nginx, pointing API requests to port 3000. Alternatively, you can run the frontend via a process manager like PM2 or serve the static `dist/` folder.
