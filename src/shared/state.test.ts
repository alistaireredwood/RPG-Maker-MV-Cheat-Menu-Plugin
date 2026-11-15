import { describe, expect, it } from 'vitest';
import { sharedFeature, sharedState } from './state.ts';

describe('sharedFeature', () => {
  it('persists sharedState itself (live object)', () => {
    expect(sharedFeature.state).toBe(sharedState);
    expect(sharedFeature.menus).toEqual([]);
  });

  it('migrates the v1 actor / amount fields', () => {
    expect(
      sharedFeature.migrateV1?.({
        cheatSelectedActor: 3,
        amountIndex: 2,
        itemSelection: 9,
      }),
    ).toEqual({ selectedActor: 3, amountIndex: 2 });
  });

  it('ignores missing or malformed v1 fields', () => {
    expect(sharedFeature.migrateV1?.({ cheatSelectedActor: 'x' })).toEqual({});
  });
});
