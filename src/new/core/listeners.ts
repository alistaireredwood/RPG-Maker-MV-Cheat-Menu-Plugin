import CheatMenu from '../CheatMenu';

if (typeof CheatMenu.keyMappings == 'undefined') {
  CheatMenu.keyMappings = {};
}

CheatMenu.keyMappings = {
  KEY_0: '0',
  KEY_1: '1',
  KEY_2: '2',
  KEY_3: '3',
  KEY_4: '4',
  KEY_5: '5',
  KEY_6: '6',
  KEY_7: '7',
  KEY_8: '8',
  KEY_9: '9',
  MINUS: '-',
  EQUAL: '=',
  TILDE: '`',
  F1: 'F1',
  F8: 'F8',
  F9: 'F9',
};

CheatMenu.handleShowDevTools = (event) => {
  if (
    !event.ctrlKey &&
    !event.altKey &&
    event.key === CheatMenu.keyMappings.F8 &&
    $gameTemp &&
    !$gameTemp.isPlaytest()
  ) {
    event.stopPropagation();
    event.preventDefault();
    try {
      const gui = require('nw.gui');

      gui.Window.get().showDevTools();
    } catch (e) {
      console.warn("[CheatMenu] Failed to load 'nw.gui' for DevTools:", e);
    }
  }
};

CheatMenu.handleShowRpgMakerDebug = (event) => {
  if (
    !event.altKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    event.key === CheatMenu.keyMappings.F9 &&
    $gameTemp &&
    !$gameTemp.isPlaytest()
  ) {
    ($gameTemp as any)._isPlaytest = true;

    setTimeout(function () {
      ($gameTemp as any) = false;
    }, 100);
  }
};

CheatMenu.handleToggleCheatMenu = (event) => {
  if (
    CheatMenu.isOverlayOpenable &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.shiftKey
  ) {
    if (event.key === CheatMenu.keyMappings.KEY_1) {
      if (!CheatMenu.initialized) {
        const gameActorsData = ($gameActors as any)._data as Game_Actor[];

        for (let i = 0; i < gameActorsData.length; i++) {
          const actorInstance = $gameActors.actor(i) as CheatMenu_Game_Actor;

          if (actorInstance) {
            actorInstance.godMode = false;

            if (actorInstance.godModeInterval) {
              clearInterval(actorInstance.godModeInterval);
            }
          }
        }

        for (let name in CheatMenu.initialValues) {
          // @ts-ignore
          CheatMenu[name] =
            CheatMenu.initialValues[
              name as keyof typeof CheatMenu.initialValues
            ];
        }

        if ($gameSystem.CheatMenu) {
          for (let name in $gameSystem.CheatMenu) {
            // @ts-ignore
            CheatMenu[name] = $gameSystem.CheatMenu[name];
          }
        }

        if (!CheatMenu.speedUnlocked) {
          CheatMenu.initializeSpeedLock();
        }

        CheatMenu.initialized = true;
      }

      if (!CheatMenu.isCheatMenuOpen) {
        CheatMenu.isCheatMenuOpen = true;
        document.body.appendChild(CheatMenu.overlay);
        CheatMenu.updateMenu();
        SoundManager.playSystemSound(1);
      } else {
        CheatMenu.isCheatMenuOpen = false;
        CheatMenu.overlay.remove();
        SoundManager.playSystemSound(2);
        const ind = document.getElementById('cheat-menu-indicator');
        if (ind) ind.style.display = '';
      }
    } else if (CheatMenu.isCheatMenuOpen) {
      if (event.key === CheatMenu.keyMappings.TILDE) {
        CheatMenu.position++;
        if (CheatMenu.position > 4) {
          CheatMenu.position = 0;
        }
        CheatMenu.updateMenu();
      } else {
        for (const keyCode in CheatMenu.keyMappings) {
          if (
            CheatMenu.keyListeners[CheatMenu.keyMappings[keyCode]] &&
            event.key === CheatMenu.keyMappings[keyCode]
          ) {
            // @ts-ignore
            CheatMenu.keyListeners[CheatMenu.keyMappings[keyCode]](event);
          }
        }
      }
    }
  }
};

window.addEventListener('keydown', (event) => {
  CheatMenu.handleShowDevTools(event);
  CheatMenu.handleShowRpgMakerDebug(event);
  CheatMenu.handleToggleCheatMenu(event);
});

window.addEventListener('resize', () => CheatMenu.positionMenu());
