# Lesson 21: Runtime Permissions

**What you will build:** All three units read real Android contracts and
a general SE principle, without a compiled `javac` example — permissions
genuinely require a real device or emulator to observe running.

**What you need to know first:** Lesson 11's `Android Manifest`, Lesson
20's `activity result registration`.

**Terms introduced in this lesson:**

- **Least privilege + explicit consent** — a capability that could
  genuinely harm privacy or safety requires an affirmative grant from the
  party actually at risk, not just a declaration from the requesting
  party.
- **Runtime permission model** — a Manifest declaration alone only means
  an app might ask for a sensitive capability — the user must explicitly
  grant it at runtime, and code must handle every way that request can be
  answered, including permanent denial.
- **Permission rationale state machine** — a small state machine layered
  on top of a seemingly binary yes/no permission — distinguishing "ask
  normally" from "explain first" from "permanently denied, guide to
  Settings" — because a single boolean can't express all three.

---

## Concept Unit: Least Privilege and Explicit Consent

### The Problem

Every capability this curriculum's Android material has used so far —
starting an Activity, reading a resource — has been unconditionally
available inside the app's own sandbox, the moment it was declared.
Some capabilities are different in kind: reading the camera, the
microphone, precise location — things that could genuinely harm a user's
privacy or safety if used without their knowledge. A Manifest declaration
alone, the mechanism every earlier capability relied on, isn't a strong
enough guarantee for these.

### Introduce the Concept in Isolation

This concept doesn't need Android specifically to demonstrate — it's a
general security principle, verified against how access-control systems
work broadly. Two contrasting Manifest-style declarations, side by side:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
```

Both lines look identical in shape — a name, declared once. Only one of
them actually grants access the moment the app is installed. This is
`least privilege + explicit consent` — **first appearance**: a capability
that could genuinely harm privacy or safety requires an affirmative
grant from the party actually at risk, not just a declaration from the
requesting party. `INTERNET` is available immediately upon declaration —
Android considers it low-risk enough not to require a separate, explicit
grant. `CAMERA` requires something more: the user themselves, not just
the app's own Manifest, must actually agree, covered in the next unit.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this contrasts two real,
verified Manifest declarations.

### Mechanical Walkthrough

1. `<uses-permission android:name="android.permission.INTERNET" />` —
   **(a) first appearance** of this Manifest element generally: declares
   a capability the app wants. For low-risk capabilities like this one,
   declaration alone is sufficient.
2. `<uses-permission android:name="android.permission.CAMERA" />` — the
   identical element shape, but for a capability Android treats
   differently: declaring it is necessary, but never sufficient, to
   actually use the camera.

### CS Lens

Least privilege means a component should only ever hold the exact access
it needs, nothing broader — the general principle behind sandboxing
Android apps at all. Explicit consent adds a second, distinct
requirement for the highest-risk capabilities specifically: not just
"the app requested this narrowly-scoped access," but "the actual person
at risk affirmatively agreed to grant it," which a Manifest declaration
alone, authored entirely by the app's own developer, can never represent
on the user's behalf.

Also recognized in: file-system permission prompts on desktop operating
systems, OAuth consent screens (an application requesting a specific
scope of access, a user explicitly approving or denying it), any
security model distinguishing "the requester says it needs this" from
"the actual owner of the resource agreed."

### SE Lens

The alternative — treating every declared permission the same way,
granted automatically at install time — was Android's own original model,
and was deliberately changed specifically because install-time grants
bundle every requested permission into one all-or-nothing decision, made
once, often without the user closely reading what was actually requested.
Splitting high-risk capabilities into a separate, explicit, in-context
request is a direct response to that real, historical problem.

---

## Concept Unit: The Runtime Permission Model

### The Problem

Knowing that `CAMERA` requires more than a Manifest declaration doesn't
yet say what, specifically, code must do differently. A Manifest
declaration alone genuinely doesn't guarantee access — code that assumes
otherwise, and simply tries to use the camera, will fail in a way that
must be handled correctly, not merely hoped around.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
        == PackageManager.PERMISSION_GRANTED) {
    openCamera();
} else {
    requestPermissionLauncher.launch(Manifest.permission.CAMERA);
}
```

This is the `runtime permission model` — **first appearance**: a
Manifest declaration alone only means an app might ask for a sensitive
capability — the user must explicitly grant it at runtime, and code must
handle every way that request can be answered, including permanent
denial. `checkSelfPermission` asks "has the user already granted this,"
a real check code must perform *every time* the capability is about to
be used, never assumed true just because the Manifest declares it.
`requestPermissionLauncher.launch(...)` — built the same way Lesson 20's
own activity-result launcher was — is what actually shows the user a
real system prompt, asking them to grant or deny.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)`
   — **(a) first appearance**: queries the OS's current, real permission
   state for this specific capability — never assumed, always checked
   fresh, since the user could revoke a previously-granted permission at
   any time through the device's own system settings.
2. `== PackageManager.PERMISSION_GRANTED` — compares the result against
   a constant representing "yes, already granted." Genuinely basic
   comparison syntax, sorted **(c)**, applied to a real permission-state
   check.
3. `requestPermissionLauncher.launch(Manifest.permission.CAMERA)` —
   **(b) reappearing** result-launcher shape from Lesson 20, here
   requesting a permission specifically rather than launching a new
   screen — the same registered-callback-plus-launch mechanism, applied
   to a different kind of request.

### CS Lens

The runtime permission model turns "does this app have access" from a
fixed, install-time fact into something checked live, every time it
matters — because the real answer can genuinely change at any point
during the app's lifetime, entirely outside the app's own control, the
moment a user opens system settings and revokes a previously-granted
permission.

Also recognized in: OAuth token expiry and re-authorization (a
previously-granted access token can become invalid, requiring code to
check and re-request rather than assume it's still valid), any
capability-based security system where access can be revoked
independent of the requesting component's own code.

### SE Lens

The alternative — checking permission state once, at app startup, and
trusting that result for the rest of the app's run — was not chosen
because permission state can change at any moment the app isn't even
running, from the device's own system settings; a stale, cached "yes,
granted" check would let the app attempt to use the camera after real
access has already been revoked, failing unpredictably instead of
handling the denial gracefully through the same request flow used the
first time.

---

## Concept Unit: The Permission Rationale State Machine

### The Problem

A simple granted/denied check, from the previous unit, cannot actually
distinguish every real state a permission request can be in. A user who
denied once, but might reasonably grant it if they understood why it's
needed, is in a genuinely different situation than a user who denied it
and told Android never to ask again — treating both the same way,
respecting neither of those specific, different outcomes, is a real,
common mistake.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
        == PackageManager.PERMISSION_GRANTED) {
    openCamera();
} else if (shouldShowRequestPermissionRationale(Manifest.permission.CAMERA)) {
    showExplanationDialog();
} else {
    requestPermissionLauncher.launch(Manifest.permission.CAMERA);
}
```

This is a `permission rationale state machine` — **first appearance**: a
small state machine layered on top of a seemingly binary yes/no
permission — distinguishing "ask normally" from "explain first" from
"permanently denied, guide to Settings" — because a single boolean can't
express all three. `shouldShowRequestPermissionRationale` returns `true`
specifically when the user has denied once before, but hasn't
permanently blocked future requests — exactly the case where showing a
brief explanation, then asking again, is the correct next step, distinct
both from a fresh first-time request and from a permanently-denied state
this same check cannot detect at all (that third state requires guiding
the user to the device's own system settings manually, outside this
lesson's own excerpt).

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `ContextCompat.checkSelfPermission(...) ==
   PackageManager.PERMISSION_GRANTED` — **(b) reappearing** granted check
   from the previous unit, still the first branch checked.
2. `shouldShowRequestPermissionRationale(Manifest.permission.CAMERA)` —
   **(a) first appearance**: a real, distinct query, separate from the
   granted check, answering "has this been denied before, in a way that
   still allows asking again" — `true` only in that specific
   in-between state.
3. `showExplanationDialog()` — a placeholder for real UI (not shown in
   full here) explaining why the permission matters, shown specifically
   before asking again, in this one specific state.
4. The final `else` branch — reached only when neither of the above is
   true: either a genuinely first-time request, or a permanently-denied
   one that `shouldShowRequestPermissionRationale` itself cannot
   distinguish from a first-time request (both return `false`) — a real,
   documented limitation this lesson names rather than glosses over.

### CS Lens

A **state machine** is a system with a fixed set of named states and
rules for moving between them — here, three real states ("not yet asked
or already granted," "denied once, can ask again," "denied permanently")
where a single `boolean` could only ever represent two. Recognizing that
a seemingly yes/no question actually has three meaningfully different
answers, and modeling all three explicitly, is what this permission flow
requires to behave correctly in every real situation a user might put it
in.

Also recognized in: any UI wizard with more states than a simple on/off
toggle (a form field that's valid, invalid-but-not-yet-submitted, or
invalid-and-submitted, each needing different visual treatment), traffic
light logic (red, yellow, green — never modeled as a single boolean), any
retry-with-backoff system distinguishing "first attempt," "retrying,"
and "given up permanently."

### SE Lens

The alternative — treating every non-granted state identically, always
just requesting the permission again — was not chosen because it
produces a real, frustrating loop for a user who's already permanently
denied the permission: repeatedly showing a system prompt that Android
itself will no longer display, leaving the app's own UI apparently doing
nothing with no explanation. Modeling all three states explicitly is what
lets the app show a genuinely different, correct message for "please
enable this in Settings" versus "here's why we're asking again."

---

## Connect the Pieces

`INTERNET` versus `CAMERA` established the underlying principle: some
capabilities require more than a Manifest declaration, because they could
genuinely harm a user's privacy if granted without real consent.
`checkSelfPermission` plus a runtime request is that principle's actual
mechanism: check live, every time, and route through a real system prompt
when access isn't yet granted. `shouldShowRequestPermissionRationale`
refines that mechanism further, distinguishing three real states a bare
granted/denied check cannot tell apart, so the app can respond
correctly to each one instead of treating "denied once" and "denied
forever" as the same situation.

## What Breaks Without This

Calling a camera API directly, with no permission check at all, throws a
real runtime `SecurityException` on any Android version enforcing runtime
permissions, resembling:

```
java.lang.SecurityException: Permission Denial: opening camera requires android.permission.CAMERA
```

This is concrete, OS-enforced proof that a Manifest declaration alone,
with no runtime check, is never sufficient — the exact claim this whole
lesson exists to establish.

## Exercises

1. Add a fourth `<uses-permission>` declaration, for
   `ACCESS_FINE_LOCATION`, and explain, in your own words, why this
   capability requires the same runtime model as `CAMERA` rather than
   `INTERNET`'s simpler, install-time-only model.
2. Write out, in your own words, what UI text `showExplanationDialog()`
   from the third unit should reasonably contain, given it's shown
   specifically to a user who already denied once.
3. Read the real `SecurityException` message in "What Breaks Without
   This" and identify exactly which permission name it names as missing.

## Definition of Done

- [ ] You read the `INTERNET`/`CAMERA` Manifest contrast and can explain
      why only one requires a runtime check.
- [ ] You read the `checkSelfPermission`/launcher example and can explain
      what triggers the real system permission prompt.
- [ ] You read the three-branch rationale state machine and can name all
      three states it distinguishes.
- [ ] You can state, without looking back at this lesson, why a single
      `boolean` cannot correctly represent every real permission state.
