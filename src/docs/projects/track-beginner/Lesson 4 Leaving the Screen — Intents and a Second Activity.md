# Lesson 4: Leaving the Screen — Intents and a Second Activity

> **Revised 2026-07-25** — `findViewById`, `interface`, `implements`,
> and Observer all moved to Lesson 2c (which now has its own isolated
> `Doorbell`/`Chime` lab proving Observer by hand). The Lambda Concept
> Unit here was retitled and reframed around that — its real news is
> now just "here's the shortcut for what you already proved," not the
> mechanism itself. Headings marked `(revised 07/25)` below (check "On
> This Page" in the sidebar) are exactly what changed. Full detail in
> `CHANGELOG.md` in this folder.

**What you will build:** A second, mostly-empty screen (`InventoryActivity`),
and a working tap on your "Open Inventory" button that navigates to it.
The transferable problem: Android doesn't let one Activity directly
call methods on another the way normal Java objects call each other —
each Activity is a somewhat isolated component the *OS* manages the
lifecycle of, not something you instantiate with `new` yourself
(the same "the OS builds the object and calls methods on it"
idea, now mattering for a second screen too). Getting from one screen
to another requires going *through* the OS, using an object called an
`Intent`. Today you learn why that indirection exists.

**What you need to know first:** Lesson 2a (class/object/`new`),
Lesson 2c (Activity lifecycle, why `onCreate` is called by the OS —
and, if you're past its edge-to-edge unit, `interface`, `implements`,
polymorphism, and the Observer pattern, all proved by hand with
`Doorbell`/`Chime`), Lesson 2b (Manifest declarations), and Lesson 3
(the button now sitting unwired in your layout).

---

## Concept Unit: You Can't Just `new` Another Activity

### The Problem

You already know `new SomeClass()` builds an object and, for
an ordinary class, that's the whole story — the object exists and is
ready to use immediately. If Activities worked the same way, you'd
write `InventoryActivity screen = new InventoryActivity();
screen.show();` and be done. But recall that `onCreate()` is
called *by the OS*, not by you, and that the Manifest is what tells the
OS an Activity exists at all. An object you construct yourself with
`new` never goes through that OS-owned startup path — its `onCreate()`
would simply never be called, because nothing triggered the OS to call
it. Directly instantiating an Activity produces a broken,
half-initialized object, not a working screen.

### Introduce the Concept in Isolation

The underlying idea worth isolating here isn't Android-specific: it's
**asking a third party to do something on your behalf, described by
data, rather than calling it directly.** A tiny non-Android analogy.

Create a new folder for this lab (same convention as every lab so
far — plain folder, no `package` line needed). Inside
it, create a file named exactly `RequestDemo.java`:

```java
import java.util.HashMap;
import java.util.Map;

public class RequestDemo {
    public static void main(String[] args) {
        Map<String, String> request = new HashMap<>();
        request.put("action", "OPEN_SCREEN");
        request.put("target", "InventoryScreen");

        System.out.println("Sending request: " + request);
        dispatch(request);
    }

    static void dispatch(Map<String, String> request) {
        String action = request.get("action");
        if ("OPEN_SCREEN".equals(action)) {
            System.out.println("Dispatcher: opening " + request.get("target"));
        }
    }
}
```

`Map<String, String>` is Java's version of a Python dict or a
JavaScript plain object used as a lookup table — `HashMap` is one
concrete implementation of it. Not a new concept to dwell on here; you
already know the idea of a key/value lookup from Python/JS, this is
just Java's typed spelling of it (`<String, String>` states, and the
compiler enforces, that every key and every value is a `String`).

Compile and run this yourself:

```
javac RequestDemo.java
java RequestDemo
```

Real output, this session:

```
Sending request: {action=OPEN_SCREEN, target=InventoryScreen}
Dispatcher: opening InventoryScreen
```

What this proves: `main()` never directly calls a method on
"InventoryScreen" — it builds a small data package describing *what it
wants*, hands it to a separate `dispatch` method, and lets that
routing logic decide what to actually do. This is structurally what an
`Intent` is: a data package describing a desired action, handed to the
OS's own dispatcher instead of called directly.

Discard `RequestDemo.java` — the real project uses Android's own
`Intent` class, not this hand-rolled `HashMap` version, from here on.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file
  `app/src/main/java/.../InventoryActivity.java`; modify
  `AndroidManifest.xml`; modify `MainActivity.java`.
- **Change type:** Create, then configure, then add.
- **Dependencies:** none new.

### The New Code — Part 1: The Second Activity

Right-click the `com.yourname.pocketinventory` package in the Android
view → New → Activity → Empty Views Activity. Name it
`InventoryActivity`. Let the wizard generate it (it will also create
`activity_inventory.xml` and add a Manifest entry automatically — you're
about to verify that by hand rather than trusting it blindly).

### The Updated Project

Open the newly generated `InventoryActivity.java`:

```java
package com.yourname.pocketinventory;

import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;

public class InventoryActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inventory);
    }
}
```

Every piece here is a **reappearing concept** — same
`extends AppCompatActivity`, same `onCreate` override, same
`setContentView`/`R.layout` pattern — just now for a second class. No
new syntax in this file; the newness is that there are now *two* of
these OS-manageable components in one project.

Now open the Manifest and confirm the wizard added this for you:

```xml
<activity
    android:name=".InventoryActivity"
    android:exported="false" />
```

Notice: **no** `<intent-filter>` block, unlike `MainActivity`'s entry.
That's deliberate — this Activity isn't meant to be a home-screen
launcher entry point, only something reached from inside the app.
`android:exported="false"` reinforces that: other apps on the device
cannot launch this Activity directly.

### Mechanical Walkthrough

- `public class InventoryActivity extends AppCompatActivity` — **reappearing**,
  identical shape to `MainActivity` — a second class the OS
  can manage the same way it manages the first.
- `protected void onCreate(Bundle savedInstanceState)` with `@Override`
  and `super.onCreate(savedInstanceState)` — **reappearing**, same
  Template Method contract: the OS calls this, you never
  call it yourself, and `super.onCreate(...)` still has to run first.
- `setContentView(R.layout.activity_inventory)` — **reappearing** — the
  same call that actually puts a layout on screen, now pointing at this
  Activity's own layout resource instead of `MainActivity`'s.
- `<activity android:name=".InventoryActivity" ... />` — **reappearing**
  Manifest declaration shape, now for a second Activity —
  the same "the OS can't manage what it doesn't know exists" rule
  applies to every Activity, not just the first one.
- `android:exported="false"` — **first appearance.** Explicitly states
  this Activity cannot be launched by another app on the device — only
  code inside this same app is allowed to start it.
- No `<intent-filter>` block — **first appearance by omission.**
  `MainActivity`'s entry has one (marking it the launcher, tappable
  from the home screen); its absence here is what makes
  `InventoryActivity` reachable only from inside the app's own code,
  never directly by the user or another app.

### CS Lens

The Manifest entry without a launcher `<intent-filter>` demonstrates
**capability scoping** — explicitly declaring what a component is and
isn't allowed to be used for, rather than everything being globally
reachable by default. Also recognized in: file permission bits
(`chmod`), API endpoint authentication scopes, and the package-private
access level — same idea of "visible only under specific
conditions," applied to a whole OS component instead of a Java field.

### SE Lens

**Why does Android insist on routing screen creation through the OS
and a data-carrying `Intent`, instead of just letting you hold a live
`InventoryActivity` reference and call methods on it directly, the way
you would with any other object?** The cost is real and you're feeling
it right now: you can't just `new` the object you want and go, you
have to describe your request and hand it to something else. The
benefit is control the OS genuinely needs: Android can kill and later
recreate an Activity's process to reclaim memory (a phone has far less
RAM than a desktop, and background apps get reclaimed aggressively),
and it can manage a back-stack of screens without every screen needing
to know about every other screen that might navigate to it. None of
that is possible if screens hold direct references to each other the
way ordinary objects do — the OS has to be the one actually creating
and destroying each Activity, on its own schedule, which is exactly
why `new InventoryActivity()` can build a Java object but can never
produce a real, working screen.

---

## Concept Unit: Lambda Expressions — a Shortcut for What You Already Know

### The Problem (revised 07/25 — reframed around Lesson 2c's Doorbell/Chime lab)

The button you're about to wire needs to say "when a tap happens, do
this" — but a tap happens *later*, at some unpredictable moment chosen
by the user, not while `onCreate` is running. If that sentence sounds
familiar, it should: it's the exact problem the `Doorbell`/
`Chime` lab already solved, for a doorbell instead of a button. You
already know the *mechanism* — an interface with one method, a class
that implements it, an object handed over now and called later. What
you don't know yet is that Java has a much shorter way to write the
"a class that implements it" part, when that class only ever exists to
be handed over once, right here, and never reused anywhere else.

### Introduce the Concept in Isolation (revised 07/25 — reframed as reappearing)

The same shape as `Doorbell`/`Chime`, rebuilt as a fake button instead
of a doorbell — so the parallel is exact, not just similar.

Create a new folder for this lab (same convention as every lab so
far — plain folder, no `package` line needed). Inside
it, create a file named exactly `OnTapListener.java`:

```java
interface OnTapListener {
    void onTap();
}
```

In the same folder, create `FakeButton.java`. Note this class has no
`public` keyword (the package-private class shape, reused) and no
`main` — nothing runs `FakeButton` directly:

```java
class FakeButton {
    private OnTapListener listener;

    void setOnTapListener(OnTapListener listener) {
        this.listener = listener;
    }

    void simulateTap() {
        System.out.println("FakeButton: a tap event just occurred");
        listener.onTap();
    }
}
```

In the same folder, create `LambdaDemo.java` — this is the file with
`main`, the one you'll actually run:

```java
public class LambdaDemo {
    public static void main(String[] args) {
        FakeButton button = new FakeButton();

        System.out.println("Registering the listener...");
        button.setOnTapListener(() -> System.out.println("Listener ran!"));
        System.out.println("Listener registered. Nothing from the listener has printed yet.");

        button.simulateTap();
    }
}
```

Your folder should now have three files:
`OnTapListener.java`, `FakeButton.java`, `LambdaDemo.java`. Compile and
run this yourself:

```
javac OnTapListener.java FakeButton.java LambdaDemo.java
java LambdaDemo
```

Real output, this session:

```
Registering the listener...
Listener registered. Nothing from the listener has printed yet.
FakeButton: a tap event just occurred
Listener ran!
```

### Mechanical Walkthrough — Before the "Why," What Each Piece Is

- `interface OnTapListener { void onTap(); }` — **reappearing** — same
  shape as `TapCallback`, new name. An interface with
  exactly one method, like this one, is called a **functional
  interface** — that specific shape is what makes the lambda syntax
  below legal, and is worth naming even on a reappearance since it's
  the exact property this whole unit depends on.
- `class FakeButton` — **reappearing** — same package-private-class
  shape as `Doorbell` (no `public` keyword, fine since
  this whole lab lives in one throwaway file).
- `private OnTapListener listener;` — **reappearing** — same idea as
  `private TapCallback callback;`: this is polymorphism, a field
  typed as an interface can hold any object fulfilling that contract,
  decided at the point it's actually called, not when the field was
  declared.
- `void setOnTapListener(OnTapListener listener) { this.listener = listener; }`
  — **reappearing concepts, recombined.** An instance method
  taking a parameter, storing it into a field using `this`
  to disambiguate the field from the parameter of the same
  name.
- `listener.onTap();` — **reappearing dot-notation method call.**
  Whatever object was stored in `listener` gets its `onTap()` called
  here — which specific code runs depends entirely on what was passed
  to `setOnTapListener` earlier, not on anything visible at this line.
- `() -> System.out.println("Listener ran!")` — **first appearance of
  a lambda expression.** Read right to left conceptually: this
  constructs a real, complete object that implements `OnTapListener`,
  without writing a named class for it. `()` is the (empty) parameter
  list, matching `onTap()`'s own (empty) parameters. `->` separates
  "parameters" from "the body that runs when called." The body,
  `System.out.println("Listener ran!")`, becomes `onTap()`'s entire
  implementation. A lambda is only legal where Java already knows,
  from context, which single-method interface it's supposed to become
  (here, because `setOnTapListener` demands an `OnTapListener`) — you
  cannot write a bare lambda with no interface for it to become.

What the output proves: `() -> System.out.println("Listener ran!")` is
an **object** — a real, complete implementation of `OnTapListener` —
handed to `setOnTapListener` and stored, not executed, at registration
time. "Listener ran!" only prints once `simulateTap()` actually calls
`listener.onTap()`, which happens *after* both "Registering..." lines
have already printed. The gap between "registered" and "actually ran"
is the entire point: a lambda lets you hand over *what* should happen
without saying *when* — the receiving code (here, `FakeButton`; in the
real app, Android's touch-event system) decides when to call it.

### The Long Way, Side by Side

Before Java had this shorthand, the only way to supply a one-method
object like this was a full **anonymous class** — a class with no name,
declared and instantiated in one expression. In the same folder as the
three files above, create a fourth file, `AnonDemo.java` — leave the
other three untouched:

```java
public class AnonDemo {
    public static void main(String[] args) {
        FakeButton button = new FakeButton();
        button.setOnTapListener(new OnTapListener() {
            @Override
            public void onTap() {
                System.out.println("Anonymous-class listener ran!");
            }
        });
        button.simulateTap();
    }
}
```

Compile and run this version too (only `AnonDemo.java` needs
recompiling — `OnTapListener.class` and `FakeButton.class` from before
are still valid, though recompiling everything together never hurts):

```
javac AnonDemo.java
java AnonDemo
```

Real output, this session:

```
FakeButton: a tap event just occurred
Anonymous-class listener ran!
```

Both compile to functionally the same thing — verified this session,
both print correctly, just with a different message so you can tell
them apart. `new OnTapListener() { ... }` explicitly writes `new`
followed immediately by a class body with no name — Java
generates an unnamed class implementing `OnTapListener` on the spot.
The lambda `() -> System.out.println(...)` is genuinely shorthand for
exactly this shape, for the specific case of a functional interface —
nothing more, nothing magic underneath.

### Discard the Throwaway Example

Delete `OnTapListener.java`, `FakeButton.java`, `LambdaDemo.java`, and
`AnonDemo.java` — the real project uses Android's own
`View.OnClickListener` interface, already defined by the framework, the
same one-method shape as `OnTapListener` here.

### CS Lens (revised 07/25 — Observer reframed as reappearing, from Lesson 2c)

Two lenses apply to this same lab, at two different levels, and it's
worth keeping them separate rather than picking one name and moving on.

At the **design level**, what you just built and ran is **reappearing**
— the same Observer pattern `Doorbell`/`Chime` already proved:
something holds a reference to a listener it doesn't control the
identity of, and calls it later, when it decides the moment is right.
`LambdaDemo`'s output is the same kind of proof `ObserverDemo`'s was:
"Listener ran!" only printed after `simulateTap()` ran, never at
registration.

At the **language level**, what's actually new is `LambdaDemo` itself:
this is the first time the callback got supplied as a **lambda**
instead of a whole named class like `Chime`. `() -> System.out.println(...)`
is a **functional interface** (any interface with exactly one abstract
method — `OnTapListener` qualifies) plus Java's lambda syntax for
supplying an instance of one concisely, with no `class ... implements ...`
ceremony at all. Also recognized in: JavaScript's callback functions
and arrow functions (`(x) => x + 1`), Python's `lambda` keyword — the
"pass behavior as a value, run it later" idea is the same across all of
them; only the syntax and the surrounding type system differ. Java's
version is stricter: a lambda must match an existing single-method
interface's exact signature, checked at compile time; Python and
JavaScript don't require that upfront contract at all.

If "Observer pattern" ever feels abstract later in this curriculum,
either `Doorbell`/`Chime` (the long way) or `FakeButton`/
`LambdaDemo` (here, the short way) is the concrete example to come back
to and rerun.

### SE Lens

**If a lambda still has to match a single-method interface exactly,
what did switching from `Chime` to `() -> ...` actually buy you?**
Not flexibility — Java's compile-time contract is exactly as strict
either way, `OnTapListener` still defines the one method that must be
implemented, with the same parameter and return types. What the
lambda removes is pure ceremony: a whole separate `.java` file (or a
named inner class), a class name nobody will ever reuse, and the
`implements`/`@Override` boilerplate around a single line of real
logic. That trade only makes sense when the implementation is a true
one-off, used in exactly one place and never referenced by name
anywhere else — `Chime` was reusable and testable on its own, which is
real value a lambda gives up. Reach for a named class again whenever
the callback's logic is complex enough to want its own name, needs to
be reused in more than one place, or is worth testing in isolation the
way `ObserverDemo` tested `Chime` directly.

### Connection

The next unit wires `View.OnClickListener` — a real interface Android
already defines, same single-method shape as `OnTapListener` here —
into the actual button, using this exact lambda syntax.

---

## Concept Unit: `Intent` — Requesting Navigation Through the OS

### The Problem

`InventoryActivity` now exists and is declared, but nothing triggers
it yet. You need to actually wire the button.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `MainActivity.java`.
- **Change type:** Add.
- **Location:** Inside `onCreate`, after `setContentView`.

### The New Code

```java
Button openButton = findViewById(R.id.openInventoryButton);
openButton.setOnClickListener(v -> {
    Intent intent = new Intent(this, InventoryActivity.class);
    startActivity(intent);
});
```

(You'll need `import android.content.Intent;` and
`import android.widget.Button;` at the top — Android Studio's red
underline plus Alt+Enter, "Import class," will do this for you; take
the moment to notice what it added so it's not invisible.)

### The Updated Project

```java
public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        android.util.Log.d("Lifecycle", "onCreate called");

        Button openButton = findViewById(R.id.openInventoryButton);  // ← new
        openButton.setOnClickListener(v -> {                          // ← new
            Intent intent = new Intent(this, InventoryActivity.class); // ← new
            startActivity(intent);                                    // ← new
        });                                                            // ← new
    }
}
```

`onCreate` as a whole now does everything it did before (call
super, inflate the layout, log a trace line) *plus* connects the
button you already built to real behavior for the first time.

### Mechanical Walkthrough (revised 07/25 — findViewById + Observer-vs-Template-Method fixed)

- `findViewById(R.id.openInventoryButton)` — **reappearing** (the same
  call as `findViewById(R.id.main)` earlier), now finding a different
  view by a different id. As a reminder: this
  is the runtime bridge between your XML tree and Java
  code — it walks the inflated view tree looking for the view whose
  `@+id/openInventoryButton` you declared, and returns it as an object
  you can call methods on. `R.id.openInventoryButton` is the same
  generated-constant pattern as `R.layout`, just under
  the `id` nested class instead of `layout`.
- `Button openButton = ...` — reusing already-basic variable
  declaration syntax; the *type* `Button` matching the XML
  `<Button>` tag is worth noting but not a new concept on its own.
- `.setOnClickListener(v -> { ... })` — `setOnClickListener(...)`
  itself is a **first appearance**: it registers a callback to run
  later, when a tap event occurs — not immediately. This is
  **reappearing**, from this lesson's own Lambda Expressions unit
  above: the exact same **Observer pattern** `FakeButton`/`OnTapListener`
  already proved (register now, called later, by something else's
  decision), now against a real Android interface,
  `View.OnClickListener`, instead of the throwaway `OnTapListener`.
  Worth being precise about what's *not* the same here: this is
  Observer, not Template Method — `onCreate` is the
  framework calling a fixed, inherited lifecycle slot; this is you
  registering a standalone callback with an object, no inheritance
  involved. Both are Inversion of Control (the framework, not you,
  decides *when* your code runs) — that's the idea they share — but
  they're different patterns underneath, not the same shape twice.
  `v -> { ... }` itself is **reappearing**, from this
  lesson's own Lambda Expressions unit above: `View.OnClickListener` is
  Android's real, already-defined single-method interface (its one
  method is `onClick(View v)`), and this lambda is a real implementation
  of it, just like `OnTapListener` in the isolated lab — `v` is the
  parameter (the `View` that was clicked, unused in this body).
- `new Intent(this, InventoryActivity.class)` — **first appearance.**
  Two arguments: `this` (here, meaning "the `MainActivity` object this
  code is running inside of" — now read from inside
  a lambda; Android specifically needs a `Context`, meaning "who is
  making this request," and an Activity is a kind of `Context`) and
  `InventoryActivity.class` (a `Class` object — Java's built-in
  mechanism for referring to a class itself as a value, not creating an
  instance of it — this is exactly the "describe what I want without
  directly constructing it" idea from the `RequestDemo` lab, now using
  Android's real `Intent` class instead of a `HashMap`).
- `startActivity(intent)` — **first appearance.** This is the actual
  call that hands your `Intent` off to the OS. The OS reads it,
  confirms `InventoryActivity` is declared in the Manifest — the same
  "the OS can't manage what it doesn't know exists" rule from this
  lesson's first Concept Unit, now enforced at the actual moment of
  navigation instead of just at app startup — and *only then* creates a real instance and calls
  its `onCreate()` — the proper OS-managed path the "Problem" section
  above explained you can't shortcut with `new`.

### CS Lens

`Intent` + `startActivity` is a concrete instance of **message
passing** between components that don't hold direct references to each
other — the sender describes an action and a target by *name*, and a
central dispatcher (the OS) resolves and routes it. Also recognized in:
actor-model concurrency (Erlang/Akka), pub/sub message queues,
HTTP requests to a named URL route rather than a direct function call,
and the D-Bus / Windows message pump systems Android's own Intent
system is conceptually descended from.

### SE Lens

**Why not let Activities hold direct references to each other** (say,
`MainActivity` keeping an `InventoryActivity` field)? The alternative
— direct references — would mean every Activity needs compile-time
knowledge of every other Activity it might navigate to, tightly
coupling your whole app together, and would completely break Android's
ability to also let *other apps* trigger your Activities (or vice
versa — you'll see this properly in a later lesson on implicit
Intents, e.g. opening the camera app) since a foreign app obviously
can't hold a Java reference to a class it was never compiled against.
The cost of this design: an extra layer of indirection for even the
simplest same-app navigation, and errors that surface at runtime
(a Manifest declaration missing) rather than compile time, since the
compiler has no way to check that `InventoryActivity` is actually
reachable — only that the class exists.

---

## Connect the Pieces

Full trace: user taps the button → the `View.OnClickListener` lambda
registered on the button (now wired) runs → it builds an
`Intent` describing "start `InventoryActivity`" → `startActivity` hands
that off to the OS → the OS checks the Manifest entry from this
lesson's first Concept Unit → confirms it's declared and not
externally exported-only → creates a real `InventoryActivity` instance
(the OS's own version of `new`, the exact thing you proved you can't do
yourself) → calls `onCreate()` on it, the same OS-driven calling
pattern you first observed for `MainActivity`, now happening for a second
class you wrote yourself.

## What Breaks Without This

Comment out the `<activity android:name=".InventoryActivity" ... />`
block in the Manifest entirely (leave the Java code as-is) and tap the
button. Read the actual crash — it should be an
`ActivityNotFoundException`, thrown at the exact moment `startActivity`
tries to hand the Intent to the OS and the OS can't find a declared
match. Restore the Manifest entry afterward.

## Exercises

1. Change `new Intent(this, InventoryActivity.class)` to reference a
   class that doesn't exist (`NonExistentActivity.class`) and observe
   that this fails to *compile*, not just run — contrast that with the
   Manifest-only break above, which compiled fine and only failed at
   runtime. Articulate for yourself why one is caught by the compiler
   and the other isn't.
2. Add a second button to `activity_main.xml` using the same pattern,
   wire it with its own `setOnClickListener`, and have it also open
   `InventoryActivity` — confirming the same target can be reached from
   multiple places.

## Definition of Done

- [ ] Tapping "Open Inventory" actually navigates to the second screen.
- [ ] You can explain why `new InventoryActivity()` directly wouldn't
      have worked, referencing how the OS-managed lifecycle works.
- [ ] You ran the `RequestDemo` lab and can connect it to what `Intent`
      is really doing.
- [ ] You ran both the lambda and the anonymous-class versions of the
      `LambdaDemo` lab and can explain, in your own words, why
      "Listener ran!" only prints after `simulateTap()` is called, not
      at registration time.
- [ ] You can explain what an `interface` is and how it differs from
      `extends`.
- [ ] You broke the Manifest entry on purpose, saw the real
      `ActivityNotFoundException`, and restored it.
- [ ] Commit: message explaining why (e.g. "Wire Open Inventory button
      to navigate to InventoryActivity via explicit Intent").

Lesson 5 is next: pressing the system Back button, and what
`onPause`/`onStop`/`onDestroy` actually mean for the screen you just
left.
