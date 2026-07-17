---
concept: 184-goroutines
name: Goroutines (Go)
---

## Definition

A goroutine is a lightweight, independently-scheduled function execution
managed by the Go runtime — started with the `go` keyword, goroutines let
a program run many concurrent tasks using far less memory and overhead
than OS-level threads.

## Problem

Creating a genuine OS thread for every concurrent task is expensive
(megabytes of stack space each, expensive context switches) — a program
needing thousands of concurrent operations would exhaust resources
quickly with OS threads alone. Goroutines are managed by Go's own runtime
scheduler, which multiplexes many goroutines onto a much smaller number
of actual OS threads, starting with a tiny stack (a few KB) that grows as
needed.

## Execution

Starting a function with `go` starts it running as a NEW goroutine, and
immediately continues to the next line WITHOUT waiting for it to finish
↓
The calling goroutine (main) and the new goroutine now run
CONCURRENTLY — their exact interleaving/timing isn't guaranteed
↓
If `main()` returns before the new goroutine finishes, the ENTIRE
PROGRAM exits immediately — Go does not wait for other goroutines
automatically
↓
A `sync.WaitGroup` (or a channel, see Channels) is used to explicitly
wait for a goroutine to actually finish before the program proceeds or
exits

## Computer Science

Goroutines implement what's called "M:N scheduling" — M goroutines are
multiplexed onto N OS threads by Go's own runtime scheduler, rather than
each goroutine mapping 1:1 to an OS thread; this is what makes spawning
thousands or even millions of goroutines practical, unlike OS threads.

Tags: M:N scheduling, Lightweight concurrency, Go runtime scheduler

## Software Engineering

Because `main()` exiting kills all still-running goroutines immediately
with no cleanup, any goroutine whose work needs to actually complete (not
just "started") must be explicitly waited on — forgetting this is a very
common beginner bug where a goroutine's output never appears because the
program already exited.

Tags: WaitGroup, Program exit timing, Common beginner bug

## Common Mistakes

- Starting a goroutine and assuming it will finish before the program continues or exits — without explicit synchronization (a WaitGroup or channel), there's no such guarantee.
- Assuming goroutines run in a predictable, deterministic order — the Go scheduler decides the actual interleaving, and code that depends on a SPECIFIC order without explicit synchronization has a real bug.

## Exercises

- Trace through what would happen if `main()` in the example below returned IMMEDIATELY after starting the goroutine, with no `wg.Wait()` call — would the goroutine's print statement definitely appear?
- Explain why goroutines are described as far cheaper than OS threads, specifically in terms of their initial stack size.

## go

```go
package main

import (
	"fmt"
	"sync"
)

func sayHello(wg *sync.WaitGroup) {
	defer wg.Done()
	fmt.Println("hello from goroutine")
}

func main() {
	var wg sync.WaitGroup
	wg.Add(1)
	go sayHello(&wg)   // starts sayHello running concurrently, main does NOT wait automatically

	fmt.Println("main continues immediately")
	wg.Wait()   // explicitly wait for the goroutine to finish before main exits
	fmt.Println("goroutine has finished")
}
```
Walkthrough: `go sayHello(&wg)` starts `sayHello` running concurrently and
returns control to `main` immediately — `"main continues immediately"`
can print before OR after `"hello from goroutine"`, since their exact
timing isn't guaranteed. `wg.Wait()` explicitly blocks until `sayHello`
calls `wg.Done()` (via the deferred call), guaranteeing `"goroutine has
finished"` only prints after the goroutine has genuinely completed.
