import monaco from "monaco-editor";
import { DocumentRange } from "../../engines/types";

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
  const lineNum = highlights.line;
  const startChar = highlights.charRange?.start || 0;
  const endChar = highlights.charRange?.end || 1000;
  const range = new monacoInstance.Range(lineNum, startChar, lineNum, endChar);
  const isWholeLine = !highlights.charRange;
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
