# Lesson 07: Lambdas and Trailing Lambda Syntax — Wiring the Buttons

**What you will build:** Both login buttons wired to real behavior in
Kotlin — reading the typed values through `binding` and showing a real
`Toast` — completing the login screen. The transferable problem: Java's
lambda syntax, `(view) -> { ... }`, already compressed an anonymous
class into one line. Kotlin compresses further, with a real, distinct
syntax rule — the **trailing lambda** convention — worth understanding
precisely rather than pattern-matching from Java's shape.

**What you need to know first:** Java's `View.OnClickListener`
interface and its one-method, functional-interface shape; Java's own
lambda syntax as the point of contrast.

**Terms introduced in this lesson:**
- **Trailing lambda** — when a function's last parameter is a lambda,
  Kotlin allows (and idiomatically prefers) writing it outside the
  parentheses, directly after the call.
- **`it`** — the implicit name of a lambda's single parameter, usable
  when a lambda takes exactly one parameter and doesn't need a more
  descriptive name.
- **SAM conversion** — Kotlin automatically treating a lambda as an
  implementation of a Java **s**ingle-**a**bstract-**m**ethod interface,
  the same way Java's own lambdas target a functional interface.

---

## Concept Unit: Trailing Lambdas

### The Problem

`setOnClickListener` takes one argument: an `OnClickListener`. Java's
lambda syntax, `setOnClickListener((view) -> { ... })`, still writes
that one argument inside the call's parentheses, exactly where any
ordinary argument would go. Kotlin has a further, real syntax rule for
exactly this shape.

### Introduce the Concept in Isolation

```kotlin
fun runTwice(action: () -> Unit) {
    action()
    action()
}

fun main() {
    runTwice({
        println("Hi")
    })

    runTwice {
        println("Hi, trailing style")
    }
}
```

Compile and run:

```
kotlinc TrailingLambda.kt -include-runtime -d TrailingLambda.jar
java -jar TrailingLambda.jar
```

Real output:

```
Hi
Hi
Hi, trailing style
Hi, trailing style
```

`runTwice(action: () -> Unit)` declares a parameter whose type is
itself a function — `() -> Unit` means "a function taking no arguments
and returning nothing" (`Unit` is Kotlin's equivalent of Java's `void`,
but is itself a real, nameable type, unlike `void`). The first call,
`runTwice({ println("Hi") })`, passes the lambda as an ordinary
argument, inside the parentheses — legal, and identical in meaning to
the second call. The second call, `runTwice { println("Hi, trailing
style") }`, uses the **trailing lambda** convention: when a function's
*last* (here, only) parameter is a lambda, Kotlin allows moving it
outside the parentheses entirely — and when it's the *only* parameter,
the now-empty parentheses can be omitted completely. Both calls compile
to the exact same thing; the trailing form is idiomatic Kotlin style for
exactly this shape, not a different mechanism.

### Discard the Throwaway Example

`runTwice` is deleted now. `setOnClickListener`, next, has exactly this
shape — one functional-interface parameter — which is precisely why its
Kotlin call site drops the parentheses entirely.

### CS Lens

A trailing lambda is real, deliberate syntax sugar supporting a broader
idea: functions that accept "a block of code to run" as their last
argument, called in a shape that visually resembles a built-in language
control structure (`if`, `for`) rather than an ordinary function call —
this is exactly what lets Kotlin build things like its own scope
functions (a later lesson) and DSL-style APIs without needing new
language keywords for each one.

### SE Lens

**Why does this convention only apply to the *last* parameter, rather
than any parameter?** A lambda is often the single largest, most
visually complex argument in a call — reserving the trailing position
for it (and only it) keeps every other, typically shorter argument
inside the parentheses where a reader expects ordinary arguments to be,
while the block of actual code gets visually separated, after the call,
where it reads more like a body than an argument.

---

## Concept Unit: Wiring the Buttons

### The Problem

With trailing lambdas understood, `setOnClickListener` can now be called
in its real, idiomatic Kotlin form.

### The New Code

```kotlin
binding.loginButton.setOnClickListener {
    val username = binding.usernameField.text.toString()
    val password = binding.passwordField.text.toString()
    Toast.makeText(this, "Logging in: $username", Toast.LENGTH_SHORT).show()
}
```

### The Updated Project

```kotlin
package com.yourname.yourapp

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.yourname.yourapp.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.loginButton.setOnClickListener {                          // ← new
            val username = binding.usernameField.text.toString()
            val password = binding.passwordField.text.toString()
            Toast.makeText(this, "Logging in: $username", Toast.LENGTH_SHORT).show()
        }

        binding.createAccountButton.setOnClickListener {                  // ← new
            val username = binding.usernameField.text.toString()
            val password = binding.passwordField.text.toString()
            Toast.makeText(this, "Creating account: $username", Toast.LENGTH_SHORT).show()
        }
    }
}
```

### Mechanical Walkthrough

- `binding.loginButton.setOnClickListener { ... }` — **first appearance
  of `SAM conversion`.** `setOnClickListener` still expects a real
  `View.OnClickListener` — a Java interface, unchanged, with its one
  abstract method `onClick(View v)`. The trailing lambda here is
  automatically treated by the Kotlin compiler as a full implementation
  of that interface: this is **SAM conversion** (**s**ingle-**a**bstract-
  **m**ethod conversion), Kotlin's rule that any lambda can satisfy a
  Java functional interface directly, with the lambda's own parameter
  matching `onClick`'s one parameter. The lambda body never references
  that parameter by name at all here — Kotlin permits omitting an unused
  lambda parameter entirely, rather than requiring a placeholder name
  the way Java's `(view) -> { ... }` syntax does.
- `binding.usernameField.text.toString()` — reappearing (Lesson 06);
  note there is no `!!` or `?.` anywhere here — `binding.usernameField`
  is non-null (Lesson 06's own guarantee), and `.text` on a real
  `EditText` returns Kotlin's own view of `Editable`, itself non-null
  for a real, inflated view.
- `Toast.makeText(this, "Logging in: $username", Toast.LENGTH_SHORT).show()`
  — reappearing method-chaining shape, unchanged from Java; `"Logging
  in: $username"` uses Lesson 01's string template instead of Java's `+`
  concatenation.
- `this` inside the lambda — refers to the enclosing `MainActivity`
  directly, with **no** `MainActivity.this` qualifier ever needed.
  Kotlin lambdas, unlike Java anonymous classes, never introduce their
  own separate `this` — there is no anonymous class being generated
  around a Kotlin lambda the reader needs to mentally track, removing
  the exact `this`-versus-`MainActivity.this` distinction the Java
  version had to explain.

### CS Lens

SAM conversion is Kotlin's own answer to the same interop problem
platform types (Lesson 03) solve for nullability: Java's functional
interfaces predate Kotlin, and Kotlin's compiler bridges to them
directly, generating the real anonymous-class-implementing-the-interface
object underneath a lambda that merely *looks* like a bare block of
code — the same "sugar with a verifiable mechanical translation"
category as Lesson 01's generated `main` class.

### SE Lens

**Why does Kotlin's lambda avoid introducing its own `this`, when Java's
anonymous-class-based lambda implementation genuinely does create a new
class with its own identity?** Kotlin lambdas do **not** compile to a
new anonymous class carrying its own instance identity the way Java's
always do — they're implemented as a more direct, lighter-weight
construct (a function value) specifically designed to avoid that
overhead and that exact confusion. This is a real, underlying
implementation difference, not just a syntax convenience, and it's
exactly why the `this`-ambiguity Java's own lambda/anonymous-class
lesson had to carefully distinguish simply doesn't exist as a concern in
Kotlin at all.

---

## Connect the Pieces

One trace, start to finish: tapping "Log In" triggers the trailing
lambda registered via SAM conversion on `binding.loginButton`. Inside
it, `binding.usernameField.text.toString()` reads a guaranteed-non-null
value (Lesson 06), a string template builds the message (Lesson 01), and
`Toast.makeText(...).show()` displays it — the entire login screen's
required interactivity, in Kotlin, with every widget reference statically
guaranteed non-null and not one explicit null check written anywhere in
this file.

## What Breaks Without This

Reference the lambda's implicit parameter by an invalid name — add
`println(it.id)` inside the `loginButton` lambda without ever declaring
`it` explicitly. This actually **works**, printing the tapped view's own
ID, since `setOnClickListener`'s lambda genuinely does take one
parameter (the clicked `View`) and Kotlin makes it available as `it`
automatically whenever it's referenced and no explicit name was given.
Now add a *second* lambda parameter's worth of logic by mistake — attempt
`binding.loginButton.setOnClickListener { view, extra -> }` (two names,
where the real interface only supplies one). Real error:

```
error: expected 0 parameters
```

confirming the compiler checks the real, single-parameter shape of
`onClick(View)` even through SAM conversion, not just accepting any
lambda shape.

## Exercises

1. Rewrite one of the two listeners using an explicit parameter name
   instead of relying on `it` — `binding.loginButton.setOnClickListener
   { view -> ... }` — and confirm it behaves identically, proving `it`
   is a convenience for the common case, not a different mechanism.
2. Change `runTwice`'s parameter type from `() -> Unit` to
   `(String) -> Unit` (a function taking one `String` parameter), update
   its body to call `action("hello")`, and call it with a trailing
   lambda using `it` inside to print the received value — direct,
   personal proof that `it`'s type is inferred from the function type's
   own parameter type, not fixed to `View`.

## Definition of Done

- [ ] You ran the trailing-lambda lab and confirmed both call styles
      produce identical output.
- [ ] You can explain what SAM conversion does and why Kotlin needs it
      at all, given `View.OnClickListener` is a Java interface.
- [ ] You can state why Kotlin lambdas never need a
      `MainActivity.this`-style qualifier.
- [ ] Tapping either button shows a real `Toast` with the typed
      username, matching the Java version's behavior exactly.
- [ ] Commit: `git commit -m "Wire login and create-account buttons
      using trailing lambdas and SAM conversion"` — explaining the
      Kotlin-specific mechanism, not just that listeners were added.

Next: a second screen, and Kotlin's single biggest simplification over
Java's own object model — the data class.
