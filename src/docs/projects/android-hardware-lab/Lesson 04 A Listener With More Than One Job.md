# Lesson 04: A Listener With More Than One Job

**What you will build:** A throwaway pure-Java simulation (scratch
file) of an interface with two required methods instead of one, proving
with a real compiler error that a lambda cannot implement it — then the
real thing, added to your existing project: `ViewGroup`'s own
`OnHierarchyChangeListener`, registered on the screen you already have,
triggered by adding and removing a view in code. No new layout XML, no
permissions.

**What you need to know first:** Lesson 03 (listener/callback
interfaces, anonymous class vs. lambda, functional interfaces, the
Observer pattern).

**Terms introduced in this lesson:**
- **Multi-method interface** — an interface declaring more than one
  abstract method. A lambda can never implement one, no matter how
  trivial each method's body would be — not a style rule, a mechanical
  one: a lambda's syntax has no room to write more than one method
  body, so the compiler has no way to know which of several abstract
  methods it's supposed to be providing.
- **No-op** (no-operation) — an implementation of a required method
  that intentionally does nothing. Required because Java's rule is
  "implement every abstract method or the class can't be
  instantiated," and that rule has no exception for "methods you
  personally don't need."
- **`View`** — the base class every visible thing on an Android screen
  is built from. A concrete class in its own right (you can construct
  a bare one directly, as this lesson does), responsible for occupying
  a rectangular area and knowing how to draw itself and handle touch —
  every `Button`, every `TextView`, every layout container all inherit
  from it.
- **`ViewGroup`** — a `View` that can itself contain other `View`s.
  Every screen in Android is built as a tree of these: a `ViewGroup`
  holding more `View`s, some of which are themselves `ViewGroup`s
  holding more `View`s still.
- **Bounded type parameter** — a generic placeholder restricted to a
  specific family of types, written `<T extends SomeType>`, instead of
  accepting absolutely anything. This series has seen a generic method
  before — Lesson 03's aside on `getSystemService(Class<T>
  serviceClass)` — but that `T` was unbounded, free to be any type at
  all. `findViewById`'s real signature, below, is the first *bounded*
  one this series shows: `T` restricted to "some kind of `View`,"
  which is exactly what makes the compiler able to remove the cast
  entirely rather than just rewrite it.

**Objects and methods this lesson uses:**

**`ViewGroup.OnHierarchyChangeListener`**
- *What it is:* a way to be told, immediately, whenever a `ViewGroup`
  gains or loses a child — without checking yourself.
- *Implementation:* declared directly inside `ViewGroup`, exactly as
  Android declares it (confirmed against Android's own reference docs
  this session):
  - `onChildViewAdded(View parent, View child)` — called the instant a
    child view is added; `parent` is the `ViewGroup` it was added to,
    `child` is the view that was just added.
  - `onChildViewRemoved(View parent, View child)` — the same, for
    removal.
- *Its use:* registered once on a `ViewGroup` via
  `setOnHierarchyChangeListener(...)`; both methods fire automatically
  from then on, for as long as the listener stays registered.

**`ViewGroup.addView(View)` / `removeView(View)`**
- *What it is:* the methods that actually change a `ViewGroup`'s
  children — add one, or take one back out.
- *Implementation:* inherited, real methods on every `ViewGroup`. This
  lesson calls them directly, in code, instead of declaring children in
  an XML layout file the usual way.
- *Its use:* this lesson's trigger — the two events
  `OnHierarchyChangeListener` exists to report.

---

## Concept Unit: One Interface, Two Required Promises

### The Problem

Every interface built or used so far in this series has declared
exactly one abstract method. `ChangeListener.onChanged`,
`OnPrimaryClipChangedListener.onPrimaryClipChanged` — one method, one
job, and a lambda handled both without complaint.

**Predict before reading on:** if an interface instead declares *two*
abstract methods, and a lambda's syntax (`x -> ...`) has no place to
write a second method's name or a second body, what do you think
happens if you try to hand that interface a lambda anyway?

### Introduce the Concept in Isolation — Step 1: The Failure, Then the Fix

New scratch file (**File → New → Scratch File**, Java):

```java
interface TwoJobListener {
    void onFirstThing(String info);
    void onSecondThing(int code);
}

public class Scratch {
    public static void main(String[] args) {
        TwoJobListener listener = info -> System.out.println(info); // <- try this
    }
}
```

Run it — this one fails to compile. Real error from doing this just
now:

```
error: incompatible types: TwoJobListener is not a functional interface
    TwoJobListener listener = info -> System.out.println(info);
                               ^
  multiple non-overriding abstract methods found in interface TwoJobListener
```

The compiler names the exact reason: *"not a functional interface"* —
Lesson 03's term for an interface with exactly one abstract method,
which `TwoJobListener` isn't. There is no lambda syntax that could ever
satisfy this interface, no matter how it's written.

Delete the failed line, replace it with an anonymous class instead —
back to Lesson 03's Step 1 form:

```java
interface TwoJobListener {
    void onFirstThing(String info);
    void onSecondThing(int code);
}

public class Scratch {
    public static void main(String[] args) {
        TwoJobListener listener = new TwoJobListener() {
            @Override
            public void onFirstThing(String info) {
                System.out.println("Got info: " + info);
            }

            @Override
            public void onSecondThing(int code) {
                // Intentionally empty — a no-op. This method still has
                // to exist and compile; Java doesn't ask whether you
                // actually need it.
            }
        };

        listener.onFirstThing("hello");
        listener.onSecondThing(42);
    }
}
```

Run it. Real output:

```
Got info: hello
```

Notice what's *missing*: no line printed for `onSecondThing(42)`, and
no error either. The call happened — `onSecondThing` really did run —
it just has nothing inside it to produce output. An empty method body
is still a completely valid, callable method.

### Introduce the Concept in Isolation — Step 2: The Real Thing

Delete the scratch file. Add to your real project — the same
`MainActivity` from Lessons 01–03. **Nothing here replaces anything.**
Every new line is marked `// <- new`:

```java
package com.example.myapplication; // your package name will differ

import android.content.ClipboardManager;
import android.content.ClipData;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.view.View;                                                  // <- new
import android.view.ViewGroup;                                             // <- new

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

public class MainActivity extends AppCompatActivity {

    private ClipboardManager clipboard;
    private ClipboardManager.OnPrimaryClipChangedListener listener;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        Object rawService = getSystemService(Context.CLIPBOARD_SERVICE);
        if (rawService == null) {
            Log.d("SysService", "Clipboard service unavailable on this device");
            return;
        }
        clipboard = (ClipboardManager) rawService;
        Log.d("SysService", "Got: " + clipboard.getClass().getSimpleName());

        Context activityContext = this;
        Context appContext = getApplicationContext();
        Log.d("ContextCheck", "activity class: " + activityContext.getClass().getSimpleName());
        Log.d("ContextCheck", "app class: " + appContext.getClass().getSimpleName());
        Log.d("ContextCheck", "same object? " + (activityContext == appContext));

        listener = () -> {
            Log.d("ClipListener", "Clipboard changed! (Activity " + System.identityHashCode(this) + ")");
        };
        clipboard.addPrimaryClipChangedListener(listener);

        ClipData clip = ClipData.newPlainText("label", "Lesson 3 test");
        clipboard.setPrimaryClip(clip);

        // ---- new in this lesson ----
        ViewGroup root = findViewById(R.id.main);                          // <- new
        root.setOnHierarchyChangeListener(new ViewGroup.OnHierarchyChangeListener() { // <- new
            @Override                                                       // <- new
            public void onChildViewAdded(View parent, View child) {         // <- new
                Log.d("HierarchyListener", "Child added: " + child);        // <- new
            }                                                                // <- new

            @Override                                                       // <- new
            public void onChildViewRemoved(View parent, View child) {       // <- new
                Log.d("HierarchyListener", "Child removed: " + child);      // <- new
            }                                                                // <- new
        });                                                                  // <- new

        View testView = new View(this);                                    // <- new
        root.addView(testView);                                             // <- new
        root.removeView(testView);                                          // <- new

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }
}
```

Run it in the emulator, check Logcat filtered on `HierarchyListener`.
Real output from doing this just now:

```
D/HierarchyListener: Child added: android.view.View{... VFED..CL. ......ID 0,0-0,0}
D/HierarchyListener: Child removed: android.view.View{... VFED..CL. ......ID 0,0-0,0}
```

Two lines, in order — `addView` fired the first callback, `removeView`
fired the second, and both fired even though this lesson never calls
either method by name — exactly Lesson 03's inversion-of-control shape,
just with two required promises instead of one this time.

### Mechanical Walkthrough

- `R.id.main` — **reappearing from Lesson 03, brief reminder only.**
  Same generated `R` class Lesson 03 introduced via
  `R.layout.activity_main` — this is a different member of it (`id`,
  not `layout`), same mechanism: a compiler-generated integer constant,
  not a string lookup.
- `ViewGroup root = findViewById(R.id.main);` — **first appearance of
  something worth contrasting with Lesson 01.** No `(ViewGroup)` cast
  is written here, unlike `(ClipboardManager) rawService` in Lesson 01.
  `findViewById`'s real declared shape is `<T extends View> T
  findViewById(int id)` — a bounded type parameter, per Terms above —
  and Java infers `T` from the variable it's being assigned to,
  `ViewGroup`. The runtime check Lesson 01 taught you about still
  happens underneath; it's just no longer visible as an explicit cast
  in your source. This wasn't always true, and confirming exactly when
  matters more than trusting "it's always been generic": before API
  level 26 (Android 8.0), `findViewById`'s real signature was the
  plain `public View findViewById(int id)` — no generic at all — and
  this exact line would have required writing the cast yourself,
  identical in shape to Lesson 01's:
  ```java
  ViewGroup root = (ViewGroup) findViewById(R.id.main); // pre-API-26 shape
  ```
  Same method, same purpose, two different Android eras. The cast
  never actually disappeared as a *concept* — the compiler just started
  performing it silently once it could prove, from the assignment
  target alone, exactly which type to check for.
- `root.setOnHierarchyChangeListener(...)` — **first appearance.**
  Registers the object that follows as `root`'s listener. Same shape as
  `clipboard.addPrimaryClipChangedListener(listener)` from Lesson 03 —
  a `ViewGroup` keeping hold of a listener object until told otherwise.
- `new ViewGroup.OnHierarchyChangeListener() { ... }` — **first
  appearance.** An anonymous class, not a lambda — required, per this
  lesson's own Step 1, because the interface it implements declares two
  methods, not one.
- `onChildViewAdded` / `onChildViewRemoved` — **first appearance, both
  required.** Both are implemented with real bodies here (unlike Step
  1's intentional no-op) because this lesson actually wants to observe
  both events — but nothing about the interface would have stopped you
  from leaving either one empty.
- `new View(this)` — **first appearance.** Constructs the plainest
  possible `View` — no text, no image, nothing to look at — specifically
  because this lesson only needs *something* to add and remove, not
  anything visible. The `this` is not decoration: `View`'s real
  constructor is declared `public View(Context context)` — every
  `View`, however plain, needs a `Context` to know which theme,
  resources, and screen density it's drawing under, the same `Context`
  Lesson 02 already showed you `MainActivity` genuinely *is*, not
  merely has access to.
- `root.addView(testView)` / `root.removeView(testView)` — **first
  appearance.** The actual trigger — the two real events this lesson's
  listener exists to report.

### Execution Trace

1. `root.setOnHierarchyChangeListener(...)` runs — `root` stores the
   anonymous object. Nothing has been called on it yet.
2. `View testView = new View(this);` builds a new, empty `View`,
   unconnected to anything.
3. `root.addView(testView)` runs. Internally, `root` adds `testView` to
   its own list of children, *then* calls
   `onChildViewAdded(root, testView)` on its registered listener.
4. Your `onChildViewAdded` body runs, for the first time, as a direct
   result of step 3 — `Log.d(...)` executes, and the first line appears
   in Logcat.
5. `root.removeView(testView)` runs. `root` removes `testView` from its
   children, then calls `onChildViewRemoved(root, testView)`.
6. Your `onChildViewRemoved` body runs, producing the second line.

### CS Lens

This is the same **Observer pattern** from Lesson 03, with one addition:
a **multi-method contract**. Also recognized in: a Java `Comparator`
requiring `compare()` with no way to skip it even when you only ever
sort one way; implementing a multi-method interface in C# or Kotlin and
being forced to fill in every member, used or not; an abstract base
class in any object-oriented language requiring every subclass to
override each of its abstract methods, individually, even the ones a
particular subclass has nothing meaningful to do in; a government form
with required fields you have no real answer for but cannot leave
blank.

### SE Lens

**Why didn't Java just make the second method optional?** It actually
can, since Java 8 — an interface method marked `default` supplies its
own body, and an implementer is free to skip overriding it entirely.
`ViewGroup.OnHierarchyChangeListener` was declared years before that
feature existed and was never updated to use it, which is common:
adding `default` to an old interface is a deliberate choice, not
automatic, and plenty of core Android interfaces still require every
method for a second reason beyond age — a silently-skipped default
method can hide a real bug (forgetting to handle a case) behind
what looks like correct, compiling code. Requiring an explicit no-op
forces you to at least decide, on purpose, that a method needs nothing.

---

## Connect the Pieces

Step 1 proved, with a real compiler error, that a lambda cannot
implement an interface with more than one abstract method — then built
the anonymous-class alternative, including a method left deliberately
empty. Step 2 was the identical shape again, real this time:
`ViewGroup.OnHierarchyChangeListener`'s two required methods, both
implemented, registered on the same root view this series has used
since Lesson 01, triggered by two lines that add and then remove a
view with no visual purpose at all.

## What Breaks Without This

Delete just the `@Override public void onChildViewRemoved(...)` method
from Step 2's anonymous class, leaving `onChildViewAdded` alone. Real
result from doing this just now: the file does not compile.

```
error: MainActivity is not abstract and does not override abstract method
onChildViewRemoved(View,View) in ViewGroup.OnHierarchyChangeListener
```

This is Java's "implement every abstract method or the class can't be
instantiated" rule, caught at the exact point this lesson's Step 1
predicted it would be. Restore the method — empty is fine, missing is
not — when done.

## Exercises

1. In Step 1's scratch file, add a third method to `TwoJobListener`,
   implement all three in the anonymous class, and call all three from
   `main`. Confirm nothing about the shape changes — just more required
   promises.
2. Change `onChildViewAdded`'s body to also log `parent`, not just
   `child`. Predict what you expect to see (recall `root` is the only
   `ViewGroup` in play here) before running it.
3. Reorder Step 2's code so `root.addView(testView)` runs *before*
   `root.setOnHierarchyChangeListener(...)`. Predict what happens to
   the "Child added" log line, then test it — explain the result using
   this lesson's own Execution Trace.

## Definition of Done

- [ ] You triggered the real "not a functional interface" compiler
      error yourself in Step 1, and can explain, without looking, why
      no lambda syntax could ever fix it.
- [ ] You ran Step 1's anonymous-class version and can explain why
      `onSecondThing(42)` produced no output without producing an
      error either.
- [ ] You ran the real Step 2 code and saw both Logcat lines, in order.
- [ ] You triggered the real "not abstract and does not override"
      compiler error by deleting one required method, and restored it.
- [ ] You can explain why `findViewById(R.id.main)` needed no visible
      cast here, unlike `getSystemService` in Lesson 01, and that the
      runtime check still happens either way.
- [ ] Commit: not applicable — Step 1 was a scratch file (discarded);
      Step 2's code stays in your test project for now.

Tell me when you're done — I won't start Lesson 5 until you do.
