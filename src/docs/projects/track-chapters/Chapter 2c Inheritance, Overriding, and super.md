# Chapter 2, Lesson C: Inheritance, Overriding, and `super`

**What you will build:** Nothing app-related yet — a tiny `Base`/`Child`
pair, entirely outside Android, proving that a parent class can call a
method a child class overrides, and that the parent — not you —
decides *when* that call happens. The transferable problem: the
capstone of this chapter shows `MainActivity extends AppCompatActivity`
and a method, `onCreate`, that you never call yourself, yet clearly
runs. Before touching Android's real version of this (which has many
methods and real consequences), prove the underlying mechanism with a
throwaway example you fully control.

**What you need to know first:** Chapter 2A (class, object, `new`,
instance method). Chapter 2B (annotation — inert metadata by default,
and the preview that `@Override` is one of the rare exceptions
`javac` itself checks).

**Terms introduced in this lesson:**
- **`extends`** — declares that a class inherits another class's fields
  and methods, plus whatever it adds or overrides itself.
- **Parent class / child class** — the class being inherited from, and
  the class doing the inheriting.
- **Overriding** — a subclass supplying its own body for a method the
  parent class already declared, replacing what runs when that method
  is called on an object of the subclass.
- **`@Override`** — one of the small handful of annotations `javac`
  itself has real, specific logic for: checks that a method really does
  replace one from the parent class, turning a typo'd method name into
  a compile error instead of a silent bug.
- **`super`** — refers to "the parent class's own version of this,"
  used to explicitly call a parent's implementation of a method you've
  overridden.
- **Dynamic dispatch** — which specific method body actually runs is
  decided by the object's real type at the moment of the call, not by
  the type of the variable holding the reference.
- **Template Method pattern** — a base class defines a fixed algorithm
  and calls out to specific points a subclass overrides to fill in.

---

## Concept Unit: A Parent Class Calling a Method a Child Overrides

### The Problem

You already know `new SomeClass()` builds an object (Chapter 2A). But
what if one class's own code calls a method that a *different* class,
built on top of it, has changed? Prove this mechanism in isolation
before Android's real version of it ever comes up.

### Introduce the Concept in Isolation

Create a folder for this lab. Inside it, create `Base.java`:

```java
public class Base {
    public void run() {
        System.out.println("Base.run() starting");
        setup();
        System.out.println("Base.run() finished");
    }
    protected void setup() {
        System.out.println("Base's default setup - nobody overrode me");
    }
}
```

In the same folder, create `Child.java` — this is the file with `main`,
the one you'll run:

```java
public class Child extends Base {
    @Override
    protected void setup() {
        System.out.println("Child's setup ran instead!");
    }
    public static void main(String[] args) {
        Child c = new Child();
        c.run();
    }
}
```

Compile and run:

```
javac Base.java Child.java
java Child
```

Real output, this session:

```
Base.run() starting
Child's setup ran instead!
Base.run() finished
```

`Child c = new Child();` builds an object exactly the way Chapter 2A's
`new LightSwitch()` did — except `Child` gets *all of Base's fields and
methods* too, plus its own, because `extends` declares "a `Child` is a
`Base`, plus whatever's different here." The real question is *why*
the three lines of output land in exactly this order, with `Child`'s
message sandwiched inside `Base`'s two:

#### Execution Trace

1. `c.run()` — `Child` never wrote its own `run()`, so this calls
   `Base`'s inherited `run()` method.
2. Inside `run()`, `System.out.println("Base.run() starting")` executes
   first — this is `"Base.run() starting"` in the real output above.
3. `run()` then calls `setup()` — but *not* necessarily `Base`'s
   `setup()`. Java looks at the actual object's real type (`Child`,
   even though the reference is being used inside `Base`'s own code)
   and calls *its* `setup()` — which `Child` overrode. That's why
   `"Child's setup ran instead!"` is the second line of output, not
   `"Base's default setup."`
4. Control returns to `run()`, and its final line,
   `System.out.println("Base.run() finished")`, executes — the third
   and last line of output.

A parent class can call a method that a child class overrides, and the
parent's own code decides *when* to call it, while the child only
decides *what happens* when it's called.

One more real question: once `Child` overrides `setup()`, is `Base`'s
own version of `setup()` gone entirely, or can `Child` still reach it
deliberately? Change `Child.java`'s `setup()`:

```java
public class Child extends Base {
    @Override
    protected void setup() {
        super.setup();
        System.out.println("Child's setup ran too!");
    }
    public static void main(String[] args) {
        Child c = new Child();
        c.run();
    }
}
```

Recompile and run:

```
javac Base.java Child.java
java Child
```

Real output, this session:

```
Base.run() starting
Base's default setup - nobody overrode me
Child's setup ran too!
Base.run() finished
```

`super.setup()` — **first appearance.** Explicitly calls `Base`'s own
version of `setup()`, the exact one `Child` just overrode, from inside
the override itself. Without it, overriding a method replaces the
parent's version entirely for any call through the object; `super.`
is the one way to still reach the original, on purpose, instead of
losing access to it. Overriding a method doesn't delete the parent's
version — it just stops it from running *automatically*.

### Discard the Throwaway Example

Delete `Base.java` and `Child.java` — they never appear again. Hold
onto the pattern: `AppCompatActivity` (which you didn't write — it's
part of the Android framework, a `Base`-like class) is doing exactly
this in the capstone lesson coming up.

### Mechanical Walkthrough

- `public class Child extends Base` — **first appearance of
  `extends`.** Declares `Child` inherits `Base`'s fields and methods,
  plus whatever `Child` adds or overrides itself.
- `@Override protected void setup()` — **first appearance of a real
  override.** Same method name and signature as `Base.setup()`,
  replacing what runs when `setup()` is called on a `Child` object.
  `@Override` here is more than a label — the next unit proves exactly
  what it checks.
- `c.run()` — reappearing (dot-notation method call, Chapter 2A), on an
  object whose real type (`Child`) determines which `setup()` actually
  runs — this is **dynamic dispatch**: the decision of which method
  body executes is made using the object's real type, not the type
  written in the variable declaration.

### CS Lens

This is the **Template Method pattern** — a base class defines the
overall algorithm's shape (`run()`'s three lines) and calls out to a
point (`setup()`) a subclass fills in. Also recognized in:
`unittest`/JUnit's `setUp()`/`tearDown()` being called around your test
methods, GUI frameworks in general (a window toolkit calling your
`onClick` handler), servlet containers calling `doGet`/`doPost` on your
class, and game engines calling your `update()` every frame.

### SE Lens

**Why would a class want to let a subclass override just one small
piece of its own logic, instead of the subclass just writing its own
version of the whole method?** Because the surrounding logic (`run()`'s
own two `println` calls, here standing in for real setup/teardown work
a framework needs done every time) shouldn't have to be duplicated by
every subclass that wants to customize one small piece. `Base` owns and
guarantees the parts that must always happen; `Child` only owns the one
part that's allowed to vary. The cost: control flow that isn't visible
by reading `Child.java` alone — you have to know `Base.run()` exists
and calls `setup()` to understand when your own override actually runs.

---

## Concept Unit: `@Override` Is a Real Exception the Compiler Checks

### The Problem

The previous lab used `@Override` without proving what it actually
does. Chapter 2B proved annotations are inert by default — does
`@Override` behave the same way, or is it different?

### Introduce the Concept in Isolation

Recreate `Base.java` from the previous unit in a fresh folder. Create a
new file, `ChildTypo.java` — deliberately misspelling the overridden
method's name, and *without* `@Override`:

```java
public class ChildTypo extends Base {
    protected void setup1() {
        System.out.println("Child's setup ran instead!");
    }
    public static void main(String[] args) {
        ChildTypo c = new ChildTypo();
        c.run();
    }
}
```

Compile and run:

```
javac Base.java ChildTypo.java
java ChildTypo
```

Real output, this session:

```
Base.run() starting
Base's default setup - nobody overrode me
Base.run() finished
```

Read that carefully: it compiled with **no error at all**, and it ran —
but `"Child's setup ran instead!"` never printed. `setup1()` is not an
override of anything; it's a brand-new, unrelated method that happens
to live in `ChildTypo`, that nothing ever calls. `Base`'s own default
`setup()` ran instead, silently, because as far as the compiler is
concerned, `ChildTypo` never overrode anything at all — a real, silent
bug, the kind that's easy to miss just by reading the code.

Now add `@Override` above the exact same typo'd method (leave
`Base.java` unchanged):

```java
public class ChildTypo extends Base {
    @Override
    protected void setup1() {
        System.out.println("Child's setup ran instead!");
    }
    public static void main(String[] args) {
        ChildTypo c = new ChildTypo();
        c.run();
    }
}
```

Try to compile:

```
javac Base.java ChildTypo.java
```

Real compiler output, this session:

```
ChildTypo.java:2: error: method does not override or implement a method from a supertype
    @Override
    ^
1 error
```

### Discard the Throwaway Example

Delete `Base.java` and `ChildTypo.java` — they never appear again.

### Mechanical Walkthrough

- `protected void setup1()` with no `@Override` — compiles fine,
  because without `@Override`, `javac` has no instruction to check
  whether this method actually overrides anything — it's just as
  willing to accept a brand-new, unrelated method as a genuine
  override, silently.
- `@Override` above the same typo'd method — **this is the exception to
  Chapter 2B's own rule.** Most annotations do nothing unless some
  separate tool reads them. `@Override` is different: `javac` itself
  has real, hardcoded logic for it — "check that a method with this
  exact name and signature exists in the parent class; if not, fail to
  compile." That's a genuine annotation *and* a genuine compile-time
  check, at the same time, which is exactly why it's worth calling out
  as the rare exception it is.

### CS Lens

This is **compile-time verification of programmer intent** — instead of
trusting that a method named similarly to a parent's is *meant* to
override it, the compiler is told, explicitly, "this is supposed to be
an override," and checks that claim mechanically. Also recognized in:
TypeScript's structural type checks catching a mismatched shape at
build time instead of at runtime, and any linter rule that turns a
probable-mistake pattern into a hard build failure instead of a silent
pass.

### SE Lens

**If `@Override` is optional — the code compiles and runs without
it — why type it every single time you override a method?** Because
the cost of typing five extra characters is fixed and small, while the
cost of the bug it prevents (a typo'd override silently becoming a
dead, unrelated method, with the parent's original behavior quietly
still running in its place) scales with how hard that bug is to notice
later — in a large real codebase, exactly the kind Android apps become,
nobody is re-reading every method name character by character to catch
this by hand.

---

## Connect the Pieces

One trace through this lesson: `Child` (or `ChildTypo`, in the second
lab) `extends Base`, inheriting its code; `Base.run()` calls `setup()`
without knowing or caring which class actually built the object it's
running on — dynamic dispatch resolves that at the moment of the call,
using the object's real type. `@Override`, unlike every other
annotation Chapter 2B showed you, is one `javac` genuinely checks —
proven twice, directly: absent, a typo compiles into a silent bug;
present, the exact same typo becomes a real compile error instead. The
capstone of this chapter is this exact mechanism, once more, with
`AppCompatActivity` playing `Base` and `MainActivity` playing `Child`.

## What Breaks Without This

Already demonstrated directly, twice, within this lesson's own second
unit: the silent "wrong method ran" bug without `@Override`, and the
real compile error with it. No further break-it exercise is needed.

## Exercises

1. In the first lab, add a second override level: a `GrandChild`
   extending `Child`, overriding `setup()` again. Predict the output
   before running it, then check yourself.
2. In the second lab, fix the typo (`setup1` → `setup`) while keeping
   `@Override`. Confirm it now compiles and runs, printing `"Child's
   setup ran instead!"` — proving `@Override` doesn't just detect
   mistakes, it's silent and harmless the moment the override is
   actually correct.

## Definition of Done

- [ ] You ran the `Base`/`Child` lab and it matched your prediction (or
      you understand why it didn't).
- [ ] You triggered the silent "wrong method ran" bug yourself, without
      `@Override`, by typo-ing an override.
- [ ] You triggered the real compile error yourself by adding
      `@Override` to that same typo.
- [ ] You can explain, using your own words, why `@Override` is an
      exception to "annotations do nothing by themselves."

Next: Chapter 2, Lesson D — the Manifest, and how the OS even knows
`MainActivity` exists before it ever calls a method on it.
