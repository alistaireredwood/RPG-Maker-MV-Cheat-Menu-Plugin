import CheatMenu from '../CheatMenu.ts';

CheatMenu.teleport = (mapId, xPos, yPos) => {
  $gamePlayer.reserveTransfer(mapId, xPos, yPos, $gamePlayer.direction(), 0);
  $gamePlayer.setPosition(xPos, yPos);
};

CheatMenu.scrollMapTeleportSelection = function (direction) {
  if (direction == 'left') {
    CheatMenu.teleportLocation.m--;
    if (CheatMenu.teleportLocation.m < 1) {
      CheatMenu.teleportLocation.m = $dataMapInfos.length - 1;
    }
  } else {
    CheatMenu.teleportLocation.m++;
    if (CheatMenu.teleportLocation.m >= $dataMapInfos.length) {
      CheatMenu.teleportLocation.m = 1;
    }
  }

  SoundManager.playSystemSound(0);
  CheatMenu.updateMenu();
};

CheatMenu.scrollXTeleportSelection = function (direction) {
  if (direction == 'left') {
    CheatMenu.teleportLocation.x--;
    if (CheatMenu.teleportLocation.x < 0) {
      CheatMenu.teleportLocation.x = 255;
    }
  } else {
    CheatMenu.teleportLocation.x++;
    if (CheatMenu.teleportLocation.x > 255) {
      CheatMenu.teleportLocation.x = 0;
    }
  }

  SoundManager.playSystemSound(0);
  CheatMenu.updateMenu();
};

CheatMenu.scrollYTeleportSelection = function (direction) {
  if (direction == 'left') {
    CheatMenu.teleportLocation.y--;
    if (CheatMenu.teleportLocation.y < 0) {
      CheatMenu.teleportLocation.y = 255;
    }
  } else {
    CheatMenu.teleportLocation.y++;
    if (CheatMenu.teleportLocation.y > 255) {
      CheatMenu.teleportLocation.y = 0;
    }
  }

  SoundManager.playSystemSound(0);
  CheatMenu.updateMenu();
};

CheatMenu.teleportCurrentLocation = function () {
  CheatMenu.teleport(
    CheatMenu.teleportLocation.m,
    CheatMenu.teleportLocation.x,
    CheatMenu.teleportLocation.y,
  );
  SoundManager.playSystemSound(1);
  CheatMenu.updateMenu();
};

CheatMenu.appendTeleport = function (
  key1,
  key2,
  key3,
  key4,
  key5,
  key6,
  key7,
) {
  let currentMap = '' + CheatMenu.teleportLocation.m + ': ';

  if (
    $dataMapInfos[CheatMenu.teleportLocation.m] &&
    $dataMapInfos[CheatMenu.teleportLocation.m].name
  ) {
    currentMap += $dataMapInfos[CheatMenu.teleportLocation.m].name;
  } else {
    currentMap += 'NULL';
  }

  CheatMenu.appendScrollSelector(
    currentMap,
    key1,
    key2,
    CheatMenu.scrollMapTeleportSelection,
  );

  CheatMenu.appendScrollSelector(
    'X: ' + CheatMenu.teleportLocation.x,
    key3,
    key4,
    CheatMenu.scrollXTeleportSelection,
  );

  CheatMenu.appendScrollSelector(
    'Y: ' + CheatMenu.teleportLocation.y,
    key5,
    key6,
    CheatMenu.scrollYTeleportSelection,
  );

  CheatMenu.appendCheat(
    'Teleport',
    'Activate',
    key7,
    CheatMenu.teleportCurrentLocation,
  );
};

export const menu = {
  name: 'Teleport',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendTeleport(4, 5, 6, 7, 8, 9, 0);
  },
};
