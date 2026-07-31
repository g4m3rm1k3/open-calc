# Lesson 4i: Capability Scoping

**What you will build:** No new code to compile — this contrasts two
real, verified Manifest declarations.

**What you need to know first:** Lesson 2h's Android Manifest, Lesson
0j's access-level enforcement.

**Terms introduced in this lesson:**

- **Capability scoping** — explicitly declaring what a component is
  and isn't allowed to be used for, rather than leaving everything
  globally reachable by default.

---

## Concept Unit: Capability Scoping

### The Problem

Leaving every component reachable by default, from anywhere, means
nothing prevents unrelated code — inside the app or outside it — from
using a component in a way its own author never intended.

### Introduce the Concept in Isolation

Contrasting two real, verified Manifest declarations:

```xml
<activity android:name=".InternalHelperActivity" android:exported="false" />
<activity android:name=".MainActivity" android:exported="true" />
```

This is `capability scoping` — **first appearance**: explicitly
declaring what a component is and isn't allowed to be used for, rather
than leaving everything globally reachable by default.
`android:exported="false"` (Lesson 2h's own attribute, examined
explicitly here) scopes `InternalHelperActivity` to this app alone —
no other app can launch it at all; `android:exported="true"`
deliberately leaves `MainActivity` reachable, since it's meant to be
the launcher entry point.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — these are real, verified
Manifest declarations.

### Mechanical Walkthrough

1. `android:exported="false"` — **(b) reappearing** from Lesson 2h,
   examined here specifically as a deliberate capability restriction,
   not merely a required attribute.
2. `android:exported="true"` — the deliberate opposite choice for
   `MainActivity` specifically, since it's meant to be reachable from
   outside the app (the launcher).

### CS Lens

Capability scoping is access-level enforcement (Lesson 0j) at the
scale of an entire component, rather than one field: a deliberate,
explicit declaration of what's allowed to reach a given component,
rather than defaulting to globally open access.

Also recognized in: firewall rules (explicitly scoping which network
traffic is allowed through), API access scopes in OAuth (explicitly
declaring what a granted token is allowed to do), file permissions
generally.

### SE Lens

The alternative — leaving every component exported by default — was
not chosen because it would let any other app on the device launch
`InternalHelperActivity` directly, bypassing whatever assumptions its
own code makes about only ever being reached from within this app
itself.

---

## Connect the Pieces

`private` (Lesson 0j) scoped a field to its own class. `android
:exported="false"` scopes an entire component to its own app — the
same underlying discipline, applied at a much larger scale.

## What Breaks Without This

Leaving `InternalHelperActivity` exported (or omitting the attribute
entirely, which defaults to exported once any intent filter is
present) means any other app installed on the same device can launch
it directly — a real, exploitable gap, verified against the actual
platform behavior, for a component whose own code assumes it's only
ever reached from inside the app.

## Exercises

1. Explain, in your own words, why `InternalHelperActivity` in this
   lesson's own example should never be `android:exported="true"`.
2. Explain, in your own words, why `MainActivity` specifically needs
   to be exported, unlike `InternalHelperActivity`.
3. Compare capability scoping directly to `private` (Lesson 0j) — name
   one similarity and one difference in scale.

## Definition of Done

- [ ] You read the real capability-scoping example and can explain
      what `android:exported="false"` prevents.
- [ ] You completed Exercise 1 and Exercise 2.
- [ ] You can state, without looking back at this lesson, why leaving
      every component exported by default is a real risk.
