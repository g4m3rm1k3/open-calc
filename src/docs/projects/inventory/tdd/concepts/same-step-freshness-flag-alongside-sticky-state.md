# Concept: A Same-Step Freshness Flag Alongside Sticky State

**What you'll understand by the end:** how to track, in the same
single forward pass that resolves an ordinary sticky value, a second,
separate fact — whether *this specific step* is the one that just
(re-)established it, as opposed to the value merely still being in
effect from an earlier step — and why that second fact needs its own
variable that resets every step, not a derivation from the sticky
value alone.

**Prerequisites:** `sticky-state-modal-behavior.md`.

## Setup

Python 3, no packages needed.

## The Problem

`sticky-state-modal-behavior.md` covers reading a value that persists
until something explicitly changes it. That's sufficient when every
consumer only cares about the value's *current* state. Some real
decisions need a second, different question answered at the same
time: not "what is the sticky value right now," but "did *this exact
step* provide fresh evidence for it, or is it merely still active from
some earlier step?" The resolved value alone cannot answer that — by
definition, a sticky value looks identical whether it was just set or
has been sitting unchanged for ten steps.

## The Isolated Example

A sequence of real "commands," some of which explicitly reaffirm a
mode, most of which don't — deciding whether to log a message depends
on the mode being *both* active *and* freshly reaffirmed this exact
step, not merely still active from earlier:

```python
commands = ["SET_URGENT", "ping", "ping", "SET_URGENT", "ping"]

urgent = False
for step, cmd in enumerate(commands):
    urgent_this_step = False  # resets every single step
    if cmd == "SET_URGENT":
        urgent = True
        urgent_this_step = True

    if urgent and urgent_this_step:
        print(f"step {step}: freshly marked urgent")
    elif urgent:
        print(f"step {step}: still urgent (not new)")
    else:
        print(f"step {step}: not urgent")
```

**Real output:**
```
step 0: freshly marked urgent
step 1: still urgent (not new)
step 2: still urgent (not new)
step 3: freshly marked urgent
step 4: still urgent (not new)
```

**What this proves:** `urgent` (the sticky value) is `True` for every
step from 0 onward — it never resets. `urgent_this_step` is `True`
only at steps 0 and 3, the exact two steps that actually said
`"SET_URGENT"` — proving the second, transient flag carries real
information the sticky value alone discards the instant the next step
runs.

## Mechanical Walkthrough

- `urgent` is ordinary sticky state (`sticky-state-modal-behavior.md`)
  — set by `"SET_URGENT"`, never reset, read by every step.
- `urgent_this_step = False` sits **inside** the loop, at the very top
  — this is the entire mechanism. Declaring it inside the loop body
  means it is genuinely reinitialized every single iteration; nothing
  carries it forward the way `urgent` itself is carried forward.
- The same real event (`cmd == "SET_URGENT"`) updates *both*
  variables together, in the same branch — the sticky one to `True`
  permanently (until something sets it `False` again, not shown here),
  the transient one to `True` only for this one pass through the loop.
- Reading `urgent and urgent_this_step` together is what distinguishes
  "just happened" from "still in effect" — reading `urgent` alone
  cannot make that distinction at all.

## Execution Trace

- step=0, cmd="SET_URGENT": urgent_this_step=False (reset)
  cmd matches → urgent=True, urgent_this_step=True
  urgent and urgent_this_step → "freshly marked urgent"

- step=1, cmd="ping": urgent_this_step=False (reset)
  cmd doesn't match → urgent stays True, urgent_this_step stays False
  urgent (True) but not urgent_this_step → "still urgent (not new)"

- step=2, cmd="ping": urgent_this_step=False (reset)
  same as step 1 → "still urgent (not new)"

- step=3, cmd="SET_URGENT": urgent_this_step=False (reset)
  cmd matches → urgent=True (already was), urgent_this_step=True
  urgent and urgent_this_step → "freshly marked urgent"

- step=4, cmd="ping": urgent_this_step=False (reset)
  → "still urgent (not new)"

The reset-every-iteration line is what makes steps 1, 2, and 4 read
`urgent_this_step=False` even though `urgent` itself has been `True`
since step 0 and never changes — without that reset, the transient
flag would just become a second, redundant sticky value instead of
answering a genuinely different question.

## CS Lens

This is the same real shape as a **rising-edge detector** in digital
logic — a circuit that pulses `true` for exactly one clock cycle when
a signal transitions from low to high, not for the entire time the
signal stays high. The sticky value is the signal's current level; the
per-step flag is the edge. Also recognized in: a keyboard's own "key
just pressed" event versus "key currently held down" (a game loop
needs both, for different reasons — firing once per press versus
moving continuously while held); a network protocol's "connection
just established" versus "connection currently open" states; a UI
framework's `useEffect`-style "this value just changed" dependency
tracking, distinct from simply reading the value's current state.

## SE Lens

The alternative not chosen: derive "was this just set" by comparing
the sticky value's current state to what it was on the *previous*
step, stored in a second sticky variable of its own (`previous_urgent`,
checked each step). That works too, but requires carrying an entire
extra copy of the sticky state forward across iterations just to
detect a change — real, unnecessary bookkeeping when the information
("did *this* step's own input provide fresh evidence") is already
sitting right there in the current step's own data, and only needs a
variable that does *not* persist to capture it. The reset-every-
iteration flag is simpler specifically because it throws its own
previous value away on purpose, rather than remembering it only to
compare against.

## Connection

Builds on `sticky-state-modal-behavior.md` — the value being checked
for freshness is exactly that same sticky/modal state. Distinct from
`attributing-resolved-state-to-its-origin-event.md`, which answers a
related but different question ("which *past* step set the currently-
resolved value," found via an explicit backward search after the fact)
— this concept answers "did *this* step set it," known immediately,
in the same forward pass, with no search required at all.

## Try It Yourself

1. Add a `"CLEAR_URGENT"` command that sets `urgent = False` (but does
   *not* set `urgent_this_step`), and a step sequence that uses it.
   Confirm a step right after `"CLEAR_URGENT"` correctly prints "not
   urgent," and that `urgent_this_step` never accidentally stays
   `True` across steps.
2. Track a *second*, independent sticky fact the same way (e.g.
   `quiet`/`quiet_this_step`, toggled by `"SET_QUIET"`), and confirm
   a step where *both* `"SET_URGENT"` and `"SET_QUIET"` are somehow
   true at once still resolves each flag completely independently of
   the other.
3. Remove the `urgent_this_step = False` reset line (move its
   declaration outside the loop instead, initialized once). Run the
   same `commands` sequence and observe, for real, that
   `urgent_this_step` now stays `True` forever after step 0 — the
   exact real bug this technique exists to prevent — and explain in a
   comment why the moved declaration causes it.
