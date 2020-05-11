import commander from "commander";
import * as path from "path";
import { existsAsync } from "../../utils/fs";
import { bundleDeclarations, bundle } from "../../actions";
import readPackageJson from "../../utils/readPackageJson";
import readTsConfigJson from "../../utils/readTsconfigJson";
import {
  OutputOptions,
  RollupWarning,
  WarningHandler,
  RollupOptions,
} from "rollup";
import { preserveShebangs } from "rollup-plugin-preserve-shebangs";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

export interface BundleCommandOptions {
  entrypoint?: string;
  minify?: boolean;
  amd?: boolean | string;
  cjs?: boolean | string;
  config?: string;
  dts?: boolean | string;
  es?: boolean | string;
  iife?: boolean | string;
  package?: string;
  system?: boolean | string;
  umd?: boolean | string;
  umdName?: string;
}

const tsPlugin = (target: string) =>
  typescript({
    tsconfigOverride: {
      compilerOptions: {
        target,
        module: "es2015",
        declaration: false,
        declarationMap: false,
        noEmit: false,
        emitDeclarationOnly: false,
      },
    },
  });

export const action = async (opts: BundleCommandOptions) => {
  const packageJson = await readPackageJson(opts.package);
  const tsConfig = await readTsConfigJson(opts.config);

  const sourcemap = !!tsConfig?.data?.compilerOptions?.inlineSourceMap
    ? "inline"
    : !!tsConfig.data?.compilerOptions?.sourceMap;

  let entrypoint = opts.entrypoint!;

  if (!opts.entrypoint) {
    const entrypoints = ["index.ts", "index.tsx"].map((f) =>
      path.resolve(path.join("src", f))
    );
    for (const e of entrypoints) {
      if (await existsAsync(e)) {
        entrypoint = e;
        break;
      }
    }
    if (!entrypoint) {
      throw new Error(
        "No suitable entrypoint found. Please create `src/index.ts` or `src/index.tsx` or specify an entrypoint with -e or --entrypoint."
      );
    }
  }

  const basename = (() => {
    const parts = (packageJson.data.name as string).split("/");
    return parts[parts.length - 1];
  })();

  const umdName =
    opts.umdName ||
    basename
      .split("-")
      .map((s) => s.substr(0, 1).toUpperCase() + s.substr(1))
      .join("");

  const outDir = path.resolve(
    tsConfig.data.compilerOptions?.outDir || "./dist"
  );

  const bundlePath = (
    pathOrBoolean: string | boolean | undefined,
    extension: string,
    fallbackPath?: string | undefined
  ): string | undefined =>
    typeof pathOrBoolean === "string" && pathOrBoolean
      ? pathOrBoolean
      : pathOrBoolean
      ? fallbackPath ?? path.join(outDir, `${basename}${extension}`)
      : undefined;

  const cjs = bundlePath(opts.cjs, ".js", packageJson.data.main);
  const es = bundlePath(opts.es, ".mjs", packageJson.data.module);
  const dts = bundlePath(opts.dts, ".d.ts", packageJson.data.types);
  const umd = bundlePath(opts.umd, ".umd.js", packageJson.data["umd:main"]);
  const amd = bundlePath(opts.amd, ".amd.js");
  const iife = bundlePath(opts.iife, ".iife.js");
  const system = bundlePath(opts.system, ".system.js");

  const es5RollupOutputs: OutputOptions[] = [];
  const es6RollupOutputs: OutputOptions[] = [];
  if (cjs) {
    es5RollupOutputs.push({
      file: cjs,
      format: "cjs",
      esModule: true,
      sourcemap,
    });
  }
  if (es) {
    es6RollupOutputs.push({
      file: es,
      format: "es",
      esModule: true,
      sourcemap,
    });
  }
  if (umd) {
    es5RollupOutputs.push({
      file: umd,
      format: "umd",
      name: umdName,
      esModule: false,
      sourcemap,
    });
  }
  if (amd) {
    es5RollupOutputs.push({
      file: amd,
      format: "amd",
      esModule: false,
      sourcemap,
    });
  }
  if (iife) {
    es5RollupOutputs.push({
      file: iife,
      format: "iife",
      esModule: false,
      sourcemap,
    });
  }
  if (system) {
    es5RollupOutputs.push({
      file: system,
      format: "system",
      esModule: false,
      sourcemap,
    });
  }

  const plugins = [preserveShebangs()];

  if (opts.minify) {
    plugins.push(terser());
  }

  const promises: Array<Promise<void>> = [];

  const ignoredRollupWarnings = ["UNRESOLVED_IMPORT", "MISSING_GLOBAL_NAME"];

  const onwarn = (warning: RollupWarning, defaultHandler: WarningHandler) => {
    if (ignoredRollupWarnings.includes(warning.code!)) {
      return;
    }
    defaultHandler(warning);
  };

  const baseConfig = {
    onwarn,
    input: entrypoint,
    external: tsConfig.data.compilerOptions?.importHelpers ? ["tslib"] : [],
  };

  const configs: RollupOptions[] = [];
  if (es5RollupOutputs.length > 0) {
    configs.push({
      ...baseConfig,
      output: es5RollupOutputs,
      plugins: [tsPlugin("es5"), ...plugins],
    });
  }
  if (es6RollupOutputs.length > 0) {
    configs.push({
      ...baseConfig,
      output: es6RollupOutputs,
      plugins: [tsPlugin("es6"), ...plugins],
    });
  }

  if (configs.length > 0) {
    promises.push(bundle(...configs));
  }

  if (dts) {
    promises.push(bundleDeclarations(entrypoint, dts, tsConfig.path));
  }

  await Promise.all(promises);
};

export const command = commander
  .createCommand("bundle")
  .description("Bundle the project")
  .storeOptionsAsProperties(false)
  .passCommandToAction(false)
  .option("--amd [path]", "Build AMD bundle")
  .option("--cjs [path]", "Build CommonJS bundle")
  .option("--dts [path]", "Build TypeScript declaration bundle")
  .option("-c --config <path>", "Path to the tsconfig.json file")
  .option("-e --entrypoint <path>", "Entrypoint of the bundle")
  .option("--es [path]", "Build ES bundle")
  .option("--iife [path]", "Build IIFE bundle")
  .option("--min --minify", "Minify bundles")
  .option("-p --package <path>", "Path to the package.json file")
  .option("--system [path]", "Build system bundle")
  .option("--umd [path]", "Build UMD bundle")
  .option("--umd-name [name]", "Name of the UMD bundle in the global namespace")
  .action(action);

export default command;
