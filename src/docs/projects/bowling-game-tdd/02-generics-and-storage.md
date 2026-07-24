# Lesson 2: The Fake Stops Working

*(All Ones Scores Twenty — Real Storage via Generics)*

**User Story**
> As a developer, I want a test that forces `Game` to actually remember
> what was rolled, instead of returning a hardcoded number.

**What you will build**
A second test — every roll knocks down one pin, twenty rolls, score should
be `20` — chosen specifically because Lesson 1's `return 0;` fails it. This
forces `Game` to actually store rolls, which means confronting Java's
generics for the first time.

**What you need to know first**
Lesson 1's red-green-refactor cycle and fake implementation. Lesson 0's
primitive/wrapper distinction — this lesson is where it stops being
abstract.

---

## Concept Unit: Red — The Fake Gets Caught

### The New Code

```java
@Test
void allOnesScoresTwenty() {
    Game game = new Game();
    for (int i = 0; i < 20; i++) {
        game.roll(1);
    }
    assertEquals(20, game.score());
}
```

### Run it against Lesson 1's fake `Game`

Real output — verified this session:

```text
[         2 tests found           ]
[         1 tests successful      ]
[         1 tests failed          ]

Failures (1):
  JUnit Jupiter:GameTest:allOnesScoresTwenty()
    => org.opentest4j.AssertionFailedError: expected: <20> but was: <0>
```

*What this proves:* the previous test still passes (`gutterGameScoresZero`
never stopped being true), but this new one correctly catches the fake —
`score()` still always returns `0`, and now something disagrees. This is
exactly the moment "fake it till you make it" is supposed to produce: the
fake implementation, caught by a test specifically chosen to catch it.

---

## Concept Unit: Generics — Why `List<Integer>`, Not `List<int>`

### The Problem

Scoring `20` for twenty rolls of `1` requires actually remembering every
roll, not just the fact that `roll()` was called. Java's built-in growable
collection is `List` — but `List` needs to be told what type of thing it
holds, and (per Lesson 0) that type must be an object, not a primitive.

### Introduce the concept in isolation

```java
class Box<T> {
    private T contents;

    void put(T item) { this.contents = item; }
    T get() { return contents; }
}

public class BoxDemo {
    public static void main(String[] args) {
        Box<String> stringBox = new Box<>();
        stringBox.put("hello");
        System.out.println(stringBox.get());

        Box<Integer> intBox = new Box<>();
        intBox.put(5);
        int fivePlusOne = intBox.get() + 1;
        System.out.println(fivePlusOne);
    }
}
```

Run it:

```bash
javac BoxDemo.java
java BoxDemo
```

Real output — verified this session:

```text
hello
6
```

*What this proves:* `Box<T>` is written **once**, and `T` is a
placeholder filled in differently at each use site — `Box<String>` and
`Box<Integer>` are both real, distinct, type-checked usages of the exact
same class, with no casting and no risk of putting a `String` into what
was declared as a `Box<Integer>` (the compiler would reject that at
compile time). `intBox.get() + 1` works because `intBox.get()` returns an
`Integer`, and Lesson 0's autoboxing/unboxing mechanism converts it to an
`int` automatically for the `+` operation.

### Discard the throwaway example

Deleted. `Box<T>` never appears in the real project — `java.util.List<T>`,
a real generic type the JDK already provides, is what `Game` actually
uses.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `Game.java`.
- **Change type:** Replace the empty `roll()`/hardcoded `score()` with
  real storage and summation.
- **Location:** Both methods, entirely.
- **Dependencies:** `java.util.List`, `java.util.ArrayList`.

### The New Code

```java
import java.util.ArrayList;
import java.util.List;

class Game {
    private final List<Integer> rolls = new ArrayList<>();

    void roll(int pins) {
        rolls.add(pins);
    }

    int score() {
        int total = 0;
        for (int pins : rolls) {
            total += pins;
        }
        return total;
    }
}
```

### The Updated Project

This replaces the entire body of both methods from Lesson 1 — shown here
as the complete, current `Game.java`, since both methods changed.

### Mechanical walkthrough

1. `import java.util.ArrayList; import java.util.List;` — (hard concept
   reappearing) ordinary imports; `List` is an **interface** (Lesson 12
   covers interfaces properly; for now, know that `List` describes *what*
   a growable sequence can do, and `ArrayList` is *one* concrete
   implementation of it).
2. `private final List<Integer> rolls = new ArrayList<>();` — (first
   appearance) `private` (Lesson 0's access modifiers, applied for real —
   nothing outside `Game` should touch this list directly). `final` means
   `rolls` itself can never be reassigned to a different list object
   (though its *contents* can still change — `final` on a reference is not
   the same as immutability of what it points to). `List<Integer>` — a
   `List`, specifically of `Integer`, never raw `int`, per this unit's own
   concept lab. `new ArrayList<>()` — the empty diamond `<>` lets the
   compiler infer the type argument (`Integer`) from the variable's
   declared type, instead of repeating `new ArrayList<Integer>()`.
3. `rolls.add(pins);` — (first appearance) `pins` is a primitive `int`;
   `add` expects an `Integer` (`List<Integer>`'s type parameter) — Java
   autoboxes `pins` automatically here, the same mechanism Lesson 0
   proved, now happening silently and safely (never `null`, so no
   unboxing crash risk on this side).
4. `for (int pins : rolls)` — (first appearance) Java's **enhanced
   for-loop** (for-each) — `pins` here is unboxed automatically back to
   `int` from each `Integer` in the list, one at a time, in insertion
   order.
5. `total += pins;` — ordinary accumulation, already-basic syntax.

### Run it

Real output — verified this session:

```text
[         2 tests found           ]
[         2 tests successful      ]
[         0 tests failed          ]
```

*What this proves:* both tests pass now — the gutter game (sum of twenty
zeros is `0`) and all-ones (sum of twenty ones is `20`) — with one real,
general summing implementation, not two special cases.

### CS Lens

`List<Integer>` is Java's version of **generic programming** — writing a
container once, usable for any type, with the compiler checking type
correctness at every use site rather than at runtime. Also recognized in:
this curriculum's Kotlin course's own `List<T>`/generic classes, and C#'s
generics from the WPF course — three languages, extremely similar
mechanism, different declaration syntax (`<T>` in all three, but each
language's variance/bounds rules differ in ways later lessons will touch).

### SE Lens

Why `List<Integer>` and not a raw, un-parameterized `List` (legal in Java,
for backward compatibility with code written before generics existed in
2004)? A raw `List` gives up all compile-time type checking — you could
`add("oops")` a `String` into it and the mistake wouldn't surface until a
runtime `ClassCastException`, far from where the bad data was actually
inserted. `List<Integer>` catches that exact mistake at compile time,
right where it happens — the entire benefit generics exist to provide.

### Connection

This naive "sum every roll" implementation is correct for open frames
(Lesson 3 confirms this directly) but will be proven wrong the moment a
spare or strike test arrives (Lesson 4) — which is precisely the next
honest limit this design will hit.

---

## Closing

### Connect the pieces

Lesson 1's fake `score()` was caught (unit 1) by a test specifically
chosen to catch it. `Box<T>` (unit 2) proved what a generic type actually
is and why `List<Integer>`, not `List<int>`, is the only legal shape —
Java's generics require a reference type, and `Integer` is `int`'s wrapper.
`Game` now really stores every roll and really sums them, verified with
two passing tests.

### What breaks without this

Change `List<Integer> rolls` to a raw `List rolls` (no type parameter) and
try `rolls.add("not a number")` somewhere. Real, observable failure: it
compiles without complaint — raw types give up all compile-time checking —
and would only surface as a `ClassCastException` far later, the first time
something tried to treat that entry as a number. Restore `List<Integer>`
and the same bad line becomes an immediate compile error instead.

### Exercises

- Try `rolls.add("oops")` with `List<Integer>` in place (not raw) and read
  the real compile error — confirm it's caught exactly where the mistake
  happens.
- Add a third test — "a game of all twos scores 40" — and confirm it
  passes with zero code changes, proving the current implementation is
  genuinely general, not coincidentally right for two specific cases.

### Definition of done

- [ ] You triggered the real Lesson-1-fake-caught failure yourself.
- [ ] `Game` genuinely stores and sums real rolls now, verified by two
      passing tests plus your own third test.
- [ ] You can explain, in your own words, why `List<int>` isn't legal
      Java.
- [ ] Commit: `git commit -m "Red-green-refactor cycle #2: real roll storage via List<Integer>, replacing the fake score()"`.
