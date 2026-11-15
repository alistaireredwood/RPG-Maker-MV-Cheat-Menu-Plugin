import { defineFeature } from '@src/core/feature.ts';
import { renameV1Keys } from '@src/core/persistence.ts';
import { updateMenu } from '@src/core/ui/render.ts';
import type { Direction } from '@src/core/ui/widgets/scrollSelector.ts';
import { teleport } from '@src/shared/game/teleport.ts';

const state = {
  location: { m: 1, x: 0, y: 0 },
};

// map dimensions are only known for the currently loaded map —
// $dataMapInfos has no size data, so other maps fall back to 255
const isCurrentMapSelected = () => state.location.m === $gameMap.mapId();
const maxX = () => (isCurrentMapSelected() ? $gameMap.width() - 1 : 255);
const maxY = () => (isCurrentMapSelected() ? $gameMap.height() - 1 : 255);

const step = (direction: Direction) => (direction === 'left' ? -1 : 1);

function stepWrapped(value: number, max: number, direction: Direction): number {
  const next = value + step(direction);
  if (direction === 'left') return next < 0 ? max : next;
  return next > max ? 0 : next;
}

const mapName = (mapId: number) => $dataMapInfos[mapId]?.name || 'NULL';

function scrollMap(direction: Direction): void {
  // skip deleted (null) and unnamed map entries — teleporting to a deleted
  // map would try to load a nonexistent map file
  const len = $dataMapInfos.length;
  let m = state.location.m;
  for (let i = 0; i < len; i++) {
    m += step(direction);
    if (m < 1) m = len - 1;
    else if (m >= len) m = 1;
    if ($dataMapInfos[m]?.name) {
      state.location.m = m;
      break;
    }
  }
  state.location.x = Math.min(state.location.x, maxX());
  state.location.y = Math.min(state.location.y, maxY());

  SoundManager.playSystemSound(0);
  updateMenu();
}

function scrollX(direction: Direction): void {
  state.location.x = stepWrapped(state.location.x, maxX(), direction);
  SoundManager.playSystemSound(0);
  updateMenu();
}

function scrollY(direction: Direction): void {
  state.location.y = stepWrapped(state.location.y, maxY(), direction);
  SoundManager.playSystemSound(0);
  updateMenu();
}

function teleportToSelection(): void {
  const { m, x, y } = state.location;
  teleport(m, x, y);
  SoundManager.playSystemSound(1);
  updateMenu();
}

export default defineFeature({
  id: 'teleport',
  state,
  migrateV1: (v1) =>
    renameV1Keys<typeof state>(v1, { location: 'teleportLocation' }),
  menus: [
    {
      id: 'teleport',
      name: 'Teleport',
      render(ui) {
        const { m, x, y } = state.location;
        ui.cheatTitle();
        ui.scrollSelector(`${m}: ${mapName(m)}`, scrollMap, {
          selectable: true,
        });
        ui.scrollSelector(`X: ${x}`, scrollX);
        ui.scrollSelector(`Y: ${y}`, scrollY);
        ui.cheat('Teleport', 'Activate', teleportToSelection);
      },
    },
  ],
});
