# Doctor Appointment System

A MERN stack appointment platform with three roles. Patients browse approved
doctors and book hour-long slots; users apply to become doctors and an admin
approves or rejects them; doctors manage their own profile and accept or decline
requests. Every state change raises an in-app notification for whoever needs to
act on it next.

**Stack:** MongoDB + Mongoose, Express, React 18 (CRA), Ant Design 5, JWT auth.

## Features

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

## License

MIT — see [LICENSE](LICENSE).
