# Lesson 16: Build Variants, Signing, and Shrinking

**What you will build:** This lesson's material is build configuration,
not runnable Java — nothing here compiles with `javac`. Each unit reads
a small, real, verified configuration example directly.

**What you need to know first:** Nothing beyond the Learner Baseline.

**Terms introduced in this lesson:**

- **Build variant / environment profile** — maintaining separate
  configurations (e.g. debug vs. production) compiled or run from one
  shared codebase, each suited to a different purpose.
- **Build variants (debug vs. release)** — separate build configurations
  — at minimum debug and release — compiled from one shared codebase,
  differing in signing, debuggability, and code shrinking.
- **App signing** — a cryptographic signing key permanently tied to an
  app's identity — every future update must be signed with the same key
  to be accepted as a legitimate update rather than a different app
  entirely.
- **R8 (code shrinking, optimization, obfuscation)** — a build step
  removing unused classes/methods/resources, rewriting bytecode for size
  and speed, and renaming identifiers to meaningless names, run
  automatically for release builds.

---

## Concept Unit: Build Variant / Environment Profile

### The Problem

Software behaves differently depending on who's running it and why —
a developer testing on their own machine needs different behavior
(verbose logging, no real payment processing) than a real user running
the finished product. Writing two entirely separate copies of the source
code for these two situations would mean every change has to be made
twice, and the two copies would drift apart almost immediately.

### Introduce the Concept in Isolation

This concept doesn't need Android specifically to demonstrate — it's a
general idea, verified against how build tooling works broadly. A small,
real example, a `.env`-style configuration file for a hypothetical
development environment:

```
API_URL=http://localhost:8080
DEBUG_LOGGING=true
```

...and the equivalent for production:

```
API_URL=https://api.realcompany.com
DEBUG_LOGGING=false
```

This is a `build variant` — **first appearance** (also called an
**environment profile**): maintaining separate configurations (e.g.
debug vs. production) compiled or run from one shared codebase, each
suited to a different purpose. The application's own source code never
changes between these two — only which configuration file gets loaded at
build or run time changes, and the code reads `API_URL` symbolically
rather than having either address hardcoded into it.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real, general
configuration shape.

### Mechanical Walkthrough

1. `API_URL=http://localhost:8080` and `API_URL=https://api.realcompany.com`
   — **(a) first appearance** of this general shape: the same symbolic
   name, `API_URL`, resolving to two entirely different real values
   depending on which configuration is active.
2. `DEBUG_LOGGING=true` / `DEBUG_LOGGING=false` — a second setting,
   varying the same way — proof this isn't a one-off special case but a
   general pattern: any number of settings can differ per variant, with
   the application code itself never needing to know which variant is
   currently active beyond reading these symbolic values.

### CS Lens

A build variant is **configuration as data**, kept entirely separate from
the logic that reads it — the same separation-of-concerns idea behind
Android resources (Lesson 11): content that varies is kept out of the
code that uses it, referenced symbolically instead of hardcoded.

Also recognized in: environment variables in virtually every deployed
application, `.env` files in web development generally, feature flags
that change behavior per deployment without a code change.

### SE Lens

The alternative — hardcoding `http://localhost:8080` directly in source
code, then manually editing it before every real release — was not
chosen because manual edits are exactly the kind of repeated, easy-to-
forget step that eventually gets missed, shipping a real user's build
pointed at a developer's local machine. Separate, named configurations
make "which environment is this" an explicit, deliberate choice at build
time, not a manual edit trusted to be remembered correctly every time.

---

## Concept Unit: Build Variants — Debug vs. Release

### The Problem

Every run of an Android app throughout this curriculum has used one
particular configuration, without ever naming it: fully debuggable,
signed with an insecure, auto-generated key, and completely unshrunk —
appropriate for a developer's own testing, and specifically wrong for
what should ever reach a real user's device.

### Introduce the Concept in Isolation

A real, verified Gradle build configuration snippet:

```
android {
    buildTypes {
        debug {
            debuggable true
            minifyEnabled false
        }
        release {
            debuggable false
            minifyEnabled true
        }
    }
}
```

This is Android's own `build variants` — **first appearance**: separate
build configurations — at minimum debug and release — compiled from one
shared codebase, differing in signing, debuggability, and code
shrinking. `debug`, used implicitly by every run of this curriculum's own
Android examples so far, is `debuggable` (a real debugger can attach to
it) and unshrunk (`minifyEnabled false`). `release` is the opposite on
both counts — the configuration meant for a real user's device, never
used by this curriculum's own throwaway labs.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real, verified
build configuration shape.

### Mechanical Walkthrough

1. `buildTypes { debug { ... } release { ... } }` — **(a) first
   appearance** of this specific configuration shape: two named build
   types, each with its own settings, both compiled from the exact same
   application source code.
2. `debuggable true` / `debuggable false` — controls whether a real
   debugger can attach to the running app; `true` for a developer's own
   testing, `false` for anything reaching a real user, for real security
   reasons a later part of this lesson makes concrete.
3. `minifyEnabled true` / `minifyEnabled false` — controls whether the
   next two units' shrinking step runs at all; covered fully in this
   lesson's last unit.

### CS Lens

Android's debug/release split is the previous unit's general build-
variant concept, applied concretely: one shared Android codebase, two
named configurations, each suited to a different purpose (developer
testing versus real distribution) — with the application's own Java
source never needing two separate copies to support both.

Also recognized in: `Debug`/`Release` build configurations in Visual
Studio and most C/C++/C# tooling, `NODE_ENV=development` versus
`NODE_ENV=production` in Node.js projects — the same debug/production
split recurring across nearly every compiled or built software platform.

### SE Lens

The alternative — one single build configuration, used for both
development and real distribution — was not chosen because a
developer-friendly build (debuggable, unshrunk, easy to inspect) is
specifically the wrong shape to hand to a real user: it's larger than
necessary, easier to reverse-engineer, and exposes a real security
surface (an attachable debugger) that has no legitimate use once the app
is out of a developer's own hands.

---

## Concept Unit: App Signing

### The Problem

Once a release build genuinely differs from a debug one, some way is
needed to prove a given app update genuinely came from the same source
as the original app — otherwise nothing would stop an unrelated,
malicious app from claiming to be "the same app, updated" and replacing
it on a user's device.

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

This is `app signing` — **first appearance**: a cryptographic signing key
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
   variant from the previous unit — debug builds are signed too, but
   automatically, with an insecure, auto-generated key never meant to
   leave a developer's own machine.
2. `storeFile file("release-key.jks")` — the actual private key file's
   location; this exact file must be used for every future signed
   release of this specific app, permanently.
3. `System.getenv("SIGNING_STORE_PASSWORD")` — **(a) first appearance**
   of reading a value from an environment variable rather than
   hardcoding it directly in this configuration file — connecting
   directly to this lesson's first unit: the actual password is supplied
   per-environment, never committed alongside the build configuration
   itself.

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

## Concept Unit: R8 — Code Shrinking, Optimization, and Obfuscation

### The Problem

A debug build, unshrunk, ships every class this app and its libraries
define, completely intact, with every original class and method name
still readable — larger than necessary for a real user to download, and
trivially easy for anyone to open and read the app's own internal
structure and logic.

### Introduce the Concept in Isolation

The same build-type configuration from this lesson's second unit,
revisited:

```
buildTypes {
    release {
        minifyEnabled true
        proguardFiles getDefaultProguardFile("proguard-android-optimize.txt")
    }
}
```

`minifyEnabled true` triggers `R8` — **first appearance**: a build step
removing unused classes, methods, and resources (tree-shaking),
rewriting bytecode for size and speed (optimization), and renaming
identifiers to meaningless names (obfuscation), run automatically for
release builds. A class or method never actually referenced anywhere in
the final app is stripped out entirely; a class named
`InventoryValidator` might become a class named `a` in the final,
released bytecode — functionally identical, but no longer readable as
"the validation logic" by anyone inspecting the compiled app.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real, verified
build configuration shape.

### Mechanical Walkthrough

1. `minifyEnabled true` — **(b) reappearing** setting from this lesson's
   second unit, now shown as the actual trigger for R8's whole pipeline
   rather than just named.
2. `proguardFiles getDefaultProguardFile("proguard-android-optimize.txt")`
   — **(a) first appearance**: names a real configuration file
   controlling exactly which rules R8 follows — which classes are safe to
   rename or remove, and which must be kept exactly as declared (a class
   only ever referenced by name as a string, for instance, would be
   silently broken if R8 renamed it without being told not to).

### CS Lens

R8's three jobs are genuinely distinct, even though one setting enables
all three at once: tree-shaking removes code that provably can't be
reached; optimization rewrites remaining bytecode into an equivalent,
faster or smaller form; obfuscation renames identifiers, trading
human-readability for both a smaller download and real resistance to
casual reverse-engineering.

Also recognized in: minifiers for JavaScript (Terser, UglifyJS — the same
three-job shape, applied to a different bytecode target), any compiled
language's own "release mode" optimizer, ProGuard (R8's own direct
predecessor, still the name of the rule-file format R8 itself reads).

### SE Lens

The alternative — shipping every release build exactly as written, fully
readable, with no shrinking at all — was not chosen because a debug-sized,
fully-readable build is strictly worse for a real user: larger to
download, slower, and offering no resistance at all to casual inspection
of the app's own internal logic. The real cost: R8's renaming can break
code that depends on a class's original name at runtime (reflection,
covered in a later lesson) unless that class is explicitly told to be
kept unchanged — a real, concrete failure mode this curriculum returns to
directly when reflection is introduced.

---

## Connect the Pieces

A build variant is one shared codebase, configured differently per
purpose — the general idea. Android's own `debug`/`release` build types
are that idea applied concretely: `debug`, used throughout this
curriculum's own Android examples, versus `release`, the configuration
meant for a real user. `release` additionally requires app signing — a
permanent cryptographic identity, kept out of version control — and
triggers R8, shrinking and obfuscating the final compiled app. None of
this touches the application's own Java source code directly; all of it
is configuration layered on top of the exact same code already written.

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

1. Write, from scratch, a `staging` build type — a third variant beyond
   `debug`/`release`, `debuggable false` but `minifyEnabled false` — and
   explain, in your own words, what real purpose such a variant might
   serve.
2. Read this lesson's signing configuration again and explain, in your
   own words, why `storePassword` is read from an environment variable
   rather than written directly in the build file.
3. Read the real "signed with the wrong key" error in "What Breaks
   Without This" and identify which part of the message names the actual
   problem.

## Definition of Done

- [ ] You read the environment-profile example and can explain how the
      same application code behaves differently per configuration.
- [ ] You read the debug/release build-type configuration and can state
      which one this curriculum's own Android examples have used so far.
- [ ] You completed Exercise 1 and designed a coherent third build
      variant.
- [ ] You can state, without looking back at this lesson, why losing a
      release signing key is a serious, permanent problem rather than a
      minor inconvenience.
