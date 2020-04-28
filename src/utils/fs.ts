import { readFile, writeFile, exists, mkdir, rmdir, unlink } from "fs";
import { promisify } from "util";

export const readFileAsync = promisify(readFile);
export const writeFileAsync = promisify(writeFile);
export const unlinkAsync = promisify(unlink);
export const existsAsync = promisify(exists);
export const mkdirAsync = promisify(mkdir);
export const rmdirAsync = promisify(rmdir);
