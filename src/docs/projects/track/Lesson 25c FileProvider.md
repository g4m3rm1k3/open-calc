# Lesson 25c: `FileProvider`

**What you will build:** No new code to compile — this reads a real,
verified Manifest declaration directly.

**What you need to know first:** Lesson 25b's `ContentProvider`, Lesson
25a's Proxy/Gateway Pattern.

**Terms introduced in this lesson:**

- **`FileProvider`** — a `content://` URI brokered through a
  `FileProvider`, granting another app temporary, scoped access to write
  a specific file without exposing the app's raw storage directly.

---

## Concept Unit: `FileProvider` — A Ready-Made `ContentProvider`

### The Problem

Writing a full `ContentProvider` from scratch is real work — implementing
`query`, `insert`, and more, correctly. Many apps only need one narrow,
common case: letting another app (a camera app, for instance) write to,
or read, one specific file, temporarily, without exposing the rest of the
app's storage at all. Android provides a ready-made `ContentProvider`
for exactly this common case.

### Introduce the Concept in Isolation

A real, verified Manifest declaration enabling `FileProvider`:

```xml
<provider
    android:name="androidx.core.content.FileProvider"
    android:authorities="com.example.myapp.fileprovider"
    android:exported="false"
    android:grantUriPermissions="true">
</provider>
```

This is `FileProvider` — **first appearance**: a `content://` URI
brokered through a `FileProvider`, granting another app temporary, scoped
access to write a specific file without exposing the app's raw storage
directly. `android:exported="false"` means no other app can use this
provider freely — access is only ever granted temporarily, per-file, via
`grantUriPermissions`, the exact narrow, deliberate scoping Lesson 25a
already demonstrated in miniature with `readOnlySummary()`.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real, verified
Manifest declaration.

### Mechanical Walkthrough

1. `<provider android:name="androidx.core.content.FileProvider" ...>` —
   **(a) first appearance** of declaring a `ContentProvider` in the
   Manifest — the same declaration-before-use requirement Lesson 2h
   already established for Activities, now applied to this fourth
   component kind.
2. `android:authorities="com.example.myapp.fileprovider"` — **(a) first
   appearance**: a unique identifier other apps use, as part of a
   `content://` URI, to reach this specific provider.
3. `android:exported="false"` — **(b) reappearing** Manifest attribute
   from Lesson 2h, here meaning no app can use this provider without an
   explicit, individually-granted permission first.

### CS Lens

`FileProvider` is a concrete, ready-made instance of both this group of
lessons' concepts at once: it *is* a `ContentProvider` (inheriting Lesson
0l's `extends`/`implements` shape), and its entire job *is* the
proxy/gateway pattern — brokering temporary, scoped file access instead
of ever exposing an app's raw storage path.

Also recognized in: any framework's own "batteries included"
implementation of a common pattern (a web framework's built-in
authentication middleware, implementing the proxy pattern for login
checks so most apps never need to write one from scratch).

### SE Lens

The alternative — every app that needs to share a file with another app
writing its own full `ContentProvider` from scratch — was not chosen
because file-sharing is common enough, and easy enough to get wrong
(exposing more than intended), that Android provides `FileProvider`
specifically to make the safe, narrow case the easy case.

---

## Connect the Pieces

`FileProvider` is a ready-made `ContentProvider`, already written, for
the common case of temporarily sharing one specific file — the exact
narrow scoping this group of lessons opened with, now real and
load-bearing. The next lesson shows a different mechanism for reaching
another app entirely.

## What Breaks Without This

Sharing a raw `file://` URI directly, bypassing `FileProvider` entirely,
throws a real runtime error on modern Android resembling:

```
android.os.FileUriExposedException: file:///storage/emulated/0/photo.jpg exposed beyond app through Intent.getData()
```

This is the concrete, OS-enforced proof that direct file exposure is
specifically blocked as a security measure — `FileProvider`'s scoped
`content://` URI is the sanctioned alternative, not an optional
convenience.

## Exercises

1. Read the real `FileUriExposedException` message in "What Breaks
   Without This" and identify exactly which part names the exposed file.
2. Explain, in your own words, why `FileProvider` sets
   `android:exported="false"` while still letting other apps access
   shared files.
3. Explain, in your own words, why writing a full `ContentProvider` from
   scratch for simple file-sharing would be easy to get wrong.

## Definition of Done

- [ ] You read the real `FileProvider` Manifest declaration and can
      explain what `android:grantUriPermissions="true"` allows.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why
      `FileProvider` is described as a "ready-made" `ContentProvider`.
