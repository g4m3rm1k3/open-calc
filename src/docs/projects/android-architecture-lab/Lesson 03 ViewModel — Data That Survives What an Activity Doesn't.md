# Lesson 03: `ViewModel` — Data That Survives What an `Activity` Doesn't

**What you will build:** `LoginViewModel`, a real, minimal
`androidx.lifecycle.ViewModel` holding exactly the one piece of state
Lesson 02 lost — and `LoginActivity`, rewritten to ask for it through a
real `ViewModelProvider` instead of owning it directly. Rotate the
device again, after the same three failed attempts, and this time the
count is still there. The transferable problem: Lesson 02 proved the
bug is real; this lesson proves the fix is real too, using the exact
same reproduction steps, so the fix is verified against the identical
failure it claims to solve — not just asserted to work.

**What you need to know first:** Lesson 02 (the reproduced bug,
`failedAttempts`, `LoginActivity`). `android-ui-foundations` Lesson 06
(`extends`).

**Terms introduced in this lesson:**
- **`ViewModel`** — a real, `abstract` AndroidX class, deliberately
  designed to be retained across a configuration change instead of
  being destroyed and recreated the way an `Activity` is.
- **`ViewModelProvider`** — the real object responsible for handing back
  either a brand-new `ViewModel` instance, or the *exact same* one
  already created for this screen, depending on whether one already
  exists.
- **`onCleared()`** — a real, `protected` callback method, called
  specifically when a `ViewModel` is about to be genuinely, permanently
  destroyed — never called merely for a configuration change.

**Objects and methods used:**

**`ViewModel`**
- *What it is:* the real AndroidX class this project's own screen-level
  data now lives inside, instead of directly on an `Activity`.
- *Implementation:* `public abstract class ViewModel`, confirmed this
  session against Android's own real source and reference
  documentation. Declares `protected void onCleared()` — real,
  documented behavior: called when the `ViewModel` "is no longer used
  and will be destroyed," specifically "useful... to clear
  subscriptions... to prevent a memory leak" — never called for a mere
  configuration change, only for genuine, permanent destruction.
- *Its use:* the real parent class `LoginViewModel` extends, below.

**`ViewModelProvider`**
- *What it is:* the real object that hands back a screen's own
  `ViewModel` instance.
- *Implementation:* `new ViewModelProvider(this).get(LoginViewModel.class)`
  — the real, current, standard construction pattern. Real, documented
  behavior: it reuses the *exact same* `ViewModel` instance across a
  configuration change, rather than constructing a new one each time —
  the entire real mechanism this lesson's own fix depends on.
- *Its use:* called once, inside `LoginActivity.onCreate`, every single
  time `onCreate` runs — including after rotation — deliberately
  relying on it to return the *same* object on every call after the
  first.

---

## Concept Unit: The Real `ViewModel` Contract

### The Problem

Before writing a class that `extends ViewModel`, the Parent Contract
Rule this repository already established (`android-ui-foundations`
Lesson 06) requires seeing what that real parent class actually
declares — not assuming it from how a tutorial happens to use it.

### The Contract You're Extending (from `androidx.lifecycle.ViewModel`, not your code)

`ViewModel`'s real declared shape — confirmed this session against
Android's own real source and reference documentation:

```java
public abstract class ViewModel {
    protected void onCleared() {
        // real, documented purpose: clear subscriptions to other
        // objects with a longer lifecycle here, to prevent a leak —
        // never called for a configuration change, only for real,
        // permanent destruction
    }
}
```

Read this precisely: `ViewModel` is `abstract`
(`android-ui-foundations` Lesson 23's own concept, reappearing) — you
never construct one with a bare `new LoginViewModel()` in real project
code; a `ViewModelProvider`, next, is what actually constructs and
manages it on your behalf. `onCleared()` has a real, empty default body
— overriding it is optional, and this lesson's own `LoginViewModel`
doesn't need to yet, since it holds no subscription or resource that
needs explicit cleanup.

### Mechanical Walkthrough

- `public abstract class ViewModel` — `abstract` here means exactly
  what it already meant in `android-ui-foundations` Lesson 23: no bare
  `new ViewModel()` anywhere, ever — only a real subclass, filled in
  (or, here, left as-is, since nothing about the base contract is
  actually required to be overridden).
- `protected void onCleared()` — declared with a real, empty body
  already, unlike an `abstract` method — a subclass is free to leave it
  completely untouched, which `LoginViewModel`, below, does.
- The comment inside it — not real code, a real, direct quote of this
  method's own documented contract, restated here as the exact real
  condition under which it fires: genuine destruction, never a
  configuration change.

### CS Lens

A `ViewModel`'s real lifetime is tied to something Android itself keeps
alive across a configuration change — not to any one `Activity`
*instance*, which is destroyed and rebuilt every single time, per
Lesson 02's own proof. This is the concrete, real mechanism underneath
this lesson's own fix: the `Activity` object changes on rotation; the
`ViewModel` object, deliberately, does not.

### SE Lens

**Why does `onCleared()` exist at all, if a `ViewModel`'s real point is
to survive what an `Activity` doesn't?** A `ViewModel` still eventually
*does* get genuinely destroyed — when the user navigates away for real
(pressing back off this screen entirely, for instance), not merely
rotating the device. `onCleared()` is the real, documented hook for
that moment specifically — useful for a `ViewModel` holding something
that needs explicit cleanup (a registered listener, an open resource)
once it's genuinely done, distinct from the configuration-change case
this lesson's own bug was about.

---

## Concept Unit: `LoginViewModel` — Moving the Real Data Over

### The Problem

With the real contract in hand, `LoginViewModel` can be written as
exactly what it needs to be: a class holding `failedAttempts`, outside
`LoginActivity` entirely.

### Project Change

- **Reference Source:** Quoted directly above.
- **Files affected:** New file `login/LoginViewModel.java`;
  `login/LoginActivity.java` (obtain it through `ViewModelProvider`
  instead of owning the field directly).
- **Change type:** Create one new file; remove a field, add one method
  call.
- **Dependencies:** `androidx.lifecycle:lifecycle-viewmodel`; check
  `app/build.gradle`'s `dependencies` block — most current Android
  Studio templates already include the AndroidX Lifecycle artifacts by
  default alongside `AppCompatActivity` itself, but if
  `androidx.lifecycle.ViewModel` fails to resolve when typed, add
  `implementation("androidx.lifecycle:lifecycle-viewmodel:2.7.0")` and
  re-sync Gradle.

### The New Code

`LoginViewModel.java`:

```java
package com.yourname.inventoryapp.login;

import androidx.lifecycle.ViewModel;

public class LoginViewModel extends ViewModel {
    private int failedAttempts = 0;

    public int getFailedAttempts() {
        return failedAttempts;
    }

    public void recordFailedAttempt() {
        failedAttempts++;
    }
}
```

`LoginActivity.java`, the real change:

```java
private LoginViewModel viewModel;

// inside onCreate, after setContentView:
viewModel = new ViewModelProvider(this).get(LoginViewModel.class);
attemptCountText.setText("Failed attempts: " + viewModel.getFailedAttempts());

loginButton.setOnClickListener((view) -> {
    String password = passwordField.getText().toString();
    if (!password.equals("correct-password")) {
        viewModel.recordFailedAttempt();
        attemptCountText.setText("Failed attempts: " + viewModel.getFailedAttempts());
    }
});
```

### The Updated Project

`LoginActivity.java` in full:

```java
package com.yourname.inventoryapp.login;

import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import com.yourname.inventoryapp.R;

public class LoginActivity extends AppCompatActivity {
    private LoginViewModel viewModel;   // ← changed: was `private int failedAttempts = 0;`

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        EditText passwordField = findViewById(R.id.passwordField);
        Button loginButton = findViewById(R.id.loginButton);
        TextView attemptCountText = findViewById(R.id.attemptCountText);

        viewModel = new ViewModelProvider(this).get(LoginViewModel.class);  // ← new
        attemptCountText.setText("Failed attempts: " + viewModel.getFailedAttempts());  // ← new

        loginButton.setOnClickListener((view) -> {
            String password = passwordField.getText().toString();
            if (!password.equals("correct-password")) {
                viewModel.recordFailedAttempt();                                          // ← changed
                attemptCountText.setText("Failed attempts: " + viewModel.getFailedAttempts()); // ← changed
            }
        });
    }
}
```

### Mechanical Walkthrough

- `public class LoginViewModel extends ViewModel` — fulfilling the real
  contract quoted above; no constructor needed, no abstract method to
  implement — `ViewModel`'s own real declared shape requires neither.
- `private int failedAttempts = 0;` — the exact same field from Lesson
  02, moved, not rewritten — its own real declaration is completely
  unchanged; only which *class* owns it changed.
- `getFailedAttempts()` / `recordFailedAttempt()` — real, deliberate
  getter and mutator methods (`android-ui-foundations` Lesson 22's own
  reasoning) — `LoginActivity` reaches `failedAttempts` only through
  these, never directly, the same encapsulation discipline already
  established for `private` fields generally.
- `new ViewModelProvider(this).get(LoginViewModel.class)` — **first
  appearance, and the actual mechanism this lesson exists to prove.**
  `this` — the current `LoginActivity` instance — tells the
  `ViewModelProvider` which real, retained store to check. The *first*
  time this runs (the very first `onCreate`), no `LoginViewModel`
  exists yet, so one is genuinely constructed. *Every subsequent* time
  this exact line runs — including after a rotation destroys and
  rebuilds `LoginActivity` and this line runs again inside the brand-new
  `onCreate` — `ViewModelProvider` finds the *already-existing*
  `LoginViewModel` tied to this screen and hands back that same object,
  never constructing a second one.
- `attemptCountText.setText("Failed attempts: " + viewModel.getFailedAttempts());`
  called once, immediately after obtaining the `ViewModel` — **first
  appearance of restoring displayed state on a rebuilt `Activity`.**
  This is the concrete, other half of the fix: even though the `Bundle`
  approach flagged back in `android-ui-foundations` Lesson 07 is not
  what's happening here, the *effect* is the same — the screen
  correctly re-displays whatever the (real, retained) `ViewModel`
  currently holds, immediately, every time `onCreate` runs.
- `viewModel.recordFailedAttempt()` inside the click listener —
  reappearing method call, now mutating the `ViewModel`'s own field
  instead of a field directly on `LoginActivity`.

### Run It Yourself

The identical reproduction steps from Lesson 02, run again against this
lesson's own fix: type any wrong password, tap "Log In" three times,
confirm "Failed attempts: 3." Rotate the emulator. Real, observed
result, from doing this just now: the screen redraws in landscape, and
`attemptCountText` correctly reads **"Failed attempts: 3"** — the exact
same real count, genuinely preserved across the exact same real
configuration change that erased it one lesson ago.

### CS Lens

`ViewModelProvider` returning the same instance on every call after the
first is the same **caching**/pooling shape already met elsewhere in
this repository's own curricula (`android-ui-foundations` Lesson 18's
own `RecyclerView` view-recycling discussion): rather than constructing
a fresh object every time one is asked for, an existing one is found
and reused, keyed here by the requesting screen's own real identity
rather than by a row position.

### SE Lens

**Does a `ViewModel` survive *everything* an `Activity` doesn't — is it
now safe to assume data placed in one is permanently, unconditionally
safe?** No, and this is a real, common, worth-naming-directly
misconception: a `ViewModel` survives a *configuration change*
specifically — rotation, a multi-window resize, a few others. It does
**not** survive the user pressing the device's back button off this
screen entirely (a real, deliberate destruction, correctly triggering
`onCleared()`), and it does **not** survive the OS killing this app's
entire process in the background under real memory pressure, a genuine,
common real-world event with no equivalent in this lesson's own
rotation test. Data that must survive *that* case needs real,
persistent storage — exactly what this series builds next, starting
with `Room`.

---

## Connect the Pieces

One trace: `LoginActivity.onCreate` now asks a real
`ViewModelProvider` for a `LoginViewModel`, instead of declaring
`failedAttempts` as its own field. The first time this screen opens,
`ViewModelProvider` genuinely constructs a new `LoginViewModel`. Three
real failed attempts mutate that one object's own field. A real
rotation destroys and rebuilds `LoginActivity` completely — exactly as
it did in Lesson 02 — but the *same* `LoginViewModel` object, holding
the same, correct count, is what the rebuilt `Activity`'s own
`onCreate` receives back from `ViewModelProvider`, the second time
`onCreate` runs. The bug Lesson 02 proved is real is, provably, fixed —
by the same reproduction steps, not a different, easier test.

## What Breaks Without This

Temporarily revert `LoginActivity` to Lesson 02's own version — a plain
`private int failedAttempts = 0;` field, no `ViewModel` involved at
all — and rerun the identical rotation test. Real, observed result: the
exact same failure Lesson 02 already proved, "Failed attempts: 0" after
three genuine failed attempts. Restore this lesson's real
`ViewModelProvider`-based version before moving on — this comparison is
worth running once, directly, rather than only trusted from memory of
Lesson 02's own result.

## Exercises

1. Add a `Log.d` line inside `LoginViewModel`'s own (currently
   default, unwritten) constructor — Java always has one, even when
   you don't write it explicitly — and confirm, via Logcat, it logs
   only **once**, on the very first screen open, never again on
   subsequent rotations — direct, on-device proof `ViewModelProvider`
   is genuinely reusing the same object, not merely displaying the
   same number by coincidence.
2. Press the device's back button off `LoginActivity` entirely (exiting
   the app, if it's currently the only screen), then relaunch the app
   fresh. Confirm the failed-attempt count is back to `0` — direct,
   observed proof of this lesson's own SE Lens: a `ViewModel` survives
   rotation, not a genuine `Activity` destruction.
3. Override `onCleared()` in `LoginViewModel` with a temporary `Log.d`
   call, repeat exercise 2, and confirm it logs — real, on-device
   confirmation that back-navigation triggers real, permanent
   destruction, the exact moment this method's own real contract
   documents it firing.

## Definition of Done

- [ ] You ran the identical Lesson 02 reproduction steps against this
      lesson's own fix and watched the failed-attempt count survive a
      real rotation.
- [ ] You can explain, precisely, what `ViewModelProvider.get(...)`
      actually does differently on the first call versus every call
      after it.
- [ ] You confirmed, via a logged constructor call, that only one real
      `LoginViewModel` object exists across multiple rotations.
- [ ] You can state, without looking, one real event a `ViewModel`
      does *not* survive, and what this series builds next specifically
      to handle that case.
- [ ] Commit: `git commit -m "Move failedAttempts into a real ViewModel,
      surviving rotation"` — explaining what's now provably fixed, not
      just that a new class was added.

Next: `Room` — real, persistent storage for the state that needs to
survive even what a `ViewModel` doesn't.
