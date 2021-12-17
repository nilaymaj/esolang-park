import React from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useEditorLanguageConfig } from "./use-editor-lang-config";
import { DocumentRange, MonacoTokensProvider } from "../../engines/types";
import { createHighlightRange, EditorInstance } from "./monaco-utils";
import { useEditorBreakpoints } from "./use-editor-breakpoints";

// Interface for interacting with the editor
export interface CodeEditorRef {
  /** Get the current text content of the editor */
  getValue: () => string;
  /** Update code highlights */
  updateHighlights: (highlights: DocumentRange | null) => void;
}

type Props = {
  /** ID of the active language */
  languageId: string;
  /** Default code to display in editor */
  defaultValue: string;
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
  const highlightRange = React.useRef<string[]>([]);
  const monacoInstance = useMonaco();

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

  /** Update code highlights */
  const updateHighlights = React.useCallback(
    (hl: DocumentRange | null) => {
      // Remove previous highlights
      const prevRange = highlightRange.current;
      editorRef.current!.deltaDecorations(prevRange, []);

      // Add new highlights
      if (!hl) return;
      const newRange = createHighlightRange(monacoInstance!, hl);
      const rangeStr = editorRef.current!.deltaDecorations([], [newRange]);
      highlightRange.current = rangeStr;
    },
    [monacoInstance]
  );

  // Provide handle to parent for accessing editor contents
  React.useImperativeHandle(
    ref,
    () => ({
      getValue: () => editorRef.current!.getValue(),
      updateHighlights,
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
