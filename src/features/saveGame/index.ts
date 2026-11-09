import { defineFeature } from '@src/core/feature.ts';
import { renameV1Keys } from '@src/core/persistence.ts';
import { updateMenu } from '@src/core/ui/render.ts';
import type { Direction } from '@src/core/ui/widgets/scrollSelector.ts';

// Saves to any slot at any time — even where the game disables saving.

const state = {
  slot: 1,
};

// shown under the button until the slot changes
let lastResult: string | null = null;

const maxSlot = () => Math.max(1, DataManager.maxSavefiles());

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

function scrollSlot(direction: Direction): void {
  const max = maxSlot();
  if (direction === 'left') {
    state.slot = state.slot <= 1 ? max : state.slot - 1;
  } else {
    state.slot = state.slot >= max ? 1 : state.slot + 1;
  }
  lastResult = null;
  SoundManager.playSystemSound(0);
  updateMenu();
}

function showResult(ok: boolean, slot: number): void {
  lastResult = ok ? `Saved to slot ${slot}` : 'Save failed';
  if (ok) SoundManager.playSave();
  else SoundManager.playBuzzer();
  updateMenu();
}

function saveToSelectedSlot(): void {
  // troop/battle state isn't part of a save file — a mid-battle save would
  // load back on the map with the party still flagged as in battle
  if ($gameParty.inBattle()) {
    lastResult = 'Unavailable in battle';
    SoundManager.playBuzzer();
    updateMenu();
    return;
  }

  const slot = state.slot;
  // Scene_Save normally calls this (save count, BGM, version id)
  $gameSystem.onBeforeSave();
  try {
    // MV returns a boolean, MZ returns a Promise
    const result = DataManager.saveGame(slot) as boolean | Promise<unknown>;
    if (result instanceof Promise) {
      result.then(
        () => showResult(true, slot),
        () => showResult(false, slot),
      );
    } else {
      showResult(result === true, slot);
    }
  } catch (e) {
    console.error('[Cheat_Menu] save failed', e);
    showResult(false, slot);
  }
}

export default defineFeature({
  id: 'saveGame',
  state,
  migrateV1: (v1) =>
    renameV1Keys<typeof state>(v1, { slot: 'saveSlotSelection' }),
  menus: [
    {
      id: 'saveGame',
      name: 'Save Game',
      render(ui) {
        const max = maxSlot();
        if (state.slot < 1 || state.slot > max) state.slot = 1;

        ui.cheatTitle();
        ui.title('Slot');
        ui.scrollSelector(`${state.slot} / ${max}`, scrollSlot, {
          selectable: true,
        });
        ui.description(describeSlot(state.slot));
        ui.cheat('Save', 'Activate', saveToSelectedSlot);
        if (lastResult) ui.description(lastResult);
      },
    },
  ],
});
