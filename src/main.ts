import { bootstrap } from '@src/core/bootstrap.ts';
import { features, V1_MENU_ORDER } from '@src/features.ts';

bootstrap(features, { v1MenuOrder: V1_MENU_ORDER });
