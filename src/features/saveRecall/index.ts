import { defineFeature } from '@src/core/feature.ts';
import { renameV1Keys } from '@src/core/persistence.ts';
import { updateMenu } from '@src/core/ui/render.ts';
import { teleport } from '@src/shared/game/teleport.ts';
import { escapeHtml } from '@src/shared/html.ts';

const EMPTY = -1;

const state = {
  positions: [
    { m: EMPTY, x: EMPTY, y: EMPTY },
    { m: EMPTY, x: EMPTY, y: EMPTY },
    { m: EMPTY, x: EMPTY, y: EMPTY },
  ],
};

const mapName = (mapId: number) => $dataMapInfos[mapId]?.name || 'NULL';

const positionLabel = (mapId: number, x: number, y: number) =>
  `${mapId}: ${escapeHtml(mapName(mapId))} (${x}, ${y})`;

function savePosition(index: number): void {
  state.positions[index] = {
    m: $gameMap.mapId(),
    x: $gamePlayer.x,
    y: $gamePlayer.y,
  };
  SoundManager.playSystemSound(1);
  updateMenu();
}

function recallPosition(index: number): void {
  const { m, x, y } = state.positions[index];
  if (m !== EMPTY) {
    teleport(m, x, y);
    SoundManager.playSystemSound(1);
  } else {
    SoundManager.playSystemSound(2);
  }
  updateMenu();
}

export default defineFeature({
  id: 'saveRecall',
  state,
  migrateV1: (v1) =>
    renameV1Keys<typeof state>(v1, { positions: 'savedPositions' }),
  menus: [
    {
      id: 'saveRecall',
      name: 'Save and Recall',
      tier: 'advanced',
      render(ui) {
        ui.cheatTitle();
        ui.title('Current Position');
        const mapId = $gameMap.mapId();
        ui.description(
          $dataMapInfos[mapId]?.name
            ? positionLabel(mapId, $gamePlayer.x, $gamePlayer.y)
            : 'NULL',
        );

        state.positions.forEach(({ m, x, y }, index) => {
          ui.title(`Position ${index + 1}`);
          ui.description(m !== EMPTY ? positionLabel(m, x, y) : 'NULL');
          ui.buttonRow([
            { label: 'Save', onActivate: () => savePosition(index) },
            { label: 'Recall', onActivate: () => recallPosition(index) },
          ]);
        });
      },
    },
  ],
});
