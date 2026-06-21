# NxtBiz

AI Business Operations Automation Platform built with Spec Driven Development.

## Stack

- **Frontend:** Vite 6, React 18, Tailwind CSS, TanStack Query, Zustand, Socket.IO
- **Backend:** Express, MongoDB, Mongoose, JWT, BullMQ, Redis (optional), PDFKit

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB running locally (or set `MONGODB_URI`)

### Server

```bash
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
```

### Client

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173 and sign in with:

- **Email:** admin@nxtbiz.com
- **Password:** admin123

## Features

- JWT authentication with role-based access (Admin, Manager, Employee, Viewer)
- Customer management and CRM activity timeline
- Email intent analysis and agent orchestration
- Meetings, invoices, tickets, reports with PDF generation
- Workflow automation with BullMQ (Redis optional)
- Live Socket.IO notifications
- Memory search across customer and agent records

## Development Phases

1. Auth, layout, MongoDB connection
2. Core CRUD modules
3. Email intelligence
4. Agent layer and orchestration
5. BullMQ, Socket.IO, workflows
6. PDFs, health scoring, seed data, polish
