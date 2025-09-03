import CheatMenu from '../CheatMenu.ts';

// set all enemies hp
CheatMenu.set_enemy_hp = (hp, alive) => {
  let members = $gameTroop.members();
  for (let i = 0; i < members.length; i++) {
    if (members[i]) {
      if ((alive && members[i].hp != 0) || !alive) {
        members[i].setHp(hp);
      }
    }
  }
};

// handler for the enemy hp to 0 cheat alive only
CheatMenu.enemy_hp_cheat_1 = function () {
  CheatMenu.set_enemy_hp(0, true);
  SoundManager.playSystemSound(1);
};

// handler for the enemy hp to 1 cheat alive only
CheatMenu.enemy_hp_cheat_2 = function () {
  CheatMenu.set_enemy_hp(1, true);
  SoundManager.playSystemSound(1);
};

// handler for the enemy hp to 0 cheat all
CheatMenu.enemy_hp_cheat_3 = function () {
  CheatMenu.set_enemy_hp(0, false);
  SoundManager.playSystemSound(1);
};

// handler for the enemy hp to 1 cheat all
CheatMenu.enemy_hp_cheat_4 = function () {
  CheatMenu.set_enemy_hp(1, false);
  SoundManager.playSystemSound(1);
};

// Append the enemy hp cheats to the menu
CheatMenu.append_enemy_cheats = function (key1, key2, key3, key4) {
  CheatMenu.append_title('Alive');
  CheatMenu.append_cheat(
    'Enemy HP to 0',
    'Activate',
    key1,
    CheatMenu.enemy_hp_cheat_1,
  );
  CheatMenu.append_cheat(
    'Enemy HP to 1',
    'Activate',
    key2,
    CheatMenu.enemy_hp_cheat_2,
  );
  CheatMenu.append_title('All');
  CheatMenu.append_cheat(
    'Enemy HP to 0',
    'Activate',
    key3,
    CheatMenu.enemy_hp_cheat_3,
  );
  CheatMenu.append_cheat(
    'Enemy HP to 1',
    'Activate',
    key4,
    CheatMenu.enemy_hp_cheat_4,
  );
};
