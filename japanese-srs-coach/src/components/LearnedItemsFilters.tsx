import type { ConceptType } from '../lib/types';

export type TypeFilter = ConceptType | 'all';

const filters: Array<{ value: TypeFilter; label: string }> = [
  { value: 'all', label: 'All' }, { value: 'vocab', label: 'Vocab' }, { value: 'grammar', label: 'Grammar' },
  { value: 'phrase', label: 'Phrases' }, { value: 'pronunciation', label: 'Pronunciation' },
  { value: 'kana', label: 'Kana' }, { value: 'kanji', label: 'Kanji' },
  { value: 'side_question', label: 'Side Questions' }, { value: 'advanced_early', label: 'Advanced Early' },
];

export function LearnedItemsFilters({
  query, onQueryChange, selectedType, onTypeChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  selectedType: TypeFilter;
  onTypeChange: (value: TypeFilter) => void;
}) {
  return (
    <div className="filters">
      <label htmlFor="learned-search" className="sr-only">Search learned items</label>
      <input id="learned-search" type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search Romaji, English, Japanese, category, or tag" />
      <div className="chip-row" aria-label="Filter learned items by type">
        {filters.map((filter) => (
          <button key={filter.value} className={`chip ${selectedType === filter.value ? 'chip--active' : ''}`} onClick={() => onTypeChange(filter.value)}>{filter.label}</button>
        ))}
      </div>
    </div>
  );
}
