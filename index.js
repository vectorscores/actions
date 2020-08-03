const core = require("@actions/core");
const { NpmPackageJsonLint } = require("npm-package-json-lint");

try {
  const pkgPath = "package.json";

  const cwd = process.env.GITHUB_WORKSPACE;
  console.log(cwd)

  const packageJsonLinter = new NpmPackageJsonLint({
    cwd: process.env.GITHUB_WORKSPACE,
    packageJsonObject: require(pkgPath),
    packageJsonFilePath: pkgPath,
    config: {
      rules: {
        "require-author": "error",
        "require-description": "error",
        "prefer-property-order": ["error", []],
        "require-name": "error",
        "valid-values-name-scope": ["error", ["@vectorscores"]],
        "require-version": "error",
        "prefer-scripts": ["warning", ["build", "test"]],
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
