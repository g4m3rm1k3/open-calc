---
concept: 186-defer
name: Defer (Go)
---

## Definition

`defer` schedules a function call to run just before the enclosing
function returns — regardless of HOW it returns (a normal return, a
panic, multiple return points) — commonly used for cleanup (closing a
file, unlocking a mutex) that must happen no matter what path the
function takes to exit.

## Problem

A function with multiple return points (early returns for error cases, a
normal return at the end) risks forgetting cleanup on SOME of those paths
if cleanup code has to be duplicated at every return statement. `defer`
lets cleanup be declared ONCE, right next to where the resource was
acquired, and guarantees it runs on EVERY exit path, without needing to
repeat it at each return.

## Execution

A resource is acquired (e.g., opening a file)
↓
Cleanup is scheduled IMMEDIATELY after acquiring the resource, via
`defer`, even though it won't actually RUN until later
↓
The rest of the function executes normally — possibly with several early
`return` statements for different error conditions
↓
No matter WHICH return statement is hit (or even if the function
panics), the deferred cleanup still runs, right before the function
actually returns
↓
Multiple `defer` calls in the same function run in LIFO order (last
deferred, first executed) — like a stack

## Computer Science

`defer` is evaluated (its arguments captured) at the moment the `defer`
statement itself runs, but the actual CALL is delayed until the function
returns — this is why deferred calls execute in reverse (LIFO) order when
there are multiple, mirroring how a stack unwinds.

Tags: LIFO execution order, Deferred execution, Resource cleanup

## Software Engineering

Pairing resource acquisition with its `defer`red cleanup on the VERY NEXT
LINE is the idiomatic Go pattern — it keeps the "acquire" and "release"
visually adjacent in the code, making it much harder to accidentally
forget cleanup on some code path than if cleanup were written separately
at the bottom of the function.

Tags: Idiomatic resource management, Acquire-release adjacency, RAII-like pattern

## Common Mistakes

- Deferring a cleanup call in a LOOP without realizing all deferred calls run only when the ENCLOSING FUNCTION returns, not at the end of each loop iteration — this can accumulate many pending deferred calls (and held resources) until the function actually exits.
- Assuming deferred calls run in the SAME order they were declared — they actually run in REVERSE (LIFO) order, which matters when multiple deferred operations have an interdependency.

## Exercises

- Trace through the LIFO example below and predict the exact print order before checking it against the actual output.
- Explain why deferring a file close immediately after opening it is safer than writing that close call once at the very end of the function.

## go

```go
package main

import "fmt"

func main() {
	fmt.Println("start")
	defer fmt.Println("deferred 1")
	defer fmt.Println("deferred 2")
	defer fmt.Println("deferred 3")
	fmt.Println("end of main body")
}
```
Walkthrough: the three `defer` statements are registered in the order 1,
2, 3, but they EXECUTE in reverse (LIFO) order — "deferred 3" prints
first, then "deferred 2", then "deferred 1", all AFTER "end of main
body" prints, since none of them actually run until `main` is about to
return.
