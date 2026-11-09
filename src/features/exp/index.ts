import { defineFeature } from '../../core/feature.ts';
import { actorSelector } from '../../shared/controls/actorSelector.ts';
import {
  amountSelector,
  makeApplyAmount,
} from '../../shared/controls/amountSelector.ts';
import { getSelectedActor } from '../../shared/state.ts';

const giveExp = makeApplyAmount((amount) =>
  getSelectedActor()?.gainExp(amount),
);

export default defineFeature({
  id: 'exp',
  menus: [
    {
      id: 'exp',
      name: 'Give Exp',
      render(ui) {
        ui.cheatTitle();
        const actor = actorSelector(ui);
        amountSelector(ui);
        ui.title('EXP');
        ui.scrollSelector(actor?.currentExp() ?? 0, giveExp);
      },
    },
  ],
});
