# Lesson 34c: App Signing

**What you will build:** No new code to compile — this reads a real,
verified signing configuration directly.

**What you need to know first:** Lesson 34b's Build Variants.

**Terms introduced in this lesson:**

- **App Signing** — a cryptographic signing key permanently tied to an
  app's identity — every future update must be signed with the same key
  to be accepted as a legitimate update rather than a different app
  entirely.

---

## Concept Unit: App Signing

### The Problem

Once a release build genuinely differs from a debug one (Lesson 34b),
some way is needed to prove a given app update genuinely came from the
same source as the original app — otherwise nothing would stop an
unrelated, malicious app from claiming to be "the same app, updated" and
replacing it on a user's device.

### Introduce the Concept in Isolation

A real, verified signing configuration:

```
android {
    signingConfigs {
        release {
            storeFile file("release-key.jks")
            storePassword System.getenv("SIGNING_STORE_PASSWORD")
            keyAlias "release"
            keyPassword System.getenv("SIGNING_KEY_PASSWORD")
        }
    }
}
```

This is `App Signing` — **first appearance**: a cryptographic signing key
permanently tied to an app's identity — every future update must be
signed with the same key to be accepted as a legitimate update rather
than a different app entirely. `release-key.jks` is the actual private
key file — generated once, kept permanently, and specifically never
committed to version control, since anyone with this file could sign a
malicious update and have it accepted as legitimate.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real, verified
signing configuration shape.

### Mechanical Walkthrough

1. `signingConfigs { release { ... } }` — **(a) first appearance** of
   this configuration block, applied specifically to the `release` build
   variant from Lesson 34b — debug builds are signed too, but
   automatically, with an insecure, auto-generated key never meant to
   leave a developer's own machine.
2. `storeFile file("release-key.jks")` — the actual private key file's
   location; this exact file must be used for every future signed
   release of this specific app, permanently.
3. `System.getenv("SIGNING_STORE_PASSWORD")` — **(a) first appearance**
   of reading a value from an environment variable rather than
   hardcoding it directly in this configuration file — connecting
   directly to Lesson 34a's own material: the actual password is
   supplied per-environment, never committed alongside the build
   configuration itself.

### CS Lens

App signing is a real, concrete application of cryptographic identity: a
signature proves a file was produced by whoever holds a specific private
key, without that key ever needing to be shared or transmitted. Android
checks every update's signature against the original app's signature
before accepting it as an update — a mismatch means the OS treats it as
an entirely different, unrelated app.

Also recognized in: code signing on every major desktop and mobile
platform (macOS, Windows, iOS all require it in some form), signed Git
commits, TLS certificates proving a website's identity — the same
"prove this came from who it claims to" idea recurring throughout
security-conscious software.

### SE Lens

The alternative — no signing requirement at all, any file claiming to be
an update accepted as one — was not chosen because it would let anyone
distribute a malicious "update" to an existing app's users, with the OS
having no way to distinguish it from a legitimate one. Requiring the same
private key for every update, permanently, means losing that key is a
real, serious event — the exact reason it's kept outside version control
and read from an environment variable rather than committed alongside
the code.

---

## Connect the Pieces

`release`'s signing configuration is a permanent cryptographic identity,
kept out of version control. The next lesson shows a different
requirement `release` also triggers: shrinking and obfuscating the
compiled app.

## What Breaks Without This

Attempting to publish an update signed with a different key than the
original app's produces a real, blocking error from the app store
itself, resembling:

```
Your Android App Bundle is signed with the wrong key. Ensure that your App Bundle is signed with the same signing key that you used previously.
```

This is concrete, external proof that signing isn't optional bookkeeping
— it's an enforced identity check that exists specifically to prevent an
unrelated party from distributing something claiming to be a legitimate
update to an app it doesn't actually control.

## Exercises

1. Read this lesson's signing configuration again and explain, in your
   own words, why `storePassword` is read from an environment variable
   rather than written directly in the build file.
2. Read the real "signed with the wrong key" error in "What Breaks
   Without This" and identify which part of the message names the actual
   problem.
3. Explain, in your own words, why losing `release-key.jks` permanently
   is a serious problem, rather than something that can simply be
   regenerated.

## Definition of Done

- [ ] You read the real signing configuration and can explain what
      `release-key.jks` represents.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why losing a
      release signing key is a serious, permanent problem rather than a
      minor inconvenience.
