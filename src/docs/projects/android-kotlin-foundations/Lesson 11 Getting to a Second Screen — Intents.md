# Lesson 11: Getting to a Second Screen — Intents

**What you will build:** A second, currently-empty screen —
`InventoryActivity` — reachable from the login screen, using the exact
navigation option Java's Lesson 17 chose after weighing all three real
Android alternatives. The transferable problem: `Intent`-based
navigation between two real Activities is Android platform mechanism,
not a language feature — completely unchanged by which language calls
it — with exactly one small, easy-to-get-wrong syntax difference at the
one point Java code names a class as a literal value.

**What you need to know first:** Java's Lesson 17 in full — the three
navigation options (a second Activity, a Fragment, swapping
`setContentView` in place) and the real tradeoff reasoning behind
choosing a second Activity; `Intent`, `startActivity`, the back stack,
and `android:exported`, all unchanged by language. This series' Lesson
05 (`: AppCompatActivity()`, `override fun onCreate`) and Lesson 09
(the button listeners this lesson extends).

**Terms introduced in this lesson:**
- **`::class.java`** — Kotlin's syntax for obtaining the real
  `java.lang.Class` object a Java API like `Intent`'s constructor
  expects, as opposed to `::class` alone, which produces a different,
  Kotlin-specific type.

---

## Concept Unit: Three Ways to Show a Second Screen — Unchanged

### The Problem

Confirm directly: Java's Lesson 17 chose a second `Activity`, started
with an explicit `Intent`, over a `Fragment` or swapping
`setContentView` in place — a decision about back-stack correctness and
keeping each screen's fields cleanly separated onto its own class.
None of that reasoning mentions Java specifically; it's a decision about
Android's own Activity/Fragment/back-stack model, identical regardless
of language.

### The New Code

`InventoryActivity.kt` — a brand-new file:

```kotlin
class InventoryActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_inventory)
    }
}
```

`activity_inventory.xml` — a brand-new file, deliberately minimal:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="24dp">

</LinearLayout>
```

In `AndroidManifest.xml`, a second `<activity>` entry:

```xml
<activity
    android:name=".InventoryActivity"
    android:exported="false" />
```

### Project Change

- **Reference Source:** `Intent`'s real constructor and `startActivity`'s
  signature — the same real, unchanged `Context`/`Activity` API Java's
  Lesson 17 already quoted: `public Intent(Context packageContext,
  Class<?> cls)` and `public void startActivity(Intent intent)`. No
  reference counterpart for `InventoryActivity` itself — an application
  class authored from scratch.
- **Files affected:** New `InventoryActivity.kt`; new
  `activity_inventory.xml`; `AndroidManifest.xml`; `MainActivity.kt`.
- **Change type:** Create two new files; add to two existing files.
- **Dependencies:** None new.

### Mechanical Walkthrough

- `class InventoryActivity : AppCompatActivity()` — reappearing (this
  series' own Lesson 05), the identical inheritance relationship
  `MainActivity` already has.
- `override fun onCreate(...)`, `super.onCreate(...)`,
  `setContentView(...)` — all reappearing, unchanged.
- `android:exported="false"` — reappearing, the same reasoning Java's
  Lesson 17 already gave: no other app has any legitimate reason to
  launch `InventoryActivity` directly.

---

## Concept Unit: `::class.java` — Kotlin's Class Literal

### The Problem

`Intent`'s real constructor, quoted above, takes a `Context` and a
`java.lang.Class<?>` — Java's own runtime representation of a class,
obtained in Java by writing `InventoryActivity.class`. Kotlin has no
`.class` syntax at all. Kotlin does have its own, different concept of
"a reference to a class" — does it produce the same thing Java's
`Intent` constructor is expecting?

### Introduce the Concept in Isolation

```kotlin
class InventoryActivity

fun main() {
    val kClass = InventoryActivity::class
    val javaClass = InventoryActivity::class.java

    println(kClass)
    println(javaClass)
    println(javaClass::class.java.name)
}
```

Compile and run:

```
kotlinc ClassRefDemo.kt -include-runtime -d ClassRefDemo.jar
java -jar ClassRefDemo.jar
```

Real output, from running this just now:

```
class InventoryActivity
class InventoryActivity
java.lang.Class
```

`InventoryActivity::class` produces a `KClass` — Kotlin's own runtime
class-reference type, part of Kotlin's reflection API, a genuinely
different type from Java's `java.lang.Class`. `InventoryActivity::class.
java` reads the `KClass`'s own `.java` property, converting it into the
real `java.lang.Class` object Java APIs actually expect — confirmed by
the third line: asking `javaClass` itself what *its own* runtime type is
reports `java.lang.Class`, not some Kotlin-specific reflection type.
`InventoryActivity::class` alone would not compile where `Intent`'s
constructor expects a `Class<?>` — the `.java` step is not decorative,
it's a real, necessary conversion between two genuinely different
reflection systems.

### Discard the Throwaway Example

`ClassRefDemo.kt` is deleted. `::class.java` reappears anywhere this
series needs to hand a class literal to a Java API expecting one —
starting with `Intent`, immediately below.

### CS Lens

Kotlin maintaining its own reflection type (`KClass`) alongside Java's
(`Class`) is a real instance of **two type systems meeting at a language
boundary**, the same general situation Lesson 08's platform types
already introduced for nullability specifically — here applied to
metadata about types themselves rather than to values.

Also recognized in: any language that adds its own richer reflection or
metadata system on top of a host platform's existing one (C#'s `Type`
versus various higher-level metadata APIs added since), where a
conversion step between "the host's own low-level version" and "our
richer version" is a real, necessary seam rather than two names for the
same thing.

### SE Lens

**Why does Kotlin maintain an entirely separate `KClass` type instead of
just reusing `java.lang.Class` directly, avoiding this exact conversion
step?** Kotlin runs on more than one platform beyond the JVM (Kotlin/JS,
Kotlin/Native compile to targets with no `java.lang.Class` at all), and
`KClass` is Kotlin's platform-independent answer to "a reference to a
class," available identically everywhere Kotlin runs. `.java` exists
specifically as the JVM-only escape hatch back to the platform-specific
type, needed exactly when — as here — a real Java API is the one asking
for it.

---

## Concept Unit: Wiring the Real Navigation

### The Problem

Every piece is now available: the second Activity exists, the Manifest
entry is real, and `::class.java` produces the exact `Class` object
`Intent`'s constructor requires.

### The New Code

```kotlin
val intent = Intent(this, InventoryActivity::class.java)
startActivity(intent)
```

### The Updated Project

`loginButton`'s listener, in full, continuing from this series' own
Lesson 09:

```kotlin
binding.loginButton.setOnClickListener { view ->
    val username = binding.usernameField.text.toString()
    if (!username.isValidUsername()) {
        Toast.makeText(this, "Username must be at least 3 characters", Toast.LENGTH_SHORT).show()
        return@setOnClickListener
    }
    val password = binding.passwordField.text.toString()
    Toast.makeText(this, "Logging in: $username", Toast.LENGTH_SHORT).show()

    val intent = Intent(this, InventoryActivity::class.java)   // ← new
    startActivity(intent)                                       // ← new
}
```

### Mechanical Walkthrough

- `Intent(this, InventoryActivity::class.java)` — reappearing, this
  series' own Lesson 03 no-`new` constructor-call syntax, applied here
  to a real Java class (`Intent`, from the Android SDK) exactly as
  proven in Lesson 05 that Kotlin needs no special handling to construct
  a Java type. `this` is `MainActivity`, satisfying the `Context`
  parameter (reappearing, this series' own Lesson 08 concept).
  `InventoryActivity::class.java` is this lesson's own concept, just
  proven, satisfying the `Class<?>` parameter Java's own version reached
  with `.class`.
- `startActivity(intent)` — reappearing, the identical inherited method
  and identical Inversion-of-Control timing Java's Lesson 17 already
  proved: control returns to `MainActivity` as soon as this call
  *returns*, not when `InventoryActivity` finishes constructing.

### SE Lens

**Why does this one line — a class literal — need a genuinely different
syntax from Java at all, when nearly everything else about `Intent`-
based navigation transferred with zero changes?** Every other piece
this lesson touched (`Intent`'s constructor, `startActivity`,
`android:exported`, the back stack) is Android platform behavior,
identical regardless of caller language. A class literal is different:
it's asking a specific *language's own compiler* to produce a reference
to a type, and Kotlin's compiler and Java's compiler track type
information through genuinely different systems (`KClass` versus
`Class`) for reasons — Kotlin's multiplatform ambitions — that have
nothing to do with Android at all. This is the one seam in an otherwise
unchanged mechanism precisely because it's the one place a *language*
concept, not a *platform* concept, is actually involved.

---

## Connect the Pieces

One trace: tapping "Log In," having already passed this series' own
Lesson 09 validation, now also builds a real `Intent` — `this` supplying
the `Context`, `InventoryActivity::class.java` supplying the real
`java.lang.Class` object via Kotlin's own `KClass`-to-`Class` conversion
— and hands it to `startActivity`. The OS, not `MainActivity`'s own
code, constructs `InventoryActivity` and calls its `onCreate`, exactly
the mechanism Java's Lesson 17 already proved, pushing `InventoryActivity`
onto the back stack so the device's back gesture returns to the
still-paused `MainActivity`.

## What Breaks Without This

Try writing `Intent(this, InventoryActivity::class)` — omitting `.java`
— and attempt to compile.

Real output, from running this yourself: a real compiler error stating
that `Intent`'s constructor expects `Class<*>`, not `KClass<
InventoryActivity>` — direct, hands-on proof that `::class` and
`::class.java` are genuinely different types, not interchangeable
spellings of the same thing. Restore `.java` before moving on.

## Exercises

1. Remove the `<activity android:name=".InventoryActivity" ... />` entry
   from the Manifest, leaving the Kotlin class in place, and tap "Log
   In." Confirm you get the identical
   `android.content.ActivityNotFoundException` Java's Lesson 17 already
   documented, naming `InventoryActivity` directly. Restore the entry.
2. Press the device's back button on the blank `InventoryActivity`
   screen and confirm the login screen reappears with its typed values
   still present — the same proof Java's Lesson 17 asked for, that
   `MainActivity` was paused, not destroyed.
3. In a disposable scratch file, print `InventoryActivity::class` and
   `InventoryActivity::class.java` side by side and inspect both types'
   own package (`kotlin.reflect.KClass` versus `java.lang.Class`) using
   your IDE's "go to definition," confirming directly that they come
   from two entirely separate libraries.

## Definition of Done

- [ ] You can state which of the three navigation options this project
      uses, unchanged from Java's Lesson 17 reasoning.
- [ ] You triggered the real `Class<*>` vs. `KClass` compiler error by
      omitting `.java`, and the real `ActivityNotFoundException` from a
      missing Manifest entry — restoring both.
- [ ] Tapping "Log In" (with a valid username) genuinely navigates to a
      second, blank screen, and the back button returns correctly.
- [ ] You can explain, precisely, why `::class.java` is needed instead
      of `::class` alone whenever a real Java API asks for a class
      literal.
- [ ] Commit: `git commit -m "Add InventoryActivity and navigate to it
      via an explicit Intent using ::class.java"`.

Next: a real one-method contract this project defines for itself —
sealed classes and `when`, motivated by a login result that can succeed,
fail on a wrong password, or fail on a network error, and the compiler's
ability to guarantee every case was actually handled.
