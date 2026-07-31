# Lesson 13: Fields, `private`, and Finding Views from Java

**What you will build:** `MainActivity` gains its first real fields —
references to the username field, password field, and both buttons —
so Java code can actually reach the widgets XML only described. The
transferable problem: XML and Java are two separate worlds until
something explicitly bridges them, and Android gives you two genuinely
different ways to build that bridge — one older and more manual, one
newer and safer — worth understanding as a real choice, not just picking
whichever a tutorial happened to show first.

**What you need to know first:** Milestone 2 (Lessons 08–11) — the
complete static login layout, with every widget already carrying a real
`android:id`. Lesson 12 (generic methods, type inference).

**Terms introduced in this lesson:**
- **`private`** — an access modifier meaning "visible only inside this
  exact class," the narrowest of the three modifiers this series covers
  (`public`, `protected`, `private`).
- **Field** — a variable declared directly inside a class body (not
  inside a method), holding state that belongs to each object built from
  that class.
- **Bounded type parameter** — Lesson 12's generic-method type parameter,
  here additionally constrained to only accept types that are actually
  `View`s, rather than any type at all.
- **View Binding (recognition, real alternative)** — a build-time
  alternative to `findViewById` that generates a typed class with a
  field per view, checked at compile time instead of at runtime.

---

## Concept Unit: `private` — Visible Only Inside This Class

### The Problem

Lessons 01 and 07 already covered `public` (anything, anywhere) and
`protected` (subclasses everywhere, plus same-package code). Neither is
right for what this lesson needs: references to `MainActivity`'s own
widgets, meant to be used only by `MainActivity`'s own code, with no
reason for any other class — related or not — to reach in and touch
them directly.

### Introduce the Concept in Isolation

```java
class Wallet {
    private int balanceInCents = 500;

    int getBalanceInCents() {
        return balanceInCents;
    }
}

public class PrivateDemo {
    public static void main(String[] args) {
        Wallet wallet = new Wallet();
        System.out.println(wallet.getBalanceInCents());
        System.out.println(wallet.balanceInCents);
    }
}
```

Try to compile this exactly as written:

```
javac PrivateDemo.java
```

Real error:

```
PrivateDemo.java:12: error: balanceInCents has private access in Wallet
        System.out.println(wallet.balanceInCents);
                                  ^
```

Delete the last `System.out.println(wallet.balanceInCents);` line and
recompile — it now succeeds, and running it prints `500`, reached only
through the `getBalanceInCents()` method, never by touching the field
directly from outside `Wallet`. `private` blocked even `PrivateDemo`, a
completely unrelated class in the very same file — narrower than
`protected`, which would have allowed same-package access; `private`
allows only the declaring class itself.

### Discard the Throwaway Example

`Wallet` and `PrivateDemo` are deleted now; they don't enter the real
project.

### CS Lens

This is **encapsulation** — hiding an object's internal state behind a
controlled, deliberate interface (here, `getBalanceInCents()`) rather
than exposing raw fields for any code anywhere to read or modify
directly.

Also recognized in: C++/C#'s own `private` keyword, "getter" methods in
virtually every object-oriented codebase, and the general software
engineering principle that an object's internal representation should be
free to change without breaking code outside it, as long as its public
methods keep working the same way.

---

## Concept Unit: Fields on `MainActivity`

### The Problem

`onCreate` is a single method. Right now, if it needed to remember
something — a reference to a specific widget — for use later, in a
*different* method, a local variable inside `onCreate` wouldn't survive
past that method's return. A **field**, declared directly on the class
rather than inside any one method, belongs to the object itself and
persists for as long as that object exists — exactly what's needed here,
since reading the login form's values will eventually happen in a
different method than `onCreate` (the click handler, added next lesson).

### Project Change

- **Reference Source:** No external framework signature to cite — these
  are new fields you're declaring on your own class, not overriding
  anything.
- **Files affected:** `MainActivity.java`.
- **Change type:** Add four private fields.
- **Location:** Inside the class body, before `onCreate`.
- **Dependencies:** None new.

### The New Code

```java
private EditText usernameField;
private EditText passwordField;
private Button loginButton;
private Button createAccountButton;
```

### The Updated Project

```java
package com.yourname.yourapp;

public class MainActivity extends AppCompatActivity {
    private EditText usernameField;      // ← new
    private EditText passwordField;      // ← new
    private Button loginButton;          // ← new
    private Button createAccountButton;  // ← new

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Log.d("MainActivity", "onCreate is running right now");
    }
}
```

Four fields now exist on every `MainActivity` object, currently all
holding nothing (Java automatically initializes an unassigned object
reference field to a special empty value — covered fully once it's
actually read, in the next unit).

### Mechanical Walkthrough

- `private EditText usernameField;` and the three lines beside it —
  **first appearance of fields as a concept**, using `private` from the
  lab above and `EditText`/`Button` from Lessons 10–11. Each is a
  **field**: a variable declared directly in the class body, one copy
  per `MainActivity` object, readable and writable from any method inside
  this class for as long as that object exists.

### SE Lens

**Why `private` specifically, rather than leaving these fields with no
modifier at all (package-private) or making them `public`?** Nothing
outside `MainActivity` has any legitimate reason to reach in and grab a
reference to its password field directly — doing so would let unrelated
code read or replace form state it has no business touching, the exact
risk `private` exists to close off. This is the same encapsulation
reasoning from the lab above, now protecting real widget references
instead of a bank balance.

---

## Concept Unit: `findViewById` — a Real Generic Method

### The Problem

The fields declared above exist, but hold nothing yet. Something has to
connect each field to the actual, specific `View` object that
`setContentView` built from the XML layout — by looking it up using the
`android:id` each widget already carries. The real method that does
this, `findViewById`, has a signature shape (`<T extends View> T
findViewById(...)`) — a **generic method**, Lesson 12's concept,
reappearing here for the first time on a real, unfamiliar framework class
instead of a disposable `Box`.

### Project Change

- **Reference Source:** `Activity.findViewById`'s real declared shape —
  confirmed this session against Android's own API documentation
  (mirrored at [Microsoft's .NET-for-Android API docs](https://learn.microsoft.com/en-us/dotnet/api/android.app.activity.findviewbyid), which link back
  to `developer.android.com`'s own reference for the same method). The
  real Java declaration:

  ```java
  public <T extends View> T findViewById(@IdRes int id)
  ```

  This is the **Parent Contract** `findViewById` calls are relying on:
  a method already declared on `Activity`, inherited by `MainActivity`
  through Lesson 06's `extends` relationship, callable directly with no
  `this.` or qualifier needed.
- **Files affected:** `MainActivity.java`.
- **Change type:** Add four lines inside `onCreate`.
- **Location:** Inside `onCreate`, immediately after `setContentView`.
- **Dependencies:** None new.

### The New Code

```java
usernameField = findViewById(R.id.usernameField);
passwordField = findViewById(R.id.passwordField);
loginButton = findViewById(R.id.loginButton);
createAccountButton = findViewById(R.id.createAccountButton);
```

### The Updated Project

```java
package com.yourname.yourapp;

public class MainActivity extends AppCompatActivity {
    private EditText usernameField;
    private EditText passwordField;
    private Button loginButton;
    private Button createAccountButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Log.d("MainActivity", "onCreate is running right now");

        usernameField = findViewById(R.id.usernameField);         // ← new
        passwordField = findViewById(R.id.passwordField);         // ← new
        loginButton = findViewById(R.id.loginButton);             // ← new
        createAccountButton = findViewById(R.id.createAccountButton); // ← new
    }
}
```

Every field declared above now holds a real, live reference to its
corresponding on-screen widget, looked up the moment the layout is
inflated.

### Mechanical Walkthrough

- `R.id.usernameField` — **first appearance of `R.id`.** The same
  generated `R` class already met through `R.layout` (Lesson 05) and
  `R.string` (Lesson 09) has an `id` side too: every `android:id="@+id/..."`
  in every layout file becomes a field on `R.id`, generated automatically
  at build time. `R.id.usernameField` is a plain `int` constant —
  Android's IDs are just numbers under the hood; the name is purely for
  your own code's readability.
- `findViewById(R.id.usernameField)` — **first appearance, and the
  concept this unit exists to teach.** Its real declared signature,
  quoted above, is `public <T extends View> T findViewById(@IdRes int id)`.
  `<T extends View>` is a **bounded type parameter**: `T` is a
  placeholder type, decided per call — the same generic-method mechanism
  Lesson 12's disposable `Box.firstNonNull` already proved — constrained
  ("bounded") here to only ever be `View` or some subclass of it, a
  restriction plain `Box`'s `<T>` didn't have. You cannot call this
  method and have it return, say, a `String`. Nothing in the call
  `findViewById(R.id.usernameField)` ever writes out what `T` is
  explicitly — the compiler infers it from
  context: because the result is being assigned directly into a field
  declared `EditText`, the compiler infers `T = EditText` for this
  specific call, and the method hands back an `EditText` with no manual
  cast required. The very next line's call to the same method infers a
  completely different `T` (`Button`, from its own assignment target) —
  one method, reused with a different inferred type each time, which is
  the entire point of writing it generically instead of as several
  near-duplicate methods (`findEditTextById`, `findButtonById`, ...).
- `usernameField = ...` — a plain field assignment; reappearing, already
  basic, no new concept.

### CS Lens

Bounded generics — `<T extends View>` — are the same general idea as
Java's plain (unbounded) generics, constrained further: instead of "any
type at all," the type parameter is restricted to a specific family of
types related by inheritance. This is a deliberate combination of two
concepts already in this series: **generics** (a method parameterized by
type) and **inheritance** (Lessons 06–07's `extends`), used together so
the method can promise "you'll always get back some kind of `View`,"
which is exactly specific enough to be useful and exactly general enough
to work for every widget type in the entire framework with one method.

Also recognized in: Java's own standard library (`Collections.max(Collection<? extends T>)`
uses the same bounding idea), C#'s generic constraints (`where T : SomeBaseClass`),
and any framework API that needs to return "some subtype of X, exactly
which one decided by the caller" without writing a separate method per
subtype.

### SE Lens

**Why not just have `findViewById` return a plain `View` and require an
explicit cast every time, instead of building generics into it?** The
older, pre-generics version of this exact method did exactly that — it
returned `View`, and every call site needed `(EditText)
findViewById(R.id.usernameField)` written out by hand. That works, but
pushes a real risk onto every call site: writing the *wrong* cast type
compiles fine and only fails at runtime, with a `ClassCastException`,
the first time that specific line actually executes. The generic version
moves that same risk to compile time instead — assign the result to a
field of the wrong type and the compiler itself rejects it immediately,
rather than waiting for a runtime crash. The tradeoff cost is small:
`<T extends View>` is a slightly harder signature to read the first time
you see it, in exchange for an entire category of bug moving earlier in
the development process.

---

## Concept Unit: An Alternative — View Binding

### The Problem

`findViewById` still has one real risk even with generics protecting the
return type: nothing stops you from passing the *wrong ID* —
`findViewById(R.id.passwordField)` assigned into the `usernameField`
field compiles perfectly fine, because both are declared `EditText`,
and only shows itself as a confusing runtime bug (reading the password
field's text where the username was expected) — not a compiler error.
Android's newer **View Binding** feature closes this specific gap.

### The Alternative, Shown For Real

Enabling it requires one addition to the module's `build.gradle` file —
the Gradle configuration flagged back in Lesson 05, now touched for the
first time:

```gradle
android {
    ...
    buildFeatures {
        viewBinding true
    }
}
```

With this enabled, Android's build process generates a class named after
the layout file — `activity_main.xml` produces `ActivityMainBinding` —
with one typed field per `android:id` in that file, generated
automatically, no manual declarations needed:

```java
private ActivityMainBinding binding;

@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    binding = ActivityMainBinding.inflate(getLayoutInflater());
    setContentView(binding.getRoot());

    binding.usernameField.getText();   // already the correct, specific type — no findViewById call at all
    binding.loginButton.setOnClickListener(...);
}
```

### The Tradeoff

`findViewById`, as built above, requires no build configuration changes,
is what the overwhelming majority of existing Android code and tutorials
already show, and makes the generic-method mechanism directly visible —
valuable for this series specifically, since seeing the real mechanism is
part of the point. View Binding eliminates both remaining risks
`findViewById` still has (a wrong ID silently compiling, and needing to
call a lookup method at all) at the cost of a build configuration change
and a generated class whose fields you never declare yourself, which can
feel like it's "hiding" what's actually happening the first time you see
it — exactly the kind of implicit generated behavior this series avoids
introducing before you've seen the manual version it replaces.

**This project continues with `findViewById`,** having now seen exactly
what View Binding would replace and why a real production app often
prefers it once a project has dozens of widgets and the wrong-ID risk
becomes a real, recurring cost rather than a four-field toy case.

---

## Connect the Pieces

One trace: `usernameField` is declared as a `private EditText` field
(this unit's private/field concepts), initialized inside `onCreate` by
calling the inherited, generic `findViewById(R.id.usernameField)` — a
real method from `Activity`'s own contract, with `T` inferred as
`EditText` from the assignment target. After this line runs, any other
method on `MainActivity` can read `usernameField` directly, because it's
a field, not a local variable trapped inside `onCreate`.

## What Breaks Without This

Swap two IDs by mistake —
`usernameField = findViewById(R.id.passwordField);` — and run the app.
The build succeeds with **no error at all**, because both sides are
`EditText`, satisfying the compiler completely. Add a temporary
`Log.d("MainActivity", "username field currently shows: " + usernameField.getHint());`
after the swap and observe the real, wrong hint text logged — proving
this is exactly the silent, runtime-only bug View Binding's tradeoff
section described, not a hypothetical one. Fix the swap and remove the
temporary log line before moving on.

## Exercises

1. In the `Wallet` lab, add a second field, `ownerName`, `private`, with
   no getter method at all. Confirm no code outside `Wallet` can read it
   in any way — not even the workaround this lesson's version left open
   (`getBalanceInCents()`), since you didn't write one.
2. Deliberately assign `findViewById(R.id.loginButton)` into the
   `usernameField` field (a `Button` into an `EditText`-typed field) and
   attempt to compile. Read the real compiler error and connect it
   directly to this lesson's bounded-type-parameter explanation — this
   is the exact case the generic signature is designed to catch.

## Definition of Done

- [ ] You triggered the real `private`-access compiler error in the
      `Wallet` lab yourself.
- [ ] You can state, precisely, what `<T extends View>` means and why
      `findViewById(R.id.usernameField)` doesn't need an explicit cast.
- [ ] You performed the ID-swap experiment, saw the app compile with no
      error, and saw the real wrong value logged — direct proof of the
      risk `findViewById` still carries.
- [ ] You can state one concrete thing View Binding fixes that
      `findViewById` does not, and one real cost of adopting it.
- [ ] All four fields are correctly wired; the app still runs with no
      visible change yet (the values aren't used for anything until the
      next lesson).
- [ ] Commit: `git commit -m "Wire login screen widgets to private
      fields via findViewById"` — explaining the private-field choice,
      not just the wiring.

Next: making the buttons actually do something when tapped — interfaces,
and the two real ways Android lets you implement one.
