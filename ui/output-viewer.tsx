import React from "react";
import { Colors, Text } from "@blueprintjs/core";
import {
  WorkerParseError,
  WorkerRuntimeError,
} from "../languages/worker-errors";

/** Format a ParseError for displaying as output */
const formatParseError = (error: WorkerParseError): string => {
  const line = error.range.line + 1;
  const start = error.range.charRange?.start;
  const end = error.range.charRange?.end;
  let cols: string | null = null;
  if (start != null && end != null) cols = `col ${start + 1}-${end + 1}`;
  else if (start != null) cols = `col ${start + 1}`;
  else if (end != null) cols = `col ${end + 1}`;
  return `ParseError: line ${line}, ${cols}\n${error.message}`;
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
  const [error, setError] = React.useState<string | null>(null);

  React.useImperativeHandle(ref, () => ({
    reset: () => {
      setValue(null);
      setError(null);
    },
    append: (s) => setValue((o) => (o || "") + (s || "")),
    setError: (error: WorkerRuntimeError | WorkerParseError | null) => {
      if (!error) setError(null);
      else if (error.name === "RuntimeError")
        setError("RuntimeError: " + error.message);
      else if (error.name === "ParseError") setError(formatParseError(error));
    },
  }));

  return (
    <div style={{ padding: 10, fontSize: 16 }}>
      <pre
        style={{ margin: 0, whiteSpace: "pre-wrap", wordWrap: "break-word" }}
      >
        {value}
      </pre>
      {value && <div style={{ height: 10 }} />}
      <Text style={{ fontFamily: "monospace", color: Colors.RED3 }}>
        {error}
      </Text>
    </div>
  );
};

export const OutputViewer = React.forwardRef(OutputViewerComponent);
