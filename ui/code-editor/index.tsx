import React from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import monaco from "monaco-editor";
import { DocumentRange, MonacoTokensProvider } from "../../engines/types";
import { useEditorConfig } from "./use-editor-config";

// Type aliases for the Monaco editor
type EditorInstance = monaco.editor.IStandaloneCodeEditor;

/** Create Monaco decoration range object from highlights */
const createRange = (
  monacoInstance: typeof monaco,
  highlights: DocumentRange
) => {
  const lineNum = highlights.line;
  const startChar = highlights.charRange?.start || 0;
  const endChar = highlights.charRange?.end || 1000;
  const range = new monacoInstance.Range(lineNum, startChar, lineNum, endChar);
  const isWholeLine = !highlights.charRange;
  return { range, options: { isWholeLine, inlineClassName: "code-highlight" } };
};

// Interface for interacting with the editor
export interface CodeEditorRef {
  /**
   * Get the current text content of the editor.
   */
  getValue: () => string;
}

type Props = {
  /** ID of the active language */
  languageId: string;
  /** Default code to display in editor */
  defaultValue: string;
  /** Code range to highlight in the editor */
  highlights?: DocumentRange;
  /** Tokens provider for the language */
  tokensProvider?: MonacoTokensProvider;
};

/**
 * Wrapper around the Monaco editor that reveals
 * only the required functionality to the parent container.
 */
const CodeEditorComponent = (props: Props, ref: React.Ref<CodeEditorRef>) => {
  const editorRef = React.useRef<EditorInstance | null>(null);
  const monacoInstance = useMonaco();
  const { highlights } = props;
  useEditorConfig({
    languageId: props.languageId,
    tokensProvider: props.tokensProvider,
  });

  // Change editor highlights when prop changes
  React.useEffect(() => {
    if (!editorRef.current || !highlights) return;
    const range = createRange(monacoInstance!, highlights);
    const decors = editorRef.current!.deltaDecorations([], [range]);
    return () => {
      editorRef.current!.deltaDecorations(decors, []);
    };
  }, [highlights]);

  // Provide handle to parent for accessing editor contents
  React.useImperativeHandle(
    ref,
    () => ({
      getValue: () => editorRef.current!.getValue(),
    }),
    []
  );

  return (
    <Editor
      theme="vs-dark"
      defaultLanguage="brainfuck"
      defaultValue={props.defaultValue}
      onMount={(editor) => (editorRef.current = editor)}
      options={{ minimap: { enabled: false } }}
    />
  );
};

export const CodeEditor = React.forwardRef(CodeEditorComponent);
