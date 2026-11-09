import { defineInventoryFeature } from '@src/shared/inventoryFeature.ts';

export default defineInventoryFeature({
  id: 'items',
  menuName: 'Items',
  title: 'Item',
  searchKey: 'item',
  searchPlaceholder: 'Search items...',
  getData: () => $dataItems,
  v1SelectionKey: 'itemSelection',
});
