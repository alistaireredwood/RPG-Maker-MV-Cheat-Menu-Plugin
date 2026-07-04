import CheatMenu from '../CheatMenu.ts';

CheatMenu.setEnemyHp = (hp, alive) => {
  const members = $gameTroop.members();
  for (let i = 0; i < members.length; i++) {
    if (members[i] && ((alive && members[i].hp !== 0) || !alive)) {
      members[i].setHp(hp);
    }
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
