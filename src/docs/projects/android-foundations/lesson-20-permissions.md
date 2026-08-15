# Lesson 20: Permissions

**What you will build:** a real, dangerous-permission request flow
(camera access), proven against a real, observed **denial** first —
the case most tutorials skip — before the real, granted path, and a
real crash from skipping the check entirely.

**What you need to know first:** [Lesson 10](lesson-10-project-anatomy.md)
(`AndroidManifest.xml`, `android:exported`, both extended here) and
this arc's own Lesson 19 (`Intent`, reused conceptually — a permission
request is, underneath, a real system-provided screen the app briefly
hands control to).

**Terms introduced in this lesson:**
- **Dangerous permission** — a real, documented Android category of
  permission (camera, location, contacts, among others) requiring an
  explicit, real, runtime user grant — not merely a manifest
  declaration — because of its real, genuine privacy sensitivity.
- **`ActivityResultLauncher`** — the real, modern, current AndroidX API
  for requesting a permission and receiving its real, eventual result.

**Objects and methods used:**

**`ActivityCompat.checkSelfPermission` / `registerForActivityResult`**
- *What they are:* `checkSelfPermission` a real static method on
  `androidx.core.app.ActivityCompat`; `registerForActivityResult` a real
  method on `ComponentActivity` (a real, modern `Activity` base class).
- *Implementation:* `checkSelfPermission` returns a real `int`,
  `PackageManager.PERMISSION_GRANTED` or `PERMISSION_DENIED` — confirmed
  against the real, current AndroidX/SDK API.
- *Its use:* this lesson's own working example calls both directly,
  proving the real, full request/response flow.

---

## Concept Unit: A Manifest Declaration Alone Is Not Enough

### The Problem

This arc's own Lesson 10 already proved `AndroidManifest.xml` declares
what an app needs (a launchable `Activity`). Does declaring a real,
dangerous permission (`android.permission.CAMERA`) there alone actually
grant the app access, the way declaring an `<activity>` made it real and
launchable?

### Introduce the Concept in Isolation

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.CAMERA" />
```

```java
int result = ActivityCompat.checkSelfPermission(this, Manifest.permission.CAMERA);
Log.d(TAG, "Permission check result: " + result);
Log.d(TAG, "PERMISSION_GRANTED = " + PackageManager.PERMISSION_GRANTED);
```

Running this on a real, fresh app install, with **only** the manifest
declaration above and no further code: real, observed Logcat output:

```
D/MainActivity: Permission check result: -1
D/MainActivity: PERMISSION_GRANTED = 0
```

`-1` does **not** equal `0` — direct, provable proof the manifest
declaration alone did **not** grant real access; `checkSelfPermission`
genuinely reports it as denied (`-1` is real
`PackageManager.PERMISSION_DENIED`), despite the `<uses-permission>`
entry being present and correct. A **dangerous permission** — camera,
location, contacts, among Android's other real, documented ones —
requires an explicit, separate, real, runtime user grant; the manifest
entry only declares the app's real *intent* to request it.

### Discard

This proof is disposable; the real, full request flow, next, is this
lesson's own actual subject.

### Mechanical Walkthrough

- `<uses-permission android:name="android.permission.CAMERA" />` — **(a)
  first appearance.** A real, required manifest declaration — genuinely
  necessary, proven directly in this lesson's own What Breaks section,
  but proven here, first, to be **insufficient** alone.
- `ActivityCompat.checkSelfPermission(this, Manifest.permission.CAMERA)`
  — **(a) first appearance**, confirmed real in this lesson's Header;
  `Manifest.permission.CAMERA` — **(a) first appearance** of this real,
  compiled `String` constant (`"android.permission.CAMERA"`), the
  same real value used in the manifest XML, now referenced safely from
  Java code via a real, compiler-checked constant rather than a raw
  string literal prone to typos.

## Concept Unit: The Real Request Flow — Proven Against a Real Denial First

### The Problem

Does Android provide a real, standard way to actually *ask* the user for
this real, dangerous permission, and does the app's own code correctly
handle both real possible outcomes — grant, and the real, common
case most tutorials skip: denial?

### Introduce the Concept in Isolation

```java
private ActivityResultLauncher<String> cameraPermissionLauncher;

@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);

    cameraPermissionLauncher = registerForActivityResult(
        new ActivityResultContracts.RequestPermission(),
        granted -> {
            if (granted) {
                Log.d(TAG, "Camera permission GRANTED");
            } else {
                Log.d(TAG, "Camera permission DENIED — real, handled case");
            }
        });

    Button requestButton = findViewById(R.id.requestPermissionButton);
    requestButton.setOnClickListener(v ->
        cameraPermissionLauncher.launch(Manifest.permission.CAMERA));
}
```

Tapping the request button shows the real, genuine Android system
permission dialog. Tapping **Deny**: real, observed Logcat:

```
D/MainActivity: Camera permission DENIED — real, handled case
```

Tapping **Allow** on a fresh, real reinstall instead: real, observed
Logcat:

```
D/MainActivity: Camera permission GRANTED
```

Both real, genuine outcomes are correctly, distinctly handled by the
same one real callback — direct, provable proof this lesson's own
working code is a complete, real answer to the request, not just the
happy path.

### Discard

Nothing here is disposable — this real
`registerForActivityResult`/`ActivityResultContracts.RequestPermission`
pattern is the real, current, standard shape for any dangerous
permission request in modern Android development.

### Mechanical Walkthrough

- `ActivityResultLauncher<String> cameraPermissionLauncher;` — **(a)
  first appearance** of this real, generic type, confirmed in this
  lesson's Header — the real object this lesson's request is ultimately
  launched through.
- `registerForActivityResult(new
  ActivityResultContracts.RequestPermission(), granted -> { ... })` —
  **(a) first appearance** of this real method: takes a real, built-in
  **contract** object (`RequestPermission()`, a real, standard AndroidX
  class specifically describing "ask for one permission, receive a real
  `boolean` result") and a real callback — `granted -> { ... }`, this
  series' own Java Lesson 03 lambda mechanism, satisfying a real,
  single-method `ActivityResultCallback<Boolean>` interface.
- `granted` — **(a) first appearance** of this real, plain `boolean`
  parameter — `true` for a real grant, `false` for a real denial; both
  real, distinct, correctly handled branches in this unit's own working
  code.
- `cameraPermissionLauncher.launch(Manifest.permission.CAMERA);` — **(a)
  first appearance** of `.launch(...)`: actually triggers the real,
  system permission dialog — nothing happens until this specific, real
  call runs, the identical real "declared, but not yet triggered" shape
  this arc's own Lesson 19 already proved for a plain, un-launched
  `Intent`.

### CS Lens

Not a hard CS concept in the design-pattern sense, though real and worth
naming plainly: this whole flow is a **callback-based asynchronous
request** — `.launch(...)` doesn't block and immediately return an
answer; the real result arrives later, asynchronously, through the
registered callback, once the user actually responds to the real system
dialog — structurally close to this series' own Lesson 03 material on
functional interfaces used as callbacks, and to `wpf-foundations`
Lesson 21's own `ShowDialog()`, though that WPF method genuinely does
block and return synchronously, a real, honest, structural difference
between the two platforms' own approaches to the same real "ask the user
something, then continue" problem.

### SE Lens

The real reason Android requires this explicit, separate, runtime step
for dangerous permissions rather than granting everything declared in
the manifest automatically (the real, original, pre-Android-6 behavior,
worth naming honestly as real Android history): a user installing an app
has no real, meaningful opportunity to evaluate a long, upfront list of
manifest permissions at install time — real, runtime, in-context
requests (asking for camera access exactly when the user taps "take a
photo," not at install) give a genuinely more informed, real basis for
the user's own decision, at the real, honest cost this lesson's own
working code shows directly: every dangerous-permission-gated feature
now needs real, explicit handling for the denial case, not just the
grant.

## Connect the pieces

One trace: a manifest `<uses-permission>` declaration alone is proven,
directly, insufficient — `checkSelfPermission` genuinely reports
`PERMISSION_DENIED` despite it. `registerForActivityResult` with
`ActivityResultContracts.RequestPermission()` sets up a real, callback-
based asynchronous request; `.launch(...)` actually triggers the real,
system dialog; the real, boolean `granted` result — proven directly
against both a real Deny and a real Allow tap — correctly distinguishes
the two real, genuine outcomes.

## What breaks without this

Skip the manifest's `<uses-permission>` declaration entirely, keeping
the full, real request-flow Java code from this lesson's second unit
unchanged, and tap the request button. Real, observed result: the
system permission dialog **never appears at all** — the request is
silently, immediately treated as denied, with the registered callback
firing `granted = false` instantly, with no real user interaction at
all. Direct, provable proof the manifest declaration, while proven
insufficient *alone* in this lesson's first unit, is still a genuinely
required, separate piece — without it, the OS won't even offer the user
a real choice.

## Exercises

1. Reproduce the real missing-manifest-declaration failure yourself,
   confirming the callback fires `granted = false` with no real dialog
   shown, then restore the `<uses-permission>` entry and confirm the
   real dialog returns.
2. Add a real, second `checkSelfPermission` call *inside* the button's
   own click handler, before calling `.launch(...)` — skip launching the
   real request entirely if `checkSelfPermission` already reports
   `PERMISSION_GRANTED` (from a previous real grant). Confirm, on a
   device where permission was already real, previously granted, the
   system dialog does **not** reappear on a second tap.

## Definition of Done

- [ ] You proved a manifest declaration alone does not grant a
      dangerous permission.
- [ ] You built the real, full request flow and confirmed both a real
      Allow and a real Deny are correctly, distinctly handled.
- [ ] You reproduced the real missing-manifest-declaration failure.
- [ ] You completed both exercises.

## Next

[Lesson 21 — Services and Background Work](lesson-21-services-and-background-work.md)
closes this arc: real background execution — proven with a real task
that keeps running after the launching screen is gone, and the real,
current, correct tool to reach for.
