import CheatMenu from '../CheatMenu.ts';

CheatMenu.setEnemyHp = (hp, alive) => {
  let members = $gameTroop.members();
  for (let i = 0; i < members.length; i++) {
    if (members[i]) {
      if ((alive && members[i].hp != 0) || !alive) {
        members[i].setHp(hp);
      }
    }
  }
};

CheatMenu.enemyHpCheat1 = function () {
  CheatMenu.setEnemyHp(0, true);
  SoundManager.playSystemSound(1);
};

CheatMenu.enemyHpCheat2 = function () {
  CheatMenu.setEnemyHp(1, true);
  SoundManager.playSystemSound(1);
};

CheatMenu.enemyHpCheat3 = function () {
  CheatMenu.setEnemyHp(0, false);
  SoundManager.playSystemSound(1);
};

CheatMenu.enemyHpCheat4 = function () {
  CheatMenu.setEnemyHp(1, false);
  SoundManager.playSystemSound(1);
};

CheatMenu.appendEnemyCheats = function (key1, key2, key3, key4) {
  CheatMenu.appendTitle('Alive');
  CheatMenu.appendCheat('Enemy HP to 0', 'Activate', key1, CheatMenu.enemyHpCheat1);
  CheatMenu.appendCheat('Enemy HP to 1', 'Activate', key2, CheatMenu.enemyHpCheat2);
  CheatMenu.appendTitle('All');
  CheatMenu.appendCheat('Enemy HP to 0', 'Activate', key3, CheatMenu.enemyHpCheat3);
  CheatMenu.appendCheat('Enemy HP to 1', 'Activate', key4, CheatMenu.enemyHpCheat4);
};

export const menu = {
  name: 'Enemy HP',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendEnemyCheats(4, 5, 6, 7);
  },
};
