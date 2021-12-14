import React from "react";
import { Mosaic, MosaicNode, MosaicWindow } from "react-mosaic-component";

// IDs of windows in the mosaic layout
type WINDOW_ID = "editor" | "renderer" | "input" | "output";

const WindowTitles = {
  editor: "Code Editor",
  renderer: "Visualization",
  input: "User Input",
  output: "Execution Output",
};

type Props = {
  renderEditor: () => React.ReactNode;
  renderRenderer: () => React.ReactNode;
  renderInput: () => React.ReactNode;
  renderOutput: () => React.ReactNode;
};

export const MainLayout = (props: Props) => {
  const MOSAIC_MAP = {
    editor: props.renderEditor,
    renderer: props.renderRenderer,
    input: props.renderInput,
    output: props.renderOutput,
  };

  const INITIAL_LAYOUT: MosaicNode<WINDOW_ID> = {
    direction: "row",
    first: "editor",
    second: {
      direction: "column",
      first: "renderer",
      second: {
        direction: "row",
        first: "input",
        second: "output",
      },
    },
  };

  return (
    <Mosaic<keyof typeof MOSAIC_MAP>
      className="mosaic-blueprint-theme bp3-dark"
      initialValue={INITIAL_LAYOUT}
      renderTile={(windowId, path) => (
        <MosaicWindow<number>
          path={path}
          title={WindowTitles[windowId]}
          toolbarControls={<span />}
        >
          {MOSAIC_MAP[windowId]()}
        </MosaicWindow>
      )}
    />
  );
};
