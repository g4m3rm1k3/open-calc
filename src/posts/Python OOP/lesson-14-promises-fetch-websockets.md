# Lesson 14: Waiting Without Blocking, and a Connection That Stays Open
### (Project 6 — Chat Client, JavaScript)

**What you will build.** A JavaScript client that fetches real data from
Project 3's actual REST API — the same Python server built back in
Phase 1, called now from the other side of the exact wire it was built
to serve — and then a real WebSocket chat server, broadcasting messages
between two independently connected clients in real time. The
transferable problems this lesson is actually about: representing "a
value that doesn't exist yet, but will" as a real thing code can work
with, and the genuine difference between a one-shot request and a
connection that stays open and can be pushed to from either side,
unprompted.

**What you need to know first.** Project 3 (Phase 1), Lessons 8–9 — the
real `UserRepository`-backed REST API this lesson calls, unmodified.
Lesson 12 — `setTimeout` and the non-blocking event loop it depends on.

---

## Concept Unit: Promises

### The Problem

Every asynchronous thing built so far — `setTimeout` in Lesson 12,
`addEventListener` in Lesson 10 — works by handing over a callback
function and waiting for it to be called later. That's workable for one
step. Fetching data from a network is the same shape, one step, but the
Chat Client is about to need several dependent async steps in a
row — fetch data, then use it to do something else that's also async —
and nesting callback inside callback inside callback for that gets
unreadable fast, a real, well-known problem with no name-recognition
needed to feel: this curriculum hasn't hit it yet only because nothing
so far chained more than one async step together.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `promise_lab.js` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file, new project directory.
- **Dependencies** — none; `Promise` is built into JavaScript.

### The New Code

```javascript
function delayedValue(value, ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, ms);
  });
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```javascript
console.log("requesting...");
delayedValue("here it is", 100).then((result) => {
  console.log("got:", result);
});
console.log("...continuing immediately, not waiting");
```

Real output, in the exact order printed:

```
requesting...
...continuing immediately, not waiting
got: here it is
```

The third line of code — `"...continuing immediately"` — printed
*before* `"got: here it is"`, even though it's written *after* the call
that eventually produces that result. `delayedValue(...)` returned
immediately, without waiting for its 100ms timer, handing back a
**Promise**: not the value itself, but a real object *representing* a
value that will exist later. `.then((result) => {...})` registers what
should happen once that value is genuinely ready — the same underlying
idea as `addEventListener`, a function registered now, called later —
but specifically for "this one thing will happen exactly once,
eventually," rather than "this might happen many times, whenever."

### Discard the throwaway example

`delayedValue`'s specific demonstration is deleted — the function itself
carries forward; the `console.log` sequence proving the ordering is
this unit's own point and won't reappear as project code.

### Mechanical walkthrough

- `return new Promise((resolve) => {` — **(a) first appearance.**
  `new Promise(...)` takes a function — called the **executor** — and
  runs it immediately; `resolve` is a function `Promise` hands to that
  executor, and calling it is what marks the Promise as successfully
  finished, carrying whatever value was passed to `resolve`.
- `setTimeout(() => { resolve(value); }, ms);` — **(b) hard concept
  reappearing**, `setTimeout` from Lesson 12 — here used to delay
  calling `resolve`, simulating work that genuinely takes time (a real
  network request, in the next unit, plays exactly this role, without
  needing a fake timer at all).
- `.then((result) => { console.log("got:", result); })` — **(a) first
  appearance.** Registers a function to run once the Promise resolves,
  and passes whatever `resolve` was called with — here, `"here it is"`
  — as `result`.

### CS lens

A Promise is a concrete, inspectable stand-in for a value that doesn't
exist yet — sometimes called a **future** in other languages. Also
recognized in: Python's own `asyncio` (a genuinely different mechanism,
never used in Phase 1 since nothing there needed it), a shipping
tracking number (a real, holdable thing representing a package that
hasn't arrived yet), a restaurant buzzer handed over while food is still
being prepared.

### SE lens

The alternative — passing a plain callback directly to `delayedValue`,
the way `setTimeout` itself works — is genuinely simpler for exactly one
async step, and Lesson 12 used it correctly for exactly that reason.
Promises cost a small amount of extra ceremony (`new Promise`,
`resolve`) for a single step; the real payoff, not visible yet in this
minimal example, is what happens once several async steps need to
happen in *sequence*, each depending on the previous one's result —
which the next unit addresses directly.

### Commands needed

`node promise_lab.js`, the same pattern as every JavaScript lesson so
far.

### Run it

Shown above.

### Connecting sentence

A Promise is a real, honest representation of "not yet, but soon" — the
next unit makes code that waits on one read almost as plainly as code
that doesn't wait at all.

---

## Concept Unit: async/await

### The Problem

`.then((result) => { ... })` reads fine for one step. Chained three or
four deep — each step's callback containing the next step's `.then()`
— it becomes exactly the nested, hard-to-follow shape this lesson's
first unit named as the real motivating problem, just with `.then()`
instead of raw callbacks. The *sequence* of steps is real and linear —
"do this, then this, then this" — but the code's own shape stops looking
linear the deeper it nests.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `async_await_lab.js` (throwaway, this
  unit only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `delayedValue`, this lesson's previous unit.

### The New Code

```javascript
async function run() {
  console.log("requesting...");
  const result = await delayedValue("here it is", 100);
  console.log("got:", result);
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```javascript
run();
console.log("...this still prints before 'got:', proving run() didn't block");
```

Real output:

```
requesting...
...this still prints before 'got:', proving run() didn't block
got: here it is
```

The exact same non-blocking behavior as the previous unit's `.then()`
version — the line after `run()` still prints before `"got:"` does — but
`run`'s own body reads top to bottom, like ordinary synchronous code,
with no nested callback at all. `async` in front of a function
declaration marks it as one that can use `await` inside; `await` pauses
*that function's own execution* — not the whole program, proven by the
line right after `run()` still running immediately — until the Promise
it's given actually resolves, then hands back the resolved value
directly, as if it were a normal, immediate return value.

### Discard the throwaway example

Not applicable — `run` and `delayedValue` carry forward conceptually
into the next unit's real project code, but this exact pairing is
deleted; the next unit fetches a real Promise from a real network call
instead of a simulated one.

### Mechanical walkthrough

- `async function run() {` — **(a) first appearance** of the `async`
  keyword: marks this function as one that implicitly returns a
  Promise itself, and unlocks `await` inside its body.
- `const result = await delayedValue("here it is", 100);` — **(a)
  first appearance** of `await`: pauses `run`'s own execution at this
  exact line until the Promise on the right resolves, then assigns the
  resolved value to `result` — functionally identical to the previous
  unit's `.then((result) => {...})`, written to look like an ordinary
  assignment instead.
- `console.log("got:", result);` — **(c) already basic** — note this
  line, unlike the `.then()` version, is just the *next line* in the
  function, not a separate nested callback.

### CS lens

This is **syntactic sugar**: `async`/`await` doesn't change *what*
happens underneath — it's still Promises, still non-blocking, still the
same event loop from Lesson 12 — it changes how the *sequence* of steps
looks in the code, from nested to linear. Also recognized in: a `for`
loop being sugar over more primitive iteration, a list comprehension
(Project 1, Lesson 2) being sugar over a loop with `.append()` calls.

### SE lens

`async`/`await` is genuinely preferred in modern JavaScript for
multi-step async sequences specifically because it reads the way the
steps actually happen, in order — the real cost is subtle: it's easy to
forget that an `async` function still returns a Promise itself, and
forgetting to `await` a call to one silently produces a Promise object
where a real value was expected, rather than an error. That's a real,
common mistake worth naming here, before it can happen inside actual
project code in the next unit.

### Commands needed

None new.

### Run it

Shown above.

### Connecting sentence

`await` makes waiting for something to arrive read almost like it's
already there — which is exactly what's needed to fetch real data from
a real server without the code turning into a pyramid of nested
callbacks.

---

## Concept Unit: `fetch`, and Calling Phase 1's Own API

### The Problem

The Chat Client needs real data from somewhere — and Project 3 already
built exactly that: a real REST API, `GET`/`POST /users`, running on
Python's `http.server`, completely unmodified since Lesson 9. This is
the first genuine test of whether that API's own promise — a clean,
documented HTTP interface, decoupled from any specific client — actually
holds up against a client written in a completely different language,
months (in curriculum time) after it was built.

### Project Change

- **Reference Source** — Project 3's `api.py` and `user_repository.py`
  (Phase 1, Lessons 8–9), copied in unmodified — the whole point is
  calling them exactly as they already exist.
- **Files affected** — created `fetch_demo.js`; `run_python_api.py`, a
  small script starting Project 3's existing server.
- **Change type** — add.
- **Location** — new files, this project's own directory.
- **Dependencies** — a Python 3 process running Project 3's server,
  started separately; `fetch`, built into modern JavaScript (in a real
  browser as well as in current Node.js versions).

### The New Code

```javascript
async function main() {
  const getResponse = await fetch("http://localhost:8300/users");
  const users = await getResponse.json();
  console.log("GET /users:", users);

  const postResponse = await fetch("http://localhost:8300/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Ada" }),
  });
  const newUser = await postResponse.json();
  console.log("POST /users:", postResponse.status, newUser);

  const getAgain = await fetch("http://localhost:8300/users");
  const usersNow = await getAgain.json();
  console.log("GET /users again:", usersNow);
}

main();
```

### The Updated Project

Brand-new file, shown whole above.

### Introduce the concept in isolation

No separate lab needed — `fetch` returns a Promise, exactly like
`delayedValue` did, and `await` works on it identically to the previous
unit's proof; the only genuinely new pieces are `fetch`'s own call shape
and `.json()`, both explained directly against the real code below,
since a fabricated example would just be this same code with a fake
URL.

### Mechanical walkthrough

- `await fetch("http://localhost:8300/users")` — **(a) first
  appearance** of `fetch`: sends a real HTTP `GET` request (the default
  method when none is specified) and returns a Promise that resolves
  once the response's *headers* have arrived — notably, not the full
  body yet, which is why a second `await` is needed just below.
- `await getResponse.json()` — **(a) first appearance.** Reading a
  response body is itself asynchronous — it might still be arriving —
  so `.json()` also returns a Promise, here `await`ed separately,
  parsing the body as JSON once it's fully received (the JavaScript
  counterpart to Project 1's `json.loads`).
- `fetch("...", { method: "POST", headers: {...}, body: JSON.stringify({...}) })`
  — **(a) first appearance** of `fetch`'s second, optional argument: an
  object configuring the request — `method` (`GET` from Project 3,
  Lesson 8's own routing, `POST` from the same lesson's validated
  endpoint), `headers` (the same `Content-Type` header
  `send_header` set on the *response* side back in Python — here set on
  the *request* side instead, telling the server what shape the body
  is), and `body` — the actual data being sent, which has to already be
  a string, hence `JSON.stringify`, the JavaScript counterpart to
  Project 1's `json.dumps`.
- `postResponse.status` — **(b) hard concept reappearing**: the exact
  status codes Project 3, Lesson 8–9 chose deliberately — `201` for a
  successful creation, `400` for the validation this project's server
  already has wired in — now read from the *client* side instead of set
  from the server side.

### CS lens

This is the **request-response model**: one request, sent, answered by
exactly one response, then the exchange is over — `fetch` doesn't keep
anything open afterward. Also recognized in: every browser loading every
webpage, `curl`, Project 3's own `urllib.request.urlopen` calls, used
from the *Python* side back in Phase 1 to test the exact same server
this unit is now calling from JavaScript instead.

### SE lens

Nothing about Project 3's server needed to change at all to make this
work — proof, not assertion, that a REST API decoupled from any
particular client (the entire premise of Project 3, Lesson 8's
Dependency Injection unit, in a different form) genuinely pays off once
a completely different client, written in a different language,
eventually needs to call it. The real limit, worth naming honestly
before the next unit: `fetch` is exactly one request, one response, done
— it has no way to represent a server pushing a new chat message to a
client that never asked for one, which is precisely what a real chat
needs and exactly what the next unit's WebSocket solves instead.

### Commands needed

`python3 run_python_api.py &` — starts Project 3's real server in the
background, so a separate `node` process can call it; `node
fetch_demo.js` — runs the client.

### Run it

```
GET /users: []
POST /users: 201 { id: 1, name: 'Ada' }
GET /users again: [ { id: 1, name: 'Ada' } ]
```

A real Python process, a real JavaScript process, communicating over a
real HTTP connection on `localhost` — the exact same `UserRepository`
and validation logic from Phase 1, called correctly from an entirely
different language for the first time.

### Connecting sentence

Real data now moves between a JavaScript client and a Python server over
real HTTP — the last unit builds the connection type this lesson's SE
lens already named as missing: one that stays open, and that either
side can use to speak first.

---

## Concept Unit: WebSockets

### The Problem

A chat needs messages to arrive the instant someone else sends one —
not "the next time this client happens to ask." `fetch`'s
request-response model has no way to represent the server initiating
anything; the client always has to ask first. Chat needs a connection
that, once opened, stays open, and lets *either* side send a message at
any time, unprompted.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `ws_lab.js` (throwaway, this unit only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `ws`, an npm package providing a WebSocket
  *server* (Node has a built-in WebSocket *client*, proven usable
  directly below, but no built-in server — a real browser needs no
  package at all, since both sides of the WebSocket API are already
  built into it).

### The New Code

```javascript
const { WebSocketServer } = require("ws");

const server = new WebSocketServer({ port: 8301 });

server.on("connection", (socket) => {
  socket.on("message", (data) => {
    console.log("server received:", data.toString());
    socket.send("echo: " + data.toString());
  });
});
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```javascript
server.on("listening", () => {
  const client = new WebSocket("ws://localhost:8301");
  client.addEventListener("open", () => {
    client.send("hello server");
  });
  client.addEventListener("message", (event) => {
    console.log("client received:", event.data);
    client.close();
    server.close();
  });
});
```

Real output:

```
server received: hello server
client received: echo: hello server
```

One connection, opened once (`new WebSocket(...)`), then used to send a
message *and* receive one back on that *same* connection — no second
request, no polling, no asking again. `socket.send(...)` on the server
side pushed data to the client entirely on the server's own initiative,
the instant it decided to — exactly the capability `fetch` was proven,
in the previous unit, not to have.

### Discard the throwaway example

`ws_lab.js`'s specific echo behavior is deleted — the connection
mechanics it proved (`new WebSocketServer`, `new WebSocket`,
`"connection"`, `"message"`, `.send()`) carry forward directly into the
real chat server.

### Project Change (real code)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `chat_server.js`, `chat_demo.js`.
- **Change type** — add.
- **Location** — new files.
- **Dependencies** — `ws`, this unit's previous lab.

### The New Code

```javascript
const server = new WebSocketServer({ port: 8302 });
const clients = new Set();

server.on("connection", (socket) => {
  clients.add(socket);

  socket.on("message", (data) => {
    for (const other of clients) {
      if (other !== socket) {
        other.send(data.toString());
      }
    }
  });

  socket.on("close", () => {
    clients.delete(socket);
  });
});
```

### The Updated Project

Brand-new file, shown whole above — the shift from `ws_lab.js`'s single
client to a real chat: `clients`, a `Set` holding every currently
connected socket, and a broadcast loop sending each incoming message to
*every other* connected client, not echoing it back to whoever sent it.

### Mechanical walkthrough

- `const clients = new Set();` — **(a) first appearance** of `Set`: a
  collection holding unique values with no fixed order and no repeated
  entries — chosen here specifically because sockets are naturally
  unique (no two connections are ever "the same" the way two equal
  numbers would be) and because membership (`add`/`delete`/checking
  `!==`) is the only thing this code actually needs, not position or
  order the way an array would imply.
- `server.on("connection", (socket) => { clients.add(socket); ...})` —
  **(b) hard concept reappearing**: `"connection"` from the isolated
  lab, now adding every new socket to the shared set instead of just
  using one.
- `socket.on("message", (data) => { for (const other of clients) { if
  (other !== socket) { other.send(...); } } });` — **(a) first
  appearance** of the actual broadcast: loops over *every* connected
  client, and — using `!==` to exclude the sender specifically — sends
  the message to everyone *except* whoever sent it, the real difference
  between "echo" (the previous lab) and "broadcast" (real chat).
- `socket.on("close", () => { clients.delete(socket); });` — **(a)
  first appearance** of `"close"`: fires when a connection ends, used
  here to keep `clients` accurate — without this, a disconnected client
  would stay in the set forever, an unbounded-growth problem in the
  same family as Lesson 13's unbounded cache, here left as a real,
  handled case rather than a named-but-deferred one.

### CS lens

This is **Pub/Sub** (publish-subscribe), the same broadcast-to-many idea
as Observer (Project 2, Lesson 7; DOM events, Lesson 10) but for network
messages between separate processes instead of function calls within
one: the server publishes an incoming message, every other connected
client is implicitly subscribed by virtue of being connected. Also
recognized in: any real chat or collaboration tool's underlying
architecture (Slack, multiplayer game state sync), a message queue like
Redis Pub/Sub or Kafka, a livestream's chat overlay.

### SE lens

The alternative — clients repeatedly `fetch`ing "any new messages?"
every second or so (called **polling**) — was, in fact, how real-time-ish
web features worked before WebSockets existed, and it's a real, valid
choice when true instant delivery doesn't matter and the added
complexity of a persistent connection isn't worth paying for. The cost
of polling: real latency (a message can sit unseen for up to one full
poll interval) and real wasted requests, most of which get an empty "no
new messages" answer. WebSockets cost a persistent open connection per
client — real server resources held for as long as each client stays
connected — in exchange for messages arriving the instant they're sent,
with zero wasted "anything new?" requests.

### Commands needed

`npm install ws` — installs the WebSocket server package from npm, the
same tool Project 1, Lesson 4 used to install `pytest` from PyPI, for a
different language's package registry.

### Run it

```javascript
const alice = new WebSocket("ws://localhost:8302");
const bob = new WebSocket("ws://localhost:8302");

bob.addEventListener("message", (event) => {
  console.log("Bob received:", event.data);
});
alice.addEventListener("message", (event) => {
  console.log("Alice received:", event.data);
});

// once both are connected:
alice.send("Hey Bob!");
// shortly after:
bob.send("Hey Alice, what's up?");
```

Real output:

```
Bob received: Hey Bob!
Alice received: Hey Alice, what's up?
```

Two entirely independent connections, alive at the same time — Alice's
message reached Bob, and only Bob (confirmed: no "Alice received: Hey
Bob!" line, since the broadcast loop explicitly excludes the sender);
Bob's reply reached Alice, and only Alice. This is a real, working,
two-party chat, over a real network protocol, verified by what each
party actually received.

### Connecting sentence

A message now travels from one independent process to another the
instant it's sent, with no request required on the receiving end at
all — the exact capability this lesson's third unit named as `fetch`'s
one real limitation, closed by a genuinely different kind of connection
built for exactly this job.

---

## Closing

**Connect the pieces.** This lesson's two real networking demonstrations
are deliberately independent, and worth stating why rather than forcing
a connection that isn't really there: `fetch` against Project 3's REST
API proved a one-shot request-response exchange working correctly
across languages, unmodified, months of curriculum time apart. The
WebSocket chat proved a persistent, bidirectional connection working
between two independent clients in real time. A real chat application
would plausibly use *both* — `fetch` (or the REST API directly) to load
chat history once, on connecting, and a WebSocket for everything that
happens live afterward — which is exactly why both got their own real,
separately verified proof in this lesson, rather than one standing in
for the other.

**What breaks without this.** Remove the `if (other !== socket)` check
from the broadcast loop in `chat_server.js`, and re-run the chat demo:
every client would receive its *own* message echoed straight back,
alongside everyone else's — Alice would see "Hey Bob!" appear in her own
chat log, sent by herself, which is not how any real chat interface
should behave. This isn't a crash — the server keeps running, no error
appears anywhere — it's a real, silent, easily-shipped correctness bug,
in the same family Lesson 11 and Lesson 13 already demonstrated: some
mistakes never announce themselves, they just quietly produce the wrong
experience.

**Exercises.**
1. Reproduce the bug above for real: remove the sender-exclusion check,
   rerun the two-client demo, and confirm — with real printed output —
   that each client now receives its own message back. Restore the fix.
2. Add a username to each connection (sent as the very first message
   after `"open"`) and prefix every broadcast message with who sent it,
   so `"Bob received: Alice: Hey Bob!"` instead of just the bare text.
3. Combine both halves of this lesson for real: on a new WebSocket
   connection, have the chat server `fetch` the current user list from
   Project 3's REST API and send it to the newly connected client as its
   first message, before any chat messages arrive.

**Definition of done.**
- [ ] You can explain, in one sentence, what a Promise actually
      represents, and why `await`ing one doesn't block the rest of the
      program — confirmed by this lesson's own "prints before it
      arrives" proof, not just definition.
- [ ] `fetch` successfully called Project 3's real, unmodified REST API
      for both `GET` and `POST`, with real JSON responses matching what's
      shown above.
- [ ] A real WebSocket chat server correctly broadcasts a message from
      one connected client to every *other* connected client, confirmed
      with two real, independent connections and real received output.
- [ ] You've reproduced the sender-inclusion bug for real, seen the
      wrong behavior with your own eyes, and restored the fix.
- [ ] Commit with a message explaining why — e.g. `"Call Project 3's
      REST API from JavaScript via fetch/async-await for one-shot data,
      and add a WebSocket broadcast server for real-time chat delivery,
      excluding the sender from their own broadcast"` — not `"add
      networking"`.

**This closes Project 6, and Phase 2.** Across Projects 4–6, entirely
in JavaScript: Observer recognized rather than rebuilt, a real tree with
drag-and-drop as a genuine state machine, regex-based parsing, debounce
and throttle proven as genuinely different tools, a from-scratch LRU
cache, and — closing the phase — real cross-language networking, calling
Phase 1's own work from the other side of the wire. **Phase 3** moves to
Java: static typing, real interfaces (where Strategy and Factory stop
being "just pass a function" and need actual ceremony, exactly as
promised back in Project 1, Lesson 3), and a JVM-backed Inventory
Management System where most of this curriculum's classic patterns
converge at once, deliberately, because enterprise-shaped software is
where they were named in the first place.
