import CheatMenu from '../CheatMenu.ts';

// handler for the toggle no clip cheat
CheatMenu.toggle_no_clip_status = function () {
  $gamePlayer.setThrough(!$gamePlayer.isThrough());

  CheatMenu.update_menu();
  if ($gamePlayer.isThrough()) {
    SoundManager.playSystemSound(1);
  } else {
    SoundManager.playSystemSound(2);
  }
};

// append the no clip cheat
CheatMenu.append_no_clip_status = function (key1) {
  let status_html;

  if ($gamePlayer.isThrough()) {
    status_html = '<span class="status-on">on</span>';
  } else {
    status_html = '<span class="status-off">off</span>';
  }

  CheatMenu.append_cheat(
    'Status:',
    status_html,
    key1,
    CheatMenu.toggle_no_clip_status,
  );
};

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('No Clip');

  CheatMenu.append_no_clip_status(4);
});
