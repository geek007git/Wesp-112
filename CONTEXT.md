# Project context

Reviewed: 27 October 2026. This file describes the checked-out source, not a verified deployment.

## Product and users

This is a MERN doctor appointment system. Patients discover approved doctors and request appointments. Doctors maintain profiles and approve or reject requests. Administrators review doctor applications and manage access through existing account roles.

MediMate is the embedded appointment assistant. Its current implementation provides contextual conversation and navigation guidance. It does **not** autonomously book appointments or execute model-selected tools.

## Current capability boundaries

| Capability | Current state |
| --- | --- |
| Floating chat panel in shared layout | Implemented in `client/src/components/Chatbot.js` and `Layout.js` |
| Authenticated chat API | `POST /api/v1/chat/message` |
| AI-generated replies | Mistral SDK, enabled when `MISTRAL_API_KEY` is configured |
| Operation without an AI key | Keyword-based guided replies |
| Database context | Up to 20 approved doctors and 10 appointments belonging to the authenticated user |
| Conversation window | Last 10 valid messages, up to 1,000 characters each |
| Navigation | Find a doctor opens `/`; My appointments opens `/appointments` |
| Live availability or booking from chat | Not implemented |
| Persistent conversation memory | Not implemented |
| Autonomous planning, tool calls, background agents | Not implemented |

## Source map

- `server.js`: middleware, database startup and API registration.
- `controllers/chatCtrl.js`: message cleaning, database context, prompt, Mistral call and fallback.
- `routes/chatRoutes.js`: JWT authentication and chat rate limit.
- `controllers/userCtrl.js`: patient workflows, availability checks and appointment creation.
- `controllers/doctorCtrl.js`, `controllers/adminCtrl.js`: doctor and administrator workflows.
- `models/`: users, doctors and appointments.
- `utils/slots.js`: date parsing, working hours and overlap predicates.
- `client/src/components/Chatbot.js`: local conversation state, requests and navigation shortcuts.
- `client/src/api/http.js`: API base URL and JWT header handling.
- `tests/slots.test.js`: backend slot utility tests.

## Important domain rules

Only approved doctors can be booked. A slot lasts one hour, must be in the future and must fit entirely within the doctor's working hours. Pending and approved appointments block overlapping slots; rejected appointments do not. Dates use `DD-MM-YYYY`; times use `HH:mm`. Parsing currently uses the server's local timezone.

The server derives patient identity from the verified JWT through `req.userId`. Client-provided account identifiers must not replace that ownership boundary.

## AI context and trust

The server constructs the system prompt using the current user's name, selected doctor fields and a reduced appointment summary. It sends that prompt and cleaned conversation messages to Mistral when configured. Appointment and conversation information therefore leaves the application server in AI mode.

Client conversation messages, stored profile text and model responses are untrusted. Existing prompt instructions request factual replies and prohibit diagnosis and prescription; those instructions are not a technical guarantee. Database projections limit context, but the database result set is not a complete directory or complete appointment history.

## Local operation

Copy `.env.example` to `.env`, supply `MONGO_URL` and `JWT_SECRET`, and optionally configure `MISTRAL_API_KEY` and `MISTRAL_MODEL`. Install root and client dependencies, then run `npm run dev`. On Windows with PowerShell script restrictions, use `npm.cmd` for these commands.

The API defaults to port 8080. The React development server uses port 3000 and proxies API requests to 8080. Do not place a provider key in client code or commit `.env`.

## Related documents

- [Engineering guide](ENGINEERING.md): architecture, API contract, development workflow and extension design.
- [Detailed AI report](AGENTIC_AI_REPORT.md): implementation evidence, limitations, verification and proposed agentic roadmap.

Update these documents when capabilities change. Keep implemented behavior and proposed work explicitly separate.
