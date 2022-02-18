import { Colors } from "@blueprintjs/core";
import { RendererProps } from "../../types";
import { RS } from "../common";
import { CharacterRow } from "./character-row";
import { TopBar } from "./topbar";

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
  topBarContainer: {
    borderBottom: "1px solid " + BorderColor,
    padding: 10,
  },
  mainContainer: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto" as "auto",
  },
};

export const Renderer = ({ state }: RendererProps<RS>) => {
  if (state == null)
    return (
      <div style={styles.placeholderDiv}>Run some code to see the stage!</div>
    );

  return (
    <div style={styles.rootContainer}>
      <div style={styles.topBarContainer}>
        <TopBar
          charactersOnStage={state.charactersOnStage}
          currSpeaker={state.currentSpeaker}
          questionState={state.questionState}
        />
      </div>
      <div style={styles.mainContainer}>
        {Object.keys(state.characterBag).map((name) => (
          <CharacterRow
            key={name}
            name={name}
            value={state.characterBag[name]}
          />
        ))}
      </div>
    </div>
  );

  return null;
};
