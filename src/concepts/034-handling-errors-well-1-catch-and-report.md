---
concept: 034-handling-errors-well-1-catch-and-report
name: "Handling Errors Well: Catch and Report"
series: handling-errors-well
seriesTitle: Handling Errors Well
part: 1
---

## Definition

The baseline practice for handling a failure is to catch it where you can
meaningfully respond to it, and report what happened clearly — not to prevent
the error, but to make sure it's never silent.

## Problem

An empty catch block makes an error disappear without a trace, which is worse
than not catching it at all: the program limps along with no signal that
anything went wrong, until the real consequence surfaces somewhere completely
unrelated. Catching well means the catch block always does two things — decide
what to do next, and say what happened.

## Computer Science

This is a discipline layered on top of the try/catch mechanism (see that
concept), not something the language enforces for you. The mechanism doesn't
require a catch block to do anything useful — "catch and report well" is a
practice choice.

Tags: Exception handling discipline, Silent failure, Fail-fast

## Software Engineering

The most common real-world catch mistake isn't skipping try/catch — it's
catching and doing nothing meaningful, or logging a message so generic
("Something went wrong") that it gives the next person, often future-you,
nothing to act on. A good caught-error report names what operation failed, what
the actual error was, and enough context to reproduce it.

Tags: Logging quality, Observability, Debuggability

## Common Mistakes

- An empty catch block — catching an exception and doing literally nothing with it, which hides real failures instead of handling them.
- Logging only a generic message instead of the actual exception and the specific operation that failed — this technically "reports" the error but gives nobody enough to act on it.

## Exercises

- In the JavaScript example, change the catch to log nothing and compare how much harder it becomes to tell the request actually failed.
- In Python, remove the URL from the log message and notice how much less useful the report becomes without it.

## javascript

```javascript
function fetchUserProfile(url) {
  try {
    if (!url.startsWith('https://')) throw new Error('Refusing insecure URL: ' + url)
    return { name: 'Alex' }
  } catch (err) {
    console.log(`Failed to fetch user profile from ${url}: ${err.message}`)
    return null
  }
}
console.log(fetchUserProfile('http://example.com/profile'))
```
Walkthrough: the catch block does both required things — it logs exactly which
URL failed and why, and it decides what happens next (`return null` instead of
letting the exception crash the caller). A caller that gets `null` back knows
the fetch failed; a caller reading the logs knows exactly why.

## python

```python
def fetch_user_profile(url):
    try:
        if not url.startswith('https://'):
            raise ValueError('Refusing insecure URL: ' + url)
        return {'name': 'Alex'}
    except ValueError as err:
        print(f'Failed to fetch user profile from {url}: {err}')
        return None

print(fetch_user_profile('http://example.com/profile'))
```
Walkthrough: same shape — the report names the specific URL and the specific
reason, and the function still returns a usable, if empty, result instead of
propagating the exception further than necessary.

## java

```java
static String fetchUserProfile(String url) {
    try {
        if (!url.startsWith("https://")) throw new IllegalArgumentException("Refusing insecure URL: " + url);
        return "Alex";
    } catch (IllegalArgumentException e) {
        System.out.println("Failed to fetch user profile from " + url + ": " + e.getMessage());
        return null;
    }
}

System.out.println(fetchUserProfile("http://example.com/profile"));
```
Walkthrough: identical discipline in Java — the catch block logs the specific
URL and reason before returning `null`, so nothing about the failure is silent
even though the exception itself never propagates past this function.
