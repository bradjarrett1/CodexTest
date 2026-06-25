/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_MODE?: 'mock' | 'webhook';
  readonly VITE_LEARNER_ID?: string;
  readonly VITE_GET_LEARNER_PROFILE_URL?: string;
  readonly VITE_GET_DUE_ITEMS_URL?: string;
  readonly VITE_GET_LEARNED_ITEMS_URL?: string;
  readonly VITE_GET_LEARNED_ITEMS_BY_CATEGORY_URL?: string;
  readonly VITE_GET_LEARNED_ITEM_DETAIL_URL?: string;
  readonly VITE_LOG_ATTEMPT_URL?: string;
  readonly VITE_UPSERT_CONCEPT_URL?: string;
  readonly VITE_UPDATE_SRS_STATE_URL?: string;
  readonly VITE_UPDATE_LEARNED_ITEM_STATS_URL?: string;
  readonly VITE_GET_SESSION_SUMMARY_URL?: string;
  readonly VITE_SAVE_SESSION_SUMMARY_URL?: string;
  readonly VITE_SAVE_ASSESSMENT_RESULT_URL?: string;
  readonly VITE_VAPI_PUBLIC_KEY?: string;
  readonly VITE_VAPI_ASSISTANT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
