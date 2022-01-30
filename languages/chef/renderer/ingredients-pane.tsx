import { IngredientBox, IngredientItem } from "../types";
import { ItemTypeIcons } from "./utils";

const styles = {
  paneHeader: {
    fontSize: "1.1em",
    fontWeight: "bold",
    marginBottom: 15,
  },
  paneContainer: {
    height: "100%",
    padding: 10,
  },
  rowItemContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "3px 0",
  },
  rowItemRight: {
    display: "flex",
    alignItems: "center",
  },
};

/** Displays a single ingredient item's name, type and value */
const IngredientPaneRow = ({
  name,
  item,
}: {
  name: string;
  item: IngredientItem;
}) => {
  return (
    <div style={styles.rowItemContainer}>
      <span>{name}</span>
      <span title={item.type} style={styles.rowItemRight}>
        {item.value == null ? "-" : item.value.toString()}
        <span style={{ width: 10 }} />
        {ItemTypeIcons[item.type]}
      </span>
    </div>
  );
};

/** Displays list of ingredients under an "Ingredients" header */
export const IngredientsPane = ({ box }: { box: IngredientBox }) => {
  return (
    <div style={styles.paneContainer}>
      <div style={styles.paneHeader}>Ingredients</div>
      {Object.keys(box).map((name) => (
        <IngredientPaneRow key={name} name={name} item={box[name]} />
      ))}
    </div>
  );
};
