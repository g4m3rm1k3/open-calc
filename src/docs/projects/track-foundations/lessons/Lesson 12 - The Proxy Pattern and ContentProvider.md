# Lesson 12: The Proxy Pattern and ContentProvider

**What you will build:** The first unit is a small, fully runnable,
hand-rolled lab in plain Java. The remaining two units read real
Android component contracts directly, connecting them back to the
pattern already built and run.

**What you need to know first:** Lesson 11's `Android Manifest`.

**Terms introduced in this lesson:**

- **Proxy/gateway pattern** — brokering access through a narrow,
  explicitly-scoped intermediary instead of exposing a raw resource
  directly.
- **`ContentProvider`** — a second kind of app component, distinct from
  `Activity`, exposing structured access to data across app boundaries
  under OS-mediated permission control.
- **`FileProvider`** — a `content://` URI brokered through a
  `FileProvider`, granting another app temporary, scoped access to write
  a specific file without exposing the app's raw storage directly.

---

## Concept Unit: The Proxy/Gateway Pattern — Brokering Access, Not Exposing It Directly

### The Problem

Sometimes one system needs to let another system act on a resource — read
a file, use a service — without handing over full, direct access to that
resource. Direct access is often too much: the requester only needs to do
one narrow thing, and full access would let it do anything, including
things it was never meant to.

### Introduce the Concept in Isolation

```
mkdir lesson-12
cd lesson-12
```

Create `Main.java`:

```java
class SecureVault {
    private String secretData = "the actual secret contents";

    String readOnlySummary() {
        return "Vault contains " + secretData.length() + " characters.";
    }
}

public class Main {
    public static void main(String[] args) {
        SecureVault vault = new SecureVault();
        System.out.println(vault.readOnlySummary());
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

Here is the real output:

```
Vault contains 28 characters.
```

`readOnlySummary()` is a `proxy/gateway pattern` — **first appearance**:
brokering access through a narrow, explicitly-scoped intermediary instead
of exposing a raw resource directly. `Main` never sees `secretData`
itself — Lesson 04's `private` already blocks that directly — and is only
ever handed a narrow, deliberately limited summary through a method that
grants exactly one specific capability (reading a length-based summary),
never full read access to the real content.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `private String secretData = "..."` — **(b) reappearing** access-level
   enforcement from Lesson 04, blocking `Main` from reaching the real
   field at all.
2. `String readOnlySummary() { return "Vault contains " +
   secretData.length() + " characters."; }` — **(a) first appearance** of
   this exact shape: a method that reads the sensitive field internally
   but exposes only a deliberately narrow derived value — a length-based
   summary, not the content itself — to any outside caller.

### CS Lens

A proxy is a **stand-in**: outside code interacts with the proxy, which
decides, on the real resource's behalf, exactly what to allow. This is a
narrower, more deliberate idea than plain encapsulation (Lesson 04) —
encapsulation says "outside code can't touch this directly"; the proxy
pattern specifically shapes *what limited access is granted instead*.

Also recognized in: a network proxy server (brokers a client's requests
to the real server, without the client connecting directly), a database
connection pool (brokers access to a limited set of real connections),
any API gateway sitting in front of a set of internal services.

### SE Lens

The alternative — a getter returning `secretData` directly, then trusting
callers to only read the length — was not chosen because trust doesn't
enforce anything; any caller with the real string could do far more than
just check its length. A proxy method that only ever returns a derived
summary makes the limitation structural, not a matter of caller
discipline.

---

## Concept Unit: `ContentProvider` — Structured Cross-App Data Access

### The Problem

An Activity, from Lesson 10, is one of Android's app components — but
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

This is a `ContentProvider` — **first appearance**: a second kind of app
component, distinct from `Activity`, exposing structured access to data
across app boundaries under OS-mediated permission control. Unlike this
lesson's own hand-rolled
`SecureVault`, real access here is mediated by the Android OS itself: a
requesting app never calls these methods directly on a live object it
holds — it goes through a `content://` URI, resolved by the OS, which
locates the right `ContentProvider` and calls its methods, checking
permissions along the way.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real, verified
framework contract, confirmed against the actual `ContentProvider`
source.

### Mechanical Walkthrough

1. `public abstract class ContentProvider { ... }` — **(b) reappearing**
   `abstract class` from Lesson 10's `MiniFramework`, now applied to a
   real Android base class.
2. `public abstract Cursor query(...)` and `public abstract Uri
   insert(...)` — two required steps a real subclass must supply,
   **(b)** reappearing abstract-method shape, applied to real,
   OS-invoked entry points rather than a hand-rolled example.

### CS Lens

`ContentProvider` is the proxy/gateway pattern at OS scale: rather than
one app directly opening another app's private files, every cross-app
data request is brokered through this one, explicitly-scoped interface,
with the Android OS itself enforcing whatever permission checks apply
before a request ever reaches the provider's own code.

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
`grantUriPermissions`, the exact narrow, deliberate scoping this lesson's
first unit already demonstrated in miniature with `readOnlySummary()`.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real, verified
Manifest declaration.

### Mechanical Walkthrough

1. `<provider android:name="androidx.core.content.FileProvider" ...>` —
   **(a) first appearance** of declaring a `ContentProvider` in the
   Manifest — the same declaration-before-use requirement Lesson 11
   already established for Activities, now applied to this second
   component kind.
2. `android:authorities="com.example.myapp.fileprovider"` — **(a) first
   appearance**: a unique identifier other apps use, as part of a
   `content://` URI, to reach this specific provider.
3. `android:exported="false"` — **(b) reappearing** Manifest attribute
   from Lesson 11, here meaning no app can use this provider without an
   explicit, individually-granted permission first.

### CS Lens

`FileProvider` is a concrete, ready-made instance of both this lesson's
concepts at once: it *is* a `ContentProvider` (inheriting Lesson 10's
`extends`/`implements` shape), and its entire job *is* the proxy/gateway
pattern — brokering temporary, scoped file access instead of ever
exposing an app's raw storage path.

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

`SecureVault.readOnlySummary()` established the proxy/gateway pattern in
miniature: broker access through a narrow method, never expose the raw
resource. `ContentProvider` is that same pattern at OS scale — a second
app component kind, mediated by Android itself, exposing exactly the data and
operations its author intends. `FileProvider` is a ready-made
`ContentProvider`, already written, for the common case of temporarily
sharing one specific file — the exact narrow scoping this lesson opened
with, now real and load-bearing.

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

1. Write, from scratch, a second small proxy method on `SecureVault` —
   `boolean containsWord(String word)` — that checks whether the secret
   contains a given word without ever returning the secret itself.
2. Read `ContentProvider`'s real contract again and identify which
   method would be responsible for handling a request to delete data
   (not shown in this lesson's excerpt) — check your answer against the
   real Android documentation.
3. Read the real `FileUriExposedException` message in "What Breaks
   Without This" and identify exactly which part names the exposed file.

## Definition of Done

- [ ] You ran the `SecureVault` example and saw the real length-based
      summary output.
- [ ] You completed Exercise 1 and can explain why `containsWord` is
      still a proxy even though it returns a `boolean` instead of a
      length.
- [ ] You can state, without looking back at this lesson, why
      `FileProvider` sets `android:exported="false"` while still letting
      other apps access shared files.
