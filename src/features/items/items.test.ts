import { describe, expect, it } from 'vitest';
import feature from './index.ts';

describe('items feature', () => {
  it('keeps the menu / slice ids of the legacy version (save compatibility)', () => {
    expect(feature.id).toBe('items');
    expect(feature.menus.map((m) => m.id)).toEqual(['items']);
    expect(feature.state).toEqual({ selection: 1 });
  });

  it('migrates v1 itemSelection', () => {
    expect(feature.migrateV1?.({ itemSelection: 12 })).toEqual({
      selection: 12,
    });
    expect(feature.migrateV1?.({ weaponSelection: 3 })).toEqual({});
  });
});
