# Lesson Contract

Every lesson in this curriculum — whether written by a human or an agent — must meet
this contract. It is not a style guide. It is a definition of what teaching means here.
A lesson that does not meet this contract is not a lesson. It is documentation.

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

Every term, construct, type, or function that appears in a lesson for the first time
must be defined at the exact point it appears. Not in a glossary at the end. Not in
a prior lesson that may not have been read. At the moment of first contact, in the
prose immediately surrounding the code.

After the first definition, a term may be used without re-definition.

This rule applies to four categories:

### 1. Syntax

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
6. **Definition of done** — a checklist the student verifies themselves.

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

**Define at Use**
- [ ] Every syntax construct used for the first time is explained at the point of use
- [ ] Every import statement identifies the module's responsibility, what is imported, and why
- [ ] Every data type is named, its contents described, and the choice justified over alternatives
- [ ] Every method, library function, or function from a prior lesson is explained at first use in this lesson
- [ ] Every OOP concept (interface, class, inheritance, polymorphism) is explained when it appears
- [ ] Every design pattern is named and defined when it appears

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
- [ ] At least one connection to the real world or production codebase is made

**Structure**
- [ ] All six sections are present
- [ ] Definition of done is specific and verifiable, not vague

---

*This contract applies to every lesson in this curriculum regardless of subject,
language, or author. When in doubt, ask: could a student who has never written code
before read this lesson and explain — in their own words — what the code does, why
it is written that way, and where they will see this concept again? If not, the
lesson is not finished.*
