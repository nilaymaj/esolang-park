import { Tag, Text } from "@blueprintjs/core";
import { SimpleTag } from "./utils";

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
      <Tag large minimal>
        The stage is empty
      </Tag>
    ) : (
      charactersOnStage.map((character) => {
        return (
          <SimpleTag
            key={character}
            intent={character === currSpeaker ? "active" : undefined}
          >
            {character}
          </SimpleTag>
        );
      })
    );

  return (
    <div>
      {characterChips}
      {questionState != null && (
        <>
          <Text tagName="span" style={styles.questionText}>
            Answer to question:
          </Text>
          <SimpleTag intent={questionState ? "success" : "danger"}>
            {questionState ? "yes" : "no"}
          </SimpleTag>
        </>
      )}
    </div>
  );
};
