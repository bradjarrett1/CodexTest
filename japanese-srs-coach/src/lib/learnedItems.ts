import type { ConceptType, FamiliarityLevel, LearnedItem } from './types';

export const CATEGORY_ORDER = [
  'Greetings', 'Food', 'Drinks', 'Animals', 'People', 'Family', 'Places', 'Home', 'Work',
  'Weather', 'Time', 'Travel', 'Verbs', 'Adjectives', 'Particles', 'Grammar Patterns',
  'Questions', 'Politeness', 'Pronunciation', 'Kana', 'Kanji', 'Advanced / Deferred',
  'Uncategorized',
];

export const calculateAccuracy = (timesSeen: number, timesCorrect: number): number =>
  timesSeen > 0 ? Math.round((timesCorrect / timesSeen) * 100) : 0;

export const calculateFamiliarity = (timesSeen: number, accuracyPercent: number): FamiliarityLevel => {
  if (timesSeen >= 15 && accuracyPercent >= 95) return 'pro';
  if (timesSeen >= 10 && accuracyPercent >= 85) return 'great';
  if (timesSeen >= 7 && accuracyPercent >= 75) return 'good';
  if (timesSeen >= 5 && accuracyPercent >= 60) return 'well';
  if (timesSeen >= 3 && accuracyPercent >= 40) return 'fairly well';
  return 'low';
};

export const normalizeAnswer = (value: string): string =>
  value
    .toLocaleLowerCase()
    .normalize('NFKC')
    .replace(/[.,!?;:'"“”‘’()[\]{}]/g, ' ')
    .replace(/\bwo\b/g, 'o')
    .replace(/ō/g, 'ou')
    .replace(/ū/g, 'uu')
    .replace(/\s+/g, ' ')
    .trim();

const editDistance = (left: string, right: string): number => {
  const rows = Array.from({ length: left.length + 1 }, () => Array(right.length + 1).fill(0));
  for (let i = 0; i <= left.length; i += 1) rows[i][0] = i;
  for (let j = 0; j <= right.length; j += 1) rows[0][j] = j;
  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      rows[i][j] = Math.min(
        rows[i - 1][j] + 1,
        rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1),
      );
    }
  }
  return rows[left.length][right.length];
};

export const answerSimilarity = (answer: string, expected: string): number => {
  const left = normalizeAnswer(answer);
  const right = normalizeAnswer(expected);
  if (!left || !right) return 0;
  return 1 - editDistance(left, right) / Math.max(left.length, right.length);
};

export const searchLearnedItems = (
  items: LearnedItem[],
  query: string,
  type: ConceptType | 'all',
): LearnedItem[] => {
  const normalizedQuery = normalizeAnswer(query);
  return items.filter((item) => {
    if (type !== 'all' && item.type !== type) return false;
    if (!normalizedQuery) return true;
    const searchable = [
      item.romaji,
      item.kana,
      item.fullJapanese,
      item.english,
      item.category,
      item.type,
      ...item.tags,
    ].join(' ').toLocaleLowerCase().normalize('NFKC');
    return searchable.includes(normalizedQuery);
  });
};

export const sortByMostRecent = (items: LearnedItem[]): LearnedItem[] =>
  [...items].sort((a, b) => Date.parse(b.learnedAt) - Date.parse(a.learnedAt));

export const groupLearnedItemsByCategory = (items: LearnedItem[]): Record<string, LearnedItem[]> => {
  const groups: Record<string, LearnedItem[]> = {};
  for (const item of sortByMostRecent(items)) {
    const category = item.category?.trim() || 'Uncategorized';
    (groups[category] ??= []).push(item);
  }
  return Object.fromEntries(
    Object.entries(groups).sort(([left], [right]) => {
      const leftIndex = CATEGORY_ORDER.indexOf(left);
      const rightIndex = CATEGORY_ORDER.indexOf(right);
      const safeLeft = leftIndex === -1 ? CATEGORY_ORDER.length - 1 : leftIndex;
      const safeRight = rightIndex === -1 ? CATEGORY_ORDER.length - 1 : rightIndex;
      return safeLeft - safeRight || left.localeCompare(right);
    }),
  );
};

export const assertFourPartLedger = (item: Pick<LearnedItem, 'romaji' | 'kana' | 'fullJapanese' | 'english'>): void => {
  const missing = (['romaji', 'kana', 'fullJapanese', 'english'] as const).filter((field) => !item[field]?.trim());
  if (missing.length) throw new Error(`Four-part ledger is incomplete: ${missing.join(', ')}`);
};
