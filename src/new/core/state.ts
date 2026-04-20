import CheatMenu from '../CheatMenu';

CheatMenu.initialize = () => {
  CheatMenu.isOverlayOpenable = true;
  CheatMenu.initialized = false;
  CheatMenu.isCheatMenuOpen = false;
  CheatMenu.speedInitialized = false;
  CheatMenu.overlayBox.remove();
  CheatMenu.overlay.remove();

  clearInterval(CheatMenu.menuUpdateTimer || undefined);
  CheatMenu.menuUpdateTimer = setInterval(function () {
    if (CheatMenu.isCheatMenuOpen) {
      CheatMenu.updateMenu();
    }
  }, 1000);
};

DataManager.default_loadGame = DataManager.loadGame;
DataManager.loadGame = function (saveFileId) {
  CheatMenu.initialize();

  if (DataManager.default_loadGame) {
    return DataManager.default_loadGame(saveFileId);
  }

  return false;
};

DataManager.default_setupNewGame = DataManager.setupNewGame;
DataManager.setupNewGame = function () {
  CheatMenu.initialize();

  if (DataManager.default_setupNewGame) {
    DataManager.default_setupNewGame();
  }
};

DataManager.default_saveGame = DataManager.saveGame;
DataManager.saveGame = function (saveFileId) {
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
