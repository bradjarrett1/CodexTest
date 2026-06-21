import { dataMode, learnerId } from '../lib/srsApi';
import { vapiClient } from '../lib/vapiClient';

const endpointNames = [
  'VITE_GET_LEARNER_PROFILE_URL', 'VITE_GET_DUE_ITEMS_URL', 'VITE_GET_LEARNED_ITEMS_URL',
  'VITE_GET_LEARNED_ITEMS_BY_CATEGORY_URL', 'VITE_GET_LEARNED_ITEM_DETAIL_URL', 'VITE_LOG_ATTEMPT_URL',
  'VITE_UPSERT_CONCEPT_URL', 'VITE_UPDATE_SRS_STATE_URL', 'VITE_UPDATE_LEARNED_ITEM_STATS_URL',
  'VITE_GET_SESSION_SUMMARY_URL', 'VITE_SAVE_SESSION_SUMMARY_URL', 'VITE_SAVE_ASSESSMENT_RESULT_URL',
] as const;

export function SettingsPanel() {
  const configuredEndpoints = endpointNames.filter((name) => Boolean(import.meta.env[name])).length;
  return (
    <section className="panel">
      <p className="eyebrow">Read-only configuration</p>
      <h2>Settings</h2>
      <dl className="settings-list">
        <div><dt>Data mode</dt><dd>{dataMode}</dd></div>
        <div><dt>Learner ID</dt><dd>{learnerId}</dd></div>
        <div><dt>Make endpoints</dt><dd>{configuredEndpoints} / {endpointNames.length}</dd></div>
        <div><dt>Vapi credentials</dt><dd>{vapiClient.isConfigured() ? 'Configured' : 'Not configured'}</dd></div>
        <div><dt>PWA cache</dt><dd>{import.meta.env.PROD ? 'Production service worker enabled' : 'Disabled during development'}</dd></div>
      </dl>
      <p className="integration-note">Vite variables are bundled into the browser. Store Airtable credentials only in Make, never here.</p>
    </section>
  );
}
