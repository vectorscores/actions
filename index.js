const core = require("@actions/core");
const { NpmPackageJsonLint } = require("npm-package-json-lint");

const pkgPath = "./package.json";

const packageJsonLinter = new NpmPackageJsonLint({
  packageJsonObject: require(pkgPath),
  packageJsonFilePath: pkgPath,
  config: {
    rules: {
      "require-author": "error",
      "require-bugs": "error",
    },
  },
});

try {
  const { results } = packageJsonLinter.lint();
  const [firstResult] = results;
  if (firstResult.errorCount !== 0) {
    core.info(JSON.stringify(firstResult));
    throw new Error(
      `${firstResult.errorCount} errors found in ${firstResult.filePath}`
    );
  }
} catch (err) {
  core.setFailed(err.message);
}
