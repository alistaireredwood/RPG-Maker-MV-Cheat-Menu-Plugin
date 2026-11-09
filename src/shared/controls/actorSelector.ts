import CheatMenu from '../../CheatMenu.ts';
import type { ActionKey } from '../../core/input/keymap.ts';
import { updateMenu } from '../../core/ui/render.ts';
import {
  appendScrollSelector,
  type Direction,
} from '../../core/ui/widgets/scrollSelector.ts';
import { appendTitle } from '../../core/ui/widgets/text.ts';

// selection lives in CheatMenu.cheatSelectedActor until shared/state.ts exists

export function scrollActor(direction: Direction): void {
  const gameActorsData = ($gameActors as unknown as { _data: Game_Actor[] })
    ._data;

  if (direction == 'left') {
    CheatMenu.cheatSelectedActor--;

    if (CheatMenu.cheatSelectedActor < 0) {
      CheatMenu.cheatSelectedActor =
        gameActorsData && gameActorsData.length > 0
          ? gameActorsData.length - 1
          : 0;
    }
  } else {
    CheatMenu.cheatSelectedActor++;
    if (
      gameActorsData &&
      CheatMenu.cheatSelectedActor >= gameActorsData.length
    ) {
      CheatMenu.cheatSelectedActor = 0;
    }
  }

  if (SoundManager) SoundManager.playSystemSound(0);
  updateMenu();
}

export function appendActorSelection(key1: ActionKey, key2: ActionKey): void {
  appendTitle('Actor');

  let actorNameDisplay;
  const actor = $gameActors.actor(CheatMenu.cheatSelectedActor);

  if (actor && actor.name()) {
    actorNameDisplay = `<span class='actor-name-highlight'>${actor.name()}</span>`;
  } else {
    actorNameDisplay = `<span class="error-text">NULL</span>`;
  }

  appendScrollSelector(actorNameDisplay, key1, key2, scrollActor, true);
}
