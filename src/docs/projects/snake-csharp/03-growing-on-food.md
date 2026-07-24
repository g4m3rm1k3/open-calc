# Lesson 3: The Data Structure Is a Real Design Decision

*(Growing on Food)*

**User Story**
> As a player, I want the snake to grow when it eats food, and new food to
> appear somewhere else on the board.

**What you will build**
Food that appears at a random empty cell; eating it (the head reaching the
food's position) makes the snake permanently longer by one segment, and new
food spawns somewhere else.

**What you need to know first**
Lesson 2's movement loop and `Direction`. Lesson 0's `List<T>` — this lesson
is where you learn there's a better tool for this specific job.

---

## Concept Unit: `record` — A Real Value Type, Properly

### The Problem

The snake's body is a sequence of positions. Lesson 0's `Snake` class used
plain fields for a name and a length; a position needs to be compared for
equality constantly (is the head at the same spot as the food? does a new
segment's position already exist somewhere in the body?) — and Lesson 0
never covered how equality actually works for a type you define yourself.

### Introduce the concept in isolation

```csharp
record Position(int X, int Y);

var a = new Position(3, 4);
var b = new Position(3, 4);
Console.WriteLine(a);
Console.WriteLine(a == b);
Console.WriteLine(a.X);
```

Run it:

```bash
dotnet run
```

Expected output, matching this lesson's later verified examples exactly:
`Position { X = 3, Y = 4 }`, then `True`, then `3`.

*What this proves:* one line, `record Position(int X, int Y);`, gives you a
type with a readable printed form, correct value-based equality (`a == b` is
`true` because both hold the same `X`/`Y`, even though they're two separate
objects in memory), and a real property (`a.X`) — everything Lesson 0's
`Snake` class had to write field-by-field, generated automatically for a
type whose entire job is holding a fixed set of values.

### Discard the throwaway example

Deleted. `Position` becomes a real, permanent type used everywhere in this
project a coordinate is needed.

### Mechanical walkthrough

1. `record Position(int X, int Y);` — (first appearance) `record` — a
   class-like type declaration specifically for value types: things
   defined entirely by their data, where two instances with the same data
   should be treated as equal. `(int X, int Y)` is a **primary
   constructor** — it both declares the constructor's parameters and
   creates matching, real properties (`X`, `Y`) from them, in one line.
2. `a == b` — for a `record`, `==` compares the actual field values, not
   whether they're the same object in memory — a deliberate, useful
   difference from a plain `class`, where `==` defaults to reference
   comparison (a==b would be false for two separately-created objects with
   identical fields, unless you write your own equality by hand).

### CS Lens

This is C#'s dedicated tool for **value semantics** — the same idea this
curriculum's Kotlin course covers as `data class` and its Bowling Game Java
project builds by hand before revealing Java's own `record` keyword. Three
languages, the same underlying idea, converging on "generate a value type's
equality and printing from one declaration" as a real language feature.

### SE Lens

Why not just a plain `class` with public fields? A `record`'s generated
equality is exactly what a coordinate needs and a `class` doesn't give you
for free — using `class` here would mean either writing `Equals`/`GetHashCode`
by hand (real, easy-to-get-wrong work, for no benefit over `record` doing it
correctly) or accidentally relying on broken reference-equality comparisons
without realizing it.

### Connection

`Position` is used for the snake's head, every body segment, and the food's
location, starting in the very next unit.

---

## Concept Unit: `LinkedList<T>` — Choosing the Right Structure for the Job

### The Problem

Every move, the snake's head advances one cell, and (unless it just ate) its
tail segment disappears. `List<T>` (Lesson 0) *can* do this — insert a new
element at index `0`, remove the last element — but it's worth asking
whether it's the *right* tool, not just *a* tool that technically works.

### Introduce the concept in isolation

```csharp
var body = new LinkedList<Position>();
body.AddFirst(new Position(5, 5));
body.AddFirst(new Position(6, 5));
body.AddFirst(new Position(7, 5));
Console.WriteLine("Body after growth, head to tail:");
foreach (var seg in body) Console.WriteLine($"  ({seg.X}, {seg.Y})");

body.AddFirst(new Position(8, 5));
body.RemoveLast();
Console.WriteLine("Body after one move (no growth):");
foreach (var seg in body) Console.WriteLine($"  ({seg.X}, {seg.Y})");
```

Run it:

```bash
dotnet run
```

Real output — verified this session:

```text
Body after growth, head to tail:
  (7, 5)
  (6, 5)
  (5, 5)
Body after one move (no growth):
  (8, 5)
  (7, 5)
  (6, 5)
```

*What this proves:* `AddFirst` puts a new segment at the head end;
`RemoveLast` drops the oldest tail segment — together, exactly "the snake
moved: a new head appeared, the tail shrank by one," with the middle
segments completely untouched.

### Discard the throwaway example

Deleted. `LinkedList<Position>` becomes the snake's real body storage.

### CS Lens

`List<T>` stores its elements contiguously in memory — inserting at the
*front* (`list.Insert(0, item)`) requires shifting every existing element
over by one slot, an **O(n)** operation: the more segments the snake has,
the longer every single move takes. `LinkedList<T>` stores each element in
its own node, linked to its neighbors by reference — adding at the front
(`AddFirst`) or removing from the back (`RemoveLast`) touches only a
constant number of links, regardless of how many segments exist: **O(1)**.
For a snake that only ever grows longer, this difference is not
theoretical — it's the actual reason this project doesn't reach for
`List<T>` here, even though it would "work."

Also recognized in: any queue or deque-shaped problem — a browser's
back/forward history, a text editor's undo stack, a print queue — anywhere
"add to one end, remove from the other, constantly" is the real access
pattern.

### SE Lens

This is a real, honest tradeoff, not a strictly-better choice in every way:
`LinkedList<T>` is slower than `List<T>` for random access by index
(`list[5]`, an O(1) operation for `List<T>`, is O(n) for `LinkedList<T>`,
since it has to walk from one end). This project never needs to access the
snake's body by arbitrary index — only ever the head, the tail, or a full
walk from front to back — which is exactly the access pattern
`LinkedList<T>` is good at and `List<T>`'s strength (fast indexing) is
irrelevant to. Picking a data structure is picking which operations you're
optimizing for, honestly, based on how the structure is actually used —
not defaulting to whichever one is most familiar.

### Connection

This is the real body storage `Snake` (formalized properly as a class in
Lesson 5) uses from here forward.

---

## Concept Unit: Spawning Food, and Checking for Collisions

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `Program.cs`.
- **Change type:** Add food spawning and eating logic to the existing game
  loop.
- **Location:** Inside the main loop, after moving the head each tick.
- **Dependencies:** `Position`, `LinkedList<Position>`, `Random`.

### The New Code

```csharp
var rng = new Random();

Position SpawnFood(LinkedList<Position> snakeBody, int width, int height)
{
    Position candidate;
    do
    {
        candidate = new Position(rng.Next(1, width - 1), rng.Next(1, height - 1));
    } while (snakeBody.Contains(candidate));
    return candidate;
}
```

### The Updated Project

Inside the main loop, after the head's new position is computed and added:

```csharp
body.AddFirst(newHead);

if (newHead == food)
{
    food = SpawnFood(body, width, height);
    // tail is NOT removed this tick — this is exactly how growth happens
}
else
{
    body.RemoveLast();
}
```

### Mechanical walkthrough

1. `var rng = new Random();` — (first appearance) `Random` generates
   pseudo-random numbers; created once, outside the loop, and reused —
   creating a *new* `Random()` every tick is a real, common mistake
   (multiple `Random` objects created in quick succession can produce
   identical sequences, since they're commonly seeded from the system
   clock).
2. `rng.Next(1, width - 1)` — (first appearance) returns a random `int`,
   inclusive of the first argument, exclusive of the second — `1` to
   `width - 2` here, deliberately staying inside the board's border drawn
   in Lesson 1, never on the edge itself.
3. `do { ... } while (snakeBody.Contains(candidate));` — (first appearance)
   a **do-while loop** — the body runs at least once before the condition
   is even checked, which is exactly right here: you need a candidate
   position *before* you can ask whether it's valid, unlike a `while` loop,
   which checks its condition first.
4. `snakeBody.Contains(candidate)` — (hard concept reappearing) relies
   directly on `Position` being a `record` — `Contains` walks the list
   calling `.Equals()` on each element, and `record`'s generated equality is
   exactly correct here.
5. `if (newHead == food) { ... } else { body.RemoveLast(); }` — the entire
   growth mechanism: on an ordinary move, the tail is removed (net length
   unchanged); on an eaten-food move, it isn't (net length increases by
   one) — growth isn't a separate operation, it's the *absence* of the
   usual cleanup step.

### CS Lens

The `Contains` check inside `SpawnFood`'s loop is doing real, repeated work
proportional to the snake's current length — for a snake this small, that
cost is invisible; naming it honestly here previews exactly the kind of
cost Lesson 19's difficulty/performance discussion returns to at a larger
scale.

### SE Lens

Why is growth the *lack* of a `RemoveLast()` call, rather than its own
explicit "add a segment" operation? Because it keeps one single fact true
regardless of what happened this tick — the body's length only ever changes
by exactly the amount eating food should change it by, with no separate
code path that could grow the snake by the wrong amount, or forget to
shrink it back on an ordinary move. One rule, applied consistently, beats
two rules that have to agree with each other.

### Run it

```bash
dotnet run
```

Verify yourself: the snake grows by one segment each time it reaches the
food's position, and new food appears somewhere else, never inside the
snake's own body.

---

## Closing

### Connect the pieces

`record Position` (unit 1) gives coordinates correct, automatic equality —
without it, `LinkedList<Position>.Contains` (unit 2) and the `newHead ==
food` check (unit 3) would both silently do the wrong thing, comparing
object identity instead of actual coordinates. `LinkedList<Position>`'s
`AddFirst`/`RemoveLast` shape (unit 2) is a deliberate, justified choice
over `List<T>`, not an arbitrary one. Growth (unit 3) falls out naturally
from skipping the tail-removal step exactly once, on the tick food is
eaten.

### What breaks without this

Change `Position` from a `record` to a plain `class` (removing the
generated equality). Real, observable consequence: `newHead == food` now
compares object *references*, not coordinates — even when the head is
genuinely standing on the food's exact tile, `==` returns `false`, because
they're two separate objects in memory, and the snake never grows,
regardless of how much food it visibly walks over. Restore `record` and
eating works correctly again.

### Exercises

- Trigger the broken-equality bug above yourself, then fix it, and confirm
  eating works again.
- Rewrite `SpawnFood` using `List<Position>` instead of checking
  `LinkedList<Position>.Contains`, and consider (you don't need to
  benchmark it) whether this specific check's cost depends on which
  collection type stores the body at all — is `Contains` here it's own
  separate cost from the `List` vs `LinkedList` insert/remove tradeoff, or
  the same one?

### Definition of done

- [ ] The snake grows correctly when it eats food, verified visually.
- [ ] New food never spawns inside the snake's own body, verified over
      several eats.
- [ ] You can explain, in your own words, why `LinkedList<Position>` was
      chosen over `List<Position>` for the body specifically.
- [ ] Commit: `git commit -m "Add food spawning and growth — Position as a record, body as a LinkedList"`.
