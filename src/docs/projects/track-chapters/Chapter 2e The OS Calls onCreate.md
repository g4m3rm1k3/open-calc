# Chapter 2, Lesson E (the capstone): The OS Calls `onCreate` — You Never Do

**What you will build:** You'll instrument your existing empty
`MainActivity` screen and watch Android itself call a method on it that
you never call. The transferable problem: in every Java program you've
written before this (Chapter 1's `HelloWorld`), execution starts at
`public static void main(String[] args)` and *you* are in control of
the order things happen. Android throws that model out. There is no
`main()` in your app at all. Instead, the OS owns an object built from
a class you wrote (2A), and calls a specific method on it — one your
class overrides (2C) — at a time *it* decides. Today you watch that
happen with your own eyes.

**What you need to know first:** 2A (an object is a real thing built
from a class with `new`; a method belongs to an object). 2C (`extends`
declares a class inherits another's code; `@Override` marks a method
that replaces the parent's; `super` calls the parent's own version; a
parent class can call a method its own code never had a body for,
because a subclass supplies one — the Template Method shape). 2D (the
Manifest already told the OS `MainActivity` is the entry point — this
lesson is what the OS does once it gets there).

**Terms introduced in this lesson:**
- **`protected`** — an access modifier meaning callable by the class
  itself, its subclasses, and framework code in the same package —
  which is exactly how the OS is able to call `onCreate` without it
  being fully `public`. (The other three access levels, and why
  Java has four instead of two, get their own lesson later, once a
  real reason to compare them side by side exists.)

---

## Concept Unit: The OS Builds Your Object and Calls a Method You Never Call

### The Problem

Open `MainActivity.java`:

```java
public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }
}
```

You've never called `onCreate`. Nothing in this file calls it. And yet
when you ran this app in Chapter 1, code inside it clearly executed —
you saw a screen. Something built a `MainActivity` object and called a
method on it, and it isn't you.

Every piece of this should already read as familiar, not new: `extends
AppCompatActivity` (2C) — `MainActivity` inherits `AppCompatActivity`'s
code, the same `Base`/`Child` shape you already labbed. `@Override`
(2B/2C) — a compiler-checked promise this method really does replace
one the parent declares. `protected` — new this lesson, explained
below. `super.onCreate(...)` (2C) — explicitly calls
`AppCompatActivity`'s own version first. The only genuinely new fact
this lesson adds: *who* is doing the calling, and *when*.

### The New Code

Add one line inside the existing `onCreate`:

```java
android.util.Log.d("Lifecycle", "onCreate called");
```

### The Updated Project

```java
public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        android.util.Log.d("Lifecycle", "onCreate called");  // ← new
    }
}
```

### Mechanical Walkthrough

- `protected void onCreate(Bundle savedInstanceState)` — **first
  appearance of `protected`.** `protected` means callable by the class
  itself, by subclasses, and — critically — by framework code in the
  same package, which is exactly how the OS is able to call it without
  it being fully `public`. `Bundle savedInstanceState` is a parameter
  holding saved state from a previous run — not needed yet; you'll use
  it for real once your app has actual data to preserve, in a later
  lesson.
- `android.util.Log.d(...)` — a `static` method call, same shape as
  `System.out.println` (Chapter 1), writing to Android's Logcat instead
  of the console — a dedicated debugging channel that survives and is
  filterable in ways plain console output on a phone isn't.
- Everything else on this page — `extends AppCompatActivity`,
  `@Override`, `super.onCreate(...)`, `setContentView(R.layout.activity_main)`
  — is reappearing from 2A–2D. Nothing here needs re-explaining; if any
  of it doesn't feel solid, that's a sign to go back to the specific
  earlier lesson that owns it, not a gap in this one.

### Run It

Run the app on an emulator or device. Open the **Logcat** panel, filter
by the tag `Lifecycle`, and confirm you see `onCreate called` appear
the moment the app launches — your own eyes watching the OS call a
method you never called.

### CS Lens

This is the **Template Method pattern** (2C already named this) — seen
here for the first time in real framework code rather than a throwaway
lab. Also recognized in: `unittest`/JUnit's own
`setUp()`/`tearDown()`, GUI frameworks calling your `onClick` handler,
servlet containers calling `doGet`/`doPost`, game engines calling your
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
guarantees every app handles these system-level events consistently, at
the cost of exactly the disorientation you started this lesson with —
control flow that isn't visible by reading your file top to bottom,
because a real part of "what runs when" lives outside your code
entirely.

---

## Connect the Pieces

One trace through the whole chapter: you tap the Pocket Inventory icon
→ the OS reads the Manifest (2D), finds the `<activity>` with the
`MAIN`/`LAUNCHER` intent-filter, and knows to build a `MainActivity`
object (2A's `new`, done by the OS instead of your own code) → the OS,
through `AppCompatActivity`'s inherited code (2C), calls `onCreate()`
on that object → your override runs `super.onCreate()` then
`setContentView(R.layout.activity_main)` → the screen you saw in
Chapter 1 gets drawn. Every step in that chain is something you can now
name using a specific earlier lesson in this chapter, not a vague sense
of "Android magic."

## What Breaks Without This

Remove `@Override` from `onCreate` and simultaneously misspell the
method name to `onCreat` (both changes together). Try to run the app.
It will still *compile* — without `@Override`, Java has no way to know
you intended to replace an inherited method, so it just accepts
`onCreat` as a brand-new, unrelated method nobody ever calls — but the
app will show a blank screen, because the real `onCreate` Android looks
for was never overridden. Restore both afterward.

## Exercises

1. Add a second `Log.d` call inside `onCreate`, *before*
   `super.onCreate(...)`. Run it and check Logcat — does your line
   appear before or after Android's own internal setup work? What does
   that tell you about calling `super.onCreate()` first vs. last?

## Definition of Done

- [ ] You saw your own `Log.d` line appear in Logcat, proving
      `onCreate` is called by the OS, not by you.
- [ ] You can explain, using 2A/2C's own vocabulary, what object the OS
      builds and what method it calls on it.
- [ ] You triggered the "compiles but shows a blank screen" failure by
      removing `@Override` and misspelling `onCreate`, and restored it.
- [ ] Commit: message explaining *why* (e.g. "Add Logcat trace to
      onCreate to observe Android's lifecycle calling MainActivity, not
      the reverse").

Chapter 3 is next: opening `activity_main.xml` for real — and the
generated `R` class gets its own lesson there, the first time you're
about to *create* a new entry in it rather than just read one.
