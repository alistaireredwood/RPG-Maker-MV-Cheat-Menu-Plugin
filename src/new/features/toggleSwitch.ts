import CheatMenu from '../CheatMenu.ts';

CheatMenu.toggleSwitch = (switchId) => {
  if ($dataSystem.switches[switchId] != undefined) {
    $gameSwitches.setValue(switchId, !$gameSwitches.value(switchId));
  }
};

CheatMenu.scrollSwitch = function (direction) {
  if (direction == 'left') {
    CheatMenu.switchSelection--;
    if (CheatMenu.switchSelection < 0) {
      CheatMenu.switchSelection = $dataSystem.switches.length - 1;
    }
  } else {
    CheatMenu.switchSelection++;
    if (CheatMenu.switchSelection >= $dataSystem.switches.length) {
      CheatMenu.switchSelection = 0;
    }
  }
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
