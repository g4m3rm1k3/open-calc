# Asking, Then Waiting for an Answer: The Runtime Permission Request

**What problem this solves.** Some operations — accessing the camera,
reading location, reading contacts — are sensitive enough that a user
should get to say yes or no before an app can do them, at the specific
moment the app actually wants to use that capability, with the ability
to revoke that choice later. App code that wants to do such a thing
can't simply call the operation and assume it'll work; it needs to
check whether permission has already been granted and, if not, ask for
it. But the real answer only ever arrives asynchronously, through the
user's own interaction with a system dialog that neither the app nor
its code controls the timing of — which means the app's code has to be
structured to receive that answer back later, rather than getting it as
an ordinary return value from the request call itself.

**Classic pattern family.** This resembles **Command** — the request
itself is handed off as a call to be "answered" later, not
synchronously — combined with a lifecycle-integrated callback
registration, not unlike the twist Android's own `LiveData` adds to
Observer. It's most honestly described as its own specific negotiation
protocol Android defines, not a clean instance of either.

**Where you'll meet it in Android.**
`androidx.activity.result.ActivityResultLauncher` and
`ActivityResultContracts.RequestPermission`, registered through
`ComponentActivity.registerForActivityResult(...)`, together with
`ContextCompat.checkSelfPermission(Context, String)`.

**Terms used in this pattern.**

- **Lambda expression** — a short, unnamed block of code standing in
  for a full anonymous class implementing a single-method interface,
  here the callback that eventually receives the permission result. It
  exists so a short, one-off reaction doesn't need a separately
  declared class.
- **Predefined `String` constant as a permission name** — a fixed
  constant (`Manifest.permission.CAMERA`) naming one specific runtime
  permission. It exists because the exact permission string, which must
  precisely match one the system itself recognizes, shouldn't be typed
  as a raw, error-prone literal.

**Objects and methods used.**

- **`ComponentActivity.registerForActivityResult(ActivityResultContract, ActivityResultCallback)`**
  *What it is:* an instance method on `ComponentActivity`, returning
  `ActivityResultLauncher<I>`.
  *Implementation:* `public final <I, O> ActivityResultLauncher<I>
  registerForActivityResult(@NonNull ActivityResultContract<I, O>
  contract, @NonNull ActivityResultCallback<O> callback)`.
  *Its use:* registers, up front, both what kind of request will
  eventually be made and what should happen once its result comes back
  — this registration must happen unconditionally, every time this
  `Activity` is created, before any request is actually launched,
  because it wires up the mechanism that will later deliver the result.
- **`ActivityResultContracts.RequestPermission`**
  *What it is:* a concrete, predefined contract implementation.
  *Implementation:* a class describing "request exactly one runtime
  permission, and deliver back a single boolean result."
  *Its use:* names what kind of system interaction this launcher is
  for.
- **`ActivityResultLauncher<String>`**
  *What it is:* the object `registerForActivityResult(...)` returns.
  *Implementation:* `public abstract class ActivityResultLauncher<I>`,
  exposing `launch(I input)`.
  *Its use:* the handle app code holds onto and calls later, whenever
  it actually wants to trigger this specific, already-registered
  request.
- **`ActivityResultLauncher.launch(String input)`**
  *What it is:* an instance method on `ActivityResultLauncher`,
  returning `void`.
  *Implementation:* `public abstract void launch(I input)`.
  *Its use:* the moment the real system permission dialog is actually
  triggered; `input` is the specific permission string being requested.
- **`ContextCompat.checkSelfPermission(Context, String)`**
  *What it is:* a `static` method.
  *Implementation:* `public static int checkSelfPermission(@NonNull
  Context context, @NonNull String permission)`.
  *Its use:* a synchronous check of whether permission has already
  been granted from some earlier request, letting the app skip asking
  again when the answer is already known.
- **`PackageManager.PERMISSION_GRANTED`**
  *What it is:* a `public static final int` constant.
  *Implementation:* `public static final int PERMISSION_GRANTED = 0`.
  *Its use:* the specific value `checkSelfPermission` returns when
  permission is already granted, compared against explicitly since that
  method's own return type is a plain `int`, not a `boolean`.

---

## The Shape

Four participants:

- **The app's own code** — the requester.
- **`ActivityResultLauncher`** — a registered handle representing "this
  specific, already-wired-up request."
- **The Android system** — the actual party that shows the real
  permission dialog and records the user's real decision.
- **The callback lambda** — registered once, up front, called back
  later whenever the system's dialog is actually resolved.

The relationship: registration and triggering are two entirely separate
steps, deliberately kept apart. Registration has to happen
unconditionally, early, every time this `Activity` is created —
typically as a field initializer — regardless of whether the permission
will ever actually be requested this run, because it's what wires the
eventual result back to the right callback. Triggering can happen
conditionally, later, only when the app's own logic decides it actually
needs to ask. Neither the app's own code nor `ActivityResultLauncher`
controls when, or whether, the user answers the real system dialog —
the callback simply waits to be called, at some future point entirely
controlled by the user's own interaction with a UI neither piece of app
code drew.

```
   Activity creation (every time, unconditionally)
        |
        |  registerForActivityResult(RequestPermission(), callback)
        v
   ActivityResultLauncher  (a registered, reusable handle)


   later, conditionally, only when actually needed:
        |
        |  launcher.launch(CAMERA)
        v
   Android system shows the real permission dialog
        |
        |  (unknown future moment: user taps Allow or Deny)
        v
   callback(isGranted)  -- runs later, with the real answer
```

---

## Mechanical Walkthrough

```java
private final ActivityResultLauncher<String> requestPermissionLauncher =
        registerForActivityResult(new ActivityResultContracts.RequestPermission(), isGranted -> {
            if (isGranted) {
                startCamera();
            } else {
                showPermissionDeniedMessage();
            }
        });
```

- **`registerForActivityResult(new ActivityResultContracts.RequestPermission(), isGranted -> { ... })`**
  — the registration itself, run as a field initializer so it happens
  unconditionally and early, every time this `Activity` is created. The
  first argument names *what kind* of request this handle is for; the
  second is the lambda that will eventually run with the real answer.
- **`isGranted -> { if (isGranted) { ... } else { ... } }`** — a lambda
  implementing the single-method callback interface; `isGranted` is the
  eventual real answer, a plain `boolean`, supplied by the framework
  whenever the system's own dialog is finally resolved — not known at
  the time this line runs.

Requesting the permission itself, checked and triggered separately:

```java
if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
        == PackageManager.PERMISSION_GRANTED) {
    startCamera();
} else {
    requestPermissionLauncher.launch(Manifest.permission.CAMERA);
}
```

- **`ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)`**
  — a synchronous check, returning immediately with whatever permission
  state is already on record; no dialog is shown for this call itself.
- **`== PackageManager.PERMISSION_GRANTED`** — the explicit comparison
  required because `checkSelfPermission`'s own return type is a plain
  `int`, not a `boolean`.
- **`startCamera();`** (the granted branch) — runs immediately,
  synchronously, in this same call, when permission was already known.
- **`requestPermissionLauncher.launch(Manifest.permission.CAMERA);`**
  (the not-yet-granted branch) — the call that actually triggers the
  real system dialog; nothing about permission is decided by this line
  itself — only the lambda registered earlier will eventually receive
  the real answer.

---

## Collaboration — how it actually runs

1. When this `Activity` is created, `registerForActivityResult(...)`
   runs unconditionally, as ordinary field initialization, producing a
   reusable `ActivityResultLauncher` and wiring the callback lambda to
   eventually receive whatever result comes back — nothing about the
   actual permission dialog happens yet.
2. Later, at whatever point the app's own logic actually needs the
   camera, `checkSelfPermission(...)` is called first — a synchronous,
   immediate check, with no dialog involved.
3. If that check already reports `PERMISSION_GRANTED`, the app
   proceeds directly — no request is made this run, and the callback
   registered in step 1 is never invoked.
4. If not, `requestPermissionLauncher.launch(CAMERA)` is called, which
   is what actually triggers the system to show its real permission
   dialog to the user.
5. Time passes, entirely controlled by the user — anywhere from
   immediate to a long pause, however long it takes for the user to
   respond to the dialog.
6. Once the user actually taps Allow or Deny, the system resolves the
   request and calls back into the lambda registered in step 1, passing
   the real boolean answer — this is the only place `startCamera()` or
   `showPermissionDeniedMessage()` actually runs, and it may run well
   after the code in step 4 has already finished executing.

---

## Why It's Shaped This Way

The design principle is **separating the up-front registration of "what
to do when an answer eventually comes back" from the later, conditional
act of actually asking**, because the real answer can only ever arrive
asynchronously, through a system UI interaction neither the app nor a
single method call controls the timing of.

The alternative not chosen: a single method call requesting permission
and simply returning the boolean answer directly, the way
`checkSelfPermission` does for an already-known answer. The real cost
that would make this impossible: a real permission dialog requires
showing UI and waiting for a human to respond, which cannot happen
synchronously inside a single method call without freezing the entire
app while waiting — the registration/launch split is exactly what
allows the app to keep running normally while that real-world wait
happens.

The cost this pattern itself carries: the registration has to happen
unconditionally and early — as a field, before `onCreate` even finishes
— which can feel disconnected from the actual point later in the code
where the permission is really needed. This is a real, common source of
confusion for anyone expecting to write requesting code as a single,
local, top-to-bottom sequence the way `checkSelfPermission`'s own
synchronous check reads.

---

## Recognizing It Elsewhere

Also recognized in: a web page's own browser permission prompts
(camera, location, notifications), which similarly must be requested
asynchronously and answered later through a callback, never returned
synchronously from the requesting call; a credit card payment
authorization flow, where the request is submitted and the actual
approval or decline arrives later, asynchronously, from a human or
system elsewhere in the loop; an OAuth login flow, where an app
redirects to an external authorization screen and only later receives
the user's actual decision through a callback, never as a direct return
value from the redirect itself.

---

## Where This Actually Breaks

The most common real mistake: calling `registerForActivityResult(...)`
conditionally — inside an `if` statement or some other code path that
doesn't always run — rather than unconditionally, as a field
initializer or in `onCreate` every single time. Because this
registration has to be wired up before the underlying system delivers
any pending result back to this `Activity`, doing it conditionally, or
too late, throws a real, hard runtime exception — an
`IllegalStateException` naming the issue directly — rather than failing
silently. That's at least loud, but it's also genuinely confusing the
first time it happens, since the actual mistake (wrong placement, not
wrong logic) isn't obvious from the error's own wording alone.
