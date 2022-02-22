import React from "react";
import { Text } from "@blueprintjs/core";
import { Box } from "../../ui-utils";

const styles = {
  charChip: {
    margin: "0 5px",
  },
  questionText: {
    marginLeft: 30,
    marginRight: 10,
  },
};

type Props = {
  charactersOnStage: string[];
  currSpeaker: string | null;
  questionState: boolean | null;
};

export const TopBar = (props: Props) => {
  const { charactersOnStage, currSpeaker, questionState } = props;

  const characterChips =
    charactersOnStage.length === 0 ? (
      <Box>The stage is empty</Box>
    ) : (
      charactersOnStage.map((character) => (
        <Box
          key={character}
          intent={character === currSpeaker ? "active" : "plain"}
        >
          {character}
        </Box>
      ))
    );

  return (
    <div>
      {characterChips}
      {questionState != null && (
        <>
          <Text tagName="span" style={styles.questionText}>
            Answer to question:
          </Text>
          <Box intent={questionState ? "success" : "danger"}>
            {questionState ? "yes" : "no"}
          </Box>
        </>
      )}
    </div>
  );
};
