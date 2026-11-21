package main

import (
	"os"
	"path"
	"reflect"
	"testing"
)

func TestFindExtensionPluginsInBothPluginDirs(t *testing.T) {
	dir := t.TempDir()
	writeGameFile(t, dir, "www/js/plugins/Cheat_Menu.js", "")
	writeGameFile(t, dir, "www/js/plugins/Cheat_Menu.css", "")
	writeGameFile(t, dir, "www/js/plugins/Cheat_Menu.zeta.js", "")
	writeGameFile(t, dir, "www/js/plugins/Cheat_Menu.alpha.js", "")
	writeGameFile(t, dir, "www/js/plugins/OtherPlugin.js", "")
	writeGameFile(t, dir, "www/js/plugins/Cheat_Menu.notes.txt", "")
	writeGameFile(t, dir, "js/plugins/Cheat_Menu.mz.js", "")
	// present in both dirs: reported once
	writeGameFile(t, dir, "js/plugins/Cheat_Menu.alpha.js", "")

	got := FindExtensionPlugins(dir)
	want := []string{"Cheat_Menu.alpha", "Cheat_Menu.mz", "Cheat_Menu.zeta"}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("got %v, want %v", got, want)
	}
}

func TestFindExtensionPluginsWithoutPluginDirs(t *testing.T) {
	if got := FindExtensionPlugins(t.TempDir()); len(got) != 0 {
		t.Fatalf("expected no extensions, got %v", got)
	}
}

func TestMergePluginNamesKeepsOrderAndDropsDuplicatesAndBlanks(t *testing.T) {
	listed := []string{"Cheat_Menu", " Cheat_Menu.alpha \r", "", "  "}
	found := []string{"Cheat_Menu.alpha", "Cheat_Menu.beta"}

	got := MergePluginNames(listed, found)
	want := []string{"Cheat_Menu", "Cheat_Menu.alpha", "Cheat_Menu.beta"}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("got %v, want %v", got, want)
	}
}

func TestPluginNamesToPatchReadsListFileAndFindsExtensions(t *testing.T) {
	dir := t.TempDir()
	writeGameFile(t, dir, "www/js/plugins/Cheat_Menu.js", "")
	writeGameFile(t, dir, "www/js/plugins/Cheat_Menu.someGame.js", "")
	writeGameFile(t, dir, "www/js/plugins/Cheat_Menu.dictionary.json", "")

	for _, list := range []string{"Cheat_Menu\n", "Cheat_Menu\r\n", "Cheat_Menu"} {
		got := PluginNamesToPatch(dir, list)
		want := []string{"Cheat_Menu", "Cheat_Menu.someGame"}
		if !reflect.DeepEqual(got, want) {
			t.Fatalf("list %q: got %q, want %q", list, got, want)
		}
	}
}

func TestMZPostPatchKeepsPluginAlreadyInJsPlugins(t *testing.T) {
	dir := t.TempDir()
	// an extension dropped straight into the MZ plugin dir has no www copy
	writeGameFile(t, dir, "js/plugins/Cheat_Menu.mz.js", "ext")

	engineByName(t, "MZ").PostPatch(dir, "Cheat_Menu.mz")

	got, err := os.ReadFile(path.Join(dir, "js/plugins/Cheat_Menu.mz.js"))
	if err != nil || string(got) != "ext" {
		t.Fatalf("existing plugin file was touched: %q, %v", got, err)
	}
}
