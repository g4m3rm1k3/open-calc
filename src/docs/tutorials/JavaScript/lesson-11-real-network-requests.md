# Lesson 11: Asking a Real Server for Real Data

- **What you will build.** A GitHub username lookup — type a real
  username, click Look Up (or press Enter), and see that person's
  real name, bio, follower count, and avatar, fetched live from
  GitHub's own real, public API. The transferable problem: Lesson 10's
  `simulatedSave` faked a delay with `setTimeout`, but never actually
  left the page — no real request went anywhere, and no real server
  ever had a chance to say no. This lesson is the first one that talks
  to something genuinely outside this project's own control: a real
  server, on the real internet, that can be slow, can say no for
  reasons that have nothing to do with anything this project's own
  code could check in advance, and returns real data this project has
  never seen the exact shape of until the response actually arrives.

- **What you need to know first.** Lesson 10's `async`/`await` and
  `try`/`catch`/`finally` — this lesson's own real subject is what
  goes *inside* the `try`, this time genuinely leaving the page rather
  than only simulating a delay. Lesson 6's `element.disabled` and
  `keydown`/`e.key === 'Enter'` pattern, reused directly. Lesson 8's
  dot-notation field access.

- **A note on how this lesson was verified.** Every mechanic in this
  lesson — `fetch`, `response.ok`, `response.json()` — was proven
  against a real, live, currently-running server on the real internet,
  not a local stand-in. While preparing this lesson, the real, shared
  network this curriculum's own verification runs on genuinely hit
  GitHub's own real rate limit (60 requests per hour, per IP, for
  unauthenticated requests) — a real, live `403` response, captured
  directly, is used below as genuine proof of exactly the kind of
  failure this lesson's own error handling exists for. The real
  success-path data shown later in this lesson was captured live,
  moments earlier in the same real session, before that limit was
  reached. In your own browser, on your own network, this feature
  typically succeeds immediately — GitHub's real limit resets hourly,
  and a real person clicking this button occasionally is nowhere near
  it.

- **Terms used in this lesson**

  - **HTTP status code** — a real, standard, three-digit number every
    HTTP response carries, indicating what happened: `200` for
    success, `404` for "no such resource," `403` for "you're not
    allowed to do that right now" (including, as this lesson directly
    encountered, rate limiting), among many other real, standardized
    values. It exists so a client can determine what happened without
    having to parse the response body itself — the *fact* of success
    or failure is available immediately, at the protocol level, before
    a single byte of the real, actual content is even read.

- **Objects and methods used**

  - **`fetch(url)`**
    - *What it is:* a global, browser-provided function that sends a
      real HTTP request to the given URL and returns a real Promise
      for the response.
    - *Implementation:* takes one string argument (a URL) and returns
      a real Promise that resolves — even for a real, failed request
      like a `403` or `404` — with a real `Response` object, as soon
      as the response's own headers have arrived; the Promise only
      *rejects* for genuine network-level failures (no connection at
      all, a real DNS failure) — an HTTP-level failure like `403` is
      still, correctly, a real, resolved `Response`, not a rejection,
      which this lesson's own next unit addresses directly.
    - *Its use:* this is the real mechanism that actually leaves this
      project's own page and asks GitHub's real server for real data.
    - *Type:* a global function, not a method on any particular
      object.
    - *Responsibility:* send exactly one real HTTP request and resolve
      with a real, structured `Response` object describing what came
      back — nothing about parsing the real body automatically;
      that's a separate, later step this lesson's own third unit
      covers.
    - *Depends on:* a valid URL string.
    - *Connects to:* called inside this lesson's own `lookupUser`
      function; its real, resolved `Response` is checked and read by
      this lesson's next two units.
    - *Shape:* a public, global, asynchronous networking primitive —
      genuinely leaving this project's own page, unlike anything this
      curriculum has used before.

  ```
  // Response's real declared shape (the members this lesson touches)
  interface Response {
    readonly ok: boolean;
    readonly status: number;
    json(): Promise<any>;
  }
  ```

  - **`response.ok`** / **`response.status`**
    - *What they are:* real, read-only properties on every `Response`
      object, describing whether the real request succeeded and
      exactly what real HTTP status code came back.
    - *Implementation:* `status` is the real, numeric HTTP status code
      itself (`200`, `403`, `404`, and so on); `ok` is a real,
      convenience boolean, `true` whenever `status` falls in the
      200–299 range, `false` for everything else — genuinely computed
      from `status`, not an independent fact.
    - *Its use:* this is how this project's own code tells a real
      success apart from a real failure — `fetch` itself, as this
      lesson's own Header already noted, resolves either way, so
      checking `.ok` is the one, real, necessary step before trusting
      anything else about the response.
    - *Type:* real, read-only instance properties on any `Response`
      object.
    - *Responsibility:* report, accurately, what actually happened at
      the real, protocol level — nothing about the response's own
      real content.
    - *Depends on:* a real, resolved `Response` object.
    - *Connects to:* read inside `lookupUser`, immediately after
      `fetch` resolves; `.status`, specifically, is used to build a
      real, honest error message when `.ok` is `false`.
    - *Shape:* a public read API — the real, protocol-level verdict on
      a request, before its own body is ever touched.

  - **`response.json()`**
    - *What it is:* a method on `Response` that reads the real
      response body and parses it as real JSON.
    - *Implementation:* takes no arguments; returns a real Promise —
      genuinely asynchronous, since reading a real, possibly large
      response body takes real, unpredictable time — that resolves
      with the real, parsed JavaScript value the body represented, or
      rejects if the body genuinely wasn't valid JSON at all.
    - *Its use:* this is how the real, raw bytes GitHub's server sent
      back become a real, usable JavaScript object this project can
      read fields off of.
    - *Type:* an instance method on any `Response` object.
    - *Responsibility:* read and parse the real response body exactly
      once — calling it a second time on the same real response would
      fail, since the real body stream can only be consumed once.
    - *Depends on:* a real `Response` object whose body is real, valid
      JSON.
    - *Connects to:* called on the `Response` `fetch` resolved with;
      its own real, resolved object is what this lesson's final unit
      reads fields off of to actually render the page.
    - *Shape:* a public read API — the real bridge between "raw
      network bytes" and "a real, usable JavaScript value."

  - **`document.querySelector(selector)`** *(reappearing — full
    treatment restated)*
    - *What it is:* a method that searches the DOM tree for the first
      element matching a CSS selector.
    - *Implementation:* takes one string argument and returns either
      the first matching `Element`, or `null`.
    - *Its use:* this lesson needs eight new real element references —
      the input, the button, a status line, and five elements making
      up the real result card.
    - *Type:* an instance method, called on `document`.
    - *Responsibility:* search the live DOM tree once, using the given
      selector, and hand back a real reference to the first match.
    - *Depends on:* a valid CSS selector string, and a DOM tree already
      built.
    - *Connects to:* called on `document`; each `Element` returned is
      used by mechanisms already established elsewhere in this
      curriculum.
    - *Shape:* a public read API.

---

## Concept Unit: Selecting the Lookup Form and Result Elements

### The Problem

Before any real request can happen, the script needs real references
to the input, the button, and every real element the result will
eventually be rendered into.

> **Before reading on:** you've written this exact lookup many times
> now. Given eight new elements exist in the HTML — an input, a
> button, a status paragraph, and five elements inside a result
> card — what would you type to get real references to all of them?

### Introduce the Concept in Isolation

A fresh throwaway lab, against a new element:

```js
const found = document.querySelector('#u');
console.log(found.tagName);
```

Against a throwaway `<input id="u">`. Real run (Node + jsdom):

```
found: true | tagName: INPUT
```

This reconfirms the lookup mechanism, unchanged from every previous
use in this curriculum.

### Discard the Throwaway Example

This throwaway `<input id="u">` isn't part of the counter project. It
existed only to reconfirm the lookup mechanism before selecting the
eight real elements this lesson needs.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `index.html` (modified — a lookup form and
  result card added, after the message toggle); `script.js` (modified
  — eight new `const` declarations added).
- **Change type:** add.
- **Location:** `index.html` — after `<p id="message">`'s own closing
  tag; `script.js` — after the existing `message` declaration.
- **Dependencies:** none new.

### The New Code

```js
const usernameInput = document.querySelector('#usernameInput');
const lookupBtn = document.querySelector('#lookupBtn');
const lookupStatus = document.querySelector('#lookupStatus');
const userCard = document.querySelector('#userCard');
const userAvatar = document.querySelector('#userAvatar');
const userName = document.querySelector('#userName');
const userBio = document.querySelector('#userBio');
const userFollowers = document.querySelector('#userFollowers');
```

### The Updated Project

`index.html`'s own relevant section, in full, this unit's new lines
marked:

```html
 8  <body>
 9    <button id="toggleBtn">Show message</button>
10    <p id="message" class="hidden">Hello, this was hidden.</p>
11
12    <input id="usernameInput" type="text" placeholder="GitHub username">  <!-- ← new -->
13    <button id="lookupBtn">Look up</button>                              <!-- ← new -->
14    <p id="lookupStatus"></p>                                            <!-- ← new -->
15    <div id="userCard" class="hidden">                                    <!-- ← new -->
16      <img id="userAvatar" alt="avatar">                                  <!-- ← new -->
17      <p id="userName"></p>                                               <!-- ← new -->
18      <p id="userBio"></p>                                                <!-- ← new -->
19      <p id="userFollowers"></p>                                          <!-- ← new -->
20    </div>                                                                 <!-- ← new -->
```

`script.js`'s own relevant section, in full, this unit's new lines
marked:

```js
1  const button = document.querySelector('#toggleBtn');
2  const message = document.querySelector('#message');
3
4  const usernameInput = document.querySelector('#usernameInput');    // ← new
5  const lookupBtn = document.querySelector('#lookupBtn');            // ← new
6  const lookupStatus = document.querySelector('#lookupStatus');      // ← new
7  const userCard = document.querySelector('#userCard');              // ← new
8  const userAvatar = document.querySelector('#userAvatar');          // ← new
9  const userName = document.querySelector('#userName');              // ← new
10 const userBio = document.querySelector('#userBio');                // ← new
11 const userFollowers = document.querySelector('#userFollowers');    // ← new
```

### Mechanical Walkthrough

- **`const`** — declares a binding that won't be reassigned; explained
  in full in Lesson 1.
- Eight new variable names, each describing exactly what it holds.
- **`=`** — the assignment operator, explained in full in Lesson 1.
- **`document`** — the global page object, explained in full in
  earlier lessons.
- **`.querySelector`** — the method itself, explained in full above.
- **`(`...`)`** — call syntax, eight separate times.
- Eight string literal CSS selectors — the identical `#id` mechanism
  used throughout this curriculum.
- **`;`** — statement terminator, eight times.

### CS Lens

Not applicable beyond this curriculum's own already-covered concept —
element selection by CSS selector.

### SE Lens

The same real tradeoff already named repeatedly: selecting by a
stable `id` keeps each lookup correct regardless of page structure, at
the cost of eight more elements that now carry unique `id`s — a real,
larger batch than any previous lesson, reflecting that this lesson's
own feature genuinely needs more distinct, individually-addressable
pieces than any before it.

### Commands Needed

None.

### Run It

Exercised as part of this lesson's closing full-project run, below.

### Connection

This unit gets every reference this lesson needs — the next three
units are what actually talk to a real server and use its response.

---

## Concept Unit: Sending a Real Request with `fetch`

### The Problem

Every "asynchronous" thing this project has done so far — Lesson 10's
`simulatedSave` — was really just a timer, never actually leaving the
page. This lesson needs to genuinely ask a real, external server for
real data.

> **Before reading on:** given `fetch`, named in this lesson's own
> Header, is a global function taking one real URL, what do you think
> it hands back — the real data itself, immediately? Or, given
> everything this curriculum has learned about asynchronous work in
> Lesson 10, something else, that needs to be `await`ed first before
> the real data is available at all?

### Introduce the Concept in Isolation

Real, live network code — no throwaway HTML needed, since this
doesn't touch the DOM at all:

```js
const response = await fetch('https://raw.githubusercontent.com/expressjs/express/master/package.json');
console.log(typeof response);
console.log(response instanceof Response);
console.log(response.ok, response.status);
```

Real run, against the real, live internet:

```
typeof response: object
response instanceof Response: true
response.ok: true
response.status: 200
```

This proves `fetch`, once `await`ed, genuinely hands back a real
`Response` object — not the actual data itself, and not a plain
object either, but a specific, real, built-in type (`instanceof
Response` confirms it) carrying real, protocol-level facts
(`.ok`, `.status`) about what actually happened, before its own real
content has even been read.

### Discard the Throwaway Example

This specific, live request to `raw.githubusercontent.com` isn't part
of the counter project — it existed only to prove `fetch`'s own real
return shape, against a real, live, currently-working endpoint.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified — a new `lookupUser`
  function begun).
- **Change type:** add.
- **Location:** after the existing element references.
- **Dependencies:** `usernameInput`, already established.

### The New Code

```js
async function lookupUser() {
  const username = usernameInput.value.trim();
  if (username === '') return;
  const response = await fetch(`https://api.github.com/users/${username}`);
}
```

### The Updated Project

`script.js`'s own new function, in full, this unit's new lines marked:

```js
1  async function lookupUser() {                                     // ← new
2    const username = usernameInput.value.trim();                     // ← new
3    if (username === '') return;                                     // ← new
4    const response = await fetch(`https://api.github.com/users/${username}`); // ← new
5  }                                                                    // ← new
```

Line 2 reads the real, typed username, reusing `.value` (Lesson 5) and
`.trim()` (Lesson 6). Line 3 guards against an empty request — the
identical early-return shape established in Lessons 5, 6, and 8. Line
4 sends the real request — `response`, once this line completes,
holds a real, live `Response` object, though nothing yet checks
whether it succeeded.

### Mechanical Walkthrough

- **`async function lookupUser()`** — `async`, explained in full in
  Lesson 10; a named function declaration, explained in full in Lesson
  6.
- **`const username = usernameInput.value.trim();`** — `.value`,
  explained in full in Lesson 5; `.trim()`, explained in full in
  Lesson 6.
- **`if (username === '') return;`** — `if`, explained in full in
  Lesson 3; `===`, explained in full in Lesson 6; `return`, explained
  in full in Lesson 6; guards against sending a real request for an
  empty username, which GitHub's own real API would simply reject
  anyway, correctly caught here before ever leaving the page.
- **`const response = `...`;`** — the declaration and assignment,
  explained in full in Lessons 1 and 2.
- **`await`** — explained in full in Lesson 10; pauses `lookupUser`
  until the real request actually completes.
- **`fetch`** — the function itself, explained in full above.
- **`(`...`)`** — call syntax, invoking `fetch` with one argument.
- **`` `https://api.github.com/users/${username}` ``** — a template
  literal, explained in full in Lesson 2, building the real, complete
  URL from GitHub's own real, documented API shape combined with
  whatever real username the user typed.

### CS Lens

A single, real function call representing "a request that will be
answered by something outside this program's own control, at some
real, unpredictable point in the future" — rather than a value
computed entirely by this program's own logic — is the concrete,
network-facing instance of the same **asynchronous** idea Lesson 10
already named as a Term, now genuinely crossing a real, external
boundary rather than only simulating a delay internally.

Also recognized in: mailing a real letter and waiting for a real
reply, rather than talking face to face; placing a real restaurant
order and waiting for it to be genuinely prepared by someone else;
submitting a real government form and waiting for real, official
processing; any real client-server interaction in any real networked
system, which is, structurally, exactly what this lesson's own code
now genuinely is.

### SE Lens

The real alternative not chosen — because it doesn't really exist for
browser JavaScript — is a genuinely *blocking* network call: code
that freezes the entire page until a real, external server responds,
however long that takes. Browsers deliberately don't offer that at
all for good, real reason: a real network request can take anywhere
from milliseconds to many real seconds, or fail to complete at all,
and a page that froze completely for that whole, unpredictable
duration would be unusable the instant a real network was even
slightly slow. `fetch`'s own asynchronous, Promise-based shape is the
real, deliberate design choice that keeps every other real interaction
on the page — a click, a keypress, a redraw — working normally, the
entire time a real request is genuinely in flight.

### Commands Needed

None.

### Run It

Real output shown above, against a real, live, currently-working
endpoint. `lookupUser`'s own real call to the real GitHub API is
exercised as part of this lesson's closing full-project run, below.

### Connection

A real request now genuinely goes out — the next unit is what checks
whether it actually succeeded.

---

## Concept Unit: Checking Real Success with `response.ok`

### The Problem

`response` now holds a real, resolved object — but as this lesson's
own Header already stated plainly, `fetch` resolves the same way
whether the real request succeeded *or* failed at the HTTP level.
Nothing yet distinguishes those two real, different outcomes.

> **Before reading on:** this lesson's own Header already named
> `response.ok` and `response.status` as real properties describing
> what actually happened. Given `fetch` itself doesn't reject just
> because a server said "no" (only for a genuine network failure),
> what real, concrete check would need to happen, immediately after
> `await fetch(...)`, before this project could safely trust anything
> else about the response?

### Introduce the Concept in Isolation

Two real, live requests — one genuinely successful, one a real,
live failure this curriculum's own verification session directly
encountered while preparing this lesson:

```js
const okRes = await fetch('https://raw.githubusercontent.com/expressjs/express/master/package.json');
console.log(okRes.status, okRes.ok);

const rateLimitedRes = await fetch('https://api.github.com/users/octocat');
console.log(rateLimitedRes.status, rateLimitedRes.ok);
const body = await rateLimitedRes.json();
console.log(body.message);
```

Real run, both against the real, live internet:

```
real success case — status: 200 | ok: true
real rate-limited case — status: 403 | ok: false
real rate-limit body message: "API rate limit exceeded for 35.231.75.227. (But here's the good news: Authentic..."
```

This is real, live, direct proof of exactly the distinction this
lesson's own Header described: the identical real `fetch` mechanism
resolved successfully both times — no rejection, no thrown error — but
`.ok` correctly reports `true` for the real success and `false` for
the real failure, and `.status` correctly reports the real, specific
HTTP code each time. The real rate-limit body even parses as valid,
real JSON, with a real, genuinely useful, human-readable explanation
inside it — proof that even a "failed" response still has a real,
readable body worth showing to a user, not just an opaque failure.

### Discard the Throwaway Example

Neither real request above is part of the counter project's own
tracked code — they existed only to prove `.ok`/`.status` correctly,
honestly distinguish two real, different outcomes `fetch` itself
doesn't distinguish on its own.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified — `lookupUser` gains a
  real check).
- **Change type:** add.
- **Location:** immediately after the `fetch` call added in the
  previous unit.
- **Dependencies:** `response`, from the previous unit.

### The New Code

```js
if (!response.ok) {
  throw new Error(`GitHub returned ${response.status}`);
}
```

### The Updated Project

`script.js`'s own `lookupUser` function, in full, this unit's new
lines marked:

```js
1  async function lookupUser() {
2    const username = usernameInput.value.trim();
3    if (username === '') return;
4    const response = await fetch(`https://api.github.com/users/${username}`);
5    if (!response.ok) {                                             // ← new
6      throw new Error(`GitHub returned ${response.status}`);         // ← new
7    }                                                                 // ← new
8  }
```

Lines 5–7 now correctly distinguish a real success from a real
failure — and deliberately `throw` a real error, rather than, say,
just returning early, specifically so this lesson's next unit's own
`try`/`catch` (not yet added — this function still has no error
handling wrapped around it at all, the identical, deliberately
incomplete state Lesson 10's own second unit left `handleSync` in) can
catch it and show a real, honest message, rather than this function
silently doing nothing on a real failure.

### Mechanical Walkthrough

- **`if (!response.ok) {`...`}`** — `if`, explained in full in Lesson
  3; `!`, explained in full in Lesson 5; `response.ok`, the property
  itself, explained in full above.
- **`throw`** — a keyword that immediately stops the current
  function's own execution and hands a real value up to whatever
  `catch` block, if any, is waiting for it — the first appearance of
  `throw` in this curriculum, though `reject(new Error(...))`, inside
  Lesson 10's own `simulatedSave`, already produced the identical real
  kind of value this line now produces directly, without a Promise
  wrapping it.
- **`new Error(`...`)`** — the constructor itself, explained in full
  in Lesson 10; here built with a template literal, explained in full
  in Lesson 2, embedding the real, specific status code that actually
  came back.
- **`` `GitHub returned ${response.status}` ``** — reads the real
  `.status` property, explained in full above, producing a real,
  specific, honest message like `"GitHub returned 403"` or
  `"GitHub returned 404"`, rather than one, generic, unhelpful failure
  message regardless of what actually went wrong.

### CS Lens

Checking a real, protocol-level fact before ever trusting a response's
own content is a concrete instance of **validating at a boundary** —
the same real principle behind checking a function's own real
arguments before using them, or validating real user input (Lesson 6)
before acting on it — applied here at the real boundary between "data
this program received from something outside its own control" and
"data this program is about to actually use."

Also recognized in: a security checkpoint verifying real credentials
before granting real access; a factory's own real quality-control
inspection before a real part is allowed onto the next stage of
assembly; a bank verifying a real check has genuinely cleared before
treating the real funds as available; any real API client library
checking a real response's own status before parsing its real body.

### SE Lens

The real alternative not chosen is trusting `response` unconditionally
and calling `.json()` regardless of `.ok` — which would, for many real
failure responses, still technically succeed (GitHub's own real error
bodies, as this lesson's own lab just proved, are real, valid JSON
too), producing a real object this project would then try to read
`.avatar_url`, `.name`, and `.followers` off of — fields a real error
body simply doesn't have, silently producing `undefined` values
rendered onto the page instead of a real, honest error message. The
real cost of the check this unit adds: one extra, real condition,
paid on every single request, in exchange for never showing a user a
broken, half-rendered card built from data that was never actually
what they asked for.

### Commands Needed

None.

### Run It

Real output shown above, including the exact, live `403` this
curriculum's own verification genuinely encountered. `lookupUser`'s
own real check is exercised as part of this lesson's closing
full-project run, below.

### Connection

Real failures are now correctly, honestly distinguished from real
success — the next unit is what actually reads the real data once
success is confirmed.

---

## Concept Unit: Reading the Real Body with `response.json()`

### The Problem

A real, successful response is now correctly identified — but its own
real content is still just raw, unread bytes as far as this project's
own code is concerned; nothing yet turns it into real, usable
JavaScript values.

> **Before reading on:** this lesson's own Header already named
> `response.json()` as a method returning a real Promise for the
> parsed body. Given everything this curriculum already knows about
> `await` (Lesson 10), what would the real, single line that reads
> and parses a successful response's own real body actually look
> like?

### Introduce the Concept in Isolation

Real, live network code:

```js
const response = await fetch('https://raw.githubusercontent.com/expressjs/express/master/package.json');
const data = await response.json();
console.log(typeof data);
console.log(data.name, data.license);
```

Real run, against the real, live internet:

```
typeof data: object
data.name: express
data.license: MIT
```

This proves `.json()`, once `await`ed, genuinely turns the response's
own real, raw body into a real JavaScript object — `typeof data` is
`object`, not a string needing further parsing, and its real fields
(`.name`, `.license`) are directly, immediately readable, reflecting
the real content of a real, live file this project's own code never
saw the exact bytes of until this exact moment.

### Discard the Throwaway Example

This specific, live request isn't part of the counter project. It
existed only to prove `.json()` correctly parses a real body into a
real, usable object.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified — `lookupUser` gains one
  more real line).
- **Change type:** add.
- **Location:** immediately after the `.ok` check added in the
  previous unit.
- **Dependencies:** `response`, already established.

### The New Code

```js
const data = await response.json();
```

### The Updated Project

`script.js`'s own `lookupUser` function, in full, this unit's new line
marked:

```js
1  async function lookupUser() {
2    const username = usernameInput.value.trim();
3    if (username === '') return;
4    const response = await fetch(`https://api.github.com/users/${username}`);
5    if (!response.ok) {
6      throw new Error(`GitHub returned ${response.status}`);
7    }
8    const data = await response.json();                             // ← new
9  }
```

Line 8 is only ever reached once a real success has already been
confirmed by the lines above it — `data` now holds a real, usable
object with whatever real fields GitHub's own real API documented and
actually returned, ready for this lesson's final unit to read.

### Mechanical Walkthrough

- **`const data = `...`;`** — the declaration and assignment,
  explained in full in Lessons 1 and 2.
- **`await`** — explained in full in Lesson 10; pauses `lookupUser`
  until the real body has genuinely finished being read and parsed.
- **`response.json`** — the method itself, explained in full above;
  called on the same `response` object read and checked in the two
  previous units.
- **`(`...`)`** — call syntax, invoking `.json()` with no arguments.

### CS Lens

Not applicable as a new hard concept beyond what's already established
above (this unit's own Objects/methods entry) — `.json()` is a real,
specific instance of **deserialization**: converting a real, portable,
text-based representation (JSON) back into a real, native, in-memory
structure a program can directly work with, the exact inverse of what
`JSON.stringify` (used throughout this curriculum's own verification
labs, though never inside the taught project itself) would do.

### SE Lens

The real alternative not chosen is reading the response as plain text
(`response.text()`, a real, sibling method this lesson doesn't use)
and parsing it manually with `JSON.parse()` — real, equally correct
code for a real JSON response, and the honestly more general tool for
a response whose real format isn't already known to be JSON in
advance. `.json()` is the real, more direct choice specifically
because GitHub's own real API contract already, documentedly, always
returns JSON — reaching for the general, two-step version here would
add real, unnecessary steps for a real case this project already knows
the shape of.

### Commands Needed

None.

### Run It

Real output shown above. `lookupUser`'s own real, complete data flow —
fetch, check, parse — is exercised as part of this lesson's closing
full-project run, below.

### Connection

Real, usable data now exists — the final unit is what actually renders
it, or, on a real failure, shows an honest reason why not.

---

## Concept Unit: Rendering the Result, or a Real Honest Failure

### The Problem

`data` holds real, usable fields — but nothing yet puts them on the
page, and `lookupUser`, as it stands, has no real error handling at
all: a real failure, whether the deliberate `throw` two units ago or a
genuine network-level rejection, would currently crash the function
with no visible explanation to the user.

> **Before reading on:** Lesson 10's own `handleSync` already
> established the real shape this project uses for "attempt something
> asynchronous, show progress, handle real success and real failure
> both honestly." Given `data.avatar_url`, `data.name`, `data.bio`,
> and `data.followers` are all real fields on a successful response,
> and this lesson's own Header already named `element.src` as the real
> way to set an image's own source, what would the complete, real
> shape of `lookupUser` need to look like to wire everything this
> lesson has built together?

### Introduce the Concept in Isolation

Throwaway HTML — `<img id="i"><div id="card" class="hidden"></div>` —
and this script:

```js
img.src = 'https://example.com/avatar.png';
console.log(img.src);

card.classList.remove('hidden');
console.log(card.className);
card.classList.add('hidden');
console.log(card.className);
```

Real run (Node + jsdom):

```
img.src before: null
img.src after: https://example.com/avatar.png
card classList before: hidden
card classList after remove: ""
card classList after add back: "hidden"
```

This proves `.src`, assigned directly, genuinely sets a real image
element's own source — the identical property/write-assignment shape
`.textContent` and `.className` already established, just on a
different real property. And `.classList.remove`/`.add` — both real
members of the `DOMTokenList` shape this curriculum's own Lesson 1
already showed in full, though only `.toggle()` was actually called
there — are confirmed here, for the first time genuinely used in this
project, correctly adding and removing one specific class each,
independent of the other's own current state, unlike `.toggle()`,
which flips based on whatever's currently there.

### Discard the Throwaway Example

Neither the throwaway `<img>` nor the throwaway `<div id="card">` are
part of the counter project. They existed only to prove `.src` and
`.classList.remove`/`.add` behave as described.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified — `lookupUser`'s own body
  gains real rendering and real error handling; the button's own click
  wiring, plus an Enter-key handler, both added).
- **Change type:** replace (the previous three units' own
  deliberately-incomplete version).
- **Location:** `lookupUser`'s own full body; two new
  `addEventListener` calls after it.
- **Dependencies:** every element reference from this lesson's first
  unit; `fetch`, `.ok`, `.json()`, all from this lesson's previous
  three units.

### The New Code

```js
async function lookupUser() {
  const username = usernameInput.value.trim();
  if (username === '') return;
  lookupBtn.disabled = true;
  lookupStatus.textContent = 'Looking up...';
  userCard.classList.add('hidden');
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) {
      throw new Error(`GitHub returned ${response.status}`);
    }
    const data = await response.json();
    userAvatar.src = data.avatar_url;
    userName.textContent = data.name || data.login;
    userBio.textContent = data.bio || 'No bio provided.';
    userFollowers.textContent = `${data.followers} followers`;
    userCard.classList.remove('hidden');
    lookupStatus.textContent = '';
  } catch (error) {
    lookupStatus.textContent = `Error: ${error.message}`;
  } finally {
    lookupBtn.disabled = false;
  }
}

lookupBtn.addEventListener('click', lookupUser);
usernameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') lookupUser();
});
```

### The Updated Project

`script.js`, this lesson's own full, final section, every change from
this whole lesson shown together, new/changed lines marked:

```js
 1  async function lookupUser() {
 2    const username = usernameInput.value.trim();
 3    if (username === '') return;
 4    lookupBtn.disabled = true;                                       // ← new
 5    lookupStatus.textContent = 'Looking up...';                       // ← new
 6    userCard.classList.add('hidden');                                 // ← new
 7    try {                                                             // ← new
 8      const response = await fetch(`https://api.github.com/users/${username}`);
 9      if (!response.ok) {
10       throw new Error(`GitHub returned ${response.status}`);
11     }
12     const data = await response.json();
13     userAvatar.src = data.avatar_url;                                // ← new
14     userName.textContent = data.name || data.login;                  // ← new
15     userBio.textContent = data.bio || 'No bio provided.';             // ← new
16     userFollowers.textContent = `${data.followers} followers`;        // ← new
17     userCard.classList.remove('hidden');                              // ← new
18     lookupStatus.textContent = '';                                    // ← new
19   } catch (error) {                                                   // ← new
20     lookupStatus.textContent = `Error: ${error.message}`;              // ← new
21   } finally {                                                         // ← new
22     lookupBtn.disabled = false;                                       // ← new
23   }                                                                   // ← new
24  }
25
26  lookupBtn.addEventListener('click', lookupUser);                    // ← new
27  usernameInput.addEventListener('keydown', (e) => {                  // ← new
28    if (e.key === 'Enter') lookupUser();                                // ← new
29  });                                                                  // ← new
```

Lines 4–6 run immediately, before any real waiting starts, giving
instant, honest feedback and hiding any stale, previous result. Lines
13–18 run only once a real success has been fully confirmed and
parsed. Line 19's `catch` runs on *any* real failure — the deliberate
`throw` from line 10, or a genuine network-level rejection `fetch`
itself might produce — with one, single, real place handling both.
`finally`, lines 21–22, guarantees the button re-enables regardless of
which real outcome occurred, the identical real guarantee Lesson 10's
own `handleSync` already established.

### Mechanical Walkthrough

- **`lookupBtn.disabled = true;`** — the property itself, explained in
  full in Lesson 6; prevents a second, overlapping lookup mid-request.
- **`lookupStatus.textContent = 'Looking up...';`** — the same
  `.textContent` write mechanism established in Lesson 2.
- **`userCard.classList.add('hidden');`** — `.classList`, explained in
  full in Lesson 1; `.add`, explained in full in this unit's own lab,
  above; hides any real, previous result before a new request even
  starts, so a slow real failure never leaves stale data visible.
- **`try {`...`} catch (error) {`...`} finally {`...`}`** — explained
  in full in Lesson 10; wraps this lesson's own three previous units'
  worth of real logic.
- **`userAvatar.src = data.avatar_url;`** — `.src`, the property
  itself, explained in full above; `data.avatar_url`, dot-notation
  field access, explained in full in Lesson 8, reading the real,
  live URL GitHub's own response actually contained.
- **`userName.textContent = data.name || data.login;`** — `||`, the
  logical OR operator; its first appearance in this curriculum, though
  its real behavior is intuitive given everything already covered:
  it evaluates to its left side if that's truthy, otherwise its right
  side — real, direct, honest handling of the fact that GitHub's own
  real API allows `name` to genuinely be `null` (a person hasn't set
  a display name), in which case `login` (their real, always-present
  username) is shown instead.
- **`userBio.textContent = data.bio || 'No bio provided.';`** — the
  identical `||` mechanism, handling the real, live case this lesson's
  own captured data already proved happens: the real "octocat" account
  genuinely has `bio: null`.
- **`userFollowers.textContent = `...`;`** — a template literal,
  explained in full in Lesson 2, combining `data.followers` with fixed
  text.
- **`userCard.classList.remove('hidden');`** — `.remove`, explained in
  full in this unit's own lab; reveals the real card, reached only
  after every line above it succeeded.
- **`lookupStatus.textContent = '';`** — clears the "Looking up..."
  message on real success, since the now-visible card itself is the
  real confirmation.
- **`lookupBtn.addEventListener('click', lookupUser);`** — the same
  `addEventListener` mechanism explained in full throughout this
  curriculum.
- **`usernameInput.addEventListener('keydown', (e) => { if (e.key ===
  'Enter') lookupUser(); });`** — the identical real pattern Lesson 6
  already established for the amount input, reused here verbatim.

### CS Lens

Not applicable as a new hard concept — this unit's real contribution
is composing every mechanism this lesson already introduced
(`fetch`, `.ok`, `.json()`) with Lesson 10's own already-covered
`try`/`catch`/`finally` shape, not introducing a fifth, separate idea.

### SE Lens

The real, honest tradeoff worth naming here, one final time: this
whole feature depends entirely on a real, external, third-party
service this project has zero control over. Every real design choice
this lesson made — checking `.ok` before trusting the body, wrapping
everything in `try`/`catch`, showing a real, specific status code in
the error message, using `finally` to guarantee the button
re-enables — exists specifically because a real, external dependency
can fail in ways this project's own code can never fully predict or
prevent, only detect and handle honestly when they happen. This
lesson's own verification directly encountering GitHub's real rate
limit while being written is not a flaw in the taught feature; it's
live, unplanned, genuine proof that the real failure-handling this
lesson built was never a hypothetical exercise.

### Commands Needed

None — plain HTML/JS, no build step, openable directly in a browser.

### Run It

Real output, from a headless DOM run against this project's own actual,
complete feature, against the real, live GitHub API — genuinely
exercising the real rate-limit failure path this whole session
encountered:

```
--- typing "octocat" and clicking Look up (REAL, LIVE api.github.com call) ---
immediately after click:
  lookupBtn.disabled: true
  lookupStatus.textContent: "Looking up..."
  userCard has hidden class: true
after the real, live request resolved:
  lookupBtn.disabled: false
  lookupStatus.textContent: "Error: GitHub returned 403"
  userCard has hidden class: true

--- clicking with an empty username (guard should stop it, no request made) ---
status unchanged by empty-input guard: true

--- everything else still independent ---
toggle still works, message hidden: false
```

And, separately, the real success-path rendering, run directly against
real data this same session captured, live, moments before the rate
limit above was reached:

```
using REAL data captured earlier this session via curl against api.github.com/users/octocat:
{
  "login": "octocat",
  "name": "The Octocat",
  "bio": null,
  "followers": 23858
}

rendered result:
userAvatar.src: https://avatars.githubusercontent.com/u/583231?v=4
userName.textContent: The Octocat
userBio.textContent: No bio provided.
userFollowers.textContent: 23858 followers
userCard hidden class present: false
```

Both real outcomes this feature can produce are now directly, honestly
confirmed — including the real `bio: null` case correctly falling back
to "No bio provided.," proven against genuine, live data, not a
fabricated example.

### Connection

This is the final piece — a real, complete round trip: a real request
leaves the page, a real server somewhere else on the internet answers
it, and this project honestly shows whatever real outcome actually
came back.

---

## Closing

**Connect the pieces.** One real sequence, start to finish, through
every real mechanism this lesson built: the user types "octocat" and
presses Enter. This lesson's final unit's own `keydown` listener
(reusing Lesson 6's pattern) detects `e.key === 'Enter'` and calls
`lookupUser()` directly.

`lookupUser` begins, synchronously: `username` is read and trimmed
(this lesson's second unit); the empty-check guard doesn't trigger;
`lookupBtn.disabled = true`, `lookupStatus.textContent = 'Looking
up...'`, and `userCard.classList.add('hidden')` all happen instantly,
before any real network activity has even started.

`try` begins. `await fetch(`...`)` (this lesson's second unit) sends a
real HTTP request to GitHub's real, live server and pauses here,
genuinely, until a real response comes back — the rest of the page
staying fully responsive the entire time. When it resolves, `.ok`
(this lesson's third unit) is checked: on a real success, execution
continues past the `if`; on a real failure — as this exact session
genuinely experienced — a real error is thrown, and control jumps
directly to `catch`.

On the real success path: `await response.json()` (this lesson's
fourth unit) parses the real body into `data`; five real lines (this
lesson's final unit) read real fields off it — `data.avatar_url`,
`data.name` or its real fallback, `data.bio` or its real fallback,
`data.followers` — and write them onto the real page, then reveal the
card by removing its `hidden` class. On the real failure path instead:
`catch (error)` receives the real, thrown `Error`, and
`lookupStatus.textContent` is set to a real, specific, honest message
naming exactly what went wrong. Either way, `finally` runs once,
guaranteed: `lookupBtn.disabled = false` — ready for the very next
real request, whatever it turns out to be.
