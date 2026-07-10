export const lesson = {
  id:       'build-opencalc-001',
  title:    'What Is Software Engineering?',
  subtitle: 'The discipline between writing code and building systems',

  // ── Section 1: What you will build ──────────────────────────────────────

  build: `
You will write a file called \`requirements.js\`. When you run it with
\`node requirements.js\`, it prints the complete specification for the
platform you are about to build — functional requirements, non-functional
requirements, and the architectural constraints that follow from them.

This is the first deliverable of the project. Before a single component
is written, the system's purpose is recorded in a form that can be read,
run, and verified. Every architectural decision made in later lessons traces
back to a requirement written here.

Note: You need Node.js installed to run this script. If you do not have it
yet, continue to lesson 002 (Your Environment) first, then return and run
\`node requirements.js\` before moving to lesson 003. Write the file now either way.
`,

  // ── Section 2: What you need to know first ──────────────────────────────

  prerequisites: `
None. This is the first lesson in the series. You need:
- A text editor (any application that saves plain text files)
- A terminal (explained fully in lesson 002)
- Node.js installed, to run the script at the end (explained in lesson 002)

If you do not have Node.js yet, read through the full lesson and write the
file. Return to run it after lesson 002.
`,

  // ── Section 3: The lesson ───────────────────────────────────────────────

  sections: [
    {
      heading: 'What software engineering actually is',
      body: `
The word "engineering" is doing a lot of work in "software engineering."

In civil engineering, a bridge is built once, carries a load that was
specified before the first bolt was placed, and does not change its
requirements mid-construction. The materials are stable. The physics is
stable. The contract is stable.

In software, requirements change while the building is already built and in
use — with users inside it. A feature ships. Users behave differently than
expected. The requirement changes. The code must change with it. At the same
time, a second feature is being built. Two developers are making changes to
the same files. A third is trying to understand what the first developer wrote
three months ago. None of this was a concern when the bridge was built.

Software engineering is the discipline of managing that reality.

The Mars Climate Orbiter is the canonical example of what happens without it.

In 1999, a NASA spacecraft was sent to orbit Mars and study its climate.
It cost $327.6 million. It took ten months to reach Mars. On September 23,
1999, it entered the Martian atmosphere at the wrong angle and burned up.

The cause: one engineering team was outputting thruster data in imperial
units (pound-force seconds). The receiving navigation software expected
metric units (newton-seconds). The mismatch is a factor of 4.45 — the
spacecraft was receiving thrust commands 4.45 times larger than intended.

Both teams' software worked correctly. Both were tested. The interface
between them — the contract about what units data would be in — was never
written down. Nobody owned that boundary. The mismatch lived in the gap
between two systems until the spacecraft burned up in the Martian atmosphere.

Software engineering is the practice of defining those contracts before
building anything on top of them.

CS lens — what a "contract" means computationally:

A software system is a network of modules that exchange data. Each module
receives input, processes it, and produces output. When module A sends data
to module B, both must agree on what the data means — its units, its range,
its format, what happens at the boundaries. That agreement is the contract.

A type system is one way to enforce contracts at compile time: if A outputs
a number in pounds and B expects a number in newtons, and they are declared
as different types, the compiler rejects the program before it runs.

A unit test is another way: you test that the output of A, when fed into B,
produces the expected result. The test fails if the contract is violated.

An architectural constraint is another: "modules A and B must communicate
only through interface C" makes it impossible to accidentally couple them
through an undocumented channel.

The Mars Climate Orbiter used none of these. The cost was the spacecraft.

SE lens — why this is an engineering problem, not a coding problem:

Writing code that works for you today is programming. Writing code that
works for someone else tomorrow, next month, and in two years — while other
people are also changing it — requires engineering. The difference is not
skill. It is intent: have you thought about the cost of change?

A programmer asks: does this code do what I need it to do right now?
A software engineer asks: will this code do what everyone needs it to do,
including people who are not in this room and requirements that have not been
written yet?

The second question is harder. Answering it is what the rest of this series
is about.
`,
    },
    {
      heading: 'Scripts versus systems — what you are building matters',
      body: `
Before writing requirements, you need to understand what kind of thing you
are building. The type determines how you must think about it.

A script does one thing, in one context, for one person, once. The person
who writes it is the same person who uses it. The requirements are implicit —
they exist only in the writer's head. A script does not need documentation
because the author knows what it does. It does not need error handling because
the author knows what to put into it. It does not need tests because the author
can see the result immediately.

\`\`\`bash
# A script: rename all .jpg files in a folder with a prefix
# This is correct. This is the right tool for this job.
for file in *.jpg; do
  mv "$file" "photo_$file"
done
\`\`\`

This shell script is correct for its purpose. Writing tests for it would take
longer than running it and checking the result. There are no other developers
who need to understand it. It has no users other than you. Investing in
documentation or error handling would be a waste.

A system does many things, in contexts that change, for people whose needs
you cannot fully predict. The requirements must be explicit — other people
are involved, and other people cannot read your mind.

\`\`\`
The platform you are building must handle:
- Multiple labs with completely different code and behaviour
- Students on slow connections, old browsers, mobile devices
- Content that must be updatable without redeploying labs
- Labs added by developers who have never read the existing code
- Navigation that cannot lose the user's place in a lab
- A lab failure that must not crash everything else
\`\`\`

The moment more than one person is involved — whether that is a collaborator,
a user, or your future self reading your own code — you are building a system.

What changes when you move from script to system:

Every implicit assumption in a script is a potential contract violation in a
system. In the file-rename script, the assumption "all files in this folder
end in .jpg" is fine — you can see the folder. In a system, "all lab
registrations have a name property" is an assumption that 200 files will
eventually build on. When a lab registration is added without a name, those
200 files do not fail with a clear error. They fail with a confusing one, at
runtime, for a user, in production.

Explicit requirements prevent this. Not because the requirements catch bugs —
they do not. Because they force you to make the assumption visible before
building on top of it. A visible assumption can be enforced. A hidden one
can only be discovered when it is violated.

CS lens — complexity as a function of interfaces:

A script has one interface: the author's terminal, on the author's machine,
with the author's files. One interface means one way for things to go wrong.

A system has many interfaces: between modules, between developers, between
the current version and future versions, between the code and its users.
The number of possible contract violations grows with the number of interfaces.

Software engineering is the discipline of managing the surface area of
those interfaces — keeping each one as small, as explicit, and as stable as
possible.

SE lens — the cost of implicit requirements:

Every implicit requirement is a decision made twice. Once when you write the
code and embed the assumption. Again when the assumption is violated and
someone has to figure out what was expected and why.

The first decision is free. The second decision is expensive — it involves
finding the violation, understanding the original intent, changing the code,
and verifying nothing else broke.

Explicit requirements move that second decision to before the code is written,
when it costs nothing. They convert a runtime discovery into a design-time
conversation.
`,
    },
    {
      heading: 'Functional requirements — what the system must do',
      body: `
A functional requirement describes a behaviour the system must have. It is
written from the perspective of the person using the system, not the person
building it. It names what the user can do, not what the code does.

The distinction matters: "implement React Router" is not a requirement.
"A learner can navigate between labs without losing their state in any of
them" is a requirement. The first describes an implementation decision.
The second describes a user need. The implementation decision may change —
React Router may be replaced with something else. The user need should not.

Write requirements from the user perspective:

\`\`\`
GOOD: "A learner can open any lab and interact with it"
GOOD: "A learner can navigate between labs without losing state in any of them"
GOOD: "A lab can be added to the platform without modifying navigation code"

BAD: "Implement lazy loading with React.lazy"
BAD: "Use a registry pattern for lab registration"
BAD: "Add a useEffect for component mounting"
\`\`\`

The "bad" examples are implementation decisions, not requirements. They
describe how you plan to satisfy requirements, not what the requirements are.
This is an important discipline: keep the what separate from the how.
The what comes first and is stable. The how comes later and may change.

Here are the functional requirements for the platform you are building:

\`\`\`javascript
const functionalRequirements = [
  // Core navigation
  'A learner can open any lab and interact with it',
  'A learner can navigate between labs without losing state in any of them',
  'A learner can return to the home screen at any time',

  // Lab independence
  'A lab can be added to the platform without modifying navigation code',
  'A lab can be removed without breaking any other lab',
  'A broken lab fails in isolation without affecting the shell or other labs',

  // Content
  'Lesson content can be updated without redeploying the lab that displays it',
  'A learner can see their progress through a lesson series',
]
\`\`\`

Read each requirement and ask: could I verify whether the software satisfies
this, without looking at code? If you can write a test that checks it or a
user scenario that demonstrates it, it is a good requirement. If you cannot,
it is too vague.

"A learner can navigate between labs without losing state in any of them" is
verifiable: open lab A, interact with it to produce some state, navigate to
lab B, navigate back to lab A, verify the state is still there. The test is
clear even before the code exists.

"The app should work well" is not verifiable. "Work well" is undefined.

CS lens — requirements as a specification:

In formal computer science, a specification is a precise statement of what a
program must compute. A program is correct if it satisfies its specification.
Functional requirements are an informal specification — they describe correct
behaviour in natural language rather than formal logic.

A unit test is a formal specification: it states precisely what output
a specific input must produce. Every test you write in this series is a
formal requirement about one specific behaviour.

SE lens — requirements as communication across time:

Requirements are not written for the computer. The computer does not care
what the software is supposed to do — it runs whatever you give it.

Requirements are written for the humans: the developer writing the code,
the developer reviewing it, and the developer maintaining it three years
from now when the original author has moved on. A requirement that has not
been written exists only in one person's head, and it leaves the project
the day that person does.
`,
    },
    {
      heading: 'Non-functional requirements — how well it must do it',
      body: `
Non-functional requirements describe constraints on the implementation — not
what the system does, but how well and under what conditions it must do it.

They are the requirements most commonly skipped. This is why:

They are invisible when satisfied. A lab that loads in 400 milliseconds feels
instant. The user never notices it. A lab that loads in 6 seconds is what the
user remembers and tells other people about. The non-functional requirement
existed in both cases — it was just satisfied in the first and violated in the
second.

They require more work to satisfy. Writing a feature that works is one task.
Writing a feature that works in 400 milliseconds, offline, across all modern
browsers, in a way another developer can understand in 10 minutes is five
separate tasks, each requiring a decision.

They cross module boundaries. "The app must work offline" is not a requirement
for one module — it is a requirement for the data layer, the routing system,
the lab loader, and the service worker simultaneously. Multi-module requirements
are the easiest to forget and the hardest to retrofit.

Non-functional requirements for this platform:

\`\`\`javascript
const nonFunctionalRequirements = [
  // Performance
  'Any lab loads within 2 seconds on a 4G connection, measured from navigation click to first interaction',
  'Navigation between previously-visited pages takes under 100 milliseconds',

  // Reliability
  'A broken lab must fail in isolation — its error cannot propagate to the shell or other labs',
  'The app recovers from a failed lab load without requiring a full page reload',

  // Offline
  'The app works offline after the first load — labs previously visited remain accessible',

  // Developer experience
  'A developer can add a new lab by reading fewer than 50 lines of existing code',
  'The codebase is navigable by a developer who has never seen it within 30 minutes of reading',
]
\`\`\`

Notice the precision in the performance requirements. "Within 2 seconds" is
a number, but "2 seconds from when?" is a question that must be answered for
the requirement to be testable. The parenthetical "(measured from navigation
click to first interaction)" closes that question. Without it, two developers
measuring the same feature would measure different things and get different
numbers.

This is the practice of making requirements falsifiable: stated precisely
enough that you can determine unambiguously whether they are satisfied.
A requirement that cannot be falsified is not a requirement — it is a wish.

CS lens — non-functional requirements as invariants:

An invariant is a property that must hold at all times. In a loop, the loop
invariant is a condition that is true at every iteration. Non-functional
requirements are system-level invariants: "a broken lab must fail in isolation"
must be true at every point in the program's execution, not just in the
happy path.

Verifying invariants requires more than functional testing. It requires
testing under failure conditions: what happens when the lab code throws an
error? What happens when the network fails mid-load? What happens when the
user's device runs out of memory? These are not edge cases. They are the
conditions under which non-functional requirements are measured.

SE lens — the 80/20 of software quality:

80% of what users perceive as software quality is non-functional. Fast.
Reliable. Available. Easy to understand. These are non-functional properties.
Functionality is the baseline — if the software does not do what it is supposed
to do, it is worthless. But once it does what it is supposed to do, further
work on functionality produces diminishing returns compared to work on
non-functional quality.

The non-functional requirements you write now will be the standard against
which every implementation decision is measured. When a design choice makes the
app slower or more fragile or harder to change, the non-functional requirements
are what make that a concrete problem rather than a vague feeling.
`,
    },
    {
      heading: 'Architectural constraints — boundaries the code must maintain',
      body: `
Architectural constraints are requirements on the structure of the code itself,
not its behaviour. They describe which modules may talk to which other modules,
what may be shared between what, and what must remain independent.

They exist because some structural decisions, once violated, are extremely
expensive to fix. If you build five labs that each import directly from each
other, disentangling them later requires rewriting all five. If you enforce
the constraint that labs cannot import from each other from the start, the
disentangling never becomes necessary.

Architectural constraints are sometimes called "architectural invariants" or
"dependency rules." They are the application of separation of concerns at
the largest scale.

\`\`\`javascript
const architecturalConstraints = [
  // Independence
  'Labs are independent: one lab cannot import from another',
  'The shell does not import from any lab — it knows only the lab registry',
  'Content is separate from labs: content modules do not import lab code',

  // Loading
  'Each lab loads its code on demand, not upfront — no lab is bundled into the main chunk',

  // State
  'Lab state lives inside the lab — the shell does not manage or observe it',
  'Labs communicate with the shell only through a defined prop interface, not direct access',
]
\`\`\`

Read these and ask: what would go wrong if each one were violated?

"Labs are independent: one lab cannot import from another" — if this is
violated, the CNC simulator importing from the CAD tool means you cannot
update the CAD tool without potentially breaking the CNC simulator. Every
lab becomes coupled to every lab it imports from. The failure cascade is the
same as the Mars Climate Orbiter: a change in one module breaks another
through an undocumented dependency.

"The shell does not import from any lab" — if violated, the shell must be
rebuilt whenever any lab changes. The shell is the frame that holds all labs.
If rebuilding a single lab requires rebuilding the frame, you have coupled
the most central piece of the system to everything.

"Each lab loads its code on demand" — if violated, loading the home screen
downloads the code for the CNC simulator even if the user never opens it.
For a simulator that is 200,000 lines of code, this is a 6-second delay
before the user can do anything.

These constraints are written now, before code exists, because enforcing
them retroactively is expensive. Once 10 labs are built with cross-imports,
removing those imports requires understanding every file that participates
in every import chain. Writing the constraint before the first lab is written
costs nothing. Enforcing it after the tenth lab is written costs weeks.

CS lens — the dependency graph as an architectural tool:

Every import in a codebase creates an edge in a directed graph: module A
depends on module B if A imports from B. The architectural constraints above
are constraints on the shape of this graph.

"Labs are independent" means: in the dependency graph, no lab node has an
edge pointing to any other lab node. This can be verified automatically
by a linting rule.

"The shell does not import from any lab" means: in the dependency graph,
the shell node has no edges pointing to lab nodes. Also verifiable
automatically.

Directed acyclic graphs are graphs with no cycles — no path that leads
from a node back to itself. A codebase with a cyclic dependency graph
(module A imports B, B imports C, C imports A) cannot be loaded or tested
in parts. The cycle means every module must be loaded to test any module.
The architectural constraints above are designed to keep the dependency
graph acyclic.

SE lens — constraints as enforceable rules:

A constraint written in a document is a suggestion. A constraint enforced
by tooling is a rule. In lesson 007, you will configure ESLint — a static
analysis tool that reads your code without running it and reports violations.
You will add an import-restriction rule that makes "labs cannot import from
each other" a build error: if a developer writes that import, the code
refuses to compile.

This is the engineering discipline applied to architecture: do not rely on
discipline alone to enforce constraints. Make violations impossible, or at
least immediately visible.
`,
    },
    {
      heading: 'Write and run the requirements script',
      body: `
Now write the complete \`requirements.js\` file. Create it in a new folder
for this project. The folder can be called anything — \`my-platform\`,
\`opencalc\`, \`education-app\`. You will use this folder for the entire series.

\`\`\`javascript
// requirements.js
//
// Specification for the open-calc educational platform.
// Run with: node requirements.js
//
// This file serves two purposes:
// 1. It is a runnable document anyone with Node.js can execute
// 2. It is the source of truth for what "done" means
//
// Every architectural decision in this series traces back to a requirement here.

const platform = {
  name:    'open-calc',
  purpose: 'An interactive learning platform for mathematics and engineering',
}

const functionalRequirements = [
  // Navigation
  'A learner can open any lab and interact with it',
  'A learner can navigate between labs without losing state in any of them',
  'A learner can return to the home screen at any time',

  // Lab independence
  'A lab can be added to the platform without modifying navigation code',
  'A lab can be removed without breaking any other lab',
  'A broken lab fails in isolation without affecting the shell or other labs',

  // Content
  'Lesson content can be updated without redeploying the lab that displays it',
  'A learner can see their progress through a lesson series',
]

const nonFunctionalRequirements = [
  // Performance
  'Any lab loads within 2 seconds on a 4G connection (measured from navigation click to first interaction)',
  'Navigation between previously-visited pages takes under 100 milliseconds',

  // Reliability
  'A broken lab must fail in isolation — its error cannot propagate to the shell or other labs',
  'The app recovers from a failed lab load without requiring a full page reload',

  // Offline
  'The app works offline after first load — labs previously visited remain accessible',

  // Developer experience
  'A developer can add a new lab by reading fewer than 50 lines of existing code',
  'The codebase is navigable by a developer who has never seen it within 30 minutes',
]

const architecturalConstraints = [
  // Independence
  'Labs are independent: one lab cannot import from another',
  'The shell does not import from any lab — it knows only the lab registry',
  'Content is separate from labs: content modules do not import lab code',

  // Loading
  'Each lab loads its code on demand — no lab is bundled into the main chunk',

  // State
  'Lab state lives inside the lab — the shell does not manage or observe it',
  'Labs communicate with the shell only through a defined prop interface',
]

function printSection(title, items) {
  const lineWidth = 60
  console.log('\\n' + title)
  console.log('-'.repeat(lineWidth))
  items.forEach((item, index) => {
    console.log(\`\${index + 1}. \${item}\`)
  })
}

function printRequirements() {
  const lineWidth = 60
  console.log('='.repeat(lineWidth))
  console.log(\`Platform: \${platform.name}\`)
  console.log(\`Purpose:  \${platform.purpose}\`)
  console.log('='.repeat(lineWidth))

  printSection('FUNCTIONAL REQUIREMENTS',   functionalRequirements)
  printSection('NON-FUNCTIONAL REQUIREMENTS', nonFunctionalRequirements)
  printSection('ARCHITECTURAL CONSTRAINTS',  architecturalConstraints)

  console.log('\\n' + '='.repeat(lineWidth))
  console.log('No application code exists yet.')
  console.log('The above defines what "done" means for this project.')
  console.log('='.repeat(lineWidth))
}

printRequirements()
\`\`\`

Walkthrough — every piece of this file:

\`const platform = { name: ..., purpose: ... }\`
\`const\` declares a variable whose binding cannot be reassigned after this
line. The variable \`platform\` will always refer to this object. \`const\` does
not make the object's properties immutable — it only prevents \`platform = ...\`
elsewhere in the file. We use \`const\` because \`platform\` is a definition,
not something that changes at runtime.

\`{ name: 'open-calc', purpose: '...' }\` is an object literal. An object in
JavaScript is a collection of key-value pairs enclosed in braces. \`name\` and
\`purpose\` are the keys. The strings after each colon are the values. You
access them with dot notation: \`platform.name\` returns \`'open-calc'\`.

\`const functionalRequirements = [...]\` is an array literal. An array is an
ordered list of values enclosed in square brackets. Each string in the array
is one requirement. Arrays preserve insertion order — the first element is
always the first element. We use an array here rather than an object because
the requirements are ordered and we want to iterate over them with an index.

\`function printSection(title, items) { ... }\` declares a function with two
parameters: \`title\` and \`items\`. A parameter is a placeholder name —
when you call the function, the values you pass in replace the placeholders.
\`function\` is the declaration keyword. \`printSection\` is the name.
The body between \`{\` and \`}\` runs each time the function is called.

\`console.log()\` is a built-in function available in both Node.js and the
browser. \`console\` is an object containing utility functions for writing
output. \`log\` is the method that writes to standard output (the terminal)
and appends a newline after. It accepts any number of arguments: each is
converted to a string and printed, separated by spaces.

\`'\\n'\` is a string containing a newline character. \`\\n\` is an escape
sequence: the backslash signals that the next character is a control code.
\`n\` means "newline." So \`'\\n' + title\` prints a blank line before the
title. Escape sequences exist because you cannot type a literal newline
inside a string — the string would break across lines in the file.

\`'-'.repeat(lineWidth)\` calls the \`repeat\` method on the string \`'-'\`.
Every string in JavaScript has a \`repeat(count)\` method that returns a
new string containing \`count\` copies of the original. \`'-'.repeat(60)\`
returns sixty dashes. We store the width in \`lineWidth\` rather than typing
\`60\` everywhere so that changing the width requires one change, not many.

\`\\\`\${index + 1}. \${item}\\\`\` is a template literal — a string surrounded by
backtick characters (\`\\\`\`) instead of quotes. Inside a template literal,
\`\${expression}\` is replaced with the evaluated value of the expression.
\`\${index + 1}\` evaluates \`index + 1\` and inserts the result. \`\${item}\`
inserts the value of \`item\`. Template literals are used here because
concatenation (\`(index + 1) + '. ' + item\`) is harder to read.

\`items.forEach((item, index) => { console.log(...) })\`
\`forEach\` is a method on every array. It calls the function you provide
once for each element, in order. The function receives two arguments: the
current element (\`item\`) and its position (\`index\`, starting at 0).
The syntax \`(item, index) => { ... }\` is an arrow function — a shorthand
for writing a function without a name. Arrow functions — first appearance:
the part before \`=>\` is the parameter list; the part after is the body.
This is equivalent to writing \`function(item, index) { ... }\`.

\`printRequirements()\` at the bottom of the file is what actually runs the
function. Declaring a function with \`function printSection(...) { ... }\` does
not run it — it only defines it. The invocation \`printRequirements()\` at the
end is the explicit instruction to run it. Keeping declaration and invocation
separate makes it easy to see what the file does (one line at the bottom)
and how it does it (the functions above).

Run it:

\`\`\`bash
node requirements.js
\`\`\`

\`node\` is the Node.js runtime — a program that reads JavaScript files and
executes them. \`requirements.js\` is the argument: the file to run.
Node reads the file, executes it top to bottom, and when the last line
(\`printRequirements()\`) runs, the output appears in your terminal.

Expected output:

\`\`\`
============================================================
Platform: open-calc
Purpose:  An interactive learning platform for mathematics and engineering
============================================================

FUNCTIONAL REQUIREMENTS
------------------------------------------------------------
1. A learner can open any lab and interact with it
2. A learner can navigate between labs without losing state in any of them
3. A learner can return to the home screen at any time
4. A lab can be added to the platform without modifying navigation code
5. A lab can be removed without breaking any other lab
6. A broken lab fails in isolation without affecting the shell or other labs
7. Lesson content can be updated without redeploying the lab that displays it
8. A learner can see their progress through a lesson series

NON-FUNCTIONAL REQUIREMENTS
------------------------------------------------------------
1. Any lab loads within 2 seconds on a 4G connection (measured from navigation click to first interaction)
...

ARCHITECTURAL CONSTRAINTS
------------------------------------------------------------
1. Labs are independent: one lab cannot import from another
...

============================================================
No application code exists yet.
The above defines what "done" means for this project.
============================================================
\`\`\`

This is working software. It is not a web app. It is not a component.
But it runs, it is correct, and it produces output that can be verified.
It is the first vertical slice: a specification that has been executed.
`,
    },
    {
      heading: 'Separation of concerns — the principle behind every constraint',
      body: `
Every architectural constraint in \`requirements.js\` is an application of
one principle: separation of concerns.

Separation of concerns means that each part of a system has exactly one job
and does not reach into the jobs of other parts.

The constraints make this concrete:

"The shell does not import from any lab" — the shell's job is navigation and
layout. Knowing what the CNC simulator renders is not the shell's job. If the
shell imported from labs, changing a lab would require changing the shell,
testing the shell, and verifying everything else the shell touches still works.
The cost of a single lab change cascades into the whole system.

"Labs are independent: one lab cannot import from another" — each lab's job
is its own domain. The CNC simulator simulates CNC. The CAD tool creates 2D
drawings. Neither should know the other exists. If lab A imports from lab B,
a bug in lab B can affect lab A even when lab A has nothing wrong with it.

"Each lab loads its code on demand" — loading is the bundler's job, not the
shell's. If the shell decided which labs to load and when, adding a new lab
would require changing the shell. By making each lab responsible for declaring
that it loads on demand, adding a lab requires only registering it — not
touching the shell.

The Mars Climate Orbiter failed because unit conversion was not anyone's job.
The gap between two teams — an unowned responsibility — was where the failure
lived. Separation of concerns does not just mean "split code into files."
It means every behaviour has exactly one owner, and that owner is identifiable.

The practice throughout this series:
Before writing any function, ask: what is this function's single job?
Before writing any file, ask: what is this file's single responsibility?
Before adding an import, ask: am I crossing a boundary that should not be crossed?

These questions do not slow down coding. They prevent the kind of entanglement
that makes code impossible to change later.

CS lens — cohesion and coupling:

Two metrics measure how well concerns are separated.

Cohesion measures how closely related the things inside a module are. High
cohesion means everything in the module serves one goal. A file containing
only functions for parsing has high cohesion. A file containing a parser, a
renderer, and a database connection has low cohesion.

Coupling measures how much a module depends on the internal details of
another. Low coupling means modules interact through narrow, stable interfaces.
A module that accesses another module's internal state is highly coupled — it
breaks whenever that internal state changes, even if the behaviour is unchanged.

Good software maximises cohesion and minimises coupling. Every architectural
decision in this series moves in that direction. The vocabulary — cohesion,
coupling, separation of concerns — lets you reason about these decisions
explicitly rather than by intuition alone.

SE lens — the cost of entanglement grows superlinearly:

When two modules are entangled, changing one requires understanding both.
When three modules are entangled, changing one requires understanding all
three. When ten modules are entangled, changing one module is effectively
changing the system, because you cannot understand the change without
understanding the whole.

The cost of entanglement does not grow linearly with the number of modules
involved — it grows faster, because each new entanglement multiplies the
understanding required. This is why codebases that start fast become slow:
early entanglement compounds into a state where every change requires
understanding everything.

The architectural constraints you wrote are early protection against this.
They are cheap to enforce now because there is no code. Their value is not
in describing the current state — there is no current state yet — but in
making it explicit which entanglements are forbidden, before the first
opportunity to create them.
`,
    },
  ],

  // ── Section 4: Connect the pieces ───────────────────────────────────────

  connect: `
The file \`requirements.js\` is the first file of the project. It runs now.
Every lesson after this adds to what already exists and can be run.

Every architectural decision in the series traces back to a requirement here:

- "Labs are independent" → why labs are loaded with React.lazy (lesson 020),
  why the registry pattern exists (lesson 022), why error boundaries wrap each
  lab (lesson 021)

- "A developer can add a new lab by reading fewer than 50 lines" → why the
  registry is a simple array (lesson 022) instead of a configuration object

- "The app works offline after first load" → why a service worker is added,
  and what it caches

- "Any lab loads within 2 seconds" → why bundle splitting matters, and why
  no lab code is in the main bundle

When you reach lesson 022 and add a new lab by appending one line to a
registry file, you will understand why that design exists: not because it is
clever, but because it satisfies the requirement you wrote here.

The open-calc platform you are studying was built without an explicit
requirements document. Most real projects are. This means you must
reverse-engineer the requirements from the code — understand what problem
each design decision is solving by reading the code it produced. Part of
what makes a codebase hard to read is that its requirements are implicit.
When you build your version from scratch with requirements written first,
the code will be easier to understand because you will know why each piece
exists before writing it.
`,

  // ── Section 5: What breaks without this ─────────────────────────────────

  breaks: `
If you skip requirements and write code first:

The first decision you make about data shape becomes a load-bearing assumption.
In lesson 002, without requirements, the natural first step is to create a
folder and start writing an HTML file. The HTML file implies a structure.
The structure implies an organisation. The organisation implies decisions about
where labs live, how the shell is structured, and what the routing looks like.

Each of those decisions is made without knowing the constraints that should
govern them.

The discovery: in lesson 015, you add a second lab. The first lab's state
was stored in a way that seemed reasonable when there was one lab. With two
labs, the state storage model must be shared. The way you stored state for
one lab is the wrong shape for two labs. Changing it requires rewriting
every piece of code that touched state.

This is not a hypothetical. It is the experience of every developer who has
built a second feature before writing requirements for the first. The second
feature reveals the assumptions the first feature embedded. Those assumptions
must be un-embedded, which means rewriting the first feature.

The cost of the rewrite — the developer hours, the introduced bugs, the
delayed shipping — is the cost of the missing requirements.

The concrete error without requirements:

\`\`\`
// What gets built without requirements:
// A shell that directly manages each lab's state

const App = () => {
  const [cncState, setCncState] = useState({})
  const [cadState, setCadState] = useState({})
  const [vueState, setVueState] = useState({})
  // ... every lab gets its own state variable here

  return (
    <Router>
      <Route path="/cnc" element={<CNCLab state={cncState} setState={setCncState} />} />
      ...
    </Router>
  )
}
\`\`\`

This violates "Lab state lives inside the lab — the shell does not manage or
observe it." It means every new lab requires a state variable in the shell.
It means the shell knows the internal state shape of every lab. It means
changing a lab's state shape requires changing the shell.

If the constraint had been written first, this implementation would have been
rejected at design time: "This violates constraint 5." Instead, it gets built,
used in 10 components, and discovered as wrong in lesson 015 when adding the
fourth lab makes the pattern unworkable.
`,

  // ── Section 6: Definition of done ───────────────────────────────────────

  done: [
    '[ ] requirements.js exists in your project folder',
    '[ ] node requirements.js runs without errors',
    '[ ] The output shows all three sections: functional, non-functional, architectural',
    '[ ] You have added at least one functional requirement not in the list above',
    '[ ] You have added at least one non-functional requirement that matters to you',
    '[ ] You can explain, in one sentence, what each architectural constraint prevents',
    '[ ] You can state the Mars Climate Orbiter failure in terms of separation of concerns',
    '[ ] Git commit (complete after lesson 003): git commit -m "Add project requirements before first line of application code\n\nSpecifies functional and non-functional requirements and architectural\nconstraints that will govern every decision in the series. Every architectural\ndecision from lesson 020 onward traces back to a requirement here."',
  ],
}
