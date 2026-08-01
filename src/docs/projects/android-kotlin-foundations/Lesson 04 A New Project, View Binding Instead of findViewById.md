# Lesson 04: A New Project, View Binding Instead of `findViewById`

**What you will build:** A real Kotlin Android Studio project, created
through the same wizard Java's Lesson 05 used — and, wired into it for
real for the first time, the feature Java's Lesson 13 only ever showed
as "the alternative not taken": **View Binding**. The transferable
problem: Java's Lesson 13 chose `findViewById` as this curriculum's
default specifically to make a real generic-method mechanism visible,
and named View Binding's build-configuration cost as the reason it
wasn't adopted there. This series makes the opposite call, on purpose —
View Binding is Google's own current default recommendation for new
projects, and this lesson builds it for real rather than only describing
it, including one genuinely new Kotlin language feature it depends on
that has nothing to do with Android specifically.

**What you need to know first:** Java's Lesson 05 (package declarations,
the New Project wizard, Gradle recognized but not yet explained) — the
wizard mechanics and package/folder relationship transfer completely
unchanged; this lesson doesn't re-prove them. Java's Lesson 13 (`private`
fields, `findViewById`'s real generic signature, and View Binding's
`ActivityMainBinding`/`buildFeatures` shape, already shown there as the
road not taken). This series' Lesson 02 (nullable types — used below as
the contrast for why `lateinit` exists at all).

**Terms introduced in this lesson:**
- **`buildFeatures { viewBinding = true }`** — the Gradle Kotlin-DSL
  setting enabling View Binding's code generation for a module.
- **`lateinit var`** — a non-nullable property that starts genuinely
  unassigned, checked at the moment it's read rather than at the moment
  it's declared.
- **`UninitializedPropertyAccessException`** — the specific runtime error
  thrown by reading a `lateinit var` before it's been assigned.
- **Synthetic property (Java interop)** — a Java class's `getX()`/`setX()`
  method pair, exposed to Kotlin code as a plain property named `x`.

---

## Concept Unit: Creating the Project

### The Problem

Java's Lesson 05 proved that a package name isn't cosmetic — it's a
compiler-checked claim about folder location — and walked through the
wizard once, in Java. None of that changes for a Kotlin project; the
wizard, Gradle, and the package/folder relationship are exactly the same
machinery underneath, regardless of which language box gets checked.

### The New Code

There's no code yet — a sequence of decisions in the wizard, same as
before:

1. **New Project → Empty Views Activity.** Same choice as Java's Lesson
   05 — "Views," the XML-based UI system, as opposed to Compose (this
   series' own Milestone 4 introduces Compose directly, once a concrete
   reason to switch has been felt).
2. **Name** and **package name** — identical in meaning to Java's Lesson
   05; accepting the suggested reversed-domain package name creates the
   same kind of real, compiler-checked folder structure proved there.
3. **Language: Kotlin.** Worth noticing directly, as the mirror image of
   Java's Lesson 05 instruction to "double-check this specifically —
   Android Studio defaults new projects to Kotlin": there, you had to
   actively override the default to get Java. Here, Kotlin already *is*
   the default — nothing to override.
4. **Minimum SDK** — leave the suggested default, same as before.
5. Click **Finish.**

### The Updated Project

Expand `app > kotlin+java > com.yourname.yourapp` (Kotlin projects group
both languages under one folder in the Android view, even though this
project contains no `.java` files at all). Open the one generated file,
`MainActivity.kt`:

```kotlin
package com.yourname.yourapp

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }
}
```

The `package` line matches the folder you expanded to get here — the
exact same fact Java's Lesson 05 proved, completely unchanged by the
language switch. Everything else here — `: AppCompatActivity()`,
`override fun`, `super.onCreate(...)`, `Bundle?` — is real material this
series covers next, starting with Lesson 05. As Java's own Lesson 05
said about its own generated file: nothing here is being glossed over
permanently; it simply isn't this lesson's concept yet.

### SE Lens

**Why does the wizard default to Kotlin now, when Java's Lesson 05 had
to warn you the default needed overriding to get Java?** Google
announced Kotlin as its "preferred language for Android app development"
in 2019, several years after Android's original Java-only tooling
shipped — the ecosystem's own recommended default shifted underneath the
platform over time, not because Java stopped working, but because
Google's own tooling, sample code, and now project-wizard defaults moved
to steer new projects toward Kotlin specifically. The wizard default is
itself a real, observable trace of that shift — not a neutral technical
fact, but Google's own current recommendation showing up as a checkbox.

---

## Concept Unit: Enabling View Binding

### The Problem

Java's Lesson 13 already showed View Binding's shape once, as an
alternative: a `buildFeatures { viewBinding true }` addition to
`build.gradle`, generating a class named after each layout file. That
project never actually turned it on. This one will — starting with the
Gradle change itself.

### Project Change

- **Reference Source:** Android Gradle Plugin's `buildFeatures` DSL —
  the same feature Java's Lesson 13 cited, here configured through
  Kotlin's Gradle DSL (`build.gradle.kts`) rather than the Groovy DSL
  (`build.gradle`) that project used, since a Kotlin-language Android
  Studio project generates a `.kts` Gradle file by default.
- **Files affected:** `app/build.gradle.kts`.
- **Change type:** Add a `buildFeatures` block inside the existing
  `android { }` block.
- **Location:** Inside `android { }`, alongside the existing
  `compileSdk`/`defaultConfig` entries the wizard already generated.
- **Dependencies:** None new — View Binding ships as part of the Android
  Gradle Plugin already applied to every project; nothing new to add to
  `dependencies { }`.

### The New Code

```kotlin
buildFeatures {
    viewBinding = true
}
```

### The Updated Project

```kotlin
android {
    namespace = "com.yourname.yourapp"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.yourname.yourapp"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    buildFeatures {
        viewBinding = true      // ← new
    }
}
```

`android { }` now declares one more capability for this module: generate
a typed binding class for every layout file, the moment the project next
builds.

### Mechanical Walkthrough

- `viewBinding = true` — **first appearance of Kotlin's Gradle DSL
  syntax specifically.** Notice the `=` — Java's Lesson 13 wrote the
  equivalent Groovy-DSL line as `viewBinding true`, no `=` at all, because
  Groovy allows a method call to drop its parentheses and read like a
  property assignment. Kotlin's Gradle DSL is real Kotlin code (this
  entire file is a `.kts` — Kotlin script — file), and `viewBinding` here
  really is a settable Kotlin property, using the exact `propertyName =
  value` property-assignment syntax already met on every `var` this
  series has declared since Lesson 03 — not a new syntax rule, the same
  one, reused on a build-configuration object instead of a `Lightbulb`.

---

## Concept Unit: `lateinit var` — a Non-Null Property Started Empty

### The Problem

`ActivityMainBinding` — the class View Binding is about to generate —
can't exist until `onCreate` actually runs and inflates the layout. That
means `MainActivity` needs a field to hold it, declared before
`onCreate` runs, but with no real value available yet at the point it's
declared. Lesson 02 already has a tool for "no value yet" —
`ActivityMainBinding?`, a nullable type — but that would force `?.` or a
null check on every single line that ever touches `binding` for the rest
of the class's life, even though, in practice, every one of those lines
runs safely *after* `onCreate` has already set it.

### Introduce the Concept in Isolation

```kotlin
class Screen {
    lateinit var title: String

    fun show() {
        println("Showing: " + title)
    }
}

fun main() {
    val screen = Screen()
    screen.show()
}
```

Compile and run:

```
kotlinc LateinitDemo.kt -include-runtime -d LateinitDemo.jar
java -jar LateinitDemo.jar
```

Real output, from running this just now:

```
Exception in thread "main" kotlin.UninitializedPropertyAccessException: lateinit property title has not been initialized
	at Screen.getTitle(LateinitDemo.kt:2)
	at Screen.show(LateinitDemo.kt:5)
	at LateinitDemoKt.main(LateinitDemo.kt:11)
	at LateinitDemoKt.main(LateinitDemo.kt)
```

`title` is declared `String` — plain, non-nullable, no `?` anywhere —
and yet the class compiled with no value ever assigned to it. The
`lateinit` modifier is a promise to the compiler: "trust me, this will
be assigned before anything reads it — don't require a value right now,
and don't require `?`/`?.` on every future read either." The compiler
takes that promise at face value, the same way it took `!!`'s promise at
face value in Lesson 02 — and when the promise turns out false, Kotlin
throws a real, specific exception the moment the unassigned property is
actually read, naming the exact property by name:
`UninitializedPropertyAccessException: lateinit property title has not
been initialized`. Assign it first and the same code runs cleanly:

```kotlin
fun main() {
    val screen = Screen()
    screen.title = "Home"
    screen.show()
}
```

Real output, from running this just now:

```
Showing: Home
```

### Discard the Throwaway Example

`Screen` is deleted. `lateinit var` reappears immediately, for real, on
`MainActivity`'s own `binding` field, in the next unit.

### CS Lens

`lateinit` is a real, if narrower, escape hatch from the same tradeoff
Lesson 02's `!!` made — trading a compile-time guarantee for a runtime
one — but it is not identical to `!!`, and comparing the two exceptions
directly shows why: `!!`'s crash in Lesson 02 was a bare
`java.lang.NullPointerException`, no message at all. `lateinit`'s crash
here names the exact property that wasn't ready
(`UninitializedPropertyAccessException: lateinit property title has not
been initialized`). Both are "trust me" escape hatches from null safety;
only one of them stays honest about *what* went wrong when the trust
turns out to be misplaced.

### SE Lens

**Why does Kotlin provide a whole separate keyword for this instead of
just telling everyone to use a nullable type and check it?** A `binding:
ActivityMainBinding?` field would be technically safe, but every single
line of `MainActivity`'s code — dozens of them, for the rest of this
series — would need `binding?.usernameField` or `binding!!.usernameField`
repeated forever, for a case (reading `binding` before `onCreate` sets
it) that never actually happens in this project's real control flow.
`lateinit` names that exact, common shape directly — "always assigned
before use, just not at declaration time" — and lets ordinary code read
`binding.usernameField` with no `?` anywhere, at the honest cost that
getting the *timing* wrong produces a real, named crash rather than a
compile error. This is the same tradeoff every escape hatch in this
series makes, evaluated case by case: `lateinit` earns its keep here
because the "assigned before read" promise is genuinely easy to keep for
a field set at the very top of `onCreate`, before anything else in the
class runs.

---

## Concept Unit: Using the Binding — `inflate`, `.root`, and Direct Field Access

### The Problem

View Binding's generated class exists once `buildFeatures.viewBinding`
is on and the project builds — Java's Lesson 13 already showed its
shape (`ActivityMainBinding`, one typed field per `android:id`). What's
left is wiring `MainActivity` itself to actually create and use one,
replacing `setContentView(R.layout.activity_main)` and every
`findViewById` call this series would otherwise have needed.

### Project Change

- **Reference Source:** `ViewBinding.inflate`/`.getRoot()` — the same
  generated-class shape Java's Lesson 13 cited from Android's View
  Binding documentation, called here from Kotlin instead of Java.
- **Files affected:** `MainActivity.kt`.
- **Change type:** Add a field; replace the body of `onCreate`.
- **Location:** `binding` declared inside the class body, before
  `onCreate`; the `setContentView` line inside `onCreate` replaced.
- **Dependencies:** `buildFeatures.viewBinding = true`, already enabled
  above; a layout file `activity_main.xml` with real `android:id`
  attributes (the wizard's default template already has one).

### The New Code

```kotlin
private lateinit var binding: ActivityMainBinding

binding = ActivityMainBinding.inflate(layoutInflater)
setContentView(binding.root)
```

### The Updated Project

```kotlin
package com.yourname.yourapp

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.yourname.yourapp.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding      // ← new

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)  // ← new
        setContentView(binding.root)                            // ← new
    }
}
```

`onCreate` no longer calls `setContentView(R.layout.activity_main)`
directly — it builds a real `ActivityMainBinding` first, and hands that
binding's root view to `setContentView` instead.

### Mechanical Walkthrough

- `private lateinit var binding: ActivityMainBinding` — **`private`**
  and **field declaration** are both already established from Java's
  Lesson 13 and this series' own Lesson 03; **`lateinit var`** is this
  lesson's own concept, just proven above, now applied for real.
- `ActivityMainBinding.inflate(layoutInflater)` — **first appearance of
  `.inflate(...)` as a real call.** `inflate` is a `static`-style method
  (called on the class itself, `ActivityMainBinding`, not on an existing
  instance — the same idea as Lesson 01's `static`, now met on a
  framework-generated class instead of `main`) that reads the layout XML,
  builds every widget it describes, and returns one fully-populated
  `ActivityMainBinding` object — one single object holding a typed field
  for every `android:id` in `activity_main.xml`, exactly as Java's Lesson
  13 already described the class's *shape*; this is that same class,
  actually built.
- `layoutInflater` — **first appearance of a synthetic property from
  Java interop.** `AppCompatActivity`'s real ancestor, `Activity`, is
  written in Java and declares a method `getLayoutInflater()`, following
  Java's own getter-naming convention. Kotlin recognizes any Java method
  pair matching that convention (`getX()`, optionally with a matching
  `setX(...)`) and exposes it to Kotlin code as a plain property named
  `x` — here, `layoutInflater`, with no parentheses and no explicit call.
  Reading `layoutInflater` compiles to exactly the same
  `getLayoutInflater()` call a Java caller would write directly; Kotlin
  is not skipping the method, only letting you spell the call as a
  property read.
- `binding.root` — **first appearance of `.root`.** Every generated View
  Binding class exposes one property named `root`: the single top-level
  `View` the whole layout file is built from underneath everything else
  — the same object `findViewById`'s Java version would have reached by
  calling `setContentView(R.layout.activity_main)` directly, just now
  reached through the binding instead of a resource ID.
- `setContentView(binding.root)` — **reappearing**, the same method
  Java's Lesson 07 already established (told the `Activity` which real
  `View` tree to actually display), called here with a `View` object
  directly instead of a `R.layout.*` resource ID — a different overload
  of the exact same method, doing the exact same job.

### SE Lens

**Why does this series adopt View Binding as the default, when Java's
Lesson 13 deliberately chose `findViewById` specifically because seeing
the real generic-method mechanism mattered?** That reasoning was correct
for its own moment — this series already spent Java's Lesson 13 proving
`<T extends View>` for real, and this lesson doesn't need to re-earn
that lesson. What's different here is the risk `findViewById` still
carried even with generics: a *wrong ID*, of the *same* view type,
compiling perfectly and failing only at runtime — exactly the silent bug
Java's Lesson 13 demonstrated on purpose by swapping two `EditText`
fields. `binding.usernameField` and `binding.passwordField` are two
genuinely different, independently named properties; there is no ID
argument to accidentally transpose, because there's no ID argument at
all. The cost is the one already named back in Lesson 13: a small Gradle
configuration change, and a generated class whose fields never appear
anywhere in this project's own source code.

---

## Connect the Pieces

One trace through this lesson: `buildFeatures { viewBinding = true }`
told the Android Gradle Plugin to generate `ActivityMainBinding` from
`activity_main.xml`. `private lateinit var binding: ActivityMainBinding`
declared a field for it that starts genuinely unassigned — proven safe
by this lesson's own `lateinit` lab, and specifically *not* the bare-NPE
risk Lesson 02's `!!` carries, because reading it too early throws a
named exception instead. `ActivityMainBinding.inflate(layoutInflater)`
built the real object — `layoutInflater` itself reached through a
synthetic property standing in for a Java getter — and `binding.root`
handed `setContentView` the exact same real view tree
`R.layout.activity_main` would have, just reached through a typed
binding instead of a resource ID.

## What Breaks Without This

Comment out the line assigning `binding` — leave `lateinit var binding:
ActivityMainBinding` declared, but never call `.inflate(...)` — and try
to read `binding.root` on the next line anyway. When you run this
yourself: the app crashes immediately on launch with
`kotlin.UninitializedPropertyAccessException: lateinit property binding
has not been initialized`, in Logcat, at the exact line that read
`binding` first — the same named exception this lesson's own disposable
`Screen` example already proved, now happening for real, in the actual
project. Restore the `.inflate(...)` line before moving on.

## Exercises

1. Add a second `lateinit var` field to the disposable `Screen` example
   from this lesson, `lateinit var subtitle: String`, and read it inside
   `show()` before assigning it, while `title` *is* assigned first.
   Confirm the exception names `subtitle` specifically, not `title` —
   proof the check happens per-property, not once for the whole object.
2. In the real project, temporarily change `binding.root` to
   `binding.usernameField` (the wrong property, if `usernameField` isn't
   itself the layout's root view) and pass that to `setContentView`.
   Run it and observe what actually happens — connect the result back to
   this unit's explanation of what `.root` specifically means.

## Definition of Done

- [ ] A real Kotlin Android Studio project exists, package name
      confirmed against its real folder path (same check Java's Lesson
      05 taught, now performed on a Kotlin project).
- [ ] `buildFeatures.viewBinding = true` is set, and the project builds
      successfully with an `ActivityMainBinding` class generated.
- [ ] You ran the `lateinit` lab yourself and saw the real
      `UninitializedPropertyAccessException`, naming the exact property.
- [ ] You can explain, precisely, why `binding` is declared `lateinit
      var` instead of `ActivityMainBinding?`.
- [ ] You can name what `layoutInflater` actually calls underneath, and
      why Kotlin lets you read it without parentheses.
- [ ] You triggered the real crash from reading `binding` before
      `.inflate(...)` runs, then restored the correct order.
- [ ] Commit: `git commit -m "Wire MainActivity to View Binding instead
      of findViewById"` — explaining why View Binding was the chosen
      default here, not just the fact that it's used.

Next: `MainActivity.kt`'s own `: AppCompatActivity()` and `override fun
onCreate` — Kotlin's answer to Java's `extends`/`@Override`, and a
default this series hasn't mentioned yet: Kotlin classes can't be
inherited from at all unless you say so.
