import CheatMenu from '../CheatMenu.ts';

CheatMenu.setPartyHp = (hp, alive) => {
  let members = $gameParty.allMembers();

  for (let i = 0; i < members.length; i++) {
    if ((alive && members[i].hp != 0) || !alive) {
      members[i].setHp(hp);
    }
  }
};

CheatMenu.setPartyMp = (mp, alive) => {
  let members = $gameParty.allMembers();
  for (let i = 0; i < members.length; i++) {
    if ((alive && members[i].hp != 0) || !alive) {
      members[i].setMp(mp);
    }
  }
};

CheatMenu.setPartyTp = (tp, alive) => {
  let members = $gameParty.allMembers();
  for (let i = 0; i < members.length; i++) {
    if ((alive && members[i].hp != 0) || !alive) {
      members[i].setTp(tp);
    }
  }
};

CheatMenu.recoverPartyHp = (alive) => {
  let members = $gameParty.allMembers();
  for (let i = 0; i < members.length; i++) {
    if ((alive && members[i].hp != 0) || !alive) {
      members[i].setHp(members[i].mhp);
    }
  }
};

CheatMenu.recoverPartyMp = (alive) => {
  let members = $gameParty.allMembers();
  for (let i = 0; i < members.length; i++) {
    if ((alive && members[i].hp != 0) || !alive) {
      members[i].setMp(members[i].mmp);
    }
  }
};

CheatMenu.recoverPartyTp = (alive) => {
  let members = $gameParty.allMembers();
  for (let i = 0; i < members.length; i++) {
    if ((alive && members[i].hp != 0) || !alive) {
      members[i].setTp(members[i].maxTp());
    }
  }
};

CheatMenu.partyHpCheat1 = function () {
  CheatMenu.setPartyHp(0, true);
  SoundManager.playSystemSound(1);
};

CheatMenu.partyHpCheat2 = function () {
  CheatMenu.setPartyHp(1, true);
  SoundManager.playSystemSound(1);
};

CheatMenu.partyHpCheat3 = function () {
  CheatMenu.recoverPartyHp(true);
  SoundManager.playSystemSound(1);
};

CheatMenu.partyHpCheat4 = function () {
  CheatMenu.setPartyHp(0, false);
  SoundManager.playSystemSound(1);
};

CheatMenu.partyHpCheat5 = function () {
  CheatMenu.setPartyHp(1, false);
  SoundManager.playSystemSound(1);
};

CheatMenu.partyHpCheat6 = function () {
  CheatMenu.recoverPartyHp(false);
  SoundManager.playSystemSound(1);
};

CheatMenu.appendHpCheats = function (key1, key2, key3, key4, key5, key6) {
  CheatMenu.appendTitle('Alive');
  CheatMenu.appendCheat('Party HP to 0', 'Activate', key1, CheatMenu.partyHpCheat1);
  CheatMenu.appendCheat('Party HP to 1', 'Activate', key2, CheatMenu.partyHpCheat2);
  CheatMenu.appendCheat('Party Full HP', 'Activate', key3, CheatMenu.partyHpCheat3);
  CheatMenu.appendTitle('All');
  CheatMenu.appendCheat('Party HP to 0', 'Activate', key4, CheatMenu.partyHpCheat4);
  CheatMenu.appendCheat('Party HP to 1', 'Activate', key5, CheatMenu.partyHpCheat5);
  CheatMenu.appendCheat('Party Full HP', 'Activate', key6, CheatMenu.partyHpCheat6);
};

CheatMenu.partyMpCheat1 = function () {
  CheatMenu.setPartyMp(0, true);
  SoundManager.playSystemSound(1);
};

CheatMenu.partyMpCheat2 = function () {
  CheatMenu.setPartyMp(1, true);
  SoundManager.playSystemSound(1);
};

CheatMenu.partyMpCheat3 = function () {
  CheatMenu.recoverPartyMp(true);
  SoundManager.playSystemSound(1);
};

CheatMenu.partyMpCheat4 = function () {
  CheatMenu.setPartyMp(0, false);
  SoundManager.playSystemSound(1);
};

CheatMenu.partyMpCheat5 = function () {
  CheatMenu.setPartyMp(1, false);
  SoundManager.playSystemSound(1);
};

CheatMenu.partyMpCheat6 = function () {
  CheatMenu.recoverPartyMp(false);
  SoundManager.playSystemSound(1);
};

CheatMenu.appendMpCheats = function (key1, key2, key3, key4, key5, key6) {
  CheatMenu.appendTitle('Alive');
  CheatMenu.appendCheat('Party MP to 0', 'Activate', key1, CheatMenu.partyMpCheat1);
  CheatMenu.appendCheat('Party MP to 1', 'Activate', key2, CheatMenu.partyMpCheat2);
  CheatMenu.appendCheat('Party Full MP', 'Activate', key3, CheatMenu.partyMpCheat3);
  CheatMenu.appendTitle('All');
  CheatMenu.appendCheat('Party MP to 0', 'Activate', key4, CheatMenu.partyMpCheat4);
  CheatMenu.appendCheat('Party MP to 1', 'Activate', key5, CheatMenu.partyMpCheat5);
  CheatMenu.appendCheat('Party Full MP', 'Activate', key6, CheatMenu.partyMpCheat6);
};

CheatMenu.partyTpCheat1 = function () {
  CheatMenu.setPartyTp(0, true);
  SoundManager.playSystemSound(1);
};

CheatMenu.partyTpCheat2 = function () {
  CheatMenu.setPartyTp(1, true);
  SoundManager.playSystemSound(1);
};

CheatMenu.partyTpCheat3 = function () {
  CheatMenu.recoverPartyTp(true);
  SoundManager.playSystemSound(1);
};

CheatMenu.partyTpCheat4 = function () {
  CheatMenu.setPartyTp(0, false);
  SoundManager.playSystemSound(1);
};

CheatMenu.partyTpCheat5 = function () {
  CheatMenu.setPartyTp(1, false);
  SoundManager.playSystemSound(1);
};

CheatMenu.partyTpCheat6 = function () {
  CheatMenu.recoverPartyTp(false);
  SoundManager.playSystemSound(1);
};

CheatMenu.appendTpCheats = function (key1, key2, key3, key4, key5, key6) {
  CheatMenu.appendTitle('Alive');
  CheatMenu.appendCheat('Party TP to 0', 'Activate', key1, CheatMenu.partyTpCheat1);
  CheatMenu.appendCheat('Party TP to 1', 'Activate', key2, CheatMenu.partyTpCheat2);
  CheatMenu.appendCheat('Party Full TP', 'Activate', key3, CheatMenu.partyTpCheat3);
  CheatMenu.appendTitle('All');
  CheatMenu.appendCheat('Party TP to 0', 'Activate', key4, CheatMenu.partyTpCheat4);
  CheatMenu.appendCheat('Party TP to 1', 'Activate', key5, CheatMenu.partyTpCheat5);
  CheatMenu.appendCheat('Party Full TP', 'Activate', key6, CheatMenu.partyTpCheat6);
};

CheatMenu.menus.splice(0, 0, {
  name: 'Party TP',
  render: () => {
    CheatMenu.appendCheatTitle('Party TP');
    CheatMenu.appendTpCheats(4, 5, 6, 7, 8, 9);
  },
});

CheatMenu.menus.splice(0, 0, {
  name: 'Party MP',
  render: () => {
    CheatMenu.appendCheatTitle('Party MP');
    CheatMenu.appendMpCheats(4, 5, 6, 7, 8, 9);
  },
});

CheatMenu.menus.splice(0, 0, {
  name: 'Party HP',
  render: () => {
    CheatMenu.appendCheatTitle('Party HP');
    CheatMenu.appendHpCheats(4, 5, 6, 7, 8, 9);
  },
});
