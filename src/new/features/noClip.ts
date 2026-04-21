import CheatMenu from '../CheatMenu.ts';

CheatMenu.toggleNoClipStatus = function () {
  $gamePlayer.setThrough(!$gamePlayer.isThrough());

  CheatMenu.updateMenu();
  if ($gamePlayer.isThrough()) {
    SoundManager.playSystemSound(1);
  } else {
    SoundManager.playSystemSound(2);
  }
};

CheatMenu.appendNoClipStatus = function (key1) {
  let statusHtml;

  if ($gamePlayer.isThrough()) {
    statusHtml = '<span class="status-on">on</span>';
  } else {
    statusHtml = '<span class="status-off">off</span>';
  }

  CheatMenu.appendCheat(
    'Status:',
    statusHtml,
    key1,
    CheatMenu.toggleNoClipStatus,
  );
};

CheatMenu.menus.splice(0, 0, {
  name: 'No Clip',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendNoClipStatus(4);
  },
});
