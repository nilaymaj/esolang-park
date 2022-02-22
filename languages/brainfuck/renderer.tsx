import * as React from "react";
import { RendererProps } from "../types";
import { Box } from "../ui-utils";
import { BFRS, serializeTapeMap } from "./common";

/** Number of cells shown in a single row */
const ROWSIZE = 8;

// Parameters for cell sizing, balanced to span the full row width
// Constraint: `(width% + 2 * margin%) * ROWSIZE = 100%`
const CELL_WIDTH = "12%";
const CELL_MARGIN = "5px 0.25%";

const styles: { [k: string]: React.CSSProperties } = {
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
    width: CELL_WIDTH,
    margin: CELL_MARGIN,
    height: "50px",
    // Center-align values
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};

/** Component for displaying a single tape cell */
const Cell = React.memo(
  ({ value, active }: { value: number; active: boolean }) => {
    return (
      <Box
        intent={active ? "active" : "plain"}
        style={{ ...styles.cell, fontWeight: active ? "bold" : undefined }}
      >
        {value}
      </Box>
    );
  }
);

/** Renderer for Brainfuck */
export const Renderer = ({ state }: RendererProps<BFRS>) => {
  return (
    <div style={styles.container}>
      {serializeTapeMap(state?.tape || {}, 2 * ROWSIZE).map((num, i) => (
        <Cell value={num} key={i} active={(state?.pointer || 0) === i} />
      ))}
    </div>
  );
};
