import ExtendableError from "ts-error";

export default class MultipleErrors extends ExtendableError {
  constructor(errors: any[], message: string = "Multiple errors encountered:") {
    super(`${message}
        
${errors.map((error) => `${error}`).join("\n\n")}`);
  }
}
