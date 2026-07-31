# Lesson 40: Interface Segregation Tension

**What you will build:** A disposable lab, same pattern as earlier
Java-only lessons.

**What you need to know first:** Lesson 06's `interface`.

**Terms introduced in this lesson:**

- **Interface segregation tension** — a base contract assumes full
  capability, but a specific implementation may only legitimately support
  part of it — failing loudly and immediately for the unsupported part is
  safer than silently doing nothing.

---

## Concept Unit: Interface Segregation Tension

### The Problem

An interface sometimes declares more methods than every real
implementation can honestly support — a read-only data source
implementing a contract that also requires a `delete` method, say. Simply
writing an empty, do-nothing body for the unsupported method hides a real
limitation silently; calling code would have no way to know the
capability genuinely isn't there.

### Introduce the Concept in Isolation

```
mkdir lesson-40
cd lesson-40
```

Create `Main.java`:

```java
interface DataStore {
    String read(String key);
    void write(String key, String value);
    void delete(String key);
}

class ReadOnlyDataStore implements DataStore {
    public String read(String key) {
        return "value for " + key;
    }

    public void write(String key, String value) {
        throw new UnsupportedOperationException("This data store is read-only.");
    }

    public void delete(String key) {
        throw new UnsupportedOperationException("This data store is read-only.");
    }
}

public class Main {
    public static void main(String[] args) {
        DataStore store = new ReadOnlyDataStore();
        System.out.println(store.read("username"));

        try {
            store.write("username", "newValue");
        } catch (UnsupportedOperationException e) {
            System.out.println("Caught expected error: " + e.getMessage());
        }
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
value for username
Caught expected error: This data store is read-only.
```

#### Execution Trace

Two of `DataStore`'s three methods are capable of throwing the same
exception type, but only one is actually exercised here — worth tracing
precisely which, and why:

1. `store.read("username")` runs first — `ReadOnlyDataStore.read`
   genuinely supports reading, so it returns a real value with no
   exception at all, and `main` prints it directly.
2. `store.write("username", "newValue")` runs next, inside the `try`
   block — `ReadOnlyDataStore.write` immediately constructs and throws a
   `new UnsupportedOperationException("This data store is read-only.")`,
   because writing is genuinely not supported by this implementation.
3. The thrown exception is caught by `catch
   (UnsupportedOperationException e)`, matching the exact type just
   thrown; `e.getMessage()` returns the message given to the exception's
   own constructor, which `main` then prints.
4. `store.delete(...)` is never called anywhere in this program — its
   own `new UnsupportedOperationException(...)` is written identically
   to `write`'s, but never actually constructed or thrown during this
   particular run, since nothing in `main` calls `delete`.

`ReadOnlyDataStore` implements all three of `DataStore`'s methods, but
`write` and `delete` immediately throw, rather than silently doing
nothing. This is `interface segregation tension` — **first appearance**:
a base contract assumes full capability, but a specific implementation
may only legitimately support part of it — failing loudly and
immediately for the unsupported part is safer than silently doing
nothing. `DataStore`'s contract promises `write` and `delete` work;
`ReadOnlyDataStore` genuinely can't honor that promise, and says so
immediately and clearly, rather than pretending to comply.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `interface DataStore { String read(...); void write(...); void
   delete(...); }` — **(b) reappearing** interface shape from Lesson 06,
   here declaring three methods a real implementation might not all
   equally support.
2. `throw new UnsupportedOperationException("...")` — **(a) first
   appearance** of this specific exception type: signals, explicitly and
   loudly, that this particular operation is genuinely not supported by
   this implementation — distinct from Lesson 09's own checked
   exceptions, since this specific exception is unchecked, matching the
   pattern of a genuine programming-logic issue rather than an expected,
   recoverable condition.
3. `try { store.write(...); } catch (UnsupportedOperationException e) {
   ... }` — **(b) reappearing** exception handling from Lesson 09,
   catching the exact exception `ReadOnlyDataStore` deliberately throws.

### CS Lens

This tension arises whenever a base interface's contract is broader than
every real implementation can honestly fulfill. The two honest responses
are: fail loudly (this lesson's own choice, via a thrown exception) or
redesign the interface into smaller, more specific pieces (a later,
often-preferred fix called **interface segregation** — splitting
`DataStore` into a `Readable` and a separate `Writable` interface, so
`ReadOnlyDataStore` would only ever need to implement `Readable`). This
lesson names the tension itself, not the redesign — recognizing when an
interface is asking too much of some implementations is the actual skill
here.

Also recognized in: any plugin API broader than every plugin actually
needs, database driver interfaces where not every backend supports every
declared operation (throwing `UnsupportedOperationException` or an
equivalent rather than silently ignoring an unsupported call), Java's own
`List.add` throwing `UnsupportedOperationException` on an immutable list
implementation.

### SE Lens

The alternative — `write` and `delete` silently doing nothing, returning
normally with no error at all — was not chosen because it would let
calling code believe a write succeeded when it genuinely did not, a
silent, hard-to-diagnose bug. Failing loudly and immediately, the moment
the unsupported operation is actually attempted, surfaces the real
limitation exactly where and when it matters, rather than allowing it to
masquerade as success.

---

## Connect the Pieces

`DataStore` declares a contract broader than `ReadOnlyDataStore` can
honestly support. Rather than silently ignoring `write`/`delete` calls,
`ReadOnlyDataStore` throws `UnsupportedOperationException` immediately —
a deliberate, defensible choice that surfaces the real limitation loudly,
rather than letting calling code believe an operation succeeded when it
did not.

## What Breaks Without This

A version of `ReadOnlyDataStore` where `write` silently does nothing
instead of throwing:

```java
public void write(String key, String value) {
    // does nothing at all
}
```

compiles and runs with no error whatsoever — `store.write("username",
"newValue")` appears to succeed, and any code relying on that write
having actually happened would be silently, invisibly wrong, with
nothing pointing at the real problem. This is the concrete, silent
failure mode this lesson's own loud-failure approach exists to prevent.

## Exercises

1. Add a fourth method to `DataStore`, `boolean exists(String key)`, and
   implement it fully (not throwing) on `ReadOnlyDataStore`, since
   checking existence is genuinely something a read-only store can
   support.
2. Write a second implementation, `FullDataStore`, that genuinely
   supports all three original methods without throwing, and confirm
   both implementations satisfy the same `DataStore` interface.
3. Explain, in your own words, how splitting `DataStore` into a
   `Readable` interface (with just `read`/`exists`) and a separate
   `Writable` interface (with `write`/`delete`) would let
   `ReadOnlyDataStore` avoid needing `UnsupportedOperationException` at
   all.

## Definition of Done

- [ ] You ran the `ReadOnlyDataStore` example and saw the real caught
      exception message.
- [ ] You completed Exercise 2 and confirmed both implementations
      satisfy the same interface.
- [ ] You can state, without looking back at this lesson, why throwing
      is preferred over silently doing nothing for an unsupported
      operation.
