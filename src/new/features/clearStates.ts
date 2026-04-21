import CheatMenu from '../CheatMenu.ts';

CheatMenu.clearActorStates = (actor) => {
  if (actor.states() != undefined && actor.states().length > 0) {
    actor.clearStates();
  }
};

CheatMenu.clearPartyStates = () => {
  const members = $gameParty.allMembers();

  for (let i = 0; i < members.length; i++) {
    CheatMenu.clearActorStates(members[i]);
  }
};

CheatMenu.clearCurrentActorStates = function () {
  const actor = $gameActors.actor(CheatMenu.cheatSelectedActor);
  if (actor) CheatMenu.clearActorStates(actor);
  SoundManager.playSystemSound(1);
  CheatMenu.updateMenu();
};

CheatMenu.partyClearStatesCheat = function () {
  CheatMenu.clearPartyStates();
  SoundManager.playSystemSound(1);
};

CheatMenu.appendPartyState = function (key1) {
  CheatMenu.appendCheat(
    'Clear Party States',
    'Activate',
    key1,
    CheatMenu.partyClearStatesCheat,
  );
};

CheatMenu.appendCurrentState = function (key1) {
  CheatMenu.appendTitle('Current State');
  let numberStates = 0;

  const actorInstance = $gameActors.actor(CheatMenu.cheatSelectedActor);
  const activeStates = actorInstance?.states();

  if (activeStates) {
    numberStates = activeStates.length;
  }

  CheatMenu.appendCheat(
    'Number Effects:',
    numberStates,
    key1,
    CheatMenu.clearCurrentActorStates,
  );
};

export const menu = {
  name: 'Clear States',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendPartyState(4);
    CheatMenu.appendActorSelection(5, 6);
    CheatMenu.appendCurrentState(7);
  },
};
