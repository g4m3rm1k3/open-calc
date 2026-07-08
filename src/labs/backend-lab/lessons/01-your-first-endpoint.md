# Backend Lab — Lesson 1 — Your First Endpoint

## What You Will Build

A single working endpoint. Click **Send** on the request already sitting in
the panel to the right, watch it fail honestly, then write the smallest
possible amount of code that makes it succeed — a real 200 response, with a
real body, that you wrote yourself.

---

## What You Need to Know First

Nothing backend-specific. This lesson assumes you can write a variable and
a loop — nothing more. Functions, objects, and everything else backend
work depends on are explained here, from zero, the first time each one is
needed.

---

## Step 1 — See It Fail, Honestly

The **Postman panel** on the right already has a request waiting:
`GET /users`. Click **Send**.

You'll see a real error: `handleRequest is not defined`.

**Walkthrough — what a request and a response actually are.** Every time
a browser, an app, or a tool like Postman talks to a backend, it sends a
**request** — a description of what it wants (here: the method `GET`, and
the path `/users`) — and waits for a **response** — a description of what
happened (a status number, and usually some data). This lab's Postman
panel builds a real request object and hands it to whatever code you've
written; right now, that's nothing at all, which is exactly why the error
is real, not staged. Nothing in this lab pretends a server exists until
you actually write the code that makes one exist.

**Walkthrough — why the error says `handleRequest` specifically.** This
lab has one fixed rule, stated plainly instead of left for you to guess:
whatever you write in the editor is expected to define a function named
exactly `handleRequest`. Every request this lab ever sends is handed to
that one function. Right now, no such function exists anywhere in your
project, so trying to call it fails immediately — the same way calling
any name that was never defined fails in any JavaScript program, in any
environment, for any reason.

---

## Step 2 — Functions, From Zero

A **function** is a named, reusable block of code you can *run* by
writing its name followed by parentheses. You've been assumed to know
variables and loops already — a function is the next building block: a
way to give a whole block of code a name, so it can be run again later
without rewriting it.

```javascript
function greet() {
  return "hello";
}
```

**Walkthrough.** `function greet() { ... }` **defines** `greet` — it does
**not** run the code inside it yet. The code inside only runs when
something later actually **calls** it: `greet()`. The parentheses are
what make it a call instead of just a mention of the name — `greet` on
its own just refers to the function itself; `greet()` actually runs it.

**Walkthrough — `return`.** The `return` keyword hands a value back to
whatever called the function, and immediately stops running anything else
inside it. `greet()` doesn't print `"hello"` anywhere by itself — it
*becomes* the value `"hello"`, wherever it was called from, the same way
`2 + 2` becomes `4` wherever it appears. If you wanted to see it, you'd
need to do something with that returned value yourself, such as
`console.log(greet())`.

**Walkthrough — parameters, the way a function receives information.**

```javascript
function greet(name) {
  return "hello, " + name;
}
```

`name` here is a **parameter** — a placeholder for whatever value the
function is given when it's actually called. `greet("Mike")` runs the
function with `name` set to `"Mike"` for that one call, and returns
`"hello, Mike"`. A different call, `greet("Jane")`, gets its own separate
`"Jane"` — nothing about one call affects another. This is the entire
mechanism `handleRequest` uses: it's a function with one parameter (the
request), and what it returns is treated as the response.

---

## Step 3 — Write the Smallest Possible `handleRequest`

In the editor, write:

```javascript
function handleRequest(request) {
  return { status: 200, body: "Hello" };
}
```

Click **Send** again. The Response tab now shows a real `200`, with the
body `"Hello"`.

**Walkthrough — the object you returned.** `{ status: 200, body: "Hello" }`
is an **object** — a value made of named fields, each holding its own
piece of data, written as `name: value` pairs inside curly braces. This
lab expects every response to be shaped this way: a `status` (a number,
the same kind of status code real web traffic uses — `200` means
"succeeded"), and a `body` (whatever data you actually want to send
back — here, just a plain piece of text). Nothing enforces this shape by
magic; it's a plain convention this lab's Postman panel is written to
expect, the same way `handleRequest` is a name it's written to expect.

**Walkthrough — `request`, received but ignored, on purpose, for now.**
`handleRequest(request)` takes a parameter for the incoming request, but
this first version never looks at it — every request, no matter what it
actually asked for, gets back the identical `"Hello"`. That's an honest,
deliberate simplification for this very first step: proving that a
function can be called at all, and that what it returns is what comes
back, before making it do anything more interesting.

---

## Step 4 — Actually Look at the Request

Real endpoints respond differently depending on what was asked. Update
`handleRequest`:

```javascript
function handleRequest(request) {
  if (request.path === "/users") {
    return { status: 200, body: [{ id: 1, name: "Mike" }, { id: 2, name: "Jane" }] };
  } else {
    return { status: 404, body: "Not found" };
  }
}
```

Click **Send** with the path still set to `/users` — you get the two
users back. Change the path in the request panel to something else, like
`/orders`, and Send again — a real `404`.

**Walkthrough — `request.path`, reading a field off the object you were
given.** `request` is an object too, built by this lab's Postman panel,
with its own fields — `method`, `path`, and others you haven't needed
yet. `request.path` reads the `path` field off of it: the text that was
typed into the Postman panel's path input. `===` checks whether two
values are exactly equal; `request.path === "/users"` is `true` only when
the path typed in is precisely `"/users"`, character for character.

**Walkthrough — `if`/`else`, deciding between two responses.** This is
the first time `handleRequest` returns something different depending on
what it was actually asked — an `if`/`else` chooses between the two
`return` statements based on that one check. Whichever branch runs,
`return` still means the same thing it always has: hand back a value, and
stop.

**Forward connection — this will not scale, and that's the point.** Real
backends handle dozens, sometimes hundreds, of different paths. Writing
one long `if`/`else` chain checking every single one, all inside one
function, gets unmanageable fast — imagine twenty paths, each needing its
own branch, all crammed into `handleRequest`. That real, felt problem —
not a hypothetical one — is exactly what motivates building a proper
**router** in the next lesson: a structured way to register "this path
means this behavior" without one giant chain of `if`s doing all the work
by hand.

---

## Connect the Pieces

```
server.js   handleRequest(request) — the one function this entire lab
            calls for every request; reads request.path, returns a
            { status, body } object
```

---

## What Breaks Without This

**Forgetting `return` inside a branch** (writing the object but not
returning it): `handleRequest` finishes without ever handing back a
value. This lab has nothing to send as a response, and the Response tab
correctly tells you so — a real, honest consequence of a real, common
mistake, not a special case this lab hides from you.

**Typing the path check as `request.path = "/users"` (one equals sign,
not two or three):** this doesn't check equality at all — a single `=`
**assigns** a value rather than comparing one, silently overwriting
`request.path` with the string `"/users"` and evaluating to that string
as a value, which is truthy — meaning this specific branch would run for
*every* request, indistinguishable from an infinite string of coincidence
until you tried a different path.

---

## Definition of Done

- [ ] You've seen the honest `handleRequest is not defined` error before writing any code
- [ ] `handleRequest` returns a real `{ status: 200, body: ... }` response for `/users`
- [ ] A path other than `/users` correctly returns a `404`
- [ ] You can explain what a function parameter is and what `return` does, in your own words
- [ ] You can explain why one long `if`/`else` chain won't scale to a real backend with many routes

---

*Next: a router — replacing the `if`/`else` chain with a structured way to
register one handler per path.*
