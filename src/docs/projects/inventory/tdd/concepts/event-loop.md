# Concept: Event Loop

**What you'll understand by the end:** the "wait, then react" loop shape underneath every long-running server, GUI, or game — as opposed to a script that runs once, top to bottom, and exits.

**Prerequisites:** `client-server-architecture.md`.

## Setup

Python 3, standard library only (`queue`).

## The Problem

A program that must keep responding to new input indefinitely (a server, a GUI, a game) can't simply run start-to-finish like an ordinary script — there's no fixed "finish." It needs a way to sit idle, using no resources, until there's real work to do, then handle it and go back to waiting.

## The Isolated Example

```python
import queue

events = queue.Queue()
events.put("tick")
events.put("tick")
events.put("stop")

def event_loop():
    while True:
        event = events.get()
        if event == "stop":
            print("loop: stopping")
            break
        print(f"loop: reacting to {event!r}")

event_loop()
```

**Real output:**
```
loop: reacting to 'tick'
loop: reacting to 'tick'
loop: stopping
```

**What this proves:** `event_loop`'s body never decides *what* happens next on its own — it pulls the next event and reacts, however many times, until told to stop. A real server (see `client-server-architecture.md`) runs this identical shape against a network socket instead of a `Queue`, and real events (incoming HTTP requests) instead of `"tick"`/`"stop"` strings.

## Mechanical Walkthrough

- `events.get()` **blocks** — it does not return until something is in the queue, rather than immediately returning "nothing yet."
- The `while True` loop's only real work is deciding how to react once something *does* arrive; the waiting itself is not implemented as repeatedly checking — it's the queue's own blocking behavior doing the waiting.
- `if event == "stop": break` is how this particular loop terminates cleanly, so the example finishes instead of hanging forever — a real server's loop typically has no such exit at all, by design.

## Execution Trace

The queue is pre-loaded with 3 items (`"tick"`, `"tick"`, `"stop"`)
before `event_loop()` ever runs — traced against the real output above:

```
Iteration 1: events.get() → "tick"  (queue: ["tick", "stop"] remaining)
  "tick" == "stop"? No → print "loop: reacting to 'tick'"
Iteration 2: events.get() → "tick"  (queue: ["stop"] remaining)
  "tick" == "stop"? No → print "loop: reacting to 'tick'"
Iteration 3: events.get() → "stop"  (queue: [] remaining)
  "stop" == "stop"? Yes → print "loop: stopping"; break
```

The loop ran exactly 3 times — once per item that was ever put in the
queue — and every single iteration's first action was the same blocking
`events.get()` call; nothing distinguishes "waiting for the next event"
from "reacting to one" except which event happened to come back.

## CS Lens

An event loop is a loop whose entire body is "wait for something to happen, then react" — as opposed to a normal script's "run start to finish, then exit." The waiting is a **blocking wait**, not active polling: the program consumes no CPU while idle, and the operating system (or, here, the `Queue` implementation) wakes it only when there's real work.

Also recognized in: every GUI application (waiting for clicks), every game's main loop (waiting for the next frame/input), Node.js's entire runtime model, JavaScript's browser event loop (see `javascript-promises-async.md`), and a real CNC controller's firmware loop, which spends nearly all its life waiting for the next line of G-code or the next sensor tick.

## SE Lens

The alternative — polling in a tight loop, repeatedly asking "did anything happen yet?" — wastes CPU constantly, even when nothing is happening, and introduces a real tradeoff between responsiveness (poll often) and wasted work (poll less often). A real blocking wait, as shown here, costs nothing while idle and reacts the instant something arrives, with no tuning needed.

## Connection

Builds on `client-server-architecture.md` — a server *is* an event loop whose events happen to be network requests instead of queue entries.

## Try It Yourself

1. Replace `events.get()` with a version that polls instead of blocking: loop calling `events.get_nowait()` inside a `try`/`except queue.Empty`, sleeping briefly between attempts (`time.sleep(0.01)`). Confirm it still works, then reason about why the blocking version is strictly better here.
2. Put events into the queue from a second thread, concurrently with the loop running in the first, using `threading.Thread`. Confirm the loop still reacts to each one correctly, arriving from a different thread than the one that's waiting.
3. Add a `"pause"` event that, when received, calls `events.get()` again immediately without printing anything — a no-op event. What does this suggest about how a real event loop can support many different event types without its core loop structure changing at all?
