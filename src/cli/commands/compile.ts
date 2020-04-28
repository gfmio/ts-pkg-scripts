import commander from "commander";
import readTsConfigJson from "../../utils/readTsconfigJson";
import { compile, compileDeclarationsOnly } from "../../actions";
import * as path from "path";

export interface CompileCommandOptions {
  config?: string;
  compilerOptions?: string;
  declarationOnly: boolean;
  target?: string;
  module?: string;
  outDir?: string;
  extension?: string;
  cjs: boolean;
  es: boolean;
  files: string[];
}

export const action = async (
  files: string[] | undefined,
  opts: CompileCommandOptions
) => {
  const tsConfig = await readTsConfigJson(opts.config);

  let compilerOptionsOverride;
  try {
    compilerOptionsOverride = opts.compilerOptions
      ? JSON.parse(opts.compilerOptions)
      : {};
  } catch (e) {}

  const compilerOptions = {
    ...(tsConfig.data.compilerOptions || {}),
    noEmit: false,
    emitDeclarationOnly: !!opts.declarationOnly,
    ...compilerOptionsOverride,
  };

  if (opts.target) {
    compilerOptions.target = opts.target;
  }

  if (opts.module) {
    compilerOptions.module = opts.module;
  }

  if (opts.cjs && opts.es) {
    throw new Error(
      "You should only specify one of the options --cjs and --es"
    );
  }

  if ((opts.cjs || opts.es) && (opts.target || opts.module)) {
    throw new Error(
      "You should only not specify --module or --target when using one of the options --cjs or --es"
    );
  }

  if (opts.cjs) {
    compilerOptions.target = "es5";
    compilerOptions.module = "commonjs";
  }

  if (opts.es) {
    compilerOptions.target = "es2020";
    compilerOptions.module = "es2020";
  }

  const outDir =
    opts.outDir || compilerOptions.outDir || path.join(process.cwd(), "dist");

  const tsConfigIncludesExcludes = [
    ...(tsConfig.data.include || []),
    ...(tsConfig.data.exclude
      ? tsConfig.data.exclude.map((s: string) => `!${s}`)
      : []),
  ];

  const allFiles =
    files && files.length > 0
      ? files
      : opts.files && opts.files.length > 0
      ? opts.files
      : tsConfigIncludesExcludes && tsConfigIncludesExcludes.length > 0
      ? tsConfigIncludesExcludes
      : tsConfig.data.files && tsConfig.data.files.length > 0
      ? tsConfig.data.files
      : [];

  if (opts.declarationOnly) {
    await compileDeclarationsOnly(allFiles, compilerOptions, outDir);
  } else {
    await compile(allFiles, compilerOptions, outDir, opts.extension);
  }
};

export const command = commander
  .createCommand("compile")
  .description("Compile the project")
  .storeOptionsAsProperties(false)
  .passCommandToAction(false)
  .option("-c --config <path>", "Path to tsconfig.json")
  .option("--cjs", "Shorthand for compile to module CommonJS and target ES5")
  .option("--compilerOptions <json>", "JSON string with tsconfig overrides")
  .option("--dts, --declarationOnly", "Only generate type declarations")
  .option("--es", "Shorthand for compile to module ES2020 and target ES6")
  .option(
    "-e --extension --ext <extension>",
    "Set extension of generated files"
  )
  .option(
    "-f --files --file <file>",
    "Set input files",
    (value, prev) => prev.concat([value]),
    [] as string[]
  )
  .option("-m --module <module>", "Set compilation module type")
  .option("-o --outDir <path>", "Output path for the generated files")
  .option("-t --target <target>", "Set compilation target")
  .arguments("[...files]")
  .action(action);

export default command;
