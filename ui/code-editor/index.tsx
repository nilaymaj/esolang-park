import React from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useEditorLanguageConfig } from "./use-editor-lang-config";
import { DocumentRange, MonacoTokensProvider } from "../../engines/types";
import { createHighlightRange, EditorInstance } from "./monaco-utils";
import { useEditorBreakpoints } from "./use-editor-breakpoints";

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
  /** Callback to update debugging breakpoints */
  onUpdateBreakpoints: (newBreakpoints: number[]) => void;
};

/**
 * Wrapper around the Monaco editor that reveals
 * only the required functionality to the parent container.
 */
const CodeEditorComponent = (props: Props, ref: React.Ref<CodeEditorRef>) => {
  const editorRef = React.useRef<EditorInstance | null>(null);
  const monacoInstance = useMonaco();
  const { highlights } = props;

  // Breakpoints
  useEditorBreakpoints({
    editor: editorRef.current,
    monaco: monacoInstance,
    onUpdateBreakpoints: props.onUpdateBreakpoints,
  });

  // Language config
  useEditorLanguageConfig({
    languageId: props.languageId,
    tokensProvider: props.tokensProvider,
  });

  // Change editor highlights when prop changes
  React.useEffect(() => {
    if (!editorRef.current || !highlights) return;
    const range = createHighlightRange(monacoInstance!, highlights);
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
      options={{ minimap: { enabled: false }, glyphMargin: true }}
    />
  );
};

export const CodeEditor = React.forwardRef(CodeEditorComponent);
