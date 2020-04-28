import program from "./program";

const main = async () => {
  try {
    await program.parseAsync(process.argv);
  } catch (e) {
    console.error(e);
  }
};

export default main;
