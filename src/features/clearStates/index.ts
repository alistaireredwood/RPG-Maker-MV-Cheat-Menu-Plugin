import { defineFeature } from '../../core/feature.ts';
import { updateMenu } from '../../core/ui/render.ts';
import { actorSelector } from '../../shared/controls/actorSelector.ts';
import { getSelectedActor } from '../../shared/state.ts';

function clearStates(actor: Game_Actor): void {
  if ((actor.states()?.length ?? 0) > 0) actor.clearStates();
}

function clearPartyStates(): void {
  $gameParty.allMembers().forEach(clearStates);
  SoundManager.playSystemSound(1);
}

function clearSelectedActorStates(): void {
  const actor = getSelectedActor();
  if (actor) clearStates(actor);
  SoundManager.playSystemSound(1);
  updateMenu();
}

export default defineFeature({
  id: 'clearStates',
  menus: [
    {
      id: 'clearStates',
      name: 'Clear States',
      render(ui) {
        ui.cheatTitle();
        ui.cheat('Clear Party States', 'Activate', clearPartyStates);
        const actor = actorSelector(ui);
        ui.title('Current State');
        ui.cheat(
          'Number Effects:',
          actor?.states()?.length ?? 0,
          clearSelectedActorStates,
        );
      },
    },
  ],
});
