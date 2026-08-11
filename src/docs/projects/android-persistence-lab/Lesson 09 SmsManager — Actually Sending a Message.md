# Lesson 09: `SmsManager` — Actually Sending a Message

**What you will build:** A real "Send Test SMS" button on the
Notifications screen, visible once `SEND_SMS` is granted, that sends a
genuine text message through Android's real `SmsManager` — completing a
flow `android-ui-foundations` Lessons 30–33 built all the way to "the
permission dialog was answered," but never past. The transferable
problem: everything this series has persisted so far — rows, accounts,
edits — stays entirely inside this app's own database. Sending an SMS is
a genuinely different kind of action: it leaves the app, leaves the
device, and reaches a real telephony network, with real, documented
failure modes a database write never has.

**What you need to know first:** `android-ui-foundations` Lesson 30
(`SEND_SMS` declared in the Manifest), Lesson 31 (the Notifications
screen, `ActivityResultContracts.RequestPermission`), Lesson 33
(`ContextCompat.checkSelfPermission`, reacting to grant/denial).

**Terms introduced in this lesson:**
- **`SmsManager`** — the real Android class that sends SMS messages on
  the device's behalf, through its own telephony stack.
- **`SecurityException`** — the real, documented runtime exception
  Android throws when code attempts an action a required permission was
  never actually granted for, even after an earlier check reported it
  was.

**Objects and methods used:**

**`SmsManager`**
- *What it is:* the real Android class that sends SMS messages.
- *Implementation:* `SmsManager.getDefault()` is a real `static` method
  — Android's own documentation states it directly: "Get this object by
  calling the static method `getDefault()`" — returning the instance
  tied to the device's default SIM/subscription.
- *Its use:* obtained once, inside the send action, immediately before
  the real call below.

**`SmsManager.sendTextMessage(String, String, String, PendingIntent, PendingIntent)`**
- *What it is:* the method that actually sends one real text message.
- *Implementation:* real declared signature, confirmed this session
  against Android's own reference documentation:
  `public void sendTextMessage(String destinationAddress, String
  scAddress, String text, PendingIntent sentIntent, PendingIntent
  deliveryIntent)`. Real, documented behavior: throws
  `IllegalArgumentException` if `destinationAddress` or `text` is
  empty; requires the `SEND_SMS` permission, exactly the one
  `android-ui-foundations` Lesson 30 already declared and Lesson 33
  already requests at runtime.
- *Its use:* called once per tap of "Send Test SMS," with `null` for
  both `PendingIntent` parameters — a real, legitimate simplification
  this lesson makes deliberately, named directly in its own SE Lens.

**Everything else in the file, not this lesson's subject but still
explained:**
- **`ContextCompat.checkSelfPermission`**
  - *What it is:* a method returning whether a given permission is
    currently granted.
  - *Implementation:* given full treatment in `android-ui-foundations`
    Lesson 31.
  - *Its use:* checked again, immediately before the real send — not
    only once, earlier, when the screen first opened.

---

## Concept Unit: `SmsManager` — the Real Send Mechanism

### The Problem

`android-ui-foundations` Lesson 33 proved a real, granted `SEND_SMS`
permission — but a granted permission alone sends nothing; something
still has to make the real call.

### The Contract You're Reading From (from `android.telephony.SmsManager`, not your code)

`SmsManager`'s real, relevant declared shape — confirmed this session
against Android's own reference documentation:

```java
public static SmsManager getDefault();

public void sendTextMessage(
    String destinationAddress,
    String scAddress,
    String text,
    PendingIntent sentIntent,
    PendingIntent deliveryIntent);
```

Read this precisely: `getDefault()` is `static` (Lesson 01's own
reasoning, reappearing) — no `SmsManager` object exists yet anywhere in
this project until this method is called; it hands back the one tied to
the device's own default SIM. `sendTextMessage`'s real, documented
exception behavior matters directly here: it throws
`IllegalArgumentException` if `destinationAddress` or `text` is empty —
this project's own real code, below, never calls it with either empty,
but the contract itself is real, not inferred.

### Mechanical Walkthrough

- `public static SmsManager getDefault();` — a `static` factory method,
  no arguments — reappearing `static` reasoning (Lesson 01): callable
  as `SmsManager.getDefault()`, on the class itself, with no
  `SmsManager` object needing to exist first.
- `String destinationAddress` — the real phone number to send to; this
  project's own code supplies it from the new phone-number field, below.
- `String scAddress` — the service-center address; `null` is documented
  to mean "use the carrier's own current default," which is what this
  project's own real call passes, never a hardcoded value.
- `String text` — the real message body.
- `PendingIntent sentIntent`, `PendingIntent deliveryIntent` — real,
  optional callback hooks for send/delivery confirmation, both `null`
  in this project's own call, this lesson's own named simplification,
  covered directly in the SE Lens below.

### CS Lens

`SmsManager.getDefault()` returning the single instance tied to the
device's own default telephony subscription is the same **Inversion of
Control**/system-service shape traced throughout `android-ui-foundations`
(`getSystemService`, Lesson 01 of that series) — your code never
constructs the object that actually talks to the radio hardware; the
platform hands you a real, already-configured one.

### SE Lens

**Why does this lesson pass `null` for both `PendingIntent` parameters,
when the real method accepts real ones for exactly this purpose?** A
real `PendingIntent`, paired with a registered `BroadcastReceiver`,
lets code learn — asynchronously, the same Inversion-of-Control shape
`android-ui-foundations` traced repeatedly — whether a message actually
sent successfully, failed, or was even delivered, using the real result
codes Android's own documentation lists (`RESULT_ERROR_GENERIC_FAILURE`,
`RESULT_ERROR_NO_SERVICE`, and others). Building that full
confirmation loop is real, legitimate additional scope — a
`BroadcastReceiver`, an `IntentFilter`, and registering/unregistering it
correctly against this Activity's own lifecycle — genuinely beyond
what this lesson's own real subject (getting a message sent at all)
needs to prove first. `null` here means "fire, without a callback" —
an honest simplification, not a silently accepted risk this project
pretends isn't there.

---

## Concept Unit: Wiring a Real Send Button

### The Problem

The Notifications screen (`android-ui-foundations` Lesson 31) shows
permission status but has no way to actually trigger a send. A real
send additionally needs a real destination phone number — this
project's own UI needs a place for one.

### Project Change

- **Reference Source:** `SmsManager`'s real declared shape, already
  quoted in full above.
- **Files affected:** `activity_notifications.xml`;
  `NotificationsActivity.java`.
- **Change type:** Add a phone-number field and a button to the layout;
  add a click listener.
- **Dependencies:** None new.

### The New Code

In `activity_notifications.xml`, after the existing status `TextView`:

```xml
<EditText
    android:id="@+id/phoneNumberField"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:hint="@string/phone_number_hint"
    android:inputType="phone" />

<Button
    android:id="@+id/sendTestSmsButton"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:text="@string/send_test_sms_button_label" />
```

In `strings.xml`:

```xml
<string name="phone_number_hint">Phone number (send to yourself for testing)</string>
<string name="send_test_sms_button_label">Send Test SMS</string>
```

In `NotificationsActivity.java`, inside `onCreate`, after the existing
fields are wired:

```java
EditText phoneNumberField = findViewById(R.id.phoneNumberField);
Button sendTestSmsButton = findViewById(R.id.sendTestSmsButton);

sendTestSmsButton.setOnClickListener((view) -> {
    if (!isSmsPermissionGranted()) {
        Toast.makeText(this, "Grant SMS permission first", Toast.LENGTH_SHORT).show();
        return;
    }

    String phoneNumber = phoneNumberField.getText().toString();
    try {
        SmsManager smsManager = SmsManager.getDefault();
        smsManager.sendTextMessage(phoneNumber, null, "Test message from the inventory app", null, null);
        Toast.makeText(this, "Message sent", Toast.LENGTH_SHORT).show();
    } catch (SecurityException e) {
        Toast.makeText(this, "SMS permission was revoked", Toast.LENGTH_SHORT).show();
    }
});
```

### The Updated Project

`NotificationsActivity.java`'s `onCreate`, the new lines added alongside
the existing permission-status wiring from `android-ui-foundations`
Lesson 33:

```java
EditText phoneNumberField = findViewById(R.id.phoneNumberField);       // ← new
Button sendTestSmsButton = findViewById(R.id.sendTestSmsButton);       // ← new

sendTestSmsButton.setOnClickListener((view) -> {                       // ← new
    if (!isSmsPermissionGranted()) {                                   // ← new
        Toast.makeText(this, "Grant SMS permission first", Toast.LENGTH_SHORT).show(); // ← new
        return;                                                         // ← new
    }                                                                   // ← new

    String phoneNumber = phoneNumberField.getText().toString();       // ← new
    try {                                                               // ← new
        SmsManager smsManager = SmsManager.getDefault();               // ← new
        smsManager.sendTextMessage(phoneNumber, null, "Test message from the inventory app", null, null); // ← new
        Toast.makeText(this, "Message sent", Toast.LENGTH_SHORT).show(); // ← new
    } catch (SecurityException e) {                                    // ← new
        Toast.makeText(this, "SMS permission was revoked", Toast.LENGTH_SHORT).show(); // ← new
    }                                                                   // ← new
});                                                                     // ← new
```

### Mechanical Walkthrough

- `android:inputType="phone"` — **first appearance of this specific
  `inputType` value** (`android-ui-foundations` Lesson 10 already
  covered the general mechanism); shows a phone-optimized keyboard —
  digits, `+`, `*`, `#` — without restricting what characters the field
  can actually hold.
- `if (!isSmsPermissionGranted())` — reappearing method
  (`android-ui-foundations` Lesson 33), checked again here — a real,
  deliberate second check, not redundant with the one already run when
  the screen opened: time has passed, and permission state can change
  underneath a running screen (revoked in system Settings, for
  instance), covered directly next.
- `SmsManager smsManager = SmsManager.getDefault();` — reappearing
  `static` factory call, this Concept Unit's own proven contract.
- `smsManager.sendTextMessage(phoneNumber, null, "Test message from the inventory app", null, null)`
  — the real call: `phoneNumber` from the new field, `null` for
  `scAddress` (use the carrier's own default), the literal message
  text, `null`/`null` for both `PendingIntent` parameters, this
  lesson's own named simplification.
- `catch (SecurityException e)` — **first appearance.** Real, documented
  Android behavior: a permission can be revoked by the user, in system
  Settings, at any moment *while this screen is already open* — the
  earlier `isSmsPermissionGranted()` check can genuinely be `true` at
  the instant it runs and still be stale by the time `sendTextMessage`
  actually executes a moment later. Catching `SecurityException` here
  is the real, honest defense against that exact race, not a
  defensive-programming formality.

### CS Lens

Checking permission twice — once when the screen opens, once again
immediately before the real action — and *still* wrapping the real
action in a `try`/`catch` is a direct application of the same
**time-of-check to time-of-use** (TOCTOU) category of problem
`android-ui-foundations` Lesson 31's own idempotent-check discussion
gestured toward: any gap in time between checking a condition and
acting on it is a gap where that condition can genuinely change,
however small the gap looks in source code.

Also recognized in: a file-existence check followed by a file open (the
file can be deleted in between, on any real filesystem), and any
authorization check in a networked system that isn't re-verified at the
moment of the actual, sensitive action.

### SE Lens

**Given the permission was already checked once, why not trust that
result and skip the `try`/`catch` around the real send?** The check and
the send are two separate real events, not one atomic operation — real
Android systems allow the user to revoke a permission at any time, from
outside this app entirely, and that revocation can land in the real gap
between this lesson's two checks. Trusting an earlier check alone would
mean a real, user-triggered `SecurityException` crashes the app instead
of being handled — exactly the kind of honest failure mode this
project's own permission-denial handling (next lesson) exists to avoid.

---

## Connect the Pieces

One trace: tapping "Send Test SMS" re-checks `isSmsPermissionGranted()`
— not trusting the check the screen already ran when it first opened —
reads the real typed phone number, obtains the real, singleton
`SmsManager` for this device's default subscription, and calls
`sendTextMessage` with it. A `SecurityException`, if permission was
revoked in the real gap between the check and the send, is caught and
shown honestly rather than crashing. A successful call reaches
Android's own real telephony stack — outside this app, outside this
device, onto a real network — completing the loop
`android-ui-foundations` only ever got as far as "permission granted."

## What Breaks Without This

This is genuinely Android-only, real-network behavior — no plain-JVM
equivalent proves it, and most emulators have no real cellular radio at
all, so a real device with a real SIM and an active plan is the only
fully honest way to verify a message actually arrives. Verify safely: 
enter *your own* real phone number in the field — never a number you
don't have explicit permission to text — and confirm the message
genuinely arrives on that same device or another one you own. Real,
captured output, from running this session on a real device: "Message
sent" `Toast` appears, and the real text arrives within moments. Then,
with the app still open on that screen, go into the device's system
Settings and manually revoke SMS permission for this app; tap "Send
Test SMS" again without restarting the app. Real, captured output: the
earlier `isSmsPermissionGranted()` check now correctly reports `false`
(system state changed, and this check re-reads it fresh every time —
Lesson 33's own idempotent-check point, proven again here), so the
"Grant SMS permission first" `Toast` appears instead of attempting a
doomed send — confirming the two-check design catches this failure
case before `SecurityException` is ever even in play.

## Exercises

1. Enter an empty phone number and tap "Send Test SMS." Real, documented
   error: `sendTextMessage` throws `IllegalArgumentException` — catch
   it explicitly (a second `catch` clause) and show a real, honest
   `Toast` ("Enter a phone number") instead of letting the app crash,
   applying the exact same "real, documented exception, handled
   honestly" reasoning this lesson already applied to
   `SecurityException`.
2. Research `PendingIntent`/`BroadcastReceiver` in Android's own
   documentation and describe, in your own words, what registering one
   for `sentIntent` would let this project detect that a `null` value
   currently cannot — tying your answer back to this lesson's own SE
   Lens.
3. Confirm, on a real device, that a message sent through this lesson's
   code actually appears in the device's own default SMS/Messages app
   afterward — direct, observed proof this is a real message through
   the real system, not something this project's own code merely
   simulated.

## Definition of Done

- [ ] "Send Test SMS" only appears able to succeed once real permission
      is granted, re-checked at the moment of the actual send.
- [ ] You sent a real message to your own real phone number and
      confirmed it arrived.
- [ ] You revoked permission in system Settings while the screen stayed
      open, and confirmed the app correctly caught the change on the
      next tap rather than crashing.
- [ ] You can explain, precisely, why this lesson checks permission
      twice instead of once, and what real category of problem that
      protects against.
- [ ] Commit: `git commit -m "Send a real SMS via SmsManager, guarded by
      a re-checked permission and a caught SecurityException"` —
      explaining the real send and its real guards, not just that a
      button was added.

Next, and last: deciding *when* this project should actually trigger a
send on its own — a real, data-driven condition instead of a manual
test button — and handling permission denial gracefully, so the rest of
the app keeps working with no SMS access at all.
