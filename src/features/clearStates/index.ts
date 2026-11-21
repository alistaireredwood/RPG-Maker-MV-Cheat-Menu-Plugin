import { defineFeature } from '@src/core/feature.ts';
import { updateMenu } from '@src/core/ui/render.ts';
import { getSearchKeyword } from '@src/core/ui/widgetState.ts';
import { actorSelector } from '@src/shared/controls/actorSelector.ts';
import {
  getIndexInfo,
  makeScroll,
  nameMatches,
  type IdMatcher,
} from '@src/shared/controls/listSelector.ts';
import { onOffLabel, playToggleSound } from '@src/shared/controls/status.ts';
import { escapeHtml } from '@src/shared/html.ts';
import { getSelectedActor } from '@src/shared/state.ts';
import { summarizeNames } from './states.ts';

const SEARCH_KEY = 'state';

const state = {
  selection: 1,
  activeOnly: false,
};

const stateMatches: IdMatcher<DataState> = (item, keyword, id) => {
  if (!nameMatches(item, keyword)) return false;
  if (!state.activeOnly) return true;
  return !!getSelectedActor()?.isStateAffected(id);
};

const scroll = makeScroll({
  stateKey: SEARCH_KEY,
  getData: () => $dataStates,
  getIdx: () => state.selection,
  setIdx: (idx) => {
    state.selection = idx;
  },
  matches: stateMatches,
});

function jumpToFirstMatch(keyword: string): void {
  const idx = $dataStates.findIndex(
    (item, id) => id >= 1 && !!item && stateMatches(item, keyword, id),
  );
  if (idx > 0) state.selection = idx;
}

function clearStates(actor: Game_Actor): void {
  if ((actor.states()?.length ?? 0) > 0) actor.clearStates();
}

function clearPartyStates(): void {
  $gameParty.allMembers().forEach(clearStates);
  SoundManager.playSystemSound(1);
}

function clearSelectedActorStates(): void {
  const actor = getSelectedActor();
  if (actor) clearStates(actor);
  SoundManager.playSystemSound(1);
  updateMenu();
}

// addState() skips states the actor resists or a dead actor; a cheat
// should apply them anyway
function forceAddState(actor: Game_Actor, id: number): void {
  if (!actor.isStateAffected(id)) actor.addNewState(id);
  actor.resetStateCounts(id);
  actor.refresh();
}

function toggleSelectedState(): void {
  const actor = getSelectedActor();
  const id = state.selection;
  if (!actor || !$dataStates[id]) return;
  if (actor.isStateAffected(id)) actor.removeState(id);
  else forceAddState(actor, id);
  playToggleSound(actor.isStateAffected(id));
  updateMenu();
}

function toggleActiveOnly(): void {
  state.activeOnly = !state.activeOnly;
  jumpToFirstMatch(getSearchKeyword(SEARCH_KEY));
  playToggleSound(state.activeOnly);
  updateMenu();
}

const activeStateNames = (actor: Game_Actor): string[] =>
  $dataStates
    .filter((item) => !!item?.name && actor.isStateAffected(item.id))
    .map((item) => item.name);

export default defineFeature({
  id: 'clearStates',
  state,
  menus: [
    {
      id: 'clearStates',
      name: 'States',
      render(ui) {
        ui.cheatTitle();
        ui.cheat('Clear Party States', 'Activate', clearPartyStates);
        const actor = actorSelector(ui);

        ui.title('Current State');
        ui.cheat('Number Effects:', 'Clear', clearSelectedActorStates, {
          value: actor?.states()?.length ?? 0,
        });
        const summary = actor ? summarizeNames(activeStateNames(actor)) : '';
        if (summary) ui.description(escapeHtml(summary));

        const id = state.selection;
        const item = $dataStates[id];
        const { index, total } = getIndexInfo(
          $dataStates,
          id,
          stateMatches,
          getSearchKeyword(SEARCH_KEY),
        );

        ui.searchInput('Search states...', SEARCH_KEY, jumpToFirstMatch);
        ui.title('State', `${index}/${total}`);
        ui.cheat(
          'Show:',
          state.activeOnly ? 'Active' : 'All',
          toggleActiveOnly,
        );
        ui.scrollSelector(item?.name ? escapeHtml(item.name) : 'NULL', scroll, {
          selectable: true,
        });
        ui.cheat(
          'Status:',
          actor && item ? onOffLabel(actor.isStateAffected(id)) : 'NULL',
          toggleSelectedState,
        );
      },
    },
  ],
});
