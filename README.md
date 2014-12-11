> Automatically resizes dimensions to make fit the figure in the canvas.

## Grammar format

A valid symbol is a string that starts with an alphabet and then has any number
of alphabets or digits.

Production consist of the symbol to be expanded followed by a `:` then a
sequence of symbols each separated by a whitespace. Sample in the form

```
SYM : S<sub>1</sub> S<sub>2</sub> ... S<sub>n</sub>
```

## Logo Commands

1. FD `x`

Draws a line `x` units in length forward.

2. BK `x`

Draws a line `x` units backwards.

3. COLOR `x`

Sets the color of line drawn to `x`.

4. RT `x`

Turns right by `x` degrees

5. LT `x`

Turns left by `x` degrees

6. PUSH

Saves the turtle state in the stack.

7. POP

Pops the stack into the turtle's state.

8. REPEAT `num` (`cmd`)

Repeats the command `cmd`, `num` times. `cmd` must be parenthesized.

9. DO (`cmd1`) ... (`cmdn`)

Executes the commands `cmd1` to `cmdn` in sequence. Each command must be
parenthesized.

Draw commands are written in the form,
```
SYM = <logo command>
```
