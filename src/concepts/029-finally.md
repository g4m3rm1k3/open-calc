---
concept: 029-finally
name: finally
---

## Definition

`finally` is an optional block attached to try/catch that always runs after the
try (and any catch) finishes — whether the try succeeded, failed and was caught,
or failed and was never caught at all.

## Problem

Some cleanup — closing a file, releasing a lock, closing a connection — has to
happen no matter what, whether the risky code succeeded, threw and got caught, or
threw and didn't. Without a dedicated mechanism, that cleanup would have to be
duplicated at the end of the try block and inside every catch block, and would
still be skipped entirely if an uncaught exception propagated past both.

## Execution

Execution enters the try block
↓
If it succeeds — finally runs, then execution continues normally after the whole
try/catch/finally
↓
If it throws and catch handles it — catch runs first, then finally runs, then
execution continues normally
↓
If it throws and nothing catches it — finally still runs, then the exception
keeps propagating upward exactly as if finally weren't there

## Computer Science

finally is guaranteed to run through every one of those three pathways, which is
what distinguishes it from just writing cleanup code after the try/catch — code
placed after a try/catch is skipped entirely if an uncaught exception propagates
past it, while finally is not.

Tags: Guaranteed execution, Resource cleanup, Control flow guarantees

## Software Engineering

finally is the classic place for closing files, releasing locks, or disconnecting
from a database — anything acquired before the risky code runs that must be
released regardless of outcome. Many languages also offer a more modern
alternative for the "open then guaranteed close" pattern specifically (Python's
`with`, Java's try-with-resources), which is less error-prone than remembering to
write the cleanup by hand.

Tags: Resource management, RAII-adjacent patterns, Cleanup guarantees

## Common Mistakes

- Putting a `return` inside a finally block — in most languages this silently overrides any return or exception from the try/catch, which is almost always unintended.
- Assuming code placed *after* a try/catch (instead of inside finally) still runs even if an exception is thrown and not caught — it doesn't; finally is the only place with that guarantee.

## Exercises

- In the JavaScript example, remove the throw from inside the try block and observe that finally still runs — it isn't conditional on failure.
- In Python, remove the `except` clause entirely (making the exception uncaught) and observe that `finally` still runs, but any code after the whole block does not.

## javascript

```javascript
function processFile(name) {
  console.log('Opening', name)
  try {
    if (name === 'corrupt.txt') throw new Error('cannot read corrupt file')
    console.log('Processing', name)
  } catch (err) {
    console.log('Failed:', err.message)
  } finally {
    console.log('Closing', name)
  }
}
processFile('corrupt.txt')
```
Walkthrough: `finally`'s "Closing corrupt.txt" line runs right after `catch`
handles the error. If the input were a normal file instead, `finally` would
still run — just immediately after the successful `try` block instead of after
`catch`.

## python

```python
def process_file(name):
    print('Opening', name)
    try:
        if name == 'corrupt.txt':
            raise ValueError('cannot read corrupt file')
        print('Processing', name)
    except ValueError as err:
        print('Failed:', err)
    finally:
        print('Closing', name)

process_file('corrupt.txt')
```
Walkthrough: identical guarantee — `finally`'s print always runs last, regardless
of which branch (success or the `except`) ran before it.

## java

```java
static void processFile(String name) {
    System.out.println("Opening " + name);
    try {
        if (name.equals("corrupt.txt")) throw new RuntimeException("cannot read corrupt file");
        System.out.println("Processing " + name);
    } catch (RuntimeException e) {
        System.out.println("Failed: " + e.getMessage());
    } finally {
        System.out.println("Closing " + name);
    }
}

processFile("corrupt.txt");
```
Walkthrough: same three-stage guarantee as the other two languages — `finally`'s
closing line runs after `catch` handles the thrown exception, and would run just
as reliably after a successful `try` with no exception at all.
