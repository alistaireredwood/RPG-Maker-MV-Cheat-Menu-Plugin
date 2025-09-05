import CheatMenu from '../CheatMenu';

/////////////////////////////////////////////////
// Load Hook
/////////////////////////////////////////////////

// close the menu and set for initialization on first open
//	timer to provide periodic updates if the menu is open
CheatMenu.initialize = () => {
  CheatMenu.isOverlayOpenable = true;
  CheatMenu.initialized = false;
  CheatMenu.isCheatMenuOpen = false;
  CheatMenu.speed_initialized = false;
  CheatMenu.overlay_box.remove();
  CheatMenu.overlay.remove();

  // periodic update
  clearInterval(CheatMenu.menu_update_timer || undefined);
  CheatMenu.menu_update_timer = setInterval(function () {
    if (CheatMenu.isCheatMenuOpen) {
      CheatMenu.update_menu();
    }
  }, 1000);
};

// add hook for loading a game
DataManager.default_loadGame = DataManager.loadGame;
DataManager.loadGame = function (saveFileId) {
  CheatMenu.initialize();

  if (DataManager.default_loadGame) {
    return DataManager.default_loadGame(saveFileId);
  }

  return false;
};

// add hook for new game
DataManager.default_setupNewGame = DataManager.setupNewGame;
DataManager.setupNewGame = function () {
  CheatMenu.initialize();

  if (DataManager.default_setupNewGame) {
    DataManager.default_setupNewGame();
  }
};

// add hook for saving values (just added into $gameSystem to be saved)

DataManager.default_saveGame = DataManager.saveGame;
DataManager.saveGame = function (saveFileId) {
  // save values that are in intial values

  $gameSystem.CheatMenu = {};
  for (let name in CheatMenu.initialValues) {
    // @ts-ignore
    $gameSystem.CheatMenu[name] = CheatMenu[name];
  }

  if (DataManager.default_saveGame) {
    return DataManager.default_saveGame(saveFileId);
  }

  return false;
};
