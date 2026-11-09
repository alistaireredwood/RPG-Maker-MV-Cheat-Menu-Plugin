import CheatMenu from '../CheatMenu.ts';
import {
  makeScroll,
  makeApplyAmount,
  getIndexInfo,
} from '../shared/scrollable.ts';

CheatMenu.setVariable = (variableId, value) => {
  if ($dataSystem.variables[variableId] != undefined) {
    const newValue = $gameVariables.value(variableId) + value;
    $gameVariables.setValue(variableId, newValue);
  }
};

// typed text → number if it looks like one, otherwise stored as a string
// (some games/plugins keep text in variables). Empty input resets to 0, the
// engine's default for an unset variable.
const NUMBER_RE = /^[+-]?(\d+\.?\d*|\.\d+)$/;

CheatMenu.setVariableValue = (variableId, text) => {
  if ($dataSystem.variables[variableId] == undefined) return;
  const trimmed = text.trim();
  let value: number | string;
  if (trimmed === '') {
    value = 0;
  } else if (NUMBER_RE.test(trimmed)) {
    value = Number(trimmed);
  } else {
    value = text;
  }
  $gameVariables.setValue(variableId, value as number);
  SoundManager.playSystemSound(1);
};

const variableMatches = (item: any, keyword: string) =>
  typeof item === 'string' &&
  item !== '' &&
  item.toLowerCase().includes(keyword);

CheatMenu.scrollVariable = makeScroll({
  stateKey: 'variable',
  getData: () => $dataSystem.variables,
  getIdx: () => CheatMenu.variableSelection,
  setIdx: (idx) => {
    CheatMenu.variableSelection = idx;
  },
  matches: variableMatches,
  startIdx: 0,
});

CheatMenu.applyCurrentVariable = makeApplyAmount((amount) =>
  CheatMenu.setVariable(CheatMenu.variableSelection, amount),
);

CheatMenu.appendVariableSelection = function (key1, key2, key3, key4) {
  CheatMenu.appendSearchInput('Search variables...', 'variable', (keyword) => {
    const idx = $dataSystem.variables.findIndex(
      (v, i) => i > 0 && !!v && v.toLowerCase().includes(keyword),
    );
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

  CheatMenu.appendScrollSelector(
    currentVariable,
    key1,
    key2,
    CheatMenu.scrollVariable,
    true,
  );

  const variableId = CheatMenu.variableSelection;
  const rawValue: unknown = $gameVariables.value(variableId);
  const isNumeric = typeof rawValue === 'number';
  const exists = $dataSystem.variables[variableId] != undefined;

  if (exists && (isNumeric || typeof rawValue === 'string')) {
    // type a number or text and press Enter; ←/→ still add/subtract Amount
    // for numbers (hidden for strings — "abc" + 10 would corrupt the value)
    CheatMenu.appendValueInput(
      String(rawValue),
      `variable:${variableId}`,
      (text) => CheatMenu.setVariableValue(variableId, text),
      key3,
      key4,
      CheatMenu.applyCurrentVariable,
      isNumeric,
    );
    return;
  }

  // arrays/objects (or a missing variable) stay read-only
  const currentVariableValue =
    rawValue != undefined
      ? `<span class="error-text">[${Array.isArray(rawValue) ? 'Array' : 'Object'}]</span>`
      : 'NULL';

  CheatMenu.appendScrollSelector(
    currentVariableValue,
    key3,
    key4,
    CheatMenu.applyCurrentVariable,
    false,
    false,
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
