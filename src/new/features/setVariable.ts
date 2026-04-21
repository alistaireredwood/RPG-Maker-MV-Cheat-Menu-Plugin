import CheatMenu from '../CheatMenu.ts';

CheatMenu.setVariable = (variableId, value) => {
  if ($dataSystem.variables[variableId] != undefined) {
    let newValue = $gameVariables.value(variableId) + value;

    $gameVariables.setValue(variableId, newValue);
  }
};

CheatMenu.scrollVariable = function (direction) {
  if (direction == 'left') {
    CheatMenu.variableSelection--;
    if (CheatMenu.variableSelection < 0) {
      CheatMenu.variableSelection = $dataSystem.variables.length - 1;
    }
  } else {
    CheatMenu.variableSelection++;
    if (CheatMenu.variableSelection >= $dataSystem.variables.length) {
      CheatMenu.variableSelection = 0;
    }
  }
  SoundManager.playSystemSound(0);
  CheatMenu.updateMenu();
};

CheatMenu.applyCurrentVariable = function (direction) {
  let amount = CheatMenu.amounts[CheatMenu.amountIndex];

  if (direction == 'left') {
    amount = -amount;
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }

  CheatMenu.setVariable(CheatMenu.variableSelection, amount);
  CheatMenu.updateMenu();
};

CheatMenu.appendVariableSelection = function (key1, key2, key3, key4) {
  CheatMenu.appendTitle('Variable');

  let currentVariable;

  if (
    $dataSystem.variables[CheatMenu.variableSelection] &&
    $dataSystem.variables[CheatMenu.variableSelection].length > 0
  ) {
    currentVariable = $dataSystem.variables[CheatMenu.variableSelection];
  } else {
    currentVariable = 'NULL';
  }

  CheatMenu.appendScrollSelector(
    currentVariable,
    key1,
    key2,
    CheatMenu.scrollVariable,
  );

  let currentVariableValue;
  if ($gameVariables.value(CheatMenu.variableSelection) != undefined) {
    currentVariableValue = $gameVariables.value(CheatMenu.variableSelection);
  } else {
    currentVariableValue = 'NULL';
  }

  CheatMenu.appendScrollSelector(
    currentVariableValue,
    key3,
    key4,
    CheatMenu.applyCurrentVariable,
  );
};

export const menu = {
  name: 'Variables',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendAmountSelection(4, 5);
    CheatMenu.appendVariableSelection(6, 7, 8, 9);
  },
};
