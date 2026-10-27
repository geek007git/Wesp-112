# MediMate: detailed AI project report

Review date: 27 October 2026  
Evidence: local source inspection and checks described below. No deployment or live provider session was verified.

## 1. Executive assessment

The project already contains an AI-assisted doctor appointment chatbot named MediMate. The implementation includes a React chat interface, authenticated backend route, Mistral integration, database-derived context and a deterministic fallback.

It is currently a **context-aware conversational assistant**, rather than a complete agentic AI system. The backend chooses a fixed sequence of database reads and optionally makes one model call. The model cannot select tools, inspect live slot availability, create bookings, persist goals or run background tasks. Existing appointment operations remain user-driven through the application's ordinary screens.

The existing AI-related files were already present as local changes when this review began. This documentation update does not establish who authored those changes, whether they were committed, or whether AI mode has been deployed.

## 2. Problem and intended value

Patients need to find approved doctors, understand booking steps and locate appointment updates. MediMate provides an accessible conversation entry point within the shared layout. Database summaries can make generated guidance more relevant than a generic chatbot, while the fallback supports basic navigation when no provider key is configured or generation fails.

The assistant's product scope is administrative appointment support. The prompt asks it to avoid diagnosis and prescription and direct urgent symptoms toward emergency services. These are implemented instructions, not evidence of clinical reliability.

## 3. Implemented feature inventory

| Feature | Implementation evidence | Practical boundary |
| --- | --- | --- |
| Chat interface | `client/src/components/Chatbot.js`, `client/src/styles/Chatbot.css` | Local React state; no saved transcript |
| Shared app integration | `client/src/components/Layout.js` | Mounted with page layout; history can be lost when the component remounts |
| API and authentication | `routes/chatRoutes.js`, `middlewares/authMiddleware.js` | Valid JWT required; no explicit account-existence rejection in chat |
| Rate limiting | Chat route limiter | 15 requests per minute using the library's default keying/store, not an explicit account quota |
| Input cleaning | `cleanMessages` in `controllers/chatCtrl.js` | Role/content filtering and truncation; incomplete top-level validation |
| Context retrieval | Chat controller's Mongoose reads | Approved doctors and the current user's limited appointment subset |
| Generation | Dynamic Mistral SDK import and `chat.complete` | Optional provider call; no tools supplied |
| Provider configuration | `.env.example`, root `package.json` | Server-side key; configurable model identifier |
| Guided fallback | `fallbackReply` | Keyword responses for emergencies, booking, doctors and greetings |
| Navigation shortcuts | `handleSuggestion` in the chat component | Opens doctor list or own appointments; does not execute a booking |

## 4. End-to-end behavior

1. A signed-in user opens MediMate and sends text or uses a suggestion.
2. The UI adds the user message to component state and posts conversation messages through the shared Axios client.
3. Axios adds the stored JWT. The server verifies it and applies the chat rate limiter.
4. The controller cleans history and finds the latest retained user message.
5. It reads the user, up to 20 approved doctors and up to 10 own appointments concurrently.
6. With an API key, it constructs the system prompt and requests a Mistral reply. Empty output and provider errors fall back to guided text.
7. Without a key, it uses guided text directly. Database errors instead go to the shared error handler.
8. The server returns `success`, `reply` and `mode`; the UI appends the reply.

The Find a doctor and My appointments shortcuts navigate directly without sending their suggested messages. Book a visit sends a question about the booking process.

## 5. Context engineering assessment

The current context combines instructions, user identity, a small doctor directory and appointment summaries. Restricting message roles prevents client-provided `system` entries from being forwarded directly. Limits on history and content length reduce per-request input size, and database projections reduce selected data.

Important limitations remain:

- The doctor list has no search filter, pagination or explicit ordering. A relevant specialist may be outside the first 20 records.
- Appointments are sorted by slot descending, not creation time. This is not necessarily the nearest upcoming appointment order.
- The fallback count reflects the retrieved subset, so it can understate a larger appointment history or directory.
- Earlier preferences disappear after the history window, and refreshing/remounting loses the component's conversation.
- Client-supplied assistant messages can be forged. They are conversational context, not verified system history.
- Profile fields and user messages can contain prompt-injection text. The prompt's request to ignore such instructions does not establish protection.
- Doctor hours are not live free slots. No appointment conflict check is supplied to the model.

A next iteration should retrieve only relevant context, label its scope explicitly and use validated tools for facts that require a fresh query.

## 6. Agentic capability gap

| Agentic capability | Current status | Required addition |
| --- | --- | --- |
| Goal decomposition | Absent | Bounded orchestration with explicit task state |
| Model-selected actions | Absent | Typed, allowlisted tool definitions and dispatcher |
| Observe tool results and continue | Absent | Limited tool-result loop with error handling |
| Availability investigation | Outside chat | Shared availability service exposed as a read tool |
| Booking action | Outside chat | Confirmed proposal, authorization, idempotency and durable conflict control |
| Durable memory | Absent | Scoped storage with retention and deletion rules |
| Action audit trail | Absent | Structured sanitized tool execution events |
| Agent evaluation | Absent | Repeatable task, ownership and failure-path scenarios |

The existing chatbot is a useful foundation for this work, but a fluent response or a booking suggestion is not evidence that an action occurred.

## 7. Reliability, privacy and safety findings

**Request validation:** `cleanMessages` calls array methods without checking `Array.isArray`. A malformed top-level value can become a 500 response. Explicit schema validation should return 400 before querying the database.

**Urgent-message handling:** the deterministic emergency branch runs only when fallback is selected. In AI mode the response depends on the model following the prompt. Keyword matching also cannot cover all urgent situations. No clinical safety evaluation was run.

**Data transmission:** in AI mode, the provider receives user text, retained conversation messages, the user's name and appointment/doctor summaries. Provider retention, consent and contractual requirements were not reviewed. Full account records and secrets should remain outside the prompt.

**Availability and concurrency:** the booking controller checks conflicts then inserts a record. Concurrent requests can pass the check before either inserts; the appointment schema does not provide an atomic overlap reservation. An agent booking tool should not amplify this existing race.

**Operational bounds:** history limits, an output-token limit and route rate limiting exist. There is no application-configured provider timeout, explicit agent budget, usage dashboard or structured AI audit trail. SDK defaults were not evaluated.

**Identity:** appointment context is filtered using the JWT subject. The chat user lookup can return no record without stopping the response. Account removal and stale-token behavior need explicit tests and handling.

**Transparency:** the API reports guided versus AI mode, but the UI does not surface that distinction. The interface's booking-oriented wording can suggest stronger action capability than the implementation provides.

## 8. Verification performed

| Check | Result | What it establishes |
| --- | --- | --- |
| Backend `npm.cmd test` | 9 tests passed | Existing date/time parsing, working-hour and overlap utility behavior |
| Targeted chat helper assertions | 5 assertions passed | Message role filtering, trimming, history/content caps and two fallback branches |
| Client `npm.cmd test --prefix client -- --watchAll=false --runInBand` | Could not run: `react-scripts` unavailable | Client dependencies must be installed before testing |
| Authenticated MongoDB chat flow | Not run | Database connectivity and ownership integration remain unverified |
| Live Mistral request | Not run | Provider credentials, availability, latency and generated quality remain unverified |
| Browser interaction / production build | Not run | Visual behavior and production bundling remain unverified |

PowerShell initially blocked `npm.ps1` under the machine's execution policy. The backend tests ran successfully through `npm.cmd` without changing that policy. The existing backend suite does not prove end-to-end booking or AI correctness.

## 9. Proposed delivery roadmap

### Stage 1: harden the existing assistant

Validate chat bodies, handle removed accounts, apply urgent-message policy consistently, add context-scope wording, configure deadlines and expose guided mode in the UI. Add focused tests for malformed inputs, ownership filters and provider failure.

Acceptance: malformed requests return 400; unauthenticated calls return 401; provider failure yields a useful fallback; a user never receives another user's appointment context.

### Stage 2: introduce read-only tools

Extract reusable domain services and expose doctor search, own appointments and slot availability through validated tool schemas. Add a bounded loop that can use tool results to answer a task. Keep server identity authoritative and avoid exposing arbitrary query execution.

Acceptance: the assistant can search beyond the current 20-doctor subset, check a requested slot and report unavailable results accurately. Invalid and unauthorized tool arguments are rejected server-side.

### Stage 3: add confirmed booking

Introduce a structured booking proposal and an explicit confirmation UI. Bind confirmation to the exact user, doctor, date and time. Recheck availability on execution, enforce idempotency and durable conflict prevention, and record an audit event.

Acceptance: no booking occurs before confirmation; retries do not create duplicates; simultaneous conflicting requests produce at most one booking; success text is based on a persisted appointment result.

### Stage 4: evaluate and operate

Build a synthetic evaluation set for doctor discovery, ambiguous dates, unavailable slots, provider failure, prompt injection, account isolation and booking races. Measure task success, factual accuracy, unauthorized-action attempts, duplicate bookings, fallback rate, latency and token usage. Establish measured baselines before choosing release thresholds.

Long-term memory and reminders should be separate opt-in features with scoped storage, deletion and authenticated scheduling. Neither is present today.

## 10. Conclusion

The source contains a functioning design for contextual AI appointment guidance, with guided operation when generation is unavailable. Source integration is present; live operation has not been established by this review. The next substantive agentic step is a validated read-only tool layer, followed by confirmed writes with stronger booking guarantees.

For ongoing implementation context, see [CONTEXT.md](CONTEXT.md). For API details and extension design, see [ENGINEERING.md](ENGINEERING.md).
