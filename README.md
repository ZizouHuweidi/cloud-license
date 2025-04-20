# Cloud Device License Management Dashboard

## Stack

- **Frontend:** React
- **Backend:** Go (Echo, GORM)
- **Database:** PostgreSQL
- **Email:** Mailpit (SMTP for local testing)
- **Infrastructure:** Docker Compose

---

## Setup

1. Copy `.env.example` to `.env` and fill in secrets (see below).
2. Run `docker-compose up --build` to start all services (backend, frontend, db, Mailpit).
3. Access Mailpit UI at [http://localhost:8025](http://localhost:8025) to view all test emails.

### Environment Variables

- Backend: Configure DB and SMTP (Mailpit) settings in `.env`:
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `NOTIFY_EMAIL`
- Frontend: Set API URL in `frontend/.env`

---

## Features

- **User Auth:** Register, login (JWT), and Multi-Factor Authentication (MFA/TOTP)
- **Device Management:** CRUD, search, export (PDF/Excel/email)
- **License Management:** CRUD, search, export (PDF/Excel/email)
- **Email:** All emails sent via Mailpit for local testing
- **Notifications:** Daily email summary of expiring licenses

---

## API Endpoints

### Auth

- `POST /register` — `{ email, password }` → Register
- `POST /login` — `{ email, password }` → Login, returns `{ token }`
- All other endpoints require `Authorization: Bearer <token>`

### MFA

- `POST /mfa/setup` — Get TOTP secret/URL (JWT required)
- `POST /mfa/verify` — `{ code }` (JWT required)

### Devices

- `GET /devices` — List all
- `GET /devices/:id` — Get by ID
- `POST /devices` — Create
- `PUT /devices/:id` — Update
- `DELETE /devices/:id` — Delete
- `GET /devices/search?service_tag=...` — Search
- `POST /devices/:id/export` — Export (form fields: `format` [excel|pdf], `email` [optional])

### Licenses

- `GET /licenses` — List all
- `GET /licenses/:id` — Get by ID
- `POST /licenses` — Create
- `PUT /licenses/:id` — Update
- `DELETE /licenses/:id` — Delete
- `GET /licenses/search?license_type=...` — Search
- `POST /licenses/:id/export` — Export (form fields: `format`, `email`)

---

## Testing Workflow

1. **Start services:** `docker-compose up --build`
2. **Register user:** `POST /register`
3. **Login:** `POST /login` → use JWT for all protected routes
4. **MFA:**
   - `POST /mfa/setup` (get QR/secret, scan in authenticator app)
   - `POST /mfa/verify` (submit TOTP code)
5. **Devices/Licenses:** Test all CRUD, search, and export endpoints
6. **Email:** Trigger exports with `email` field or wait for notification worker; check Mailpit UI for emails
7. **Error Handling:** Try invalid/expired JWT, missing fields, etc. — all errors return JSON

---

## Frontend Integration

- **Auth:** Register/Login, store JWT, attach as `Authorization` header
- **MFA:** Setup & verify flows as above
- **CRUD:** Devices and licenses use standard REST endpoints
- **Search:** Use query params
- **Export:** POST with `format` and optionally `email` (if email, response is `{ message: "email sent" }`)
- **Email:** All test emails visible in Mailpit

---

## Development

- Use Docker Compose for all services, or run Go/Node locally
- `.gitignore` is pre-configured
- Database auto-migrates on backend startup

---

## Useful URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080
- **Mailpit:** http://localhost:8025

---
