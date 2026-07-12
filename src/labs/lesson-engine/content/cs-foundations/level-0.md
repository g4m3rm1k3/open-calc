---
series: cs-foundations
level: 0
title: What Computers Actually Do
lang: javascript
---

# What Computers Actually Do

Every program you write runs on a physical machine that does exactly one thing: execute instructions one at a time. Not concepts. Not abstractions. Instructions — move this byte, add these two numbers, jump to this address if that register is zero. Everything else — functions, objects, loops, network requests — is constructed from this foundation.

Understanding what a computer actually does, at the level below any programming language, is what separates developers who can reason about why their programs behave the way they do from developers who can only guess. When a program is slow, when memory usage spikes, when an async call returns in an unexpected order — the explanation is always in what the machine is actually doing underneath.

By the end of this lesson you will understand the fetch-decode-execute cycle, what the CPU and memory are doing while your code runs, and why this model explains performance and correctness properties that language-level reasoning cannot.

## The machine: CPU + memory + I/O

```text
A computer has three components that matter for running programs:

  CPU (Central Processing Unit)
    — Executes instructions: arithmetic (add, subtract, multiply), logic (AND, OR, NOT),
      memory access (load from address, store to address), control (jump to address).
    — Has registers: a handful of very fast storage locations (16 on x86-64).
      All computation happens in registers. Memory is where values live between uses.
    — Has a program counter (PC): a register that holds the address of the NEXT instruction.
      The entire execution model is: fetch instruction at PC, decode it, execute it,
      advance PC to next instruction, repeat.

  MEMORY (RAM — Random Access Memory)
    — A giant array of bytes, each with an address (0, 1, 2, ..., up to ~16 billion on 64-bit).
    — The CPU reads from memory (load), writes to memory (store).
    — Much slower than registers: accessing a register takes 1 cycle;
      accessing RAM takes ~100 cycles; accessing SSD takes ~100,000 cycles.
    — Your program lives in memory: the instructions AND the data.

  I/O (Input/Output)
    — Everything outside the CPU + RAM: disk, network, keyboard, screen.
    — I/O operations are orders of magnitude slower than memory.
    — This is why async/await exists: while waiting for I/O, the CPU does other work.
```

## The fetch-decode-execute cycle

```text
The CPU runs this loop continuously, billions of times per second:

  FETCH:    Read the instruction at the address in the Program Counter.
  DECODE:   Determine what the instruction means (which operation, which registers/addresses).
  EXECUTE:  Perform the operation (arithmetic, memory access, jump).
  UPDATE:   Advance the Program Counter to the next instruction.

That is all. Every program — a web server handling millions of requests, a video game
rendering 60 frames per second, a database indexing terabytes of data — is this loop
running over and over, on billions of instructions.

A JavaScript function like:
  function add(a, b) { return a + b }

When compiled and executed, becomes approximately:
  1. Load value at address of `a` into register R1
  2. Load value at address of `b` into register R2
  3. Add R1 and R2, put result in R3
  4. Return: put R3 where the caller can find it, jump back to the caller's address

The CPU does not know about "functions" or "JavaScript" — it knows about addresses,
registers, and the operations that move values between them.
```

**CS lens:** The fetch-decode-execute model was formalised by John von Neumann in 1945 in the design of the EDVAC computer, and is called the **von Neumann architecture**. Its key insight — that instructions and data live in the same memory — is the reason general-purpose computers can run any program: you change the data in memory (the program) and the machine does something different. Every computer you will ever write software for, from a microcontroller to a data centre server, runs this model.

## Why this model explains performance

The fetch-decode-execute cycle explains every performance characteristic that language-level reasoning cannot:

```text
Why arrays are faster than linked lists for iteration:
  Array: elements are contiguous in memory → CPU loads them sequentially → cache hits.
  Linked list: elements scattered in memory → each node access may cause a cache miss.
  A cache miss (accessing RAM instead of CPU cache) costs ~100x more than a cache hit.
  This is a machine-level fact, invisible at the language level.

Why function calls have a cost:
  Calling a function requires: saving the current register state to memory (the stack),
  jumping to the function's address, and restoring registers when done.
  Deep call stacks (deeply recursive code) mean many saves/restores.
  This is why tail-call optimisation matters: it eliminates the save/restore.

Why I/O is slow and why async exists:
  A network read sends electrical signals to another machine and waits for them to return.
  This takes millions of CPU cycles.
  Async: while waiting, the CPU executes other instructions — other parts of your program.
  Sync (blocking): the CPU literally waits (executing a busy-loop or yielding to the OS).
  Async is not magic — it is the CPU doing useful work during the inevitable I/O wait.

Why garbage collection pauses programs:
  GC must scan memory to find unreachable objects.
  During a GC pause, the program's fetch-decode-execute cycle is suspended — no progress.
  The pause is the CPU time spent on the GC scan instead of your program's instructions.
```

**SE lens:** The practical implication of the machine model is: measure before optimising. The CPU executes billions of instructions per second. Most programs are I/O-bound (waiting for network, disk, or database) rather than CPU-bound. Optimising CPU instructions in an I/O-bound program is irrelevant — the bottleneck is the wire, not the arithmetic. Understanding which resource is the bottleneck (CPU cycles, memory bandwidth, I/O latency) requires measuring, not guessing. The machine model tells you which questions to ask.

**Common mistakes:**
- Treating all operations as equally fast — they are not. Register access: 1 cycle. Cache: 4–10 cycles. RAM: ~100 cycles. SSD: ~100,000 cycles. Network: ~10 million cycles. A program that does a database lookup per loop iteration is doing ~10 million cycles of waiting per iteration.
- Assuming the CPU executes code exactly as written — modern CPUs reorder instructions, execute multiple instructions simultaneously, and speculatively execute branches. The observable result is correct (the CPU guarantees this), but the execution order is not the source order.

**Debug tip:** When a program is inexplicably slow, use a profiler — a tool that samples the program counter at regular intervals and shows which instructions are executing most often. "Where is the PC spending most of its time?" is the machine-level question behind every performance investigation. The profiler answers it without guessing.

## Challenge: machine_model

Reason about the machine model to answer these questions.

```challenge
const machineModel = {
  // An array of 1 million integers is stored in memory.
  // Is iterating through it with a for-loop fast or slow? Why?
  arrayIteration: '',     // 'fast' or 'slow' and one-sentence reason

  // A recursive function calls itself 10,000 levels deep.
  // What machine-level resource is being consumed with each call?
  deepRecursion: '',      // name the resource

  // A program reads 1000 records from a database, one at a time, in a loop.
  // What is the bottleneck — CPU cycles or I/O latency?
  databaseLoop: '',       // 'cpu' or 'io'

  // async/await lets a program do other work while waiting for a network response.
  // In machine terms, what is the CPU doing during the 'await'?
  asyncAwait: '',         // one-sentence answer
}
```

```test
const m = machineModel
assert m.arrayIteration.toLowerCase().includes('fast')
assert m.deepRecursion.toLowerCase().includes('stack') || m.deepRecursion.toLowerCase().includes('memory')
assert m.databaseLoop.toLowerCase().includes('io') || m.databaseLoop.toLowerCase().includes('i/o')
assert m.asyncAwait.length > 20
```
