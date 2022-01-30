import { Colors } from "@blueprintjs/core";
import { ChefRS } from "../types";
import { BakingDishColumn, MixingBowlColumn } from "./bowl-dish-columns";
import { IngredientsPane } from "./ingredients-pane";
import { BorderColor } from "./utils";

const styles = {
  ingredientsPane: {
    width: 200,
    flexShrink: 0,
    overflowY: "auto" as "auto",
    borderRight: "1px solid " + BorderColor,
  },
  stacksPane: {
    padding: 5,
    flexGrow: 1,
    display: "flex",
    height: "100%",
    overflowX: "auto" as "auto",
  },
  stackColumn: {
    width: 125,
    flexShrink: 0,
  },
};

export const KitchenDisplay = ({
  state,
}: {
  state: ChefRS["currentKitchen"];
}) => {
  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div style={styles.ingredientsPane}>
        <IngredientsPane box={state!.ingredients} />
      </div>
      <div style={styles.stacksPane}>
        {Object.keys(state!.bowls).map((bowlId) => (
          <div key={bowlId} style={styles.stackColumn}>
            <MixingBowlColumn
              index={parseInt(bowlId, 10)}
              bowl={state!.bowls[bowlId as any]}
            />
          </div>
        ))}
        {Object.keys(state!.dishes).map((dishId) => (
          <div key={dishId} style={styles.stackColumn}>
            <BakingDishColumn
              index={parseInt(dishId, 10)}
              dish={state!.dishes[dishId as any]}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
