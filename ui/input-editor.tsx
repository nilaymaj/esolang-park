import React from "react";
import { TextArea } from "@blueprintjs/core";

// Interface for interacting with the editor
export interface InputEditorRef {
  /**
   * Get the current text content of the editor.
   */
  getValue: () => string;
}

/**
 * A very simple text editor for user input
 */
const InputEditorComponent = (
  props: { readOnly?: boolean },
  ref: React.Ref<InputEditorRef>
) => {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useImperativeHandle(
    ref,
    () => ({
      getValue: () => textareaRef.current!.value,
    }),
    []
  );

  return (
    <TextArea
      fill
      large
      growVertically
      inputRef={textareaRef}
      readOnly={props.readOnly}
      placeholder="Enter program input here..."
      style={{ height: "100%", resize: "none", boxShadow: "none" }}
    />
  );
};

export const InputEditor = React.forwardRef(InputEditorComponent);
