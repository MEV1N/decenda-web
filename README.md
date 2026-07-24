# DECENDA CTF Platform

DECENDA is a custom Capture The Flag (CTF) platform designed for immersive storytelling and forensic challenges.

## Architecture Overview

The project is built as a full-stack web application:

- **Frontend**: React with Vite, styled with Tailwind CSS.
- **Backend**: Node.js with Express.
- **Database**: PostgreSQL managed via Prisma ORM.
- **Authentication**: JWT-based authentication for teams and admins.

## Key Directories & Files

### `/src` (Frontend)
- **`App.tsx`**: Main application component with routing logic.
- **`api.ts`**: Axios instance for centralized API communication.
- **`pages/`**:
  - **`Map.tsx`**: The main game interface showing locations and progress.
  - **`Location.tsx`**: Detailed view for a specific location, showing its challenges and case files.
  - **`Admin.tsx`**: Admin dashboard for managing challenges, locations, and teams.
  - **`Leaderboard.tsx`**: Real-time team rankings.
- **`context/`**: Auth and Toast contexts for global state management.

### `/server` (Backend)
- **`server.ts`**: Entry point for the Express server.
- **`routes/`**:
  - **`admin.ts`**: Protected routes for administrative tasks (challenge/hint CRUD).
  - **`game.ts`**: Game logic routes (fetching locations, submitting flags).
  - **`auth.ts`**: Team registration and login logic.
- **`middleware/`**: JWT authentication and role-based access control.
- **`uploads/`**: Local storage for uploaded challenge files and thumbnails.

### `/prisma`
- **`schema.prisma`**: Defines the database models (`Team`, `Challenge`, `Hint`, `LiveChallenge`, etc.).

## Major Features Implemented

1.  **Immersive Map Interface**: Dynamic unlocking of locations based on challenge completion.
2.  **Story & Live Challenges**: 
    *   **Story Challenges**: Tied to specific map locations; build the core narrative.
    *   **Live Challenges (Case Files)**: Global challenges accessible from the sidebar.
3.  **Comprehensive Admin Panel**:
    *   Full CRUD for both Story and Live challenges.
    *   **File Management**: Upload, replace, and delete challenge files.
    *   **Thumbnail Support**: Custom thumbnails for challenges for better visual feedback.
    *   **Hint System**: Admin can add multiple hints per challenge with specific point penalties.
    *   **Malfunction Toggle**: Option to "Lock" a challenge for maintenance, displaying a custom message to players.
4.  **Admin Bypass**: Admin team (`Dec@2k26#AdMins!`) can access all locations and challenges regardless of lock status.
5.  **Forensic Narratives**: Rich storytelling integrated into challenge descriptions and case files.

## Running the Project

1.  **Install Dependencies**: `npm install` (both root and potentially in server if separated).
2.  **Database Setup**: 
    *   Copy `.env.example` to `.env` and configure `DATABASE_URL`.
    *   Run `npx prisma db push` to sync schema.
    *   Optional: `npx ts-node server/seed.ts` to populate initial data.
3.  **Start Development Server**: `npm run dev`
4.  **Access Admin**: Join with code `Dec@2k26#AdMins!` to gain administrative privileges.
