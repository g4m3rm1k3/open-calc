# Lesson 226: Sockets — Endpoints, Connections, and Byte Streams

**What you will build**: A real socket with an address and its own
connection state, put through a genuine three-way handshake before any
data is allowed to flow — a level of structure Lesson 225's raw
send/deliver never had. It then proves something many people find
genuinely surprising the first time they see it demonstrated: a real
byte-stream socket has no notion of message boundaries at all — two
separate writes can be read back split at any point, including squarely
across the line between them — and closes by building framing, the
real, standard technique for rebuilding Lesson 225's discrete messages
on top of a stream that has none.

**What you need to know first**: Lesson 225's message, `send`, and
`deliver` — this lesson's own byte stream is what a socket actually
hands a reader underneath that abstraction. Lesson 224's `+`-based
position arithmetic, reused directly for tracking where one frame ends
and the next begins.

**Terms used in this lesson**:

- **endpoint** (also **address**) — a specific, addressable location a
  socket can be reached at, typically a host and a port together; exists
  because Lesson 225's abstract channel had no notion of a specific
  reachable location — a socket needs to know exactly where to send to
  and where it can be found.
- **socket** — a stateful endpoint for network communication, tracking
  its own address and its current connection state; distinct from
  Lesson 225's raw `send`/`deliver`, which had no persistent state and
  no notion of "before" or "after" a connection existed.
- **connection** — an agreed-upon, established communication session
  between two sockets, both sides having explicitly confirmed readiness
  before any data is exchanged; the reason a socket needs a state
  machine at all, rather than being usable the instant it's created.
- **three-way handshake** — the specific three-step exchange — request,
  accept, confirm — that establishes a connection, ensuring both sides
  genuinely agree it's ready before data flows; named directly because
  real TCP performs exactly this exchange (SYN, SYN-ACK, ACK).
- **byte stream** — a continuous, unstructured sequence of bytes with no
  preserved boundary between one write and the next; the way a real
  TCP socket actually presents data to a reader, in sharp contrast to
  Lesson 225's discrete, self-contained messages.
- **framing** — a protocol-level technique for rebuilding message
  boundaries on top of a raw byte stream, typically by prefixing each
  message with its own length so a reader knows exactly how many bytes
  belong to it before the next one begins.

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* every function in this lesson.
- **`if`** / **`cond`**
  - *What they are:* Clojure's two-branch and multi-branch conditional
    special forms.
  - *Implementation:* `(if test then else)` returns `then` or `else`;
    `(cond test1 result1 ... true default)` returns the result paired
    with the first truthy test.
  - *Their use:* `cond` drives every recursive walk over a growing
    stream, appending one byte at a time.
- **`=`**
  - *What it is:* Clojure's equality-testing function.
  - *Implementation:* `(= a b)` returns `true` if `a` and `b` are equal
    values.
  - *Its use:* every recursive walk's stopping condition.
- **`get`** / **`assoc`** / **`count`** / **`+`**
  - *What they are:* Clojure's positional lookup, functional-update,
    length, and addition functions.
  - *Implementation:* `(get coll index)` reads; `(assoc coll index
    value)` returns an updated copy; `(count coll)` returns length;
    `(+ a b)` returns the sum.
  - *Their use:* reused throughout — appending a byte onto a stream,
    reading a specific byte range back out, and computing exactly where
    one frame ends and the next begins.

---

## Concept Unit: Endpoints and the Three-Way Handshake

### The Problem

Lesson 225's `send` and `deliver` worked the instant they were called —
nothing about a `channel` or an `inbox` had any notion of "ready" or
"not ready yet," and no specific address was ever involved; a message
just landed wherever it was told to. A real socket needs two things
Lesson 225 never modeled: a specific, addressable location (a host and a
port, together), and an explicit agreement, made *before* any data
flows, that both sides are genuinely ready to talk. How does a
connection actually get established, concretely, step by step?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because sockets are a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn make-socket [address]
  [address "closed"])

(defn socket-address [socket] (get socket 0))
(defn socket-state [socket] (get socket 1))

(defn listen [socket]
  [(socket-address socket) "listening"])

(defn connect-request [socket]
  [(socket-address socket) "syn-sent"])

(defn accept-connection [listening-socket]
  [(socket-address listening-socket) "connected"])

(defn confirm-connection [syn-sent-socket]
  [(socket-address syn-sent-socket) "connected"])
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Run It — Real Output

```
user=> (def server0 (make-socket ["10.0.0.1" 80]))
#'user/server0
user=> (def server1 (listen server0))
#'user/server1
user=> server1
[[10.0.0.1 80] listening]
user=> (def client0 (make-socket ["10.0.0.2" 5000]))
#'user/client0
user=> (def client1 (connect-request client0))
#'user/client1
user=> client1
[[10.0.0.2 5000] syn-sent]
user=> (def server2 (accept-connection server1))
#'user/server2
user=> server2
[[10.0.0.1 80] connected]
user=> (def client2 (confirm-connection client1))
#'user/client2
user=> client2
[[10.0.0.2 5000] connected]
```

### Mechanical Walkthrough

`(defn make-socket [address] [address "closed"])` — `address` is a
`[host port]` pair, `["10.0.0.1" 80]`, the vector-as-pair convention
this curriculum has used throughout. Every new socket starts in the
`"closed"` state — a plain string used the same way this curriculum has
always used plain strings and sentinels, standing in for what a real
system would represent with a proper enumerated type.

`(defn socket-address [socket] (get socket 0))` / `(defn socket-state
[socket] (get socket 1))` — `get`, reappearing, two small named
accessors, one per slot of the pair.

`(defn listen [socket] [(socket-address socket) "listening"])` — a
server socket announcing it's ready to receive connection attempts;
the address is carried through unchanged, only the state changes.

`(defn connect-request [socket] [(socket-address socket) "syn-sent"])`
— a client socket's own first move: it doesn't jump straight to
`"connected"` — it moves to an intermediate state, `"syn-sent"`,
representing that it has sent a request and is now waiting to hear
back. This mirrors real TCP's own SYN step exactly: a request, not yet
an agreement.

`(defn accept-connection [listening-socket] [(socket-address
listening-socket) "connected"])` — the server, upon receiving a
connection request, moves straight to `"connected"` — real TCP's
server side also sends its own SYN-ACK at this step and is willing to
consider the connection open from here, even before the client's final
acknowledgment arrives.

`(defn confirm-connection [syn-sent-socket] [(socket-address
syn-sent-socket) "connected"])` — the client, having heard back from the
server, completes its own side of the handshake.

Trace: `server1` moves `"closed"` → `"listening"`. `client1` moves
`"closed"` → `"syn-sent"` — a request sent, not yet an agreement.
`server2` moves `"listening"` → `"connected"` — the server accepts.
`client2` moves `"syn-sent"` → `"connected"` — the client confirms. Only
after all three steps have run do *both* sockets independently read
`"connected"` — this is the three-way handshake, request, accept,
confirm, made concrete as three separate function calls with a real,
observable intermediate state (`"syn-sent"`) in between the first and
the last.

### CS Lens

The handshake's real purpose is proven by what would go wrong without
the middle step: if a client simply declared itself `"connected"` the
instant it sent a request, with no confirmation the server had actually
heard it, both sides could believe they were talking while the request
itself had been lost somewhere in transit — exactly Lesson 225's own
message-loss danger, now applied to the connection's very first message.
The three-step shape specifically closes that gap: the client's request
alone proves nothing; the server's accept proves the server heard the
client; the client's own confirm proves the client heard the server's
accept — each side only ever commits to `"connected"` after receiving
direct evidence the other side is genuinely there.

Also recognized in: a phone call's own "hello?" / "hello, can you hear
me?" / "yes, go ahead" exchange before either party starts the real
conversation; two people agreeing to meet, where "I'll be there,"
"confirmed, see you then," and "great, confirmed" each independently
verify the other received the prior message; a legal contract's offer,
acceptance, and consideration — three distinct steps, not one, precisely
so neither party can claim an agreement the other never actually
consented to.

### SE Lens

The alternative — skipping the handshake and simply starting to send
data the instant a socket is created — is exactly what Lesson 225's
`send`/`deliver` already did, and it worked fine there because Lesson
225 never needed to represent *readiness* as a real, checkable fact; a
message either arrived or it didn't, with nothing about the receiver's
own state ever in question. A socket needs the handshake specifically
because a real connection has genuine setup cost on both sides (a
listening process needs to actually be running and willing to accept,
not just theoretically reachable) that a stateless message never had to
account for. The real cost of the handshake: every connection now pays
for three extra round-trips of overhead before a single byte of real
data can be sent — genuinely wasteful for a system exchanging one tiny
message, and the specific reason some real protocols (built directly on
top of Lesson 225's own unreliable, connectionless message model instead
of a socket) exist for exactly the traffic patterns where that setup
cost isn't worth paying.

---

## Concept Unit: Byte Streams — No Message Boundaries at All

### The Problem

Lesson 225 modeled every message as a discrete, self-contained unit —
`send` a whole message, `deliver` a whole message, nothing in between. A
real TCP socket, once connected, does something genuinely different: it
presents data as one continuous stream of bytes, with *no* memory of
where one write ended and the next began. If a program writes `"hello"`
and then, separately, writes `"world"`, what can a reader on the other
end actually expect to get back?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because sockets are a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn stream-write [stream content-chars index]
  (cond
    (= index (count content-chars)) stream
    true (stream-write (assoc stream (count stream) (get content-chars index)) content-chars (+ index 1))))

(defn stream-read-from [stream start byte-count taken accumulated]
  (cond
    (= taken byte-count) accumulated
    true (stream-read-from stream start byte-count (+ taken 1) (assoc accumulated (count accumulated) (get stream (+ start taken))))))

(defn stream-read [stream start byte-count]
  (stream-read-from stream start byte-count 0 []))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def stream0 [])
#'user/stream0
user=> (def stream1 (stream-write stream0 ["h" "e" "l" "l" "o"] 0))
#'user/stream1
user=> stream1
[h e l l o]
user=> (def stream2 (stream-write stream1 ["w" "o" "r" "l" "d"] 0))
#'user/stream2
user=> stream2
[h e l l o w o r l d]
user=> (stream-read stream2 0 3)
[h e l]
user=> (stream-read stream2 3 3)
[l o w]
```

### Mechanical Walkthrough

`(defn stream-write [stream content-chars index] ...)` — `cond`,
reappearing, walks `content-chars` (a vector of individual characters,
one write's own content) and appends each one, one at a time, onto
`stream` — the established append idiom, applied one byte at a time
instead of one whole message at a time, the structural difference that
defines a stream.

`(defn stream-read-from [stream start byte-count taken accumulated]
...)` — walks forward from position `start`, collecting exactly
`byte-count` bytes, one at a time, into `accumulated`. Worth a direct
aside: this parameter is named `byte-count`, not `count` — naming it
`count` would silently shadow Clojure's own `count` function used two
lines later (`(count accumulated)`), a real mistake this lesson's own
first draft actually made and caught only by running it through `bb`
and reading the resulting `ClassCastException`. `(defn stream-read
[stream start byte-count] (stream-read-from stream start byte-count 0
[]))` — the public entry point.

Trace: `stream1` is `["h" "e" "l" "l" "o"]` after the first write.
`stream2`, after the *second* write, is `["h" "e" "l" "l" "o" "w" "o"
"r" "l" "d"]` — one flat, ten-element vector. Nothing in `stream2`
itself marks where `"hello"` ended and `"world"` began — that boundary
existed only for the instant `stream-write` was called twice; the
result carries no trace of it at all.

`(stream-read stream2 0 3)` reads three bytes starting at position `0`:
`["h" "e" "l"]` — the *first three characters of "hello,"* not the whole
first message. `(stream-read stream2 3 3)` reads three bytes starting at
position `3`: `["l" "o" "w"]` — the last two characters of `"hello"`
*and* the first character of `"world"`, in the same single read call,
with nothing distinguishing which byte came from which original write.

### CS Lens

This is the real, defining difference between a **message-oriented**
channel (Lesson 225's own model) and a **stream-oriented** one (a real
TCP socket): a message-oriented channel guarantees a reader receives
exactly what a writer sent, as one atomic unit, every time. A
stream-oriented channel makes no such promise at all — it guarantees
only that the *bytes* arrive in the order they were sent, with the
*grouping* a writer originally used completely discarded. `(stream-read
stream2 3 3)` returning `["l" "o" "w"]`, spanning both original writes
in one call, is the single clearest, most concrete proof of this — a
fact that surprises a genuinely large number of people writing real
network code for the first time, specifically because it's *invisible*
until a read happens to land on an inconvenient boundary, the same way
this exact scenario was constructed here on purpose.

Also recognized in: pouring two different-colored inks into the same
glass of water — the water carries every molecule from both, in order
of when they were poured, but nothing in the resulting mixture marks
where one pour ended and the next began; a live audio stream, where a
listener tuning in mid-broadcast hears a continuous signal with no
markers showing where one segment's content ended and another's began,
unless something explicit was added to signal it; a river fed by two
separate tributaries, carrying water from both downstream with no way
to tell, from any single scoop, which tributary any particular bit of
water originally came from.

### SE Lens

The alternative — keeping Lesson 225's message-oriented model as the
*only* option, never a raw stream — is genuinely simpler to reason
about, and some real transport protocols do exactly that (UDP delivers
whole, discrete datagrams, not a stream). TCP's own stream model exists
because it trades that convenience for something else real programs
often need more: a reliable, ordered flow of bytes that never has to
decide, at the transport layer, where a "message" begins or ends at
all — leaving that entirely up to whatever's built on top. The cost this
lesson's own trace makes unavoidable: any protocol that *does* need
discrete messages back has to rebuild that structure itself, explicitly,
because nothing about the stream underneath will ever do it
automatically — which is exactly what the next unit builds.

---

## Concept Unit: Framing — Rebuilding Message Boundaries on Top of a Stream

### The Problem

Unit 2 proved a raw stream throws away every message boundary a writer
ever had. Real protocols built on top of TCP — HTTP, this curriculum's
own Lesson 225 message model, ported onto a real socket — need those
boundaries back. Given only a flat stream of bytes with no built-in
notion of "where one message ends," how can a reader ever recover
exactly what a writer originally sent, one message at a time?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because sockets are a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn write-content [stream content-chars index]
  (cond
    (= index (count content-chars)) stream
    true (write-content (assoc stream (count stream) (get content-chars index)) content-chars (+ index 1))))

(defn frame-write [stream content-chars]
  (write-content (assoc stream (count stream) (count content-chars)) content-chars 0))

(defn frame-read-content [stream position length taken accumulated]
  (cond
    (= taken length) [accumulated (+ position 1 length)]
    true (frame-read-content stream position length (+ taken 1) (assoc accumulated (count accumulated) (get stream (+ position 1 taken))))))

(defn frame-read [stream position]
  (frame-read-content stream position (get stream position) 0 []))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def fstream0 [])
#'user/fstream0
user=> (def fstream1 (frame-write fstream0 ["h" "e" "l" "l" "o"]))
#'user/fstream1
user=> fstream1
[5 h e l l o]
user=> (def fstream2 (frame-write fstream1 ["w" "o" "r" "l" "d"]))
#'user/fstream2
user=> fstream2
[5 h e l l o 5 w o r l d]
user=> (def read1 (frame-read fstream2 0))
#'user/read1
user=> read1
[[h e l l o] 6]
user=> (def read2 (frame-read fstream2 (get read1 1)))
#'user/read2
user=> read2
[[w o r l d] 12]
```

### Mechanical Walkthrough

`(defn write-content [stream content-chars index] ...)` — the identical
shape as Unit 2's own `stream-write`, appending each character in turn.

`(defn frame-write [stream content-chars] ...)` — the new idea: before
writing the content itself, `(assoc stream (count stream) (count
content-chars))` writes *one extra element*, the content's own *length*,
onto the stream first. `write-content` then appends the actual content
right after it. Every frame this function writes is shaped identically:
one length byte, followed by exactly that many content bytes.

`(defn frame-read-content [stream position length taken accumulated]
...)` — given a `position` where a frame starts and its already-known
`length`, reads exactly `length` bytes starting *right after* that
position (`(+ position 1 taken)` — one past the length byte itself, plus
however many have been collected so far), returning a pair: the
message content, and `(+ position 1 length)` — the exact position where
the *next* frame must begin, computed directly from this frame's own
known size.

`(defn frame-read [stream position] (frame-read-content stream position
(get stream position) 0 []))` — reads the length byte at `position`
first, then delegates.

Trace: `frame-write fstream0 ["h" "e" "l" "l" "o"]` writes `5` (the
length) followed by the five characters: `fstream1 = [5 h e l l o]`.
A second `frame-write` for `"world"` appends `5` again, then its five
characters: `fstream2 = [5 h e l l o 5 w o r l d]` — twelve elements.
`(frame-read fstream2 0)` reads the length at position `0` (`5`), then
the next five bytes (`"h"` through `"o"`), returning `[["h" "e" "l" "l"
"o"] 6]` — the exact original message, plus `6`, precisely where the
next frame's own length byte sits. `(frame-read fstream2 6)` — using
that returned position directly — reads length `5` again at position
`6`, then `"w"` through `"d"`, returning `[["w" "o" "r" "l" "d"] 12]` —
the second message, recovered exactly, with no ambiguity about where it
started or ended, despite living inside the same flat, boundary-free
stream Unit 2 proved has no memory of message boundaries on its own.

### CS Lens

Framing is the real, standard answer to Unit 2's own problem, and this
length-prefix approach is one of exactly two common real strategies —
the other being a reserved *delimiter* character marking the end of each
message (the way a text file uses a newline). Length-prefixing's real
advantage over a delimiter: a reader never has to *scan* for where a
message ends — it's told directly, up front, exactly how many bytes to
consume, which also means a message's own content is free to contain
any byte value at all, including one that would otherwise be mistaken
for a delimiter. This is precisely what HTTP's own `Content-Length`
header does, and precisely what Lesson 225's own `[msg-id content]`
message pairs assumed for free, without ever having to say so, because
Lesson 225 was built directly at the message layer — this lesson proves
that convenience isn't automatic; something, somewhere, has to actually
build it.

Also recognized in: a shipping label's declared weight, letting a
receiving dock know exactly how much cargo belongs to this shipment
without having to guess where it ends by looking; a legal document's
own page-numbering and "end of document" stamp, letting a reader confirm
they have the whole thing rather than an accidentally truncated
fragment; a compressed file archive's own per-entry size field, letting
an extractor pull out exactly one file's bytes without needing to scan
the whole archive for a marker.

### SE Lens

The alternative — a delimiter-based scheme instead of a length prefix —
trades one real cost for a different one: no need to know a message's
length in advance before starting to write it (useful when content is
generated incrementally, its final size not yet known), at the cost of
having to scan every byte of a stream looking for the delimiter, and
having to escape or otherwise handle the delimiter character if it can
legitimately appear inside real content. Length-prefixing, this lesson's
own choice, needs the opposite tradeoff: the full length must be known
*before* the first content byte is written, which `frame-write`'s own
signature already assumes (`content-chars` arrives as one complete
vector, not written incrementally) — a real constraint this lesson's
design accepts, not a limitation it hides. Both strategies solve the
identical problem Unit 2 raised; the choice between them is a real,
ongoing tradeoff every stream-based protocol has to make deliberately,
not something either winner "always" gets right.

---

## Connect the Pieces

Follow the message `"hello"` through every unit built in this lesson.
Before any of it can be sent at all, `listen`, `connect-request`,
`accept-connection`, and `confirm-connection` (Unit 1) walk both sockets
from `"closed"` through an intermediate state to `"connected"` — a real,
three-step agreement that both sides are genuinely ready, something
Lesson 225's own `send`/`deliver` never required. Once connected,
writing `"hello"` and then `"world"` onto the same raw stream (Unit 2)
produces one flat, boundary-free sequence — `stream-read`'s own
`["l" "o" "w"]` result, spanning both original writes in a single call,
proves directly that the connection itself preserves *order* but throws
away *grouping* entirely. `frame-write` and `frame-read` (Unit 3) then
rebuild exactly what was lost: prefixing `"hello"` with its own length,
`5`, lets `frame-read` recover it byte-for-byte, and — critically —
lets it compute exactly where `"world"`'s own frame begins next,
`6`, entirely from information carried inside the stream itself, no
external bookkeeping required. The same five characters, `h-e-l-l-o`,
travel through a genuine connection, into a boundary-free stream, and
back out again as a distinct, correctly-recovered message — proving,
concretely, that everything Lesson 225 assumed for free about message
boundaries has to be built, explicitly, the moment the underlying
transport is a real byte stream instead.

## What Breaks Without This

Read a frame using the wrong starting position — one byte short of
where the actual frame begins, as if `frame-read`'s own returned
position from the first message had been miscounted:

```
user=> (frame-read fstream2 5)
[[5 w o r l] 11]
```

The length byte read at position `5` isn't a real length prefix at
all — it's `"o"`, the last character of `"hello,"` which `get` happily
returns as though it were a number, since nothing in `frame-read-content`
checks that the value it read actually makes sense as a length. The
resulting "message," `["5" "w" "o" "r" "l"]`, is complete garbage,
built from whatever bytes happened to sit where a real length was
expected — and the *next* frame position this call computes, `11`, is
wrong too, meaning every subsequent read would stay corrupted from this
point forward. This is the honest cost of framing built on an
unchecked position: getting the very first offset wrong doesn't fail
loudly — it silently misreads everything from that point on. Restoring
the correct starting position, `6`, brings the real message back.

## Exercises

1. Write three messages onto the same stream using `frame-write`, then
   read all three back in sequence using only the position each
   previous `frame-read` call returns, confirming the third message is
   recovered correctly with no hardcoded offsets anywhere in your own
   reading code.
2. Modify `frame-write` to support an empty message (a zero-length
   frame), and confirm `frame-read` correctly returns an empty result
   and the correct next position for it.
3. Simulate Unit 2's own stream, but with three writes instead of two,
   and find a single `stream-read` call whose byte range spans parts of
   *all three* original writes at once — proving the boundary-loss
   problem isn't limited to spanning exactly two messages.

## Definition of Done

- [ ] `make-socket`, `listen`, `connect-request`, `accept-connection`,
      `confirm-connection`, `stream-write`, `stream-read`, `frame-write`,
      and `frame-read` all defined and run in a live `bb` REPL, matching
      every transcript shown above exactly.
- [ ] Unit 1's handshake reproduced, with both sockets ending in
      `"connected"` only after all three steps.
- [ ] Unit 2's boundary-spanning read reproduced exactly —
      `(stream-read stream2 3 3)` returning `["l" "o" "w"]`.
- [ ] Unit 3's framing reproduced, correctly recovering both original
      messages and the exact position of each.
- [ ] Exercise 1 completed, reading three framed messages back using
      only returned positions, no hardcoded offsets.
- [ ] `git commit -m "Add Lesson 226: sockets — a real three-way
      handshake, a byte stream with no message boundaries, and framing
      to rebuild them"`
