# Lesson 55: Interface Design

**What you will build.** `create_order(customer_id, is_gift=False,
is_priority=False)` looks like a perfectly ordinary function — until a
caller, meaning to mark an order as priority, writes `create_order(17,
True)` and silently marks it as a gift instead. Nothing crashes; nothing
warns anyone. This lesson closes the gap not by renaming anything, but
by marking `is_gift` and `is_priority` as keyword-only, so the exact
same mistaken call fails loudly, immediately, instead of succeeding
quietly with the wrong meaning. The transferable problem: Lessons 53 and
54 both protected what a module or object hides; this lesson is about
the part that's deliberately exposed — and a genuinely well-hidden
implementation can still sit behind an interface that's easy to call
incorrectly without any warning at all.

**What you need to know first.** Information Hiding (Lesson 53) — the
distinction between a module's internals and its public promise; this
lesson is about designing that public promise well, not just deciding
where the boundary sits. Encapsulation (Lesson 54) — a getter that looks
safe but isn't; this lesson's failure has the same shape, a call site
that looks correct but isn't, for a different underlying reason.

**Pipeline diagram.** Lesson 12 established the full sequence every
system in this curriculum is placed against:

```text
Problem
  ↓
Requirements
  ↓
Domain model
  ↓
Specification
  ↓
Architecture
  ↓
Design
  ↓
Implementation
  ↓
Verification
  ↓
Integration
  ↓
Release
  ↓
Deployment
  ↓
Operations
  ↓
Observation
  ↓
Change
  ↓
Migration
  ↓
Evolution
  ↓
Retirement
```

Still the **Design** stage. Carried through: the last two lessons
protected what's hidden; this lesson protects what's exposed, from a
different direction — not from being reached incorrectly, but from being
called incorrectly by someone using it exactly as intended, through its
own front door.

**Terms introduced in this lesson.** One line each.

- **interface** — the specific set of names, parameters, and call shapes
  a piece of code exposes for other code to use, considered apart from
  how it's implemented internally. It's distinguished from Lesson 53's
  information hiding by direction: hiding is about what's kept out of
  view; interface design is about shaping what's deliberately left in
  view so it's actually good to depend on.
- **boolean trap** — a parameter shape where a bare `True` or `False`
  passed positionally gives a reader, at the call site itself, no way to
  tell which meaning it's supplying. It's worth naming because a boolean
  parameter reads perfectly clearly inside the function's own body — the
  ambiguity only appears at the call site, which is exactly what makes
  it easy to introduce without the person writing the function ever
  noticing.
- **keyword-only parameter** — a function parameter that can only be
  supplied by name, never positionally, marked in Python by a bare `*`
  placed in the parameter list before it. It's the specific tool this
  lesson uses to turn an ambiguous call from something that silently
  succeeds with the wrong meaning into something that fails loudly and
  immediately instead.

**Objects and methods used.**

- **`*` as a keyword-only marker in a function definition**
  - *What it is:* special syntax inside a function's parameter list —
    not an operator here, a marker — that changes how every parameter
    after it can be supplied.
  - *Implementation:* `def create_order(customer_id, *, is_gift=False,
    is_priority=False):` — everything before the bare `*` can be passed
    positionally or by name as usual; everything after it, `is_gift` and
    `is_priority`, can only ever be supplied by name. Calling
    `create_order(17, True)` — attempting to pass `True` positionally for
    a keyword-only parameter — raises `TypeError` immediately, before
    the function's own body ever runs.
  - *Its use:* this lesson uses it to make an ambiguous call
    structurally impossible to write by accident — a caller is forced to
    write `is_priority=True` explicitly, which both fixes the ambiguity
    and makes the call self-documenting at the same time.

## Concept Unit: Making the Wrong Call Impossible to Write by Accident

### The Problem

`create_order` takes two boolean flags, `is_gift` and `is_priority`,
both with default values, both usable positionally. A caller meaning to
mark an order as priority writes it the way any two-boolean function
invites being written — with the values in a row:

```python
def create_order(customer_id, is_gift=False, is_priority=False):
    return {"customer_id": customer_id, "is_gift": is_gift, "is_priority": is_priority}


order = create_order(17, True)
print("order:", order)
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Running it produces:

```
order: {'customer_id': 17, 'is_gift': True, 'is_priority': False}
```

The caller meant `is_priority=True`. What they got was `is_gift=True`,
because `True`, passed positionally, fills whichever parameter comes
first — `is_gift`, not `is_priority` — and nothing about the call site
`create_order(17, True)` gives a reader, or the caller who wrote it, any
way to tell which meaning that `True` was supposed to carry. This is a
**boolean trap**: the function's own body is completely correct; the
call site is where the ambiguity lives, and it's invisible there in a
way it never would be inside the function.

### Project Change

- **Reference Source:** none — a from-scratch addition continuing this
  curriculum's own running `Order` example, not a port of an external
  reference codebase.
- **Files affected:** `order_lifecycle.py`, modified.
- **Change type:** refactor — `is_gift` and `is_priority` become
  keyword-only parameters.
- **Location:** `create_order`'s own parameter list.
- **Dependencies:** none — keyword-only parameters are core Python
  syntax, no import needed.

### The New Code

The smallest new piece is the bare `*` marker itself:

```python
def create_order(customer_id, *, is_gift=False, is_priority=False):
    ...
```

### The Updated Project

`create_order`'s body is unchanged; only its signature changes, moving
both booleans past the keyword-only marker:

```python
def create_order(customer_id, *, is_gift=False, is_priority=False):  # ← changed
    return {"customer_id": customer_id, "is_gift": is_gift, "is_priority": is_priority}
```

The function still does exactly what it did before — nothing about its
own logic changed. What changed is what Python will accept as a valid
call to it at all.

### Isolating the Concept: A Marker That Changes What a Call Site Can Say

The mechanism doing the real work above — a bare `*` in a parameter
list, forcing everything after it to be named — deserves to be seen on
its own. Here it is guarding a network connection function instead of
an order:

```python
def connect(host, port, *, use_ssl=False):
    return f"connecting to {host}:{port} (ssl={use_ssl})"


print(connect("example.com", 443, use_ssl=True))

try:
    connect("example.com", 443, True)
except TypeError as e:
    print("error:", e)
```

Running it produces:

```
connecting to example.com:443 (ssl=True)
error: connect() takes 2 positional arguments but 3 were given
```

This is exactly what `create_order`'s new signature is doing, isolated:
`connect("example.com", 443, use_ssl=True)`, naming `use_ssl` explicitly,
succeeds and reads unambiguously. `connect("example.com", 443, True)`,
attempting to pass the same value positionally, doesn't silently assign
it to some other parameter the way `create_order` once did — there is
no other positional parameter left to absorb it, because `*` closed that
door entirely, so Python refuses the call outright, naming exactly how
many positional arguments it actually accepts. This construct — a bare
`*` forcing every parameter after it to be supplied by name — is called
a **keyword-only parameter marker**. This throwaway example is now
discarded; `connect` does not appear anywhere else in this lesson or
this project again.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`def create_order(customer_id, *, is_gift=False, is_priority=False):`**
  — a function definition with three parameters, `customer_id`,
  `is_gift`, and `is_priority`, but four elements between the
  parentheses, because the bare `*` is not itself a parameter — it takes
  no name and accepts no value. It's a marker that changes the calling
  convention for every parameter written after it in the list.
- **`customer_id`** — the one parameter still positioned before the `*`,
  so it can still be supplied either positionally, `create_order(17,
  ...)`, or by name, `create_order(customer_id=17, ...)` — unchanged from
  before this lesson's fix.
- **`is_gift=False, is_priority=False`** — two parameters positioned
  after the `*`, each with a default value as before, but now reachable
  only by writing their names explicitly at the call site. Their
  behavior inside the function body — what each one means, what it
  controls — is completely unchanged; only how a caller is allowed to
  supply them changed.

### CS Lens

A keyword-only parameter is a small, specific instance of a much larger
idea: **using a type system, or a language's own syntax, to make an
entire category of mistake impossible to express**, rather than trusting
every caller to remember a convention. This is the same underlying
strategy as Lesson 45's `Enum` — the fix wasn't a smarter runtime check
catching a bad `OrderStatus` value, it was removing the ability to write
one at all — applied here to a call site's shape instead of a field's
value. A type system that refuses to compile `f(true)` against a
function expecting a named `enabled:` argument is enforcing the
identical discipline, at compile time instead of call time.

Also recognized in: named-argument-only APIs in languages that support
them, builder patterns that force a value to be set through a named
method (`.withTimeout(30)`) instead of a positional constructor
argument, and linters that flag any function with more than one or two
boolean parameters as a design smell worth reconsidering before it ships.

### SE Lens

The principle is **design a call site to be self-documenting, not just
a working body** — the alternative that was rejected, adding a comment
above the risky call (`# is_priority, not is_gift`) or a docstring
warning about parameter order, depends entirely on every future caller
actually reading it before writing their own call, which is precisely
the same "depends on everyone remembering" weakness every trust-based
fix in this curriculum has already been shown failing in practice.
Keyword-only parameters remove the need to remember anything, the same
way every other fix in this domain has: the mistake isn't documented
against, it's made unwritable.

The real cost: every existing call to `create_order` that supplied
`is_gift` or `is_priority` positionally now breaks immediately with a
`TypeError`, which is exactly the trade this lesson is making on
purpose — a loud failure at every old call site, forcing each one to be
fixed and made unambiguous, instead of leaving even one of them free to
keep silently meaning the wrong thing.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running the fixed `create_order`, against the exact call that silently
went wrong before, and the corrected version of it:

```python
try:
    order = create_order(17, True)
except TypeError as e:
    print("TypeError:", e)

order = create_order(17, is_priority=True)
print("order:", order)
```

The real output:

```
TypeError: create_order() takes 1 positional argument but 2 were given
order: {'customer_id': 17, 'is_gift': False, 'is_priority': True}
```

The exact call that silently produced `is_gift=True` before now fails
immediately, before the function body ever runs — there's no chance for
the wrong meaning to be assigned at all. The corrected call, naming
`is_priority=True` explicitly, produces the order the very first caller
actually meant to create, all along.

### Connecting Back

Where Lesson 54 protected an object's data from being mutated through a
method that looked safer than it was, this lesson protects a function's
own meaning from being supplied through a call that looked correct than
it was — both are the same underlying failure, a gap between what
something looks like it guarantees and what it actually guarantees,
closed by removing the gap instead of documenting around it.

## Connect the Pieces

`create_order(17, True)` was written twice in this lesson, meaning the
identical thing both times: mark this order as priority. First, against
the original signature: it silently produced `is_gift=True`, the wrong
order entirely, with nothing anywhere signaling the mistake. Second,
against the keyword-only signature: the identical call failed
immediately with `TypeError`, and the corrected version,
`create_order(17, is_priority=True)`, produced exactly the order the
caller meant — the fix didn't make the function harder to use correctly,
it made it impossible to use incorrectly by accident.

## What Breaks Without This

Keyword-only parameters close the *positional* ambiguity. They do
nothing to stop a caller from supplying the *wrong* keyword on purpose,
or by an equally understandable mistake in the other direction:

```python
order = create_order(17, is_gift=True)
print("order, caller still meant priority but wrote the wrong keyword:", order)
```

Run for real, this is what comes back:

```
order, caller still meant priority but wrote the wrong keyword: {'customer_id': 17, 'is_gift': True, 'is_priority': False}
```

No error at all — `is_gift=True` is a perfectly valid, unambiguous
keyword argument; Python has no way to know it doesn't match what the
caller actually intended. Keyword-only parameters solve exactly one
problem: a positional value landing in the wrong parameter without
anyone noticing. They don't solve, and were never claimed to solve, a
caller correctly using the interface's own syntax to say something they
didn't mean to say — that's a naming and domain-language problem, the
kind Lesson 51 already covered, not an interface-shape problem this
lesson's fix reaches.

## Exercises

1. `Customer.update_shipping_address` from Lesson 54 already used
   keyword arguments with defaults, but not a `*` marker — its `city`
   and `street` parameters can still be passed positionally. Add the
   marker, and prove with real output that `update_shipping_address(17,
   "Shelbyville")` now fails loudly instead of being accepted.
2. Write a `create_order` variant that avoids the boolean trap entirely
   by replacing `is_gift`/`is_priority` with a single keyword-only
   `tags: set` parameter (`tags={"gift", "priority"}`). Compare, in two
   sentences, which interface is easier to extend later with a third
   flag, and which is easier to read at an existing call site.
3. Find a function in this curriculum's own earlier lessons — `Order.
   __init__`, `add_line`, or another — that takes two or more parameters
   of the same type in a row. Decide whether it has a real boolean-trap-
   style ambiguity risk, and justify your answer.

## Definition of Done

- [ ] `create_order`'s `is_gift` and `is_priority` parameters are
      keyword-only, marked with a bare `*` before them.
- [ ] The Problem section's silent misassignment has been reproduced for
      real, against the *original* signature, before you apply the fix.
- [ ] The "Run It" scenario above runs against your own fixed file and
      produces output matching what's pasted here.
- [ ] The "What Breaks Without This" wrong-keyword scenario has been run
      against your own file, not just read, and you can state in one
      sentence why keyword-only parameters don't catch it.
- [ ] Commit, with a message stating *why*: something like `interface
      design: make is_gift and is_priority keyword-only so a positional
      True can no longer silently land on the wrong flag`, not `add star
      to signature`.

Up next: Lesson 56, Dependency — naming, precisely, what it actually
means for one piece of code to depend on another, before this domain
spends its next several lessons on how to manage that dependency well.
