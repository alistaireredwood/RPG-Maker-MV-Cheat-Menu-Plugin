import type { ActionKey } from '@src/core/input/keymap.ts';
import type { MenuBuilder } from '@src/core/ui/builder.ts';
import { updateMenu } from '@src/core/ui/render.ts';
import {
  appendScrollSelector,
  type Direction,
} from '@src/core/ui/widgets/scrollSelector.ts';
import { appendTitle } from '@src/core/ui/widgets/text.ts';
import { stepActorId } from '@src/shared/game/actors.ts';
import { escapeHtml } from '@src/shared/html.ts';
import {
  getListedActorIds,
  getSelectedActor,
  sharedState,
} from '@src/shared/state.ts';

export function scrollActor(direction: Direction): void {
  const next = stepActorId(
    sharedState.selectedActor,
    getListedActorIds(),
    direction === 'left' ? -1 : 1,
  );
  if (next !== null) sharedState.selectedActor = next;

  if (SoundManager) SoundManager.playSystemSound(0);
  updateMenu();
}

export function appendActorSelection(key1: ActionKey, key2: ActionKey): void {
  appendTitle('Actor');

  let actorNameDisplay;
  const actor = getSelectedActor();

  if (actor && actor.name()) {
    actorNameDisplay = `<span class='actor-name-highlight'>${escapeHtml(actor.name())}</span>`;
  } else {
    actorNameDisplay = `<span class="error-text">NULL</span>`;
  }

  appendScrollSelector(actorNameDisplay, key1, key2, scrollActor, true);
}

/** Takes 2 keys. */
export function actorSelector(ui: MenuBuilder): Game_Actor | null {
  appendActorSelection(ui.nextKey(), ui.nextKey());
  return getSelectedActor();
}
