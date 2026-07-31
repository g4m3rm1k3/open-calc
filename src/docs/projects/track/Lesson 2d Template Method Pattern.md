# Lesson 2d: The Template Method Pattern — A Fixed Sequence, One Step Filled In

**What you will build:** A small, fully runnable, hand-rolled lab,
building on Lesson 2a's `MiniFramework`.

**What you need to know first:** Lesson 2a's inversion of control,
Lesson 0p's sealing.

**Terms introduced in this lesson:**

- **Template method pattern** — a base class (or framework) defines a
  fixed sequence of steps and defers one or more individual steps to a
  subclass's own overridden method.

---

## Concept Unit: The Template Method Pattern — A Fixed Sequence, One Step Filled In

### The Problem

`MiniFramework.run()`, from Lesson 2a, called exactly one overridable
step, `onStart()`. Real frameworks typically define a longer, fixed
*sequence* of steps — start up, then run, then shut down, in a
guaranteed order — filling in only some of those steps from the
subclass, while keeping the overall order itself completely outside the
subclass's control.

### Introduce the Concept in Isolation

```
mkdir lesson-2d
cd lesson-2d
```

Create `Main.java`:

```java
abstract class MiniFramework {
    final void run() {
        setup();
        execute();
        teardown();
    }

    void setup() {
        System.out.println("Default setup.");
    }

    abstract void execute();

    void teardown() {
        System.out.println("Default teardown.");
    }
}

class MyProgram extends MiniFramework {
    void execute() {
        System.out.println("My code is running now.");
    }
}

public class Main {
    public static void main(String[] args) {
        MyProgram program = new MyProgram();
        program.run();
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

The terminal prints:

```
Default setup.
My code is running now.
Default teardown.
```

`run()` is now marked `final` (Lesson 0p's sealing, reused: no subclass
may override the sequence itself), and calls three steps in a fixed
order — `setup()`, `execute()`, `teardown()` — where `MyProgram` only
overrides `execute()`, inheriting `setup()`/`teardown()`'s default
behavior unchanged, confirmed by the real output above. This is the
`template method pattern` — **first appearance**: a base class (or
framework) defines a fixed sequence of steps and defers one or more
individual steps to a subclass's own overridden method.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `final void run() { ... }` — **(b) reappearing** sealing from Lesson
   0p, here specifically preventing the *sequence itself* from ever
   being overridden, even though individual steps inside it can be.
2. `setup()`, `execute()`, `teardown()`, called in that fixed order —
   the **template**: a sequence `MiniFramework` alone controls
   completely.
3. `void setup() { ... }` and `void teardown() { ... }` — ordinary,
   non-abstract methods with real default bodies, overridable but not
   required to be overridden — **(a) first appearance** of this
   specific role: an optional customization point, distinct from
   `execute()`'s required one.
4. `abstract void execute();` — **(b) reappearing** abstract method
   from Lesson 2a: the one step every subclass *must* supply.
5. `class MyProgram extends MiniFramework { void execute() { ... } }` —
   overrides only the required step; `setup()`/`teardown()` run using
   `MiniFramework`'s own default bodies, unchanged, because `MyProgram`
   never touched them.

### CS Lens

The template method pattern is inversion of control given a specific,
named shape: not just "the framework calls you," but "the framework
calls you at these specific, ordered points, some required, some
optional." This is exactly the shape behind Android calling
`onCreate()` on an Activity — the next lesson's own subject — the
framework owns the sequence, an override fills in one step of it.

Also recognized in: any base class's "lifecycle" methods across
virtually every UI or application framework, `unittest.TestCase`'s
`setUp()`/`test*()`/`tearDown()` sequence in Python (structurally
identical to this lesson's own `setup`/`execute`/`teardown`), any
algorithm skeleton with pluggable steps in classic design-pattern
literature.

### SE Lens

The alternative — giving `MyProgram` full control, letting it override
`run()` itself directly — was not chosen for frameworks that need to
guarantee a specific order happens no matter what any subclass does;
sealing `run()` with `final` is what makes that guarantee real rather
than advisory. The cost: a subclass genuinely cannot reorder or skip
steps, even if it wanted to — a deliberate tradeoff, trading subclass
flexibility for a sequence guarantee the framework's own correctness
may depend on.

---

## Connect the Pieces

Lesson 2a's `MiniFramework.run()` called one overridable step. This
lesson expanded that to a fixed, three-step sequence — `setup()`,
`execute()`, `teardown()` — with only `execute()` required and the
whole sequence sealed against being overridden. The next lesson
(Activity) shows Android's own real version of exactly this shape.

## What Breaks Without This

Remove `final` from `MiniFramework.run()` and let `MyProgram` override
it directly:

```java
class MyProgram extends MiniFramework {
    @Override
    void run() {
        System.out.println("I skipped setup and teardown entirely.");
    }

    void execute() {
        System.out.println("This never even runs now.");
    }
}
```

Run it yourself and see the real output — `setup()` and `teardown()`
never run at all, and `execute()`, still declared abstract and still
required to compile, is never called either.

## Exercises

1. Add a fourth step to `MiniFramework`'s template (e.g. `validate()`,
   called before `setup()`), required (`abstract`), and update
   `MyProgram` to supply it — confirm the new step runs in the correct
   position in the printed order.
2. Reproduce "What Breaks Without This" yourself, and add a `print`
   statement inside `execute()` too, confirming — by actually running
   it — that overriding `run()` entirely really does mean `execute()`
   is never called, not just skipped silently.
3. Explain, in your own words, why `setup()`/`teardown()` have real
   default bodies while `execute()` has none.

## Definition of Done

- [ ] You ran the `setup`/`execute`/`teardown` example and saw all
      three steps run in the fixed order.
- [ ] You completed Exercise 2 and confirmed, by actually running it,
      that skipping `final` really does let a subclass discard the
      whole sequence.
- [ ] You can state, without looking back at this lesson, which steps
      in this lesson's template are required and which are optional.
