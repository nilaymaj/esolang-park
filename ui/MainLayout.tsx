import React from "react";
import { Mosaic, MosaicNode, MosaicWindow } from "react-mosaic-component";
import { Header } from "./header";
import { useDarkMode } from "./providers/dark-mode-provider";

// IDs of windows in the mosaic layout
type WINDOW_ID = "editor" | "renderer" | "input" | "output";

const WindowTitles = {
  editor: "Code Editor",
  renderer: "Visualization",
  input: "User Input",
  output: "Execution Output",
};

/**
 * Default layout of the mosaic. This must be defined outside of
 * the React component to persist layout adjustments by the user.
 */
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

type Props = {
  langId: string;
  langName: string;
  renderEditor: () => React.ReactNode;
  renderRenderer: () => React.ReactNode;
  renderInput: () => React.ReactNode;
  renderOutput: () => React.ReactNode;
  renderExecControls: () => React.ReactNode;
};

export const MainLayout = (props: Props) => {
  const { isDark } = useDarkMode();
  const mosaicClass = "mosaic-custom-theme" + (isDark ? " bp4-dark" : "");

  const MOSAIC_MAP = {
    editor: props.renderEditor,
    renderer: props.renderRenderer,
    input: props.renderInput,
    output: props.renderOutput,
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Header
        langId={props.langId}
        langName={props.langName}
        renderExecControls={props.renderExecControls}
      />
      <div style={{ flexGrow: 1 }}>
        <Mosaic<keyof typeof MOSAIC_MAP>
          className={mosaicClass}
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
      </div>
    </div>
  );
};
