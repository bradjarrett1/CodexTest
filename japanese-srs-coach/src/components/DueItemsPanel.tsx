import type { LearnedItem } from '../lib/types';

export function DueItemsPanel({ items, loading = false }: { items: LearnedItem[]; loading?: boolean }) {
  return (
    <section className="panel" aria-labelledby="due-heading">
      <div className="panel__heading-row">
        <div>
          <p className="eyebrow">Review queue</p>
          <h2 id="due-heading">Today’s due items</h2>
        </div>
        <span className="count-badge">{loading ? '…' : items.length}</span>
      </div>
      {loading ? <p className="muted">Loading due items…</p> : items.length ? (
        <ul className="due-list">
          {items.slice(0, 4).map((item) => (
            <li key={item.conceptId}>
              <span><strong>{item.romaji}</strong><small>{item.english}</small></span>
              <span className={`status status--${item.status}`}>{item.status}</span>
            </li>
          ))}
        </ul>
      ) : <p className="empty-state">Nothing is due now. A short practice session can introduce the next step.</p>}
    </section>
  );
}
