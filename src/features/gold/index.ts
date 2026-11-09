import { defineFeature } from '../../core/feature.ts';
import {
  amountSelector,
  makeApplyAmount,
} from '../../shared/controls/amountSelector.ts';
import { makeSetExact } from '../../shared/game/numbers.ts';

const giveGold = (amount: number) => $gameParty.gainGold(amount);
const applyAmount = makeApplyAmount(giveGold);
const setExact = makeSetExact(() => $gameParty.gold(), giveGold);

export default defineFeature({
  id: 'gold',
  menus: [
    {
      id: 'gold',
      name: 'Gold',
      render(ui) {
        ui.cheatTitle();
        amountSelector(ui);
        ui.title('Gold');
        ui.valueInput(String($gameParty.gold()), 'gold', setExact, applyAmount);
      },
    },
  ],
});
