# Lesson 16: Wiring the Buttons — `OnClickListener` and `Toast`

**What you will build:** Both login buttons respond to taps for the
first time — reading whatever the user typed and showing it back as
on-screen feedback. This completes the login screen's required
interactivity: fields, masked password, a submit button, and a
create-account button, all now real and working. The transferable
problem: Lesson 14 built the interface/anonymous-class/lambda concept
in isolation; this lesson connects it to Android's actual, real
click-handling interface and shows the one remaining wrinkle in reading
a text field's value that a quick glance at the API would miss.

**What you need to know first:** Lesson 13 (fields, `findViewById`),
Lesson 14 (interfaces, anonymous classes, lambdas), Lesson 15 (covariant
return types).

**Terms introduced in this lesson:**
- **`View.OnClickListener`** — the real, single-method interface Android
  defines for click handling; a **functional interface**, per Lesson
  14's definition.
- **`setOnClickListener`** — the method every `View` has for registering
  an `OnClickListener` to be called when it's tapped.
- **Covariant return type** — a subclass overriding a method and
  declaring a *more specific* return type than the parent declared,
  allowed as long as the more specific type is itself a subtype of the
  original.
- **`Toast`** — a small, temporary on-screen message Android shows and
  automatically dismisses after a short delay.
- **`this`** — a keyword available inside any instance method,
  referring to the specific object the method is currently running on;
  here, the specific `MainActivity` object handling this exact
  `onCreate` call.
- **`EditText.getText()` / `Editable`** — `EditText`'s own covariant
  override of `TextView.getText()`, returning the more specific
  `Editable` (a mutable `CharSequence`) instead of the parent's plainer
  `CharSequence` — Lesson 15's covariant return type, reappearing on a
  real framework class.

**Objects and methods used:**

**`View.OnClickListener`**
- *What it is:* the real, single-method interface Android defines for
  click handling.
- *Implementation:* a functional interface (Lesson 14) with one abstract
  method, `onClick(View v)`, implemented here via a lambda.
- *Its use:* the contract both login buttons' listeners fulfill.

**`setOnClickListener`**
- *What it is:* the method every `View` has for registering a click
  callback.
- *Implementation:* takes an `OnClickListener` and holds onto it,
  calling it back later when the view is actually tapped.
- *Its use:* called once per button, registering this lesson's two
  lambdas.

**`Toast`**
- *What it is:* a small, temporary on-screen message.
- *Implementation:* `Toast.makeText(context, text, duration)` builds
  one; `.show()` actually displays it, auto-dismissing after the given
  duration.
- *Its use:* shown from the login button's listener as visible feedback
  that the tap and the typed value were both read correctly.

**`EditText.getText()` / `Editable`**
- *What they are:* `EditText`'s own covariant override of
  `TextView.getText()`, and the more specific type it returns.
- *Implementation:* Lesson 15's covariant return type, reappearing on a
  real framework class — `Editable` is a mutable `CharSequence`.
- *Their use:* reads each field's typed value, then converted to a plain
  `String` via `.toString()`, below.

**Everything else in the file, not this lesson's subject but still
explained:**
- **`Object.toString()`**
  - *What it is:* a method every Java object has, inherited from
    `Object`.
  - *Implementation:* returns a `String` representation of the object.
  - *Its use:* converts the `Editable` `EditText.getText()` returns into
    a plain `String`, the type `Toast.makeText` and string concatenation
    both actually need.

---

## Concept Unit: `View.OnClickListener` — the Real Interface

### The Problem

Lesson 14 built `Greeter`, a disposable one-method interface, purely to
teach the concept. Android has a real interface doing the exact same
structural job for clicks.

### Project Change

- **Reference Source:** `View.OnClickListener`'s real declared shape,
  confirmed this session against
  [Android's own `View.OnClickListener` reference](https://developer.android.com/reference/android/view/View.OnClickListener):

  ```java
  public interface OnClickListener {
      void onClick(View v);
  }
  ```

  This is a nested interface — declared inside `View` itself — with
  exactly one abstract method, `onClick(View v)`, taking the clicked
  `View` as its argument and returning nothing. One method, no body:
  precisely Lesson 14's definition of an interface, and precisely
  Lesson 14's definition of a **functional interface**, since it
  declares exactly one abstract method — eligible for the lambda
  shorthand.
- **Files affected:** `MainActivity.java`.
- **Change type:** Add code inside `onCreate`.
- **Location:** Inside `onCreate`, after the four `findViewById` lines
  from Lesson 13.
- **Dependencies:** None new.

### The New Code

```java
loginButton.setOnClickListener((view) -> {
    String username = usernameField.getText().toString();
    String password = passwordField.getText().toString();
    Toast.makeText(this, "Logging in: " + username, Toast.LENGTH_SHORT).show();
});
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

        usernameField = findViewById(R.id.usernameField);
        passwordField = findViewById(R.id.passwordField);
        loginButton = findViewById(R.id.loginButton);
        createAccountButton = findViewById(R.id.createAccountButton);

        loginButton.setOnClickListener((view) -> {              // ← new
            String username = usernameField.getText().toString();
            String password = passwordField.getText().toString();
            Toast.makeText(this, "Logging in: " + username, Toast.LENGTH_SHORT).show();
        });
    }
}
```

### Mechanical Walkthrough

- `loginButton.setOnClickListener(...)` — **first appearance.**
  `setOnClickListener` is a method every `View` (inherited all the way
  down to `Button`, through the same inheritance chain Lesson 11
  established) provides, accepting one argument: an object implementing
  `OnClickListener`. Calling it doesn't run anything immediately — it
  only *registers* the given listener, to be called later, whenever this
  specific button is tapped. This is Lesson 07's Inversion of Control
  again, at a harder level: `onCreate` was a method the framework calls
  because you overrode it on a class the framework controls; this is the
  framework calling a listener *object* you handed it, on a schedule
  entirely outside your code — the button might be tapped once, many
  times, or never again.
- `(view) -> { ... }` — a **lambda expression**, reappearing from Lesson
  14, implementing `OnClickListener`'s one method. `view` is the
  parameter — the specific `View` that was tapped (here, always
  `loginButton` itself, since this lambda is only registered on that one
  button) — its type, `View`, inferred from `onClick`'s own declared
  signature, exactly as Lesson 14 explained.
- `usernameField.getText()` — **first appearance, and a real, hard
  concept worth stopping on.** `TextView` (Lesson 09) declares
  `getText()` returning `CharSequence` — a general "some sequence of
  characters" type. `EditText` **overrides** `getText()` and declares it
  returning `Editable` instead — a *more specific* type than
  `CharSequence` (`Editable` itself extends `CharSequence`, adding
  methods for modifying the text in place). This is Lesson 15's
  **covariant return type**, reappearing on a real framework class
  instead of a disposable `Container`. Because `usernameField` is declared
  `EditText` (Lesson 13's field), calling `.getText()` on it gives back
  the more specific `Editable`, which is why the very next call —
  `.toString()` — is available and meaningful here in a way it wouldn't
  be if `getText()` only ever returned the plainer `CharSequence`.
- `.toString()` — **first appearance in this series.** Every Java object
  has a `toString()` method (inherited, ultimately, from `Object` — the
  root of every class in Java, a fact this series hasn't needed to name
  until now); it converts an object into a `String` representation.
  `Editable`'s version returns the actual typed characters as a real
  `String`, which is what gets used from here on — string concatenation
  (the `+` a few lines down) and `Toast` both expect a real `String`,
  not the more abstract `Editable`.
- `Toast.makeText(this, "Logging in: " + username, Toast.LENGTH_SHORT)` —
  **first appearance**, covered in the next unit.
- `this` — **first appearance in this series.** Inside `onCreate`,
  `this` refers to the specific `MainActivity` object currently running —
  needed here because `Toast.makeText` requires a `Context` (a handle
  many Android APIs need, representing "the app's or screen's current
  environment"; a full explanation is deferred, flagged, to Lesson 17,
  the first place this project needs `Context`'s real inheritance chain
  for its own sake). `Activity` is itself a `Context` (through its own
  inheritance chain), so `this` satisfies that requirement directly.

### Execution Trace — Registration Now, Invocation Later

"Called later, whenever tapped" in the walkthrough above is a timing
claim, not just a description — worth tracing as the real sequence of
*when* each line actually runs, not the order it's written in:

1. `onCreate` runs once, at app launch. Inside it,
   `loginButton.setOnClickListener((view) -> {...})` runs — this only
   **registers** the lambda object with `loginButton`; nothing inside the
   lambda's body executes yet, and `onCreate` finishes and returns with
   the lambda still unexecuted.
2. Zero, one, or many taps may now happen, at times entirely outside this
   code's control — including the possibility of never happening again
   for the rest of the app's run.
3. Each time a tap actually occurs, the Android framework — not
   `onCreate`, which already finished and returned in step 1 — calls the
   registered lambda's body directly: `usernameField.getText()`,
   `passwordField.getText()`, and `Toast.makeText(...).show()` all run
   fresh, in order, on *that specific tap*.
4. If the user taps `loginButton` three times, step 3 repeats three full
   times, each with whatever text currently sits in the two fields at
   that exact moment — not whatever was typed when `onCreate` originally
   ran.

The gap between step 1 (registration, runs once) and step 3 (invocation,
runs zero-to-many times, later) is the entire point: reading this code
top to bottom tells you *what* runs, never *when* — which is exactly why
a plain walkthrough isn't sufficient proof of ordering here.

### CS Lens

`setOnClickListener` taking an interface implementation is the
**Observer pattern**: one object (`loginButton`) allows other code to
register interest in something that will happen to it later (a tap), and
notifies every registered observer when it does, without `loginButton`
itself needing to know anything about what its observer actually does.

Also recognized in: every GUI framework's event system, JavaScript's
`addEventListener`, and publish/subscribe systems generally, where a
publisher has no knowledge of who's subscribed or what they'll do with
the notification.

### SE Lens

**Why does `setOnClickListener` take an object implementing an
interface, instead of just accepting a plain function reference the way
some languages allow directly?** At the time Android's click API was
designed, Java had no first-class function type at all — an interface
with one method was the only available way to pass "a piece of behavior"
as a value. Lambdas (added to Java years later) are pure syntax sugar
over exactly this same mechanism: `(view) -> {...}` still creates a real
object implementing `OnClickListener` underneath, the same way Lesson
14's lambda lab did — Android's API never needed to change to support
the shorter syntax, because a lambda targeting a functional interface
compiles down to the same shape the API always expected.

---

## Concept Unit: `Toast` — Temporary Feedback

### The Problem

The login screen currently has no way to show the user anything happened
after a tap. Android's simplest built-in mechanism for a brief,
non-blocking message is `Toast`.

### The New Code

Already shown above:

```java
Toast.makeText(this, "Logging in: " + username, Toast.LENGTH_SHORT).show();
```

### Mechanical Walkthrough

- `Toast.makeText(context, text, duration)` — **first appearance.** A
  **static method** (Lesson 01's concept, reappearing: called on the
  class itself, `Toast.makeText(...)`, never on an instance) that builds
  and configures a `Toast` object, without showing it yet. `this` is the
  `Context` argument explained above; the second argument is the message
  text; `Toast.LENGTH_SHORT` is a constant controlling roughly how long
  it stays visible (`Toast.LENGTH_LONG` is the other option, staying
  visible longer — an ordinary choice between two provided constants,
  not a design decision needing its own tradeoff discussion).
- `.show()` — **first appearance.** `makeText` only builds the `Toast`
  object; nothing appears on screen until `.show()` is called on the
  result — the same builder-then-act shape as constructing an object and
  then calling a method on it, just chained onto one line instead of
  split across two statements.

### SE Lens

**Why does Android split "build the message" and "actually show it" into
two separate steps (`makeText`, then `.show()`) instead of one method
that does both?** Splitting them lets the same built `Toast` object be
reconfigured or reused before showing, in code more advanced than this
lesson needs — but more immediately, it's a consistent shape Android
reuses elsewhere (build a configured object, then separately trigger the
action), which is worth recognizing here now that you'll see the same
two-step shape again in later lessons rather than assuming `Toast` is a
one-off special case.

---

## Concept Unit: Wiring the Second Button

### The Problem

`createAccountButton` still does nothing. The same mechanism just built
applies directly, with a different message — genuinely nothing new to
teach, which is itself worth noticing: this is the payoff of learning the
interface/lambda mechanism properly once, rather than per button.

### The New Code

```java
createAccountButton.setOnClickListener((view) -> {
    String username = usernameField.getText().toString();
    String password = passwordField.getText().toString();
    Toast.makeText(this, "Creating account: " + username, Toast.LENGTH_SHORT).show();
});
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

        usernameField = findViewById(R.id.usernameField);
        passwordField = findViewById(R.id.passwordField);
        loginButton = findViewById(R.id.loginButton);
        createAccountButton = findViewById(R.id.createAccountButton);

        loginButton.setOnClickListener((view) -> {
            String username = usernameField.getText().toString();
            String password = passwordField.getText().toString();
            Toast.makeText(this, "Logging in: " + username, Toast.LENGTH_SHORT).show();
        });

        createAccountButton.setOnClickListener((view) -> {      // ← new
            String username = usernameField.getText().toString();
            String password = passwordField.getText().toString();
            Toast.makeText(this, "Creating account: " + username, Toast.LENGTH_SHORT).show();
        });
    }
}
```

Both buttons are now fully wired. Note honestly what this project
deliberately does *not* do yet: neither listener checks the password
against anything or stores a new account anywhere — there is no
persistence layer in this series' scope. Reading the typed values and
giving real, visible feedback is the actual UI requirement this
milestone satisfies; storing or checking credentials is backing logic
outside a UI-only project's scope.

### The Anonymous-Class Alternative, for Comparison

Lesson 14 taught the anonymous-class form as fully equivalent to a
lambda for a one-method interface. The exact same behavior, spelled the
older way:

```java
loginButton.setOnClickListener(new View.OnClickListener() {
    @Override
    public void onClick(View view) {
        String username = usernameField.getText().toString();
        String password = passwordField.getText().toString();
        Toast.makeText(MainActivity.this, "Logging in: " + username, Toast.LENGTH_SHORT).show();
    }
});
```

One real difference worth naming: inside an anonymous class, plain
`this` refers to the anonymous class instance itself, not
`MainActivity` — reaching the enclosing `Activity` requires the more
explicit `MainActivity.this`. A lambda has no class of its own being
created around it, so `this` inside a lambda always refers to the
enclosing class directly, exactly as used in the lambda version above.
This project uses lambdas throughout, both for brevity and to avoid this
exact `this`-versus-`MainActivity.this` distinction entirely.

### Mechanical Walkthrough

`createAccountButton.setOnClickListener((view) -> { ... })` is the
identical mechanism the previous unit already walked through in full —
`setOnClickListener` accepting a lambda implementing
`View.OnClickListener`'s single `onClick` method — applied to a second
`Button` field with a different message. No new construct appears in
this unit; the point being proven is that the mechanism, once learned,
needs no re-explanation to reuse.

### SE Lens

This unit is deliberately anticlimactic — real proof that a mechanism
learned properly once (a real interface, a real lambda, a real,
verified click handler) generalizes for free to every future button
this project ever adds, rather than needing its own fresh explanation
each time. That reuse is the actual payoff of Lesson 14's investment in
teaching interfaces from first principles instead of only showing the
lambda shorthand.

---

## Connect the Pieces

One trace, start to finish: a user types into `usernameField`
(Lesson 10). Tapping `loginButton` triggers the lambda registered on it
via `setOnClickListener` (this lesson) — the framework calling code you
handed it, at a moment of its own choosing (Lesson 07's Inversion of
Control, reappearing). Inside that lambda, `usernameField.getText()`
returns an `Editable` (a covariant override of `TextView`'s
`CharSequence`), `.toString()` converts it to a real `String`, and
`Toast.makeText(...).show()` displays it back to the user — the login
screen's full required interactivity, working, end to end.

## What Breaks Without This

Remove `.toString()` from one of the `getText()` calls, leaving
`String username = usernameField.getText();` and attempt to compile.
Real error:

```
error: incompatible types: Editable cannot be converted to String
```

This is the covariant-return-type concept made concrete: `Editable` is
related to `String` only in that both are, indirectly, kinds of
`CharSequence` — `Editable` is not itself a `String`, and the compiler
enforces that distinction exactly, proving `.toString()` isn't
decoration. Restore it before moving on.

## Exercises

1. Change `Toast.LENGTH_SHORT` to `Toast.LENGTH_LONG` on one button and
   run the app, confirming the visible difference in how long the
   message stays on screen.
2. Rewrite `createAccountButton`'s listener as an anonymous class instead
   of a lambda, matching the pattern shown in this lesson's comparison
   section, and confirm the app behaves identically either way.

## Definition of Done

- [ ] You can name the real interface `setOnClickListener` expects and
      its one method's exact signature, without looking it up.
- [ ] You triggered the real `Editable`-to-`String` compiler error
      yourself by removing `.toString()`.
- [ ] You can explain what a covariant return type is and point to where
      one is used in this exact lesson.
- [ ] Tapping either button on a running emulator/device shows a real
      `Toast` with the typed username.
- [ ] You can state, honestly, what this milestone does *not* yet do
      (check credentials, persist an account) and why that's out of
      scope rather than an oversight.
- [ ] Commit: `git commit -m "Wire login and create-account buttons to
      read form values and show Toast feedback"` — explaining what the
      buttons now do and don't do, not just that a listener was added.

Milestone 3 is done — a fully interactive login screen, every construct
in it explained from first principles, satisfying the login screen's
complete requirement set. Milestone 4 starts the data grid screen: a
second screen, and a real choice between three different ways to display
a grid of data.
