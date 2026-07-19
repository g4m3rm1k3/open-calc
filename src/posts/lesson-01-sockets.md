# Lesson 1: Speaking to Another Process Across a Wire
### (Sending a Message Between Two Programs With Sockets)

**What you will build.** Two tiny Python scripts — `server.py` and
`client.py` — running as separate processes. The client connects to the
server over the network stack (using `127.0.0.1`, your own machine,
standing in for a second computer) and sends it a text message; the
server prints what it received. The feature is deliberately small. The
transferable problem underneath it is not: *any two programs that don't
share memory — on the same machine, or on two machines across the
world — talk to each other the same way*: open a channel, agree on an
address, send bytes, receive bytes, close the channel. Once this clicks,
"send a message to another PC" and "send a message to a program on your
own PC" are the same skill.

**What you need to know first.** Nothing from this curriculum — this is
Lesson 1. I'm assuming your stated Python basics: variables, `print`,
`if`/`for`, functions, strings. I am **not** assuming you know: `import`,
tuples, the `with` statement, or the difference between text and bytes.
Those all get their own throwaway labs below, per the Concept Isolation
Rule, even though some of them will look "simple" once you see them.

No pipeline diagram — this curriculum doesn't have an established
multi-stage pipeline yet. Lesson 1 starts one implicitly (`Program →
Socket → Network → Socket → Program`), which later networking lessons
will restate and extend.

---

## Concept Unit: The `import` Statement

### The Problem

Everything you've written so far has used only what Python gives you by
default: `print`, `if`, loops, math operators. But Python doesn't load
*everything* it's capable of by default — networking, dates, random
numbers, and hundreds of other capabilities live in separate bundles of
code called **modules**, and you have to explicitly ask for the one you
want before you can use it. Right now, if you tried to use anything
networking-related, Python wouldn't recognize it — it isn't loaded.

### Introduce the Concept in Isolation

```python
import math
print(math.sqrt(16))
```

Run it:

```
4.0
```

This proves two things: `import math` made a whole bundle of
math-related tools available under the name `math`, and `math.sqrt` —
name, dot, name — is how you reach *inside* that bundle to use one
specific tool from it. Nothing here is project code; `math` will never
appear in our networking scripts. It's here only to prove what `import`
does.

### Discard the Throwaway Example

This `math.sqrt` example is now discarded. It won't appear again — it
only existed to isolate what `import` does.

### Project Change

- **Files affected:** `server.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** none; `socket` ships with Python itself, no
  installation needed

### The New Code

```python
import socket
```

### The Updated Project

This is the entire file so far — nothing to elide, nothing surrounding
it yet:

```python
import socket
```

That's it. `server.py` currently does one thing: it makes the `socket`
module's tools available under the name `socket`. Nothing is connected
to a network yet — we've only unlocked the toolbox.

### Mechanical Walkthrough

Enumerating the line: `import` (first appearance — a keyword that loads
a module and binds it to a name), `socket` (first appearance — the name
of the standard-library module containing every networking tool we'll
use in this lesson). There is nothing else on this line.

### CS Lens

This is **namespacing** — keeping every piece of code from colliding by
requiring you to reach into a named bundle (`socket.whatever`) instead of
dumping every function from every library into one giant shared pool.
Also recognized in: file-system paths (`folder/file`, same idea —
scoped names), Java/C# package imports, CSS class scoping in modern
frameworks, DNS itself (`mail.google.com` — a name inside a name inside
a name).

### SE Lens

The alternative Python *could* have chosen is auto-loading every
built-in capability into every program by default. It doesn't, because
that would mean every program pays the memory and startup cost of
features it never uses, and two libraries that happen to both define
something called `connect` would silently clash. The tradeoff `import`
makes instead: a small amount of extra typing, in exchange for programs
that only load what they actually need and never collide by accident.

### Commands Needed

None yet — this file doesn't run anything observable on its own.

### Run It

Not runnable standalone yet — a single `import` line produces no
output. It will connect to the next unit, where we actually create a
socket with it.

### Connection

`socket` is now loaded. The next unit uses it to create the actual
object that represents a network connection point.

---

## Concept Unit: Tuples

### The Problem

In a moment we're going to need to describe a network address — a
machine (`127.0.0.1`) *and* a port number (`65432`) — as a single value
we can pass around together. A single value that bundles two related-but-
different pieces feels like it should be a new kind of thing, not two
separate variables you have to keep in sync by hand.

### Introduce the Concept in Isolation

```python
point = (3, 5)
print(point)
print(type(point))

x, y = point
print(x, y)
```

Run it:

```
(3, 5)
<class 'tuple'>
3 5
```

This proves a **tuple** — values in parentheses, comma-separated — bundles
several values into one, and that bundle can be **unpacked** back into
separate names (`x, y = point`) whenever you need the pieces individually.
This `point` example is scaffolding only; it's discarded now and will not
reappear.

### Discard the Throwaway Example

Discarded — `point` was only here to prove what a tuple is and how
unpacking works.

### Project Change

- **Files affected:** `server.py`
- **Change type:** add
- **Location:** after the `import socket` line
- **Dependencies:** the `socket` import from the previous unit

### The New Code

```python
HOST = "127.0.0.1"
PORT = 65432
```

*(No tuple written yet — but note these two related values, sitting as
two separate variables. Watch what happens to them in the next unit.)*

### The Updated Project

```python
import socket

HOST = "127.0.0.1"   # ← new
PORT = 65432          # ← new
```

The file now defines the address the server will listen on: the loopback
address (your own machine, standing in for a real IP later) and an
arbitrary port number above 1024 (ports below that are reserved by the
OS). Nothing is bound or listening yet — these are just labeled values.

### Mechanical Walkthrough

`HOST` and `PORT` — both first appearance as *names*, but they're just
variable assignment, already-basic syntax from your Python background —
no new unit owed for assignment itself. `"127.0.0.1"` — a string, also
already basic. `65432` — an integer literal, already basic. Nothing here
is new *syntax*; what's new is the upcoming *use* of these two values
together as a tuple, which the next code block shows.

### CS Lens

Not a hard concept on its own (plain assignment) — skipped per the
Stopping Rule.

### SE Lens

Naming these as constants (`HOST`, `PORT`, uppercase by convention) up
top instead of typing `"127.0.0.1"` and `65432` inline where they're used
means changing the address later — say, to listen on all network
interfaces instead of just localhost — is a one-line edit instead of a
hunt through the file. The cost: one more thing to scroll past at the
top of a small file. For a file this size, worth it; in a real codebase
this graduates into a config file, which a later lesson will cover.

### Commands Needed

None.

### Run It

Not runnable standalone — no output-producing statements yet.

### Connection

We now have the two pieces of an address as separate values. The next
unit is where they actually get combined into the tuple form `socket`
requires, at the same moment we create the socket itself.

---

## Concept Unit: Creating a Socket Object

### The Problem

We have `socket` loaded and an address in mind. Now we need the actual
*thing* that represents "a network connection point" — an object that
knows how to send and receive bytes over TCP/IP, that we can then tell
to bind, listen, connect, send, or receive.

### Introduce the Concept in Isolation

```python
import socket

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
print(s)
s.close()
```

Run it:

```
<socket.socket fd=3, family=2, type=1, proto=0, laddr=('0.0.0.0', 0)>
```

This proves `socket.socket(...)` returns an actual object (Python shows
you its internal state when printed) — not a number, not a string, a
live handle to a system resource, tagged with an `fd` (file descriptor —
the OS's internal ID for it). This throwaway `s` is discarded now.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `server.py`
- **Change type:** add
- **Location:** after the `HOST`/`PORT` lines
- **Dependencies:** `socket` import, `HOST`/`PORT` constants

### The New Code

```python
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
```

### The Updated Project

```python
import socket

HOST = "127.0.0.1"
PORT = 65432

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  # ← new
```

The file now creates one live socket object and holds onto it as
`server_socket`. It isn't bound to the address yet and isn't listening —
just created, sitting idle, ready to be configured.

### Mechanical Walkthrough

`socket.socket(...)` — first appearance: calling the `socket` module's
`socket` **class** as a constructor, producing a new socket object.
`socket.AF_INET` — first appearance: a constant meaning "use IPv4
addressing" (as opposed to IPv6, Bluetooth, or other address families
`socket` also supports). `socket.SOCK_STREAM` — first appearance: a
constant meaning "use TCP" — a reliable, ordered, connection-based
stream (as opposed to `SOCK_DGRAM`, UDP, which is connectionless and can
drop or reorder messages — not covered this lesson). `server_socket = `
— plain assignment, already basic.

### CS Lens

This is the **socket abstraction**: the OS exposes "a network
connection" through the same kind of handle it uses for files, so the
same mental model (open it, read/write it, close it) applies to
completely different underlying hardware. Also recognized in: file
descriptors in Unix generally, pipes between processes, even
`stdin`/`stdout` — all "just a handle you read and write."

### SE Lens

`AF_INET` + `SOCK_STREAM` is a deliberately low-level pair of choices
Python exposes directly rather than hiding behind one friendlier
"make me a TCP socket" function. The tradeoff: more to type and
remember up front, but it means the exact same `socket` module also
gives you UDP, IPv6, and Unix domain sockets by changing these two
arguments — one API instead of four incompatible ones. The cost this
project is currently carrying: nothing handles the case where socket
creation itself fails (wrong family/type combination, OS resource
limits) — no `try`/`except` yet. That's acceptable for a first lesson;
it's real debt a later lesson on error handling will pay down.

### Commands Needed

None.

### Run It

Not runnable standalone — creating a socket produces no output by
itself.

### Connection

We now hold a real socket object. The next unit uses the `with`
statement so this socket gets cleaned up automatically instead of us
having to remember to close it by hand.

---

## Concept Unit: The `with` Statement (Context Managers)

### The Problem

`server_socket.close()` is a real method we could call by hand — but if
an error happens anywhere between opening the socket and closing it, that
`close()` call gets skipped, and the socket leaks (stays open, holding a
system resource) until the program exits. We want "open it, use it,
*guarantee* it gets closed" as one unit, not something we have to
remember.

### Introduce the Concept in Isolation

```python
print("before")
with open("scratch.txt", "w") as f:
    f.write("hello")
    print("inside, file open:", not f.closed)
print("after, file open:", not f.closed)
```

Run it:

```
before
inside, file open: True
after, file open: False
```

This proves `with` opens a resource, hands it to you under a name (`f`),
and **guarantees** it's closed the instant you leave the indented block —
even though we never called `f.close()` ourselves. (`open()` here is only
scaffolding to have *something* to demonstrate `with` on — file I/O
itself isn't a concept this lesson needs and won't reappear.)

### Discard the Throwaway Example

Discarded — the file-writing example was only here to prove what `with`
guarantees.

### Project Change

- **Files affected:** `server.py`
- **Change type:** refactor — replace the plain assignment from the
  previous unit with a `with` block
- **Location:** the `server_socket = socket.socket(...)` line
- **Dependencies:** everything built so far in this file

### The New Code

```python
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
```

### The Updated Project

```python
import socket

HOST = "127.0.0.1"
PORT = 65432

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:  # ← new
    pass  # everything from here on happens inside this block
```

The socket is now created and guaranteed-closed by the `with` block
instead of a bare assignment. `pass` is a temporary placeholder — every
remaining unit in this lesson adds real code *inside* this block,
replacing `pass`.

### Mechanical Walkthrough

`with` — first appearance: a keyword that wraps a block, guaranteeing
cleanup on exit even if an error occurs partway through. `as
server_socket` — first appearance of this exact pattern: names the
value the `with` expression produces (here, the socket object itself)
so the indented block can use it. `pass` — first appearance: a
do-nothing statement, used only because Python requires an indented
block to contain *something*; it will be deleted the moment real code
takes its place.

### CS Lens

This is **RAII-style resource management** (Resource Acquisition Is
Initialization) — tying a resource's lifetime to a block's scope so
cleanup can't be forgotten. Also recognized in: C++ destructors,
database connection pools, mutex locks in concurrent code, `try`-with-
resources in Java — anywhere "acquire, guaranteed-release" needs to be
one indivisible unit.

### SE Lens

The alternative — `server_socket = socket.socket(...)` followed by a
manual `server_socket.close()` at the end — was actually our code one
unit ago. The problem it has: if any line between creation and `close()`
raises an error, `close()` is skipped and the socket leaks. `with` costs
one extra keyword and one extra level of indentation for everything that
follows; it buys a guarantee that's impossible to accidentally break.

### Commands Needed

None.

### Run It

Not runnable for meaningful output yet — `pass` does nothing observable.
Next units replace `pass` with the actual bind/listen/accept sequence.

### Connection

We now have a socket that will always clean itself up. Every remaining
line of the server goes inside this block.

---

## Concept Unit: Binding and Listening

### The Problem

A socket exists, but it isn't attached to any address yet, and it isn't
waiting for anyone to connect. Two separate steps are needed: claim an
address (`bind`), then announce "I'm ready to accept connections at that
address" (`listen`).

### Introduce the Concept in Isolation

Skipped — per the Concept Isolation Rule's own carve-out, this step is
skipped only when the exact construct already got a lab earlier in the
curriculum. It hasn't. But `bind`/`listen` are method calls on an object
we already fully understand (a socket, per the previous unit) taking a
tuple (already lab'd) as their argument — there is no new *syntax* here,
only new *methods* whose behavior is simple enough to state directly:
`bind` claims an address for this socket; `listen` puts it into a mode
where it will queue incoming connection attempts instead of rejecting
them. Per the Stopping Rule, this doesn't warrant a separate throwaway
lab — the underlying idea (call a method, pass a tuple) has already been
proven; only the specific method names are new, and they're descriptive
enough to state plainly rather than manufacture an artificial example
around.

### Project Change

- **Files affected:** `server.py`
- **Change type:** replace — the `pass` placeholder
- **Location:** inside the `with` block from the previous unit
- **Dependencies:** `server_socket`, `HOST`, `PORT`

### The New Code

```python
server_socket.bind((HOST, PORT))
server_socket.listen()
```

### The Updated Project

```python
import socket

HOST = "127.0.0.1"
PORT = 65432

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
    server_socket.bind((HOST, PORT))  # ← new
    server_socket.listen()             # ← new
```

The server now claims `127.0.0.1:65432` as its address and sits waiting
for connection attempts. It doesn't yet do anything when one arrives —
that's the next unit.

### Mechanical Walkthrough

`server_socket.bind(...)` — first appearance: a method that claims a
specific address for this socket; raises an error if something else on
the machine already claimed that exact host/port. `(HOST, PORT)` — this
*is* the tuple concept from two units ago, reappearing: two separate
variables, combined into one tuple, because `bind` requires the address
as a single argument, not two. Worth naming explicitly since it's the
first real *use* of a tuple, not just a demonstration of one.
`server_socket.listen()` — first appearance: a method with no arguments
that switches the socket into "queue incoming connections" mode; called
with nothing here, meaning "use the default queue size."

### CS Lens

Not a hard concept beyond the socket abstraction and tuples already
covered — skipped per the Stopping Rule; no new CS idea, just new API
surface on an idea already taught.

### SE Lens

`bind` and `listen` are two separate calls rather than one combined
"start server" call because they can fail independently and for
different reasons — `bind` fails if the address is taken; `listen` fails
if the OS is out of resources for the queue. Splitting them lets code
(in a more robust version than this lesson's) handle each failure
differently. The debt here: no `try`/`except` around either call, so if
port `65432` is already in use, the program crashes with a raw Python
traceback instead of a clear message — acceptable for now, flagged for a
later lesson.

### Commands Needed

None yet.

### Run It

Not runnable for observable output — the server is now waiting silently.
The next unit is what actually produces visible output when a
connection arrives.

### Connection

The server is now genuinely listening on the network. The next unit is
`accept()` — the call that actually blocks and waits for a client.

---

## Concept Unit: Accepting a Connection

### The Problem

The server is listening, but nothing happens until some other program
actually tries to connect. We need a call that pauses the server,
waiting specifically for that moment, and then hands back something we
can use to talk to *that specific* connecting client.

### Introduce the Concept in Isolation

Skipped, for the same reason as the previous unit — `accept()` is a
method call (already-known pattern) whose return value is a tuple
(already lab'd). The one genuinely new piece is that this particular
tuple has two *different-typed* elements unpacked at once, which the
mechanical walkthrough below covers directly rather than via a
disconnected toy example, since the real call *is* already about as
minimal as a toy example would be.

### Project Change

- **Files affected:** `server.py`
- **Change type:** add
- **Location:** inside the `with` block, after `server_socket.listen()`
- **Dependencies:** `server_socket`, now in listening mode

### The New Code

```python
conn, addr = server_socket.accept()
```

### The Updated Project

```python
import socket

HOST = "127.0.0.1"
PORT = 65432

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
    server_socket.bind((HOST, PORT))
    server_socket.listen()
    conn, addr = server_socket.accept()  # ← new
```

The server now blocks — pauses execution entirely — at this line, until
some other program connects to `127.0.0.1:65432`. The moment that
happens, it resumes, holding two new values: a socket for talking to
that specific client, and that client's address.

### Mechanical Walkthrough

`server_socket.accept()` — first appearance: a **blocking** call (the
program does nothing else, uses no CPU, just waits) until a client
connects, then returns a tuple. `conn, addr = ...` — this is tuple
unpacking, the exact concept from the Tuples unit, reappearing for its
first real use: `accept()`'s return value is a two-element tuple, and
this line splits it into two names in one step. `conn` — first
appearance conceptually: a **new, separate socket**, distinct from
`server_socket`, specifically for exchanging data with this one client
— `server_socket` itself keeps only listening for *further* new
connections. `addr` — the connecting client's own `(host, port)` tuple.

### CS Lens

This is the listening-socket-vs-connection-socket split fundamental to
TCP servers: one socket's job is only to *announce presence and accept*,
a separate socket per client handles *actual data transfer*. Also
recognized in: how every production web server handles concurrent
clients, phone-system call routing (one receptionist line, routed to
individual extensions), restaurant hosts seating parties at separate
tables.

### SE Lens

Handing back a *new* socket per connection, instead of reusing
`server_socket` for data too, is what makes it possible for a server to
later handle multiple simultaneous clients (a loop calling `accept()`
repeatedly, one new `conn` each time) — a real production server does
exactly that. Our version accepts exactly one client and stops; that's a
real limitation, not a hidden one — a later lesson on loops-plus-sockets
removes it.

### Commands Needed

None.

### Run It

Still not runnable for full output alone — we're now correctly blocked
waiting for a client that doesn't exist yet. The next unit gives the
server something to *do* with `conn` once a client shows up, and then we
build the client itself.

### Connection

The server now has a private channel (`conn`) to one specific client, the
moment one connects. The next unit uses that channel to actually receive
bytes.

---

## Concept Unit: Receiving Bytes, and Bytes vs. Text

### The Problem

`conn` can exchange raw data with the client — but "raw data" over a
network is not Python strings. It's a sequence of raw bytes with no
inherent notion of "these bytes are text" until something decodes them
that way. We need to both receive that raw data and convert it back into
a readable string.

### Introduce the Concept in Isolation

```python
text = "hi"
data = text.encode()
print(text, type(text))
print(data, type(data))
print(data.decode())
```

Run it:

```
hi <class 'str'>
b'hi' <class 'bytes'>
hi
```

This proves `str` and `bytes` are genuinely different types — notice the
`b` prefix Python shows for a bytes value — and that `.encode()` /
`.decode()` are the two directions of conversion between them. This
example is discarded; `text`/`data` won't reappear.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `server.py`
- **Change type:** add, plus wrap the existing `conn` in its own `with`
  block for the same guaranteed-cleanup reason as `server_socket`
- **Location:** inside the outer `with` block, right after
  `server_socket.accept()`
- **Dependencies:** `conn` from the previous unit

### The New Code

```python
with conn:
    data = conn.recv(1024)
    print("Received:", data.decode())
```

### The Updated Project

```python
import socket

HOST = "127.0.0.1"
PORT = 65432

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
    server_socket.bind((HOST, PORT))
    server_socket.listen()
    conn, addr = server_socket.accept()
    with conn:                                    # ← new
        print("Connected by", addr)                # ← new
        data = conn.recv(1024)                      # ← new
        print("Received:", data.decode())            # ← new
```

`server.py` is now complete. It creates a listening socket, blocks until
one client connects, receives up to 1024 bytes from that client, and
prints them as text — and both sockets (`server_socket` and `conn`) are
guaranteed closed when the block ends, even if `recv` or `decode` raises
an error.

### Mechanical Walkthrough

`with conn:` — the exact `with` concept from earlier, reapplied to a
different object (a connection socket instead of a listening one) — a
reminder, not a re-explanation, per the Repetition Rule. `print(
"Connected by", addr)` — `print` with two arguments and a comma; already
basic. `conn.recv(1024)` — first appearance: a blocking call that waits
for data to arrive on this connection and returns it as **bytes** (not
text), up to `1024` bytes at a time (the maximum chunk size to read in
one call — real messages can require multiple `recv` calls, not covered
this lesson). `data.decode()` — the `decode` concept from the throwaway
lab, reappearing for its first real use: converting the raw bytes we
received back into a readable `str`.

### CS Lens

Bytes-vs-text is the **encoding boundary** — anywhere data crosses from
"just a sequence of bits" to "text with a specific meaning," something
has to agree on the rule for that translation (here, UTF-8, Python's
default). Also recognized in: reading any file from disk, HTTP request
bodies, every character-encoding bug you'll ever debug, JSON parsing.

### SE Lens

`recv(1024)` is a deliberately manual, low-level read — you ask for *up
to* some number of bytes, and you might get fewer, requiring a loop to
reliably get a longer message (not built here). The alternative would be
a higher-level API that always hands you "the whole message" — Python's
`socket` module intentionally doesn't do that, because at the raw TCP
level there is no such thing as "a whole message," only a stream of
bytes; deciding where one message ends is an application-level problem,
covered by a later lesson on message framing. This lesson's version
works only because we know in advance the client sends fewer than 1024
bytes in a single `send` call — a real limitation, not a hidden one.

### Commands Needed

None — we're not running `server.py` alone yet; it'll block forever
waiting for a client. The next section builds that client and runs both
together.

### Run It

Not runnable alone (it would hang at `accept()` with nothing to connect).
Held until the client exists — see below.

### Connection

`server.py` is finished. Everything from here builds `client.py`, using
concepts already taught in this lesson — no new units needed for it.

---

## Building `client.py` (No New Concepts)

Every piece here — `import`, tuples, creating a socket, `with`,
`.encode()` — was already taught above. Per the Repetition Rule this gets
a brief reminder, not new units: `connect()` is the client-side mirror of
the server's `bind()`+`listen()`+`accept()` — instead of waiting for
someone to arrive, it actively reaches out to an address. `send()` is
the mirror of `recv()` — instead of receiving bytes, it transmits them,
so the string has to be `.encode()`d first, same as the server had to
`.decode()` what it received.

```python
import socket

HOST = "127.0.0.1"
PORT = 65432

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client_socket:
    client_socket.connect((HOST, PORT))
    client_socket.send("Hello from the client!".encode())
```

### Commands Needed

Two terminal windows (or one terminal running the server in the
background). `python3 server.py` — runs the Python interpreter (`python3`
— the program) against the file `server.py` (the argument — which file to
execute). `python3 client.py` — same, for the client.

### Run It — Real Output

Server, started first, then client run against it:

```
$ python3 server.py
Connected by ('127.0.0.1', 40588)
Received: Hello from the client!
```

That's the actual output from running both scripts against each other —
the client connected from an OS-assigned port (`40588`, different every
run — you didn't choose it, only the server's port `65432` is fixed), and
the server received and decoded exactly the string the client sent.

---

## Closing

### Connect the Pieces

Trace the string `"Hello from the client!"` through every unit built
this lesson: it starts as a Python `str` in `client.py`. `.encode()`
turns it into `bytes`. `client_socket.connect((HOST, PORT))` uses a
tuple to reach the address `server_socket` claimed with `bind` and
opened with `listen`. The bytes travel over the loopback network
interface. `server_socket.accept()` — blocked since the moment it ran —
wakes up, handing back `conn` (a socket private to this client) and
`addr`. `conn.recv(1024)` reads the bytes back out. `.decode()` turns
them back into the same string, now printed by the server. Every `with`
block closes its socket automatically as the program ends — no leaked
resources, even though we never wrote a single `.close()` call.

### What Breaks Without This

Remove `server_socket.listen()` and re-run:

```python
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
    server_socket.bind((HOST, PORT))
    # server_socket.listen()   <- removed
    conn, addr = server_socket.accept()
```

Running the server now and then the client produces, on the server side:

```
OSError: [Errno 22] Invalid argument
```

`accept()` requires the socket to already be in listening mode — `bind`
alone only claims the address, it doesn't put the socket into a state
that can accept connections at all. Restore the `listen()` line and the
server works again.

### Exercises

1. Change `PORT` to a different number in *both* files and confirm it
   still works — this proves the port number isn't magic, it's just an
   agreed-upon value both sides must match.
2. Change the client's message to something longer, and print
   `len(data)` on the server side to see how many bytes actually arrived.
3. Try running two clients, one after another, against the same server
   run — predict what happens before you try it (hint: the server only
   calls `accept()` once).

### Definition of Done

- [ ] `server.py` and `client.py` both exist and run as shown above
- [ ] You can explain, without looking back, why `bind` and `listen` are
      separate calls
- [ ] You can explain why `.encode()`/`.decode()` are both needed, and
      where the boundary between text and bytes actually sits
- [ ] You ran the "what breaks" experiment yourself and saw the real
      error
- [ ] Commit:

```
git init
git add server.py client.py
git commit -m "Add minimal TCP client/server: prove that two processes with no shared memory can exchange data once they agree on an address, a byte encoding, and who calls accept() vs connect()"
```
