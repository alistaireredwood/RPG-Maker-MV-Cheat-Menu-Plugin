import CheatMenu from '../CheatMenu.ts';

// increase armor count for party of item, by id
CheatMenu.give_armor = (armor_id, amount) => {
  if ($dataArmors[armor_id] != undefined) {
    $gameParty.gainItem($dataArmors[armor_id], amount, false);
  }
};

// Left and right scrolls for handling switching between armor selected
CheatMenu.scroll_armor = function (direction) {
  if (direction == 'left') {
    CheatMenu.armor_selection--;
    if (CheatMenu.armor_selection < 0) {
      CheatMenu.armor_selection = $dataArmors.length - 1;
    }
  } else {
    CheatMenu.armor_selection++;
    if (CheatMenu.armor_selection >= $dataArmors.length) {
      CheatMenu.armor_selection = 0;
    }
  }
  SoundManager.playSystemSound(0);

  CheatMenu.update_menu();
};

// handler for the armor cheat
CheatMenu.apply_current_armor = function (direction) {
  let amount = CheatMenu.amounts[CheatMenu.amount_index];
  if (direction == 'left') {
    amount = -amount;
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }
  CheatMenu.give_armor(CheatMenu.armor_selection, amount);
  CheatMenu.update_menu();
};

// append the armor cheat to the menu
CheatMenu.append_armor_selection = function (key1, key2, key3, key4) {
  CheatMenu.append_title('Armor');

  const armorData = $dataArmors[CheatMenu.armor_selection]; // Get from $dataArmors

  let current_armor_name = '';
  if (armorData && armorData.name) {
    current_armor_name = armorData.name;
  }

  CheatMenu.append_scroll_selector(
    current_armor_name,
    key1,
    key2,
    CheatMenu.scroll_armor,
  );

  let current_armor_amount: number = 0;
  if (armorData) {
    current_armor_amount = $gameParty.numItems(armorData);
  }

  CheatMenu.append_scroll_selector(
    current_armor_amount,
    key3,
    key4,
    CheatMenu.apply_current_armor,
  );
};

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Armors');
  CheatMenu.append_amount_selection(4, 5);
  CheatMenu.append_armor_selection(6, 7, 8, 9);
});
