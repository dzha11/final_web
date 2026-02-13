# 🌊 HabitFlow — Habit Tracker App

A full-stack habit tracking application built with **Node.js**, **Express.js**, **MongoDB**, and a modern dark-theme frontend (HTML/CSS/JS with Bootstrap-inspired custom CSS).

---

## 📋 Project Overview

HabitFlow allows users to create and track daily/weekly habits, monitor streaks, visualize progress through analytics, and manage their profile. It features JWT authentication, role-based access control (RBAC), and a beautiful responsive UI.

### Key Features
- ✅ User registration & login with JWT auth
- ✅ Create, edit, delete habits with categories, colors, icons
- ✅ Daily check-off with streak tracking
- ✅ Weekly progress grid view
- ✅ Analytics page with category breakdowns and streak leaderboards
- ✅ User profile management
- ✅ Role-based access control (admin / user)
- ✅ Full input validation with Joi
- ✅ Global error handling middleware
- ✅ 5 MongoDB collections: User, Habit, Log, Category, Goal

---

## 🗂️ Project Structure

```
habit-tracker/
├── src/
│   ├── app.js                    # Express app entry point
│   ├── config/
│   │   └── database.js           # MongoDB connection
│   ├── models/
│   │   ├── User.js               # User collection
│   │   ├── Habit.js              # Habit collection
│   │   ├── Log.js                # Completion log collection
│   │   ├── Category.js           # Category collection
│   │   └── Goal.js               # Goal collection
│   ├── controllers/
│   │   ├── authController.js     # Register & login logic
│   │   ├── userController.js     # Profile management
│   │   └── habitController.js    # Habit CRUD + stats
│   ├── routes/
│   │   ├── authRoutes.js         # POST /register, /login
│   │   ├── userRoutes.js         # GET/PUT /profile
│   │   └── habitRoutes.js        # Full habit CRUD
│   └── middleware/
│       ├── auth.js               # JWT protect + RBAC authorize
│       ├── validation.js         # Joi validation schemas
│       └── errorHandler.js       # Global error middleware
└── public/
    ├── index.html                # Login / Register page
    ├── pages/
    │   ├── dashboard.html        # Main dashboard
    │   ├── habits.html           # Habit management
    │   ├── analytics.html        # Analytics & stats
    │   └── profile.html          # User profile
    ├── css/
    │   ├── main.css              # Global styles, auth UI
    │   └── dashboard.css         # App layout styles
    └── js/
        ├── auth.js               # Login/register logic
        ├── app.js                # Shared utilities, auth guard
        ├── dashboard.js          # Dashboard page logic
        ├── habits.js             # Habits management logic
        ├── analytics.js          # Analytics rendering
        └── profile.js            # Profile page logic
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (local or MongoDB Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/habit-tracker.git
cd habit-tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` with your values:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/habittracker
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

### 4. Start the server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### 5. Open the app
Visit `http://localhost:3000` in your browser.

---

## 🗄️ Database (MongoDB Collections)

| Collection | Description |
|---|---|
| **User** | username, email, hashed password, role, avatar, bio |
| **Habit** | name, description, category, weeklyStatus, streak, color, icon |
| **Log** | completion records with date, note, mood per habit |
| **Category** | predefined + custom categories with icons/colors |
| **Goal** | user-defined streak goals linked to habits |

---

## 🔌 API Documentation

### Base URL: `/api`

### 🔓 Authentication (Public)

#### POST `/auth/register`
Register a new user.

**Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secret123"
}
```
**Response:** `201 Created`
```json
{
  "success": true,
  "token": "eyJ...",
  "user": { "id": "...", "username": "john_doe", "role": "user" }
}
```

#### POST `/auth/login`
Authenticate user and get JWT.

**Body:**
```json
{ "email": "john@example.com", "password": "secret123" }
```
**Response:** `200 OK`
```json
{ "success": true, "token": "eyJ...", "user": { ... } }
```

---

### 🔒 User Management (Private — requires `Authorization: Bearer <token>`)

#### GET `/users/profile`
Get the logged-in user's profile.

**Response:** `200 OK`
```json
{ "success": true, "user": { "id": "...", "username": "...", "habitCount": 5 } }
```

#### PUT `/users/profile`
Update profile (email, username, bio, avatar).

**Body:** Any of `{ username, email, bio, avatar }`

---

### 🔒 Habit Management (Private)

#### POST `/habits`
Create a new habit.

**Body:**
```json
{
  "name": "Morning Run",
  "description": "5km run every morning",
  "category": "fitness",
  "targetDays": ["Mon", "Wed", "Fri"],
  "color": "#34d399",
  "icon": "🏃"
}
```

#### GET `/habits`
Get all habits for the logged-in user. Optional query: `?category=fitness`

#### GET `/habits/:id`
Get a specific habit by ID.

#### PUT `/habits/:id`
Update a specific habit.

#### DELETE `/habits/:id`
Delete a habit. Users can only delete their own; admins can delete any.

#### PUT `/habits/:id/check`
Mark a habit as done/undone for a specific day.

**Body:**
```json
{ "day": "Mon", "completed": true, "note": "Felt great!", "mood": "good" }
```

#### GET `/habits/stats`
Get statistics: total habits, today's completion rate, average streak, longest streak.

---

### 🔒 Admin Only (Role: admin)

#### GET `/users`
Get all users.

#### DELETE `/users/:id`
Delete a user.

---

## 🔐 Authentication & Security

- **JWT (JSON Web Tokens)** — Issued on login/register, expires in 7 days
- **bcryptjs** — Passwords are hashed with 12 salt rounds
- **Protected routes** — `protect` middleware verifies JWT on all private endpoints
- **RBAC** — `authorize('admin')` middleware restricts admin-only routes
- **Validation** — Joi validates all inputs; meaningful 400/401 errors returned
- **Global error handler** — Catches all unhandled errors and formats responses consistently

---

## 🚀 Deployment

See the [DEPLOY.md](./DEPLOY.md) file for step-by-step deployment instructions (Render free tier recommended).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Validation | Joi |
| Frontend | HTML5 + CSS3 + Vanilla JS |
| Fonts | Syne + DM Sans (Google Fonts) |

---

## 👑 Creating an Admin User

### Option 1 — Interactive script (recommended)
```bash
node scripts/createAdmin.js
```
Enter username, email, password when prompted. The user will be created with `role: "admin"`.

### Option 2 — Promote an existing user
```bash
node scripts/createAdmin.js --promote your@email.com
```

### Option 3 — MongoDB Compass (manual)
1. Open Compass → collection `users`
2. Find your user document → click Edit
3. Change `"role": "user"` → `"role": "admin"` → Save

**Admin privileges:**
- `GET /api/users` — see all registered users
- `DELETE /api/users/:id` — delete any user
- `DELETE /api/habits/:id` — delete any user's habit
# final_web
