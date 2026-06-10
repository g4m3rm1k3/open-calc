# Drill 3.4 — HTTPS and TLS: What the Padlock Actually Means

**Standalone drill. No prerequisites except basic Python.**
**Time estimate:** 60–75 minutes
**Environment:** Python 3.8+ with `mitmproxy` — `pip install mitmproxy requests`
**What you will build:** An HTTP server, then intercept your own traffic to see credentials in plaintext. Then enable HTTPS and show the interception fail.
**What you will understand:** What TLS actually does, what the padlock means, and why HTTP is unacceptable for any authenticated traffic

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. You log into a website over plain HTTP. Your password travels from your browser to the server. Who else on the network can read it?

2. TLS uses a certificate to prove the server is who it claims to be. Who signs that certificate, and why does your browser trust the signer?

3. You see a padlock in your browser. Does that mean the website is safe? Does it mean the website owner is trustworthy?

4. A man-in-the-middle attacker intercepts your HTTPS traffic and presents their own certificate. What stops them from successfully impersonating the server?

*(Answers at the bottom.)*

---

## The Concept: Why HTTP Is Dangerous

### Concept: TLS — Transport Layer Security

**What it is:**
TLS is a protocol that wraps a TCP connection with three guarantees: **confidentiality** (the traffic is encrypted — eavesdroppers see gibberish), **integrity** (the data was not modified in transit — tampering is detected), and **authentication** (you are talking to the server you think you are — impersonation is prevented).

HTTP without TLS provides none of these. Everything travels as plaintext.

**The problem — plaintext HTTP:**

```
You type: POST /login HTTP/1.1
          Content-Type: application/json
          {"username": "alice", "password": "hunter2"}

Anyone on the same network sees exactly that — verbatim.
```

This includes: your ISP, anyone on the same WiFi network, anyone between you and the server, any compromised router in the path. Coffee shop WiFi is a well-known attack vector: an attacker joins the same network and runs a passive sniffer.

**The solution — TLS handshake:**

```
Client → Server: "Hello, here are the cipher suites I support"
Server → Client: "Hello, here's my certificate (my public key + identity, signed by a CA)"
Client:           Verify the certificate chain — is it signed by a trusted CA?
Client → Server: "Here's a random secret, encrypted with your public key"
Both:             Derive a shared symmetric session key from the secret
All further data: Encrypted with the session key (AES — fast symmetric encryption)
```

After the handshake, all traffic is encrypted with a symmetric key that only the two parties know. Eavesdroppers see encrypted bytes.

**What it hides:**
The cryptographic operations: key exchange (ECDHE), certificate verification (X.509 chain), and symmetric encryption (AES-GCM). You configure TLS with `ssl.wrap_socket()` or `ssl.SSLContext()`. The handshake, key derivation, and encryption happen automatically inside the SSL library.

**The certificate chain:**
A certificate is a document containing a public key and an identity (domain name), signed by a Certificate Authority (CA). Your browser ships with a list of trusted root CAs (around 150). When a server presents a certificate signed by a trusted CA, your browser verifies the signature — proving the certificate was issued by someone your browser trusts.

The chain: root CA → (optional) intermediate CA → server certificate. The server sends the entire chain. Your browser verifies each signature up to a trusted root.

**Constraints:**
- TLS only encrypts the data — it does not make the server trustworthy. A phishing site can have a valid TLS certificate (many do). The padlock means "the connection is encrypted," not "this site is safe."
- A self-signed certificate encrypts traffic but browsers will warn — no trusted CA signed it, so authentication is not verified.
- Certificate pinning: apps can hard-code the expected certificate, refusing to connect if it changes. This prevents even valid-certificate MitM attacks.
- TLS 1.3 (current) is significantly faster and more secure than TLS 1.2. Older versions (1.0, 1.1) have known vulnerabilities.

**Failure modes:**
- Expired certificate: the browser rejects connection, users see a scary warning, site goes down
- Certificate for wrong domain: `example.com` certificate presented by `evil.com` — browser rejects
- Weak cipher suite: TLS 1.0 with RC4 — attackers can decrypt traffic with enough data
- Misconfigured server sending incomplete chain: some clients fail to verify, some succeed — intermittent failures

**Operational reality:**
Let's Encrypt (free, automated TLS certificates) removed the cost barrier. There is no excuse for HTTP-only sites in production. Most cloud platforms (Vercel, Railway, Fly.io) provide TLS automatically. For custom servers, `certbot` automates certificate issuance and renewal from Let's Encrypt. Certificate rotation (renewing before expiry) must be automated — manual renewal at 3am because a certificate expired is a preventable outage.

**You will see this again in:**
Every production web service. Every API that handles user data. Every bank, healthcare, and government site. The `ssl` module in Python, `https` in Node.js, SSL termination in nginx/Caddy — all implementing this same protocol.

**Watch for:**
The padlock does not mean the site is safe or trustworthy — it only means the connection is encrypted. A perfectly valid TLS certificate can be issued to a phishing site that looks exactly like your bank.

---

## Step 1 — See Plaintext HTTP Credentials

Create `http_server.py`:

```python
# http_server.py — a bare HTTP server with a login endpoint
# This server has NO TLS — all traffic is plaintext
import http.server
import json
import urllib.parse

class LoginHandler(http.server.BaseHTTPRequestHandler):

    def do_POST(self):
        if self.path == "/login":
            # Read the request body
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            # Decode the JSON body
            try:
                data = json.loads(body)
            except json.JSONDecodeError:
                self.send_error(400, "Bad JSON")
                return

            username = data.get("username", "")
            password = data.get("password", "")

            # Simulate authentication — in production this would check a database
            if username == "alice" and password == "secret123":
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"token": "fake-jwt-token"}).encode())
            else:
                self.send_response(401)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Invalid credentials"}).encode())
        else:
            self.send_error(404)

    def log_message(self, format, *args):
        # Override to add a clear warning in the server log
        print(f"[HTTP SERVER] {format % args}")
        print(f"  ⚠️  This traffic is UNENCRYPTED — credentials are visible on the network")


if __name__ == "__main__":
    port = 8080
    print(f"Starting HTTP server on port {port}")
    print(f"⚠️  NO TLS — all traffic including passwords is in plaintext")
    server = http.server.HTTPServer(("localhost", port), LoginHandler)
    server.serve_forever()
```

Create `http_client.py`:

```python
# http_client.py — sends credentials over plain HTTP
# This simulates a login form submission
import requests   # pip install requests

response = requests.post(
    "http://localhost:8080/login",
    json={"username": "alice", "password": "secret123"}
    # json=: sets Content-Type to application/json and serializes the dict
)

print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
```

### SAVE AND TRY

In one terminal, start the server:
```bash
python http_server.py
```

In a second terminal, run the client:
```bash
python http_client.py
```

**Expected output (client):**
```
Status: 200
Response: {'token': 'fake-jwt-token'}
```

**Now intercept it.** In a third terminal:
```bash
# Run mitmproxy in transparent mode — intercepts traffic on port 8081, forwards to 8080
mitmproxy --mode regular --listen-port 8081
```

Change `http_client.py` to use port 8081:
```python
response = requests.post(
    "http://localhost:8081/login",   # through the proxy
    json={"username": "alice", "password": "secret123"},
    proxies={"http": "http://localhost:8081"}
)
```

Run the client again and watch `mitmproxy` — you will see the full request including `"password": "secret123"` in plaintext.

**Change something:** Change the password in the client to `"password": "my_bank_password"`. Run again. The proxy shows it perfectly. This is exactly what an attacker on your WiFi network sees.

---

## Step 2 — Enable TLS with a Self-Signed Certificate

Create a self-signed certificate (for local development):

```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes \
  -subj "/CN=localhost"
# -x509: generate a certificate (not a signing request)
# -newkey rsa:4096: generate a 4096-bit RSA key pair
# -keyout key.pem: save the private key here
# -out cert.pem: save the certificate here
# -days 365: valid for one year
# -nodes: no passphrase on the private key (for development convenience)
# -subj "/CN=localhost": set the Common Name to 'localhost'
```

Create `https_server.py`:

```python
# https_server.py — same server as before, wrapped in TLS
import http.server
import json
import ssl

class LoginHandler(http.server.BaseHTTPRequestHandler):

    def do_POST(self):
        if self.path == "/login":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            try:
                data = json.loads(body)
            except json.JSONDecodeError:
                self.send_error(400, "Bad JSON")
                return

            username = data.get("username", "")
            password = data.get("password", "")

            if username == "alice" and password == "secret123":
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"token": "fake-jwt-token"}).encode())
            else:
                self.send_response(401)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Invalid credentials"}).encode())
        else:
            self.send_error(404)

    def log_message(self, format, *args):
        print(f"[HTTPS SERVER] {format % args}")
        print(f"  ✅ Traffic is TLS-encrypted — credentials are not visible on the network")


if __name__ == "__main__":
    port = 8443
    # Create an SSL context — this is what wraps the socket with TLS
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    # PROTOCOL_TLS_SERVER: tells ssl to negotiate TLS as a server (not client)
    # This selects the best TLS version both sides support (ideally TLS 1.3)

    context.load_cert_chain("cert.pem", "key.pem")
    # load_cert_chain: load our self-signed certificate and private key
    # The certificate is sent to clients during the TLS handshake
    # The private key is used to decrypt the client's key exchange message

    server = http.server.HTTPServer(("localhost", port), LoginHandler)
    server.socket = context.wrap_socket(server.socket, server_side=True)
    # wrap_socket: replace the plain TCP socket with a TLS-wrapped socket
    # server_side=True: this end performs the server role in the TLS handshake

    print(f"Starting HTTPS server on port {port}")
    print(f"✅  TLS enabled — traffic is encrypted")
    server.serve_forever()
```

Create `https_client.py`:

```python
# https_client.py — sends credentials over HTTPS
import requests

response = requests.post(
    "https://localhost:8443/login",
    json={"username": "alice", "password": "secret123"},
    verify="cert.pem"
    # verify="cert.pem": tell requests to trust our self-signed cert
    # In production, verify=True (the default) trusts the system CA store
    # Our cert is self-signed — not in the system CA store — so we point to it directly
)

print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
```

### SAVE AND TRY

Start the HTTPS server:
```bash
python https_server.py
```

Run the HTTPS client:
```bash
python https_client.py
```

**Expected output:**
```
Status: 200
Response: {'token': 'fake-jwt-token'}
```

**Now try to intercept it.** Set up mitmproxy again and route the client through it:

```python
# In https_client.py, add proxies= and disable verification:
response = requests.post(
    "https://localhost:8443/login",
    json={"username": "alice", "password": "secret123"},
    verify=False,               # ignore certificate errors (ONLY for this test)
    proxies={"https": "http://localhost:8081"}
)
```

```bash
python https_client.py
```

Expected: the request fails with a certificate error OR mitmproxy shows it as encrypted — it cannot read the `password` field. The proxy can see that a request was made to `localhost:8443`, but the body is ciphertext.

**Change something:** Run `https_client.py` without `verify="cert.pem"` (default `verify=True`):
```python
response = requests.post("https://localhost:8443/login", json={...})
```
Expected error: `SSLCertVerificationError: certificate verify failed: self-signed certificate`. This is exactly what happens when a server presents a certificate not signed by a trusted CA — your client (like a browser) refuses to connect.

---

## Challenge

**No solution provided. Requirements checklist only.**

Build a script that demonstrates certificate chain verification. Create two certificates: a fake root CA certificate, and a server certificate signed by that fake CA. Then configure a server to use the server certificate, and a client to trust the fake root CA.

**Requirements checklist:**

- [ ] Generate a fake root CA key and self-signed certificate (`fake_ca.key`, `fake_ca.crt`)
- [ ] Generate a server key and CSR (Certificate Signing Request) for `localhost`
- [ ] Sign the server CSR with the fake CA to produce a server certificate (`server.crt`)
- [ ] Configure `https_server.py` to use `server.crt` and the server key
- [ ] Configure `https_client.py` to trust `fake_ca.crt` (not `server.crt` directly)
- [ ] The client connects successfully — it trusts the server cert because it's signed by the trusted CA
- [ ] Remove `fake_ca.crt` from the client's trusted certs — the client now rejects the connection
- [ ] Print the certificate chain details: `openssl x509 -in server.crt -text -noout` — show the Issuer and Subject fields

**Starter openssl commands:**
```bash
# Generate the fake CA:
openssl req -x509 -newkey rsa:4096 -keyout fake_ca.key -out fake_ca.crt -days 365 -nodes \
  -subj "/CN=Fake CA"

# Generate server key and CSR:
openssl req -newkey rsa:4096 -keyout server.key -out server.csr -nodes \
  -subj "/CN=localhost"

# Sign the server CSR with the fake CA:
openssl x509 -req -in server.csr -CA fake_ca.crt -CAkey fake_ca.key \
  -CAcreateserial -out server.crt -days 365
```

**When you're done:** `python https_client.py` with `verify="fake_ca.crt"` connects successfully. The same client with `verify=True` (system CA store) fails — our fake CA is not trusted by the OS. `openssl x509 -in server.crt -text -noout` shows `Issuer: CN=Fake CA` and `Subject: CN=localhost`.

**Stuck?** Ask AI: "I've created a fake CA certificate and signed a server certificate with it. In Python's `requests` library, how do I configure `verify=` to trust my fake CA certificate as the root of trust, so my client will accept a certificate signed by that CA?"

---

## Quick Check Answers

**1. Who can read your password over plain HTTP?**
Anyone with access to the network path between your browser and the server. On a shared WiFi network, this includes anyone else on the same network who runs a packet sniffer (Wireshark, tcpdump). It also includes your ISP, any router or switch in the path, and anyone who has compromised any intermediate device. HTTP is fully plaintext — the password appears verbatim in the request body. This is demonstrated in Step 1: mitmproxy shows the entire JSON body including the password with zero effort.

**2. Who signs TLS certificates, and why does your browser trust them?**
A Certificate Authority (CA) — a company or organization that has been vetted and whose root certificate is included in the operating system's trust store (Windows, macOS) or the browser's built-in trust store. The trust chain: the CA verifies that the certificate requester owns the domain (via DNS or file challenge), then signs the certificate with the CA's private key. Your browser verifies the signature using the CA's public key (from the trusted root store). About 150 root CAs are trusted by default. The CA system's weakness: any trusted CA can sign a certificate for any domain. A compromised or malicious CA could issue fraudulent certificates — this happened with DigiNotar in 2011.

**3. Does a padlock mean the website is safe?**
No. The padlock means only that the **connection** is encrypted — the data in transit cannot be read by eavesdroppers. It says nothing about the site's intentions. A phishing site mimicking your bank can have a perfectly valid TLS certificate — Let's Encrypt issues them free of charge, automatically, with no identity verification beyond domain ownership. You can own `paypa1.com`, get a certificate for it, and have a padlock. The padlock proves encryption, not trustworthiness.

**4. What stops a MitM attacker from presenting their own certificate?**
Certificate validation. The attacker's certificate would need to be signed by a CA that your browser trusts. Unless the attacker has compromised a trusted CA (rare and extremely serious), they cannot get a CA to sign a certificate for a domain they don't own. A self-signed certificate fails validation because it's not signed by any trusted CA — the browser shows a warning and refuses to proceed by default. This is demonstrated in Step 2: the client's `SSLCertVerificationError` when using `verify=True` is exactly the error a browser shows when the certificate cannot be verified against the trusted CA list.
