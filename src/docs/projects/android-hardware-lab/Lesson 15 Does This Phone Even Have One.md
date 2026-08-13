# Lesson 15: Does This Phone Even Have One?

**What you will build:** the `CAMERA` permission requested and
granted, and a real, explicit check for whether this device has a
camera *at all* — the first lesson in a new hardware arc, reusing
Lesson 07's permission machinery almost unchanged, for one permission
instead of two. Nothing about the camera itself yet — Lesson 15 does
that, once this lesson's two gates are both open.

**What you need to know first:** Lesson 07 in full (permissions,
`registerForActivityResult`, `ContextCompat.checkSelfPermission`) —
this lesson reapplies that exact machinery, not new machinery.

**Terms introduced in this lesson:**
- **Hardware feature** — a fact about what a specific physical device
  actually has, independent of permission entirely. A tablet with no
  camera at all can't be fixed by granting `CAMERA` permission — the
  hardware simply isn't there. This is a third, independent gate,
  alongside Lesson 07's two (declared in Manifest, granted at
  runtime) — Bluetooth existing on virtually every modern phone made
  that third gate easy to overlook; camera-less Android devices
  (tablets, some TV boxes) are common enough that this series can't
  skip it here.

**Objects and methods this lesson uses:**
- **`PackageManager`**
  - *What it is:* the object that answers questions about what's
    installed and what hardware exists on this device.
  - *Implementation:* obtained via `getPackageManager()`, inherited
    from `Context` — a new accessor method, though the manager-pattern
    shape underneath (Lesson 01) is identical to every
    `getSystemService` call so far.
  - *Its use:* asked, below, whether a camera exists on this device at
    all.
- **`PackageManager.hasSystemFeature(String)`**
  - *What it is:* a yes/no check for one specific hardware or software
    feature.
  - *Implementation:* returns `boolean`; takes a `String` constant
    naming the feature, the same shape as every other named-constant
    lookup in this series (`Context.CLIPBOARD_SERVICE`,
    `Sensor.TYPE_LIGHT`).
  - *Its use:* checked with `PackageManager.FEATURE_CAMERA_ANY`, below
    — "any," specifically, because it matches a device with *either* a
    front or a back camera, not only one specific facing.
- **`ActivityResultContracts.RequestPermission`** (singular)
  - *What it is:* the one-permission sibling of Lesson 07's
    `RequestMultiplePermissions`.
  - *Implementation:* contract type `String` in (one permission name,
    not an array), `Boolean` out (one grant result, not a map).
  - *Its use:* requesting `CAMERA` alone — Bluetooth needed two
    permissions requested together; camera needs only one, so the
    simpler contract fits without forcing an unnecessary array or map.

---

## Concept Unit: A Third Gate, Independent of the Other Two

### The Problem

Lesson 07 proved two independent gates — declared in the Manifest,
granted at runtime — using a `Set` and a `Map`. Camera adds a third,
equally independent fact: whether the hardware exists on this specific
device *at all*. Granting `CAMERA` permission on a device with no
camera changes nothing — there's still no camera. Checking for the
hardware without also handling permission is equally incomplete — a
device with a real camera still won't let this app use it without
consent. All three have to hold at once.

### Introduce the Concept in Isolation — Step 1: Three Gates, Still No Android

Scratch file:

```java
boolean hardwareExists = false; // stands in for hasSystemFeature
Set<String> declaredPermissions = new HashSet<>();
declaredPermissions.add("CAMERA");
Map<String, Boolean> grantedPermissions = new HashMap<>();

boolean canUseCamera = hardwareExists
        && declaredPermissions.contains("CAMERA")
        && Boolean.TRUE.equals(grantedPermissions.get("CAMERA"));
System.out.println("Can use camera? " + canUseCamera); // false — no hardware yet

hardwareExists = true;
grantedPermissions.put("CAMERA", true);
canUseCamera = hardwareExists
        && declaredPermissions.contains("CAMERA")
        && Boolean.TRUE.equals(grantedPermissions.get("CAMERA"));
System.out.println("Can use camera now? " + canUseCamera); // true — all three finally agree
```

Run it. Expected output:

```
Can use camera? false
Can use camera now? true
```

Three independent facts, combined with `&&` — Lesson 07's own two-gate
shape, extended by exactly one more, for exactly the reason real
camera-less Android devices make unavoidable here in a way Bluetooth
never forced.

**Discard this scratch file.**

### The Real Thing

**Reference Source:** no reference counterpart — `hasSystemFeature`,
`FEATURE_CAMERA_ANY`, and the `CAMERA` permission's runtime status are
Android platform facts, confirmed against Android's current
documentation this session.

**Files affected:** `AndroidManifest.xml` (one new permission line);
`MainActivity.java` (new field, new lines in `onCreate`).

**Change type:** add.

**Location:** the Manifest line sits with Lesson 07's existing
Bluetooth permissions. The Java changes sit near Lesson 07's
permission-launcher setup — a second, independent launcher, not a
modification of the Bluetooth one.

```xml
<uses-permission android:name="android.permission.CAMERA" />       <!-- new -->
```

```java
private ActivityResultLauncher<String> cameraPermissionLauncher;         // <- new
```

In `onCreate`, alongside Lesson 07's Bluetooth permission block:

```java
cameraPermissionLauncher = registerForActivityResult(                     // <- new
        new ActivityResultContracts.RequestPermission(),                  // <- new
        granted -> Log.d("Camera", "Permission granted: " + granted)      // <- new
);                                                                          // <- new

boolean hasCameraHardware = getPackageManager()                           // <- new
        .hasSystemFeature(PackageManager.FEATURE_CAMERA_ANY);             // <- new

if (!hasCameraHardware) {                                                  // <- new
    Log.d("Camera", "No camera on this device");                          // <- new
} else {                                                                    // <- new
    boolean alreadyGranted = ContextCompat.checkSelfPermission(            // <- new
            this, Manifest.permission.CAMERA)                             // <- new
            == PackageManager.PERMISSION_GRANTED;                         // <- new
    if (!alreadyGranted) {                                                 // <- new
        cameraPermissionLauncher.launch(Manifest.permission.CAMERA);      // <- new
    } else {                                                               // <- new
        Log.d("Camera", "Already granted");                              // <- new
    }                                                                      // <- new
}                                                                           // <- new
```

### Mechanical Walkthrough

- `getPackageManager()` — **first appearance**, full treatment above.
- `.hasSystemFeature(PackageManager.FEATURE_CAMERA_ANY)` — **first
  appearance**, full treatment above.
- `if (!hasCameraHardware)` — **reappearing `if` shape; this specific
  hardware-existence check is new, per Terms above.** Checked *before*
  anything about permission — no point asking for consent to use
  something that structurally cannot exist on this device.
- `ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)` —
  **reappearing exact call from Lesson 07, new permission name only.**
- `new ActivityResultContracts.RequestPermission()` — **first
  appearance of the singular contract**, full treatment above,
  contrasted directly with Lesson 07's plural
  `RequestMultiplePermissions`.
- `cameraPermissionLauncher.launch(Manifest.permission.CAMERA)` —
  **reappearing `.launch(...)` shape; new argument type.** Lesson 07's
  launcher took a `String[]`; this one takes a bare `String` — matches
  the singular contract's own input type, per Objects and methods
  above.
- `granted -> Log.d(...)` — **reappearing lambda-as-callback shape,
  new callback parameter type.** A plain `Boolean`, not Lesson 07's
  `Map<String, Boolean>` — one permission requested, one plain
  yes/no answer back, nothing to key into.

### Execution Trace

**Same honesty note as every hardware lesson in this series:**
predicted output, verified against Android's current documentation,
not a captured run.

1. `onCreate` runs. `hasSystemFeature(FEATURE_CAMERA_ANY)` is checked
   first. Predict, on essentially any real phone: `true`.
2. `checkSelfPermission` runs. Predict, on a fresh install:
   `PERMISSION_DENIED`, so `alreadyGranted` is `false`.
3. `cameraPermissionLauncher.launch(...)` fires the real system
   permission dialog. `onCreate` finishes immediately after, same
   non-blocking shape as every permission request in this series.
4. The user taps "Allow." Predict the registered lambda runs with
   `granted = true`, logging `"Permission granted: true"`.
5. On a device or emulator configured with no camera at all (some
   Android emulator profiles specifically), predict step 1 alone
   determines the outcome: `"No camera on this device"` logs, and no
   permission dialog ever appears — correctly, since asking for
   consent to use hardware that doesn't exist would be pointless.

### CS Lens

**Three independent boolean preconditions, combined with `&&`, all
required before one action is safe to perform** — the same minimal
access-control shape Lesson 07's SE Lens already named, now with a
third term added. Also recognized in: a flight only taking off once
weather, mechanical checks, *and* crew readiness independently clear —
any one alone is not enough, and none of the three provides
information about the others.

### SE Lens

**Why check hardware existence *before* permission, rather than the
other way around, or simultaneously?** Checking hardware first is
strictly cheaper — `hasSystemFeature` is a fast, local, synchronous
check with no dialog, no user interruption, no possibility of
annoying anyone. Asking for a dangerous permission the app can never
actually use, on a device that structurally cannot have a camera,
would cost a real interruption for zero possible benefit. Ordering the
cheap, silent check before the expensive, user-facing one is a small
but real instance of a general principle worth naming: fail fast, and
fail cheaply, before paying for anything more expensive.

---

## Connect the Pieces

`hasSystemFeature(FEATURE_CAMERA_ANY)` answers a question Lesson 07
never had to ask — not "has the user agreed," but "could this device
possibly say yes at all" — checked first, cheaply, before anything
else runs. Only once that's confirmed does this lesson reapply Lesson
07's exact permission machinery, singular-contract version, to the one
remaining, genuinely independent question: has *this* user, on *this*
run, actually granted it. All three gates from Step 1's isolated proof
— hardware, declaration, grant — have to agree before Lesson 15 can
safely open a real camera.

## What Breaks Without This

Skip the hardware check and request the permission unconditionally:

```java
cameraPermissionLauncher.launch(Manifest.permission.CAMERA); // <- no hasSystemFeature check first
```

On a real camera-less device or emulator profile, predicted result:
Android still shows the permission dialog (the OS itself doesn't
prevent asking), the user can still tap "Allow," and `granted` still
comes back `true` — permission granted for a capability that flatly
does not exist on this hardware. Nothing crashes here, but Lesson 15's
next real camera call, trusting that a `true` grant means a usable
camera, would be the one to actually fail. Restore the
`hasSystemFeature` guard when done.

## Exercises

1. On a real device, log the actual boolean `hasSystemFeature` returns
   and confirm it matches reality — `true` on your phone, and (if you
   have access to an emulator profile with no camera) `false` there.
2. Look up `PackageManager.FEATURE_CAMERA` (no `_ANY`) and predict how
   it differs from `FEATURE_CAMERA_ANY` before checking — confirm
   your prediction against Android's own documentation for both
   constants.
3. Deny the camera permission on purpose, then check
   `ActivityCompat.shouldShowRequestPermissionRationale` for `CAMERA`
   (Lesson 07's Exercise 2 already covered this same method for
   Bluetooth) — confirm it behaves the same way here, for a different
   permission.

## Definition of Done

- [ ] You ran Step 1's scratch file and confirmed three independent
      booleans, all required, before `canUseCamera` became `true`.
- [ ] You ran the real Step 2 code on a real device and saw the actual
      hardware check and permission dialog both behave as predicted.
- [ ] You can explain, without looking, why the hardware check runs
      *before* the permission request, not after or simultaneously.
- [ ] You can state what's different between Lesson 07's
      `RequestMultiplePermissions` and this lesson's singular
      `RequestPermission`, and why each fits its own lesson's need.
- [ ] You triggered the real "requested a permission for hardware that
      doesn't exist" case from What Breaks Without This (or reasoned
      through it precisely, if no camera-less test device was
      available) and understood why nothing crashes *yet*.
- [ ] Commit: the Manifest permission and the hardware/permission
      check code in `MainActivity.java`.
