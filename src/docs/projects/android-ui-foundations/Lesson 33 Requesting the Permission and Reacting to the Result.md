# Lesson 33: Requesting the Permission and Reacting to the Result

**What you will build:** A real, working permission flow — tapping
"Enable Low-Stock Notifications" shows the actual Android system
permission dialog, and the screen updates honestly based on whatever the
user actually taps, satisfying the requirement that the app keeps working
either way. The transferable problem: this is the clearest, most
concrete Inversion-of-Control case in the entire series — the request
call returns immediately, long before any human has actually decided
anything, and the real answer arrives later, from a completely separate
system process, on a schedule this code cannot predict or control.

**What you need to know first:** Lesson 31 (the Notifications screen,
`ActivityResultContracts.RequestPermission` chosen over the legacy API),
Lesson 32 (the ternary operator).

**Terms introduced in this lesson:**
- **`PackageManager.PERMISSION_GRANTED`** — the constant a permission
  check compares against to determine whether access is currently
  allowed.
- **Idempotent check** — calling `checkSelfPermission` never itself
  changes anything or shows any UI; calling it any number of times has
  the same effect as calling it once.

**Objects and methods used:**

**`ContextCompat.checkSelfPermission(Context, String)`**
- *What it is:* a static method reporting whether a permission is
  currently granted.
- *Implementation:* `public static int checkSelfPermission(Context
  context, String permission)`, returning
  `PackageManager.PERMISSION_GRANTED` or `PERMISSION_DENIED` — an
  idempotent check, never itself changing anything or showing UI.
- *Its use:* wrapped in `isSmsPermissionGranted()`, called both once at
  screen open and again inside the button's own click listener.

**`getString(int)`**
- *What it is:* an `Activity` method resolving a string resource
  reference to its real text.
- *Implementation:* inherited (same chain as `findViewById`); the
  Java-code equivalent of the `@string/...` XML syntax Lesson 09
  introduced.
- *Its use:* called from `updateStatusText`, since this code sets text
  from Java rather than declaring it in a layout.

**Everything else in the file, not this lesson's subject but still
explained:**
- **`ActivityResultContracts.RequestPermission` / `registerForActivityResult`**
  - *What it is:* the modern, registered-callback permission-request
    API.
  - *Implementation:* given full treatment in Lesson 31.
  - *Its use:* the field-initializer pairing this lesson's `isGranted ->`
    lambda finally reacts through, now as real, running project code.
- **`findViewById`**
  - *What it is:* the generic, bounded method locating a `View` by its
    `android:id`.
  - *Implementation:* given full treatment in Lesson 13.
  - *Its use:* looks up `statusText` and `enableButton`, both inside
    `onCreate` and again inside the permission-result lambda.
- **The ternary operator**
  - *What it is:* the compact `condition ? a : b` expression.
  - *Implementation:* given full treatment in Lesson 32.
  - *Its use:* `updateStatusText`'s single-line choice between the
    granted and denied status strings.

---

## Concept Unit: Checking Before Asking

### The Problem

Showing a permission dialog every single time this screen opens, even if
the user already granted access on a previous visit, would be
needlessly repetitive and a real usability problem — Android's own
guidance is to check current status first, and only prompt when actually
necessary.

### Project Change

- **Reference Source:** `ContextCompat.checkSelfPermission`'s real,
  stable signature: `public static int checkSelfPermission(Context
  context, String permission)`, returning either
  `PackageManager.PERMISSION_GRANTED` or
  `PackageManager.PERMISSION_DENIED`.
- **Files affected:** `NotificationsActivity.java`.
- **Change type:** Add fields and methods; modify `onCreate`.
- **Dependencies:** None new.

### The New Code

```java
private void updateStatusText(TextView statusText, boolean granted) {
    statusText.setText(granted
        ? getString(R.string.notifications_status_granted)
        : getString(R.string.notifications_status_denied));
}

private boolean isSmsPermissionGranted() {
    return ContextCompat.checkSelfPermission(this, Manifest.permission.SEND_SMS)
        == PackageManager.PERMISSION_GRANTED;
}
```

### Mechanical Walkthrough

- `ContextCompat.checkSelfPermission(this, Manifest.permission.SEND_SMS)`
  — **first appearance.** A static method (reappearing, Lesson 01) that
  only *reports* current status — it never shows any UI and never
  changes anything, an **idempotent check**: calling it a hundred times
  in a row has the exact same effect and result as calling it once,
  unlike the actual request, which genuinely does something (shows a
  real dialog) each time it's triggered.
- `== PackageManager.PERMISSION_GRANTED` — **first appearance.**
  `checkSelfPermission` returns a plain `int`; `PERMISSION_GRANTED` (the
  value `0`) and its sibling `PERMISSION_DENIED` (`-1`) are named
  constants making the comparison readable, the same reasoning
  Lesson 10's `inputType` constants and Lesson 16's `Toast.LENGTH_SHORT`
  already relied on: a named constant instead of a bare magic number.
- `getString(R.string.notifications_status_granted)` — **first
  appearance of `getString` called from Java.** An `Activity` method
  (inherited, same chain as `findViewById`) resolving a string resource
  reference to its real text — the Java-code equivalent of the
  `@string/...` XML syntax Lesson 09 introduced, needed here because this
  code sets text from Java rather than declaring it in a layout.

### SE Lens

Why write a dedicated `isSmsPermissionGranted()` check at all, rather
than just always calling `requestSmsPermissionLauncher.launch(...)`
unconditionally and letting the system dialog itself short-circuit
if permission is already granted? Because triggering the real
permission-request flow at all is not free from the user's own
perspective — even if the OS happens not to show a visible dialog when
already granted, routing every visit through the request API by habit
trains the same disregard-inducing pattern permission overuse always
does. Checking first and requesting only when actually necessary keeps
the request itself meaningful, the same reasoning already given for why
dangerous permissions exist as their own tier at all.

---

## Concept Unit: Requesting and Reacting

### The Problem

With a way to check current status in hand, the button's tap needs to
actually trigger the real system prompt when access isn't already
granted, and the screen needs to honestly reflect whatever the user
decides.

### The New Code

```java
private final ActivityResultLauncher<String> requestSmsPermissionLauncher =
    registerForActivityResult(new ActivityResultContracts.RequestPermission(), isGranted -> {
        TextView statusText = findViewById(R.id.notificationStatusText);
        updateStatusText(statusText, isGranted);
    });
```

Inside `onCreate`, after `setContentView`:

```java
TextView statusText = findViewById(R.id.notificationStatusText);
updateStatusText(statusText, isSmsPermissionGranted());

Button enableButton = findViewById(R.id.enableNotificationsButton);
enableButton.setOnClickListener((view) -> {
    if (isSmsPermissionGranted()) {
        updateStatusText(statusText, true);
    } else {
        requestSmsPermissionLauncher.launch(Manifest.permission.SEND_SMS);
    }
});
```

### The Updated Project

```java
package com.yourname.yourapp;

public class NotificationsActivity extends AppCompatActivity {

    private final ActivityResultLauncher<String> requestSmsPermissionLauncher =
        registerForActivityResult(new ActivityResultContracts.RequestPermission(), isGranted -> {
            TextView statusText = findViewById(R.id.notificationStatusText);
            updateStatusText(statusText, isGranted);
        });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_notifications);

        TextView statusText = findViewById(R.id.notificationStatusText);
        updateStatusText(statusText, isSmsPermissionGranted());

        Button enableButton = findViewById(R.id.enableNotificationsButton);
        enableButton.setOnClickListener((view) -> {
            if (isSmsPermissionGranted()) {
                updateStatusText(statusText, true);
            } else {
                requestSmsPermissionLauncher.launch(Manifest.permission.SEND_SMS);
            }
        });
    }

    private void updateStatusText(TextView statusText, boolean granted) {
        statusText.setText(granted
            ? getString(R.string.notifications_status_granted)
            : getString(R.string.notifications_status_denied));
    }

    private boolean isSmsPermissionGranted() {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.SEND_SMS)
            == PackageManager.PERMISSION_GRANTED;
    }
}
```

In `strings.xml`:

```xml
<string name="notifications_status_granted">Notifications: enabled</string>
<string name="notifications_status_denied">Notifications: off — you won\'t receive low-stock alerts, but the app still works normally</string>
```

### Mechanical Walkthrough

- `private final ActivityResultLauncher<String> requestSmsPermissionLauncher = registerForActivityResult(...)`
  — reappearing from Lesson 31's comparison, now real project code. This
  is a field initializer, running when the object is constructed —
  **before** `onCreate` runs, satisfying the strict timing rule
  Lesson 31's SE Lens named.
- `isGranted -> { ... }` — a **lambda**, reappearing (Lesson 14),
  implementing the contract's own callback interface; `isGranted` is a
  plain `boolean` — the entire result a `RequestPermission` contract ever
  reports, by design, simpler than Option A's full `int[] grantResults`
  array.
- The `onCreate` block's own `updateStatusText(statusText, isSmsPermissionGranted())`
  call — **first thing this screen does**, showing accurate status
  immediately if the user already granted access on a prior visit,
  before any button tap at all.
- `enableButton.setOnClickListener((view) -> { if (isSmsPermissionGranted()) {...} else {...} })`
  — reappearing lambda/listener mechanism (Lesson 16); the `if` here is
  the idempotent-check payoff described above: tapping the button when
  access is already granted just re-confirms the status text rather than
  needlessly re-prompting.
- `requestSmsPermissionLauncher.launch(Manifest.permission.SEND_SMS)` —
  **first appearance.** Triggers the real system permission dialog;
  `Manifest.permission.SEND_SMS` is a `String` constant Android itself
  provides, naming this exact permission precisely (avoiding any typo
  risk from writing the raw string `"android.permission.SEND_SMS"` by
  hand).
- `granted ? getString(...) : getString(...)` — Lesson 32's ternary
  operator, reappearing in real project code for the first time — used
  here because both branches only ever do one thing (pick a string),
  making the full `if`/`else` block this could otherwise be genuinely less
  readable than the compact form.

### Execution Trace — the Real Timing of an Asynchronous Permission Result

This is precisely the "second shape" of trace — a callback firing later,
at a moment the code doesn't control, with no changing data to tabulate,
only real ordering to prove:

1. `NotificationsActivity` is constructed. Its field initializer runs
   `registerForActivityResult(...)`, pairing the `RequestPermission`
   contract with the `isGranted -> {...}` lambda — this only registers
   the pairing; no dialog has appeared, and the lambda's body has not
   run.
2. `onCreate` runs, calling `isSmsPermissionGranted()` once to set
   accurate initial status text — say the permission was never
   previously granted, so the screen shows "Notifications: off...".
3. The user taps "Enable Low-Stock Notifications." Inside the click
   lambda, `isSmsPermissionGranted()` is checked again — still `false` —
   so `requestSmsPermissionLauncher.launch(...)` runs, asking the OS to
   show the real system dialog. This call **returns immediately** — the
   click lambda finishes and returns control to the OS's own event
   handling, with no answer yet known.
4. The OS displays its own real permission dialog, entirely outside this
   app's layout or code — a genuinely separate UI, owned by the system,
   not `NotificationsActivity`.
5. Some real amount of time later — however long the user takes to
   actually read and tap "Allow" or "Deny" — the OS calls the registered
   lambda from step 1, passing the real decision as `isGranted`.
   Everything inside that lambda runs **now**, for the first time, not
   at step 1 when it was merely registered.
6. `updateStatusText` runs with the real result, and the screen finally
   reflects the user's actual decision — the gap between step 3 (asking)
   and step 6 (finding out) is exactly as long as the user takes to
   respond, and this code has no way to shorten, predict, or block on
   that gap; it can only wait for the callback to eventually fire.

### CS Lens

This is the same **Inversion of Control** thread traced through Lessons
04, 11, 12, and 21 — reappearing here at its clearest: the gap between
"request sent" (step 3) and "callback fires" (step 5) spans a real human
decision the app has no way to observe directly, only to be notified of
afterward.

### SE Lens

**Why must the app keep working correctly regardless of which way the
user answers, rather than assuming permission will be granted?**
Denying a permission is the user's legitimate right, not an error
condition or an edge case to tolerate poorly — this project's own status
text for the denied case says so honestly ("the app still works normally")
rather than treating denial as a failure. Designing for both outcomes
from the start, as this lesson's `if`/`else` and both status strings do,
is what keeps a refused permission from ever degrading into a crash or a
broken screen — exactly the requirement this milestone exists to satisfy.

---

## Connect the Pieces

The full trace across this milestone: Lesson 30's Manifest declarations
made `SEND_SMS` requestable at all. Lesson 31 chose the modern,
registered-callback API over the older request-code pattern. This
lesson's `isSmsPermissionGranted()` avoids needless re-prompting, and
`requestSmsPermissionLauncher.launch(...)` triggers the real system
dialog whose eventual answer — arriving asynchronously, on the OS's own
schedule — updates the screen honestly whichever way the user actually
decides.

## What Breaks Without This

Move the `registerForActivityResult(...)` call out of the field
initializer and into `onCreate`, placed **after** a deliberately added
`getSupportFragmentManager().executePendingTransactions();` line (a real
call that advances the Activity past the point registration is still
permitted) — or, more simply, attempt to call
`registerForActivityResult(...)` conditionally, inside the button's own
click listener, instead of unconditionally at construction time. This
produces a real, captured crash, confirmed by Android's own documented
behavior for this exact misuse:

```
java.lang.IllegalStateException: LifecycleOwners must call register before they are STARTED.
```

This is the strict timing rule from Lesson 31's SE Lens, made concrete:
`registerForActivityResult` genuinely cannot be deferred or made
conditional — it must run unconditionally, early, regardless of whether
that specific request ever actually fires later. Restore the field-
initializer version before moving on.

## Exercises

1. Grant the permission once, then leave and re-enter
   `NotificationsActivity` (navigate back to the grid, then tap the
   notifications button again). Confirm the status text correctly shows
   "enabled" immediately, with no dialog re-appearing — direct proof of
   `isSmsPermissionGranted()`'s idempotent check working as intended.
2. In your device or emulator's own system Settings, manually revoke the
   permission after granting it once, then reopen
   `NotificationsActivity` and confirm the status text correctly reverts
   to reflecting the real, current system state rather than remembering
   a stale "enabled" value from earlier.

## Definition of Done

- [ ] Tapping "Enable Low-Stock Notifications" shows the real system
      permission dialog on an emulator or device.
- [ ] Both a real "Allow" and a real "Deny" tap correctly update the
      status text, and the app does not crash or break in either case.
- [ ] You triggered the real `IllegalStateException` from a
      conditionally-called `registerForActivityResult`, and restored the
      correct, unconditional version.
- [ ] You performed the revoke-in-Settings exercise and confirmed the
      screen reflects real, current system state rather than a
      remembered value.
- [ ] Commit: `git commit -m "Request SEND_SMS at runtime via
      ActivityResultContracts and react to both grant and denial"` —
      explaining that both outcomes are handled, not just that a
      permission request was added.

Milestone 6 is done — the SMS permission requirement is fully satisfied:
declared in the Manifest, requested at runtime through the current
recommended API, and both outcomes handled honestly. Milestone 7 begins
the final requirement: a consistent visual theme and grouping across
every screen already built.
