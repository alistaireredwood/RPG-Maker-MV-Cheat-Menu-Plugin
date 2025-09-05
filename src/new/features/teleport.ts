import CheatMenu from '../CheatMenu.ts';

// Change location by map id, and x, y position
CheatMenu.teleport = (map_id, x_pos, y_pos) => {
  $gamePlayer.reserveTransfer(map_id, x_pos, y_pos, $gamePlayer.direction(), 0);
  $gamePlayer.setPosition(x_pos, y_pos);
};

// Left and right scrollers for handling switching between target teleport map
CheatMenu.scroll_map_teleport_selection = function (direction) {
  if (direction == 'left') {
    CheatMenu.teleport_location.m--;
    if (CheatMenu.teleport_location.m < 1) {
      CheatMenu.teleport_location.m = $dataMapInfos.length - 1;
    }
  } else {
    CheatMenu.teleport_location.m++;
    if (CheatMenu.teleport_location.m >= $dataMapInfos.length) {
      CheatMenu.teleport_location.m = 1;
    }
  }

  SoundManager.playSystemSound(0);
  CheatMenu.update_menu();
};

// Left and right scrollers for handling switching between target teleport x coord
CheatMenu.scroll_x_teleport_selection = function (direction) {
  if (direction == 'left') {
    CheatMenu.teleport_location.x--;
    if (CheatMenu.teleport_location.x < 0) {
      CheatMenu.teleport_location.x = 255;
    }
  } else {
    CheatMenu.teleport_location.x++;
    if (CheatMenu.teleport_location.x > 255) {
      CheatMenu.teleport_location.x = 0;
    }
  }

  SoundManager.playSystemSound(0);
  CheatMenu.update_menu();
};

// Left and right scrollers for handling switching between target teleport y coord
CheatMenu.scroll_y_teleport_selection = function (direction) {
  if (direction == 'left') {
    CheatMenu.teleport_location.y--;
    if (CheatMenu.teleport_location.y < 0) {
      CheatMenu.teleport_location.y = 255;
    }
  } else {
    CheatMenu.teleport_location.y++;
    if (CheatMenu.teleport_location.y > 255) {
      CheatMenu.teleport_location.y = 0;
    }
  }

  SoundManager.playSystemSound(0);
  CheatMenu.update_menu();
};

// handler for teleporting to targed map and location
CheatMenu.teleport_current_location = function () {
  CheatMenu.teleport(
    CheatMenu.teleport_location.m,
    CheatMenu.teleport_location.x,
    CheatMenu.teleport_location.y,
  );
  SoundManager.playSystemSound(1);
  CheatMenu.update_menu();
};

// append the teleport cheat to the menu
CheatMenu.append_teleport = function (
  key1,
  key2,
  key3,
  key4,
  key5,
  key6,
  key7,
) {
  let current_map = '' + CheatMenu.teleport_location.m + ': ';

  if (
    $dataMapInfos[CheatMenu.teleport_location.m] &&
    $dataMapInfos[CheatMenu.teleport_location.m].name
  ) {
    current_map += $dataMapInfos[CheatMenu.teleport_location.m].name;
  } else {
    current_map += 'NULL';
  }

  CheatMenu.append_scroll_selector(
    current_map,
    key1,
    key2,
    CheatMenu.scroll_map_teleport_selection,
  );

  CheatMenu.append_scroll_selector(
    'X: ' + CheatMenu.teleport_location.x,
    key3,
    key4,
    CheatMenu.scroll_x_teleport_selection,
  );

  CheatMenu.append_scroll_selector(
    'Y: ' + CheatMenu.teleport_location.y,
    key5,
    key6,
    CheatMenu.scroll_y_teleport_selection,
  );

  CheatMenu.append_cheat(
    'Teleport',
    'Activate',
    key7,
    CheatMenu.teleport_current_location,
  );
};

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Teleport');
  CheatMenu.append_teleport(4, 5, 6, 7, 8, 9, 0);
});
