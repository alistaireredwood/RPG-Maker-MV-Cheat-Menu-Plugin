import { defineFeature } from '../core/feature.ts';

/** Preset amounts the amount selector steps through. */
export const AMOUNTS: readonly number[] = [
  1, 10, 100, 1000, 10000, 100000, 1000000,
];

/** State used by several menus (persisted in the `shared` save slice). */
export const sharedState = {
  /** actor id picked in the actor selector */
  selectedActor: 1,
  /** index into AMOUNTS */
  amountIndex: 0,
};

/** Amount typed into the amount field (runtime only, not saved). */
export const amountInput = {
  /** valid typed amount — overrides the preset while set */
  custom: null as number | null,
  /** raw field text while the user types (may be empty) */
  text: null as string | null,
  /** the field had focus before the last re-render */
  focused: false,
};

/** Amount the +/- actions apply: the typed one, else the selected preset. */
export const currentAmount = (): number =>
  amountInput.custom ?? AMOUNTS[sharedState.amountIndex];

export const getSelectedActor = (): Game_Actor | null =>
  $gameActors.actor(sharedState.selectedActor);

/**
 * Menu-less feature that persists `sharedState`. Register it in
 * `src/features.ts` (first, so it is restored before the features using it).
 */
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
