---
series: debugging-fundamentals
level: 2
title: Using the Debugger
lang: javascript
---

# Using the Debugger

`console.log` is a debugging tool. It is not the debugging tool. Inserting print statements requires modifying code, re-running the program, and reading output that does not show variable state at every point in time — only at the points you thought to instrument. The interactive debugger removes all three limitations: you pause execution at any point, inspect all variables in scope, and step through code one line at a time without touching source files.

Developers who use only `console.log` are doing debugging at a disadvantage. The interactive debugger is how professional developers investigate complex bugs efficiently. By the end of this lesson you will know how to set breakpoints, step through code, inspect scope, and use the debugger's call stack view to trace through multi-function bugs.

## Breakpoints: pausing execution at a specific line

A breakpoint is an instruction to the debugger: "pause execution when the program reaches this line, and give me control."

```text
How to set a breakpoint:
  Browser DevTools:   Open DevTools → Sources tab → click the line number in any JS file.
                      A blue marker appears on the line. When the program reaches it, it pauses.
  VS Code:            Click to the left of the line number in any JS file.
                      A red dot appears. Run with F5 (Debug mode). Pauses when reached.
  Node.js REPL:       node --inspect-brk yourfile.js → open chrome://inspect in Chrome.
  Code (any):         Write `debugger` anywhere in JS. The runtime pauses there when DevTools is open.

When execution pauses:
  — The line with the breakpoint is HIGHLIGHTED (it has NOT yet executed — it is about to).
  — All variables in scope are visible in the "Variables" or "Scope" panel.
  — The call stack is visible: every active stack frame, top to bottom.
  — You can hover over any variable in the source to see its current value.
  — You have control: you can step forward, step into functions, step out, or continue.
```

## Stepping: moving through execution one step at a time

After pausing at a breakpoint, you control execution with four operations:

```text
STEP OVER (F10 in VS Code / Step Over button):
  Execute the current line and pause at the next line.
  If the current line is a function call, execute the ENTIRE function and pause after.
  Use this to move through code quickly when you do not need to enter a function.

STEP INTO (F11 / Step Into):
  If the current line is a function call, ENTER that function and pause at its first line.
  Use this when you need to inspect what happens inside a function.

STEP OUT (Shift+F11 / Step Out):
  Execute the rest of the current function and pause at the line that called it.
  Use this when you have seen enough of a function and want to return to the caller.

CONTINUE (F5 / Continue / Resume):
  Execute until the next breakpoint (or end of program).
  Use this to jump between multiple breakpoints.
```

```javascript
// Example: debugging this function with a breakpoint on line 2 of sumPositive:
function sumPositive(numbers) {
  let total = 0              // ← breakpoint here. Paused. total is visible: 0.
  for (const n of numbers) {
    if (n > 0) total += n   // Step Over to here, then hover n to see its value.
  }
  return total
}

sumPositive([-3, 5, -1, 8])
```

```text
Stepping through sumPositive([-3, 5, -1, 8]):

  PAUSE at: let total = 0          → Scope: total = undefined (not yet assigned)
  STEP OVER → for (const n of...) → Scope: total = 0
  STEP OVER → if (n > 0)          → Scope: total = 0, n = -3
  STEP OVER → back to for(...)    → Scope: total = 0 (n=-3 was negative, skipped)
  STEP OVER → if (n > 0)          → Scope: total = 0, n = 5
  STEP OVER → total += n          → Scope: total = 0, n = 5 (about to execute)
  STEP OVER → back to for(...)    → Scope: total = 5  (total updated)
  ...continue stepping...
  STEP OVER → return total        → Scope: total = 13

At every step, you can SEE the actual value of every variable.
No guessing. No console.log. The program tells you exactly what it is doing.
```

**CS lens:** A debugger works by inserting **hardware breakpoints** or **software breakpoints** into the running program. Software breakpoints replace the target instruction with a special "interrupt" instruction (INT3 on x86). When the CPU executes INT3, it transfers control to the OS, which transfers control to the debugger process. The debugger then presents the CPU registers and memory to you as "variable values." Hardware breakpoints use the CPU's debug registers (DR0–DR3 on x86) to watch specific memory addresses without modifying the code. Both mechanisms pause the CPU, not just the program — the machine itself stops at the exact instruction and waits.

## The scope panel: seeing all variables at once

When paused, the debugger shows all variables in scope, organised by scope level:

```text
SCOPE PANEL (example while paused inside sumPositive):

  ▼ Local
      n:       5
      total:   0
      numbers: Array(4) [-3, 5, -1, 8]
  ▼ Closure
      (any variables captured from enclosing scopes)
  ▼ Global
      window (or globalThis)

WHAT THIS TELLS YOU:
  n is currently 5 — this is the value from the current loop iteration.
  total is 0 — the previous iteration (n=-3) did not update total. Why?
  Hover over `if (n > 0)` to check: -3 > 0 is false. Correct — the if body was skipped.

The scope panel makes "what is the value of X right now?" trivially answerable.
You do not need to add a console.log and rerun.
```

## Conditional breakpoints: pausing only when interesting

A breakpoint inside a loop pauses on EVERY iteration — often only the last iteration (or a specific value of n) is interesting. Conditional breakpoints pause only when a condition is true.

```text
Setting a conditional breakpoint:
  Right-click (or Ctrl+click) the breakpoint dot → "Edit Breakpoint"
  → Enter a condition: n === 8

Effect: execution only pauses when n === 8 (the fourth iteration).
The first three iterations run at full speed.
Use this to skip to the interesting case in a loop of 10,000 iterations.
```

**SE lens:** The most common argument against using the debugger is "I can just add console.log." This is true for simple, single-function bugs. It breaks down for: (1) complex bugs in deeply nested call chains, (2) bugs in third-party code (you cannot add logs), (3) bugs in asynchronous code where logs are interleaved confusingly, (4) loops with 10,000 iterations where only one is wrong. The debugger handles all four. The cost of learning to use it (one hour) is paid back by the first complex bug it helps you find in five minutes instead of four hours.

**Common mistakes:**
- Confusing "paused at line X" with "line X has executed" — the highlighted line is ABOUT TO execute, not yet executed. The variables in scope reflect the state BEFORE that line runs.
- Not checking the scope panel — looking at the source code for variable values when the scope panel shows you the actual runtime values. Trust the scope panel over your reading of the code.
- Forgetting to remove breakpoints — a breakpoint in production code (via a `debugger` statement accidentally committed) will pause the program for any user with DevTools open. Always remove `debugger` statements before committing.

**Debug tip:** When a bug only appears "in production" or "only sometimes" (a timing-dependent or data-dependent bug), conditional breakpoints are more useful than unconditional ones. Set a breakpoint with the condition `variableName === suspectedBadValue`. The debugger will pause only when the specific bad case occurs, letting you see the exact state without interruption.

## Challenge: predict_debugger_state

Without running the code, predict what the debugger shows when execution pauses at the marked line.

```challenge
function filterAndDouble(numbers, threshold) {
  const result = []
  for (let i = 0; i < numbers.length; i++) {
    const current = numbers[i]
    if (current > threshold) {
      const doubled = current * 2
      result.push(doubled)    // ← BREAKPOINT HERE (paused, not yet executed)
    }
  }
  return result
}

const output = filterAndDouble([1, 7, 3, 9, 2], 5)

// Predict the debugger state the FIRST TIME the breakpoint is hit:
const debuggerState = {
  i:         0,   // fill in the actual value
  current:   0,
  doubled:   0,
  threshold: 0,
  result:    [],    // what is in result at this moment?
  numbers:   [],
}
```

```test
const d = debuggerState
assert d.i === 1
assert d.current === 7
assert d.doubled === 14
assert d.threshold === 5
assert Array.isArray(d.result) && d.result.length === 0
assert Array.isArray(d.numbers) && d.numbers.length === 5
```
