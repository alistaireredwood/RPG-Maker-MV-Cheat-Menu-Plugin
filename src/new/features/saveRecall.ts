import CheatMenu from '../CheatMenu.ts';

// handler for saving positions
CheatMenu.save_position = function (pos_num) {
  CheatMenu.saved_positions[pos_num].m = $gameMap.mapId();
  CheatMenu.saved_positions[pos_num].x = $gamePlayer.x;
  CheatMenu.saved_positions[pos_num].y = $gamePlayer.y;

  SoundManager.playSystemSound(1);
  CheatMenu.update_menu();
};

// handler for loading/recalling positions
CheatMenu.recall_position = function (pos_num) {
  if (CheatMenu.saved_positions[pos_num].m != -1) {
    CheatMenu.teleport(
      CheatMenu.saved_positions[pos_num].m,
      CheatMenu.saved_positions[pos_num].x,
      CheatMenu.saved_positions[pos_num].y,
    );
    SoundManager.playSystemSound(1);
  } else {
    SoundManager.playSystemSound(2);
  }
  CheatMenu.update_menu();
};

// append the save/recall cheat to the menu
CheatMenu.append_save_recall = function (...keys: (string | number)[]) {
  CheatMenu.append_title('Current Position: ');

  if ($dataMapInfos[$gameMap.mapId()]?.name) {
    // Optional chaining is cleaner
    let current_map = `${$gameMap.mapId()}: ${$dataMapInfos[$gameMap.mapId()].name}`;
    CheatMenu.append_description(current_map);

    let map_pos = `(${$gamePlayer.x}, ${$gamePlayer.y})`;
    CheatMenu.append_description(map_pos);
  } else {
    CheatMenu.append_description('NULL');
  }

  let keyIndex = 0;
  for (let i = 0; i < CheatMenu.saved_positions.length; i++) {
    CheatMenu.append_title(`Position ${i + 1}`);

    let map_text: string;
    let pos_text: string;
    const savedPos = CheatMenu.saved_positions[i];

    if (savedPos.m !== -1) {
      map_text = `${savedPos.m}: ${$dataMapInfos[savedPos.m]?.name || 'NULL'}`;
      pos_text = `(${savedPos.x}, ${savedPos.y})`;
    } else {
      map_text = 'NULL';
      pos_text = 'NULL';
    }

    CheatMenu.append_cheat(
      'Save:',
      map_text,
      keys[keyIndex],
      CheatMenu.save_position.bind(null, i),
    );
    keyIndex++;

    CheatMenu.append_cheat(
      'Recall:',
      pos_text,
      keys[keyIndex],
      CheatMenu.recall_position.bind(null, i),
    );
    keyIndex++;
  }
};

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Save and Recall');
  CheatMenu.append_save_recall(4, 5, 6, 7, 8, 9);
});
