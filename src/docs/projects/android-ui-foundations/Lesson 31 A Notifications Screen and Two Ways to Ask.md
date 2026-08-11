# Lesson 31: A Notifications Screen and Two Ways to Ask

**What you will build:** A third screen — reached the same way
Milestone 4 reached the grid — with one button and one status message,
set up to receive a runtime permission result, plus a real, worked
comparison of the two ways Android lets an app actually ask for a
dangerous permission. The transferable problem: Lesson 30 proved a
Manifest declaration alone can't grant a dangerous permission; something
has to trigger the actual system dialog, at a moment the app chooses, and
Android's own history offers two genuinely different, both-real ways to
do it.

**What you need to know first:** Lesson 17 (`Intent`, `startActivity`,
navigating to a new screen), Lesson 30 (the Manifest declarations this
screen's request depends on).

**Terms introduced in this lesson:**
- **`ContextCompat.checkSelfPermission`** — a method returning whether a
  given permission is currently granted, without showing any prompt.
- **`ActivityResultContracts.RequestPermission` (the option this project
  builds)** — a modern, type-safe API for requesting one runtime
  permission and receiving its result via a registered callback.
- **`ActivityCompat.requestPermissions` / `onRequestPermissionsResult`
  (recognition, real alternative)** — the older, longer-standing API for
  the same job, using a request-code-based callback instead of a
  registered one.

**Objects and methods used**
- `Activity` — the framework base class every screen extends, Lesson
  06 — `Intent` — an object describing a request for the OS to do
  something, Lesson 17 — and `startActivity` — the method handing an
  `Intent` to the OS to act on, Lesson 17 — reappear here exactly as
  before, building and launching this third screen.
  `ContextCompat.checkSelfPermission`,
  `ActivityResultContracts.RequestPermission`, and
  `ActivityCompat.requestPermissions` are this lesson's own subject,
  given full treatment above.

---

## Concept Unit: A Third Screen

### The Problem

The permission request needs somewhere to live with its own button and
status display — the same structural need Lesson 17 already solved for
the grid screen.

### Project Change

- **Reference Source:** No reference counterpart — an application
  Activity, same shape as `InventoryActivity`.
- **Files affected:** New file
  `app/src/main/java/com/yourname/yourapp/NotificationsActivity.java`;
  new file `app/src/main/res/layout/activity_notifications.xml`;
  `AndroidManifest.xml`; `InventoryActivity.java` (a button to reach it).
- **Change type:** Create two new files; add a Manifest entry; add a
  button and navigation to an existing file.
- **Dependencies:** None new.

### The New Code

`activity_notifications.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="24dp">

    <TextView
        android:id="@+id/notificationStatusText"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="@string/notifications_status_unknown" />

    <Button
        android:id="@+id/enableNotificationsButton"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="@string/enable_notifications_button_label" />

</LinearLayout>
```

`NotificationsActivity.java`:

```java
package com.yourname.yourapp;

public class NotificationsActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_notifications);
    }
}
```

In `strings.xml`:

```xml
<string name="notifications_status_unknown">Notifications: not yet requested</string>
<string name="enable_notifications_button_label">Enable Low-Stock Notifications</string>
```

In `AndroidManifest.xml`, alongside the existing `<activity>` entries:

```xml
<activity
    android:name=".NotificationsActivity"
    android:exported="false" />
```

In `InventoryActivity.java`, one new button wired with the same
`Intent`/`startActivity` pattern from Lesson 17:

```java
Button notificationsButton = findViewById(R.id.notificationsButton);
notificationsButton.setOnClickListener((view) ->
    startActivity(new Intent(this, NotificationsActivity.class)));
```

### Mechanical Walkthrough

Every construct here — `LinearLayout`, `TextView`, `Button`, a new
`Activity` subclass, a new Manifest `<activity>` entry, `Intent`,
`startActivity`, a lambda-based click listener — is a direct reappearance
of Lessons 06–17, applied to a third screen. No new concepts in this
unit; the point worth noticing is that building a new screen is now fast
and familiar, the actual payoff of having learned each piece once,
properly, rather than by pattern-matching a template.

### SE Lens

Why does this project keep the permission-request screen separate from
the grid screen, rather than requesting the permission the moment the
app first launches? Asking for a dangerous permission with no visible,
immediate reason attached is a well-documented way to make a user
reflexively deny it — a permission request tied to a specific screen
whose purpose is obviously connected to that permission (a
"Notifications" screen asking for SMS access) gives the user real
context for what they're being asked to grant, and why.

---

## Concept Unit: Two Real Ways to Request a Dangerous Permission

### The Problem

With the screen in place, something needs to actually trigger the
system's permission dialog when "Enable Low-Stock Notifications" is
tapped, and receive the user's answer afterward.

### Mechanical Walkthrough

### Option A — the Legacy, Request-Code-Based API

```java
private static final int SMS_PERMISSION_REQUEST_CODE = 100;

private void requestSmsPermissionLegacy() {
    ActivityCompat.requestPermissions(
        this,
        new String[]{Manifest.permission.SEND_SMS},
        SMS_PERMISSION_REQUEST_CODE);
}

@Override
public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    if (requestCode == SMS_PERMISSION_REQUEST_CODE) {
        boolean granted = grantResults.length > 0
            && grantResults[0] == PackageManager.PERMISSION_GRANTED;
        // handle granted/denied here
    }
}
```

`ActivityCompat.requestPermissions` triggers the system dialog
immediately, tagged with an arbitrary integer (`SMS_PERMISSION_REQUEST_CODE`)
chosen by your own code. The result arrives later, in an **overridden**
method, `onRequestPermissionsResult` — a real Template Method (Lesson 06's
concept, reappearing) the OS calls on its own schedule, the same
Inversion of Control already traced repeatedly since Lesson 07. Because
one Activity might request several different permissions at different
times, the request code is what lets `onRequestPermissionsResult`
determine *which* request this particular result belongs to — every
possible permission request in the whole Activity funnels through this
one method, distinguished only by matching request codes.

### Option B — the Modern, Registered-Callback API (the option this project builds)

```java
private final ActivityResultLauncher<String> requestSmsPermissionLauncher =
    registerForActivityResult(new ActivityResultContracts.RequestPermission(), isGranted -> {
        // handle granted/denied here
    });

private void requestSmsPermissionModern() {
    requestSmsPermissionLauncher.launch(Manifest.permission.SEND_SMS);
}
```

`registerForActivityResult` is called once, when the field is
initialized (before `onCreate` even runs), pairing a specific
**contract** — `ActivityResultContracts.RequestPermission()`, a
built-in, reusable description of "request exactly one permission and
report back a plain `boolean`" — with a lambda that runs only when *this
specific* registration's result comes back. `.launch(...)` is called
later, whenever the button is actually tapped, to trigger the real
system dialog. There's no manual request code to invent or match here —
each `registerForActivityResult` call and its paired lambda are already,
individually, tied to their own result, by construction.

### The Tradeoff

Option A is older, and still extremely common in existing code and
tutorials — it works correctly, but requires you to invent, track, and
correctly match an arbitrary integer request code by hand, and its result
arrives inside one shared, overridden method that every permission
request in the whole Activity must funnel through and manually
distinguish via `if (requestCode == ...)` branches. Option B removes
both of those manual bookkeeping burdens: the callback is registered
once, directly alongside the specific request it belongs to, with no
integer code to invent, and no shared override method that grows a new
branch for every additional permission the Activity might ever request.
Option B's real cost is that `registerForActivityResult` **must** be
called unconditionally, every time the Activity is created, before
`onCreate` runs its own logic — calling it conditionally, or later, after
some other code has already run, is not permitted and fails at runtime,
a real, easy-to-violate rule worth knowing exists even though this
project's own straightforward use never risks tripping it.

**This project uses Option B**, both because it's Android's current,
recommended approach, and because it demonstrates a real, reappearing
idea from this series more directly: a registered callback, paired with a
specific request, resolved later — the same interface/lambda mechanism
from Lessons 14 and 16, now applied to a result that arrives from an entirely
separate system dialog rather than an on-screen tap.

### CS Lens

Both options are the same **Inversion of Control** principle traced
throughout this series (Lessons 07, 16, 17), applied to a genuinely
asynchronous system interaction: neither option's request call *returns*
the answer directly — both hand off to the OS, which shows a real dialog,
waits for a real human decision, and calls back into app code afterward,
at a moment neither option's own code controls.

### SE Lens

**Why did Android introduce a second API for the exact same job, rather
than only ever having Option A?** Option A's request-code matching is a
manual, easy-to-get-wrong pattern that scales badly: an Activity
requesting several different permissions accumulates an ever-growing
`if`/`else if` chain inside one shared override, and a mismatched or
reused request code is a real, silent source of bugs — a result meant
for one request accidentally read as belonging to another. Option B's
registered-callback model moves that same correctness requirement onto
the compiler and the API's own design instead of onto careful manual
bookkeeping, at the cost of a strict, unconditional call-timing rule the
older API never enforced.

---

## Connect the Pieces

One trace: `InventoryActivity`'s new "Enable Low-Stock Notifications"
button starts `NotificationsActivity` via `Intent` — the exact Lesson 17
mechanism. Once there, this lesson established *which* of two real
Android APIs will actually trigger and receive the SMS permission's
result: a `registerForActivityResult` callback, paired with a
`RequestPermission` contract, chosen over the older request-code pattern
for the reasons above. Nothing shows a real dialog yet — the next lesson
wires the button's tap to `.launch(...)` and reacts to the real result.

## What Breaks Without This

Not applicable to this lesson specifically — no runtime request exists
yet to break. The next lesson's own "What Breaks Without This" covers the
real failure modes of the modern API's strict call-timing rule.

## Exercises

1. Read `ActivityResultContracts`'s own real documentation and name one
   other built-in contract besides `RequestPermission` (for example,
   `RequestMultiplePermissions`, for asking for more than one permission
   in a single dialog) — confirming this is a real, extensible family of
   contracts, not a one-off special case built just for this project.
2. Sketch (in a scratch file, not the real project) what Option A's
   `onRequestPermissionsResult` would need to look like if the same
   Activity also requested a second, unrelated permission — confirming
   concretely how the shared-override branching grows with each addition,
   the exact cost Option B's SE Lens named.

## Definition of Done

- [ ] The new Notifications screen exists, is reachable from the grid
      screen, and both build correctly with no runtime request wired
      yet.
- [ ] You can explain, in your own words, what a request code is for in
      Option A, and what replaces that need entirely in Option B.
- [ ] You can state the real, strict timing rule Option B imposes that
      Option A does not.
- [ ] Commit: `git commit -m "Add a Notifications screen reachable from
      the inventory grid"` — explaining the screen's purpose, not just
      its existence.

Next: wiring the button's tap to a real permission request, and reacting
correctly to both a real grant and a real denial.
