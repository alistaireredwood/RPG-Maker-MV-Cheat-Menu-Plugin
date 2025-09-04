import CheatMenu from '../CheatMenu.ts';

// increase stat bonus
CheatMenu.give_stat = (actor, stat_index, amount) => {
  if (actor.paramPlus(stat_index) != undefined) {
    actor.addParam(stat_index, amount);
  }
};

// handlers for the stat cheat
CheatMenu.apply_current_stat = function (direction) {
  let amount = CheatMenu.amounts[CheatMenu.amount_index];

  if (direction == 'left') {
    amount = -amount;
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }
  CheatMenu.give_stat(
    $gameActors.actor(CheatMenu.cheat_selected_actor),
    CheatMenu.stat_selection,
    amount,
  );
  CheatMenu.update_menu();
};

// append the stat selection to the menu
CheatMenu.append_stat_selection = function (key1, key2, key3, key4) {
  CheatMenu.append_title('Stat');

  const actorParamPlus = ($gameActors as any).actor(
    CheatMenu.cheat_selected_actor,
  )?._paramPlus as Game_Actor['_paramPlus'];

  let stat_string = '';
  if ($gameActors.actor(CheatMenu.cheat_selected_actor) && actorParamPlus) {
    if (CheatMenu.stat_selection >= actorParamPlus.length) {
      CheatMenu.stat_selection = 0;
    }
    stat_string += $dataSystem.terms.params[CheatMenu.stat_selection];
  }

  CheatMenu.append_scroll_selector(
    stat_string,
    key1,
    key2,
    CheatMenu.scroll_stat,
  );
  let current_value: number | 'NULL' = 'NULL';

  if ($gameActors.actor(CheatMenu.cheat_selected_actor) && actorParamPlus) {
    current_value = actorParamPlus[CheatMenu.stat_selection];
  }
  CheatMenu.append_scroll_selector(
    current_value,
    key3,
    key4,
    CheatMenu.apply_current_stat,
  );
};

// Left and right scrolls for handling switching between stats for the selected character
CheatMenu.scroll_stat = function (direction) {
  // another hack
  const actorParamPlus = ($gameActors as any).actor(
    CheatMenu.cheat_selected_actor,
  )?._paramPlus as Game_Actor['_paramPlus'];

  if (actorParamPlus) {
    if (direction == 'left') {
      CheatMenu.stat_selection--;
      if (CheatMenu.stat_selection < 0) {
        CheatMenu.stat_selection = actorParamPlus.length - 1;
      }
    } else {
      CheatMenu.stat_selection++;
      if (CheatMenu.stat_selection >= actorParamPlus.length) {
        CheatMenu.stat_selection = 0;
      }
    }
  } else {
    CheatMenu.stat_selection = 0;
  }

  SoundManager.playSystemSound(0);
  CheatMenu.update_menu();
};
