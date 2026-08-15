import CheatMenu from '../CheatMenu.ts';
import { makeScroll, makeApplyAmount, getIndexInfo } from '../core/scrollable.ts';

CheatMenu.setVariable = (variableId, value) => {
  if ($dataSystem.variables[variableId] != undefined) {
    let newValue = $gameVariables.value(variableId) + value;
    $gameVariables.setValue(variableId, newValue);
  }
};

const variableMatches = (item: any, keyword: string) =>
  typeof item === 'string' && item !== '' && item.toLowerCase().includes(keyword);

CheatMenu.scrollVariable = makeScroll({
  stateKey: 'variable',
  getData: () => $dataSystem.variables,
  getIdx: () => CheatMenu.variableSelection,
  setIdx: (idx) => { CheatMenu.variableSelection = idx; },
  matches: variableMatches,
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
  const currentVariable =
    $dataSystem.variables[CheatMenu.variableSelection]?.length > 0
      ? $dataSystem.variables[CheatMenu.variableSelection]
      : 'NULL';

  const keyword = (CheatMenu.searchKeywords?.['variable'] || '').toLowerCase();
  const { index, total } = getIndexInfo(
    $dataSystem.variables,
    CheatMenu.variableSelection,
    variableMatches,
    keyword,
    0,
  );

  CheatMenu.appendTitle('Variable', `${index}/${total}`);

  CheatMenu.appendScrollSelector(currentVariable, key1, key2, CheatMenu.scrollVariable, true);

  const rawValue = $gameVariables.value(CheatMenu.variableSelection);
  const isNumeric = typeof rawValue === 'number';

  const currentVariableValue =
    rawValue != undefined
      ? isNumeric || typeof rawValue === 'string'
        ? rawValue
        : JSON.stringify(rawValue)
      : 'NULL';

  CheatMenu.appendScrollSelector(
    currentVariableValue,
    key3,
    key4,
    CheatMenu.applyCurrentVariable,
    false,
    isNumeric,
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
