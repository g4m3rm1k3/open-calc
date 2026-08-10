# Concept: The Halting Problem, and a Practical Step-Budget Safeguard

**What you'll understand by the end:** why no algorithm can, in
general, look at an arbitrary program and correctly decide whether it
will ever finish running — a real, formally proven limit, not just a
hard engineering problem — and the practical, real technique every
production interpreter uses anyway: a hard step budget that forcibly
stops execution once it's run suspiciously long, trading perfect
detection for a real, checkable guarantee.

**Prerequisites:** `program-counter-interpreter-loop.md`.

## Setup

Python 3, no packages needed.

## The Problem

An interpreter running a real, user-authored program with loops has
no real, structural guarantee the program ever finishes — a malformed
loop condition that's always true, or a bug that never reaches the
real exit condition, would otherwise run **forever**, freezing
whatever real, larger application is waiting on it. The tempting fix —
"just detect infinite loops before running them" — runs directly into
a real, proven, unavoidable theoretical wall.

## The Isolated Example

The real danger, first — a malformed program whose loop condition
never goes false:

```python
def build_jump_table(lines):
    while_to_end = {}
    end_to_while = {}
    stack = []
    for i, line in enumerate(lines):
        if line.startswith("WHILE"):
            stack.append(i)
        elif line == "END":
            start = stack.pop()
            while_to_end[start] = i
            end_to_while[i] = start
    return while_to_end, end_to_while


def run(lines, max_steps=100_000):
    while_to_end, end_to_while = build_jump_table(lines)
    variables = {}
    pc = 0
    steps = 0
    while pc < len(lines):
        steps += 1
        if steps > max_steps:
            raise RuntimeError(f"exceeded max_steps ({max_steps}) -- probably an infinite loop")
        line = lines[pc]
        if line.startswith("SET"):
            _, name, expr = line.split(" ", 2)
            variables[name] = eval(expr, {}, variables)
            pc += 1
        elif line.startswith("WHILE"):
            condition = line[len("WHILE"):]
            if eval(condition, {}, variables):
                pc += 1
            else:
                pc = while_to_end[pc] + 1
        elif line == "END":
            pc = end_to_while[pc]
        else:
            pc += 1
    return steps


# A malformed real program: the condition never goes false.
infinite_program = ["SET x 0", "WHILE x<3", "SET x 0", "END"]

try:
    run(infinite_program, max_steps=1000)
except RuntimeError as e:
    print("RuntimeError:", e)
```

**Real output, run this session:**
```
RuntimeError: exceeded max_steps (1000) -- probably an infinite loop
```

**What this proves:** `infinite_program`'s own loop body resets `x`
back to `0` on every real iteration — its `WHILE x<3` condition can
**never** go false, so this program genuinely never halts on its own.
Without `max_steps`, `run` would hang forever; with it, execution
stops at a real, predictable, checkable point (exactly `1000` steps),
raising a clear error instead of freezing.

## Mechanical Walkthrough

- `max_steps` is a plain integer ceiling on how many real instructions
  the interpreter will execute before giving up — checked on every
  single iteration of the interpreter's own main loop, immediately
  after incrementing `steps`.
- Once `steps` exceeds that ceiling, execution stops **immediately**,
  raising a real, specific error rather than continuing — no attempt
  is made to determine *whether* the program would eventually have
  halted on its own; the budget fires purely on elapsed step count.
- This guarantees the interpreter itself always terminates, for
  **any** real input program — a mathematically weaker, but
  completely practical and reliable, guarantee than "correctly detect
  which programs would never halt."
- Choosing the actual `max_steps` value is a real, practical judgment
  call: too low, and legitimately long-but-finite real programs get
  incorrectly cut off; too high, and a genuinely malformed program
  still hangs the application for an uncomfortably long real time
  before the safeguard finally fires.

## CS Lens

This is a real, practical response to the **Halting Problem** — a
formally proven result (Alan Turing, 1936) that no general algorithm
can exist which takes an arbitrary program and its input and correctly
decides, for every possible program, whether it will eventually halt
or run forever. This isn't "too hard to figure out with current
technology" — it's a real, proven mathematical impossibility, the
same category of result as "you cannot trisect an arbitrary angle with
only a compass and straightedge." A step-budget safeguard doesn't
solve the Halting Problem (it can't — nothing can) — it deliberately
sidesteps it by weakening the real question from "will this halt?" to
"has this run more than N steps?", a question that's always
trivially decidable.

Also recognized in: a web request timeout (rather than trying to
detect a hung backend call in general, a server just gives up after a
fixed real duration); a `while` loop's real, practical cousin — a
`for i in range(MAX_ITERATIONS):` loop with an early-exit condition
inside it, which can never iterate forever even if the early-exit
condition itself has a bug; any real sandboxed code-execution
environment (an online coding judge, a spreadsheet formula engine)
enforcing a hard execution-step or wall-clock ceiling on
user-submitted logic.

## SE Lens

The real, practical engineering lesson: perfect detection of a real
problem is sometimes provably impossible, and the correct response
isn't to give up on protecting against it — it's to find a *different*,
achievable guarantee that's good enough for the real, practical need.
"This interpreter always terminates, within a bounded, predictable
number of steps" is a completely real, useful, and provable guarantee,
even though "this interpreter can tell you in advance whether your
program halts" is not. The real, honest cost: a step budget is a blunt
instrument — it cannot distinguish a genuinely malformed infinite loop
from a legitimately long-running, finite real computation that simply
needed more than `max_steps` steps; both get stopped identically.

## Connection

Builds directly on `program-counter-interpreter-loop.md` — the step
budget is a small, real addition to that file's own interpreter loop,
checked once per iteration of the identical `pc`-driven `while` loop.
A real, applied instance in this project's own history: a macro
interpreter's own real `max_steps` guard (defaulting to `100,000`),
protecting the application from a malformed real macro program (a
`WHILE` condition that never resolves to false, a runaway `IF`-driven
jump) hanging the entire GUI — a genuinely practical, checkable
safeguard standing in for the formally undecidable, unsolvable general
question of whether a given program halts.

## Try It Yourself

1. Lower `max_steps` to `10` and rerun `infinite_program` — confirm
   the error fires much sooner, direct, real proof the budget is a
   simple, adjustable ceiling, not a smarter detection mechanism.
2. Write a real, **legitimately** long-running (but finite) program —
   a loop that counts from `0` to `2000` — and run it with
   `max_steps=1000`; observe it gets incorrectly cut off too, a real,
   concrete demonstration of this technique's own honest limitation:
   it cannot distinguish "malformed" from "just needs more steps."
3. Research the real, formal proof sketch behind the Halting Problem
   (the diagonalization argument: assuming a universal halting-checker
   exists, then constructing a program that deliberately does the
   opposite of whatever the checker predicts about itself) — reasoning
   through why that construction produces a genuine logical
   contradiction, not just a hard-to-write program.
