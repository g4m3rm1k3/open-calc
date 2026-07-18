# Lesson 13: Man-in-the-Middle Attacks

Today we study the network-level version of Lesson 9's Eve — not manipulating keys in a
Python variable, but a real process sitting on a real socket between a real client and a
real server, silently reading and altering what passes through. Our case study is a bank
balance of $500 that becomes $999,999 in transit, without either endpoint noticing — and
then the same attack, attempted again, against a connection protected the way Lesson 9
taught you to protect it.

## What you will learn

You'll run a genuine three-process attack — client, attacker-controlled proxy, real
server — over real sockets on this machine, and watch the proxy silently rewrite a
response in transit. Then you'll rebuild the same scenario with TLS and proper certificate
verification in place, and watch the identical attack fail immediately, for a reason
you'll be able to name precisely.

## What you need to know first

Lesson 9 (TLS and the Handshake) directly — today is that lesson's attack, moved from
manipulated Python objects to an actual attacker process on the network. Lesson 11 (TCP/IP)
for the socket mechanics; Lesson 2 (CIA Triad) — pay attention to which property this
attack breaks, because it's not the one you might expect.

---

## The problem

Lesson 9 showed Eve substituting a public key inside a single Python script. On a real
network, "being in the middle" is a position an attacker has to actually obtain — for
example, by controlling a proxy the victim's traffic is routed through, by controlling a
WiFi access point the victim connects to, or, classically, through **ARP spoofing**: on a
local network, devices find each other using ARP (Address Resolution Protocol), which
maps IP addresses to physical hardware addresses — and has no built-in authentication at
all. Any device can send an unsolicited ARP reply claiming "I am the router," and other
devices on the network will simply believe it, routing their traffic through the attacker
without any cryptographic proof required. (This lesson doesn't run a live ARP spoofing
attack — it requires a real multi-device local network this sandbox doesn't have — but the
*outcome* it produces, an attacker positioned between two parties who each believe they're
talking directly to the other, is exactly what the rest of this lesson demonstrates and
defends against.)

Once an attacker has that position, the question this lesson answers is: what can they
actually do with it, and what specifically stops them?

## The lab: a proxy that lies

**Disposable host.** A three-process "bank" scenario: `plain_server.py` (the real bank),
`plain_client.py` (the victim), and `plain_proxy.py` (Eve, sitting in between).

### Step 1 — the attack, over plaintext

```python
# plain_server.py -- the real bank
import socket

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.bind(("127.0.0.1", 8001))
server.listen(1)
connection, _ = server.accept()
request = connection.recv(1024)
if request == b"balance":
    connection.sendall(b"your balance is $500")
connection.close()
server.close()
```

```python
# plain_proxy.py -- Eve, positioned between the victim and the real bank
import socket

proxy = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
proxy.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
proxy.bind(("127.0.0.1", 8000))
proxy.listen(1)
victim_connection, _ = proxy.accept()

real_server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
real_server.connect(("127.0.0.1", 8001))

request = victim_connection.recv(1024)
print("Proxy saw request:", request)
real_server.sendall(request)
real_response = real_server.recv(1024)
print("Proxy saw real response:", real_response)

tampered_response = b"your balance is $999999"
print("Proxy forwards tampered response:", tampered_response)
victim_connection.sendall(tampered_response)

victim_connection.close()
real_server.close()
proxy.close()
```

```python
# plain_client.py -- the victim, believing it's talking directly to the bank
import socket

client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect(("127.0.0.1", 8000))  # victim thinks 8000 is the bank; it's Eve
client.sendall(b"balance")
print("Client believes:", client.recv(1024))
client.close()
```

Run `plain_server.py`, then `plain_proxy.py`, then `plain_client.py`. Proxy output:

```
Proxy saw request: b'balance'
Proxy saw real response: b'your balance is $500'
Proxy forwards tampered response: b'your balance is $999999'
```

Client output:

```
Client believes: b'your balance is $999999'
```

**Walkthrough.** `plain_client.py` connects to port 8000, believing that's the bank — this
mirrors exactly how ARP spoofing or a rogue proxy configuration would redirect a victim's
traffic without their awareness. Port 8000 is actually Eve's proxy. Eve opens her own,
completely separate connection to the real bank on port 8001, forwards the client's
request faithfully (so nothing looks broken), receives the real, correct response — and
then discards it, sending back whatever she chooses instead. Neither `plain_client.py` nor
`plain_server.py` contains any bug. Both behaved exactly as written. The vulnerability is
entirely positional: Eve is between them, and nothing in this protocol gives either
endpoint any way to detect that.

**Security lens.** Notice which CIA property this breaks first: not confidentiality (Eve
reading the balance) but **integrity** — the client received data that does not match
what the real server sent, with no indication anything was altered. This is worth sitting
with, because Lesson 9's version of this attack emphasized Eve *reading* Bob's message;
this version emphasizes that a positioned attacker can just as easily *rewrite* data
passing through in either direction, silently.

### Step 2 — the same attack, with TLS and certificate verification in place

First, three certificates, generated the same way as Lesson 9's Step 2 — a trusted CA, a
genuine certificate for `bank.example` signed by that CA, and a forged certificate for
`bank.example` that Eve signs with her own, separate, untrusted CA:

```python
# gen_certs.py (abbreviated -- full certificate-building code is identical to Lesson 9)
# Produces: ca_cert.pem/ca_key.pem (the trusted CA)
#           server_cert.pem/server_key.pem (the REAL bank.example, signed by the real CA)
#           eve_cert.pem/eve_key.pem (a FORGED bank.example, signed by Eve's own fake CA)
```

```python
# tls_real_server.py -- the real bank, now speaking TLS
import socket
import ssl

context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(certfile="server_cert.pem", keyfile="server_key.pem")

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.bind(("127.0.0.1", 8443))
server.listen(1)
raw_connection, _ = server.accept()
tls_connection = context.wrap_socket(raw_connection, server_side=True)
request = tls_connection.recv(1024)
if request == b"balance":
    tls_connection.sendall(b"your balance is $500")
tls_connection.close()
server.close()
```

```python
# tls_client.py -- the victim, this time verifying who it's actually talking to
import socket
import ssl

context = ssl.create_default_context(cafile="ca_cert.pem")

raw_socket = socket.create_connection(("127.0.0.1", 8443))
try:
    tls_socket = context.wrap_socket(raw_socket, server_hostname="bank.example")
    tls_socket.sendall(b"balance")
    print("Client received:", tls_socket.recv(1024))
    tls_socket.close()
except ssl.SSLCertVerificationError as error:
    print("Client REJECTED the connection:", error)
```

**New construct: `ssl.create_default_context(cafile=...)`.** Exactly like Lesson 9's Step
4, this builds a TLS context — but here, instead of relying on the system's pre-installed
CA list, `cafile="ca_cert.pem"` tells it to trust *only* the specific CA certificate this
lab generated, standing in for "the CA certificate this client was configured to trust in
advance." `server_hostname="bank.example"` tells the client which identity it expects to
verify against — this is checked against the certificate's subject, closing a gap neither
Lesson 9 nor Step 1 of today's lesson exercised directly: even a validly-signed certificate
for the *wrong* hostname should be, and is, rejected.

Run `tls_real_server.py`, then `tls_client.py`, with no attacker present:

```
Client received: b'your balance is $500'
```

**Walkthrough.** Talking directly to the real, correctly certificated server, the
handshake succeeds and the exchange works exactly as intended — this is the baseline,
confirming the setup itself is sound before introducing an attacker.

### Step 3 — the attack, attempted again, against TLS

```python
# tls_mitm_proxy.py -- Eve, now attempting the identical positional attack against TLS
import socket
import ssl

context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(certfile="eve_cert.pem", keyfile="eve_key.pem")  # Eve's OWN cert/key

proxy = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
proxy.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
proxy.bind(("127.0.0.1", 8443))
proxy.listen(1)
raw_connection, _ = proxy.accept()
try:
    tls_connection = context.wrap_socket(raw_connection, server_side=True)
    print("Proxy: handshake with victim succeeded (this would be bad)")
except ssl.SSLError as error:
    print("Proxy: victim's TLS client rejected the handshake:", error)
proxy.close()
```

Run `tls_mitm_proxy.py` in place of the real server, then run `tls_client.py` against it,
completely unmodified from Step 2. Proxy output:

```
Proxy: victim's TLS client rejected the handshake: [SSL: TLSV1_ALERT_UNKNOWN_CA] tlsv1 alert unknown ca
```

Client output:

```
Client REJECTED the connection: [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: unable to get local issuer certificate
```

**Walkthrough.** Eve positioned her proxy identically to Step 1 — same port, same
"pretend to be the bank" strategy — but this time she cannot complete the TLS handshake at
all. Her certificate claims to be `bank.example`, but it's signed by *her own* CA, not the
CA `tls_client.py` was configured to trust. The moment `context.wrap_socket` attempts to
verify that signature against the trusted CA's public key — exactly Lesson 9's Step 3
verification, running automatically inside the TLS library now instead of by hand — it
fails, and the connection is torn down before a single byte of `balance` or account data
ever crosses it. Compare this directly to Step 1: same attacker, same position on the
network, same intent — but this time, the attack is detected and blocked before any data
is exchanged, rather than succeeding silently.

**CS lens.** Notice exactly what changed between Step 1 and Step 3: not the attacker's
position (identical in both), not the protocol's plumbing (both use TCP sockets the same
way) — only whether the application-layer protocol included an identity check at all.
TCP itself, as Lesson 11 covered, has no concept of "is this really who I think it is"; it
only guarantees reliable delivery to whatever's on the other end of the socket. TLS is
what adds the missing check, and Step 3 shows that check actually firing.

**Security lens.** This is the concrete, mechanical reason "always use HTTPS, never plain
HTTP" is not a vague best practice but a specific, testable defense: Step 1's plaintext
scenario has no mechanism, anywhere, capable of detecting a positioned attacker, no matter
how carefully the rest of the code is written. Step 3's TLS scenario detects and blocks
the identical attacker automatically, as a direct consequence of certificate verification
Lesson 9 already taught you to read. The vulnerability in Step 1 was never really about
sockets or proxies — it was the complete absence of the identity-verification layer TLS
exists to provide.

---

## Connect the pieces

This lesson is Lesson 9's chain of trust, demonstrated as an actual network attack instead
of a same-process simulation, and Lesson 11's raw sockets, given a reason to care about
who's actually listening on the other end. The mechanism that stopped Step 3's attack —
signature verification against a pre-trusted CA — is word-for-word the same mechanism
Lesson 9 walked through by hand. If you understood why the forged certificate failed
verification in Lesson 9's Step 3, you already understood why Step 3 here fails the same
way; today only changed the setting from a script to a live network attacker.

## What breaks without this

Return to Step 1 and imagine the traffic isn't a toy bank balance but an actual login
form submitting a password over plain HTTP on public WiFi. The identical positional
attack — no ARP spoofing sophistication required beyond controlling the network path, which
public WiFi access points are trivially positioned to do — lets an attacker read the
password directly as it crosses their proxy, or, just as easily, silently redirect the
login form's destination, or inject additional fields into a page the victim was served.
None of this requires breaking any cryptography, guessing any password, or exploiting any
application bug. It requires only plaintext and position — which is exactly why every
password field, every login form, and effectively every modern website now requires HTTPS
by default rather than treating it as optional hardening.

## Recognition

```
Today: Man-in-the-Middle Attacks, from Position to Detection

Also recognized in: HSTS (HTTP Strict Transport Security — a header telling
browsers "never downgrade this site to plain HTTP, ever, even if asked," closing
the window where a first plaintext request could be intercepted before HTTPS
begins), certificate pinning (Lesson 9's Recognition list — refusing to trust
even a validly-signed certificate unless it matches one specific expected
certificate, defending against a compromised or coerced CA), evil twin WiFi
access points (a fake access point with a legitimate-sounding name, positioning
the attacker as this lesson's proxy for every connected victim), SSH host key
warnings (your terminal doing, by hand, exactly what `tls_client` did
automatically), and downgrade attacks, where an attacker doesn't forge a
certificate at all but instead tries to trick a client into using an older,
weaker, or entirely unencrypted protocol version where no such verification
exists.
```

## Definition of done

- [ ] You ran Step 1's three-process attack and reproduced the tampered balance the
      client received
- [ ] You generated the three certificates, ran Step 2's baseline (no attacker) and
      confirmed the real exchange succeeds
- [ ] You ran Step 3's attack against the TLS-protected version and reproduced both the
      proxy's and the client's rejection messages
- [ ] You can explain, in one sentence, exactly what was different about the attacker's
      *capability* between Step 1 and Step 3 — not their position, which was identical
- [ ] You can name which CIA property Step 1's tampered balance broke, and explain why
      it's not the property most people assume a "man-in-the-middle" attack targets first
- [ ] `git add .` and `git commit -m "Lesson 13: man-in-the-middle attacks -- plaintext
      vs TLS-verified"` in your `security-labs/` folder

**Next:** Lesson 14 opens Module E — Application Security — with Sessions and Cookies,
where you'll build the mechanism that lets a website remember you're logged in across
multiple requests, and see exactly what an attacker gains by stealing that mechanism
instead of your password.
