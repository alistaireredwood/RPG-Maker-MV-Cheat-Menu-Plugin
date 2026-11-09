import { defineFeature } from '../../core/feature.ts';
import { renameV1Keys } from '../../core/persistence.ts';
import { updateMenu } from '../../core/ui/render.ts';
import { teleport } from '../../shared/game/teleport.ts';

const EMPTY = -1;

const state = {
  positions: [
    { m: EMPTY, x: EMPTY, y: EMPTY },
    { m: EMPTY, x: EMPTY, y: EMPTY },
    { m: EMPTY, x: EMPTY, y: EMPTY },
  ],
};

const mapName = (mapId: number) => $dataMapInfos[mapId]?.name || 'NULL';

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
      render(ui) {
        ui.cheatTitle();
        ui.title('Current Position: ');
        const mapId = $gameMap.mapId();
        if ($dataMapInfos[mapId]?.name) {
          ui.description(`${mapId}: ${mapName(mapId)}`);
          ui.description(`(${$gamePlayer.x}, ${$gamePlayer.y})`);
        } else {
          ui.description('NULL');
        }

        state.positions.forEach(({ m, x, y }, index) => {
          const saved = m !== EMPTY;
          ui.title(`Position ${index + 1}`);
          ui.cheat('Save:', saved ? `${m}: ${mapName(m)}` : 'NULL', () =>
            savePosition(index),
          );
          ui.cheat('Recall:', saved ? `(${x}, ${y})` : 'NULL', () =>
            recallPosition(index),
          );
        });
      },
    },
  ],
});
