import CheatMenu from '../CheatMenu.ts';

CheatMenu.giveWeapon = (weaponId, amount) => {
  if ($dataWeapons[weaponId] != undefined) {
    $gameParty.gainItem($dataWeapons[weaponId], amount, false);
  }
};

CheatMenu.scrollWeapon = function (direction) {
  if (direction == 'left') {
    CheatMenu.weaponSelection--;
    if (CheatMenu.weaponSelection < 0) {
      CheatMenu.weaponSelection = $dataWeapons.length - 1;
    }
  } else {
    CheatMenu.weaponSelection++;
    if (CheatMenu.weaponSelection >= $dataWeapons.length) {
      CheatMenu.weaponSelection = 0;
    }
  }
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

CheatMenu.menus.splice(0, 0, {
  name: 'Weapons',
  render: () => {
    CheatMenu.appendCheatTitle('Weapons');
    CheatMenu.appendAmountSelection(4, 5);
    CheatMenu.appendWeaponSelection(6, 7, 8, 9);
  },
});
