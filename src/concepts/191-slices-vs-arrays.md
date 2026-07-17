---
concept: 191-slices-vs-arrays
name: Slices vs Arrays (Go)
---

## Definition

In Go, an array has a FIXED size that's part of its type (`[5]int` and
`[10]int` are different types entirely), while a slice is a flexible,
resizable VIEW over an underlying array — most Go code uses slices, not
arrays, specifically because of this flexibility.

## Problem

A fixed-size array can't grow or shrink, and its exact length must be
known at compile time as part of the type itself — this makes arrays
awkward for the common case of "a collection whose size varies at
runtime" (which is most collections in practice). A slice wraps an
underlying array with a flexible length and capacity, and can grow via
`append`, making it the practical, idiomatic choice for nearly all
everyday collection use.

## Execution

A fixed-size array is declared — exactly 3 elements, forever — this
exact SIZE is part of the array's own type
↓
A slice is declared — NO fixed size in its type — backed by an
underlying array, but can grow
↓
Appending to the slice grows it to length 4 — if the underlying array
doesn't have room, Go automatically allocates a NEW, larger underlying
array and copies the data over
↓
Attempting to append directly to a fixed-size array would be a COMPILE
ERROR — `append` only works on slices, never on fixed-size arrays
directly
↓
Passing an array to a function COPIES the entire array (arrays are value
types); passing a slice copies only the small slice HEADER (pointer +
length + capacity), while the underlying data is shared

## Computer Science

A slice is a "fat pointer" (like Rust's slices) — a small struct
containing a pointer to the underlying array, a length, and a capacity —
this is why slices are cheap to pass around (copying just that small
header) while arrays, being full value types, copy their ENTIRE contents
on every assignment or function call.

Tags: Fat pointers, Value types vs reference-like types, Underlying array

## Software Engineering

Idiomatic Go code almost always uses slices, not arrays, for everyday
collections — arrays are mainly reached for in specific cases needing a
truly fixed, compile-time-known size (or as the underlying storage a
slice happens to be built on top of), while slices are the practical
default everywhere else.

Tags: Idiomatic defaults, When to use arrays, Practical collection choice

## Common Mistakes

- Passing a large array by value into a function without realizing the ENTIRE array gets copied — this can be a real performance issue for large arrays; a slice (or a pointer to the array) avoids this copy.
- Assuming `append` always modifies a slice "in place" — if the underlying array needs to grow, `append` returns a NEW slice backed by a NEW underlying array, and forgetting to reassign the result (rather than just calling `append` and discarding it) silently loses the appended data.

## Exercises

- Trace through what happens to a slice's underlying array when `append` is called past its current capacity — does the ORIGINAL underlying array get modified, or does something else happen?
- Explain why two fixed-size arrays of different lengths are considered completely different TYPES in Go, while a slice type has no such size-based distinction.

## go

```go
package main

import "fmt"

func main() {
	arr := [3]int{1, 2, 3}   // fixed-size array -- exactly 3 elements, forever
	fmt.Println(arr, len(arr))

	s := []int{1, 2, 3}   // slice -- flexible length
	fmt.Println(s, len(s))

	s = append(s, 4)   // grows the slice -- must reassign, since append may return a NEW slice
	fmt.Println(s, len(s))

	modifyArray(arr)   // arrays are copied entirely when passed to a function
	fmt.Println("arr after modifyArray:", arr)   // UNCHANGED -- modifyArray only modified its own copy

	modifySlice(s)   // slices share their underlying array -- mutation IS visible to the caller
	fmt.Println("s after modifySlice:", s)   // CHANGED -- the underlying data was shared
}

func modifyArray(a [3]int) {
	a[0] = 999   // modifies only the LOCAL copy
}

func modifySlice(sl []int) {
	sl[0] = 999   // modifies the SHARED underlying array
}
```
Walkthrough: `modifyArray` receives a full COPY of `arr` (arrays are
value types), so its mutation has no effect on the caller's `arr`.
`modifySlice` receives a slice header pointing at the SAME underlying
array as `s`, so its mutation through `sl[0] = 999` IS visible in the
caller's `s` afterward — directly demonstrating the value-copy vs
shared-underlying-data distinction between arrays and slices.
