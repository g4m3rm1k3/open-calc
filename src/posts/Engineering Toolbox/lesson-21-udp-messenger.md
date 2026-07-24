# Lesson 21: A Message With No Handshake
### (UDP Messenger)

**What you will build.** A UDP server and client that exchange
messages — deliberately built to look as close to Lesson 18's TCP
version as possible, so the *differences* are the whole point. UDP
skips `bind→listen→accept` and `connect()` entirely; a UDP socket just
sends a message straight to an address, with no setup conversation
first. That convenience comes at a real, honest cost this lesson
proves directly: TCP tells you immediately, loudly, if nobody's there
to receive your message. UDP doesn't tell you anything at all.

**Pipeline so far:** `Program → Socket → Network → Socket → Program`
— unchanged in shape, but this lesson uses a genuinely different kind
of socket (`SOCK_DGRAM` instead of `SOCK_STREAM`) at the same stage.

**What you need to know first.** From Lesson 18: creating a socket,
`.encode()`/`.decode()`, the general shape of a client/server exchange.
New in this lesson: `socket.SOCK_DGRAM`, `sendto()`, `recvfrom()`, and
`socket.timeout`.

---

## Concept Unit: `socket.SOCK_DGRAM`

### The Problem

Every socket built so far in this curriculum has used
`socket.SOCK_STREAM` (Lesson 18) — TCP: reliable, ordered, and
connection-based. Not every situation needs those guarantees, and
paying for them (the `bind→listen→accept`/`connect()` handshake) is
real, avoidable overhead when they're not needed.

### Introduce the Concept in Isolation

```python
import socket
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
print(s)
s.close()
```

Run it:

```
<socket.socket fd=3, family=2, type=2, proto=0, laddr=('0.0.0.0', 0)>
```

This proves `socket.SOCK_DGRAM` — the second argument, previously
always `SOCK_STREAM` in Lesson 18 — creates a genuinely different kind
of socket object: UDP instead of TCP. Notice `type=2` here versus
`type=1` for the `SOCK_STREAM` sockets Lesson 18/19/20 all created —
a real, structural difference the OS tracks, not just a naming
convention. This throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `udp_server.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** `socket` module

### The New Code

```python
import socket

HOST = "127.0.0.1"
PORT = 65450

def run_udp_server():
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as server_socket:
        server_socket.bind((HOST, PORT))
        print("UDP server listening...")
```

### The Updated Project

```python
import socket

HOST = "127.0.0.1"
PORT = 65450

def run_udp_server():                                            # ← new
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as server_socket:  # ← new
        server_socket.bind((HOST, PORT))                              # ← new
        print("UDP server listening...")                                # ← new
```

The server creates a UDP socket and binds it to an address — but
notice what's *missing* compared to every earlier TCP server: no
`.listen()`, no `.accept()` loop. This isn't unfinished; UDP genuinely
doesn't have those concepts, which the next unit explains.

### Mechanical Walkthrough
`import socket`, `HOST`/`PORT`, `with socket.socket(...) as
- server_socket:` — reminders from Lesson 18, structurally unchanged.
- `socket.SOCK_DGRAM` — the concept from this unit's lab, reused for real.
- `server_socket.bind((HOST, PORT))` — Lesson 18, reminder: even a

UDP socket needs to claim an address so others know where to send to
it — binding isn't a TCP-only idea.

### CS Lens

TCP and UDP sit at the same layer of the network stack (the "transport"
layer) but make fundamentally different guarantees: TCP promises every
byte arrives, in order, or you're told it failed; UDP promises none of
that — it's closer to "drop a message in the mail and hope." Also
recognized in: DNS lookups (mostly UDP — a single quick
question/answer, where TCP's setup cost isn't worth it), video calls
and game networking (also often UDP — a slightly-late or dropped video
frame is fine; waiting for TCP to guarantee-deliver an old one isn't).

### SE Lens

Skipping `listen()`/`accept()` isn't a missing feature — it's a direct
consequence of UDP having no concept of a "connection" at all. TCP's
`accept()` exists because TCP tracks an ongoing, stateful relationship
between two specific endpoints; UDP has no such relationship to
establish — every message is independent, which is exactly why the
next unit's `sendto()` needs to name a destination address on *every*
single call, unlike TCP's `send()`, which only needs the data because
the destination was already fixed by `connect()`/`accept()`.

### Commands Needed

None.

### Run It

Not runnable for meaningful output yet — the server is bound but does
nothing with incoming data.

### Connection

We have a real UDP socket, bound and ready. The next unit is actually
sending and receiving messages through it.

---

## Concept Unit: `sendto()` and `recvfrom()`

### The Problem

TCP's `send()`/`recv()` (Lesson 18) work because a connection was
already established — the socket already knows who it's talking to.
UDP has no such established relationship; every message needs its own
destination address attached, and every received message needs to
report *who it came from*, since nothing was agreed upon in advance.

### Introduce the Concept in Isolation

Skipped, per the Concept Isolation Rule's carve-out — `sendto()` and
`recvfrom()` are the same core idea as `send()`/`recv()` (already fully
taught in Lesson 18), with one added argument/return value each; that
one difference is small enough to show directly in the real code
rather than manufacture a disconnected example for.

### Project Change

- **Files affected:** `udp_server.py`
- **Change type:** add — completes the server
- **Location:** inside `run_udp_server()`, after the `bind()`/`print()`
- **Dependencies:** `server_socket`

### The New Code

```python
while True:
    data, addr = server_socket.recvfrom(1024)
    print(f"received from {addr}: {data.decode()!r}")
    server_socket.sendto(b"ack: " + data, addr)
```

### The Updated Project

```python
import socket

HOST = "127.0.0.1"
PORT = 65450

def run_udp_server():
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as server_socket:
        server_socket.bind((HOST, PORT))
        print("UDP server listening...")
        while True:                                                # ← new
            data, addr = server_socket.recvfrom(1024)                  # ← new
            print(f"received from {addr}: {data.decode()!r}")            # ← new
            server_socket.sendto(b"ack: " + data, addr)                    # ← new

run_udp_server()
```

`udp_server.py` is now complete: it waits for any UDP message, prints
it along with the real address it came from, and sends a short
acknowledgment straight back to that exact address — all without ever
having "connected" to anyone.

### Mechanical Walkthrough
- `while True:` — Lesson 10, reminder, here waiting for datagrams
instead of client connections. `data, addr = server_socket.recvfrom(
- 1024)` — the concept from this unit's lab, reused for real: unlike
TCP's `conn.recv(1024)` (which only returns data, because `conn`
already identifies the other side), `recvfrom()` returns **both** the
data *and* the sender's address — it has to, since nothing established
who's on the other end beforehand. `server_socket.sendto(b"ack: " +
- data, addr)` — the concept from this unit's lab, reused for real:
every send needs an explicit destination; there's no equivalent of
- TCP's plain `conn.sendall(data)` here, because there's no `conn` — just
one socket, capable of sending anywhere, one message at a time.

### CS Lens

Not new beyond what this unit's own lab already covers — skipped per
the Stopping Rule.

### SE Lens

Because `recvfrom()` always returns the sender's address, and
`sendto()` always requires a destination, a single UDP socket can talk
to many different addresses without ever "switching connections" the
way a TCP client would need a whole new `connect()` call to talk to a
different server. That's a real structural consequence of
connectionlessness, not an incidental convenience — proven directly
below.

### Commands Needed

`python3 udp_server.py` — runs it.

### Run It — Real Output

A real client, sending one message and receiving the server's ack:

```python
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.sendto(b"hello over UDP", ("127.0.0.1", 65450))
data, addr = s.recvfrom(1024)
print("got back:", data, "from", addr)
```

```
got back: b'ack: hello over UDP' from ('127.0.0.1', 65450)
```

And direct, real proof of this unit's SE Lens — **one single socket**,
never reconnected, talking to two genuinely different servers on two
different ports:

```python
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.sendto(b"msg to server 1", ("127.0.0.1", 65450))
data1, addr1 = s.recvfrom(1024)

s.sendto(b"msg to server 2", ("127.0.0.1", 65451))
data2, addr2 = s.recvfrom(1024)
```

```
from server 1: b'ack: msg to server 1' ('127.0.0.1', 65450)
from server 2: b'server2 ack: msg to server 2' ('127.0.0.1', 65451)
```

A TCP client attempting the same thing would need a completely separate
socket, or a full `connect()` to a *new* address, to talk to a second
server — the same socket can't just "send elsewhere." This one, with
no connection state to switch, simply did.

### Connection

The UDP round-trip genuinely works, and one socket's ability to reach
many destinations is now directly demonstrated. The closing section
shows the real price of skipping TCP's setup handshake.

---

## Closing

### Connect the Pieces

Trace one message end to end: the client's `sendto()` handed a real
UDP datagram to the OS, addressed to `127.0.0.1:65450` — no handshake,
no acknowledgment that it was even received, just sent. The server's
`recvfrom()` — already waiting — received it, along with the exact
address to reply to, since nothing about *who* was sending had been
established beforehand. `sendto()` on the server's side sent the ack
back to that address, and the client's own `recvfrom()` picked it up.
Every step happened without either side ever knowing, in advance,
anything about the other beyond an address — genuinely different from
Lesson 18's TCP flow, where `accept()`/`connect()` had already
established a specific, ongoing relationship before a single byte of
actual data moved.

### What Breaks Without This

Send a real UDP message to a port with **nothing listening** on it:

```python
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.settimeout(2)
s.sendto(b"is anyone listening?", ("127.0.0.1", 65499))
print("sendto() returned without error")
try:
    data, addr = s.recvfrom(1024)
except socket.timeout:
    print("timed out waiting -- no error was ever raised about the missing server")
```

Real output:

```
sendto() returned without error
timed out waiting -- no error was ever raised about the missing server
```

Now the identical situation, over TCP:

```python
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(("127.0.0.1", 65499))
```

Real output:

```
ConnectionRefusedError: [Errno 111] Connection refused
```

This is the real, direct cost of skipping the handshake: TCP's
`connect()` genuinely talks to the OS on the other end during setup,
so a closed port is discovered and reported **immediately**, as a real
exception. UDP's `sendto()` never checks anything — it succeeds even
when nothing could possibly be listening, because "succeeded" for UDP
only ever means "the OS accepted this for sending," never "something
received it." The only way this lesson's UDP client noticed a problem
at all was `s.settimeout(2)` (first appearance — makes a blocking call
give up and raise `socket.timeout` after that many seconds, rather
than waiting forever) — without it, the client would have hung,
waiting indefinitely for a reply that was never coming, with no
indication anything was ever wrong.

### Exercises

1. Remove `s.settimeout(2)` from the client and confirm (carefully,
   with a way to interrupt it) that it really does hang forever waiting
   for a reply from a port nothing is listening on — direct, felt proof
   of why timeouts matter specifically for UDP code.
2. Send several UDP messages in quick succession without waiting for
   each ack individually, then collect all the acks afterward — notice
   nothing in this code guarantees they'll arrive in the same order
   they were sent, unlike TCP's ordering guarantee.
3. Build a tiny broadcast-style tool: one UDP client sending the same
   message to several different `(host, port)` addresses in a loop,
   using the same socket for every one — direct, hands-on use of this
   lesson's "no reconnection needed" finding.

### Definition of Done

- [ ] `udp_server.py` runs and you exchanged a real message and ack
      with a real client
- [ ] You confirmed one UDP socket can talk to two different servers
      without reconnecting
- [ ] You triggered the real "no error at all" behavior of sending UDP
      to a dead port, and contrasted it directly against TCP's
      immediate `ConnectionRefusedError` for the same situation
- [ ] You can explain, without looking back, why `recvfrom()` returns
      an address and plain TCP `recv()` doesn't
- [ ] Commit:

```
git add udp_server.py
git commit -m "Add a UDP client/server: prove connectionless messaging skips TCP's handshake at the real cost of silent, undetected failure when nothing is listening"
```
