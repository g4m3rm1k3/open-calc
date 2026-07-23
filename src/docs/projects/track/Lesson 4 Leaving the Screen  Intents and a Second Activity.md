# Lesson 4: Leaving the Screen — Intents and a Second Activity

**What you will build:** A second, mostly-empty screen (`InventoryActivity`),
and a working tap on your "Open Inventory" button that navigates to it.
The transferable problem: Android doesn't let one Activity directly
call methods on another the way normal Java objects call each other —
each Activity is a somewhat isolated component the *OS* manages the
lifecycle of, not something you instantiate with `new`. Getting from
one screen to another requires going *through* the OS, using an object
called an `Intent`. Today you learn why that indirection exists.

**What you need to know first:** Lesson 2 (Activity lifecycle,
Manifest declarations) and Lesson 3 (the button now sitting unwired in
your layout).

---

## Concept Unit: You Can't Just `new` Another Activity

### The Problem

In ordinary Java, if you wanted to show "another screen," and screens
were just objects, you'd write `InventoryActivity screen = new
InventoryActivity(); screen.show();` and be done. Try to reason about
why Android Activities specifically resist this pattern before reading
on: recall from Lesson 2 that `onCreate()` is called *by the OS*, not
by you, and that the Manifest is what tells the OS an Activity exists
at all. An object you construct yourself with `new` never goes through
that OS-owned startup path — its `onCreate()` would simply never be
called, because nothing triggered the OS to call it. Directly
instantiating an Activity produces a broken, half-initialized object,
not a working screen.

### Introduce the Concept in Isolation

The underlying idea worth isolating here isn't Android-specific: it's
**asking a third party to do something on your behalf, described by
data, rather than calling it directly.** A tiny non-Android analogy:

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

Compile and run this yourself:

```
javac RequestDemo.java
java RequestDemo
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

Every piece here is a **reappearing concept** from Lesson 2 — same
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

### CS Lens

The Manifest entry without a launcher `<intent-filter>` demonstrates
**capability scoping** — explicitly declaring what a component is and
isn't allowed to be used for, rather than everything being globally
reachable by default. Also recognized in: file permission bits
(`chmod`), API endpoint authentication scopes, and package-private
visibility in Java itself.

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

`onCreate` as a whole now does everything it did in Lesson 2 (call
super, inflate the layout, log a trace line) *plus* connects the
button you built in Lesson 3 to real behavior for the first time.

### Mechanical Walkthrough

- `findViewById(R.id.openInventoryButton)` — **first appearance.**
  This is the runtime bridge between your XML tree (Lesson 3) and Java
  code: it walks the inflated view tree looking for the view whose
  `@+id/openInventoryButton` you declared, and returns it as an object
  you can call methods on. `R.id.openInventoryButton` is the same
  generated-constant pattern as `R.layout` from Lesson 2, just under
  the `id` nested class instead of `layout`.
- `Button openButton = ...` — reusing already-basic variable
  declaration syntax; the *type* `Button` matching the XML `<Button>`
  tag is worth noting but not a new concept on its own.
- `.setOnClickListener(v -> { ... })` — **first appearance, as a
  group** covering two ideas at once, split per the Extraction Rule:
  - `setOnClickListener(...)` itself: registers a callback to run
    later, when a tap event occurs — not immediately. This is the
    **Observer pattern**: you're not calling code now, you're
    registering code to be called *later*, by the OS's touch-event
    system, whenever the relevant event happens — the exact same shape
    as `onCreate` from Lesson 2, except this time *you* are the one
    registering the callback instead of the framework calling one
    automatically.
  - `v -> { ... }` — a **lambda expression**: shorthand syntax for "an
    object implementing a single-method interface" (here,
    `View.OnClickListener`), without writing out a full named class.
    `v` is the parameter (the `View` that was clicked, unused in this
    body). This genuinely is new syntax even though the underlying
    "pass behavior as a value" idea may feel familiar from JavaScript
    callbacks if you've seen them — Java's lambda syntax specifically
    has not appeared before this lesson.
- `new Intent(this, InventoryActivity.class)` — **first appearance.**
  Two arguments: `this` (a `Context` — `MainActivity` itself, since
  Activities are a kind of `Context`, meaning "who is making this
  request") and `InventoryActivity.class` (a `Class` object — Java's
  built-in reflection mechanism for referring to a class as a value,
  not creating an instance of it — this is exactly the "describe what
  I want without directly constructing it" idea from the `RequestDemo`
  lab, now using Android's real `Intent` class instead of a `HashMap`).
- `startActivity(intent)` — **first appearance.** This is the actual
  call that hands your `Intent` off to the OS. The OS reads it,
  confirms `InventoryActivity` is declared in the Manifest (Lesson 2's
  mechanism, reused), and *only then* creates a real instance and calls
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
registered in Lesson 3's button (now wired) runs → it builds an
`Intent` describing "start `InventoryActivity`" → `startActivity` hands
that off to the OS → the OS checks the Manifest entry from this
lesson's first Concept Unit → confirms it's declared and not
externally exported-only → creates a real `InventoryActivity` instance
→ calls `onCreate()` on it, the exact OS-driven calling pattern you
first observed in Lesson 2, now happening for a second class you wrote
yourself.

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
2. Add a second button to `activity_main.xml` from Lesson 3's pattern,
   wire it with its own `setOnClickListener`, and have it also open
   `InventoryActivity` — confirming the same target can be reached from
   multiple places.

## Definition of Done

- [ ] Tapping "Open Inventory" actually navigates to the second screen.
- [ ] You can explain why `new InventoryActivity()` directly wouldn't
      have worked, referencing the lifecycle concept from Lesson 2.
- [ ] You ran the `RequestDemo` lab and can connect it to what `Intent`
      is really doing.
- [ ] You broke the Manifest entry on purpose, saw the real
      `ActivityNotFoundException`, and restored it.
- [ ] Commit: message explaining why (e.g. "Wire Open Inventory button
      to navigate to InventoryActivity via explicit Intent").

Lesson 5 is next: pressing the system Back button, and what
`onPause`/`onStop`/`onDestroy` actually mean for the screen you just
left.