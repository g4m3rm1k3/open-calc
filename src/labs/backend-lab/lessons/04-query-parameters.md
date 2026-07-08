# Backend Lab — Lesson 4 — Query Parameters

## What You Will Build

`/users?limit=1` — a way to ask questions about a request that live
outside the path entirely, using the part of a URL after the `?`.

---

## What You Need to Know First

Lesson 3's `matchRoute` and `request.params` — path segments captured
*inside* the URL's path itself, like `/users/:id`. Query parameters are a
different mechanism, for a different kind of question.

---

## Step 1 — A Question the Path Can't Answer

`/users/1` asks for *one specific* user, identified by id — the path
itself names exactly which resource is wanted. But "give me only the
first 1 result" isn't naming a different resource at all — it's the
*same* `/users` collection, with an instruction about how much of it to
return. Stuffing that into the path (`/users/limit/1`? `/users-limited-to-1`?)
would confuse "which resource" with "how to shape the response" — two
genuinely different questions that deserve two genuinely different
mechanisms.

**CS lens — resource vs. representation, a distinction formalized by
REST but useful anywhere one system represents another.**
A **resource** is the thing that exists on the server, independent of any
one request — "the collection of all users" is one resource, referred to
by one address, `/users`. A **representation** is the specific *version*
of that resource a particular response hands back — every user, the
first user, the first three users sorted by name — all different
representations of the exact same underlying resource. `/users?limit=1`
is not a different resource from `/users` — it's the same resource,
asking for a smaller representation of it. This distinction is the
entire reason query parameters exist as a separate mechanism from the
path: the path names *what*, the query string shapes *how much of it,
and how*.

**SE lens — matching the mechanism to the actual question being asked.**
Path segments answer "which resource" (`/users/1` = user number 1).
**Query parameters** answer "how should this response be shaped" —
filtering, limiting, sorting, searching — without changing which
resource is being requested at all. Real HTTP has always kept these
separate: everything after a `?` in a URL is the **query string**, and it
was never part of routing in the first place.

---

## Step 2 — What a Query String Actually Looks Like

A full URL: `/users?limit=1&sort=name`. Everything before the `?` is the
path (`/users` — already familiar). Everything after it is the **query
string**: `limit=1&sort=name` — pairs of `key=value`, separated by `&`
when there's more than one.

**CS lens — the path identifies, the query string describes. This is
metadata, not data.** `/users` names the thing being asked for. `limit=1`
says nothing about *which* users — it's an instruction about how to
handle the request, attached alongside it. **Metadata**, in general,
means "information describing other information" — a photo's file size
and timestamp are metadata *about* the photo, not the photo itself; a
database table's list of column names and types is metadata *about* the
data the table holds. Here, specifically, `limit=1` is metadata about
the *request*: information describing how to handle it, rather than
information the request is fundamentally about. The idea shows up
everywhere outside HTTP too: a SQL query's `LIMIT 5` clause doesn't
change which table is being read, only how many of its rows come back;
opening a file in `READ_ONLY` mode doesn't change which file is opened,
only what's allowed to happen to it once it is. In every one of these
cases, one piece names the target, a separate piece configures how to
handle it — the same split a query string makes explicit in a URL.

This project's `request` object already carries `path`; from this lesson
on, it also carries `query` — a plain object, already parsed, so
`request.query.limit` reads `"1"` directly without your code ever having
to split a raw string apart itself.

**CS lens — parsing and interpretation are two different jobs, done by
two different parts of the system.** Turning the raw text `limit=1` into
a real object, `{ limit: "1" }`, is called **parsing** — reading a
specific, known format and producing structured data from it. Deciding
what that data actually *means* — "`limit` should cap how many results
come back" — is a completely separate job, called **interpretation**.
Parsing doesn't know or care what `limit` means; it would just as
happily parse `sort=name` or `nonsense=42` into the identical shape of
object. Interpretation is where meaning gets attached, and it's the
*handler's* job, not the parser's.

```
"?limit=1"  --parsing-->  { limit: "1" }  --interpretation-->  "use 1 as the maximum results"
   (raw text)              (structured data)                    (meaning, decided by the handler)
```

**SE lens — separation of concerns, named precisely, at the exact
boundary where it happens.** This project's host environment does the
parsing (turning `?limit=1` into `request.query.limit`); your
`handleRequest` code does the interpreting (deciding a `limit` field
means "cap the array length"). This is **separation of concerns**: each
part of the system owns exactly one job, and neither has to know how the
other does its own. The parsing layer would work identically no matter
what your handler chose to do with the parsed result; your handler would
work identically no matter how the raw string got parsed, as long as the
shape it receives stays the same. This is precisely the same principle
lesson 2 introduced between the router (matching) and a handler (acting)
— reappearing here at a new boundary: infrastructure versus application
logic.

**PL lens — a deliberate design choice, made explicit.** A real HTTP
server does have to write that parsing step itself — split on `&`, then
split each piece on `=`. This project skips reproducing that step, the
same way it skipped writing a raw TCP socket listener to receive the
request in the first place: the point of this lesson is the
*interpretation* half, not re-teaching string splitting a second time
right after lesson 3 already covered it once. `request.query` arriving
pre-parsed is an honest simplification, named here rather than left for
you to wonder about.

**SE lens — this pre-parsed shape is an API contract.** `request.query`
being "a plain object of string values, one per query key" is a promise
this lab makes to every handler you'll ever write against it — and a
promise your handler implicitly relies on every time it reads
`request.query.limit`. A contract like this is what lets your code and
the lab's parsing code be written, and change, independently: as long as
both sides honor the agreed shape, neither needs to know how the other
is actually implemented.

---

## Step 3 — Read a Query Parameter

```javascript
function getAllUsers(request) {
  var allUsers = [{ id: 1, name: "Mike" }, { id: 2, name: "Sam" }, { id: 3, name: "Alex" }];

  var limit = request.query.limit;
  if (limit) {
    return { status: 200, body: allUsers.slice(0, Number(limit)) };
  }
  return { status: 200, body: allUsers };
}
```

Send `/users` — all three users. Send `/users?limit=1` — just the first.
Send `/users?limit=2` — the first two.

**CS lens — optional input, and the two valid states a handler must
plan for.** A query parameter is **optional**: a caller may include
`?limit=1`, or leave it off entirely, and both are completely normal,
valid requests — not an error case to special-case around, but a real
fork every handler that reads a query parameter has to plan for from the
start. `if (limit)` is that fork, made explicit: one branch for "the
caller specified this," one branch for "the caller didn't."

**Walkthrough — `if (limit)`, and the specific JavaScript rule it relies
on.** When a request has no `?limit=...` at all, `request.query.limit` is
`undefined` — a real, distinct "nothing here" value, the exact one
lesson 2's `if (handler)` already relied on. `if (limit)` works because
JavaScript converts any value used as a yes/no condition into `true` or
`false` using a specific, fixed rule called **truthiness**: `undefined`,
`""` (empty string), `0`, and a small handful of other values are
**falsy**; everything else is **truthy**. `if (limit)` reads naturally
as "only limit the results if the caller actually asked for a limit" —
but it is worth knowing precisely *which* rule makes that read correct,
since truthiness has real, sharp edges, covered next.

**SE lens — the "missing" branch is a default, and defaults are a real
design decision, not a fallback bolted on.** Returning `allUsers`
untouched when no limit was given isn't just "doing nothing" — it's
choosing a **default behavior**: what should happen when the caller
didn't say. Every configurable system makes this same kind of choice
somewhere — a browser has a default font size when a page doesn't
specify one; an unset network request has a default timeout; this
handler's default for "how many users" is "every one of them." Naming it
as a deliberate default, rather than an accident of the code's shape,
matters because it's the kind of decision a real API's documentation has
to state explicitly for callers to rely on.

**PL lens — `Number(limit)`, and why it's needed at all.** Every query
parameter arrives as a **string**, even `"1"` — because a query string is,
itself, just text; `request.query` parses the *shape* (splitting on `&`
and `=`) but doesn't guess at what each value is supposed to *mean*.
`Number("1")` converts the string `"1"` into the actual number `1`.

**CS lens — data transformation, a pattern much bigger than this one
line.** `"1"` becoming `1` is one small example of a much larger, constant
fact about networked software: data crossing any boundary between
systems almost always needs to be **transformed** from the shape it
arrived in into the shape the receiving code actually needs — text into
numbers, JSON into objects, raw bytes into dates, form fields into
booleans. `Number(limit)` is this project's first concrete example; it
will not be the last.

**Walkthrough — what `Number(...)` actually does with different inputs,
verified, not assumed.** `Number("1")` is `1`. `Number("1.5")` is `1.5`
— a real, valid non-integer number, which `.slice` will accept without
complaint (covered below). `Number("")` is `0` — an empty string
converts to zero, not to "nothing," which matters for the empty-value
case covered next. `Number("abc")` is `NaN` ("Not a Number" — a real,
specific value JavaScript uses to represent "this conversion failed"),
which becomes important in a moment too.

**CS lens — conversion succeeding is not the same question as the result
being sensible.** `Number(limit)` answers one narrow question: "can this
text be read as a number at all?" It does **not** answer "is this a
sensible limit?" `Number("1")` is `1` — converts fine, and is a
perfectly sensible limit. But `Number("-5")` is `-5` — converts
completely successfully, and is *nonsense* as a limit (negative results
don't mean anything here). **Conversion** (can this be turned into the
right data type) and **validation** (is this value actually acceptable,
given what it will be used for) are two different questions, answered at
two different stages — this lesson has only handled the first one.
`?limit=-5` will `.slice(0, -5)` without complaint right now — a
negative `end` argument tells `.slice` to count backward from the end of
the array instead of throwing, which for a 3-item array produces an
empty result, silently. Nothing about "give me negative five results"
was ever sensible, but nothing signals that anything went wrong either.
This exact gap — a value that converts cleanly but still isn't valid —
is precisely what the next lesson's validation step exists to close.

**CS lens — `.slice(0, n)`, taking the first n items, without changing
the original.** `.slice(start, end)` returns a **new** array containing
only the elements from index `start` up to (but not including) index
`end` — `allUsers` itself is completely untouched afterward; `.slice`
reads, it never modifies what it was called on. This "returns something
new, changes nothing in place" behavior is called **non-mutating**. The
reason this matters isn't about *future* requests here — lesson 1's
"whole file re-runs fresh every time" design already means `allUsers` is
rebuilt from scratch on the very next request regardless, mutated or
not. The reason non-mutation matters is narrower, and more universal:
*within this one request*, `allUsers` might still be needed, untouched,
by other code after `.slice` runs — a later `?search=` stage (Step 4),
or a log line printing the full original count. A mutating version of
`.slice` would make `allUsers` unreliable to read from the moment
anything else touched it, even inside a single request — non-mutating
operations are what make it safe to keep referring to `allUsers` by name
after narrowing a copy of it, at any point downstream, in any program.

---

## Step 4 — More Than One Parameter, Read the Same Way

```javascript
function getAllUsers(request) {
  var allUsers = [{ id: 1, name: "Mike" }, { id: 2, name: "Sam" }, { id: 3, name: "Alex" }];
  var results = allUsers;

  if (request.query.limit) {
    results = results.slice(0, Number(request.query.limit));
  }

  return { status: 200, body: results };
}
```

**Walkthrough — reassigning `results`, one step at a time.** `results`
starts as the full list, then gets narrowed by whichever query
parameters actually showed up on this particular request — each `if`
independently checks its own parameter, and only touches `results` if
that parameter was actually present.

**CS lens — a pipeline, one stage at a time.** `results` flows through a
sequence of independent narrowing steps — right now, just one (`limit`),
but the shape is built to grow: a future `?search=` stage would read
`results`, narrow it further, and hand the narrower version to whatever
comes after. This is the defining shape of a **pipeline**: each stage
*receives* a value, *transforms* it into something new, and *passes* that
new value forward — never reaching backward to redo an earlier stage,
never needing to know what stage comes next. Processing data as a
sequence of stages built exactly this way is the same shape behind Unix
commands piped together with `|`, and behind array-processing patterns in
many languages (this project's own repeated `.filter`/`.map`/`.slice`
calls, chained together, are already a small pipeline every time more
than one is used in a row).

**SE lens — composability, and why independent `if` blocks are the
whole point.** Each parameter's `if` block only reads its *own* query
key and only touches `results` — it never needs to know whether any
*other* parameter was also present. This means `?limit=1`,
`?search=mike`, and `?limit=1&search=mike` all work correctly with zero
special-casing for "what if both are present at once" — the two stages
simply run in sequence, each doing its own narrow job. Building complex,
combined behavior out of small, independent pieces that don't need to
know about each other is called **composability**, and it's a real,
valuable design property — a `handleRequest` where every combination of
query parameters needed its own explicit branch would grow exponentially
worse with every new parameter added; this shape doesn't.

**CS lens — declarative input: the client says *what*, the server
decides *how*.** The client never says "loop through the array and stop
after one item" — it says `limit=1`: a plain statement of the desired
*outcome*, leaving every detail of *how* to achieve it up to the server.
Input that describes a desired result, rather than a sequence of steps
to perform, is called **declarative**; `.slice(0, 1)` — the concrete
steps that actually produce that outcome — is the **imperative**
implementation the server chooses on the client's behalf. The client
never needs to know slicing is even involved.

**Connect to the real world.** This is precisely what a real API like
GitHub's does: `api.github.com/search/repositories?q=react&sort=stars&per_page=5`
reads `q`, `sort`, and `per_page` completely independently — any subset
of them can be present on any given request, in any order, and the
server just checks for each one it knows how to handle. Query parameters
like these are also called **configuration**, in the same sense a
compiler flag or a database engine's session option is configuration:
none of them change what algorithm runs, only how it behaves this one
time — the same collection, the same `getAllUsers` code path, shaped
differently by what arrived on the query string.

---

## Step 5 — Two Properties Every GET Request Already Has

Every request this lesson has sent shares two properties worth naming
now, while they're easy to observe directly.

**CS lens — statelessness.** Send `/users?limit=1`, then send plain
`/users` again — the second request returns all three users, completely
unaffected by the first. Nothing about the `limit=1` request was
*remembered* anywhere. Remember lesson 1's honest limitation — the whole
file re-runs, completely fresh, on every single request? That
simplification is exactly what makes statelessness impossible to ignore
in this lab: there is no *chance* for one request to leak into the next,
because nothing survives between them at all. A real server doesn't
restart your entire program between requests the way this lab does — but
it still treats each HTTP request as independent in exactly this same
way, by design, not by accident: every request carries everything the
server needs to answer it, and the server isn't supposed to lean on
memories of earlier ones. Lesson 1's simplification and real HTTP's
actual behavior arrive at the same observable result for a different
reason underneath — worth seeing now that the two connect.

**CS lens — idempotence.** Send `/users?limit=2` five times in a row —
the response is identical every time, and nothing about the world
changes because you sent it. A request that can be repeated any number
of times with the same effect as sending it once is called
**idempotent**. Every `GET` in this project so far has this property
(it will matter by contrast once `POST`, which is *not* idempotent,
arrives soon) — reading data, no matter how many times you ask, doesn't
change what there is to read.

---

## Connect the Pieces

```
server.js   URL string  -->  (this lab's host, not your code) parses
            everything after ? into request.query, a plain object of
            string key/value pairs
            request.query  -->  getAllUsers reads request.query.limit,
            interprets it as "maximum results," transforms it from a
            string to a number, and narrows results — one pipeline
            stage, ready for more to be added alongside it
```

---

## What Breaks Without This

**Forgetting `Number(...)`** doesn't actually break this specific case —
`.slice(0, "1")` still returns the first item correctly, because
`.slice`'s own arguments are automatically converted to numbers
internally, the same way `Number(...)` converts them explicitly. But
relying on that automatic, implicit conversion is fragile: it works by
coincidence for a value that already looks numeric, and gives no warning
when it doesn't (below). Being explicit with `Number(...)` costs nothing
and makes the conversion visible in the code, instead of hidden inside
whatever method happens to be called next.

**`?limit=abc`, a value that looks like a limit but isn't**: `Number("abc")`
is `NaN`. `.slice(0, NaN)` returns an **empty array** — not an error, not
a crash, just zero users, silently, for a request that looks perfectly
reasonable at a glance. This is the real gap this lesson leaves open:
*parsing* succeeded (`"abc"` became a string in `request.query.limit`
just fine), but nothing ever asked whether `"abc"` was actually a
*valid* limit. Parsing and validation are two different jobs — parsing
already happened, for free, before your handler ever ran; validation is
next lesson's job, precisely because this exact silent failure needs a
real fix.

**`?limit=0`**: the string `"0"` is not empty, so `if (limit)` treats it
as truthy and proceeds — `.slice(0, 0)` correctly returns zero users.
**`?limit=` (present, but empty)**: `request.query.limit` is `""`, an
empty string, which *is* falsy — so this is treated identically to no
limit being sent at all, returning every user. These two look similar at
a glance but land in opposite branches, entirely because of JavaScript's
specific truthiness rule for empty strings — worth testing directly
rather than assuming.

---

## Definition of Done

- [ ] `/users` with no query string still returns every user
- [ ] `/users?limit=1` returns exactly one user; `/users?limit=2` returns exactly two
- [ ] `/users?limit=abc` returns an empty array, not a crash — and you can explain why
- [ ] You can explain the difference between a resource and a representation of that resource
- [ ] You can explain the difference between what a path segment answers and what a query parameter answers
- [ ] You can explain why every query parameter arrives as a string, even ones that look numeric
- [ ] You can explain the difference between parsing a query string and interpreting what its values mean
- [ ] You can explain what truthiness is, and why `?limit=` and `?limit=0` land in different branches
- [ ] You can explain what makes a GET request stateless and idempotent
- [ ] You can explain why independent `if` blocks per query parameter are composable, and what would go wrong without that independence
- [ ] You can explain the difference between conversion and validation, using `?limit=-5` as an example that converts cleanly but isn't valid

---

*Next: everything so far only reads data. Creating something new — a
new user — means accepting a request body, and immediately runs into the
same gap `?limit=abc` just exposed: what happens when the caller sends
bad data that parses fine but isn't actually valid? Validation is next.*
