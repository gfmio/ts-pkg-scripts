import type { JSONSchemaForNPMPackageJsonFiles } from "@schemastore/package";
import pick from "../utils/pick";
import movePackageJson from "./movePackageJson";

export const defaultAllowedFields = [
  "name",
  "version",
  "description",
  "license",
  "private",
  "author",
  "contributors",
  "maintainers",
  "keywords",
  "homepage",
  "bugs",
  "repository",
  "readme",
  "bin",
  "main",
  "module",
  "browser",
  "types",
  "umd:main",
  "files",
  "man",
  "directories",
  "dependencies",
  "peerDependencies",
  "optionalDependencies",
  "bundleDependencies",
  "bundledDependencies",
  "resolutions",
  "engines",
  "engineStrict",
  "os",
  "cpu",
  "publishConfig",
  "dist",
];

export function createPackageJson(
  packageJson: JSONSchemaForNPMPackageJsonFiles,
  newPath: string,
  privateField?: boolean | null | undefined,
  selectFields: Array<
    keyof JSONSchemaForNPMPackageJsonFiles
  > = defaultAllowedFields
): JSONSchemaForNPMPackageJsonFiles {
  let newPackageJson = movePackageJson(packageJson, newPath);

  if (privateField) {
    newPackageJson.private = true;
  } else if (privateField === false) {
    newPackageJson.private = false;
  } else if (privateField === null) {
    delete newPackageJson.private;
  }

  newPackageJson = pick(newPackageJson, selectFields);

  return newPackageJson;
}
