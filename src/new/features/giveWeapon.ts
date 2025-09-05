import CheatMenu from '../CheatMenu.ts';

// increase weapon count for party of item, by id
CheatMenu.give_weapon = (weapon_id, amount) => {
  if ($dataWeapons[weapon_id] != undefined) {
    $gameParty.gainItem($dataWeapons[weapon_id], amount, false);
  }
};

// Left and right scrolls for handling switching between weapon selected
CheatMenu.scroll_weapon = function (direction) {
  if (direction == 'left') {
    CheatMenu.weapon_selection--;
    if (CheatMenu.weapon_selection < 0) {
      CheatMenu.weapon_selection = $dataWeapons.length - 1;
    }
  } else {
    CheatMenu.weapon_selection++;
    if (CheatMenu.weapon_selection >= $dataWeapons.length) {
      CheatMenu.weapon_selection = 0;
    }
  }
  SoundManager.playSystemSound(0);

  CheatMenu.update_menu();
};

// handlers for the weapon cheat
CheatMenu.apply_current_weapon = function (direction) {
  let amount = CheatMenu.amounts[CheatMenu.amount_index];

  if (direction == 'left') {
    amount = -amount;
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }

  CheatMenu.give_weapon(CheatMenu.weapon_selection, amount);
  CheatMenu.update_menu();
};

// append the weapon cheat to the menu
CheatMenu.append_weapon_selection = function (key1, key2, key3, key4) {
  CheatMenu.append_title('Weapon');

  const weaponData = $dataWeapons[CheatMenu.weapon_selection];

  let current_weapon_name = '';
  if (weaponData && weaponData.name) {
    current_weapon_name = weaponData.name;
  }

  CheatMenu.append_scroll_selector(
    current_weapon_name,
    key1,
    key2,
    CheatMenu.scroll_weapon,
  );

  let current_weapon_amount = 0;
  if (weaponData) {
    current_weapon_amount = $gameParty.numItems(weaponData);
  }

  CheatMenu.append_scroll_selector(
    current_weapon_amount,
    key3,
    key4,
    CheatMenu.apply_current_weapon,
  );
};

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Weapons');
  CheatMenu.append_amount_selection(4, 5);
  CheatMenu.append_weapon_selection(6, 7, 8, 9);
});
