# CodeQuest Pro — AI-Powered Coding Platform

A full-stack competitive coding platform where Gemini AI evaluates code solutions, analyzes complexity, and provides improvement suggestions.

## Architecture

**No Docker, no Piston, no Judge0.** Code evaluation is done entirely via Gemini AI:

1. User writes code in the Monaco editor
2. Clicks "Run" → Gemini traces execution and returns output
3. Clicks "Submit" → Gemini evaluates against all test cases and returns:
   - Verdict (Accepted / Wrong Answer / Runtime Error)
   - Test case results (passed/failed per case)
   - Time & space complexity analysis
   - Improvement suggestions

## Tech Stack

- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Frontend:** React 18, Vite, Monaco Editor
- **AI:** Google Gemini 2.5 Flash
- **Auth:** JWT + refresh tokens + OTP email verification

## Quick Start

```bash
# 1. Backend
cd backend
cp .env.example .env       # Fill in MongoDB URI + Gemini API key
npm install
npm run seed               # Loads 10 problems, 5 users, 2 contests, 13 achievements
npm run dev                # http://localhost:5000

# 2. Frontend
cd frontend
npm install
npm run dev                # http://localhost:5173
```

## Default Credentials

| Role  | Email              | Password   |
|-------|--------------------|------------|
| Admin | admin@codequest.io | Admin@123  |
| User  | john@example.com   | User@123   |
| User  | jane@example.com   | User@123   |

## Required Environment Variables

```
MONGO_URI=<your mongodb connection string>
GEMINI_API_KEY=<free from aistudio.google.com/apikey>
JWT_SECRET=<any 32+ char string>
JWT_REFRESH_SECRET=<any 32+ char string>
```

## Admin Panel Features

- **Dashboard:** Total users, problems, submissions, contests, acceptance rate, language distribution
- **User Management:** Search, view details, toggle roles, delete users
- **Problem Management:** Full CRUD — title, description, difficulty, tags, test cases (visible + hidden), examples, starter code, hints
- **Contest Management:** Create/edit with date picker, duration, difficulty, add problems from existing library
