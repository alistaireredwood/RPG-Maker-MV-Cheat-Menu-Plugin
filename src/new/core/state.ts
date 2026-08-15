import CheatMenu from '../CheatMenu';

CheatMenu.initialize = () => {
  CheatMenu.isOverlayOpenable = true;
  CheatMenu.initialized = false;
  CheatMenu.isCheatMenuOpen = false;
  CheatMenu.speedInitialized = false;
  CheatMenu.overlay.remove();

  clearInterval(CheatMenu.menuUpdateTimer || undefined);
  CheatMenu.menuUpdateTimer = setInterval(function () {
    if (CheatMenu.isCheatMenuOpen && CheatMenu.currentMenuIndex !== null) {
      // a periodic rebuild would wipe out any text the user is mid-selecting
      // (e.g. double-clicking a name to copy it) — skip this tick instead
      const selection = window.getSelection();
      const hasSelectionInMenu =
        !!selection &&
        !selection.isCollapsed &&
        !!selection.anchorNode &&
        CheatMenu.overlay.contains(selection.anchorNode);

      // <input>/<textarea> selections (e.g. double-clicking the Amount
      // field) live in selectionStart/End, not in window.getSelection()
      const active = document.activeElement as HTMLInputElement | null;
      const hasInputSelection =
        !!active &&
        (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') &&
        CheatMenu.overlay.contains(active) &&
        active.selectionStart !== active.selectionEnd;

      if (hasSelectionInMenu || hasInputSelection) return;

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
