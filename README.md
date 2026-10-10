# CleanTrack Uganda Frontend

CleanTrack Uganda is a React learning app for coordinating waste pickup requests across customers, drivers, company managers, and admins.

## Tech Stack

- ReactJS with Vite
- React Router for pages and protected routes
- Axios for API calls
- Bootstrap for responsive UI
- localStorage for storing the JWT token

## Folder Structure

- `components/` contains reusable UI such as navigation, guards, badges, alerts, and cards.
- `context/AuthContext.jsx` stores the logged-in user and login/logout functions.
- `layouts/` contains public and dashboard page shells.
- `pages/` contains role-based screens.
- `services/` contains Axios API calls grouped by backend resource.
- `utils/formatDate.js` contains shared formatting helpers.
- `App.jsx` defines the React Router route tree.

## Run Frontend

```bash
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:5173`.

Set `VITE_API_URL=http://localhost:5000/api` in `.env`.

The backend must also be running:

```bash
cd ../cleantrack-backend
npm run dev
```

## Full Local Setup Order

From the parent folder that contains both repositories:

```bash
cd cleantrack-backend
npm install
cp .env.example .env
npm run db:setup
npm run dev
```

In a second terminal:

```bash
cd cleantrack-frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173` in the browser.

## Avoiding CORS Errors

Keep `VITE_API_URL=http://localhost:5000/api` in the frontend `.env`.

Keep `FRONTEND_URL=http://localhost:5173` in the backend `.env`. The backend also allows common local Vite fallback ports, including `5174`, for development.

If the backend uses another port, update the frontend `.env` to match:

```env
VITE_API_URL=http://localhost:5002/api
```

## Pages and Routes

Public pages:

- `/`
- `/about`
- `/how-it-works`
- `/login`
- `/register`

Customer pages:

- `/customer`
- `/customer/locations`
- `/customer/locations/new`
- `/customer/report-bin`
- `/customer/pickups`
- `/customer/pickups/:id`

Driver pages:

- `/driver`
- `/driver/jobs`
- `/driver/jobs/:id`
- `/driver/completed`

Manager pages:

- `/manager`
- `/manager/company`
- `/manager/trucks`
- `/manager/assign`
- `/manager/pickups`

Admin pages:

- `/admin`
- `/admin/users`
- `/admin/pickups`
- `/admin/companies`
- `/admin/categories`

## Role-Based Dashboards

`ProtectedRoute.jsx` checks whether a user is logged in. `RoleBasedRoute.jsx` checks whether the logged-in user has the correct role for the route. Each role gets its own dashboard menu inside `DashboardLayout.jsx`.

## API Service Files

The frontend does not call Axios directly from every component. Instead, files such as `pickupService.js`, `assignmentService.js`, and `adminService.js` group backend calls by resource. This keeps pages shorter and helps students see where API communication belongs.

## Default Accounts

All seed accounts use password `password123`.

- Admin: `admin@cleantrack.ug`
- Customer: `customer@cleantrack.ug`
- Driver: `driver1@cleantrack.ug`
- Manager: `manager@greenroute.ug`

## How the Frontend Talks to the Backend

`services/api.js` creates one Axios instance with the backend URL. Its interceptor reads `cleantrack_token` from `localStorage` and attaches it to each request. That token is created by the backend during login or registration.

## Repository Notes

This folder is its own Git repository. `node_modules/`, `dist/`, `.env`, and npm debug logs are ignored.

## New Feature: Recurring Pickup Schedules

The frontend now includes a customer and admin UI for the recurring pickup schedules feature.

### New Pages

- `/customer/schedules` — **My Schedules** (customer)
  - Create a recurring pickup (location, waste type, day of week, bin level, optional note)
  - See own schedules with status badges (pending / approved / rejected)
  - Cancel a schedule while it is still pending

- `/admin/schedules` — **Schedule Approvals** (admin)
  - Filter schedules by pending / approved / rejected
  - Approve or reject a schedule (with an optional rejection note)
  - **Generate This Week's Pickups** button — auto-creates pickup requests from every approved schedule whose day matches today

### New Service

- `src/services/scheduleService.js` — Axios wrapper for the endpoints listed in the backend README.

### Routes and Navigation

- New routes added in `src/App.jsx`
- New sidebar links added in `src/layouts/DashboardLayout.jsx`:
  - Customer: **My Schedules**
  - Admin: **Schedules**# CleanTrack Frontend — Learning Notes
## Feature 1: Recurring Pickup Schedules
## Feature 2: Admin Approval Workflow
