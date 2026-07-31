# Lesson 33: Logging, Signatures, Super, and Bundle

**What you will build:** Three disposable Java labs, plus one real
Android contract read directly — four small, independent ideas grouped
together only because each has been used silently, unnamed, since early
in this curriculum.

**What you need to know first:** Lesson 05's `inheritance` and `method
overriding`, Lesson 02's `method`.

**Terms introduced in this lesson:**

- **Logging** — instrumenting running code by emitting diagnostic events
  to an observable sink, so what a program is actually doing can be
  inspected without stopping it or attaching a debugger.
- **Static-typed method signatures** — a statically-typed language
  requires every parameter and return value to have a declared type,
  checked at compile time, including a way to declare "returns nothing."
- **Parent implementation access (`super`)** — inside a subclass, an
  explicit way to call its immediate parent's own version of a method or
  constructor, rather than only replacing it via overriding.
- **`Bundle`** — a key-value container Android uses to pass data around
  the framework, including as `onCreate`'s saved-instance-state
  parameter.

---

## Concept Unit: Logging

### The Problem

Every example in this curriculum so far has used `System.out.println`
to show a program's behavior — necessary for a lesson, but a real
running program, not being read one example at a time, needs a way to
record what it's doing that can be inspected *while it's running*,
without stopping it to attach a debugger, and ideally with more structure
than plain, undifferentiated text.

### Introduce the Concept in Isolation

```
mkdir lesson-33
cd lesson-33
```

Create `Main.java`:

```java
import java.util.logging.Logger;

public class Main {
    private static final Logger logger = Logger.getLogger("Main");

    public static void main(String[] args) {
        logger.info("Application starting.");
        int result = 10 / 2;
        logger.info("Computed result: " + result);
        logger.warning("This is a warning-level message.");
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

Here is the real output (the exact timestamp will differ):

```
Jul 30, 2026 9:00:00 AM Main main
INFO: Application starting.
Jul 30, 2026 9:00:00 AM Main main
INFO: Computed result: 5
Jul 30, 2026 9:00:00 AM Main main
WARNING: This is a warning-level message.
```

`logger.info(...)` and `logger.warning(...)` are `logging` — **first
appearance**: instrumenting running code by emitting diagnostic events to
an observable sink, so what a program is actually doing can be inspected
without stopping it or attaching a debugger. Unlike plain
`System.out.println`, every line automatically carries real structure —
a timestamp, a severity level (`INFO`, `WARNING`), and the class that
emitted it — read directly from the log output, not hand-formatted by
the programmer each time.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `Logger logger = Logger.getLogger("Main");` — **(a) first
   appearance**: obtains a real `Logger` object, named `"Main"`, used
   to categorize every message emitted through it.
2. `logger.info("Application starting.");` — **(a) first appearance**:
   emits a message at `INFO` severity — a normal, informational event,
   not an error.
3. `logger.warning("This is a warning-level message.");` — **(a) first
   appearance**: emits a message at a higher severity, `WARNING`,
   visually and structurally distinguished from `INFO` in the real
   output above.

### CS Lens

Logging is diagnostic output with real structure attached — severity,
timestamp, source — specifically so a large, long-running program's
output can be filtered and searched (show only `WARNING` and above, for
instance) rather than scanned line by line the way `println`'s
undifferentiated text requires.

Also recognized in: the `logging` module in Python (near-identical
severity-level shape to Java's own), `ILogger` in C#/.NET, structured
logging frameworks across virtually every server-side language and
platform — Android's own `Log.d`/`Log.i` and Logcat viewer are this exact
same idea, platform-specific syntax for a universal concept.

### SE Lens

The alternative — `System.out.println` for everything, as every earlier
lesson in this curriculum has used for simplicity — was not chosen for
real, long-running software because plain text has no severity to filter
by, no automatic timestamp, and no way to distinguish "the program is
telling you something routine" from "something is actually wrong,"
forcing a human reader to make that judgment by reading every single
line.

---

## Concept Unit: Static-Typed Method Signatures

### The Problem

Every method written throughout this curriculum has had a declared
return type and declared parameter types — accepted so far without
stopping to name why that's required at all, or what "returns nothing"
even means as a declared type.

### Introduce the Concept in Isolation

```java
public class Main {
    static int add(int first, int second) {
        return first + second;
    }

    static void printSum(int first, int second) {
        System.out.println("Sum: " + add(first, second));
    }

    public static void main(String[] args) {
        printSum(3, 4);
    }
}
```

Compile and run it. Here is the real output:

```
Sum: 7
```

`static int add(int first, int second)` and `static void
printSum(int first, int second)` are `static-typed method signatures` —
**first appearance**: a statically-typed language requires every
parameter and return value to have a declared type, checked at compile
time, including a way to declare "returns nothing." `add` declares
`int` as its return type — the compiler checks, at every call site, that
its result is actually used as an `int`. `printSum` declares `void` —
Java's specific way of saying "this method produces no value at all,"
itself a real, required part of the signature, not the absence of one.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `static int add(int first, int second)` — **(a) first appearance**
   of this signature shape examined explicitly: return type (`int`),
   method name (`add`), parameter list with each parameter's own
   declared type (`int first`, `int second`).
2. `static void printSum(int first, int second)` — the same shape, with
   `void` in the return-type position specifically declaring "no value
   returned," rather than that position simply being left empty.
3. `add(first, second)` inside `printSum` — the compiler checks this
   call against `add`'s declared signature: two `int` arguments, an
   `int` result — a mismatch (passing a `String`, say) would fail to
   compile, never reaching runtime at all.

### CS Lens

A statically-typed signature is a real, checked contract: every caller
and the method itself agree, before the program ever runs, on exactly
what types cross the boundary in each direction. This is what makes
`onCreate(Bundle savedInstanceState)`, seen unexplained since Lesson 10,
readable as more than a memorized shape: `Bundle` is the declared
parameter type, and the absent explicit return type slot (filled by
`void`) means "no value comes back."

Also recognized in: type annotations in TypeScript (optional, unlike
Java's required signatures), C#'s identical required-signature model,
any statically-typed language generally. Python requires no declared
types at all — optional type hints exist, but nothing enforces them at
runtime, a real, consequential contrast worth naming.

### SE Lens

Requiring every signature to be fully typed, checked at compile time,
was Java's own deliberate design choice, catching an entire category of
"wrong type passed here" mistake before the program ever runs, at the
cost of writing every type out explicitly rather than leaving it
inferred or unchecked.

---

## Concept Unit: `super` — Parent Implementation Access

### The Problem

Lesson 05's overriding *replaces* a parent's method entirely — but
Lesson 10's real `Activity.onCreate` example already showed something
different: `super.onCreate(savedInstanceState);`, calling the parent's
own version *in addition to* the override's own new code, not instead of
it. That specific mechanism deserves its own, formal treatment.

### Introduce the Concept in Isolation

```java
class Animal {
    void makeSound() {
        System.out.println("Generic animal sound.");
    }
}

class Dog extends Animal {
    @Override
    void makeSound() {
        super.makeSound();
        System.out.println("...and also a bark!");
    }
}

public class Main {
    public static void main(String[] args) {
        Dog myDog = new Dog();
        myDog.makeSound();
    }
}
```

Compile and run it. Here is the real output:

```
Generic animal sound.
...and also a bark!
```

`super.makeSound();` is `parent implementation access` — **first
appearance**: inside a subclass, an explicit way to call its immediate
parent's own version of a method or constructor, rather than only
replacing it via overriding. `Dog.makeSound()` runs *both* `Animal`'s
original message and its own new one — `super` is what makes the
parent's version still run, deliberately, from inside the override that
replaces it.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `super.makeSound();` — **(a) first appearance.** Calls `Animal`'s own
   `makeSound()` directly, explicitly, from inside `Dog`'s overriding
   version — without `super`, `Dog`'s override would run *only* its own
   new code, exactly as Lesson 05's own overriding example did.
2. `System.out.println("...and also a bark!");`, after the `super` call
   — `Dog`'s own additional behavior, running after the parent's.

### CS Lens

`super` is the explicit escape hatch that turns "replace" (plain
overriding, Lesson 05) into "extend" (run the parent's version, then add
more) — this is precisely why every real Android lifecycle override,
like `onCreate`, calls `super.onCreate(...)` first: the framework's own
base implementation does real, required setup work that the override is
expected to preserve, not silently discard.

Also recognized in: `super()`/`super.method()` in Python (identical
concept, different syntax), `base.Method()` in C#, `ParentClass::method()`
in C++ (qualified by the parent's actual name rather than a keyword).

### SE Lens

The alternative — always fully replacing a parent's method via plain
overriding, never calling `super` — was not chosen for cases where the
parent's own behavior is genuinely still required; skipping
`super.onCreate(...)` in a real Activity, for instance, would skip real
framework setup work the rest of the Activity's lifecycle depends on
having already happened.

---

## Concept Unit: `Bundle` — A Key-Value Container

### The Problem

`onCreate(Bundle savedInstanceState)` has appeared, unexplained, on the
first line of every Activity example since Lesson 10 — needing a name
even before its full role (a later lesson's own subject) is covered.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
Bundle extras = new Bundle();
extras.putString("item_name", "Widget");
extras.putInt("quantity", 12);

String name = extras.getString("item_name");
int quantity = extras.getInt("quantity");
```

This is `Bundle` — **first appearance**: a key-value container Android
uses to pass data around the framework, including as `onCreate`'s
saved-instance-state parameter. `putString`/`putInt` store values under
string keys; `getString`/`getInt` read them back — the same
serialization-adjacent, key-value shape Lesson 19's `Intent.putExtra`
already used, because an `Intent`'s own extras genuinely are stored in a
`Bundle` internally.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `new Bundle()` — **(a) first appearance**: constructs an empty
   key-value container.
2. `extras.putString("item_name", "Widget");` and
   `extras.putInt("quantity", 12);` — **(b) reappearing** key-value
   storage shape from Lesson 19's `putExtra`, applied directly to a
   `Bundle` object rather than through an `Intent`'s own wrapper method.
3. `extras.getString("item_name");` and `extras.getInt("quantity");` —
   read the stored values back, by the same keys used to store them.

### CS Lens

`Bundle` is a real, load-bearing example of the key-value container
shape this curriculum has already used informally (a `Map`-like
structure, though `Bundle` itself is Android's own specific type, not
Java's standard `Map`). Recognizing `Bundle` on sight, rather than as an
unexplained parameter type, is this unit's entire, deliberately narrow
goal — full coverage of what `Bundle` is used for is a later lesson's own
subject.

Also recognized in: `Intent`'s own extras (Lesson 19), which are, under
the hood, a `Bundle`; any key-value data-passing container across other
platforms (a `Dictionary` in C#, a plain `dict` in Python, used the same
way for loosely-structured data passing).

### SE Lens

This unit deliberately stops at recognition, not full mastery — `Bundle`
appears constantly, and needs a name now, but its full role (particularly
around configuration changes and process death) is genuinely a later
lesson's own subject, not something to compress into a single unit here.

---

## Connect the Pieces

`logger.info(...)` gave this curriculum's own diagnostic output real
structure, beyond plain `println`. `static int add(int, int)` named the
declared-type contract every method signature in this curriculum has
already used. `super.makeSound()` showed the explicit mechanism behind
every real `super.onCreate(...)` call already seen in earlier lessons.
`Bundle`, finally, put a name on the container type that's sat,
unexplained, in every Activity's own `onCreate` signature since it was
first shown.

## What Breaks Without This

Omitting `super.onCreate(savedInstanceState)` from a real Activity
override — this lesson's own `super` mechanism, skipped — throws a real
runtime error on Android, resembling:

```
android.util.SuperNotCalledException: Activity did not call through to super.onCreate()
```

This is concrete, framework-enforced proof that `super` isn't optional
ceremony in a real Activity override — the framework itself checks that
its own base implementation actually ran.

## Exercises

1. Change this lesson's own `logger.warning(...)` call to
   `logger.severe(...)` and observe the real, different severity label
   in the output.
2. Move `super.makeSound();` to the *end* of `Dog.makeSound()` instead
   of the start, and confirm, by running it, that the two printed lines
   swap order.
3. Read the real `SuperNotCalledException` message in "What Breaks
   Without This" and explain, in your own words, what it's telling a
   developer to fix.

## Definition of Done

- [ ] You ran the logging example and saw the real, structured output.
- [ ] You ran the `super.makeSound()` example and saw both lines print,
      in order.
- [ ] You read the real `Bundle` example and can explain what
      `putString`/`getString` do.
- [ ] You can state, without looking back at this lesson, what `void` as
      a return type actually declares.
