---
concept: 038-what-is-a-program
name: What is a Program?
---

## Definition

A program is a sequence of instructions, written in a language a computer (or a
compiler/interpreter translating for it) can act on, describing exactly what
steps to take and in what order.

## Problem

A computer does nothing on its own — it has to be told, precisely and
unambiguously, every step to take. A program is the complete, explicit set of
those steps, translated into a form the machine can actually carry out.

## Execution

Source code is written in a human-readable language
↓
A compiler or interpreter translates it into something the machine can execute —
machine code directly, bytecode run by a virtual machine, or read and executed
line by line
↓
The operating system loads the resulting instructions into memory and hands
control to the first one
↓
The processor executes instructions one at a time — with control flow able to
jump between them — until the program ends

## Computer Science

Every program, however it's built, boils down to the same small set of
primitive operations at the hardware level: move data, do arithmetic, compare
values, and jump to a different instruction based on that comparison. Every
higher-level construct covered elsewhere in this library — loops, functions,
objects — is ultimately built from just those.

Tags: Instruction sets, Machine code, Abstraction layers

## Software Engineering

The language and tools a program is written in — compiled vs. interpreted,
statically vs. dynamically typed — change how errors are caught and how fast the
code runs, but they don't change what a program fundamentally is: a precise
sequence of instructions. Every concept in this library is really just a
different way of organizing or expressing that sequence.

Tags: Compiled vs interpreted, Toolchains, Language design

## Common Mistakes

- Assuming a program "does what I meant" instead of "does exactly what I wrote" — the computer only ever executes the literal instructions given, never the intent behind them.
- Confusing the program (the instructions) with the process (the instructions actually running) — the same program can be started as many separate, simultaneously running processes.

## Exercises

- In each example below, change the message and re-run — confirm the instructions themselves are what changed, not some hidden behavior.
- Predict, before running: does the JavaScript example run top-to-bottom in the order written? Confirm by adding a third line before the existing two.

## javascript

```javascript
console.log('Instructions execute in order')
console.log('This line runs second')
```
Walkthrough: two instructions, executed top to bottom — nothing more complex is
needed to already be a complete, real program: a sequence of steps, carried out
in order.

## python

```python
print('Instructions execute in order')
print('This line runs second')
```
Walkthrough: same two-instruction program, translated into Python's syntax — the
underlying idea, a sequence executed in order, doesn't change between languages.

## java

```java
System.out.println("Instructions execute in order");
System.out.println("This line runs second");
```
Walkthrough: Java requires more surrounding structure to compile at all (a
class, in real Java files) but the actual program — two instructions run in
sequence — is identical in substance to the other examples.

## cpp

```cpp
std::cout << "Instructions execute in order" << std::endl;
std::cout << "This line runs second" << std::endl;
```
Walkthrough: same two-instruction sequence — `std::cout <<` is C++'s way of
writing output, chaining values into the stream, but the program's actual
substance, two ordered instructions, is unchanged.

## rust

```rust
println!("Instructions execute in order");
println!("This line runs second");
```
Walkthrough: `println!` is a macro, marked by the `!`, not a plain function
call, but it plays the exact same role as `console.log`, `print`, or
`System.out.println` — two instructions, executed top to bottom.
