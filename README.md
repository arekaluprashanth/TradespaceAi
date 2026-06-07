# TradeSpace AI 2.0 🚀

TradeSpace AI has been completely transformed into a modern, production-grade fintech platform inspired by unicorns like Groww, Upstox, and Zerodha.

## New Tech Stack
* **Frontend**: Next.js 15, React 19, Tailwind CSS, Framer Motion, Recharts
* **Backend**: Node.js, Express, Socket.io (Realtime)
* **Database**: PostgreSQL / SQLite (Local), Prisma ORM
* **Authentication**: JWT & bcrypt

## Features
1. **Premium Landing Page**: Glassmorphism UI, glowing gradients, Apple-level micro-animations.
2. **Trading Dashboard**: Advanced UI with Portfolio Overview, interactive charts, and live watchlist.
3. **Paper Trading Engine**: A backend engine to simulate buy/sell transactions and track virtual wallet balances.
4. **Realtime Updates**: Socket.io integration streams live simulated price updates to the frontend.
5. **AI Features**: Mock AI endpoints for stock sentiment, portfolio risk analysis, and an AI Chatbot Assistant.

## Getting Started Locally

### 1. Backend Setup
1. `cd backend`
2. `npm install`
3. `npx prisma db push` (This creates the local SQLite database)
4. `npm run dev` (Runs the Node.js server on port 3001)

### 2. Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev` (Runs Next.js on port 3000)

## Folder Structure
* `/frontend`: Next.js 15 App router code (Pages, Components, Styles)
* `/backend`: Node.js Express server, APIs, Prisma Schema, Socket.io
* `/old-client`: The previous static React application (kept for backup)
