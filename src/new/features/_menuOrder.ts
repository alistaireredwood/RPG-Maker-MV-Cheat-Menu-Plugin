import CheatMenu from '../CheatMenu.ts';
import { menu as teleport } from './teleport.ts';
import { menu as saveRecall } from './saveRecall.ts';
import { menu as noClip } from './noClip.ts';
import { menu as speed } from './speed.ts';
import { menu as toggleSwitch } from './toggleSwitch.ts';
import { menu as setVariable } from './setVariable.ts';
import { menu as godMode } from './godMode.ts';
import { menu as giveExp } from './giveExp.ts';
import { menus as partyRecovery } from './partyRecovery.ts';
import { menu as enemyRecovery } from './enemyRecovery.ts';
import { menu as giveGold } from './giveGold.ts';
import { menu as giveItem } from './giveItem.ts';
import { menu as giveWeapon } from './giveWeapon.ts';
import { menu as giveArmor } from './giveArmor.ts';
import { menu as clearStates } from './clearStates.ts';
import { menu as giveStat } from './giveStat.ts';

CheatMenu.menus.push(
  teleport,
  saveRecall,
  noClip,
  speed,
  toggleSwitch,
  setVariable,
  godMode,
  giveExp,
  ...partyRecovery,
  enemyRecovery,
  giveGold,
  giveItem,
  giveWeapon,
  giveArmor,
  clearStates,
  giveStat,
);
