# Brainfuck

Brainfuck is perhaps the most popular esoteric programming language, created by Urban Müller in 1993.
It is Turing-complete and has 8 instructions which operate on a linear array of cells storing integer values.
The [esolangs wiki page](https://esolangs.org/wiki/Brainfuck) contains the language specification and some
sample programs.

Note that brainfuck has minor variants which primarily differ in the workings of the cell array. You may find
many brainfuck programs which don't work correctly on Esolang Park.

## Notes for the user

- The cell array is semi-infinite. There is no cell to the left of the initial cell, and trying to go left
  anyway will result in a runtime error. The right side of the cell array is unbounded.
- Cell size is 8 bits, and allows values in the range `[-128, 127]`. Values loop over to the other side on reaching the bounds.
- The usual ASCII value `10` is designated for newlines.
- The value `0` is returned in input (`,`) operations on reaching `EOF`.

## Possible improvements

- The renderer currently uses Blueprint's `Card` component. This leads to performance issues when the stack grows large.
  Usage of this component should be replaced by a simple custom component to drastically improve performance. Look at the
  `SimpleTag` component used in the Shakespeare renderer for an example.
