import React from "react";
import Editor from "@monaco-editor/react";
import { useEditorLanguageConfig } from "./use-editor-lang-config";
import { DocumentRange, MonacoTokensProvider } from "../../engines/types";
import {
  createHighlightRange,
  EditorInstance,
  MonacoInstance,
} from "./monaco-utils";
import { useEditorBreakpoints } from "./use-editor-breakpoints";
import darkTheme from "./themes/dark.json";
import lightTheme from "./themes/light.json";
import { useDarkMode } from "../providers/dark-mode-provider";
import { WorkerParseError } from "../../engines/worker-errors";
import { useCodeValidator } from "./use-code-validator";

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
  /** Set editor as read-only */
  readOnly?: boolean;
  /** Callback to validate code syntax */
  onValidateCode: (code: string) => Promise<WorkerParseError | undefined>;
  /** Callback to update debugging breakpoints */
  onUpdateBreakpoints: (newBreakpoints: number[]) => void;
};

/**
 * Wrapper around the Monaco editor that reveals
 * only the required functionality to the parent container.
 */
const CodeEditorComponent = (props: Props, ref: React.Ref<CodeEditorRef>) => {
  const [editor, setEditor] = React.useState<EditorInstance | null>(null);
  const [monaco, setMonaco] = React.useState<MonacoInstance | null>(null);
  const highlightRange = React.useRef<string[]>([]);
  const { isDark } = useDarkMode();

  // Breakpoints
  useEditorBreakpoints({
    editor,
    monaco,
    onUpdateBreakpoints: props.onUpdateBreakpoints,
  });

  // Language config
  useEditorLanguageConfig({
    languageId: props.languageId,
    tokensProvider: props.tokensProvider,
  });

  // Code validation
  useCodeValidator({
    editor,
    monaco,
    onValidateCode: props.onValidateCode,
  });

  /** Update code highlights */
  const updateHighlights = React.useCallback(
    (hl: DocumentRange | null) => {
      if (!editor) return;

      // Remove previous highlights
      const prevRange = highlightRange.current;
      editor.deltaDecorations(prevRange, []);

      // Add new highlights
      if (!hl) return;
      const newRange = createHighlightRange(monaco!, hl);
      const rangeStr = editor.deltaDecorations([], [newRange]);
      highlightRange.current = rangeStr;
    },
    [editor]
  );

  // Provide handle to parent for accessing editor contents
  React.useImperativeHandle(
    ref,
    () => ({
      getValue: () => editor!.getValue(),
      updateHighlights,
    }),
    [editor]
  );

  return (
    <Editor
      theme={isDark ? "ep-dark" : "ep-light"}
      defaultLanguage={props.languageId}
      defaultValue={props.defaultValue}
      beforeMount={(monaco) => {
        monaco.editor.defineTheme("ep-dark", darkTheme as any);
        monaco.editor.defineTheme("ep-light", lightTheme as any);
      }}
      onMount={(editor, monaco) => {
        if (!editor || !monaco) throw new Error("Error in initializing editor");
        setEditor(editor);
        setMonaco(monaco);
      }}
      options={{
        minimap: { enabled: false },
        glyphMargin: true,
        readOnly: props.readOnly,
      }}
    />
  );
};

export const CodeEditor = React.forwardRef(CodeEditorComponent);
