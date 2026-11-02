# Doctor Appointment System

A MERN stack appointment platform with three roles. Patients browse approved
doctors and book hour-long slots; users apply to become doctors and an admin
approves or rejects them; doctors manage their own profile and accept or decline
requests. Every state change raises an in-app notification for whoever needs to
act on it next.

**Stack:** MongoDB + Mongoose, Express, React 18 (CRA), Ant Design 5, JWT auth.

## Features

- **MediMate AI assistant**: authenticated contextual chat using Mistral when
  configured, with guided fallback replies and doctor/appointment navigation.
  It currently provides guidance; tool execution and booking from chat are not
  implemented. See the [project context](CONTEXT.md),
  [engineering guide](ENGINEERING.md), and [detailed AI report](AGENTIC_AI_REPORT.md).

- **JWT authentication** — register, login, and a `getUserData` endpoint the
  client uses to build its user context. Passwords are bcrypt-hashed, and login
  answers identically for an unknown email and a wrong password so the endpoint
  cannot be used to enumerate accounts.
- **Role-based access** — `isAdmin` and `isDoctor` flags drive both the sidebar
  and the route guards. Admin routes are enforced server-side by middleware, not
  just hidden in the UI.
- **Doctor applications** — a user submits a profile, every admin is notified,
  and approval flips the applicant's `isDoctor` flag. Only `approved` doctors
  appear in the patient-facing list or can be booked.
- **Appointment booking** — availability is checked against the doctor's working
  hours and existing appointments before a slot can be taken (see below).
- **Notifications** — unread and read tabs, mark-all-read, and delete-all, with
  each notification carrying the path it should navigate to.
- **Input validation** — every write endpoint validates its body with
  `express-validator`; failures come back as one `{ success, message }` shape.
- **Security basics** — `helmet` headers and a 20-request / 15-minute rate limit
  on the credential endpoints.

## Availability rules

A slot is one hour (`SLOT_MINUTES` in `utils/slots.js`). A booking is refused if:

- the date or time is malformed, or the date would silently roll over (`31-02`)
- the slot is in the past
- the full hour does not fit inside the doctor's `timings` — with hours of
  `09:00–17:00`, `16:00` is the last bookable slot and `16:30` is refused
- a non-rejected appointment for that doctor already overlaps the hour on
  either side

`date` is `DD-MM-YYYY` and `time` is `HH:mm`; both are also stored combined as
an indexed `slot` Date, which is what the overlap query actually ranges over.
These rules are unit-tested in `tests/slots.test.js`.

## Getting started

```bash
cp .env.example .env        # then fill in MONGO_URL and JWT_SECRET
npm install
npm install --prefix ./client
npm run dev                 # API on $PORT (default 8080), CRA on 3000
```

The client proxies `/api` to port 8080, so both run against one origin in
development.

There is no admin sign-up by design. Register normally, then promote yourself
once in Mongo:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { isAdmin: true } })
```

### Tests

```bash
npm test                    # backend: slot and availability rules
npm test --prefix ./client  # client: API error handling
```

## Project layout

```
config/         mongo connection
controllers/    user, doctor and admin request handlers
middlewares/    auth, admin gate, validation, error handling
models/         user, doctor, appointment schemas
routes/         /api/v1/{user,doctor,admin}
utils/slots.js  slot parsing and the availability predicates
tests/          backend unit tests
client/src/
  api/          axios instance, JWT interceptor, error helper
  components/   layout, route guards, doctor form and card
  context/      user context
  pages/        patient, doctor and admin screens
```

## API

All routes are prefixed `/api/v1`. "token" means an `Authorization: Bearer`
header; "admin" additionally requires `isAdmin`.

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | public | liveness check |
| POST | `/chat/message` | token | contextual assistant reply; AI or guided mode |
| POST | `/user/register` | public | create an account |
| POST | `/user/login` | public | exchange credentials for a JWT |
| POST | `/user/getUserData` | token | current user, minus the password |
| POST | `/user/apply-doctor` | token | submit a doctor application |
| POST | `/user/get-all-notification` | token | mark all as read |
| POST | `/user/delete-all-notification` | token | clear all notifications |
| GET | `/user/getAllDoctors` | token | approved doctors only |
| POST | `/user/booking-availability` | token | `{ available, message }` |
| POST | `/user/book-appointment` | token | book a slot |
| GET | `/user/user-appointments` | token | own appointments |
| POST | `/doctor/getDoctorInfo` | token | own doctor profile |
| POST | `/doctor/updateProfile` | token | update own profile |
| GET | `/doctor/getDoctorById/:doctorId` | token | one approved doctor |
| GET | `/doctor/doctor-appointments` | token | appointments to review |
| POST | `/doctor/update-status` | token | approve or reject one |
| GET | `/admin/getAllUsers` | admin | all users |
| GET | `/admin/getAllDoctors` | admin | applications, any status |
| POST | `/admin/changeAccountStatus` | admin | approve or reject an application |

Errors use HTTP status codes — 400 validation, 401 auth, 403 not an admin, 404
missing, 409 conflict (duplicate email, taken slot), 500 unexpected — with a
`{ success: false, message }` body throughout.

## Production deployment

`vercel.json` builds the React client and routes `/api/*` to the Express Node
function in `api/index.js`. All other application paths fall back to React, so
refreshing `/login` or an appointment page works. Deploy from the repository root,
with no dashboard Root Directory override.

Configure these server environment variables in the hosting dashboard:

- `MONGO_URL`: hosted MongoDB connection URI, including the application database.
- `JWT_SECRET`: a cryptographically random signing secret; keep it stable across deploys.
- `NODE_ENV=production` and `NODE_MODE=production`.
- `MISTRAL_API_KEY`: optional provider key for AI replies. Without it, the assistant
  uses guided replies. `MISTRAL_MODEL` defaults to `mistral-small-latest`.

Keep all secrets out of Git and out of `REACT_APP_*` variables, which are public.
MongoDB must allow connections from the chosen host. `/api/v1/health` returns 200
only after a database connection succeeds and 503 when the database is unavailable.

Before a demo, verify registration, login, doctor application/admin approval,
booking, and the assistant against the live URL. A successful frontend build
alone does not verify these database-dependent flows.

For a conventional Node host, run `npm ci`, `npm ci --prefix client`,
`npm run build`, then `npm start`. With `NODE_ENV=production`, Express also serves
the React build on the same origin.

## License

MIT — see [LICENSE](LICENSE).
