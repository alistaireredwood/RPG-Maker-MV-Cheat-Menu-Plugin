import CheatMenu from '../CheatMenu.ts';

CheatMenu.savePosition = function (posNum) {
  CheatMenu.savedPositions[posNum].m = $gameMap.mapId();
  CheatMenu.savedPositions[posNum].x = $gamePlayer.x;
  CheatMenu.savedPositions[posNum].y = $gamePlayer.y;

  SoundManager.playSystemSound(1);
  CheatMenu.updateMenu();
};

CheatMenu.recallPosition = function (posNum) {
  if (CheatMenu.savedPositions[posNum].m != -1) {
    CheatMenu.teleport(
      CheatMenu.savedPositions[posNum].m,
      CheatMenu.savedPositions[posNum].x,
      CheatMenu.savedPositions[posNum].y,
    );
    SoundManager.playSystemSound(1);
  } else {
    SoundManager.playSystemSound(2);
  }
  CheatMenu.updateMenu();
};

CheatMenu.appendSaveRecall = function (...keys: (string | number)[]) {
  CheatMenu.appendTitle('Current Position: ');

  if ($dataMapInfos[$gameMap.mapId()]?.name) {
    let currentMap = `${$gameMap.mapId()}: ${$dataMapInfos[$gameMap.mapId()].name}`;
    CheatMenu.appendDescription(currentMap);

    let mapPos = `(${$gamePlayer.x}, ${$gamePlayer.y})`;
    CheatMenu.appendDescription(mapPos);
  } else {
    CheatMenu.appendDescription('NULL');
  }

  let keyIndex = 0;
  for (let i = 0; i < CheatMenu.savedPositions.length; i++) {
    CheatMenu.appendTitle(`Position ${i + 1}`);

    let mapText: string;
    let posText: string;
    const savedPos = CheatMenu.savedPositions[i];

    if (savedPos.m !== -1) {
      mapText = `${savedPos.m}: ${$dataMapInfos[savedPos.m]?.name || 'NULL'}`;
      posText = `(${savedPos.x}, ${savedPos.y})`;
    } else {
      mapText = 'NULL';
      posText = 'NULL';
    }

    CheatMenu.appendCheat(
      'Save:',
      mapText,
      keys[keyIndex],
      CheatMenu.savePosition.bind(null, i),
    );
    keyIndex++;

    CheatMenu.appendCheat(
      'Recall:',
      posText,
      keys[keyIndex],
      CheatMenu.recallPosition.bind(null, i),
    );
    keyIndex++;
  }
};

export const menu = {
  name: 'Save and Recall',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendSaveRecall(4, 5, 6, 7, 8, 9);
  },
};
