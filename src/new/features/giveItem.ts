import CheatMenu from '../CheatMenu.ts';

// increase item count for party of item, by id
CheatMenu.give_item = (item_id, amount) => {
  if ($dataItems[item_id] != undefined) {
    $gameParty.gainItem($dataItems[item_id], amount, false);
  }
};

// Left and right scrolls for handling switching between items selected
CheatMenu.scroll_item = function (direction) {
  if (direction == 'left') {
    CheatMenu.item_selection--;
    if (CheatMenu.item_selection < 0) {
      CheatMenu.item_selection = $dataItems.length - 1;
    }
  } else {
    CheatMenu.item_selection++;
    if (CheatMenu.item_selection >= $dataItems.length) {
      CheatMenu.item_selection = 0;
    }
  }
  SoundManager.playSystemSound(0);
  CheatMenu.update_menu();
};

// handlers for the item cheat
CheatMenu.apply_current_item = function (direction) {
  let amount = CheatMenu.amounts[CheatMenu.amount_index];
  if (direction == 'left') {
    amount = -amount;
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }
  CheatMenu.give_item(CheatMenu.item_selection, amount);
  CheatMenu.update_menu();
};

// append the item cheat to the menu
CheatMenu.append_item_selection = function (key1, key2, key3, key4) {
  CheatMenu.append_title('Item');

  const itemData = $dataItems[CheatMenu.item_selection];

  let current_item_name = '';
  if (itemData && itemData.name) {
    current_item_name = itemData.name;
  }

  CheatMenu.append_scroll_selector(
    current_item_name,
    key1,
    key2,
    CheatMenu.scroll_item,
  );

  let current_item_amount = 0;
  if (itemData) {
    current_item_amount = $gameParty.numItems(itemData);
  }

  CheatMenu.append_scroll_selector(
    current_item_amount,
    key3,
    key4,
    CheatMenu.apply_current_item,
  );
};

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Items');
  CheatMenu.append_amount_selection(4, 5);
  CheatMenu.append_item_selection(6, 7, 8, 9);
});
