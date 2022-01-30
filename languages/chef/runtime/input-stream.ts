import { RuntimeError } from "../../worker-errors";

/**
 * A barebones input stream implementation for consuming integers from a string.
 */
export default class InputStream {
  private _text: string;

  /** Create a new input stream loaded with the given input */
  constructor(text: string) {
    this._text = text;
  }

  /** Remove leading whitespace from the current input stream */
  private exhaustLeadingWhitespace(): void {
    const firstChar = this._text.trim()[0];
    const posn = this._text.search(firstChar);
    this._text = this._text.slice(posn);
  }

  /** Parse input stream for an integer */
  getNumber(): number {
    this.exhaustLeadingWhitespace();
    // The extra whitespace differentiates whether string is empty or all numbers.
    if (this._text === "") throw new RuntimeError("Unexpected end of input");
    let posn = this._text.search(/[^0-9]/);
    if (posn === 0)
      throw new RuntimeError(`Unexpected input character: '${this._text[0]}'`);
    if (posn === -1) posn = this._text.length;
    // Consume and parse numeric part
    const numStr = this._text.slice(0, posn);
    this._text = this._text.slice(posn);
    return parseInt(numStr, 10);
  }
}
