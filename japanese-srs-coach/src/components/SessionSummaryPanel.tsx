import type { SessionSummary } from '../lib/types';

export function SessionSummaryPanel({ summary }: { summary: SessionSummary | null }) {
  return (
    <section className="panel" aria-labelledby="summary-heading">
      <p className="eyebrow">Last session</p>
      <h2 id="summary-heading">Session summary</h2>
      {!summary ? <p className="empty-state">Your first completed session will appear here.</p> : (
        <div className="summary-grid">
          <div><strong>{summary.conceptsReviewed.length}</strong><span>reviewed</span></div>
          <div><strong>{summary.wins.length}</strong><span>wins</span></div>
          <div><strong>{summary.mistakes.length}</strong><span>focus areas</span></div>
          <p>{summary.notes}</p>
          {summary.nextSessionPlan[0] && <p className="callout"><strong>Next:</strong> {summary.nextSessionPlan[0]}</p>}
        </div>
      )}
    </section>
  );
}
