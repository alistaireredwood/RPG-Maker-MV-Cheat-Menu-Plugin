import { describe, expect, it, vi } from 'vitest';
import {
  migrate,
  migrateV1,
  readSlice,
  renameV1Keys,
  SAVE_VERSION,
  writeSave,
  type MigrationContext,
} from './persistence.ts';

const ctx: MigrationContext = {
  v1MenuOrder: ['teleport', 'godMode', 'items'],
  features: [
    {
      id: 'items',
      migrateV1: (v1) =>
        'itemSelection' in v1 ? { selection: v1.itemSelection } : {},
    },
    {
      id: 'godMode',
      migrateV1: (v1) =>
        'godModeActors' in v1 ? { actors: v1.godModeActors } : {},
    },
    { id: 'noClip' },
  ],
};

describe('migrateV1', () => {
  it('maps flat v1 fields to core + feature slices', () => {
    const data = migrateV1(
      {
        position: 3,
        currentMenuIndex: 1,
        itemSelection: 12,
        godModeActors: [1, 3],
        somethingUnknown: true,
      },
      ctx,
    );

    expect(data).toEqual({
      version: SAVE_VERSION,
      core: { position: 3, currentMenuId: 'godMode' },
      items: { selection: 12 },
      godMode: { actors: [1, 3] },
    });
  });

  it('maps an out-of-range menu index to the main grid', () => {
    expect(migrateV1({ currentMenuIndex: 99 }, ctx).core).toEqual({
      currentMenuId: null,
    });
  });

  it('skips features whose migration throws', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const data = migrateV1(
      { itemSelection: 2 },
      {
        ...ctx,
        features: [
          ...ctx.features,
          {
            id: 'broken',
            migrateV1: () => {
              throw new Error('boom');
            },
          },
        ],
      },
    );
    expect(data.items).toEqual({ selection: 2 });
    expect(data.broken).toBeUndefined();
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it('does not alias arrays of the v1 object', () => {
    const v1 = { godModeActors: [1] };
    const data = migrateV1(v1, ctx);
    (data.godMode as { actors: number[] }).actors.push(2);
    expect(v1.godModeActors).toEqual([1]);
  });
});

describe('migrate', () => {
  it('returns null when nothing is stored', () => {
    expect(migrate(undefined, ctx)).toBeNull();
    expect(migrate(null, ctx)).toBeNull();
    expect(migrate([], ctx)).toBeNull();
  });

  it('passes v2 data through', () => {
    const v2 = { version: SAVE_VERSION, core: { position: 2 } };
    expect(migrate(v2, ctx)).toBe(v2);
  });

  it('migrates data without a version as v1', () => {
    expect(migrate({ itemSelection: 5 }, ctx)?.items).toEqual({ selection: 5 });
  });

  it('treats an empty v1 object (old save of a never-opened menu) as v1', () => {
    expect(migrate({}, ctx)).toEqual({ version: SAVE_VERSION, core: {} });
  });

  it('rejects unknown versions instead of guessing', () => {
    expect(migrate({ version: 99, core: {} }, ctx)).toBeNull();
  });
});

describe('readSlice', () => {
  const defaults = { selection: 1, list: [0] };

  it('returns a copy of the defaults when nothing is saved', () => {
    const slice = readSlice(defaults, undefined);
    expect(slice).toEqual(defaults);
    slice.list.push(1);
    expect(defaults.list).toEqual([0]);
  });

  it('takes known keys from the save and ignores unknown ones', () => {
    expect(readSlice(defaults, { selection: 7, extra: 'x' })).toEqual({
      selection: 7,
      list: [0],
    });
  });

  it('does not alias saved arrays', () => {
    const saved = { list: [5] };
    readSlice(defaults, saved).list.push(6);
    expect(saved.list).toEqual([5]);
  });

  it('ignores a non-object slice', () => {
    expect(readSlice(defaults, 42)).toEqual(defaults);
  });
});

describe('writeSave', () => {
  it('writes core and live slices', () => {
    expect(
      writeSave(
        null,
        { position: 2, currentMenuId: 'items' },
        {
          items: { selection: 3 },
        },
      ),
    ).toEqual({
      version: SAVE_VERSION,
      core: { position: 2, currentMenuId: 'items' },
      items: { selection: 3 },
    });
  });

  it('keeps slices of features that are not registered anymore', () => {
    const previous = {
      version: SAVE_VERSION,
      core: { position: 1 },
      removedFeature: { foo: 1 },
      items: { selection: 1 },
    } as const;
    const data = writeSave(
      previous,
      { position: 4, currentMenuId: null },
      { items: { selection: 9 } },
    );
    expect(data.removedFeature).toEqual({ foo: 1 });
    expect(data.items).toEqual({ selection: 9 });
    expect(data.core).toEqual({ position: 4, currentMenuId: null });
  });

  it('copies live slices so later mutations do not leak into the save', () => {
    const live = { selection: [1] };
    const data = writeSave(
      null,
      { position: 1, currentMenuId: null },
      {
        items: live,
      },
    );
    live.selection.push(2);
    expect(data.items).toEqual({ selection: [1] });
  });
});

describe('renameV1Keys', () => {
  it('copies present v1 keys under their slice names', () => {
    expect(
      renameV1Keys<{ selection: number; slot: number }>(
        { itemSelection: 4, other: 1 },
        { selection: 'itemSelection', slot: 'saveSlotSelection' },
      ),
    ).toEqual({ selection: 4 });
  });
});
