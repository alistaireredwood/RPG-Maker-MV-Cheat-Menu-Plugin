import CheatMenu from '../CheatMenu.ts';

CheatMenu.giveWeapon = (weaponId, amount) => {
  if ($dataWeapons[weaponId] != undefined) {
    $gameParty.gainItem($dataWeapons[weaponId], amount, false);
  }
};

CheatMenu.scrollWeapon = function (direction) {
  const step = direction === 'left' ? -1 : 1;
  const len = $dataWeapons.length;
  let idx = CheatMenu.weaponSelection;
  for (let i = 0; i < len; i++) {
    idx += step;
    if (idx <= 0) idx = len - 1;
    else if (idx >= len) idx = 1;
    if ($dataWeapons[idx]?.name) break;
  }
  CheatMenu.weaponSelection = idx;
  SoundManager.playSystemSound(0);
  CheatMenu.updateMenu();
};

CheatMenu.applyCurrentWeapon = function (direction) {
  let amount = CheatMenu.amounts[CheatMenu.amountIndex];

  if (direction == 'left') {
    amount = -amount;
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }

  CheatMenu.giveWeapon(CheatMenu.weaponSelection, amount);
  CheatMenu.updateMenu();
};

CheatMenu.appendWeaponSelection = function (key1, key2, key3, key4) {
  CheatMenu.appendTitle('Weapon');

  const weaponData = $dataWeapons[CheatMenu.weaponSelection];

  let currentWeaponName = '';
  if (weaponData && weaponData.name) {
    currentWeaponName = weaponData.name;
  }

  CheatMenu.appendScrollSelector(
    currentWeaponName,
    key1,
    key2,
    CheatMenu.scrollWeapon,
  );

  let currentWeaponAmount = 0;
  if (weaponData) {
    currentWeaponAmount = $gameParty.numItems(weaponData);
  }

  CheatMenu.appendScrollSelector(
    currentWeaponAmount,
    key3,
    key4,
    CheatMenu.applyCurrentWeapon,
  );
};

export const menu = {
  name: 'Weapons',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendAmountSelection(4, 5);
    CheatMenu.appendWeaponSelection(6, 7, 8, 9);
  },
};
