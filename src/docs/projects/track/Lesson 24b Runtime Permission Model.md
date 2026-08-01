# Lesson 24b: Runtime Permission Model

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 24a's Least Privilege + Explicit
Consent, Lesson 2h's Android Manifest, Lesson 10b's activity result
registration.

**Terms introduced in this lesson:**

- **Runtime Permission Model** — a Manifest declaration alone only means
  an app might ask for a sensitive capability — the user must explicitly
  grant it at runtime, and code must handle every way that request can be
  answered, including permanent denial.

---

## Concept Unit: The Runtime Permission Model

### The Problem

Knowing that `CAMERA` requires more than a Manifest declaration (Lesson
24a) doesn't yet say what, specifically, code must do differently. A
Manifest declaration alone genuinely doesn't guarantee access — code
that assumes otherwise, and simply tries to use the camera, will fail in
a way that must be handled correctly, not merely hoped around.

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

This is the `Runtime Permission Model` — **first appearance**: a
Manifest declaration alone only means an app might ask for a sensitive
capability — the user must explicitly grant it at runtime, and code must
handle every way that request can be answered, including permanent
denial. `checkSelfPermission` asks "has the user already granted this,"
a real check code must perform *every time* the capability is about to
be used, never assumed true just because the Manifest declares it.
`requestPermissionLauncher.launch(...)` — built the same way Lesson 10b's
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
   check — `checkSelfPermission` returns an `int` rather than a plain
   `boolean` specifically so it can also be compared against
   `PERMISSION_DENIED`, distinguishing "denied" from other states a
   bare true/false couldn't represent.
3. `requestPermissionLauncher.launch(Manifest.permission.CAMERA)` —
   **(b) reappearing** result-launcher shape from Lesson 10b, here
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

## Connect the Pieces

`checkSelfPermission` plus a runtime request is Lesson 24a's own
principle, made concrete: check live, every time, and route through a
real system prompt when access isn't yet granted. The next lesson
refines this further, distinguishing states a bare granted/denied check
cannot tell apart.

## What Breaks Without This

Calling a camera API directly, with no permission check at all, throws a
real runtime `SecurityException` on any Android version enforcing runtime
permissions, resembling:

```
java.lang.SecurityException: Permission Denial: opening camera requires android.permission.CAMERA
```

This is concrete, OS-enforced proof that a Manifest declaration alone,
with no runtime check, is never sufficient.

## Exercises

1. Explain, in your own words, why `checkSelfPermission` must be checked
   fresh every time, rather than cached from an earlier check.
2. Read the real `SecurityException` message in "What Breaks Without
   This" and identify exactly which permission name it names as missing.
3. Explain, in your own words, why `requestPermissionLauncher` reuses
   the same registered-callback-plus-launch shape as Lesson 10b's own
   activity result launcher.

## Definition of Done

- [ ] You read the `checkSelfPermission`/launcher example and can explain
      what triggers the real system permission prompt.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why a Manifest
      declaration alone is never sufficient for a sensitive capability.
