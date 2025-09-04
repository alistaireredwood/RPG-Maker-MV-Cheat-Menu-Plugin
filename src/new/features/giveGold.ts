import CheatMenu from '../CheatMenu.ts';

// increase gold
CheatMenu.give_gold = (amount) => {
  $gameParty.gainGold(amount);
};

// handlers for the gold cheat
CheatMenu.apply_current_gold = function (direction) {
  let amount = CheatMenu.amounts[CheatMenu.amount_index];

  if (direction == 'left') {
    amount = -amount;
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }

  CheatMenu.give_gold(amount);
  CheatMenu.update_menu();
};

// append the gold cheat to the menu
CheatMenu.append_gold_status = function (key1, key2) {
  CheatMenu.append_title('Gold');
  CheatMenu.append_scroll_selector(
    $gameParty.gold(),
    key1,
    key2,
    CheatMenu.apply_current_gold,
  );
};
