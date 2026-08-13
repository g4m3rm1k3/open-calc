# Lesson 07: The Permission the Manifest Alone Can't Grant

**What you will build:** a request for two Bluetooth permissions —
declared in `AndroidManifest.xml`, then asked for again, out loud, at
runtime, using Android's current `ActivityResultContracts` API. This
is the first lesson in the series to touch the Manifest directly, and
the first time a feature needs the *user's* explicit, revocable
consent, not just the OS handing you an object. It fulfills a promise
Lesson 01 made and then deliberately left alone: *"Permissions get
their own lesson later in this series."* This lesson doesn't yet do
anything with Bluetooth itself — Lesson 08 does, now that this gate is
open.

**What you need to know first:** Lesson 01 (`Context`, system
services), Lesson 03 (listeners, lambda syntax) — the permission
result below arrives through the same "callback fires later, not
right now" shape a listener does, just from the Android framework
itself instead of from an object you registered a listener on.

**Terms introduced in this lesson:**
- **Manifest permission** — a line in `AndroidManifest.xml` stating
  that an app *might* use a capability. Required for every permission,
  but for a **dangerous permission** (below), it's the first of two
  separate gates, not the only one.
- **Dangerous permission (runtime permission)** — a permission Android
  additionally requires the *user* to approve, at the moment the app
  actually needs it, with a real system dialog the user can deny.
  `BLUETOOTH_SCAN` and `BLUETOOTH_CONNECT` are both dangerous;
  something like declaring the app needs internet access is not — it's
  granted automatically at install time, no dialog, no possibility of
  denial.
- **Grant state** — whether the user has actually approved a dangerous
  permission, right now. Independent of whether it's declared in the
  Manifest; a permission can be declared and still not granted, and a
  user can revoke a previously granted one at any time from system
  settings, without the app doing anything.

**Objects and methods this lesson uses:**
- **`ActivityResultContracts.RequestMultiplePermissions`**
  - *What it is:* a reusable, pre-built recipe for "ask the user to
    grant a whole set of dangerous permissions at once, then hand back
    which ones they said yes to."
  - *Implementation:* a class in `androidx.activity.result.contracts`;
    its contract type is `String[]` in (the permissions to request)
    and `Map<String, Boolean>` out (each permission name mapped to
    whether it was granted).
  - *Its use:* registered once, in Concept Unit 2 below, to request
    `BLUETOOTH_SCAN` and `BLUETOOTH_CONNECT` together in one dialog
    instead of two separate ones.
- **`registerForActivityResult(contract, callback)`**
  - *What it is:* the method that turns a contract (above) into a
    reusable, launchable object.
  - *Implementation:* inherited from `ComponentActivity` (a class
    `AppCompatActivity` itself extends); returns an
    `ActivityResultLauncher<String[]>` for this specific contract type.
  - *Its use:* called once, stored in a field — per Android's own
    requirement, covered in the Mechanical Walkthrough below, on
    exactly *when* it's allowed to be called.
- **`ContextCompat.checkSelfPermission(Context, String)`**
  - *What it is:* a synchronous yes/no check of a dangerous
    permission's current grant state, with no dialog, no waiting.
  - *Implementation:* a `static` method in AndroidX's `core` library;
    returns an `int`, compared against `PackageManager.PERMISSION_GRANTED`.
  - *Its use:* checked first, every time, before assuming a launch is
    even necessary — asking again for something already granted would
    still work, but checking first avoids an unnecessary dialog.

---

## Concept Unit: Two Independent Gates, Not One

### The Problem

Every object this series has obtained so far — `ClipboardManager`,
`SensorManager`, a `Sensor` itself — came from `getSystemService`, and
the only thing standing between asking and receiving was whether the
hardware existed at all. Bluetooth introduces a second, genuinely
different kind of gate: even on a device that has Bluetooth, and even
with the right line sitting in `AndroidManifest.xml`, code that calls
a Bluetooth method can still fail — because a human being, not the
OS and not the Manifest, has to say yes, in real time, and can say no,
or can take that yes back later. Declaring a permission and *having*
a permission are two separate facts that can disagree with each
other.

### Introduce the Concept in Isolation — Step 1: Two Gates, No Android At All

Scratch file, no Android import:

```java
Set<String> declaredPermissions = new HashSet<>();
declaredPermissions.add("BLUETOOTH_SCAN"); // like a line in the Manifest

Map<String, Boolean> grantedPermissions = new HashMap<>(); // like the user's real answer

boolean canScanNow = declaredPermissions.contains("BLUETOOTH_SCAN")
        && Boolean.TRUE.equals(grantedPermissions.get("BLUETOOTH_SCAN"));
System.out.println("Can scan? " + canScanNow);

grantedPermissions.put("BLUETOOTH_SCAN", true); // the user says yes, later
boolean canScanAfter = declaredPermissions.contains("BLUETOOTH_SCAN")
        && Boolean.TRUE.equals(grantedPermissions.get("BLUETOOTH_SCAN"));
System.out.println("Can scan now? " + canScanAfter);
```

Run it. Expected output:

```
Can scan? false
Can scan now? true
```

Nothing changed about `declaredPermissions` between the two checks —
it was declared the whole time. What changed was a *separate* map,
standing in for the user's real-time decision. This is the entire
shape of the real problem, with both real gates replaced by a
`Set` and a `Map` so the shape itself is visible without any Android
API in the way yet.

**Discard this scratch file.**

### Introduce the Concept in Isolation — Step 2: The Real Thing

**Reference Source:** no reference counterpart — this lesson's
permission constants and Activity Result API usage are Android
platform facts (confirmed against Android's current developer
documentation this session), not ported from any other file in this
project.

**Files affected:** `AndroidManifest.xml` (new lines) and
`MainActivity.java` (new field, new method call, new branch inside
`onCreate`).

**Change type:** add.

**Location:** the Manifest lines go inside the existing `<manifest>`
element, above `<application>`. The Java changes go in `MainActivity`:
a new field declared alongside the existing sensor fields, and new
lines added near the top of `onCreate`, before anything else runs.

**Dependencies:** none beyond what's already in the project.

First, `AndroidManifest.xml` — a file this series has not opened
before now:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/auto">

    <!-- Pre-Android 12 devices use these instead; ignored on API 31+ -->
    <uses-permission android:name="android.permission.BLUETOOTH"
                      android:maxSdkVersion="30" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN"
                      android:maxSdkVersion="30" />

    <!-- Android 12+ (API 31+) permissions -->
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN"
                      android:usesPermissionFlags="neverForLocation" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

    <application ... >
        ...
    </application>
</manifest>
```

Now `MainActivity.java`. A field for the launcher — declared where
every other field in this class lives, not inside a method:

```java
private ActivityResultLauncher<String[]> bluetoothPermissionLauncher;   // <- new
```

`registerForActivityResult` has one hard requirement, covered fully in
the Mechanical Walkthrough below: it must be called unconditionally,
every time `onCreate` runs, before the Activity reaches
`STARTED` — so it's assigned directly in `onCreate`, near the top,
before the existing clipboard and sensor setup:

```java
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    EdgeToEdge.enable(this);
    setContentView(R.layout.activity_main);

    bluetoothPermissionLauncher = registerForActivityResult(                    // <- new
            new ActivityResultContracts.RequestMultiplePermissions(),           // <- new
            grantResults -> {                                                  // <- new
                boolean scanGranted = Boolean.TRUE.equals(                      // <- new
                        grantResults.get(Manifest.permission.BLUETOOTH_SCAN));  // <- new
                boolean connectGranted = Boolean.TRUE.equals(                   // <- new
                        grantResults.get(Manifest.permission.BLUETOOTH_CONNECT)); // <- new
                Log.d("BtPermission", "Scan granted: " + scanGranted            // <- new
                        + ", Connect granted: " + connectGranted);              // <- new
            }                                                                    // <- new
    );                                                                           // <- new

    boolean scanAlreadyGranted = ContextCompat.checkSelfPermission(              // <- new
            this, Manifest.permission.BLUETOOTH_SCAN)                           // <- new
            == PackageManager.PERMISSION_GRANTED;                               // <- new
    boolean connectAlreadyGranted = ContextCompat.checkSelfPermission(           // <- new
            this, Manifest.permission.BLUETOOTH_CONNECT)                        // <- new
            == PackageManager.PERMISSION_GRANTED;                               // <- new

    if (!scanAlreadyGranted || !connectAlreadyGranted) {                         // <- new
        bluetoothPermissionLauncher.launch(new String[]{                        // <- new
                Manifest.permission.BLUETOOTH_SCAN,                             // <- new
                Manifest.permission.BLUETOOTH_CONNECT                           // <- new
        });                                                                      // <- new
    } else {                                                                     // <- new
        Log.d("BtPermission", "Both already granted");                          // <- new
    }                                                                            // <- new

    // ---- existing clipboard and sensor setup continues unchanged below ----
    Object rawService = getSystemService(Context.CLIPBOARD_SERVICE);
    ...
```

### Mechanical Walkthrough

- `ActivityResultLauncher<String[]>` — **first appearance**, full
  treatment above (Objects and methods). The generic `<String[]>`
  matches the contract's own input type — this specific launcher only
  ever accepts an array of permission-name strings.
- `registerForActivityResult(new ActivityResultContracts.RequestMultiplePermissions(), grantResults -> {...})` —
  **first appearance.** Two arguments: the contract (what kind of
  result this launcher is for) and a lambda — Lesson 03's term,
  reappearing — that runs *later*, whenever the user actually answers
  the system dialog, not at the moment this line executes.
  **Must be called unconditionally, every time `onCreate` runs, before
  the Activity reaches the `STARTED` state** — Android registers a
  matching callback internally by call order, and calling this inside
  an `if`, a click handler, or any other conditional path breaks that
  registration in ways that fail unpredictably later. This is why it
  sits at the very top of `onCreate`, run every single time, whether
  the permissions turn out to already be granted or not.
- `grantResults -> { ... }` — **first appearance of this specific
  callback shape.** `grantResults` is a `Map<String, Boolean>` —
  `RequestMultiplePermissions`'s own contract, from Objects and
  methods above — one entry per permission that was actually
  requested, each mapped to whether the user granted it.
- `Boolean.TRUE.equals(grantResults.get(...))` — **first appearance of
  this exact pattern, worth explaining plainly.** `grantResults.get(...)`
  returns a boxed `Boolean`, which could be `null` if that key isn't
  present at all. Writing `grantResults.get(...) == true` would throw
  a `NullPointerException` the moment auto-unboxing meets a `null` —
  `Boolean.TRUE.equals(...)` never throws, because `equals` on a
  non-null constant handles a `null` argument by simply returning
  `false`, not by crashing.
- `Manifest.permission.BLUETOOTH_SCAN`, `.BLUETOOTH_CONNECT` — **first
  appearance.** `Manifest` here is Android's own `android.Manifest`
  class (distinct from the `AndroidManifest.xml` file, despite the
  name) — a class that exists purely to hold permission-name constants
  as real `String` fields, so a typo becomes a compile error instead
  of a silently-wrong string.
- `ContextCompat.checkSelfPermission(this, ...)` — **first appearance**,
  full treatment above. Returns immediately — no dialog, no waiting —
  answering only "is it granted right now," not "should I ask."
- `PackageManager.PERMISSION_GRANTED` — **first appearance.** An `int`
  constant (its counterpart, `PERMISSION_DENIED`, is the other
  possible value) — `checkSelfPermission`'s real return type is `int`,
  not `boolean`, which is why the comparison uses `==` against this
  named constant rather than treating the call as if it already
  returned a `boolean`.
- `bluetoothPermissionLauncher.launch(new String[]{...})` — **first
  appearance.** This is the line that actually shows the system
  dialog — everything above it only prepared for this moment.
  Control returns immediately after this call; the app does not pause
  or block waiting for the user's answer, exactly like Lesson 03's
  listener never blocked waiting for a clipboard change.

### Execution Trace

**Same honesty note as Lesson 06:** no real device in this session —
predicted, not captured, output. Confirm against a real run.

1. `onCreate` starts. `registerForActivityResult` runs first,
   unconditionally — this only *prepares* a launcher; no dialog yet,
   and the lambda inside it does not run yet either.
2. `checkSelfPermission` runs twice. On a fresh install, neither
   permission has ever been granted — predict both checks return
   `PackageManager.PERMISSION_DENIED`, so `scanAlreadyGranted` and
   `connectAlreadyGranted` are both `false`.
3. The `if` is true (at least one isn't granted yet).
   `bluetoothPermissionLauncher.launch(...)` runs. The real system
   permission dialog appears on screen. `onCreate` finishes running
   immediately after — the dialog appearing does not pause it.
4. The user taps "Allow" (or "Deny") on the real system dialog — this
   happens outside your code entirely, at whatever moment the user
   actually responds.
5. *Only now* does the lambda passed to `registerForActivityResult`
   run, with `grantResults` populated from the user's real answer.
   Predict, for an "Allow" tap: `Log.d` prints `Scan granted: true,
   Connect granted: true`.
6. Close and reopen the app. Predict `scanAlreadyGranted` and
   `connectAlreadyGranted` are now both `true` on the very next
   `checkSelfPermission` call — the grant persists across app
   restarts, tied to the app's install, not to any one Activity
   instance — and the `else` branch runs instead, logging "Both
   already granted," with no dialog shown a second time.

### CS Lens

**Two independent boolean gates, combined with AND, is a minimal
access-control model** — recognized far beyond Android: a file needing
both the right user permissions *and* the filesystem being mounted
read-write; a bank transaction needing both sufficient funds *and*
fraud-check approval; a CI pipeline needing both tests passing *and* a
human's review approval before merging. In every case, satisfying one
gate provides no information at all about the other — they're checked,
and can fail, completely independently, exactly as Step 1 built them.

### SE Lens

**Why does Android split this into two gates (Manifest + runtime)
instead of one?** The Manifest-only declaration exists for the
*developer's* benefit — a static, install-time list of everything the
app could possibly do, readable by an app store, a security scanner,
or a user before ever installing it. The runtime grant exists for the
*user's* benefit — a decision made in context, at the moment it
actually matters, revocable later without reinstalling anything. A
single combined gate would have to pick one of those two audiences and
serve it worse. The real cost of two gates: every dangerous permission
now needs code at both points — a Manifest line that does nothing by
itself, and a runtime check that's meaningless without the Manifest
line underneath it — which is exactly the trap Step 1 built on purpose,
by making it possible for `canScanNow` to check only one Map and quietly
give a wrong answer.

---

## Connect the Pieces

`AndroidManifest.xml` declares that this app might use two Bluetooth
permissions — a fact visible before install, changing nothing about
what runs. `registerForActivityResult`, called unconditionally at the
top of `onCreate`, prepares a launcher and a callback that will fire
later, whenever the user actually answers. `checkSelfPermission`
decides, synchronously, whether that dialog is even necessary right
now. `launch(...)` shows it. The lambda registered back in step one is
what actually reacts to the user's real answer — two gates, checked
and satisfied independently, exactly as Step 1 proved with a bare
`Set` and `Map` before any of this real machinery existed.

## What Breaks Without This

Skip `checkSelfPermission` and call `bluetoothPermissionLauncher.launch(...)`
unconditionally, every single time `onCreate` runs, permission state
ignored entirely:

```java
bluetoothPermissionLauncher.launch(new String[]{      // <- always runs, no check first
        Manifest.permission.BLUETOOTH_SCAN,
        Manifest.permission.BLUETOOTH_CONNECT
});
```

Grant both permissions once, then close and reopen the app. Predicted
result: the system dialog appears *again*, every time, even though
the user already said yes — Android still shows the dialog on request
for an already-granted permission (it doesn't crash or silently
skip it), but this trains a real user to distrust or reflexively
dismiss a prompt that should only appear once. Restore the
`checkSelfPermission` guard when done.

## Exercises

1. Predict, then confirm on a real device: what does `grantResults`
   contain if the user taps "Deny" on only one of the two permissions,
   not both? Confirm the map has an entry for each permission
   independently, not one combined true/false for the whole request.
2. Call `ActivityCompat.shouldShowRequestPermissionRationale(this,
   Manifest.permission.BLUETOOTH_SCAN)` right before the `launch(...)`
   call, and log its result. Deny the permission once, relaunch the
   app, and compare the logged value to what it was on the very first
   run — Android uses this method to distinguish "never asked yet"
   from "asked and the user said no," and the two cases return
   different values here.
3. Manually revoke both permissions from the device's system Settings
   (App info → Permissions) without touching any code, then reopen the
   app. Confirm `checkSelfPermission` reflects the revocation
   immediately — proving grant state can change for reasons entirely
   outside this Activity's own lifecycle.

## Definition of Done

- [ ] You ran Step 1's scratch file and saw the real output — one
      `Set` and one `Map`, checked together, disagreeing until both
      agree.
- [ ] You added the Manifest permissions and the real
      `MainActivity.java` code, and saw the real system permission
      dialog appear on a device or emulator.
- [ ] You can explain, without looking, why `registerForActivityResult`
      must be called unconditionally rather than inside the `if`.
- [ ] You can explain what `Boolean.TRUE.equals(...)` protects against
      that a direct `== true` comparison would not.
- [ ] You granted the permissions, restarted the app, and confirmed
      `checkSelfPermission` alone was enough the second time — no
      dialog shown twice.
- [ ] You revoked a permission from system Settings and watched
      `checkSelfPermission` catch it, with no code change of your own.
- [ ] Commit: the Manifest permissions and the permission-request code
      in `MainActivity.java`.
