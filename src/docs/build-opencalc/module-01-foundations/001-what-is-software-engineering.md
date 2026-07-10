# 001 — What Is Software Engineering?

*The discipline between writing code and building systems*

---

## What You Will Build

You will write a file called `requirements.js`. When you run it with `node requirements.js`, it prints the complete specification for the platform you are about to build: functional requirements, non-functional requirements, and architectural constraints.

This is the first deliverable of the project. Before a single component exists, the system's purpose is recorded in a form that can be read, executed, and verified. Every architectural decision in later lessons traces back to a requirement written here.

> **Note:** You need Node.js installed to run this script. If you do not have it yet, write the file now and run it after completing lesson 002. Write the file today regardless.

---

## What You Need to Know First

This is the first lesson. No prior knowledge is required. You need a text editor — any application that saves plain text files — to write the script.

---

## The Lesson

### What software engineering actually is

The word "engineering" is doing a lot of work in "software engineering."

In civil engineering, a bridge is designed once, built once, and carries a load defined before the first bolt was placed. The materials are stable. The physics is stable. The specification is stable.

In software, requirements change while the building is already built and occupied. A feature ships. Users behave differently than the team expected. The requirement changes. The code must change with it. At the same time, a second developer is modifying the same files. A third is trying to understand what the first developer wrote three months ago. None of that was a concern when the bridge was built.

Software engineering is the discipline of managing that reality.

The Mars Climate Orbiter is the event that defines it clearly. In 1999, a NASA spacecraft was launched to orbit Mars and study its climate over a full Martian year. It cost $327.6 million and took ten months to reach Mars. On September 23, 1999, it entered the Martian atmosphere at the wrong angle and burned up.

The cause: one engineering team was outputting thruster data in imperial units — pound-force seconds. The navigation software that received and used that data expected metric units — newton-seconds. The mismatch is a factor of 4.45. The spacecraft was receiving thrust corrections 4.45 times larger than intended, causing it to fly a trajectory no one had computed.

Both teams' software was tested. Both teams' software worked. The interface between them — the contract specifying what units the data would be in — was never written down. No module owned unit conversion. It lived in the gap between two systems.

The spacecraft burned up because of a missing conversation, not a coding error.

Software engineering is the practice of having those conversations before writing any code.

---

**CS lens — what a software contract means computationally:**

A software system is a network of modules that exchange data. When module A sends a value to module B, both must agree on what that value means: its type, its units, its valid range, what happens at the boundaries.

Every kind of engineering tool exists to enforce those agreements:

- A **type system** makes the agreement a compile-time rule. If A outputs a `Pounds` type and B expects a `Newtons` type, the program refuses to compile.
- A **unit test** makes the agreement a verified assertion. You write a test that confirms the output of A, when fed to B, produces the expected result.
- An **architectural constraint** restricts which modules may communicate at all, eliminating entire categories of undocumented coupling.

The Mars Climate Orbiter used none of these across the critical boundary. The cost was the spacecraft and a decade of Martian climate data.

---

**SE lens — programming versus engineering:**

Writing code that works for you today is programming. Writing code that works for someone else tomorrow, next month, and in two years — while other people are also changing it — requires engineering.

The difference is not skill. It is intent: have you made your decisions visible?

A programmer asks: *does this work right now?*  
A software engineer asks: *will this still work when things change, and will the next person understand why I built it this way?*

The second question is harder. Answering it is what the rest of this series is about.

---

### Scripts versus systems

Before writing requirements, you need to understand what kind of thing you are building, because the type determines how you must think about it.

A **script** does one thing, in one context, for one person, once. The person who writes it is the person who uses it. The requirements are implicit — they exist in the author's head. Scripts do not need documentation because the author knows what they do. They do not need error handling because the author controls what goes in. They do not need tests because the author can see the result.

```bash
# A script — rename all .jpg files in a folder with a prefix
for file in *.jpg; do
  mv "$file" "photo_$file"
done
```

This is correct. For renaming 200 files on your own machine, right now, this is the right tool. Writing tests for it would take longer than running it and checking the result. Investing in documentation or error handling would be waste.

A **system** does many things, in contexts that change, for people whose needs you cannot fully predict. The requirements must be explicit — other people are involved, and they cannot read your mind.

```
The platform you are building must handle:
  Multiple labs with completely different behaviour and code
  Students on slow connections, old browsers, mobile devices
  Content updatable without redeploying the labs that display it
  Labs added by developers who have never read the existing code
  Navigation that cannot lose a user's place in a lab
  A lab failure that must not crash everything else
```

The moment more than one person is involved — a collaborator, a user, or your future self six months from now — you are building a system.

---

**CS lens — complexity as a function of interfaces:**

A script has one interface: the author's terminal on the author's machine with the author's files. One interface means one way for things to go wrong.

A system has many interfaces: between modules, between developers, between the current version and future versions, between the code and its users. The number of possible contract violations grows with the number of interfaces. Software engineering is the discipline of managing the surface area of those interfaces — keeping each one as small, explicit, and stable as possible.

---

**SE lens — the cost of implicit requirements:**

Every implicit requirement is a decision made twice.

First when you write the code, embedding an assumption without recognising it as an assumption. Second when the assumption is violated and someone must figure out what was expected, why, and how to fix it without breaking anything else.

The first decision is free. The second is expensive: find the violation, reconstruct the original intent, make the change, verify nothing broke.

Explicit requirements move the second decision to before the code is written, when it costs nothing.

---

### Functional requirements — what the system must do

A **functional requirement** describes a behaviour the system must have. It is written from the user's perspective, not the implementer's.

The distinction matters: "implement React Router" is not a requirement. "A learner can navigate between labs without losing their state in any of them" is a requirement. The implementation decision may change — React Router may be replaced. The user need should not change.

```
GOOD: A learner can open any lab and interact with it
GOOD: A learner can navigate between labs without losing state in any of them
GOOD: A lab can be added to the platform without modifying navigation code

BAD: Implement lazy loading with React.lazy
BAD: Use a registry pattern for lab registration
BAD: Add a useEffect for component mounting
```

The "bad" examples describe implementation choices, not requirements. Keep the *what* separate from the *how*. The what comes first and is stable. The how comes later and will change.

Here are the functional requirements for this project:

```javascript
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
```

Read each requirement and ask: could I verify whether the software satisfies this without looking at code? If you can write a test that checks it, or describe a user scenario that demonstrates it, it is a good requirement. If you cannot, it is too vague.

"A learner can navigate between labs without losing state in any of them" is verifiable: open lab A, interact with it, navigate to lab B, return to lab A, verify state is preserved. The test is clear before any code exists.

"The app should work well" is not verifiable. "Work well" is undefined.

---

**CS lens — requirements as a specification:**

In formal computer science, a specification is a precise statement of what a program must compute. A program is correct if it satisfies its specification. Functional requirements are an informal specification — they describe correct behaviour in natural language.

Every unit test you write in this series is a formal version of a requirement: a precise, machine-verifiable statement about one specific behaviour.

---

**SE lens — requirements as communication across time:**

Requirements are not written for the computer. The computer does not care what the software is supposed to do — it executes whatever you give it.

Requirements are written for the humans: the developer writing the code now, the developer reviewing it next week, and the developer maintaining it in two years when the original author has moved on. A requirement that was never written down exists only in one person's head. It leaves the project the day that person does.

---

### Non-functional requirements — how well it must do it

Non-functional requirements describe constraints on the implementation — not what the system does, but how well and under what conditions it must do it.

They are the requirements most commonly skipped. Three reasons:

**They are invisible when satisfied.** A lab loading in 400ms feels instant. The user never thinks about it. A lab loading in 6 seconds is what the user remembers and tells others about. The non-functional requirement existed in both cases — it was just satisfied in the first.

**They require more work to satisfy.** Writing a feature that works is one task. Writing a feature that works in 400ms, offline, across all modern browsers, in a way another developer can understand in ten minutes is five tasks, each requiring a decision.

**They cross module boundaries.** "The app must work offline" is not a requirement for one module. It is a requirement for the data layer, the routing system, the lab loader, and the service worker simultaneously. Requirements that span modules are the easiest to forget and the hardest to retrofit.

```javascript
const nonFunctionalRequirements = [
  // Performance
  'Any lab loads within 2 seconds on a 4G connection (measured: navigation click to first interaction)',
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
```

Notice the precision in the performance requirements. "Within 2 seconds" is a number. "2 seconds from when?" is a question that must be answered. The parenthetical closes that question. Without it, two developers measuring the same feature would measure different things.

A requirement that cannot be measured is not a requirement — it is a wish.

---

**CS lens — non-functional requirements as invariants:**

An invariant is a property that must hold at all times. Non-functional requirements are system-level invariants: "a broken lab must fail in isolation" must be true at every point in program execution, not just in the happy path.

Verifying invariants requires testing under failure: what happens when the lab code throws an error? When the network fails mid-load? When the user's device runs out of memory? These are not edge cases. They are the conditions under which non-functional requirements are measured.

---

**SE lens — the 80/20 of perceived quality:**

80% of what users experience as software quality is non-functional. Fast. Reliable. Available. Easy to understand. These are non-functional properties. Functionality is the baseline — if software does not do what it is supposed to, it is worthless. But once it does what it is supposed to do, further work on functionality produces diminishing returns compared to work on non-functional quality.

The non-functional requirements you write now become the standard against which every implementation decision is measured. When a design choice makes the app slower or more fragile, the requirements are what make that a concrete problem rather than a vague feeling.

---

### Architectural constraints — boundaries the code must maintain

Architectural constraints are requirements on the structure of the code itself, not its behaviour. They describe which modules may communicate with which other modules, and what must remain independent.

They exist because some structural decisions, once violated, are extremely expensive to fix. If ten labs each import directly from each other, disentangling them requires rewriting all ten. Writing the constraint before the first lab is built costs nothing. Enforcing it after ten labs exist costs weeks.

```javascript
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
```

Read each constraint and ask: what would go wrong if this were violated?

"Labs are independent" — if violated, the CNC simulator importing from the CAD tool means you cannot update the CAD tool without potentially breaking the CNC simulator. Each lab becomes coupled to every lab it imports from. The failure cascade is the same as the Mars Climate Orbiter: a change in one module breaks another through an undocumented dependency.

"The shell does not import from any lab" — if violated, the shell must be rebuilt whenever any lab changes. The shell is the frame that holds all labs. Coupling the most central piece of the system to everything means every change is a system-wide change.

"Each lab loads its code on demand" — if violated, loading the home screen downloads the code for every lab the user may never open. A simulator with 200,000 lines of code adds seconds of load time before the user can do anything.

---

**CS lens — the dependency graph:**

Every `import` statement in a codebase creates an edge in a directed graph: module A depends on module B when A imports from B. The architectural constraints above are constraints on the shape of that graph.

"Labs are independent" means: no lab node has an edge pointing to any other lab node.  
"The shell does not import from any lab" means: the shell node has no edges pointing to lab nodes.

Both are verifiable automatically by a linting rule — a static analysis tool can read the import graph and report any violation. In lesson 007 you will configure ESLint to make these violations build errors.

---

**SE lens — constraints are cheap now, expensive later:**

The architectural constraints exist in `requirements.js` today. There is no application code. Enforcing them costs nothing — there is nothing to enforce against yet.

Their value is not in describing current state. Their value is in making it explicit which entanglements are forbidden, before the first opportunity to create them. The first developer who tries to import lab A from lab B sees the constraint and knows it is wrong. Without the written constraint, the import seems reasonable.

---

### Write the complete requirements script

Create a new folder for your project. Name it anything — `my-platform`, `opencalc`, `education-app`. This folder will hold everything you build in this series.

Inside it, create `requirements.js`:

```javascript
// requirements.js
//
// Specification for the open-calc educational platform.
// Run with: node requirements.js
//
// Purpose 1: a runnable document — anyone with Node.js can execute this
// Purpose 2: the source of truth for what "done" means in this project

const platform = {
  name:    'open-calc',
  purpose: 'An interactive learning platform for mathematics and engineering',
}

const functionalRequirements = [
  'A learner can open any lab and interact with it',
  'A learner can navigate between labs without losing state in any of them',
  'A learner can return to the home screen at any time',
  'A lab can be added to the platform without modifying navigation code',
  'A lab can be removed without breaking any other lab',
  'A broken lab fails in isolation without affecting the shell or other labs',
  'Lesson content can be updated without redeploying the lab that displays it',
  'A learner can see their progress through a lesson series',
]

const nonFunctionalRequirements = [
  'Any lab loads within 2 seconds on a 4G connection (navigation click to first interaction)',
  'Navigation between previously-visited pages takes under 100 milliseconds',
  'A broken lab must fail in isolation — its error cannot propagate to the shell',
  'The app recovers from a failed lab load without requiring a full page reload',
  'The app works offline after first load — labs previously visited remain accessible',
  'A developer can add a new lab by reading fewer than 50 lines of existing code',
  'The codebase is navigable by a developer who has never seen it within 30 minutes',
]

const architecturalConstraints = [
  'Labs are independent: one lab cannot import from another',
  'The shell does not import from any lab — it knows only the lab registry',
  'Content is separate from labs: content modules do not import lab code',
  'Each lab loads its code on demand — no lab is bundled into the main chunk',
  'Lab state lives inside the lab — the shell does not manage or observe it',
  'Labs communicate with the shell only through a defined prop interface',
]

function printSection(heading, items) {
  const width = 62
  console.log('\n' + heading)
  console.log('-'.repeat(width))
  items.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`)
  })
}

function printRequirements() {
  const width = 62
  console.log('='.repeat(width))
  console.log(`Platform: ${platform.name}`)
  console.log(`Purpose:  ${platform.purpose}`)
  console.log('='.repeat(width))
  printSection('FUNCTIONAL REQUIREMENTS',    functionalRequirements)
  printSection('NON-FUNCTIONAL REQUIREMENTS', nonFunctionalRequirements)
  printSection('ARCHITECTURAL CONSTRAINTS',   architecturalConstraints)
  console.log('\n' + '='.repeat(width))
  console.log('No application code exists yet.')
  console.log('The above defines what done means for this project.')
  console.log('='.repeat(width))
}

printRequirements()
```

**Walkthrough — every part of this file:**

`const platform = { name: ..., purpose: ... }` — `const` declares a variable whose binding cannot be reassigned after this line. The variable `platform` will always refer to this object. `const` does not make the object's properties immutable — it only prevents writing `platform = somethingElse` later in the file. We use `const` because this is a definition, not something that changes.

`{ name: 'open-calc', purpose: '...' }` — an object literal. An object in JavaScript is a collection of key-value pairs enclosed in braces. `name` and `purpose` are keys. The strings after the colons are values. Access them with dot notation: `platform.name` returns `'open-calc'`.

`const functionalRequirements = [...]` — an array literal. An array is an ordered list of values enclosed in square brackets. Each string is one requirement. Arrays preserve insertion order.

`function printSection(heading, items) { ... }` — declares a function named `printSection` with two parameters. A parameter is a placeholder name — when you call the function, values you pass replace the placeholders. `function` is the keyword. The body between `{` and `}` runs each time the function is called. Declaring a function does not run it.

`console.log()` — a built-in function available in both Node.js and the browser. `console` is an object containing utility functions for output. `log` is the method that writes its argument to standard output (the terminal) and appends a newline. It accepts any value and converts it to a string.

`'\n'` — a string containing a newline character. `\n` is an escape sequence: the backslash signals that the next character is a control code, not a literal character. `n` means newline. Escape sequences exist because you cannot type a literal newline inside a string without breaking it across lines.

`'-'.repeat(width)` — calls the `repeat` method on the string `'-'`. Every string in JavaScript has a `repeat(count)` method that returns a new string containing `count` copies of the original. `'-'.repeat(62)` returns 62 dashes. We store the width in a variable so that changing it requires one change, not many.

`` `${index + 1}. ${item}` `` — a template literal. Template literals are strings surrounded by backtick characters instead of quotes. Inside them, `${expression}` is replaced with the evaluated value. `` `${index + 1}. ${item}` `` evaluates `index + 1` (because arrays start at 0 but we want display numbering to start at 1) and inserts it, then inserts `item`. Template literals are used here because concatenation — `(index + 1) + '. ' + item` — is harder to read.

`items.forEach((item, index) => { ... })` — `forEach` is a method on every array. It calls the function you provide once for each element, in order. The function receives two arguments: the current element (`item`) and its zero-based position (`index`). The syntax `(item, index) => { ... }` is an **arrow function** — shorthand for writing a function without a name. Arrow function syntax: the part before `=>` is the parameter list, the part after is the body. This is equivalent to `function(item, index) { ... }`.

`printRequirements()` — the last line of the file. This is the invocation: the instruction to actually run the function. Without this line, the functions are defined but nothing is printed. Keeping the invocation at the end of the file makes it easy to see what the file does (one line at the bottom) separately from how it does it (all the functions above).

---

**Run it:**

```bash
node requirements.js
```

`node` is the Node.js runtime — a program that reads JavaScript files and executes them. `requirements.js` is the argument: the file to run. Node reads the file top to bottom, evaluates each statement, and when the last line (`printRequirements()`) executes, the output appears in your terminal.

Expected output:

```
==============================================================
Platform: open-calc
Purpose:  An interactive learning platform for mathematics and engineering
==============================================================

FUNCTIONAL REQUIREMENTS
--------------------------------------------------------------
1. A learner can open any lab and interact with it
2. A learner can navigate between labs without losing state in any of them
3. A learner can return to the home screen at any time
...

NON-FUNCTIONAL REQUIREMENTS
--------------------------------------------------------------
1. Any lab loads within 2 seconds on a 4G connection (navigation click to first interaction)
...

ARCHITECTURAL CONSTRAINTS
--------------------------------------------------------------
1. Labs are independent: one lab cannot import from another
...

==============================================================
No application code exists yet.
The above defines what done means for this project.
==============================================================
```

This is working software. Not a web app. Not a component. But it runs, it is correct, and it produces output you can verify. It is the first vertical slice: a specification that has been executed.

---

### Separation of concerns — the principle behind every constraint

Every architectural constraint in `requirements.js` is an application of one principle: **separation of concerns**.

Separation of concerns means that each part of a system has exactly one job and does not reach into the jobs of other parts.

The constraints make this concrete:

"The shell does not import from any lab" — the shell's job is navigation and layout. Knowing what the CNC simulator renders is not the shell's job. If the shell imported from labs, changing any lab would require touching the shell, retesting the shell, and verifying everything the shell touches still works. The cost of a single lab change cascades into the whole system.

"Labs are independent" — each lab's job is its own domain. The CNC simulator simulates CNC. The CAD tool creates 2D drawings. Neither should know the other exists. If lab A imports from lab B, a bug in B can affect A even when A has nothing wrong with it.

The Mars Climate Orbiter burned up because unit conversion had no owner. It was not anyone's concern. Separation of concerns does not mean "split code into files" — it means every behaviour has exactly one owner, identifiable by name.

---

**CS lens — cohesion and coupling:**

Two metrics measure how well concerns are separated.

**Cohesion** measures how closely related the things inside a module are. High cohesion: everything in the file serves one goal. A file containing only parsing functions has high cohesion. A file containing a parser, a renderer, and a database connection has low cohesion.

**Coupling** measures how much a module depends on the internal details of another. Low coupling: modules interact through narrow, stable interfaces. A module that accesses another module's private state is highly coupled — it breaks whenever that state changes, even if the behaviour is unchanged.

Good software maximises cohesion and minimises coupling. Every architectural decision in this series moves in that direction.

---

**SE lens — the cost of entanglement grows faster than linearly:**

When two modules are entangled, changing one requires understanding both. When three are entangled, changing one requires understanding all three. When ten are entangled, changing one module effectively means changing the whole system, because you cannot reason about the change without understanding everything.

The cost of entanglement does not grow linearly with the number of modules — it grows superlinearly, because each new entanglement multiplies the understanding required.

This is why codebases that start fast become slow: early entanglement compounds into a state where every change requires understanding everything. The architectural constraints exist to prevent that compounding.

---

## Connect the Pieces

`requirements.js` is the first file of the project. It runs now. Every lesson after this adds to what already exists.

Every architectural decision in the series traces back to a requirement here:

- "Labs are independent" → why labs are loaded with `React.lazy` (lesson 020), why the registry pattern exists (lesson 022), why error boundaries wrap each lab (lesson 021)
- "A developer can add a new lab by reading fewer than 50 lines" → why the registry is a simple array (lesson 022) rather than a complex configuration object
- "The app works offline after first load" → why a service worker is added and what it caches
- "Any lab loads within 2 seconds" → why bundle splitting matters and why no lab code is in the main bundle

When you reach lesson 022 and add a new lab by appending one line to a registry file, you will understand why that design was chosen: not because it is clever, but because it satisfies requirement 4.

The open-calc platform you are studying was built without an explicit requirements document. Most real projects are. This means you must reverse-engineer the requirements from the code. Part of what makes a codebase hard to read is that its requirements are implicit — you cannot understand a decision without knowing the context it was made in. When you build your version from scratch with requirements written first, the code will be easier to understand because you will know why each piece exists before writing it.

---

## What Breaks Without This

If you skip requirements and write code first:

The first decision you make about data shape becomes a load-bearing assumption. Without requirements, the natural first step is to create files and start writing. Those files imply a structure. That structure implies decisions about where labs live, how the shell is organised, and what the routing looks like — all made without knowing the constraints that should govern them.

The discovery comes in lesson 015, when you add a second lab. The first lab's state was stored in a way that seemed reasonable for one lab. For two labs, the state storage must be shared between the parent and both children. The shape you used for one lab is the wrong shape for two. Changing it requires rewriting every file that touched it.

The concrete error — what gets built without the constraint "Lab state lives inside the lab":

```javascript
// What gets built without requirements — the shell managing lab state
const App = () => {
  const [cncState,  setCncState]  = useState({})
  const [cadState,  setCadState]  = useState({})
  const [vueState,  setVueState]  = useState({})
  // Every new lab requires a new state variable here in the shell

  return (
    <Router>
      <Route path="/cnc" element={<CNCLab  state={cncState}  setState={setCncState}  />} />
      <Route path="/cad" element={<CADTool state={cadState}  setState={setCadState}  />} />
      <Route path="/vue" element={<VueStudio state={vueState} setState={setVueState} />} />
    </Router>
  )
}
```

This violates constraint 5: "Lab state lives inside the lab." Adding the fourth lab means the shell must change. The shell now knows the internal state shape of every lab. Changing a lab's state shape requires changing the shell. The shell — the most central piece of the system — is coupled to everything.

If the constraint had been written first, this design would have been rejected at design time. Instead it gets built, spreads through ten components, and is discovered as wrong six weeks later when the pattern becomes unworkable.

---

## Definition of Done

- [ ] `requirements.js` exists in your project folder
- [ ] `node requirements.js` runs without errors and prints all three sections
- [ ] You have added at least one functional requirement not in the list above
- [ ] You have added at least one non-functional requirement that matters to you personally
- [ ] You can state, in one sentence, what each architectural constraint prevents
- [ ] You can describe the Mars Climate Orbiter failure in terms of separation of concerns
- [ ] You can explain the difference between a functional and a non-functional requirement without looking at the file
- [ ] **Git commit** — complete after lesson 003 when git is set up:
  ```
  git add requirements.js
  git commit -m "Add project requirements before first line of application code

  Specifies functional requirements, non-functional requirements, and
  architectural constraints that govern every decision in the series.
  Every architectural decision from lesson 020 onward traces back here."
  ```
