import { RendererProps } from "../types";
import { DFRS } from "./constants";

const styles = {
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: "4em",
  },
};

export const Renderer = ({ state }: RendererProps<DFRS>) => {
  const value = state == null ? 0 : state.value;
  return (
    <div style={styles.container}>
      <h1 style={styles.text}>{value}</h1>
    </div>
  );
};
