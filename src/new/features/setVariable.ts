import CheatMenu from '../CheatMenu.ts';

CheatMenu.setVariable = (variableId, value) => {
  if ($dataSystem.variables[variableId] != undefined) {
    let newValue = $gameVariables.value(variableId) + value;

    $gameVariables.setValue(variableId, newValue);
  }
};

CheatMenu.scrollVariable = function (direction) {
  const keyword = (CheatMenu.searchKeywords?.['variable'] || '').toLowerCase();
  const step = direction === 'left' ? -1 : 1;
  const vars = $dataSystem.variables;
  const len = vars.length;
  let idx = CheatMenu.variableSelection;
  for (let i = 0; i < len; i++) {
    idx += step;
    if (idx < 0) idx = len - 1;
    else if (idx >= len) idx = 0;
    const name = vars[idx];
    if (name && name.toLowerCase().includes(keyword)) break;
  }
  CheatMenu.variableSelection = idx;
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
  CheatMenu.appendSearchInput('Search variables...', 'variable', (keyword) => {
    const idx = $dataSystem.variables.findIndex((v, i) => i > 0 && v?.toLowerCase().includes(keyword));
    if (idx > 0) CheatMenu.variableSelection = idx;
  });
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
