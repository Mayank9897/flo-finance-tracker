# Flo Finance Tracker

Flo is a full-stack personal finance dashboard for tracking income, expenses, monthly budgets, and spending analytics. It uses a polished black-and-neutral Shadcn-inspired interface designed for a clear, resume-ready product experience.

## Features

- JWT authentication with sign in and registration
- Indian rupee (INR) currency formatting
- Dashboard summary for balance, income, expenses, and savings rate
- Transaction creation, deletion, search, and income/expense filtering
- Monthly category budgets with live spending progress
- Spending analytics and monthly cash-flow visualization
- Responsive desktop sidebar and mobile navigation
- JSON persistence for simple local and demo deployments
- Local fallback mode for frontend preview when the API is unavailable

## Tech Stack

### Frontend

- React 18
- Vite
- Lucide React icons
- CSS design tokens and responsive CSS
- Fetch API for backend communication
- `Intl.NumberFormat` for Indian currency formatting

### Backend

- Node.js
- Express.js
- JWT via `jsonwebtoken`
- Password hashing via `bcryptjs`
- CORS via `cors`
- Environment configuration via `dotenv`
- JSON file persistence using Node.js `fs`

## Project Structure

```text
flo-finance-tracker/
├── backend/
│   ├── config/db.js
│   ├── server.js
│   ├── utils/jwt.js
│   ├── utils/password.js
│   └── package.json
├── frontend/
│   ├── src/App.jsx
│   ├── src/services/api.js
│   ├── src/styles/index.css
│   ├── vite.config.js
│   └── package.json
├── flo_data.json
└── package.json
```

## Local Development

Prerequisites: Node.js 18 or newer and npm.

Install dependencies:

```powershell
npm run install:all
```

Start the backend:

```powershell
cd backend
npm start
```

Start the frontend in a second terminal:

```powershell
cd frontend
npm run dev
```

Open `http://localhost:5173`.

The API runs at `http://localhost:5000`. Its health endpoint is `http://localhost:5000/api/health`.

Demo login:

```text
Email: mayank@gmail.com
Password: demo
```

## Environment Variables

Copy the example files before deployment:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Backend `.env`:

```env
PORT=5000
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
```

Frontend `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, set `VITE_API_URL` to the deployed backend URL ending in `/api`, and set `CLIENT_URL` to the deployed frontend URL.

## API Overview

Public endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/health`

Protected endpoints require `Authorization: Bearer <token>`:

- `GET /api/auth/me`
- `GET|POST|DELETE /api/transactions`
- `GET|POST /api/budgets`
- `GET /api/analytics/summary`
- `GET /api/analytics/categories`
- `GET /api/analytics/monthly-trend`

## Production Deployment

### Backend on Render

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Add `JWT_SECRET` and `CLIENT_URL` environment variables

### Frontend on Vercel

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Add `VITE_API_URL=https://your-backend-domain.com/api`

## Validation

```powershell
cd frontend
npm run build

cd ..\backend
node --check server.js
```

The backend uses `flo_data.json` for persistence. This is convenient for a portfolio or resume demo, but a production application should use a managed database such as PostgreSQL or MongoDB because some hosting platforms do not persist local files between deployments.