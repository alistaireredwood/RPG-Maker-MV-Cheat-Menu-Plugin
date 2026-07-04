package main

import (
	"bytes"
	"fmt"
	"io"
	"os"
	"path"

	"github.com/robertkrimen/otto/ast"
	"github.com/robertkrimen/otto/parser"
)

type RPGMakerEngineType struct {
	Name string `json:"name"`
	// PluginsJsRel is the path to plugins.js relative to the game root;
	// its existence is what identifies the engine.
	PluginsJsRel string
	// PostPatch runs after a plugin was successfully injected (optional).
	PostPatch func(pwd string, pluginName string)
}

func panicEngineType(str string) bool {
	_, _ = Red.Printf("Unable to patch this Game, %s\n", str)
	return false
}

// ResolveEngineType returns the engine matching the user's selection, or
// auto-detects it by probing each engine's plugins.js path. Returns nil
// (after printing an error) if no engine matches.
func ResolveEngineType(pwd string, selected string) *RPGMakerEngineType {
	if selected == Auto {
		for i := range RPGMakerEngineTypes {
			engineType := &RPGMakerEngineTypes[i]
			if engineType.PluginsJsRel == "" {
				continue
			}
			if _, err := os.Stat(path.Join(pwd, engineType.PluginsJsRel)); err == nil {
				_, _ = Cyan.Printf("Detected a RPG Maker %s game\n", engineType.Name)
				return engineType
			}
		}
		panicEngineType("unable to detect the RPG Maker engine (no plugins.js found)")
		return nil
	}
	for i := range RPGMakerEngineTypes {
		engineType := &RPGMakerEngineTypes[i]
		if engineType.Name != selected || engineType.PluginsJsRel == "" {
			continue
		}
		if _, err := os.Stat(path.Join(pwd, engineType.PluginsJsRel)); err != nil {
			panicEngineType(fmt.Sprintf("this is NOT a RPG Maker %s game", engineType.Name))
			return nil
		}
		return engineType
	}
	panicEngineType(fmt.Sprintf("unknown engine type %q", selected))
	return nil
}

func InjectPatchPlugin(pluginsDotJs string, patcherName string, shouldBackupPluginJs bool) bool {
	_, err := os.Stat(pluginsDotJs)
	if err != nil {
		return panicEngineType(fmt.Sprintf("%s does NOT exist", pluginsDotJs))
	}
	pluginsDotJsContent, err := os.ReadFile(pluginsDotJs)
	if err != nil {
		return panicEngineType(fmt.Sprintf("unable to load %s", pluginsDotJs))
	}
	program, err := parser.ParseFile(nil, "", string(pluginsDotJsContent), 0)
	if err != nil {
		return panicEngineType("failed to patch programmatically, please patch this game manually...")
	}
	for _, declaration := range program.DeclarationList {
		if vd, ok := declaration.(*ast.VariableDeclaration); ok {
			for _, expression := range vd.List {
				if expression.Name == "$plugins" {
					if plugins, ok := expression.Initializer.(*ast.ArrayLiteral); ok {
						// check this game has whether been patched
						for _, value := range plugins.Value {
							if item, ok := value.(*ast.ObjectLiteral); ok {
								for _, property := range item.Value {
									if property.Key == "name" {
										if pluginName, ok := property.Value.(*ast.StringLiteral); ok {
											if pluginName.Value == patcherName {
												_, _ = Yellow.Printf("\"%s\" is already patched, skipping...\n", patcherName)
												return false
											}
										}
									}
								}
							}
						}
						// inject a json at the end of the array
						pluginsArrayRightBracketIndex := plugins.Idx1()
						readyForInjection := false
						var prefixBytes []byte
						var contentBytes []byte
						var suffixBytes []byte
						for i := pluginsArrayRightBracketIndex - 1; i > 0; i-- {
							currentChar := pluginsDotJsContent[i]

							// statement 1
							/// var $plugins = [];
							if currentChar == '[' {
								i++
								prefixBytes = pluginsDotJsContent[0:i]
								contentBytes = []byte("\n")
								suffixBytes = pluginsDotJsContent[i:]
								readyForInjection = true
								break
							}

							// statement 2
							/// var $plugins = [
							///     {...}
							/// ];
							if currentChar == '}' {
								i++
								prefixBytes = pluginsDotJsContent[0:i]
								contentBytes = []byte(",\n")
								suffixBytes = pluginsDotJsContent[i:]
								readyForInjection = true
								break
							}

							// statement 3
							/// var $plugins = [
							///     {...},
							/// ];
							if currentChar == ',' {
								i++
								prefixBytes = pluginsDotJsContent[0:i]
								contentBytes = []byte("\n")
								suffixBytes = pluginsDotJsContent[i:]
								readyForInjection = true
								break
							}
						}
						if readyForInjection {
							pluginObjectBytes := []byte(fmt.Sprintf("{\"name\":\"%s\",\"status\":true,\"description\":\"\",\"parameters\":{}}", patcherName))
							extraBytes := []byte("")
							if len(suffixBytes) > 0 && suffixBytes[0] != '\n' {
								extraBytes = []byte("\n")
							}
							if shouldBackupPluginJs {
								backupFileName := pluginsDotJs + ".bak"
								err = os.WriteFile(backupFileName, pluginsDotJsContent, 0o666)
								if err != nil {
									return panicEngineType(fmt.Sprintf("failed to backup %s as %s", pluginsDotJs, backupFileName))
								}
							}
							err = os.WriteFile(
								pluginsDotJs,
								bytes.Join(
									[][]byte{
										prefixBytes,
										contentBytes,
										pluginObjectBytes,
										extraBytes,
										suffixBytes,
									},
									[]byte(""),
								),
								0o666,
							)
							if err != nil {
								return panicEngineType(fmt.Sprintf("failed to write into %s", pluginsDotJs))
							}
							_, _ = Cyan.Printf("\"%s\" successfully patched, enjoy!\n", patcherName)
							return true
						} else {
							return panicEngineType("unable to find a place to patch...")
						}
					}
				}
			}
		}
	}
	return panicEngineType(fmt.Sprintf("%s is not a valid plugins.js file", pluginsDotJs))
}

const Auto = "Auto"

var RPGMakerEngineTypes = []RPGMakerEngineType{
	{
		Name: Auto,
	},
	{
		Name:         "MV",
		PluginsJsRel: "www/js/plugins.js",
	},
	{
		Name:         "MZ",
		PluginsJsRel: "js/plugins.js",
		PostPatch: func(pwd string, pluginName string) {
			// copy plugin cheat file, because in default, cheat plugin is inside www/js/plugins
			pluginJsPath := path.Join(pwd, "www/js/plugins", pluginName+".js")
			targetPluginJsPath := path.Join(pwd, "js/plugins", pluginName+".js")
			if reader, err := os.Open(pluginJsPath); err == nil {
				defer func() {
					_ = reader.Close()
				}()
				if writer, err := os.Create(targetPluginJsPath); err == nil {
					defer func() {
						_ = writer.Close()
					}()
					if _, err = io.Copy(writer, reader); err != nil {
						_, _ = RedUnderline.Printf("failed to copy \"%s\" to \"%s\"\n", pluginJsPath, targetPluginJsPath)
					}
				} else {
					_, _ = RedUnderline.Printf("failed to create \"%s\"\n", targetPluginJsPath)
				}
			} else {
				_, _ = RedUnderline.Printf("failed to open \"%s\"\n", pluginJsPath)
			}
		},
	},
}
