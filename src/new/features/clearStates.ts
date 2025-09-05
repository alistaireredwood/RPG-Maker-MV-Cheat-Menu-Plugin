import CheatMenu from '../CheatMenu.ts';

// clear active states on an actor
CheatMenu.clear_actor_states = (actor) => {
  if (actor.states() != undefined && actor.states().length > 0) {
    actor.clearStates();
  }
};

// clear active states on party
CheatMenu.clear_party_states = () => {
  const members = $gameParty.allMembers();

  for (let i = 0; i < members.length; i++) {
    CheatMenu.clear_actor_states(members[i]);
  }
};

// handler for the clear actor state cheat
CheatMenu.clear_current_actor_states = function () {
  CheatMenu.clear_actor_states(
    $gameActors.actor(CheatMenu.cheat_selected_actor),
  );

  SoundManager.playSystemSound(1);
  CheatMenu.update_menu();
};

// handler for the party state clear cheat
CheatMenu.party_clear_states_cheat = function () {
  CheatMenu.clear_party_states();
  SoundManager.playSystemSound(1);
};

// append the party hp cheats
CheatMenu.append_party_state = function (key1) {
  CheatMenu.append_cheat(
    'Clear Party States',
    'Activate',
    key1,
    CheatMenu.party_clear_states_cheat,
  );
};

// append the clear actor state cheat to the menu
CheatMenu.append_current_state = function (key1) {
  CheatMenu.append_title('Current State');
  let number_states = 0;

  const actorInstance = $gameActors.actor(CheatMenu.cheat_selected_actor);
  const activeStates = actorInstance.states();

  if (activeStates) {
    number_states = activeStates.length;
  }

  CheatMenu.append_cheat(
    'Number Effects:',
    number_states,
    key1,
    CheatMenu.clear_current_actor_states,
  );
};

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Clear States');
  CheatMenu.append_party_state(4);
  CheatMenu.append_actor_selection(5, 6);
  CheatMenu.append_current_state(7);
});
