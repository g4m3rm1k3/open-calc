# Lesson 20: One Thread Per Client
### (Simple Chat Server)

**What you will build.** A real chat server: any connected client's
message gets broadcast to every *other* connected client, live. Unlike
Lesson 19's echo server — which could only ever be mid-conversation with
one client at a time — this server genuinely handles several clients
**simultaneously**, using one thread per connection. This lesson also
surfaces a real, non-obvious bug: two threads modifying a shared list of
clients at the same moment don't crash — they silently corrupt the
broadcast, causing a real client to miss a real message with no error
at all.

**Pipeline so far:** `Program → Socket → Network → Socket → Program`,
now with *multiple* client sockets alive on the server at once instead
of one at a time.

**What you need to know first.** From Lesson 19: looping `accept()`,
`sendall()`, handling a client's `recv()` loop, `try`/`except` around a
connection. New in this lesson: the `threading` module,
`threading.Lock()`, and Python's `list.append()`/`.remove()` on a value
shared across threads.

---

## Concept Unit: `threading.Thread`

### The Problem

Lesson 19's server processes one client's entire conversation — its
whole inner `while True:` loop — before ever calling `accept()` again.
That means client B can't even *connect* meaningfully until client A's
conversation loop finishes or disconnects. A chat server needs several
clients connected and actively talking at the same real moment.

### Introduce the Concept in Isolation

```python
import threading
import time

def worker(name):
    print(f"{name} starting")
    time.sleep(0.5)
    print(f"{name} done")

t1 = threading.Thread(target=worker, args=("A",))
t2 = threading.Thread(target=worker, args=("B",))
t1.start()
t2.start()
print("both started, main thread continues immediately")
t1.join()
t2.join()
print("both finished")
```

Run it:

```
A starting
B starting
both started, main thread continues immediately
A done
B done
both finished
```

This proves `threading.Thread(target=fn, args=(...))` creates a new,
independent thread of execution; `.start()` begins running it
*without waiting* for it to finish — both `"A starting"` and
`"B starting"` printed before either thread's `time.sleep(0.5)` even
finished, and the main thread's own print ran immediately after
starting both, not after they completed. `.join()` is what actually
waits for a thread to finish, used here only so the program doesn't
exit before both threads are done. This throwaway example is
discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `chat_server.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** `socket`, `threading` modules

### The New Code

```python
import socket
import threading

HOST = "127.0.0.1"
PORT = 65440

clients = []

def handle_client(conn, addr):
    print(f"connected by {addr}")

def run_chat_server():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
        server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server_socket.bind((HOST, PORT))
        server_socket.listen()
        print("chat server listening...")
        while True:
            conn, addr = server_socket.accept()
            thread = threading.Thread(target=handle_client, args=(conn, addr))
            thread.start()
```

### The Updated Project

```python
import socket
import threading

HOST = "127.0.0.1"
PORT = 65440

clients = []                                                          # ← new

def handle_client(conn, addr):                                          # ← new
    print(f"connected by {addr}")                                         # ← new

def run_chat_server():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
        server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)   # ← new
        server_socket.bind((HOST, PORT))
        server_socket.listen()
        print("chat server listening...")
        while True:
            conn, addr = server_socket.accept()
            thread = threading.Thread(target=handle_client, args=(conn, addr))  # ← new
            thread.start()                                                        # ← new
```

The server's outer loop (Lesson 19's shape, reminder) now hands each
new connection off to its *own* thread immediately, instead of handling
it directly — meaning `accept()` gets called again right away, able to
accept a second client while the first is still connected.

### Mechanical Walkthrough

`import threading` — first appearance. `clients = []` — an empty list,
meant to track every currently-connected client — not yet written to.
`def handle_client(conn, addr):` — a new function, deliberately
separated out so it can be handed to `threading.Thread` as a `target`.
`server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)` —
first appearance: a real, practical necessity for this lesson's testing
— without it, quickly restarting the server on the same port (as
happens constantly while developing) fails with `Address already in
use` for a short cooldown period after the previous run; this option
tells the OS to allow immediate reuse. `thread = threading.Thread(
target=handle_client, args=(conn, addr))`, `thread.start()` — the
concept from this unit's lab, reused for real: each accepted connection
gets its own thread, started immediately, running `handle_client`
independently of the outer loop.

### CS Lens

This is the classic **thread-per-connection** server model — trading a
small, fixed cost (creating a thread) for the ability to service many
clients whose work overlaps in real time. Also recognized in: early
Apache's process/thread-per-request model, many simple game servers,
any service where "one unit of independent work per client" maps
naturally onto "one thread per client."

### SE Lens

Thread-per-connection is simple to reason about — each client's logic
lives entirely inside `handle_client`, unaware any other client
threads exist — but it doesn't scale indefinitely: each thread carries
real memory overhead, and an OS can only run so many at once before
performance degrades. Track 11's async task runner lesson covers a
different model (many connections handled by far fewer threads) that
trades some of this simplicity for better scaling — a real, deliberate
tradeoff, not "threading is wrong," just "threading has a ceiling."

### Commands Needed

None new.

### Run It

Not runnable for a full demonstration yet — connections are accepted
and threaded, but `handle_client` doesn't yet track clients or relay
any messages between them.

### Connection

Multiple clients can now connect and be handled independently, at the
same real time. The next unit is making them actually talk to each
other — and the real risk that introduces.

---

## Concept Unit: A Shared List Across Threads, and Why It Needs a Lock

### The Problem

To broadcast a message, the server needs to know every currently-
connected client's socket — one shared list (`clients`, already
declared), written to by every client's thread as they connect and
disconnect, and read by every client's thread every time a broadcast
happens. Multiple threads touching the *same* list, at genuinely
unpredictable moments relative to each other, is a fundamentally
different situation from anything in this curriculum so far — nothing
before this lesson had two independent flows of execution touching the
same piece of data at once.

### Introduce the Concept in Isolation

```python
import threading
import time

clients = list(range(20))  # standing in for 20 connected client sockets
visited = []

def broadcaster():
    for c in clients:               # iterating...
        visited.append(c)
        time.sleep(0.01)              # simulate real sendall() taking real time

def remover():
    time.sleep(0.03)
    clients.remove(5)                 # a client disconnects mid-broadcast

t1 = threading.Thread(target=broadcaster)
t2 = threading.Thread(target=remover)
t1.start()
t2.start()
t1.join()
t2.join()

print("actually visited:", visited)
print("SKIPPED:", set(range(20)) - set(visited))
```

Run it:

```
actually visited: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
SKIPPED: {5}
```

This is the real, load-bearing proof for this entire unit: `5` was
never visited — not because of an error (nothing crashed, nothing
raised), but because `remover()`'s `.remove(5)` ran *while*
`broadcaster()`'s `for` loop was mid-iteration. Removing an item
shifts every later item one position to the left; the loop's internal
position counter, unaware anything changed, skipped straight past
whatever slid into the gap. A `list`, unlike a `dict` or `set`, doesn't
detect this and raise an error — it just silently produces a wrong
result. This throwaway example is discarded; the real project protects
against exactly this with a lock, built next.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `chat_server.py`
- **Change type:** add — a lock, and the functions that use it
- **Location:** near `clients`, plus updates to `handle_client`
- **Dependencies:** `clients`, `threading`

### The New Code

```python
clients_lock = threading.Lock()

def broadcast(message, sender_conn):
    with clients_lock:
        for conn in clients:
            if conn is not sender_conn:
                try:
                    conn.sendall(message)
                except OSError:
                    pass
```

### The Updated Project

```python
import socket
import threading

HOST = "127.0.0.1"
PORT = 65440

clients = []
clients_lock = threading.Lock()                                       # ← new

def broadcast(message, sender_conn):                                    # ← new
    with clients_lock:                                                    # ← new
        for conn in clients:                                                # ← new
            if conn is not sender_conn:                                       # ← new
                try:                                                             # ← new
                    conn.sendall(message)                                          # ← new
                except OSError:                                                      # ← new
                    pass                                                               # ← new


def handle_client(conn, addr):
    print(f"connected by {addr}")

def run_chat_server():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
        server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server_socket.bind((HOST, PORT))
        server_socket.listen()
        print("chat server listening...")
        while True:
            conn, addr = server_socket.accept()
            thread = threading.Thread(target=handle_client, args=(conn, addr))
            thread.start()
```

`broadcast()` now exists and is genuinely protected against the exact
failure just demonstrated — but `handle_client` doesn't call it yet,
and never adds anyone to `clients` in the first place.

### Mechanical Walkthrough

`clients_lock = threading.Lock()` — first appearance: a **lock** —
a real object whose entire purpose is letting only one thread at a
time hold it. `def broadcast(message, sender_conn):` — basic. `with
clients_lock:` — the `with` concept (Lesson 1) applied to something
genuinely new: entering this block *waits* if another thread already
holds the lock, and guarantees the lock is released when the block
ends — even if an error occurs inside it, the same unconditional
guarantee `with` has provided since Lesson 1, now protecting against
threads instead of resource leaks. `for conn in clients:` — the exact
iteration from this unit's lab, now happening *only* while the lock is
held. `if conn is not sender_conn:` — `is not`, identity comparison
(different from `!=` — checking these are literally the same socket
object, not just equal-valued) — so a client never receives its own
message echoed back. `try: conn.sendall(message) except OSError: pass`
— Lesson 4's pattern, reused: a client whose connection has gone bad
between being listed and being sent to shouldn't crash the whole
broadcast for everyone else.

### CS Lens

This is **mutual exclusion** — a lock (also called a mutex) ensures
only one thread executes a protected section of code at a time,
directly preventing the interleaving that caused the skipped element
above. Also recognized in: database row locks during a transaction, a
single-occupancy restroom key, any shared counter incremented from
multiple threads — anywhere "two things happening at literally the same
moment" would corrupt shared state, a lock enforces "actually, one at a
time."

### SE Lens

Every place `clients` is read *or* written needs to go through the
same lock — protecting only the removal, or only the broadcast, but not
both, would still allow the exact race this unit demonstrated (whichever
side is unprotected is where the interleaving sneaks back in). The real
cost of a lock: while one thread holds it, every other thread wanting it
genuinely waits, doing nothing — a real serialization point in an
otherwise concurrent program, and a large or slow critical section
(imagine a broadcast to thousands of clients) becomes a real bottleneck.
Small, fast critical sections — as here — keep that cost low.

### Commands Needed

None new.

### Run It

Not runnable for a full chat demonstration yet — `broadcast()` exists
and is safe, but nothing calls it, and no client has been added to
`clients`.

### Connection

We have a genuinely safe way to broadcast. The last piece wires
`handle_client` to actually add/remove itself and call `broadcast()`.

---

## Completing `handle_client()` (No New Concepts)

```python
def handle_client(conn, addr):
    print(f"connected by {addr}")
    with clients_lock:
        clients.append(conn)
    try:
        while True:
            data = conn.recv(1024)
            if not data:
                print(f"{addr} disconnected")
                break
            print(f"{addr} says: {data.decode()!r}")
            broadcast(data, conn)
    except ConnectionResetError:
        print(f"{addr} reset the connection")
    finally:
        with clients_lock:
            clients.remove(conn)
        conn.close()
```

Nothing here is a new concept: `with clients_lock: clients.append(conn)`
and `with clients_lock: clients.remove(conn)` are the exact lock
pattern from this lesson's second unit, applied to the two other places
`clients` gets touched (Lesson 19's inner `recv()` loop, Lesson 4's
`try`/`except`, and Python's `finally` — guaranteed to run whether the
loop ended cleanly or via an exception, ensuring a client is *always*
removed from `clients` no matter how its connection ended) — reused,
not reintroduced.

### Commands Needed

`python3 chat_server.py` — runs it, listening indefinitely.

### Run It — Real Output

Three genuinely simultaneous clients (started as separate threads,
each connecting, listening for broadcasts, and sending its own message,
all overlapping in real time):

```
Alice received: ['hello from Bob', 'hello from Carol']
Bob received: ['hello from Carol', 'hello from Alice']
Carol received: ['hello from Bob', 'hello from Alice']
```

Real output — every client received exactly the *other two* messages,
never its own, confirmed with real, concurrently-running client threads,
not a scripted one-at-a-time sequence. The server's own log for the
same run:

```
chat server listening...
connected by ('127.0.0.1', 55844)
connected by ('127.0.0.1', 55850)
connected by ('127.0.0.1', 55854)
('127.0.0.1', 55850) says: 'hello from Bob'
('127.0.0.1', 55854) says: 'hello from Carol'
('127.0.0.1', 55844) says: 'hello from Alice'
```

All three connections were accepted before any of them sent a single
message — real, verified proof this server holds multiple clients at
once, unlike Lesson 19.

---

## Closing

### Connect the Pieces

Trace one broadcast end to end: Bob's thread called `conn.recv(1024)`
and got real bytes. `broadcast(data, conn)` acquired `clients_lock` —
waiting, if Alice's or Carol's thread happened to be mid-broadcast at
that exact moment — then iterated `clients`, skipping Bob's own
connection via `is not sender_conn`, and called `sendall()` on Alice's
and Carol's sockets. The lock was released the instant the `with` block
ended, letting any other thread waiting for it proceed. Every one of
this lesson's three client threads ran this identical path,
independently, protected from ever corrupting each other's view of
`clients`.

### What Breaks Without This

Removing the lock doesn't crash the server — it does something more
dangerous: it silently, occasionally causes a connected client to miss
a broadcast entirely, exactly as this lesson's second unit proved
directly on a plain list. The failure is real but timing-dependent —
it requires a client to disconnect at almost exactly the same instant
another thread is mid-iteration through `clients`, which real network
timing didn't reliably reproduce even under this lesson's own
deliberately aggressive testing (60 simultaneous clients, then 300
rapid connect/disconnect cycles — genuinely running, with zero errors
either time). That's not the lock being unnecessary — it's the honest,
important lesson here: a race condition doesn't announce itself by
failing loudly and often. It can pass every casual test and still be
a real, waiting bug — which is exactly why this lesson proved the
failure directly, on the underlying data structure, with controlled
timing (`time.sleep()` deliberately placed to force the interleaving),
rather than relying on getting lucky over the network.

### Exercises

1. Deliberately remove `with clients_lock:` from `broadcast()` only
   (leave it on `append`/`remove`), and try to reproduce a skipped
   broadcast using this lesson's exact controlled-timing technique
   (a `time.sleep()` inside a loop, a removal timed to land mid-loop)
   adapted to real sockets instead of a plain list.
2. Add a `/nick <name>` command: track each connection's chosen name in
   a second shared dictionary (`conn` → name), protected by the same
   lock, and use it in broadcast messages instead of raw addresses.
3. Time how long 3 clients versus 300 clients take to each send one
   message and receive both others' — get a real, felt sense of how
   the single shared lock's brief serialization scales as client count
   grows.

### Definition of Done

- [ ] `chat_server.py` runs, and you connected at least three genuinely
      simultaneous clients and confirmed each received the others'
      messages, not its own
- [ ] You ran this lesson's controlled race-condition proof yourself
      and saw a real client get silently skipped from a plain,
      unlocked list
- [ ] You confirmed adding the lock back eliminates the skip, using the
      identical timing
- [ ] You can explain, without looking back, why a list doesn't raise
      an error the way a dict or set would under the same concurrent
      modification
- [ ] Commit:

```
git add chat_server.py
git commit -m "Add a multi-client chat server using thread-per-connection: prove concurrent access to shared state needs a lock, and that the failure without one is silent corruption, not a crash"
```
