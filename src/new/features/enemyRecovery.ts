import CheatMenu from '../CheatMenu.ts';

CheatMenu.setEnemyHp = (hp, alive) => {
  const members = $gameTroop.members();
  for (let i = 0; i < members.length; i++) {
    if (members[i] && ((alive && members[i].hp !== 0) || !alive)) {
      members[i].setHp(hp);
    }
  }

  // setHp() alone doesn't end the battle — the engine only checks for
  // victory/defeat at specific points in the turn flow (e.g. after an
  // action resolves), not every frame. Force that check now so killing
  // enemies via the cheat menu (e.g. while an actor command window is
  // still open) doesn't leave the battle stuck.
  if ($gameParty.inBattle()) {
    BattleManager.checkBattleEnd();
  }
};

CheatMenu.appendEnemyCheats = function (key1, key2, key3, key4) {
  const sound = () => SoundManager.playSystemSound(1);
  CheatMenu.appendTitle('Alive');
  CheatMenu.appendCheat('Enemy HP to 0', 'Activate', key1, () => { CheatMenu.setEnemyHp(0, true); sound(); });
  CheatMenu.appendCheat('Enemy HP to 1', 'Activate', key2, () => { CheatMenu.setEnemyHp(1, true); sound(); });
  CheatMenu.appendTitle('All');
  CheatMenu.appendCheat('Enemy HP to 0', 'Activate', key3, () => { CheatMenu.setEnemyHp(0, false); sound(); });
  CheatMenu.appendCheat('Enemy HP to 1', 'Activate', key4, () => { CheatMenu.setEnemyHp(1, false); sound(); });
};

export const menu = {
  name: 'Enemy HP',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendEnemyCheats(4, 5, 6, 7);
  },
};
