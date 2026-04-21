import CheatMenu from '../CheatMenu.ts';

CheatMenu.giveGold = (amount) => {
  $gameParty.gainGold(amount);
};

CheatMenu.applyCurrentGold = function (direction) {
  let amount = CheatMenu.amounts[CheatMenu.amountIndex];

  if (direction == 'left') {
    amount = -amount;
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }

  CheatMenu.giveGold(amount);
  CheatMenu.updateMenu();
};

CheatMenu.appendGoldStatus = function (key1, key2) {
  CheatMenu.appendTitle('Gold');
  CheatMenu.appendScrollSelector(
    $gameParty.gold(),
    key1,
    key2,
    CheatMenu.applyCurrentGold,
  );
};

CheatMenu.menus.splice(0, 0, {
  name: 'Gold',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendAmountSelection(4, 5);
    CheatMenu.appendGoldStatus(6, 7);
  },
});
