# Lesson 6: An Object Controls How It Answers "What's Your State?"

*(Encapsulation via Properties)*

**User Story**
> As a developer, I want the score to be readable from anywhere, but only
> changeable through rules the score itself enforces.

**What you will build**
A real score-tracking object, using C#'s dedicated syntax for controlled
access to an object's state — necessary before Lesson 7's interfaces can
expose position and health information cleanly.

**What you need to know first**
Lesson 0's private fields and Lesson 5's interfaces — this lesson is what
makes exposing an interface's state idiomatic C#, rather than a method
named `GetX()`.

---

## Concept Unit: `get`/`set` — A Field With Rules Attached

### The Problem

Lesson 0's `Snake` class kept `length` fully `private`, with `Grow()` as the
only way to change it — correct, but there was no way to *read* `length`
from outside the class at all. A score needs to be readable from
anywhere (the display, an achievement system, Lesson 16's persistence) but
still only changeable through rules the object itself enforces — never set
to a nonsensical negative number, say.

### Introduce the concept in isolation

```csharp
var score = new ScoreTracker();
Console.WriteLine($"Initial score: {score.Points}");
score.Points = 50;
Console.WriteLine($"After setting 50: {score.Points}");
score.Points = -10;
Console.WriteLine($"After attempting -10: {score.Points}");
Console.WriteLine($"Is high score: {score.IsHighScore}");

class ScoreTracker
{
    private int points;

    public int Points
    {
        get { return points; }
        set
        {
            if (value < 0) return;
            points = value;
        }
    }

    public bool IsHighScore => points >= 50;
}
```

Run it:

```bash
dotnet run
```

Real output — verified this session:

```text
Initial score: 0
After setting 50: 50
After attempting -10: 50
Is high score: True
```

*What this proves:* `score.Points = 50;` looks exactly like setting a plain
public field — but it isn't one. `score.Points = -10;` was silently
rejected (the score stayed at `50`), because the `set` block ran its own
check first. Reading `score.Points` from outside the class works fine —
only *writing* it goes through a rule the class itself controls.

### Mechanical walkthrough

1. `public int Points { get { ... } set { ... } }` — (first appearance) a
   **property** — from outside the class, `score.Points` reads and writes
   exactly like a public field would; from inside, `get` and `set` are real
   code blocks that run every single time.
2. `get { return points; }` — runs whenever code *reads* `score.Points`,
   here just returning the private field directly.
3. `set { if (value < 0) return; points = value; }` — runs whenever code
   *writes* `score.Points = ...`. `value` is a special, automatically
   available name inside a `set` block — it holds whatever was assigned
   (`50`, then `-10`, in the calls above). `if (value < 0) return;` exits
   the setter immediately, without touching `points` at all, if the new
   value is invalid.
4. `public bool IsHighScore => points >= 50;` — (first appearance) an
   **expression-bodied property** — `=>` here means "this property's value
   *is* this expression," recomputed fresh every time it's read, with no
   separate `get { }` block needed for something this simple. There's no
   `set` at all — `IsHighScore` is **read-only**, computed from `points`,
   never assigned directly.

### CS Lens

A property is C#'s syntax for exactly Lesson 0's messaging idea, applied
specifically to "reading" and "writing" as their own kinds of messages —
`score.Points` (read) and `score.Points = 50` (write) are two different
messages, and the object decides, independently, how to respond to each
one. This is a genuinely different mechanism from a plain public field,
even though the calling syntax looks identical — that similarity is
deliberate on C#'s part, so a class can start with a plain field and
upgrade to a property later without breaking any code that uses it.

Also recognized in: this curriculum's Kotlin course's own properties
(Kotlin's `var`/`val` class members are properties by default, with the
same `get`/`set` mechanism available), and Python's `@property` decorator —
the same idea, different syntax, in a language whose default
(uncontrolled public attributes) this feature exists specifically to fix.

### SE Lens

Why not just use a public field for `Points` and a separate `IsValidScore`
method callers remember to check before setting it? Because that relies on
every single caller remembering to check — one forgotten check, anywhere in
a large codebase, and an invalid negative score gets in. A property
enforces the rule in exactly one place, every time, regardless of how many
places in the codebase eventually set `Points`.

### Connection

Lesson 7's `ICollidable` interface exposes a `Position` property using this
exact syntax — every game object's position is readable from outside, but
only changeable through each object's own movement logic.

---

## Concept Unit: Auto-Properties — When There Are No Extra Rules

### The Problem

Writing out a full `get`/`set` block with a backing field is real
ceremony for the extremely common case where a property has no special
rules at all — just "store this value, let anyone read and write it."

### The construct, named

```csharp
public class Food
{
    public int X { get; set; }
    public int Y { get; set; }
}
```

`{ get; set; }` with no bodies at all is an **auto-property** — the
compiler generates a hidden, private backing field for you automatically.
This is functionally identical to writing out `private int x; public int X
{ get { return x; } set { x = value; } }` by hand, for the specific case of
"no extra logic needed."

### SE Lens

When should a property be an auto-property versus a full `get`/`set` with
real logic? The moment there's a rule to enforce (Lesson 5's `Points`
rejecting negative values) or a value to compute rather than store
(`IsHighScore`), a full property is the right tool. For plain data with no
rules at all, an auto-property says exactly that, with no ceremony
implying rules exist when they don't.

### Connection

Lesson 7's interfaces declare properties using the exact same `{ get; }`
(read-only) or `{ get; set; }` syntax — an interface can require a
property exist without dictating whether the implementing class uses a
full property or an auto-property to provide it.

---

## Closing

### Connect the pieces

A full property (unit 1) lets `ScoreTracker` control exactly how `Points`
responds to being read versus written, enforcing a real rule (never
negative) in exactly one place — verified with real output showing an
invalid write silently rejected. Auto-properties (unit 2) are the same
mechanism, with the ceremony removed for the common case where no rule is
needed.

### What breaks without this

Change `Points` from a property back to a plain public field (`public int
Points;`) with no validation. Real, observable consequence:
`score.Points = -10;` now succeeds unconditionally — there's no code path
left to reject it, because a plain field has no `set` logic to run at all.
Restore the property and the rule is enforced again.

### Exercises

- Add a `Level` property to `ScoreTracker`, computed (read-only, using
  `=>`) as `points / 100` — confirm it updates automatically as `Points`
  changes, with no separate code needed to keep it in sync.
- Try setting `score.IsHighScore = true;` directly and read the real
  compile error — connect it to `IsHighScore` having no `set` at all.

### Definition of done

- [ ] `ScoreTracker.Points` correctly rejects negative values, verified
      with real output.
- [ ] `IsHighScore` computes correctly and cannot be assigned directly.
- [ ] You can explain, in your own words, the real difference between a
      property and a plain public field, even though they look identical
      to call.
- [ ] Commit: `git commit -m "Add ScoreTracker using properties for controlled access to game state"`.
