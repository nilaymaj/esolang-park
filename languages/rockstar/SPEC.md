# The Rockstar Language Spec

This file contains an **unofficial** version of the Rockstar Language Spec. While the official docs are obviously the source of the ultimate truth, they are also a slight bit unorganized in terms of order of content. This file is just a more condensed version, used as reference while building the parser and interpreter.

## Comments

`(your comment)`

- Only single-line comments supported, can appear anywhere

## Variables

Three kinds of variables supported. There is no functional difference in the three whatsoever.
All variable names are **case-insensitive** in usage (apart from proper variables below).

1. **Simple variables**: Single word, only letters, no lang keywords.

   ```
   Variable is 1
   Tommy is a rockstar
   X is 2
   Y is 3
   Put x plus y into result
   ```

2. **Common variables**: Variable name consists of two parts:

   1. Keyword: `a, an, the, my, your, our`. This is part of the variable identifier.
   2. Name: lowercase letters, no spaces.

   ```
   My variable is 5
   Your variable is 4
   Put my variable plus your variable into the total
   Shout the total
   ```

3. **Proper variables**: Multi-word, each word starting with capital letter, no lang keywords.

   - Proper variales are also case-insensitive except that each word MUST start with capital letter in every use.

     `Doctor Feelgood, Mister Crowley, Tom Sawyer, Billie Jean, Distance In KM`

### Case-sensitivity in variable names

- Rockstar keywords and variable names are all case-insensitive...
- ...except proper variables, in which each word MUST start with a capital letters

```
TIME, time, tIMe, TIMe    (Simple variables, equivalent)
MY HEART, my heart, My Heart   (Common variables, equivalent)
Tom Sawyer, TOM SAWYER, TOm SAWyer  (Proper variables, equivalent)
(note that the "S" above must be capital)
DOCTOR feelgood  (NOT a valid variable name)
```

### Scope rules

- All variables declared in global scope (outside of any function) are accessible and modifyable everywhere **below** their first initialization.
- Variables defined inside functions are available until end of function.

### Referring to last named variable

`it, he, she, him, her, they, them, ze, hir, zie, zir, xe, xem, ve, ver`

Above keywords can be used to refer to the last named variable, **in parsing order**. This means the variable last used in the lines just above the line being parsed.

### Types

- **Undefined**: `mysterious`, assigned to variables that don't have a value yet. Falsy.
- **Null**: `null, nothing, nowhere, nobody, gone`. Falsy.
- **Boolean**:
  - True: `true, right, yes, ok`. Truthy.
  - False: `false, wrong, no, lies`. Falsy.
- **Number**: IEEE 754 floating-point numbers. Falsy only if zero.
- **String**: UTF-16 encoded strings. Empty string falsy, else truthy.
  - Aliases for empty string: `empty, silent, silence`

### Literals

- Strings use double quotes: `"Hello San Francisco"`
- Numeric literals: `123`, `3.1415`

### Value Assignment

```
Put <expression> into <variable>
Put <expression> in <variable>
Let <variable> be <expression>
```

> Note on the use of single quotes:
>
> - `'s` and `'re` appearing at end of word are considered as `... is` and `... are`.
> - All other uses of single quotes are completely ignored.

### Poetic literals

#### Poetic constant literals

- For assigning constant values like bools, null, undefined.
- Assignment syntax: `<variable> is/are/was/were <value>`

#### Poetic string literals

- For assigning strings without using double quotes.
- String literal continues all the way to `\n`, may contain keywords.
- Assignment syntax: `<variables> say/says/said <string>`

#### Poetic number literals

- For assigning numbers using words.
- Assignment syntax: `<variable> is/are/was/were <words>`
- `<words>` continues all the way until `\n`.
- Each word denotes a digit, which is `word-length % 10`.
- `-` is counted as a letter. All other non-alphabetical chars are ignored.
- `<words>` may contain one period in between, which acts as decimal point.
- `<words>` MUST not start with a constant literal (`nothing`, etc).

```
Tommy was a lovestruck ladykiller (100)
My dreams were ice. A life unfulfilled (3.141)
Tommy was without (7)
Her fire was all-consuming (13)
```

## Operations

### Arithmetic

- Usage: `<expression> <op> <expression>`
- Addition: `plus, with`
- Subtraction: `minus, without`
- Multiplication: `times, of`
- Division: `over, between`

### Compound assignment operators

- Usage: `Let <variable> be <op> <expression>`
- Equivalent to `(variable) (op)= (expression)` (`x += 5`)

### Incrementing and decrementing

- Increment: `Build <variable> up`
- Decrement: `Knock <variable> down`
- Multiple `up`s or `down`s adjust step value

```
Build my world up (my world += 1)
Knock the walls down, down (the walls -= 2)
```

### Rounding numbers

- `turn up`: round up, `turn down`: round down
- `turn round/around`: round to the nearest integer
- Syntax: `Turn <type> <variable>` (acts in-place)

### List arithmetic

- Operators support argument list on right side
- Operator is then applied iteratively on each arg (like `reduce`)
- Can also be used in compound assignment operators
- Only allowed where result type supports further ops

```
Let X be 1 with 2, 3, 4 (X = 1+2+3+4)
Let X be "foo" with "bar", and "baz" (X = "foobarbaz")
Let the wolf be without fear, fury (the wolf -= fear + fury)
Let X be "foo" with 2, 2, 2 (X = "foo"*8 = "foofoo...")
Let X be 2 times "foo", "bar" (unsupported op, X = mysterious)
```

### Converting between string and number

Keyword: `cast, burn`

- This is a mutation op (described in Arrays section)
- Parses strings into numbers (optional arg: base number (default 10))
- Converts numbers into corresponding Unicode characters (no optional arg)

```
Let X be "123.45"
Cast X (X = numeric value 123.45)
Let X be "ff"
Cast X with 16 (X = 255 = OxFF)
Cast "12345" into result (result = 12345)
Cast "aa" into result with 16 (result = 170 = 0xAA)

Cast 65 into result (result = "A" - ASCII code 65)
Cast 1046 into result (result = "Ж" - Unicode 1046)
```

### Comparison

- Syntax: `<expr> <op> <expr>`
- Above syntax only valid in comparison context (eg. `if` blocks)
- Equality comparison: `is/are/was/were` (`If <expr> is <expr>`)
- Not-equal comparison: `ain't, aren't, wasn't, weren't`
- Comparison keywords:
  - Greater than: `is higher/greater/bigger/stronger than`
  - Less than: `is lower/less/smaller/weaker than`
  - Greater or equal: `is as high/great/big/strong as`
  - Less or equal: `is as low/little/small/weak as`

### Logical operators

- `A and/or/nor B`: AND, OR, NOT-OR
- `not A`: negation (NOT)
- All logical ops are **short-circuiting**.

### Input-output

- `Listen to <variable>`: Read one line of STDIN and store in variable.
- `Say/Shout/Whisper/Scream <expression>`: Print expr to STDOUT.

### Operator precedence

1. Function calls (greedy arguments)
2. Logical NOT (right-associative)
3. Multiplication and Division (left-associative)
4. Addition and Subtraction (left-associative)
5. Comparison operators (left-associative)
6. AND, OR, NOR (left-associative)

```
A taking B times C plus not D times E and F
= ((A(B) * C) + (!D * E)) && F
```

### Implicit conversions

For comparison operators:

- `mysterious OP mysterious` => Equal
- `<non-myst> OP mysterious` => Non-equal
- `<str> OP <num>` => Convert str to num (base 10). If fail, non-equal.
- `<str> OP <bool>` => Empty str is false, else str is true.
- `<str> OP null` => Non-equal
- `<num> OP <bool>` => Convert num to bool by truthiness.
- `<num> OP null` => Convert null to 0.
- `<bool> OP null` => Convert null to false.

For increment-decrement operators:

- `OP mysterious/<str>` => Error
- `OP <bool>` => invert bool
- `OP null` => coerce to zero, then apply op

For binary operators (non-mentioned cases are error):

- `<str> PLUS <num>`: convert num to base-10 str. Unnecessary zeros removed. Numbers with no whole part (eg 0.75) have one leading zero when serialized.
- `<str> PLUS <bool>`: convert bool to "true" or "false"
- `<str> PLUS null`: convert null to "null"
- `<str> PLUS mysterious`: convert mysterious to "mysterious"
- `<str> TIMES <num>`: str gets repeated num times

## Arrays

- Rockstar arrays support for numeric and non-numeric keys.
- Numeric keys are zero-indexed.
- Arrays are dynamically allocated when values are assigned.
- Returning array as scalar returns array's length instead.

```
Let my array at 255 be "some value"
Let my array at "some_key" be "some_value"
Shout my array at 255 (will print "some_value")
Shout my array (will print the value 256)
Shout my array at "some_key" (will print "some_value")
```

Read (but not write) characters from a string with array syntax:

```
Let my string be "abcdefg"
Shout my string at 0 (will print "a")
Shout my string at 1 (will print "b")
Let the character be my string at 2
```

### Array comparison

For two arrays to be equal,

- Must be of the same length
- Corresponding elements must be equal

### Array operations

#### Queueing elements onto array

Keyword: `rock, push`

- Create new empty array: `Rock the array`
- Queue value to end of array: `Rock the array with the element`
- Queue poetic literals: `Rock the array like the poetic literal (= [367])`
- List expressions:
  ```
  Rock the array with 1, 2, 3
  Rock the array with the one, the two, the three
  Rock the array with the one, the two, and the three
  ```

> NOTE: `with` has other uses too - it is also alias for the addition operator.
> `Rock ints with 1, 2 with 3, 4, 5 (ints = [1, 5, 4, 5])`

#### Dequeue elements from the array

Keyword: `roll, pop`

- Remove first element from array (and optionally return it)
- Special `roll x into y` syntax for assigning result to variable

```
Rock ints with 1, 2, 3
Roll ints (ints is now [ 2, 3 ])
Let the two be roll ints (the two = 2, ints = [3])
Roll ints into three (three = 3, ints = [])
Roll ints (returns mysterious, ints = [])
```

> Below two operations are **mutation operations**, which all share the following syntax:
>
> ```
> Modify X (acts in place)
> Modify X into Y (put result in Y, X is unmodified)
> Modify X with Z (acts in place, Z is op parameter)
> Modify X into Y with Z (put result in Y, X is unmodified, Z is op param)
> ```

#### Splitting strings

Keyword: `cut, split, shatter`

- Split string into array of its characters
- If separator specified, split on the separator

#### Joining arrays

Keyword: `join, unite`

- Join array of strings into single string
- If separator specified, insert separator between each element

## Flow Control

### Block syntax

- Blocks start with an `If` or `Else` of function declaration...
- ...and end with an empty line - one empty line ends the innermost scope only.
- EOF ends all current scopes.

### If-Else

- Conditional, with optional `else` block.

```
If <condition>
...code...
Else
...code...
    (empty line)
```

### Loops

- Only `while` loops are supported. Keywords: `while, until`
- Inner code is executed as long as expression is truthy.
- Breaking the loop: `break` or `Break it down`.
- Continue to next iteration: `continue` or `Take it to the top`

### Functions

Declaring functions:

- Function declaration syntax: `<fn-name> takes/wants <arg list>`
- Argument list is separated by `,`, `and`, `&`, `n`.
- Functions always have return value. Keyword: `return, give, send`.
- Return syntax: `<keyword> <var> [back]` (`back` is optional)

```
(This function adds 9 to its input and returns the result)
Polly wants a cracker
Cheese is delicious
Put a cracker with cheese into your mouth
Give it back
```

Calling functions:

- Functions are called with `taking` keyword and min 1 argument
- Argument list is separated by `,`, `and`, `&`, `n`
- Arguments can be expressions (literals, arithmetic ops, fn calls)

```
Multiply taking 3, 5 (is an expression, returns 15)
Search taking "hands", "my hands are"
Put Multiply taking 3, 5, and 9 into Large (Large = 3*5*9)
```
