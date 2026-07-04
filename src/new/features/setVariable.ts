import CheatMenu from '../CheatMenu.ts';
import { makeScroll, makeApplyAmount } from '../core/scrollable.ts';

CheatMenu.setVariable = (variableId, value) => {
  if ($dataSystem.variables[variableId] != undefined) {
    let newValue = $gameVariables.value(variableId) + value;
    $gameVariables.setValue(variableId, newValue);
  }
};

CheatMenu.scrollVariable = makeScroll({
  stateKey: 'variable',
  getData: () => $dataSystem.variables,
  getIdx: () => CheatMenu.variableSelection,
  setIdx: (idx) => { CheatMenu.variableSelection = idx; },
  matches: (item: any, keyword) =>
    typeof item === 'string' && item !== '' && item.toLowerCase().includes(keyword),
  startIdx: 0,
});

CheatMenu.applyCurrentVariable = makeApplyAmount((amount) =>
  CheatMenu.setVariable(CheatMenu.variableSelection, amount),
);

CheatMenu.appendVariableSelection = function (key1, key2, key3, key4) {
  CheatMenu.appendSearchInput('Search variables...', 'variable', (keyword) => {
    const idx = $dataSystem.variables.findIndex((v, i) => i > 0 && !!v && v.toLowerCase().includes(keyword));
    if (idx > 0) CheatMenu.variableSelection = idx;
  });
  CheatMenu.appendTitle('Variable');

  const currentVariable =
    $dataSystem.variables[CheatMenu.variableSelection]?.length > 0
      ? $dataSystem.variables[CheatMenu.variableSelection]
      : 'NULL';

  CheatMenu.appendScrollSelector(currentVariable, key1, key2, CheatMenu.scrollVariable);

  const currentVariableValue =
    $gameVariables.value(CheatMenu.variableSelection) != undefined
      ? $gameVariables.value(CheatMenu.variableSelection)
      : 'NULL';

  CheatMenu.appendScrollSelector(currentVariableValue, key3, key4, CheatMenu.applyCurrentVariable);
};

export const menu = {
  name: 'Variables',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendAmountSelection(4, 5);
    CheatMenu.appendVariableSelection(6, 7, 8, 9);
  },
};
