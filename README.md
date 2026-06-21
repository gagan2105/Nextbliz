# NxtBiz

AI Business Operations Automation Platform built with Spec Driven Development.

## Project Structure

```
nextbliz/
├── frontend/    # Vite + React operations console
├── backend/     # Express + MongoDB API
└── specs/       # Business rule specifications
```

## Stack

- **Frontend:** Vite 6, React 18, Tailwind CSS, TanStack Query, Zustand, Socket.IO
- **Backend:** Express, MongoDB, Mongoose, JWT, BullMQ, Redis (optional), PDFKit

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB running locally (or set `MONGODB_URI`)

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Or from the project root:

```bash
npm install
npm run dev:backend   # terminal 1
npm run dev:frontend  # terminal 2
```

Open http://localhost:5173 and sign in with:

- **Email:** admin@nxtbiz.com
- **Password:** admin123

## Deployment

| Service  | Folder     | Build              | Start           | Port |
|----------|------------|--------------------|-----------------|------|
| Frontend | `frontend/` | `npm run build`    | serve `dist/`   | 5173 |
| Backend  | `backend/`  | `npm run build`    | `npm start`     | 5000 |

Set these environment variables on the backend:

- `MONGODB_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `CLIENT_URL` (your deployed frontend URL)

Set on the frontend build:

- `VITE_API_URL` (your deployed backend URL)

## Features

- JWT authentication with role-based access (Admin, Manager, Employee, Viewer)
- Customer management and CRM activity timeline
- Email intent analysis and agent orchestration
- Meetings, invoices, tickets, reports with PDF generation
- Workflow automation with BullMQ (Redis optional)
- Live Socket.IO notifications
- Memory search across customer and agent records
