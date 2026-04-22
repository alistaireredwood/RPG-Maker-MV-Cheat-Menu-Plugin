import CheatMenu from '../CheatMenu.ts';
import { makeScroll } from '../core/scrollable.ts';

CheatMenu.toggleSwitch = (switchId) => {
  if ($dataSystem.switches[switchId] != undefined) {
    $gameSwitches.setValue(switchId, !$gameSwitches.value(switchId));
  }
};

CheatMenu.scrollSwitch = makeScroll({
  stateKey: 'switch',
  getData: () => $dataSystem.switches,
  getIdx: () => CheatMenu.switchSelection,
  setIdx: (idx) => { CheatMenu.switchSelection = idx; },
  matches: (item: any, keyword) => typeof item === 'string' && item.toLowerCase().includes(keyword),
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
    const idx = $dataSystem.switches.findIndex((s, i) => i > 0 && s?.toLowerCase().includes(keyword));
    if (idx > 0) CheatMenu.switchSelection = idx;
  });
  CheatMenu.appendTitle('Switch');

  const currentSwitch =
    $dataSystem.switches[CheatMenu.switchSelection]?.length > 0
      ? $dataSystem.switches[CheatMenu.switchSelection]
      : 'NULL';

  CheatMenu.appendScrollSelector(currentSwitch, key1, key2, CheatMenu.scrollSwitch);

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
