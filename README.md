# EMI Calculator API + React UI

Node + Express + SQLite backend with a Vite + React UI for calculating and saving loan EMIs. Payment hooks are stubbed for future provider integration.

## Requirements
- Node.js 18+ (tested on 20.x)
- npm

## Backend (root)
- `npm install`
- `npm run dev` — start API with nodemon on port 3000
- `npm run test` — jest unit tests for EMI math
- `npm run lint` — lint TypeScript
- `npm run build` / `npm start` — compile to `dist` and run

### API endpoints
- `POST /api/emi/calculate` — compute EMI + schedule without saving
- `POST /api/loans` — save a loan (SQLite) and return EMI + schedule
- `GET /api/loans` — list saved loans
- `GET /api/loans/:id` — get saved loan with schedule
- `POST /api/loans/:id/payments/initiate` — stubbed payment hook response

## Frontend (`web`)
- `cd web && npm install`
- `npm run dev` — dev server on 5173 with proxy to `http://localhost:3000`
- `npm run build` / `npm run preview`

Configure API base via `VITE_API_URL` (defaults to `http://localhost:3000/api`).

## Data
SQLite database stored at `data/emi.db` (auto-created). Delete the file to reset.
