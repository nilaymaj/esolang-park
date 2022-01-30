/**
 * For given ASCII code, returns character that is safe to insert into code.
 *
 * This is useful for self-modifying programs that may insert non-printable characters into
 * the source code at runtime. Characters like `\n`, `\r` and `Tab` distort the grid visually
 * in the code editor. This function replaces such characters with safely printable alts. Other
 * control characters will be safely rendered by the code editor.
 *
 * @param asciiVal ASCII value to get safe character for
 * @returns Character safe to print without distorting code
 */
export const toSafePrintableChar = (asciiVal: number): string => {
  // "\n" -> "⤶"
  if (asciiVal === 10) return "\u21b5";
  // "\r" -> "␍"
  else if (asciiVal === 13) return "\u240d";
  // Tab -> "⇆"
  else if (asciiVal === 9) return "\u21c6";
  else return String.fromCharCode(asciiVal);
};
