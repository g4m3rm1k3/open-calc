---
concept: async-1-the-problem
name: Async, Part 1 — The Problem
series: async-fundamentals
seriesTitle: Asynchronous Programming
part: 1
---

## Definition

**Blocking** means the program sits idle, doing nothing else, until a slow
operation (reading a file, a network call, a database query) finishes.
**Non-blocking**, or **asynchronous**, means the program keeps doing other useful
work while that operation is still in progress, and comes back to the result once
it's ready.

## Problem

Some operations don't finish instantly. While the program waits for one of these,
it has a choice: block, or stay responsive to everything else it also needs to do.
A program that blocks on every slow operation can only ever do one thing at a time,
even when the CPU itself was never actually busy — it was just waiting.

## Computer Science

A blocking call suspends the entire calling thread of execution until the
operation completes — no other code on that thread runs, not because the CPU is
busy, but because it's idle, waiting. This is the core distinction from plain
slowness: a loop computing something for one second keeps the CPU working the
whole time; a blocking network call can take one second while the CPU sits
completely idle, because the bottleneck isn't computation, it's waiting on
something external.

Tags: Thread suspension, I/O wait, CPU idle time

## Software Engineering

This matters most in programs that need to stay responsive to more than one thing
at once — a web server handling many requests, a UI that shouldn't freeze while
loading data. If handling one request blocks the whole program, every other
request queues up behind it even though the CPU was never actually busy. Async
programming exists specifically to avoid wasting that idle time.

Tags: Responsiveness, Server throughput, UI freezing

## Common Mistakes

- Assuming "async" means "faster" — it doesn't speed up the operation itself (the network call still takes just as long either way). It only frees up the program to do other things *while* waiting.
- Confusing "blocking" with "slow" — a loop that takes 5 seconds computing primes is slow but not blocking in this sense; the CPU is genuinely busy the whole time, not idly waiting on something external.

## Exercises

- Predict, before running: does adding a second blocking call double the wait, or run alongside the first? Try it in the JavaScript example by adding a second `getUserBlocking` call.

## javascript

```javascript
// Imagine this takes 2 real seconds to come back — a blocking version:
function getUserBlocking(id) {
  // ...network call that doesn't return until data arrives...
  return fetchedUser
}

console.log('before')
const user = getUserBlocking(1)   // everything else waits here for 2 seconds
console.log('after')              // this line cannot run until the call above finishes
```
Walkthrough: if `getUserBlocking` really blocked like this, `'after'` could not
print until the full 2 seconds elapsed — nothing else in the program, including
handling a second incoming request, could happen during that wait. Real JavaScript
network APIs are never actually written this way (the next parts show why), but
this is the shape of the problem every async tool exists to solve.

## python

```python
import time

def get_user_blocking(user_id):
    time.sleep(2)  # stands in for "waiting on the network"
    return {"id": user_id}

print("before")
user = get_user_blocking(1)   # the whole program waits here for 2 seconds
print("after")
```
Walkthrough: `time.sleep(2)` really does block — the Python interpreter does
nothing else for two full seconds. `print("after")` cannot run until it returns.
This is a genuine, common way to accidentally write blocking code in Python if you
reach for a synchronous library where an async one was needed.

## java

```java
class UserService {
    static User getUserBlocking(int id) throws InterruptedException {
        Thread.sleep(2000); // stands in for "waiting on the network"
        return new User(id);
    }
}

System.out.println("before");
User user = UserService.getUserBlocking(1); // this thread waits here for 2 seconds
System.out.println("after");
```
Walkthrough: `Thread.sleep(2000)` blocks the **thread that called it** for two
seconds — nothing else on that specific thread runs. Java can still do other work
on *other* threads at the same time (Part 3 covers this), which is the first hint
that "blocking" and "the whole program freezes" aren't always the same thing —
they only coincide when there's just one thread available to block, exactly
JavaScript's situation.
