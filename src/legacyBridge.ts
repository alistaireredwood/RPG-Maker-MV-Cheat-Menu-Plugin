// Exposes core widgets and shared controls on the legacy CheatMenu singleton,
// so feature files that still call `CheatMenu.appendX(...)` keep working.
// Remove together with CheatMenu.ts once every feature is migrated.
import CheatMenu from './CheatMenu.ts';
import { updateMenu } from './core/ui/render.ts';
import { widgetState } from './core/ui/widgetState.ts';
import { appendCheat } from './core/ui/widgets/cheat.ts';
import { appendCheatTitle } from './core/ui/widgets/cheatTitle.ts';
import { appendCodeInput } from './core/ui/widgets/codeInput.ts';
import { appendScrollSelector } from './core/ui/widgets/scrollSelector.ts';
import { appendSearchInput } from './core/ui/widgets/searchInput.ts';
import {
  appendDescription,
  appendTitle,
  appendWideDescription,
} from './core/ui/widgets/text.ts';
import { appendValueInput } from './core/ui/widgets/valueInput.ts';
import {
  appendActorSelection,
  scrollActor,
} from './shared/controls/actorSelector.ts';
import {
  appendAmountSelection,
  scrollAmount,
} from './shared/controls/amountSelector.ts';

Object.assign(CheatMenu, {
  updateMenu,
  searchKeywords: widgetState.searchKeywords,

  appendTitle,
  appendDescription,
  appendWideDescription,
  appendCheat,
  appendScrollSelector,
  appendValueInput,
  appendCodeInput,
  appendSearchInput,
  appendCheatTitle,

  scrollActor,
  appendActorSelection,
  scrollAmount,
  appendAmountSelection,
});
