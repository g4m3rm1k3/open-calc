---
concept: 190-select-statement
name: Select Statement (Go)
---

## Definition

The `select` statement lets a goroutine wait on MULTIPLE channel
operations simultaneously, proceeding with whichever one becomes ready
first — Go's mechanism for handling several possible concurrent events
without needing to check them one at a time in sequence.

## Problem

A goroutine that needs to react to whichever of SEVERAL channels produces
a value first can't simply check them one by one in sequence — blocking
on the first channel would prevent ever noticing if the SECOND channel
had a value ready sooner. `select` solves this by watching all the given
channels at once and proceeding with whichever is ready first, exactly
like a switch statement but for concurrent channel readiness instead of a
single value.

## Execution

Two channels are created, both potentially receiving values from
different goroutines
↓
A `select` waits on BOTH channels simultaneously
↓
Whichever channel receives a value FIRST determines which `case` runs —
the OTHER channel's case is simply not taken this time
↓
A `default` case (if present) runs IMMEDIATELY if NEITHER channel has a
value ready yet, making the `select` non-blocking instead of waiting
↓
`select` is often used with a timeout channel to implement "wait for this
channel, but give up after N seconds if nothing arrives"

## Computer Science

`select` performs a kind of runtime multiplexing across channel
readiness — if MULTIPLE cases are simultaneously ready, Go picks ONE of
them pseudo-randomly (not in written order), which is a deliberate design
choice to prevent code from accidentally depending on a specific, fragile
ordering between cases.

Tags: Multiplexing, Non-deterministic case selection, Channel readiness

## Software Engineering

`select` with a `default` case is the idiomatic way to attempt a
non-blocking channel operation ("check if there's a value ready RIGHT
NOW, without waiting") — without `default`, `select` blocks until at
least one of its cases becomes ready, just like a single channel receive
would.

Tags: Non-blocking operations, Timeout patterns, Idiomatic concurrency

## Common Mistakes

- Assuming `select` always picks cases in the order they're written — when multiple cases are simultaneously ready, Go picks one at RANDOM, not top-to-bottom, so code shouldn't rely on a specific case "winning" when several are ready together.
- Forgetting that a `select` with NO `default` case and NO channel ever becoming ready will block forever — this is a common source of goroutine deadlocks when a channel a `select` is waiting on is never actually sent to.

## Exercises

- Trace through what the example below prints, given that the first channel receives a value sooner in this specific timing setup — which case wins first?
- Explain why adding a `default` case changes `select` from a blocking operation into a non-blocking one.

## go

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	ch1 := make(chan string)
	ch2 := make(chan string)

	go func() {
		time.Sleep(10 * time.Millisecond)
		ch1 <- "from ch1"
	}()
	go func() {
		time.Sleep(50 * time.Millisecond)
		ch2 <- "from ch2"
	}()

	for i := 0; i < 2; i++ {
		select {
		case msg1 := <-ch1:
			fmt.Println(msg1)
		case msg2 := <-ch2:
			fmt.Println(msg2)
		}
	}
}
```
Walkthrough: since the first goroutine sleeps for a shorter time (10ms
versus 50ms), `ch1` becomes ready first, so the first loop iteration's
`select` picks the `ch1` case, printing `"from ch1"`; the second
iteration then waits on whichever channel remains, picking up `"from
ch2"` once it arrives. `select` here waits on BOTH channels
simultaneously each iteration, proceeding with whichever is ready.
