# Lesson 3: Scopes, Closures, and the LEGB Rule

**What you will build.** You'll trigger one of Python's most confusing
error messages on purpose — `UnboundLocalError`, from code that *looks*
like it should just read a variable — and find out exactly why Python
produces it. From there you'll build a nested function that reads a
variable from the function containing it, prove the exact order Python
searches through when resolving a name, and finally build a real
**closure**: a function that carries its own private, persistent state
across repeated calls, with nothing global anywhere. You'll use that
closure to give the project's `create_task` function real,
auto-incrementing task IDs. The transferable problem: every language
with nested functions or lambdas — C#'s local functions and lambda
captures, JavaScript's closures, Java's effectively-final captured
variables — has its own version of "which variable does this inner
function actually see, and does it see a live value or a frozen
snapshot?" Python's answer is unusually explicit once you know where to
look, and getting it solid here means a C# lambda silently capturing a
loop variable won't be a mystery later — it'll be a rule you already
know, in different clothes.

**What you need to know first.** Lesson 1's object model — specifically,
that a name is a binding to an object, not a box, and that looking up a
name means asking "what object is this name currently pointing at?"
Lesson 2's distinction between what Python checks and when — this
lesson adds a third kind of question Python answers at a specific,
fixed moment ("which namespace does this name belong to?"), decided
when a function is *defined*, not when it's *called*, which is the
direct cause of this lesson's opening error.

**Terms used in this lesson**

- **Namespace** — a mapping from names to the objects they're bound to,
  scoped to some particular context (a module, a function call, a class
  body). This term exists because "scope," below, is a fuzzy word people
  use loosely; "namespace" is the concrete thing that actually exists
  — this lesson's first unit proves it's literally an inspectable
  `dict` — and every claim about scope in this lesson is really a claim
  about which namespace a name resolves against.
- **Scope** — the region of source code where a particular namespace is
  the one consulted for name lookups. This term exists to describe the
  *textual* extent a namespace governs — "inside this function body,"
  "at module level" — as distinct from the namespace itself, which is
  the actual data structure backing it.
- **The LEGB rule** — the fixed order Python searches through
  namespaces when resolving a name that isn't defined right where it's
  used: **L**ocal (the current function's own namespace), **E**nclosing
  (any namespace belonging to a function this one is nested inside),
  **G**lobal (the current module's top-level namespace), **B**uilt-in
  (Python's own pre-defined names, like `len` or `print`). This term
  exists because without a fixed, known search order, "where does this
  name come from" has no answer at all — LEGB is that answer, always
  searched in that exact order, stopping at the first namespace that
  actually contains the name.
- **Local variable** — a name bound inside a function body, existing
  only in that function's own local namespace, created fresh on every
  call and discarded when the call returns. This term exists because
  this lesson's entire first unit is a claim about exactly which names
  count as local — and that claim is stricter and stranger than most
  people expect.
- **Global variable** — a name bound at a module's top level, living in
  that module's own namespace for as long as the module stays loaded,
  visible to every function defined in that module (via the LEGB rule's
  G step) unless a more specific namespace shadows it first.
- **Enclosing scope** — the local namespace of a function that a nested
  function is defined inside. This term exists specifically to name the
  "E" in LEGB — the namespace that exists only when one function is
  defined textually inside another, and that a plain top-level function
  never has access to at all.
- **Free variable** — a name used inside a function but not assigned
  anywhere in that function's own body, meaning it must be resolved by
  continuing outward through LEGB (into E, G, or B) rather than being
  found locally. This term exists because it's the precise technical
  name for exactly the kind of name this lesson's second and third
  units are built around — a name a nested function reads without
  owning.
- **`nonlocal`** — a keyword, used inside a nested function, declaring
  that a specific name refers to a variable in the nearest enclosing
  function's namespace rather than creating a new local one, and that
  assignments to it should modify that enclosing variable in place.
  This term exists because, as this lesson's third unit shows directly,
  without it a nested function *cannot* assign to an enclosing
  variable at all — it can only read it — and `nonlocal` is the one
  piece of syntax that changes that.
- **Closure** — a function that remembers, and can keep using, the
  variables from the enclosing scope it was defined in, even after that
  enclosing function has already returned. This term exists to name the
  actual mechanism, not just the syntax, behind this lesson's central
  example: a function factory that hands back a working, stateful
  function with genuinely private data attached to it.
- **`UnboundLocalError`** — a runtime exception Python raises when code
  tries to *read* a name that Python has already classified as local to
  the current function, before that name has actually been assigned a
  value yet in this particular call. This term exists because this
  exact error is this lesson's opening demonstration, and its message
  is confusing without already knowing local-variable classification
  happens for an entire function body at once, not line by line.

**Objects and methods used**

- **`globals`**
  - *What it is:* A built-in function, available everywhere with no
    import — the same flat-namespace kind as `id`, `type`, and `print`
    from Lesson 1.
  - *Implementation:* `globals() -> dict`. Takes no arguments; returns
    the actual dict backing the current module's global namespace —
    not a copy of it.
  - *Its use:* This lesson's first unit needs to prove that "the global
    namespace" isn't an abstract idea but a real, inspectable data
    structure — `globals()` is the direct tool for that, handing back
    the literal dict Python itself consults during global lookups.
  - *Type:* A built-in free function.
  - *Responsibility:* Its full charter is returning the real global
    namespace dict for whatever module is currently executing —
    nothing about formatting it, filtering it, or protecting it from
    modification (mutating the returned dict, per Lesson 1's mutability
    model, really does change what future global lookups in that module
    will find, since it's the same object, not a copy).
  - *Depends on:* Nothing — no arguments.
  - *Connects to:* Called directly by this lesson's first lab; reads
    directly from the interpreter's own internal bookkeeping for the
    current module; returns that dict object straight back to the
    caller, with no copying step in between.
  - *Shape:* A single, real `dict`, whose keys are every name currently
    bound at module level (as plain strings) and whose values are the
    objects those names are bound to — the exact same dict the
    interpreter itself already uses, not a snapshot.

**Everything else in the file, not this lesson's subject but still explained.**

- **`print`**
  - *What it is:* The same built-in function from Lessons 1 and 2,
    reappearing here — full treatment restated per the Repetition Rule.
  - *Implementation:* `print(*objects, sep=' ', end='\n') -> None`.
  - *Its use:* Surfacing this lesson's lab results to the terminal.
  - *Type:* A built-in free function.
  - *Responsibility:* Convert its arguments to text and write them to
    standard output — nothing more.
  - *Depends on:* Zero or more positional arguments of any type.
  - *Connects to:* Called throughout this lesson's labs; writes
    directly to the terminal; returns `None` to the caller.
  - *Shape:* Always `None`.
- **`isinstance`**
  - *What it is:* The same built-in function from Lesson 2, reappearing
    in this lesson's own Project Change step — full treatment restated
    per the Repetition Rule.
  - *Implementation:* `isinstance(object, classinfo) -> bool`.
  - *Its use:* This lesson's project update adds a third guard clause,
    for the new `task_id` parameter, following the exact pattern
    Lesson 2 established for `title` and `priority`.
  - *Type:* A built-in free function.
  - *Responsibility:* Answer whether an object is an instance of a
    given type (or one of its subclasses) — nothing about what to do
    with that answer.
  - *Depends on:* The object being checked, and a type (or tuple of
    types) to check against.
  - *Connects to:* Called inside `create_task`'s guard clauses; returns
    a plain boolean the surrounding `if not ...` uses to decide whether
    to raise.
  - *Shape:* A plain `bool`.
- **`TypeError`**
  - *What it is:* The same built-in exception class from Lesson 2,
    reappearing here — full treatment restated per the Repetition Rule.
  - *Implementation:* `TypeError(message)` — constructs an exception
    object carrying a message string.
  - *Its use:* Reporting the new `task_id` guard's failure, exactly the
    way Lesson 2's `title` and `priority` guards already do.
  - *Type:* A built-in class.
  - *Responsibility:* Carry a description of a type-related failure and,
    once raised, unwind the current call stack.
  - *Depends on:* A message string.
  - *Connects to:* Constructed inside the new guard clause; handed to
    `raise`, which triggers the actual stack unwind.
  - *Shape:* A single exception object carrying one string message.

---

## Concept Unit: Local Scope and the Whole-Function Rule

### The Problem

A function can read a variable defined outside it — Lesson 1 and 2's
labs have both done this without comment, reading module-level names
from inside functions with no issue. But what happens if a function
*both* reads a name early in its body *and* assigns to that same name
later in its body? Does the read see whatever value existed outside the
function at the time, the way you'd expect if Python just looked names
up moment-by-moment as each line executes?

> **Before reading on:** picture a function like this, in your head, no
> need to run anything yet:
> ```
> x = 10
> def broken():
>     print(x)
>     x = 5
> ```
> If Python resolves each line strictly in the order it executes —
> "reach the `print(x)` line, look up `x`, find the module-level `10`,
> print it, then reach the `x = 5` line and create a local `x`" — what
> would you expect `print(x)` to show when `broken()` is called? Now
> consider an alternative: what if Python doesn't decide "is `x` local
> to this function" line-by-line as it runs, but instead makes that
> decision once, for the *entire* function body, before running any of
> it? Under that alternative, would `print(x)`, on the very first line,
> still be looking at the module-level `x`, or at something else
> entirely — and if it's "something else," what would there even be to
> print?

### Isolating the Concept

```python
x = 10

def show():
    print(x)
show()

def broken():
    print(x)
    x = 5
    print(x)
broken()
```

Executed for real:

```
x inside show(): 10

Traceback (most recent call last):
  File "lab1.py", line 14, in <module>
    broken()
  File "lab1.py", line 11, in broken
    print("x inside broken(), before the local assignment line:", x)
UnboundLocalError: cannot access local variable 'x' where it is not associated with a value
```

`show()` works exactly as expected — it never assigns to `x` anywhere
in its body, so per the LEGB rule (defined in Terms, above), reading
`x` searches Local (empty, `show` has no local variables), finds
nothing, continues to Enclosing (not applicable — `show` isn't nested
in anything), continues to Global, and finds `x` bound to `10` there.
`broken()` fails completely differently, and the reason is the second
alternative from the Socratic prompt above, confirmed: Python decides
whether a name is **local** to a function by scanning that function's
*entire* body for assignment statements *before* running any of it —
not line by line, as execution actually proceeds. Because `x = 5`
appears anywhere in `broken`'s body, Python classifies `x` as local to
`broken` for the whole function, full stop — including the `print(x)`
line that runs *before* that assignment, textually. That earlier
`print(x)` is therefore not looking at the module-level `x` at all
(the LEGB search never even reaches Global, because `x` was already
classified as Local); it's looking at `broken`'s own local slot for
`x` — which exists, because Python already decided this function has
one, but hasn't been given a value yet, because execution hasn't
reached `x = 5` yet. Trying to read a local name before its own
assignment has actually run is exactly what **`UnboundLocalError`**
(defined in Terms, above) reports.

A second lab makes the namespace itself concrete rather than abstract:

```python
x = 10

def show_globals():
    g = globals()
    print(type(g))
    print("x" in g)
    print(g["x"])

show_globals()
```

Real output:

```
type(g): <class 'dict'>
'x' in g: True
g['x']: 10
```

The **global namespace** (defined in Terms, above) isn't a metaphor —
`globals()` hands back the literal `dict` Python itself already
consults whenever a name resolution reaches the "G" step of LEGB. This
is called **name binding** and namespace lookup made visible: `"x" in g`
is `True` for exactly the same reason `show()`'s `print(x)` worked
above — both are asking the same real dict the same question.

### Discarding the Example

Both throwaway scripts shown here — the `show()`/`broken()` pair and
the `globals()` inspection — are deleted now and won't appear in later
lessons or project code. They existed only to isolate whole-body local
classification and to make the global namespace concretely inspectable.

### Project Change

No project change in this unit — this unit is establishing the local/
global half of LEGB in isolation; the project change for this lesson
lands in the third unit, once closures (built from this unit's rules
plus the next unit's enclosing-scope rule) are the actual concept being
applied.

### Mechanical Walkthrough

- `x = 10` — an assignment statement (Lesson 1) at module level,
  binding the name `x` in the module's global namespace.
- `def show():` — a function definition statement (introduced in
  Lesson 2's walkthrough, restated per the Repetition Rule: `def`
  begins it, `show` is the name bound to the resulting function
  object).
- `print(x)`, inside `show` — a call to the `print` built-in (full
  treatment above), whose argument `x` is resolved via LEGB: not found
  Local (nothing is assigned inside `show`), so the search continues to
  Global, where it's found bound to `10`.
- `show()` — a function call: the name `show` is looked up (found in
  the global namespace, bound to the function object `def show():`
  created), and that function object is invoked with no arguments.
- `def broken():` — a second function definition, same mechanism as
  `show`'s.
- `print(x)`, inside `broken`, first occurrence — textually identical
  to the call inside `show`, but resolved completely differently: per
  this unit's own finding, Python has already classified `x` as local
  to `broken` (because of the `x = 5` line below), so this lookup never
  reaches Global at all — it looks for a local `x`, finds the local slot
  exists but has no value bound to it yet, and raises
  `UnboundLocalError`.
- `x = 5`, inside `broken` — an assignment statement; this is the exact
  line whose mere *presence* anywhere in `broken`'s body is what causes
  Python to classify `x` as local for the entire function, per this
  unit's finding — but this line itself never actually executes in the
  real run above, because the `print(x)` line before it already raised
  an exception, halting `broken` before execution reaches here.
- `print(x)`, inside `broken`, second occurrence — also never executes,
  for the same reason.
- `broken()` — a function call, identical in mechanism to `show()`
  above, invoking `broken`, which raises partway through.
- `globals()` — a call to the built-in `globals` function (full
  treatment in Objects and methods, above), taking no arguments and
  returning the real dict backing the current module's global
  namespace.
- `g = globals()` — an assignment statement binding the local name `g`
  (inside `show_globals`) to that returned dict object.
- `type(g)` — a call to the `type` built-in (full treatment in Lesson
  1, restated per the Repetition Rule), reporting `g`'s class.
- `"x" in g` — use of the `in` operator, checking whether the string
  `"x"` appears as a key in the dict `g`, evaluating to a boolean.
- `g["x"]` — subscript access: looks up the key `"x"` in the dict `g`
  and returns the value bound to it — here, the same object the
  module-level name `x` is itself bound to, because `g` *is* the real
  global namespace, not a copy of it.

### CS Lens

This is a hard concept — a language's rule for classifying names as
local versus non-local, decided ahead of execution rather than as
execution proceeds — so, per the Repetition Rule, several unrelated
recurrences:

```
Also recognized in: JavaScript's `var` hoisting (a `var` declared
anywhere in a function is treated as existing from the top of that
function, producing `undefined` rather than a reference error if read
before its assignment — the same "whole-function classification"
principle, with a different resulting behavior), C's requirement that
local variable declarations be known to the compiler before use within
a block, and general compiler "symbol table" construction (a compiler
typically performs a full pass identifying every declared name in a
scope before generating code that reads or writes any of them, rather
than processing declarations and uses strictly in file order)
```

### SE Lens

The alternative — deciding whether a name is local strictly line by
line as execution proceeds, so `print(x)` before any local assignment
would transparently fall through to the enclosing or global scope, and
only *later* reads see the local value once it's assigned — was
rejected because it would make a function's behavior depend on dynamic
execution order in a way that's much harder to reason about from the
source text alone: you'd have to trace actual runtime control flow
(including any branches, loops, or early returns) to know, at any given
line, whether a name is currently local or not, rather than being able
to tell just by scanning the function body once for assignments. The
cost of Python's actual choice, demonstrated directly by this unit's
own lab: an assignment statement anywhere in a function — even one that
never executes on a particular call, even one buried inside a
conditional branch that's never taken — still affects how every read of
that name, anywhere else in the same function, is resolved. This is a
common, genuinely surprising source of bugs for exactly the reason this
unit exists: the fix (an assignment "later" in the function) looks like
it shouldn't affect anything "earlier," and it does.

### Commands Needed

Both labs were run the same way as every previous lesson:

```
python3 lab1.py
```

Nothing new — same `python3` invocation covered in Lesson 1.

### Run It

Already shown and verified above, under "Isolating the Concept," for
both labs.

### Connection

This unit established Local and Global — two of LEGB's four steps —
and the whole-body rule governing which one a name falls into. The next
unit introduces the "E," Enclosing: what happens when a function is
defined *inside* another function, and needs a name that's neither
Local to itself nor Global to the module?

---

## Concept Unit: Enclosing Scope and the Full LEGB Search

### The Problem

`show()` and `broken()`, in the previous unit, were both defined
directly at module level — for them, LEGB only ever had two real steps
to search: Local, then straight to Global (since neither is nested
inside another function, "Enclosing" doesn't apply to either of them at
all). What happens when a function *is* defined inside another
function, and reads a name that isn't its own local variable — does it
skip straight to the module's global namespace, the same as `show()`
did, or does something in between get checked first?

> **Before reading on:** if you define a function `inner` textually
> inside another function `outer`, and `outer` has its own local
> variable `message`, what do you predict happens if `inner` reads
> `message` without ever assigning to it itself? Does `inner` have any
> access to `outer`'s local variables at all — and if it does, is that
> access working through the exact same lookup mechanism Lesson 1
> already established (a name resolving to whatever object it's
> currently bound to), or something entirely different reserved just
> for nested functions?

### Isolating the Concept

```python
def outer():
    message = "hello from outer"
    def inner():
        print(message)
    inner()
outer()
```

Real output:

```
message, read from inner(): hello from outer
```

`inner` reads `message` successfully, even though `message` is not
`inner`'s own local variable (nothing inside `inner`'s body assigns to
`message`) and is not a module-level global either (it's local to
`outer`, created fresh each time `outer` is called). This is the "E" in
LEGB: **enclosing scope** (defined in Terms, above) — the local
namespace of the function `inner` is textually nested inside. When
`inner` reads `message`, LEGB searches Local first (empty — `inner`
assigns nothing), then Enclosing — and finds it there, in `outer`'s own
local namespace, without ever needing to reach Global at all. `message`
here is called a **free variable** (defined in Terms, above) from
`inner`'s point of view: used inside `inner`, but not assigned there,
so its resolution has to continue outward through LEGB rather than
stopping at Local.

A second lab makes the full four-step order concrete, including the
step neither previous lab has touched yet — "B," Built-in:

```python
print(len("hello"))

def shadow_demo():
    len = "not a function anymore"
    print(len)

shadow_demo()
print(len("hello"))
```

Real output:

```
len('hello') before any shadowing: 5
len, inside shadow_demo(), after local assignment: not a function anymore
len('hello') after shadow_demo() has already returned: 5
```

`len` is normally resolved through LEGB's final step, Built-in — it's
never assigned at module level or inside any function, in ordinary
code, which is exactly why calling `len("hello")` at module level, on
the first line, works: Local doesn't apply (module level, not inside a
function), Enclosing doesn't apply, Global has no `len` bound in this
module, so the search reaches Built-in and finds Python's own `len`
function there. Inside `shadow_demo`, though, `len = "not a function
anymore"` is an assignment — per the previous unit's whole-body rule,
this makes `len` local to `shadow_demo` for its *entire* body, which
means every read of `len` inside `shadow_demo` now resolves to Local
first and stops there, never reaching Built-in at all: this is why
`print(len)` inside the function shows the string, not the function.
Crucially, the very last line — `print(len("hello"))`, back at module
level, after `shadow_demo()` has already returned — shows `5` again:
`shadow_demo`'s local namespace, including its local `len`, was
discarded the moment the function returned (a fresh one gets created on
every call, per the previous unit's finding about local variables in
general), so this line's LEGB search reaches Built-in exactly as it did
on the very first line.

### Discarding the Example

Both throwaway scripts shown here — the `outer`/`inner` pair and the
`len`-shadowing pair — are deleted now and won't appear in later
lessons or project code. They existed only to isolate the Enclosing and
Built-in steps of LEGB in the smallest possible form.

### Project Change

No project change in this unit either — the actual project application
of everything LEGB has established so far (Local, Global, Enclosing,
Built-in) arrives in the next unit, once closures — which depend on all
four steps working the way this unit and the previous one just proved
— are the concept actually being built.

### Mechanical Walkthrough

- `def outer():` — a function definition, identical mechanism to every
  previous `def` in this lesson.
- `message = "hello from outer"`, inside `outer` — an assignment
  statement, binding `message` in `outer`'s own local namespace,
  created fresh each time `outer` is called.
- `def inner():` — a function definition, textually nested inside
  `outer`'s body. This nesting is exactly what gives `inner` an
  enclosing scope at all — a function defined at module level, like
  every `def` in the previous unit, has no enclosing scope to search.
- `print(message)`, inside `inner` — a call to `print` (full treatment
  above), whose argument `message` is a **free variable** from
  `inner`'s perspective, resolved by LEGB: not Local (nothing inside
  `inner` assigns to `message`), found in Enclosing (`outer`'s local
  namespace, where `message` is bound).
- `inner()`, inside `outer` — a function call, invoking `inner`; note
  this call itself is inside `outer`'s body, which is what makes
  `outer`'s local namespace still exist and still reachable at the
  moment `inner` actually runs — `outer` hasn't returned yet.
- `outer()`, at module level — a function call, invoking `outer`, which
  in turn defines and calls `inner` as just described.
- `print(len("hello"))`, first occurrence — `len` is resolved via LEGB
  (Local doesn't apply at module level; Global has no `len` bound; the
  search reaches Built-in and finds Python's own `len` function),
  called with the string `"hello"`, returning the integer `5` (`len`'s
  real job: report how many elements a sequence contains — five
  characters, here), which `print` then writes.
- `def shadow_demo():` — a function definition at module level.
- `len = "not a function anymore"`, inside `shadow_demo` — an
  assignment statement; per the previous unit's whole-body rule, this
  single line is what reclassifies every use of `len` anywhere in
  `shadow_demo`'s body as Local, for the entire function.
- `print(len)`, inside `shadow_demo` — resolves `len` via LEGB, finds it
  Local immediately (per the line just above), and prints the string it
  was bound to — never reaching Built-in at all, exactly as the
  previous unit's `UnboundLocalError` case never reached Global.
- `shadow_demo()` — a function call, invoking the function just defined.
- `print(len("hello"))`, second occurrence — back at module level, after
  `shadow_demo()` has already returned and its local namespace (local
  `len` included) has been discarded; resolves exactly as the first
  occurrence did, reaching Built-in and finding the real `len` function
  again.

### CS Lens

This reappears the LEGB idea from the previous unit, sharpened by
adding the two steps that previous unit's flat module-level functions
never exercised:

```
Also recognized in: lexical scoping generally, as implemented across
nearly every modern language with nested functions (JavaScript's
closures, C#'s local functions capturing enclosing method variables,
Swift's nested functions) — all resolve free variables by searching
outward through the textual nesting of function definitions, not
through the call stack at runtime; and shell environment variable
inheritance (a child process inherits and can read its parent's
exported variables, but a child modifying its own copy doesn't affect
the parent, a real point of difference from Python's Enclosing scope
worth noticing precisely because it's not identical)
```

### SE Lens

The alternative — resolving free variables *dynamically*, based on
which functions happen to be active on the call stack at the moment a
name is looked up (called **dynamic scoping**, used by a small number
of older languages like early Lisp), rather than based on where a
function is *textually defined* (Python's actual choice, called
**lexical scoping**) — was rejected industry-wide, Python included,
because dynamic scoping makes a function's behavior depend on who
happens to call it, not on the code you can see when you read the
function's own definition: the exact same `inner` function could
resolve a free variable completely differently depending on the call
stack at the time, with no way to tell just by reading `inner`'s source.
Python's lexical choice means you can always determine where a free
variable comes from purely by looking at how functions are nested in
the source text — the real cost is narrower and specific: it only works
because Python decides this nesting relationship once, when a function
is *defined*, which is exactly why the next unit's closures can keep
working correctly even after the function that defined them has already
returned — the nesting relationship was already fixed at definition
time and doesn't depend on anything still being "on the stack."

### Commands Needed

Both labs run the same way as every previous script in this lesson:
`python3 lab2.py`. Nothing new.

### Run It

Already shown and verified above, under "Isolating the Concept," for
both labs.

### Connection

This unit completed the full LEGB search order and proved every step of
it concretely: Local, Enclosing, Global, Built-in, each one demonstrated
by a case that specifically has to reach that step and no earlier one.
The next unit asks the question this naturally sets up: `inner`, above,
could only *read* `message` from `outer`'s scope — what happens if a
nested function needs to *change* a variable in its enclosing scope,
and have that change persist even after the enclosing function has
already returned?

---

## Concept Unit: Closures — State That Outlives the Function That Created It

### The Problem

The previous unit's `inner` function only ever read `message` — it
never tried to change it. Per this lesson's first unit, though,
*assigning* to a name inside a function is what makes Python treat it
as local to that function, for the whole function body. What happens if
a nested function tries to assign to a name that belongs to its
enclosing scope, not to itself — does that work the way reading did, or
does the first unit's local-classification rule get in the way?

> **Before reading on:** think back to this lesson's very first
> example — assigning to `x` anywhere inside `broken`'s body made `x`
> local to `broken`, for the whole function, even though a module-level
> `x` already existed. If a nested function tries to write
> `count = count + 1` where `count` belongs to its *enclosing*
> function's scope, not its own, do you expect the same thing to
> happen — does the nested function end up with its own new local
> `count`, shadowing the enclosing one, rather than actually changing
> it? And if that's the problem, what would have to exist, syntactically,
> to tell Python "no, I really do mean the enclosing one, modify that
> exact variable" — is there anything in this lesson's Terms list
> already that sounds like it might do exactly that?

### Isolating the Concept

```python
def make_counter_broken():
    count = 0
    def increment():
        count = count + 1
        return count
    return increment

counter = make_counter_broken()
try:
    print(counter())
except UnboundLocalError as e:
    print("UnboundLocalError:", e)
```

Real output:

```
UnboundLocalError: cannot access local variable 'count' where it is not associated with a value
```

Exactly the prediction from the Socratic prompt: `count = count + 1`,
inside `increment`, is an assignment to `count` — per this lesson's
first unit, that makes `count` local to `increment` for the *entire*
function body, including the read on the right-hand side of that very
same line. `increment` ends up trying to read its own not-yet-assigned
local `count` (to compute `count + 1`) before it's ever been given a
value, which is the identical `UnboundLocalError` shape as this
lesson's opening example — `increment` never actually reaches
`make_counter_broken`'s `count` at all, despite `count` sitting right
there in its enclosing scope.

The fix:

```python
def make_counter():
    count = 0
    def increment():
        nonlocal count
        count = count + 1
        return count
    return increment

counter1 = make_counter()
print(counter1())
print(counter1())
print(counter1())
```

Real output:

```
counter1(): 1
counter1(): 2
counter1(): 3
```

Adding `nonlocal count` (defined in Terms, above) as the very first
line of `increment`'s body changes how Python classifies `count`
inside `increment`: instead of creating a new local variable, it tells
Python explicitly "`count`, here, refers to the `count` in the nearest
enclosing scope — resolve it there, and let assignments to it modify
that variable in place, not create a local shadow of it." Each call to
`counter1()` genuinely increments the same `count` that lived inside
`make_counter`'s single call — and, notably, `make_counter` already
*returned* long before any of these three calls happened; `count`
didn't get discarded when `make_counter` returned, the way an ordinary
local variable would per this lesson's first unit. This function —
`increment`, handed back by `make_counter`, carrying its own private,
persistent `count` with it — is called a **closure** (defined in Terms,
above).

A third lab proves that closure's state is genuinely private, not
shared:

```python
counter2 = make_counter()
print(counter2())
print(counter1())
```

Real output:

```
counter2(): 1
counter1() again: 4
```

`counter2`, from a completely separate call to `make_counter()`, starts
its own `count` back at `1` — proving each call to `make_counter`
creates a brand-new, independent enclosing namespace, with its own
separate `count`, not a namespace shared across every closure
`make_counter` ever produces. `counter1`, called again afterward, picks
up right where it left off, at `4` — its own `count`, untouched by
anything `counter2` did.

Finally, proof this isn't hidden magic — a closure really does carry
real, inspectable data with it, not an invisible special case:

```python
counter1.__closure__[0].cell_contents
```

Real output, after `counter1` had already been called twice:

```
counter1.__closure__: (<cell at 0x7f674dbff250: int object at 0xb360c8>,)
type(counter1.__closure__): <class 'tuple'>
counter1.__closure__[0]: <cell at 0x7f674dbff250: int object at 0xb360c8>
counter1.__closure__[0].cell_contents: 2
```

Every function object that closes over an enclosing variable carries a
real `__closure__` attribute — a tuple of **cell** objects, one per
enclosing variable it actually uses, where each cell is the genuine
storage location `nonlocal` writes into and reads from.
`cell_contents` shows the live current value — `2`, correctly matching
`counter1`'s state after exactly two calls at the moment this was
inspected. This is the actual mechanism behind "the closure remembers
its enclosing variables": not a copy taken once, but a real, live,
shared reference to the same cell both `make_counter`'s original frame
and `increment` itself ultimately point at.

### Discarding the Example

All three throwaway scripts shown here — the broken naive version, the
working `nonlocal` version, and the `__closure__` inspection — are
deleted now and won't appear in later lessons as-is. What's kept, built
fresh in Project Change below using this exact pattern, is a real
version applied to the project's own `create_task` function.

### Project Change

- **Reference Source:** No reference counterpart — original to this
  project, same as every previous unit in this curriculum.
- **Files affected:** `project/tasks.py` (modified), `project/main.py`
  (modified).
- **Change type:** Add (`create_id_generator`, a new function in
  `tasks.py`) and refactor (`create_task`'s signature and body, in the
  same file; `main.py`'s use of both).
- **Location:** `create_id_generator` is added above `create_task`, in
  `tasks.py`; `create_task` itself is modified to accept and guard a
  new `task_id` parameter, using the same `isinstance`-guard pattern
  Lesson 2 already established for `title` and `priority`.
- **Dependencies:** None new — everything used here (`nonlocal`,
  `isinstance`, `TypeError`) is already part of core Python or already
  covered in this lesson and Lesson 2.

### The New Code

```python
def create_id_generator():
    current_id = 0

    def generate() -> int:
        nonlocal current_id
        current_id += 1
        return current_id

    return generate
```

### The Updated Project

```
tasks.py:
 1  def create_id_generator():                                                       # ← new
 2      current_id = 0                                                               # ← new
 3                                                                                    # ← new
 4      def generate() -> int:                                                       # ← new
 5          nonlocal current_id                                                      # ← new
 6          current_id += 1                                                          # ← new
 7          return current_id                                                        # ← new
 8                                                                                    # ← new
 9      return generate                                                              # ← new
10
11
12  def create_task(task_id: int, title: str, priority: int) -> dict:                # ← changed
13      if not isinstance(task_id, int):                                             # ← new
14          raise TypeError(f"task_id must be an int, got {type(task_id).__name__}")  # ← new
15      if not isinstance(title, str):
16          raise TypeError(f"title must be a str, got {type(title).__name__}")
17      if not isinstance(priority, int):
18          raise TypeError(f"priority must be an int, got {type(priority).__name__}")
19      return {"id": task_id, "title": title, "priority": priority, "done": False}  # ← changed
```

```
main.py:
1  from tasks import create_task, create_id_generator                    # ← changed
2
3  next_id = create_id_generator()                                       # ← new
4
5  task_a = create_task(next_id(), "Write lesson 3", 1)                  # ← changed
6  task_b = create_task(next_id(), "Review lesson 3", 2)                 # ← changed
7  print(task_a)
8  print(task_b)                                                         # ← new
```

As a whole, `tasks.py` now provides two related pieces: a factory
function, `create_id_generator`, that hands back a closure carrying its
own private counter; and `create_task`, extended with a third guarded
parameter, `task_id`, so every task built through it now carries a real
identifier rather than being anonymous. `main.py`, as a whole, now
demonstrates the intended real usage: call `create_id_generator()`
*once* to get a single generator function, then call that same
generator repeatedly — once per task — so every task gets its own
sequential ID from one shared, private counter.

### Mechanical Walkthrough

- `def create_id_generator():` — a function definition, identical
  mechanism to every previous `def` in this curriculum.
- `current_id = 0`, inside `create_id_generator` — an assignment
  statement, binding `current_id` in `create_id_generator`'s own local
  namespace, to the int object `0`.
- `def generate() -> int:` — a function definition nested inside
  `create_id_generator`, giving `generate` an enclosing scope (per this
  lesson's second unit) that includes `current_id`; `-> int` is a
  return-type hint (Lesson 2), stating — but, per Lesson 2's own
  finding, not enforcing — that `generate` is expected to return an
  `int`.
- `nonlocal current_id`, inside `generate` — the `nonlocal` keyword
  (defined in Terms, above), declaring that `current_id`, inside
  `generate`, refers to the enclosing variable in
  `create_id_generator`'s namespace rather than creating a new local
  one — without this line, the next line's assignment would fail with
  the exact `UnboundLocalError` this unit's own first lab demonstrated.
- `current_id += 1`, inside `generate` — an augmented assignment: shorthand
  for `current_id = current_id + 1`, reading `current_id`'s current
  value, computing one more than it (creating a new int object, per
  Lesson 1's finding that int is immutable — this doesn't modify `0` in
  place, it rebinds `current_id` to a new object, `1`), and, because of
  the `nonlocal` declaration above, rebinding the *enclosing* `current_id`
  to that new object rather than creating a local one.
- `return current_id`, inside `generate` — a `return` statement (Lesson
  2), handing back whatever object `current_id` is currently bound to.
- `return generate`, inside `create_id_generator` — a `return`
  statement handing back the function object `generate` itself — not
  calling it, just returning the object, per Lesson 1's model of
  functions as objects that names can be bound to.
- `def create_task(task_id: int, title: str, priority: int) -> dict:` —
  the same function definition mechanism as Lesson 2's version, now
  with a third hinted parameter, `task_id: int`, inserted first.
- `if not isinstance(task_id, int):` — the same guard-clause pattern
  Lesson 2 established for `title` and `priority` (full treatment of
  `isinstance` in Objects and methods, above), applied to the new
  parameter.
- `raise TypeError(f"task_id must be an int, got {type(task_id).__name__}")`
  — the same `TypeError`-construction-and-`raise` pattern from Lesson 2
  (full treatment above), reporting `task_id`'s real type on mismatch.
- `return {"id": task_id, "title": title, "priority": priority, "done": False}`
  — the same dict-literal pattern from Lesson 2, now including a fourth
  key, `"id"`, mapped to the validated `task_id`.
- `from tasks import create_task, create_id_generator`, in `main.py` —
  an import statement (Lesson 2), now naming two functions instead of
  one, binding both `create_task` and `create_id_generator` in
  `main.py`'s own namespace to the function objects `tasks.py` bound
  those same names to.
- `next_id = create_id_generator()` — a function call to
  `create_id_generator` (no arguments), whose return value — the
  `generate` closure, carrying its own private `current_id` starting at
  `0` — is bound to the name `next_id` in `main.py`'s namespace. This
  call happens exactly once.
- `create_task(next_id(), "Write lesson 3", 1)` — `next_id()` is
  evaluated first (a call to the closure, with no arguments), returning
  `1` on this first call (per the closure's own logic, incrementing
  `current_id` from `0`); that `1` is passed as `task_id`; the whole
  expression's result (the dict `create_task` returns) is bound to
  `task_a`.
- `create_task(next_id(), "Review lesson 3", 2)` — the identical
  pattern; `next_id()` is called a second time, returning `2` (the
  *same* closure's `current_id`, now incremented again — not a fresh
  `0`, because this reuses the one `next_id` object created above, not
  a new call to `create_id_generator()`); bound to `task_b`.
- `print(task_a)`, `print(task_b)` — the `print` built-in (full
  treatment above), writing each returned dict.

### Execution Trace

A timing/control-flow trace for `main.py`'s real sequence of calls,
tracking exactly which object `current_id` resolves to at each step:

1. `next_id = create_id_generator()` — a fresh call frame for
   `create_id_generator` is created; `current_id` inside it is bound to
   `0`; `generate` is defined, capturing that exact frame as its
   enclosing scope; `create_id_generator` returns `generate`, and
   `main.py`'s `next_id` is bound to it. `create_id_generator`'s own
   call frame has now technically "returned" — but its `current_id`
   variable is not discarded, because `generate`'s `__closure__` still
   holds a live reference to the cell it lives in, exactly as this
   unit's own inspection lab proved.
2. `next_id()`, first call (inside `create_task(next_id(), ...)` for
   `task_a`) — `nonlocal current_id` resolves to that same surviving
   cell; `current_id += 1` changes it from `0` to `1`; `1` is returned
   and passed into `create_task` as `task_id`.
3. `next_id()`, second call (for `task_b`) — the *same* cell,
   unchanged in identity, is read again; `current_id += 1` changes it
   from `1` to `2`; `2` is returned and passed into `create_task`.

The real, executed output of the full updated project confirms exactly
this:

```
{'id': 1, 'title': 'Write lesson 3', 'priority': 1, 'done': False}
{'id': 2, 'title': 'Review lesson 3', 'priority': 2, 'done': False}
```

### CS Lens

This is the hard concept the whole lesson has been building toward, so,
per the Repetition Rule, several unrelated recurrences:

```
Also recognized in: JavaScript closures (the identical pattern —
a function factory returning an inner function that keeps a private
counter alive, extremely common for things like unique-ID generators
or debounced event handlers), C#'s captured local variables in lambdas
and local functions (a lambda referencing an enclosing method's local
variable keeps that variable alive past the point it would otherwise go
out of scope, via the compiler-generated "closure class" mechanism —
different implementation, same observable effect), object-oriented
programming's encapsulation of private instance state generally (an
object's private field, accessible only through its own methods, is
solving the identical problem — data that persists and is only
modifiable through a controlled interface — that this closure solves
without a class at all), and database sequence generators / auto-
increment columns (a persistent counter, isolated per table or
sequence, handing out a guaranteed-unique next value on each call)
```

### SE Lens

The alternative — using a plain module-level global variable for
`current_id` instead of a closure — was deliberately not chosen here,
and the reason is a direct, concrete consequence of this lesson's own
third lab: a single shared global counter has exactly one instance,
period — every part of the program that wants task IDs would be forced
to share the same counter, with no way to have two independent ID
sequences (say, one for tasks and a separate one for a different kind
of record) without inventing two separate, not-quite-parallel global
variables and manually keeping them straight. `create_id_generator`,
by contrast, can be called as many times as needed, each call producing
a genuinely independent counter — exactly what `counter1`/`counter2`,
in this unit's own lab, already proved directly. The real cost this
project is now carrying: a closure's state is invisible from outside
it in a way a global variable's isn't — nothing about `next_id` itself,
looked at from `main.py`, visibly shows that it's stateful or what its
current count is; `counter1.__closure__[0].cell_contents`, from this
unit's inspection lab, is the only way to actually look at it directly,
and no one debugging this code casually is likely to reach for that.

### Commands Needed

The project scripts here were run the same way as every previous
lesson's project code:

```
python3 main.py
mypy main.py
```

Both commands are exactly as covered in Lesson 2's Commands Needed
step — nothing new about either invocation itself; only the file
contents being checked have changed.

### Run It

Already shown and verified above, under "Isolating the Concept" (for
the three throwaway labs) and under "Execution Trace" (for the real,
updated project). `mypy main.py`, run against the fully updated
project, reports:

```
Success: no issues found in 1 source file
```

confirming the new `task_id: int` hint on `create_task` and the
`next_id() -> int` hint on the closure's inner function agree with how
both are actually used at every call site in `main.py`.

### Connection

This unit is where every rule this lesson established stopped being
abstract: the first unit's whole-body local classification is exactly
why `increment`'s naive version failed; the second unit's lexical,
definition-time scoping is exactly why `generate`'s enclosing scope
survives `create_id_generator` returning, rather than depending on
anything still being "on the stack"; and `nonlocal` is the one piece of
syntax that turns "I can read the enclosing scope" (already true, per
the second unit) into "I can actually change it, and have that change
persist," which is what a real, useful closure requires.

---

## Connect the Pieces

Trace one task's ID through everything this lesson built. `main.py`
calls `create_id_generator()` exactly once, producing a single closure
bound to `next_id` — a real function object whose `__closure__`
attribute, per this unit's own inspection, holds one live cell,
currently containing `0`. Building `task_a` calls `next_id()`: per this
lesson's first unit, `nonlocal current_id` is what stops that call from
raising the exact `UnboundLocalError` this lesson opened with — without
it, `current_id += 1` inside `generate` would try to create and
immediately read a fresh local `current_id`, the identical failure
`make_counter_broken` demonstrated directly. With `nonlocal` present,
the call instead reaches into the cell from this lesson's second unit's
Enclosing step, increments it to `1`, and returns that `1` — which
flows straight into `create_task` as `task_id`, itself checked by an
`isinstance` guard built on Lesson 2's exact pattern, before landing in
the returned dict as `task_a["id"]`. Building `task_b` calls `next_id()`
again — the *same* closure, the *same* cell, now at `2` — proving, in
the real running project rather than an isolated lab, exactly what
`counter1`/`counter2` proved in this unit's own throwaway code: one
generator, called repeatedly, hands out a real, private, persistent,
auto-incrementing sequence, with no global variable anywhere in sight.
