# Lesson 3b: Routing an Event to the Right Python Callback

**What you will build:** Structured, JSON-carrying messages sent over
the persistent connection from Lesson 3a, and a registry that routes
each incoming event to a specific registered Python function — not a
plain-text echo anymore, a real "this specific thing happened, run
this specific code" round trip. The transferable problem: a real UI
event isn't just "a message arrived" — it's "*this* button was
clicked," and something has to decide which piece of Python code that
maps to, the same way `@app.route` already decided which function
handles which URL, back in Lesson 0a.

**What you need to know first:** Lesson 3a — the persistent
`asyncio.start_server`/`open_connection` connection, and why the
`while True:` loop is what keeps it alive across multiple messages.
Also Lesson 1b's CS Lens, which already named `@app.route` as a
**dispatch table** — this lesson builds a second one, for events
instead of URLs.

**Pipeline:** Still standing outside the main
`Component → render() → HTML string → Flask response → Browser`
pipeline, same as 3a — this is groundwork for Stage 6 (events flowing
back) and Stage 7 (the Transport abstraction), not yet wired into
`app.py`.

---

## Concept Unit: Structured Messages with JSON

### The Problem

Lesson 3a's connection only ever exchanged plain text lines — `"hello"`
in, `"echo: hello"` out. A real UI event needs more shape than that:
which kind of event it is, maybe which element it happened on, maybe
extra data — a single bare string can't cleanly carry that.

### Introduce the Concept in Isolation

```python
import json

event = {"type": "click", "target": "increment-button"}
encoded = json.dumps(event)
print(encoded)
print(type(encoded))

decoded = json.loads(encoded)
print(decoded)
print(type(decoded))
print(decoded["target"])
```

Run:

```
{"type": "click", "target": "increment-button"}
<class 'str'>
{'type': 'click', 'target': 'increment-button'}
<class 'dict'>
increment-button
```

A Python dict became a plain string (`json.dumps`) — exactly the kind
of thing that can travel over the text-based connection from Lesson
3a — and that string turned back into an equivalent dict (`json.loads`)
on the other end, with real key access working normally. This is
called **serializing** (dict → string) and **deserializing** (string →
dict) with JSON.

### Discard

`u1_l3b.py` is deleted.

---

## Concept Unit: An Event Registry — Dispatching to the Right Callback

### The Problem

Once a structured event like `{"type": "increment"}` arrives, something
has to decide *which* Python function runs. We don't want a growing
`if event["type"] == "increment": ... elif event["type"] == "reset":
...` chain — the same problem `@app.route` already solved for URLs,
back in Lesson 0a.

### Introduce the Concept in Isolation

```python
handlers = {}

def on(event_name):
    def register(func):
        handlers[event_name] = func
        return func
    return register

@on("increment-button")
def handle_increment():
    print("incrementing!")

@on("reset-button")
def handle_reset():
    print("resetting!")

incoming_event = "increment-button"
handlers[incoming_event]()
```

Run:

```
incrementing!
```

`@on("increment-button")` registers `handle_increment` into the
`handlers` dict, under that exact key — the same decorator-based
registration pattern `@app.route` used back in Lesson 0a, applied here
to event names instead of URL paths. Looking up `handlers[incoming_event]`
and calling the result routes an arbitrary incoming string straight to
the correct function, with no `if`/`elif` chain anywhere.

### Discard

`u2_l3b.py` is deleted. This is the last throwaway lab — the real demo
below combines JSON messages, the persistent connection from 3a, and
this event registry.

### Project Change

- **Reference Source:** No reference counterpart — from scratch.
- **Files affected:** two new standalone files, `l3b_server.py` and
  `l3b_client.py` — kept separate from `app.py`, same as Lesson 3a.
- **Change type:** add
- **Location:** n/a — new files
- **Dependencies:** none beyond the standard library.

### The New Code — type it yourself

The handler registry and the event dispatch, added to a copy of
Lesson 3a's server:

```python
handlers = {}

def on(event_name):
    def register(func):
        handlers[event_name] = func
        return func
    return register

@on("increment")
def handle_increment():
    return {"status": "ok", "message": "count incremented"}

@on("reset")
def handle_reset():
    return {"status": "ok", "message": "count reset"}
```

### The Updated Project

```python
import asyncio
import json

handlers = {}                                              # ← new

def on(event_name):                                          # ← new
    def register(func):                                        # ← new
        handlers[event_name] = func                              # ← new
        return func                                              # ← new
    return register                                              # ← new

@on("increment")                                             # ← new
def handle_increment():                                       # ← new
    return {"status": "ok", "message": "count incremented"}      # ← new

@on("reset")                                                  # ← new
def handle_reset():                                            # ← new
    return {"status": "ok", "message": "count reset"}            # ← new

async def handle_client(reader, writer):
    while True:
        data = await reader.readline()
        if not data:
            break
        event = json.loads(data.decode())                          # ← changed
        print(f"received event: {event}")                            # ← changed
        handler = handlers[event["type"]]                              # ← new
        result = handler()                                              # ← new
        writer.write((json.dumps(result) + "\n").encode())                # ← changed
        await writer.drain()
    writer.close()

async def main():
    server = await asyncio.start_server(handle_client, "127.0.0.1", 8890)
    async with server:
        await server.serve_forever()

asyncio.run(main())
```

And the matching client, sending structured events instead of plain
text:

```python
import asyncio
import json

async def main():
    reader, writer = await asyncio.open_connection("127.0.0.1", 8890)

    for event_type in ["increment", "increment", "reset"]:
        message = json.dumps({"type": event_type})
        writer.write((message + "\n").encode())
        await writer.drain()
        response = await reader.readline()
        print(json.loads(response.decode()))

    writer.close()
    await writer.wait_closed()

asyncio.run(main())
```

`handle_client`'s loop now parses each incoming line as JSON, looks up
the matching handler by `event["type"]`, calls it, and sends its
return value back — also as JSON — instead of just echoing raw text.

### Mechanical Walkthrough

- `handlers = {}` / `def on(event_name): ...` — **(b) hard concept
  reappearing.** The exact registry-decorator pattern just proven,
  reused verbatim.
- `event = json.loads(data.decode())` — **(b) hard concept
  reappearing** for `json.loads`. `data.decode()` turns the raw bytes
  `readline()` returned into a plain string first — the same
  `.decode()` already used in Lesson 3a, just now the result is handed
  to `json.loads` instead of being used directly.
- `handler = handlers[event["type"]]` — **(c) already basic** as a
  dict lookup, applying the registry pattern for real: `event["type"]`
  (a string like `"increment"`) is used as the key.
- `result = handler()` — **(c) already basic.** Calling whatever
  function `handlers` returned — the same "call the looked-up
  function" step proven in the lab.
- `writer.write((json.dumps(result) + "\n").encode())` — **(b) hard
  concept reappearing** for `json.dumps`; the response is now a real
  structured value (a dict with `status` and `message`), not a plain
  echoed string.

### CS Lens

An incoming label (`event["type"]`) looked up in a table to find the
code that should handle it is, again, a **dispatch table** — the exact
pattern Lesson 1b's CS Lens already named for `@app.route`, now
carried across an entirely different transport (a live connection
instead of an HTTP request) to prove it's the same idea, not a
coincidence. This is precisely the architecture Stage 6 will need:
real browser events (clicks, input) arriving over a live connection,
routed to registered Python callbacks by name.

### SE Lens

The alternative not chosen: one large `if event["type"] ==
"increment": ... elif event["type"] == "reset": ...` block directly
inside `handle_client`. The tradeoff, same as Lesson 0a's routing
discussion: a registry lets each handler be defined and registered
independently, without editing a shared block every time a new event
type is added — at the cost of not being able to see every handled
event type by reading `handle_client` top to bottom; you have to trust
`handlers` is being populated correctly elsewhere.

### Run It

```
--- client sending increment, increment, reset as JSON events ---
{'status': 'ok', 'message': 'count incremented'}
{'status': 'ok', 'message': 'count incremented'}
{'status': 'ok', 'message': 'count reset'}
--- server log ---
received event: {'type': 'increment'}
received event: {'type': 'increment'}
received event: {'type': 'reset'}
```

Confirmed by actually running both files — three structured events,
routed to the correct handler each time, over the one persistent
connection from Lesson 3a.

### Connect

This is the actual shape Stage 6's real event handling will take: a
browser-originated event, carrying a `type`, routed through a registry
exactly like this one to a specific Python function — whatever the
final transport turns out to be.

---

## Closing

### Connect the Pieces

Trace one event end to end: the client builds `{"type": "increment"}`,
serializes it with `json.dumps`, writes it as one line over the
connection kept open since Lesson 3a. The server's loop wakes up on
`await reader.readline()`, deserializes it with `json.loads`, looks up
`handlers["increment"]` — found because `@on("increment")` registered
`handle_increment` there when the file first loaded — calls it, gets
back `{"status": "ok", "message": "count incremented"}`, serializes
*that* with `json.dumps`, and writes it back. The client's own
`readline()` wakes up and prints the decoded result.

### What Breaks Without This

Sending an event type with no registered handler:

```json
{"type": "delete-everything"}
```

Real server output, before any fix:

```
received event: {'type': 'delete-everything'}
Unhandled exception in client_connected_cb
...
    handler = handlers[event["type"]]
              ~~~~~~~~^^^^^^^^^^^^^^^
KeyError: 'delete-everything'
```

And the client, waiting on that same connection, sees the connection
simply die (`got: b''`) with no explanation. The fix — catching the
lookup failure and responding with a real, structured error instead of
crashing the connection:

```python
try:
    handler = handlers[event["type"]]
    result = handler()
except KeyError:
    result = {"status": "error", "message": f"no handler for '{event['type']}'"}
```

Real output with the fix in place:

```
got: b'{"status": "error", "message": "no handler for \'delete-everything\'"}\n'
```

The connection survives, the client gets a real, informative answer
instead of a dead socket, and known events (confirmed by re-running
the increment/reset sequence) are completely unaffected.

### Exercises

- Add a `handle_ping` handler for `{"type": "ping"}` that returns
  `{"status": "ok", "message": "pong"}`, and confirm it round-trips.
- Extend an event to carry extra data — `{"type": "increment", "amount":
  5}` — and have `handle_increment` read `event["amount"]` (defaulting
  to `1` if missing) instead of always doing the same fixed thing.

### Definition of Done

- [ ] `handlers` dict and `@on(...)` decorator registering functions by
      event type name.
- [ ] `handle_client` parses incoming JSON, dispatches by `event["type"]`,
      and replies with JSON.
- [ ] Three real structured events sent and correctly routed, confirmed
      by actually running both files.
- [ ] The unknown-event-type crash was reproduced on purpose, with the
      real `KeyError` shown, then fixed with a `try`/`except` producing
      a graceful error response instead — confirmed with real output,
      and confirmed known events still work afterward.
- [ ] Committed with a message explaining *why*: something like
      `"Route structured JSON events to registered Python callbacks
      over the persistent connection, and fail gracefully on unknown
      event types instead of crashing the connection"` — not `"add
      event handling"`.
