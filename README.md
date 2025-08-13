# DLMS Ethiopia — Driving License Management System

A full‑stack web application for managing Ethiopian driving licenses: applications, exams, renewals, verifications, news, and administration. It includes role‑based dashboards (User, Admin, Examiner, Traffic Police), OTP‑based auth, email notifications, license QR verification, and a polished public site built with React + Vite.

## Table of contents

- Features
- Tech stack
- Monorepo structure
- Quick start
- Environment variables
- Development scripts
- Building and production
- Deployment notes
- Common URLs and routes
- Troubleshooting
- Contributing
- License

---

## Features

- Public site
  - Home, Services, About, Contact
  - News feed and single news pages
  - Interactive User Manual page
  - License verification by license number
- Authentication and security
  - Sign up, sign in
  - Email verification and OTP verification
  - Forgot password (email + OTP + reset)
  - JWT‑based sessions
- Dashboards
  - User Dashboard: applications, status, schedules, notifications
  - Admin Dashboard: users, applications, exams, violations, news, reports
  - Examiner Dashboard: manage and conduct exams
  - Traffic Police Dashboard: license checks/operations
- License and QR verification
  - License preview page with QR code generation
  - Scannable QR embeds key license details
- Polished UX
  - Fixed header, clean layouts, responsive design
  - Per‑page tab titles and custom favicon
  - Vite dev proxy to backend

## Live deployment

- Frontend: https://dlms-skjh.onrender.com
- Backend API base: https://dlms-driving-license-management-system-2.onrender.com/api
- API health: https://dlms-driving-license-management-system-2.onrender.com/api/health
- DB status: https://dlms-driving-license-management-system-2.onrender.com/api/db-status

## Tech stack

- Frontend: React 18, Vite, React Router, MUI, Framer Motion, Axios
- Backend: Node.js, Express, Mongoose (MongoDB)
- Other: date‑fns, qrcode, Nodemailer

## Monorepo structure

- backend/ — Express API, routes, models, scripts
- frontend/ — React app (Vite), components, pages, assets

## Quick start

Prerequisites

- Node.js 18+ and npm 9+
- MongoDB running locally (or a remote URI)

1. Clone

- git clone <your-repo-url>
- cd DLMS--Driving-license-management-system

2. Backend setup

- cd backend
- npm install
- Copy .env.example to .env and set values (see “Environment variables”)
- npm run dev
- Backend runs at http://localhost:5004 (API base in production: https://dlms-driving-license-management-system-2.onrender.com/api)

3. Frontend setup

- Open a new terminal
- cd frontend
- npm install
- Create .env file with:
  - VITE_API_URL=https://dlms-driving-license-management-system-2.onrender.com/api
  - VITE_API_DEBUG=true
- npm run dev
- Frontend runs at http://localhost:5173

Open the app and test:

- Public site: http://localhost:5173
- Sign in: http://localhost:5173/signin
- Forgot password: http://localhost:5173/forgot-password

Tip: If you need an admin to start with, see the backend scripts below (create-admin).

## Environment variables

Backend (.env)

- MONGODB_URI=mongodb://localhost:27017/dlms
- PORT=5004
- JWT_SECRET=your_jwt_secret_key_here
- OPENAI_API_KEY=your_openai_api_key_here (only if you enable AI features)
- EMAIL_SERVICE=gmail
- EMAIL_USER=your_email@gmail.com
- EMAIL_PASSWORD=your_app_password_here
- SMTP_HOST=smtp.gmail.com
- SMTP_PORT=587
- FRONTEND_URL=http://localhost:5173
- NODE_ENV=development

Frontend (.env)

- VITE_API_URL=https://dlms-driving-license-management-system-2.onrender.com/api
- VITE_API_DEBUG=true

## Development scripts

Backend (from backend/)

- npm run dev — start API with nodemon
- npm start — start API in production mode
- npm run setup — initialize DB (init-db), create admin, add indexes, then start
- npm run init-db — run scripts/initDatabase.js
- npm run create-admin — create or update the default admin user
- npm run add-test-renewals — seed sample renewal data
- npm run seed-activities, create-test-data, optimize-db, perf-test, test-login-email — utility/seed/perf scripts

Frontend (from frontend/)

- npm run dev — start Vite dev server (http://localhost:5173)
- npm run build — production build
- npm run preview — preview production build locally

## Building and production

Frontend

- npm run build
- By default, vite.config uses “terser” for minification. If you see “terser not found,” run:
  - npm install -D terser
  - then re‑run npm run build
- Built files are in frontend/dist

Backend

- Set production .env values (secure JWT secret, real Mongo URI, email credentials)
- npm start

## Deployment notes

- Serve frontend/dist via any static host (NGINX, Netlify, etc.)
- Deploy backend separately (e.g., Node on a VM or PaaS)
- Set VITE_API_URL in the frontend build to your API base URL
- Ensure CORS is configured on the backend if front and back run on different domains

## Common URLs and routes

Public pages

- / — Home
- /about, /services, /contact
- /user-manual
- /news, /news/:id

Auth

- /signin — Sign in
- /signup — Sign up
- /verify-email — Email verification step
- /verify-otp — OTP verification step
- /forgot-password — Forgot password flow

License

- /license/:licenseNumber — License preview
- /verify/:licenseNumber — License verification

Dashboards

- /user-dashboard
- /admin/dashboard
- /examiner/dashboard
- /traffic-police/dashboard

## Troubleshooting

Blank page on the frontend

- Ensure the dev server is running (frontend: npm run dev)
- Hard refresh the browser (Ctrl/Cmd+Shift+R)
- If you still see a blank page, the Vite overlay should show an error now. Common fixes:
  - Missing dependency: run npm install (frontend). If you use QR features, ensure qrcode is installed (already listed in dependencies).
  - Build error “terser not found”: npm install -D terser
  - API URL incorrect: set VITE_API_URL to your backend API (default http://localhost:5004/api)

MongoDB connection errors

- Ensure MongoDB is running and MONGODB_URI is correct
- Try backend/scripts/checkDatabase.js (if present) or rerun npm run init-db

Email/OTP issues

- Double-check SMTP credentials and allow app passwords if using Gmail
- Confirm FRONTEND_URL in backend .env matches the frontend origin

Forgot Password page not visible

- Confirm the frontend dev server is up (http://localhost:5173)
- Go directly to /forgot-password
- If still blank, check the dev terminal and browser console; the overlay will show the error details

QR code not appearing on license preview

- Ensure qrcode is installed in the frontend
- Verify license data exists and required fields are present

## Contributing

- Open an issue describing your change
- Create a feature branch
- Keep PRs focused and linked to issues
- Follow existing code style and linting (frontend has eslint config)

## License

- This project is proprietary to your organization (update if you plan to open‑source)
- Do not commit secrets (.env files). Add any sensitive files to .gitignore

---

### Maintainer notes

- Frontend dev server: Vite proxy forwards /api and /uploads to http://localhost:5004
- Titles and favicon are handled in TitleManager.jsx and frontend/public/favicon.svg
- The header is fixed; pages add top padding or hero spacing to avoid overlap
- Consider adding CI to run installs, builds, and linting on PRs
