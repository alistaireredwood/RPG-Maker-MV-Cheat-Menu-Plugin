import CheatMenu from '../CheatMenu.ts';

// increase exp
CheatMenu.give_exp = (actor, amount) => {
  actor.gainExp(amount);
};

// handlers for the exp cheat
CheatMenu.apply_current_exp = function (direction) {
  let amount = CheatMenu.amounts[CheatMenu.amount_index];
  if (direction == 'left') {
    amount = -amount;
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }
  CheatMenu.give_exp($gameActors.actor(CheatMenu.cheat_selected_actor), amount);
  CheatMenu.update_menu();
};

// append the exp cheat to the menu
CheatMenu.append_exp_cheat = function (key1, key2) {
  let current_exp;

  if ($gameActors.actor(CheatMenu.cheat_selected_actor)) {
    current_exp = $gameActors
      .actor(CheatMenu.cheat_selected_actor)
      .currentExp();
  }
  CheatMenu.append_title('EXP');
  CheatMenu.append_scroll_selector(
    current_exp || 0,
    key1,
    key2,
    CheatMenu.apply_current_exp,
  );
};
