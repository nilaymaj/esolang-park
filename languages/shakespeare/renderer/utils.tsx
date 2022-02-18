import { Colors } from "@blueprintjs/core";
import { useDarkMode } from "../../../ui/providers/dark-mode-provider";

const backgroundColorsLight = {
  success: Colors.GREEN3,
  danger: Colors.RED3,
  plain: Colors.GRAY3,
  active: Colors.DARK_GRAY1,
};

const backgroundColorsDark = {
  success: Colors.GREEN3,
  danger: Colors.RED3,
  plain: Colors.GRAY3,
  active: Colors.LIGHT_GRAY5,
};

const foregroundColorsLight = {
  success: Colors.GREEN2,
  danger: Colors.RED2,
  plain: Colors.DARK_GRAY1,
  active: Colors.LIGHT_GRAY5,
};

const foregroundColorsDark = {
  success: Colors.GREEN5,
  danger: Colors.RED5,
  plain: Colors.LIGHT_GRAY5,
  active: Colors.DARK_GRAY1,
};

/**
 * Utility component that renders a tag similar to BlueprintJS tags, but underneath
 * is just a single span tag with no frills and high performance.
 */
export const SimpleTag = (props: {
  children: React.ReactNode;
  intent?: "success" | "danger" | "active";
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
        backgroundColor:
          backgroundMap[intent] + (intent === "active" ? "aa" : "55"),
        color: foregroundMap[intent],
      }}
    >
      {props.children}
    </span>
  );
};
