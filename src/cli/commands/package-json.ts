import commander from "commander";
import * as path from "path";
import { updatePackageJson } from "../../actions";
import { writeFileAsync } from "../../utils/fs";
import readPackageJson from "../../utils/readPackageJson";
import readTsConfigJson from "../../utils/readTsconfigJson";

export interface PackageJsonCommandOptions {
  input?: string;
  outDir?: string;
  outFile?: string;
  private?: boolean;
  public?: boolean;
  removePrivate?: boolean;
}

export const action = async (opts: PackageJsonCommandOptions) => {
  const packageJson = await readPackageJson(opts.input);

  const tsconfigJson = await readTsConfigJson(
    path.join(path.dirname(packageJson.path), "tsconfig.json")
  ).catch(() => undefined);

  if (opts.outDir && opts.outFile) {
    throw new Error(
      "You can only specify one of the options --outDir and --outFile"
    );
  }

  const outDir = path.resolve(
    opts.outDir ||
      (opts.outFile
        ? path.dirname(opts.outFile!)
        : tsconfigJson?.data?.compilerOptions?.outDir || "./dist")
  );
  const relativeOutDir = path.relative(path.dirname(packageJson.path), outDir);
  const outFile = opts.outFile || path.join(outDir, "package.json");

  const nTrue =
    Number(opts.private) + Number(opts.public) + Number(opts.removePrivate);
  if (nTrue > 1) {
    throw new Error(
      "You can only specify one of the options --private, --public and --remove-private"
    );
  }

  const newPackageJson = updatePackageJson(
    packageJson.data,
    relativeOutDir,
    opts.private
      ? true
      : opts.public
      ? false
      : opts.removePrivate
      ? null
      : undefined
  );

  await writeFileAsync(outFile, JSON.stringify(newPackageJson, undefined, 2));
};

export const command = commander
  .createCommand("package-json")
  .description("Move the package.json and update relative paths")
  .storeOptionsAsProperties(false)
  .passCommandToAction(false)
  .option("-i --input <file>", "Input file")
  .option("-o --outDir <path>", "Output directory")
  .option("--outFile <path>", "Output file")
  .option("--private", "Sets private = true in the package.json")
  .option("--public", "Sets private = false in the package.json")
  .option("--remove-private", "Removes the private field from the package.json")
  .action(action);

export default command;
