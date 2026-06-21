# Japanese SRS Coach

A mobile-first Japanese learning PWA that combines focused voice-ready practice, text drills, permanent SRS memory, baseline assessment, can-do curriculum planning, and a visible learned-items library.

The beginner experience always keeps Romaji and English visible. Japanese-only learning content is not allowed.

## Run locally

```bash
cd japanese-srs-coach
npm install
npm run dev
```

Open the Vite URL shown in the terminal. Validate with:

```bash
npm run test:run
npm run build
npm run preview
```

## Configuration

Copy `.env.example` to `.env.local`. The default `VITE_DATA_MODE=mock` requires no external service and persists changes in localStorage.

For Airtable persistence, create all Make scenarios documented in `docs/MAKE_WEBHOOKS.md`, paste their webhook URLs into `.env.local`, and set `VITE_DATA_MODE=webhook`.

Never add an Airtable personal access token to a Vite variable. Vite variables are visible in the browser; Make must own the Airtable connection.

## What works now

- Home dashboard and mobile tab navigation
- Persistent seeded learner, SRS, attempts, assessment, and session data
- Voice-call placeholder with normalized event hooks
- Functional text scoring, feedback, retry, attempt logging, and SRS updates
- One-question-at-a-time baseline assessment
- Nine-phase can-do curriculum
- Learned Items recent/category views, full search, filters, ledger, and statistics
- Debug tools for every API operation
- Installable production PWA shell

## Intentionally mocked

- Microphone/audio transport and Vapi Web SDK
- Natural-language grading beyond normalized accepted answers and similarity
- Live Make/Airtable data until webhook URLs are configured
- AI-generated feedback and summaries
- Authentication and multi-user authorization

## Manual setup order

1. **Airtable:** Create the eight tables and fields from `docs/AIRTABLE_SCHEMA.md`. Add the learner row and import or recreate the seed concepts.
2. **Make.com:** Create the twelve webhook scenarios from `docs/MAKE_WEBHOOKS.md`. Store the Airtable connection in Make and return the standard JSON envelope.
3. **App:** Add webhook URLs to `.env.local`, switch to `webhook`, and test every operation on the Debug tab.
4. **Vapi:** Create an assistant, paste `prompts/vapiSystemPrompt.v1.md`, create the listed custom tools, and attach the Make URLs.
5. **Voice SDK:** Add the Vapi Web SDK adapter to `src/lib/vapiClient.ts` after the assistant works in Vapi's own test console.

## Assumptions and TODOs

- V1 is for one configured learner and has no login.
- Browser-visible Make URLs are acceptable only for a private prototype.
- Add a protected proxy/authentication before sharing publicly.
- Confirm Make's exact CORS behavior from the deployed PWA origin.
- Replace deterministic text grading with an AI validator while preserving explicit SRS writes.
- Add PNG 192px/512px icons if a target app store or browser requires raster manifest icons.

See `docs/ARCHITECTURE.md`, `docs/DATABASE_SCHEMA.md`, and `docs/ROADMAP.md` for the extension path.
