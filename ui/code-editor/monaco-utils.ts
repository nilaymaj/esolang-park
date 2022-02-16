import monaco from "monaco-editor";
import { DocumentEdit, DocumentRange } from "../../languages/types";
import { WorkerParseError } from "../../languages/worker-errors";

/** Type alias for an instance of Monaco editor */
export type EditorInstance = monaco.editor.IStandaloneCodeEditor;

/** Type alias for the Monaco global */
export type MonacoInstance = typeof monaco;

/** Type alias for Monaco mouse events */
export type MonacoMouseEvent = monaco.editor.IEditorMouseEvent;

/** Type alias for Monaco mouse-leave event */
export type MonacoMouseLeaveEvent = monaco.editor.IPartialEditorMouseEvent;

/** Type alias for Monaco decoration object */
export type MonacoDecoration = monaco.editor.IModelDeltaDecoration;

/** Create Monaco decoration range object for text highlighting */
export const createHighlightRange = (
  monacoInstance: MonacoInstance,
  highlights: DocumentRange
): MonacoDecoration => {
  const location = get1IndexedLocation(highlights);
  let { startLine, endLine, startCol, endCol } = location;
  const range = new monacoInstance.Range(
    startLine,
    startCol == null ? 1 : startCol,
    endLine == null ? startLine : endLine,
    endCol == null ? Infinity : endCol
  );
  // const isWholeLine = startCol == null && endCol == null;
  return { range, options: { inlineClassName: "code-highlight" } };
};

/** Create Monaco decoration range object from highlights */
export const createBreakpointRange = (
  monacoInstance: MonacoInstance,
  lineNum: number,
  hint?: boolean
): MonacoDecoration => {
  const range = new monacoInstance.Range(lineNum, 0, lineNum, 1000);
  const className = "breakpoint-glyph " + (hint ? "hint" : "solid");
  return { range, options: { glyphMarginClassName: className } };
};

/** Create Monaco syntax-error marker from message and document range */
export const createValidationMarker = (
  monacoInstance: MonacoInstance,
  error: WorkerParseError,
  range: DocumentRange
): monaco.editor.IMarkerData => {
  const location = get1IndexedLocation(range);
  const { startLine, endLine, startCol, endCol } = location;
  return {
    startLineNumber: startLine,
    endLineNumber: endLine == null ? startLine : endLine,
    startColumn: startCol == null ? 1 : startCol,
    endColumn: endCol == null ? Infinity : endCol,
    severity: monacoInstance.MarkerSeverity.Error,
    message: error.message,
    source: error.name,
  };
};

/**
 * Convert a DocumentEdit instance to Monaco edit object format.
 * @param edit DocumentEdit to convert to Monaco format
 * @returns Instance of Monaco's edit object
 */
export const createMonacoDocEdit = (
  edit: DocumentEdit
): monaco.editor.IIdentifiedSingleEditOperation => {
  const location = get1IndexedLocation(edit.range);
  const { startLine, endLine, startCol, endCol } = location;
  return {
    text: edit.text,
    range: {
      startLineNumber: startLine,
      endLineNumber: endLine == null ? startLine : endLine,
      startColumn: startCol == null ? 1 : startCol,
      endColumn: endCol == null ? Infinity : endCol,
    },
  };
};

/**
 * Convert a DocumentRange to use 1-indexed values. Used since language engines
 * use 0-indexed ranges but Monaco requires 1-indexed ranges.
 * @param range DocumentRange to convert to 1-indexed
 * @returns DocumentRange that uses 1-indexed values
 */
const get1IndexedLocation = (range: DocumentRange): DocumentRange => {
  return {
    startLine: range.startLine + 1,
    startCol: range.startCol == null ? 1 : range.startCol + 1,
    endLine: range.endLine == null ? range.startLine + 1 : range.endLine + 1,
    endCol: range.endCol == null ? Infinity : range.endCol + 1,
  };
};
