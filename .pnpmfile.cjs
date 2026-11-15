// typescript-eslint needs the classic TypeScript JS API (`require('typescript')`),
// which TypeScript 7 (native) no longer ships. The project compiles with TS 7;
// typescript-eslint packages get their own TS 6 instead of the root peer.
const TS_FOR_ESLINT = '6.0.3';

const usesTypescriptApi = (name) =>
  name === 'typescript-eslint' ||
  name === 'ts-api-utils' ||
  name.startsWith('@typescript-eslint/');

module.exports = {
  hooks: {
    readPackage(pkg) {
      if (usesTypescriptApi(pkg.name) && pkg.peerDependencies?.typescript) {
        delete pkg.peerDependencies.typescript;
        if (pkg.peerDependenciesMeta)
          delete pkg.peerDependenciesMeta.typescript;
        pkg.dependencies = { ...pkg.dependencies, typescript: TS_FOR_ESLINT };
      }
      return pkg;
    },
  },
};
