import { defineFeature, type MenuEntry } from '../../core/feature.ts';
import { resourceCheats } from '../../shared/controls/resourceCheats.ts';
import { changeResource, type Resource } from '../../shared/game/resources.ts';

const partyMenu = (id: string, resource: Resource): MenuEntry => ({
  id,
  name: `Party ${resource}`,
  render(ui) {
    ui.cheatTitle();
    resourceCheats(ui, 'Party', resource, (change, aliveOnly) =>
      changeResource($gameParty.allMembers(), resource, change, aliveOnly),
    );
  },
});

export default defineFeature({
  id: 'partyRecovery',
  menus: [
    partyMenu('partyHp', 'HP'),
    partyMenu('partyMp', 'MP'),
    partyMenu('partyTp', 'TP'),
  ],
});
