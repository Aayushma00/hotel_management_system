# Hotel Management System (HMS) + Next-Day Booking Forecast (Student Project)

This repo matches your synopsis: a simple web-based Hotel Management System with:
- Staff login (basic)
- Rooms / Guests / Bookings CRUD (Create, Read, Update, Delete)
- Dashboard stats (today bookings, occupancy, etc.)
- Forecasting microservice (Flask) that predicts *tomorrow's* bookings using Prophet (if available) or a simple moving-average fallback.

## 1) What you need installed
- Node.js 18+ (for backend + frontend)
- Python 3.9+ (for ML service)
- Git (optional)

## 2) Project structure
- `backend/`  -> Express API + SQLite database
- `frontend/` -> React (Vite) UI
- `ml_service/` -> Flask microservice for forecasting
- `docker-compose.yml` (optional) run all services with Docker

---

## 3) Run WITHOUT Docker (recommended for beginners)

### A) Backend (Express + SQLite)
```bash
cd backend
npm install
npm run db:init
npm run seed
npm run dev
```
Backend runs at: http://localhost:4000

### B) ML Service (Flask)
Open a new terminal:
```bash
cd ml_service
python -m venv .venv
# Windows:
# .venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate
pip install -r requirements.txt
python app.py
```
ML service runs at: http://localhost:5001

### C) Frontend (React)
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

Login:
- username: `admin`
- password: `admin123`

---

## 4) Quick explanation (super simple)
- Frontend (React) = the screens you click.
- Backend (Express) = receives requests from frontend and talks to the database.
- Database (SQLite) = stores rooms, guests, bookings.
- ML Service (Flask) = predicts tomorrow bookings.
- Backend calls ML Service when you open the dashboard forecast card.

---

## 5) API URLs (backend)
- `POST /api/auth/login`
- `GET /api/rooms` | `POST /api/rooms` | `PUT /api/rooms/:id` | `DELETE /api/rooms/:id`
- `GET /api/guests` | `POST /api/guests` | `PUT /api/guests/:id` | `DELETE /api/guests/:id`
- `GET /api/bookings` | `POST /api/bookings` | `PUT /api/bookings/:id` | `DELETE /api/bookings/:id`
- `GET /api/dashboard/summary`
- `GET /api/forecast/tomorrow`

---

## 6) Common problems
### Port already used
Change ports in:
- backend: `backend/.env`
- ml: `ml_service/app.py`
- frontend: `frontend/.env`

### Prophet install fails
This project will still work because the ML service falls back to a moving-average model.
To try Prophet, install:
```bash
pip install prophet
```

---


