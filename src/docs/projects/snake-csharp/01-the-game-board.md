# Lesson 1: A Grid Is Just Rows and Columns You Choose to Draw

*(The Static Game Board)*

**User Story**
> As a player, I want to see a bordered game board when I start the program.

**What you will build**
A rectangular border drawn in the terminal — the visible foundation every
future lesson draws on top of. Nothing moves yet; the entire point of this
lesson is understanding exactly how a terminal-based game puts pixels — well,
characters — in specific places on screen at all.

**What you need to know first**
Lesson 0's classes, methods, and `for` loops (assumed from your prior
programming experience, used here in C#'s specific syntax for the first
time in this project).

---

## Concept Unit: `Console.SetCursorPosition` — Placing Text at an Exact Spot

### The Problem

Every `Console.WriteLine` you've used so far prints wherever the cursor
currently is, then moves to a new line. A game board needs precise control:
put this exact character at this exact row and column, without disturbing
anything already drawn elsewhere on screen.

### Introduce the concept in isolation

```csharp
Console.Clear();
Console.SetCursorPosition(10, 2);
Console.Write("X");
Console.SetCursorPosition(0, 5);
Console.Write("Y");
```

Run it on your own machine, in a real terminal window (this is the one
technique in this lesson that needs a real terminal to actually see — more
on why below):

```bash
dotnet run
```

Expected result, to verify yourself: `X` appears 10 characters in, 2 lines
down; `Y` appears at the very start of line 5 — two characters placed at
exact, independent positions, not one after another on the same line the way
plain `Console.Write` calls normally behave.

*What this proves:* `Console.SetCursorPosition(column, row)` moves an
invisible cursor to an exact grid coordinate before the next write —
`column` first, `row` second, both zero-indexed from the top-left corner of
the terminal window.

### Discard the throwaway example

Deleted. Real board-drawing code, using this exact mechanism, follows.

### CS Lens

A terminal is, at its core, a 2D grid of character cells — exactly like a
pixel-based screen, just far lower resolution, one character per cell
instead of one color per pixel. `SetCursorPosition` is doing the same job a
graphics API's "draw at (x, y)" call does, at character granularity instead
of pixel granularity.

### Connection

Every visible thing in this project — the board's border, the snake, food,
the score — is placed on screen using this exact mechanism.

---

## Concept Unit: The Board, Drawn as Nested Loops

### The Problem

A border is a rectangle where only the edge cells are drawn — the classic
"draw a box" problem, solvable with two nested loops and one condition.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch, first real
  project code.
- **Files affected:** `Program.cs`.
- **Change type:** Replace the template's `Hello, World!` line entirely.
- **Location:** The whole file, for now — Lesson 5 introduces real classes
  for this.
- **Dependencies:** None beyond Lesson 0's console project.

### The New Code

```csharp
int width = 20;
int height = 10;

Console.Clear();
for (int row = 0; row < height; row++)
{
    for (int col = 0; col < width; col++)
    {
        bool isEdge = row == 0 || row == height - 1 || col == 0 || col == width - 1;
        char symbol = isEdge ? '#' : ' ';
        Console.SetCursorPosition(col, row);
        Console.Write(symbol);
    }
}
Console.SetCursorPosition(0, height);
```

### The Updated Project

This is the entire new `Program.cs` — replacing the scaffolded template's one
line with the real board-drawing logic.

### Mechanical walkthrough

1. `int width = 20; int height = 10;` — (hard concept reappearing) plain
   `int` locals, explicit types chosen here (not `var`) because there's no
   initializer expression making the type obvious — a deliberate style
   choice named directly in Lesson 0.
2. `for (int row = 0; row < height; row++)` — (hard concept reappearing)
   an ordinary counting loop, one iteration per row.
3. `for (int col = 0; col < width; col++)` — a nested loop, one iteration
   per column, running fully for every single row.
4. `bool isEdge = row == 0 || row == height - 1 || col == 0 || col == width - 1;`
   — (first appearance) `bool`, C#'s boolean type — `true` or `false`,
   nothing else. `||` is logical OR — this line is `true` exactly when the
   current cell is on the top row, bottom row, left column, or right
   column — the four ways a cell can be "on the edge" of the rectangle.
5. `char symbol = isEdge ? '#' : ' ';` — (first appearance) `char`, a single
   character value, written in single quotes (`'#'`, not `"#"` — C#
   distinguishes a one-character `char` from a `string`, even a
   one-character one). The `?:` is the **ternary operator** — `condition ?
   valueIfTrue : valueIfFalse` — a compact `if`/`else` that produces a
   value directly, here choosing `'#'` for edge cells and a blank space
   otherwise.
6. `Console.SetCursorPosition(col, row);` — (hard concept reappearing)
   this unit's own concept, called once per cell, placing the cursor
   exactly where this specific character belongs.
7. `Console.Write(symbol);` — writes the single character, without moving
   to a new line the way `WriteLine` would — necessary here, since the next
   iteration needs to place its own character at a specific position, not
   wherever a newline happened to land the cursor.

### Execution trace

```
row=0, col=0:  isEdge = true (row==0)  → '#' at (0,0)
row=0, col=1:  isEdge = true (row==0)  → '#' at (1,0)
...
row=0, col=19: isEdge = true (row==0)  → '#' at (19,0)
row=1, col=0:  isEdge = true (col==0)  → '#' at (0,1)
row=1, col=1:  isEdge = false          → ' ' at (1,1)
row=1, col=2:  isEdge = false          → ' ' at (2,1)
...
row=1, col=19: isEdge = true (col==19) → '#' at (19,1)
```

*What this proves, traced by hand:* the entire top row (`row == 0`) is
edge, so is the entire bottom row and both side columns — everything else
in between stays blank, producing a hollow rectangle, not a filled one.

### CS Lens

This is a **rasterization** problem in miniature — deciding, for every cell
in a 2D grid, what should be drawn there, based on that cell's own
coordinates. The same fundamental question every 2D and 3D graphics system
answers at a much larger scale, here reduced to its simplest possible case:
one condition, one character.

Also recognized in: this repo's OpenMAT/Calculator projects sampling a
function pixel by pixel, and this curriculum's Kotlin course's own
`Canvas`-based graphing lessons — the same "for every cell/pixel, decide
what belongs there" shape, appearing at every scale from a text border to a
plotted curve.

### SE Lens

Why redraw the *entire* board every time, rather than only the parts that
changed? For a board this small, redrawing everything is simple and fast
enough not to matter — the honest cost only shows up at real scale (a much
larger board, redrawn many times per second), which Lesson 19's difficulty
work touches on directly. Starting with the simplest correct approach and
only optimizing once a real performance problem is felt is the same
Simplicity principle this curriculum's other projects apply repeatedly —
don't solve a performance problem you don't have yet.

### Run it

```bash
dotnet run
```

Verify yourself, in a real terminal: a hollow rectangular border, `#`
characters on all four edges, blank space inside. This is the one output in
this lesson you must confirm visually yourself — `Console.SetCursorPosition`
genuinely requires a real interactive terminal to show its effect; redirected
or captured output (as this lesson's own verification session used) shows
every character written, in order, but without the actual cursor repositioning
a real terminal displays.

### Connection

This exact nested-loop board is what the snake, drawn starting next lesson,
moves around inside of.

---

## Closing

### Connect the pieces

`SetCursorPosition` (unit 1) places one character at one exact grid
coordinate. The nested loop (unit 2) calls it once per cell in a rectangle,
using a boolean edge check and the ternary operator to decide, per cell,
whether it's part of the border — producing the first real, visible piece
of this game.

### What breaks without this

Remove the `Console.SetCursorPosition(col, row);` line, leaving only
`Console.Write(symbol);`. Real, observable failure in a real terminal:
every character still gets written, but one after another on the same
line (or wrapping awkwardly), with no grid shape at all — proof that the
positioning call, not the loop structure, is what actually creates the
2D layout.

### Exercises

- Change the border character from `'#'` to `'*'` and confirm the change.
- Add a second nested loop drawing a smaller rectangle inside the first one,
  to get comfortable with the coordinate math before Lesson 2 needs it for
  a moving object.

### Definition of done

- [ ] A bordered rectangle renders correctly in your own terminal.
- [ ] You can explain, in your own words, why `Console.Write` is used here
      instead of `Console.WriteLine`.
- [ ] You traced the execution by hand, top row through bottom row, and
      confirmed it matches the real output.
- [ ] Commit: `git commit -m "Draw the static game board — first visible output"`.
