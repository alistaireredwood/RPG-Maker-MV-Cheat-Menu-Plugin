import { defineInventoryFeature } from '../../shared/inventoryFeature.ts';

export default defineInventoryFeature({
  id: 'weapons',
  menuName: 'Weapons',
  title: 'Weapon',
  searchKey: 'weapon',
  searchPlaceholder: 'Search weapons...',
  getData: () => $dataWeapons,
  v1SelectionKey: 'weaponSelection',
});
