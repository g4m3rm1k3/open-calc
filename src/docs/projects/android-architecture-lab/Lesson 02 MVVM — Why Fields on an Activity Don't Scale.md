# Lesson 02: MVVM — Why Fields on an Activity Don't Scale

**What you will build:** A minimal, real login screen — one field, one
button, one `TextView` counting failed attempts — built with exactly
the `View`/layout mechanics `android-ui-foundations` already taught in
full, plus one deliberate real bug: rotate the device after a failed
login attempt, and the failed-attempt count silently resets to zero.
The transferable problem: `android-ui-foundations`' own
`MainActivity`/`InventoryActivity` held every piece of real state
directly as fields on the `Activity` itself, and that project never had
occasion to test what happens to that state the moment the OS destroys
and rebuilds the `Activity` out from under it — which it genuinely
does, on every rotation, by design.

**What you need to know first:** `android-ui-foundations` in full —
specifically Lesson 08 (`LinearLayout`), Lesson 10 (`EditText`), Lesson
11 (`Button`), Lesson 13 (fields, `findViewById`), Lesson 16
(`setOnClickListener`). `android-architecture-lab` Lesson 01 (this
project's own package structure).

**Terms introduced in this lesson:**
- **Configuration change** — a real, OS-level event (rotating the
  device, among others) that changes something about the device's
  current configuration and, by Android's own default design, destroys
  and recreates the current `Activity` from scratch.
- **MVVM (Model–View–ViewModel)** — an architectural pattern separating
  a screen's own real, persistent data (the Model, reached through a
  ViewModel) from the `Activity`/`Fragment` that merely displays it (the
  View) — introduced here conceptually; its real, working
  implementation is next lesson's own subject.

**Objects and methods used:** none new — this lesson's own real code
reuses `android-ui-foundations`' already-taught `View`/layout
mechanics exactly as they stand; the bug this lesson reproduces is
architectural, not a new API.

---

## Concept Unit: Reproducing a Real, Concrete Bug

### The Problem

`android-ui-foundations` never tested what happens to a plain field on
an `Activity` when the `Activity` itself is destroyed and rebuilt — a
real, common event this project needs to confront directly before
trusting any pattern to fix it.

### Introduce the Concept in Isolation

A minimal login screen, `login/LoginActivity.java`, in the real,
already-taught shape:

`res/layout/activity_login.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="24dp">

    <EditText
        android:id="@+id/passwordField"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Password"
        android:inputType="textPassword" />

    <Button
        android:id="@+id/loginButton"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Log In" />

    <TextView
        android:id="@+id/attemptCountText"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Failed attempts: 0" />

</LinearLayout>
```

`LoginActivity.java`:

```java
package com.yourname.inventoryapp.login;

import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import com.yourname.inventoryapp.R;

public class LoginActivity extends AppCompatActivity {
    private int failedAttempts = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        EditText passwordField = findViewById(R.id.passwordField);
        Button loginButton = findViewById(R.id.loginButton);
        TextView attemptCountText = findViewById(R.id.attemptCountText);

        loginButton.setOnClickListener((view) -> {
            String password = passwordField.getText().toString();
            if (!password.equals("correct-password")) {
                failedAttempts++;
                attemptCountText.setText("Failed attempts: " + failedAttempts);
            }
        });
    }
}
```

### Run It Yourself

This is genuinely Android-only behavior — no plain-JVM equivalent
proves it, since it depends on the real OS lifecycle, not ordinary
Java. Run this real code on an emulator or device: type any wrong
password and tap "Log In" three separate times, confirming
`attemptCountText` really does read "Failed attempts: 3." Now rotate
the emulator once (Ctrl+F11, or the rotate control). Real, observed
result, from doing this just now: the screen redraws in landscape, and
`attemptCountText` reads **"Failed attempts: 0"** — the real count from
three genuine failed attempts, silently gone.

### Mechanical Walkthrough

- `private int failedAttempts = 0;` — an ordinary field
  (`android-ui-foundations` Lesson 13's own reasoning), holding this
  screen's one real piece of state beyond what the layout itself
  displays.
- `LoginActivity extends AppCompatActivity` through
  `loginButton.setOnClickListener(...)` — every line here reuses
  already-taught `android-ui-foundations` mechanics exactly: `extends`
  (Lesson 06), `onCreate`/`setContentView` (Lesson 07),
  `findViewById` (Lesson 13), `setOnClickListener` (Lesson 16). Nothing
  in this specific code block is new.
- `attemptCountText.setText(...)` correctly reads `"Failed attempts:
  0"` again after rotation — not because anything reset it back to
  zero on purpose, but because rotation genuinely built a **brand-new**
  `LoginActivity` object, with a brand-new `failedAttempts` field,
  freshly initialized to `0` by the exact same field-initializer that
  ran the very first time this Activity was ever created.

### CS Lens

A **configuration change** destroying and recreating an `Activity` is
Android's own real, deliberate design — not a bug, and not
Android-specific in spirit: the OS needs to rebuild the entire visual
tree against the *new* configuration (screen dimensions swapped,
different available resources for a `-land` variant if one exists), and
the simplest, most reliably correct way to guarantee that is to throw
away the old `Activity` object entirely and build a genuinely new one
from scratch, running `onCreate` again exactly as if the app had just
started.

Also recognized in: any system that favors "rebuild from a known-good
starting state" over "attempt to patch existing state in place" when
underlying conditions change significantly — a web browser tab
reloading a page after certain settings change, rather than attempting
to patch the already-rendered DOM in place.

### SE Lens

**Why doesn't Android just leave the existing `Activity` object alone
and skip `onCreate` entirely on a configuration change, avoiding this
problem altogether?** The alternative would require Android to
correctly patch every already-inflated `View`'s own layout, sizing, and
resource references in place, for every possible configuration change
(rotation, language change, dark mode toggle, and others) — a far more
complex and error-prone guarantee than "just run the same, already-
correct startup sequence again, against the new configuration." The
real cost of that simpler, more reliable guarantee is exactly what this
lesson just proved: any state living *only* in a plain field is
genuinely gone the moment it happens, unless something deliberately
protects it.

---

## Concept Unit: MVVM — Separating What Survives From What Doesn't

### The Problem

`android-ui-foundations`' own fix for exactly this class of problem —
`Bundle savedInstanceState`, flagged back in that series' own Lesson
07 as "recognition only, not used for real" — genuinely works, but
requires manually packing and unpacking every single value that needs
to survive, by hand, in every `Activity` that has any. A real,
larger app accumulates real state fast enough that this becomes a
genuine, repetitive maintenance burden — not the sort of fix this
project's own architecture should lean on as its primary defense.

### The Real Pattern

**MVVM** — Model, View, ViewModel — assigns each of three real
responsibilities to its own, separate class:

- **Model** — the real, underlying data and the logic to fetch or
  change it (this project's own `Repository`/`Room` layer, built
  starting Lesson 04).
- **View** — the `Activity`/`Fragment` itself: responsible *only* for
  displaying data and forwarding user actions onward — never for
  holding onto that data as its own, permanent source of truth.
- **ViewModel** — a real, separate object, deliberately built to
  **outlive** the specific `Activity` instance that's currently
  displaying it — Lesson 03's own real subject, and the concrete fix
  for the exact bug this lesson just reproduced.

### Mechanical Walkthrough

Mapping this lesson's own reproduced bug onto the three real roles,
concretely:

- `failedAttempts` itself — real **Model** data: a fact about this
  login session's own state, not about how it's drawn on screen.
- `attemptCountText.setText(...)` — real **View** work: taking a value
  and putting it on screen, the one job `LoginActivity` should actually
  keep doing.
- The missing piece — an object holding `failedAttempts` that
  `LoginActivity` merely *asks* for a current value, rather than
  *owning* the value directly as its own field — is exactly the
  **ViewModel** role, currently played by nothing at all in this
  lesson's own code, which is precisely why the bug above happened.

### CS Lens

MVVM is a specific application of **separation of concerns**
(`android-ui-foundations` Lesson 09's own principle, reappearing at
architectural scale): rather than one class — the `Activity` — owning
layout inflation, user-event handling, *and* the screen's own real
data, each concern moves to the one class whose job is specifically
that, and only that.

Also recognized in: the broader **MVC** (Model-View-Controller) family
of UI architectures this pattern is itself a real, named variant of —
web frameworks (Rails, Django), desktop UI frameworks, and virtually
every mature, professional UI codebase across every platform draws this
same real line somewhere.

### SE Lens

**Why does the "View" in MVVM specifically need to *not* own real data,
rather than just being more careful about saving and restoring it
manually, the way `savedInstanceState` already allows?** Manual
save/restore genuinely works, but scales linearly with the amount of
state a screen has, and is trivially easy to forget for exactly one
new field added later, silently reintroducing this lesson's own bug one
field at a time. Moving ownership of real data *out* of the `Activity*`
entirely, into an object designed from the start to survive what the
`Activity` doesn't, removes the entire category of "did I remember to
save this one" — there's nothing to remember, because the `Activity`
was never the thing responsible for remembering it in the first place.

---

## Connect the Pieces

One trace: `LoginActivity`'s own `failedAttempts` field, incremented
three real times through three real failed login attempts, was
genuinely, observably lost the moment a real configuration change
destroyed and rebuilt the `Activity` — not a hypothetical concern, a
real bug just reproduced on a real device. MVVM's own real fix is
architectural, not a patch: move `failedAttempts` (and every other
piece of this screen's own real data) out of `LoginActivity` entirely,
into an object built specifically to survive what `LoginActivity`
itself cannot. Building that real object — a `ViewModel` — is next
lesson's entire subject.

## What Breaks Without This

Already shown above, directly: three real, deliberate failed login
attempts, followed by one real rotation, produced a real, incorrect
"Failed attempts: 0" — the exact, concrete cost of trusting a plain
field with data that needs to survive past a single `Activity`
instance's own lifetime. Every lesson from here forward in this series
builds the real fix.

## Exercises

1. Add a second plain field to `LoginActivity` — a `boolean`
   remembering whether the password field should currently be masked or
   shown in plain text — wire a "Show Password" toggle button to it,
   and confirm this new field is lost on rotation exactly the same way,
   direct proof this isn't specific to counting failed attempts, it's
   general to any plain field.
2. Look up `android:configChanges` in Android's own documentation — a
   real, existing Manifest attribute that can suppress the
   destroy-and-recreate behavior for specific configuration changes —
   and explain, in your own words, why this project's own SE Lens above
   would call it a real workaround rather than a real fix (a hint:
   consider what happens to a language change, or a multi-window resize,
   two other real configuration changes `android:configChanges` would
   need to be told about individually).

## Definition of Done

- [ ] You built the real login screen and reproduced the real,
      observed bug yourself — a real, nonzero failed-attempt count
      resetting to zero after a real rotation.
- [ ] You can explain, in your own words, why Android destroys and
      recreates an `Activity` on a configuration change, rather than
      patching the existing one in place.
- [ ] You can name the three real responsibilities MVVM separates, and
      which of `android-ui-foundations`' own classes played which role,
      unlabeled, all along.
- [ ] Commit: `git commit -m "Reproduce the real data-loss-on-rotation
      bug MVVM exists to fix"` — explaining the bug being reproduced,
      not just that a login screen was added.

Next: `ViewModel` — building the real object this bug has been waiting
for, and watching the exact same three failed attempts survive the
exact same rotation.
