import CheatMenu from '../CheatMenu.ts';

CheatMenu.toggleSwitch = (switchId) => {
  if ($dataSystem.switches[switchId] != undefined) {
    $gameSwitches.setValue(switchId, !$gameSwitches.value(switchId));
  }
};

CheatMenu.scrollSwitch = function (direction) {
  const keyword = (CheatMenu.searchKeywords?.['switch'] || '').toLowerCase();
  const step = direction === 'left' ? -1 : 1;
  const switches = $dataSystem.switches;
  const len = switches.length;
  let idx = CheatMenu.switchSelection;
  for (let i = 0; i < len; i++) {
    idx += step;
    if (idx < 0) idx = len - 1;
    else if (idx >= len) idx = 0;
    const name = switches[idx];
    if (name && name.toLowerCase().includes(keyword)) break;
  }
  CheatMenu.switchSelection = idx;
  SoundManager.playSystemSound(0);
  CheatMenu.updateMenu();
};

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
  let currentSwitch;

  if (
    $dataSystem.switches[CheatMenu.switchSelection] &&
    $dataSystem.switches[CheatMenu.switchSelection].length > 0
  ) {
    currentSwitch = $dataSystem.switches[CheatMenu.switchSelection];
  } else {
    currentSwitch = 'NULL';
  }

  CheatMenu.appendScrollSelector(
    currentSwitch,
    key1,
    key2,
    CheatMenu.scrollSwitch,
  );

  let currentSwitchValue;
  if ($gameSwitches.value(CheatMenu.switchSelection) != undefined) {
    currentSwitchValue = $gameSwitches.value(CheatMenu.switchSelection);
  } else {
    currentSwitchValue = 'NULL';
  }

  CheatMenu.appendCheat(
    'Status:',
    currentSwitchValue,
    key3,
    CheatMenu.toggleCurrentSwitch,
  );
};

export const menu = {
  name: 'Switches',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendSwitchSelection(4, 5, 6);
  },
};
