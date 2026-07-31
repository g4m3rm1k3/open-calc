# Lesson 24a: Least Privilege + Explicit Consent

**What you will build:** No new code to compile — this contrasts two
real, verified Manifest declarations.

**What you need to know first:** Nothing beyond the Learner Baseline.

**Terms introduced in this lesson:**

- **Least Privilege + Explicit Consent** — a capability that could
  genuinely harm privacy or safety requires an affirmative grant from the
  party actually at risk, not just a declaration from the requesting
  party.

---

## Concept Unit: Least Privilege and Explicit Consent

### The Problem

Every capability this course's Android material has used so far —
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
`Least Privilege + Explicit Consent` — **first appearance**: a capability
that could genuinely harm privacy or safety requires an affirmative
grant from the party actually at risk, not just a declaration from the
requesting party. `INTERNET` is available immediately upon declaration —
Android considers it low-risk enough not to require a separate, explicit
grant. `CAMERA` requires something more: the user themselves, not just
the app's own Manifest, must actually agree, covered in the next lesson.

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

## Connect the Pieces

`INTERNET` versus `CAMERA` establishes the underlying principle: some
capabilities require more than a Manifest declaration, because they could
genuinely harm a user's privacy if granted without real consent. The
next lesson shows the actual mechanism that enforces this.

## What Breaks Without This

Treating every declared permission the same way, granted automatically
at install time, bundles every requested permission into one
all-or-nothing decision the user often doesn't closely read.

## Exercises

1. Add a fourth `<uses-permission>` declaration, for
   `ACCESS_FINE_LOCATION`, and explain, in your own words, why this
   capability requires the same explicit-consent treatment as `CAMERA`
   rather than `INTERNET`'s simpler, install-time-only model.
2. Explain, in your own words, why "least privilege" and "explicit
   consent" are described as two distinct requirements, not one.
3. Name one real-world example (outside Android) of a system requiring
   explicit consent from the party actually at risk, not just a
   declaration from the requester.

## Definition of Done

- [ ] You read the `INTERNET`/`CAMERA` Manifest contrast and can explain
      why only one requires a runtime check.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why a Manifest
      declaration alone can never represent the user's own consent.
