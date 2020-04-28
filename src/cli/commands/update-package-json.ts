import commander from "commander";
import * as path from "path";
import { writeFileAsync } from "../../utils/fs";
import readPackageJson from "../../utils/readPackageJson";

export interface UpdatePackageJsonCommandOptions {
  src?: string;
  dest?: string;
  fields?: string[];
  removeFields?: string[];
  override?: string;
}

export const action = async (opts: UpdatePackageJsonCommandOptions) => {
  const dest = opts.dest || path.join(process.cwd(), "package.json");
  const {
    data: originalPackageJson,
    path: destFullPath,
  } = await readPackageJson(dest);

  const srcPackageJson = opts.src ? (await readPackageJson(opts.src)).data : {};

  const fields = opts.fields || [];
  const removeFields = opts.removeFields || [];

  const override = opts.override ? JSON.parse(opts.override) : {};

  let newPackageJson = { ...originalPackageJson };

  for (const field of removeFields) {
    delete newPackageJson[field];
  }

  for (const field of fields) {
    if (typeof srcPackageJson[field] !== "undefined") {
      newPackageJson[field] = srcPackageJson[field];
    }
  }

  newPackageJson = { ...newPackageJson, ...override };

  await writeFileAsync(
    destFullPath,
    JSON.stringify(newPackageJson, undefined, 2)
  );
};

export const command = commander
  .createCommand("update-package-json")
  .description(
    "Removes or updates fields in a package.json from another package.json or overrides"
  )
  .storeOptionsAsProperties(false)
  .passCommandToAction(false)
  .option("-d --dest <file>", "The destination file being updated")
  .option(
    "-f --fields --field <field>",
    "The field(s) to update in dest from src (if present in src)",
    (value, prev) => prev.concat([value]),
    [] as string[]
  )
  .option(
    "-o --override <json>",
    "The JSON string with properties to override in dest"
  )
  .option(
    "-r --remove --remove-field <field>",
    "The field(s) to remove from dest (if present)",
    (value, prev) => prev.concat([value]),
    [] as string[]
  )
  .option(
    "-s --src <file>",
    "The source file containing the fields used for the update"
  )
  .action(action);

export default command;
