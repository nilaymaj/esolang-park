import { CSSProperties } from "react";
import { RendererProps } from "../types";
import { BFRS } from "./constants";

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
    padding: 12,
    // Center-align values
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // Border and colors
    border: "1px solid gray",
    borderRadius: 5,
    background: "#394B59",
    color: "#E1E8ED",
  },
  activeCell: {
    background: "#CED9E0",
    color: "#182026",
  },
};

/** Component for displaying a single tape cell */
const Cell = ({ value, active }: { value: number; active: boolean }) => {
  const cellStyle = { ...styles.cell, ...(active ? styles.activeCell : {}) };
  return <div style={cellStyle}>{value}</div>;
};

/** Renderer for Brainfuck */
export const Renderer = ({ state }: RendererProps<BFRS>) => {
  /** Serialize tape from object format into linear array */
  const serializeTapeObj = (tape: BFRS["tape"]) => {
    const cellIdxs = Object.keys(tape).map((s) => parseInt(s, 10));
    const maxCellIdx = Math.max(15, ...cellIdxs);
    const linearTape = Array(maxCellIdx + 1).fill(0);
    cellIdxs.forEach((i) => (linearTape[i] = tape[i] || 0));
    return linearTape;
  };

  return (
    <div style={styles.container}>
      {serializeTapeObj(state?.tape || {}).map((num, i) => (
        <Cell value={num} key={i} active={(state?.pointer || 0) === i} />
      ))}
    </div>
  );
};
