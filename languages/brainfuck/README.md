# Brainfuck

## Allowed symbols

- `>`: Move the pointer to the right
- `<`: Move the pointer to the left
- `+`: Increment the memory cell at the pointer
- `-`: Decrement the memory cell at the pointer
- `.`: Output the character signified by the cell at the pointer
- `,`: Input a character and store it in the cell at the pointer
- `[`: Jump past the matching `]` if the cell at the pointer is 0
- `]`: Jump back to the matching `[` if the cell at the pointer is nonzero

## Memory specifications

> These parameters will be configurable when engine configuration is added to the project

- For Turing-completeness, the number of cells is kept unbounded.
- Cell size is 8 bits, and allows values in the range `[-128, 127]`.
- Value `10` is designated for newlines.
- The value `0` is returned on reaching `EOF`.
