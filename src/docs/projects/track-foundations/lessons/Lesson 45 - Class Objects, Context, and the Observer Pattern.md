# Lesson 45: Class Objects, Context, and the Observer Pattern

**What you will build:** The first unit is a small, fully runnable, plain
Java lab. The remaining four read real Android mechanisms directly,
naming ideas already used informally in earlier lessons.

**What you need to know first:** Lesson 10's `Activity` and `callback`,
Lesson 01's `class`, Lesson 11's `generated R class`, Lesson 41's `view
tree`.

**Terms introduced in this lesson:**

- **`Class` object (reflection)** — a `Class` object is a language's
  built-in way to refer to a class itself as a value, not an instance of
  it.
- **`Context`** — an Android object representing the environment/identity
  a request originates from — an Activity is one kind of Context, used
  any time a component needs to say who it is.
- **Capability scoping** — explicitly declaring what a component is and
  isn't allowed to be used for, rather than leaving everything globally
  reachable by default.
- **`findViewById`** — a method that walks the inflated view tree at
  runtime looking for the view matching a declared ID, returning it as a
  real object whose methods can be called.
- **Observer pattern** — registering a piece of code (a listener/
  callback) ahead of time with a source of events, so it gets called
  later whenever the relevant event actually occurs, rather than being
  called immediately.

---

## Concept Unit: The `Class` Object

### The Problem

Code sometimes needs to refer to *a class itself*, as a value, without
constructing any instance of it — Lesson 19's own `new Intent(this,
SettingsActivity.class)` already did this, naming
`SettingsActivity.class` without ever writing `new SettingsActivity()`
anywhere in that line.

### Introduce the Concept in Isolation

```
mkdir lesson-45
cd lesson-45
```

Create `Main.java`:

```java
class Dog {
}

public class Main {
    public static void main(String[] args) {
        Class<Dog> dogClass = Dog.class;
        System.out.println("Class name: " + dogClass.getName());
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
Class name: Dog
```

`Dog.class` is a `Class` object — **first appearance**: a `Class` object
is a language's built-in way to refer to a class itself as a value, not
an instance of it. `dogClass` does not hold a `Dog` — no `new Dog()`
appears anywhere — it holds a real object representing the `Dog` class
itself, which can be inspected (`getName()`) or handed to APIs that need
to know *which class* is meant without needing an actual instance of it.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `Class<Dog> dogClass = Dog.class;` — **(a) first appearance.**
   `Dog.class` produces the one, real `Class` object representing `Dog`
   itself; `Class<Dog>` (Lesson 07's generics, reused) is the declared
   type of a `Class` object specifically representing `Dog`.
2. `dogClass.getName()` — **(a) first appearance**: reads the class's
   own name back out as a `String`, proof `dogClass` genuinely holds
   real information about the class, not just a label.

### CS Lens

A `Class` object is the language's own **reflection** entry point — a
way for a running program to inspect or refer to its own types as data,
rather than only using them to declare variables or construct instances.
This is exactly what `new Intent(this, SettingsActivity.class)`, already
used since Lesson 19, relies on: naming *which* Activity class to route
to, as a value, with no instance of it constructed anywhere in that
line.

Also recognized in: `type()` in Python (a close equivalent — every value
already knows its own type, inspectable as a value), `typeof` in C#,
reflection APIs across virtually every mainstream managed language.

### SE Lens

The alternative — some other way to identify "which class" without a
real `Class` object, like passing a `String` class name — was not chosen
for `Intent`'s own routing because a `Class` object is checked by the
compiler (a typo'd class name would fail to compile, not fail silently
at runtime the way a mistyped `String` would).

---

## Concept Unit: `Context`

### The Problem

Many Android APIs need to know *which* app, and often which specific
component, a request originates from — accessing `SharedPreferences`
(Lesson 35), building an `Intent` (Lesson 19), reading a resource (Lesson
11) all require identifying the calling environment somehow.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
Intent intent = new Intent(this, SettingsActivity.class);
SharedPreferences prefs = getSharedPreferences("settings", Context.MODE_PRIVATE);
```

`this`, in both calls, is a `Context` — **first appearance**: an Android
object representing the environment/identity a request originates from
— an Activity is one kind of Context, used any time a component needs to
say who it is. Every Activity *is* a `Context` (through inheritance,
Lesson 05) — which is why `this`, inside an Activity, can be passed
anywhere a `Context` is required, identifying this specific Activity,
and the app it belongs to, as the origin of the request.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `new Intent(this, SettingsActivity.class)` — **(b) reappearing**
   `Intent` construction from Lesson 19, `this` now examined explicitly
   as a `Context` rather than glossed over.
2. `getSharedPreferences("settings", Context.MODE_PRIVATE)` — **(b)
   reappearing** `SharedPreferences` retrieval from Lesson 35,
   `Context.MODE_PRIVATE` naming the access mode explicitly.

### CS Lens

`Context` is Android's own answer to "which environment is this request
coming from" — every component that needs to identify itself to the
framework, or reach a framework service, does so through a `Context`,
the same underlying identity concept regardless of which specific API is
being called.

Also recognized in: any framework's own "current environment" or
"current request" object passed implicitly or explicitly through a call
chain (a web framework's request context, a dependency-injection
container's own scope object).

### SE Lens

This unit deliberately stops at recognition — `Context`'s full type
hierarchy and different flavors (Activity Context versus Application
Context, Lesson 48) are a later lesson's own subject; the goal here is
only naming what `this` has represented, unexplained, since it first
appeared passed to `Intent`'s constructor.

---

## Concept Unit: Capability Scoping

### The Problem

Leaving every component reachable by default, from anywhere, means
nothing prevents unrelated code — inside the app or outside it — from
using a component in a way its own author never intended.

### Introduce the Concept in Isolation

Contrasting two real, verified Manifest declarations:

```xml
<activity android:name=".InternalHelperActivity" android:exported="false" />
<activity android:name=".MainActivity" android:exported="true" />
```

This is `capability scoping` — **first appearance**: explicitly declaring
what a component is and isn't allowed to be used for, rather than
leaving everything globally reachable by default.
`android:exported="false"` (Lesson 11's own attribute, examined
explicitly here) scopes `InternalHelperActivity` to this app alone — no
other app can launch it at all; `android:exported="true"` deliberately
leaves `MainActivity` reachable, since it's meant to be the launcher
entry point.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — these are real, verified
Manifest declarations.

### Mechanical Walkthrough

1. `android:exported="false"` — **(b) reappearing** from Lesson 11,
   examined here specifically as a deliberate capability restriction,
   not merely a required attribute.
2. `android:exported="true"` — the deliberate opposite choice for
   `MainActivity` specifically, since it's meant to be reachable from
   outside the app (the launcher).

### CS Lens

Capability scoping is access-level enforcement (Lesson 04) at the scale
of an entire component, rather than one field: a deliberate, explicit
declaration of what's allowed to reach a given component, rather than
defaulting to globally open access.

Also recognized in: firewall rules (explicitly scoping which network
traffic is allowed through), API access scopes in OAuth (explicitly
declaring what a granted token is allowed to do), file permissions
generally.

### SE Lens

The alternative — leaving every component exported by default — was not
chosen because it would let any other app on the device launch
`InternalHelperActivity` directly, bypassing whatever assumptions its own
code makes about only ever being reached from within this app itself.

---

## Concept Unit: `findViewById`

### The Problem

An XML-declared view tree (Lesson 41) exists as data until something
bridges it into real, callable Java objects — code that wants to react
to or change a specific view needs a way to reach it by its declared
identifier.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
TextView nameLabel = findViewById(R.id.nameLabel);
nameLabel.setText("Rex");
```

This is `findViewById` — **first appearance**: a method that walks the
inflated view tree at runtime looking for the view matching a declared
ID, returning it as a real object whose methods can be called.
`R.id.nameLabel` (Lesson 11's own generated `R` class) is the
compile-time-checked identifier; `findViewById` performs the actual
runtime search through the view tree (Lesson 41), returning a real
`TextView` object `setText` can then be called on.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `findViewById(R.id.nameLabel)` — **(a) first appearance** examined
   explicitly: searches the already-inflated view tree for the one view
   declared with `android:id="@+id/nameLabel"` in the layout XML,
   returning it.
2. `nameLabel.setText("Rex");` — **(b) reappearing** method call,
   now on a real, located `View` object.

### CS Lens

`findViewById` is the runtime bridge between an XML-declared view tree
(purely data) and Java code that wants to react to or change a specific
view — without it, the XML layout would remain inert data with no way
for application code to reach into it at all.

Also recognized in: `document.getElementById` on the web (a near-
identical runtime lookup by declared identifier, into a tree structure
declared as markup), any framework bridging a declarative structure
into an imperative object graph.

### SE Lens

The cost this method carries — a runtime tree search, rather than a
compile-time-guaranteed direct reference — is a real, deliberate tradeoff
Android's own View system accepts, in exchange for keeping layout
structure declarative and separate from the code that manipulates it
(the same separation-of-concerns reasoning Lesson 11 already established
for resources generally).

---

## Concept Unit: The Observer Pattern

### The Problem

Registering a piece of code ahead of time, to be called later whenever
some event happens, has already appeared repeatedly — Lesson 10's
`Button`/`ClickHandler`, Lesson 08's `OnItemClickListener` — without ever
being named as one specific, recognized design pattern.

### Introduce the Concept in Isolation

This concept doesn't need new code to isolate — it names a shape already
built and run, back in Lesson 10:

```java
button.setOnClickListener(() -> System.out.println("Handler ran!"));
```

This is the `observer pattern` — **first appearance**: registering a
piece of code (a listener/callback) ahead of time with a source of
events, so it gets called later whenever the relevant event actually
occurs, rather than being called immediately. `button` is the
**subject** (the source of events); the lambda is the **observer**,
registered ahead of time and invoked later, exactly once per actual
click.

### Discard the Throwaway Example

No new code was introduced in this unit — it names a pattern already
demonstrated by Lesson 10's own real, executed code.

### Mechanical Walkthrough

No new syntax appears in this unit; its content is the CS/SE framing
below, applied to code already built and run in Lesson 10.

### CS Lens

The observer pattern is Lesson 10's own callback concept, given its
formal, widely-recognized design-pattern name: a subject maintains a list
of registered observers (here, just one), and notifies them when a
relevant event occurs, without the subject needing to know anything
about what each observer actually does in response.

Also recognized in: this exact pattern by name across virtually every
object-oriented design-pattern catalog, `addEventListener` in JavaScript,
publish/subscribe systems generally — a genuinely foundational,
widely-recurring shape.

### SE Lens

Naming this pattern explicitly matters because recognizing "this is the
observer pattern" transfers understanding across contexts: a
`RecyclerView` click listener, an Android `BroadcastReceiver` (Lesson
14), and a plain Java `Button` listener are all the identical pattern,
once recognized, rather than three unrelated things to learn separately.

---

## Connect the Pieces

`Dog.class` named the class itself as a value — exactly what
`SettingsActivity.class`, inside `Intent`'s constructor, already relied
on since Lesson 19. `this`, passed to that same constructor, is a
`Context` — the environment identifying the request's origin.
`android:exported="false"` scopes a component's reachability explicitly,
rather than leaving it open by default. `findViewById` bridges the
XML-declared view tree into real, callable objects. And the observer
pattern, finally, names the registered-callback shape every one of these
lessons' own click listeners and callbacks has already been using since
Lesson 10.

## What Breaks Without This

Calling `findViewById` with an ID that doesn't exist anywhere in the
currently-inflated layout returns `null`, and calling a method on that
`null` result throws a real runtime error:

```
java.lang.NullPointerException: Attempt to invoke virtual method 'void android.widget.TextView.setText(...)' on a null object reference
```

This is concrete proof `findViewById` performs a real, fallible runtime
search — a mistyped or missing ID is not caught at compile time, only
discovered when the returned `null` is actually used.

## Exercises

1. Write a second `Class` object example using a class from an earlier
   lesson (`Dog` from Lesson 01, say), and print its name.
2. Explain, in your own words, why `InternalHelperActivity` in this
   lesson's own capability-scoping example should never be
   `android:exported="true"`.
3. Identify, from Lesson 14 (`BroadcastReceiver`) and Lesson 10 (Activity
   callbacks), one additional real example of the observer pattern
   already used earlier in this curriculum.

## Definition of Done

- [ ] You ran the `Class` object example and saw the real class name
      printed.
- [ ] You read the real `Context`, capability-scoping, and
      `findViewById` examples and can explain each in your own words.
- [ ] You completed Exercise 3 and correctly identified an earlier
      example of the observer pattern.
- [ ] You can state, without looking back at this lesson, what `this`
      represents when passed as a `Context`.
