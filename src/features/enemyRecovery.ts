import CheatMenu from '../CheatMenu.ts';

function setEnemyResource(
  alive: boolean,
  setter: (member: Game_Battler) => void,
) {
  const members = $gameTroop.members();
  for (let i = 0; i < members.length; i++) {
    if (members[i] && ((alive && members[i].hp !== 0) || !alive)) {
      setter(members[i]);
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
}

CheatMenu.setEnemyHp = (hp, alive) =>
  setEnemyResource(alive, (m) => m.setHp(hp));
CheatMenu.halfEnemyHp = (alive) =>
  setEnemyResource(alive, (m) => m.setHp(Math.max(1, Math.floor(m.mhp / 2))));
CheatMenu.recoverEnemyHp = (alive) =>
  setEnemyResource(alive, (m) => m.setHp(m.mhp));

CheatMenu.appendEnemyCheats = function (...keys) {
  const sound = () => SoundManager.playSystemSound(1);
  const appendGroup = (alive: boolean, groupKeys: (string | number)[]) => {
    CheatMenu.appendCheat('Enemy HP to 0', 'Activate', groupKeys[0], () => {
      CheatMenu.setEnemyHp(0, alive);
      sound();
    });
    CheatMenu.appendCheat('Enemy HP to 1', 'Activate', groupKeys[1], () => {
      CheatMenu.setEnemyHp(1, alive);
      sound();
    });
    CheatMenu.appendCheat('Enemy Half HP', 'Activate', groupKeys[2], () => {
      CheatMenu.halfEnemyHp(alive);
      sound();
    });
    CheatMenu.appendCheat('Enemy Full HP', 'Activate', groupKeys[3], () => {
      CheatMenu.recoverEnemyHp(alive);
      sound();
    });
  };
  CheatMenu.appendTitle('Alive');
  appendGroup(true, keys.slice(0, 4));
  CheatMenu.appendTitle('All');
  appendGroup(false, keys.slice(4, 8));
};

export const menu = {
  name: 'Enemy HP',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendEnemyCheats(4, 5, 6, 7, 8, 9, 0, '-');
  },
};
