import commander from "commander";
import bundle from "./commands/bundle";
import compile from "./commands/compile";
import packageJson from "./commands/package-json";

const program = new commander.Command()
  .storeOptionsAsProperties(true)
  .passCommandToAction(true)
  .action((cmd) => cmd.help())
  .addCommand(bundle)
  .addCommand(compile)
  .addCommand(packageJson);

export default program;
