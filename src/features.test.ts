import { describe, expect, it } from 'vitest';
import { features, V1_MENU_ORDER } from '@src/features.ts';
import { migrateV1 } from '@src/core/persistence.ts';

const ctx = { features, v1MenuOrder: V1_MENU_ORDER };

describe('feature list', () => {
  it('has unique feature and menu ids', () => {
    const featureIds = features.map((f) => f.id);
    const menuIds = features.flatMap((f) => f.menus.map((m) => m.id));
    expect(new Set(featureIds).size).toBe(featureIds.length);
    expect(new Set(menuIds).size).toBe(menuIds.length);
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
