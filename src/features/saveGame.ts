import CheatMenu from '../CheatMenu.ts';

// Saves to any slot at any time — even where the game disables saving.

// result of the last save attempt, shown under the button until the slot changes
let lastResult: string | null = null;

function maxSlot(): number {
  return Math.max(1, DataManager.maxSavefiles());
}

function describeSlot(slot: number): string {
  // MV: loadSavefileInfo, MZ: savefileInfo
  const dm = DataManager as unknown as {
    loadSavefileInfo?: (id: number) => SavefileInfo | null;
    savefileInfo?: (id: number) => SavefileInfo | null;
  };
  let info: SavefileInfo | null | undefined;
  try {
    info = dm.loadSavefileInfo?.(slot) ?? dm.savefileInfo?.(slot);
  } catch {
    info = null;
  }
  if (!info) return 'Empty';
  const date = info.timestamp ? new Date(info.timestamp).toLocaleString() : '';
  return `${info.title || 'Saved'}${date ? ` (${date})` : ''}`;
}

CheatMenu.scrollSaveSlot = function (direction) {
  const max = maxSlot();
  if (direction === 'left') {
    CheatMenu.saveSlotSelection--;
    if (CheatMenu.saveSlotSelection < 1) CheatMenu.saveSlotSelection = max;
  } else {
    CheatMenu.saveSlotSelection++;
    if (CheatMenu.saveSlotSelection > max) CheatMenu.saveSlotSelection = 1;
  }
  lastResult = null;
  SoundManager.playSystemSound(0);
  CheatMenu.updateMenu();
};

CheatMenu.saveToSelectedSlot = function () {
  // troop/battle state isn't part of a save file — a mid-battle save would
  // load back on the map with the party still flagged as in battle
  if ($gameParty.inBattle()) {
    lastResult = 'Unavailable in battle';
    SoundManager.playBuzzer();
    CheatMenu.updateMenu();
    return;
  }

  const slot = CheatMenu.saveSlotSelection;
  const onDone = (ok: boolean) => {
    lastResult = ok ? `Saved to slot ${slot}` : 'Save failed';
    if (ok) {
      SoundManager.playSave();
    } else {
      SoundManager.playBuzzer();
    }
    CheatMenu.updateMenu();
  };

  // Scene_Save normally calls this (save count, BGM, version id)
  $gameSystem.onBeforeSave();
  try {
    // MV returns a boolean, MZ returns a Promise
    const result = DataManager.saveGame?.(slot) as
      boolean | Promise<unknown> | undefined;
    if (result instanceof Promise) {
      result.then(
        () => onDone(true),
        () => onDone(false),
      );
    } else {
      onDone(result === true);
    }
  } catch (e) {
    console.error('[Cheat_Menu] save failed', e);
    onDone(false);
  }
};

CheatMenu.appendSaveGame = function (key1, key2, key3) {
  const max = maxSlot();
  if (CheatMenu.saveSlotSelection < 1 || CheatMenu.saveSlotSelection > max) {
    CheatMenu.saveSlotSelection = 1;
  }
  const slot = CheatMenu.saveSlotSelection;

  CheatMenu.appendTitle('Slot');
  CheatMenu.appendScrollSelector(
    `${slot} / ${max}`,
    key1,
    key2,
    CheatMenu.scrollSaveSlot,
    true,
  );
  CheatMenu.appendDescription(describeSlot(slot));
  CheatMenu.appendCheat('Save', 'Activate', key3, CheatMenu.saveToSelectedSlot);
  if (lastResult) {
    CheatMenu.appendDescription(lastResult);
  }
};

export const menu = {
  name: 'Save Game',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendSaveGame(4, 5, 6);
  },
};
