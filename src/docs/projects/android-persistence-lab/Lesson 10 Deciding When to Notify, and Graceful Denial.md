# Lesson 10: Deciding *When* to Notify, and Graceful Denial

**What you will build:** A real, automatic low-stock alert — editing a
row's quantity down past a real threshold sends a real SMS on its own,
with no manual "Send Test SMS" tap required — and, equally important,
completely graceful behavior when SMS permission was never granted at
all, or a phone number was never configured: the edit still saves
correctly, the grid still updates, nothing crashes, and no SMS silently
pretends to have been sent. The transferable problem: Lesson 09 proved
sending works; this lesson decides *when* sending should happen at all,
and confronts the real, honest fact that a required condition — a
granted permission, a real destination number — might legitimately never
be true for a given user, without that ever being treated as an error.

**What you need to know first:** Lesson 07 (`updateQuantity`, the
tap-to-edit dialog). Lesson 09 (`SmsManager`, `SEND_SMS`,
`isSmsPermissionGranted`). `android-ui-foundations` Lesson 22
(`InventoryItem`).

**Terms introduced in this lesson:**
- **`SharedPreferences`** — Android's real, standard key-value
  persistence mechanism for small settings, distinct from SQLite —
  appropriate for exactly this project's one small saved value (a phone
  number), never for structured, related, multi-row data like `items`
  or `users`.
- **Graceful degradation** — a system continuing to work correctly, for
  everything it can still do, when one specific capability is
  unavailable — rather than failing entirely because one piece is
  missing.

**Objects and methods used:**

**`SharedPreferences`**
- *What it is:* Android's real, standard key-value store for small
  settings.
- *Implementation:* `context.getSharedPreferences(String name, int
  mode)` returns one, real and persistent, backed by a small file the
  OS manages; `.edit()` returns an `Editor`, `.putString(key,
  value).apply()` saves a change; `.getString(key, defaultValue)` reads
  one back, real signature — `defaultValue` returned when the key was
  never set, never `null` unless `null` was explicitly requested as the
  default.
- *Its use:* remembers the one phone number this project needs to
  notify, across screens and across restarts, without needing a real
  database table for a single value.

**Everything else in the file, not this lesson's subject but still
explained:**
- **`SmsManager` / `sendTextMessage`**
  - *What they are:* the real class and method that sends an SMS.
  - *Implementation:* given full treatment in Lesson 09.
  - *Their use:* called automatically now, from `LowStockNotifier`,
    instead of only from a manual test button.
- **`ContextCompat.checkSelfPermission`**
  - *What it is:* a method returning whether a permission is currently
    granted.
  - *Implementation:* given full treatment in `android-ui-foundations`
    Lesson 31.
  - *Its use:* the first of this lesson's real guard clauses — a
    genuinely ungranted permission is not an error condition here, it's
    an expected, gracefully handled real state.

---

## Concept Unit: Choosing a Real Trigger Condition

### The Problem

"Notify when stock is low" is not, by itself, a precise enough
condition to write code against. Every edit? Every time the grid opens?
On a fixed schedule, regardless of whether anything changed? Each is a
real, different design, with real, different costs.

### The Options, Weighed

**Notify on every edit, regardless of the resulting quantity** —
simplest to write, and wrong: it would fire for an edit that *raises* a
quantity, or one that changes it from 3 to 4, neither of which is
remotely a low-stock situation.

**Notify on a fixed schedule** (once an hour, say) — decouples checking
from editing entirely, but requires a real background-scheduling
mechanism (`WorkManager`, a real, legitimate Android tool, genuinely out
of this project's own scope) and would either spam an unchanged low-stock
item repeatedly or need its own separate "already notified this one"
tracking.

**Notify exactly when an edit crosses a real, fixed threshold** — this
project's real choice: check the *new* quantity immediately after a
successful save, and notify only when that new value is below a
deliberately chosen number.

### Mechanical Walkthrough

- The rejected "every edit" option's real shape: a check with no
  condition on the value at all —
  `onEdit(newQuantity) { sendNotification(); }` — fires identically
  whether `newQuantity` went up, down, or anywhere at all.
- The rejected "fixed schedule" option's real shape: a check with no
  connection to editing at all — `every 1 hour { checkAllItems(); }` —
  requires its own separate timer mechanism and its own separate
  memory of what it already notified about.
- This project's real, chosen shape — the one `LowStockNotifier`
  actually implements, next — is a single condition, checked exactly
  once, exactly at the real moment a save succeeds:
  `onEditSaved(newQuantity) { if (newQuantity < THRESHOLD) {
  sendNotification(); } }` — connected directly to the one real event
  (a successful edit) that can possibly make the condition newly true.

### Project Change

- **Reference Source:** No external framework signature — the threshold
  itself is an application-defined constant, not a framework
  requirement.
- **Files affected:** New file
  `app/src/main/java/com/yourname/yourapp/LowStockNotifier.java`.
- **Change type:** New file.
- **Dependencies:** None new beyond what Lessons 07–09 already built.

### SE Lens

**Why check the threshold only at the moment of an edit, instead of
also checking every time the grid simply loads?** An edit is the one
real moment this project already knows a quantity possibly *changed* —
checking on every grid load as well would repeatedly re-notify for a
row that's been sitting below the threshold, unedited, for days, with
no new information to act on. Tying the check to the actual moment of
change means a notification means something specific: *this edit* just
made a row cross the line, not merely "this row happens to be low right
now, again."

---

## Concept Unit: `SharedPreferences` — Remembering One Small Value

### The Problem

An automatic, edit-triggered notification needs a real phone number to
send to — and nothing currently remembers the one typed into Lesson 09's
"Send Test SMS" field beyond that screen's own short-lived `EditText`
state. A real database table (Lesson 02's own schema-design reasoning)
is real overkill for exactly one small, standalone value with no rows,
no columns, no relationships to anything else this project stores.

### The Real Mechanism, Verified on Real Device Behavior

This is genuinely Android-only — no plain-JVM equivalent exists to prove
it with a throwaway `javac`/`java` lab the way earlier lessons did.
Real, documented API, confirmed this session against Android's own
reference documentation:

```java
SharedPreferences prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE);
prefs.edit().putString("notify_phone_number", phoneNumber).apply();

String saved = prefs.getString("notify_phone_number", null);
```

### Mechanical Walkthrough

- `context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)` —
  `"app_prefs"` names this specific preferences file (an app can have
  more than one); `Context.MODE_PRIVATE` — the only mode any real,
  current Android app should use — means this file is readable only by
  this app itself, never shared with or exposed to any other app on the
  device.
- `.edit()` — returns a real, separate `Editor` object; changes staged
  on it don't take effect until committed.
- `.putString("notify_phone_number", phoneNumber).apply()` — stages one
  key-value pair, then `.apply()` commits it — written to the real,
  persistent backing file, asynchronously, without blocking the calling
  thread waiting for the disk write to finish.
- `prefs.getString("notify_phone_number", null)` — reads the value back
  by the same key; the second argument is the real, required default,
  returned exactly as given if the key was never set — `null` here,
  deliberately, so this project's own code can tell "never configured"
  apart from "configured, but empty," covered directly next.

### CS Lens

`SharedPreferences` is a real, minimal **key-value store** — the same
general shape as `ContentValues` (Lesson 03) or a plain `Map`, but
genuinely persistent across restarts, backed by real storage instead of
memory. Choosing it over a full SQLite table here is the same "match the
tool to the actual shape of the data" reasoning Lesson 02 already
applied when designing `users`/`items`: a single, standalone value has
no rows to relate to anything, and forcing it into a one-row table would
add real schema and query overhead for no real benefit.

### SE Lens

**Why not just store the phone number as a field on the `users` table,
alongside the account that's currently logged in?** This project's own
login (Lesson 05) never actually tracks *which* account is currently
active after a successful check — `checkCredentials` returns a plain
`boolean` and nothing more, by deliberate design (Lesson 05's own SE
Lens). Adding "remember which user is logged in" just to attach a phone
number to them would be new, real scope this project's actual
requirements never called for. A single `SharedPreferences` value,
scoped to the device itself rather than to any one account, matches
what this project actually needs: one number, remembered, regardless of
who's currently using the app.

---

## Concept Unit: `LowStockNotifier` — Three Real Guards, Never a Crash

### The Problem

With a real trigger moment (a successful edit) and a real place to read
a saved phone number from, the actual check needs building — and it
needs to handle, gracefully and honestly, every real way the condition
for sending might not be met.

### Project Change

- **Reference Source:** No new external framework signature beyond
  what's already quoted above and in Lesson 09.
- **Files affected:** New file `LowStockNotifier.java`;
  `InventoryAdapter.java` (call it after a successful edit);
  `NotificationsActivity.java` (save the typed phone number).
- **Change type:** Create one new file; add one line to an existing
  method; add persistence to an existing field read.
- **Dependencies:** Lessons 07 and 09.

### The New Code

`LowStockNotifier.java`:

```java
package com.yourname.yourapp;

import android.Manifest;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.telephony.SmsManager;
import androidx.core.content.ContextCompat;

public class LowStockNotifier {
    private static final int LOW_STOCK_THRESHOLD = 10;

    public static void checkAndNotify(Context context, InventoryItem item) {
        if (item.getQuantity() >= LOW_STOCK_THRESHOLD) {
            return;
        }

        if (ContextCompat.checkSelfPermission(context, Manifest.permission.SEND_SMS)
                != PackageManager.PERMISSION_GRANTED) {
            return;
        }

        SharedPreferences prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE);
        String phoneNumber = prefs.getString("notify_phone_number", null);
        if (phoneNumber == null) {
            return;
        }

        SmsManager smsManager = SmsManager.getDefault();
        smsManager.sendTextMessage(phoneNumber, null,
            "Low stock alert: " + item.getName() + " is down to " + item.getQuantity(),
            null, null);
    }
}
```

In `InventoryAdapter.java`, inside the edit-quantity dialog's `"Save"`
handler, one new line:

```java
itemRepository.updateQuantity(item.getId(), newQuantity);
item.setQuantity(newQuantity);
notifyItemChanged(position);
LowStockNotifier.checkAndNotify(context, item);   // ← new
```

In `NotificationsActivity.java`, saving the phone number whenever a real
send succeeds:

```java
getSharedPreferences("app_prefs", MODE_PRIVATE)
    .edit()
    .putString("notify_phone_number", phoneNumber)
    .apply();
```

### The Updated Project

`InventoryAdapter.java`'s edit-save handler in full:

```java
new AlertDialog.Builder(context)
    .setTitle("Update Quantity")
    .setView(quantityInput)
    .setPositiveButton("Save", (dialog, which) -> {
        int newQuantity = Integer.parseInt(quantityInput.getText().toString());
        itemRepository.updateQuantity(item.getId(), newQuantity);
        item.setQuantity(newQuantity);
        notifyItemChanged(position);
        LowStockNotifier.checkAndNotify(context, item);   // ← new
    })
    .setNegativeButton("Cancel", null)
    .show();
```

`NotificationsActivity.java`'s send-button handler, saving the number on
a successful send:

```java
sendTestSmsButton.setOnClickListener((view) -> {
    if (!isSmsPermissionGranted()) {
        Toast.makeText(this, "Grant SMS permission first", Toast.LENGTH_SHORT).show();
        return;
    }

    String phoneNumber = phoneNumberField.getText().toString();
    try {
        SmsManager smsManager = SmsManager.getDefault();
        smsManager.sendTextMessage(phoneNumber, null, "Test message from the inventory app", null, null);
        getSharedPreferences("app_prefs", MODE_PRIVATE)              // ← new
            .edit()                                                   // ← new
            .putString("notify_phone_number", phoneNumber)            // ← new
            .apply();                                                 // ← new
        Toast.makeText(this, "Message sent", Toast.LENGTH_SHORT).show();
    } catch (SecurityException e) {
        Toast.makeText(this, "SMS permission was revoked", Toast.LENGTH_SHORT).show();
    }
});
```

### Mechanical Walkthrough

- `private static final int LOW_STOCK_THRESHOLD = 10;` — a named
  constant (`android-ui-foundations`' own "named constant over a raw
  literal" reasoning, reappearing since Lesson 10 of that series),
  chosen here as a reasonable, real, adjustable default — not a value
  with any deeper significance.
- `public static void checkAndNotify(Context context, InventoryItem item)`
  — **first appearance.** `static` (Lesson 01's reasoning, reappearing):
  this check needs no state of its own between calls, only the specific
  item and `Context` handed to it each time.
- `if (item.getQuantity() >= LOW_STOCK_THRESHOLD) { return; }` — **first
  real guard.** The overwhelmingly common case — most edits don't cross
  into low-stock territory at all — returns immediately, doing no real
  work at all for the common path.
- `if (ContextCompat.checkSelfPermission(...) != PackageManager.PERMISSION_GRANTED) { return; }`
  — **second real guard.** Reappearing check (`android-ui-foundations`
  Lesson 31); a real, ungranted permission here is not treated as
  failure or logged as an error — it's a legitimate, expected real
  state this method silently, correctly declines to act on.
- `if (phoneNumber == null) { return; }` — **third real guard.** A user
  who granted SMS permission but never actually configured a real
  number to notify is an equally legitimate, real state — the grid
  keeps working, edits keep saving, nothing about this guard clause
  affects anything outside `LowStockNotifier` itself.
- `smsManager.sendTextMessage(...)` — reappearing exactly (Lesson 09),
  reached only once all three real guards have passed.
- `LowStockNotifier.checkAndNotify(context, item);` inside
  `InventoryAdapter` — called with the exact same `item` object
  `setQuantity` was just called on, and the exact same `context` the
  edit dialog itself already used — no new state introduced anywhere in
  the adapter.
- The phone-number-saving addition to `NotificationsActivity` — reusing
  this lesson's own `SharedPreferences` mechanism, writing the number
  only after a real, successful manual send — a deliberate choice: a
  number that has never actually sent anything successfully is not yet
  trusted enough to save for automatic use later.

### CS Lens

Three sequential, independent guard clauses, each returning immediately
the moment its own condition isn't met, is **graceful degradation** in
its most direct form: the presence or absence of any one capability
(a low-enough quantity, a granted permission, a saved number) is
checked and handled on its own terms, with no single point where a
missing piece cascades into breaking anything else this method — or
anything calling it — does.

Also recognized in: a web page that still renders its real content when
a non-critical third-party script fails to load, a car's anti-lock
braking system that reverts to plain braking rather than refusing to
brake at all if its own sensor fails, and any feature genuinely treated
as optional rather than load-bearing for the rest of a system.

### SE Lens

**Why three separate, sequential `if`/`return` guards instead of one
combined condition — `if (quantity < THRESHOLD && permissionGranted &&
phoneNumber != null) { ... send ... }`?** Both are logically equivalent;
this project's own choice is about honest readability under future
maintenance: three separate, named guard clauses each read as one
complete, real reason to stop, in the exact order this method actually
checks them — adding a fourth real condition later (a per-item "already
notified today" flag, for instance) means adding one more clause in the
same shape, rather than growing one increasingly dense boolean
expression that's progressively harder to read correctly at a glance.

---

## Connect the Pieces

The full trace, start to finish, across this entire series: a user logs
in against a real, salted, hashed password (Lessons 05–06). The grid
loads real rows from a real, on-disk table (Lesson 04). Editing a row's
quantity writes a real, targeted `UPDATE` (Lesson 07) and, now,
immediately checks whether that edit just crossed this project's own
real low-stock threshold. If it did, and SMS permission was genuinely
granted, and a real phone number was previously saved from a successful
manual send (Lesson 09, extended this lesson), a real SMS goes out
automatically — with no manual button press required. If any one of
those three real conditions isn't met, the edit still saves correctly,
the grid still updates correctly, and nothing anywhere in the app
crashes, logs a spurious error, or behaves any differently at all,
because a genuinely optional capability was, correctly, not available.

## What Breaks Without This

Remove the third guard clause (`if (phoneNumber == null) { return; }`)
entirely, leaving `SmsManager.getDefault()` and `sendTextMessage` to run
even with `phoneNumber` equal to `null`. Edit a row's quantity below the
threshold, with SMS permission granted but no number ever saved. Real,
documented error: `sendTextMessage` throws `IllegalArgumentException`,
naming a `null`/empty `destinationAddress` — the exact real exception
Lesson 09's own Concept Unit already named, now triggered for real,
uncaught, inside a method with no `try`/`catch` around it at all, which
would genuinely crash `InventoryAdapter`'s own edit-save flow — corrupting
what should have been a simple, successful quantity edit into an app
crash, purely because an optional notification's own missing
prerequisite was never checked. Restore the guard clause before moving
on.

## Exercises

1. Edit a row's quantity below the threshold with SMS permission
   granted and a real saved number — confirm a real SMS arrives
   automatically, with no "Send Test SMS" tap involved at all.
2. Revoke SMS permission entirely (system Settings), then edit a row's
   quantity below the threshold. Confirm the edit still saves
   correctly, the grid still updates, and no crash or error occurs —
   direct, observed proof of this lesson's own graceful-degradation
   design.
3. Add a fourth real guard: skip notifying if the *same* item's
   quantity was already below the threshold *before* this specific
   edit (compare against the value read prior to `setQuantity`),
   preventing a repeated notification for an item edited twice while
   already low — apply this lesson's own SE Lens reasoning about
   sequential, named guard clauses to add it cleanly.

## Definition of Done

- [ ] You edited a quantity below the threshold, with permission granted
      and a real saved number, and received a real, automatic SMS with
      no manual send button involved.
- [ ] You revoked permission and confirmed an edit below the threshold
      still saves correctly with no crash and no SMS sent.
- [ ] You can name, precisely, all three real guard clauses
      `checkAndNotify` checks, and what real-world condition each one
      represents.
- [ ] You triggered the real `IllegalArgumentException` this lesson's
      "What Breaks Without This" describes, by removing the third
      guard, and restored it.
- [ ] Commit: `git commit -m "Trigger low-stock SMS automatically on a
      threshold-crossing edit; degrade gracefully with no permission or
      saved number"` — explaining the trigger condition and the
      graceful-failure design, not just that notifications now happen
      automatically.

This is the last lesson in this series. Every real gap
`android-ui-foundations` deliberately left open is closed: the login
screen checks real, salted, hashed credentials against a real table; the
grid reads, adds, edits, and deletes real, persisted rows, each targeted
correctly by its own real `id`; and the SMS permission flow that once
stopped at "granted" now genuinely sends real messages, automatically,
under a real condition — and does nothing at all, correctly and
silently, the moment any one of that condition's real prerequisites
isn't met.
