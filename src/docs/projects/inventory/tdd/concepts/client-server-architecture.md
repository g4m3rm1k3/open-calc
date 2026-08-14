# Concept: Client-Server Architecture

**What you'll understand by the end:** why long-running server programs are structured as "wait, then react" rather than "run once and exit," and what makes something a client versus a server.

**Prerequisites:** none.

## Setup

Python 3, standard library only (`queue`, `threading`) — no installation needed.

## The Problem

Two programs that need to talk to each other face a basic design question: who initiates contact, and how does the other side know something happened without either wasting effort constantly checking? A **server** answers this by starting, then waiting — indefinitely, in a loop — for another program to ask it for something. It doesn't run once and exit like an ordinary script; it stays alive between requests. A **client** is the program that does the asking. They are two separate, independently-running programs — in the real world usually on two different machines, though the same mechanism works identically when both happen to run on one.

## The Isolated Example

```python
import queue
import threading

mailbox = queue.Queue()

def server():
    while True:
        request = mailbox.get()  # waits here until something arrives
        if request == "STOP":
            break
        print(f"server: got {request!r}, answering")

server_thread = threading.Thread(target=server)
server_thread.start()

print("client: sending a request")
mailbox.put("what time is it?")
mailbox.put("STOP")
server_thread.join()
```

**Run it:**
```
python client_server_demo.py
```

**Real output:**
```
client: sending a request
server: got 'what time is it?', answering
```

**What this proves:** the `server` function's `while True` loop is not "running code once" — it's parked at `mailbox.get()`, doing nothing, until the client (the main program) calls `mailbox.put(...)`. The server never decided to act on its own; it reacted the instant a request appeared, then went back to waiting. This is the entire shape of client-server, with the network itself swapped out for a plain in-memory queue standing in for it.

## Mechanical Walkthrough

- `mailbox = queue.Queue()` — a thread-safe queue; multiple threads can safely put/get from it without corrupting its internal state.
- `server()` runs in its own thread (`threading.Thread(target=server)`), so it can block on `mailbox.get()` without freezing the rest of the program — the main thread keeps running below it.
- `mailbox.get()` blocks: it does not return until something is in the queue. This is the "wait" half of "wait, then react."
- `request == "STOP"` is a simple sentinel value telling the server to exit its loop cleanly, so the example terminates instead of waiting forever.
- `mailbox.put(...)`, called from the main thread, is the "client" side — the thing initiating contact.
- `server_thread.join()` makes the main program wait for the server thread to actually finish before the script exits, so the printed output is deterministic.

## Execution Trace

The `while True` loop runs across two threads at once — traced as the
real sequence of events, not just what each thread does in isolation:

- Main thread: starts server_thread
- Server thread: enters while True, calls mailbox.get() → blocks (queue empty)
- Main thread: prints "client: sending a request"
- Main thread: mailbox.put("what time is it?")
- Server thread: mailbox.get() unblocks, returns "what time is it?"
- Server thread: request != "STOP" → prints "server: got 'what time is it?', answering"
- Server thread: loop repeats, calls mailbox.get() again → blocks (queue empty again)
- Main thread: mailbox.put("STOP")
- Server thread: mailbox.get() unblocks, returns "STOP"
- Server thread: request == "STOP" → break, loop ends, thread finishes
- Main thread: server_thread.join() returns (server thread already finished)

The loop iterates exactly twice — once per real `put()` call — and
spends nearly all of its time *blocked inside* `mailbox.get()`, not
spinning or polling; the "loop" is really "wait, react, wait again,"
which is the entire point this concept exists to make concrete.

## CS Lens

This is the general shape every real client-server system reduces to: one side blocks waiting for input, the other side initiates. Swap the `Queue` for a real network socket and you have the shape underneath HTTP, database connections, and message queues alike.

Also recognized in: every website you've ever visited, every mobile app talking to a backend, database servers (MySQL/Postgres wait for queries the same way), and a real CNC machine controller's own control loop, which spends nearly all its life waiting for the next command or sensor tick, exactly like `server()` above.

## SE Lens

The alternative — no persistent server, a fresh program run once per request (the historical CGI model) — is simpler per-request but pays a real, repeated cost: every single request re-pays the startup cost of loading the program from scratch. A long-lived server pays that cost once, then answers many requests cheaply. The tradeoff: a long-lived process can accumulate state (memory leaks, stale data) across requests in a way a fresh-per-request script structurally cannot — a real, ongoing maintenance burden the "waits forever" model takes on in exchange for speed.

## Connection

This is the foundation every networked application concept builds on — HTTP request/response, routing, and asynchronous request handling all assume this shape already exists underneath them.

## Try It Yourself

1. Change the client to call `mailbox.put(...)` three times with different messages before `"STOP"`. Predict the output order before running it, then check.
2. Remove the `server_thread.join()` call. Run the script several times. Does the output ever look different or incomplete? What does that tell you about why `join()` was there?
3. Replace `queue.Queue()` with a plain Python `list` and reimplement `server()`/the client using list `.append()`/`.pop(0)` instead of `.put()`/`.get()`, with no thread synchronization. Run it several times, ideally with the server loop sleeping briefly between checks. Does anything ever go wrong? This is what "thread-safe" in `queue.Queue()`'s description was protecting you from.
