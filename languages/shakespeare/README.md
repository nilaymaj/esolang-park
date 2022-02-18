# Shakespeare

Shakespeare is a programming language that reads like a Shakespearean play, usually involving characters  
appreciating and (rather roughly) criticizing other characters. It was created by Karl Wiberg and Jon Åslund
as part of a university course assignment in 2001.

The original resource page is [hosted on Sourceforge](http://shakespearelang.sourceforge.net). It contains the
[language specification PDF](http://shakespearelang.sourceforge.net/report/shakespeare.pdf) and a Shakespeare-to-C
transpiler written with Flex and Bison in C, along with links to some other related resources.

The specification and the transpiler source code are the only references used while implementing the Shakespeare
language for Esolang Park.

## Notes for the user

- It is not necessary for questions to immediately be followed by conditionals. Conditionals
  must immediately follow a question though - a runtime error is thrown otherwise.

- Empty acts and scenes are invalid. An act must contain at least one scene, and a scene must contain
  at least one dialogue set or entry-exit clause.

## Implementation details

- The parser is implemented with [Chevrotain](https://chevrotain.io).
- The engine is quite small in size, and is a single file (`runtime.ts`).
- The renderer uses a custom component instead of Blueprint's `Tag` component for much better performance.

## Possible improvements

- Currently, the check that conditionals must be preceded immediately by a question is done at runtime. It is a static
  check and should be done while parsing the program instead.

- Syntax highlighting doesn't work for multi-word keywords that break into two lines (`... summer's \n day ...`).
