package main

import (
	"os"
	"path"
	"sort"
	"strings"
)

const (
	extensionPrefix = "Cheat_Menu."
	extensionSuffix = ".js"
)

// MV keeps plugins in www/js/plugins, MZ in js/plugins; an extension may be
// dropped into either, depending on the engine and on where the user looked.
var extensionDirs = []string{"www/js/plugins", "js/plugins"}

// FindExtensionPlugins returns the plugin names of game-specific Cheat Menu
// extensions (files named Cheat_Menu.<name>.js), so the user doesn't have to
// list them in plugins_patch.go.txt. Cheat Menu loads them in any order.
func FindExtensionPlugins(pwd string) []string {
	seen := map[string]bool{}
	var names []string
	for _, dir := range extensionDirs {
		entries, err := os.ReadDir(path.Join(pwd, dir))
		if err != nil {
			continue
		}
		for _, entry := range entries {
			fileName := entry.Name()
			if entry.IsDir() ||
				!strings.HasPrefix(fileName, extensionPrefix) ||
				!strings.HasSuffix(fileName, extensionSuffix) {
				continue
			}
			name := strings.TrimSuffix(fileName, extensionSuffix)
			// "Cheat_Menu.js" itself: the prefix and suffix overlap
			if len(name) <= len(extensionPrefix) || seen[name] {
				continue
			}
			seen[name] = true
			names = append(names, name)
		}
	}
	sort.Strings(names)
	return names
}

// MergePluginNames appends the found extensions to the listed plugins,
// trimming blanks (the list file may have CRLF line endings) and duplicates.
func MergePluginNames(listed []string, found []string) []string {
	seen := map[string]bool{}
	var names []string
	for _, name := range append(append([]string{}, listed...), found...) {
		name = strings.TrimSpace(name)
		if name == "" || seen[name] {
			continue
		}
		seen[name] = true
		names = append(names, name)
	}
	return names
}
