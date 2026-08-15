import CheatMenu from '../CheatMenu.ts';
import { makeScroll, getIndexInfo } from '../core/scrollable.ts';

CheatMenu.toggleSwitch = (switchId) => {
  if ($dataSystem.switches[switchId] != undefined) {
    $gameSwitches.setValue(switchId, !$gameSwitches.value(switchId));
  }
};

const switchMatches = (item: any, keyword: string) =>
  typeof item === 'string' && item !== '' && item.toLowerCase().includes(keyword);

CheatMenu.scrollSwitch = makeScroll({
  stateKey: 'switch',
  getData: () => $dataSystem.switches,
  getIdx: () => CheatMenu.switchSelection,
  setIdx: (idx) => { CheatMenu.switchSelection = idx; },
  matches: switchMatches,
  startIdx: 0,
});

CheatMenu.toggleCurrentSwitch = function () {
  CheatMenu.toggleSwitch(CheatMenu.switchSelection);
  if ($gameSwitches.value(CheatMenu.switchSelection)) {
    SoundManager.playSystemSound(1);
  } else {
    SoundManager.playSystemSound(2);
  }
  CheatMenu.updateMenu();
};

CheatMenu.appendSwitchSelection = function (key1, key2, key3) {
  CheatMenu.appendSearchInput('Search switches...', 'switch', (keyword) => {
    const idx = $dataSystem.switches.findIndex((s, i) => i > 0 && !!s && s.toLowerCase().includes(keyword));
    if (idx > 0) CheatMenu.switchSelection = idx;
  });
  const currentSwitch =
    $dataSystem.switches[CheatMenu.switchSelection]?.length > 0
      ? $dataSystem.switches[CheatMenu.switchSelection]
      : 'NULL';

  const keyword = (CheatMenu.searchKeywords?.['switch'] || '').toLowerCase();
  const { index, total } = getIndexInfo(
    $dataSystem.switches,
    CheatMenu.switchSelection,
    switchMatches,
    keyword,
    0,
  );

  CheatMenu.appendTitle('Switch', `${index}/${total}`);

  CheatMenu.appendScrollSelector(currentSwitch, key1, key2, CheatMenu.scrollSwitch, true);

  const currentSwitchValue =
    $gameSwitches.value(CheatMenu.switchSelection) != undefined
      ? $gameSwitches.value(CheatMenu.switchSelection)
      : 'NULL';

  CheatMenu.appendCheat('Status:', currentSwitchValue, key3, CheatMenu.toggleCurrentSwitch);
};

export const menu = {
  name: 'Switches',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendSwitchSelection(4, 5, 6);
  },
};
