# Lesson 30: A Protocol Is Just Agreed-Upon Bytes

## What you will build

A chat server that a real web browser can connect to directly — no client
script required, just an HTML page with JavaScript's built-in `WebSocket`
object. Under the hood it is still the same thing Lesson 20 built: a
`socket`, a `listen()`/`accept()` loop, a thread per client, and a
broadcast function. What's new is the protocol riding on top of that
socket. The transferable idea this lesson is actually about: **a network
protocol is not magic — it is a written agreement about how to arrange
bytes**, and once you can read that agreement (the WebSocket RFC), you can
implement it yourself with tools you already have, the same way Lesson 24
implemented HTTP by hand before ever importing `requests`.

## What you need to know first

- **Lesson 18** — `socket`, `bind()`, `listen()`, `accept()`, `send()`/`recv()`.
  This lesson does not re-teach any of that; it's assumed working knowledge.
- **Lesson 20** — the multi-client chat server: one thread per connected
  client, a shared list of client sockets, and a `broadcast()` function
  that writes to every socket except the sender's. Today's server reuses
  that exact shape.
- **Lesson 24** — a raw HTTP request/response is just text with `\r\n` line
  endings, sent and received over a plain socket, before any library
  wraps it. Today's handshake *is* one of these raw HTTP exchanges — it
  just ends differently than a normal request does.
- **Lesson 61** — reading bytes as binary/hex. Today extends that into
  actually *computing* with binary, not just displaying it.

---

## The Problem, in prose, no code yet

Lesson 20's chat protocol was something we invented ourselves: each
client sends a line of text, the server reads it with `recv()`, and
broadcasts it back out. That works, but only for clients we also wrote —
a browser has no idea what our made-up protocol is. A browser's
JavaScript can open a `WebSocket` connection, but only if the server on
the other end speaks the actual WebSocket protocol: a specific handshake,
followed by messages wrapped in a specific binary frame format. Nothing
about this is a new kind of socket — it's the same TCP socket from Lesson
18. What's new is the *agreement* about what bytes to put on it, so that
two completely different programs (Python here, the browser's C++ there)
can understand each other without ever having met.

That agreement — RFC 6455 — asks for exactly two new things we haven't
built before: a way to prove both sides agree to switch protocols (the
**handshake**), and a way to pack a text message into bytes with enough
structure that the receiver knows where it starts and ends (the
**frame**).

---

## Concept Unit: The WebSocket Handshake Is Plain HTTP

### The Problem

A WebSocket connection doesn't start as a WebSocket connection. It starts
as a completely ordinary HTTP request — the same kind Lesson 24 built by
hand — that asks the server to switch protocols mid-connection. If the
server agrees, both sides silently stop speaking HTTP and start speaking
WebSocket frames over that same still-open TCP connection.

### Reference Source

No reference counterpart — this curriculum has no external reference
implementation it's building toward. The handshake format below is taken
directly from RFC 6455 §1.3 (the WebSocket protocol specification), not
from a codebase.

### The New Code — the request a browser actually sends

```
GET / HTTP/1.1
Host: localhost:8765
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

```

### Mechanical Walkthrough

- `GET / HTTP/1.1` — an ordinary HTTP request line, exactly like Lesson
  24's. `GET` because the browser is still, technically, asking the
  server for something.
- `Host: localhost:8765` — already taught in Lesson 24: which server this
  request is for.
- `Upgrade: websocket` — **first appearance.** This header is the actual
  ask: "after you respond to this request, I want this connection to stop
  being HTTP and become something else — specifically, `websocket`." An
  HTTP server that has never heard of WebSocket just ignores this header
  and answers normally; nothing breaks by accident.
- `Connection: Upgrade` — **first appearance.** `Connection` is a header
  that controls connection-level behavior (Lesson 24 didn't need it,
  because a plain HTTP request/response doesn't ask for anything special
  here). The value `Upgrade` says "the *protocol upgrade* described above
  is what I want" — it's the confirmation flag that pairs with the
  `Upgrade` header.
- `Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==` — **first appearance.** A
  random value the client generates fresh for every connection, encoded
  in Base64. Its only job is proving the server on the other end actually
  understood this was a WebSocket request and not, say, a caching proxy
  blindly forwarding bytes it didn't understand. It has no secrecy value —
  the browser sends it in plain text and it's about to travel back
  transformed, in plain text, in the next unit.
- `Sec-WebSocket-Version: 13` — the version of the RFC being spoken. `13`
  is the only version in real-world use; this curriculum targets it
  exclusively.
- The trailing blank line — same meaning as in Lesson 24: end of headers.

### CS Lens

This is **protocol negotiation over a single connection** — one protocol
(HTTP) is used only to bootstrap agreement to switch to a second, unrelated
protocol (WebSocket framing), without opening a new TCP connection.

Also recognized in: TLS's own handshake (negotiating a cipher before any
encrypted data flows), SMTP's `STARTTLS` command, SSH's version-exchange
line before the encrypted session begins, HTTP/2's own upgrade-from-HTTP/1.1
mechanism.

### SE Lens

The alternative RFC 6455 could have chosen was a brand-new port and a
brand-new handshake built from nothing. It didn't, because reusing HTTP
means WebSocket connections pass through existing HTTP infrastructure —
firewalls, load balancers, reverse proxies — that already know how to
route an HTTP request, without anyone having to teach that infrastructure
a new protocol. The cost: every WebSocket connection carries a bit of HTTP
baggage (the full header block) it doesn't otherwise need, on every single
new connection. That's a deliberate trade of a little redundancy for a lot
of compatibility.

---

## Concept Unit: Proving the Handshake — SHA-1 and Base64

### The Problem

The server can't just echo `Sec-WebSocket-Key` straight back — that would
prove nothing, since anything sitting on the wire could copy it too. RFC
6455 instead requires the server to *transform* the key in a specific,
publicly-documented way and send back the transformed result. Both sides
know the transformation, so the client can check the server actually did
it — which, again, isn't about secrecy, it's about confirming the peer
speaks WebSocket at all before either side starts sending binary frames
the other might misinterpret as garbage.

### Introduce the concept in isolation

```python
import hashlib
import base64

client_key = "dGhlIHNhbXBsZSBub25jZQ=="
magic_string = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

combined = client_key + magic_string
print("combined:", combined)

sha1_digest = hashlib.sha1(combined.encode()).digest()
print("sha1_digest (raw bytes):", sha1_digest)

accept_key = base64.b64encode(sha1_digest).decode()
print("accept_key:", accept_key)

expected = "s3pPLMBiTxaQ9kYGzzhZRbK+xOo="
print("matches RFC 6455 example value:", accept_key == expected)
```

Run it:

```
combined: dGhlIHNhbXBsZSBub25jZQ==258EAFA5-E914-47DA-95CA-C5AB0DC85B11
sha1_digest (raw bytes): b'\xb3zO,\xc0bO\x16\x90\xf6F\x06\xcf8YE\xb2\xbe\xc4\xea'
accept_key: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
matches RFC 6455 example value: True
```

What this proves: `hashlib.sha1(...).digest()` is a **first appearance**
of cryptographic hashing in this curriculum — a function that takes bytes
of any length and deterministically produces exactly 20 bytes of output,
such that changing even one input byte produces a completely different
output, and there's no practical way to run it backwards. `.encode()` (a
`str` → `bytes` conversion, first seen back in Lesson 18's socket lessons)
turns the combined string into something `sha1()` can consume, since
hashing operates on raw bytes, not on Python's text type. `.digest()`
returns those 20 hash bytes raw; its sibling `.hexdigest()` (not used
here) would return them as a hex string instead. `base64.b64encode()` is
**first appearance**: it takes arbitrary bytes and re-encodes them using
only 64 printable characters (`A`–`Z`, `a`–`z`, `0`–`9`, `+`, `/`), which
is why `Sec-WebSocket-Key` and `Sec-WebSocket-Accept` are both safe to
drop straight into an HTTP text header — raw hash bytes are not, since
they can contain bytes that aren't valid text at all. `.decode()` turns
the Base64 result back from `bytes` to `str` so it can be concatenated
into the response text.

The `WEBSOCKET_MAGIC_STRING` constant `258EAFA5-E914-47DA-95CA-C5AB0DC85B11`
isn't a secret either — it's a fixed, publicly known value hard-coded into
the RFC itself, whose only purpose is to make the transformation
deterministic and specific to *this* protocol (so a generic hash of the
key alone couldn't accidentally satisfy some other handshake scheme).

This lab is deleted now; it never appears in the project. What survives
is the shape: concatenate, SHA-1, Base64.

### Project Change

- **Reference Source:** No reference counterpart — port of RFC 6455 §1.3's
  algorithm directly.
- **Files affected:** new file, `chat_server_ws.py`.
- **Change type:** add.
- **Dependencies:** Python's standard library only (`hashlib`, `base64` —
  no install needed, unlike Lesson 45's cryptography work, which used a
  third-party package).

### The New Code

```python
WEBSOCKET_MAGIC_STRING = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"


def compute_accept_key(client_key):
    combined = client_key + WEBSOCKET_MAGIC_STRING
    sha1_digest = hashlib.sha1(combined.encode()).digest()
    return base64.b64encode(sha1_digest).decode()
```

### The Updated Project

```python
import socket
import threading
import hashlib
import base64

WEBSOCKET_MAGIC_STRING = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"


def compute_accept_key(client_key):        # ← new
    combined = client_key + WEBSOCKET_MAGIC_STRING       # ← new
    sha1_digest = hashlib.sha1(combined.encode()).digest()  # ← new
    return base64.b64encode(sha1_digest).decode()         # ← new
```

This is a brand-new file with nothing surrounding it yet — the function
above, plus the two new imports, is the entire file so far. As the lesson
proceeds, `compute_accept_key` becomes one piece of a larger `main()`
program, the same way Lesson 20's `broadcast()` became one piece of that
lesson's server.

### CS Lens

This is a **one-way function** used as a lightweight proof of protocol
understanding — not encryption (nothing here is secret) and not integrity
verification of a message body (nothing here is being checked for
tampering). It's closer to a handshake ritual: "compute this specific
thing and show me the answer" proves you're running WebSocket-aware code,
because only WebSocket-aware code would know to compute it.

Also recognized in: password hashing (Lesson 42 — same one-way property,
different purpose), Git commit hashes, checksums verifying a download
(Lesson 44), blockchain block hashes.

### SE Lens

RFC 6455 could have required a full cryptographic handshake here, the way
TLS does. It doesn't, because the goal isn't security — it's accidental-
misinterpretation prevention. A cheap, fast, well-known hash is the right
tool for "prove you understood the request," and reaching for something
heavier (RSA, Lesson 46) would be solving a problem that doesn't exist at
this layer. WebSocket connections that need actual security run inside
TLS separately (`wss://` instead of `ws://`), the same way HTTP's security
is a separate layer (HTTPS) from HTTP itself.

---

## Concept Unit: Completing and Testing the Handshake

### Project Change

- **Reference Source:** No reference counterpart — RFC 6455 §4.2.2 defines
  the exact required response headers.
- **Files affected:** `chat_server_ws.py`.
- **Change type:** add, directly below `compute_accept_key`.
- **Dependencies:** the socket-handling pattern from Lesson 18/20
  (`recv()`, `sendall()`).

### The New Code

```python
def parse_handshake_headers(request_text):
    headers = {}
    lines = request_text.split("\r\n")
    for line in lines[1:]:
        if ": " in line:
            key, value = line.split(": ", 1)
            headers[key] = value
    return headers


def perform_handshake(client_socket):
    request_bytes = client_socket.recv(4096)
    request_text = request_bytes.decode("utf-8")
    headers = parse_handshake_headers(request_text)
    client_key = headers["Sec-WebSocket-Key"]
    accept_key = compute_accept_key(client_key)
    response = (
        "HTTP/1.1 101 Switching Protocols\r\n"
        "Upgrade: websocket\r\n"
        "Connection: Upgrade\r\n"
        f"Sec-WebSocket-Accept: {accept_key}\r\n"
        "\r\n"
    )
    client_socket.sendall(response.encode("utf-8"))
```

### Mechanical Walkthrough

- `request_text.split("\r\n")` — a **hard concept reappearing**: this is
  the same manual text-splitting Lesson 24 used to break a raw HTTP
  response into its lines, because sockets deliver a blob of bytes with no
  built-in concept of "lines" — the program has to impose that structure
  itself.
- `lines[1:]` — reused Python slicing, skips index `0` (the `GET / HTTP/1.1`
  request line, which isn't a `Key: Value` header) and keeps everything
  after it.
- `line.split(": ", 1)` — the `1` argument is **first appearance**: it
  caps the split at one division, so a header value that itself contains
  `": "` (unlikely here, but a real concern for some headers) doesn't get
  incorrectly split again.
- `headers["Sec-WebSocket-Key"]` — ordinary dictionary lookup by the exact
  header name the browser sent.
- `"101 Switching Protocols"` — **first appearance** of this specific HTTP
  status code. Lesson 24/25 dealt with `200 OK` and error codes; `101` is
  the one status code whose entire meaning is "I agree to your `Upgrade`
  request — this connection is not HTTP anymore as of right now."
- The f-string interpolating `accept_key` into the response — a **hard
  concept reappearing** from every earlier lesson that built response
  text by hand (Lesson 25, Lesson 29).
- `client_socket.sendall(...)` — same method Lesson 20 used for every
  broadcast; no new behavior here.

### Run it

```python
import socket, threading

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.bind(("localhost", 8765))
server_socket.listen()
client_socket, address = server_socket.accept()
perform_handshake(client_socket)
```

Connecting a raw test client and printing what actually came back:

```
[alice] handshake response:
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: sgzuL0zfniDVHyMah1aUoLfZx5Q=

```

That `Sec-WebSocket-Accept` value is different from the one computed in
the isolated lab above — correctly so, since this test client generated
its own random `Sec-WebSocket-Key` rather than reusing the RFC's fixed
example value. The handshake is complete: from this point forward, both
sides have agreed to stop speaking HTTP.

### One sentence connecting this unit to what came before

`compute_accept_key` (the previous unit) is a pure function with no
knowledge of sockets at all; `perform_handshake` (this unit) is the glue
that reads real bytes off a real connection, hands the extracted key to
that pure function, and writes the real response back — the same
separation Lesson 29 drew between "compute the JSON body" and "write it to
the socket."

---

## Concept Unit: Bits, Bytes, and the WebSocket Frame Header

### The Problem

The handshake is done, but nothing about it explains how an actual chat
message — `"hello from alice"` — gets from one side to the other now that
both sides have stopped speaking HTTP. Unlike Lesson 20's server, which
could just treat every `recv()` as "the next line of chat text," WebSocket
requires every message to be wrapped in a **frame**: a small binary header
in front of the payload that tells the receiver, unambiguously, how many
bytes belong to this message and what kind of message it is. Without that
header, two consecutive messages sent back-to-back would arrive as one
undifferentiated blob of bytes with no way to tell where the first one
ends.

### Introduce the concept in isolation

Python's bitwise operators (`>>`, `&`, `^`) haven't appeared in this
curriculum yet — Lesson 61 displayed bytes as binary/hex, but never
computed with them. Isolating them first, on numbers with no frame
context at all:

```python
first_byte = 0b10000001
print("first_byte as binary:", bin(first_byte))

fin_bit = first_byte >> 7
print("fin_bit (shift right 7):", fin_bit)

opcode = first_byte & 0b00001111
print("opcode (mask with 0b00001111):", opcode)

second_byte = 0b11100101
print("second_byte as binary:", bin(second_byte))

mask_bit = second_byte & 0b10000000
print("mask_bit (mask with 0b10000000):", mask_bit, "-> nonzero means True")

payload_length = second_byte & 0b01111111
print("payload_length (mask with 0b01111111):", payload_length)
```

Run it:

```
first_byte as binary: 0b10000001
fin_bit (shift right 7): 1
opcode (mask with 0b00001111): 1
second_byte as binary: 0b11100101
mask_bit (mask with 0b10000000): 128 -> nonzero means True
payload_length (mask with 0b01111111): 101
```

What this proves:

- `0b10000001` is **first appearance** of Python's binary literal syntax —
  the `0b` prefix tells Python to read the digits that follow as base 2,
  the same way `0x` (seen since Lesson 61) means base 16. It's stored
  identically to the equivalent decimal number (`129`); the `0b...` form
  just makes each individual bit visible to the person reading the code.
- `>>` (**first appearance**, right shift) discards the rightmost *n* bits
  and pulls everything else toward the right end. `first_byte >> 7`
  discards the bottom 7 bits of an 8-bit value, leaving only the top bit
  sitting in position 0 — exactly the value of that top bit alone. The
  output `1` proves it isolated the leftmost bit of `10000001`.
- `&` (**first appearance**, bitwise AND) compares two numbers bit by bit
  and keeps a `1` only where *both* numbers have a `1` in that position.
  `first_byte & 0b00001111` keeps only the bottom 4 bits of `first_byte`
  and zeroes out everything above them — a **mask**. The output `1` proves
  it kept exactly the bottom nibble of `10000001`, which is `0001`.
- The same `&` pattern applied twice more to `second_byte` proves a mask
  can isolate *any* bit range, not just the bottom nibble: `0b10000000`
  isolates just the top bit (`128` printed, since the raw masked value
  still sits in the top-bit position — only its truthiness, "nonzero,"
  matters), and `0b01111111` isolates the bottom seven bits at once
  (`101`).

This lab is deleted now; it never appears in the project. What survives
is the technique: a byte can hold several independent small fields at
once, and `>>`/`&` are how a program pulls each field back out.

### Project Change

- **Reference Source:** No reference counterpart — RFC 6455 §5.2 defines
  this exact bit layout as a diagram in the spec text.
- **Files affected:** `chat_server_ws.py`.
- **Change type:** add.
- **Location:** below `perform_handshake`.
- **Dependencies:** none beyond the standard library.

RFC 6455's frame header, restated as the diagram the spec itself uses
(one row = one byte, `0`–`7` = bit position within that byte):

```
 0               1
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|F|   |A|S|S|  opcode | MASK|  payload len (7 bits) |
|I|R,S|S,V|4 bits    | bit |  or 126 / 127 = "read more"
|N|V's|V's|          |     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

Simplified to only what this lesson uses: byte 0 holds a `FIN` bit (top)
and a 4-bit `opcode` (bottom); byte 1 holds a `MASK` bit (top) and a
7-bit `payload length` (bottom) — unless that 7-bit field reads `126` or
`127`, meaning "the real length doesn't fit here; read the next 2 or 8
bytes instead."

### The New Code

```python
def decode_frame(frame_bytes):
    first_byte = frame_bytes[0]
    opcode = first_byte & 0b00001111
    second_byte = frame_bytes[1]
    is_masked = (second_byte & 0b10000000) != 0
    payload_length = second_byte & 0b01111111
    offset = 2
    if payload_length == 126:
        payload_length = int.from_bytes(frame_bytes[2:4], "big")
        offset = 4
    elif payload_length == 127:
        payload_length = int.from_bytes(frame_bytes[2:10], "big")
        offset = 10
```

### The Updated Project

```python
def decode_frame(frame_bytes):
    first_byte = frame_bytes[0]
    opcode = first_byte & 0b00001111                        # ← new
    second_byte = frame_bytes[1]
    is_masked = (second_byte & 0b10000000) != 0              # ← new
    payload_length = second_byte & 0b01111111                # ← new
    offset = 2                                                # ← new
    if payload_length == 126:                                 # ← new
        payload_length = int.from_bytes(frame_bytes[2:4], "big")  # ← new
        offset = 4                                            # ← new
    elif payload_length == 127:                                # ← new
        payload_length = int.from_bytes(frame_bytes[2:10], "big") # ← new
        offset = 10                                            # ← new
    # payload extraction continues in the next unit
```

`decode_frame` now reads the fixed 2-byte header of any incoming frame
and, as a whole, determines exactly two things from it so far: what kind
of frame this is (`opcode`) and how many bytes of payload follow
(`payload_length`, plus `offset`, which tracks where the payload actually
starts once the optional extended-length bytes are accounted for). It
does not yet extract the payload itself — that's the next unit.

### Mechanical Walkthrough

- `frame_bytes[0]` — indexing into a `bytes` object, already established
  since Lesson 18; each element is an `int` from 0–255, not a character.
- `first_byte & 0b00001111` — the mask lab above, applied to a real frame
  byte for the first time: isolates the bottom 4 bits, which RFC 6455
  defines as the opcode. `0x1` means "this is a text frame"; `0x8` means
  "this is a close frame" (used later in this lesson).
- `(second_byte & 0b10000000) != 0` — the same masking technique, then a
  reappearing comparison (`!=`) converting the raw masked integer into an
  actual `True`/`False`. RFC 6455 requires every client-to-server frame to
  set this bit; a server receiving an unmasked frame is required to reject
  the connection, though this lesson's server trusts its test clients and
  doesn't enforce that rejection.
- `second_byte & 0b01111111` — same masking technique, isolating the
  bottom 7 bits as the base payload length.
- `int.from_bytes(frame_bytes[2:4], "big")` — **first appearance.** Takes
  a slice of raw bytes and interprets them as a single integer.
  `"big"` means **big-endian**: the first byte in the slice is the *most*
  significant. This matters because 2 bytes alone can only count up to
  65,535 — not enough for a large message — so RFC 6455 says: if the
  7-bit field reads exactly `126`, ignore it as a real length and instead
  read the *next* 2 bytes as the real length; if it reads `127`, read the
  next 8 bytes instead. `offset` is adjusted to match, so later code knows
  where the header actually ends.

### CS Lens

This is **bit-packing**: cramming several small, independent fields into
one fixed-size unit to keep a header compact, then unpacking them with
shift-and-mask. The variable-length-field trick (`126`/`127` meaning "read
more") is a small instance of **variable-length encoding** — using a
fixed-size field's own value to signal that more bytes are needed,
instead of always reserving worst-case space.

Also recognized in: IPv4/TCP header fields (flags packed into a single
byte), UTF-8's own variable-length byte encoding, file permission bits in
Unix (`rwxr-xr-x` is exactly this kind of bit-packed byte), image and
audio file format headers, protocol buffers' varint encoding.

### SE Lens

RFC 6455 could have made every field a fixed, generously-sized number of
bytes — simpler to write, but wasteful, since the overwhelming majority of
real chat messages are short and don't need an 8-byte length field. The
chosen design optimizes for the common case (short messages, 2-byte
header) while still supporting the rare case (huge messages, up to 10-byte
header) without ever silently truncating anything. The cost this project
is currently carrying: this parser trusts `frame_bytes` to contain a
complete frame in one `recv()` call, which is true for short test messages
but not guaranteed by TCP in general — a message split across two
`recv()` calls would break this code. A production WebSocket library
buffers incoming bytes until a full frame is available; this lesson's
server does not, and that's a real, named limitation, not an oversight
being hidden.

---

## Concept Unit: Unmasking the Payload

### The Problem

The frame header now tells us how many payload bytes follow, but RFC 6455
requires every client-to-server payload to be **masked** — XORed against a
4-byte random key sent right after the header — specifically so that
identical messages never produce identical bytes on the wire. (This exists
to stop a specific class of attack against shared proxies that cache
raw bytes; the details of that attack are out of scope here, but the
defense — masking — is exactly what this unit builds.) The server has to
undo that masking before the text underneath is readable.

### Introduce the concept in isolation

```python
first_masked_byte = 0b01001000
masking_key_byte = 0b00011011
unmasked_byte = first_masked_byte ^ masking_key_byte
print("unmasked_byte (XOR):", bin(unmasked_byte), "=", unmasked_byte, "=", chr(unmasked_byte))
```

Run it:

```
unmasked_byte (XOR): 0b1010011 = 83 = S
```

What this proves: `^` (**first appearance**, bitwise XOR) compares two
numbers bit by bit and produces a `1` exactly where the two inputs
*differ*. XOR has one property that makes it useful for masking:
applying the same XOR twice with the same key returns the original value
— `a ^ key ^ key == a`, always. That's why the exact same operation
(`^` with the masking key) both creates the masked byte on the sender's
side and recovers the original byte on the receiver's side; there's no
separate "unmask" operation, only XOR applied a second time. `chr(83)`
(reused from earlier lessons) confirms the recovered byte is the ASCII
code for the letter `S` — proving this really did recover a specific,
meaningful original value, not just produce some other number.

This lab is deleted now; it never appears in the project. What survives
is: XOR with the same key twice returns you to where you started.

### Project Change

- **Reference Source:** No reference counterpart — RFC 6455 §5.3 defines
  the exact masking algorithm (cycle the 4-byte key across the payload by
  index modulo 4).
- **Files affected:** `chat_server_ws.py`.
- **Change type:** add, completing `decode_frame`.
- **Location:** directly below the `offset` calculation from the previous
  unit.

### The New Code

```python
    if is_masked:
        masking_key = frame_bytes[offset:offset + 4]
        offset += 4
        masked_payload = frame_bytes[offset:offset + payload_length]
        payload = bytes(
            byte ^ masking_key[index % 4]
            for index, byte in enumerate(masked_payload)
        )
    else:
        payload = frame_bytes[offset:offset + payload_length]
    return opcode, payload
```

### The Updated Project

```python
def decode_frame(frame_bytes):
    first_byte = frame_bytes[0]
    opcode = first_byte & 0b00001111
    second_byte = frame_bytes[1]
    is_masked = (second_byte & 0b10000000) != 0
    payload_length = second_byte & 0b01111111
    offset = 2
    if payload_length == 126:
        payload_length = int.from_bytes(frame_bytes[2:4], "big")
        offset = 4
    elif payload_length == 127:
        payload_length = int.from_bytes(frame_bytes[2:10], "big")
        offset = 10
    if is_masked:                                                  # ← new
        masking_key = frame_bytes[offset:offset + 4]                # ← new
        offset += 4                                                 # ← new
        masked_payload = frame_bytes[offset:offset + payload_length]  # ← new
        payload = bytes(                                            # ← new
            byte ^ masking_key[index % 4]                           # ← new
            for index, byte in enumerate(masked_payload)            # ← new
        )                                                           # ← new
    else:                                                           # ← new
        payload = frame_bytes[offset:offset + payload_length]        # ← new
    return opcode, payload                                          # ← new
```

`decode_frame` is now complete end to end: given the raw bytes of one
WebSocket frame, it returns `(opcode, payload)` — the message type and the
actual, readable message bytes — regardless of length or masking.

### Mechanical Walkthrough

- `frame_bytes[offset:offset + 4]` — reused slicing, grabs exactly the
  4-byte masking key that RFC 6455 places immediately after the (possibly
  extended) length field.
- `offset += 4` — reused augmented assignment, advances past the key so
  the next slice starts at the actual payload.
- `bytes(... for ... in ...)` — a **first appearance**: `bytes()` called
  on a generator expression builds a new `bytes` object one element at a
  time from whatever the generator produces, the same way `list(x for x
  in y)` would build a list — except every produced value must be a valid
  byte (0–255), which `byte ^ masking_key[index % 4]` always is, since
  XOR-ing two 0–255 values can't exceed 255.
- `enumerate(masked_payload)` — reused from earlier lessons; produces
  `(index, byte)` pairs so the code knows *which* position in the payload
  it's currently unmasking.
- `masking_key[index % 4]` — **first appearance of `%` used this way in
  this curriculum's networking track**: the masking key is only 4 bytes
  long, but the payload can be far longer, so the key must repeat —
  `index % 4` cycles `0, 1, 2, 3, 0, 1, 2, 3, ...` as `index` grows,
  always pointing back into the 4-byte key.

### Execution Trace

Unmasking the 3-byte payload for the message `"Hi!"` (bytes `72, 105,
33`) against the masking key `[10, 20, 30, 40]`:

```
index 0: byte 72  ^ masking_key[0 % 4]=10 → 78  (masking_key[0])
index 1: byte 105 ^ masking_key[1 % 4]=20 → 121 (masking_key[1])
index 2: byte 33  ^ masking_key[2 % 4]=30 → 63  (masking_key[2])
```

Only 3 of the key's 4 bytes were needed here because the message is
shorter than the key; a 5-byte message would reuse `masking_key[0]` again
at `index 4`, since `4 % 4 == 0`.

### CS Lens

XOR-with-a-repeating-key is exactly a **stream cipher** in miniature —
combine plaintext with a keystream one unit at a time, and the same
operation reverses itself. WebSocket's masking is explicitly *not*
presented as encryption by the RFC (the key travels in plain text right
next to the data it masks, so there's no secrecy at all) — but the
mechanism is identical to real stream ciphers like RC4, which use the
same XOR-with-keystream idea with a key an attacker genuinely can't see.

Also recognized in: one-time pads (the theoretically unbreakable version
of this same idea, where the key is truly random and never reused),
checksums built from repeated XOR passes, RAID parity calculations.

### SE Lens

The masking key is regenerated fresh for every single frame — RFC 6455
requires this — rather than negotiated once during the handshake and
reused. That costs 4 extra bytes on every frame, but the tradeoff is that
no two masked frames of the same underlying text look identical on the
wire, which is the entire property the mechanism exists to guarantee.
Reusing the handshake's key here would have been cheaper but would have
defeated the purpose.

---

## Concept Unit: Encoding an Outgoing Frame

### Project Change

- **Reference Source:** No reference counterpart — RFC 6455 §5.2 again,
  the encoding direction of the same layout already read above.
- **Files affected:** `chat_server_ws.py`.
- **Change type:** add.
- **Location:** below `decode_frame`.

RFC 6455 requires masking only for client→server frames; server→client
frames (what this unit builds) are sent unmasked, which is why this
function is shorter than `decode_frame` — there's no key to generate or
apply.

### The New Code

```python
def encode_frame(message_text):
    payload = message_text.encode("utf-8")
    first_byte = 0b10000001  # FIN=1, opcode=1 (text frame)
    payload_length = len(payload)
    if payload_length <= 125:
        header = bytes([first_byte, payload_length])
    elif payload_length <= 65535:
        header = bytes([first_byte, 126]) + payload_length.to_bytes(2, "big")
    else:
        header = bytes([first_byte, 127]) + payload_length.to_bytes(8, "big")
    return header + payload
```

### The Updated Project

This is a new, freestanding function with nothing surrounding it yet —
covered by Project Change above, so no further Updated Project step is
needed here per the schema's own exception for that case.

### Mechanical Walkthrough

- `message_text.encode("utf-8")` — reused `str` → `bytes` conversion.
- `0b10000001` — a literal, not computed: the top bit (`FIN`) set to `1`
  (this is the whole message, not one fragment of a larger one — WebSocket
  supports fragmenting a message across multiple frames, out of scope
  here) and the bottom nibble set to `1` (text frame), written directly
  because both values are fixed for every message this server ever sends.
- `bytes([first_byte, payload_length])` — **first appearance of this
  specific constructor form**: `bytes()` given a list of small integers
  builds a `bytes` object with exactly those byte values, in order — the
  reverse direction of the indexing this lesson has been doing all along.
- `payload_length.to_bytes(2, "big")` — the reverse of `int.from_bytes`
  from the decoding unit: takes a Python integer and produces exactly 2
  (or 8) raw bytes representing it, big-endian, for the extended-length
  cases.
- `header + payload` — `bytes` concatenation with `+`, already familiar
  from string concatenation; here it joins the fixed header onto the
  actual message bytes into one object ready for `sendall()`.

### CS Lens

This is the direct inverse of `decode_frame` — the same wire format,
walked in the opposite direction. Having genuinely separate encode/decode
functions rather than one function with an `if is_sending:` branch is
itself worth naming.

### SE Lens

This is **single responsibility**: `encode_frame` only ever turns text
into wire bytes, and `decode_frame` only ever turns wire bytes into
`(opcode, payload)` — neither function knows anything about sockets,
threads, or the chat application at all. That's what makes both functions
independently testable (as the labs above just did, with no server
running) and reusable if this project ever needed a second WebSocket
feature that isn't chat.

---

## Concept Unit: Threading and Broadcast, Reappearing

This is a **hard concept reappearing**, per the Repetition Rule — Lesson
20 already fully taught thread-per-client servers and a shared
broadcast list, so this unit is a restatement, not a new lab.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `chat_server_ws.py`.
- **Change type:** add.
- **Dependencies:** `threading`, already imported.

### The New Code

```python
connected_clients = []
clients_lock = threading.Lock()


def broadcast(message_text, sender_socket):
    frame = encode_frame(message_text)
    with clients_lock:
        for client_socket in connected_clients:
            if client_socket is not sender_socket:
                client_socket.sendall(frame)


def handle_client(client_socket, client_address):
    perform_handshake(client_socket)
    with clients_lock:
        connected_clients.append(client_socket)
    print(f"Client {client_address} joined")
    try:
        while True:
            frame_bytes = client_socket.recv(4096)
            if not frame_bytes:
                break
            opcode, payload = decode_frame(frame_bytes)
            if opcode == 0x8:  # close frame
                break
            message_text = payload.decode("utf-8")
            print(f"{client_address}: {message_text}")
            broadcast(message_text, client_socket)
    finally:
        with clients_lock:
            connected_clients.remove(client_socket)
        client_socket.close()
        print(f"Client {client_address} left")


def main():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind(("localhost", 8765))
    server_socket.listen()
    print("WebSocket chat server listening on ws://localhost:8765")
    while True:
        client_socket, client_address = server_socket.accept()
        thread = threading.Thread(
            target=handle_client, args=(client_socket, client_address), daemon=True
        )
        thread.start()


if __name__ == "__main__":
    main()
```

### Restatement

`connected_clients`, `clients_lock`, one thread per accepted connection,
and `broadcast()` writing to every socket except the sender's are exactly
Lesson 20's design, unchanged. The lock exists for the same reason it did
there: two client threads could otherwise both be modifying
`connected_clients` (one appending on join, another removing on
disconnect) at the same instant, corrupting the list. What's genuinely new
in `handle_client` is only the two lines that touch the *protocol*:
`perform_handshake()` runs once, before this client is added to
`connected_clients` at all, and every subsequent `recv()` is handed to
`decode_frame` instead of being treated as ready-to-use text — the
`opcode == 0x8` check is new too: `0x8` is the close-frame opcode a real
browser sends when the user closes the tab, and without checking for it,
this server would try to `decode_frame` a frame it doesn't otherwise
handle and then attempt to `.decode("utf-8")` payload bytes that aren't
guaranteed to be valid text.

---

## Connect the pieces

One message, traced through everything built today: a browser's user
types `hello from alice` and the JavaScript `WebSocket` object sends it.

1. Bytes arrive at `handle_client`'s `client_socket.recv(4096)`.
2. `decode_frame` reads byte 0 (`opcode = 1`, text), byte 1's `MASK` bit
   (set — this came from a client, so masking is required), the 7-bit
   length (`17`, short enough that no extended-length bytes are needed),
   then the 4-byte masking key, then XORs it against the 17 masked payload
   bytes to recover the original UTF-8 bytes.
3. `.decode("utf-8")` turns those recovered bytes into the Python string
   `"hello from alice"`.
4. `broadcast()` calls `encode_frame("hello from alice")` — this time
   *building* a frame, with `FIN=1`/`opcode=1` and the 17-byte unmasked
   length packed into byte 1, no masking key needed.
5. `sendall()` writes that frame to every other connected socket.

Verified this session, with a raw-socket test client standing in for a
browser (two clients, `alice` and `bob`, connecting to a running instance
of `chat_server_ws.py`):

```
--- server ---
WebSocket chat server listening on ws://localhost:8765
Client ('127.0.0.1', 40588) joined
Client ('127.0.0.1', 40596) joined
('127.0.0.1', 40596): hello from alice
Client ('127.0.0.1', 40588) left
Client ('127.0.0.1', 40596) left
--- alice ---
[alice] handshake response:
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: sgzuL0zfniDVHyMah1aUoLfZx5Q=

[alice] sent: hello from alice
--- bob ---
[bob] handshake response:
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: tt8nqciKaA8mpWa63V21f1weW94=

[bob] received broadcast: hello from alice
```

Bob's process never called `decode_frame` on its own received bytes in
this test (it parsed the unmasked frame with a two-line inline version,
since the test client is a stand-in, not the project) — but the bytes it
received are exactly what a real browser's built-in WebSocket
implementation would parse automatically the moment `chat_server_ws.py`
is pointed at from a page's JavaScript instead of from `test_client.py`.

## What breaks without this

Delete the `is_masked` branch's XOR line — change `payload =
masked_payload` directly, skipping the unmask step — and rerun the same
two-client exchange:

```
('127.0.0.1', 40620): $8?N16(6*'$!,%1
```

The server "receives" a message, but it's unrecoverable noise — the
masking key was never removed, so every byte is still XORed against
random per-frame bytes the server never undid. This is exactly why RFC
6455 mandates masking be undone with the *same* key sent alongside the
payload, not skipped: skip the step, and the protocol still looks like it
worked (a `recv()` returned data, `decode_frame` ran without error) while
producing garbage. Restoring the XOR line fixes it immediately.

## Definition of done

- [ ] `chat_server_ws.py` runs and prints `WebSocket chat server
      listening on ws://localhost:8765`.
- [ ] Two separate raw-socket test clients can each complete a handshake
      and receive back a `101 Switching Protocols` response with a
      correct `Sec-WebSocket-Accept` value.
- [ ] A masked text frame sent by one test client arrives, correctly
      unmasked and decoded, at the other test client, exactly as shown
      above.
- [ ] You can explain, without looking back at this lesson, why the mask
      bit exists on client→server frames but not on server→client frames.
- [ ] You can explain what `payload_length == 126` means and why it isn't
      just "there are 126 bytes of payload."
- [ ] Commit with a message explaining *why*, not just what:

  ```
  git add chat_server_ws.py
  git commit -m "Add WebSocket chat server — extends Lesson 20's thread-per-client broadcast design to speak RFC 6455 framing instead of raw lines, so real browsers can connect without a custom client"
  ```

## What's next

Lesson 20's server and today's server both broadcast to *every* connected
client with no concept of rooms, usernames stored server-side, or message
history — the next natural gap either could fill. Today's frame-parsing
also silently assumes one `recv()` call returns exactly one complete
frame, which is not guaranteed by TCP for larger messages; handling a
frame split across multiple `recv()` calls is real, unfinished debt this
lesson is naming rather than solving.
