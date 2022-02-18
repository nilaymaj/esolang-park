# Chef

Chef is a stack-based Turing-complete esolang created by David Morgan-Mar in 2002, in which programs read
like cooking recipes. An important guideline while writing Chef programs/recipes is for the recipe to be easy
to prepare and delicious. The complete language specification is available on the
[official Chef homepage](https://www.dangermouse.net/esoteric/chef.html).

## Notes for the user

- Ingredient names are case-sensitive and must contain only letters and spaces.

- Auxiliary recipe names are case-sensitive. If the recipe title is `Chocolate Sauce`, calling instruction must be `Serve with Chocolate Sauce` and not `Serve with chocolate sauce`.

- Each method instruction must end with a period.

- Method instructions can be located on separate lines, the same line or a mix of both. The following is a valid Chef recipe method:

  ```
  Put salt into the mixing bowl. Mix well.
  Fold sugar into the mixing bowl. Clean the mixing bowl.
  ```

  Note that a single method instruction cannot roll over to the next line, though.

- The Chef language involves usage of present and past forms of verbs:
  ```
  Blend the sugar.
  <other instructions>
  Shake the mixture until blended.
  ```
  The Esolang Park interpreter cannot convert verbs between the two forms, so we adopt the following convention: the past form of the verb is the same as the present form of the verb. So the above example must be changed to the following for Esolang Park:
  ```
  Blend the sugar.
  <other instructions>
  Shake the mixture until blend.
  ```

## Implementation details

- The parser is hand-built and uses regular expressions for basically everything.
- The engine is split in two classes: `Kitchen` handles kitchen-related operations while the main class
  handles control-flow operations and manages the call-stack.

## Possible improvements

- Allow case-insensitive usage of auxiliary recipe names.

- Chef syntax is flat and simple, easily representable by regular expressions. This means that syntax highlighting for
  Chef can easily be made perfect by slightly modifying and reusing parser regexes for the Monarch tokenizer. Currently
  the method part of syntax highlighting just highlights the known keywords.

- We need to find a sensible solution for the verb tense issue mentioned above. Currently, any Chef program involving loops
  requires modifications to be run in Esolang Park. Importing a very lightweight English verb-dictionary and only allowing
  verbs from this dictionary is a possible way to resolve this.
