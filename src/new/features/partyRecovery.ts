import CheatMenu from '../CheatMenu.ts';

// set all party hp
CheatMenu.set_party_hp = (hp, alive) => {
  let members = $gameParty.allMembers();

  for (let i = 0; i < members.length; i++) {
    // was _hp
    if ((alive && members[i].hp != 0) || !alive) {
      members[i].setHp(hp);
    }
  }
};

// set all party mp
CheatMenu.set_party_mp = (mp, alive) => {
  let members = $gameParty.allMembers();
  for (let i = 0; i < members.length; i++) {
    // was _hp
    if ((alive && members[i].hp != 0) || !alive) {
      members[i].setMp(mp);
    }
  }
};

// set all party tp
CheatMenu.set_party_tp = (tp, alive) => {
  let members = $gameParty.allMembers();
  for (let i = 0; i < members.length; i++) {
    if ((alive && members[i].hp != 0) || !alive) {
      members[i].setTp(tp);
    }
  }
};

// party full recover hp
CheatMenu.recover_party_hp = (alive) => {
  let members = $gameParty.allMembers();
  for (let i = 0; i < members.length; i++) {
    if ((alive && members[i].hp != 0) || !alive) {
      members[i].setHp(members[i].mhp);
    }
  }
};

// party full recover mp
CheatMenu.recover_party_mp = (alive) => {
  let members = $gameParty.allMembers();
  for (let i = 0; i < members.length; i++) {
    if ((alive && members[i].hp != 0) || !alive) {
      members[i].setMp(members[i].mmp);
    }
  }
};

// party max tp
CheatMenu.recover_party_tp = (alive) => {
  let members = $gameParty.allMembers();
  for (let i = 0; i < members.length; i++) {
    if ((alive && members[i].hp != 0) || !alive) {
      members[i].setTp(members[i].maxTp());
    }
  }
};

// handler for the party hp cheat to 0 alive only
CheatMenu.party_hp_cheat_1 = function () {
  CheatMenu.set_party_hp(0, true);
  SoundManager.playSystemSound(1);
};

// handler for the party hp cheat to 1 alive only
CheatMenu.party_hp_cheat_2 = function () {
  CheatMenu.set_party_hp(1, true);
  SoundManager.playSystemSound(1);
};

// handler for the party hp cheat to full alive only
CheatMenu.party_hp_cheat_3 = function () {
  CheatMenu.recover_party_hp(true);
  SoundManager.playSystemSound(1);
};

// handler for the party hp cheat to 0 all
CheatMenu.party_hp_cheat_4 = function () {
  CheatMenu.set_party_hp(0, false);
  SoundManager.playSystemSound(1);
};

// handler for the party hp cheat to 1 all
CheatMenu.party_hp_cheat_5 = function () {
  CheatMenu.set_party_hp(1, false);
  SoundManager.playSystemSound(1);
};

// handler for the party hp cheat full all
CheatMenu.party_hp_cheat_6 = function () {
  CheatMenu.recover_party_hp(false);
  SoundManager.playSystemSound(1);
};

// append the party hp cheats
CheatMenu.append_hp_cheats = function (key1, key2, key3, key4, key5, key6) {
  CheatMenu.append_title('Alive');
  CheatMenu.append_cheat(
    'Party HP to 0',
    'Activate',
    key1,
    CheatMenu.party_hp_cheat_1,
  );
  CheatMenu.append_cheat(
    'Party HP to 1',
    'Activate',
    key2,
    CheatMenu.party_hp_cheat_2,
  );
  CheatMenu.append_cheat(
    'Party Full HP',
    'Activate',
    key3,
    CheatMenu.party_hp_cheat_3,
  );
  CheatMenu.append_title('All');
  CheatMenu.append_cheat(
    'Party HP to 0',
    'Activate',
    key4,
    CheatMenu.party_hp_cheat_4,
  );
  CheatMenu.append_cheat(
    'Party HP to 1',
    'Activate',
    key5,
    CheatMenu.party_hp_cheat_5,
  );
  CheatMenu.append_cheat(
    'Party Full HP',
    'Activate',
    key6,
    CheatMenu.party_hp_cheat_6,
  );
};

// handler for the party mp cheat to 0 alive only
CheatMenu.party_mp_cheat_1 = function () {
  CheatMenu.set_party_mp(0, true);
  SoundManager.playSystemSound(1);
};

// handler for the party mp cheat to 1 alive only
CheatMenu.party_mp_cheat_2 = function () {
  CheatMenu.set_party_mp(1, true);
  SoundManager.playSystemSound(1);
};

// handler for the party mp cheat to full alive only
CheatMenu.party_mp_cheat_3 = function () {
  CheatMenu.recover_party_mp(true);
  SoundManager.playSystemSound(1);
};

// handler for the party mp cheat to 0 all
CheatMenu.party_mp_cheat_4 = function () {
  CheatMenu.set_party_mp(0, false);
  SoundManager.playSystemSound(1);
};

// handler for the party mp cheat to 1 all
CheatMenu.party_mp_cheat_5 = function () {
  CheatMenu.set_party_mp(1, false);
  SoundManager.playSystemSound(1);
};

// handler for the party mp cheat full all
CheatMenu.party_mp_cheat_6 = function () {
  CheatMenu.recover_party_mp(false);
  SoundManager.playSystemSound(1);
};

// append the party mp cheats
CheatMenu.append_mp_cheats = function (key1, key2, key3, key4, key5, key6) {
  CheatMenu.append_title('Alive');
  CheatMenu.append_cheat(
    'Party MP to 0',
    'Activate',
    key1,
    CheatMenu.party_mp_cheat_1,
  );
  CheatMenu.append_cheat(
    'Party MP to 1',
    'Activate',
    key2,
    CheatMenu.party_mp_cheat_2,
  );
  CheatMenu.append_cheat(
    'Party Full MP',
    'Activate',
    key3,
    CheatMenu.party_mp_cheat_3,
  );
  CheatMenu.append_title('All');
  CheatMenu.append_cheat(
    'Party MP to 0',
    'Activate',
    key4,
    CheatMenu.party_mp_cheat_4,
  );
  CheatMenu.append_cheat(
    'Party MP to 1',
    'Activate',
    key5,
    CheatMenu.party_mp_cheat_5,
  );
  CheatMenu.append_cheat(
    'Party Full MP',
    'Activate',
    key6,
    CheatMenu.party_mp_cheat_6,
  );
};

// handler for the party tp cheat to 0 alive only
CheatMenu.party_tp_cheat_1 = function () {
  CheatMenu.set_party_tp(0, true);
  SoundManager.playSystemSound(1);
};

// handler for the party tp cheat to 1 alive only
CheatMenu.party_tp_cheat_2 = function () {
  CheatMenu.set_party_tp(1, true);
  SoundManager.playSystemSound(1);
};

// handler for the party tp cheat to full alive only
CheatMenu.party_tp_cheat_3 = function () {
  CheatMenu.recover_party_tp(true);
  SoundManager.playSystemSound(1);
};

// handler for the party tp cheat to 0 all
CheatMenu.party_tp_cheat_4 = function () {
  CheatMenu.set_party_tp(0, false);
  SoundManager.playSystemSound(1);
};

// handler for the party tp cheat to 1 all
CheatMenu.party_tp_cheat_5 = function () {
  CheatMenu.set_party_tp(1, false);
  SoundManager.playSystemSound(1);
};

// handler for the party tp cheat full all
CheatMenu.party_tp_cheat_6 = function () {
  CheatMenu.recover_party_tp(false);
  SoundManager.playSystemSound(1);
};

// append the party tp cheats
CheatMenu.append_tp_cheats = function (key1, key2, key3, key4, key5, key6) {
  CheatMenu.append_title('Alive');
  CheatMenu.append_cheat(
    'Party TP to 0',
    'Activate',
    key1,
    CheatMenu.party_tp_cheat_1,
  );
  CheatMenu.append_cheat(
    'Party TP to 1',
    'Activate',
    key2,
    CheatMenu.party_tp_cheat_2,
  );
  CheatMenu.append_cheat(
    'Party Full TP',
    'Activate',
    key3,
    CheatMenu.party_tp_cheat_3,
  );
  CheatMenu.append_title('All');
  CheatMenu.append_cheat(
    'Party TP to 0',
    'Activate',
    key4,
    CheatMenu.party_tp_cheat_4,
  );
  CheatMenu.append_cheat(
    'Party TP to 1',
    'Activate',
    key5,
    CheatMenu.party_tp_cheat_5,
  );
  CheatMenu.append_cheat(
    'Party Full TP',
    'Activate',
    key6,
    CheatMenu.party_tp_cheat_6,
  );
};

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Party TP');

  CheatMenu.append_tp_cheats(4, 5, 6, 7, 8, 9);
});

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Party MP');

  CheatMenu.append_mp_cheats(4, 5, 6, 7, 8, 9);
});

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Party HP');

  CheatMenu.append_hp_cheats(4, 5, 6, 7, 8, 9);
});
