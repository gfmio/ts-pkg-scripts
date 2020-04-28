import * as path from "path";
import { JSONSchemaForNPMPackageJsonFiles } from "@schemastore/package";
import { readFileAsync } from "./fs";

export interface PackageJsonProps {
  path: string;
  data: JSONSchemaForNPMPackageJsonFiles;
}

export default async function readPackageJson(
  aPath?: string
): Promise<PackageJsonProps> {
  const packageJsonPath = path.resolve(
    aPath || path.join(process.cwd(), "package.json")
  );
  const packageJson = JSON.parse(
    await readFileAsync(packageJsonPath, { encoding: "utf-8" })
  );
  return {
    path: packageJsonPath,
    data: packageJson,
  };
}
