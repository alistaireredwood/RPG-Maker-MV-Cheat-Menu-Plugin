import { defineFeature } from '../../core/feature.ts';
import { resourceCheats } from '../../shared/controls/resourceCheats.ts';
import { changeResource } from '../../shared/game/resources.ts';

export default defineFeature({
  id: 'enemyRecovery',
  menus: [
    {
      id: 'enemyRecovery',
      name: 'Enemy HP',
      render(ui) {
        ui.cheatTitle();
        resourceCheats(ui, 'Enemy', 'HP', (change, aliveOnly) => {
          changeResource($gameTroop.members(), 'HP', change, aliveOnly);
          // setHp() alone doesn't end the battle — the engine only checks for
          // victory/defeat at specific points in the turn flow, not every
          // frame, so killing enemies from the menu (e.g. while an actor
          // command window is open) would leave the battle stuck
          if ($gameParty.inBattle()) BattleManager.checkBattleEnd();
        });
      },
    },
  ],
});
