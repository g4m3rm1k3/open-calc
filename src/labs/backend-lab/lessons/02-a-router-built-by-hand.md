# Backend Lab — Lesson 2 — A Router, Built By Hand

## What You Will Build

Three real routes, `/users`, `/orders`, and `/products`, without a single
`if`/`else` in sight — replaced by a lookup table that decides which
function runs, based on data, not a chain of hand-written comparisons.

---

## What You Need to Know First

Lesson 1 — a working `handleRequest`, an `if`/`else` chain choosing
between two responses, and the honest, felt problem that chain leaves
behind: it doesn't scale.

---

## Step 1 — Feel the Problem Get Worse, on Purpose

Add a third route the `if`/`else` way, exactly as lesson 1 taught it:

```javascript
function handleRequest(request) {
  if (request.path === "/users") {
    return { status: 200, body: [{ id: 1, name: "Mike" }] };
  } else if (request.path === "/orders") {
    return { status: 200, body: [{ id: 1, item: "Keyboard" }] };
  } else if (request.path === "/products") {
    return { status: 200, body: [{ id: 1, name: "Widget" }] };
  } else {
    return { status: 404, body: "Not found" };
  }
}
```

Send a request to each of `/users`, `/orders`, and `/products` to confirm
all three work. Then look at what you just wrote, honestly: three almost
identical blocks, differing only in the path string and the data returned,
all crammed inside one function that keeps growing every time a new route
is needed.

**SE lens — naming the actual problem, precisely, not just "this looks
messy."** Every new route means editing `handleRequest` itself — the same
function, touched again and again, for a reason that has nothing to do
with anything already inside it. A function that must be edited every
time an unrelated new feature is added is doing too much, structurally,
regardless of how tidy any single edit looks in isolation. This is a real,
namable problem, worth carrying forward from here on: **does adding a new
X require editing existing code, or only adding new code alongside it?**
`handleRequest`, as written above, fails that test three times over
already, and would fail it a hundred more times in a real backend with a
hundred routes.

**CS lens — dispatch by computation, restated, and its real cost.**
Lesson 1 already named this shape: choosing behavior by re-checking a
chain of conditions, one at a time, is **dispatch by computation**. A
hundred routes means up to a hundred string comparisons, checked one by
one, for every single request — including the unlucky request whose
route happens to be the very last one checked. The amount of work this
approach does grows directly with the number of routes; doubling the
routes roughly doubles the worst-case work. That growth relationship —
work scaling directly, one-for-one, with the size of the input — is
worth remembering by name once Step 3 replaces it with something that
doesn't grow this way at all.

---

## Step 2 — Functions Are Values Too

Before building the fix, one fact about functions that hasn't come up
yet, needed for what's next.

```javascript
function getUsers(request) {
  return { status: 200, body: [{ id: 1, name: "Mike" }] };
}

var handler = getUsers;

function handleRequest(request) {
  return handler(request);
}
```

Send any request — a real `200` with Mike comes back, no matter what
path or method you sent. Every request currently gets routed to the same
one handler, on purpose, just to prove the mechanism below actually
works before Step 3 makes it useful.

**Walkthrough.** `getUsers`, written without parentheses, doesn't *call*
the function — it refers to the function itself, as a value, the same way
writing `42` refers to a number or `"hi"` refers to a string. `var handler
= getUsers;` doesn't copy the function's code into `handler` — it stores
a **reference** to the exact same function `getUsers` already refers to
(the same reference-semantics idea lesson 1 introduced for objects — a
function is a value that gets referenced, not duplicated, wherever it's
assigned). `handler(request)` then calls it, forwarding along the exact
`request` object `handleRequest` itself received — `handler` and
`getUsers` are, at this point, two different names referring to the
identical underlying function.

**CS lens — first-class functions, a real property of this language,
named precisely.** A programming language is said to treat functions as
**first-class values** when functions can be stored in variables, held
inside objects, and passed around exactly like any other kind of value —
numbers, strings, objects. JavaScript (and therefore this lab) has this
property; not every language does. This one fact is the entire foundation
of the router you're about to build: if a function can be treated as a
value, it can be stored as a value *inside an object* — which is exactly
what turns "which function should run" into a question a lookup can
answer, instead of a question an `if` chain has to ask one branch at a
time.

**SE lens — this is what makes a callback possible, a pattern you've
likely already used without the name.** A function handed to *other*
code, to be called later rather than immediately, is called a
**callback**. `setTimeout(fn, 1000)`, an array's `.map(fn)`, and a
button's click handler are all callbacks — a piece of behavior, passed
as a value, invoked by someone else at a time of their choosing rather
than yours. Everything this lesson is about to build — a router calling
whichever handler function it looks up — is exactly this pattern, just
with your own code playing the role of the "someone else" who does the
calling. This is also precisely the interface lesson 1 named: `router
calls handler(request), handler returns response` is the same
call-later-by-agreed-shape idea, one level up.

---

## Step 3 — Build the Router

```javascript
function getUsers(request) {
  return { status: 200, body: [{ id: 1, name: "Mike" }] };
}

function getOrders(request) {
  return { status: 200, body: [{ id: 1, item: "Keyboard" }] };
}

function getProducts(request) {
  return { status: 200, body: [{ id: 1, name: "Widget" }] };
}

var routes = {
  "/users": getUsers,
  "/orders": getOrders,
  "/products": getProducts,
};

function handleRequest(request) {
  var handler = routes[request.path];
  if (handler) {
    return handler(request);
  }
  return { status: 404, body: "Not found" };
}
```

Send requests to `/users`, `/orders`, and `/products` again — identical
results to Step 1. Send a request to `/nonsense` — a `404`, exactly as
before.

**Walkthrough — `routes`, an object used as a lookup table.** `routes` is
an ordinary object, exactly like the ones from lesson 1 — except its
*values* are functions instead of strings or numbers, which Step 2 just
established is completely legal. `routes["/users"]` reads the value
stored under the key `"/users"` — here, that value happens to be the
`getUsers` function itself. Square-bracket access, `routes[request.path]`,
does the identical thing `routes["/users"]` would, except the key comes
from a variable instead of being typed literally — this is what lets one
line of code look up *any* path, not just one specifically named in the
code.

**CS lens — a higher level of abstraction than Step 1's chain.** Step 1
asked one specific question per line: "is it `/users`? is it `/orders`?
is it `/products`?" Step 3 asks one single, general question instead:
"what does `routes` say for this path?" — the same question, no matter
how many routes exist or what they're named. Operating one level higher
like this — a single general mechanism instead of one specific check per
case — is what **abstraction level** means, and it's the real reason
Step 3 is shorter and doesn't repeat itself: the specific cases moved out
of `handleRequest` and into data, leaving one general rule behind. This
is worth watching for as a pattern throughout this series: software
tends to evolve toward higher abstraction precisely because it trades
repeated, specific code for a smaller amount of general code.

**CS lens — this is a dictionary (also called a hash map, or associative
array), a fundamental data structure, not a trick specific to routing.**
A **dictionary** is any structure that stores values under named keys and
retrieves them by that name, in roughly constant time regardless of how
many entries exist — you've been using one since lesson 1's very first
object, without the formal name attached yet. `routes` is a dictionary
mapping path strings to handler functions. This exact shape — a
dictionary from a name to a function that should run for it — is called a
**dispatch table**, and it is not a small trick: it is the actual
technique every real web framework's router (Express, FastAPI, Rails,
Spring) is built on, underneath whatever friendlier syntax they offer on
top of it.

**PL lens — a precise distinction worth having, even if it doesn't
change anything you write today.** "Dictionary" names the *idea* — a
structure mapping keys to values — independent of how it's actually
built underneath. "Hash map" names one specific, extremely common way to
*implement* that idea efficiently. A plain JavaScript object, used the
way `routes` is used here, is one implementation of the dictionary idea,
with its own engine-specific performance characteristics; JavaScript
also has a dedicated `Map` type built specifically for this exact role,
with a few behaviors a plain object doesn't have (covered only if this
project ever actually needs them). The idea, the general implementation
technique, and this specific language's tools for it are three related
but genuinely different things — worth being able to tell apart, even
informally.

**CS lens — the real payoff: lookup doesn't get slower as routes are
added.** `routes["/users"]` does the same amount of work whether `routes`
has 3 keys or 3,000 — a dictionary looks a key up directly, without
checking every *other* key first, the way Step 1's `if`/`else` chain had
to. Work that stays roughly constant regardless of how large the input
grows is described as **constant time**, in contrast to Step 1's
dispatch-by-computation, whose work grew directly with the number of
routes. This is the concrete, measurable reason a dispatch table is a
genuine improvement, not just a tidier-looking one.

**CS lens — table-driven programming, a technique bigger than routing.**
Replacing a chain of `if`/`else` branches with a lookup table isn't
specific to web routers — it's a general technique called **table-driven
programming**: whenever behavior can be looked up from data instead of
computed through a chain of conditions, a table often replaces the
chain. Parsers, state machines, compilers, and even CPUs use lookup
tables this same way, for the identical reason: a table is faster to
search, easier to extend, and easier to read than an equivalent wall of
conditionals.

**SE lens — data-driven design: behavior now lives in data, not in
code.** Step 1's `if`/`else` chain encoded "which handler runs" directly
in the program's control flow — to see what `/orders` did, you had to
read the code. Step 3 moves that same decision into a plain value,
`routes` — "which handler runs" is now *data*, not code, and the router
itself is generic: it doesn't know or care what routes exist, only how
to look one up. Code whose behavior is driven by data it reads, rather
than by branches hardcoded into it, is called **data-driven**. This is
the same shape a database's rows, a compiler's grammar table, or an
app's configuration file all share: behavior read from data, rather than
written as code.

**CS lens — a registry, binding names to behavior, resolved by name at
lookup time.** `routes` is also a specific, named kind of structure
called a **registry**: something that maps a name to "the thing that
name refers to," so other code can register new entries without whoever
does the *looking up* ever needing to change. Writing `"/users": getUsers`
**binds** the name `"/users"` to the function `getUsers` — the same word,
**binding**, used throughout computer science for "attaching a name to a
value" (variable binding, name binding). Later, `routes[request.path]`
**resolves** that name back to the function it was bound to — **name
resolution**, the same general operation a compiler performs resolving a
variable name to where it's stored, or DNS performs resolving a domain
name to a server address. Different scales, same underlying idea:
register a name once, resolve it by that name whenever it's needed.

**Walkthrough — `if (handler)`, checking whether the lookup found
anything, then calling it *indirectly*.** If `request.path` isn't a key
in `routes` at all, `routes[request.path]` evaluates to `undefined` — a
real, distinct value meaning "nothing is stored here," not an error.
`undefined` is **falsy** (JavaScript treats it as `false` when used as a
yes/no condition), so `if (handler)` is really asking "did the lookup
actually find something?" — true when a real function was found, false
when the path doesn't match any registered route. This is the entire 404
logic now: not a special case bolted on, just the natural consequence of
a lookup finding nothing. Notice, too, exactly what `return handler(request)`
does *not* say: it never names `getUsers`, `getOrders`, or `getProducts`
directly. It calls whatever `handler` happens to be holding — this is an
**indirect function call**, calling a function *through* a reference to
it rather than by its own fixed name. This is genuinely new, and it's
the single biggest idea in this lesson.

**PL lens — late binding: which function runs isn't decided until the
request actually arrives.** In Step 1, reading `handleRequest`'s source
code told you exactly which branch would run for `/orders` — the
decision was fixed at the moment the code was written. Here, `handler`
could hold `getUsers`, `getOrders`, `getProducts`, or nothing at all,
and there is no way to know which just by reading `routes[request.path]`
in isolation — it depends entirely on `request.path`, a value that only
exists once a real request shows up. Deferring the decision of exactly
which code will run until the program is actually running (rather than
fixing it at the moment the code is written) is called **late binding**,
as opposed to **early binding**, where the decision is fixed in the
source itself, the way Step 1's `if`/`else` was. Runtime lookup,
indirection, and dispatch are all different names for pieces of the same
underlying fact: this router's key decision is a late-bound one.

**CS lens — indirection: the router works because it never decides
directly.** Step 1 asked, directly, "is the path `/users`?" Step 3 asks
a completely different question: "what does `routes` say to do?" — one
extra step, between the request and the decision, where a data structure
gets consulted instead of a direct comparison being made. That extra
step is called **indirection**, and it is one of the most reused ideas in
all of software: a pointer is indirection to a memory address; dependency
injection (a later lesson in this exact series) is indirection to *which*
implementation actually runs; a plugin system is indirection to code that
didn't exist when the core program was written; DNS is indirection from
a name to a machine's real address. The router doesn't decide what
`/users` means — it asks `routes`, and `routes` is free to change without
the router ever noticing.

**SE lens — decoupling, through a uniform interface.** `handleRequest`
no longer contains one single fact about users, orders, or products — it
only knows two things: "look up a handler" and "call it." This works
because every handler shares an identical shape: takes one `request`,
returns one response — a **uniform interface**. Code that depends only
on a shared shape, never on which specific implementation is behind it,
is **decoupled** from that implementation: the router would work
completely unchanged if `getUsers` were rewritten from scratch tomorrow,
as long as it kept returning `{ status, body }`. This is a form of
**polymorphism** — not the class-inheritance kind you may have heard of
elsewhere, but the more general idea underneath it: many different
things (`getUsers`, `getOrders`, `getProducts`) can be treated identically
by code that only relies on their shared shape, never on what makes each
one specific.

*(Once formal design patterns are covered later in this series, this
exact shape — many interchangeable pieces of behavior sharing one
interface, swapped in by whichever one is looked up — gets a name of its
own: the **Strategy Pattern**. Not needed to build any of this correctly;
worth knowing that what you just built by hand already has a name in the
literature.)*

**SE lens — registering behavior and executing it are now two separate
moments.** Building `routes` — three lines pairing a path with a
function — does not run any of those functions. Nothing about `getUsers`
executes while `routes` is being constructed; it only executes later,
once a matching request actually arrives. **Registration** (declaring
what *could* happen) and **execution** (actually making it happen) used
to be the same moment in Step 1 — checking a path and returning a
response happened in one single step, every time. Splitting them apart
is what makes `routes` safe to build once, at the top of the file, and
reused by every request that follows.

**SE lens — dependency direction, worth tracking now, since it will
matter again.** `getUsers`, `getOrders`, and `getProducts` don't know
`routes` exists, and don't know they're being routed to at all — they
just receive a request and return a response, unaware of anything
outside themselves. `routes`, and the router built around it, depend on
the handlers — not the other way around. This direction — the
specific, replaceable pieces (handlers) knowing nothing about the
general mechanism that uses them (the router) — is called **dependency
direction**, and getting it backwards (handlers reaching out to know
about the router) would make handlers far harder to test or reuse on
their own.

**SE lens — the actual test from Step 1, passed this time — and why the
change is localized.** Adding a fourth route — say, `/reviews` — now
means writing one new function and adding one new line to `routes`.
`handleRequest` itself never changes again, for any future route, ever.
This is the **open/closed principle**, a real, named software design
principle: code should be **open for extension** (new routes can be
added) but **closed for modification** (adding one never requires
editing code that already works and is already correct). The size of
the change needed for a new feature — one function, one line, nothing
else — is called **locality of change**: the smaller and more contained
a change can stay, the easier a system is to keep correct as it grows.
`handleRequest`, as of this lesson, genuinely has both properties; the
`if`/`else` version from Step 1 never could.

**SE lens — extensibility and scalability, two related but different
properties, both true here for different reasons.** This lesson has now
shown two separate improvements, worth telling apart precisely:
**scalability** is about *performance* as the system grows — the earlier
constant-time lookup means handling 3,000 routes costs the same per
request as handling 3. **Extensibility** is about *effort* as the system
grows — the open/closed property above means *adding* route number 3,001
costs one function and one line, regardless of how many already exist.
A system could have one property without the other (a lookup that stays
fast but requires editing five files to add a route would be scalable
but not very extensible); this router happens to have earned both at
once, but they're answering different questions.

---

## Step 4 — Naming What Each Piece Actually Is

Two words, worth using precisely from here on, since this project will
build on both repeatedly.

A **route** is the *pairing* itself — "`/users` means run `getUsers`" —
the entry inside `routes`, not the path alone and not the function alone.
A **handler** is the function that actually runs for a matched route —
`getUsers`, `getOrders`, and `getProducts` are each a handler. `handleRequest`
itself is neither a route nor a handler anymore — it's become the
**router**: the one piece of code whose entire job is matching an
incoming request to the correct handler and letting that handler do the
real work.

**SE lens — `handleRequest`'s job itself has changed, not just its
code.** In lesson 1, `handleRequest`'s job was "return the right data
for `/users`" — **application logic**, code whose purpose is the actual
feature a user cares about. Its job now is "figure out which handler
should run" — it no longer returns any user, order, or product data
itself at all. Generic, reusable machinery that exists to support
application logic, rather than being the application logic itself, is
called **infrastructure**. `handleRequest` didn't just get refactored —
it changed categories, from a feature to the plumbing a feature runs
through. Every handler is now the application logic; the router is
infrastructure underneath it.

---

## Connect the Pieces

```
Client  -->  Router  -->  Handler  -->  Response
             (routes,      (getUsers,
              lookup,       getOrders,
              dispatch)     getProducts)
```

**SE lens — a new layer, and a system built from pieces instead of one
function.** Lesson 1 had two layers: this lab's bridge, and
`handleRequest` doing everything itself. This lesson adds a real third
layer — the router and the handlers are now separate, each with exactly
one job, the **single responsibility principle** in a stronger, more
concrete form than lesson 1 could show it. Building a system out of
several small, focused pieces working together, instead of one large
piece doing everything, is called **composition** — this backend is now
*composed of* a router, a dictionary, and a handful of handlers, rather
than being one undivided function. Systems tend to grow exactly this
way: not by making one piece bigger, but by adding another layer and
letting each layer stay simple.

---

## What Breaks Without This

**Registering a route with the wrong key** (e.g. `"users"` instead of
`"/users"`, missing the leading slash): `routes["/users"]` looks up a key
that was never actually set, returns `undefined`, and every request to
the *correctly-typed* path `/users` gets an incorrect `404` — the bug
lives entirely in one mistyped string, with no error message anywhere
pointing directly at it.

**Storing the result of *calling* a handler, instead of the handler
itself** (writing `"/users": getUsers(request)` instead of `"/users":
getUsers`): this calls `getUsers` immediately, once, while `routes` itself
is being built — long before any real request exists — and stores
whatever it happened to return *that one time* as a fixed value. Every
future request to `/users`, no matter what it actually asks, would get
back that same frozen response, because the function was called far too
early, exactly the same class of mistake as writing `onClick={handler()}`
instead of `onClick={handler}` in UI code — calling too early instead of
handing over the function itself.

---

## Definition of Done

- [ ] `/users`, `/orders`, and `/products` all return their correct data through the `routes` dispatch table
- [ ] An unregistered path still correctly returns a `404`
- [ ] You can explain what it means for functions to be first-class values in this language
- [ ] You can explain what a dictionary/hash map is, using `routes` as the example, and how a dictionary differs from a hash map from a plain JS object
- [ ] You can explain the open/closed principle, using this lesson's before-and-after as the concrete case
- [ ] You can correctly use the words route, handler, and router without confusing them
- [ ] You can explain why storing `getUsers(request)` instead of `getUsers` in the dispatch table would be a real, specific bug
- [ ] You can explain what a callback is, using a stored handler function as the example
- [ ] You can explain why a dictionary lookup doesn't get slower as more routes are added, unlike the `if`/`else` chain it replaced
- [ ] You can explain what indirection means, using `handler(request)` versus calling `getUsers(request)` directly as the example
- [ ] You can explain why the handlers don't know the router exists, and why that dependency direction matters
- [ ] You can explain the difference between registering a route and executing its handler
- [ ] You can explain what late binding means, using `routes[request.path]` as the example
- [ ] You can explain the difference between scalability and extensibility, using this lesson's lookup speed and open/closed property as the two examples
- [ ] You can explain why `handleRequest` is now infrastructure rather than application logic

---

*Next: real routes need more than a fixed path — `/users/1` and `/users/2`
are different requests for the same *kind* of thing. Path parameters teach
the router to recognize that pattern.*
