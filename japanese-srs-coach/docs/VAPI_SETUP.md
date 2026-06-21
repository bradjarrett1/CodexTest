# Vapi Setup

## 1. Create the assistant

1. Create a Vapi assistant for Japanese SRS Coach.
2. Paste `prompts/vapiSystemPrompt.v1.md` into the system prompt.
3. Use a patient voice and conservative interruption settings.
4. Copy the public key and assistant ID into `.env.local` as `VITE_VAPI_PUBLIC_KEY` and `VITE_VAPI_ASSISTANT_ID`.
5. Install the Vapi Web SDK only when replacing the adapter placeholder in `vapiClient.ts`.

## 2. Create custom tools

| Tool | Make webhook |
|---|---|
| `get_learner_profile` | Get learner profile |
| `get_due_srs_items` | Get due items |
| `get_learned_items` | Get learned items |
| `get_learned_item_detail` | Get learned item detail |
| `log_attempt` | Log attempt |
| `upsert_concept` | Upsert concept |
| `update_srs_state` | Update SRS state |
| `save_session_summary` | Save session summary |
| `save_assessment_result` | Save assessment result |

Each tool sends `learnerId`, a unique `requestId`, and its operation payload. Configure the tool's server URL to the corresponding Make custom webhook. Return the `{ "ok": true, "data": ... }` envelope from Make.

## 3. Events to connect

The UI wrapper normalizes call start, call end, transcript, status, and error events. The future SDK adapter should subscribe to Vapi message events, forward final and partial transcripts, and remove listeners when the component unmounts.

Never put Airtable credentials in Vapi client-side configuration. Vapi tools call Make, and Make owns the Airtable connection.
