import { describe, expect, it } from 'vitest';
import { features, V1_MENU_ORDER } from '@src/features.ts';
import { clone, migrateV1, readSlice } from '@src/core/persistence.ts';

const ctx = { features, v1MenuOrder: V1_MENU_ORDER };

describe('feature list', () => {
  it('has unique feature and menu ids', () => {
    const featureIds = features.map((f) => f.id);
    const menuIds = features.flatMap((f) => f.menus.map((m) => m.id));
    expect(new Set(featureIds).size).toBe(featureIds.length);
    expect(new Set(menuIds).size).toBe(menuIds.length);
  });

  it('default grid groups: the risky tools are Advanced, the rest Basic', () => {
    const advanced = features
      .flatMap((f) => f.menus)
      .filter((m) => m.tier === 'advanced')
      .map((m) => m.id);
    expect(advanced.sort()).toEqual(
      [
        'evaluate',
        'saveGame',
        'saveRecall',
        'switches',
        'teleport',
        'unlockControls',
        'variables',
      ].sort(),
    );
  });

  it('every v1 menu id still exists', () => {
    const menuIds = features.flatMap((f) => f.menus.map((m) => m.id));
    expect(menuIds).toEqual(expect.arrayContaining([...V1_MENU_ORDER]));
  });
});

describe('v1 save migration (same slices the legacy adapters produced)', () => {
  const position = { m: 2, x: 3, y: 4 };
  const v1 = {
    position: 4,
    currentMenuIndex: 14,
    cheatSelectedActor: 2,
    amountIndex: 3,
    teleportLocation: position,
    savedPositions: [position, position, position],
    speed: 6,
    speedUnlocked: false,
    moveAmountIndex: 2,
    switchSelection: 7,
    variableSelection: 8,
    godModeActors: [1, 2],
    itemSelection: 9,
    weaponSelection: 10,
    armorSelection: 11,
    statSelection: 5,
    forceMouseMovement: true,
    forceCtrlSkip: true,
    saveSlotSelection: 12,
  };

  it('maps every v1 field', () => {
    expect(migrateV1(v1, ctx)).toEqual({
      version: 2,
      core: { position: 4, currentMenuId: 'items' },
      shared: { selectedActor: 2, amountIndex: 3 },
      teleport: { location: position },
      saveRecall: { positions: [position, position, position] },
      speed: { speed: 6, unlocked: false, moveAmountIndex: 2 },
      switches: { selection: 7 },
      variables: { selection: 8 },
      godMode: { actors: [1, 2] },
      items: { selection: 9 },
      weapons: { selection: 10 },
      armors: { selection: 11 },
      stats: { selection: 5 },
      unlockControls: { forceMouseMovement: true, forceCtrlSkip: true },
      saveGame: { slot: 12 },
    });
  });

  it('migrated slices only use keys of the feature state', () => {
    const data = migrateV1(v1, ctx);
    for (const feature of features) {
      const slice = data[feature.id];
      if (!slice) continue;
      expect(Object.keys(feature.state ?? {})).toEqual(
        expect.arrayContaining(Object.keys(slice)),
      );
    }
  });
});

describe('Variables filter in saves (per save)', () => {
  const variables = features.find((f) => f.id === 'variables')!;
  const defaults = clone(variables.state!) as Record<string, unknown>;
  const defaultFilter = {
    showUnnamed: false,
    hideFalsy: false,
    types: [],
    min: null,
    max: null,
  };

  // what the registry + session do on the first menu open after a load
  const restore = (saved: unknown) => {
    const live = variables.state as Record<string, unknown>;
    for (const key of Object.keys(live)) delete live[key];
    Object.assign(live, readSlice(defaults, saved));
    variables.onStateRestored?.(live);
    return live;
  };

  it('a save without `filter` (older plugin version) gets the default filter', () => {
    expect(restore({ selection: 8 })).toEqual({
      selection: 8,
      filter: defaultFilter,
    });
  });

  it('a broken `filter` falls back to the defaults', () => {
    expect(restore({ selection: 3, filter: 'broken' }).filter).toEqual(
      defaultFilter,
    );
    expect(
      restore({ filter: { showUnnamed: 1, types: [42], min: 'x', max: 5 } })
        .filter,
    ).toEqual({ ...defaultFilter, max: 5 });
  });

  it('a saved filter is restored', () => {
    const filter = {
      showUnnamed: true,
      hideFalsy: true,
      types: ['number'],
      min: 1,
      max: null,
    };
    expect(restore({ filter }).filter).toEqual(filter);
  });

  it('a new game starts with the default filter', () => {
    restore({ filter: { ...defaultFilter, hideFalsy: true } });
    expect(restore(undefined).filter).toEqual(defaultFilter);
  });
});
