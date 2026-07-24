# Lesson 18: Writing the Reusable Type Yourself

*(A Generic `Grid<T>`)*

**User Story**
> As a developer, I want one reusable grid structure that could hold
> characters for rendering, or numbers for something else entirely,
> without writing two nearly-identical classes.

**What you will build**
Your own generic type, `Grid<T>` — Lesson 0 used `List<T>` as a tool the
standard library already provides; this lesson writes the same kind of
tool yourself, from scratch.

**What you need to know first**
Lesson 0's `List<T>` and Lesson 11's `readonly` — this lesson is where
generics stop being something you only ever consume, and become something
you can design.

---

## Concept Unit: `Grid<T>` — One Class, Any Element Type

### The Problem

This project's board is naturally a 2D grid — and while it's only ever
held `char`s for rendering so far, a genuinely reusable grid structure
shouldn't have to care what it holds. Writing `CharGrid`, then later a
separate, nearly-identical `IntGrid` for some other purpose, would
duplicate the exact same logic for no real reason.

### The New Code

```csharp
class Grid<T>
{
    private T[,] cells;

    public Grid(int width, int height, T defaultValue)
    {
        cells = new T[width, height];
        for (int x = 0; x < width; x++)
            for (int y = 0; y < height; y++)
                cells[x, y] = defaultValue;
    }

    public T Get(int x, int y)
    {
        if (x < 0 || x >= cells.GetLength(0) || y < 0 || y >= cells.GetLength(1))
            throw new ArgumentOutOfRangeException($"({x},{y}) is outside the grid");
        return cells[x, y];
    }

    public void Set(int x, int y, T value)
    {
        cells[x, y] = value;
    }
}
```

Run it, with two genuinely different element types:

```csharp
var boardGrid = new Grid<char>(5, 3, ' ');
boardGrid.Set(2, 1, 'O');
Console.WriteLine($"Cell (2,1): '{boardGrid.Get(2, 1)}'");
Console.WriteLine($"Cell (0,0): '{boardGrid.Get(0, 0)}'");

var scoreGrid = new Grid<int>(3, 3, 0);
scoreGrid.Set(1, 1, 99);
Console.WriteLine($"Score cell (1,1): {scoreGrid.Get(1, 1)}");
```

Real output — verified this session:

```text
Cell (2,1): 'O'
Cell (0,0): ' '
Score cell (1,1): 99
```

*What this proves:* the exact same `Grid<T>` class, written once, correctly
holds `char`s in one instance and `int`s in a completely separate one —
each `Grid<T>` instance is locked to whichever type it was created
with (`Grid<char>` can never accidentally receive an `int`), the same
compile-time guarantee Lesson 0's `List<Integer>` example first
demonstrated, now built by you instead of just used.

### Mechanical walkthrough

1. `class Grid<T>` — (first appearance, as an author) `<T>` after the class
   name declares a **type parameter** — `T` is a placeholder, filled in
   with a real type (`char`, `int`, anything) at the point `Grid<T>` is
   actually used.
2. `private T[,] cells;` — (first appearance) `T[,]` is a **two-dimensional
   array** of `T` — `[,]` (one comma) specifically means a true 2D grid
   with one contiguous block of memory, distinct from an array of arrays.
3. `public Grid(int width, int height, T defaultValue)` — the constructor's
   `defaultValue` parameter is typed `T` too — whatever type this specific
   `Grid` ends up holding, its default value must be that same type,
   checked by the compiler.
4. `cells.GetLength(0)` / `cells.GetLength(1)` — (first appearance) a 2D
   array's own way of reporting its size along each dimension — `0` for
   width, `1` for height, matching the order `new T[width, height]`
   declared them in.
5. `throw new ArgumentOutOfRangeException(...)` — (first appearance) a
   real, built-in .NET exception specifically meant for exactly this
   situation — an index outside a collection's valid range — rather than
   inventing a custom one, since this is a well-established, common enough
   case that .NET already provides the right exception type for it.

### Proving the bounds check works

```csharp
try
{
    boardGrid.Get(100, 100);
}
catch (ArgumentOutOfRangeException ex)
{
    Console.WriteLine($"Caught expected error: {ex.Message}");
}
```

Real output — verified this session:

```text
Caught expected error: Specified argument was out of the range of valid values. (Parameter '(100,100) is outside the grid')
```

*What this proves:* `try`/`catch` (first real appearance in this project)
lets code deliberately handle an exception instead of letting it crash
the whole program — `try` wraps code that might throw; `catch
(ArgumentOutOfRangeException ex)` runs specifically when that exact
exception type (or a subtype of it) is thrown, giving you `ex`, the actual
exception object, including its message.

### CS Lens

This is the same **generic programming** idea from Lesson 0's `List<T>`,
now written from the author's side rather than only the consumer's —
`Grid<T>` is a real, reusable abstraction, checked by the compiler for
every type it's ever used with, with zero duplicated code between a
`Grid<char>` and a `Grid<int>`.

### SE Lens

Why write your own `Grid<T>` instead of just using a `T[,]` array directly
everywhere a grid is needed? Because the bounds-checking logic
(`ArgumentOutOfRangeException` with a clear message) would otherwise need
to be repeated at every single place the board is accessed — wrapping it
in one class means every access automatically gets the same safety check,
in exactly one place, the same "no duplication" principle from Lesson 8's
`GameEntity` applied here to a data structure instead of a class
hierarchy.

### Connection

Lesson 19's difficulty and obstacle features can layer directly on top of
`Grid<T>` — a grid of obstacles is just another `Grid<bool>`, using the
exact same class already built here.

---

## Closing

### Connect the pieces

`Grid<T>` (unit 1) is a real, self-authored generic type, verified to hold
two genuinely different element types correctly and safely, with the
compiler enforcing which type each specific instance actually holds.
`try`/`catch` (unit 2) is how calling code can deliberately handle the
bounds-check exception `Grid<T>` throws, rather than letting an invalid
access crash the whole program.

### What breaks without this

Remove the bounds check from `Get`, calling `cells[x, y]` directly with no
validation. Real, observable consequence: `boardGrid.Get(100, 100)` no
longer throws a clear, informative `ArgumentOutOfRangeException` — instead,
the underlying array itself throws its own `IndexOutOfRangeException`,
with a far less specific message, at whatever exact point the invalid
index happens to be used, which may be much further from the actual
mistake than where `Get` was originally called.

### Exercises

- Add a `Fill(T value)` method to `Grid<T>` that sets every cell to the
  given value in one call.
- Try creating a `Grid<Position>` (Lesson 3's `record`) and confirm it
  works correctly with no changes to `Grid<T>` itself — generic code
  really doesn't care what `T` is, as long as it's a real type.

### Definition of done

- [ ] `Grid<T>` works correctly with at least two different element types,
      verified with real output.
- [ ] The bounds check throws a clear exception, caught and handled,
      verified with real output.
- [ ] You can explain, in your own words, why writing this as `Grid<T>`
      is better than writing separate `CharGrid`/`IntGrid` classes.
- [ ] Commit: `git commit -m "Add a hand-written generic Grid<T> class"`.
