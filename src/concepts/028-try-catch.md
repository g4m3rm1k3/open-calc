---
concept: 028-try-catch
name: try / catch
---

## Definition

`try` marks a block of code whose errors you want to handle instead of letting
them crash the program; `catch` is the block that runs if an exception is thrown
anywhere inside the `try`, receiving the exception object so the code can respond
to it.

## Problem

`throw` alone only stops execution and propagates the failure upward — without
try/catch, every exception either has to be handled by the immediate caller with
no choice in the matter, or crashes the program. try/catch is what lets code
choose exactly where in the call stack a particular failure gets handled, instead
of always the very next frame up.

## Execution

Execution enters the try block
↓
If every statement in the try block completes without throwing, the catch block
is skipped entirely
↓
If any statement throws, execution jumps immediately to the matching catch —
skipping the rest of the try block, even mid-operation
↓
The catch block runs with the thrown value available, and execution continues
normally after the try/catch as a whole

## Computer Science

try/catch is exception handling's structured alternative to checking a return
code after every call — instead of an `if` check after each risky operation, one
try block can guard many statements at once, and control only jumps to catch when
something actually goes wrong.

Tags: Structured exception handling, Control transfer, Error recovery

## Software Engineering

The scope of a try block is a real design decision — wrapping one risky line
versus wrapping ten changes what "something went wrong" could mean inside the
catch. A catch block that's too broad can accidentally swallow failures from
operations that had nothing to do with the one it was meant to guard.

Tags: Error boundaries, Catch scope, Recoverable vs unrecoverable failures

## Common Mistakes

- Wrapping far more code in a try block than necessary, making it unclear which specific operation the catch block is actually meant to handle.
- Catching an exception and doing nothing with it — an empty catch block silently discards real failures instead of handling them.

## Exercises

- In the JavaScript example, move the risky line outside the try block and observe the program crash instead of printing the caught message.
- In Python, add a second risky line before the one that throws, inside the same try block, and confirm it still runs normally when it doesn't throw — catch only fires if something actually goes wrong.

## javascript

```javascript
function parseConfig(json) {
  try {
    return JSON.parse(json)
  } catch (err) {
    console.log('Invalid config, using defaults:', err.message)
    return {}
  }
}
console.log(parseConfig('{ not valid json'))
```
Walkthrough: `JSON.parse` throws a `SyntaxError` on the malformed input — instead
of crashing, execution jumps into `catch`, which logs a clear message and returns
a safe default object, and the program continues normally from there.

## python

```python
import json

def parse_config(text):
    try:
        return json.loads(text)
    except json.JSONDecodeError as err:
        print('Invalid config, using defaults:', err)
        return {}

print(parse_config('{ not valid json'))
```
Walkthrough: same recovery shape — `json.loads` raises on malformed input,
`except` catches specifically a `JSONDecodeError` (not just any exception), logs
it, and returns a safe default.

## java

```java
static String readSetting(java.util.Map<String, String> config, String key) {
    try {
        return config.get(key).toUpperCase();
    } catch (NullPointerException e) {
        System.out.println("Missing setting '" + key + "', using default");
        return "DEFAULT";
    }
}

java.util.Map<String, String> config = new java.util.HashMap<>();
System.out.println(readSetting(config, "theme"));
```
Walkthrough: `config.get("theme")` returns `null` since the key isn't present,
and calling `.toUpperCase()` on that `null` throws a `NullPointerException` —
caught specifically, logged, and a safe default returned instead of crashing.
