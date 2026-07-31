# Lesson 25b: `ContentProvider`

**What you will build:** No new code to compile — this reads a real,
verified component contract directly.

**What you need to know first:** Lesson 25a's Proxy/Gateway Pattern,
Lesson 2h's Android Manifest.

**Terms introduced in this lesson:**

- **`ContentProvider`** — a fourth kind of app component exposing
  structured access to data across app boundaries under OS-mediated
  permission control.

---

## Concept Unit: `ContentProvider` — Structured Cross-App Data Access

### The Problem

An Activity, from Lesson 2e, is one of Android's app components — but
Activities are for showing screens, not for structured data another app
might need to read or write. Android needs a distinct kind of component
specifically for exposing an app's own data to other apps, safely, under
the OS's own permission control, rather than each app inventing its own
ad hoc way to share files or data.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real, verified component shape, read
directly. `ContentProvider`'s real, partial declared contract:

```java
public abstract class ContentProvider {
    public abstract Cursor query(Uri uri, String[] projection,
        String selection, String[] selectionArgs, String sortOrder);

    public abstract Uri insert(Uri uri, ContentValues values);
}
```

This is a `ContentProvider` — **first appearance**: a fourth kind of app
component exposing structured access to data across app boundaries under
OS-mediated permission control. Unlike Lesson 25a's own hand-rolled
`SecureVault`, real access here is mediated by the Android OS itself: a
requesting app never calls these methods directly on a live object it
holds — it goes through a `content://` URI, resolved by the OS, which
locates the right `ContentProvider` and calls its methods, checking
permissions along the way. This lesson reads the shape only in passing —
a later lesson returns to `ContentProvider` for full treatment.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real, verified
framework contract, verified against the actual `ContentProvider`
source.

### Mechanical Walkthrough

1. `public abstract class ContentProvider { ... }` — **(b) reappearing**
   `abstract class` from Lesson 13c, now applied to a real Android base
   class.
2. `public abstract Cursor query(...)` and `public abstract Uri
   insert(...)` — two required steps a real subclass must supply,
   **(b)** reappearing abstract-method shape, applied to real,
   OS-invoked entry points rather than a hand-rolled example.

### CS Lens

`ContentProvider` is the proxy/gateway pattern (Lesson 25a) at OS scale:
rather than one app directly opening another app's private files, every
cross-app data request is brokered through this one, explicitly-scoped
interface, with the Android OS itself enforcing whatever permission
checks apply before a request ever reaches the provider's own code.

Also recognized in: any OS-level broker mediating access between
sandboxed applications — the same shape as a browser mediating a web
page's access to the filesystem, never granting it directly.

### SE Lens

The alternative — letting apps read each other's raw files directly, with
no mediation — was not chosen because Android sandboxes every app's
private storage specifically to prevent this; `ContentProvider` is the
sanctioned, narrow exception, exposing exactly the data and operations
its own author intends, and nothing more.

---

## Connect the Pieces

`ContentProvider` is Lesson 25a's own proxy/gateway pattern at OS scale
— a fourth app component kind, mediated by Android itself. The next
lesson shows a ready-made `ContentProvider` for one specific, common
case.

## What Breaks Without This

Letting apps read each other's raw files directly, with no mediation,
would defeat Android's own sandboxing of every app's private storage.

## Exercises

1. Read `ContentProvider`'s real contract again and identify which
   method would be responsible for handling a request to delete data
   (not shown in this lesson's excerpt) — check your answer against the
   real Android documentation.
2. Explain, in your own words, why `ContentProvider` is described as a
   fourth kind of app component, distinct from `Activity`.
3. Explain, in your own words, how a `content://` URI differs from
   directly calling a method on a live object.

## Definition of Done

- [ ] You read the real `ContentProvider` contract and can explain what
      `query` and `insert` are each responsible for.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why
      `ContentProvider` is described as the proxy/gateway pattern "at OS
      scale."
