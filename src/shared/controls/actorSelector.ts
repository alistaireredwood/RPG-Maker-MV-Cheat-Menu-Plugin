import type { ActionKey } from '../../core/input/keymap.ts';
import type { MenuBuilder } from '../../core/ui/builder.ts';
import { updateMenu } from '../../core/ui/render.ts';
import {
  appendScrollSelector,
  type Direction,
} from '../../core/ui/widgets/scrollSelector.ts';
import { appendTitle } from '../../core/ui/widgets/text.ts';
import { getSelectedActor, sharedState } from '../state.ts';

export function scrollActor(direction: Direction): void {
  const gameActorsData = ($gameActors as unknown as { _data: Game_Actor[] })
    ._data;

  if (direction == 'left') {
    sharedState.selectedActor--;

    if (sharedState.selectedActor < 0) {
      sharedState.selectedActor =
        gameActorsData && gameActorsData.length > 0
          ? gameActorsData.length - 1
          : 0;
    }
  } else {
    sharedState.selectedActor++;
    if (gameActorsData && sharedState.selectedActor >= gameActorsData.length) {
      sharedState.selectedActor = 0;
    }
  }

  if (SoundManager) SoundManager.playSystemSound(0);
  updateMenu();
}

export function appendActorSelection(key1: ActionKey, key2: ActionKey): void {
  appendTitle('Actor');

  let actorNameDisplay;
  const actor = getSelectedActor();

  if (actor && actor.name()) {
    actorNameDisplay = `<span class='actor-name-highlight'>${actor.name()}</span>`;
  } else {
    actorNameDisplay = `<span class="error-text">NULL</span>`;
  }

  appendScrollSelector(actorNameDisplay, key1, key2, scrollActor, true);
}

/** MenuBuilder variant: takes 2 keys (←/→). Returns the selected actor. */
export function actorSelector(ui: MenuBuilder): Game_Actor | null {
  appendActorSelection(ui.nextKey(), ui.nextKey());
  return getSelectedActor();
}
