// A Cheat Menu extension: plain script, loaded by RPG Maker from plugins.js
// next to Cheat_Menu.js, in any order. Only types are imported — everything
// at runtime comes through `api`.
import type { CheatMenuApi, CheatMenuExtension } from 'cheat-menu';

const VARIABLE_ID = 1;

function alwaysDash(api: CheatMenuApi) {
  // persisted in the save: declare every field with its default, fields
  // missing here are not saved
  const state = { on: false };

  return api.defineFeature({
    id: 'ext.example.alwaysDash',
    state,
    // engine patches only from a hook, never at import time
    onInit() {
      api.patchMethod(
        Game_Player.prototype,
        'isDashButtonPressed',
        (original) =>
          function (this: Game_Player) {
            return state.on || original.call(this);
          },
      );
    },
    menus: [
      {
        id: 'ext.example.alwaysDash',
        name: 'Always Dash',
        render(ui) {
          ui.cheatTitle();
          ui.title('Always Dash');
          ui.cheat('Status', api.controls.onOffLabel(state.on), () => {
            state.on = !state.on;
            api.controls.playToggleSound(state.on);
            api.updateMenu();
          });
        },
      },
    ],
  });
}

function storyVariable(api: CheatMenuApi) {
  const get = () => $gameVariables.value(VARIABLE_ID);
  const add = (delta: number) =>
    $gameVariables.setValue(VARIABLE_ID, get() + delta);

  return api.defineFeature({
    id: 'ext.example.storyVariable',
    // next to the built-in Variables menu instead of the end of the grid
    after: 'variables',
    menus: [
      {
        id: 'ext.example.storyVariable',
        name: `Variable #${VARIABLE_ID}`,
        render(ui) {
          ui.cheatTitle();
          api.controls.amountSelector(ui);
          ui.title(
            $dataSystem.variables[VARIABLE_ID] || `Variable #${VARIABLE_ID}`,
          );
          ui.valueInput(
            String(get()),
            'ext.example.storyVariable',
            api.game.makeSetExact(get, add),
            api.controls.makeApplyAmount(add),
          );
        },
      },
    ],
  });
}

const extension: CheatMenuExtension = {
  name: 'example',
  apiVersion: 1,
  setup: (api) => [alwaysDash(api), storyVariable(api)],
  // Labels in the Variables / Switches menus — for ids a game left unnamed
  // (byId) or names to translate (byName). An extension may bring only
  // these, without setup; Cheat_Menu.dictionary.json overrides them.
  names: {
    variables: { byId: { [VARIABLE_ID]: 'Story progress' } },
    switches: { byName: { ボス撃破: 'Boss defeated' } },
  },
};

(window.CheatMenuExtensions = window.CheatMenuExtensions || []).push(extension);
