import { API_VERSION } from '@src/api.ts';
import { createApi } from '@src/createApi.ts';
import { bootstrap } from '@src/core/bootstrap.ts';
import { features, V1_MENU_ORDER } from '@src/features.ts';
import { addDictionary } from '@src/shared/game/dictionarySources.ts';

bootstrap(features, {
  v1MenuOrder: V1_MENU_ORDER,
  extensions: {
    api: createApi(),
    apiVersion: API_VERSION,
    onNames: (name, names) =>
      addDictionary('extension', `extension "${name}"`, names),
  },
});
