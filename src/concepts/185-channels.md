---
concept: 185-channels
name: Channels (Go)
---

## Definition

A channel is a typed conduit for sending and receiving values between
goroutines — the primary way goroutines communicate and synchronize with
each other safely, without needing explicit locks, following Go's
philosophy "share memory by communicating, don't communicate by sharing
memory."

## Problem

Sharing mutable data directly between concurrent goroutines (without any
coordination) risks race conditions — two goroutines reading and writing
the SAME variable at the same time produces unpredictable results.
Channels provide a built-in, safe way to pass data BETWEEN goroutines —
sending and receiving on a channel are themselves synchronized
operations, avoiding the need for manual locking in many common patterns.

## Execution

An unbuffered channel is created, carrying string values
↓
A goroutine SENDS a value on the channel — this BLOCKS until someone
receives it (unbuffered channels are synchronous)
↓
The main goroutine RECEIVES the value — this BLOCKS until a value is
actually sent
↓
The send and receive rendezvous — the value passes safely from one
goroutine to the other, with the runtime handling all necessary
synchronization
↓
This pattern also naturally solves the "wait for a goroutine to finish"
problem (see Goroutines) — receiving from a channel blocks until the
sending goroutine has actually gotten to that point in its execution

## Computer Science

An unbuffered channel send/receive is a synchronization point — the
sending goroutine and receiving goroutine can't proceed past their
respective channel operations until BOTH are ready, which is what makes
channels double as both a data-passing mechanism AND a synchronization
primitive, without needing a separate lock.

Tags: Synchronization primitive, Blocking operations, CSP (communicating sequential processes)

## Software Engineering

Go's concurrency philosophy — "don't communicate by sharing memory; share
memory by communicating" — favors channels over manually-locked shared
variables (mutexes, see Mutexes) for passing data between goroutines,
since channel-based code tends to have a clearer, more traceable data
flow than scattered lock/unlock calls around shared state.

Tags: CSP philosophy, Mutex alternative, Data flow clarity

## Common Mistakes

- Sending on an unbuffered channel with no goroutine ready to receive (and no separate goroutine to receive it) — this blocks forever (a deadlock), since an unbuffered send only completes once a receiver is ready.
- Forgetting to close a channel when a receiver is ranging over it with `for range ch` — a `range` loop over a channel blocks waiting for more values until the channel is explicitly closed, so an unclosed channel a receiver ranges over never lets that loop finish.

## Exercises

- Trace through what would happen if the example below's receive were removed entirely — what happens to the goroutine trying to send on the channel?
- Explain the difference between an unbuffered channel and a buffered one (created with a capacity argument) in terms of when a send actually blocks.

## go

```go
package main

import "fmt"

func main() {
	ch := make(chan string)

	go func() {
		ch <- "hello from goroutine"   // blocks until someone receives
	}()

	msg := <-ch   // blocks until the goroutine actually sends -- this is the synchronization point
	fmt.Println(msg)
}
```
Walkthrough: the goroutine's `ch <- "hello from goroutine"` blocks until
`main`'s `msg := <-ch` is ready to receive it — the two operations
rendezvous, safely passing the string from one goroutine to the other.
Because `main` blocks on the receive, it's GUARANTEED the goroutine has
already sent its value by the time `fmt.Println(msg)` runs, unlike the
unsynchronized goroutine example in the Goroutines concept.
