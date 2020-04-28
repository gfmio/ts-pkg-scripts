import { generateDtsBundle } from "dts-bundle-generator";
import { writeFileAsync, mkdirAsync } from "../utils/fs";
import * as path from "path";

export default async function bundleDeclarations(
  input: string,
  output: string,
  tsConfigPath?: string
) {
  const lines = generateDtsBundle(
    [
      {
        filePath: input,
      },
    ],
    { preferredConfigPath: tsConfigPath }
  );
  await mkdirAsync(path.dirname(output), { recursive: true });
  await writeFileAsync(output, lines.join("\n"));
}
