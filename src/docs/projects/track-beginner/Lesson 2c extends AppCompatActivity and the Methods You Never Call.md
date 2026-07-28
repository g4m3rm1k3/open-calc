# Lesson 2c: `extends AppCompatActivity` and the Methods You Never Call

> **Revised 2026-07-28** — added a new "Annotations" Concept Unit
> before the `extends`/Template Method one, with a real isolated lab
> (`Reminder`/`Task`) proving annotations are inert metadata by default,
> plus a real compile error proving `@Override` specifically is a
> hardcoded exception `javac` itself checks. This closes a gap where
> `@Override` had been described ("metadata attached to code") without
> ever being mechanistically explained. The existing `@Override`
> walkthrough bullet, below, now points back to this proof instead of
> re-describing it — heading marked `(revised 07/28)`.
>
> **Revised 2026-07-25** — added the edge-to-edge insets Concept Unit,
> including a real isolated lab (`TapCallback`/`Doorbell`/`Chime`) that
> proves the Observer pattern by hand before it's ever named in real
> code — `interface`, `implements`, and polymorphism now genuinely
> start here too, earlier than Lesson 4. Also fixed an Observer-vs-
> Template-Method conflation in the CS Lens. Headings marked `(revised
> 07/25)` below (check "On This Page" in the sidebar) are exactly what
> pre-existing content changed; the new lab isn't marked since it's
> self-evidently new. Full detail in `CHANGELOG.md` in this folder.

**What you will build:** You'll instrument your existing empty
`MainActivity` screen and watch Android itself call a method on it
that you never call. The transferable problem: in every Java program
you've written before this (Lesson 1's `HelloWorld`, Lesson 2a's
`LightSwitchDemo`), execution starts at
`public static void main(String[] args)` and *you* are in control of
the order things happen. Android throws that model out. There is no
`main()` in your app at all. Instead, the OS owns a class you write,
builds an object from it, and calls specific methods on that object,
in a specific order, at times *it* decides — when the user opens your
app, switches away, gets a phone call, rotates the screen, or the
system needs the memory back. Today you make that invisible machinery
visible, using nothing but vocabulary from Lesson 2a.

**What you need to know first:** Lesson 1 (`MainActivity.java` exists,
`extends AppCompatActivity` was left unexplained on purpose). Lesson 2a
(class vs. object, `new`, instance methods, `this`) — this entire
lesson is that vocabulary applied to a class you didn't write. Lesson
2b (the Manifest already told the OS `MainActivity` is the entry
point; this lesson explains what the OS does once it gets there).

**Terms introduced in this lesson:**
- **`extends`** — declares that a class inherits another class's fields
  and methods, plus whatever it adds or overrides itself.
- **Annotation** — `@`-prefixed metadata attached to a code declaration,
  not executable code itself; inert by default, only meaningful if some
  separate tool specifically looks for it.
- **`@interface`** — the keyword pair that declares a brand-new
  annotation type, as opposed to plain `interface`, which declares
  method signatures to implement.
- **`@Override`** — one of the small handful of annotations `javac`
  itself has real, specific logic for: checks that a method really does
  replace one from the parent class, turning a typo'd method name into
  a compile error instead of a silent bug — a genuine exception to
  "annotations do nothing on their own," not the general rule.
- **`protected`** — an access modifier meaning callable by the class
  itself, its subclasses, and framework code in the same package.
- **`super`** — refers to "the parent class's own version of this,"
  used to explicitly call a parent's implementation of a method you've
  overridden.
- **`R` class / resource ID reference (`R.layout.activity_main`)** — a
  generated, compile-time constant pointing at a resource; the
  generated `R` class itself is the next lesson's full subject.
- **`interface`** — declares a set of method signatures with no bodies
  at all: a pure contract that anything implementing it must fulfill.
- **Field typed as an interface (`private TapCallback callback;`) /
  Polymorphism** — a field declared with an interface type can hold any
  object from any class that fulfills that interface's contract,
  decided at the point it's actually called, not when the field was
  declared.
- **`implements`** — declares a class fulfills an interface's contract
  (as opposed to `extends`, which inherits a class's actual code).
- **Lambda expression (`(v, insets) -> { ... }`)** — compact syntax
  building an implementation of a single-method interface inline, with
  no separate named class needed.
- **`ViewCompat` / `setOnApplyWindowInsetsListener`** — an AndroidX
  class providing one consistent API across Android versions;
  `setOnApplyWindowInsetsListener` registers a callback that runs when
  the system reports how much space system UI currently occupies.
- **`findViewById` / view inflation** — inflation is the step where
  Android builds real `View` objects from an XML layout file;
  `findViewById` walks that already-built tree looking for one view by
  its id.
- **`Insets` / `WindowInsetsCompat.Type.systemBars()`** — `Insets` holds
  four numbers (`left`, `top`, `right`, `bottom`) describing how much
  system UI overlaps each edge of a view; `systemBars()` asks
  specifically for the status bar and navigation bar together.
- **`setPadding`** — pushes a view's content inward from its own edges
  by a given amount, independently on each of the four sides.
- **Template Method pattern** — a base class defines a fixed algorithm
  and calls out to specific points a subclass overrides to fill in.
- **Observer pattern** — an object holds onto a standalone callback and
  decides, on its own, when to call it — no subclassing involved.
- **Inversion of Control (Hollywood Principle)** — the broader idea
  behind both patterns above: you hand control to a framework instead
  of writing a top-down script yourself ("don't call us, we'll call
  you").

---

## Concept Unit: Annotations — Metadata a Tool Reads, Not Code That Runs

### The Problem

`@Override` sits directly above `protected void onCreate(...)` in the
very first real code this lesson is about to show. The `@` syntax has
never appeared anywhere in this course before this line. It looks like
it might be part of the method itself — is it? What actually happens
when this code runs, because of that one line?

### Introduce the Concept in Isolation

Prove it with the smallest possible custom annotation, entirely outside
Android — no framework needed to show what an annotation fundamentally
is. Create a folder for this lab (same convention as every lab so far).
Inside it, create `Reminder.java`:

```java
@interface Reminder {
    String value();
}
```

`@interface` — not plain `interface` — is the keyword pair that
declares a brand-new **annotation type**, rather than a normal
interface with methods to implement. `value()` declares one piece of
text this annotation can carry, supplied in parentheses wherever the
annotation is actually used.

In the same folder, create `Task.java`:

```java
class Task {
    @Reminder("double check totals before shipping")
    void calculateTotal() {
        System.out.println("Calculating total...");
    }

    void logStart() {
        System.out.println("Starting...");
    }
}
```

`@Reminder("...")`, sitting directly above `calculateTotal()` with no
semicolon of its own, is not a statement — it's metadata attached to
the declaration immediately below it.

Create `AnnotationDemo.java`:

```java
public class AnnotationDemo {
    public static void main(String[] args) {
        Task task = new Task();
        task.calculateTotal();
        task.logStart();
    }
}
```

Compile and run:

```
javac Reminder.java Task.java AnnotationDemo.java
java AnnotationDemo
```

Real output, this session:

```
Calculating total...
Starting...
```

Now delete `@Reminder("double check totals before shipping")` from
`Task.java` entirely, leaving `calculateTotal()` with no annotation at
all, and recompile and rerun:

```
javac Reminder.java Task.java AnnotationDemo.java
java AnnotationDemo
```

Real output, this session:

```
Calculating total...
Starting...
```

**Identical.** What this proves: `@Reminder` was never read by anything
at runtime — the JVM ran both methods exactly the same way whether the
annotation was there or not. An annotation, by itself, does absolutely
nothing. It's a label sitting next to code, not code.

### `@Override` Is a Real Exception, Not the Rule

`@Reminder` was silently ignored by the compiler too — `javac` compiled
`Task.java` without complaint whether the annotation was present or
not. `@Override` behaves completely differently, and the difference is
worth proving directly, reusing the `Base`/`Child` files this lesson's
next unit is about to build anyway. Once you've created `Base.java` and
`Child.java` in `pkgdemo2` (next unit), come back and add a third file
in that same folder, `BadChild.java`:

```java
public class BadChild extends Base {
    @Override
    protected void setupp() {
        System.out.println("Typo'd override");
    }
    public static void main(String[] args) {
        BadChild c = new BadChild();
        c.run();
    }
}
```

Compile it alone:

```
javac BadChild.java
```

Real compiler output, this session:

```
BadChild.java:2: error: method does not override or implement a method from a supertype
    @Override
    ^
1 error
```

`setupp()` (a typo of `setup()`) matches nothing declared on `Base` —
and unlike `@Reminder`, which the compiler happily ignored, this fails
to *compile at all*, with the error pointing at the `@Override` line
itself. What this proves: `@Override` is not evidence that "the
compiler checks annotations" as a general rule — it's evidence that
`javac` has real, specific, hardcoded logic built in for this one exact
annotation, by name, and nothing else. Delete `BadChild.java` once
you've seen this — it won't appear in the project again.

### Discard the Throwaway Example

Delete `Reminder.java`, `Task.java`, and `AnnotationDemo.java` — none of
it appears in the project again. (`BadChild.java`, above, gets deleted
in place, right after you've seen its error.)

### Mechanical Walkthrough

- `@interface Reminder { String value(); }` — **first appearance of
  declaring a custom annotation type.**
- `@Reminder("double check totals before shipping")`, attached above
  the `calculateTotal` method — **first appearance** of applying an
  annotation to a real method declaration.
- Removing `@Reminder(...)` and seeing identical output — **first
  appearance of proving an annotation's default behavior**: inert unless
  something specifically goes looking for it.
- `@Override` inside `BadChild`, failing to compile — **reappearing**
  (the exact syntax from this lesson's own first code block, seen here
  isolated and deliberately broken) — proof that this one specific
  annotation gets real, structural enforcement from `javac` itself, a
  fundamentally different treatment than `@Reminder` just received.

### CS Lens

This is the general idea of **declarative metadata** — attaching
descriptive information to code that some separate process *may* act
on, without that information being executable itself. Also recognized
in: Python decorators (though worth a precise contrast, not a loose
one — a Python decorator is itself executable code that wraps and can
replace the function beneath it, running every time that function is
defined; a Java annotation like `@Reminder` never runs anything, ever,
by itself), database column constraints like `NOT NULL` (metadata the
database engine checks, not the stored data itself), and HTML
`data-*` attributes (read by JavaScript that specifically looks for
them, inert to the browser's own rendering otherwise).

### SE Lens

**If most annotations do nothing on their own, why does this project
keep using them** (`@NonNull`, later in this course; `@LayoutRes` and
`@MainThread`, later still)? Because "does nothing on its own" is
exactly the source of their value, not a flaw: an annotation's real
effect comes entirely from voluntary agreement between whoever writes
it and whoever chooses to go looking for it. Android Studio's own
static-analysis engine specifically knows to search for `@NonNull` and
warn about a code path where a null value could reach it — the same
voluntary, external-tool relationship `@Reminder` could have had, if
this lab had bothered to write a reader for it. `@Override` is the rare
exception precisely because the Java language itself, not just a
convention, requires `javac` to check it specifically — which is why it
alone produces a compile error instead of a tool's warning. Every other
annotation this project ever writes is only ever as useful as whichever
tool has actually been told to look for it.

---

## Concept Unit: `extends AppCompatActivity` and the Methods You Never Call

### The Problem (revised 07/25 — quoted code now matches current Android Studio)

Open `MainActivity.java` again. Newer Android Studio versions generate a
few more lines inside `onCreate` than older ones — the block below,
starting with `ViewCompat`, is genuinely unrelated to this Concept
Unit's own question and gets its own full explanation afterward, in
this lesson's second Concept Unit; ignore it for now and focus on the
three lines this unit is actually about:

```java
public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }
}
```

(If your file doesn't have the `ViewCompat` block at all, that's fine
too — it depends on your exact Android Studio version. Either way,
nothing in *this* Concept Unit depends on it.)

From Lesson 2a, you know `onCreate` is an instance method — no
`static` keyword, so it must belong to a `MainActivity` object. But you
never wrote `new MainActivity()` anywhere, and you never wrote
`someMainActivity.onCreate(...)` anywhere either. And yet when you ran
this app in Lesson 1, code inside `onCreate` clearly executed — you saw
a screen. Something built a `MainActivity` object and called a method
on it, and it isn't you.

### Introduce the Concept in Isolation

Before touching Android's real lifecycle (which has many methods),
prove the *underlying mechanism* — a subclass method getting called by
someone other than you — with a tiny throwaway example, no Android
involved at all. This introduces one new idea Lesson 2a didn't need:
`extends`.

Create a folder named `pkgdemo2` (same convention as Lesson 2a — a
plain folder outside the Android project, no `package` line needed in
either file below, per Lesson 2a's explanation of why). Inside it,
create a file named `Base.java`:

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

In the same folder, create a second file, `Child.java` — this is the
one with `main`, since it's the one you're about to run:

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

From inside `pkgdemo2`, compile and run both:

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

`Child c = new Child();` builds an object exactly the way Lesson 2a's
`new LightSwitch()` did — except `Child` gets *all of Base's fields and
methods* too, plus its own, because `extends` declares "a `Child` is a
`Base`, plus whatever's different here." The real question is *why*
the three lines of output land in exactly this order, with `Child`'s
message sandwiched inside `Base`'s two — walking `c.run()` one call at
a time answers it:

#### Execution Trace

1. `c.run()` — `Child` never wrote its own `run()`, so this calls
   `Base`'s inherited `run()` method.
2. Inside `run()`, `System.out.println("Base.run() starting")` executes
   first — this is "Base.run() starting" in the real output above.
3. `run()` then calls `setup()` — but *not* necessarily `Base`'s
   `setup()`. Java looks at the actual object's real type (`Child`,
   even though the reference is being used inside `Base`'s own code)
   and calls *its* `setup()` — which `Child` overrode. That's why
   "Child's setup ran instead!" is the second line of output, not
   "Base's default setup."
4. Control returns to `run()`, and its final line,
   `System.out.println("Base.run() finished")`, executes — the third
   and last line of output.

A parent class can call a method that a child class overrides, and the
parent's own code decides *when* to call it, while the child only
decides *what happens* when it's called.

Discard `pkgdemo2` — it won't appear in the project again. But hold
onto the pattern: `AppCompatActivity` (which you didn't write — it's
part of the Android framework, a `Base`-like class) is doing exactly
this. The Android OS holds a reference to *its* code (specifically,
code inside `AppCompatActivity` and its own parent classes), and that
code calls `onCreate()` at the right moment, on the `MainActivity`
object *it* built with something equivalent to `new MainActivity()`.
`MainActivity` just overrides what happens when that call arrives.

### Project Change

- **Reference Source:** No reference counterpart — reading the
  wizard's generated `MainActivity.java`.
- **Files affected:** `app/src/main/java/.../MainActivity.java`.
- **Change type:** Inspect, then a small addition (a log line) to make
  the calling behavior visible.

### The New Code

Add one line inside the existing `onCreate`:

```java
android.util.Log.d("Lifecycle", "onCreate called");
```

### The Updated Project (revised 07/25 — insets block added)

```java
public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
        android.util.Log.d("Lifecycle", "onCreate called");  // ← new
    }
}
```

(Omit the `ViewCompat` block here if your own project never had it —
everything else in this lesson works identically either way.)

The method as a whole now does what it did before (call the parent's
setup work, inflate your screen's layout, and — if your template
generated it — react to system bar insets) *plus* one visible proof
that it ran: a log line you can watch appear in real time.

### Mechanical Walkthrough (revised 07/28 — `@Override` bullet updated)

- `extends AppCompatActivity` — **reappearing**, same `extends` keyword
  from the `pkgdemo2` lab, now the framework version: `MainActivity` is
  an `AppCompatActivity`, plus whatever's different here, exactly like
  `Child` was a `Base`, plus whatever was different there.
- `@Override` — **reappearing**, proven directly in this lesson's own
  `Reminder`/`Task` lab and `BadChild` compile error, above: "I intend
  this method to replace a method of the same name/signature in the
  parent class," and unlike most annotations, `javac` itself has real,
  specific logic checking that claim. Without it, a typo in the method
  name (say, `onCreat`) would silently compile as a brand-new unrelated
  method that the OS never calls — `@Override` turns that mistake into
  a compile error instead of a silent bug.
- `protected void onCreate(Bundle savedInstanceState)` — **`protected`
  reappearing** from the `pkgdemo2` lab's `setup()`, now explained
  concretely: `protected` means callable by the class itself, by
  subclasses, and by framework code in the same package, which is
  exactly how the OS is able to call it without it being fully
  `public`. `Bundle savedInstanceState` is a parameter holding saved
  state from a previous run (not needed yet — you'll use it for real
  once your app has actual data to preserve, in a later lesson).
- `super.onCreate(savedInstanceState)` — **first appearance of `super`.**
  Directly matches the `pkgdemo2` lab's implicit call structure, but
  spelled explicitly here: `super` refers to "the parent class's own
  version of this," so `super.onCreate(...)` explicitly calls
  `AppCompatActivity`'s own `onCreate` logic, which does essential
  framework setup you are not shown and should never skip. (In the
  `pkgdemo2` lab, `Base.run()` called `setup()` without needing `super`
  because `run()` itself was never overridden — `super` is specifically
  for reaching a parent's version of a method *you have* overridden.)
- `setContentView(R.layout.activity_main)` — **first appearance.**
  `R.layout.activity_main` is your first sight of the generated `R`
  class — covered as its own lesson next — and `setContentView` is the
  call that actually puts a layout on screen.
- `android.util.Log.d(...)` — **reappearing pattern** (a `static`
  method call — no object needed, same as `System.out.println` calling
  through the built-in `System` object versus this calling directly
  through the `Log` class), but the *purpose* is new: writing to
  Android's Logcat system, a dedicated debugging output channel
  separate from `System.out`. Logcat survives and is filterable in ways
  plain console output on a phone isn't, which is why Android code
  uses `Log.d`/`Log.e`/etc. instead of `System.out.println` once you're
  off a desktop JVM.
- `ViewCompat.setOnApplyWindowInsetsListener(...)` and everything inside
  its lambda — intentionally not explained here, flagged and picked up
  in this lesson's next Concept Unit, which is entirely about this one
  block.

### Run It

Run the app on an emulator or device. Open the **Logcat** panel at the
bottom of Android Studio, filter by the tag `Lifecycle`, and confirm
you see `onCreate called` appear the moment the app launches — this is
your own eyes watching the OS call a method you never called.

### CS Lens

This is the **Template Method pattern** — a base class defines the
overall algorithm's shape and calls out to points a subclass fills in.
Also recognized in: `unittest`/JUnit's `setUp()`/`tearDown()` being
called around your test methods, GUI frameworks in general (a window
toolkit calling your `onClick` handler), servlet containers calling
`doGet`/`doPost` on your class, and game engines calling your
`update()` every frame.

### SE Lens

**Why does Android control the calling instead of letting you write
your own startup sequence?** The alternative — you write `main()` and
manually orchestrate window creation, resource loading, and shutdown —
is exactly what desktop Java GUI apps historically did, and it worked,
but it meant every app reinvented (and often got wrong) subtle,
security- and battery-relevant behavior: what happens when the user
switches apps, when the OS is low on memory, when the screen rotates.
By owning the calling and only exposing override points, Android
guarantees every app handles these system-level events consistently,
at the cost of exactly the disorientation you started this lesson
with — control flow that isn't visible by reading your file top to
bottom, because a real part of "what runs when" lives outside your
code entirely.

---

## Concept Unit: Edge-to-Edge Display and Window Insets

### The Problem

If your `onCreate` has the `ViewCompat` block flagged and skipped
earlier in this lesson, here's what it's actually for. Modern Android
phones — specifically, apps targeting Android 15 (API level 35) or
newer — draw your app's content **behind** the status bar (top: clock,
battery, notification icons) and the navigation bar (bottom: the
gesture/back area) by default, instead of the OS automatically
reserving that strip of screen for itself the way older Android
versions did. This is called **edge-to-edge display**, and it's why
modern apps look more immersive — but it creates a real problem your
app now has to solve itself: without doing anything about it, your own
title text or buttons could end up drawn partly *underneath* the clock
or the gesture bar, visually cut off or hard to tap.

### Introduce the Concept in Isolation

Before looking at the real, wizard-generated code, prove the underlying
mechanism by hand — with no Android involved, and none of `onCreate`'s
inheritance machinery either, so it's genuinely a different shape than
this lesson's first Concept Unit.

Create a folder for this lab. Inside it, create `TapCallback.java`:

```java
interface TapCallback {
    void onTap();
}
```

`interface` — **first appearance.** An interface declares a set of
method *signatures* (name, parameters, return type) with **no bodies at
all** — no `{ }` after `onTap()`, just a `;`. It's a pure contract:
"anything that claims to be a `TapCallback` must provide a real
`onTap()` method," with nothing here saying what that method actually
does.

In the same folder, create `Doorbell.java`. Notice it has no `public`
keyword — **first appearance of a class with no `public` keyword.**
Every class you've written so far (`LightSwitch`, `Base`, `Child`,
`Vault`) was `public`. Leaving it off makes the *class itself*
package-private (Lesson 2d's third access level, now applied to a
whole class instead of a field) — fine here, since this whole lab
lives in one throwaway folder and nothing outside it needs to see
`Doorbell` at all:

```java
class Doorbell {
    private TapCallback callback;

    void setCallback(TapCallback callback) {
        this.callback = callback;
    }

    void press() {
        System.out.println("Doorbell: button physically pressed");
        callback.onTap();
    }
}
```

`Doorbell` doesn't know or care what a `TapCallback` actually *does* —
only that it has an `onTap()` it can call, later, whenever `press()`
decides the moment is right. `private TapCallback callback;` — **first
appearance of a field whose type is an interface, not a primitive or a
concrete class.** This is worth pausing on: `callback` can hold *any*
object from *any* class, as long as that class provides a real
`onTap()` method — the field doesn't care which one. This is
**polymorphism** — code written once, against the interface type, that
works with any object fulfilling that contract, decided at the point
it's actually called, not when this field was declared.

In the same folder, create `Chime.java` — a real, concrete
implementation of the contract:

```java
class Chime implements TapCallback {
    @Override
    public void onTap() {
        System.out.println("Chime: ding dong!");
    }
}
```

`implements` — **first appearance.** Where `extends` (this lesson's
first Concept Unit) inherits a class's actual code, `implements`
declares "this class fulfills that interface's contract" — `Chime`
must provide a real `onTap()` method, or this won't compile. `@Override`
is reappearing, from Lesson 2c's own first unit, same meaning: "I
intend this to satisfy a method Java already expects," now checked
against an interface instead of a parent class.

Finally, `ObserverDemo.java` — this is the file with `main`, the one
you'll run:

```java
public class ObserverDemo {
    public static void main(String[] args) {
        Doorbell doorbell = new Doorbell();

        System.out.println("Registering the chime...");
        doorbell.setCallback(new Chime());
        System.out.println("Chime registered. Nothing has rung yet.");

        doorbell.press();
    }
}
```

Compile and run:

```
javac TapCallback.java Doorbell.java Chime.java ObserverDemo.java
java ObserverDemo
```

Real output, this session:

```
Registering the chime...
Chime registered. Nothing has rung yet.
Doorbell: button physically pressed
Chime: ding dong!
```

### Execution Trace — Why the Output Lands in This Order

Prose asserting "these are two separate moments" isn't proof — walking
every line of `ObserverDemo.main` in order, and saying exactly what the
compiler does at each one, is:

1. `Doorbell doorbell = new Doorbell();` — a real `Doorbell` object now
   exists in memory. Its `callback` field is empty — nothing has been
   registered yet.
2. `System.out.println("Registering the chime...");` — prints
   immediately. Nothing about `Doorbell` or `Chime` is involved yet.
3. `doorbell.setCallback(new Chime());` — this is the line that's easy
   to misread. `new Chime()` builds a real `Chime` object — its
   `onTap()` method exists, fully written, in memory. But nothing on
   this line *calls* `onTap()`. Reading `Doorbell.java`, `setCallback`'s
   entire body is `this.callback = callback;` — an assignment, not a
   call. The `Chime` object is now sitting inside `doorbell.callback`,
   unexecuted, doing nothing.
4. `System.out.println("Chime registered. Nothing has rung yet.");` —
   prints immediately after step 3, and this is the actual proof: if
   `setCallback` had triggered `onTap()` itself, "Chime: ding dong!"
   would already be sitting in the output by now. It isn't — the real
   output above shows this line's text landing *second*, with "Chime:
   ding dong!" nowhere yet.
5. `doorbell.press();` — only now does control pass into
   `Doorbell.press()`, which — reading `Doorbell.java` — runs its own
   `System.out.println("Doorbell: button physically pressed")` first,
   then `callback.onTap()`. This is the exact line where `Chime`'s
   code, written two steps ago, finally executes.

`doorbell.setCallback(new Chime())` — reappearing `new` (Lesson 2a) —
only ever *stores* the object; `doorbell.press()` is the one line,
chosen entirely by `Doorbell`'s own code, that actually invokes it.
`Doorbell` — not you, not the point where you wrote `new Chime()` —
decides when that gap ends.

### Discard the Throwaway Example

Delete `TapCallback.java`, `Doorbell.java`, `Chime.java`, and
`ObserverDemo.java` — they won't appear in the real project again.
Hold onto the pattern: the real insets code, next, registers a callback
with `ViewCompat` exactly the way `Chime` was registered with
`Doorbell` here — just with Android's own interface instead of
`TapCallback`, and (for now, flagged and explained properly in Lesson
4) a shorter lambda syntax standing in for a whole named class like
`Chime`.

### Project Change

- **Reference Source:** No reference counterpart — wizard-generated
  boilerplate, present by default in newer Android Studio versions
  (older versions may not generate it at all — both are fine).
- **Files affected:** `MainActivity.java` (already inspected in the
  previous Concept Unit); `activity_main.xml`, whose root needs
  `android:id="@+id/main"` — already present on the wizard-generated
  placeholder from Lesson 1, and something you'll carry forward
  yourself when Lesson 3 replaces that file wholesale.
- **Change type:** Inspect (already written by the wizard).

### The New Code

The exact block from the previous unit, isolated here for its own
explanation:

```java
ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
    Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
    v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
    return insets;
});
```

(This needs three imports at the top of the file —
`import androidx.core.graphics.Insets;`,
`import androidx.core.view.ViewCompat;`, and
`import androidx.core.view.WindowInsetsCompat;`. Since the wizard
generated this block for you, they're already sitting there near the
`package` line — take a look now so the pattern's familiar later, when
you start adding imports yourself.)

### The Updated Project

This sits inside `onCreate`, exactly where the previous unit's full
listing already showed it — after `setContentView`, before the
`Log.d` line you added yourself. Nothing further to show landing
inside; you've already seen its real position.

### Mechanical Walkthrough

- `ViewCompat` — **first appearance.** A class from AndroidX (the
  support-library family every real Android project depends on) whose
  job is providing one consistent API for a `View` operation that
  behaves slightly differently across different Android versions —
  `ViewCompat.setOnApplyWindowInsetsListener` works correctly whether
  the phone running your app is brand new or several years old,
  without you writing separate code for each case.
- `.setOnApplyWindowInsetsListener(view, listener)` — **first
  appearance, reappearing pattern.** Registers a callback — the
  `listener` — to run whenever the system needs to tell `view` how much
  space is currently occupied by system UI (status bar, navigation bar,
  and a few other categories not used here). This is exactly the
  `Doorbell`/`Chime` shape from the lab above: `ViewCompat` plays
  `Doorbell`'s role (holds onto a callback, decides when to call it);
  the object you pass as `listener` plays `Chime`'s role (a real
  implementation of the contract, called later). Worth restating
  precisely: this is **Observer**, not the Template Method shape
  `onCreate` uses — nobody is subclassing anything here.
- `findViewById(R.id.main)` — **first appearance.** "Inflate," used
  loosely just above and from here on, means the step where Android
  reads your XML layout file and builds the real, in-memory `View`
  objects it describes — a `ConstraintLayout` object, a `TextView`
  object, and so on, wired together exactly as the XML nested them.
  `setContentView(R.layout.activity_main)` (above, this same unit)
  triggers that step for the whole screen, before this line ever runs.
  `findViewById` walks the tree that inflation just built, looking for
  the one view whose id matches — here, `R.id.main`, the id on
  `activity_main.xml`'s own root `ConstraintLayout` (Lesson 1's wizard
  default already set this; Lesson 3 preserves it when it replaces the
  file). Returns that view as an object you can call methods on.
  `R.id.main` is the same generated-constant pattern as
  `R.layout.activity_main` from Lesson 2e, just under the `id` nested
  class instead of `layout`. (The class that actually performs
  inflation, `LayoutInflater`, is Lesson 6e's subject — this is the
  concept; that lesson is the mechanism.)
- `(v, insets) -> { ... }` — **reappearing mechanism, new syntax.** You
  already know the mechanism — this is `Chime` again, a real
  implementation of a single-method interface, handed to something
  that calls it later. What's new is *how* it's written: instead of a
  whole separate file with `class Chime implements TapCallback { ... }`,
  this arrow syntax — a **lambda expression** — builds an
  implementation of the interface `setOnApplyWindowInsetsListener`
  expects, right where it's needed, with no class name at all. `v` and
  `insets` are its parameters, playing the same role `onTap()`'s
  (empty) parameter list did: `v` is the view the insets are being
  reported for (the same one passed in as the first argument,
  `findViewById(R.id.main)`), and `insets` is an object describing
  what's currently occupied. The full syntax — why this shorthand is
  legal, and exactly what it expands to — is Lesson 4's own subject,
  arriving next, with a side-by-side comparison against writing the
  `Chime`-style long way by hand. For now: same idea you already
  proved, more compact spelling.
- `insets.getInsets(WindowInsetsCompat.Type.systemBars())` — **first
  appearance.** `insets` (the lambda's own parameter) has a method,
  `getInsets(...)`, that requires you to specify *which* category of
  system UI you're asking about — `WindowInsetsCompat.Type.systemBars()`
  asks specifically for the status bar and navigation bar together
  (other categories exist, like the on-screen keyboard, not used
  here). Returns an `Insets` object.
- `Insets` — **first appearance.** A small class holding exactly four
  numbers: `left`, `top`, `right`, `bottom` — the pixel thickness of
  system UI overlapping each edge of `v`. On a typical phone, `top`
  reflects the status bar's height and `bottom` reflects the
  navigation bar's height; `left`/`right` are usually `0` in portrait
  orientation.
- `v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)`
  — **first appearance.** `setPadding` pushes a view's *content*
  inward from its own edges by the given amount, on each of the four
  sides independently. Calling it here with the exact system-bar
  measurements means your root layout's content is pushed in exactly
  enough to clear the status bar and navigation bar — no more, no
  less, and correctly adjusted per device, since different phones
  have different-sized system bars.
- `return insets;` — **first appearance.** The listener is required to
  return a `WindowInsetsCompat` — here, the same one it received,
  meaning "I've handled what I need to; nothing further is consumed
  for any child view that might also want to react to insets."

### CS Lens (revised 07/25 — fixed, was wrongly conflated with Template Method)

This is the **Observer pattern** — the exact mechanism you built and
ran by hand a few paragraphs ago as `Doorbell`/`Chime`, now seen inside
real Android code instead of a throwaway lab. It's worth being precise
about how that's different from this lesson's first Concept Unit
(`onCreate`), not just waving at both as "the framework calls your
code." Both are examples of a broader idea, **Inversion of Control**
(also called the Hollywood Principle: *"don't call us, we'll call
you"*) — in both cases, you hand control to the framework instead of
writing a top-down script yourself. But *how* each one hands control
back to you is genuinely different, not two names for the same
mechanism:

- `onCreate` is **Template Method**: inheritance-based.
  `AppCompatActivity` defines a fixed sequence of lifecycle steps, and
  you subclass it, overriding specific steps to fill in. The parent
  class controls the whole sequence; your override just fills in one
  fixed slot in it.
- `setOnApplyWindowInsetsListener` is **Observer**: composition-based.
  You're not subclassing anything or overriding a fixed slot — you're
  handing a standalone piece of behavior (the lambda) to an object and
  saying "call this specific thing when this specific event happens."
  Nothing about `MainActivity`'s own class hierarchy is involved.

Also recognized in: browser `ResizeObserver`/`IntersectionObserver`
APIs (react to layout changes you didn't cause — Observer, not
Template Method, since you're registering a callback, not overriding a
base class), and any publish/subscribe system where a component
declares "notify me when X happens" instead of polling for X itself.

### SE Lens

**Why does Android make every app handle this itself instead of just
automatically padding every app's root view for you?** The alternative
— automatic padding everywhere — is exactly what older Android
versions did, and it's simpler, but it also means every app's content
area shrinks by a fixed amount regardless of whether that app actually
wants an immersive, edge-to-edge look (a photo viewer, a game, a video
player often want their content to extend fully behind translucent
system bars). Making insets an explicit, opt-in listener means an app
that wants edge-to-edge visuals can have exactly that for the views
that should extend fully, while still correctly padding the specific
views (like a title bar with real content) that would otherwise be
obscured. The cost: boilerplate every project needs at least once,
which is exactly what you're reading right now.

---

## Connect the Pieces

One trace through this lesson: you tap the Pocket Inventory icon → the
OS reads the Manifest (Lesson 2b), finds the `<activity>` with the
`MAIN`/`LAUNCHER` intent-filter, and knows to build a `MainActivity`
object (the OS's version of the `new Child()` you wrote by hand in the
lab) → the OS, through `AppCompatActivity`'s inherited framework code,
calls `onCreate()` on that object → your override runs
`super.onCreate()` (reaching `AppCompatActivity`'s own setup) then
`setContentView(R.layout.activity_main)` → the screen you saw in
Lesson 1 gets drawn. Every step in that chain is something you can now
name using Lesson 2a's vocabulary: a class, an object built from it,
and a method called on that object.

## What Breaks Without This

Remove `@Override` from `onCreate` and simultaneously misspell the
method name to `onCreat` (both changes together). Try to run the app.
It will still *compile* — without `@Override`, Java has no way to know
you intended to replace an inherited method, so it just accepts
`onCreat` as a brand-new, unrelated method nobody ever calls — but the
app will show a blank screen, because the real `onCreate` Android looks
for was never overridden. Restore both the spelling and `@Override`
afterward. This is exactly why `@Override` is worth typing every time:
it turns this exact silent failure into an immediate compile error.

## Exercises

1. Add a second `Log.d` call inside `onCreate`, *before*
   `super.onCreate(...)`, with a different message. Run it and check
   Logcat — does your line appear before or after Android's own
   internal setup work? What does that tell you about calling
   `super.onCreate()` first vs. last?
2. In the `pkgdemo2` lab, add a *second* override level: a `GrandChild`
   extending `Child`, overriding `setup()` again. Predict the output
   before running it, then check yourself.

## Definition of Done

- [ ] You ran the `Reminder`/`Task` annotation lab yourself, saw
      identical output with the annotation present and removed, and can
      explain why in your own words.
- [ ] You triggered the real `BadChild` compile error on purpose and can
      explain why `@Override` gets that treatment when `@Reminder`
      didn't.
- [ ] You saw your own `Log.d` line appear in Logcat, proving
      `onCreate` is called by the OS, not by you.
- [ ] You ran the `pkgdemo2` Template Method lab and it matched your
      prediction (or you understand why it didn't).
- [ ] You can explain, using Lesson 2a's vocabulary, what object the OS
      builds and what method it calls on it.
- [ ] You triggered the "compiles but shows a blank screen" failure by
      removing `@Override` and misspelling `onCreate`, and restored it.
- [ ] Commit: message explaining *why* (e.g. "Add Logcat trace to
      onCreate to observe Android's lifecycle calling MainActivity, not
      the reverse").

Next lesson: the four access-modifier levels, side by side, using the
same `Vault`-style lab shape as the `pkgdemo2` lab above.
