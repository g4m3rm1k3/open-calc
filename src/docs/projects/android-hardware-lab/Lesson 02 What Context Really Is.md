# Lesson 02: What `Context` Really Is

**What you will build:** A throwaway pure-Java simulation (scratch file
again) of a real, named design pattern — build it generically first,
with no Android in sight — then hold it up next to Android's actual
`Context` class family and see the exact same shape underneath. Then:
one runnable check, in a real Activity, that proves two different
"Contexts" you have easy access to are not the same object, don't have
the same lifetime, and confuses one for the other in a way that
reliably leaks memory.

**What you need to know first:** Lesson 01 (`getSystemService`,
casting, `Context` as "the thing you call `getSystemService` on"). This
lesson goes back and opens up the box Lesson 01 left closed.

**Terms introduced in this lesson:**
- **Wrapper (Decorator) pattern** — a class that implements the same
  contract as some other object, holds a reference to that other
  object internally, and forwards calls to it by default — while being
  free to override specific calls with different behavior.
- **`ContextImpl`** — Android's real, package-private implementation of
  `Context`. You never write `ContextImpl` yourself and can't name it
  in your own code — you only ever meet it indirectly.
- **`ContextWrapper`** — the public class, extending `Context`, that
  holds a reference to a real `Context` (usually a `ContextImpl`) and
  forwards to it. `Activity`, `Application`, and `Service` all extend
  this, not `ContextImpl` directly.
- **Activity Context vs. Application Context** — two different objects,
  both usable as a `Context`, with two different lifetimes: one tied to
  a single screen, one tied to the whole running app process.
- **Memory leak (this specific kind)** — an object that should have
  become eligible for garbage collection, but isn't, because something
  else — often something long-lived, like a `static` field — still
  holds a reference to it.
- **Garbage collection (GC)** — Java's automatic memory reclamation.
  Unlike C or C++, where a program must explicitly free memory it's
  done with, the JVM runs a background process that periodically finds
  every object nothing in the running program can still reach, and
  frees only those. Worth naming a common misconception directly:
  "Java can't leak memory, it has garbage collection" is false. A leak
  isn't forgetting to free something — it's accidentally keeping
  something *reachable*, via a lingering reference, long after the
  program is really done with it. The collector isn't broken or lazy
  in that case; it's correctly, permanently unable to touch anything
  still reachable, no matter how obviously unused it actually is.

**Objects and methods this lesson uses:**

**`System.identityHashCode(Object)`**
- *What it is:* the closest thing Java has to a raw memory address — a
  semi-unique "serial number" for one specific object.
- *Implementation:* a `static` method on Java's standard `System`
  class — plain Java, not Android-specific. Given any object
  reference, it returns an `int` derived from where that object
  currently lives in memory. Not guaranteed unique forever (a number
  can theoretically repeat after an old object is garbage collected
  and a new one happens to land in the same spot), but reliable enough
  to tell apart every object that exists *at the same time*.
- *Its use:* this lesson's forensic tool, in "What Breaks Without
  This," below — proof that two `MainActivity` instances logged across
  a rotation are, or aren't, the exact same object in memory, rather
  than trusting a description of what "should" be happening.

---

## Concept Unit: A Class That Forwards To Another Object

### The Problem

Lesson 01 said `Context` is "the object your Activity already is,"
which is true but stops short. Here's the part it skipped: **`Context`
is an abstract class with no real logic in it at all** — it only
declares *what* a `Context` can do (`getSystemService`, `getResources`,
and dozens more). Something else has to actually *do* those things.

Before looking at how Android solves this, solve a smaller, generic
version of the same problem yourself: you have an interface, a real
class that implements it, and you want a second version that behaves
*almost* the same — forwarding most calls unchanged — but changes just
one thing. You don't want to reimplement the whole interface from
scratch just to change one method.

**Predict before reading on:** if you write a new class that holds a
reference to an existing object implementing the same interface you're
implementing, and forwards every method call to it unchanged except
one — is the new class still a fully valid, honest implementation of
that interface, as far as any caller can tell?

### Introduce the Concept in Isolation — Step 1: The Pattern, Generically

New scratch file (**File → New → Scratch File**, Java):

```java
interface Greeter {
    String greet();
}

// The one real implementation — the only class here that actually
// does the work, with no forwarding involved.
class SimpleGreeter implements Greeter {
    @Override
    public String greet() {
        return "Hello";
    }
}

public class Scratch {
    public static void main(String[] args) {
        Greeter g = new SimpleGreeter();
        System.out.println(g.greet());
    }
}
```

Run it. Real output:

```
Hello
```

Nothing new yet — this is just an interface and its one implementation.
Now add the wrapper:

```java
// Implements the SAME interface as SimpleGreeter, but holds a
// reference to some OTHER Greeter instead of doing the work itself.
class GreeterWrapper implements Greeter {
    private final Greeter base;

    GreeterWrapper(Greeter base) {
        this.base = base;
    }

    // Lets a subclass reach the wrapped object — mirrors Android's
    // real ContextWrapper.getBaseContext(), which does exactly this.
    protected Greeter getBaseGreeter() {
        return base;
    }

    // Pure forwarding: no new behavior, just hands the call to base.
    @Override
    public String greet() {
        return base.greet();
    }
}
```

Run this addition (add to `main`):

```java
Greeter wrapped = new GreeterWrapper(new SimpleGreeter());
System.out.println(wrapped.greet());
```

Real output:

```
Hello
```

Identical output to the unwrapped version — proving the wrapper is
"invisible" by default; it changes nothing yet. Now the actual payoff —
a subclass of the wrapper that changes exactly one thing:

```java
class LoudGreeter extends GreeterWrapper {
    LoudGreeter(Greeter base) {
        super(base);
    }

    // Overrides the forwarding behavior for just this one method.
    @Override
    public String greet() {
        return getBaseGreeter().greet().toUpperCase() + "!!!";
    }
}
```

```java
Greeter loud = new LoudGreeter(new SimpleGreeter());
System.out.println(loud.greet());
```

Real output:

```
HELLO!!!
```

`LoudGreeter` never reimplemented greeting logic — it reused
`SimpleGreeter`'s real `"Hello"` by calling through the wrapper, and
only changed what happens to that result. All three — `SimpleGreeter`,
`GreeterWrapper`, `LoudGreeter` — are equally valid `Greeter`s as far as
`main` can tell; nothing about calling `.greet()` reveals which kind
you have.

### Introduce the Concept in Isolation — Step 2: The Real Shape, Read Side By Side

Delete the scratch file — same reason as always, it was only here to
build the mechanism cheaply.

Android's real classes (confirmed against AOSP's
`android.content.Context` / `ContextWrapper` / `ContextThemeWrapper`
source — this shape has been stable since Android's earliest public
releases), abbreviated to the parts that matter here:

```java
public abstract class Context {
    public abstract Object getSystemService(String name);
    // ...dozens more abstract methods
}

public class ContextWrapper extends Context {
    Context mBase; // <-- your GreeterWrapper's `base`, same job

    public ContextWrapper(Context base) {
        mBase = base;
    }

    public Context getBaseContext() {   // <-- your getBaseGreeter()
        return mBase;
    }

    @Override
    public Object getSystemService(String name) {
        return mBase.getSystemService(name); // <-- pure forwarding
    }
    // ...every other method forwards to mBase the same way
}
```

Line up the two side by side:

| Your scratch code       | Android's real code       |
|--------------------------|----------------------------|
| `Greeter` (interface)     | `Context` (abstract class) |
| `SimpleGreeter`           | `ContextImpl` (hidden — you never name this class yourself) |
| `GreeterWrapper`          | `ContextWrapper`           |
| `base` field              | `mBase` field              |
| `getBaseGreeter()`        | `getBaseContext()`         |
| `LoudGreeter`              | `ContextThemeWrapper`, and then `Activity` on top of that |

`Activity` doesn't extend `ContextWrapper` directly — it extends
`ContextThemeWrapper`, which extends `ContextWrapper`. Same idea as
stacking `LoudGreeter` on `GreeterWrapper`: each layer forwards
whatever it doesn't specifically change.

### Introduce the Concept in Isolation — Step 3: Two Real Contexts, Proven Different

Reuse the project from Lesson 01 — its `MainActivity` already has
`EdgeToEdge.enable(this)`, `setContentView(...)`, and Lesson 01's
clipboard-lookup block in `onCreate`. Add the three new lines directly
after Lesson 01's block, before the generated insets listener. Whole
file, new lines marked:

```java
package com.example.myapplication; // your package name will differ

import android.content.ClipboardManager;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);                // <- generated, leave as-is
        setContentView(R.layout.activity_main);  // <- generated, leave as-is

        // ---- Lesson 01's block, already here, leave as-is ----
        Object rawService = getSystemService(Context.CLIPBOARD_SERVICE);
        if (rawService == null) {
            Log.d("SysService", "Clipboard service unavailable on this device");
            return;
        }
        ClipboardManager clipboard = (ClipboardManager) rawService;
        Log.d("SysService", "Got: " + clipboard.getClass().getSimpleName());

        // ---- new in this lesson ----
        Context activityContext = this;               // MainActivity IS a Context
        Context appContext = getApplicationContext();  // a different Context entirely

        Log.d("ContextCheck", "activity class: " + activityContext.getClass().getSimpleName());
        Log.d("ContextCheck", "app class: " + appContext.getClass().getSimpleName());
        Log.d("ContextCheck", "same object? " + (activityContext == appContext));

        // ---- generated, leave as-is ----
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }
}
```

Real Logcat output from running this just now:

```
D/ContextCheck: activity class: MainActivity
D/ContextCheck: app class: Application
D/ContextCheck: same object? false
```

Two different classes, two different objects, both legitimately
`Context`. `activityContext`'s lifetime is tied to this one screen —
Android destroys it (and everything it holds) when the screen is
destroyed, including on something as ordinary as a screen rotation.
`appContext`'s lifetime is tied to the entire app process — it exists
once, for as long as your app is running at all, no matter how many
screens open and close.

### Mechanical Walkthrough

- `Context` — **first appearance, precisely.** An `abstract class`, not
  a concrete one. It declares the method shapes (`getSystemService`
  and many others) but supplies no real bodies for most of them —
  exactly like `Greeter` declared `greet()` with no body.
- `ContextImpl` — the actual working implementation, holding the real
  service table from Lesson 1. You never write `import ... ContextImpl`
  yourself; it's created and managed entirely by the Android framework.
- `ContextWrapper` — **first appearance.** A `Context` that is also, at
  the same time, a *holder of* another `Context` (`mBase`). Every
  method it doesn't specifically override just calls the matching
  method on `mBase` — identical in shape to `GreeterWrapper.greet()`
  calling `base.greet()`.
- `this` (inside an Activity method) — refers to the `Activity` object
  itself, which — through `extends ContextThemeWrapper extends
  ContextWrapper extends Context` — genuinely *is* a `Context`, the
  same way `LoudGreeter` genuinely *is* a `Greeter`, not a class that
  merely resembles one.
- `getApplicationContext()` — a method (declared on `Context`, so every
  `Context` has it) that returns a *different* `Context` entirely: one
  whose `mBase` is tied to the `Application` object, not to any one
  `Activity`.

### Execution Trace

Tracing what actually happens when `this.getSystemService(...)` runs
inside an Activity — the same call from Lesson 01, now traced one
layer deeper:

1. `this.getSystemService("clipboard")` is called. `this` is a
   `MainActivity`.
2. `MainActivity` doesn't override `getSystemService` itself (most
   apps never do), so the call resolves up the inheritance chain to
   `ContextThemeWrapper`, which also doesn't override it here.
3. It resolves further up to `ContextWrapper.getSystemService(String)`
   — the real method body that runs.
4. That body executes exactly one line: `return
   mBase.getSystemService(name);` — forwarding the call to whatever
   `Context` is stored in `mBase`.
5. `mBase`, for an `Activity`, is a real `ContextImpl` that the
   framework attached to this Activity when it was created (through a
   method called `attachBaseContext`, before your own `onCreate` ever
   runs).
6. `ContextImpl.getSystemService` runs the real lookup from Lesson 1's
   Execution Trace — the OS-populated table, keyed by string.
7. The result travels back down through steps 4 → 3 → 2 → 1, unchanged
   at every layer, arriving back at your original call site.

Every step from 2 through 4 was invisible in Lesson 1 — it looked like
`this` did the work directly. It didn't; it forwarded.

### CS Lens

This is the **Decorator pattern** (sometimes called Wrapper) — one of
the classic Gang-of-Four patterns: a class implementing an interface,
holding another implementer of that same interface, forwarding by
default, overriding selectively. The textbook version usually stacks
*several* decorators at runtime to combine independent behaviors (think
`BufferedReader` wrapping a `Reader` wrapping a file). Android's use is
narrower — a fixed, small chain (`ContextWrapper` →
`ContextThemeWrapper` → `Activity`) decided at compile time, not
assembled dynamically — but the forwarding-plus-override mechanism is
identical to the textbook pattern.

### SE Lens

**Why not make `Activity` extend `ContextImpl` directly, skipping the
wrapper entirely?** Because `ContextImpl` doesn't exist yet at the
moment your `Activity` subclass's constructor would need one — the
framework creates the Activity object first, then attaches a real
`ContextImpl` to it slightly later (`attachBaseContext`), before
`onCreate` runs. A wrapper can be constructed empty and have its `base`
filled in afterward; a class that *is* the implementation directly
cannot. The indirection also means `Application`, `Service`, and
`Activity` — three very different kinds of components with three
different lifetimes — can all share one implementation strategy
(`ContextImpl`) without duplicating it three times.

---

## Connect the Pieces

Step 1 built a generic wrapper from nothing: an interface, one real
implementer, one forwarding wrapper, one subclass that changed a
single method. Step 2 held that exact shape up against Android's real
`Context`/`ContextWrapper` pair and found the same four roles, renamed.
Step 3 used that structure to prove something concrete: `this` inside
an Activity and `getApplicationContext()` are two different `Context`
objects, wrapping two different real implementations, with two
different lifetimes — not interchangeable, even though both compile
and run identically wherever a `Context` parameter is expected.

## What Breaks Without This

The lifetime difference from Step 3 isn't academic — it's the single
most common way Android memory leaks happen. Reproduce one directly.

This demo is throwaway and temporary: comment out (don't delete) the
body of your current `onCreate` — Lesson 01's block and Step 3's block
above — and replace it with this instead, just for this one
experiment:

```java
public class MainActivity extends AppCompatActivity {

    // DO NOT do this in real code — this line is the mistake, kept on
    // purpose so you can watch it happen.
    static Context leakedContext;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        leakedContext = this; // a static field now holds an Activity Context
        Log.d("LeakDemo", "onCreate ran, this = " + System.identityHashCode(this));
    }
}
```

(`EdgeToEdge.enable(this)` and the generated insets listener are
omitted here on purpose — this experiment doesn't need them. Leave
them commented out along with everything else for now.)

Run it, note the logged number, then rotate the emulator (Ctrl+F11 on
most setups, or use the rotate button on the emulator toolbar). Real
Logcat output from doing this just now:

```
D/LeakDemo: onCreate ran, this = 366240857
D/LeakDemo: onCreate ran, this = 891573204
```

Two different numbers. Rotation destroyed the first `MainActivity` and
created a brand-new one — that's the second log line. But
`MainActivity.leakedContext` is a `static` field: it belongs to the
class itself, not to any one Activity instance, and static fields live
for the entire process. It is still holding a reference to the
*first*, already-destroyed Activity — identity hash `366240857` —
which means that entire object, and everything it points to (its full
view tree, every `TextView` and layout inside it), cannot be garbage
collected (see Terms, above), ever, for as long as your process runs.
This is garbage collection working exactly as documented, not
failing: nothing is unreachable, so nothing gets collected — the
collector has no way to know your code considers this Activity "done."
You've leaked a destroyed screen. This is provable more rigorously
with Android Studio's Profiler (a later lesson's territory), but the
mismatched identity hashes above are the same fact, seen directly.

Delete this experiment's code entirely — the `static leakedContext`
field and its `onCreate` — and uncomment your real `onCreate` body
(Lesson 01's block and Step 3's block) to restore where you left off.
This experiment's code must never ship and was never meant to coexist
with the rest of the file.

## Exercises

1. In the Step 1 scratch file, add a third class, `QuietGreeter extends
   GreeterWrapper`, that lowercases the result instead of shouting it.
   Confirm all three — `SimpleGreeter`, `LoudGreeter`, `QuietGreeter` —
   work through the exact same `Greeter greet()` call site in `main`
   with no changes to `main` itself.
2. In the real project, call `getBaseContext()` on your Activity
   (`this.getBaseContext()`) and log its class name. You're looking at
   the real, hidden `ContextImpl` directly — the object `this` has been
   forwarding to this whole time.
3. Before testing: if you call `getApplicationContext()` from two
   different points in your app (say, `onCreate` and a button's click
   listener), do you expect the same object back both times, or two
   different ones? Write your prediction down, then test it by logging
   `System.identityHashCode(getApplicationContext())` from both places
   and comparing.

## Definition of Done

- [ ] You built and ran all three classes in the Step 1 scratch file
      yourself and can explain, without looking, what each of
      `SimpleGreeter`, `GreeterWrapper`, and `LoudGreeter` is
      responsible for.
- [ ] You can name, from memory, the four real Android classes that
      correspond to your four scratch-file roles.
- [ ] You ran the Step 3 check and saw `same object? false` yourself.
- [ ] You reproduced the leak demo, saw two different identity hashes
      across a rotation, and can explain in your own words why the
      `static` field is what makes it a leak rather than just a stale
      value.
- [ ] You removed the `static leakedContext` field before moving on.
- [ ] Commit: not applicable — Steps 1–2 were a scratch file
      (discarded); the leak demo must be deleted, not kept, from
      whatever project you tested it in.

Next: back to `getSystemService`'s return value — but this time the
object it hands back doesn't just sit there holding data. It pushes
new values at *you*, on its own schedule, through an interface you
implement.
