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
CheatMenu.halfPartyHp = (alive) => setPartyResource(alive, (m) => m.setHp(Math.max(1, Math.floor(m.mhp / 2))));
CheatMenu.halfPartyMp = (alive) => setPartyResource(alive, (m) => m.setMp(Math.floor(m.mmp / 2)));
CheatMenu.halfPartyTp = (alive) => setPartyResource(alive, (m) => m.setTp(Math.floor(m.maxTp() / 2)));

function appendPartyCheats(
  stat: string,
  setFn: (val: number, alive: boolean) => void,
  halfFn: (alive: boolean) => void,
  recoverFn: (alive: boolean) => void,
  keys: (string | number)[],
) {
  const sound = () => SoundManager.playSystemSound(1);
  const appendGroup = (alive: boolean, groupKeys: (string | number)[]) => {
    CheatMenu.appendCheat(`Party ${stat} to 0`, 'Activate', groupKeys[0], () => { setFn(0, alive); sound(); });
    CheatMenu.appendCheat(`Party ${stat} to 1`, 'Activate', groupKeys[1], () => { setFn(1, alive); sound(); });
    CheatMenu.appendCheat(`Party Half ${stat}`, 'Activate', groupKeys[2], () => { halfFn(alive); sound(); });
    CheatMenu.appendCheat(`Party Full ${stat}`, 'Activate', groupKeys[3], () => { recoverFn(alive); sound(); });
  };
  CheatMenu.appendTitle('Alive');
  appendGroup(true, keys.slice(0, 4));
  CheatMenu.appendTitle('All');
  appendGroup(false, keys.slice(4, 8));
}

CheatMenu.appendHpCheats = (...keys) =>
  appendPartyCheats('HP', CheatMenu.setPartyHp, CheatMenu.halfPartyHp, CheatMenu.recoverPartyHp, keys);

CheatMenu.appendMpCheats = (...keys) =>
  appendPartyCheats('MP', CheatMenu.setPartyMp, CheatMenu.halfPartyMp, CheatMenu.recoverPartyMp, keys);

CheatMenu.appendTpCheats = (...keys) =>
  appendPartyCheats('TP', CheatMenu.setPartyTp, CheatMenu.halfPartyTp, CheatMenu.recoverPartyTp, keys);

const KEYS = [4, 5, 6, 7, 8, 9, 0, '-'];

export const menus = [
  {
    name: 'Party HP',
    render: () => { CheatMenu.appendCheatTitle(); CheatMenu.appendHpCheats(...KEYS); },
  },
  {
    name: 'Party MP',
    render: () => { CheatMenu.appendCheatTitle(); CheatMenu.appendMpCheats(...KEYS); },
  },
  {
    name: 'Party TP',
    render: () => { CheatMenu.appendCheatTitle(); CheatMenu.appendTpCheats(...KEYS); },
  },
];
