import CheatMenu from '../CheatMenu.ts';

CheatMenu.initializeSpeedLock = () => {
  if (!CheatMenu.speedInitialized) {
    CheatMenu.speed = $gamePlayer.moveSpeed();
    Object.defineProperty($gamePlayer, '_moveSpeed', {
      get: function () {
        return CheatMenu.speed;
      },
      set: function (newVal) {
        if (CheatMenu.speedUnlocked) {
          CheatMenu.speed = newVal;
        }
      },
    });
    CheatMenu.speedInitialized = true;
  }
};

CheatMenu.changePlayerSpeed = (amount) => {
  CheatMenu.initializeSpeedLock();
  if (CheatMenu.speed) {
    CheatMenu.speed += amount;
  }
};

CheatMenu.toggleLockPlayerSpeed = () => {
  CheatMenu.initializeSpeedLock();
  CheatMenu.speedUnlocked = !CheatMenu.speedUnlocked;
};

CheatMenu.applySpeedChange = function (direction) {
  let amount = CheatMenu.move_amounts[CheatMenu.moveAmountIndex];
  if (direction == 'left') {
    amount = -amount;
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }
  CheatMenu.changePlayerSpeed(amount);
  CheatMenu.updateMenu();
};

CheatMenu.applySpeedLockToggle = function () {
  CheatMenu.toggleLockPlayerSpeed();
  if (CheatMenu.speedUnlocked) {
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }
  CheatMenu.updateMenu();
};

CheatMenu.appendSpeedStatus = function (key1, key2, key3) {
  CheatMenu.appendTitle('Current Speed');
  CheatMenu.appendScrollSelector(
    $gamePlayer.moveSpeed(),
    key1,
    key2,
    CheatMenu.applySpeedChange,
  );

  let statusHtml;
  if (!CheatMenu.speedUnlocked) {
    statusHtml = '<span class="status-on">false</span>';
  } else {
    statusHtml = '<span class="status-off">true</span>';
  }
  CheatMenu.appendCheat(
    'Speed Unlocked',
    statusHtml,
    key3,
    CheatMenu.applySpeedLockToggle,
  );
};

CheatMenu.scrollMoveAmount = function (direction) {
  if (direction == 'left') {
    CheatMenu.moveAmountIndex--;
    if (CheatMenu.moveAmountIndex < 0) {
      CheatMenu.moveAmountIndex = 0;
    }
    SoundManager.playSystemSound(2);
  } else {
    CheatMenu.moveAmountIndex++;
    if (CheatMenu.moveAmountIndex >= CheatMenu.move_amounts.length) {
      CheatMenu.moveAmountIndex = CheatMenu.move_amounts.length - 1;
    }
    SoundManager.playSystemSound(1);
  }

  CheatMenu.updateMenu();
};

CheatMenu.appendMoveAmountSelection = function (key1, key2) {
  CheatMenu.appendTitle('Amount');

  const currentMoveAmount = CheatMenu.move_amounts[CheatMenu.moveAmountIndex];
  const currentMoveAmountHtml = `<span class='actor-name-highlight'>${currentMoveAmount}</span>`;

  CheatMenu.appendScrollSelector(
    currentMoveAmountHtml,
    key1,
    key2,
    CheatMenu.scrollMoveAmount,
  );
};

CheatMenu.menus.splice(0, 0, {
  name: 'Speed',
  render: () => {
    CheatMenu.appendCheatTitle('Speed');
    CheatMenu.appendMoveAmountSelection(4, 5);
    CheatMenu.appendSpeedStatus(6, 7, 8);
  },
});
