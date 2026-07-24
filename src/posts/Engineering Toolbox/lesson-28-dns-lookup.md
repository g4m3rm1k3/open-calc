# Lesson 28: A Name Is Just Another Thing You Look Up
### (DNS Lookup Tool)

**What you will build.** A real DNS resolver, built entirely from raw
UDP packets — no `socket.gethostbyname()`, no library help. It encodes
a domain name into the real DNS wire format, sends it to a real public
DNS server, and parses the real binary response back into IP addresses.
Every request and response in this lesson is genuine network traffic
to `8.8.8.8:53` (Google's public resolver) — not simulated.

**Pipeline so far:** unchanged — `Program → Socket → Network → Socket
→ Program` — this lesson reuses Lesson 21's UDP sockets and Lesson
22/26's `struct` packing, applied to a new, real, standardized binary
protocol.

**What you need to know first.** From Lesson 21: `SOCK_DGRAM`,
`sendto()`, `recvfrom()`. From Lesson 22/26: `struct.pack()`/
`struct.unpack()` for binary protocol fields. New in this lesson: DNS's
length-prefixed name encoding, and DNS name *compression* — the one
genuinely tricky part of parsing a real response correctly.

---

## Concept Unit: Encoding a Domain Name (DNS Wire Format)

### The Problem

A domain name like `"example.com"` has to be sent as part of a real
DNS query — but DNS doesn't send it as a plain string with dots. It
uses its own specific binary encoding: each part between dots, prefixed
by its own length, ending in a zero byte.

### Introduce the Concept in Isolation

```python
import struct

def encode_domain(domain):
    parts = domain.split(".")
    encoded = b""
    for part in parts:
        encoded += struct.pack("B", len(part)) + part.encode()
    encoded += b"\x00"
    return encoded

print(encode_domain("example.com"))
```

Run it:

```
b'\x07example\x03com\x00'
```

This proves DNS names are encoded as a sequence of **length-prefixed
labels**: `\x07` (7, the length of `"example"`) followed by the literal
bytes `"example"`, then `\x03` (3, the length of `"com"`) followed by
`"com"`, then a single `\x00` byte marking the end — genuinely
different from just sending `"example.com"` as a plain string. This
throwaway example is discarded; the real project builds this as part
of a complete query.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `dns_lookup.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** `struct`, `socket` modules; a reachable DNS server
  (this lesson uses `8.8.8.8`, confirmed reachable from this
  environment over UDP port 53)

### The New Code

```python
import struct
import socket

def build_query(domain, query_id=1234):
    header = struct.pack("!HHHHHH", query_id, 0x0100, 1, 0, 0, 0)
    question = b""
    for part in domain.split("."):
        question += struct.pack("B", len(part)) + part.encode()
    question += b"\x00"
    question += struct.pack("!HH", 1, 1)
    return header + question
```

### The Updated Project

This is the entire file so far:

```python
import struct
import socket

def build_query(domain, query_id=1234):                          # ← new
    header = struct.pack("!HHHHHH", query_id, 0x0100, 1, 0, 0, 0)    # ← new
    question = b""                                                     # ← new
    for part in domain.split("."):                                       # ← new
        question += struct.pack("B", len(part)) + part.encode()            # ← new
    question += b"\x00"                                                       # ← new
    question += struct.pack("!HH", 1, 1)                                        # ← new
    return header + question                                                      # ← new
```

`build_query()` now assembles a real, complete DNS query: a 12-byte
header, followed by a "question" section — the encoded domain name plus
two more fields specifying what kind of record is being requested.

### Mechanical Walkthrough
- `struct.pack("!HHHHHH", query_id, 0x0100, 1, 0, 0, 0)` — the DNS
header's real, fixed 12-byte layout: a query ID (so a reply can be
matched to its request — the same identifier idea Lesson 22's ICMP
- work used), `0x0100` (a flags field — `0x0100` specifically requests
"please resolve this recursively," a standard, real flag combination),
then four 2-byte counts — 1 question, 0 answers (this is a query, not a
response — it has no answers yet), 0 authority records, 0 additional
records. The label-encoding loop — this unit's own lab, reused for
- real.
- `struct.pack("!HH", 1, 1)` — the question's final two fields: `QTYPE=1` (requesting an "A" record — an IPv4 address) and `QCLASS=1`

(requesting the "IN," or Internet, class — effectively always this
value in practice).

### CS Lens

This is DNS as a genuine **binary wire protocol**, the same category of
thing as Lesson 22's ICMP work — a real, standardized, position-and-
length-defined format, not text like Lesson 24/25's HTTP. Also
recognized in: every other binary network protocol this curriculum
hasn't touched yet (DHCP, TLS's own handshake), and Track 8's upcoming
binary file format lessons — the discipline of reading a spec and
matching byte-for-byte is the same skill either way.

### SE Lens

DNS deliberately uses a compact binary format rather than a
human-readable text format (unlike HTTP) because DNS queries are meant
to be extremely fast and lightweight — sent over UDP (Lesson 21,
reminder: connectionless, no handshake) specifically because the
overhead of TCP's setup would be wasteful for something this small and
frequent. The real cost of that compactness is exactly what this
lesson's parsing unit has to deal with: a format that's hard to read
without decoding it first.

### Commands Needed

None yet.

### Run It

Not runnable for meaningful output — the query is built but not sent.

### Connection

We can now build a real, valid DNS query. The next unit sends it and
parses a real response.

---

## Concept Unit: Parsing the Response, Including Name Compression

### The Problem

A real DNS response starts with a header (same 12-byte shape as the
query, but now with real counts and flags), followed by the original
question echoed back, followed by the actual answer records. Answer
records don't repeat the full domain name in plain text — DNS uses
**compression**: a 2-byte "pointer" back to where that name already
appeared earlier in the message, to keep responses small.

### Introduce the Concept in Isolation

Skipped, per the Concept Isolation Rule's carve-out — this is best
shown directly against a real response's real bytes, since a
manufactured example couldn't demonstrate genuine DNS compression
pointers without essentially building the same real query/response
exchange anyway. The real code and real output below serve this
purpose directly.

### Project Change

- **Files affected:** `dns_lookup.py`
- **Change type:** add — sends the query and parses the response
- **Location:** after `build_query()`
- **Dependencies:** `build_query`, `socket`

### The New Code

```python
def dns_lookup(domain, dns_server="8.8.8.8"):
    query = build_query(domain)
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
        s.settimeout(3)
        s.sendto(query, (dns_server, 53))
        response, addr = s.recvfrom(512)

    query_id, flags, qdcount, ancount, nscount, arcount = struct.unpack("!HHHHHH", response[:12])

    offset = 12
    while response[offset] != 0:
        offset += 1 + response[offset]
    offset += 1
    offset += 4

    ips = []
    for i in range(ancount):
        name_byte = response[offset]
        if name_byte & 0xC0 == 0xC0:
            offset += 2
        else:
            while response[offset] != 0:
                offset += 1 + response[offset]
            offset += 1

        rtype, rclass, ttl, rdlength = struct.unpack("!HHIH", response[offset:offset+10])
        offset += 10
        rdata = response[offset:offset+rdlength]
        offset += rdlength

        if rtype == 1:
            ip = ".".join(str(b) for b in rdata)
            ips.append(ip)

    return ips
```

### The Updated Project

```python
import struct
import socket

def build_query(domain, query_id=1234):
    header = struct.pack("!HHHHHH", query_id, 0x0100, 1, 0, 0, 0)
    question = b""
    for part in domain.split("."):
        question += struct.pack("B", len(part)) + part.encode()
    question += b"\x00"
    question += struct.pack("!HH", 1, 1)
    return header + question


def dns_lookup(domain, dns_server="8.8.8.8"):                              # ← new
    query = build_query(domain)                                              # ← new
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:                  # ← new
        s.settimeout(3)                                                            # ← new
        s.sendto(query, (dns_server, 53))                                            # ← new
        response, addr = s.recvfrom(512)                                               # ← new

    query_id, flags, qdcount, ancount, nscount, arcount = struct.unpack(                 # ← new
        "!HHHHHH", response[:12]                                                            # ← new
    )                                                                                          # ← new

    offset = 12                                                                                  # ← new
    while response[offset] != 0:                                                                    # ← new
        offset += 1 + response[offset]                                                                  # ← new
    offset += 1                                                                                            # ← new
    offset += 4                                                                                               # ← new

    ips = []                                                                                                     # ← new
    for i in range(ancount):                                                                                        # ← new
        name_byte = response[offset]                                                                                    # ← new
        if name_byte & 0xC0 == 0xC0:                                                                                        # ← new
            offset += 2                                                                                                        # ← new
        else:                                                                                                                     # ← new
            while response[offset] != 0:                                                                                            # ← new
                offset += 1 + response[offset]                                                                                          # ← new
            offset += 1                                                                                                                    # ← new

        rtype, rclass, ttl, rdlength = struct.unpack("!HHIH", response[offset:offset+10])                                                     # ← new
        offset += 10                                                                                                                              # ← new
        rdata = response[offset:offset+rdlength]                                                                                                     # ← new
        offset += rdlength                                                                                                                              # ← new

        if rtype == 1:                                                                                                                                     # ← new
            ip = ".".join(str(b) for b in rdata)                                                                                                               # ← new
            ips.append(ip)                                                                                                                                        # ← new

    return ips                                                                                                                                                        # ← new
```

`dns_lookup()` is now complete: send a real query, receive a real
response, and correctly parse out every real IP address it contains.

### Mechanical Walkthrough
- `s.sendto(query, (dns_server, 53))` — Lesson 21's `sendto()`, reminder — `53` is DNS's standardized port, the same idea as HTTP's `80`.
- `struct.unpack("!HHHHHH", response[:12])` — decoding the response's

header, mirroring how the query's header was built. The first `while`
loop skips past the echoed-back question section, byte by byte, using
the identical length-prefix logic from this lesson's first unit — just
reading instead of writing. `offset += 4` skips the question's trailing
`QTYPE`/`QCLASS` fields. Inside the answer loop: `if name_byte & 0xC0
- == 0xC0:` — first appearance of the **compression check** — `0xC0`
(binary `11000000`) is a real, specified marker: if a name field's
first byte has its top two bits both set, the *entire* name is just a
- 2-byte pointer, not a literal length-prefixed name at all — `offset +=
2` skips exactly those two bytes, nothing more. The `else` branch
handles the (less common in practice, but valid) case of an
uncompressed literal name, using the same length-prefix walk as
- before.
- `struct.unpack("!HHIH", ...)` — the fixed fields following any
answer's name: type, class, TTL (how long this answer may be cached,
- as a 4-byte integer — `"I"`), and the length of what follows.
- `rdata = response[offset:offset+rdlength]` — the actual answer data;

for an A record (`rtype == 1`), exactly 4 raw bytes, each one an octet
- of the IP address.
- `".".join(str(b) for b in rdata)` — a generator
expression (a compact form of a list comprehension, feeding `.join()`
directly) turning those 4 raw byte values into the familiar dotted
IP-address string.

### CS Lens

DNS compression is a real instance of a general idea: **avoiding
redundant data by referencing something already present**, rather than
repeating it — Lesson 17's zip compression and Lesson 13's content
hashing both relate to this same broader theme (representing
information more compactly), even though the specific mechanisms
differ completely. A compression pointer here is closer to a direct
"go read this many bytes back" instruction than a general compression
algorithm — simpler, and sufficient because DNS names repeat
constantly within one message (the queried name reappears in every
answer).

### SE Lens

Skipping DNS compression handling entirely — treating every name as a
literal, length-prefixed sequence — would work for constructing
queries (this lesson's `build_query()` never needs compression, since
it only ever encodes one name) but would badly misparse most real
responses, which routinely use compression pointers for every answer's
name field. Real DNS servers rely on clients correctly handling this;
skipping it isn't a simplification that degrades gracefully — it's a
parser that will misread real, common traffic.

### Commands Needed

`python3 dns_lookup.py` — runs it, making a real network request.

### Run It — Real Output

```python
print(dns_lookup("example.com"))
```

```
$ python3 dns_lookup.py
['172.66.147.243', '104.20.23.154']
```

Real, genuine DNS response from Google's actual public resolver —
`example.com` currently has two real A records. Cross-checked directly
against Python's own built-in resolver, for the same domain, at the
same time:

```python
import socket
print(socket.gethostbyname("example.com"))
```

```
172.66.147.243
```

Exact match — the very first IP this hand-built parser found is
precisely what the standard library's own, much more complete resolver
returned.

### Connection

The parser correctly handles a real, successful response, including
real compression pointers. The closing section is what happens when a
domain doesn't exist at all.

---

## Closing

### Connect the Pieces

Trace a real answer record end to end: after skipping the echoed
question, `offset` pointed at the first answer's name field.
`response[offset] & 0xC0 == 0xC0` was `True` — a real compression
pointer, `offset += 2` skipped it correctly without trying to
re-decode `"example.com"` as a literal name a second time.
`struct.unpack("!HHIH", ...)` read `rtype=1` (an A record), a real TTL
of `300` seconds, and `rdlength=4`. The next 4 bytes,
`(172, 66, 147, 243)`, became `"172.66.147.243"` — a real, working IP
address, ready to actually connect to.

### What Breaks Without This

Querying a domain that genuinely does not exist produces a real
**NXDOMAIN** response — zero answers, not an error, not a timeout:

```python
query = build_query("this-domain-genuinely-does-not-exist-xyzabc123.com")
# ... send and receive ...
query_id, flags, qdcount, ancount, nscount, arcount = struct.unpack("!HHHHHH", response[:12])
rcode = flags & 0x000F
print("rcode:", rcode, "(0=success, 3=NXDOMAIN)")
print("answer count:", ancount)
```

Real output:

```
rcode: 3 (0=success, 3=NXDOMAIN)
answer count: 0
```

A version of `dns_lookup()` that skips checking `ancount` and just
assumes at least one answer is always present — a real, easy oversight
— produces something worse than a crash:

```python
name_byte = response[offset]
if name_byte & 0xC0 == 0xC0:
    offset += 2
rtype, rclass, ttl, rdlength = struct.unpack("!HHIH", response[offset:offset+10])
rdata = response[offset+10:offset+10+rdlength]
ip = ".".join(str(b) for b in rdata)
print("IP:", ip)
```

Real output, against the identical nonexistent domain:

```
IP: 1.97.12.103.116.108.100.45.115.101.114.118.101.114.115.3.110.101.116...
```

Not a crash — something more dangerous: with zero real answer records
present, `offset` pointed at whatever bytes actually followed in the
response (the authority section, in this real reply), and the code
confidently decoded them as if they were a valid IP address, producing
complete, plausible-*looking* garbage with no error raised anywhere.
This is the exact failure category Lesson 22's checksum unit warned
about: a binary protocol parsed incorrectly doesn't necessarily fail
loudly — it can silently produce confident nonsense, which is a
meaningfully worse outcome than an honest crash, precisely because
nothing about the output looks obviously wrong at a glance.

### Exercises

1. Fix the bug yourself: check `ancount == 0` before attempting to
   parse any answers, and return an empty list (or raise a clear,
   deliberate exception) for NXDOMAIN responses instead of reading
   garbage.
2. Add support for a second real record type — `AAAA` (IPv6 addresses,
   `QTYPE=28`) — and confirm your parser correctly distinguishes it
   from `A` records using `rtype`.
3. Query the same domain against two different real public DNS
   servers (`8.8.8.8` and `1.1.1.1`, for instance) and compare the
   real, returned TTLs and IPs — they're not guaranteed to be
   identical, and seeing that directly is a real, concrete look at how
   DNS results can genuinely vary by resolver.

### Definition of Done

- [ ] `dns_lookup.py` runs and returns real, correct IP addresses for a
      real domain, confirmed against `socket.gethostbyname()`
- [ ] You can explain, without looking back, what a DNS compression
      pointer is and why `0xC0` specifically marks one
- [ ] You triggered a real NXDOMAIN response and saw the naive
      parser produce confident, garbage output instead of a clean error
- [ ] You fixed the `ancount` check yourself and confirmed it now
      handles a nonexistent domain safely
- [ ] Commit:

```
git add dns_lookup.py
git commit -m "Add a hand-built DNS resolver over raw UDP: prove DNS is a real, compact binary protocol with name compression, and that trusting an answer exists without checking ancount produces silent garbage, not a clean failure"
```
