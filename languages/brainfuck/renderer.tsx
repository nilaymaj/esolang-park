import { Card, Colors } from "@blueprintjs/core";
import { CSSProperties } from "react";
import { useDarkMode } from "../../ui/providers/dark-mode-provider";
import { RendererProps } from "../types";
import { BFRS, serializeTapeMap } from "./common";

// Colors used as background of active cells
const darkActiveBG = Colors.DARK_GRAY2;
const lightActiveBG = Colors.LIGHT_GRAY3;

const styles: { [k: string]: CSSProperties } = {
  container: {
    padding: 10,
    height: "100%",
    display: "flex",
    flexWrap: "wrap",
    alignContent: "flex-start",
    overflowY: "auto",
  },
  cell: {
    // Sizing
    width: "12%",
    height: "50px",
    margin: "5px 0.25%",
    // Center-align values
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};

/** Component for displaying a single tape cell */
const Cell = ({ value, active }: { value: number; active: boolean }) => {
  const { isDark } = useDarkMode();
  const cellStyle = { ...styles.cell };
  const activeBg = isDark ? darkActiveBG : lightActiveBG;
  if (active) {
    cellStyle.backgroundColor = activeBg;
    cellStyle.fontWeight = "bold";
  }
  return <Card style={cellStyle}>{value}</Card>;
};

/** Renderer for Brainfuck */
export const Renderer = ({ state }: RendererProps<BFRS>) => {
  return (
    <div style={styles.container}>
      {serializeTapeMap(state?.tape || {}).map((num, i) => (
        <Cell value={num} key={i} active={(state?.pointer || 0) === i} />
      ))}
    </div>
  );
};
