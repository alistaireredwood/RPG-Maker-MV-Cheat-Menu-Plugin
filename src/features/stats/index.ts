import { defineFeature } from '@src/core/feature.ts';
import { renameV1Keys } from '@src/core/persistence.ts';
import { updateMenu } from '@src/core/ui/render.ts';
import type { Direction } from '@src/core/ui/widgets/scrollSelector.ts';
import { actorSelector } from '@src/shared/controls/actorSelector.ts';
import {
  amountSelector,
  makeApplyAmount,
} from '@src/shared/controls/amountSelector.ts';
import { makeSetExact } from '@src/shared/game/numbers.ts';
import { getSelectedActor, sharedState } from '@src/shared/state.ts';

const state = {
  selection: 0,
};

const paramPlusOf = (actor: Game_Actor | null) =>
  (actor as unknown as { _paramPlus?: number[] } | null)?._paramPlus;

function giveStat(actor: Game_Actor | null, paramId: number, amount: number) {
  if (actor && actor.paramPlus(paramId) != undefined) {
    actor.addParam(paramId, amount);
  }
}

const applyAmount = makeApplyAmount((amount) =>
  giveStat(getSelectedActor(), state.selection, amount),
);

function scrollStat(direction: Direction): void {
  const count = paramPlusOf(getSelectedActor())?.length;
  if (!count) {
    state.selection = 0;
  } else if (direction === 'left') {
    state.selection = state.selection <= 0 ? count - 1 : state.selection - 1;
  } else {
    state.selection = state.selection >= count - 1 ? 0 : state.selection + 1;
  }
  SoundManager.playSystemSound(0);
  updateMenu();
}

export default defineFeature({
  id: 'stats',
  state,
  migrateV1: (v1) =>
    renameV1Keys<typeof state>(v1, { selection: 'statSelection' }),
  menus: [
    {
      id: 'stats',
      name: 'Stats',
      render(ui) {
        ui.cheatTitle();
        const actor = actorSelector(ui);
        amountSelector(ui);

        const paramPlus = paramPlusOf(actor);
        if (actor && paramPlus && state.selection >= paramPlus.length) {
          state.selection = 0;
        }
        const paramId = state.selection;

        ui.title('Stat');
        ui.scrollSelector(
          actor && paramPlus ? $dataSystem.terms.params[paramId] : '',
          scrollStat,
          { selectable: true },
        );

        if (actor && typeof paramPlus?.[paramId] === 'number') {
          ui.valueInput(
            String(paramPlus[paramId]),
            `stat:${sharedState.selectedActor}:${paramId}`,
            makeSetExact(
              () => actor.paramPlus(paramId),
              (delta) => giveStat(actor, paramId, delta),
            ),
            applyAmount,
          );
        } else {
          ui.scrollSelector('NULL', applyAmount);
        }
      },
    },
  ],
});
