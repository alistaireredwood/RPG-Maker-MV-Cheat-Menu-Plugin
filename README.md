RPG Maker MV Cheat Menu Plugin
==============================

I've created a plugin for RPG Maker MV that allows users to access a Cheat Menu in game. The controls are all input via the number keys \[0\]\-\[9\] (not the NUMPAD) (other keys may be used as well now) or the mouse.

Open the Menu by pressing the \[1\] Key.
Move menu to different positions with \` (key with tilde ~)
Scroll between cheats with \[2\] and \[3\] Keys.
Any \[#\] indicates a number key to press to cause an action, if you don't want to click.
Pop the menu out into a separate always-on-top window (and back) with F7, so it doesn't cover the game.

The menu can also be interacted with by clicking (everything except opening the menu can be done with the mouse).
Clicking is done with left click and clickable elements will be highlighted red on hover over.
The main menu shows all cheats as a grid of buttons; "Back to Main Menu" returns to it from any cheat.

Available Cheats Are
--------------------

* God Mode for any Actor (HP, MP and TP stay full, skills cost nothing)
* Party HP / MP / TP: set to 0, to 1, to half or to full, for alive members or everyone
* Enemy HP: set to 0, to 1, to half or to full, for alive enemies or all of them (ends the battle when all enemies are dead)
* Toggle No Clip
* Edit Exp
* Edit Stats
* Edit Gold
* Edit Items, Weapons, Armor (with search by name)
  * Amounts can be picked from presets or typed in; Gold, Stats, Variables and item counts can also be set to an exact value by typing it and pressing Enter
* Change player movement speed, optionally locking it so the game can't change it
* Game Speed: speed up the whole game (map, events, battles, messages) up to x10
* Unlock Controls: force mouse / touch movement and Ctrl message skipping in games that disable them
* Clear Status/States Effects
* Edit Variables/Switches (with search by name)
* Save/Recall Location and Teleport
  * Be careful not to skip game events
  * If you teleport off the map lower X,Y and teleport again to fix it.
* Save Game: save to any slot at any time, even where the game disables saving (not available during battle)
* Evaluate: run your own JavaScript in the game (Ctrl+Enter), the script is kept between sessions
* Open javascript console/developer tools with F8
  * With this you can edit game Variables and Switches (at your own risk) in the $gameVariables and $gameSwitches, as well as other advanced stuff
* Open Switch/Variable Debug Menu from playtest Mode with F9
  * Better/easier method for editing the Switches and Variables than using the console, slower if you want to edit variables by large amounts

Install
-------

* Unpack Game if needed (if you have a single large Game.exe with no /www folder, etc.).
  * I used to use EnigmaVBUnpacker tool by [Kao](https://lifeinhex.com/) (most new games do not require this anymore)
* Copy and Paste this contents of Cheat_Menu folder into folder with Game.exe
* Patch your www/js/plugins.js
  * Backup your www/js/plugins.js file
  * Patch
      * Run patcher.exe (it can back up plugins.js for you)
        or
      * Manually Add the following to your plugins.js file, ensure you follow proper JavaScript formating for the $plugins array and include a , at end of the line before where you add this (recommended to add the bottom of plugins.js file)
        * {"name":"Cheat_Menu","status":true,"description":"","parameters":{}}
 * Delete patcher.exe and plugins_patch.go.txt

If the www/js/plugins.js is read only, remove that in the properties or the patch with fail.

Some games might have have altered the plugin loading mechanism (for example using a single composite plugin to save space). In this case you should open the GameFolder/www/js/main.js and insert the code as shown below in order to get any extra plugins to load.

```javascript
//=============================================================================
// main.js
//=============================================================================

PluginManager.setup($plugins);

// Insert the code below, change plugin name if loading something besides Cheat_Menu
PluginManager._path= 'js/plugins/';
PluginManager.loadScript('Cheat_Menu.js');
// End Insert

window.onload = function() {
    SceneManager.run(Scene_Boot);
};

```

Uninstall
---------

* Delete www/js/plugins/Cheat_Menu.js and www/js/plugins/Cheat_Menu.css
* Remove plugin entry from www/js/plugins.js
  * Be sure to remove the comma from new last entry if this plugin was last in the list
  * Ideally you can just restore you backup of plugins.js
* Delete patcher.exe and plugins_patch.go.txt if you haven't already
