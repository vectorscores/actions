const path = require("path");
const core = require("@actions/core");
const { NpmPackageJsonLint } = require("npm-package-json-lint");
const { rules: defaultRules } = require("npm-package-json-lint-config-default");

try {
  const cwd = core.getInput("cwd");
  const relativePath = core.getInput("package-json-path");
  const packageJsonPath = path.resolve(cwd, relativePath);

  const packageJsonLinter = new NpmPackageJsonLint({
    cwd,
    packageJsonObject: require(packageJsonPath),
    packageJsonFilePath: relativePath,
    config: {
      rules: {
        ...defaultRules,
        "require-author": "error",
        "require-description": "error",
        "prefer-scripts": ["warning", ["build", "test"]],
        "valid-values-name-scope": ["error", ["@vectorscores"]],
      },
    },
  });

  //

  const { results, errorCount } = packageJsonLinter.lint();
  core.debug(JSON.stringify(results));

  results.forEach((r) => {
    core.debug(JSON.stringify(r));

    r.issues.forEach((i) => {
      const logMethod = i.severity === "error" ? "error" : "warning";
      core[logMethod](i.lintMessage);
    });
  });

  if (errorCount !== 0) {
    throw new Error(
      `${errorCount} errors found`
    );
  }
} catch (err) {
  core.setFailed(err.message);
}
