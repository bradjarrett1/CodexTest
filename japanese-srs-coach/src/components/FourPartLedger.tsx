import type { FourPartLedger as Ledger } from '../lib/types';

export function FourPartLedger({ item, compact = false }: { item: Ledger; compact?: boolean }) {
  return (
    <dl className={`ledger ${compact ? 'ledger--compact' : ''}`} aria-label="Four-part Japanese learning ledger">
      <div><dt>Romaji</dt><dd>{item.romaji}</dd></div>
      <div><dt>Hiragana / Katakana</dt><dd lang="ja">{item.kana}</dd></div>
      <div><dt>Full Japanese</dt><dd lang="ja">{item.fullJapanese}</dd></div>
      <div><dt>English</dt><dd>{item.english}</dd></div>
    </dl>
  );
}
