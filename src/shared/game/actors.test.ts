import { describe, expect, it } from 'vitest';
import { listedActorIds, resolveActorId, stepActorId } from './actors.ts';

const created = (name: string) => ({ name: () => name });

describe('listedActorIds', () => {
  it('skips id 0, missing entries and blank names', () => {
    const data = [null, { name: 'Actor A' }, { name: '' }, null, { name: ' ' }];
    expect(listedActorIds(data, [])).toEqual([1]);
  });

  it('uses the in-game name of created actors', () => {
    const data = [null, { name: '' }, { name: 'Actor B' }];
    expect(
      listedActorIds(data, [null, created('Renamed'), created('')]),
    ).toEqual([1]);
  });

  it('ignores created actors without a database entry', () => {
    expect(listedActorIds([null], [null, created('Ghost')])).toEqual([]);
  });
});

describe('resolveActorId', () => {
  it('keeps a listed id, otherwise falls back to the first one', () => {
    expect(resolveActorId(3, [1, 3])).toBe(3);
    expect(resolveActorId(0, [2, 3])).toBe(2);
    expect(resolveActorId(5, [])).toBeNull();
  });
});

describe('stepActorId', () => {
  const ids = [1, 4, 7];

  it('moves over listed ids only and wraps around', () => {
    expect(stepActorId(1, ids, 1)).toBe(4);
    expect(stepActorId(7, ids, 1)).toBe(1);
    expect(stepActorId(1, ids, -1)).toBe(7);
  });

  it('an unlisted id jumps to the first listed one', () => {
    expect(stepActorId(2, ids, 1)).toBe(1);
    expect(stepActorId(2, [], 1)).toBeNull();
  });
});
