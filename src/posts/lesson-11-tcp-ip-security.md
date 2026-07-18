# Lesson 11: TCP/IP for Security

Today we study what's actually happening underneath every `https://` connection you've
used throughout this course — not TLS's certificates and keys, but the plumbing one layer
down: how two machines that have never spoken before agree to start exchanging data at
all. Our case study is ten real network packets, captured off this machine's own network
interface while a five-line client talked to a five-line server.

## What you will learn

You'll open a real TCP connection, watch tcpdump capture the actual packets your operating
system sent to establish it, and be able to read a raw packet capture well enough to
identify a connection's opening handshake, its data transfer, and its teardown — the
foundational vocabulary for every later lesson in this module.

## What you need to know first

Lesson 9 (TLS): today is the layer *beneath* TLS — TLS's handshake happens entirely inside
the data a TCP connection carries, after TCP's own handshake, which you'll capture today,
has already completed. Lesson 2's brief mention of ports is revisited here properly, from
first principles.

---

## The problem

Every network conversation on the internet happens between two **IP addresses** — numeric
identifiers, like `127.0.0.1` (this specific reserved address always means "this machine,
talking to itself" — the **loopback address**), that identify a specific machine on a
network. But a single machine runs many programs at once, all potentially wanting to
communicate over the network simultaneously — a web server, an email client, this very
Python script. IP addresses alone can't tell those apart. That's what a **port** is for: a
number, from 0 to 65535, that routes incoming data to a *specific program* listening on
that machine, not just to the machine in general. Port 443 conventionally means HTTPS
traffic; port 22 conventionally means SSH; the specific number for anything you write
yourself is usually arbitrary, as long as nothing else is already using it.

**TCP** (Transmission Control Protocol) is the protocol responsible for reliable delivery
between two ports on two machines — retransmitting lost data, keeping data in order, and,
critically for this lesson, formally establishing and tearing down a connection before and
after any actual data flows. Understanding what that establishment looks like on the wire
is the foundation for reading almost any network security tool.

## The lab: capturing a real connection

**Disposable host.** A five-line TCP server and a five-line TCP client, both talking over
`127.0.0.1` — no real network required, since loopback traffic never leaves this machine,
but the protocol behavior is identical to a connection crossing the real internet.

### Step 1 — a minimal server and client

```python
# server.py
import socket

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server_socket.bind(("127.0.0.1", 9999))
server_socket.listen(1)
print("Server listening on 127.0.0.1:9999")

connection, client_address = server_socket.accept()
print("Accepted connection from", client_address)
data = connection.recv(1024)
print("Server received:", data)
connection.sendall(b"hello back")
connection.close()
server_socket.close()
```

```python
# client.py
import socket

client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_socket.connect(("127.0.0.1", 9999))
print("Client connected, local port:", client_socket.getsockname()[1])
client_socket.sendall(b"hello server")
response = client_socket.recv(1024)
print("Client received:", response)
client_socket.close()
```

**New constructs.** `socket.socket(socket.AF_INET, socket.SOCK_STREAM)` creates a new
socket — the operating system's handle for one end of a network connection.
`socket.AF_INET` means "use IPv4 addresses"; `socket.SOCK_STREAM` means "use TCP" (the
alternative, `SOCK_DGRAM`, means UDP — a different, connectionless protocol outside this
lesson's scope). `.bind(("127.0.0.1", 9999))` claims a specific address and port for this
socket to receive connections on. `.listen(1)` puts the socket into a state where it will
accept incoming connection attempts, queuing up to `1` pending connection before rejecting
further ones. `.accept()` blocks — pauses execution — until a client actually connects,
then returns a *new* socket representing that specific connection plus the client's
address. `.connect((host, port))` is the client's side: actively initiate a connection to
a listening server. `.recv(1024)` reads up to 1024 bytes from the socket. `.sendall(data)`
sends `data`, ensuring all of it is transmitted before returning.

Run the server in one terminal, then the client in another. Server output:

```
Server listening on 127.0.0.1:9999
Accepted connection from ('127.0.0.1', 34386)
Server received: b'hello server'
```

Client output:

```
Client connected, local port: 34386
Client received: b'hello back'
```

**Walkthrough.** The client's local port, `34386` in this run, was never specified in the
code — the operating system picked an unused, arbitrary high port automatically, since
only the *server's* port (`9999`) needs to be a fixed, known number for others to connect
to; a client's own port just needs to uniquely identify this one conversation from the
machine's point of view. This is why the server's printed client address includes a port
number you never chose: `('127.0.0.1', 34386)`.

### Step 2 — capturing what actually crossed the wire

While the server and client from Step 1 run, a separate tool, `tcpdump`, was capturing
every packet on the loopback interface. `tcpdump` is a packet capture and analysis tool
that reads raw network traffic directly, beneath any single program's abstractions — it
sees exactly what the operating system actually transmitted, not what any one program
believes it sent. Here is the real, unedited capture from the exact run of Step 1's code
shown above:

```
IP 127.0.0.1.34386 > 127.0.0.1.9999: Flags [S], seq 2575073515, ... length 0
IP 127.0.0.1.9999 > 127.0.0.1.34386: Flags [S.], seq 3868233338, ack 2575073516, ... length 0
IP 127.0.0.1.34386 > 127.0.0.1.9999: Flags [.], ack 1, ... length 0
IP 127.0.0.1.34386 > 127.0.0.1.9999: Flags [P.], seq 1:13, ack 1, ... length 12
IP 127.0.0.1.9999 > 127.0.0.1.34386: Flags [.], ack 13, ... length 0
IP 127.0.0.1.9999 > 127.0.0.1.34386: Flags [P.], seq 1:11, ack 13, ... length 10
IP 127.0.0.1.34386 > 127.0.0.1.9999: Flags [.], ack 11, ... length 0
IP 127.0.0.1.34386 > 127.0.0.1.9999: Flags [F.], seq 13, ack 11, ... length 0
IP 127.0.0.1.9999 > 127.0.0.1.34386: Flags [F.], seq 11, ack 14, ... length 0
IP 127.0.0.1.34386 > 127.0.0.1.9999: Flags [.], ack 12, ... length 0
```

**Protocol trace** — ten packets, three phases, read one at a time:

```
Packet 1: client(34386) → server(9999), flags [S]           -- SYN: "I want to connect"
Packet 2: server(9999) → client(34386), flags [S.]          -- SYN-ACK: "acknowledged, I
                                                                 want to connect too"
Packet 3: client(34386) → server(9999), flags [.]           -- ACK: "acknowledged, we're
                                                                 connected"
    --- this three-packet exchange is the TCP three-way handshake ---
Packet 4: client → server, flags [P.], length 12             -- pushes "hello server"
                                                                 (12 bytes) to the server
Packet 5: server → client, flags [.]                         -- acknowledges receipt
Packet 6: server → client, flags [P.], length 10              -- pushes "hello back"
                                                                 (10 bytes) to the client
Packet 7: client → server, flags [.]                          -- acknowledges receipt
    --- this four-packet exchange is the actual data transfer ---
Packet 8: client → server, flags [F.]                          -- FIN: "I'm done sending"
Packet 9: server → client, flags [F.]                          -- FIN: "I'm done too"
Packet 10: client → server, flags [.]                          -- final acknowledgment
    --- this three-packet exchange is connection teardown ---
```

**Walkthrough.** Every one of these ten packets corresponds directly to code you wrote in
Step 1, even though none of your code mentioned SYN, ACK, or FIN by name — the operating
system generates and manages this entire exchange on your behalf every time `.connect()`
or `.accept()` is called. `client.connect(...)` triggered packets 1–3. `sendall` and
`recv` on both sides triggered packets 4–7. `.close()` on each socket triggered packets
8–10. The `seq` (sequence) and `ack` (acknowledgment) numbers you can see in the raw
output are how TCP tracks exactly which bytes have been sent and confirmed received, in
order, even if the underlying network delivers packets out of order or has to retransmit
lost ones — that reliability guarantee is TCP's entire reason for existing.

**CS lens.** This three-packet opening exchange is called the **three-way handshake**, and
it's a specific instance of a **state machine** (the same concept named in Lesson 6's
Recognition list): a connection moves through defined states — `CLOSED` →
`SYN_SENT`/`SYN_RECEIVED` → `ESTABLISHED` → `FIN_WAIT`/`CLOSE_WAIT` → `CLOSED` — and each
packet's flags represent a transition from one state to the next. Neither side considers
the connection usable for actual data until all three handshake packets have completed,
which is exactly why packets 4 onward (the actual `hello server` / `hello back` exchange)
only occur after packet 3.

**Security lens.** The three-way handshake is also the basis of a real historical attack
class, the **SYN flood**: an attacker sends a flood of SYN packets (packet 1's shape) but
never completes the handshake — never sends packet 3. Each half-open connection consumes
server resources while it waits for a completion that never comes, and enough of them can
exhaust a server's capacity to accept genuine connections at all. This is a concrete,
mechanical example of Lesson 2's availability property being attacked directly at the
protocol level, beneath anything an application's own code could detect or prevent —
which is why defenses against it (SYN cookies, rate limiting at the network layer) live in
the operating system and network infrastructure, not in application code.

### Step 3 — what a port actually enforces

```python
import socket

first_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
first_socket.bind(("127.0.0.1", 9998))
first_socket.listen(1)
print("First socket bound to port 9998 successfully")

second_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    second_socket.bind(("127.0.0.1", 9998))
    print("Second socket bound too (unexpected)")
except OSError as error:
    print("Second bind failed:", error)
```

Run it:

```
First socket bound to port 9998 successfully
Second bind failed: [Errno 98] Address already in use
```

**Walkthrough.** The second `bind()` call fails, and the operating system's own error
message names exactly why: `Address already in use`. This is a mechanical guarantee, not
a convention some programs choose to follow — the operating system will not let two
programs claim the same port on the same address at the same time, because if it did,
incoming data for that port would have no unambiguous destination. This is precisely why
Lesson 2's `Doorbell` and every later port reference could rely on "port 443 means HTTPS"
as a stable fact: the operating system itself enforces one listener per port.

---

## Connect the pieces

Lesson 9's certificate verification and hybrid encryption all happen *inside* the data
carried by a TCP connection exactly like the one you just captured — TCP's handshake
(packets 1–3) establishes a reliable channel first, and only then does TLS's own
handshake begin, layered on top, inside packets that from TCP's point of view look
identical to packets 4–7 above: just data being pushed and acknowledged. Every later
lesson in this module — reconnaissance in Lesson 12, man-in-the-middle attacks in Lesson
13 — operates at exactly this level: the raw packets, ports, and connection states you can
now read directly instead of only reasoning about abstractly.

## What breaks without this

Imagine debugging a report that "the app can't connect to the server" with no knowledge of
this lesson. Without being able to read a packet capture, you're limited to whatever error
message the application layer happens to surface — often vague, sometimes actively
misleading. With it, you can tell immediately, from the packets alone, which of several
very different problems is occurring: no SYN ever leaves the client (a DNS or routing
problem, before TCP is even involved), a SYN goes out but no SYN-ACK ever returns (nothing
is listening on that port, or a firewall is silently dropping the packet), or a SYN-ACK
returns but the connection is immediately followed by a RST — reset — flag (the port is
reachable, but actively refusing the connection, a meaningfully different fact than "no
one's there at all"). Each of those has a different fix, and only a packet-level view
distinguishes them.

## Recognition

```
Today: TCP/IP, Ports, and the Three-Way Handshake

Also recognized in: every firewall rule you'll ever write (allowing or blocking
traffic by port number, exactly the mechanism from Step 3), load balancers
(routing incoming connections across many backend servers, each handshake handled
independently), the SYN flood as a named, historically significant denial-of-service
technique, `netstat` and `ss` (command-line tools that list exactly which ports a
machine currently has open and listening, the first thing many security audits
check), and port scanning (Lesson 12 — sending connection attempts to many ports at
once specifically to discover, from the outside, what Step 3 enforces from the
inside: which ports have something listening).
```

## Definition of done

- [ ] You ran the server and client from Step 1 and reproduced the printed output,
      including seeing your own machine assign an arbitrary local port to the client
- [ ] If you have `tcpdump` available (installable via your system's package manager),
      you captured your own version of Step 2's packet trace and located the three-way
      handshake, the data transfer, and the teardown in your own capture. If not, you can
      still identify all three phases in the capture shown above
- [ ] You reproduced Step 3's "Address already in use" error and can explain, in your own
      words, why the operating system enforces this rather than leaving it as a
      convention
- [ ] You can name, without looking back, the three flags involved in TCP's opening
      handshake and what each one means
- [ ] `git add .` and `git commit -m "Lesson 11: TCP/IP, ports, and reading a real packet
      capture"` in your `security-labs/` folder

**Next:** Lesson 12 — Reconnaissance and Port Scanning, where you'll use exactly what you
learned about the three-way handshake to determine, from the outside, which ports on a
machine you control are open, closed, or filtered — the first step of nearly every real
penetration test, framed defensively: understanding this is how you find out what your own
systems expose before someone else does.
