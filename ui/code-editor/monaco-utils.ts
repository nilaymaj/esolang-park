import monaco from "monaco-editor";
import { DocumentRange } from "../../engines/types";
import { WorkerParseError } from "../../engines/worker-errors";

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
  const lineNum = location.line;
  const startChar = location.charRange?.start || 0;
  const endChar = location.charRange?.end || 1e5;
  const range = new monacoInstance.Range(lineNum, startChar, lineNum, endChar);
  const isWholeLine = !location.charRange;
  return { range, options: { isWholeLine, inlineClassName: "code-highlight" } };
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
  return {
    startLineNumber: location.line,
    endLineNumber: location.line,
    startColumn: location.charRange?.start || 0,
    endColumn: location.charRange?.end || 1000,
    severity: monacoInstance.MarkerSeverity.Error,
    message: error.message,
    source: error.name,
  };
};

/**
 * Convert a DocumentRange to use 1-indexed values. Used since language engines
 * use 0-indexed ranges but Monaco requires 1-indexed ranges.
 * @param range DocumentRange to convert to 1-indexed
 * @returns DocumentRange that uses 1-indexed values
 */
const get1IndexedLocation = (range: DocumentRange): DocumentRange => {
  const lineNum = range.line + 1;
  const charRange = range.charRange
    ? {
        start: range.charRange.start ? range.charRange.start + 1 : undefined,
        end: range.charRange.end ? range.charRange.end + 1 : undefined,
      }
    : undefined;
  return { line: lineNum, charRange };
};
