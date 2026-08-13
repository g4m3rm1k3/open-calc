# Lesson 08: The Adapter That Might Not Exist, and Turning It On

**What you will build:** the `BluetoothAdapter` itself — obtained
through a *second, type-safe* overload of a method this series has
called four times already, then checked for whether Bluetooth is
currently on, and turned on through a real system prompt if it isn't.
Lesson 07 opened the permission gate; this lesson is the first thing
that actually needs it. Still no scanning, no connecting to another
device — just reaching the point where Bluetooth itself is ready to be
used, which turns out to be its own real problem with its own real
failure modes.

**What you need to know first:** Lesson 01 (the manager pattern,
`getSystemService`, downcasting), Lesson 07 in full (permissions,
`registerForActivityResult`, `ActivityResultLauncher`).

**Terms introduced in this lesson:**
- **Result code** — a small `int` a launched Activity (here, Android's
  own built-in "turn on Bluetooth?" screen) sends back describing how
  it ended. `Activity.RESULT_OK` and `Activity.RESULT_CANCELED` are
  the two constants used in this lesson; a result code answers "how did
  it end," not "what data came back with it."

**Objects and methods this lesson uses:**
- **`getSystemService(Class<T>)`**
  - *What it is:* a second, newer overload of the exact method Lesson
    01 introduced — same idea, different signature.
  - *Implementation:* declared on `Context` alongside the original
    `getSystemService(String)`; takes a `.class` literal instead of a
    string constant, and returns `T` directly — the type you asked
    for, not `Object`.
  - *Its use:* requesting `BluetoothManager.class` below, specifically
    because it removes the downcast Lesson 01 required — covered in
    full in the Mechanical Walkthrough.
- **`BluetoothManager`**
  - *What it is:* the system service that owns Bluetooth on this
    device.
  - *Implementation:* obtained via `getSystemService(BluetoothManager.class)`;
    its only job relevant to this lesson is handing out the adapter,
    below.
  - *Its use:* the object this lesson asks for first, in order to ask
    it for the one thing it actually needs.
- **`BluetoothAdapter`**
  - *What it is:* the single object representing this device's own
    Bluetooth hardware and its current state — on or off, and (in
    later lessons) discovering or discoverable.
  - *Implementation:* obtained via `bluetoothManager.getAdapter()`;
    can be `null`, on a device with no Bluetooth radio at all.
  - *Its use:* this entire lesson's subject — checked for existence,
    then for whether it's enabled, then asked to turn on if it isn't.
- **`ActivityResultContracts.StartActivityForResult`**
  - *What it is:* the general-purpose contract for "launch some other
    screen and get back whatever result code and data it finished
    with" — less specific than Lesson 07's
    `RequestMultiplePermissions`, which only ever handles permission
    dialogs.
  - *Implementation:* a class in `androidx.activity.result.contracts`;
    its contract type is `Intent` in, `ActivityResult` out.
  - *Its use:* registered below to launch Android's own built-in
    "allow this app to turn on Bluetooth?" screen and read back
    whether the user agreed.

---

## Concept Unit: Two New Facts an Old Method Can't Assume

### The Problem

Every `getSystemService` call so far in this series assumed the
service exists — checked with an `if (x == null)`, but never really
in doubt for long, since every prior lesson ran on hardware known to
have a clipboard and a light sensor. `BluetoothAdapter` is different
in a way none of those were: some real, current Android devices —
Wi-Fi-only tablets, some TV boxes — have no Bluetooth radio at all,
`null` isn't a remote edge case. And even once you have a real,
non-null adapter, it introduces a second fact the light sensor never
had: hardware that exists can still be turned *off*, on purpose, by
the user, independent of whether your app is running.

### Introduce the Concept in Isolation — Step 1: Existing and Being On Are Different Questions

Scratch file, no Android:

```java
String maybeRadio = null; // stands in for "this device has no Bluetooth hardware"
boolean radioIsOn = false; // stands in for "it exists, but the user switched it off"

System.out.println("Exists? " + (maybeRadio != null));
System.out.println("Is on? " + radioIsOn);

maybeRadio = "BluetoothAdapter"; // now it exists
System.out.println("Exists? " + (maybeRadio != null));
System.out.println("Is on? " + radioIsOn); // still false — existing changed nothing about this
```

Run it. Expected output:

```
Exists? false
Is on? false
BluetoothAdapter
Exists? true
Is on? false
```

Making `maybeRadio` non-`null` had zero effect on `radioIsOn` — two
separate variables, two separate questions, exactly the two real
checks the rest of this lesson performs against the real
`BluetoothAdapter`: does it exist, and separately, is it currently on.

**Discard this scratch file.**

### Introduce the Concept in Isolation — Step 2: The Real Thing

**Reference Source:** no reference counterpart — `BluetoothManager`/
`BluetoothAdapter` acquisition and the enable-request flow are Android
platform facts, confirmed against Android's current developer
documentation this session.

**Files affected:** `MainActivity.java` only.

**Change type:** add, inside `onCreate`, directly after Lesson 07's
permission-launcher setup and permission check/request block.

**Location:** two new fields alongside the existing ones; new lines in
`onCreate`, after the permission block, before the pre-existing
clipboard setup.

**Dependencies:** Lesson 07's `BLUETOOTH_CONNECT` permission — the
Mechanical Walkthrough below covers exactly which call needs it.

Two new fields:

```java
private BluetoothAdapter bluetoothAdapter;                              // <- new
private ActivityResultLauncher<Intent> enableBtLauncher;                // <- new
```

New lines in `onCreate`, placed right after Lesson 07's permission
block:

```java
enableBtLauncher = registerForActivityResult(                            // <- new
        new ActivityResultContracts.StartActivityForResult(),            // <- new
        result -> {                                                      // <- new
            if (result.getResultCode() == Activity.RESULT_OK) {          // <- new
                Log.d("BtAdapter", "User turned Bluetooth on");          // <- new
            } else {                                                     // <- new
                Log.d("BtAdapter", "User declined to turn Bluetooth on"); // <- new
            }                                                            // <- new
        }                                                                 // <- new
);                                                                         // <- new

BluetoothManager bluetoothManager = getSystemService(BluetoothManager.class); // <- new
bluetoothAdapter = bluetoothManager.getAdapter();                        // <- new

if (bluetoothAdapter == null) {                                          // <- new
    Log.d("BtAdapter", "This device has no Bluetooth hardware");         // <- new
} else if (!bluetoothAdapter.isEnabled()) {                              // <- new
    Log.d("BtAdapter", "Bluetooth exists but is off — requesting enable"); // <- new
    Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE); // <- new
    enableBtLauncher.launch(enableBtIntent);                             // <- new
} else {                                                                  // <- new
    Log.d("BtAdapter", "Bluetooth already on");                         // <- new
}                                                                          // <- new
```

### Mechanical Walkthrough

- `getSystemService(BluetoothManager.class)` — **first appearance of
  this overload**, full treatment above. Notice what's *absent*
  compared to every earlier `getSystemService` call in this series: no
  cast. `getSystemService(Context.CLIPBOARD_SERVICE)` in Lesson 01
  returned `Object`, requiring `(ClipboardManager) rawService`;
  `getSystemService(BluetoothManager.class)` returns `BluetoothManager`
  directly. Same manager pattern underneath, a different, newer,
  type-safe front door onto it.
- `bluetoothManager.getAdapter()` — **first appearance.** Returns
  `null`, not an exception, on hardware with no Bluetooth radio — the
  same nullability discipline every `getSystemService`/`getDefaultSensor`
  call in this series has already followed since Lesson 01.
- `bluetoothAdapter.isEnabled()` — **first appearance.** A `boolean`,
  checked only after the `null` check already ruled out "doesn't
  exist" — calling this on a `null` reference would throw
  `NullPointerException`, which is exactly why it sits in an
  `else if`, never reached unless `bluetoothAdapter` is already known
  non-`null`. Requires `BLUETOOTH_CONNECT`, granted (or not) back in
  Lesson 07 — a device that never granted it would have this call fail
  with a `SecurityException` instead of returning a plain `boolean`.
- `new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE)` — **first
  appearance of this specific constant; `Intent` itself reappearing
  from Lesson 03, brief reminder only.** `ACTION_REQUEST_ENABLE` is a
  `String` constant naming one specific, Android-built-in screen —
  "ask the user whether this app may turn on Bluetooth" — the same way
  `Context.CLIPBOARD_SERVICE` named a specific system service, just
  naming a screen to launch instead.
- `registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {...})` —
  **new contract type, `registerForActivityResult` itself reappearing
  from Lesson 07, brief reminder only.** Same unconditional-call
  requirement Lesson 07 already covered in full; the contract is
  different because this is asking for a general "how did the launched
  screen end" answer, not a permissions-specific one.
- `result.getResultCode()` — **first appearance.** `ActivityResult`
  (this contract's own output type) bundles a result code and,
  optionally, an `Intent` of returned data — only the code is used
  here.
- `Activity.RESULT_OK` — **first appearance**, full treatment above.
- `enableBtLauncher.launch(enableBtIntent)` — **reappearing shape
  (`.launch(...)`) from Lesson 07, new argument type.** Lesson 07's
  launcher accepted a `String[]`; this one accepts an `Intent` — the
  method name and the "fires a real system UI, returns immediately,
  the real answer arrives later in the registered callback" behavior
  are otherwise identical.

### Execution Trace

**Same honesty note as Lessons 06 and 07:** predicted output,
confirmed against Android's real current documentation, not captured
from a real run in this session.

1. `onCreate` runs. Lesson 07's permission block runs first (assume
   already granted, from a prior run). `enableBtLauncher` is
   registered — no UI yet.
2. `getSystemService(BluetoothManager.class)` returns a real
   `BluetoothManager` — this exists on essentially every current
   Android phone or tablet, unlike the adapter itself.
3. `bluetoothManager.getAdapter()` runs. On a phone with real
   Bluetooth hardware, predict a non-`null` `BluetoothAdapter`.
4. `bluetoothAdapter.isEnabled()` runs. Predict `false` on a device
   where Bluetooth was never turned on — the common starting state.
5. The `else if` branch runs: an `Intent` is built and
   `enableBtLauncher.launch(...)` fires. Android's own built-in
   "Allow this app to turn on Bluetooth?" dialog appears. `onCreate`
   finishes immediately after — same non-blocking shape Lesson 07's
   permission dialog had.
6. The user taps "Allow." *Only now* does the registered callback run,
   with `result.getResultCode()` predicted to equal
   `Activity.RESULT_OK`. Predicted log: `"User turned Bluetooth on"`.
7. Rerun the app (Bluetooth now already on from step 6). Predict step
   4's `isEnabled()` now returns `true`, so the final `else` branch
   runs instead: `"Bluetooth already on"` — no dialog shown a second
   time, the same already-satisfied-state shape Lesson 07's grant
   check produced on a second run.

### CS Lens

**Nullable-then-stateful, checked in that exact order, is the same
two-stage validation shape as every login flow that checks "does this
account exist" before "is the password correct."** Checking password
correctness against a nonexistent account is either a crash or a
meaningless answer; checking `isEnabled()` on a `null` adapter is
exactly the same category of mistake, which is why the `null` check
sits in an `if` and the enabled check sits in the `else if` chained
after it — order encodes a real dependency between the two checks, not
just two unrelated conditions.

### SE Lens

**Why does Android make apps ask permission to merely turn Bluetooth
*on*, rather than just doing it?** Bluetooth is a shared, device-wide
resource — turning it on affects every other app and any currently
paired accessory, uses power immediately, and (before this app has
done anything else with it) may not even be something the user wants
right now. The real alternative Android didn't choose: silently
enabling it in the background the first time any app needs it, which
would optimize for this one app's convenience at the cost of a user
never being surprised by their own phone's radio state changing
without warning. The honest cost of the chosen design: every app that
needs Bluetooth on has to handle the "user said no" branch as a real,
expected outcome — Lesson 09 begins from exactly that assumption,
building nothing that requires this dialog to have been accepted.

---

## Connect the Pieces

`getSystemService(BluetoothManager.class)` — the same manager pattern
from Lesson 01, through its newer type-safe front door — hands back
the one object that can hand back the adapter. The adapter is checked
for existence first, matching Step 1's proof that "exists" and "is on"
are separate facts, then for enablement second, only once existence is
certain. `ACTION_REQUEST_ENABLE`, launched through the exact same
`registerForActivityResult` shape Lesson 07 already established — a
new contract type, the same non-blocking, callback-answers-later
behavior — is what actually gets a user's real answer.

## What Breaks Without This

Skip the `null` check and call `isEnabled()` unconditionally:

```java
bluetoothAdapter = bluetoothManager.getAdapter();
if (!bluetoothAdapter.isEnabled()) {   // <- no null check first
    ...
}
```

On a device with no Bluetooth hardware, predicted result: a real
`NullPointerException`, crashing the app at this exact line, the
instant `onCreate` runs — not a graceful "Bluetooth unavailable"
message, an actual crash, because `bluetoothAdapter` was never
confirmed non-`null` before a method was called on it. Restore the
`if (bluetoothAdapter == null)` guard when done.

## Exercises

1. On an emulator with Bluetooth already on (or after accepting the
   real dialog once), confirm for yourself that rerunning the app logs
   `"Bluetooth already on"` and shows no dialog — the third branch,
   not yet exercised in the trace above by simple reading alone.
2. Tap "Deny" (or dismiss) the real enable dialog instead of "Allow."
   Predict, then confirm, that `result.getResultCode()` is
   `Activity.RESULT_CANCELED`, not `RESULT_OK` — and that nothing in
   this lesson's code crashes or throws when that happens.
3. Most Android emulators simulate Bluetooth hardware existing but
   cannot fully power it on the same way a real phone can. If
   `isEnabled()` behaves oddly on your emulator specifically, note the
   real behavior you observed and compare it, in writing, to what this
   lesson predicted — an honest discrepancy is worth recording, not
   papering over.

## Definition of Done

- [ ] You ran Step 1's scratch file and saw two independent booleans,
      changing one having zero effect on the other.
- [ ] You ran the real Step 2 code and saw the actual result on your
      own device or emulator — adapter present or absent, enabled or
      not — and recorded it, replacing this file's predictions with
      real values.
- [ ] You can explain, without looking, why `getSystemService(BluetoothManager.class)`
      needed no downcast where Lesson 01's `getSystemService(String)`
      did.
- [ ] You can explain why the `isEnabled()` check has to be an
      `else if` chained after the `null` check, not a separate,
      unrelated `if`.
- [ ] You triggered the real crash from "What Breaks Without This,"
      saw the actual `NullPointerException`, and restored the guard.
- [ ] You saw the real enable dialog, answered it both ways (Allow and
      Deny/dismiss) across two runs, and confirmed the result code
      differs correctly between them.
- [ ] Commit: the adapter-acquisition and enable-request code in
      `MainActivity.java`.
