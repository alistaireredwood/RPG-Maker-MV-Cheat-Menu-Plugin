import CheatMenu from '../CheatMenu.ts';
import { makeApplyAmount, makeSetExact } from '../core/scrollable.ts';

CheatMenu.giveStat = (actor, statIndex, amount) => {
  if (actor && actor.paramPlus(statIndex) != undefined) {
    actor.addParam(statIndex, amount);
  }
};

CheatMenu.applyCurrentStat = makeApplyAmount((amount) =>
  CheatMenu.giveStat(
    $gameActors.actor(CheatMenu.cheatSelectedActor),
    CheatMenu.statSelection,
    amount,
  ),
);

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
    true,
  );

  const actor = $gameActors.actor(CheatMenu.cheatSelectedActor);
  const statIndex = CheatMenu.statSelection;
  if (
    actor &&
    actorParamPlus &&
    typeof actorParamPlus[statIndex] === 'number'
  ) {
    CheatMenu.appendValueInput(
      String(actorParamPlus[statIndex]),
      `stat:${CheatMenu.cheatSelectedActor}:${statIndex}`,
      makeSetExact(
        () => actor.paramPlus(statIndex),
        (delta) => CheatMenu.giveStat(actor, statIndex, delta),
      ),
      key3,
      key4,
      CheatMenu.applyCurrentStat,
    );
  } else {
    CheatMenu.appendScrollSelector(
      'NULL',
      key3,
      key4,
      CheatMenu.applyCurrentStat,
    );
  }
};

export const menu = {
  name: 'Stats',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendActorSelection(4, 5);
    CheatMenu.appendAmountSelection(6, 7);
    CheatMenu.appendStatSelection(8, 9, 0, '-');
  },
};
