# Lesson 06: Inheritance, Overriding, and `@Override`

**What you will build:** Nothing new on screen yet — this lesson explains
two words already sitting in the real `MainActivity.java` you ran in
Lesson 05: `extends` and `@Override`. The transferable problem: almost
every Android class you will ever write is not a class you build from
scratch — it's a class that borrows an enormous amount of pre-built
behavior from a framework class and customizes a small, specific piece of
it. That borrowing-and-customizing relationship has a name, a syntax, and
a real mechanism behind it, and it is worth understanding precisely
before you're three framework classes deep and just pattern-matching.

**What you need to know first:** Lesson 01 (`class`, methods, `public`,
`void`), Lesson 02 (objects, `new`, references), Lesson 03 (primitive vs.
reference types), Lesson 05 (the real `MainActivity.java` this lesson
explains).

**Terms introduced in this lesson:**
- **`extends`** — declares that a class inherits another class's fields
  and methods, plus whatever it adds or overrides itself.
- **Parent class / child class (subclass)** — the class being inherited
  from, and the class doing the inheriting.
- **Overriding** — a subclass supplying its own body for a method the
  parent class already declared, replacing what runs when that method is
  called on an object of the subclass.
- **`@Override`** — an annotation (`@`-prefixed metadata attached to a
  declaration, not executable code itself) that tells the compiler "this
  method is meant to override a parent method" — the compiler then checks
  that claim and errors if it's false.
- **Dynamic dispatch** — which specific method body actually runs is
  decided by the object's real type at the moment of the call, not by the
  type of the variable holding the reference.

---

## Concept Unit: Inheritance and Overriding

### The Problem

Real object-oriented code is full of "this class is *basically* that
class, but with one thing different." Writing every such class entirely
from scratch — copying every field and method from the class it
resembles — would mean that fixing a bug in the shared behavior requires
fixing it in every copy separately. Java (like most object-oriented
languages) has a direct language feature for "basically that class, but
different": a class can declare that it **extends** another class,
inheriting everything the parent class has, and then add new behavior or
replace (**override**) specific pieces of it.

### Introduce the Concept in Isolation

A disposable example — `Animal` and `Dog` mean nothing to this project
and will never appear in it again. `new Animal()` and `new Dog()` below
use exactly the object-creation mechanism Lesson 02 already proved —
each call allocates a real, independent object and returns a reference to
it; nothing new about `new` itself is being introduced here.

```java
class Animal {
    String makeSound() {
        return "...";
    }

    String describe() {
        return "This animal says: " + makeSound();
    }
}

class Dog extends Animal {
    @Override
    String makeSound() {
        return "Woof";
    }
}

public class InheritanceDemo {
    public static void main(String[] args) {
        Animal genericAnimal = new Animal();
        Dog dog = new Dog();

        System.out.println(genericAnimal.describe());
        System.out.println(dog.describe());
    }
}
```

Compile and run it:

```
javac InheritanceDemo.java
java InheritanceDemo
```

Real output:

```
This animal says: ...
This animal says: Woof
```

This is the concept in one contrast: `Dog` never wrote its own
`describe()` method — it inherited `describe()` completely unchanged from
`Animal`. But `describe()` calls `makeSound()`, and *which* `makeSound()`
runs depends on which object is actually calling it — `Animal`'s own
`"..."` version for `genericAnimal`, `Dog`'s replaced `"Woof"` version for
`dog` — even though both calls go through the exact same inherited
`describe()` method body. This is called **dynamic dispatch**: the
decision of which method body actually runs is made using the object's
real type, at the moment of the call — not decided in advance, and not
decided by `describe()` itself, which has no idea it's being called by a
`Dog`.

### Discard the Throwaway Example

`Animal`, `Dog`, and `InheritanceDemo` are deleted now. They never enter
the real project.

### Project Change

- **Reference Source:** `AppCompatActivity`'s own real declared shape —
  quoted and explained in full below, confirmed this session directly
  against its actual source
  (`androidx.appcompat.app.AppCompatActivity`, in the AndroidX support
  library repository). `MainActivity.java` itself was already generated
  by the wizard in Lesson 05; this unit explains code that already
  exists rather than adding new code, but the class it extends has a
  real, checkable shape that has never yet been shown, and the Parent
  Contract Rule this curriculum follows requires showing it before
  explaining what a subclass of it does.
- **Files affected:** `MainActivity.java`, at
  `app/src/main/java/com/yourname/yourapp/MainActivity.java` inside the
  real Android Studio project you created in Lesson 05 — not a file in
  this lesson series itself. That project only exists on your own
  machine; nothing here is stored alongside these lesson files. Replace
  `com/yourname/yourapp` with whatever package path you actually chose in
  the wizard.
- **Change type:** None — explanation of existing generated code, no
  edits yet.

### The New Code

No new code to type. In your own project, open
`app/src/main/java/<your package path>/MainActivity.java` — the same
file the wizard generated and you ran in Lesson 05. In the Android
Studio **Project** panel (top dropdown set to **Android**), it's under
`app > java > <your package name>`.

### The Contract You're Filling In (from `androidx.appcompat.app.AppCompatActivity`, not your code)

Before reading what `MainActivity` does with it, here is what
`AppCompatActivity` itself actually declares — not a summary, its real
declaration:

```java
public class AppCompatActivity extends FragmentActivity implements
        AppCompatCallback, TaskStackBuilder.SupportParentable,
        ActionBarDrawerToggle.DelegateProvider {

    protected void onCreate(@Nullable Bundle savedInstanceState) { ... }
    protected void onStart() { ... }
    protected void onStop() { ... }
    protected void onDestroy() { ... }
    protected void onPostCreate(@Nullable Bundle savedInstanceState) { ... }
    protected void onSaveInstanceState(@NonNull Bundle outState) { ... }
    // ...and more not shown here
}
```

Read this precisely, not just skimmed: `AppCompatActivity` **itself**
`extends FragmentActivity` — the same `extends` keyword this lesson just
lab'd, one more link in a longer chain (`AppCompatActivity` →
`FragmentActivity` → ... → `Activity`, each link adding its own
behavior, none of it shown here since this lesson's job is only the
one link `MainActivity` directly touches). It also `implements` three
interfaces (`AppCompatCallback`, `TaskStackBuilder.SupportParentable`,
`ActionBarDrawerToggle.DelegateProvider`) — Lesson 14 covers what
`implements` and an interface actually are; for now, simply notice that
`extends` and `implements` are two different keywords appearing on the
same line, doing two different jobs, both inherited by `MainActivity`
the moment it writes `extends AppCompatActivity`. And critically:
`onCreate` is not the only method here — `onStart`, `onStop`,
`onDestroy`, and several others are real, existing methods
`MainActivity` could *also* override, following the exact same
`@Override`/`super` pattern this lesson teaches for `onCreate` alone.
They're flagged, not needed yet, precisely because this project's actual
screens never need to hook into those specific moments — but they are
real and inherited the instant `extends AppCompatActivity` is written,
not something only `onCreate` alone grants.

### The Updated Project

```java
package com.yourname.yourapp;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }
}
```

`extends AppCompatActivity` now reads the same way `extends Animal` did a
moment ago: `MainActivity` is a subclass, `AppCompatActivity` is the real
parent class just quoted above, not an abstract description of one —
`MainActivity` inherits every one of those lifecycle methods, the
`AppCompatCallback`/`TaskStackBuilder.SupportParentable`/
`ActionBarDrawerToggle.DelegateProvider` contracts, and the window setup,
action bar handling, and cross-version theme compatibility their bodies
(not shown above — real, but not this lesson's subject) implement,
automatically, the same way `Dog` inherited `describe()` without writing
it. `@Override protected void onCreate(...)` is `MainActivity` replacing
one specific piece of that
inherited behavior — exactly like `Dog` replacing `makeSound()` — while
keeping everything else `AppCompatActivity` already does.

### Mechanical Walkthrough

- `public class MainActivity extends AppCompatActivity` — **first
  appearance in real project code**, same `extends` concept just lab'd
  above. `MainActivity` is the child class; `AppCompatActivity` is the
  parent.
- `@Override` — **first appearance in real project code**, same
  annotation just lab'd above. It's telling the compiler: "the method
  right below this is meant to replace one that already exists in
  `AppCompatActivity`."
- `protected void onCreate(Bundle savedInstanceState)` — **first
  appearance of the method signature itself**; `protected`, `Bundle`, and
  what `onCreate` actually *is* (a callback the operating system invokes,
  not a method you call yourself) are the subject of the next lesson, not
  this one — flagged, not silently skipped.
- `super.onCreate(savedInstanceState);` — **first appearance.** `super`
  refers to "the parent class's own version of this" — it's how a
  subclass explicitly calls the parent's original implementation of a
  method it has just overridden. Without this line, `AppCompatActivity`'s
  own setup work inside its version of `onCreate` (the window/theme setup
  mentioned above) would simply never run, because overriding a method
  completely replaces it unless the override deliberately calls back into
  the original with `super`.
- `setContentView(R.layout.activity_main);` — flagged, not explained yet;
  Lesson 07 covers what puts a layout on screen and what `R.layout` is.

### CS Lens

`extends`/overriding is **inheritance** — one of the core mechanisms of
object-oriented programming, alongside encapsulation and polymorphism.
The specific pattern here, where a parent class defines the overall shape
of an operation and calls out to points a subclass can override to fill
in, is the **Template Method pattern**: the parent (`AppCompatActivity`)
defines the fixed sequence an Activity's setup goes through, and calls
`onCreate` as one of the specific points a subclass is expected to fill
in.

Also recognized in: nearly every GUI framework's base "window" or
"component" class (subclass it, override the parts you need), Java's own
`Thread` class (subclass and override `run()`), abstract base classes in
almost every object-oriented codebase, and — the very next time this
pattern reappears in this series — every other Activity lifecycle method
you'll override later.

### SE Lens

**Why does Android hand you a half-finished class to fill in, instead of
letting you write `onCreate` from a blank slate?** The alternative — no
inheritance, no framework base class — would mean every single app
reimplements window creation, theme application, and lifecycle
bookkeeping from raw operating-system calls, correctly, every time. That
is exactly the kind of large, error-prone, repetitive work a shared
parent class exists to eliminate: `AppCompatActivity` gets it right once,
and every subclass — including `MainActivity` — inherits that correctness
for free. The cost is what you're paying right now: you have to
understand a contract (a parent class's shape) that you didn't write,
before your own code makes full sense.

---

## Connect the Pieces

One trace: `MainActivity extends AppCompatActivity` gives `MainActivity`
everything `AppCompatActivity` already knows how to do. `@Override
onCreate` marks one specific inherited method for replacement.
`super.onCreate(savedInstanceState)` inside that replacement calls back
into the original version, so the parent's own setup work still happens.
The same `Animal`/`Dog` relationship from the lab, now doing real work.

## What Breaks Without This

In `MainActivity.java`, comment out
`super.onCreate(savedInstanceState);` and run the app. This is not a
guess about what "probably" happens — Android's own reference
documentation for `Activity.onCreate` states the guarantee directly:

> "Derived classes must call through to the superclass's implementation
> of this method. If they do not, an exception will be thrown."
> — [Android developer reference, `Activity.onCreate(Bundle)`](https://developer.android.com/reference/android/app/Activity#onCreate(android.os.Bundle))

Run it yourself and read the actual exception Android throws at you —
the message will directly reference `onCreate` and the missing `super`
call. This is the framework enforcing, at runtime, exactly the rule this
lesson just explained: overriding a method fully replaces it unless the
override calls back into the original. Restore the line before moving
on — this is not a change to keep.

## Exercises

1. In the `Animal`/`Dog` lab, add a second subclass, `Cat`, overriding
   `makeSound()` differently. Confirm `describe()` — which `Cat` still
   doesn't write itself — produces the right sound for a `Cat` object,
   proving dynamic dispatch again with a second concrete case.
2. In the same lab, remove `@Override` from `Dog`'s `makeSound()` and
   deliberately misspell the method name (`makeSond`). Recompile without
   `@Override` present — it compiles fine, silently creating an unrelated
   new method instead of overriding anything. Add `@Override` back with
   the same typo still in place — now the compiler rejects it. This is
   the concrete reason `@Override` exists: it turns a silent bug into a
   compile error.

## Definition of Done

- [ ] You ran the `Animal`/`Dog` lab yourself and saw dynamic dispatch
      produce different output through the same inherited method.
- [ ] You can explain what `super.onCreate(...)` does and why removing it
      breaks the app, having seen the real crash.
- [ ] You triggered the `@Override` typo-catching behavior yourself.
- [ ] You can point at `MainActivity extends AppCompatActivity` and name,
      without looking, which class is the parent and which is the child.

Next: `onCreate` itself — why you never call it yourself, who does, and
what that has to do with `protected`.
