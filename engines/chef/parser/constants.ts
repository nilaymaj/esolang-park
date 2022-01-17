import { ChefArithmeticOp } from "../types";

/** Ingredient measures considered as dry */
export const DryMeasures = ["g", "kg", "pinch", "pinches"];

/** Ingredient measures considered as liquid */
export const LiquidMeasures = ["ml", "l", "dash", "dashes"];

/** Ingredient measures that may be dry or liquid */
export const UnknownMeasures = [
  "cup",
  "cups",
  "teaspoon",
  "teaspoons",
  "tablespoon",
  "tablespoons",
];

/** Types of measures - irrelevant to execution */
export const MeasureTypes = ["heaped", "level"];

/** A map from arithmetic instruction verbs to op codes */
export const ArithmeticCodes: { [k: string]: ChefArithmeticOp["code"] } = {
  Add: "ADD",
  Remove: "SUBTRACT",
  Combine: "MULTIPLY",
  Divide: "DIVIDE",
};

/** Placeholder value for loop jump addresses */
export const JumpAddressPlaceholder = -1;
