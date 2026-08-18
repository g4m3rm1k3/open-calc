# Lesson 0: Deciding Before Building

**What you will build.** A written specification for Clojupye — the
Clojure-inspired Lisp this series builds, compiling to Python. No
executable code exists after this lesson. The transferable problem this
lesson is actually about: a language's rules have to be decided
*somewhere*, and deciding them in prose, before a compiler exists to
enforce (or accidentally define) them, is what keeps a project like this
from drifting into "whatever the first working implementation happened to
do." The output of this lesson — `LANGUAGE-SPEC.md` — is a real artifact
every later lesson can be checked against.

**What you need to know first.** Nothing. This is Lesson 0.

**Terms used in this lesson**

- **Language specification** — a document that states what a language's
  programs mean, independent of any particular implementation. It exists
  because "the implementation is the spec" breaks the moment there are two
  implementations (here: an interpreter and a compiler, built side by side
  starting at Section 10/12) that need to agree, or the moment a bug fix
  changes behavior nobody had actually decided on purpose.
- **Special form** — a syntactic form (`def`, `let`, `if`, `do`, `fn`,
  `quote`) that is *not* a function call, even though it's written with
  the same parenthesized syntax as one. It exists because some things a
  language needs to do — bind a name, choose between two branches without
  evaluating both, delay evaluation entirely — cannot be done by an
  ordinary function, since ordinary functions always evaluate all of their
  arguments before they run.
- **Self-evaluating** — a form whose evaluation result is itself, with no
  lookup or computation involved (`42` evaluates to `42`). It exists as a
  base case: every evaluation rule in a Lisp eventually bottoms out at
  something that doesn't need further evaluation, or evaluation would
  never terminate.
- **Interning** — guaranteeing that every occurrence of an equal value
  (here, a keyword with the same name) is the *same* underlying object,
  not just an equal-looking copy. It exists so that identity comparison
  can substitute for equality comparison where that matters for
  performance, and so repeated keywords in a program don't allocate
  separate objects for no reason.
- **Lexical scope** — a name resolves to whichever binding textually
  (visually, in the source) encloses it, not whichever binding happened to
  be active at runtime when the code was called from. It exists because
  its alternative, dynamic scope, makes a function's meaning depend on who
  calls it rather than where it's written, which makes real programs
  unreadable at any size.
- **Closure** — a function value that carries a reference to the
  environment that existed at the moment it was created, not just the
  code of its body. It exists so a function returned from another function
  can still see that outer function's local variables after the outer
  function has already returned — without it, `fn` could only ever see
  global state once its creator finished running.
- **Truthiness** — the rule for which values count as true and which
  count as false when used as a condition, when the language has values
  (like `0` or `""`) that some other languages treat as false but this one
  doesn't. It exists because "true" and "false" are actually a design
  decision, not a fact about a value, and different languages make that
  decision differently on purpose.

**Objects and methods used.** None — Lesson 0 produces no executable code.
The first real code, and the first Concept Units in this series' sense
(isolated throwaway lab → project change → new code → mechanical
walkthrough → CS/SE lens), begin in Lesson 1.

---

## Why write the spec before any code exists

### The Problem, in prose, no code yet

Curriculum.md's Section 0 says this outright: "No compiler implementation
yet." It would be faster to skip straight to Lesson 1 and let the reader
(the executable-project shell) start existing, then decide what `nil`
means the first time it comes up in code. That's also how most tutorials
actually work — the language's rules get invented one `if` statement at a
time, wherever the tutorial author happened to need one next.

The problem with that approach shows up later, not immediately. This
project builds an interpreter first and a compiler second (Curriculum.md
Sections 5 and 12), and Section 10.4 requires them to agree — the same
source program has to produce the same result whether it runs through the
interpreter or through compiled Python. If "what `if` does when its
condition is `0`" was never decided anywhere except inside the
interpreter's own source code, there is nothing for the compiler to be
*correct against* except "whatever the interpreter happens to do," bugs
included. A spec written first is the thing both implementations are
independently checked against — including, eventually, a third
implementation nobody involved in this series has written yet, if this
project becomes the open-source, community-contributed project it's
aimed at. A contributor extending the language needs a document that says
what's already decided, not just a codebase to reverse-engineer intent
from.

### SE lens — why it's engineered this way

The alternative not chosen here is **implementation-as-specification**:
treat whatever the first working interpreter does as the de facto
definition of the language, and write documentation (if any) after the
fact, describing what was built. Real projects do this constantly, and
it's not irrational — it's faster to a working demo, and nothing is
overspecified before anyone knows if it's even the right feature.

The real tradeoff: implementation-as-specification is cheap right up
until the point something needs to agree with the implementation without
being the implementation — a second backend (this project's own compiler,
Section 12), a test suite that's supposed to catch regressions rather
than encode them (Section 10), or a future contributor who has no way to
tell "this is a bug" from "this is the definition" apart from reading
interpreter source and guessing. This project hits that point on purpose,
early — Section 10.4's differential testing exists specifically to prove
interpreter and compiler agree — so paying the cost of a spec now is
buying back a real, scheduled need four lessons later, not a hedge
against a hypothetical one.

The honest cost, stated up front rather than glossed over: parts of this
spec — the Python interoperability rules and the module rules, in
particular — are being written before the sections that implement them
exist (Sections 16–21). Those parts are deliberately stated only as
*principles*, not exact mechanics, and are marked as such below, because
locking in exact mechanics this early risks writing something the later
lessons then have to contradict. A spec section that turns out to be
wrong once real implementation work starts is itself normal — it gets
revised, and the revision is worth more than the guess it replaces once
there's a document to revise in the first place.

### CS lens

A specification written before (or independent of) any single
implementation is not unique to toy languages. Also recognized in: the
Python Language Reference (independent of CPython, PyPy, or any other
interpreter that implements it), the ECMAScript specification (which V8,
SpiderMonkey, and JavaScriptCore all separately implement and are
tested against), the Java Language Specification alongside the JVM
specification (two different documents, on purpose, since a *language*
and a *bytecode format* are different contracts), and IETF RFCs for
network protocols (so that two people's independently written
implementations can talk to each other having never seen each other's
code).

---

## Producing the specification

Each piece below states the decision and, briefly, why that decision and
not some other one — the same standard the rest of this series holds
code explanations to. The full, standalone artifact this lesson produces
is `LANGUAGE-SPEC.md`, one level up in the project's own root folder;
what follows here is the
reasoning, not a duplicate copy of the document itself.

### Syntax

Clojupye is **S-expression syntax**: every form is either an atom (a
single token — a literal or a symbol) or a parenthesized/bracketed
sequence of forms. The decision that needs real justification isn't "use
parentheses" (that's just what a Lisp is) — it's the specific set of
delimiters and how they disambiguate from each other, since that
disambiguation is exactly what Lesson 3's reader has to implement.

The concrete choice: `(` `)` for both function calls *and* special forms
(they look identical at the syntax level — only evaluation rules tell
them apart), `[` `]` for vectors, `{` `}` for maps, `#{` `}` for sets,
`:` prefixing a symbol-shaped token for a keyword, `"` delimiting strings,
`'` as reader shorthand for `(quote ...)`, and `;` starting a
line comment. Comments aren't in Curriculum.md's initial token list
(Section 3.2), but every lesson from here on writes `.clj` example files,
and a file format with no way to leave a note in it isn't usable in
practice — this is a from-scratch addition to the initial language,
justified by that practical need rather than by any reference source.

The one genuinely tricky rule, worth stating in the spec explicitly
because Lesson 3/4's reader has to encode it as real logic, not
intuition: a token is read as a **number** if it starts with a digit, or
starts with `-` or `+` immediately followed by a digit; otherwise, if it
starts with a legal symbol character, it's read as a **symbol**. This is
what lets `-5` read as negative five while `-` and `-foo` still read as
symbols — without the rule stated precisely, "is `-` a number or a
symbol" has no answer at all.

### Values

Curriculum.md Section 0.1 names the initial value set directly: `nil`,
boolean, integer, float, string, keyword, symbol. The spec's job is
saying what each *is*, not just naming it.

- `nil` represents the deliberate absence of a value. It maps to Python's
  `None` at the interop boundary (Section 18) rather than getting its own
  distinct runtime representation, because `nil` and `None` already mean
  the same thing — inventing a second "absence" value that isn't `None`
  would just create a translation problem at every Python interop call
  with no corresponding benefit.
- Booleans are `true` and `false`, lowercase — Clojure's spelling, chosen
  over Python's `True`/`False` capitalization because Clojupye's own
  keywords, syntax, and special forms are already lowercase throughout,
  and a single capitalized pair would be the only exception in the whole
  language for no functional reason.
- Integers and floats map directly to Python's arbitrary-precision `int`
  and IEEE-754 `float` — not because there's no other reasonable choice
  (a language could define its own fixed-width integers), but because
  transparent Python interop (Section 0.1's own stated end goal) means
  Python already receives Clojupye's numbers directly; giving them
  different runtime semantics than Python's own numbers would make that
  boundary lossy from day one.
- Strings map to Python `str`, for the identical reason.
- Keywords (`:name`) are **not** strings, even though they look like
  `":" + a name`. A keyword is self-evaluating (it evaluates to itself,
  the same as a number does — no environment lookup happens) and
  **interned**: every occurrence of `:name` anywhere in a running program
  is the same object. This matters concretely once maps exist (Section
  9.2) — using keywords as map keys only makes sense as a fast, reliable
  operation if comparing two keywords is an identity check, not a
  character-by-character string comparison.
- Symbols (`foo`, `some-name`) are names — but a symbol only evaluates to
  *the value it names* when it appears somewhere subject to normal
  evaluation. Quoted (`'foo`, or as an unevaluated element inside a
  quoted list), a symbol is inert data describing a name, not a lookup.
  This split — symbol as reference vs. symbol as data — is what makes
  Section 22's macro system possible at all: a macro's whole job is
  manipulating code that hasn't been evaluated yet, and code, in a Lisp,
  is made of exactly these same list/symbol/literal values.

### Collections

Curriculum.md Section 0.1 names four: list, vector, map, set. The
non-obvious rule the spec has to pin down is the asymmetry between them:
a **list is call syntax by default** — `(f x y)` means "evaluate `f`,
evaluate `x`, evaluate `y`, then apply." A **vector, map, or set literal
is never call syntax** — `[f x y]` means "evaluate each of `f`, `x`, and
`y`, and collect the three results into a new vector," full stop, no
matter what `f` looks like. This is exactly why `quote` exists as a
special form (Section 22.1 builds directly on it): it's the only way to
get a *list* that means "these three values, collected," instead of "call
the first one with the other two as arguments." Vectors, maps, and sets
never needed that escape hatch, because they were never call syntax to
begin with.

### Special forms

Section 0.1 names six: `def`, `let`, `if`, `do`, `fn`, `quote`. Each
gets a precise evaluation rule here, because "special form" specifically
means the normal call-evaluation rule (evaluate every sub-form, then
apply) does not apply, and *something* has to say what happens instead.

- `(def sym value)` evaluates `value` in the current environment, binds
  `sym` to that result in the top-level environment (there is no local
  `def`), and evaluates to `sym` itself — chosen over evaluating to the
  bound value so that a REPL session showing `x` after `(def x 10)`
  visibly confirms *which name* was just created, not just echo back a
  number the reader already typed.
- `(let [sym1 val1 sym2 val2 ...] body...)` evaluates each binding's
  value expression **in order**, in a new child environment where
  earlier bindings in the same `let` are already visible to later ones
  (this is what Lisps sometimes call `let*` semantics, chosen here as the
  only `let` this language has, rather than maintaining two different
  binding forms for a distinction beginners rarely want on purpose). The
  body forms then evaluate in that same new environment, in order, and
  the `let` as a whole evaluates to the last body form's value. The
  bindings exist only for the extent of the `let` — this is the rule
  Section 6.4's checkpoint exists to prove.
- `(if cond then else)` requires all three sub-forms in this initial
  specification (a two-argument, else-omitted form is not yet part of the
  language — it can be added later without breaking anything already
  specified, which is a reason to leave it out now rather than a reason
  it's impossible). `cond` is evaluated first; based on **truthiness**
  (below), exactly one of `then` or `else` is then evaluated — never
  both, and never neither. That "exactly one, never both" property is
  the entire reason `if` has to be a special form and can't be an
  ordinary function: an ordinary function call evaluates all of its
  arguments before the function ever runs, which would evaluate both
  branches unconditionally, running code the program never should have
  run.
- `(do form1 form2 ...)` evaluates each form in order, purely for
  whatever side effects it causes along the way, and evaluates to the
  last form's value. An empty `(do)` is legal and evaluates to `nil`.
- `(fn [param1 param2 ...] body...)` evaluates to a function value. The
  body is not evaluated yet — it only runs later, when the function is
  called. At call time, a new environment is created with the parameters
  bound to the argument values, and critically, that new environment's
  *parent* is the environment that was active when the `fn` form itself
  was evaluated — not the environment of whatever code is doing the
  calling. This is the closure rule: it's what lets a function returned
  from another function still see that outer function's local variables
  long after the outer call has already returned, and it's the single
  most load-bearing rule in this entire specification for this series'
  own stated goal of understanding closures deeply.
- `(quote form)` evaluates to `form` itself, completely unevaluated —
  the one special form whose entire job is to *suppress* the normal
  evaluation rule rather than to redirect it. `'form` is reader syntax
  for the identical thing, expanded before evaluation ever begins.

### Evaluation rules

Stated once, generally, rather than repeated per form: `nil`, booleans,
integers, floats, strings, and keywords are self-evaluating. A symbol
evaluates by looking itself up through the current environment's parent
chain, starting at the nearest enclosing scope and walking outward to the
top-level environment; looking up a name with no binding anywhere in that
chain is an error (see Error rules, below — not a silent `nil`, since a
silently-wrong value defeats the entire point of being able to trust a
program's output). A list evaluates by special-form dispatch if its first
element names one of the six forms above, or by ordinary call evaluation
(evaluate every element, apply the first to the rest) otherwise. Vectors,
maps, and sets evaluate every element (or key and value) and collect the
results — never call syntax, per Collections, above.

**Truthiness:** only `nil` and `false` count as false. Every other value
— including `0`, `0.0`, `""`, and empty collections, all of which some
other languages treat as false — counts as true. This is a real design
decision, not an accident: it means a function returning `0` as a
legitimate result never gets silently treated as "no result" by an `if`
checking it, which matters the moment this language starts wrapping
Python functions (Section 16 onward) that use `0` as an ordinary return
value.

### Scope rules

Clojupye is **lexically scoped**: a symbol resolves to whichever binding
textually encloses the reference in the source, found by walking the
chain of environments from innermost to outermost — never by which
binding happened to be dynamically active at the moment the code
actually ran. Environments form a parent-linked chain; `let` and a
`fn` call each create a new child environment; `def` only ever affects
the single top-level environment. An inner binding **shadows** an outer
same-named one for the extent of the inner scope, and the outer binding
is entirely unaffected once the inner scope ends — this is precisely
Curriculum.md Capability 6.4's checkpoint. A `fn` value's captured
environment (see `fn`, above) is what makes it a **closure** rather than
just a function: the environment it closes over is fixed at creation
time, permanently, regardless of where or how many times it's later
called.

### Python interoperability rules

This section is intentionally the least precise piece of this
specification, and says so rather than pretending otherwise: full Python
interoperability isn't implemented until Sections 16–20, several dozen
lessons from now, and locking in exact mechanics today risks writing
something those lessons then have to contradict. What's committed to now
is the *principle* those sections already establish in Curriculum.md
Section 17: the language interacts with Python **only** through a fixed
set of generic operations — import, attribute resolution, function call,
object construction, indexing, iteration, and exception handling — built
on Python's own generic introspection machinery (`getattr`, `setattr`,
`hasattr`, `callable`, `isinstance`, `importlib`). The compiler is never
allowed to gain special-cased knowledge of any individual library by
name. Primitive values (`nil`/booleans/integers/floats/strings) already
share a runtime representation with their Python equivalents, per
Values, above, so they need no conversion at that boundary at all. Exact
rules for compound values (how a Clojupye vector presents itself to a
Python function expecting a `list`, and vice versa) are deferred to
Section 18 by name, where they're decided for real.

### Module rules

Same treatment, for the same reason — Section 21 hasn't been built yet.
The committed principle: a Clojupye source file is a compilation unit; a
`(ns name)` form at the top of a file declares that file's namespace;
`(require ...)` makes another Clojupye module's public names available.
Exact visibility rules (what "public" means, whether it's opt-in or
opt-out) are deferred to Section 21 by name.

### Error rules

Two categories exist in the initial language, and the spec keeps them
separate on purpose because they're caught at different points in the
pipeline this project is building toward (Section 23 makes that pipeline
explicit; the categories already exist before that section does). **Reader
errors** are syntax problems the reader detects before any evaluation
happens at all — Curriculum.md Section 3.5 names the initial set
directly: an unexpected `)`, an unclosed `(`, `[`, or `{`, an invalid
number, an invalid string. **Evaluation errors** happen while a
well-formed program actually runs — an unbound symbol, calling a value
that isn't callable, a special form given the wrong number of sub-forms.
Every error, once the reader tracks source positions (Curriculum.md
Section 3.2), carries a filename, line, and column alongside its
message — before that lesson exists, an error is a plain Python exception
with a message only, and that's an honest, temporary limitation rather
than a rule being broken early.

The general philosophy behind both categories: errors fail loudly and
immediately, with no silent coercion — no automatic `nil`-to-zero, no
swallowed exception that lets a program keep running on bad data. That's
not an arbitrary preference; it's the same reason this project runs real
code and shows real output at every single lesson checkpoint rather than
describing what code "should" do — a language that quietly produces a
wrong-but-plausible value defeats the ability to trust what you're
looking at exactly as much as a lesson that never actually runs its own
examples would.

---

## Checkpoint

The deliverable is `LANGUAGE-SPEC.md`, in the project's root folder, containing
all eight required pieces: syntax, values, special forms, evaluation
rules, scope rules, Python interoperability rules, module rules, and
error rules. No compiler or interpreter exists yet — that's correct, not
incomplete; Curriculum.md Section 0 states this explicitly as the
boundary of this lesson.

## One sentence connecting this to what comes next

Lesson 1 builds the first thing this spec doesn't cover at all — a
runnable project shell and a REPL prompt — and every rule decided here
becomes something that shell will eventually need to obey, starting with
the very first literal value it prints back.
</content>
