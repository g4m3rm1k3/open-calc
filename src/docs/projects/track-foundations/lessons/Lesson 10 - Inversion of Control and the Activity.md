# Lesson 10: Inversion of Control and the Activity

**What you will build:** The first four Concept Units build a small,
fully runnable, hand-rolled "fake framework" in plain Java — no Android
involved yet — to isolate one idea before meeting its real Android form.
The last two Concept Units then read the real `Activity` class's actual
declared shape, connecting it directly back to the fake framework already
built.

**What you need to know first:** Lesson 05's `inheritance`, `method
overriding`, and `dynamic dispatch`.

**Terms introduced in this lesson:**

- **Inversion of control** — a framework, not your own code, decides when
  your code runs — it calls into your code at specific points, rather
  than your code calling it.
- **Callback** — a piece of code registered ahead of time and invoked
  later by something else (a framework, a UI toolkit) when a specific
  event occurs.
- **Event-driven programming** — a program's execution is driven by
  responding to discrete events as they occur, rather than running once,
  top to bottom, like a script.
- **Template method pattern** — a base class (or framework) defines a
  fixed sequence of steps and defers one or more individual steps to a
  subclass's own overridden method.
- **Activity** — an Android framework class representing one on-screen
  screen of an app; instantiated and driven entirely by the Android OS,
  not by your own code.
- **Activity lifecycle** — the fixed sequence of framework-invoked
  methods (starting with `onCreate`) an Activity moves through, each one
  a hook for your own code to fill in.

---

## Concept Unit: Inversion of Control — The Framework Calls You

### The Problem

Every program written so far has had one shape: `main` runs, top to
bottom, calling whatever methods it needs, in an order this program's own
code fully controls. Some systems work the opposite way — a separate
piece of software decides when your code runs, calling into it at
specific moments it chooses, rather than your code ever calling out to
request that. This reversal — who calls whom — needs its own name before
Android, which works exactly this way, makes any sense.

### Introduce the Concept in Isolation

```
mkdir lesson-10
cd lesson-10
```

Create `Main.java`:

```java
abstract class MiniFramework {
    void run() {
        System.out.println("Framework starting up...");
        onStart();
        System.out.println("Framework shutting down...");
    }

    abstract void onStart();
}

class MyProgram extends MiniFramework {
    void onStart() {
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

Here is the real output:

```
Framework starting up...
My code is running now.
Framework shutting down...
```

`main` calls `program.run()` exactly once — everything after that is
`MiniFramework`'s own code deciding when `onStart()` gets called, not
`MyProgram`'s own code requesting it. This is `inversion of control` —
**first appearance**: a framework, not your own code, decides when your
code runs — it calls into your code at specific points, rather than your
code calling it. `MyProgram` never calls `onStart()` itself anywhere —
`MiniFramework.run()` does, at the specific moment `MiniFramework`
chooses.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `abstract class MiniFramework { ... }` — **(a) first appearance** of
   `abstract` on a class: a class that cannot be instantiated directly
   with `new` (trying `new MiniFramework()` would fail to compile) and may
   declare methods with no body at all, left for a subclass to supply.
2. `abstract void onStart();` — **(a) first appearance** of an abstract
   method: a declaration with no body, ending in `;` like an interface
   method (Lesson 06), but inside a class rather than an interface. Any
   concrete (non-abstract) subclass of `MiniFramework` must supply a real
   body for it.
3. `void run() { ... }` — an ordinary, fully-implemented method, reused
   method syntax, **(c)**. Its body calls `onStart()` — a call to a
   method `MiniFramework` itself never implements, resolved at runtime
   against whatever concrete subclass actually exists, the same dynamic
   dispatch mechanism from Lesson 05.
4. `class MyProgram extends MiniFramework { void onStart() { ... } }` —
   **(b) reappearing** inheritance and method overriding: `MyProgram`
   supplies the one piece `MiniFramework` left unfinished.
5. `program.run();` — the only call `main` makes. `onStart()` is never
   called directly by `Main` or by `MyProgram` — only indirectly, through
   `run()`, at the exact point `MiniFramework`'s own code decides.

### CS Lens

Inversion of control flips the usual direction of calling: instead of
application code calling into a library (`Integer.parseInt(...)`, from
Lesson 09), a framework calls into application code. The framework owns
`main`-like control of the overall sequence; the application only ever
supplies pieces the framework calls at its own chosen moments.

Also recognized in: every GUI toolkit's event loop, every web framework's
request-handling pipeline, dependency-injection containers generally
(which construct and wire up application objects rather than the
application constructing itself) — a very widely recurring shape once
named.

### SE Lens

The alternative — application code calling the framework directly,
`main` itself deciding exactly when startup, rendering, and shutdown
happen — was not chosen by frameworks like this one because the framework
often has real requirements about ordering and timing (permissions
checked first, resources released last) that the framework itself is
better positioned to guarantee than every individual application. Giving
up control is the real cost: `MyProgram` cannot decide to skip `run()`'s
shutdown message, or call `onStart()` twice — `MiniFramework` owns that
sequence entirely now.

---

## Concept Unit: Callback — Registering Code to Run Later

### The Problem

`onStart()`, in the previous unit, was baked into `MiniFramework`'s own
required shape — any framework user *must* create a subclass and override
it. Sometimes a framework instead needs to let calling code register a
specific piece of behavior for one specific event, without forcing a
whole subclass just for that one registration.

### Introduce the Concept in Isolation

Replace `Main.java`'s contents:

```java
interface ClickHandler {
    void onClick();
}

class Button {
    private ClickHandler handler;

    void setOnClickListener(ClickHandler handler) {
        this.handler = handler;
    }

    void simulatePress() {
        System.out.println("Button was pressed.");
        handler.onClick();
    }
}

public class Main {
    public static void main(String[] args) {
        Button button = new Button();
        button.setOnClickListener(() -> System.out.println("Handler ran!"));
        button.simulatePress();
    }
}
```

Compile and run it. Here is the real output:

```
Button was pressed.
Handler ran!
```

`setOnClickListener(...)` stores a `ClickHandler` — a functional interface
(Lesson 06), here supplied as a lambda — without calling it immediately.
`simulatePress()`, called separately and later, is what actually invokes
it. This is a `callback` — **first appearance**: a piece of code
registered ahead of time and invoked later by something else (a
framework, a UI toolkit) when a specific event occurs.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `interface ClickHandler { void onClick(); }` — **(b) reappearing**
   functional interface from Lesson 06, this time named for a specific
   event rather than a general ability like `Flyer`.
2. `private ClickHandler handler;` and `setOnClickListener(ClickHandler
   handler)` — **(a) first appearance** of the registration shape: storing
   a callback in a field, to be invoked at some later, separate moment,
   rather than being called immediately at registration time.
3. `() -> System.out.println("Handler ran!")` — **(b) reappearing** lambda
   expression from Lesson 06, here supplying `onClick()`'s body directly.
4. `button.simulatePress();` — this is the actual invocation. Note the
   gap: registration (`setOnClickListener`) and invocation
   (`simulatePress`) are two completely separate calls, at two separate
   moments — the callback sits stored and unused in between.

### CS Lens

A callback is inversion of control applied to one specific piece of
behavior, rather than to a whole class's structure. `Button` doesn't know
or care what the registered handler actually does — it only knows *when*
to call it. This is the general shape every click listener, lifecycle
method, and observer in this course shares: something registered ahead of
time, invoked later, at a moment the callback's own author doesn't
control.

Also recognized in: `addEventListener` in JavaScript (near-identical
registration/invocation split), signal/slot connections in Qt, any
`onSomething(...)` method across virtually every UI framework.

### SE Lens

The alternative — `Button` requiring a full subclass to override a
`click()` method, the way `MiniFramework` required in the previous unit
— was not chosen here because a `Button` in a real UI often needs its
click behavior decided at the moment it's created, inline, without a
whole new named class for every single button. A callback lets that
behavior be supplied as a value — here, a lambda — right where the button
itself is set up.

---

## Concept Unit: Event-Driven Programming — A Different Shape of Program

### The Problem

Every program before this lesson had one clear starting point and ran
top to bottom until it finished. The previous two units' code still,
technically, ran and finished that way too — but the *reason* those
patterns exist is a program shape that genuinely doesn't: one that starts
up, then waits, responding to whatever happens next, for as long as it
runs, with no single top-to-bottom script describing its entire behavior
in one pass.

### Introduce the Concept in Isolation

This concept doesn't need new runnable code beyond what the two previous
units already built and already produced real output for — it names the
paradigm those units were both already examples of. Both `MiniFramework`
(inversion of control) and `Button`/`ClickHandler` (callbacks) are small
pieces of `event-driven programming` — **first appearance**: a program's
execution is driven by responding to discrete events as they occur,
rather than running once, top to bottom, like a script. A real button in
a real UI doesn't know, in advance, when — or whether — it will ever be
clicked; its code exists purely to be *ready* to respond whenever that
event actually happens.

### Discard the Throwaway Example

No new code was introduced in this unit — it names a paradigm already
demonstrated by the previous two units' real, compiled, executed code.

### Mechanical Walkthrough

No new syntax appears in this unit; its content is the CS/SE framing
below, applied to code already run and proven in this lesson.

### CS Lens

Event-driven programs are structured around **events** — discrete
occurrences (a click, a message arriving, a timer firing) — and
**handlers** registered to respond to them, rather than a single
sequential script. `Main`'s own `main` method, in every previous lesson,
still ran top to bottom — but real event-driven systems (a real button in
a real running application) sit idle between events indefinitely, calling
registered handlers only when something actually happens, for as long as
the program keeps running.

Also recognized in: every GUI application ever built, server code
responding to incoming network requests, any script that reads and reacts
to sensor input in a loop, video game engines processing player input
frame by frame.

### SE Lens

This concept itself names a paradigm rather than introducing a new
design tradeoff of its own — the tradeoffs (giving up control of timing
and sequence) were already covered under inversion of control, its
underlying mechanism.

---

## Concept Unit: The Template Method Pattern — A Fixed Sequence, One Step Filled In

### The Problem

`MiniFramework.run()`, from the first unit, called exactly one
overridable step, `onStart()`. Real frameworks typically define a longer,
fixed *sequence* of steps — start up, then run, then shut down, in a
guaranteed order — filling in only some of those steps from the
subclass, while keeping the overall order itself completely outside the
subclass's control.

### Introduce the Concept in Isolation

Replace `Main.java`'s contents:

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

Compile and run it. The terminal prints:

```
Default setup.
My code is running now.
Default teardown.
```

`run()` is now marked `final` (Lesson 05's sealing, reused: no subclass
may override the sequence itself), and calls three steps in a fixed
order — `setup()`, `execute()`, `teardown()` — where `MyProgram` only
overrides `execute()`, inheriting `setup()`/`teardown()`'s default
behavior unchanged, confirmed by the real output above. This is the
`template method pattern` — **first appearance**: a base class (or
framework) defines a fixed sequence of steps and defers one or more
individual steps to a subclass's own overridden method.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `final void run() { ... }` — **(b) reappearing** sealing from Lesson
   05, here specifically preventing the *sequence itself* from ever being
   overridden, even though individual steps inside it can be.
2. `setup()`, `execute()`, `teardown()`, called in that fixed order — the
   **template**: a sequence `MiniFramework` alone controls completely.
3. `void setup() { ... }` and `void teardown() { ... }` — ordinary,
   non-abstract methods with real default bodies, overridable but not
   required to be overridden — **(a) first appearance** of this specific
   role: an optional customization point, distinct from `execute()`'s
   required one.
4. `abstract void execute();` — **(b) reappearing** abstract method from
   the first unit: the one step every subclass *must* supply.
5. `class MyProgram extends MiniFramework { void execute() { ... } }` —
   overrides only the required step; `setup()`/`teardown()` run using
   `MiniFramework`'s own default bodies, unchanged, because `MyProgram`
   never touched them.

### CS Lens

The template method pattern is inversion of control given a specific,
named shape: not just "the framework calls you," but "the framework
calls you at these specific, ordered points, some required, some
optional." This is exactly the shape behind Android calling `onCreate()`
on an Activity — the framework owns the sequence, an override fills in
one step of it.

Also recognized in: any base class's "lifecycle" methods across virtually
every UI or application framework, `unittest.TestCase`'s
`setUp()`/`test*()`/`tearDown()` sequence in Python (structurally
identical to this lesson's own `setup`/`execute`/`teardown`), any
algorithm skeleton with pluggable steps in classic design-pattern
literature.

### SE Lens

The alternative — giving `MyProgram` full control, letting it override
`run()` itself directly — was not chosen for frameworks that need to
guarantee a specific order happens no matter what any subclass does;
sealing `run()` with `final` is what makes that guarantee real rather than
advisory. The cost: a subclass genuinely cannot reorder or skip steps,
even if it wanted to — a deliberate tradeoff, trading subclass flexibility
for a sequence guarantee the framework's own correctness may depend on.

---

## Concept Unit: `Activity` — Android's Real Template Method

### The Problem

Everything built so far in this lesson was a small, hand-rolled
simulation in plain Java, run with nothing but `javac`/`java` — deliberately,
to isolate inversion of control, callbacks, and the template method
pattern before meeting Android's real version of all three at once. An
Android `Activity` cannot actually be compiled and run this way — it
requires the real Android framework and OS to instantiate and drive it,
which is outside this lesson's plain-Java lab format. Instead, this unit
reads `Activity`'s real, declared shape directly, connecting it back to
everything already built and run in this lesson.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's the real contract, read directly and
verified against the real `android.app.Activity` source, per this
curriculum's own rule that a parent type being extended must be shown in
its actual declared shape, not just described in prose. The contract
you're filling in (from `android.app.Activity`, not your code) — its
relevant declared shape:

```java
public class Activity extends ContextThemeWrapper {
    protected void onCreate(Bundle savedInstanceState) {
        // real framework implementation, not shown here
    }

    // many further lifecycle methods, covered in the next unit
}
```

A concrete Activity, as an application developer would write it:

```java
public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // application-specific setup goes here
    }
}
```

`Activity` — **first appearance**: an Android framework class representing
one on-screen screen of an app; instantiated and driven entirely by the
Android OS, not by your own code. `MainActivity extends Activity`
overrides `onCreate`, exactly the same inheritance-and-overriding shape
as this lesson's own `MyProgram extends MiniFramework` overriding
`execute()` — except here, nothing in this program ever calls `new
MainActivity()` or `mainActivity.onCreate(...)` anywhere. The Android OS
does, at a moment and in a manner this lesson's code has no control over
at all — the same inversion of control this lesson already built and ran,
now at the scale of an entire operating system deciding when an
application's screens come to life.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is the real framework
contract, kept as reference, not deleted.

### Mechanical Walkthrough

1. `public class Activity extends ContextThemeWrapper` — `Activity`
   itself is part of a longer real inheritance chain; `ContextThemeWrapper`
   is not covered in this lesson, named here only so the shown contract
   isn't silently missing a real detail.
2. `protected void onCreate(Bundle savedInstanceState)` — **(a) first
   appearance** of `Bundle`, a class this lesson does not fully explain
   (a later lesson covers it properly) — named here at Recognition depth
   only, since it appears unavoidably in this exact signature. `protected`
   is **(a) first appearance** of a third access level, between `private`
   (Lesson 04) and `public`: reachable by subclasses and code in the same
   package, but not by unrelated outside code — the exact visibility
   `onCreate` needs, since only a subclass should ever override it, but
   nothing outside the framework should call it directly.
3. `public class MainActivity extends Activity` and `@Override protected
   void onCreate(...)` — **(b) reappearing** inheritance, overriding, and
   the `@Override` annotation (Lesson 08), applied to a real framework
   base class instead of a hand-rolled one.
4. `super.onCreate(savedInstanceState);` — **(a) first appearance** of
   `super` used to call a parent's own version of an overridden method:
   Lesson 05's overriding *replaced* a parent's method entirely;
   `Activity`'s real contract expects overriding subclasses to still run
   the parent's own version too, via `super`, before or alongside their
   own code — a real, load-bearing framework requirement, not optional
   ceremony.

### CS Lens

`Activity` is this lesson's own template method pattern, at Android's
real scale: `onCreate` is one required step in a longer fixed sequence
(the next unit's Activity lifecycle) the Android OS itself calls, in an
order application code does not control, the same way `MiniFramework.run()`
controlled `setup`/`execute`/`teardown`'s order regardless of what
`MyProgram` did.

Also recognized in: every mobile or desktop UI framework's own "screen"
or "window" base class (`UIViewController` in iOS, `Window` in WPF) —
each instantiated and driven by its own platform, not by application
code directly.

### SE Lens

The alternative — Android providing a `main()`-style entry point that
application code calls to create and show a screen itself — was not
chosen because the OS needs to control screen creation and destruction
tightly, for reasons application code can't be trusted to get right
consistently (memory pressure, the user pressing Back, the phone
rotating). Inversion of control, at OS scale, is what makes that possible
— exactly the reasoning this lesson's own `MiniFramework` unit already
built up from a much smaller example.

---

## Concept Unit: The Activity Lifecycle — The Fixed Sequence Itself

### The Problem

The previous unit showed `onCreate` as one method Android calls. A real
Activity's actual sequence is longer than one method — Android calls
several, in a specific, guaranteed order, as a screen is created,
becomes visible, goes into the background, and is eventually destroyed.
Without knowing this sequence exists and is fixed, `onCreate` reads as an
arbitrary starting function rather than one stop on a real, ordered path.

### Introduce the Concept in Isolation

The real, partial shape of `Activity`'s lifecycle methods — verified against
the real framework source — in the order the Android OS actually calls
them for a screen appearing and then being fully closed:

```java
public class Activity extends ContextThemeWrapper {
    protected void onCreate(Bundle savedInstanceState) { }
    protected void onStart() { }
    protected void onResume() { }
    protected void onPause() { }
    protected void onStop() { }
    protected void onDestroy() { }
}
```

This is the `activity lifecycle` — **first appearance**: the fixed
sequence of framework-invoked methods (starting with `onCreate`) an
Activity moves through, each one a hook for your own code to fill in.
None of these six methods are ever called by application code directly —
the Android OS calls each one, in this exact order, as a screen is
created (`onCreate` → `onStart` → `onResume`), then eventually torn down
(`onPause` → `onStop` → `onDestroy`) — the same template-method shape as
this lesson's own `setup()`/`execute()`/`teardown()`, just with six steps
instead of three, and driven by real user actions (opening the app,
switching away, closing it) instead of one direct method call.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is the real framework
contract, kept as reference.

### Mechanical Walkthrough

1. `onCreate`, `onStart`, `onResume`, `onPause`, `onStop`, `onDestroy` —
   **(a) first appearance** as a named, ordered sequence — six template-
   method steps, all optional to override individually (an Activity that
   overrides none of them still moves through all six, doing nothing
   extra at each), but whose *order* is entirely fixed by the framework,
   never by application code.
2. Every method shown `protected` — **(b) reappearing** access level from
   the previous unit, consistently applied across the whole sequence:
   subclasses override these, unrelated outside code never calls them
   directly.

### CS Lens

The Activity lifecycle is the template method pattern at full scale: six
ordered steps instead of this lesson's own three, each individually
overridable, with the sequence itself entirely outside any subclass's
control. `onCreate` being "one stop on a fixed sequence" rather than an
arbitrary starting function is exactly what this whole lesson has been
building toward — the same inversion of control from the very first unit,
now recognizable in its real, full Android form.

Also recognized in: every component lifecycle across mobile frameworks
generally (iOS's `viewDidLoad`/`viewWillAppear`/`viewDidDisappear`
sequence is a direct structural equivalent), any framework's
"mount"/"update"/"unmount" component lifecycle (web UI frameworks like
React use this same fixed-sequence, overridable-steps shape).

### SE Lens

The alternative — a single `onCreate`-only lifecycle, with no further
hooks — was not chosen because a real screen needs to react differently
to different moments: `onPause` is the right place to save state before
possibly being interrupted; `onResume` is the right place to refresh data
that might have changed while the screen was away. Six distinct,
ordered hooks let application code respond precisely to each specific
moment, rather than trying to infer "which phase are we in" from inside
one single, overloaded method.

---

## Connect the Pieces

`MiniFramework.run()` called `onStart()` at a moment only `MiniFramework`
controlled — inversion of control, the root idea. `Button` registered a
`ClickHandler` ahead of time and invoked it later — a callback, one
concrete shape inversion of control takes. Both are instances of
event-driven programming: code that responds to moments it doesn't
schedule itself. `MiniFramework.run()`'s fixed `setup`/`execute`/
`teardown` sequence, with only `execute()` required, named the template
method pattern precisely. `Activity`'s real `onCreate`, read directly
from its actual declared shape, is exactly that same pattern — and its
full lifecycle (`onCreate` through `onDestroy`) is that same pattern's
real, six-step Android form: a fixed sequence, application code filling
in some steps, the Android OS deciding when each one actually runs.

## What Breaks Without This

Remove `final` from this lesson's own `MiniFramework.run()` and let
`MyProgram` override it directly:

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

Run it:

```
I skipped setup and teardown entirely.
```

Without `final`, nothing stops a subclass from overriding the whole
sequence and discarding the guarantee entirely — `setup()` and
`teardown()` never run at all, and `execute()`, still declared abstract
and still required to compile, is never called either. This is the
concrete proof `final` is what makes the sequence a real guarantee rather
than a suggestion — and, by direct analogy, why nothing in application
code is ever allowed to override Android's own `Activity` lifecycle
sequence itself, only its individual steps.

## Exercises

1. Add a fourth step to `MiniFramework`'s template (e.g. `validate()`,
   called before `setup()`), required (`abstract`), and update
   `MyProgram` to supply it — confirm the new step runs in the correct
   position in the printed order.
2. In the "What Breaks Without This" version, add a `print` statement
   inside `execute()` too, and confirm — by actually running it — that
   overriding `run()` entirely really does mean `execute()` is never
   called, not just skipped silently.
3. Write out, from memory, the real `Activity` lifecycle's six method
   names in order, then check them against this lesson's own contract
   block.

## Definition of Done

- [ ] You ran the `MiniFramework`/`onStart()` example and saw the real
      three-line output, in order.
- [ ] You ran the `Button`/`ClickHandler` example and saw the real
      registration-then-invocation output.
- [ ] You ran the `setup`/`execute`/`teardown` template method example
      and saw all three steps run in the fixed order.
- [ ] You completed Exercise 2 and confirmed, by actually running it,
      that skipping `final` really does let a subclass discard the whole
      sequence.
- [ ] You can state, without looking back at this lesson, why `Activity`
      is never constructed with `new MainActivity()` anywhere in
      application code.
