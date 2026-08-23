# Lesson 4: What the Tools Are Already Telling You

**What you will build:** By the end of this lesson you will be able to
read a piece of official documentation and know what it is and isn't
telling you, read a real, unfamiliar library's actual source code when
documentation alone isn't enough, read a real compile error and a real
multi-frame stack trace and know exactly what each part means, search for
help effectively using an error's own real text, and — the actual point
of all of it — tell the difference between where a bug *shows up* and
where it actually *comes from*. Every one of this lesson's examples is a
real, deliberately broken or exception-throwing program, actually run on
this machine, with its real output shown, not invented.

**What you need to know first:** Lesson 1 — specifically, that Dart
reports real, specific compile errors (the missing-`main` and missing-
semicolon errors from Concept Units 6 and 7) rather than failing
silently, and that `print` is a real function with a real, documented
contract. Lesson 2 — specifically, that a process reports a real exit
code when it finishes, non-zero meaning failure.

**Terms used in this lesson:**

- **API (Application Programming Interface)** — the specific set of
  names, signatures, and behaviors a piece of software exposes for other
  code to use, without exposing how it's actually implemented
  underneath. It exists so code can depend on *what* something does
  without being tied to *how* it currently happens to do it — Lesson 1's
  `print` is one single, tiny example: `void print(Object? object)` is
  its API; the real, private mechanics behind that signature are this
  lesson's own subject.
- **API documentation** — human-written text describing an API's
  contract: what each piece does, what it expects, what it promises to
  return or produce. It exists because a signature alone
  (`void print(Object? object)`) tells you the shape of the deal, but not
  the actual behavior behind it — what "prints" really means, for
  instance, differs by platform, as this lesson's real, fetched
  documentation for `print` shows.
- **Source code** — already given a full Term entry in Lesson 1: the
  plain, human-readable text describing what a program should do.
  Reappearing here because this lesson treats it, for the first time, as
  something *read*, not just written — the real, final source of truth
  when documentation alone leaves a question unanswered.
- **Return statement (`return`)** — an instruction inside a function that
  ends that function's execution immediately and hands a specific value
  back to whatever called it. Lesson 8 covers what a function's return
  value fully means — and why a function's declared return *type* has to
  match what it actually returns — in full; this lesson only needs the
  narrow, concrete fact that `return value;` is how a function hands
  something back, the same narrow treatment Lesson 1 gave `main` itself.
- **Exception** — an object representing something that went wrong while
  a program was running, carrying information about what happened. It
  exists as a structured, inspectable alternative to a program simply
  crashing with no information, or silently continuing with corrupted
  results.
- **`throw`** — a statement that immediately stops normal execution and
  hands a specific exception object up and out of the function it's in,
  searching for something willing to handle it. It exists as the
  mechanism that actually *creates* the moment of failure an exception
  represents — an `Exception` object sitting unused in a variable has
  reported nothing yet; `throw`-ing it is what makes it real.
- **Unhandled exception** — an exception that was `throw`n but never
  caught by anything prepared to deal with it (catching itself is
  Lesson 14's subject, not this lesson's) — so it keeps propagating
  outward, function by function, until it reaches the very outside of
  the program, at which point the program itself stops running and
  reports the failure.
- **Call stack** — the real, live record the Dart runtime keeps, at every
  moment a program is running, of exactly which function called which,
  in order, to arrive at the code currently executing. It exists because
  a running program is very rarely executing just one function in
  isolation — it's usually several functions deep, each one waiting on
  the one it called, and something has to track that nesting.
- **Stack trace** — a printed report of the call stack's contents at one
  specific moment — almost always, the moment an unhandled exception
  reached the outside of the program. It exists so that when something
  goes wrong several function calls deep, you don't just learn *that* it
  went wrong — you learn the exact chain of calls that led there.
- **Stack frame** — one single entry in a stack trace, representing one
  function call: which function, and at what exact file, line, and
  column its execution had reached at that moment. It exists as the
  stack trace's own basic unit — a full stack trace is nothing more than
  a list of these, in order.
- **Compile-time error** — an error Dart's own tooling detects by
  examining source code itself, before ever running it — Lesson 1's
  missing-semicolon error is a real example: it happened without the
  program's logic ever executing at all, because Dart could not even
  finish translating the source into something runnable.
- **Runtime error** — an error that only happens because the program was
  actually *executing*, doing real work, when something went wrong —
  Lesson 1's missing-`main` case is subtler than it looks (Dart detects
  the *absence* of `main` before running anything, so it's actually
  compile-time too); this lesson's own stack-trace example is this
  curriculum's first genuine runtime error — the source is entirely
  valid Dart, and the failure only happens because of what the code
  actually does while running.
- **Root cause** — the actual, underlying mistake responsible for a
  problem, as opposed to wherever that problem happens to become
  visible. It exists as a target distinct from "symptom" (below) because
  fixing where a problem is *visible* does not necessarily fix what's
  actually *wrong*.
- **Symptom** — the visible evidence that something is wrong — an error
  message, a stack trace, or, as this lesson's own final example shows,
  simply the wrong output with no error at all — which may or may not
  point directly at the actual root cause.

**Objects and methods used:**

- **`print`**
  - *What it is:* Already given full CRC treatment in Lesson 1 — the
    top-level `dart:core` function that shows text to whoever is running
    the program.
  - *Implementation:* Lesson 1 described its documented *contract*:
    convert the argument to text, write it plus a newline to standard
    output. This lesson goes one real step further — its actual,
    fetched-this-session source, from the real Dart SDK:
    ```dart
    void print(Object? object) {
      String line = "$object";
      var toZone = printToZone;
      if (toZone == null) {
        printToConsole(line);
      } else {
        toZone(line);
      }
    }
    ```
  - *Its use:* This lesson's concrete example of the difference between
    what documentation promises and what source code actually shows
    happening — Concept Unit 2's own subject.
  - *Type:* a top-level function in `dart:core` — unchanged from Lesson
    1.
  - *Responsibility:* unchanged from Lesson 1 — convert its argument to
    text and write it, plus a newline, to standard output — but now with
    the real mechanism visible: not a direct call to `.toString()` as
    Lesson 1's prose put it, but Dart's **string interpolation**
    (`"$object"`, covered in full in this lesson's Concept Unit 2 below)
    — which itself calls `object`'s `toString()` internally to build that
    interpolated string. Lesson 1's description was accurate about the
    *effect*; this lesson's real source reveals the actual *mechanism*
    producing that effect.
  - *Depends on:* its one argument, and, newly visible here, a
    module-level variable named `printToZone` — real evidence for the
    official documentation's own claim, quoted in this lesson's Concept
    Unit 1, that "calls to print can be intercepted by Zone.print."
  - *Connects to:* unchanged in spirit from Lesson 1 — called by user
    code, writes to standard output — now with the real, specific
    intermediate step made visible: either `printToConsole` directly, or
    a zone's own print handler first, if one is registered.
  - *Shape:* unchanged from Lesson 1 — Dart's most basic public output
    mechanism — this lesson simply removes the black box around it.

- **`Exception`**
  - *What it is:* A real, built-in `dart:core` type representing "some
    problem happened," carrying an optional message describing what.
  - *Implementation:* Its real, fetched-this-session source from the
    Dart SDK:
    ```dart
    abstract interface class Exception {
      factory Exception([message]) => _Exception(message);
    }

    class _Exception implements Exception {
      final dynamic message;
      _Exception([this.message]);
      String toString() {
        Object? message = this.message;
        if (message == null) return "Exception";
        return "Exception: $message";
      }
    }
    ```
    `Exception(...)` is written and called like a plain constructor
    (`Exception('some message')`) but is actually a **factory
    constructor** — one that, instead of directly building the type it's
    declared on, is free to build and hand back a *different*, real
    class instead (here, the private `_Exception`) that actually
    implements the public `Exception` interface.
  - *Its use:* This lesson's `stack_trace_demo.dart` constructs one,
    with a specific message, as the exact thing `throw` sends outward
    when something goes wrong.
  - *Type:* an abstract interface class, with a factory constructor —
    genuinely different from an ordinary class, as its own real source
    above shows: calling `Exception(...)` never directly constructs an
    `Exception`; it always produces a real `_Exception` instead.
  - *Responsibility:* hold one specific, optional message describing
    what went wrong, and produce a real, readable string form of itself
    (via `toString()`) combining a fixed `"Exception: "` prefix with that
    message — nothing more; it does not stop execution or propagate
    itself anywhere on its own.
  - *Depends on:* an optional message, given as its one constructor
    argument.
  - *Connects to:* constructed by user code (this lesson's own
    `stack_trace_demo.dart`); handed to `throw` (below) to actually
    trigger propagation; its `toString()` is what produces the exact
    real text — `Exception: Row 3 has two 5s — puzzle is invalid` — this
    lesson's own real, captured output shows.
  - *Shape:* a small, public data-carrying type sitting at the boundary
    between "normal code" and Dart's own exception-propagation machinery
    — it is inert on its own; `throw` (a Term in this lesson, not an
    object — it's a statement, not a callable thing) is what actually
    activates it.

---

## Concept Unit: Reading API Documentation

### The Problem

Lesson 1 stated `print`'s contract in prose: convert the argument to
text, write it plus a newline to standard output. That description was
written by this curriculum's own author, from memory of how `print`
behaves — not quoted from anywhere official. Given that this curriculum
will spend the rest of its life relying on functions and classes neither
you nor this curriculum's author wrote, where does an authoritative,
trustworthy description of what something actually does come from, and
what exactly does it promise versus leave unstated?

> **Stop and think before reading on:** If you needed to know, right
> now, exactly what happens when `print` is given something whose text
> representation contains a line break in the middle of it, or whether
> `print`'s output can be intercepted or redirected somehow — would you
> expect Lesson 1's own one-paragraph description to already answer
> that? What kind of source would you look for instead?

### Project Change

- **Reference Source:** No reference counterpart — conceptual, using
  real, fetched documentation as evidence.
- **Files affected:** None.
- **Change type:** N/A — observation.
- **Location:** N/A.
- **Dependencies:** None.

### The New Code

No code — this unit inspects real, official documentation, fetched
directly from Dart's own public API reference at `api.dart.dev`, for the
exact `print` function this curriculum has already used since Lesson 1.

### The Updated Project

Not applicable — no code introduced.

### Introduce the concept in isolation

The real, fetched documentation for `print`, quoted directly, not
paraphrased:

> "Prints an object to the console." ... on native platforms, "object is
> converted to a string and that string is terminated by a line feed
> ('\n', U+000A) and written to stdout." On Windows specifically: "the
> terminating line feed, and any line feeds in the string representation
> of object, are output using the Windows line terminator sequence of
> ('\r\n', U+000D + U+000A)." Additional real detail: "Calls to print can
> be intercepted by Zone.print."

Two things this reveals that Lesson 1's own prose never mentioned:
`print`'s exact line-ending behavior differs by platform — genuinely
useful to know on a machine, like this one, running Windows — and its
output "can be intercepted," meaning something can, in principle, capture
or redirect what `print` writes before it reaches the real terminal.

### Discarding this observation

This exact quoted text is tied to Dart 3.13.1, the version this
curriculum's own machine has installed — documentation for a future Dart
version could, in principle, word this differently. What carries
forward: official API documentation is the authoritative source for a
function's *contract* — but, as this unit's own real quote shows, a
contract can promise a capability ("can be intercepted") without
explaining *how* it actually works — which is exactly the gap the next
unit exists to close.

### Mechanical walkthrough

- **The signature, `void print(Object? object)`** — already fully
  explained in Lesson 1; restated by the real documentation exactly as
  Lesson 1 gave it, confirming Lesson 1's own claim was accurate.
- **The platform-specific line-ending text** — real, documented behavior
  neither this curriculum nor its reader invented; on this Windows
  machine specifically, `print`'s real newline is `\r\n`, not the bare
  `\n` a Linux or macOS machine would use for the exact same call.
- **"Calls to print can be intercepted by Zone.print"** — a real,
  documented capability, naming a mechanism (`Zone.print`) this lesson
  does not otherwise explain — an honest gap in what documentation alone
  tells you, exactly the kind of gap this lesson's next unit exists to
  close by reading real source instead.

### CS lens

Documentation that describes a contract — what goes in, what comes out,
what's promised — without describing the actual internal mechanism
achieving it, is the documentation-level version of **encapsulation**: a
recurring, load-bearing idea in this entire curriculum (first properly
named at Lesson 11) where something's *interface* is kept deliberately
separate from its *implementation*, so the implementation is free to
change without breaking anything that only ever depended on the
documented contract.

```
Also recognized in: a car's dashboard (speed, fuel level) telling
you nothing about the engine's actual mechanics, a restaurant menu
describing a dish without revealing the recipe, a REST API's public
documentation versus its actual server code, a light switch's
on/off contract hiding the real wiring behind the wall
```

### SE lens

Keeping documentation separate from, and less detailed than, the real
source is a deliberate tradeoff: documentation that's easy to read
quickly, without wading through real implementation code, is genuinely
more useful for the extremely common case of "I just need to know what
this does" — at the real cost that documentation can drift out of sync
with what the code actually does, or, as this unit's own real quote
shows, can reference a real mechanism ("Zone.print") by name without
explaining it, leaving a real gap only the source itself can close.

### Commands needed

None — this unit's evidence came from a real, official public
documentation page; no local tool or install is required to read it.

### Run it

The quoted documentation text above is real, fetched directly from
Dart's own official public API reference this session, not paraphrased
from memory — per the Verification Rule, an official contract's exact
wording is not something to state from confidence when the actual source
is checkable, and it was checked, saved in
`src/docs/flutter/verification/lesson-04/run-log.md`.

### Connecting this unit

This unit established that documentation is authoritative for a
function's contract, but showed, with a real, quoted gap ("can be
intercepted," unexplained), that a contract can promise something without
explaining the mechanism behind it. The next unit closes exactly that
gap, for this exact function, by reading its real source.

---

## Concept Unit: Reading Real Source Code

### The Problem

The previous unit's real, quoted documentation for `print` mentioned
"Zone.print" interception without explaining what that means or how it
works. Documentation is not always complete, and it is not always even
available — some code you'll depend on later in this curriculum will have
thin or missing documentation entirely. When documentation runs out,
what's left to read?

> **Stop and think before reading on:** `print` is not some mysterious,
> unreachable part of Dart — Lesson 1 already established it's a real
> function, in a real file, on this real machine. Given that, do you
> think its actual source code is something you could go find and read
> yourself, right now, on your own machine — or is it hidden away
> somewhere inaccessible?

### Project Change

- **Reference Source:** No reference counterpart — conceptual, backed by
  real, fetched Dart SDK source.
- **Files affected:** None.
- **Change type:** N/A — observation.
- **Location:** N/A.
- **Dependencies:** None.

### The New Code

No code to type — real source, fetched this session directly from the
Dart SDK's own public repository, for the exact `print` function used
since Lesson 1:

```dart
void print(Object? object) {
  String line = "$object";
  var toZone = printToZone;
  if (toZone == null) {
    printToConsole(line);
  } else {
    toZone(line);
  }
}
```

### The Updated Project

Not applicable — no code introduced into any tracked file.

### Introduce the concept in isolation

This is the real, actual body behind the contract the previous unit's
documentation only described — proof, not an appeal to authority, that
`print` is ordinary, readable, inspectable code, not opaque magic built
into the language itself. It directly answers the previous unit's own
unexplained mention of "Zone.print interception": the real `toZone`
variable, checked with a real `if`, is exactly that mechanism made
visible — if something has registered a zone-specific print handler,
`print` calls that instead of writing to the console directly.

### Discarding this observation

This exact source snapshot reflects the Dart SDK's current `main` branch
at the time this lesson was written — like any real, actively-maintained
project, it could be refactored in the future without changing its
documented contract at all (Concept Unit 1's SE lens, encapsulation, in
direct action). What carries forward: real source code, not
documentation, is the final, authoritative answer when a contract alone
doesn't explain the mechanism behind it — and it was genuinely
reachable, not hidden.

### Mechanical walkthrough

- **`String line = "$object";`** — **string interpolation**: embedding
  an expression (`object`) directly inside a string literal using `$`,
  producing a new string built from that expression's own text form.
  This is the real mechanism Lesson 1's prose simplified as "calls
  `object`'s `toString()`" — string interpolation of a single bare
  expression like this really does call that expression's `toString()`
  internally to build the interpolated text, so Lesson 1's description
  was accurate about the *effect*, and this is the first time this
  curriculum has shown the actual Dart *syntax* achieving it.
- **`var toZone = printToZone;`** — reading a module-level variable
  (`printToZone`, not shown/defined in this excerpt, but real and
  present in the same real file) into a new local variable named
  `toZone`. `var` lets Dart infer this variable's type from what it's
  assigned, rather than writing the type explicitly — Lesson 5 covers
  variables and type inference in full; here it's enough to see that
  `toZone` now holds whatever `printToZone` currently holds.
- **`if (toZone == null)`** — a conditional check, already familiar in
  spirit from ordinary logic even before Lesson 6 formally covers `if`
  statements; `== null` specifically asks whether nothing has been
  registered there.
- **`printToConsole(line);`** — a function call (Lesson 1's own
  function-call concept, reused) to a different real function, not shown
  in this excerpt, whose job is writing directly to the real console.
- **`toZone(line);`** — a different kind of call than the one just
  above: calling `toZone` itself, as if it were a function — proof that
  `toZone` isn't ordinary data but a reference to *callable* code, handed
  off to whatever registered it as a zone's print handler.

### CS lens

Checking whether an optional hook has been registered, and routing
through it instead of the default behavior only when it has, is a real
instance of the **hook pattern** (also called an **extension point**):
letting outside code customize one specific, well-defined moment of
behavior without needing to modify the original function at all. Every
later lesson that involves a callback — Lesson 32 (gesture handling),
Lesson 37 (unidirectional data flow) — is a variation on this exact same
underlying shape: "call this other, externally-provided piece of code at
exactly this one point, if one was given."

```
Also recognized in: a web browser's addEventListener (Concept Unit
worked example, Lesson Schema itself), a plugin architecture in an
IDE, a video game's modding API, WordPress's own "hooks and
filters" system, an audio mixer's insert/effects loop
```

### SE lens

Reading real source code, rather than only ever trusting documentation
or a secondhand explanation, costs real time and requires being able to
actually navigate an unfamiliar codebase — a genuinely harder skill than
reading a paragraph of prose. The real payoff, proven directly in this
unit: documentation can (accurately) promise a capability ("can be
intercepted") without explaining how, and a secondhand paraphrase risks
being subtly wrong in exactly the way the Lesson Schema itself warns
about — the real fix is always the same: go to the actual, current,
official source and read it yourself, which is exactly what this unit
did.

### Commands needed

None required to *read* real source — Dart's own SDK source ships
alongside the SDK installed in Lesson 1, and an IDE's "go to definition"
feature (VS Code, in this curriculum's case) opens it directly, with no
separate command needed. This unit's real quote was instead fetched from
Dart's public source repository directly, for full transparency about
exactly which real file it came from.

### Run it

The real source shown above was fetched directly from the Dart SDK's own
public repository this session, not reconstructed from memory or trusted
from a secondhand paraphrase — per the Verification Rule and the Lesson
Schema's own explicit standard for showing a real implementation body as
proof, this is the genuine, current source, not an approximation. Saved
in full in `src/docs/flutter/verification/lesson-04/run-log.md`.

### Connecting this unit

The previous unit established documentation as the authoritative source
for a contract; this unit established real source as the authoritative
source for the mechanism behind it, when documentation alone isn't
enough. The next two units turn from reading code that already works to
reading what Dart itself reports when code *doesn't*.

---

## Concept Unit: The Anatomy of an Error Message

### The Problem

Lesson 1 already triggered two real compile errors — a missing `main`,
and a missing semicolon — and showed their real text, but never broke
either message down into its actual parts. An error message is not just
an undifferentiated blob of text to pattern-match against; each piece
tells you something specific. What does each part of a real Dart error
actually mean?

> **Stop and think before reading on:** Look back (or recall) Lesson 1's
> real missing-semicolon error: `no-semicolon.dart:2:24: Error: Expected
> ';' after this.` Before reading on: how many genuinely distinct pieces
> of information do you think are packed into that one line? What do you
> think each of the three numbers-and-colons at the start is actually
> telling you, separately from the sentence that follows?

### Project Change

- **Reference Source:** No reference counterpart — reusing Lesson 1's
  own already-real, already-verified errors rather than re-triggering
  them, per this curriculum's verification-folder reuse convention.
- **Files affected:** None — pure analysis of already-captured, real
  error text.
- **Change type:** N/A — observation.
- **Location:** N/A.
- **Dependencies:** None.

### The New Code

No new code — reusing Lesson 1's own real, already-captured error text:

```
no-semicolon.dart:2:24: Error: Expected ';' after this.
  print('Hello, World!')
                       ^
```

### The Updated Project

Not applicable.

### Introduce the concept in isolation

This is not a re-run — it is Lesson 1's own real, already-verified output
(Concept Unit 7), reused here per this curriculum's own verification
convention: real evidence, once captured and saved, does not need to be
re-triggered to be examined again. Breaking it into its real, distinct
parts:

- `no-semicolon.dart` — the exact file the error was found in.
- `2:24` — the exact line and column: line 2, character 24, of that file.
- `Error:` — the real severity level Dart assigns this message (as
  opposed to a `Warning`, a real, different category this curriculum
  will meet later, which does not stop a program from running).
- `Expected ';' after this.` — the actual, specific problem, in Dart's
  own words.
- The two-line excerpt underneath, with a `^` — the real source line the
  error refers to, with a caret marking the exact column position `2:24`
  named above.

### Discarding this observation

This exact error is not being re-triggered here — it is being re-
examined. What carries forward: a Dart error message is not one
undifferentiated sentence; it is several genuinely separate, useful
pieces (location, severity, specific complaint, source excerpt), each
answerable on its own before you've even started fixing anything.

### Mechanical walkthrough

- **`no-semicolon.dart:2:24`** — this exact format (`file:line:column`)
  is not unique to Dart; it's a broadly shared convention across many
  languages' tools specifically so an IDE or editor can parse it
  automatically and jump the cursor directly to the exact spot,
  rather than a human having to manually count lines.
- **`Error:`** — Dart's own real severity marker; **compile-time
  errors** (this lesson's Term, above) are always reported this way,
  and — as this unit's own real example is — always stop the program
  from running at all, unlike a warning.
- **`Expected ';' after this.`** — worth reading literally, not just
  pattern-matched: Dart is not claiming a semicolon is *missing* in the
  abstract — it's reporting, precisely, that having just finished
  parsing `print('Hello, World!')`, it *expected* to find a `;`
  immediately next, and found something else instead (the line ending).
- **The caret (`^`)** — points at the exact real column (`24`) named in
  the first line — direct, visual confirmation that the location
  reported in text and the location marked in the excerpt are the same
  real position, not two separate, unrelated claims.

### CS lens

A compiler reporting the exact location a problem was detected, not just
that one exists somewhere, is the practical product of **parsing** —
the process (already touched conceptually in Lesson 1's Concept Unit 3,
source code needing translation) of reading source text according to a
language's grammar and tracking, precisely, where in that text each
piece came from. A parser that only ever reported "your program has a
syntax error, somewhere" would technically be accurate but nearly
useless — real compilers track position information specifically so
error messages can be this precise.

```
Also recognized in: a spell-checker underlining one specific
misspelled word rather than flagging "this document has an error,"
a GPS reporting your exact coordinates rather than just "you are
somewhere," a proofreader's red pen marking one exact word, a
building inspector's report citing a specific room and wall, not
just "the house"
```

### SE lens

The real tradeoff a compiler author faces here: precise, per-token
location tracking (line and column, as Dart's real error shows) costs
real implementation complexity — every stage of translation has to carry
that position information along, not just the text itself — in exchange
for making every reported error immediately, mechanically locatable,
instead of requiring a human to manually search the whole file for
"whatever might be wrong." Every serious compiler and static analyzer
made this same tradeoff decades ago; the alternative (vague, unlocated
errors) genuinely used to be more common in early tooling and was a real,
widely-felt source of developer frustration.

### Commands needed

None new — this unit reused Lesson 1's own already-run `dart run
no-semicolon.dart` output rather than re-running it.

### Run it

The error text examined here is Lesson 1's own real, already-verified,
already-saved output — not re-triggered, and not reconstructed from
memory; it is reused directly from
`src/docs/flutter/verification/lesson-01/run-log.md`, consistent with
this curriculum's verification-folder reuse convention (check before
re-running).

### Connecting this unit

This unit broke a real compile-time error into its actual, meaningful
parts. The next unit turns to a genuinely different kind of failure —
one Dart cannot catch just by reading your source, because the source is
completely valid; the mistake only becomes visible once the program
actually runs.

---

## Concept Unit: Stack Traces

### The Problem

Every error this curriculum has triggered so far has come from a single
line failing on its own. Real programs are rarely that flat — a bug
often surfaces several function calls deep, in code that was itself
called by other code, which was called by still other code. Lesson 1's
Concept Unit 2 established that the operating system tracks what a
process is doing; does anything track, specifically, which function
called which, so a failure deep inside a chain of calls can be traced
back to how it was reached?

> **Stop and think before reading on:** Picture three functions:
> `main` calls `checkPuzzle`, which calls `loadRow`, which fails. If all
> you were told was "something failed inside `loadRow`," would you know
> *why* `loadRow` was even called in the first place, or what `main` and
> `checkPuzzle` were doing at the time? What additional information would
> you want, beyond just naming which function failed?

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  example built specifically to produce a real, multi-frame trace.
- **Files affected:** Created:
  `verification/lesson-04/stack_trace_demo.dart`.
- **Change type:** Add (new file).
- **Location:** `src/docs/flutter/verification/lesson-04/`.
- **Dependencies:** A working `dart` command (Lesson 1).

### The New Code

```dart
void main() {
  checkPuzzle();
}

void checkPuzzle() {
  loadRow();
}

void loadRow() {
  throw Exception('Row 3 has two 5s — puzzle is invalid');
}
```

### The Updated Project

Not applicable — a brand-new, freestanding file.

### Introduce the concept in isolation

Running this file for real produces this genuine, unedited output:

```
Unhandled exception:
Exception: Row 3 has two 5s — puzzle is invalid
#0      loadRow (file:///.../stack_trace_demo.dart:10:3)
#1      checkPuzzle (file:///.../stack_trace_demo.dart:6:3)
#2      main (file:///.../stack_trace_demo.dart:2:3)
#3      _delayEntrypointInvocation.<anonymous closure> (dart:isolate-patch/isolate_patch.dart:313:19)
#4      _RawReceivePort._handleMessage (dart:isolate-patch/isolate_patch.dart:192:12)
```

(File paths abbreviated with `...` here for readability; the real, full
`file:///C:/Users/...` paths are saved in the verification log.) This is
called a **stack trace**, and this real, five-frame trace directly
answers this unit's own Socratic prompt: it doesn't just say "`loadRow`
failed" — it shows the entire real chain that led there, in order, with
an exact file, line, and column for every single step.

### Discarding this example

`stack_trace_demo.dart`'s specific fictional puzzle-validation message
is not something this curriculum's real project will ever use — it
existed purely to produce a real, genuine, multi-frame trace worth
reading. What carries forward: a stack trace is a real, ordered record of
the exact call chain active at the moment of failure, not a summary or an
approximation.

### Mechanical walkthrough

- **`Unhandled exception:`** — Dart's own real header line, confirming,
  by name, this lesson's own Term: nothing in this program caught the
  exception before it propagated all the way out — an **unhandled
  exception**, exactly as defined above.
- **`Exception: Row 3 has two 5s — puzzle is invalid`** — the real result
  of calling `toString()` on the `Exception` object this program threw —
  this lesson's own header already showed the exact real source
  (`_Exception.toString()`) producing precisely this `"Exception:
  $message"` shape.
- **`#0      loadRow (...:10:3)`** — the first, innermost **stack
  frame**: the function executing at the exact moment of failure
  (`loadRow`), and the exact file, line (`10`), and column (`3`) — the
  real location of the `throw` statement itself.
- **`#1      checkPuzzle (...:6:3)`** — the next frame out: the function
  that called `loadRow`, and the exact line (`6`) where that call
  happened — direct proof `checkPuzzle` is where `loadRow()` was
  actually invoked.
- **`#2      main (...:2:3)`** — the next frame out: `main` itself, and
  the exact line (`2`) where it called `checkPuzzle`.
- **`#3` and `#4`, referencing `dart:isolate-patch/...`** — two further
  frames, but no longer inside this program's own code at all — real,
  internal Dart runtime machinery responsible for actually starting
  `main` in the first place. Recognizing these as "not my code" is
  itself a real, useful skill: the frames worth reading closely, when
  diagnosing your own bug, are almost always the ones naming files you
  actually wrote — here, frames `#0` through `#2` — not the runtime
  internals underneath them.
- **The frame ordering itself** — frame `#0` is always the *innermost*,
  most recent call (where execution actually was), counting *outward*
  toward whatever originally started the program — the exact reverse of
  reading order if you traced the program's actual execution from its
  start, which is why `main` (the true starting point) appears near the
  *bottom* of the trace, not the top.

### CS lens

The call stack a stack trace reports on is a real instance of a **stack**
data structure — a collection where the most recently added item is
always the first one removed or inspected (**LIFO**: Last In, First
Out) — this curriculum's first real encounter with a named,
general-purpose data structure, before Lesson 9 (Collections) formally
introduces any. Every function call pushes a new frame on top; every
function *returning* pops one back off; a stack trace is simply a
snapshot of everything currently pushed, read from the top down.

```
Also recognized in: a stack of plates (you take from, and add to,
only the top), the browser back button (most recently visited page
first), the undo command in a text editor, a stack of trays in a
cafeteria, nested parentheses in math needing to close in reverse
of how they opened
```

### SE lens

Unwinding all the way out to the very top of the program on an unhandled
exception — rather than, say, silently ignoring the failure and
continuing to run in some possibly-corrupted state — is a deliberate,
real tradeoff: it guarantees a program never keeps running on top of a
known-broken assumption, at the real cost that one uncaught problem, deep
in a large program, stops everything, not just the one feature that
failed. Lesson 14 (Exceptions) covers `try`/`catch` — the real mechanism
for choosing, deliberately, *where* that unwinding should be allowed to
stop early instead of reaching all the way to the top, as it did in this
lesson's own uncaught example.

### Commands needed

- **`dart run <file>.dart`** — already given full treatment in Lesson 1;
  used identically here.

### Run it

The real, five-frame stack trace shown above is genuine output from
actually running `stack_trace_demo.dart` on this machine — per the
Verification Rule, exact stack-trace contents (including internal
runtime frame names and line numbers) absolutely cannot be predicted in
advance and were captured for real, saved in full, unabbreviated form in
`src/docs/flutter/verification/lesson-04/run-log.md`.

### Connecting this unit

This unit showed a failure that announces itself loudly — a real,
detailed, multi-frame trace, impossible to miss. The final unit of this
lesson shows the opposite, and arguably harder, case: a real program that
runs to completion, reports no error at all, and is still wrong.

---

## Concept Unit: Distinguishing Symptom from Cause

### The Problem

Every failure this lesson has shown so far announced itself: a real
error message, a real stack trace, a real non-zero exit code. Not every
bug does. A program can run to completion, exit successfully, and still
produce the wrong result — with nothing in its output flagging that
anything is wrong at all. How do you even notice a bug like that, and
once you have, how do you find where it actually comes from?

> **Stop and think before reading on:** Picture a program that calls
> `printWelcome()`, which calls `print(greeting())`, and `greeting()`
> returns a string. If the program printed the wrong text — a real typo
> — with no crash and no error message anywhere, where would you actually
> look first: at the `print` call where the wrong text became visible, or
> somewhere else? What's the difference between "where the problem is
> visible" and "where the problem actually is"?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** Created:
  `verification/lesson-04/symptom_vs_cause.dart`.
- **Change type:** Add (new file).
- **Location:** `src/docs/flutter/verification/lesson-04/`.
- **Dependencies:** A working `dart` command (Lesson 1).

### The New Code

```dart
void main() {
  printWelcome();
}

void printWelcome() {
  print(greeting());
}

String greeting() {
  return 'Welcom to Sudoku!';
}
```

### The Updated Project

Not applicable — a brand-new, freestanding file.

### Introduce the concept in isolation

Running this file for real produces this genuine output:

```
Welcom to Sudoku!
```

with a real exit code of `0` — success. No error. No stack trace. No
warning of any kind. And yet the output is wrong: `Welcom` is missing a
final `e`. This is exactly this unit's own Socratic prompt made real: the
**symptom** — the wrong text on screen — is visible at the `print` call
inside `printWelcome`. The **root cause** — the actual typo — is one
function call deeper, inside `greeting`, which is the only place that
literal text was ever written.

### Discarding this example

This exact typo (`Welcom`) is not a real bug this curriculum's project
will ever carry forward — it exists only to make one distinction
concrete. What carries forward: **tracing a wrong value back through a
call chain to whichever function actually produced it** — not just
reading the line where it was finally displayed — is how a symptom-only
bug like this one actually gets solved.

### Mechanical walkthrough

- **`printWelcome()`** — a real function call (Lesson 1's function-call
  concept, reused); notably, calling it produces *no visible clue at
  all* that anything inside it is wrong — a call succeeding without
  error tells you nothing about whether its result was correct.
- **`print(greeting())`** — a function call (`greeting()`) nested
  directly as the argument to another (`print(...)`); `greeting()` runs
  first, produces its return value, and *that* value — already wrong at
  this point — is what gets handed to `print`. `print` itself is
  completely blameless here: it faithfully printed exactly the string it
  was given.
- **`return 'Welcom to Sudoku!';`** — the real return statement (this
  lesson's own Term, above) that is the actual, sole source of the wrong
  text: this is the one and only place in the whole program that literal
  string was ever written, which is exactly why it's the real root
  cause, not `printWelcome`'s call to `print`, where the mistake merely
  became *visible*.

### CS lens

Tracing a wrong value backward through a chain of calls to find which one
actually introduced it — rather than only inspecting the one place it was
finally observed — is a real, named diagnostic technique: **root cause
analysis**. The general principle behind it — a system's *output* being
wrong doesn't tell you *where*, only *that*, and finding "where" requires
walking backward through however many steps produced that output —
recurs constantly, in forms this curriculum will meet directly: a wrong
score displayed in Lesson 56 might trace back to a wrong calculation in
Lesson 69's scoring logic; a corrupted save in Lesson 55 might trace back
to a mapping bug from Lesson 46, several layers away from where the
corruption was actually noticed.

```
Also recognized in: a doctor diagnosing an underlying illness
rather than only treating a visible symptom, an factory investigating
which specific machine on an assembly line actually produced a
defective part rather than just the station where it was caught, a
detective tracing a crime back to its actual perpetrator rather than
stopping at the first witness, an airplane crash investigation
tracing a chain of contributing causes rather than stopping at "the
plane crashed"
```

### SE lens

A bug that produces no error at all, only wrong output, is a real,
meaningfully harder category than every other failure this lesson
covered: a stack trace or compile error *tells you*, immediately and
specifically, where to start looking; a silent wrong-output bug gives you
nothing but the final, incorrect result and requires you to reconstruct
the chain of reasoning yourself. This is the real, concrete engineering
argument, made properly starting Lesson 80 (Testing), for writing
automated tests that check *actual results* against *expected results* —
a test would have caught this exact bug immediately, the moment
`greeting()` was written, rather than requiring a human to eventually
notice a single missing letter in printed output.

### Commands needed

- **`dart run <file>.dart`** — already given full treatment in Lesson 1;
  used identically here.

### Run it

The real output (`Welcom to Sudoku!`, exit code `0`) shown above is
genuine, unedited output from actually running this file on this
machine — per the Verification Rule, this is exactly the kind of claim
(does this specific, deliberately-buggy program actually produce this
specific wrong text, with no error) that has to be checked, not assumed;
saved in full in `src/docs/flutter/verification/lesson-04/run-log.md`.

### Connecting this unit

Every earlier unit in this lesson dealt with a failure that announced
itself in some way — an error message, a stack trace. This final unit
showed the harder, quieter case: correct-looking execution producing a
wrong result, with root cause and symptom in two different places. Every
tool this lesson taught — reading documentation, reading real source,
reading an error's exact anatomy, reading a stack trace's real call
chain — exists in service of exactly this one underlying skill: not
just seeing that something is wrong, but finding out, precisely, why.

---

## Connect the Pieces

One thread through every unit this lesson built, from documentation down
to a single missing letter:

1. **Concept Unit 1** established documentation as the authoritative
   source for a contract, using `print`'s own real, fetched
   documentation — and found a real, honest gap in it ("can be
   intercepted," unexplained).
2. **Concept Unit 2** closed that exact gap by reading `print`'s real,
   fetched source, revealing the actual mechanism (`printToZone`) behind
   the documentation's own claim — and, along the way, revealed that
   Lesson 1's own simplified description of `print` was accurate about
   effect, not mechanism.
3. **Concept Unit 3** took a real error this curriculum had already
   triggered back in Lesson 1 and broke it into its real, separately
   meaningful parts — location, severity, specific complaint.
4. **Concept Unit 4** produced a real, five-frame stack trace from a
   three-function call chain, and showed how to read it: innermost frame
   first, real file/line/column per frame, and how to tell "my code"
   apart from Dart's own runtime internals.
5. **Concept Unit 5** showed the hardest case of all: a real program that
   fails with no error whatsoever, and traced its wrong output back,
   function by function, from where it was *visible* (`printWelcome`) to
   where it was actually *wrong* (`greeting`).

Every one of Phase 0's four lessons has now built one piece of the same
foundation: Lesson 1 set up the real tools; Lesson 2 taught commanding
them directly from the terminal; this lesson taught reading everything
those tools report back — documentation, source, errors, and traces —
closely enough to trust it. Phase 1 begins next, with Lesson 5, and
finally starts writing real Dart programs beyond the deliberately small,
narrowly-scoped fragments Phase 0 needed along the way.
