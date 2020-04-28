import { rollup, RollupOptions } from "rollup";

export default async function bundle(...rollupOptions: RollupOptions[]) {
  for (const opts of rollupOptions) {
    if (!opts.output) {
      continue;
    }
    const build = await rollup(opts);
    const outputs = Array.isArray(opts.output) ? opts.output : [opts.output];
    for (const output of outputs) {
      await build.write(output!);
    }
  }
}
