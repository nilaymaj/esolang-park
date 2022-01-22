import {
  BakingDish,
  ChefKitchenOp,
  IngredientBox,
  IngredientItem,
  MixingBowl,
  StackItem,
} from "../types";
import InputStream from "./input-stream";
import { RuntimeError } from "../../worker-errors";

/** Type for a list maintained as an index map */
type IndexList<T> = { [k: string]: T };

/**
 * Class for manipulating resources and utensils for a single Chef kitchen.
 * Contains methods for modifying ingredients, bowls and dishes corresponding to Chef instructions.
 */
export default class ChefKitchen {
  private _ingredients: IngredientBox;
  private _bowls: IndexList<MixingBowl>;
  private _dishes: IndexList<BakingDish>;
  private _input: InputStream;

  constructor(
    inputStream: InputStream,
    ingredients: IngredientBox,
    bowls: IndexList<MixingBowl> = {},
    dishes: IndexList<BakingDish> = {}
  ) {
    this._ingredients = ingredients;
    this._bowls = bowls;
    this._dishes = dishes;
    this._input = inputStream;
  }

  /** Serialize and create a deep copy of the kitchen's ingredients, bowls and dishes */
  serialize(): {
    ingredients: IngredientBox;
    bowls: IndexList<MixingBowl>;
    dishes: IndexList<BakingDish>;
  } {
    return {
      ingredients: this.deepCopy(this._ingredients),
      bowls: this.deepCopy(this._bowls),
      dishes: this.deepCopy(this._dishes),
    };
  }

  /** Get mixing bowl by 1-indexed identifier */
  getBowl(bowlId: number): MixingBowl {
    if (this._bowls[bowlId - 1] == null) this._bowls[bowlId - 1] = [];
    return this._bowls[bowlId - 1];
  }

  /** Get baking dish by 1-indexed identifier */
  getDish(dishId: number): BakingDish {
    if (this._dishes[dishId - 1] == null) this._dishes[dishId - 1] = [];
    return this._dishes[dishId - 1];
  }

  /** Serialize baking dish into string and clear the dish */
  serializeAndClearDish(dishId: number): string {
    const dish = this.getDish(dishId);
    let output = "";
    while (dish.length !== 0) {
      const item = dish.pop()!;
      if (item.type === "liquid") output += String.fromCharCode(item.value);
      else output += " " + item.value.toString();
    }
    return output;
  }

  getIngredient(name: string, assertValue?: boolean): IngredientItem {
    const item = this._ingredients[name];
    if (!item) throw new RuntimeError(`Ingredient '${name}' does not exist`);
    if (assertValue && item.value == null)
      throw new RuntimeError(`Ingredient '${name}' is undefined`);
    else return item;
  }

  /** Process a Chef kitchen operation on this kitchen */
  processOperation(op: ChefKitchenOp): void {
    if (op.code === "STDIN") this.stdinToIngredient(op.ing);
    else if (op.code === "PUSH") this.pushToBowl(op.bowlId, op.ing);
    else if (op.code === "POP") this.popFromBowl(op.bowlId, op.ing);
    else if (op.code === "ADD") this.addValue(op.bowlId, op.ing);
    else if (op.code === "SUBTRACT") this.subtractValue(op.bowlId, op.ing);
    else if (op.code === "MULTIPLY") this.multiplyValue(op.bowlId, op.ing);
    else if (op.code === "DIVIDE") this.divideValue(op.bowlId, op.ing);
    else if (op.code === "ADD-DRY") this.addDryIngredients(op.bowlId);
    else if (op.code === "LIQ-ING") this.liquefyIngredient(op.ing);
    else if (op.code === "LIQ-BOWL") this.liquefyBowl(op.bowlId);
    else if (op.code === "ROLL-BOWL") this.stirBowl(op.bowlId, op.num);
    else if (op.code === "ROLL-ING") this.stirIngredient(op.bowlId, op.ing);
    else if (op.code === "RANDOM") this.mixBowl(op.bowlId);
    else if (op.code === "CLEAR") this.cleanBowl(op.bowlId);
    else if (op.code === "COPY") this.pourIntoDish(op.bowlId, op.dishId);
    else throw new Error(`Unknown kitchen opcode: '${op["code"]}''`);
  }

  /** Read a number from stdin into the value of an ingredient. */
  stdinToIngredient(ingredient: string): void {
    const value = this._input.getNumber();
    this.getIngredient(ingredient).value = value;
  }

  /** Push value of an ingredient into a mixing bowl */
  pushToBowl(bowlId: number, ingredient: string): void {
    const item = this.getIngredient(ingredient, true);
    this.getBowl(bowlId).push({ ...(item as StackItem) });
  }

  /** Pop value from a mixing bowl and store into an ingredient */
  popFromBowl(bowlId: number, ingredient: string): void {
    const bowl = this.getBowl(bowlId);
    if (bowl.length === 0) throw new RuntimeError(`Bowl ${bowlId} is empty`);

    const item = bowl.pop() as StackItem;
    this.getIngredient(ingredient).type = item.type;
    this.getIngredient(ingredient).value = item.value;
  }

  /**
   * Add the value of an ingredient to the top of a mixing bowl,
   * pushing the result onto the same bowl
   */
  addValue(bowlId: number, ingredient: string): void {
    const bowl = this.getBowl(bowlId);
    if (bowl.length === 0) throw new RuntimeError(`Bowl ${bowlId} is empty`);
    const bowlValue = bowl.pop()!.value;
    const ingValue = this.getIngredient(ingredient, true).value as number;
    bowl.push({ type: "unknown", value: ingValue + bowlValue });
  }

  /**
   * Subtract the value of an ingredient from the top of a mixing bowl,
   * pushing the result onto the same bowl
   */
  subtractValue(bowlId: number, ingredient: string): void {
    const bowl = this.getBowl(bowlId);
    if (bowl.length === 0) throw new RuntimeError(`Bowl ${bowlId} is empty`);
    const bowlValue = bowl.pop()!.value;
    const ingValue = this.getIngredient(ingredient, true).value as number;
    bowl.push({ type: "unknown", value: bowlValue - ingValue });
  }

  /**
   * Multiply the value of an ingredient with the top of a mixing bowl,
   * pushing the result onto the same bowl
   */
  multiplyValue(bowlId: number, ingredient: string): void {
    const bowl = this.getBowl(bowlId);
    if (bowl.length === 0) throw new RuntimeError(`Bowl ${bowlId} is empty`);
    const bowlValue = bowl.pop()!.value;
    const ingValue = this.getIngredient(ingredient, true).value as number;
    bowl.push({ type: "unknown", value: ingValue * bowlValue });
  }

  /**
   * Divide the top of a mixing bowl by the value of an ingredient,
   * pushing the result onto the same bowl
   */
  divideValue(bowlId: number, ingredient: string): void {
    const bowl = this.getBowl(bowlId);
    if (bowl.length === 0) throw new RuntimeError(`Bowl ${bowlId} is empty`);
    const bowlValue = bowl.pop()!.value;
    const ingValue = this.getIngredient(ingredient, true).value as number;
    bowl.push({ type: "unknown", value: bowlValue / ingValue });
  }

  /** Add values of all dry ingredients and push onto a mixing bowl */
  addDryIngredients(bowlId: number): void {
    const totalValue = Object.keys(this._ingredients).reduce((sum, name) => {
      const ing = this._ingredients[name];
      if (ing.type !== "dry") return sum;
      if (ing.value == null)
        throw new RuntimeError(`Ingredient ${name} is undefined`);
      return sum + ing.value;
    }, 0);
    this.getBowl(bowlId).push({ type: "dry", value: totalValue });
  }

  /** Convert an ingredient into a liquid */
  liquefyIngredient(name: string): void {
    this.getIngredient(name).type = "liquid";
  }

  /** Convert all items in a bowl to liquids */
  liquefyBowl(bowlId: number): void {
    const bowl = this.getBowl(bowlId);
    bowl.forEach((item) => (item.type = "liquid"));
  }

  /**
   * Roll the top `num` elements of a bowl such that top item goes down `num` places.
   * If bowl has less than `num` items, top item goes to bottom of bowl.
   */
  stirBowl(bowlId: number, num: number): void {
    const bowl = this.getBowl(bowlId);
    const topIngredient = bowl.pop();
    if (!topIngredient) return;
    const posn = Math.max(bowl.length - num, 0);
    bowl.splice(posn, 0, topIngredient);
  }

  /**
   * Roll the top `num` elements of a bowl such that top item goes down `num` places ,
   * where `num` is the value of the specified ingredient. If bowl has less than `num` items,
   * top item goes to bottom of bowl.
   */
  stirIngredient(bowlId: number, ingredient: string): void {
    const ing = this.getIngredient(ingredient, true);
    const num = ing.value as number;
    this.stirBowl(bowlId, num);
  }

  /** Randomly shuffle the order of items in a mixing bowl */
  mixBowl(bowlId: number): void {
    const bowl = this.getBowl(bowlId);

    // Fisher-Yates algorithm
    let remaining = bowl.length;
    while (remaining) {
      const i = Math.floor(Math.random() * remaining--);
      const temp = bowl[i];
      bowl[i] = bowl[remaining];
      bowl[remaining] = temp;
    }
  }

  /** Remove all items from a mixing bowl */
  cleanBowl(bowlId: number): void {
    this._bowls[bowlId - 1] = [];
  }

  /** Copy the items of a mixing bowl to a baking dish in the same order */
  pourIntoDish(bowlId: number, dishId: number): void {
    const bowl = this.getBowl(bowlId);
    const dish = this.getDish(dishId);
    dish.push(...bowl);
  }

  /**
   * A naive function to create a deep copy of an object.
   * Uses JSON serialization, so non-simple values like Date won't work.
   */
  private deepCopy<T extends {}>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}
