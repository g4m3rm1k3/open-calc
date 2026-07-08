# Backend Lab — Lesson 6 — Controllers

## What You Will Build

`usersController` — a single object grouping every users-related handler
together, replacing a growing pile of loose, awkwardly-named global
functions with one clearly-owned namespace per resource.

---

## What You Need to Know First

Lesson 5's `routes` list — now `{ pattern, method, handler }` entries,
matched with a method check before `matchRoute` even runs — and its
three real handlers, `getAllUsers`/`getUserById`/`createUser`, which
currently exist side by side as separate top-level functions.

---

## Step 1 — Feel the Naming Problem

A real backend has more than one kind of resource. Add orders alongside
users, the way you already know how:

```javascript
function getAllUsers(request) { /* ... */ }
function getUserById(request) { /* ... */ }
function createUser(request) { /* ... */ }

function getAllOrders(request) { /* ... */ }
function getOrderById(request) { /* ... */ }
function createOrder(request) { /* ... */ }
```

Six functions already, for only two resources — and every name had to be
awkwardly prefixed (`getAllUsers`, not just `getAll`) purely to avoid
colliding with `getAllOrders`, since two top-level functions can never
share one name in the same file. A real backend with ten resources would
need this same prefixing dance thirty, forty times over, and every name
gets longer and clunkier the more resources exist — not because the
logic is complicated, but because there's nowhere for `getAll` to
"belong" to just users without saying so in the name itself, every time.

**SE lens — the naming collision is a symptom, not the actual disease.**
The real problem sits one level deeper than "these two names clash":
this project's code has no organization at all beyond "every function
lives loose at the top of the file." A real backend doesn't add just
`getAll`/`getById`/`create` per resource — a real `users` resource alone
might eventually need registration, password reset, login, profile
updates, avatar upload, and permission checks: nine or ten related
pieces of behavior, none of which belong with `orders` or `products` in
any way, but nothing in this project's current shape keeps them
*together* either. Awkward prefixed names are the first crack to show,
but the deeper problem is that this codebase has lost any sense of what
belongs with what. This is worth carrying forward as the real
motivation for everything this lesson builds — naming is what makes the
pain visible first, but organization is what's actually missing.

**SE lens — naming the collision itself, precisely.** This is a
**namespace collision** problem: every top-level function shares one
single, flat namespace — the same "everything visible everywhere"
property that made `handleRequest` a bottleneck back in lesson 2, just
showing up in a new place now: names, instead of routing logic.

**CS lens — scope, named formally, since this is the exact problem it
describes.** Every function this project has written so far — `getUsers`,
`matchRoute`, `createUser`, all of it — has lived in the same **global
scope**: the outermost region of a program, where every name is visible
to every other piece of code, everywhere, all at once. Scope, in
general, is the answer to "from which parts of the code can this name
actually be seen and used?" — some names are visible everywhere (global
scope); others only exist inside the one function or block that
declared them (this project's `var` variables inside a function body
have already been working this way, just never named). The naming
collision above is a *global scope* problem specifically: two functions
both trying to occupy the one shared namespace every top-level
declaration lives in.

**SE lens — organized by verb, when it should be organized by noun.**
Look at the shape of the six function names above: `getAll`, `getById`,
`create` — repeated twice, once per resource. This code is currently
organized around *actions* (verbs), with the resource each action
belongs to bolted onto the front of the name. Real backends tend to
grow better when organized the other way around: by the *thing being
modeled* (a noun — users, orders, products) first, with the actions
available on that thing living inside it. Organizing code around the
real-world concepts it models, rather than around the individual
operations performed on them, is called **domain decomposition** — a
"users" section of the codebase, not a "getAll" section that happens to
touch six different kinds of things.

**SE lens — discoverability, a practical reason organization matters.**
Imagine a new person joining this project, asked to fix a bug in how a
user's profile updates. Right now, that means scanning every loose
top-level function in the file, hoping to recognize the right one by
name alone. A `usersController` (Step 2) turns that search into one
obvious first guess. **Discoverability** — how easily a piece of
behavior can be *found* by someone who doesn't already know exactly
where it lives — is a real, practical payoff of good organization, and
often the first one anyone actually notices, before performance or
correctness ever enter into it.

---

## Step 2 — Objects Already Solve This

Lesson 2 already established that a function can be stored as a value
inside an object. That fact directly solves the naming problem too:

```javascript
var usersController = {
  getAll: function (request) { /* ... */ },
  getById: function (request) { /* ... */ },
  create: function (request) { /* ... */ },
};

var ordersController = {
  getAll: function (request) { /* ... */ },
  getById: function (request) { /* ... */ },
  create: function (request) { /* ... */ },
};
```

**Walkthrough — the same short name, twice, with no collision.**
`usersController.getAll` and `ordersController.getAll` are two
completely different functions that happen to share the name `getAll` —
and that's fine, because they live *inside* two different objects.
`usersController` and `ordersController` are each a **namespace**: a
container that lets the same short, natural name (`getAll`, `getById`,
`create`) mean something specific and unambiguous, as long as you say
which container you mean first. This is the exact same idea a folder on
a filesystem solves for files — `photos/vacation.jpg` and
`documents/vacation.jpg` can both exist, because the folder is part of
what makes each path unique.

**CS lens — a flat name became a hierarchical one.** `getAllUsers` was a
single, flat name — one word (however long), one level. `usersController.getAll`
has two levels: a container name, then a name inside it. Organizing
names into nested levels like this, where an outer name groups a set of
inner ones, is called a **hierarchical namespace** — the same structural
idea behind folders on a filesystem (already named above), domain names
(`mail.example.com` — `mail` inside `example.com`), and how most
languages organize packages or modules. Two levels solves this lesson's
problem completely; the same idea would keep working with three or more
if this project ever needed it.

**PL lens — method versus function, a distinction worth having exactly
right, now that both exist side by side.** Every function this project
wrote before this lesson — `matchRoute`, `getUsers`, `createUser` — is a
**function**: a value, callable on its own, with no particular object it
belongs to. `usersController.getAll` is a **method**: a function stored
as a property of an object, always reached *through* that object
(`usersController.getAll`, never just `getAll` on its own). Every method
is a function; not every function is a method — the difference is purely
about whether it's reached through an object or referred to directly by
its own name.

**CS lens — a higher level of abstraction: thinking in resources, not
handlers.** Before this step, thinking about "the code" meant holding six
separate, individually-named functions in your head. After it, thinking
about "the code" means holding two things in your head: `usersController`
and `ordersController` — each one representing everything that can
happen to that resource, without needing to enumerate its methods to
refer to it as a whole. This is the same **abstraction** idea lesson 2
introduced for the router, applied one level higher: the unit of thought
shifted from "individual handler" to "the whole controller," the same
way lesson 2 shifted it from "individual `if` branch" to "the whole
dispatch table."

**CS lens — a controller, defined precisely.** A **controller** is an
object that groups every handler for one resource together, under
consistently-named methods (`getAll`, `getById`, `create`, and later
`update`, `delete`). It isn't a new mechanism — it's the dispatch-table
idea from lesson 2, reused for organization instead of routing: `routes`
groups handlers *by path pattern*; a controller groups them *by resource*.

**CS lens — encapsulation, in the sense of hiding, not just bundling.**
Lesson 1 already used "encapsulation" for bundling related fields into
one object. Here it means something slightly stronger: `usersController`
can grow *internal* helper functions later — private validation logic,
caching, logging — that live inside its implementation without the
router ever knowing they exist. The router only ever sees
`usersController.getAll` as one callable thing; everything behind that
one name is free to change, grow, or reorganize, invisibly. Hiding
implementation detail behind a stable, named surface is what
encapsulation really buys — bundling data (lesson 1) is the simplest
case of it, not the whole idea.

**SE lens — cohesion, the natural companion to lesson 2's decoupling.**
Lesson 2 named **decoupling** — code that doesn't depend on unrelated
implementation details. **Cohesion** asks the opposite-facing question:
do the things grouped *together* actually belong together? Every method
inside `usersController` operates on the same resource, for the same
reason — high cohesion. A controller that mixed in unrelated methods
about orders or products, just because it was convenient at the time,
would be low cohesion: things grouped together that don't actually share
a reason to be. Good structure generally wants both properties at once:
high cohesion within a group, low coupling between groups.

**SE lens — locality, cohesion's practical payoff during actual work.**
Cohesion describes a *property* of the code's structure; **locality**
describes what that property buys you while actually working: fixing a
bug in how a user is created means reading and changing code that's all
sitting right next to itself, inside `usersController`, rather than
hunting across scattered, unrelated parts of the file. High cohesion is
what makes locality possible — the two ideas are closely related, but
one is a structural property of the code, the other is the lived
experience of working inside it.

**SE lens — uniform structure, once, learned everywhere.** `usersController`
and `ordersController` share the identical shape: `getAll`, `getById`,
`create`, always the same three names, always meaning the same thing.
Once a developer understands how *one* controller works, every other
controller in this project is already familiar, without needing to be
learned separately. Frameworks lean on this heavily — Rails, Django, and
similar tools all but require every controller to follow the same
predictable shape, precisely so learning one teaches you the rest.

---

## Step 3 — Wire Controllers Into the Router

```javascript
var routes = [
  { pattern: "/users", method: "GET", handler: usersController.getAll },
  { pattern: "/users/:id", method: "GET", handler: usersController.getById },
  { pattern: "/users", method: "POST", handler: usersController.create },
];

function handleRequest(request) {
  for (var i = 0; i < routes.length; i = i + 1) {
    var route = routes[i];
    if (route.method !== request.method) continue;
    var params = matchRoute(route.pattern, request.path);
    if (params !== null) {
      request.params = params;
      return route.handler(request);
    }
  }
  return { status: 404, body: "Not found" };
}
```

**Walkthrough — `usersController.getAll`, not `usersController.getAll()`.**
Exactly the same lesson-2 rule, applied through one more layer of dots:
reading a property that happens to hold a function, without calling it,
gives you the function itself as a value — ready to be stored inside
`routes` and called later, once, per matching request. Writing
`usersController.getAll()` here would make the identical mistake lesson
2 already named: calling it immediately, once, while building the list,
instead of handing the router a reference to call later. `usersController.getAll`
is itself a small, familiar example of something already met: reading a
property off an object (dot notation, lesson 1) evaluates to a value —
the exact same thing `routes[i]` did in lesson 2's loop, just reached
through a name instead of an index.

**SE lens — a stable interface, hiding a completely rewritten
implementation.** From the router's point of view, absolutely nothing
changed between lesson 5 and this lesson: `route.handler` is still a
function taking a `request`, still returning a response, called exactly
the same way. Underneath that unchanged surface, the *entire*
implementation was rebuilt — six loose functions became two controller
objects. This is one of software engineering's most valuable properties,
worth seeing concretely rather than just described: an **interface**
(lesson 1) can stay completely stable while its **implementation**
changes entirely, as long as the agreed shape never breaks. Nothing
about this refactor could break the router, because the router was
never written to depend on *how* a handler was organized — only on what
shape calling one produces.

**SE lens — identity versus organization: what actually changed here.**
It's worth being precise about what this lesson did and didn't do.
`usersController.getAll` and old `getAllUsers` are, at runtime, doing
identical work — no behavior changed, no response is any different than
before. What changed is purely *where the function lives* and *what it's
reached through* — organization, not identity. It's easy to conflate
"we refactored this" with "we changed what it does"; this lesson is a
clean example of the former without any of the latter, worth
recognizing as its own category of change.

**Connect to the real world.** "Controller" isn't this project's own
invented term — it's the literal, industry-standard name for exactly
this role in the **MVC (Model-View-Controller)** pattern used by Rails,
Django, ASP.NET MVC, and Spring: a controller receives a request and
decides what should happen, without itself being the router or the
underlying data. Ruby on Rails even names its files this way directly —
`users_controller.rb` groups a resource's actions under one class, the
same shape `usersController` builds here by hand, with an object instead
of a class. Rails doesn't require this shape because the language
forces it — it's **convention over configuration** (lesson 1) again, at
a bigger scale this time: every controller in a Rails app follows the
same predictable structure because the framework's authors decided that
convention, not because any technical constraint demands it.

---

## Connect the Pieces

```
server.js   usersController — { getAll, getById, create }, every users
            handler grouped under one namespace object
            ordersController — same shape, same method names, zero
            collision with usersController's identically-named methods
            routes — { pattern, method, handler } entries, handler is a
            reference into a controller, never a call
            handleRequest — router only; matches, then delegates
```

---

## What Breaks Without This

**A duplicate key inside one controller object** (accidentally writing
`getAll` twice inside the same `usersController` literal): JavaScript
doesn't error on this — it silently keeps only the *last* one written,
discarding the first entirely. If two people (or two edits, weeks apart)
both add a `getAll` to the same controller without noticing the other,
the first one simply vanishes with no warning, which is exactly why
controller objects should stay small and reviewed as a whole, not grown
by scattered, disconnected edits.

**Forgetting the method check in the router** (matching only on
`pattern`, not `route.method`, undoing lesson 5's fix): `GET /users` and
`POST /users` share a pattern; without checking method too, whichever
route happens to be listed first would silently intercept *both* — the
exact same bug lesson 5 fixed by making `method` a first-class field on
every route entry. Refactoring `handleRequest` to delegate into
controllers doesn't get a pass on re-breaking something already fixed —
the method check has to survive the refactor unchanged.

---

## Definition of Done

- [ ] `usersController` and `ordersController` both have a `getAll`, with no naming collision
- [ ] The router matches on both `pattern` and `method` before calling a handler
- [ ] `/users`, `/users/:id`, and `POST /users` all still work exactly as they did before the refactor
- [ ] You can explain what a namespace collision is, using two same-named top-level functions as the example
- [ ] You can explain why organization, not just naming, is the deeper problem this lesson solves
- [ ] You can explain what scope means, and why the collision above is specifically a global scope problem
- [ ] You can explain the difference between a function and a method
- [ ] You can explain what domain decomposition means and how it differs from organizing by verb
- [ ] You can explain what discoverability means and why it's a practical reason to organize code
- [ ] You can explain what a hierarchical namespace is, using usersController.getAll as the example
- [ ] You can explain encapsulation as hiding, not just bundling, and how it differs from lesson 1's use of the term
- [ ] You can explain cohesion and how it relates to (but differs from) lesson 2's decoupling, and how locality relates to cohesion
- [ ] You can explain why `usersController.getAll` (no parentheses) is required inside the `routes` list, not `usersController.getAll()`
- [ ] You can explain what happens if a controller object literal accidentally defines the same key twice
- [ ] You can explain how this lesson kept the router's interface stable while completely changing the implementation underneath it
- [ ] You can explain the difference between changing a system's organization and changing its behavior, using this lesson's refactor as the example

---

*Next: every handler that needs to log a request, or check for
authentication, would have to repeat that same check itself, by hand, in
every single controller method. Middleware teaches a way to run shared
logic before a handler runs, once, without copying it into every
controller.*
