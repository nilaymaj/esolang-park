import { Breadcrumbs } from "@blueprintjs/core";
import * as React from "react";
import { RendererProps } from "../../types";
import { ChefRS } from "../types";
import { KitchenDisplay } from "./kitchen-display";
import { BorderColor } from "./utils";

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
  callStackContainer: {
    borderBottom: "1px solid " + BorderColor,
    padding: "5px 10px",
  },
  kitchenContainer: {
    flex: 1,
    minHeight: 0,
  },
};

export const Renderer = ({ state }: RendererProps<ChefRS>) => {
  if (state == null)
    return (
      <div style={styles.placeholderDiv}>Run some code to see the kitchen!</div>
    );

  const crumbs = state.stack.map((name) => ({ text: name }));

  return (
    <div style={styles.rootContainer}>
      <div style={styles.callStackContainer}>
        <Breadcrumbs items={crumbs} />
      </div>
      <div style={styles.kitchenContainer}>
        <KitchenDisplay state={state.currentKitchen} />
      </div>
    </div>
  );
};
