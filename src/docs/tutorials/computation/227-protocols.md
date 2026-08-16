# Lesson 227: Protocols — Deriving the Need for Explicit Communication Rules

**What you will build**: A tiny real key-value protocol — a command
format both sides agree on, and a required handshake sequence that has
to happen before any real command is accepted. It proves, concretely,
that Lesson 226's framing only solves *where* a message begins and ends,
never *what it means* or *when it's allowed* — and closes by comparing a
version that explicitly detects an out-of-sequence message against one
that doesn't, showing that skipping the check doesn't fail loudly, it
fails by returning something that looks exactly like an ordinary,
unrelated result.

**What you need to know first**: Lesson 226's framing, which recovers a
message's exact boundaries from a raw stream but says nothing about the
bytes' meaning. Lesson 221's `kv`-style lookup-by-key pattern, reused
directly for this lesson's own tiny store.

**Terms used in this lesson**:

- **protocol** — an explicit, agreed-upon set of rules governing both the
  *format* of messages exchanged between two parties and the *valid
  order* they may occur in; exists because Lesson 226's framing only
  recovers which bytes belong to one message, saying nothing about what
  those bytes mean or when they're allowed to arrive.
- **command** — the specific, named operation a message requests be
  performed, agreed on in advance by both sides as one of a fixed, known
  set; exists so a receiver can decide what to actually *do* with a
  message's payload, rather than merely knowing where the payload begins
  and ends.
- **protocol state** — which specific point in an agreed sequence of
  exchanges the conversation has reached; distinct from Lesson 226's
  connection state (open or closed), this exists because some messages
  are only meaningful at certain points in an exchange, not universally
  valid the instant a connection exists at all.
- **protocol violation** — a message that's individually well-formed but
  arrives at a point in the exchange the protocol doesn't permit; a
  distinct kind of error from a malformed message or an unrecognized
  command — the message itself is perfectly fine, only its timing is
  wrong.

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
  - *Their use:* `if` decides whether the protocol is already past its
    handshake; `cond` dispatches on a command's own name and drives the
    key-value store's lookup scan.
- **`=`** / **`get`** / **`assoc`** / **`count`** / **`+`**
  - *What they are:* Clojure's equality, positional lookup,
    functional-update, length, and addition functions.
  - *Implementation:* `(= a b)` compares; `(get coll index)` reads;
    `(assoc coll index value)` returns an updated copy; `(count coll)`
    returns length; `(+ a b)` returns the sum.
  - *Their use:* reused throughout, building and reading this lesson's
    message pairs, store entries, and scan indices exactly as every
    earlier lesson in this section has.

---

## Concept Unit: Agreeing on Format — Command and Payload

### The Problem

Lesson 226's `frame-read` recovers exactly which bytes belong to one
message, byte for byte. It says nothing at all about what those bytes
*mean*. If a message arrives as five recovered bytes, `"hello"`, nothing
about `frame-read`'s own return value tells a receiver whether that's a
command name, a value being stored, or something else entirely. Two
independent programs need to agree, before either one writes a single
byte, on what shape a message actually has.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because protocols are a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn kv-lookup [store key index]
  (cond
    (= index (count store)) -1
    (= (get (get store index) 0) key) (get (get store index) 1)
    true (kv-lookup store key (+ index 1))))

(defn kv-set [store key value]
  (assoc store (count store) [key value]))

(defn handle-command [store command payload]
  (cond
    (= command "GET") [store (kv-lookup store payload 0)]
    (= command "SET") [(kv-set store (get payload 0) (get payload 1)) "OK"]
    true [store "ERROR-UNKNOWN-COMMAND"]))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Run It — Real Output

```
user=> (def store0 [])
#'user/store0
user=> (handle-command store0 "SET" ["x" 42])
[[[x 42]] OK]
user=> (def store1 (get (handle-command store0 "SET" ["x" 42]) 0))
#'user/store1
user=> store1
[[x 42]]
user=> (handle-command store1 "GET" "x")
[[[x 42]] 42]
user=> (handle-command store1 "FOO" "bar")
[[[x 42]] ERROR-UNKNOWN-COMMAND]
```

### Mechanical Walkthrough

`(defn kv-lookup [store key index] ...)` — `cond`, reappearing, a
linear scan through `store`, a vector of `[key value]` pairs — the same
shape as Lesson 220's `directory-lookup`, applied to a simpler
key-value structure instead of a filesystem directory. Returns the
matching value, or `-1` if `key` was never set.

`(defn kv-set [store key value] (assoc store (count store) [key
value]))` — `assoc` and `count`, both reappearing, the established
append idiom, adding a new `[key value]` pair.

`(defn handle-command [store command payload] ...)` — the actual
protocol dispatch: `cond`, reappearing, checks `command` against the
fixed, agreed-on set of recognized command names. `(= command "GET")` —
look up `payload` (here, treated as the key being requested) via
`kv-lookup`, returning the store unchanged alongside whatever value was
found. `(= command "SET")` — `payload` here is a `[key value]` pair
itself; call `kv-set`, returning the *new* store alongside a plain
`"OK"` acknowledgment. `true` — any command name not on the agreed list
gets `[store "ERROR-UNKNOWN-COMMAND"]` — the store passed through
completely unchanged, and an explicit, named error instead of a guess.

Trace: `(handle-command store0 "SET" ["x" 42])` returns `[[["x" 42]]
"OK"]` — the new store, and confirmation. `store1`, extracted from that
result, is `[["x" 42]]`. `(handle-command store1 "GET" "x")` returns
`[store1 42]` — the store unchanged (a `GET` never modifies anything),
alongside the actual stored value. `(handle-command store1 "FOO"
"bar")` — `"FOO"` matches none of the recognized commands — returns
`[store1 "ERROR-UNKNOWN-COMMAND"]`, an explicit, nameable failure rather
than silence or a crash.

### CS Lens

`handle-command`'s three-way dispatch on a command's own name is
exactly what a protocol's format agreement actually buys: both sides
know, in advance, that a message's first element names one of a fixed,
finite set of operations, and everything after it is *shaped* by which
one was named — a `GET`'s payload is a bare key; a `SET`'s payload is a
`[key value]` pair; the two are genuinely different shapes, and nothing
about a raw, framed message on its own says which shape applies. This is
the same idea as Lesson 221's schema, one layer up: a schema names what
each *field* of a stored row means; a protocol names what each *kind of
message* means, and what shape its own payload is allowed to take.

Also recognized in: a restaurant order pad's own fixed abbreviations —
`"NY"` for no-onion, `"WT"` for well-done — meaningless to anyone who
hasn't learned the shared vocabulary, but instantly clear to kitchen
staff who have; a remote control's button codes, each one mapped, by
prior agreement between the remote and the television, to a specific
action; a chess notation like `"Nf3"`, communicating an exact move only
because both players have already agreed on what each symbol means.

### SE Lens

The alternative — a receiver that guesses at a message's meaning from
its raw bytes alone, with no agreed command vocabulary — has no
principled way to do so at all; there's nothing in `"hello"` itself
that distinguishes "this is a greeting" from "this is a five-character
value to be stored." Every real protocol, without exception, has to
start from exactly this lesson's own choice: an explicit, finite,
mutually-known set of command names, agreed on before any real
communication happens — the actual reason a protocol *specification*
document exists at all, separate from the code that implements it. The
`true` branch's explicit `"ERROR-UNKNOWN-COMMAND"` matters specifically
because real protocols evolve — a newer client might send a command an
older server has never heard of — and an explicit, named rejection lets
that mismatch be diagnosed immediately, rather than producing whatever
`cond`'s fallthrough happened to do by accident.

---

## Concept Unit: A Valid Sequence — Protocol State, Not Just Format

### The Problem

`handle-command` correctly rejects an *unrecognized* command name. But
`"GET"` and `"SET"` are both perfectly well-formed, recognized
commands — and a real protocol might still need to say they're only
*meaningful* after some other exchange has already happened first, the
same way Lesson 226's own `"syn-sent"` state meant a connection wasn't
really usable yet even though the socket itself existed. What happens
if a client sends a well-formed `"GET"` before ever introducing itself?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because protocols are a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn handle-ready-result [protocol-state command-result]
  [protocol-state (get command-result 0) (get command-result 1)])

(defn handle-ready [store command payload]
  (handle-ready-result "ready" (handle-command store command payload)))

(defn handle-handshake [protocol-state store command]
  (if (= command "HELLO")
    ["ready" store "HELLO-ACK"]
    [protocol-state store "ERROR-PROTOCOL-VIOLATION"]))

(defn handle-protocol-message [protocol-state store command payload]
  (if (= protocol-state "ready")
    (handle-ready store command payload)
    (handle-handshake protocol-state store command)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def state0 "awaiting-hello")
#'user/state0
user=> (handle-protocol-message state0 store0 "GET" "x")
[awaiting-hello [] ERROR-PROTOCOL-VIOLATION]
user=> (def call2 (handle-protocol-message state0 store0 "HELLO" ""))
#'user/call2
user=> call2
[ready [] HELLO-ACK]
user=> (def state1 (get call2 0))
user=> (def store1b (get call2 1))
user=> (def call3 (handle-protocol-message state1 store1b "SET" ["x" 42]))
#'user/call3
user=> call3
[ready [[x 42]] OK]
user=> (def state2 (get call3 0))
user=> (def store2 (get call3 1))
user=> (handle-protocol-message state2 store2 "GET" "x")
[ready [[x 42]] 42]
```

### Mechanical Walkthrough

`(defn handle-protocol-message [protocol-state store command payload]
...)` — `if`, reappearing, the entire gate: is the conversation already
`"ready"`? If so, delegate to `handle-ready`, which is free to process
any recognized command normally. If not — the conversation is still
somewhere before the handshake completed — delegate to
`handle-handshake` instead, which understands exactly one thing:
`"HELLO"`.

`(defn handle-handshake [protocol-state store command] ...)` — `if`,
reappearing: if the command actually *is* `"HELLO"`, transition to
`"ready"` and return an acknowledgment, `"HELLO-ACK"` — the store passed
through unchanged, since a handshake never touches stored data. If it's
anything else — including a perfectly well-formed `"GET"` or `"SET"` —
the protocol state stays exactly where it was, and the response is a
new, explicit string: `"ERROR-PROTOCOL-VIOLATION"`, distinct from
`handle-command`'s own `"ERROR-UNKNOWN-COMMAND"` — this command *is*
recognized, its *timing* is what's wrong.

`(defn handle-ready [store command payload] ...)` / `(defn
handle-ready-result [protocol-state command-result] ...)` — once
`"ready"`, delegate straight to Unit 1's `handle-command`, then
repackage its `[new-store response]` pair alongside the (unchanged)
protocol state, so every call to `handle-protocol-message` returns the
same uniform three-element shape regardless of which internal path it
took.

Trace: `(handle-protocol-message state0 store0 "GET" "x")` — `state0` is
`"awaiting-hello"`, not `"ready"` — routes to `handle-handshake`, which
sees `"GET"`, not `"HELLO"` — returns `["awaiting-hello" [] "ERROR-
PROTOCOL-VIOLATION"]`: rejected, state unchanged, store unchanged.
`(handle-protocol-message state0 store0 "HELLO" "")` — routes to
`handle-handshake` again, this time matching — returns `["ready" []
"HELLO-ACK"]`. From `state1 = "ready"`, `(handle-protocol-message state1
store1b "SET" ["x" 42])` now routes to `handle-ready`, processing
normally: `["ready" [["x" 42]] "OK"]`. A final `GET`, from the resulting
`state2`/`store2`, correctly returns `42` — every command after the
handshake behaves exactly as Unit 1 already established, and nothing
before it does.

### CS Lens

`protocol-state` is a genuinely different state machine from Lesson
226's connection state, tracked *inside* an already-established
connection rather than describing whether one exists at all — the two
compose, at different layers: a socket can be fully `"connected"` (226)
while its protocol is still `"awaiting-hello"` (227), and only once
*both* are satisfied does an ordinary command actually get processed.
This is a recurring shape worth recognizing on sight: a system often
needs more than one state machine, tracking genuinely different
questions, layered on top of each other rather than collapsed into one.

Also recognized in: an ATM requiring a card *and* a correct PIN before
any withdrawal — two separate gates, not one, and a valid card alone
isn't sufficient; an airport security checkpoint requiring both a
boarding pass *and* an ID, checked at different points, before a
passenger reaches the gate; a video game's own separate "connected to
server" and "character selected" states, where a player can be online
without yet being allowed to actually play.

### SE Lens

The alternative — a protocol with no handshake requirement at all,
where any recognized command is valid the instant a connection exists —
is simpler, and legitimate for some real protocols that genuinely have
no setup step worth enforcing. The handshake earns its cost specifically
when the first exchange needs to establish something later commands
depend on — a chosen protocol version, an authenticated identity, a
negotiated capability — information a bare `"GET"` has no way to carry
on its own. The real cost this design accepts: every single non-
handshake command now has to be checked against `protocol-state` before
being processed, an extra `if` on every call, paid even on connections
where the handshake was completed correctly and the check will
therefore always pass — the identical cheap-insurance tradeoff Lesson
222's own consistency check accepted for exactly the same reason.

---

## Concept Unit: Explicit Violation vs. Silent Wrong Behavior

### The Problem

Unit 2's `"ERROR-PROTOCOL-VIOLATION"` response tells a client exactly
what went wrong: the command was fine, its timing wasn't. What would
have happened to that same out-of-sequence `"GET"` if `protocol-state`
had never been checked at all — not crashed, not obviously broken, just
silently processed as though the handshake had already happened?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because protocols are a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn handle-message-unchecked [store command payload]
  (handle-command store command payload))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (handle-protocol-message state0 store0 "GET" "x")
[awaiting-hello [] ERROR-PROTOCOL-VIOLATION]
user=> (handle-message-unchecked store0 "GET" "x")
[[] -1]
```

### Mechanical Walkthrough

`(defn handle-message-unchecked [store command payload] (handle-command
store command payload))` — `handle-command`, reappearing from Unit 1
completely unchanged, called *directly*, with no `protocol-state` check
anywhere — as if the handshake requirement Unit 2 built never existed
at all.

Trace both against the *identical* input — a `"GET"` for `"x"`, on a
connection that never sent `"HELLO"`, on a store that never had `"x"`
set: Unit 2's checked version returns `["awaiting-hello" [] "ERROR-
PROTOCOL-VIOLATION"]` — an explicit, specific, correctly-diagnosed
rejection. `handle-message-unchecked` returns `[[] -1]` — `kv-lookup`
runs normally, finds no `"x"` in the (genuinely empty) store, and
returns `-1`, the ordinary "key not found" sentinel this curriculum has
used since Lesson 214. **Both responses use the exact same underlying
sentinel**, `-1`, for two genuinely different situations: "you forgot
the handshake" and "this key was never set." A client receiving `-1`
from the unchecked version has no way to tell these apart at all — it
looks, in every observable respect, like an ordinary, ratified lookup
result.

### CS Lens

This is the same failure shape as several of this curriculum's earlier
"what breaks without this" demonstrations, made explicit here as its
own concept unit rather than only a closing aside: a missing check
doesn't announce its own absence. `handle-message-unchecked` doesn't
crash, doesn't hang, doesn't return anything obviously malformed — it
returns a value that is, on its own, completely indistinguishable from
a correct answer to a different, legitimate question. The entire value
of Unit 2's explicit `"ERROR-PROTOCOL-VIOLATION"` string is that it
occupies a distinct, unambiguous position in the space of possible
responses — a client can check for it directly, by name, the same way
Lesson 222's transaction code could check a `compare-and-swap`'s own
explicit `false` result, rather than having to reason about whether an
ordinary-looking value might secretly mean something else.

Also recognized in: a login form that returns "user not found" for both
a genuinely nonexistent username and a correct username with a wrong
password — a real, deliberate security choice in that specific case
(not confirming which usernames exist), but a dangerous *accident* in
this lesson's protocol, where nothing about `"GET"` before `"HELLO"`
needs to be kept secret from anyone; a search that returns zero results
identically whether the query was empty, malformed, or simply had no
matches, leaving a user unable to tell which happened; a shipping
tracker showing "no updates" identically for a package that hasn't
shipped yet and one that's been lost.

### SE Lens

The alternative to an explicit protocol-violation response is exactly
`handle-message-unchecked`: cheaper to write, one less branch, and
correct in the overwhelmingly common case where every client actually
follows the protocol's own agreed sequence. Its real cost only appears
the moment a client *doesn't* — a bug in the client's own code, a
version mismatch, a message reordered by an unreliable channel (Lesson
225's own subject) — and at exactly that moment, the unchecked version
produces a result that looks fine, sending both sides down a path of
believing something works when it fundamentally doesn't. The design
choice this lesson's whole arc argues for: every distinct *kind* of
failure a protocol can experience — a malformed message, an unrecognized
command, a well-formed command at the wrong time — deserves its own
distinct, checkable signal, never silently folded into a response that
already means something else.

---

## Connect the Pieces

Follow the single command `"GET" "x"` through every unit built in this
lesson, sent at the earliest possible moment — before any handshake has
happened at all. Under Unit 1's plain `handle-command`, called directly
with no notion of sequence, it would simply run: `kv-lookup` scans an
empty store and returns `-1`, format-correct and completely oblivious to
whether a handshake was ever supposed to happen first. Unit 2 wraps that
exact same call behind `handle-protocol-message`, which checks
`protocol-state` *before* ever reaching `handle-command` at all — finds
`"awaiting-hello"`, routes to `handle-handshake` instead, and returns the
explicit `"ERROR-PROTOCOL-VIOLATION"` — the identical underlying
`kv-lookup` never even runs. Unit 3 makes the contrast direct and final:
`handle-message-unchecked`, deliberately built to skip the exact check
Unit 2 added, reproduces Unit 1's own oblivious `-1`, the same
"key not found" sentinel a legitimate, correctly-sequenced query would
also produce. One well-formed command, sent at the wrong moment, and
two functions differing by exactly one `if` produce two completely
different pictures of what happened — one an honest, specific diagnosis,
the other a value a client has no principled way to distinguish from
success elsewhere in the protocol.

## What Breaks Without This

Already directly demonstrated in Unit 3's own trace: calling
`handle-message-unchecked` in place of `handle-protocol-message`
anywhere a real client might send a command before completing the
handshake reproduces exactly the ambiguous `-1` result shown above,
rather than the diagnosable `"ERROR-PROTOCOL-VIOLATION"`. A client
built to check specifically for that error string — retrying the
handshake, logging a clear diagnostic, refusing to proceed — would
never fire any of that logic against the unchecked version's output;
it would instead treat a protocol bug as an ordinary missing key, most
likely proceeding as though nothing at all had gone wrong.

## Exercises

1. Add a second required handshake step — after `"HELLO"`, the client
   must also send an `"AUTH"` command with a password payload before
   `protocol-state` reaches `"ready"` — and confirm a `"SET"` sent after
   `"HELLO"` but before `"AUTH"` is still correctly rejected as a
   protocol violation.
2. Extend `handle-command` with a `"DELETE"` command, following the
   established pattern of `"GET"`/`"SET"`, and confirm it's correctly
   rejected as a protocol violation when attempted before the
   handshake, exactly like `"GET"` and `"SET"` already are.
3. Design a *third* kind of protocol error — distinct from both
   `"ERROR-UNKNOWN-COMMAND"` and `"ERROR-PROTOCOL-VIOLATION"` — for a
   `"SET"` command whose payload isn't a proper `[key value]` pair (for
   instance, missing the value entirely), and explain in one sentence
   why folding this into one of the two existing error strings would
   lose real diagnostic information a client might need.

## Definition of Done

- [ ] `kv-lookup`, `kv-set`, `handle-command`, `handle-ready`,
      `handle-ready-result`, `handle-handshake`,
      `handle-protocol-message`, and `handle-message-unchecked` all
      defined and run in a live `bb` REPL, matching every transcript
      shown above exactly.
- [ ] Unit 1's format-driven dispatch reproduced, including the
      unrecognized-command case.
- [ ] Unit 2's full handshake-then-command sequence reproduced end to
      end: rejected `GET`, successful `HELLO`, successful `SET`,
      successful `GET`.
- [ ] Unit 3's side-by-side comparison reproduced, with both results
      shown to share the identical `-1` value despite meaning
      completely different things.
- [ ] Exercise 1 completed, confirming a second handshake step is
      correctly enforced.
- [ ] `git commit -m "Add Lesson 227: an explicit command protocol with
      a required handshake, and why an unchecked violation is silently
      indistinguishable from an ordinary result"`
