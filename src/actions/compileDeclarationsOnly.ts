import { Settings } from "gulp-typescript";
import compile from "./compile";

export default function compileDeclarationsOnly(
  files: string | string[],
  compilerOptions: Settings,
  outDir: string
): Promise<void> {
  return compile(
    files,
    {
      ...compilerOptions,
      noEmit: false,
      emitDeclarationOnly: true,
      declaration: true,
      declarationDir: outDir,
      declarationMap: true,
    },
    outDir
  );
}
