import CheatMenu from '../CheatMenu.ts';
import { makeApplyAmount } from '../core/scrollable.ts';

CheatMenu.giveExp = (actor, amount) => {
  if (actor) {
    actor.gainExp(amount);
  }
};

CheatMenu.applyCurrentExp = makeApplyAmount((amount) =>
  CheatMenu.giveExp($gameActors.actor(CheatMenu.cheatSelectedActor), amount),
);

CheatMenu.appendExpCheat = function (key1, key2) {
  const currentExp = $gameActors.actor(CheatMenu.cheatSelectedActor)?.currentExp() ?? 0;
  CheatMenu.appendTitle('EXP');
  CheatMenu.appendScrollSelector(currentExp, key1, key2, CheatMenu.applyCurrentExp);
};

export const menu = {
  name: 'Give Exp',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendActorSelection(4, 5);
    CheatMenu.appendAmountSelection(6, 7);
    CheatMenu.appendExpCheat(8, 9);
  },
};
