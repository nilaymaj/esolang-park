import { CharacterValue } from "../common";
import { SimpleTag } from "./utils";

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
        <pre style={{ display: "inline" }}>{value.value}</pre>
        {value.stack.map((v, i) => (
          <SimpleTag key={i}>{v}</SimpleTag>
        ))}
      </div>
      <div></div>
    </div>
  );
};
