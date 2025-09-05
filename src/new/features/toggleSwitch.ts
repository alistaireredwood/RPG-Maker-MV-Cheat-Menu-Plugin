import CheatMenu from '../CheatMenu.ts';

// toggle game switch value, by id
CheatMenu.toggle_switch = (switch_id) => {
  if ($dataSystem.switches[switch_id] != undefined) {
    $gameSwitches.setValue(switch_id, !$gameSwitches.value(switch_id));
  }
};

// Left and right scrolls for handling switching between selected switch
CheatMenu.scroll_switch = function (direction) {
  if (direction == 'left') {
    CheatMenu.switch_selection--;
    if (CheatMenu.switch_selection < 0) {
      CheatMenu.switch_selection = $dataSystem.switches.length - 1;
    }
  } else {
    CheatMenu.switch_selection++;
    if (CheatMenu.switch_selection >= $dataSystem.switches.length) {
      CheatMenu.switch_selection = 0;
    }
  }
  SoundManager.playSystemSound(0);
  CheatMenu.update_menu();
};

// handler for the toggling the current switch
CheatMenu.toggle_current_switch = function () {
  CheatMenu.toggle_switch(CheatMenu.switch_selection);
  if ($gameSwitches.value(CheatMenu.switch_selection)) {
    SoundManager.playSystemSound(1);
  } else {
    SoundManager.playSystemSound(2);
  }
  CheatMenu.update_menu();
};

// append the switch cheat to the menu
CheatMenu.append_switch_selection = function (key1, key2, key3) {
  CheatMenu.append_title('Switch');
  let current_switch;

  if (
    $dataSystem.switches[CheatMenu.switch_selection] &&
    $dataSystem.switches[CheatMenu.switch_selection].length > 0
  ) {
    current_switch = $dataSystem.switches[CheatMenu.switch_selection];
  } else {
    current_switch = 'NULL';
  }

  CheatMenu.append_scroll_selector(
    current_switch,
    key1,
    key2,
    CheatMenu.scroll_switch,
  );

  let current_switch_value;
  if ($gameSwitches.value(CheatMenu.switch_selection) != undefined) {
    current_switch_value = $gameSwitches.value(CheatMenu.switch_selection);
  } else {
    current_switch_value = 'NULL';
  }

  CheatMenu.append_cheat(
    'Status:',
    current_switch_value,
    key3,
    CheatMenu.toggle_current_switch,
  );
};

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Switches');
  CheatMenu.append_switch_selection(4, 5, 6);
});
