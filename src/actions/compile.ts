import { dest, src } from "gulp";
import sourcemaps from "gulp-sourcemaps";
import ts, { Settings } from "gulp-typescript";
import gulpif from "gulp-if";
import fileEndsIn from "../utils/fileEndsIn";
import rename from "gulp-rename";
import resolveStream from "../utils/resolveStream";

/** Compiles TypeScript `files` using `compilerOptions` and writes them with a new `ext`  */
export default async function compile(
  files: string | string[],
  compilerOptions: Settings,
  outputPath: string,
  extension?: string | undefined
): Promise<void> {
  const shouldGenerateSourceMap =
    !!compilerOptions.sourceMap || !!compilerOptions.inlineSourceMap;

  const stream = src(files)
    // Initialize source maps
    .pipe(gulpif(shouldGenerateSourceMap, sourcemaps.init()))
    // Compile TypeScript
    .pipe(ts(compilerOptions))
    // Generate source maps
    .pipe(
      gulpif(
        shouldGenerateSourceMap,
        sourcemaps.write(compilerOptions.inlineSourceMap ? undefined : ".")
      )
    )
    // Change extension (if desired, e.g. to .mjs)
    .pipe(
      gulpif(
        (file) => !!extension && !fileEndsIn(extension, file),
        rename({ extname: extension })
      )
    )
    // Write to disk
    .pipe(dest(outputPath));

  await resolveStream(stream);
}
