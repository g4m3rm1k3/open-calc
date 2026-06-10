# Lesson Contract

Every lesson in this curriculum — whether written by a human or an agent — must meet
this contract. It is not a style guide. It is a definition of what teaching means here.
A lesson that does not meet this contract is not a lesson. It is documentation.

---

## The Silent Knowledge Problem

Software engineering tutorials have a structural flaw: they teach the topic and skip
everything around it. The result is a learner who can implement a binary search tree
but does not know what `npm install` actually does, cannot read a stack trace, has
never typed `git commit`, and does not know what XSS is — even though all of those
things appeared in every tutorial they completed.

This happens because every tutorial assumes someone else taught the surrounding knowledge.
A learner with colleagues absorbs it through proximity over years. A learner on their
own, with a day job and no team, never does.

This curriculum treats every domain of software engineering knowledge as a teaching
obligation. The rule is absolute:

**If something appears in a lesson — regardless of what domain it comes from — it is
taught at the moment it appears. No concept earns a pass by being considered
"obvious," "just tooling," or "not the topic of this lesson."**

A terminal command is not "just how you run things." A port number is not "just
where the server is." A `.gitignore` entry is not "just housekeeping." These are
concepts with precise meanings, design reasons, and real-world implications. They
are taught the same way the lexer and the rotation matrix are taught: from first
principles, at the moment they appear, with the why stated before the what.

The "first use then assume" rule applies universally across all domains. Every concept
is explained fully once. After that first explanation, it may be referenced by name
without re-explanation. The checklist tracks this: if a concept from any domain
appears for the first time in this lesson, it must be explained here. If it appeared
in a prior lesson, a brief reference is enough.

---

## The Difference Between Describing and Teaching

A description tells you what something does.
A lesson explains why it works, what it connects to, and what breaks without it.

**Description:** `tokenize()` reads a string and returns a list of tokens.

**Teaching:** We separate tokenising from parsing because the parser should never
have to think about whitespace, comments, or raw characters. If the parser had to
skip spaces while also tracking operator precedence, both jobs would be harder and
both would be harder to test. `tokenize()` is the first application of separation
of concerns in this codebase. Every bug in the lexer is isolated to one file.

The test for whether you are teaching: could a student explain not just what the
code does, but why it is written that way and what would go wrong if it were not?

---

## The Two Lenses

Every non-trivial piece of code in a lesson must be explained through two lenses.

**The CS lens** — What is this computationally?
Name the concept. Finite state machine. Hash map lookup. Recursive descent. Stack frame.
Do not let a concept be implicit. If the code embodies a concept, name it and explain it.

**The SE lens** — How does this fit the system?
Name the principle. Separation of concerns. Single responsibility. Dependency inversion.
Explain why this design decision was made, not just what it is. Connect it to the code
around it. A student should be able to say: "This is here because without it, X would
have to know about Y, and that coupling would cause Z."

Both lenses apply to every significant piece of code. Neither is optional.

---

## Agile Delivery

Agile is not a process. It is a principle: always have working software.
Every lesson must end with something the student can run and see. Not "we will wire
this up in the next lesson." Not "this will make sense once we add the parser."
Working. Now. Visible. Now.

### The visualiser comes first

The first thing built in any project with a visual output is the visual output.
A hardcoded triangle on a canvas. A console that echoes text. Whatever the end state
looks like — build a skeleton of it on day one so every lesson after it adds to
something real and visible.

This is not just good teaching. It is good engineering. A stakeholder who sees the
product for the first time at the end of a project will ask for changes that require
rewriting everything built before they saw it. A stakeholder who has seen it from
lesson one has been giving feedback the entire time.

### Never build invisible infrastructure first

Do not build a data model before there is a screen to show it.
Do not build a parser before there is a console to print its output.
Do not build CSS variables before there is HTML that uses them.

If a lesson produces something that cannot be seen or run until a future lesson
adds more code, the lessons are in the wrong order. Reorder them.

### Each lesson is a vertical slice

A vertical slice delivers something complete end-to-end, however small.
Not "the bottom half of the system." Not "the data layer." A thin complete slice:
input → processing → visible output.

A lesson that delivers only infrastructure — types, utilities, helpers — with no
visible result is not a vertical slice. It is waterfall with extra steps.

### Lesson order follows visibility

Sequence lessons so that each one extends what is already visible, not what is
theoretically correct. The technically correct order (lexer → parser → evaluator →
visualiser) is often the worst teaching order because nothing is visible until the
end. Reorder so the student sees something at every step.

---

## Code Standards

### Break to the smallest runnable unit

Do not present a complete implementation and then explain it.
Build the implementation one piece at a time. Each piece must run.

Each code block in a lesson must:
- Be runnable or testable on its own, or be clearly labelled as a fragment
- Be fully explained before the next block is introduced
- End with the reader understanding what they just built and why

If you cannot explain a code block before moving to the next one, the block is too large.
Split it.

### No code is in a bubble

Every code block connects to something. State that connection explicitly.

- "This builds on the `Token` type we defined in the previous block."
- "This is where the environment from lesson 05 is first used."
- "This is the function the parser will call — we are designing its API before we write the parser."

If a reader could lift the code block out of the lesson and not know where it belongs
in the system, the connection has not been made.

### Build in visible order

Write code in the order it can be seen and verified, not in the order it will
eventually execute.

Do not write CSS before there is HTML to style. Do not write a data model before
there is a screen to render it. Do not write a parser before there is a console to
print its output.

The rule: at every step, the student must be able to run what exists and see something.
If a piece of code produces no visible result until three more pieces are added, the
lesson is in the wrong order. Reorder it so each piece reveals itself immediately.

This is not just pedagogy — it is how good software is built. A component that cannot
be tested or seen in isolation has no feedback loop. No feedback loop means no way
to know if it is working.

### Names are always descriptive

No single-letter variable names. No abbreviations that are not universally understood.
Names communicate intent. A name that requires a comment to explain it is a bad name.

```typescript
// BAD
const n = tokens.length
const t = tokens[i]
const res = evaluate(ast)

// GOOD
const tokenCount = tokens.length
const currentToken = tokens[currentIndex]
const evaluationResult = evaluate(syntaxTree)
```

This applies to all code in every lesson without exception. Students learn to name
things by seeing good names modelled consistently. A single-letter variable in a
lesson teaches students that single-letter variables are acceptable. They are not.

The only exception is established mathematical notation where the letter is the concept:
`x` and `y` for coordinates, `i` and `j` for matrix indices, `θ` for an angle.
In those cases, the mathematical meaning must be stated explicitly.

### Comments explain the non-obvious

Do not write comments that restate the code.

```typescript
// BAD: iterates over each character
for (const char of source) { ... }

// GOOD: we process one character at a time because the state machine
// only ever needs to look one character ahead — lookahead(1) is sufficient
// for this grammar. If we needed lookahead(2), this loop structure would change.
for (const char of source) { ... }
```

A comment that could be deleted without losing any understanding should be deleted.
A comment that cannot be deleted without losing something should stay.

---

## Explanation Standards

### Explain before you show

Before presenting a code block, explain what problem it solves.
After presenting it, explain what decision it embodies and what it connects to.

Structure within a lesson section:

1. **The problem** — what are we trying to solve right now?
2. **The code** — the smallest piece that solves it
3. **The walkthrough** — what the code actually does, line by line
4. **The CS explanation** — what concept does this code embody?
5. **The SE explanation** — why is it designed this way, and what does it connect to?
6. **What breaks without it** — what would go wrong if this were missing or wrong?

Not every step needs to be long. A sentence is enough if a sentence is sufficient.
But all six must be present for every significant code block.

### Walk through the code

The CS and SE lenses explain *why*. The walkthrough explains *what* — mechanically
tracing what the code does when it runs.

A walkthrough is not a comment on every line. It is a prose description of the
execution: what values are passed in, what decisions are made, what is returned.
It fills the gaps between the code and the concept.

**Without a walkthrough:**
"This is a dispatch table — a mapping from function name to implementation."

**With a walkthrough:**
"When the parser encounters `sin(30)`, it reads the string `'sin'` from the token
stream and calls `BUILT_IN_FUNCTIONS['sin']`. JavaScript looks up the key `'sin'`
in this object and returns the function stored there. That function receives `30`
and the current angle mode. Because the mode is `DEGREES`, it converts `30` to
radians by multiplying by π/180, then passes the result to `Math.sin`. The number
that comes back is the sine of 30 degrees: approximately `0.5`."

The student should be able to trace through the code in their head after reading
the walkthrough. If they cannot, the walkthrough is not done.

### Name the concept

When code embodies a computer science concept, name it directly.

Do not say "we use a dictionary to store variables." Say "this is a symbol table —
the standard data structure for name-to-value binding. Every language runtime has one.
When JavaScript says `x is not defined`, it means the symbol table lookup failed."

Students who can name concepts can look them up, extend them, and transfer them to
new contexts. Students who only recognise patterns cannot.

### Nothing is assumed

Every concept a lesson needs is either taught in that lesson or recapped briefly
before it is used. No lesson may gate itself behind a prerequisite and skip the
teaching. If a concept appears in a lesson, it is explained in that lesson —
regardless of whether it appeared in an earlier one.

A student who picks up lesson 17 without having done lesson 04 must still be able
to follow lesson 17. The connection section may point backwards, but the explanation
must stand on its own.

### Maths is taught, not assumed

When a lesson touches mathematics, the maths is taught in the lesson.
Do not say "apply the rotation matrix." Show the matrix, derive the formula,
explain what each term does geometrically.

A student who cannot explain why the rotation matrix contains `cos` and `sin` has
not learned the lesson.

---

## Define at Use

Every concept, construct, tool, command, or term that appears in a lesson for the
first time must be defined at the exact point it appears. Not in a glossary at the
end. Not in a prior lesson that may not have been read. At the moment of first
contact, in the prose immediately surrounding the code.

After the first definition, a term may be used without re-definition.

This rule applies to every domain. Code syntax, terminal commands, configuration
files, security concepts, git operations — none of these earn a pass.

The following sections name the domains that most commonly pass implicitly and
must never do so.

### 1. Code syntax

Any language construct the student may not know — arrow functions, generics, the
ternary operator, destructuring, spread syntax, `as const`, `readonly`, template
literals, optional chaining — must be explained the first time it appears.

The explanation is brief but complete enough to read the code:

**Arrow function — first appearance:**
"`(argument) => Math.abs(argument)` is an arrow function. The part before `=>`
is the parameter list. The part after `=>` is what the function returns. This is
shorthand for `function(argument) { return Math.abs(argument) }`. Arrow functions
are used when the function is short and does not need a name of its own."

After this first explanation, arrow functions appear without comment.

### 2. Imports as module contracts

Every import statement is a dependency declaration. Every file has one job — its
single responsibility. When a new import appears, state three things:

1. What module this is from and what that module's single responsibility is
2. What specifically is being imported
3. Why this specific thing is needed here and not something else

**Example:**
```typescript
import { Environment, bindVariable } from './environment.js'
```
"`environment.ts` is the module responsible for storing and looking up named values
— variables and functions the user has defined. We import `Environment` (the type
that describes what a stored state looks like) and `bindVariable` (the function
that adds a new name-to-value mapping). We do not import the whole module because
we only need these two things — importing only what you need makes dependencies
explicit and the code easier to understand."

This applies even when importing code written in an earlier lesson. The student
may not fully remember it, and seeing it reused with a clear explanation is often
the moment it locks in.

### 3. Data types as decisions

When a type annotation or data structure appears, explain:
- What the type is and what it can hold
- What it cannot hold or what it prevents
- Why this type was chosen over simpler or more complex alternatives

**Example:**
```typescript
export const BUILT_IN_FUNCTIONS: Readonly<Record<string, BuiltInFn>> = { ... }
```
"`Record<string, BuiltInFn>` is a TypeScript type that describes a plain JavaScript
object where every key is a string and every value is a `BuiltInFn`. TypeScript will
reject any value that does not match `BuiltInFn`. We could have used a plain `object`
type, but that would give up the type checking.

`Readonly<...>` wraps the Record and makes it immutable — TypeScript prevents any
code from adding or changing entries after the object is created. We want this because
the dispatch table is defined once and never modified at runtime. An accidental
assignment like `BUILT_IN_FUNCTIONS['sin'] = somethingElse` would be a compile error."

### 4. Methods, functions, and library calls

When a method or function is called that has not appeared before, state:
- What it does
- What arguments it accepts
- What it returns
- What it does on failure or with unusual input

**Example:**
"`Math.sin(radians)` is a built-in JavaScript function. It accepts a number in radians
and returns the sine of that angle as a number between -1 and 1. It does not throw —
if passed `Infinity` or `NaN`, it returns `NaN`."

This applies to both library functions (`Math.sin`, `isFinite`, `parseFloat`) and
functions defined in earlier lessons (`evaluateAt`, `bisect`, `formatResult`).

### 5. Terminal commands and CLI

Every terminal command that appears in a lesson must be explained fully:

- **What program is being invoked.** `npm` is the Node Package Manager — a command-line
  tool installed alongside Node.js. `npx` runs a package without installing it globally.
  `tsc` is the TypeScript compiler executable.
- **What each argument and flag means.** In `npm install --save-dev vitest`, `install`
  is the subcommand (download and register a package), `--save-dev` means record this
  as a development-only dependency (not needed in production), and `vitest` is the
  package name.
- **What successful output looks like.** If the command prints to the terminal, show the
  output and explain what each line means.
- **What failure looks like and how to diagnose it.** If the command fails with a common
  error, show the error message and explain the cause and fix.

A command typed without explanation is a ritual. A command explained is a tool.

### 6. Tooling and build system

Every tool introduced in a lesson must be explained:

- **What it does.** Not "Vite is a build tool." Instead: "Vite does two things. In
  development, it runs a local web server and compiles TypeScript files on demand as
  the browser requests them. For production, it bundles all files into a single
  optimised output that loads faster."
- **What problem it solves.** What would be painful or impossible without it?
- **What happens when it runs.** Mechanically: which files does it read, what does it
  produce, where does the output go?
- **What its configuration file controls.** Every field touched in `tsconfig.json`,
  `vite.config.ts`, or `.eslintrc` must be explained at first contact.

### 7. Configuration files

Every configuration file that appears in a lesson must be explained:

- **Its purpose.** What does this file configure? Who reads it?
- **Its format.** JSON, TOML, TypeScript — why this format for this tool?
- **Every field the lesson touches.** Not the whole file — only the fields that matter
  here, but those must be explained precisely. `"strict": true` is not "enables strict
  mode." It is: "enables a group of TypeScript checks that together prevent the most
  common category of type errors. The checks it enables are: `noImplicitAny` (every
  variable must have a known type), `strictNullChecks` (null and undefined are not
  valid values unless declared), and `strictFunctionTypes` (function parameter types
  are checked precisely)."

### 8. File system and project structure

Every new file and directory introduced in a lesson must be explained:

- **What its responsibility is.** What does this file own? What does it not own?
- **Why it lives where it does.** `src/lexer.ts` not `lexer.ts` — why?
- **Why it has the name it has.** Naming communicates purpose. A file named
  `utils.ts` communicates nothing. A file named `environment.ts` communicates that
  it is the symbol table for the interpreter.
- **What would happen if it were missing.** If deleting this file breaks the build,
  the student must know why.

When `.gitignore` is introduced, explain what it is, why certain directories are
in it (`node_modules` is not committed because it can be reproduced from
`package.json` by running `npm install` — committing it would add hundreds of
thousands of files to the repository), and how to add entries.

### 9. Package management

Every `npm` operation and `package.json` concept is explained at first use:

- **`dependencies` vs `devDependencies`:** Production code (shipped to users) uses
  `dependencies`. Test runners, TypeScript compilers, and build tools go in
  `devDependencies` — they are needed to build and test but not to run the final product.
- **Semantic versioning:** `^5.0.0` means "any version ≥5.0.0 and <6.0.0." The `^`
  allows automatic minor and patch updates but not major version changes, which may
  break the API. When you install a package, the exact version installed is recorded
  in `package-lock.json` so that everyone on the project gets the same version.
- **`package-lock.json`:** Records the exact versions of all packages installed.
  Committed to version control so that `npm install` on any machine produces
  identical output. Not hand-edited.
- **`node_modules/`:** Where npm places downloaded packages. Never committed to
  version control. Reproduced by running `npm install`.

### 10. Version control

Git is introduced before the first lesson that creates code. The introduction covers:

- **What version control is and why it exists.** Not "git saves your work." Instead:
  "Version control records a history of every change made to a project. You can
  return to any previous state. You can see who changed what and why. You can work
  on two different changes in parallel (branches) and merge them. For a self-taught
  learner working alone, git is not optional — it is how you recover from mistakes
  and how you understand your own history."
- **The three states of a file:** modified (you changed it but git doesn't know yet),
  staged (you've told git to include this change in the next commit), committed (the
  change is permanently recorded in the history).
- **What a commit is:** a snapshot of all staged files at a point in time, with a
  message explaining why this snapshot exists.
- **What a commit message communicates:** not what files changed (git records that
  automatically) but why the change was made. "Add lexer" is a description. "Introduce
  the lexer as the first stage of the interpreter pipeline — now the console shows
  tokens instead of echoing raw text" is an explanation that will be meaningful six
  months later.

Every lesson's definition of done includes a git commit with a suggested message in
the correct format. The first lesson teaches the format; subsequent lessons require it.

### 11. Browser and runtime

Every browser API called for the first time is explained:

- **What it does mechanically.** `document.getElementById('canvas')` searches the
  DOM tree for an element whose `id` attribute equals `'canvas'`. It returns the
  first match, or `null` if none exists. The DOM tree is the browser's in-memory
  representation of the HTML document — every element in the HTML file becomes a
  node in this tree.
- **What it returns, including failure cases.** `getContext('2d')` returns a
  `CanvasRenderingContext2D` object if the browser supports the canvas 2D API, or
  `null` if not. No modern browser returns null — but TypeScript requires you to
  acknowledge the possibility.
- **What the browser's security model means for this call.** Not required for every
  call — only where it is directly relevant.

### 12. Security

Every lesson that handles user input, renders user-provided content, or executes
user-provided code must include a security explanation:

- **Name the threat.** XSS (Cross-Site Scripting): an attacker injects malicious HTML
  or JavaScript through a user input field, which the application then renders as
  code rather than text. Injection: user-provided data is interpreted as a command.
- **Show how the code prevents it.** `textContent = userInput` is safe — it treats
  the input as plain text, no matter what HTML it contains. `innerHTML = userInput`
  is dangerous — the browser will parse and execute any HTML in the input, including
  `<script>` tags.
- **State what would happen without the protection.** Be concrete. Show the attack
  input and the resulting damage.

Security is not an advanced topic. It is the first consequence of accepting input
from outside your code. The moment a lesson accepts a character from the user, the
security question is already open. It must be answered.

### 13. Debugging and reading errors

Every lesson that introduces a new class of error must explain how to find it:

- **Which tool reveals this error.** TypeScript compile errors appear in the editor
  and in the terminal where `tsc` or `npm run dev` runs. JavaScript runtime errors
  appear in the browser console (F12 → Console). Test failures appear in the
  terminal where Vitest runs.
- **How to read the error message.** Error messages have structure: an error type,
  a description, a file path, a line number, and often a stack trace. Each part
  is explained at first encounter.
- **What a stack trace is and how to read it.** The stack trace lists every function
  call active at the moment the error occurred, from most recent to least recent.
  Reading it locates the exact line that threw and the chain of calls that led there.
- **How to use the browser debugger.** When a runtime error occurs, "Sources" tab →
  find the file → click the line number to set a breakpoint → reload → the browser
  pauses at that line and shows the value of every variable. This is shown at first
  use, not assumed.

### 14. Performance

Any code that runs in a hot path must name the performance implication:

- **What "hot path" means.** Code that runs once on startup has negligible performance
  cost. Code called on every keypress, every animation frame, or inside a loop over
  large data has a cost that compounds.
- **60fps.** Browser animations run at 60 frames per second — one frame every 16.6ms.
  If code running in an animation frame takes longer than 16.6ms, the animation
  stutters. This is concrete: 16.6ms is the budget; exceeding it is visible.
- **What blocks rendering.** JavaScript is single-threaded. Synchronous code running
  on the main thread prevents the browser from rendering. A `for` loop drawing 1,000
  triangles synchronously produces no visible frames until the loop completes. The user
  sees nothing move, then sees the result. `requestAnimationFrame` schedules drawing
  code to run between frames — this is explained when animation first appears.
- **Big O as a starting point, not a conclusion.** O(n³) matrix multiplication for
  3×3 matrices is trivially fast. O(n³) for 1000×1000 matrices is not. Always state
  what n is in the actual use case, not just the asymptotic class.

### 15. Networking and the local environment

When a URL, port, or network concept appears, it is explained:

- **What `localhost` is.** The loopback address — a network address that routes back
  to the same machine. When Vite starts a dev server on `localhost:5173`, your
  computer is both the client (your browser) and the server (Vite). No traffic leaves
  your machine.
- **What a port is.** A number that routes a network connection to a specific program
  on a machine. Port 5173 is where Vite listens. Port 443 is where HTTPS traffic goes.
  Port 80 is HTTP. Programs cannot share a port — if two programs try to listen on
  5173, the second one fails.
- **What the dev server does.** Vite's dev server receives HTTP requests from the
  browser for files (e.g., `GET /src/main.ts`), compiles the TypeScript on demand,
  and returns the compiled JavaScript. In production, there is no dev server — all
  files are pre-compiled and served as static files by a web server like nginx.
- **The gap between dev and production.** Hot module replacement, source maps,
  unminified code, and detailed error messages exist in development. In production:
  code is minified (variable names shortened to save bytes), source maps may be
  omitted (to hide source code), and errors are caught and reported to a monitoring
  service rather than displayed to the user.

### 16. Professional practices

When a professional practice appears for the first time, explain it:

- **Code review.** Before code is merged into a shared codebase, another developer
  reads it: checking for correctness, clarity, security, and adherence to the
  project's conventions. The self-taught learner working alone does not have a
  reviewer — but internalising the reviewer's question ("would I understand this code
  in six months?") changes how code is written.
- **Commit messages.** A commit message is communication to a future reader (often
  your future self). It is not a summary of what files changed — git records that
  automatically. It is an explanation of why this change was made. "Add tokenizer"
  is a file summary. "Introduce the lexer as the first stage of the interpreter —
  the console now shows tokens rather than echoing raw text" is a reason.
- **The public/private distinction.** Not just in TypeScript (`private` keyword) but
  as a design principle: the public surface of a module (what it exports) is a
  promise to callers. Changing it breaks them. The private surface (internal
  functions, internal state) can change freely. Minimising the public surface
  minimises the cost of change.

---

## The Aha Moment

The human brain does not store facts — it builds connections. A concept seen once
is fragile. A concept seen in three different contexts, with the connection made
explicit each time, becomes permanent.

When code from a previous lesson appears in a new context, the connection is made
explicit. Not assumed. Not left for the student to recognise on their own.

**Without the connection:**
"We pass the environment to `evaluateAt`."

**With the connection:**
"We pass the same `Environment` object we built in lesson 08 — the one that stores
variable bindings like `A = 42`. The evaluator needs it here because the function
body might reference a variable the user has stored. When `evaluateAt` calls
`parseExpression`, the environment travels with it so that `x + A` inside a function
body can find `A`."

The connection does not need to be long. One sentence that names what is reused
and why it matters in this new context is enough.

---

## Repetition Rule

Not all concepts are equal. Some things need one explanation and never again. Others
need to be encountered ten times before they are genuinely understood.

**Basic syntax is explained once.**
For loops, if statements, function calls, variable assignment — explained at first
use, then used without comment. Students who have read to lesson 10 know what a for
loop is.

**Hard concepts are restated at every appearance.**
Design patterns, software engineering principles, CS algorithms, mathematical
principles — these are briefly named and connected to the code every time they appear,
even in late lessons.

What counts as a hard concept:
- Any named design pattern (dispatch table, repository, factory, strategy, observer)
- Any software engineering principle (SRP, open/closed, separation of concerns,
  dependency inversion, encapsulation)
- Any CS concept (time complexity, recursion, state machines, symbol tables,
  convergence, tree traversal)
- Any mathematical principle (derivatives, continuity, linear transformations,
  intermediate value theorem)

The restatement is short — one or two sentences connecting the concept to the
specific code in front of the student. The goal is reinforcement through repeated
encounter in different contexts, not repetition for its own sake.

**Example — open/closed principle in lesson 19:**
"This is the open/closed principle again — the same principle that shaped the
dispatch table in lesson 09. The intersection solver adds new behaviour (finding
intersections) without modifying the bisection solver. Existing code is closed for
modification; new behaviour is open for addition by composing what exists."

---

## Maximum Extraction

Every code block is a teaching opportunity. A lesson about bisection is also a
lesson about binary search, pure functions, the CalcError pattern, and tolerance as
a design decision. A lesson about the dispatch table is also a lesson about
first-class functions, the open/closed principle, and TypeScript generics.

Do not leave value on the table. If the code embodies multiple concepts, teach
multiple concepts. If an engineering decision was made, explain it. If the same
pattern appeared before, name it. If a mathematical principle underlies the
algorithm, state it.

The student should finish each lesson knowing:
- What they built (the feature)
- What type and data structure was used and why
- What concept the code embodies (CS lens)
- Why it is designed this way (SE lens)
- What it connects to in the rest of the system
- Where this concept appears in production software

None of this is extra work. All of it is already in the code. The lesson's job
is to extract it.

---

## Connection Standards

### Connect backwards

At the start of each lesson, state explicitly what it builds on.
"In lesson 03 we built the parser. The evaluator we build today consumes the AST
the parser produces. The lexer, the parser, and the evaluator are now a complete pipeline."

Do not assume the student remembers. Remind them, briefly, and use that reminder to
show how the pieces fit.

### Connect forwards

When appropriate, show what the current lesson makes possible.
"Once we have an environment, we can implement functions — each function call will
create a new environment that chains back to this one."

This is how students build a mental model of the system before they have built it.

### Connect to the real world

Every concept taught in this curriculum exists in production software.
Name where it appears.

"This is the same environment chain that JavaScript uses for closures.
When a function in JavaScript reads a variable from an outer scope,
it is doing exactly what this lookup chain does."

Students who can see the concept in the world around them understand it differently
than students who only see it in an exercise.

---

## Structure

Every lesson must have these sections, in this order:

1. **What you will build** — one paragraph. The working software this lesson produces.
2. **What you need to know first** — explicit links to prerequisite lessons or concepts.
3. **The lesson** — code and explanation in smallest-runnable-unit steps, each with walkthrough and both lenses.
4. **Connect the pieces** — a short section after all code is written that maps the new code to the full system.
5. **What breaks without this** — one concrete failure mode. Show the actual error or wrong behaviour.
6. **Definition of done** — a checklist the student verifies themselves, including a git commit.

---

## Checklist

Before a lesson is published, verify every item:

**Agile**
- [ ] The lesson ends with something the student can run and see
- [ ] No lesson delivers only infrastructure with no visible result
- [ ] The lesson extends something already visible — it does not build toward a future reveal

**Teaching**
- [ ] Every significant code block has a walkthrough — not just lenses
- [ ] Every code block is explained through both the CS lens and the SE lens
- [ ] No concept is left implicit — every pattern is named
- [ ] Maths is derived, not assumed
- [ ] No concept is assumed from a prior lesson — every concept used is explained here
- [ ] "What breaks without this" is concrete and specific, not hypothetical

**Define at Use — Code**
- [ ] Every syntax construct used for the first time is explained at the point of use
- [ ] Every import statement identifies the module's responsibility, what is imported, and why
- [ ] Every data type is named, its contents described, and the choice justified over alternatives
- [ ] Every method, library function, or function from a prior lesson is explained at first use in this lesson
- [ ] Every OOP concept (interface, class, inheritance, polymorphism) is explained when it appears
- [ ] Every design pattern is named and defined when it appears

**Define at Use — Environment**
- [ ] Every terminal command is explained: what program, what arguments, what output means, what failure looks like
- [ ] Every tool introduced (npm, Vite, tsc, Vitest) is explained: what it does, what problem it solves
- [ ] Every configuration file field touched is explained: what it controls, why this value
- [ ] Every new file and directory is explained: its responsibility, why it lives here, why this name
- [ ] Every npm concept used (dependencies, devDependencies, semver, lock file) is explained at first use

**Define at Use — Security**
- [ ] Any lesson handling user input names the threat (XSS, injection) and shows how the code prevents it
- [ ] Any lesson rendering user-provided content uses safe APIs and explains why the safe API is chosen
- [ ] Any lesson executing user-provided code explains the trust model

**Define at Use — Developer Practice**
- [ ] Every debugging step needed to find errors in this lesson is explained, including which tool to use
- [ ] Reading a new class of error message (compiler, runtime, test) is explained at first encounter
- [ ] Version control: the definition of done includes a git commit with a message in the correct format
- [ ] The first time git is used in the curriculum, the commit message format and its purpose are taught

**Define at Use — Runtime and Performance**
- [ ] Every browser API called for the first time is explained: what it does, what it returns, failure cases
- [ ] Any code in a hot path names the performance implication and the concrete budget (e.g., 16.6ms per frame)
- [ ] Network concepts (localhost, port, dev server vs production server) are explained at first appearance

**The Aha Moment**
- [ ] When code from a prior lesson is reused, the connection is made explicit in prose
- [ ] Hard concepts (patterns, principles, algorithms) are briefly restated when they reappear
- [ ] Basic syntax (for loops, if statements, assignment) is not re-explained after its first lesson

**Maximum Extraction**
- [ ] Every data structure used is justified — what it is, what it holds, why not a simpler one
- [ ] The lesson teaches as many extractable concepts as the code contains
- [ ] The student finishes knowing the feature, the concept, the pattern, and the real-world connection

**Code**
- [ ] Every code block is the smallest unit that demonstrates the point
- [ ] Every code block connects explicitly to something before and after it
- [ ] Code is written in visible order — nothing is built before it can be seen
- [ ] All names are descriptive — no single letters except established maths notation
- [ ] Comments explain non-obvious decisions, not what the code does
- [ ] No code block is presented before its problem is stated

**Connection**
- [ ] The lesson opens by connecting to what came before
- [ ] The lesson closes by connecting to what comes next
- [ ] At least one connection to a real production system is named explicitly

**Structure**
- [ ] All six sections are present
- [ ] Definition of done is specific and verifiable, not vague
- [ ] Definition of done includes a git commit with a message that explains why, not what

---

*This contract applies to every lesson in this curriculum regardless of subject,
language, or author. When in doubt, ask: could a person who has never worked as a
software developer read this lesson and explain — in their own words — what the code
does, why it is written that way, what it connects to in the wider discipline, and
where they will see this concept again? If not, the lesson is not finished.*
