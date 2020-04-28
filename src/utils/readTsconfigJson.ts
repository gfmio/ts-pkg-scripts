import { parse, ParseError } from "jsonc-parser";
import * as path from "path";
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile } from "@schemastore/tsconfig";
import { readFileAsync } from "./fs";
import MultipleErrors from "./MultipleErrors";

export interface TsConfigJsonProps {
  path: string;
  data: JSONSchemaForTheTypeScriptCompilerSConfigurationFile;
}

export default async function readTsConfigJson(
  aPath?: string
): Promise<TsConfigJsonProps> {
  const TsConfigJsonPath = path.resolve(
    aPath || path.join(process.cwd(), "tsconfig.json")
  );
  const errors: ParseError[] = [];
  const TsConfigJson = parse(
    await readFileAsync(TsConfigJsonPath, { encoding: "utf-8" }),
    errors,
    { allowTrailingComma: true }
  );
  if (errors.length > 0) {
    throw new MultipleErrors(
      errors,
      "Encountered errors while parsing tsconfig.json"
    );
  }
  return {
    path: TsConfigJsonPath,
    data: TsConfigJson,
  };
}
