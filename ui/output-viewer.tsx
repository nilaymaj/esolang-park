import React from "react";
import { Colors, Text } from "@blueprintjs/core";
import {
  WorkerParseError,
  WorkerRuntimeError,
} from "../languages/worker-errors";
import { DocumentRange } from "../languages/types";

/** Format a DocumentRange for displaying as output */
const formatRange = (range: DocumentRange): string => {
  if (range.endLine == null || range.endLine == range.startLine) {
    // `line 2, col 2-4` OR `line 2, col 3`
    const line = range.startLine + 1;
    const { startCol, endCol } = range;
    let cols: string | null = null;
    if (startCol != null && endCol != null)
      cols = `col ${startCol + 1}-${endCol + 1}`;
    else if (startCol != null) cols = `col ${startCol + 1}`;
    else if (endCol != null) cols = `col ${endCol + 1}`;
    return `line ${line}, ${cols}`;
  } else {
    // `lines 2:3 - 3:12` OR `lines 2-3:12` OR `lines 2-3`
    const { startLine, endLine, startCol, endCol } = range;
    const start =
      (startLine + 1).toString() +
      (startCol == null ? "" : ":" + (startCol + 1).toString());
    const end =
      (endLine + 1).toString() +
      (endCol == null ? "" : ":" + (endCol + 1).toString());
    return `lines ${start} - ${end}`;
  }
};

export interface OutputViewerRef {
  /** Reset output to show placeholder text */
  reset: () => void;
  /** Append string to the displayed output */
  append: (str?: string) => void;
  /** Add error text below the output text */
  setError: (error: WorkerRuntimeError | WorkerParseError | null) => void;
}

const OutputViewerComponent = (_: {}, ref: React.Ref<OutputViewerRef>) => {
  const [value, setValue] = React.useState<string | null>(null);
  const [error, setError] = React.useState<{
    header: string;
    message: string;
  } | null>(null);

  React.useImperativeHandle(ref, () => ({
    reset: () => {
      setValue(null);
      setError(null);
    },
    append: (s) => setValue((o) => (o || "") + (s || "")),
    setError: (error: WorkerRuntimeError | WorkerParseError | null) => {
      if (!error) setError(null);
      else if (error.name === "RuntimeError")
        setError({ header: "RuntimeError: ", message: error.message });
      else if (error.name === "ParseError")
        setError({
          header: "ParseError: " + formatRange(error.range),
          message: error.message,
        });
    },
  }));

  return (
    <div
      style={{ height: "100%", padding: 10, fontSize: 16, overflowY: "auto" }}
    >
      <pre
        style={{ margin: 0, whiteSpace: "pre-wrap", wordWrap: "break-word" }}
      >
        {value}
      </pre>
      {value && <div style={{ height: 10 }} />}
      {error != null && (
        <Text style={{ fontFamily: "monospace", color: Colors.RED3 }}>
          <p>{error.header}</p>
          <p>{error.message}</p>
        </Text>
      )}
    </div>
  );
};

export const OutputViewer = React.forwardRef(OutputViewerComponent);
