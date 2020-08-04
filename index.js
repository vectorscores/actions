const path = require("path");
const core = require("@actions/core");
const { NpmPackageJsonLint } = require("npm-package-json-lint");

try {
  const cwd = core.getInput("cwd");
  const relativePath = core.getInput("package-json-path");
  const packageJsonPath = path.resolve(cwd, relativePath);

  const packageJsonLinter = new NpmPackageJsonLint({
    cwd,
    packageJsonObject: require(packageJsonPath),
    packageJsonFilePath: relativePath,
    config: {
      extends: "npm-package-json-lint-config-default",
      rules: {
        "require-author": "error",
        "require-description": "error",
        "description-format": [
          "error",
          {
            requireCapitalFirstLetter: true,
            forbidEndingPeriod: true,
          },
        ],
        "prefer-property-order": ["error", []],
        "prefer-scripts": ["warning", ["build", "test"]],
        "valid-values-name-scope": ["error", ["@vectorscores"]],
      },
    },
  });

  //

  const { results } = packageJsonLinter.lint();
  const [firstResult] = results;

  if (firstResult.errorCount !== 0) {
    core.debug(JSON.stringify(firstResult));

    firstResult.issues.forEach((i) => {
      const logMethod = i.severity === "error" ? "error" : "warning";
      core[logMethod](i.lintMessage);
    });

    throw new Error(
      `${firstResult.errorCount} errors found in ${firstResult.filePath}`
    );
  }
} catch (err) {
  core.setFailed(err.message);
}
