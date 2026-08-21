# Doctor-appointmnet-system-mern-project
Mern Stack Doctor appointment system project code
# Check Branches for complete project code
project tutorials link:
https://youtube.com/playlist?list=PLuHGmgpyHfRw0wBGN8knxsJsMi74r34zw

## Running it

1. `cp .env.example .env` and fill in `MONGO_URL` / `JWT_SECRET`.
2. `npm install` (root) and `npm install --prefix ./client`.
3. `npm run dev` — starts the API on `PORT` (default 8080) and CRA on 3000
   (the client proxies `/api` to 8080).

There is no admin sign-up. Register normally, then flip the flag once in Mongo:

```
db.users.updateOne({ email: "you@example.com" }, { $set: { isAdmin: true } })
```

## Flows

- **Apply as doctor** — `/apply-doctor` creates a `doctors` document with
  `status: "pending"` and pushes a notification to every admin.
- **Admin approval** — `/admin/doctors` approves or rejects. Approving sets the
  applicant's `isDoctor` flag and notifies them; only `approved` doctors appear
  in the patient-facing list.
- **Booking** — `/doctor/book-appointment/:doctorId` checks availability, then
  books. The doctor gets a notification and approves or rejects from
  `/doctor/appointments`, which notifies the patient back.

### Availability rules

A slot is one hour (`utils/slots.js`, `SLOT_MINUTES`). A request is rejected if
the date/time is malformed, in the past, the whole hour does not fit inside the
doctor's `timings`, or a non-rejected appointment for that doctor already
overlaps the hour on either side. `date` is `DD-MM-YYYY`, `time` is `HH:mm`;
both are also stored combined as `slot` (a `Date`) for the range query.

## API

| Method | Route | Auth |
| --- | --- | --- |
| POST | `/api/v1/user/register` | public |
| POST | `/api/v1/user/login` | public |
| POST | `/api/v1/user/getUserData` | token |
| POST | `/api/v1/user/apply-doctor` | token |
| POST | `/api/v1/user/get-all-notification` | token |
| POST | `/api/v1/user/delete-all-notification` | token |
| GET | `/api/v1/user/getAllDoctors` | token |
| POST | `/api/v1/user/booking-availbility` | token |
| POST | `/api/v1/user/book-appointment` | token |
| GET | `/api/v1/user/user-appointments` | token |
| POST | `/api/v1/doctor/getDoctorInfo` | token |
| POST | `/api/v1/doctor/updateProfile` | token |
| GET | `/api/v1/doctor/getDoctorById/:doctorId` | token |
| GET | `/api/v1/doctor/doctor-appointments` | token |
| POST | `/api/v1/doctor/update-status` | token |
| GET | `/api/v1/admin/getAllUsers` | admin |
| GET | `/api/v1/admin/getAllDoctors` | admin |
| POST | `/api/v1/admin/changeAccountStatus` | admin |
