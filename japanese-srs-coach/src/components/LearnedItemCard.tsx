import { FourPartLedger } from './FourPartLedger';
import type { LearnedItem } from '../lib/types';

const formatDate = (value: string | null) => value
  ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : 'Not reviewed yet';

export function LearnedItemCard({ item }: { item: LearnedItem }) {
  return (
    <article className="learned-card">
      <div className="learned-card__header">
        <div><span className="type-label">{item.type.replace('_', ' ')}</span><h3>{item.romaji}</h3></div>
        <span className={`familiarity familiarity--${item.familiarityLevel.replace(' ', '-')}`}>{item.familiarityLevel}</span>
      </div>
      <FourPartLedger item={item} compact />
      <div className="metadata-row"><span>{item.category}</span><span className={`status status--${item.status}`}>{item.status}</span></div>
      <div className="date-grid"><span><small>First learned</small>{formatDate(item.learnedAt)}</span><span><small>Last reviewed</small>{formatDate(item.lastReviewedAt)}</span></div>
      <div className="stats-row" aria-label="Learning statistics">
        <span><strong>{item.timesSeen}</strong><small>Seen</small></span>
        <span><strong>{item.timesCorrect}</strong><small>Right</small></span>
        <span><strong>{item.timesWrong}</strong><small>Wrong</small></span>
        <span><strong>{item.accuracyPercent}%</strong><small>Accuracy</small></span>
        <span><strong>{item.familiarityLevel}</strong><small>Familiarity</small></span>
      </div>
      <div className="tag-list">{item.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
    </article>
  );
}
