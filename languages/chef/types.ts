import { DocumentRange } from "../types";

/** Type alias for renderer state */
export type ChefRS = {
  stack: string[];
  currentKitchen: {
    ingredients: IngredientBox;
    bowls: { [k: number]: MixingBowl };
    dishes: { [k: number]: BakingDish };
  };
};

/********************************
 ******** UTILITY ALIASES *******
 ********************************/

/** The name of an ingredient */
export type IngredientName = string;

/** Identifier of a mixing bowl */
export type BowlId = number;

/** Indentifier of a baking dish */
export type DishId = number;

/********************************
 ****** RUNTIME CONSTRUCTS ******
 ********************************/

/** Type of an element in a Chef stack */
export type StackItemType = "dry" | "liquid" | "unknown";

/** An element of Chef's stack constructs */
export type StackItem = { value: number; type: StackItemType };

/** Details of an ingredient - kind and value */
export type IngredientItem = {
  type: StackItemType;
  value?: number;
};

/** Set of ingredients (global variables) in a Chef program */
export type IngredientBox = { [k: IngredientName]: IngredientItem };

/** A mixing bowl (stack construct) in Chef */
export type MixingBowl = StackItem[];

/** A baking dish (stack construct) in Chef */
export type BakingDish = StackItem[];

/********************************
 ***** PROGRAM INSTRUCTIONS *****
 ********************************/

/** TAKE: Take numeric input from STDIN and write in ingredient `ing` */
export type StdinOp = { code: "STDIN"; ing: IngredientName };

/** PUT: Push value of ingredient `ing` into `bowlId`'th mixing bowl */
export type PushOp = { code: "PUSH"; ing: IngredientName; bowlId: BowlId };

/** FOLD: Pop value from top of `bowlId`'th mixing bowl and put in ingredient `ing` */
export type PopOp = { code: "POP"; ing: IngredientName; bowlId: BowlId };

/** ADD: Add value of `ing` to top value of bowl `bowlId` and push result onto same bowl */
export type AddOp = { code: "ADD"; ing: IngredientName; bowlId: BowlId };

/** REMOVE: Subtract value of `ing` from top value of bowl `bowlId` and push result onto same bowl */
export type SubtractOp = {
  code: "SUBTRACT";
  ing: IngredientName;
  bowlId: BowlId;
};

/** COMBINE: Multiply value of `ing` with top value of bowl `bowlId` and push result onto same bowl */
export type MultiplyOp = {
  code: "MULTIPLY";
  ing: IngredientName;
  bowlId: BowlId;
};

/** DIVIDE: Divide top value of bowl `bowlId` by value of `ing` and push result onto same bowl */
export type DivideOp = { code: "DIVIDE"; ing: IngredientName; bowlId: BowlId };

/** ADD DRY: Add values of all dry ingredients and push result on bowl `bowlId` */
export type AddDryOp = { code: "ADD-DRY"; bowlId: BowlId };

/** LIQUEFY: Convert ingredient `ing` to a liquid */
export type LiquefyIngOp = { code: "LIQ-ING"; ing: IngredientName };

/** LIQUEFY CONTENTS: Convert each item in bowl `bowlId` to liquid */
export type LiquefyBowlOp = { code: "LIQ-BOWL"; bowlId: BowlId };

/** STIR BOWL: Rotates top `num` items of bowl `bowlId` topwards (top ingredient goes to ~`num` position) */
export type RollStackOp = { code: "ROLL-BOWL"; bowlId: BowlId; num: number };

/** STIR ING: Rotates top [value of `ing`] items of bowl `bowlId` topwards */
export type RollIngOp = {
  code: "ROLL-ING";
  bowlId: BowlId;
  ing: IngredientName;
};

/** MIX: Randomizes the order of items in the bowl `bowlId` */
export type RandomizeOp = { code: "RANDOM"; bowlId: BowlId };

/** CLEAN: Remove all items from the bowl `bowlId` */
export type ClearOp = { code: "CLEAR"; bowlId: BowlId };

/** POUR: Copies all items from `bowlId`'th bowl onto `dishId`'th baking dish, in the same order */
export type CopyToDishOp = { code: "COPY"; bowlId: BowlId; dishId: DishId };

/** VERB: Loop-opener, execute inner steps until `ing` is zero - then continues past loop-closer. */
export type LoopOpenOp = {
  code: "LOOP-OPEN";
  verb: string;
  ing: IngredientName;
  /** Index of corresponding loop-closing op in current method */
  closer: number;
};

/** VERB: Loop-closer - also decrement value of `ing` by 1 on execution, if provided */
export type LoopCloseOp = {
  code: "LOOP-CLOSE";
  verb: string;
  ing?: IngredientName;
  /** Index of corresponding loop-opener op in current method */
  opener: number;
};

/** SET ASIDE: Break out of innermost loop and continue past loop-closer */
export type LoopBreakOp = {
  code: "LOOP-BREAK";
  /** Index of closing op of innermost loop in current method */
  closer: number;
};

/** SERVE: Run auxiliary recipe and wait until completion */
export type FnCallOp = { code: "FNCALL"; recipe: string };

/** REFRIGERATE: End recipe execution. If provided, print first `num` baking dishes */
export type EndOp = { code: "END"; num?: number };

/** Four main arithmetic operations in Chef */
export type ChefArithmeticOp = AddOp | SubtractOp | MultiplyOp | DivideOp;

/** Kitchen manipulation operations in Chef */
export type ChefKitchenOp =
  | StdinOp
  | PushOp
  | PopOp
  | ChefArithmeticOp
  | AddDryOp
  | LiquefyIngOp
  | RollStackOp
  | RollIngOp
  | RandomizeOp
  | ClearOp
  | CopyToDishOp
  | LiquefyIngOp
  | LiquefyBowlOp;

/** Flow control operations in Chef */
export type ChefFlowControlOp =
  | LoopOpenOp
  | LoopCloseOp
  | LoopBreakOp
  | FnCallOp
  | EndOp;

/** A single operation of a Chef recipe */
export type ChefOperation = ChefKitchenOp | ChefFlowControlOp;

/** List of codes for flow control operations in Chef */
const flowControlOpTypes: ChefFlowControlOp["code"][] = [
  "LOOP-OPEN",
  "LOOP-CLOSE",
  "LOOP-BREAK",
  "FNCALL",
  "END",
];

/** Check if a Chef op is a flow control operation */
export const isFlowControlOp = (op: ChefOperation): op is ChefFlowControlOp => {
  return flowControlOpTypes.includes(op.code as any);
};

/********************************
 ******* PROGRAM SEMANTICS ******
 ********************************/

/** Details about serving of recipe */
export type ChefRecipeServes = {
  line: number; // Line number of the "Serves" line
  num: number; // Number of servings
};

/** Chef operation with its location in code */
export type ChefOpWithLocation = {
  location: DocumentRange;
  op: ChefOperation;
};

/** A single Chef recipe */
export type ChefRecipe = {
  name: string;
  ingredients: IngredientBox;
  method: ChefOpWithLocation[];
  serves?: ChefRecipeServes;
};

/** A parsed Chef program */
export type ChefProgram = {
  main: ChefRecipe;
  auxes: { [name: string]: ChefRecipe };
};
