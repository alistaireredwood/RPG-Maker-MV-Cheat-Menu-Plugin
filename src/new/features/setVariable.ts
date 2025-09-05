import CheatMenu from '../CheatMenu.ts';

// change game variable value, by id
CheatMenu.set_variable = (variable_id, value) => {
  if ($dataSystem.variables[variable_id] != undefined) {
    let new_value = $gameVariables.value(variable_id) + value;

    $gameVariables.setValue(variable_id, new_value);
  }
};

// Left and right scrolls for handling switching between selected variable
CheatMenu.scroll_variable = function (direction) {
  if (direction == 'left') {
    CheatMenu.variable_selection--;
    if (CheatMenu.variable_selection < 0) {
      CheatMenu.variable_selection = $dataSystem.variables.length - 1;
    }
  } else {
    CheatMenu.variable_selection++;
    if (CheatMenu.variable_selection >= $dataSystem.variables.length) {
      CheatMenu.variable_selection = 0;
    }
  }
  SoundManager.playSystemSound(0);
  CheatMenu.update_menu();
};

// handlers for the setting the current variable
CheatMenu.apply_current_variable = function (direction) {
  let amount = CheatMenu.amounts[CheatMenu.amount_index];

  if (direction == 'left') {
    amount = -amount;
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }

  CheatMenu.set_variable(CheatMenu.variable_selection, amount);
  CheatMenu.update_menu();
};

// append the variable cheat to the menu
CheatMenu.append_variable_selection = function (key1, key2, key3, key4) {
  CheatMenu.append_title('Variable');

  let current_variable;

  if (
    $dataSystem.variables[CheatMenu.variable_selection] &&
    $dataSystem.variables[CheatMenu.variable_selection].length > 0
  ) {
    current_variable = $dataSystem.variables[CheatMenu.variable_selection];
  } else {
    current_variable = 'NULL';
  }

  CheatMenu.append_scroll_selector(
    current_variable,
    key1,
    key2,
    CheatMenu.scroll_variable,
  );

  let current_variable_value;
  if ($gameVariables.value(CheatMenu.variable_selection) != undefined) {
    current_variable_value = $gameVariables.value(CheatMenu.variable_selection);
  } else {
    current_variable_value = 'NULL';
  }

  CheatMenu.append_scroll_selector(
    current_variable_value,
    key3,
    key4,
    CheatMenu.apply_current_variable,
  );
};

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Variables');
  CheatMenu.append_amount_selection(4, 5);
  CheatMenu.append_variable_selection(6, 7, 8, 9);
});
