import * as React from "react";
import { MixingBowl, StackItem } from "../types";
import { ItemTypeIcons } from "./utils";

const styles = {
  cellContainer: {
    display: "flex",
    justifyContent: "space-between",
    margin: "2px 0",
  },
  listContainer: {
    width: "80%",
    marginTop: 5,
    marginLeft: "auto",
    marginRight: "auto",
  },
  stackContainer: {
    overflowY: "auto" as "auto",
  },
  columnContainer: {
    height: "100%",
    textAlign: "center" as "center",
    margin: "0 10px",
    display: "flex",
    flexDirection: "column" as "column",
  },
  stackMarker: {
    height: "0.7em",
    borderRadius: 5,
  },
  stackHeader: {
    fontWeight: "bold",
    margin: "5px 0",
  },
};

/** Displays a single item of a bowl or dish, along with type */
const StackItemCell = ({ item }: { item: StackItem }) => {
  return (
    <div style={styles.cellContainer}>
      <span title={item.type}>{ItemTypeIcons[item.type]}</span>
      <span title={"Character: " + String.fromCharCode(item.value)}>
        {item.value.toString()}
      </span>
    </div>
  );
};

/** Displays a list of bowl/dish items in reverse order */
const StackItemList = ({ items }: { items: StackItem[] }) => {
  return (
    <div style={styles.listContainer}>
      {items.map((item, idx) => (
        <StackItemCell key={idx} item={item} />
      ))}
    </div>
  );
};

/** Displays a mixing bowl in a vertical strip */
export const MixingBowlColumn = ({
  bowl,
  index,
}: {
  bowl: MixingBowl;
  index: number;
}) => {
  return (
    <div style={styles.columnContainer}>
      <div style={styles.stackHeader}>Bowl {index + 1}</div>
      <div style={styles.stackContainer}>
        <div
          style={{ ...styles.stackMarker, backgroundColor: "#137CBD" }}
        ></div>
        <StackItemList items={bowl} />
      </div>
    </div>
  );
};

/** Displays a baking dish in a vertical strip */
export const BakingDishColumn = ({
  dish,
  index,
}: {
  dish: MixingBowl;
  index: number;
}) => {
  return (
    <div style={styles.columnContainer}>
      <div style={styles.stackHeader}>Dish {index + 1}</div>
      <div style={styles.stackContainer}>
        <div
          style={{ ...styles.stackMarker, backgroundColor: "#0F9960" }}
        ></div>
        <StackItemList items={dish} />
      </div>
    </div>
  );
};
