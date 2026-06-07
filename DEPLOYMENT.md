# Production Deployment Guide

Since TradeSpace AI has transitioned from a static GitHub Pages site to a full-stack Next.js and Node.js platform, deployment requires new hosting providers.

## 1. Database (Supabase / Render / Railway)
1. Create a PostgreSQL database on Supabase or Railway.
2. Get the connection URL (e.g., `postgresql://user:password@host:port/db`).
3. Update `backend/prisma/schema.prisma` to use `provider = "postgresql"`.
4. Run `npx prisma db push` or `npx prisma migrate deploy` pointing to your production database URL to create the tables.

## 2. Backend Server (Render / Railway)
1. Create a new Web Service on Render or Railway.
2. Connect it to your GitHub repository and point the root directory to `/backend`.
3. Build Command: `npm install && npx prisma generate && npx tsc`
4. Start Command: `node dist/server.js` (Ensure you compile TypeScript first)
5. Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL URL
   - `JWT_SECRET`: A strong random string for signing auth tokens
   - `PORT`: (Render provides this automatically)

## 3. Frontend Next.js App (Vercel)
1. Create a new project on Vercel.
2. Connect your GitHub repository.
3. Set the **Framework Preset** to Next.js.
4. Set the **Root Directory** to `frontend`.
5. Environment Variables:
   - `NEXT_PUBLIC_API_URL`: The URL of your deployed backend (e.g., `https://tradespace-api.onrender.com/api`)
6. Deploy!

> Note: Because this application requires a running Node.js server, it **cannot** be hosted on GitHub Pages anymore.
