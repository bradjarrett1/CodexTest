import { describe, expect, it } from 'vitest';
import { createMockSrsApi, type StorageLike } from './mockSrsApi';

class TestStorage implements StorageLike {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

describe('mock SRS API', () => {
  it('seeds required items and persists stat updates across instances', async () => {
    const storage = new TestStorage();
    const first = createMockSrsApi('learner', storage);
    const learned = await first.getLearnedItems();
    expect(learned.length).toBeGreaterThanOrEqual(20);
    expect(learned.find((item) => item.conceptId === 'vocab-ame')).toMatchObject({ romaji: 'ame', kana: 'あめ', fullJapanese: '雨', english: 'rain' });
    const before = await first.getLearnedItemDetail('vocab-mizu');
    await first.updateLearnedItemStats('vocab-mizu', { result: 'correct' });
    const second = createMockSrsApi('learner', storage);
    const after = await second.getLearnedItemDetail('vocab-mizu');
    expect(after!.timesSeen).toBe(before!.timesSeen + 1);
  });
});
