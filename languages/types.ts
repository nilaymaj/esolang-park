import monaco from "monaco-editor";
import React from "react";

/**
 * Type denoting a contiguous range of text in document.
 * All fields must be zero-indexed.
 */
export type DocumentRange = {
  /** Line number on which the range starts */
  startLine: number;
  /**
   * Column number on which the range starts.
   * Omit to make the range start at the beginning of the line.
   */
  startCol?: number;
  /**
   * Line number on which the range ends.
   * Omit to make the range end on the starting line.
   */
  endLine?: number;
  /**
   * Column number on which the range ends.
   * Omit to make the range end at the end of the line.
   */
  endCol?: number;
};

/** Type denoting a document edit */
export type DocumentEdit = {
  /** Range to replace with the given text. Keep empty to insert text */
  range: DocumentRange;
  /** Text to replace the given range with */
  text: string;
};

/** Source code token provider for the language, specific to Monaco */
export type MonacoTokensProvider = monaco.languages.IMonarchLanguage;

/** Type alias for props passed to renderer */
export type RendererProps<RS> = { state: RS | null };

/**
 * Type alias for the result of engine executing a single step.
 */
export type StepExecutionResult<RS> = {
  /** New props to be passed to the renderer */
  rendererState: RS;

  /** String to write to program output */
  output?: string;

  /** Self-modifying programs: edit to apply on code */
  codeEdits?: DocumentEdit[];

  /**
   * Used to highlight next line to be executed in the editor.
   * Passing `null` indicates reaching the end of program.
   */
  nextStepLocation: DocumentRange | null;

  /** Signal if execution has been paused */
  signal?: "paused";
};

/**
 * Language engine is responsible for providing
 * execution and debugging API to the platform.
 */
export interface LanguageEngine<RS> {
  /** Validate the syntax of the given code. Throw ParseError if any */
  validateCode: (code: string) => void;

  /** Load code and user input into the engine and prepare for execution */
  prepare: (code: string, input: string) => void;

  /** Perform a single step of code execution */
  executeStep: () => StepExecutionResult<RS>;

  /** Reset all state to prepare for new cycle */
  resetState: () => void;
}

/**
 * Language provider provides all language-specific
 * functionality to the platform.
 */
export interface LanguageProvider<RS> {
  /** Monaco-specific tokenizer for syntax highlighting */
  editorTokensProvider?: MonacoTokensProvider;

  /** Monaco-specific autocomplete provider */
  autocompleteProvider?: any;

  /** Sample code sample for the language */
  sampleProgram: string;

  /** React component for visualising runtime state */
  Renderer: React.FC<RendererProps<RS>>;
}
