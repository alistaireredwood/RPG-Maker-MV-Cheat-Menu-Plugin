import CheatMenu from '../CheatMenu.ts';

CheatMenu.giveStat = (actor, statIndex, amount) => {
  if (actor.paramPlus(statIndex) != undefined) {
    actor.addParam(statIndex, amount);
  }
};

CheatMenu.applyCurrentStat = function (direction) {
  let amount = CheatMenu.amounts[CheatMenu.amountIndex];

  if (direction == 'left') {
    amount = -amount;
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }
  CheatMenu.giveStat(
    $gameActors.actor(CheatMenu.cheatSelectedActor),
    CheatMenu.statSelection,
    amount,
  );
  CheatMenu.updateMenu();
};

CheatMenu.appendStatSelection = function (key1, key2, key3, key4) {
  CheatMenu.appendTitle('Stat');

  const actorParamPlus = ($gameActors as any).actor(
    CheatMenu.cheatSelectedActor,
  )?._paramPlus as Game_Actor['_paramPlus'];

  let statString = '';
  if ($gameActors.actor(CheatMenu.cheatSelectedActor) && actorParamPlus) {
    if (CheatMenu.statSelection >= actorParamPlus.length) {
      CheatMenu.statSelection = 0;
    }
    statString += $dataSystem.terms.params[CheatMenu.statSelection];
  }

  CheatMenu.appendScrollSelector(
    statString,
    key1,
    key2,
    CheatMenu.scrollStat,
  );
  let currentValue: number | 'NULL' = 'NULL';

  if ($gameActors.actor(CheatMenu.cheatSelectedActor) && actorParamPlus) {
    currentValue = actorParamPlus[CheatMenu.statSelection];
  }
  CheatMenu.appendScrollSelector(
    currentValue,
    key3,
    key4,
    CheatMenu.applyCurrentStat,
  );
};

CheatMenu.scrollStat = function (direction) {
  const actorParamPlus = ($gameActors as any).actor(
    CheatMenu.cheatSelectedActor,
  )?._paramPlus as Game_Actor['_paramPlus'];

  if (actorParamPlus) {
    if (direction == 'left') {
      CheatMenu.statSelection--;
      if (CheatMenu.statSelection < 0) {
        CheatMenu.statSelection = actorParamPlus.length - 1;
      }
    } else {
      CheatMenu.statSelection++;
      if (CheatMenu.statSelection >= actorParamPlus.length) {
        CheatMenu.statSelection = 0;
      }
    }
  } else {
    CheatMenu.statSelection = 0;
  }

  SoundManager.playSystemSound(0);
  CheatMenu.updateMenu();
};

CheatMenu.menus.splice(0, 0, {
  name: 'Stats',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendActorSelection(4, 5);
    CheatMenu.appendAmountSelection(6, 7);
    CheatMenu.appendStatSelection(8, 9, 0, '-');
  },
});
