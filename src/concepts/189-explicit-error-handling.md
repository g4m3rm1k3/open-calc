---
concept: 189-explicit-error-handling
name: Explicit Error Handling (Go)
---

## Definition

Go represents errors as ordinary return values (typically the LAST
return value, of type `error`) rather than exceptions — every fallible
call must be explicitly checked with an `if err != nil` immediately after
the call, making error handling an explicit, visible part of the code
rather than an implicit control-flow jump.

## Problem

Exception-based error handling lets errors propagate silently through
many layers of function calls without any visible indication at each
call site — a function might throw from deep inside a call chain, and
nothing in the intermediate code shows that possibility. Go's explicit
`(result, error)` return pattern forces every call site to consciously
decide what to do with a potential error, right where the call happens.

## Execution

A function returns BOTH a result AND an error value, always
↓
Calling it: the caller receives both values back at once
↓
Checking `if err != nil` immediately follows nearly every fallible call
in idiomatic Go code — explicit, visible, impossible to silently skip
without deliberately ignoring the `err` variable
↓
Errors are ordinary values — they can be wrapped with additional
context, compared, and passed around just like any other value, with no
special language-level exception machinery involved

## Computer Science

This makes error handling part of a function's ORDINARY control flow and
type signature, rather than a separate, implicit mechanism (like
exceptions) that bypasses normal return-value flow — the tradeoff is
verbosity (an `if err != nil` check after nearly every fallible call) in
exchange for making every possible failure point visible directly in the
code.

Tags: Errors as values, Ordinary control flow, Explicit vs implicit failure

## Software Engineering

The repetitive `if err != nil { return err }` pattern is a deliberate,
well-known tradeoff in Go's design — critics call it verbose, but
proponents argue it makes reading unfamiliar code far easier, since every
point where something could fail is directly visible rather than hidden
behind a try/catch that could be anywhere up the call stack.

Tags: Verbosity tradeoff, Readability of failure points, Go design philosophy

## Common Mistakes

- Ignoring a returned error with `_` without a deliberate, justified reason — this silently discards information about a failure that then goes completely unnoticed by the rest of the program.
- Comparing error VALUES with plain `==` when the error was wrapped with additional context — wrapped errors need `errors.Is` or `errors.As` to correctly check against an underlying original error.

## Exercises

- Trace through what a config-reading function would return if the file genuinely didn't exist — what's the value of the result in that case, and why?
- Explain why Go's explicit error checking makes failure points more visible than exception-based handling, using the divide example below.

## go

```go
package main

import (
	"errors"
	"fmt"
)

func divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, errors.New("divide by zero")
	}
	return a / b, nil
}

func main() {
	result, err := divide(10, 2)
	if err != nil {
		fmt.Println("error:", err)
	} else {
		fmt.Println("result:", result)
	}

	result, err = divide(10, 0)
	if err != nil {
		fmt.Println("error:", err)
	} else {
		fmt.Println("result:", result)
	}
}
```
Walkthrough: `divide(10, 2)` returns `(5, nil)` — `err` is `nil`, so the
success branch runs and prints the result. `divide(10, 0)` returns `(0,
errors.New("divide by zero"))` — `err` is non-nil this time, so the error
branch runs instead — both outcomes are handled by the exact same
`if err != nil` pattern immediately following the call.
