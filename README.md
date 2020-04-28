# ts-pkg-scripts

This package provides zero-conf build tools for TypeScript packages.

## Install

```sh
# With yarn
yarn add -D ts-pkg-scripts

# With NPM
npm install --save-dev ts-pkg-scripts
```

The package has `typescript` as a `peerDependency`, so ensure that you also have `typescript` installed.

## Quickstart

A good starting point for an open-source TypeScript package using `ts-pkg` as a build tool would be the following `package.json`:

```json
{
  "name": "<name>",
  "version": "<version>",
  "description": "<description>",
  "license": "<license>",
  "repository": "<repository>",
  "private": true,
  "author": {
    "name": "<name>",
    "email": "<email>",
    "url": "<url>"
  },
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "umd:main": "dist/index.umd.js",
  "scripts": {
    "build": "run-p bundle compile:cjs compile:es compile:dts package-json copy",
    "bundle": "ts-pkg bundle --cjs --es --dts --min",
    "compile:cjs": "ts-pkg compile --cjs -o dist/lib",
    "compile:es": "ts-pkg compile --es -e .mjs -o dist/lib",
    "compile:dts": "ts-pkg compile --dts -o dist/lib",
    "package-json": "ts-pkg create-package-json --public",
    "copy": "mkdir -p dist && cp LICENSE README.md dist",
    "clean:dist": "rimraf dist",
    "prebuild": "yarn clean:dist",
    "publish": "cd dist && yarn publish && yarn ts-pkg update-package-json -s dist/package.json -d package.json -f version"
  },
  "devDependencies": {
    "ts-pkg": "^0.1.0",
    "npm-run-all": "^4.1.5",
    "rimraf": "^3.0.2",
    "typescript": "^3.8.3"
  }
}
```

Running `build` will generate minified CommonJS, ES and TypeScript declaration bundles in `dist`, the transpiled source files in `dist/lib`, place an updated `package.json` in `dist` and copy `LICENSE` and `README.md` to `dist`. The `dist` directory is then be ready to be published using `yarn run publish`.

If you only want to publish the bundles, just remove the `compile` commands.

If you only want to publish the transpiled source files, remove the `bundle` command and update the referenced file and directory names.

## CLI Usage

This package exposes a CLI `ts-pkg-scripts` (with alias `ts-pkg`) that you can use to build TypeScript projects with zero configuration.

For a fully configured example of how to configure a build toolchain using `ts-pkg`, check out the [package.json](https://github.com/gfmio/ts-pkg-scripts/blob/master/package.json) of this project. The package is configured to compile itself by running on `ts-node`.

### Recommendations

You should have `noEmit: true` and `declaration: false` set in your `tsconfig.json` or else the commands may unexpectedly generate transpiled files and declarations.

The `private` field in the `package.json` should be set to `true` to prevent accidental publishing of the project directory and the source files.

### ts-pkg bundle

The `bundle` command uses `rollup` and `dts-bundle-generator` to bundle the `entrypoint` to various JS bundle types and a TypeScript declaration bundle.

For each type of bundle listed in the options, a new file is generated. If the path of the bundle is not provided, a default option is used (`<outDir>` is the `<outDir>` specified in `tsconfig.json` or if unset `./dist`, `<packageShortName>` is the package name from `package.json` without scope).

- For `--cjs`, the default is the `main` field in `package.json` or if unset `<outDir>/<packageShortName>.js`
- For `--es`, the default is the `module` field in `package.json` or if unset `<outDir>/<packageShortName>.mjs`
- For `--dts`, the default is the `types` field in `package.json` or if unset `<outDir>/<packageShortName>.d.ts`
- For `--umd`, the default is the `umd:main` field in `package.json` or if unset `<outDir>/<packageShortName>.umd.js`
- For `--amd`, the default is `<outDir>/<packageShortName>.amd.js`
- For `--iife`, the default is `<outDir>/<packageShortName>.iife.js`
- For `--system`, the default is `<outDir>/<packageShortName>.system.js`

For UMD bundles, the global name is by default the PascalCase of the `<packageShortName>`, i.e. for `ts-pkg-scripts` it would be `TsPkgScripts`.

The `package.json` and `tsconfig.json` are by default assumed to be in the current directory.

The entrypoint is by default assumed to be `src/index.ts` or `src/index.tsx`.

```txt
Usage: ts-pkg-scripts bundle [options]

Bundle the project

Options:
  --amd [path]            Build AMD bundle
  --cjs [path]            Build CommonJS bundle
  --dts [path]            Build TypeScript declaration bundle
  -c --config <path>      Path to the tsconfig.json file
  -e --entrypoint <path>  Entrypoint of the bundle
  --es [path]             Build ES bundle
  --iife [path]           Build IIFE bundle
  --min --minify          Minify bundles
  -p --package <path>     Path to the package.json file
  --system [path]         Build system bundle
  --umd [path]            Build UMD bundle
  --umd-name [name]       Name of the UMD bundle in the global namespace
  -h, --help              display help for command
```

### ts-pkg compile

The `compile` command uses `gulp` and `tsc` to build the project and optionally updates the extension of generated files. This is in particular useful to generate ES module files with the `.mjs` extension.

The input files or globs used by this command are the first of the following that is found and that contains at least one file or glob:

1. the arguments of the command (e.g. `ts-pkg compile myfile.ts "src/**/*.ts"`),
2. the files options (`-f`, `--file` or `--files`) to the command (e.g. `ts-pkg compile -f myfile.ts -f "src/**/*.ts`)
3. the include and exclude fields in `tsconfig.json`
4. the files field in `tsconfig.json`

The output directory can be set with `-o` or `--outDir` and is by default assumed to be the `outDir` in the `compilerOptions` of the `tsconfig.json` file or if unset `./dist`.

The `package.json` and `tsconfig.json` are by default assumed to be in the current directory.

You can choose to generate only declarations with `--dts`, set the module type with `-m` or `--module` and set the target environment with `-t` or `--target`. The `--cjs` option is a shorthand for `-m commonjs -t es5` and the `--es` option is a shorthand for `-m es2020 -t es2020`.

```txt
Usage: ts-pkg-scripts compile [options] [...files]

Compile the project

Options:
  -c --config <path>                Path to tsconfig.json
  --cjs                             Shorthand for compile to module CommonJS and target ES5
  --compilerOptions <json>          JSON string with tsconfig overrides
  --dts, --declarationOnly          Only generate type declarations
  --es                              Shorthand for compile to module ES2020 and target ES6
  -e --extension --ext <extension>  Set extension of generated files
  -f --files --file <file>          Set input files (default: [])
  -m --module <module>              Set compilation module type
  -o --outDir <path>                Output path for the generated files
  -t --target <target>              Set compilation target
  -h, --help                        display help for command
```

### ts-pkg create-package-json

The `create-package-json` command will read a `package.json`, create a copy in a different location, update all internal file references, set or unset the private field and filter out fields using a whitelist.

The input file can be specified with `-i` or `--input` and is by default `package.json` in the current directory.

The file will be written to the path specified with `--outFile` or otherwise to `<outDir>/package.json`, where `outDir` is the option specified with `--outDir`, the `outDir` field in the `compilerOptions` in the `tsconfig.json` in the current directory or otherwise `dist`.

The fields in the `package.json` that can reference other files by path are updated, so that the relative paths are still correct, e.g. if the `main` field of the original file is `dist/index.js` and the `outDir` is `dist`, the `main` field of the generated file will be `index.js`. The updated fields are `bin`, `directories`, `files`, `main`, `man`, `module`, `browser`, `types` and `umd:main`. If a field is an object, the paths in all the member fields are updated accordingly. If it is a list, all elements in the list will the updated.

The `--private`, `--public` and `--remove-private` fields will respectively set the `private` field in the generated file to `true`, `false` or remove the field. If none is specified, the original `private` field will be retained (if any).

The whitelisted fields are `author`, `bin`, `browser`, `bugs`, `bundledDependencies`, `bundleDependencies`, `contributors`, `cpu`, `dependencies`, `description`, `directories`, `dist`, `engines`, `engineStrict`, `files`, `homepage`, `keywords`, `license`, `main`, `maintainers`, `man`, `module`, `name`, `optionalDependencies`, `os`, `peerDependencies`, `private`, `publishConfig`, `readme`, `repository`, `resolutions`, `types`, `umd:main` and `version`.

```txt
Usage: ts-pkg-scripts create-package-json [options]

Creates a copy of a package.json and updates relative paths

Options:
  -i --input <file>   Input file
  -o --outDir <path>  Output directory
  --outFile <path>    Output file
  --private           Sets private = true in the package.json
  --public            Sets private = false in the package.json
  --remove-private    Removes the private field from the package.json
  -h, --help          display help for command
```

### ts-pkg update-package-json

The `update-package-json` command updates an existing `package.json` by removing fields, setting fields with values from another file or from an override JSON string.

The file that is being updated is set using `-d` or `--dest` and is by default set to `package.json` in the current directory.

If any fields are specified to be removed with `-r`, `--remove` or `--remove-field`, they are removed from the destination file.

If a source file is specified using `-s` or `--src`, any fields specified using `-f`, `--file` or `--files` that are present in the source file will be set in the destination file to the value in the source file.

If an override string is present, it is parsed as JSON and any fields in it will be set in the destination file.

```txt
Usage: ts-pkg-scripts update-package-json [options]

Removes or updates fields in a package.json from another package.json or overrides

Options:
  -d --dest <file>                    The destination file being updated
  -f --fields --field <field>         The field(s) to update in dest from src (if present in src) (default: [])
  -o --override <json>                The JSON string with properties to override in dest
  -r --remove --remove-field <field>  The field(s) to remove from dest (if present) (default: [])
  -s --src <file>                     The source file containing the fields used for the update
  -h, --help                          display help for command
```

## Library usage

You can also use `ts-pkg-scripts` as a library. It exposes the utility functions `bundle`, `bundleDeclarations`, `compile`, `compileDeclarationsOnly`, `movePackageJson` and `createPackageJson` as well as the `commander` objects and actions used to implement the CLI, if you want to extend the functionality.

## License

[MIT](LICENSE)
