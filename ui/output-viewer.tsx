import { TextArea } from "@blueprintjs/core";

/**
 * For aesthetic reasons, we use readonly textarea for displaying output.
 * Textarea displays placeholder if value passed is empty string, which is undesired.
 * This function is a fake-whitespace workaround.
 *
 * @param value Value received from parent. Placeholder shown on `null`.
 * @returns Value to pass as prop to Blueprint TextArea
 */
const toTextareaValue = (value: string | null): string | undefined => {
  if (value == null) return undefined; // Placeholder shown
  if (value === "") return "\u0020"; // Fake whitespace to hide placeholder
  return value; // Non-empty output value
};

type Props = {
  value: string | null;
};

export const OutputViewer = ({ value }: Props) => {
  return (
    <TextArea
      fill
      large
      readOnly
      growVertically
      value={toTextareaValue(value)}
      placeholder="Run code to see output..."
      style={{ height: "100%", resize: "none", boxShadow: "none" }}
    />
  );
};
