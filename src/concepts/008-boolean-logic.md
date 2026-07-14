---
concept: 008-boolean-logic
name: Boolean Logic
---

## Definition

Boolean logic combines `true`/`false` values using `and`, `or`, and `not` to build
more complex conditions out of simpler ones.

## Problem

Real conditions are rarely just one check — "is the user logged in AND has an
active subscription," "is the input empty OR longer than the limit." Boolean
operators let these compound conditions be expressed directly instead of nested
in separate if-statements.

## Computer Science

Boolean AND and OR are **short-circuiting** in every language shown here: `a && b`
never evaluates `b` at all if `a` is already false, since the whole expression is
guaranteed false regardless. `a || b` never evaluates `b` if `a` is already true,
for the same reason. This isn't just an optimization — code that relies on `b`
having side effects can behave differently depending on whether it actually runs.

Tags: Short-circuit evaluation, De Morgan's laws, Boolean algebra

## Software Engineering

Short-circuiting is routinely used deliberately, not just as an optimization —
`user && user.name` safely reads `user.name` only if `user` actually exists,
avoiding a crash on `null`/`None`/`undefined` without a separate explicit check.

Tags: Null safety, Guard patterns, Defensive programming

## Common Mistakes

- Assuming `&&`/`||` always evaluate both sides — code that depends on a side effect in the second operand may never run it if the first operand already decided the outcome.
- Confusing `&&`/`and` with `||`/`or` when translating a requirement like "must be both X and Y" into code.

## Exercises

- In the JavaScript example, change `hasSubscription` to `false` and predict what `canAccess` becomes without re-running it.
- Predict what `null && expensiveCall()` evaluates to, and whether `expensiveCall()` ever runs.

## javascript

```javascript
const isLoggedIn = true
const hasSubscription = false
const canAccess = isLoggedIn && hasSubscription
console.log(canAccess)   // false
```
Walkthrough: `&&` requires both sides to be true. `isLoggedIn` is true, so
JavaScript evaluates `hasSubscription` too (it's not short-circuited here, since
the first operand didn't already decide the outcome) — `hasSubscription` is false,
so the whole expression is `false`.

## python

```python
is_logged_in = True
has_subscription = False
can_access = is_logged_in and has_subscription
print(can_access)   # False
```
Walkthrough: Python spells the operators as words — `and`/`or`/`not` — instead of
symbols, but the short-circuit behavior is identical to JavaScript's `&&`/`||`.

## java

```java
boolean isLoggedIn = true;
boolean hasSubscription = false;
boolean canAccess = isLoggedIn && hasSubscription;
System.out.println(canAccess);   // false
```
Walkthrough: same symbols as JavaScript (`&&`, `||`, `!`) and the same
short-circuit behavior — Java's boolean operators are essentially unchanged from
C's, which JavaScript's syntax also descends from.
