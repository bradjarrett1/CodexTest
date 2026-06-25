import { useEffect, useMemo, useState } from 'react';
import { groupLearnedItemsByCategory, searchLearnedItems, sortByMostRecent } from '../lib/learnedItems';
import { srsApi } from '../lib/srsApi';
import type { LearnedItem } from '../lib/types';
import { LearnedItemCard } from './LearnedItemCard';
import { LearnedItemsFilters, type TypeFilter } from './LearnedItemsFilters';

export function LearnedItemsPage() {
  const [items, setItems] = useState<LearnedItem[]>([]);
  const [view, setView] = useState<'recent' | 'categories'>('recent');
  const [query, setQuery] = useState('');
  const [type, setType] = useState<TypeFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    srsApi.getLearnedItems().then(setItems).catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not load learned items.')).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => searchLearnedItems(items, query, type), [items, query, type]);
  const grouped = useMemo(() => groupLearnedItemsByCategory(filtered), [filtered]);

  return (
    <section className="screen" aria-labelledby="learned-title">
      <header className="screen-header">
        <p className="eyebrow">Permanent learning record</p>
        <h1 id="learned-title">Learned items</h1>
        <p>Every stored concept keeps Romaji and English visible alongside Japanese writing.</p>
      </header>
      <div className="segmented" aria-label="Learned items view">
        <button className={view === 'recent' ? 'active' : ''} onClick={() => setView('recent')}>Recent</button>
        <button className={view === 'categories' ? 'active' : ''} onClick={() => setView('categories')}>Categories</button>
      </div>
      <LearnedItemsFilters query={query} onQueryChange={setQuery} selectedType={type} onTypeChange={setType} />
      {loading && <p className="panel">Loading your learning record…</p>}
      {error && <p className="error-message" role="alert">{error}</p>}
      {!loading && !error && !filtered.length && <p className="panel empty-state">No learned items match these filters.</p>}
      {view === 'recent' ? (
        <div className="card-list">{sortByMostRecent(filtered).map((item) => <LearnedItemCard key={item.conceptId} item={item} />)}</div>
      ) : (
        <div className="category-list">{Object.entries(grouped).map(([category, categoryItems]) => (
          <section key={category}><div className="category-heading"><h2>{category}</h2><span>{categoryItems.length}</span></div><div className="card-list">{categoryItems.map((item) => <LearnedItemCard key={item.conceptId} item={item} />)}</div></section>
        ))}</div>
      )}
    </section>
  );
}
