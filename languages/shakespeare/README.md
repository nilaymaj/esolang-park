# Shakespeare

## References

- Official documentation and implementation: http://shakespearelang.sourceforge.net

## Implementation details

- It is not necessary for questions to immediately be followed by conditionals. Conditionals
  must immediately follow a question though - a runtime error is thrown otherwise.

- Empty acts and scenes are invalid. An act must contain at least one scene, and a scene must contain
  at least one dialogue set or entry-exit clause.
