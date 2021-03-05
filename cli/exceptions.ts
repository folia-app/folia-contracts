export class CLIError extends Error {
  constructor(m: string) {
    super(m);
    Object.setPrototypeOf(this, CLIError.prototype);
  }
}
