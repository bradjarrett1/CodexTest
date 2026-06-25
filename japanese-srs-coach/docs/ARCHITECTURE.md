# Architecture

Japanese SRS Coach is a frontend-only PWA with replaceable data and voice adapters.

```text
Voice: PWA → Vapi assistant → Vapi custom tools → Make webhooks → Airtable
                                                               ↓
UI/text/debug: PWA ───────────────────────→ Make webhooks → Airtable
                                                               ↓
                       joined learner/SRS response ←────────────┘
```

Mock mode replaces Make/Airtable with a versioned localStorage database. Both modes implement the same `SrsApi` interface, so components do not know which storage system is active.

## Boundaries

- React owns navigation, rendering, assessment state, and the deterministic text drill.
- `srsApi.ts` selects mock or webhook mode from `VITE_DATA_MODE`.
- `mockSrsApi.ts` joins Concepts and SRS_State into LearnedItem records.
- Make scenarios own Airtable credentials and translate webhook JSON into Airtable reads/writes.
- Vapi owns real-time audio and calls the same logical operations as the PWA.
- The service worker caches same-origin app assets only. It never caches Make responses.

## Security limitation

Vite environment variables are public browser configuration. Make webhook URLs can be inspected by a user. This is acceptable only for a personal prototype. A multi-user production version must add authentication and a protected API/serverless proxy, or use Supabase with row-level security.
