import CheatMenu from '../CheatMenu.ts';

CheatMenu.giveItem = (itemId, amount) => {
  if ($dataItems[itemId] != undefined) {
    $gameParty.gainItem($dataItems[itemId], amount, false);
  }
};

CheatMenu.scrollItem = function (direction) {
  const step = direction === 'left' ? -1 : 1;
  const len = $dataItems.length;
  let idx = CheatMenu.itemSelection;
  for (let i = 0; i < len; i++) {
    idx += step;
    if (idx <= 0) idx = len - 1;
    else if (idx >= len) idx = 1;
    if ($dataItems[idx]?.name) break;
  }
  CheatMenu.itemSelection = idx;
  SoundManager.playSystemSound(0);
  CheatMenu.updateMenu();
};

CheatMenu.applyCurrentItem = function (direction) {
  let amount = CheatMenu.amounts[CheatMenu.amountIndex];
  if (direction == 'left') {
    amount = -amount;
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }
  CheatMenu.giveItem(CheatMenu.itemSelection, amount);
  CheatMenu.updateMenu();
};

CheatMenu.appendItemSelection = function (key1, key2, key3, key4) {
  CheatMenu.appendTitle('Item');

  const itemData = $dataItems[CheatMenu.itemSelection];

  let currentItemName = '';
  if (itemData && itemData.name) {
    currentItemName = itemData.name;
  }

  CheatMenu.appendScrollSelector(
    currentItemName,
    key1,
    key2,
    CheatMenu.scrollItem,
  );

  let currentItemAmount = 0;
  if (itemData) {
    currentItemAmount = $gameParty.numItems(itemData);
  }

  CheatMenu.appendScrollSelector(
    currentItemAmount,
    key3,
    key4,
    CheatMenu.applyCurrentItem,
  );
};

CheatMenu.menus.push({
  name: 'Items',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendAmountSelection(4, 5);
    CheatMenu.appendItemSelection(6, 7, 8, 9);
  },
});
