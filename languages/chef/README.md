# Chef

- Ingredient names are case-sensitive and must not contain periods.
- Auxiliary recipe names are case-sensitive. If the recipe title is `Chocolate Sauce`, calling instruction must be `Serve with Chocolate Sauce` and not `Serve with chocolate sauce`.
- Each method instruction must end with a period.
- The method section can be spread across multiple lines.
- A single method instruction cannot roll over to the next line.
- The Chef language involves usage of present and past forms of verbs:
  ```
  Blend the sugar
  <other instructions>
  Shake the mixture until blended
  ```
  The Esolang Park interpreter cannot convert verbs between the two forms, so we adopt the following convention: the past form of the verb is the same as the present form of the verb. So the above example must be changed to the following for Esolang Park:
  ```
  Blend the sugar
  <other instructions>
  Shake the mixture until blend
  ```
