import CheatMenu from '../CheatMenu.ts';

CheatMenu.giveArmor = (armorId, amount) => {
  if ($dataArmors[armorId] != undefined) {
    $gameParty.gainItem($dataArmors[armorId], amount, false);
  }
};

CheatMenu.scrollArmor = function (direction) {
  const step = direction === 'left' ? -1 : 1;
  const len = $dataArmors.length;
  let idx = CheatMenu.armorSelection;
  for (let i = 0; i < len; i++) {
    idx += step;
    if (idx <= 0) idx = len - 1;
    else if (idx >= len) idx = 1;
    if ($dataArmors[idx]?.name) break;
  }
  CheatMenu.armorSelection = idx;
  SoundManager.playSystemSound(0);
  CheatMenu.updateMenu();
};

CheatMenu.applyCurrentArmor = function (direction) {
  let amount = CheatMenu.amounts[CheatMenu.amountIndex];
  if (direction == 'left') {
    amount = -amount;
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }
  CheatMenu.giveArmor(CheatMenu.armorSelection, amount);
  CheatMenu.updateMenu();
};

CheatMenu.appendArmorSelection = function (key1, key2, key3, key4) {
  CheatMenu.appendTitle('Armor');

  const armorData = $dataArmors[CheatMenu.armorSelection];

  let currentArmorName = '';
  if (armorData && armorData.name) {
    currentArmorName = armorData.name;
  }

  CheatMenu.appendScrollSelector(
    currentArmorName,
    key1,
    key2,
    CheatMenu.scrollArmor,
  );

  let currentArmorAmount: number = 0;
  if (armorData) {
    currentArmorAmount = $gameParty.numItems(armorData);
  }

  CheatMenu.appendScrollSelector(
    currentArmorAmount,
    key3,
    key4,
    CheatMenu.applyCurrentArmor,
  );
};

export const menu = {
  name: 'Armors',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendAmountSelection(4, 5);
    CheatMenu.appendArmorSelection(6, 7, 8, 9);
  },
};
