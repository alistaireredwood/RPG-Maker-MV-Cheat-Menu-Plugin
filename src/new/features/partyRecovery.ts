import CheatMenu from '../CheatMenu.ts';

function setPartyResource(alive: boolean, setter: (member: any) => void) {
  const members = $gameParty.allMembers();
  for (let i = 0; i < members.length; i++) {
    if ((alive && members[i].hp !== 0) || !alive) {
      setter(members[i]);
    }
  }
}

CheatMenu.setPartyHp = (hp, alive) => setPartyResource(alive, (m) => m.setHp(hp));
CheatMenu.setPartyMp = (mp, alive) => setPartyResource(alive, (m) => m.setMp(mp));
CheatMenu.setPartyTp = (tp, alive) => setPartyResource(alive, (m) => m.setTp(tp));
CheatMenu.recoverPartyHp = (alive) => setPartyResource(alive, (m) => m.setHp(m.mhp));
CheatMenu.recoverPartyMp = (alive) => setPartyResource(alive, (m) => m.setMp(m.mmp));
CheatMenu.recoverPartyTp = (alive) => setPartyResource(alive, (m) => m.setTp(m.maxTp()));

function appendPartyCheats(
  stat: string,
  setFn: (val: number, alive: boolean) => void,
  recoverFn: (alive: boolean) => void,
  key1: string | number, key2: string | number, key3: string | number,
  key4: string | number, key5: string | number, key6: string | number,
) {
  const sound = () => SoundManager.playSystemSound(1);
  CheatMenu.appendTitle('Alive');
  CheatMenu.appendCheat(`Party ${stat} to 0`, 'Activate', key1, () => { setFn(0, true); sound(); });
  CheatMenu.appendCheat(`Party ${stat} to 1`, 'Activate', key2, () => { setFn(1, true); sound(); });
  CheatMenu.appendCheat(`Party Full ${stat}`, 'Activate', key3, () => { recoverFn(true); sound(); });
  CheatMenu.appendTitle('All');
  CheatMenu.appendCheat(`Party ${stat} to 0`, 'Activate', key4, () => { setFn(0, false); sound(); });
  CheatMenu.appendCheat(`Party ${stat} to 1`, 'Activate', key5, () => { setFn(1, false); sound(); });
  CheatMenu.appendCheat(`Party Full ${stat}`, 'Activate', key6, () => { recoverFn(false); sound(); });
}

CheatMenu.appendHpCheats = (key1, key2, key3, key4, key5, key6) =>
  appendPartyCheats('HP', CheatMenu.setPartyHp, CheatMenu.recoverPartyHp, key1, key2, key3, key4, key5, key6);

CheatMenu.appendMpCheats = (key1, key2, key3, key4, key5, key6) =>
  appendPartyCheats('MP', CheatMenu.setPartyMp, CheatMenu.recoverPartyMp, key1, key2, key3, key4, key5, key6);

CheatMenu.appendTpCheats = (key1, key2, key3, key4, key5, key6) =>
  appendPartyCheats('TP', CheatMenu.setPartyTp, CheatMenu.recoverPartyTp, key1, key2, key3, key4, key5, key6);

export const menus = [
  {
    name: 'Party HP',
    render: () => { CheatMenu.appendCheatTitle(); CheatMenu.appendHpCheats(4, 5, 6, 7, 8, 9); },
  },
  {
    name: 'Party MP',
    render: () => { CheatMenu.appendCheatTitle(); CheatMenu.appendMpCheats(4, 5, 6, 7, 8, 9); },
  },
  {
    name: 'Party TP',
    render: () => { CheatMenu.appendCheatTitle(); CheatMenu.appendTpCheats(4, 5, 6, 7, 8, 9); },
  },
];
