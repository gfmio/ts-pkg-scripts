import commander from "commander";
import bundle from "./commands/bundle";
import compile from "./commands/compile";
import createPackageJson from "./commands/create-package-json";
import updatePackageJson from "./commands/update-package-json";

const program = new commander.Command()
  .storeOptionsAsProperties(true)
  .passCommandToAction(true)
  .action((cmd) => cmd.help())
  .addCommand(bundle)
  .addCommand(compile)
  .addCommand(createPackageJson)
  .addCommand(updatePackageJson);

export default program;
