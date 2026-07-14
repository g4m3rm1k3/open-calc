---
concept: 037-checked-vs-unchecked-exceptions
name: "Checked vs. Unchecked Exceptions"
---

## Definition

A checked exception is one the compiler forces every caller to either catch or
explicitly declare it might throw; an unchecked exception carries no such
compiler-enforced obligation — it can propagate silently as far as it needs to,
with nothing in the code signaling that possibility.

## Problem

A function that can fail in an expected way — a file might not exist, a network
call might time out — creates a real question: should every caller be forced to
acknowledge that possibility, or should that be left to the programmer's own
discipline? Different languages answer this differently, and the answer shapes
how confidently you can read a function's signature and know what can go wrong.

## Computer Science

Checked exceptions are a compile-time contract: a method signature that declares
`throws IOException` is part of its type, and the compiler rejects any caller
that doesn't handle or re-declare it — the same idea as a parameter type, applied
to failure. Unchecked exceptions carry no such static guarantee; the only way to
know a function might throw one is to read its implementation or its
documentation.

Tags: Static checking, Type-level contracts, Compile-time guarantees

## Software Engineering

Checked exceptions guarantee a caller can't forget to handle a known failure
mode, but that guarantee has a real cost: they show up in every signature along
a call chain, and a change deep in a call graph — a new checked exception added
to some low-level method — can force edits in every caller above it, all the way
up. Most languages designed after Java concluded the tradeoff wasn't worth it;
this is a genuinely contested language-design decision, not a settled one.
Rust's `Result<T, E>` return type and Go's multi-value `(value, error)` return
both solve the same underlying problem — forcing a caller to acknowledge
failure — through the type system instead of a separate checking mechanism,
without the "add one exception, touch every caller" cost.

Tags: API design, Language design tradeoffs, Type-safe error handling

## Common Mistakes

- Catching a checked exception immediately and doing nothing with it, just to satisfy the compiler — this technically compiles but reintroduces the exact silent-failure problem checked exceptions exist to prevent.
- Assuming "no checked exception" means "cannot fail" — Python and C++ can throw anything at any point, checked or not; the absence of a compiler-enforced declaration is not a guarantee of success.

## Exercises

- In the Java example, remove the `throws IOException` declaration and observe the compiler reject the code before it even runs — the same code compiles fine if the exception were unchecked instead.
- In Python, call the function without a try/except at all and observe that it compiles and runs right up until the exception is actually raised — nothing at the language level warns you it can fail.

## java

```java
import java.io.IOException;

static void readConfig(boolean missing) throws IOException {
    if (missing) throw new IOException("config.json not found");
    System.out.println("Config loaded");
}

readConfig(true);
```
Walkthrough: `throws IOException` is part of `readConfig`'s signature — any code
calling it must either catch `IOException` or declare `throws IOException`
itself, checked by the compiler before the program can even build. Run as-is
(uncaught), it throws `IOException: config.json not found` with a full stack
trace — but removing the `throws` clause would be a *compile* error, not a
runtime one, since the compiler tracks this exception as part of the method's type.

## python

```python
def read_config(missing):
    if missing:
        raise IOError('config.json not found')
    print('Config loaded')

read_config(True)
```
Walkthrough: nothing in `read_config`'s definition tells a caller it can raise
an error — Python has no checked-exception mechanism at all. The only way to
know is to read the function's body or its documentation; the language itself
enforces nothing, and this runs exactly the same (raising, uncaught) as if the
`raise` line were buried three calls deeper.

## cpp

```cpp
void readConfig(bool missing) {
    if (missing) throw std::runtime_error("config.json not found");
    std::cout << "Config loaded" << std::endl;
}

readConfig(true);
```
Walkthrough: like Python, nothing in `readConfig`'s signature says it can throw
— C++ actually used to have exception specifications (a `throw(...)`-style
syntax naming what a function could throw) but deprecated and then removed them
entirely, moving further away from Java's checked-exception model rather than
toward it. Run as-is, the uncaught exception calls `std::terminate` and the
program aborts — there was no compiler warning anywhere along the way.
