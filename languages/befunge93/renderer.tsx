import * as React from "react";
import { Colors, Icon, IconName } from "@blueprintjs/core";
import { RendererProps } from "../types";
import { Box } from "../ui-utils";
import { Bfg93Direction, Bfg93RS } from "./constants";

/** Common border color for dark and light, using transparency */
export const BorderColor = Colors.GRAY3 + "55";

// Parameters for cell sizing, balanced to span the full row width
// Constraint: `(width% + 2 * margin%) * ROWSIZE = 100%`
const ROWSIZE = 8;
const CELL_WIDTH = "12%";
const CELL_MARGIN = "5px 0.25%";

const styles = {
  placeholderDiv: {
    height: "100%",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "1.2em",
  },
  rootContainer: {
    height: "100%",
    display: "flex",
    flexDirection: "column" as "column",
  },
  dirnContainer: {
    borderBottom: "1px solid " + BorderColor,
    padding: "5px 10px",
  },
  stackContainer: {
    padding: 10,
    height: "100%",
    display: "flex",
    flexWrap: "wrap" as "wrap",
    alignContent: "flex-start",
    overflowY: "auto" as "auto",
  },
  stackItem: {
    // Sizing
    width: CELL_WIDTH,
    margin: CELL_MARGIN,
    height: "50px",
    // Center-align values
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};

const DirectionIcons: { [k: string]: IconName } = {
  [Bfg93Direction.RIGHT]: "arrow-right",
  [Bfg93Direction.LEFT]: "arrow-left",
  [Bfg93Direction.UP]: "arrow-up",
  [Bfg93Direction.DOWN]: "arrow-down",
};

/** Component for displaying a single stack item */
const StackItem = React.memo(({ value }: { value: number }) => {
  return <Box style={styles.stackItem}>{value}</Box>;
});

export const Renderer = ({ state }: RendererProps<Bfg93RS>) => {
  if (state == null)
    return <div style={styles.placeholderDiv}>Run some code...</div>;

  return (
    <div style={styles.rootContainer}>
      <div style={styles.dirnContainer}>
        <span style={{ fontWeight: "bold", marginRight: 5 }}>Direction: </span>
        <Icon icon={DirectionIcons[state.direction]} />
        <span style={{ marginLeft: 30, fontWeight: "bold", marginRight: 5 }}>
          String mode:{" "}
        </span>
        {state.strMode ? "ON" : "OFF"}
      </div>
      <div style={styles.stackContainer}>
        {state.stack.map((value, idx) => (
          <StackItem key={idx} value={value} />
        ))}
      </div>
    </div>
  );
};
