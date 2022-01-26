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
    this.name = "ParseError";
    this.range = range;
  }
}

/**
 * Special error class, to be thrown when encountering an error
 * at runtime that is indicative of a bug in the user's program.
 */
export class RuntimeError extends Error {
  /**
   * Create an instance of RuntimeError
   * @param message Error message
   */
  constructor(message: string) {
    super(message);
    this.name = "RuntimeError";
  }
}

/** Check if an error object is instance of a ParseError */
export const isParseError = (error: any): error is ParseError => {
  return error instanceof ParseError || error.name === "ParseError";
};

/** Check if an error object is instance of a RuntimeError */
export const isRuntimeError = (error: any): error is RuntimeError => {
  return error instanceof RuntimeError || error.name === "RuntimeError";
};

/** Error sent by worker in case of parsing error */
export type WorkerParseError = {
  name: "ParseError";
  message: string;
  range: DocumentRange;
};

/** Error sent by worker in case error at runtime */
export type WorkerRuntimeError = {
  name: "RuntimeError";
  message: string;
};

/** Error sent by worker indicating an implementation bug */
export type WorkerError = {
  name: string;
  message: string;
  stack?: string;
};

/** Serialize a RuntimeError instance into a plain object */
export const serializeRuntimeError = (
  error: RuntimeError
): WorkerRuntimeError => {
  return { name: "RuntimeError", message: error.message };
};

/** Serialize a ParseError instance into a plain object */
export const serializeParseError = (error: ParseError): WorkerParseError => {
  return { name: "ParseError", message: error.message, range: error.range };
};

/** Serialize an arbitrary error into a plain object */
export const serializeError = (error: Error): WorkerError => {
  return { name: error.name, message: error.message, stack: error.stack };
};
