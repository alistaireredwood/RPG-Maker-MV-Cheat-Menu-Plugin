import { defineFeature } from '@src/core/feature.ts';

export const AMOUNTS: readonly number[] = [
  1, 10, 100, 1000, 10000, 100000, 1000000,
];

/** Persisted in the `shared` save slice. */
export const sharedState = {
  selectedActor: 1,
  amountIndex: 0,
};

/** Runtime only, not saved. */
export const amountInput = {
  /** valid typed amount — overrides the preset while set */
  custom: null as number | null,
  /** raw field text while the user types (may be empty) */
  text: null as string | null,
  /** the field had focus before the last re-render */
  focused: false,
};

export const currentAmount = (): number =>
  amountInput.custom ?? AMOUNTS[sharedState.amountIndex];

export const getSelectedActor = (): Game_Actor | null =>
  $gameActors.actor(sharedState.selectedActor);

export const sharedFeature = defineFeature({
  id: 'shared',
  state: sharedState,
  menus: [],
  migrateV1(v1) {
    const slice: Partial<typeof sharedState> = {};
    if (typeof v1.cheatSelectedActor === 'number') {
      slice.selectedActor = v1.cheatSelectedActor;
    }
    if (typeof v1.amountIndex === 'number') slice.amountIndex = v1.amountIndex;
    return slice;
  },
});
