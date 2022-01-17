import { DocumentRange } from "./types";

/**
 * Special error class, to be thrown when encountering a
 * syntax error while parsing a program.
 */
export class ParseError extends Error {
  /** Location of syntax error in the program */
  range: DocumentRange;

  /**
   * Create an instance of ParseError
   * @param message Error message
   * @param range Location of syntactically incorrect code
   */
  constructor(message: string, range: DocumentRange) {
    super(message);
    this.range = range;
    this.name = "ParseError";
  }
}

/**
 * Special error class, to be thrown when something happens
 * that is indicative of a bug in the language implementation.
 */
export class UnexpectedError extends Error {
  /** Create an instance of UnexpectedError */
  constructor() {
    super("Something unexpected occured");
    this.name = "UnexpectedError";
  }
}
