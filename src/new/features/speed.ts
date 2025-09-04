import CheatMenu from '../CheatMenu.ts';

// initialize speed hook for locking
CheatMenu.initialize_speed_lock = () => {
  if (!CheatMenu.speed_initialized) {
    CheatMenu.speed = $gamePlayer.moveSpeed();
    Object.defineProperty($gamePlayer, '_moveSpeed', {
      get: function () {
        return CheatMenu.speed;
      },
      set: function (newVal) {
        if (CheatMenu.speed_unlocked) {
          CheatMenu.speed = newVal;
        }
      },
    });
    CheatMenu.speed_initialized = true;
  }
};

// change player movement speed
CheatMenu.change_player_speed = (amount) => {
  CheatMenu.initialize_speed_lock();
  if (CheatMenu.speed) {
    CheatMenu.speed += amount; // probably type error
  }
};

// toggle locking of player speed
CheatMenu.toggle_lock_player_speed = () => {
  CheatMenu.initialize_speed_lock();
  CheatMenu.speed_unlocked = !CheatMenu.speed_unlocked;
};

// handler for the movement speed cheat
CheatMenu.apply_speed_change = function (direction) {
  let amount = CheatMenu.move_amounts[CheatMenu.move_amount_index];
  if (direction == 'left') {
    amount = -amount;
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }
  CheatMenu.change_player_speed(amount);
  CheatMenu.update_menu();
};

CheatMenu.apply_speed_lock_toggle = function () {
  CheatMenu.toggle_lock_player_speed();
  if (CheatMenu.speed_unlocked) {
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }
  CheatMenu.update_menu();
};

// append the movement speed to the menu
CheatMenu.append_speed_status = function (key1, key2, key3) {
  CheatMenu.append_title('Current Speed');
  CheatMenu.append_scroll_selector(
    $gamePlayer.moveSpeed(),
    key1,
    key2,
    CheatMenu.apply_speed_change,
  );

  let status_html;
  if (!CheatMenu.speed_unlocked) {
    status_html = '<span class="status-on">false</span>';
  } else {
    status_html = '<span class="status-off">true</span>';
  }
  CheatMenu.append_cheat(
    'Speed Unlocked',
    status_html,
    key3,
    CheatMenu.apply_speed_lock_toggle,
  );
};

// Left and right scrolls for handling switching amount to modify for the movement cheat
CheatMenu.scroll_move_amount = function (direction) {
  if (direction == 'left') {
    CheatMenu.move_amount_index--;
    if (CheatMenu.move_amount_index < 0) {
      CheatMenu.move_amount_index = 0;
    }
    SoundManager.playSystemSound(2);
  } else {
    CheatMenu.move_amount_index++;
    if (CheatMenu.move_amount_index >= CheatMenu.move_amounts.length) {
      CheatMenu.move_amount_index = CheatMenu.move_amounts.length - 1;
    }
    SoundManager.playSystemSound(1);
  }

  CheatMenu.update_menu();
};

// append the movement speed amount to the menu
CheatMenu.append_move_amount_selection = function (key1, key2) {
  CheatMenu.append_title('Amount');

  const currentMoveAmount = CheatMenu.move_amounts[CheatMenu.move_amount_index];
  const currentMoveAmountHtml = `<span class='actor-name-highlight'>${currentMoveAmount}</span>`;

  CheatMenu.append_scroll_selector(
    currentMoveAmountHtml,
    key1,
    key2,
    CheatMenu.scroll_move_amount,
  );
};
