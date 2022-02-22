import { CSSProperties } from "react";
import { Colors } from "@blueprintjs/core";
import { useDarkMode } from "../ui/providers/dark-mode-provider";

const backgroundColorsLight = {
  success: Colors.GREEN5,
  danger: Colors.RED5,
  plain: Colors.LIGHT_GRAY1,
  active: Colors.GRAY4,
};

const backgroundColorsDark = {
  success: Colors.GREEN1,
  danger: Colors.RED1,
  plain: Colors.DARK_GRAY5,
  active: Colors.GRAY1,
};

const foregroundColorsLight = {
  success: Colors.GREEN1,
  danger: Colors.RED1,
  plain: Colors.DARK_GRAY1,
  active: Colors.DARK_GRAY1,
};

const foregroundColorsDark = {
  success: Colors.GREEN5,
  danger: Colors.RED5,
  plain: Colors.LIGHT_GRAY5,
  active: Colors.LIGHT_GRAY5,
};

/**
 * Utility component for rendering a simple general-purpose stylable box. Useful
 * for performance-critical components in visualisation renderers.
 */
export const Box = (props: {
  children: React.ReactNode;
  intent?: "plain" | "success" | "danger" | "active";
  style?: CSSProperties;
}) => {
  const { isDark } = useDarkMode();
  const intent = props.intent == null ? "plain" : props.intent;
  const backgroundMap = isDark ? backgroundColorsDark : backgroundColorsLight;
  const foregroundMap = isDark ? foregroundColorsDark : foregroundColorsLight;

  return (
    <span
      style={{
        display: "inline-flex",
        margin: 5,
        padding: "5px 10px",
        borderRadius: 3,
        backgroundColor: backgroundMap[intent],
        color: foregroundMap[intent],
        ...props.style,
      }}
    >
      {props.children}
    </span>
  );
};
