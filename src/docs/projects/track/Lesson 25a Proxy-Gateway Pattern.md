# Lesson 25a: Proxy/Gateway Pattern

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 0j's access-level enforcement.

**Terms introduced in this lesson:**

- **Proxy/Gateway Pattern** — brokering access through a narrow,
  explicitly-scoped intermediary instead of exposing a raw resource
  directly.

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
mkdir lesson-25a
cd lesson-25a
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

`readOnlySummary()` is a `Proxy/Gateway Pattern` — **first appearance**:
brokering access through a narrow, explicitly-scoped intermediary instead
of exposing a raw resource directly. `Main` never sees `secretData`
itself — Lesson 0j's `private` already blocks that directly — and is only
ever handed a narrow, deliberately limited summary through a method that
grants exactly one specific capability (reading a length-based summary),
never full read access to the real content.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `private String secretData = "..."` — **(b) reappearing** access-level
   enforcement from Lesson 0j, blocking `Main` from reaching the real
   field at all.
2. `String readOnlySummary() { return "Vault contains " +
   secretData.length() + " characters."; }` — **(a) first appearance** of
   this exact shape: a method that reads the sensitive field internally
   but exposes only a deliberately narrow derived value — a length-based
   summary, not the content itself — to any outside caller.

### CS Lens

A proxy is a **stand-in**: outside code interacts with the proxy, which
decides, on the real resource's behalf, exactly what to allow. This is a
narrower, more deliberate idea than plain encapsulation (Lesson 0k) —
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

## Connect the Pieces

`SecureVault.readOnlySummary()` establishes the proxy/gateway pattern in
miniature: broker access through a narrow method, never expose the raw
resource. The next lesson shows this same pattern at OS scale.

## What Breaks Without This

A getter returning `secretData` directly, trusting callers to only read
the length, doesn't enforce anything — any caller with the real string
could do far more than just check its length.

## Exercises

1. Write, from scratch, a second small proxy method on `SecureVault` —
   `boolean containsWord(String word)` — that checks whether the secret
   contains a given word without ever returning the secret itself.
2. Explain, in your own words, why the proxy pattern is described as
   narrower than plain encapsulation.
3. Name one real system (besides a database connection pool) that
   brokers access through a narrow intermediary rather than exposing a
   raw resource directly.

## Definition of Done

- [ ] You ran the `SecureVault` example and saw the real length-based
      summary output.
- [ ] You completed Exercise 1 and can explain why `containsWord` is
      still a proxy even though it returns a `boolean` instead of a
      length.
- [ ] You can state, without looking back at this lesson, how the proxy
      pattern differs from plain encapsulation.
