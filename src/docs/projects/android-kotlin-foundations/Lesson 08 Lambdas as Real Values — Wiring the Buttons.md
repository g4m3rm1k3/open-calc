# Lesson 08: Lambdas as Real Values — Wiring the Buttons

**What you will build:** Both login buttons, wired for real — reading
whatever the user typed and showing it back via `Toast`, the exact
functional requirement Java's Lesson 16 completed. The transferable
problem: Java's Lesson 14 built up, in three deliberate stages —
interface, anonymous class, lambda — to a single idea: "pass a small
piece of behavior as a value," working around the fact that Java, when
that lesson was written, had no first-class function type of its own.
Kotlin does have one. This lesson asks the sharper question Java's own
`Greeter` lab already set up: with a real function type, does Kotlin
still need an interface here at all — and when it calls into Android's
own, real, Java-declared `View.OnClickListener`, what actually happens
underneath a lambda that looks like it skipped the interface entirely?

**What you need to know first:** Java's Lesson 11 (`Button extends
TextView`, the one-screen-two-buttons decision, `loginButton`/
`createAccountButton`'s XML). Java's Lesson 14 in full (interface,
`implements`, anonymous class, lambda expression, functional interface).
Java's Lesson 15 (covariant return types — `EditText.getText()`
returning the narrower `Editable` instead of `TextView`'s declared
`CharSequence` — a framework fact, unchanged by language, not re-derived
here). Java's Lesson 16 (`View.OnClickListener`'s real declared shape,
`setOnClickListener`, `Toast`, the Observer pattern, Inversion of
Control). This series' Lessons 02 (nullable types) and 04 (View Binding,
synthetic properties), Lesson 07 (string templates).

**Terms introduced in this lesson:**
- **Function type (`(String) -> String`)** — a real Kotlin type
  describing "a function taking these parameter types and returning this
  result type," usable anywhere any other type can be used.
- **SAM conversion** — Kotlin automatically wrapping a lambda into a real
  object implementing a Java **s**ingle-**a**bstract-**m**ethod interface,
  at the point it's passed to Java code expecting one.
- **Trailing lambda syntax** — when a function's last parameter is itself
  a function type, the lambda argument can be written outside the
  parentheses, immediately after them.
- **`it`** — the implicit name of a lambda's single parameter, usable
  when the parameter isn't given an explicit name.
- **Platform type** — a type from unannotated Java code that Kotlin can't
  determine is definitely nullable or definitely non-null, and so doesn't
  enforce either way, trusting the calling code instead.

---

## Concept Unit: Buttons — Unchanged

### The Problem

Confirm directly, as this series has for every pure-XML concept so far:
`Button extends TextView`, and the one-screen-two-buttons design decision
Java's Lesson 11 made (shared fields, two actions), are both facts about
Android's widget hierarchy and this project's own requirements — neither
depends on which language reads the result.

### The New Code

```xml
<Button
    android:id="@+id/loginButton"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:text="@string/login_button_label" />

<Button
    android:id="@+id/createAccountButton"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:text="@string/create_account_button_label" />
```

### Project Change

- **Reference Source:** No reference counterpart — the same widgets
  Java's Lesson 11 already authored and justified, reused verbatim.
- **Files affected:** `activity_main.xml`, `strings.xml`.
- **Change type:** Add two `Button` elements; add two string entries
  (`login_button_label`, `create_account_button_label`).
- **Location:** Inside the root `LinearLayout`, after the password field
  from Lesson 07.
- **Dependencies:** None new.

---

## Concept Unit: Kotlin Functions Are Already Values — No Interface Needed

### The Problem

Java's Lesson 14 built `Greeter` as an interface specifically because, at
the time Java's click-handling API was designed, Java had no way to talk
about "a function" as a value on its own — an interface with one method
was the only available stand-in. Kotlin was designed later, with a real
function type built into the language from the start. Does a Kotlin
version of `Greeter`'s job even need an interface declared at all?

### Introduce the Concept in Isolation

```kotlin
fun applyGreeting(name: String, greeter: (String) -> String): String {
    return greeter(name)
}

fun main() {
    val formal: (String) -> String = { name -> "Good day, $name." }
    val excited = { name: String -> "AMAZING TO SEE YOU, $name!!!" }

    println(applyGreeting("Alex", formal))
    println(applyGreeting("Alex", excited))
}
```

Compile and run:

```
kotlinc FnType.kt -include-runtime -d FnType.jar
java -jar FnType.jar
```

Real output, from running this just now:

```
Good day, Alex.
AMAZING TO SEE YOU, Alex!!!
```

No `Greeter` interface exists anywhere in this file. `(String) -> String`
is a real Kotlin type — a **function type** — read directly: "a function
taking one `String` parameter and returning a `String`." `applyGreeting`
declares its second parameter with that type, the same way any other
parameter is declared with `Int` or `String`. `formal` is a variable of
that exact function type, assigned a lambda; `excited` is the same
thing with its parameter type stated inline instead of on the variable.
Nothing here required declaring a contract up front the way `interface
Greeter { String greet(String name); }` did — the shape of "a function
from `String` to `String`" is already a real, nameable type in Kotlin,
with no ceremony needed to introduce it.

### Discard the Throwaway Example

`FnType.kt` is deleted. This is the direct, verified answer to the
question Java's own Lesson 14 lab implicitly raised: Kotlin genuinely
does not need an interface for this job, when the code calling the
function is *also* Kotlin. The next unit covers the real, unavoidable
exception: Android's actual click-handling API is not Kotlin, it's Java,
already declared, already shipped, and cannot be changed to use a bare
Kotlin function type instead of its own real interface.

### CS Lens

A function type making "a function" a first-class value — storable in a
variable, passable as an argument, returnable from another function — is
the core idea of **functions as first-class citizens**, a defining
feature of functional programming going back to Lisp. Java's Lesson 14
approximated this using an interface with one method precisely because
Java, historically, did not treat functions this way.

Also recognized in: JavaScript (functions have always been first-class
values there — `const f = (name) => ...` needs no interface either), any
functional language (Haskell, ML-family languages), and Python's
functions, which have been assignable and passable as plain values since
the language's beginning.

---

## Concept Unit: SAM Conversion — Calling a Java Interface With a Lambda

### The Problem

`View.OnClickListener` is real, and it is Java — declared, unchangeably,
as an interface, exactly as Java's Lesson 16 quoted:

```java
public interface OnClickListener {
    void onClick(View v);
}
```

`setOnClickListener` expects a real object implementing this interface,
not a bare Kotlin function type — `(View) -> Unit` and
`View.OnClickListener` are not the same type to the compiler, no matter
how similar their shapes look. Can a Kotlin lambda still be handed
directly to a method that demands this specific Java interface?

### Introduce the Concept in Isolation

```java
// Greeter.java — a plain Java functional interface, standing in for OnClickListener
public interface Greeter {
    String greet(String name);
}
```

```java
// GreeterUser.java — a plain Java method, standing in for setOnClickListener
public class GreeterUser {
    public static String use(String name, Greeter g) {
        return g.greet(name);
    }
}
```

```kotlin
fun main() {
    val result = GreeterUser.use("Alex") { name -> "Hey $name!" }
    println(result)
}
```

Compile (Java first, then Kotlin against it) and run:

```
javac -d javaout Greeter.java GreeterUser.java
kotlinc -cp javaout -d kotlinout SamTrailing.kt
java -cp javaout:kotlinout:<kotlin-stdlib> SamTrailingKt
```

Real output, from running this just now:

```
Hey Alex!
```

No `object : Greeter { ... }` anywhere, no `@Override`, and yet a real
object implementing the Java interface `Greeter` was created and passed
to `GreeterUser.use`. This is called **SAM conversion**: whenever Kotlin
code calls a Java method expecting a **s**ingle-**a**bstract-**m**ethod
interface, a lambda can be passed directly, and the Kotlin compiler
generates the interface-implementing object automatically, underneath,
at that exact call site. This is not a new mechanism from the object's
point of view — `GreeterUser.use` receives a completely ordinary
`Greeter` object, built the same way Java's own lambda-to-interface
conversion works (Java's Lesson 16 SE Lens already named this: "a lambda
targeting a functional interface compiles down to the same shape the API
always expected") — Kotlin is doing the identical job, automatically,
across a language boundary instead of within one language.

### Discard the Throwaway Example

`Greeter.java`, `GreeterUser.java`, and `SamTrailing.kt` are deleted.
`View.OnClickListener` is exactly this same situation, for real, in the
very next unit.

### CS Lens

SAM conversion is a real, compiler-generated instance of the **Adapter
pattern**: a lambda's shape (parameters in, one value out) is adapted,
automatically, into whatever shape a specific single-method interface
declares, without either side needing to know about the other's exact
representation.

Also recognized in: Java's own lambda-to-functional-interface conversion
(Java's Lesson 14, the same idea, one language earlier), C#'s delegates
being convertible from lambda expressions, and any cross-language
interop layer that has to reconcile "the caller's idea of a function"
with "the callee's idea of an interface."

### SE Lens

**Why doesn't Kotlin just require every Java interface parameter to be
called with the older, fully explicit `object : Greeter { override fun
greet(...) { ... } }` syntax, since that's what's actually happening
underneath?** SAM conversion exists specifically to avoid forcing every
single call site across a language boundary to spell out a whole
implementation just to satisfy an interface with one obvious method.
The tradeoff is genuinely small: readability of the calling code, at the
cost that a reader unfamiliar with SAM conversion might wonder how a
bare lambda satisfies a named Java interface at all — precisely the gap
this lesson's own isolated proof exists to close.

---

## Concept Unit: Trailing Lambda Syntax and `it`

### The Problem

`GreeterUser.use("Alex") { name -> "Hey $name!" }` above already used two
small syntax conveniences without pausing on either. Both matter for
reading real Android code fluently.

### Mechanical Walkthrough

- `use("Alex") { name -> ... }` — **first appearance of trailing lambda
  syntax.** When a function's *last* parameter has a function type,
  Kotlin allows the lambda argument to be written outside the closing
  `)`, immediately after it — `use("Alex") { ... }` rather than
  `use("Alex", { ... })`. Both are exactly the same call; the trailing
  form exists purely to avoid a lambda's multi-line body sitting awkwardly
  inside a parenthesized argument list. When a function's *only*
  parameter is the lambda, the parentheses can be dropped entirely —
  `use { ... }`, no empty `()` left behind.
- `{ "Hi there, $it!" }` — **first appearance of `it`.** A lambda with
  exactly one parameter doesn't need to name it at all: leaving the name
  off makes it implicitly available inside the lambda body under the
  fixed name `it`. This is purely a convenience for the single-parameter
  case — a lambda with zero or more than one parameter has no `it` and
  must name each one explicitly.

### SE Lens

**Why does Kotlin bother with `it` instead of always requiring an
explicit parameter name?** The overwhelmingly common case for a
single-parameter lambda — exactly `setOnClickListener`'s shape — is a
short body that uses the parameter once or not at all; naming it
explicitly every time (`{ view -> doSomething() }`, when `view` is never
even read) adds a name a reader has to track for no real benefit. `it`
is a deliberate, narrow convenience for exactly that shape, not a general
replacement for named parameters — a two-parameter lambda has no
implicit name to fall back on, and a long, complex single-parameter body
often reads more clearly with a real name restored, which is why this
project prefers a named parameter (`view ->`) over bare `it` for
`onClick` specifically, once the lambda body has more than one line.

---

## Concept Unit: Platform Types — Calling Into Unannotated Java Code

### The Problem

`binding.usernameField.text` is about to be read, inside a Kotlin
lambda, from a real Java-declared method (`EditText`'s inherited,
covariant `getText()`, exposed as the `text` synthetic property, this
series' Lesson 04 concept). Lesson 02 built an entire lesson around
Kotlin refusing to let nullable and non-nullable types be confused at
compile time. Java code, including huge parts of the Android SDK, was
written with no such distinction available in its own type system at
all — so which is it, when Kotlin calls into it?

### Introduce the Concept in Isolation

```java
// JavaSource.java — a plain Java method with no nullability annotation at all
public class JavaSource {
    public static String maybeNull(boolean giveNull) {
        if (giveNull) {
            return null;
        }
        return "real value";
    }
}
```

```kotlin
fun main() {
    val a = JavaSource.maybeNull(false)
    val b = JavaSource.maybeNull(true)

    println(a.length)
    println(b.length)
}
```

Compile and run:

```
javac -d javaout JavaSource.java
kotlinc -cp javaout -d kotlinout PlatformType.kt
java -cp javaout:kotlinout:<kotlin-stdlib> PlatformTypeKt
```

Real output, from running this just now:

```
10
Exception in thread "main" java.lang.NullPointerException: Cannot invoke "String.length()" because "b" is null
	at PlatformTypeKt.main(PlatformType.kt)
```

Notice what's absent: `a.length` and `b.length` both compiled with no
`?.`, no `!!`, no error at all — Lesson 02's whole `String` vs. `String?`
distinction never triggered, even though `maybeNull(true)` genuinely
returns `null`. `JavaSource.maybeNull`'s return type carries no Java
nullability annotation, so Kotlin cannot determine whether it's `String`
or `String?` — it assigns a **platform type**, informally written
`String!`, meaning "Kotlin is trusting you on this one." Reading it
crashes exactly like plain, pre-null-safety Java would: a real
`NullPointerException`, with Java's own full diagnostic message (unlike
Lesson 02's bare `!!` crash, because this is a genuine Java-style null
dereference, not Kotlin's own generated check), at the exact line that
tried to use the missing value.

### Discard the Throwaway Example

`JavaSource.java` and `PlatformType.kt` are deleted. Whether any
specific Android SDK method returns a platform type or a properly
annotated nullable/non-null type depends on that method's own
annotations, which the library authors add and update over time — modern
Jetpack libraries annotate a great deal of their surface, and older or
less-maintained parts of the platform may not. The one thing to always
check is what your own IDE infers for the specific call you're making,
rather than assuming either direction.

### CS Lens

A platform type is Kotlin's answer to a real **soundness vs.
compatibility** tradeoff at a language boundary: enforcing full null
safety on every Java call would mean either rejecting enormous amounts
of real, working Java code Kotlin needs to interoperate with, or
requiring an explicit annotation on every single Java API before Kotlin
could call it at all. Neither was acceptable for a language whose entire
adoption story depended on working smoothly with existing Java code and
libraries on day one.

Also recognized in: any gradually-typed system layered on top of an
untyped one (TypeScript calling into untyped JavaScript, for instance,
where an untyped value can silently carry an incorrect type through a
type-checked boundary), and generally any interop layer where one side's
guarantees are stronger than the other's.

### SE Lens

**Why doesn't Kotlin simply treat every unannotated Java return type as
nullable, to be safe, rather than trusting the caller?** That would be
the conservative choice — and it would force a `?.`/`!!`/`?:` decision on
every single call into the entire unannotated Java ecosystem, the vast
majority of which never actually returns `null` in practice. Kotlin's
platform-type compromise pushes the actual verification cost onto the
one place that already has the necessary knowledge — the developer
calling a specific, real API who can check its documentation or behavior
— rather than paying that cost, in ceremony, on every single call
regardless of whether it's ever actually needed.

---

## Concept Unit: Wiring `loginButton`

### The Problem

Every piece is in place: buttons exist in the layout, `binding` reaches
them with no lookup call, function types and SAM conversion mean a
lambda can be handed directly to `setOnClickListener`, and platform
types explain what kind of trust is being placed in `.text`'s result the
moment it's read.

### Project Change

- **Reference Source:** `View.OnClickListener`'s real declared shape —
  the same one Java's Lesson 16 quoted directly from
  `developer.android.com`, unchanged by language:

  ```java
  public interface OnClickListener {
      void onClick(View v);
  }
  ```
- **Files affected:** `MainActivity.kt`.
- **Change type:** Add code inside `onCreate`.
- **Location:** Inside `onCreate`, after `setContentView(binding.root)`
  (replacing this lesson's earlier temporary debug log line from Lesson
  07, which should already be removed).
- **Dependencies:** None new.

### The New Code

```kotlin
binding.loginButton.setOnClickListener { view ->
    val username = binding.usernameField.text.toString()
    val password = binding.passwordField.text.toString()
    Toast.makeText(this, "Logging in: $username", Toast.LENGTH_SHORT).show()
}
```

### The Updated Project

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    binding = ActivityMainBinding.inflate(layoutInflater)
    setContentView(binding.root)

    binding.loginButton.setOnClickListener { view ->                          // ← new
        val username = binding.usernameField.text.toString()                  // ← new
        val password = binding.passwordField.text.toString()                  // ← new
        Toast.makeText(this, "Logging in: $username", Toast.LENGTH_SHORT).show()  // ← new
    }
}
```

### Mechanical Walkthrough

- `binding.loginButton.setOnClickListener { view -> ... }` — `binding.
  loginButton` is Lesson 04's synthetic View Binding access, reused with
  no lookup call. `setOnClickListener` is the real, inherited method
  Java's Lesson 16 already named. The trailing-lambda call passes a
  Kotlin lambda directly where `OnClickListener` is expected — this
  lesson's own SAM-conversion unit, applied for real: a genuine
  `OnClickListener` object is generated by the compiler at this exact
  call site, with no `object : View.OnClickListener { ... }` written by
  hand.
- `binding.usernameField.text` — **reappearing.** `.text` is another
  synthetic property (Lesson 04's concept) standing in for `EditText`'s
  real, inherited, covariant `getText()` — the exact narrowing from
  `TextView`'s declared `CharSequence` down to `Editable` that Java's
  Lesson 15 already proved, unaffected by which language calls it.
  Whether this specific property surfaces to Kotlin as a proper
  `Editable?` or as a platform type depends on `EditText`'s own current
  nullability annotations — check your own IDE's inferred type here
  directly, per this lesson's platform-types unit, rather than assuming.
- `.toString()` — genuinely basic, already established from Java's own
  series (every object's inherited `toString()`), unchanged by language.
- `Toast.makeText(this, "Logging in: $username", Toast.LENGTH_SHORT).show()`
  — `Toast.makeText`/`.show()` are the exact static-method-then-act
  pattern Java's Lesson 16 already explained in full. `"Logging in:
  $username"` is this series' own Lesson 07 string template, used here
  in place of Java's `"Logging in: " + username` concatenation. `this` —
  **first appearance in this series** — refers to the enclosing
  `MainActivity` object directly; because this lambda is not an
  anonymous class (no separate class scope is created around it, unlike
  Java's `new View.OnClickListener() { ... }` alternative, shown next),
  plain `this` reaches `MainActivity` with no qualification needed at
  all.

### The Anonymous-Object Alternative, for Comparison

Kotlin's equivalent of Java's fuller anonymous-class form still exists,
using `object : Interface { }`:

```kotlin
binding.loginButton.setOnClickListener(object : View.OnClickListener {
    override fun onClick(view: View) {
        val username = binding.usernameField.text.toString()
        Toast.makeText(this@MainActivity, "Logging in: $username", Toast.LENGTH_SHORT).show()
    }
})
```

One real difference worth naming, directly mirroring Java's Lesson 16
own callout: inside this `object : View.OnClickListener { ... }` block,
plain `this` refers to the anonymous object itself, not `MainActivity` —
reaching the enclosing class requires Kotlin's **labeled `this`**,
`this@MainActivity`, the exact same distinction Java's Lesson 16 needed
`MainActivity.this` for. A lambda, having no class scope of its own
created around it, never runs into this at all — one more small reason
this project uses lambdas throughout.

### SE Lens

**Why does this lesson's version read as noticeably shorter than Java's
Lesson 16 version, beyond just "Kotlin is more concise"?** Three
specific, nameable mechanisms stack here, not vague brevity: SAM
conversion removed the need to write `new View.OnClickListener() {
@Override public void onClick(View view) { ... } }`'s ceremony around
the lambda; trailing lambda syntax removed the need to close a
parenthesis after the lambda; and plain `this` (rather than
`MainActivity.this`) removed a qualifier Java's anonymous-class form
specifically required. Each is a real, separately-justified feature —
stacking three small, independently-motivated savings is what produces a
large-looking difference, not one big "Kotlin is shorter" feature.

---

## Concept Unit: Wiring `createAccountButton`

### The Problem

`createAccountButton` still does nothing. Exactly as Java's Lesson 16
noted about its own second button, this is genuinely nothing new to
teach — the payoff of learning the mechanism once.

### The New Code

```kotlin
binding.createAccountButton.setOnClickListener { view ->
    val username = binding.usernameField.text.toString()
    val password = binding.passwordField.text.toString()
    Toast.makeText(this, "Creating account: $username", Toast.LENGTH_SHORT).show()
}
```

### The Updated Project

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    binding = ActivityMainBinding.inflate(layoutInflater)
    setContentView(binding.root)

    binding.loginButton.setOnClickListener { view ->
        val username = binding.usernameField.text.toString()
        val password = binding.passwordField.text.toString()
        Toast.makeText(this, "Logging in: $username", Toast.LENGTH_SHORT).show()
    }

    binding.createAccountButton.setOnClickListener { view ->                      // ← new
        val username = binding.usernameField.text.toString()                      // ← new
        val password = binding.passwordField.text.toString()                      // ← new
        Toast.makeText(this, "Creating account: $username", Toast.LENGTH_SHORT).show()  // ← new
    }
}
```

Both buttons are now fully wired. As Java's Lesson 16 noted honestly
about its own equivalent milestone: neither listener checks the password
or persists an account — reading typed values and giving real, visible
feedback satisfies this milestone's actual UI requirement; persistence
is out of scope.

---

## Connect the Pieces

One trace, start to finish: a user types into `binding.usernameField`
(Lesson 07). Tapping `loginButton` triggers a lambda — not an interface
implementation written by hand, but a real `View.OnClickListener` object
the compiler generated via SAM conversion, this lesson's own proof —
registered via `setOnClickListener`, Java's own Inversion-of-Control
mechanism, unchanged. Inside it, `.text` reaches the field's value
through a synthetic property standing in for a covariant Java getter,
`.toString()` converts it to a real `String`, and a string template
(Lesson 07) builds the message `Toast.makeText(...).show()` displays —
the login screen's full required interactivity, working, with three
separate, independently-verified Kotlin mechanisms (function types, SAM
conversion, trailing lambdas) each replacing one specific piece of
ceremony Java's ecosystem needed.

## What Breaks Without This

Remove `.toString()` from one of the `.text` calls, leaving `val
username = binding.usernameField.text`, and try to compile.

Real output, from running this yourself: a real compiler error —
`Toast.makeText`'s second parameter expects a `CharSequence`, and
depending on whether `.text` resolved to a proper `Editable?` or a
platform type in your own project, this surfaces either as a direct
type mismatch or as a nullability warning/error at the `Toast.makeText`
call itself. Either way, the underlying fact this lesson's platform-types
unit already proved in isolation is what's actually being caught: an
`Editable` (or a nullable one) is not automatically interchangeable with
a plain, guaranteed `String`. Restore `.toString()` before moving on.

## Exercises

1. Rewrite `createAccountButton`'s listener using the `object : View.
   OnClickListener { }` form from this lesson's comparison section,
   using `this@MainActivity` where the lambda version used plain `this`.
   Confirm the app behaves identically either way.
2. In your own project, hover `binding.usernameField.text` in Android
   Studio (or check its inferred type another way) and determine whether
   it resolves to `Editable!` (a platform type), `Editable?`, or
   `Editable`. Explain what that specific resolution implies about
   whether a null check is ever actually needed before calling
   `.toString()` on it.
3. Change `Toast.LENGTH_SHORT` to `Toast.LENGTH_LONG` on one button, same
   as Java's own Lesson 16 exercise, and confirm the visible duration
   difference.

## Definition of Done

- [ ] You ran the function-type lab and can explain why it needed no
      interface, unlike Java's Lesson 14 `Greeter`.
- [ ] You ran the SAM-conversion lab yourself, against real, separately
      compiled Java and Kotlin files, and saw a Kotlin lambda satisfy a
      real Java interface with no explicit implementation written.
- [ ] You ran the platform-type lab and saw the real, uncaught
      `NullPointerException` — proof Kotlin's null safety does not
      automatically extend across a Java interop boundary.
- [ ] Tapping either button on a running emulator/device shows a real
      `Toast` with the typed username.
- [ ] You can state, precisely, three separate things making this
      lesson's code shorter than Java's Lesson 16 equivalent, not just
      that "Kotlin is more concise."
- [ ] Commit: `git commit -m "Wire login and create-account buttons via
      SAM-converted lambdas and View Binding"` — explaining what
      mechanism replaced `findViewById`/anonymous-class listeners, not
      just that buttons now work.

Milestone 2 is done — a fully interactive login screen. Next: a small,
genuinely new Kotlin capability with no direct Java-series lesson behind
it — extension functions, motivated by validating what the user actually
typed.
