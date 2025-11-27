# Massage Shop Booking System

Full-stack booking system for massage shops.

## Tech Stack

**Frontend:** React 18 + Vite + Tailwind CSS 4  
**Backend:** Node.js + Express + SQLite

## Quick Start

### Backend
```bash
cd backend
npm install

# Create .env file
echo "PORT=3000" > .env
echo "ADMIN_PASSWORD=demo123" >> .env

npm start
# → http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:3000/api" > .env

npm run dev
# → http://localhost:5173
```

## Features

- Customer booking flow (3 steps)
- Admin dashboard with timeline visualization
- Real-time booking status (8:00-20:00)
- Chinese interface for admin, English for customers

## API Endpoints

**Public:**
- `GET /api/services` - Get all services
- `POST /api/bookings` - Create booking

**Admin:**
- `POST /api/admin/login` - Login
- `GET /api/admin/bookings?date=YYYY-MM-DD` - Get bookings

## Default Login

**Password:** `demo123`

---

Created with Claude Code
