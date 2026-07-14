---
concept: 053-switch
name: switch
---

## Definition

A switch statement compares one value against several possible cases and runs
the code associated with whichever case matches — a more structured alternative
to a long chain of if/else-if comparisons against the same value.

## Problem

A long `if`/`else if` chain that repeatedly compares the same single value
against different possibilities is repetitive and easy to get wrong. A switch
statement expresses "compare this one value against these several options"
directly, without repeating the value being compared at every branch.

## Computer Science

In C-style languages, a `switch` falls through to the next case by default
unless explicitly stopped with `break` — execution continues into the following
case's code even after a match, a frequent source of bugs when the `break` is
forgotten. Newer constructs (Rust's `match`, Python's `match`) don't have this
fall-through behavior at all.

Tags: Fall-through, Jump tables, Control flow

## Software Engineering

Forgetting a `break` in a fall-through switch is such a well-known bug that many
teams enforce a linter rule requiring every case to end explicitly — falling
through by accident is one of the most common switch-related bugs in C-style
languages.

Tags: Linting, Fall-through bugs, Defensive coding

## Common Mistakes

- Forgetting `break` at the end of a case in a fall-through switch — execution continues into the next case's code unintentionally, running logic that wasn't meant to run for this value.
- Not including a `default` case — a value that doesn't match any case simply does nothing, which can hide a real bug.

## Exercises

- In the JavaScript example, remove the `break` from the first matching case and observe execution fall through into the next one.
- In Rust, compare how `match` requires every possible case to be handled — unlike the switch statements in the other languages, which don't enforce this.

## javascript

```javascript
const day = 3
switch (day) {
  case 1:
    console.log('Monday')
    break
  case 2:
    console.log('Tuesday')
    break
  case 3:
    console.log('Wednesday')
    break
  default:
    console.log('Unknown day')
}
```
Walkthrough: `day` is compared against each `case` in order until one matches —
`3` matches the third case, printing `'Wednesday'`, and `break` stops execution
from continuing into the `default` case below it.

## python

```python
day = 3
match day:
    case 1:
        print('Monday')
    case 2:
        print('Tuesday')
    case 3:
        print('Wednesday')
    case _:
        print('Unknown day')
```
Walkthrough: Python has no `switch` statement at all — `match`, added in Python
3.10, is its closest equivalent when used this simply. Unlike JavaScript's
`switch`, there's no fall-through to guard against — `case _:` is Python's
"anything else" catch-all, playing the same role as `default`.

## java

```java
int day = 3;
switch (day) {
    case 1:
        System.out.println("Monday");
        break;
    case 2:
        System.out.println("Tuesday");
        break;
    case 3:
        System.out.println("Wednesday");
        break;
    default:
        System.out.println("Unknown day");
}
```
Walkthrough: identical fall-through behavior to JavaScript's — Java's `switch`
descends from the same C-style design, `break` required at the end of each
case to prevent execution continuing into the next one.

## cpp

```cpp
int day = 3;
switch (day) {
    case 1:
        std::cout << "Monday" << std::endl;
        break;
    case 2:
        std::cout << "Tuesday" << std::endl;
        break;
    case 3:
        std::cout << "Wednesday" << std::endl;
        break;
    default:
        std::cout << "Unknown day" << std::endl;
}
```
Walkthrough: same fall-through switch as Java and JavaScript — C++'s `switch`
is where this exact design originated, later adopted by both of the other
languages.

## rust

```rust
let day = 3;
match day {
    1 => println!("Monday"),
    2 => println!("Tuesday"),
    3 => println!("Wednesday"),
    _ => println!("Unknown day"),
}
```
Walkthrough: Rust has no `switch` at all — `match` is the only construct for
this, and unlike every fall-through language above, only the matching arm ever
runs; there's no `break` to remember because there's nothing to fall through
into in the first place.
