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
    <div style={{ height: "100%" }}>
      <TextArea
        fill
        large
        growVertically
        inputRef={textareaRef}
        readOnly={props.readOnly}
        placeholder="Enter program input here..."
        style={{
          resize: "none",
          boxShadow: "none",
          // BlueprintJS edits the element's height directly as px which leads
          // to overflow and underflow issues, so we 1-up it with our own weapons.
          maxHeight: "100%",
          minHeight: "100%",
        }}
      />
    </div>
  );
};

export const InputEditor = React.forwardRef(InputEditorComponent);
