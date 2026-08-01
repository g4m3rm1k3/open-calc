# Lesson 07: `TextView`, String Resources, and String Templates

**What you will build:** The login screen's real title, username field,
and password field — the exact widgets Java's Lessons 09 and 10 built —
plus this series' first genuinely new Kotlin language feature since
Lesson 03: string templates, introduced properly in isolation and then
used in place of the string concatenation Java's own Lesson 13 later
had to write by hand. The transferable problem: `TextView`, string
resources, and `EditText`'s `inputType` attribute are all pure XML and
Android resource-system concepts, completely untouched by which
language `MainActivity` is written in — but the moment any of this
project's Kotlin code needs to build a message out of more than one
piece of text, a real Kotlin-specific choice appears for the first time
since Lesson 03.

**What you need to know first:** Java's Lesson 09 (`TextView`, string
resources, `@string/...`, `wrap_content`, `sp`) and Lesson 10
(`EditText extends TextView`, `inputType`, `hint`, the `textPassword`
vs. `numberPassword` tradeoff) — both fully unchanged by language and
not re-taught here. This series' Lesson 06 (the empty `LinearLayout`
these widgets fill). Java's Lesson 13, which needed a temporary debug
line built with string concatenation (`"username field currently
shows: " + usernameField.getHint()`) — the exact line this lesson's own
string-template unit answers directly.

**Terms introduced in this lesson:**
- **String template** — a string literal containing `$name` or
  `${expression}`, evaluated and substituted into the string at the
  point it's created, replacing Java's `+`-based concatenation.

---

## Concept Unit: `TextView`, String Resources, and `EditText` — Unchanged

### The Problem

Confirm, directly, that nothing about Java's Lesson 09 and Lesson 10
reasoning depended on Java specifically: string resources exist to
separate translatable text from the layouts and code that display it — a
resource-system decision, not a language one — and `EditText`'s
`inputType` attribute controls keyboard and masking behavior at the XML
level, resolved entirely by Android's resource system before any
Kotlin or Java code ever runs.

### The New Code

In `strings.xml`:

```xml
<string name="login_title">Welcome Back</string>
<string name="username_hint">Username</string>
<string name="password_hint">Password</string>
```

In `activity_main.xml`, inside the `LinearLayout` from Lesson 06:

```xml
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@string/login_title"
    android:textSize="24sp" />

<EditText
    android:id="@+id/usernameField"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:hint="@string/username_hint" />

<EditText
    android:id="@+id/passwordField"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:hint="@string/password_hint"
    android:inputType="textPassword" />
```

### Project Change

- **Reference Source:** No reference counterpart — the same layout and
  string-resource additions Java's Lessons 09 and 10 already authored
  and justified in full; reused here verbatim.
- **Files affected:** `app/src/main/res/values/strings.xml`,
  `app/src/main/res/layout/activity_main.xml`.
- **Change type:** Add three string entries; add three child views.
- **Location:** Inside `<resources>`; inside the root `LinearLayout`,
  in order (title, then username, then password).
- **Dependencies:** None new.

### The Updated Project

`activity_main.xml` in full:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="24dp">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/login_title"
        android:textSize="24sp" />

    <EditText
        android:id="@+id/usernameField"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="@string/username_hint" />

    <EditText
        android:id="@+id/passwordField"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="@string/password_hint"
        android:inputType="textPassword" />

</LinearLayout>
```

The container from Lesson 06 now holds a title and two real, distinctly
`id`'d input fields, stacked top to bottom.

### Mechanical Walkthrough

Every element here is a direct, unchanged reuse: `TextView` (a leaf
`View` displaying text), `@string/...` resource references, `wrap_content`
and `sp` as sizing units, `EditText extends TextView` (the same
inheritance relationship Lesson 05 just finished proving the mechanics
of, here on a real two-level framework hierarchy instead of a lab),
`hint`, and `inputType="textPassword"` chosen over `numberPassword` for
exactly the usability reason Java's Lesson 10 already gave — a general
password isn't guaranteed numeric-only. Nothing in this list is new;
each one is Java's Lesson 09/10 concept, confirmed unchanged.

---

## Concept Unit: String Templates

### The Problem

Java's Lesson 13 needed a temporary debug line to inspect a field's
state: `Log.d("MainActivity", "username field currently shows: " +
usernameField.getHint());` — building one string out of a literal
prefix and a value read from an object, glued together with `+`. Kotlin
inherited `+` for strings too — it works identically — but building
strings this way, piece by piece, gets harder to read fast as more
pieces get added, and Kotlin has a different, more direct tool for
exactly this job.

### Introduce the Concept in Isolation

```kotlin
fun main() {
    val name = "Kotlin"
    val count = 3

    println("Hello, " + name + "! You have " + count + " messages.")
    println("Hello, $name! You have $count messages.")
    println("Next count: ${count + 1}")
    println("Uppercase: ${name.uppercase()}")
}
```

Compile and run:

```
kotlinc Templates.kt -include-runtime -d Templates.jar
java -jar Templates.jar
```

Real output, from running this just now:

```
Hello, Kotlin! You have 3 messages.
Hello, Kotlin! You have 3 messages.
Next count: 4
Uppercase: KOTLIN
```

The first two lines produce identical output from two different
sources: the first is ordinary `+` concatenation, working exactly as it
does in Java. The second is a **string template**: writing `$name`
directly inside a string literal substitutes that variable's value at
exactly that position, with no `+` anywhere. `${count + 1}` shows the
more general form — any curly-brace-wrapped expression, not just a bare
variable name, is evaluated and substituted; `${name.uppercase()}` shows
this extends to a full method call, not just arithmetic. `$name` is
really shorthand for `${name}` in the single-variable case; the braces
are only required once the contents are more than a single simple name.
One more real behavior worth confirming directly, since a literal `$`
inside a string might look like it starts a template by accident:

```kotlin
println("A literal dollar sign: \$name")
```

Real output, from running this just now:

```
A literal dollar sign: $name
```

`\$` escapes the dollar sign itself, printing it literally rather than
starting a template — the same backslash-escape mechanism Java already
uses for `\"` or `\n`, applied here to a character that has special
meaning specifically inside a Kotlin string.

### Discard the Throwaway Example

`Templates.kt` is deleted. String templates are used for the rest of
this series wherever more than one piece of text needs combining — the
default tool, not a special case.

### Project Change — Applying It to Java's Lesson 13 Debug Line

- **Reference Source:** No reference counterpart — this is a temporary
  diagnostic line, the same kind Java's Lesson 13 added and later
  removed, not a permanent feature.
- **Files affected:** `MainActivity.kt`.
- **Change type:** Add one temporary line (to be removed before this
  lesson's Definition of Done, exactly as Java's Lesson 13 removed its
  own equivalent line).
- **Location:** Inside `onCreate`, after `binding.usernameField` exists
  (i.e., after the `ActivityMainBinding.inflate(...)` call from Lesson
  04).
- **Dependencies:** None new.

### The New Code

```kotlin
Log.d("MainActivity", "username field currently shows: ${binding.usernameField.hint}")
```

### The Updated Project

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    binding = ActivityMainBinding.inflate(layoutInflater)
    setContentView(binding.root)
    Log.d("MainActivity", "username field currently shows: ${binding.usernameField.hint}")  // ← new, temporary
}
```

### Mechanical Walkthrough

- `Log.d("MainActivity", ...)` — genuinely basic, already established
  from Java's own series (Logcat, the debug-level log call, the tag
  argument) — completely unchanged by language.
- `"username field currently shows: ${binding.usernameField.hint}"` —
  **first appearance of a template in real project code.** `${...}`
  wraps a real expression: `binding.usernameField` — the generated View
  Binding property from Lesson 04, reached with no `findViewById` call
  at all — followed by `.hint`, another synthetic property (this
  series' Lesson 04 concept) standing in for `EditText`'s underlying
  Java getter for its hint text. The whole expression is evaluated once,
  substituted into the string, with no manual `+` anywhere — directly
  comparable to, and shorter than, Java's own `"username field currently
  shows: " + usernameField.getHint()`.

### SE Lens

**Why does a small readability improvement like this deserve to be
called out as a real language feature, rather than dismissed as sugar?**
Java's version has a real, if minor, correctness risk `+`-concatenation
carries as more pieces get added: mismatched parentheses around a
multi-part expression, or an easy-to-miss missing `+` between two
literals, both of which are genuine, common typos in long concatenated
lines. A string template keeps every literal piece of text exactly where
it visually reads, with only the *substituted* parts marked out — the
structure of the final string is visible directly in the source, rather
than reconstructed mentally from a chain of `+` operators. The cost is
almost entirely one of unfamiliarity for a reader coming from Java, which
is exactly why this lesson introduced it in isolation before using it for
real.

---

## Connect the Pieces

One trace: `strings.xml` and `activity_main.xml` gained a title and two
real input fields, using nothing but Java's already-proven Lesson
09/10 mechanisms, confirming the resource system doesn't care what
language reads it. `binding.usernameField` (Lesson 04) then reached the
new username field with no lookup call, and a string template —
`${binding.usernameField.hint}` — substituted its hint text directly
into a debug log line, doing in one readable expression what Java's
Lesson 13 needed a `+`-concatenated line to do.

## What Breaks Without This

Temporarily remove the closing `}` from `${binding.usernameField.hint}`,
leaving `$binding.usernameField.hint` with no braces at all, and try to
build.

Real output, from running this just now:

```
Templates2.kt:5:60: warning: this expression would evaluate to a different value if the '$' operand were interpreted as a template expression, wrap it into '${ }' to be explicit
    println("username: $binding.usernameField.hint")
                        ^
```

This compiles — with a warning, not an error — but does something
genuinely different from what was intended: `$binding` alone substitutes
just `binding` (calling its default string representation), and
`.usernameField.hint` after it is parsed as ordinary literal text
appended afterward, not as part of the substitution at all. This is a
real, easy mistake once an expression has more than one part: `$x.y`
without braces only ever substitutes `x`, never `x.y`. Restore the
braces before moving on, and remove the entire temporary log line before
this lesson's Definition of Done, exactly as Java's Lesson 13 removed
its own.

## Exercises

1. Rewrite the debug log line using plain `+` concatenation instead of a
   template, matching Java's Lesson 13 line as closely as Kotlin's
   syntax allows. Confirm it produces identical output to the template
   version, then delete it — the template version is what actually
   stays.
2. Add a second temporary log line combining three pieces: a literal
   prefix, `binding.usernameField.hint`, and `binding.passwordField.hint`,
   in one single string template. Confirm it prints correctly, then
   remove it.
3. Deliberately write `"$name.uppercase()"` (calling a method without
   wrapping it in `${}`) against any string variable and observe that it
   prints the variable's raw value followed by the literal text
   `.uppercase()` — direct, hands-on proof of exactly the mistake this
   lesson's own "What Breaks" section described.

## Definition of Done

- [ ] The login screen shows a real title, a plain username field, and a
      masked password field, matching Java's Lesson 09/10 exactly.
- [ ] You ran the string-template lab yourself and can state the
      difference between `$name` and `${expression}`, including when the
      braces are actually required.
- [ ] You triggered the missing-braces warning yourself and can explain,
      precisely, what `$x.y` with no braces actually substitutes.
- [ ] The temporary debug log line has been removed — this lesson's
      addition to `MainActivity.kt`, like Java's Lesson 13 own debug
      line, was diagnostic only, not a permanent feature.
- [ ] Commit: `git commit -m "Add login title and input fields; use
      string templates over concatenation for the temporary debug log"`.

Next: making the two buttons this login screen still needs actually do
something when tapped — Kotlin lambdas, and exactly how much of Java's
interface-and-anonymous-class machinery they replace.
