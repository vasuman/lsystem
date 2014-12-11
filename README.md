> Automatically resizes dimensions to make fit the figure in the canvas.

## Grammar format

A valid symbol is a string that starts with an alphabet and then has any number
of alphabets or digits.

Production consist of the symbol to be expanded followed by a `:` then a
sequence of symbols each separated by a whitespace. Sample in the form

```
SYM : S1 S2 ... Sn
```

## Logo Commands

* FD `x`

Draws a line `x` units in length forward.

* BK `x`

Draws a line `x` units backwards.

* COLOR `x`

Sets the color of line drawn to `x`.

* RT `x`

Turns right by `x` degrees

* LT `x`

Turns left by `x` degrees

* PUSH

Saves the turtle state in the stack.

* POP

Pops the stack into the turtle's state.

* REPEAT `num` (`cmd`)

Repeats the command `cmd`, `num` times. `cmd` must be parenthesized.

* DO (`cmd1`) ... (`cmdn`)

Executes the commands `cmd1` to `cmdn` in sequence. Each command must be
parenthesized.

Draw commands are written in the form,
```
SYM = <logo command>
```

Check out the presets.
