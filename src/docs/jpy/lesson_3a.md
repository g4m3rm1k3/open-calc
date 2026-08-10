# Lesson 3a: A Persistent Connection — One Socket, Many Messages

**What you will build:** A real client and server, using nothing but
Python's standard library, that open one connection and exchange
multiple messages across it — no reconnecting between messages, unlike
every HTTP request this project has made so far. The transferable
problem: this project is deliberately *not* committing to FastAPI,
Flask, pywebview, or anything else as "the" way to talk to a browser
yet — that choice belongs to the Transport abstraction stage already on
the map (Stage 7), specifically so this library can support several of
them, and so you can eventually build your own. This lesson teaches
what a persistent connection actually *is*, underneath any of those
choices, using only what's already installed anywhere Python runs.

**What you need to know first:** Lessons 0a–2b — specifically, that
every HTTP request so far (`curl`, a browser navigating) has been a
brand-new connection: connect, ask, answer, disconnect, every single
time. This lesson is about what's different when a connection stays
open on purpose.

**Pipeline:** This lesson stands outside the
`Component → render() → HTML string → Flask response → Browser`
pipeline on purpose — it isn't wired into `app.py` yet. It's laying the
groundwork Stage 7's Transport abstraction will need, deliberately kept
separate until that abstraction exists to plug it into.

---

## Concept Unit: Async Functions — `async def` and `await`

### The Problem

A persistent connection means a server has to be able to *wait* for a
message from one client without freezing and ignoring every other
client in the meantime. An ordinary Python function has no way to
"pause and let something else run" — once it's called, it runs
straight through, blocking everything else until it returns.

### Introduce the Concept in Isolation

```python
import asyncio
import time

async def task(name, delay):
    start = time.perf_counter()
    print(f"{name} starts")
    await asyncio.sleep(delay)
    elapsed = time.perf_counter() - start
    print(f"{name} ends ({elapsed:.1f}s)")

async def main():
    overall_start = time.perf_counter()
    await asyncio.gather(task("A", 2), task("B", 1))
    print(f"total: {time.perf_counter() - overall_start:.1f}s")

asyncio.run(main())
```

Run:

```
A starts
B starts
B ends (1.0s)
A ends (2.0s)
total: 2.0s
```

`task("A", 2)` waits 2 seconds and `task("B", 1)` waits 1 second — if
they ran one after another, the total would be 3.0s. It's 2.0s
instead: both started immediately, and while `A` was paused waiting,
`B` got to run (and finish) in the meantime. This is called an
**async function** (or **coroutine**), defined with `async def`.
`await` marks the exact point where a coroutine can pause — handing
control back so other coroutines can run — and resume later once
whatever it's waiting for is ready.

### Discard

`u1_l3a.py` is deleted.

---

## Concept Unit: A Persistent Connection — One Socket, Many Messages

### The Problem

We need a server that opens a connection to a client once, and then
keeps that exact same connection open across many back-and-forth
exchanges — not the connect-ask-answer-disconnect cycle every `curl`
request in this project has used so far.

### Introduce the Concept in Isolation

A server:

```python
import asyncio

async def handle_client(reader, writer):
    while True:
        data = await reader.readline()
        if not data:
            break
        message = data.decode().strip()
        print(f"received: {message}")
        response = f"echo: {message}\n"
        writer.write(response.encode())
        await writer.drain()
    writer.close()

async def main():
    server = await asyncio.start_server(handle_client, "127.0.0.1", 8888)
    async with server:
        await server.serve_forever()

asyncio.run(main())
```

A client:

```python
import asyncio

async def main():
    reader, writer = await asyncio.open_connection("127.0.0.1", 8888)

    for message in ["hello", "how are you", "goodbye"]:
        writer.write(f"{message}\n".encode())
        await writer.drain()
        response = await reader.readline()
        print(response.decode().strip())

    writer.close()
    await writer.wait_closed()

asyncio.run(main())
```

Run the client against the server:

```
echo: hello
echo: how are you
echo: goodbye
```

And the server's own log, for the same run:

```
received: hello
received: how are you
received: goodbye
```

Three separate messages, three separate responses — and
`asyncio.open_connection` was only called **once**, at the very top of
the client. Compare that to every `curl` command in this project so
far: each one opened a brand-new TCP connection, made one request, got
one response, and closed. This client opens one connection and reuses
it for all three messages. This is what **persistent connection**
means — the thing every later lesson's live updates will depend on.

### Discard

`u2_server_l3a.py` and `u2_client_l3a.py` are deleted — their only job
was proving a single connection can carry multiple independent
messages.

---

## Mechanical Walkthrough (of the persistent-connection lab, since this lesson has no project code yet)

- `async def handle_client(reader, writer):` — **(b) hard concept
  reappearing** (async function), applied here to a connection handler
  instead of a toy delay task.
- `while True:` — **(a) first appearance** *in this specific role*.
  This loop is what makes the connection genuinely persistent — it
  keeps the handler alive, ready to process another message, instead
  of returning (and closing the connection) after the first one.
- `data = await reader.readline()` — **(a) first appearance.** Pauses
  this specific coroutine until a full line of bytes has arrived from
  the client — without blocking the rest of the program, per the
  `async`/`await` concept just proven.
- `if not data: break` — **(a) first appearance.** An empty result from
  `readline()` means the client closed the connection; this is how the
  loop knows to stop instead of waiting forever.
- `writer.write(...)` / `await writer.drain()` — **(a) first
  appearance.** `.write()` queues bytes to send; `await writer.drain()`
  pauses until they've actually been sent, applying backpressure so
  the program doesn't queue data faster than the network can carry it.
- `asyncio.start_server(handle_client, "127.0.0.1", 8888)` — **(a)
  first appearance.** Starts listening on port `8888`, and — this is
  the key part — arranges for `handle_client` to be called fresh, as
  its own independent coroutine, for *every* client that connects, so
  multiple persistent connections can be held open at once.
- `asyncio.open_connection(...)`, client side — **(a) first
  appearance.** The client-side counterpart: actually opens the one TCP
  connection everything else in the client reuses.

### CS Lens

Keeping one connection open and multiplexing many exchanges across it,
instead of paying the cost of a fresh connection per exchange, is the
core idea behind **persistent connections** generally. Also recognized
in: HTTP/1.1's `Keep-Alive` (a deliberate improvement over HTTP/1.0's
one-request-per-connection default), database connection pools reusing
open connections instead of reconnecting per query, and SSH sessions,
which stay open for an entire terminal session rather than
reconnecting per command.

### SE Lens

The alternative — what every earlier lesson has actually been doing —
is a fresh connection per exchange (plain HTTP, as built through
Lesson 2b). The tradeoff: reconnecting every time is simpler to reason
about (nothing to hold open, nothing that can silently go stale) and
is exactly what stateless request/response fits naturally. But it
means the *server* can never initiate anything — it can only ever
respond to a request the browser already sent. A persistent connection
costs real complexity (a loop that has to run correctly forever, a
connection that can drop and needs handling) in exchange for the one
thing this whole project's later stages actually need: the ability for
Python to push an update to the browser on its own timing, not only in
response to a request.

### Run It

Already shown above, actually run: three messages, one connection,
confirmed on both the client's output and the server's own log.

### Connect

This is the raw mechanism underneath *any* of the transports this
project might eventually use — a real WebSocket (via FastAPI or any
other library), pywebview's bridge, or something built entirely by
hand, exactly like this. Whichever one Stage 7 picks, "a connection
that stays open and can carry many messages" is what it's built on.

---

## Closing

### Connect the Pieces

Trace one message end to end: the client's `for` loop writes
`"hello\n"` and calls `await writer.drain()` — pausing that coroutine
until the bytes are actually sent. On the server, `handle_client`'s
`await reader.readline()` was paused waiting for exactly this; it wakes
up, decodes `"hello"`, and writes back `"echo: hello\n"`. The client's
own `await reader.readline()` wakes up and prints it. Then — and this
is the entire point — the loop goes around again, on both sides,
*without* either side opening a new connection, ready for `"how are
you"` next.

### What Breaks Without This

Removing the `while True:` loop from the server — handling exactly one
message, then closing:

```python
async def handle_client(reader, writer):
    data = await reader.readline()
    message = data.decode().strip()
    print(f"received: {message}")
    writer.write(f"echo: {message}\n".encode())
    await writer.drain()
    writer.close()   # connection dies after the first message
```

Real output, running the same three-message client against it:

```
got: b'echo: hello\n'
Traceback (most recent call last):
  ...
    data = self._sock.recv(self.max_size)
ConnectionResetError: [Errno 104] Connection reset by peer
```

The first message works fine — but the moment the server closes the
socket after one exchange, the client's second `readline()` call fails
with a real, live `ConnectionResetError`, not a graceful "connection
closed" message. This is the exact failure mode a real chat app,
live-updating dashboard, or (eventually) this project's own UI updates
would hit if the connection-handling loop weren't written correctly.

### Exercises

- Change the client to send ten messages instead of three, over the
  same connection, and confirm the server handles all ten without any
  reconnect.
- Open two clients against the same server *at the same time* (two
  separate terminal windows, or two background `python3` processes)
  and confirm the server's log interleaves messages from both —
  proving `asyncio.start_server` really does handle multiple
  persistent connections concurrently, not just one at a time.

### Definition of Done

- [ ] A server using `asyncio.start_server` with a `while True:` loop
      that keeps a connection alive across multiple messages.
- [ ] A client using `asyncio.open_connection` once, sending multiple
      messages over that one connection.
- [ ] Three real messages sent and echoed back over one connection,
      confirmed by actually running both sides and reading the output.
- [ ] The non-looping (connection-dies-after-one-message) version was
      reproduced on purpose, with the real `ConnectionResetError`
      shown.
- [ ] Committed with a message explaining *why*: something like
      `"Add a standalone asyncio TCP echo demo proving what a
      persistent connection actually is, deliberately kept outside
      app.py until Stage 7's Transport abstraction exists to use it"`
      — not `"add websocket demo"`.
