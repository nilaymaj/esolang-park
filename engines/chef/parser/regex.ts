/**
 * For each regular expression below:
 * - Doc comments include the details of each capture group in the regex.
 * - Regex comments provide a little overview of the regex, where
 *   [...] denotes optional clause, <...> denotes capture group.
 */

/**
 * Regular expression for `Take ingredient from refrigerator` op
 * Capture groups:
 * 1. **Ingredient name**: string with letters and spaces
 */
export const TakeFromFridgeRegex =
  /**    <Ingredient>                   */
  /^Take ([a-zA-Z ]+?) from(?: the)? refrigerator$/;

/**
 * Regular expression for `Put ingredient into nth bowl` op
 * Capture groups:
 * 1. **Ingredient name**: string with letters and spaces
 * 2. **Mixing bowl index** (optional): integer
 */
export const PutInBowlRegex =
  /**             <Ingredient>              [    <Bowl identifier>  ]             */
  /^Put(?: the)? ([a-zA-Z ]+?) into(?: the)?(?: (\d+)(?:nd|rd|th|st))? mixing bowl$/;

/**
 * Regular expression for `Fold ingredient into nth bowl` op
 * Capture groups:
 * 1. **Ingredient name**: string with letters and spaces
 * 2. **Mixing bowl index** (optional): integer
 */
export const FoldIntoBowlRegex =
  /**             <Ingredient>               [    <Bowl identifier>  ]             */
  /^Fold(?: the)? ([a-zA-Z ]+?) into(?: the)?(?: (\d+)(?:nd|rd|th|st))? mixing bowl$/;

/**
 * Regular expression to match the four main arithmetic operations in Chef.
 * Capture groups:
 * 1. **Operation name**: `"Add" | "Remove" | "Combine" | "Divide"`
 * 2. **Ingredient name**: string with letters and spaces
 * 3. **Proverb** (optional): `"to" | "into" | "from"`
 * 4. **Mixing bowl index** (optional): integer
 */
export const ArithmeticOpRegex =
  /**    <Operation name>       <Ingredient> [     <Proverb>            [    <Bowl identifier>  ]             ] */
  /^(Add|Remove|Combine|Divide) ([a-zA-Z ]+?)(?: (to|into|from)(?: the)?(?: (\d+)(?:nd|rd|th|st))? mixing bowl)?$/;

/**
 * Regular expression for the `Add dry ingredients ...` op.
 * Capture groups:
 * 1. **Mixing bowl index** (optional): integer
 */
export const AddDryIngsOpRegex =
  /**                  [              [    <Bowl identifier>  ]             ] */
  /^Add dry ingredients(?: to(?: the)?(?: (\d+)(?:nd|rd|th|st))? mixing bowl)?$/;

/**
 * Regular expression for the `Liquefy contents` op
 * Capture groups:
 * 1. **Mixing bowl index** (optional): integer
 */
export const LiquefyBowlRegex =
  /**                      [     <Bowl identifier> ]             */
  /^Liquefy(?: the)? contents of the(?: (\d+)(?:nd|rd|th|st))? mixing bowl$/;

/**
 * Regular expression for the `Liquefy ingredient` op
 * Capture groups:
 * 1. **Ingredient name**: string with letters and spaces
 */
export const LiquefyIngRegex =
  /**                <Ingredient> */
  /^Liquefy(?: the)? ([a-zA-Z ]+?)$/;

/**
 * Regular expression to match the `Stir <bowl> for <n> minutes` op.
 * Capture groups:
 * 1. **Mixing bowl index** (optional): integer
 * 2. **Number of mins**: integer
 */
export const StirBowlRegex =
  /**   [      [     <Bowl identifier> ]?            ]?   <Number>        */
  /^Stir(?: the(?: (\d+)(?:nd|rd|th|st))? mixing bowl)? for (\d+) minutes?$/;

/**
 * Regular expression to match the `Stir <ingredient> into [nth] mixing bowl` op.
 * Capture groups:
 * 1. **Ingredient name**: string with letters and spaces
 * 2. **Mixing bowl index** (optional): integer
 */
export const StirIngredientRegex =
  /**    <Ingredient>          [  <Bowl identifier>    ]             */
  /^Stir ([a-zA-Z ]+?) into the(?: (\d+)(?:nd|rd|th|st))? mixing bowl$/;

/**
 * Regular expression to match the `Mix [the [nth] mixing bowl] well` op.
 * Capture groups:
 * 1. **Mixing bowl index** (optional): integer
 */
export const MixBowlRegex =
  /**  [      [     <Bowl identifier> ]?            ]?     */
  /^Mix(?: the(?: (\d+)(?:nd|rd|th|st))? mixing bowl)? well$/;

/**
 * Regular expression for the `Clean bowl` op
 * Capture groups:
 * 1. **Mixing bowl index** (optional): integer
 */
export const CleanBowlRegex =
  /**             [    <Bowl identifier>  ]             */
  /^Clean(?: the)?(?: (\d+)(?:nd|rd|th|st))? mixing bowl$/;

/**
 * Regular expression to match the `Pour ...` op.
 * Capture groups:
 * 1. **Mixing bowl index** (optional): integer
 * 2. **Baking dish index** (optional): integer
 */
export const PourBowlRegex =
  /**                   [     <Bowl identifier> ]?                     [     <Bowl identifier> ]?            */
  /^Pour contents of the(?: (\d+)(?:nd|rd|th|st))? mixing bowl into the(?: (\d+)(?:nd|rd|th|st))? baking dish$/;

/**
 * Regular expression to match the `Serve with` op.
 * Capture groups:
 * 1. **Name of aux recipe**: string with alphanumerics and spaces
 */
export const ServeWithRegex =
  /**           <aux recipe>  */
  /^Serve with ([a-zA-Z0-9 ]+)$/;

/**
 * Regular expression to match the `Refrigerate` op.
 * Capture groups:
 * 1. **Number of hours** (optional): integer
 */
export const RefrigerateRegex =
  /**          [   <num of hours> ] */
  /^Refrigerate(?: for (\d+) hours?)?$/;

/**
 * Regular expression to match the `Verb the ingredient` op.
 * Capture groups:
 * 1. **Verb**: string with letters
 * 2. **Ingredient name**: string with letters and spaces
 */
export const LoopOpenerRegex =
  /** <Verb>             <Ingredient> */
  /^([a-zA-Z]+?)(?: the)? ([a-zA-Z ]+)$/;

/**
 * Regular expression to match the `Verb [the ing] until verbed` op.
 * Capture groups:
 * 1. **Ingredient name** (optional): string with letters and spaces
 * 2. **Matched verb**: string with letters
 */
export const LoopEnderRegex =
  /**   Verb      [       <Ingredient> ]        <Verbed>  */
  /^(?:[a-zA-Z]+?)(?: the)?(?: ([a-zA-Z ]+?))? until ([a-zA-Z]+)$/;
