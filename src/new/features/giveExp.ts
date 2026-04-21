import CheatMenu from '../CheatMenu.ts';

CheatMenu.giveExp = (actor, amount) => {
  actor.gainExp(amount);
};

CheatMenu.applyCurrentExp = function (direction) {
  let amount = CheatMenu.amounts[CheatMenu.amountIndex];
  if (direction == 'left') {
    amount = -amount;
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }
  CheatMenu.giveExp($gameActors.actor(CheatMenu.cheatSelectedActor), amount);
  CheatMenu.updateMenu();
};

CheatMenu.appendExpCheat = function (key1, key2) {
  let currentExp;

  if ($gameActors.actor(CheatMenu.cheatSelectedActor)) {
    currentExp = $gameActors
      .actor(CheatMenu.cheatSelectedActor)
      .currentExp();
  }
  CheatMenu.appendTitle('EXP');
  CheatMenu.appendScrollSelector(
    currentExp || 0,
    key1,
    key2,
    CheatMenu.applyCurrentExp,
  );
};

CheatMenu.menus.push({
  name: 'Give Exp',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendActorSelection(4, 5);
    CheatMenu.appendAmountSelection(6, 7);
    CheatMenu.appendExpCheat(8, 9);
  },
});
