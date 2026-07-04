import CheatMenu from '../CheatMenu.ts';
import { makeApplyAmount } from '../core/scrollable.ts';

CheatMenu.giveGold = (amount) => {
  $gameParty.gainGold(amount);
};

CheatMenu.applyCurrentGold = makeApplyAmount((amount) => CheatMenu.giveGold(amount));

CheatMenu.appendGoldStatus = function (key1, key2) {
  CheatMenu.appendTitle('Gold');
  CheatMenu.appendScrollSelector($gameParty.gold(), key1, key2, CheatMenu.applyCurrentGold);
};

export const menu = {
  name: 'Gold',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendAmountSelection(4, 5);
    CheatMenu.appendGoldStatus(6, 7);
  },
};
