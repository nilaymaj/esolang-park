# Befunge-93

Befunge-93 is a two-dimensional esolang created by Chris Pressey, with the goal of being as difficult to compile
as possible. The program is a finite 2D grid of operations, and execution can proceed in any of the four main
directions. This makes watching the execution of a Befunge-93 program particularly satisfying.

Memory in Befunge-93 is a stack of integers. In addition, Befunge-93 programs can be self-modifying - there are
operations that allow accessing and editing the content of the source code at runtime. This means you can also store
runtime data in the source code itself, if space permits.

The [esolang wiki page](https://esolangs.org/wiki/Befunge) contains the complete language-specification, along with
some interesting sample programs.

## Notes for the user

- The program grid is padded with space to size 80x25 before execution.
- Interactive input is not supported in Esolang Park, so currently division-by-zero throws a runtime error.
- `g` and `p` calls that access coordinates outside of the 80x25 grid result in a runtime error.
- Due to being two-dimensional, the breakpoint functionality is rather uncomfortable to use in Befunge-93.

## Implementation details

- To avoid long no-op stretches, the engine keeps track of the bounds of the user's source code. If the pointer reaches
  the end of the _set_ portion of a horizontal line, it immediately loops over to the opposite end of the line. The same
  happens in vertical lines. Try executing `>>>>` to visualise this.

  Note that this does not happen in string mode. In string mode the pointer loops over the full grid, pushing ` ` (space)
  characters onto the stack.

## Possible improvements

- There seems to be some minor issue in the initial grid padding. Some lines get padded to 81 characters instead
  of 80. This is only cosmetic though - the program executes correctly.
