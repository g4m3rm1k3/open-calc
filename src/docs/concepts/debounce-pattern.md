# Concept: Debouncing — Waiting for Input to Settle

**What you'll understand by the end:** how to react to rapidly-changing
input (typing, resizing, scrolling) without doing real work on every
single change — only once the changes actually stop for a beat.

**Prerequisites:** `retry-timeout-and-backoff.md` (this project's own
prior real use of `setTimeout`).

## Setup

Any JavaScript runtime. No install needed.

## The Problem

Some real work (a network request, an expensive recomputation) is
triggered by input that can change many times in a fraction of a second —
every keystroke while typing is a real, distinct change. Doing that real
work on every single change wastes effort on every intermediate state
nobody actually cares about, and can genuinely overwhelm a backend with
requests for program text that was never going to be its final form
anyway (the user is still typing).

## The Concept, Isolated

```javascript
function makeDebounced(fn, delayMs) {
  let timer;
  return (value) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(value), delayMs);
  };
}

const debouncedLog = makeDebounced((v) => console.log("settled on:", v), 300);

debouncedLog("a");
debouncedLog("ab");
debouncedLog("abc");
console.log("three calls made instantly, nothing logged yet");
```

**Real output, run this session:**
```
three calls made instantly, nothing logged yet
settled on: abc
```

**What this proves:** three real calls happened, back to back, with no
delay between them — but `fn` only ever ran *once*, with only the
*last* value (`"abc"`). Each call cancelled (`clearTimeout`) whatever
timer the previous call had scheduled before scheduling its own — only
the final call's timer ever survived long enough to actually fire.

## Mechanical Walkthrough

- `let timer;` — **(c) already basic** — a variable captured by the
  closure below, holding whatever the most recently scheduled timer's id
  currently is.
- `clearTimeout(timer)` — **(a) first appearance** — cancels a
  previously-scheduled `setTimeout` before it fires, using the id
  `setTimeout` itself returned; calling it on an already-fired (or
  never-set) timer is harmless, not an error.
- `timer = setTimeout(() => fn(value), delayMs)` — **(b) reappearing**
  `setTimeout`, per `retry-timeout-and-backoff.md`'s own real use —
  scheduling `fn`, not calling it immediately.
- The returned function itself (`(value) => { ... }`) — **(b) reappearing**
  — a closure, capturing `timer` across every call, the same "state that
  survives between separate calls" idea any closure provides.

## CS Lens

This is **rate-limiting reactive work**, the same broader family
`retry-timeout-and-backoff.md`'s own backoff belongs to (both delay real
work deliberately, for different reasons — backoff to avoid overwhelming
a *struggling* system, debounce to avoid reacting to input that hasn't
*settled* yet). Debouncing specifically: only the most recent event in a
rapid burst matters; every earlier one in that same burst is superseded
before it's ever acted on.

Also recognized in: a search-box's "wait until typing pauses before
querying" behavior (nearly universal in real UIs), a window `resize`
handler that waits for resizing to stop before recomputing an expensive
layout, and — a real, distinct sibling worth naming — **throttling**
(guaranteeing work runs at most once per fixed interval *regardless* of
whether input ever settles, rather than debounce's "wait for silence,"
useful when some reaction is needed even during continuous activity).

## SE Lens

The real alternative — reacting to every single keystroke immediately —
is not just wasteful, it can be actively harmful: a backend fielding one
request per keystroke for a program that changes on every character
typed does real, unnecessary work for every intermediate, half-typed
state, none of which the user ever meant as a final answer. The real
cost of debouncing is a fixed, deliberate delay (900ms, in this project's
own real use) between "the user is done" and "the system reacts" — a
tradeoff worth making explicitly, not an accident of forgetting to wire
up a request on every change.

## Connection

Builds on `retry-timeout-and-backoff.md` (the same `setTimeout` primitive,
a different real problem). Directly relevant to this project's own
`App.tsx`: the `code` tab's debounced re-fetch, mirroring
`cnc-sim/cnc/CNCSim.jsx`'s own real `setTimeout(reload, 900)` auto-reparse
behavior for its identical textarea.

## Try It Yourself

1. Change `delayMs` to `0` and rerun — confirm `fn` still only fires
   once with the last value, since even a same-tick `clearTimeout` still
   cancels a same-tick pending timer, proving the *cancellation*, not the
   delay itself, is what collapses the three calls into one.
2. Add a fourth call, `debouncedLog("abcd")`, after a real `300ms`+ pause
   (wrap it in its own `setTimeout`) — confirm it produces a *second*,
   separate `"settled on: abcd"` log, proving debounce collapses bursts,
   not everything ever call forever.
3. Implement `makeThrottled` (the sibling named in this file's CS Lens) —
   a version that lets `fn` run at most once every `delayMs`, even during
   continuous, unbroken activity — and reason about a real scenario where
   throttle is the right choice and debounce would be wrong (e.g., a
   progress indicator that must keep updating during a long, continuous
   drag, not wait for the drag to stop).
