# Lesson 24: Asking Permission — the Runtime Permission Model

**What you will build:** A "Take Photo" button on `ItemDetailFragment`
that correctly requests camera access, handles every possible outcome
(granted, denied, permanently denied), and reports its current
permission state — with the actual photo capture arriving in Lesson
25, once permission handling itself is solid. The transferable
problem: every capability this app has used so far — the database,
`SharedPreferences`, navigation — is entirely within the app's own
sandbox, unconditionally available. The camera is different: it's a
genuinely sensitive, user-visible capability the OS actively protects,
and the Manifest declaration this project has used since Lesson 2 for
Activities is no longer enough on its own — the user must explicitly
grant it, at runtime, and your code must handle every way that request
can be answered, including "no."

**What you need to know first:** Lesson 10 (`ActivityResultLauncher`,
`registerForActivityResult` — this lesson's core mechanism is another
built-in contract in the same family), Lesson 2 (the Manifest as a
declarative "here's what I might do" statement), Lesson 22
(`AlertDialog.Builder`, reused here for the rationale explanation).

---

## Concept Unit: Why Declaring Isn't Enough Anymore

### The Problem

Lesson 2 established the Manifest as the single source of truth for
what an app can do — declare an Activity, and the OS trusts it exists.
Camera access, contacts, precise location, and a specific list of other
sensitive capabilities (Android calls these **dangerous permissions**)
work differently: declaring `<uses-permission android:name="android.permission.CAMERA" />`
in the Manifest is still required, but it only means "this app *might*
ask for this" — it does **not** grant access. The user must be asked,
explicitly, the first time the app actually attempts to use it, and can
say no.

### CS Lens

This is the **principle of least privilege combined with explicit,
revocable user consent** — a capability that could genuinely harm
privacy (a camera can capture anything in view, at any moment, unlike
a database query touching only this app's own data) requires an
affirmative grant from the entity actually at risk, not just a
declaration from the requesting party. Also recognized in: OAuth
consent screens (a third-party app declaring what it wants, a user
explicitly approving each scope), browser permission prompts for
location/camera/notifications, and Unix file permission bits requiring
explicit `chmod` grants rather than defaulting to open access.

---

## Concept Unit: Declaring, Then Checking Current Status

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `AndroidManifest.xml`, `ItemDetailFragment.java`.
- **Change type:** Add.

### The New Code — the Manifest

```xml
<uses-permission android:name="android.permission.CAMERA" />
```

### The Updated Project

Added at the top of `AndroidManifest.xml`, as a sibling to (not nested
inside) the existing `<application>` block from Lesson 2 — permission
declarations sit outside the `<application>` tag, since they describe
the whole app's capabilities, not any one component's.

### Mechanical Walkthrough

- `<uses-permission android:name="android.permission.CAMERA" />` —
  **first appearance.** Same `android:name="..."` attribute shape as
  the `<activity>` tag's own naming (Lesson 2), a different tag,
  declaring intent rather than a component — still required even
  though it alone grants nothing, since the runtime request (built
  next) would be refused outright by the OS without this declaration
  present at all.

### The New Code — Checking Current Status

```java
boolean hasCameraPermission = ContextCompat.checkSelfPermission(
        requireContext(), Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
```

### Mechanical Walkthrough
- `ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.CAMERA)`
  — **first appearance.** Asks the OS, right now, synchronously,
  whether this specific permission is currently granted —
  `Manifest.permission.CAMERA` is a `String` constant (the framework's
  own `Manifest` class, unrelated to this project's `AndroidManifest.xml`
  despite the similar name — a real, easy point of confusion worth
  flagging directly) holding the same string used in the XML
  declaration above.
- `== PackageManager.PERMISSION_GRANTED` — **first appearance.**
- `checkSelfPermission` returns an `int` constant — `PERMISSION_GRANTED` or `PERMISSION_DENIED` — compared directly, the same "constant-

  comparison as a boolean check" shape as Lesson 10's `RESULT_OK`.

### CS Lens

Checking current state before acting, separately from requesting a
state change, is the same **query-before-command** discipline good
APIs generally follow — you can always ask "am I allowed to do this
right now?" without triggering a request, the same distinction
`SharedPreferences.getInt` (read) draws against `Editor.putInt` (write)
back in Lesson 11.

---

## Concept Unit: Requesting Permission — Another Activity Result Contract

### The Problem

If permission isn't currently granted, the app needs to actually ask —
and, per Lesson 10's Activity Result API, that means registering a
launcher for a specific contract, this time one built specifically for
permissions rather than starting an Activity.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `ItemDetailFragment.java`.
- **Change type:** Add.
- **Dependencies:** the Activity Result API pattern, Lesson 10.

### The New Code

```java
private final ActivityResultLauncher<String> cameraPermissionLauncher =
        registerForActivityResult(new ActivityResultContracts.RequestPermission(), granted -> {
    if (granted) {
        Toast.makeText(requireContext(), "Camera permission granted", Toast.LENGTH_SHORT).show();
    } else {
        Toast.makeText(requireContext(), "Camera permission denied", Toast.LENGTH_SHORT).show();
    }
});
```

```java
Button takePhotoButton = view.findViewById(R.id.takePhotoButton);
takePhotoButton.setOnClickListener(v -> {
    boolean hasCameraPermission = ContextCompat.checkSelfPermission(
            requireContext(), Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
    if (hasCameraPermission) {
        Toast.makeText(requireContext(), "Already have camera permission", Toast.LENGTH_SHORT).show();
    } else if (shouldShowRequestPermissionRationale(Manifest.permission.CAMERA)) {
        showRationaleDialog();
    } else {
        cameraPermissionLauncher.launch(Manifest.permission.CAMERA);
    }
});
```

### The Updated Project

Added to `ItemDetailFragment` — the launcher as a field, same
declared-before-`onViewCreated` placement rule Lesson 10 established
for `addItemLauncher`; the button's click handling added inside
`onViewCreated`, alongside the Delete menu wiring from Lesson 22.

### Mechanical Walkthrough
- `ActivityResultLauncher<String>` — reappearing (Lesson 10), new type
  parameter: `String` instead of `Intent`, since this contract's
  "input" is a permission name, not a screen to launch.
- `new ActivityResultContracts.RequestPermission()` — **first
  appearance.** A different built-in contract from Lesson 10's
- `StartActivityForResult` — same family, same registration mechanism,
  purpose-built for exactly one permission at a time.
- The callback lambda receiving `granted` (a `boolean`, not a
- `ActivityResult` object this time) — **first appearance of this
  specific callback shape**, still the same reappearing "register a
  callback ahead of time" pattern from Lesson 10.
- `shouldShowRequestPermissionRationale(Manifest.permission.CAMERA)` —
  **first appearance.** A framework-provided method (inherited,
  available directly on `Fragment`) returning `true` specifically when
  the user has denied this permission *once before* but hasn't
  permanently blocked it — the OS's own signal that showing extra
  context before asking again is likely to help, rather than annoying
  a user who's never been asked at all (where it returns `false`) or
  one who's already permanently declined (where it also returns
  `false`, covered in the next unit).
- `cameraPermissionLauncher.launch(Manifest.permission.CAMERA)` —
  reappearing (`.launch(...)`, Lesson 10), new argument type matching
- the `RequestPermission` contract — this is what actually triggers the
  OS's real permission dialog.

### CS Lens

`shouldShowRequestPermissionRationale`'s three-way signal — never
asked, asked-and-denied-once, permanently-denied — is a small **state
machine** layered on top of a seemingly binary yes/no permission,
because a single boolean can't distinguish "ask normally" from "explain
first" from "don't ask again, guide to Settings instead" (built next).

---

## Concept Unit: Rationale and Permanent Denial

### The Problem

A bare permission prompt, with no context, is easy to reflexively deny
— explaining *why* the app wants camera access, right before asking
again, measurably improves grant rates and is exactly what
`shouldShowRequestPermissionRationale` signals is worth doing. And once
a user permanently denies a permission (checking "Don't ask again," or
denying twice on some Android versions), calling `.launch(...)` again
does nothing useful at all — the request is auto-denied instantly, with
no dialog shown.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `ItemDetailFragment.java`.
- **Change type:** Add — a new private method.
- **Dependencies:** `AlertDialog.Builder` (Lesson 22).

### The New Code

```java
private void showRationaleDialog() {
    new AlertDialog.Builder(requireContext())
            .setTitle("Camera Permission Needed")
            .setMessage("Pocket Inventory uses the camera to attach a photo to an item.")
            .setPositiveButton("Continue", (dialog, which) ->
                    cameraPermissionLauncher.launch(Manifest.permission.CAMERA))
            .setNegativeButton("Not Now", null)
            .show();
}
```

### The Updated Project

A new private method, called only from the `else if
(shouldShowRequestPermissionRationale(...))` branch built in the
previous unit — the real request (`cameraPermissionLauncher.launch(...)`)
only happens after the user explicitly continues past this
explanation, never automatically.

### Mechanical Walkthrough

- `new AlertDialog.Builder(...)` — reappearing, Lesson 22, applied to
  a new, different purpose: explaining *before* a system prompt rather
  than confirming a destructive action.
- `.setPositiveButton("Continue", (dialog, which) -> cameraPermissionLauncher.launch(...))`
  — reappearing (Lesson 22's shape), the actual permission request
  deferred until this explicit continuation.

### Run It

Run the app, open an item's detail screen, tap "Take Photo." The first
time, `shouldShowRequestPermissionRationale` returns `false` (never
asked before) and the system permission dialog appears directly. Deny
it. Tap "Take Photo" again: this time
`shouldShowRequestPermissionRationale` returns `true`, and your
rationale dialog appears first — confirm this with your own eyes, not
just by reading the code. Deny it a second time (or check "Don't ask
again" if your device/emulator offers that option): tap "Take Photo" a
third time and confirm neither dialog appears — the request is silently
denied instantly, `hasCameraPermission` stays `false`, proving
permanent denial's real, different behavior. To recover for testing,
manually re-enable the permission via the device's **App Info → Permissions**
system settings screen.

### SE Lens

**Why does Android auto-deny a permanently-denied permission instead of
just showing the same system dialog every time, forever?** Repeatedly
re-prompting for something a user has already explicitly refused is
exactly the kind of dark-pattern-adjacent nagging real apps have
historically abused to wear users into eventually tapping "Allow" out
of fatigue. The OS closing that path — after a user's explicit,
repeated "no," further requests are silently refused with no dialog at
all — trades away a legitimate use case (a user who changes their mind
and taps the button again, expecting to be re-asked) to structurally
prevent an abusive one, at the cost of every app needing exactly the
three-branch handling (`granted` / `show rationale` / `permanently
denied, guide to Settings`) this lesson built in full.

---

## Connect the Pieces

Full trace: the Manifest declares `CAMERA` as a capability this app
might use, satisfying the OS's requirement that the permission exist
in the app's declared set at all → tapping "Take Photo" checks current
status via `ContextCompat.checkSelfPermission` → if already granted,
nothing further happens → if not, `shouldShowRequestPermissionRationale`
decides whether an explanatory dialog (Lesson 22's `AlertDialog.Builder`,
reused for a new purpose) is warranted first → either path ends at
`cameraPermissionLauncher.launch(...)`, an `ActivityResultLauncher`
built from the same `registerForActivityResult` mechanism Lesson 10
introduced for screen navigation, here specialized for a single
permission string → the callback reports `granted` or not, the one
signal Lesson 25's real camera-capture feature will gate itself on.

## What Breaks Without This

Temporarily remove the `<uses-permission android:name="android.permission.CAMERA" />`
line from the Manifest, leaving all the Java code intact. Run the app,
tap "Take Photo": `cameraPermissionLauncher.launch(...)` now returns
`false` (denied) immediately, with **no dialog ever shown at all** —
the OS refuses even to prompt for a permission the app never declared
wanting, a real, silent-feeling failure mode distinct from a genuine
user denial. Restore the Manifest line afterward.

## Exercises

1. Add a small permanent-denial affordance: if `hasCameraPermission` is
   `false` **and** `shouldShowRequestPermissionRationale` is also
   `false` **and** the permission was previously requested at least
   once (track this yourself with a `SharedPreferences` boolean flag,
   Lesson 11's pattern, set the first time `.launch(...)` is ever
   called), show a dialog directing the user to the system App Info
   screen instead of silently doing nothing.
2. Look up (documentation, no code required) which of this project's
   *other* capabilities — the database, `SharedPreferences`, exact
   navigation — are or aren't in Android's "dangerous permission" list,
   and write down, in your own words, what property camera/location/
   contacts share that database access does not.

## Definition of Done

- [ ] The Manifest declares the `CAMERA` permission.
- [ ] Tapping "Take Photo" correctly branches across all three states:
      already granted, needs rationale, and fresh request.
- [ ] You personally triggered and observed a rationale dialog and a
      permanently-denied silent refusal, not just read about them.
- [ ] You removed the Manifest permission line on purpose, saw the
      silent instant-denial failure, and restored it.
- [ ] Commit: message explaining why (e.g. "Add camera permission
      request handling covering granted, rationale, and permanently-
      denied states, ahead of Lesson 25's actual photo capture
      feature").

Lesson 25 is next: permission granted is only half the job — Implicit
Intents, letting the device's actual Camera app do the capturing
instead of this project writing its own camera UI from scratch.
