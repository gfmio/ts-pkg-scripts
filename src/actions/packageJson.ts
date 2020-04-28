import type { JSONSchemaForNPMPackageJsonFiles } from "@schemastore/package";
import * as path from "path";
import pick from "../utils/pick";

export function movePackageJson(
  packageJson: JSONSchemaForNPMPackageJsonFiles,
  newPath: string
): JSONSchemaForNPMPackageJsonFiles {
  const newPackageJson = { ...packageJson };

  // bin

  if (typeof newPackageJson.bin === "string") {
    newPackageJson.bin = path.relative(newPath, newPackageJson.bin);
  } else if (typeof newPackageJson.bin === "object") {
    for (const key of Object.keys(newPackageJson.bin)) {
      newPackageJson.bin[key] = path.relative(newPath, newPackageJson.bin[key]);
    }
  }

  // directories

  if (typeof newPackageJson.directories === "object") {
    for (const key of Object.keys(newPackageJson.directories)) {
      newPackageJson.directories[key] = path.relative(
        newPath,
        newPackageJson.directories[key]
      );
    }
  }

  // files

  if (Array.isArray(newPackageJson.files)) {
    newPackageJson.files = newPackageJson.files.map((file) =>
      path.relative(newPath, file)
    );
  }

  // main

  if (typeof newPackageJson.main === "string") {
    newPackageJson.main = path.relative(newPath, newPackageJson.main);
  }

  // man

  if (Array.isArray(newPackageJson.man)) {
    newPackageJson.man = newPackageJson.man.map((file) =>
      path.relative(newPath, file)
    );
  }

  // module

  if (typeof newPackageJson.module === "string") {
    newPackageJson.module = path.relative(newPath, newPackageJson.module);
  }

  // Non-standard properties

  // browser

  if (typeof newPackageJson.browser === "string") {
    newPackageJson.browser = path.relative(newPath, newPackageJson.browser);
  }

  // types

  if (typeof newPackageJson.types === "string") {
    newPackageJson.types = path.relative(newPath, newPackageJson.types);
  }

  // umd:main

  if (typeof newPackageJson["umd:main"] === "string") {
    newPackageJson["umd:main"] = path.relative(
      newPath,
      newPackageJson["umd:main"]
    );
  }

  return newPackageJson;
}

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

export function updatePackageJson(
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
