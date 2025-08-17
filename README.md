# AirConnect (FYP)
A role-based campus communication and workflow platform for Students, Teachers, Coordinators, and Student Affairs. It centralizes announcements, applications/approvals, batch/section management, job postings, user profiles, and real-time notifications. The frontend ships as a PWA for fast, offline-friendly access.
![s1](frontend/public/screenshots/image-1.png)
## Tech stack
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, Socket.IO, Multer, Cloudinary, Nodemailer, Web Push
- Frontend: React 18, Vite, React Router, React Query, Axios, Tailwind CSS + DaisyUI, Zustand, Zod, Socket.IO client, PWA (vite-plugin-pwa + Workbox)
- Dev/tooling: dotenv, morgan, ESLint, PostCSS/Tailwind

## Key packages (important ones)
- Backend: `express`, `mongoose`, `jsonwebtoken`, `socket.io`, `multer`, `cloudinary`, `bcrypt`, `cookie-parser`, `cors`, `nodemailer`, `web-push`, `morgan`, `dotenv`
- Frontend: `react`, `react-router-dom`, `react-query`, `@tanstack/react-query-devtools`, `axios`, `tailwindcss`, `daisyui`, `socket.io-client`, `vite-plugin-pwa`, `workbox-window`, `zustand`, `zod`, `react-hot-toast`, `framer-motion`, `date-fns`

## Main modules (short)
### Backend (`backend/`)
- Server & bootstrap
  - `index.js`: Configures Express (CORS, cookies, JSON, static `/uploads`), starts HTTP server, initializes Socket.IO, mounts routes.
  - `DB/connectToDB.js`: Connects to MongoDB.
- Auth & users
  - Routes: `routes/user.route.js`; Controller: `controllers/user.controller.js`
  - JWT cookie helper: `GenerateTokenAndSetCookie.js`
  - Profile uploads with Multer to `uploads/profile/` and Cloudinary integration in `helpers/cloudinary.js`.
  - Password hashing (`bcrypt`), email flows (`nodemailer`), change/forgot/reset password.
- Announcements
  - Routes: `routes/announcement.route.js`; Controller: `controllers/announcement.controller.js`
  - Create/update with attachments (Multer), like/dislike, comments.
  - Announcement filters/sections: `routes/announcement-filter.route.js`, controller pair.
- Batches & sections
  - Routes: `routes/batch.route.js`; Controller: `controllers/batch.controller.js`
  - Create batch; add/remove students/teachers; assign advisor; batch summary/details.
- Applications workflow
  - Routes: `routes/application.route.js`; Controller: `controllers/application.controller.js`
  - Student→Advisor→Coordinator updates, comments, per-role history clear/hide; file uploads to `uploads/applications/`.
- Jobs
  - Routes: `routes/jobs.route.js` (and `routes/jobs.routes.js` alternative); Controller: `controllers/jobs.controller.js`
  - Create/list/update/delete job posts; thumbnail upload to `uploads/`.
- Notifications & realtime
  - Socket server: `services/socket.service.js` (per-user rooms `user:<id>`, JWT auth, emit `notification` events).
  - REST routes: `routes/notification.route.js`.
  - Diagnostics: `routes/debug.route.js` to inspect socket status and send test notifications.
- Middleware
  - `middleware/verifyToken.js` (JWT verification), `restrict.js` (role checks), `checkCoordinator.js`, `checkStudentAffairs.js`.

### Frontend (`frontend/`)
- App shell & routing
  - Entry: `src/main.jsx` (React Query provider, SW registration), `src/App.jsx` (routes grouped by role).
  - Route guards: `components/ProtectedRoutes.jsx`, `components/RoleBaseRoutes.jsx`, `components/PublicRoutes.jsx`.
- Auth & profile
  - Pages: `page/Auth/*` (Login, SignUp, ProfileSetup, UpdateUser, ChangePassword, Forgot/Reset Password).
  - Context: `context/AuthContext.jsx` (user state, JWT cookie, socket init on login).
- Applications, announcements, jobs, batches
  - Applications: student/teacher/coordinator pages + history; detail view with comments.
  - Announcements: feed, create post, detail with likes/comments.
  - Jobs: list and create (student-affairs role).
  - Batches/sections: coordinator pages for managing batches, sections, advisors, teachers, students.
- Realtime notifications
  - `context/NotificationContext.jsx` listens for `notification` events over Socket.IO.
  - Client socket: `services/socket.service.js` (connect/disconnect, status).
- PWA & offline
  - `vite-plugin-pwa` setup with `src/pwa.js`, `components/PWAInstallPrompt.jsx`, offline fallback component.

## Quick start (local)
Prereqs: Node.js 18+, a running MongoDB (default: `mongodb://localhost:27017/UserRole`).

1) Backend
```powershell
cd backend
npm install
# Create .env with at least:
# PORT=3001
# JWT_SECRET=changeme
# CLIENT_URL=http://localhost:5173
# (optional) CLOUDINARY_* / SMTP_* / VAPID_* as needed
npm run dev
```

2) Frontend
```powershell
cd frontend
npm install
npm run dev
```

## Notes
- Static files under `backend/uploads/` are served at `/uploads/...` during development.
- Socket.IO expects a JWT via `auth.token`; the backend room pattern is `user:<userId>`.

## Screenshots / Images

Below are images taken from the frontend public folder. These are referenced with relative paths so they render on GitHub.

![App logo](frontend/public/aulogo.png)

### Screenshots

<!-- 25 screenshots from frontend/public/screenshots/ -->

![s2](frontend/public/screenshots/image-2.png)
![s3](frontend/public/screenshots/image-3.png)
![s4](frontend/public/screenshots/image-4.png)
![s5](frontend/public/screenshots/image-5.png)
![s6](frontend/public/screenshots/image-6.png)
![s7](frontend/public/screenshots/image-7.png)
![s8](frontend/public/screenshots/image-8.png)
![s9](frontend/public/screenshots/image-9.png)
![s10](frontend/public/screenshots/image-10.png)
![s11](frontend/public/screenshots/image-11.png)
![s12](frontend/public/screenshots/image-12.png)
![s13](frontend/public/screenshots/image-13.png)
![s14](frontend/public/screenshots/image-14.png)
![s15](frontend/public/screenshots/image-15.png)
![s16](frontend/public/screenshots/image-16.png)
![s17](frontend/public/screenshots/image-17.png)
![s18](frontend/public/screenshots/image-18.png)
![s19](frontend/public/screenshots/image-19.png)
![s20](frontend/public/screenshots/image-20.png)
![s21](frontend/public/screenshots/image-21.png)
![s22](frontend/public/screenshots/image-22.png)
![s23](frontend/public/screenshots/image-23.png)
![s24](frontend/public/screenshots/image-24.png)
![s25](frontend/public/screenshots/image-25.png)



