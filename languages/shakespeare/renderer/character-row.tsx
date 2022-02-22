import { Box } from "../../ui-utils";
import { CharacterValue } from "../common";

type Props = {
  name: string;
  value: CharacterValue;
};

export const CharacterRow = (props: Props) => {
  const { name, value } = props;

  return (
    <div style={{ margin: "20px 10px" }}>
      <div>
        <b style={{ marginRight: 5 }}>{name}:</b>{" "}
        <pre style={{ display: "inline", marginRight: 15 }}>{value.value}</pre>
        {value.stack.map((v, i) => (
          <Box key={i}>{v}</Box>
        ))}
      </div>
      <div></div>
    </div>
  );
};
