import { Card, Colors, Icon, IconName } from "@blueprintjs/core";
import { RendererProps } from "../types";
import { Bfg93Direction, Bfg93RS } from "./constants";

/** Common border color for dark and light, using transparency */
export const BorderColor = Colors.GRAY3 + "55";

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
    width: "10%",
    height: "40px",
    margin: "5px 0.25%",
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

const StackItem = ({ value }: { value: number }) => {
  const cellStyle = { ...styles.stackItem };
  return <Card style={cellStyle}>{value}</Card>;
};

export const Renderer = ({ state }: RendererProps<Bfg93RS>) => {
  if (state == null)
    return <div style={styles.placeholderDiv}>Run some code...</div>;

  return (
    <div style={styles.rootContainer}>
      <div style={styles.dirnContainer}>
        <span style={{ fontWeight: "bold", marginRight: 5 }}>Direction: </span>
        <Icon icon={DirectionIcons[state.direction]} />
        {/* <span style={{ marginLeft: 10 }} /> */}
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
