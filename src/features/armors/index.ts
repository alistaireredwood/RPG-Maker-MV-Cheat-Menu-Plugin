import { defineInventoryFeature } from '@src/shared/inventoryFeature.ts';

export default defineInventoryFeature({
  id: 'armors',
  menuName: 'Armors',
  title: 'Armor',
  searchKey: 'armor',
  searchPlaceholder: 'Search armors...',
  getData: () => $dataArmors,
  v1SelectionKey: 'armorSelection',
});
