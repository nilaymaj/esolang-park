import * as React from "react";
import { WorkerParseError } from "../../engines/worker-errors";
import {
  createValidationMarker,
  EditorInstance,
  MonacoInstance,
} from "./monaco-utils";

/** Constant denoting "owner" of syntax error markers */
const MARKER_OWNER = "code-validation";

/** Delay between user's last edit and sending validation request */
const VALIDATE_DELAY = 500;

type Args = {
  editor: EditorInstance | null;
  monaco: MonacoInstance | null;
  onValidateCode: (code: string) => Promise<WorkerParseError | undefined>;
};

/**
 * React hook that sets up code validation lifecycle on the Monaco editor.
 * Code validation is done a fixed delay after user's last edit, and markers
 * for indicating syntax error are added to the editor.
 */
export const useCodeValidator = ({ editor, monaco, onValidateCode }: Args) => {
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const runValidator = async () => {
    if (!editor || !monaco) return;
    const error = await onValidateCode(editor.getValue());
    if (error)
      monaco.editor.setModelMarkers(editor.getModel()!, MARKER_OWNER, [
        createValidationMarker(monaco, error, error.range),
      ]);
  };

  React.useEffect(() => {
    if (!editor || !monaco) return;
    const disposer = editor.getModel()!.onDidChangeContent(() => {
      monaco.editor.setModelMarkers(editor.getModel()!, MARKER_OWNER, []);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(runValidator, VALIDATE_DELAY);
    });
    return () => disposer.dispose();
  }, [editor, monaco]);
};
