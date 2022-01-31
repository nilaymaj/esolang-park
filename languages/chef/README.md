# Chef

## References

- David Morgan-Mar's Chef page: https://www.dangermouse.net/esoteric/chef.html

## Implementation details

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
