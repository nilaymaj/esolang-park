# Brainfuck

## References

- Esolangs wiki: https://esolangs.org/wiki/Brainfuck

## Implementation details

- The tape is semi-unbounded (0, 1, 2 ...)
- Cell size is 8 bits, and allows values in the range `[-128, 127]`.
- Value `10` is designated for newlines.
- The value `0` is returned on reaching `EOF`.
