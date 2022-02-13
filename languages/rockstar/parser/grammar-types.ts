/** AST of the entire program */
export type Program = { list: Line[] };

/** A single line of the program */
export type Line = Statement | { type: "blank" };

/** A single (non-blank-line) statement */
export type Statement =
  | Break
  | Continue
  | FunctionDecl
  | FunctionCall
  | FunctionReturn
  | Loop
  | If
  | Else
  | Operation
  | Expression;

/********************************* 
            FLOW CONTROL
*********************************/

/** If-statement, optionally containing inline statement */
export type If = {
  type: "if";
  condition: Expression;
  statement?: Statement | null;
  /** Filled by AST builder: address to block ender */
  jump?: number;
};

/** Else-statement, optionally containing inline statement */
export type Else = {
  type: "else";
  statement: Statement | null;
};

/** Loop-starting statement */
export type Loop = {
  type: "loop";
  condition: Expression;
};

/** Loop-breaking statement */
export type Break = { type: "break" };

/** Loop-continuing statement */
export type Continue = { type: "continue" };

/** Function declaration statement */
export type FunctionDecl = {
  type: "function_decl";
  name: Variable;
  args: VariableList;
};

/** Function return statement */
export type FunctionReturn = {
  type: "return";
  expression: Expression;
};

/********************************* 
    VARIABLES AND ASSIGNMENT
*********************************/

/** Pronoun used to refer to last assigned variable */
export type Pronoun = { pronoun: string };

/** Identifier for a variable */
export type Variable = string;

/** List of variable identifiers */
export type VariableList = Variable[];

/** Target for an assignment statement */
export type Assignable = {
  variable: Variable;
  index: Expression;
};

/** Assignment statement */
export type Assignment =
  | { type: "assign"; target: Assignable; expression: Literal | PoeticNumber }
  | { type: "assign"; target: Assignable; expression: PoeticString }
  | { type: "assign"; target: Assignable; expression: Expression }
  // Return types of branch 4 & 5 are a subset of branch 3
  | { type: "enlist"; variable: Variable; expression: Expression }
  | { type: "enlist"; variable: Variable; expression: Literal | PoeticNumber }
  // Return type of branch 8 is subset of branch 6
  | { type: "enlist"; variable: Variable }
  | { type: "assign"; target: Assignable; expression: Delist };

/********************************* 
         EXPRESSION TREE
*********************************/

/** List of atomic expressions */
export type ExpressionList = SimpleExpression[];

/** Root of an expression tree */
export type Expression = Nor;

/** NOR expression clause */
export type Nor = { type: "binary"; op: "nor"; lhs: Or; rhs: Nor } | Or;

/** OR expression clause */
export type Or = { type: "binary"; op: "or"; lhs: And; rhs: Or } | And;

/** AND expression clause */
export type And =
  | { type: "binary"; op: "and"; lhs: EqualityCheck; rhs: And }
  | EqualityCheck;

/** Equality/inequality check clause */
export type EqualityCheck =
  | {
      type: "comparison";
      comparator: "eq" | "ne";
      lhs: Not;
      rhs: EqualityCheck;
    }
  | Not;

/** NOT expression clause */
export type Not = { type: "not"; expression: Not } | Comparison;

/** Comparison clause */
export type Comparison = {
  type: "comparison";
  comparator: "gt" | "lt" | "ge" | "le";
  lhs: Arithmetic;
  rhs: Comparison;
};

/** Add/Subtract arithmetic clause */
export type Arithmetic =
  | { type: "binary"; op: "+" | "-"; lhs: Arithmetic; rhs: Product }
  | Product;

/** Utility type for main branch of "product" grammar rule */
type _Product = {
  type: "binary";
  op: "*" | "/";
  lhs: _Product | SimpleExpression;
  rhs: ExpressionList;
};

/** Multiply/Divide arithmetic clause */
export type Product = _Product | ExpressionList | SimpleExpression;

/** Leaf of an expression tree */
export type SimpleExpression =
  | FunctionCall
  | Constant
  | Lookup
  | Literal
  | Pronoun;

/** Expression for a function call */
export type FunctionCall = {
  type: "call";
  name: Variable;
  args: ExpressionList;
};

/** Constant literal */
export type Literal = Constant | Number | String;

/** Unit constant literal */
export type Constant = { constant: null | boolean | "" } | "__MYSTERIOUS__";

/** Constant numeric literal */
export type Number = { number: number };

/** Constant string literal */
export type String = { string: string };

/********************************* 
        OPERATION STATEMENTS
*********************************/

/** Single-operation statements */
export type Operation =
  | Readline
  | Output
  | Crement
  | Mutation
  | Assignment
  | Rounding;

/** STDIN statement */
export type Readline = { type: "stdin"; target?: Assignable };

/** STDOUT statement */
export type Output = { type: "stdout"; output: Expression };

/** Increment/decrement statements */
export type Crement = {
  type: "increment" | "decrement";
  variable: Variable;
  multiple: number;
};

/** Types of mutation operations */
export type Mutator = "split" | "cast" | "join";

/** Mutation operation statement */
export type Mutation = {
  type: "mutation";
  target: Assignable;
  expression: {
    mutation: {
      type: Mutator;
      modifier: Expression;
      source: Expression | { lookup: Assignable };
    };
  };
};

/** Rounding operation statement */
export type Rounding = {
  type: "rounding";
  direction: "up" | "down" | "nearest";
  variable: Variable;
};

/********************************* 
          KITCHEN SINK
*********************************/

/** Clause representing dequeueing of an array */
export type Delist = { type: "delist"; variable: Variable };

/** Clause for variable lookup at leaf of expression tree */
export type Lookup =
  | { type: "lookup"; variable: Variable; index?: Expression }
  | Delist;

/** Poetic numeric literal */
export type PoeticNumber = { number: number };

/** Poetic string literal */
export type PoeticString = { string: string };
