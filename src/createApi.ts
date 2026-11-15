import { API_VERSION, type CheatMenuApi } from '@src/api.ts';
import { patchMethod } from '@src/core/engine/patch.ts';
import { updateMenu } from '@src/core/ui/render.ts';
import { actorSelector } from '@src/shared/controls/actorSelector.ts';
import {
  amountSelector,
  makeApplyAmount,
} from '@src/shared/controls/amountSelector.ts';
import { inventorySection } from '@src/shared/controls/inventorySection.ts';
import { makeScroll, nameMatches } from '@src/shared/controls/listSelector.ts';
import { resourceCheats } from '@src/shared/controls/resourceCheats.ts';
import { onOffLabel, playToggleSound } from '@src/shared/controls/status.ts';
import { makeSetExact } from '@src/shared/game/numbers.ts';
import { changeResource } from '@src/shared/game/resources.ts';
import { systemNameLabels } from '@src/shared/game/systemNames.ts';
import { teleport } from '@src/shared/game/teleport.ts';
import { defineInventoryFeature } from '@src/shared/inventoryFeature.ts';
import { currentAmount, getSelectedActor } from '@src/shared/state.ts';

/** Frozen, so one extension can't swap functions under another. */
export function createApi(): CheatMenuApi {
  return Object.freeze({
    version: API_VERSION,
    defineFeature: (feature) => feature,
    defineInventoryFeature: (config) => defineInventoryFeature(config),
    patchMethod,
    updateMenu,
    controls: Object.freeze({
      actorSelector,
      amountSelector,
      makeApplyAmount,
      inventorySection,
      resourceCheats,
      onOffLabel,
      playToggleSound,
      makeScroll,
      nameMatches,
    }),
    game: Object.freeze({
      teleport,
      changeResource,
      makeSetExact,
      systemNameLabels,
    }),
    state: Object.freeze({ getSelectedActor, currentAmount }),
  } satisfies CheatMenuApi);
}
