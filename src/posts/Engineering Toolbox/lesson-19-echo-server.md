# Lesson 19: A Server That Doesn't Quit After One Client
### (TCP Echo Server)

**What you will build.** `run_echo_server()` — a real TCP server that
accepts a connection, echoes back whatever it receives, and — the whole
point of this lesson — goes back to `accept()` and serves the *next*
client too, indefinitely, instead of exiting after one exchange the way
Lesson 18's server did. Along the way, this lesson also surfaces a real
bug the hard way (a genuine server crash, triggered on purpose) and
fixes it.

**Pipeline so far:** `Program → Socket → Network → Socket → Program`
(established in Lesson 18). This lesson doesn't add a new stage — it
changes the *shape* of the existing one, from "handle one connection,
then exit" to "handle connections forever."

**What you need to know first.** From Lesson 18: creating a socket,
`bind()`, `listen()`, `accept()`, `recv()`, `.encode()`/`.decode()`, and
the `with` statement applied to sockets. New in this lesson: wrapping
`accept()` in a loop, and `sendall()`.

---

## Concept Unit: Looping `accept()`

### The Problem

Lesson 18's server called `accept()` exactly once — it handled one
client, then the `with` block ended and the program exited. A real
server (a web server, a chat server, anything long-running) needs to
keep accepting *new* connections indefinitely, not shut down the moment
one client disconnects.

### Introduce the Concept in Isolation

Skipped, per the Concept Isolation Rule's carve-out — `while True:`
(Lesson 10) and `accept()` (Lesson 18) are both already-taught concepts;
the only new idea is *where* the loop goes, which is a structural
change best shown directly in the real code rather than manufactured
as a disconnected example.

### Project Change

- **Files affected:** `echo_server.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** `socket` module (Lesson 18)

### The New Code

```python
import socket

HOST = "127.0.0.1"
PORT = 65433

def run_echo_server():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
        server_socket.bind((HOST, PORT))
        server_socket.listen()
        print("echo server listening...")
        while True:
            conn, addr = server_socket.accept()
```

### The Updated Project

```python
import socket

HOST = "127.0.0.1"
PORT = 65433

def run_echo_server():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
        server_socket.bind((HOST, PORT))
        server_socket.listen()
        print("echo server listening...")
        while True:                              # ← new
            conn, addr = server_socket.accept()      # ← new
```

The server now sits in a loop, calling `accept()` again every time it
finishes with a client, instead of ever falling out of the `with`
block on its own.

### Mechanical Walkthrough
`import socket`, `HOST`/`PORT`, `with socket.socket(...) as
- server_socket:`, `server_socket.bind(...)`, `server_socket.listen()` — all direct reminders of Lesson 18, unchanged.
- `while True:` — Lesson

10's intentional infinite loop, reminder, wrapping something that
- previously ran once.
- `conn, addr = server_socket.accept()` — Lesson 18,
reminder — now inside the loop instead of standing alone.

### CS Lens

This is the standard shape of almost every real network server:
**bind and listen once, accept in a loop, forever.** The listening
socket (`server_socket`) is set up a single time and never touched
again after that; it's `accept()`, called repeatedly, that produces a
fresh `conn` for every new client. Also recognized in: literally every
production web server, chat server, or database server — this loop, in
some form, sits underneath all of them.

### SE Lens

Nothing inside this loop yet limits how many clients it can serve at
once — each `accept()` call blocks (Lesson 18's term) until a client
connects, and the server can't accept a *second* client while it's
still busy with the first, since everything happens on one thread, in
sequence. That's a real, honest limitation this lesson doesn't fix —
handling multiple clients *simultaneously* needs threading or async I/O,
both future lessons (Track 11). This lesson's server can serve many
clients, just never at the exact same instant — proven for real below.

### Commands Needed

None new.

### Run It

Not runnable for a complete demonstration yet — the loop can accept a
client, but does nothing with the connection once it has one.

### Connection

The server can now accept client after client. The next unit is
handling each one — reusing Lesson 18's `recv()`, with one real
addition.

---

## Concept Unit: `sendall()`

### The Problem

Lesson 18's client used plain `.send()`. For an echo server that might
receive larger messages, that's a real, honest gap: `.send()` is only
*guaranteed* to send some of the data you hand it — for large enough
payloads, it can return having sent fewer bytes than you asked, leaving
you to loop and send the rest yourself. We want a call that guarantees
everything gets sent before moving on.

### Introduce the Concept in Isolation

Skipped, per the same carve-out as this lesson's first unit —
`sendall()` behaves identically to `send()` from the caller's
perspective, just with a stronger guarantee; the mechanical walkthrough
below states that guarantee directly rather than manufacturing a
separate toy example for it.

### Project Change

- **Files affected:** `echo_server.py`
- **Change type:** add — completes `run_echo_server()`
- **Location:** inside the `while True:` loop, after `accept()`
- **Dependencies:** `conn`, `addr`

### The New Code

```python
with conn:
    print(f"connected by {addr}")
    while True:
        data = conn.recv(1024)
        if not data:
            print(f"{addr} disconnected")
            break
        conn.sendall(data)
```

### The Updated Project

```python
import socket

HOST = "127.0.0.1"
PORT = 65433

def run_echo_server():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
        server_socket.bind((HOST, PORT))
        server_socket.listen()
        print("echo server listening...")
        while True:
            conn, addr = server_socket.accept()
            with conn:                                       # ← new
                print(f"connected by {addr}")                    # ← new
                while True:                                         # ← new
                    data = conn.recv(1024)                             # ← new
                    if not data:                                          # ← new
                        print(f"{addr} disconnected")                        # ← new
                        break                                                  # ← new
                    conn.sendall(data)                                          # ← new

run_echo_server()
```

`echo_server.py` is now complete: it accepts a client, echoes back
everything it receives until that client disconnects, then loops back
to `accept()` for the next one — indefinitely.

### Mechanical Walkthrough
- `with conn:` — Lesson 18, reminder — guarantees this client's socket
closes even if something inside the block raises an error (this
- lesson's closing section triggers exactly that).
- `while True:` — a
*second*, inner infinite loop, nested inside the outer one — the outer
loop is "wait for the next client," this inner loop is "keep this one
client's conversation going until they disconnect." `data =
- conn.recv(1024)` — Lesson 18, reminder.
- `if not data: ... break` — the
same empty-bytes-as-disconnection-signal idea from Lesson 18's `recv()`
unit, reused here as the inner loop's exit condition (distinct from
- Lesson 10's empty-string-from-`read()` sentinel — same *shape* of idea, different data source).
- `conn.sendall(data)` — first appearance:

guarantees every byte in `data` is actually transmitted before
returning, looping internally and retrying as needed — unlike Lesson
18's plain `.send()`, which only promises to send *some* of what you
asked, in one call, and leaves the rest to you.

### CS Lens

This nested-loop structure — outer loop for "next client," inner loop
for "this client's ongoing conversation" — mirrors a real, common
pattern: a **connection lifecycle** nested inside a **server
lifecycle**. Also recognized in: any long-running service handling a
stream of independent sessions — a database server handling one query
session at a time per connection, an SSH server handling one shell
session per connection — the outer "accept new work" loop and inner
"service this one unit of work" loop are structurally the same idea
everywhere they appear.

### SE Lens

`sendall()` versus `send()` is a real, meaningful choice, not a
stylistic one: `send()` returning fewer bytes than requested is rare on
a fast local connection with small payloads (which is part of why
Lesson 18's version "worked" despite using the weaker call) but becomes
a real, silent-data-loss risk on slower networks or with larger
messages. `sendall()` costs nothing extra to use correctly and removes
an entire class of bug — there's essentially no reason to reach for
plain `send()` in ordinary code once `sendall()` is available.

### Commands Needed

`python3 echo_server.py` — starts the server; it runs forever (the
outer `while True:` never exits) until stopped manually (Ctrl+C).

### Run It — Real Output

Started in the background, then two **completely separate** real client
connections, one after the other:

```
$ python3 echo_server.py
echo server listening...
connected by ('127.0.0.1', 51008)
('127.0.0.1', 51008) disconnected
connected by ('127.0.0.1', 56440)
('127.0.0.1', 56440) disconnected
```

Real, direct proof this lesson's whole point actually works: the first
client connected, exchanged messages, and disconnected — and the server
was still alive and ready, immediately accepting a genuinely separate
second client on a different port, exactly what Lesson 18's one-shot
version could never do.

A single client sending multiple messages on one connection, confirming
the inner loop correctly keeps a conversation going:

```python
s.send(b"first message")
print(s.recv(1024))   # b'first message'
s.send(b"second message")
print(s.recv(1024))   # b'second message'
```

And a real, larger payload (100,000 bytes) sent with `sendall()` and
confirmed to arrive completely intact:

```
sent: 100000 bytes
received back: 100000 bytes
matches: True
```

### Connection

The server genuinely serves multiple clients in sequence, and reliably
transmits data of any size. The closing section shows a real crash this
version doesn't yet protect against — found by actually triggering it,
not by inspection.

---

## Closing

### Connect the Pieces

Trace two separate real clients through the server: the first connected
(`accept()` returned, `addr` was `('127.0.0.1', 51008)`), exchanged
data via the inner loop, sent no more data (closed its side), `recv()`
returned empty bytes, the inner loop's `break` fired, `"disconnected"`
printed, and the `with conn:` block ended, closing that client's
socket. Control returned to the **outer** loop, which immediately
called `accept()` again — genuinely blocking, waiting — until a second,
independent client connected on a different ephemeral port
(`56440`), and the entire inner-loop cycle ran again, completely fresh.

### What Breaks Without This

Not a hypothetical — a real crash, triggered on purpose, using a
technique (`SO_LINGER`) that forces a hard connection reset instead of
a clean disconnect, simulating what a genuinely crashed client or a
dropped network connection looks like to the server:

```python
s.send(b"hello, about to vanish")
s.setsockopt(socket.SOL_SOCKET, socket.SO_LINGER, struct.pack("ii", 1, 0))
s.close()  # forces a hard RST instead of a clean FIN
```

Real server output:

```
connected by ('127.0.0.1', 47020)
Traceback (most recent call last):
  ...
  File "echo_server.py", line 16, in run_echo_server
    data = conn.recv(1024)
ConnectionResetError: [Errno 104] Connection reset by peer
```

And confirmed, directly, that the server process was genuinely dead
afterward — not just this one client's session, the **entire server**,
including its ability to serve every future client, ever again. This is
a real, serious gap: `recv()` doesn't only fail with an empty-bytes
disconnect signal (Lesson 18's clean case) — an abrupt disconnect
raises a real exception instead, and with no `try`/`except` (Lesson 4's
pattern) around it, that exception propagates all the way up through
both loops and kills the whole program.

The fix — a `try`/`except ConnectionResetError` around the inner
loop — was built and independently verified: the identical abrupt
disconnect, replayed against the fixed version, produced
`"reset the connection"` instead of a crash, and a **third**, genuinely
new client connecting immediately afterward was served normally,
proving the server survived:

```
connected by ('127.0.0.1', 44862)
('127.0.0.1', 44862) reset the connection
```

```python
received: b'still alive?'
```

### Exercises

1. Apply the fix yourself: wrap the inner `while True:` loop's body in
   `try`/`except ConnectionResetError`, printing a message instead of
   crashing, and confirm — the way this lesson did — that a real
   abrupt disconnect no longer takes the server down.
2. Add a client counter: track how many clients have connected total
   (a variable outside the loop, incremented once per `accept()`) and
   print it in the `"connected by"` message.
3. Genuinely try to connect two clients to the server *at the same
   time* (open two terminal windows, or two separate background
   processes) and confirm for yourself that the second one's `connect()`
   succeeds immediately (the OS queues it, per Lesson 18's `listen()`
   unit) but its actual conversation doesn't start until the *first*
   client's inner loop finishes — direct, hands-on confirmation of this
   lesson's SE Lens about one-client-at-a-time service.

### Definition of Done

- [ ] `echo_server.py` runs and you connected at least two genuinely
      separate real clients to it, one after another, confirming it
      didn't exit after the first
- [ ] You sent a real payload larger than a trivial test string and
      confirmed it echoed back completely intact
- [ ] You triggered a real abrupt disconnect and watched the
      unprotected server actually crash
- [ ] You applied the `try`/`except` fix and confirmed the server
      survived an identical abrupt disconnect afterward
- [ ] Commit:

```
git add echo_server.py
git commit -m "Add a looping TCP echo server: prove accept() belongs in a loop for any long-running server, and that an abrupt client disconnect is a real exception, not just an empty recv()"
```
