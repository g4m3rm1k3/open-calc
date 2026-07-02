# Lesson 00 — Orientation
## What We Are Building, Why, and the Tools We Use to Build It

---

## What You Will Build

By the end of this lesson you will have:

- A mental model of the entire MikeLab system drawn on paper
- Node.js, pnpm, and a code editor installed and verified
- A git repository initialised for MikeLab
- Your first TypeScript file compiled and run
- Your first JavaScript concepts understood through runnable examples

You will not build any math yet. This lesson builds the foundation
everything else sits on: the tools, the vocabulary, and the map.

---

## What You Need To Know First

This lesson assumes:

```
✓ You have used a terminal before (cd, mkdir, basic navigation)
✓ You know what a file and a folder are
✓ You have written some JavaScript or Python
```

Everything else is taught here.

---

# Part 1: The Map

Before writing a single line of code, understand what you are building.

## What MikeLab Is

MikeLab is a program that reads text like this:

```
A = [1 2; 3 4]
B = A * A
eig(B)
```

and produces the correct mathematical result — the same result
MATLAB would produce.

That seems simple. It is not. To do it, MikeLab needs four separate
systems working together:

```
System 1: The Math Engine
  Knows what a matrix is.
  Knows how to multiply two matrices.
  Knows how to find eigenvalues.
  Knows nothing about text or syntax.

System 2: The Language Parser
  Knows how to read MATLAB text.
  Knows that [1 2; 3 4] means "a 2x2 matrix".
  Knows that * means multiply.
  Knows nothing about math — it just reads and structures.

System 3: The Evaluator
  Connects the parser to the math engine.
  Takes a structured representation of the program
  and executes it using the math engine.

System 4: The User Interface
  The browser page where you type code and see results.
  Shows matrices, graphs, and error messages.
  Knows nothing about math — it just displays.
```

**Draw this on paper now.** Four boxes. Label them. Draw arrows
showing which system talks to which. This is your map.

The arrows matter:

```
UI  →  Parser  →  Evaluator  →  Math Engine
```

Information flows left to right. The UI sends text to the parser.
The parser sends structure to the evaluator. The evaluator calls
the math engine. Results flow back right to left.

**Crucially:** the math engine never talks to the UI. The UI never
talks directly to the math engine. Each system only talks to its
immediate neighbour. This is called **separation of concerns** —
one of the most important ideas in software engineering.

## Why Separation of Concerns Matters

Imagine the alternative: one giant file where the code that draws
the button also does matrix multiplication. Now imagine you find
a bug in matrix multiplication. To fix it, you have to understand
the button drawing code too. To test it, you have to run the whole
UI. To reuse just the math in a different project, you cannot —
it is tangled with the UI.

Separation of concerns means each piece has exactly one job.
The math engine only does math. You can test it without a UI.
You can reuse it in a command-line tool, a server, or a different
UI. When it breaks, the bug is in one place.

This is why MikeLab is built as three separate packages:

```
@mikelab/core      the math engine — one job: math
@mikelab/parser    the parser      — one job: reading MATLAB text
@mikelab/ui        the interface   — one job: display
```

Each is independently publishable. Someone who only wants the math
engine installs `@mikelab/core`. Someone who wants to parse MATLAB
installs `@mikelab/parser`. The UI is optional.

---

# Part 2: The Tools

## What Node.js Is

JavaScript was invented to run inside web browsers. For ten years,
that was the only place it ran.

In 2009, Node.js was created. Node.js is a JavaScript runtime —
a program that runs JavaScript outside of a browser. On your machine.
On a server. Anywhere.

When you install Node.js, you get two things:

```
node     — runs JavaScript files directly
npm      — the Node Package Manager, explained below
```

**Verify Node.js is installed:**

Open your terminal and type:

```powershell
node --version
```

You should see something like `v20.11.0`. If you see an error,
go to nodejs.org and install the LTS version before continuing.

**Run your first JavaScript outside a browser:**

Create a file called `hello.js` anywhere on your computer.
Type this inside it:

```javascript
console.log("MikeLab is starting.");
console.log(1 + 1);
console.log("Two plus two is " + (2 + 2));
```

Now run it:

```powershell
node hello.js
```

You should see:

```
MikeLab is starting.
2
Two plus two is 4
```

**What just happened:** `node` read your file, executed the JavaScript,
and printed the results. No browser. No HTML. Just JavaScript running
directly.

`console.log()` is a function. It takes whatever you pass it and
prints it to the terminal. It is how you see what your code is doing
while you build it.

## What npm Is

npm is the Node Package Manager. It does three things:

**1. Downloads packages.**
A package is code someone else wrote, packaged so you can use it.
When you install TypeScript, Vitest, or any other tool, npm downloads
it from the npm registry (a giant public database of packages).

**2. Records what you have installed.**
It stores a list of your project's packages in a file called
`package.json`. This means anyone else who gets your code can
reproduce your exact setup by running `npm install`.

**3. Runs scripts.**
`npm run build`, `npm run test` — these run commands you define
in `package.json`.

**Verify npm is installed:**

```powershell
npm --version
```

You should see a version number. npm comes with Node.js so if
Node.js is installed, npm is too.

## What pnpm Is and Why We Use It Instead of npm

pnpm does the same three things as npm, but smarter.

When npm installs a package, it copies it into every project
that uses it. If you have 10 projects all using TypeScript,
npm puts 10 copies of TypeScript on your hard drive.

pnpm stores one copy of each package in one place on your hard drive,
then creates a link from each project to that shared copy. Faster
to install. Less disk space. For a project like MikeLab with three
sub-packages that share dependencies, this matters a lot.

pnpm also has built-in support for **workspaces** — a way to manage
multiple packages in one folder, which is exactly what MikeLab needs.

**Install pnpm** (you already did this, but here is the explanation):

```powershell
npm install -g pnpm
```

Breaking down this command:
- `npm` — the program being run
- `install` — the subcommand: download and install a package
- `-g` — short for `--global`: install this package system-wide,
  not just in one project, so you can run `pnpm` from any folder
- `pnpm` — the name of the package to install (from the npm registry)

**Verify pnpm:**

```powershell
pnpm --version
```

## What a Code Editor Is and Which to Use

A code editor is a text editor designed for writing code. It understands
the syntax of programming languages: it highlights keywords, shows errors
as you type, and lets you navigate large codebases.

We use **Visual Studio Code** (VS Code). It is free, runs on Windows
and Mac, and has excellent TypeScript support built in.

Download from: code.visualstudio.com

**Install these extensions** (open VS Code, press Ctrl+Shift+X):

```
ESLint          — shows code quality issues as you type
Prettier        — formats your code automatically
Error Lens      — shows TypeScript errors inline, not just underlined
```

These are not optional decorations. ESLint catches bugs before you
run the code. Prettier ensures consistent formatting. Error Lens
makes TypeScript errors impossible to miss.

## What Git Is and Why It Is Not Optional

Git is version control software. Version control records a history
of every change you make to your project.

Without git, if you break something you cannot get back to when it
worked. If you want to try two different approaches, you cannot do
them in parallel. If you want to know why a piece of code exists,
you have no record.

With git, every time you finish something working, you take a snapshot
called a **commit**. You can return to any commit. You can see exactly
what changed between commits. You can work on two things at once
using branches and merge them later.

Git is not for sharing code (though it enables that). It is for
your own sanity as you build something complex.

**Install git:** git-scm.com/downloads

**Verify:**

```powershell
git --version
```

## The Three States of a File in Git

Every file in a git-tracked project is in one of three states:

```
Modified    — you changed the file, but git does not know yet
Staged      — you told git "include this change in the next snapshot"
Committed   — the snapshot is taken, the change is permanently recorded
```

The workflow is always:

```
1. Edit files
2. Stage the changes you want to include: git add filename
3. Commit with a message explaining why: git commit -m "your message"
```

**What a commit message is:**

A commit message is not a description of what files changed.
Git records that automatically. A commit message explains WHY
this change was made.

```
BAD:  "add matrix file"
GOOD: "introduce Matrix class as the core data structure for @mikelab/core"
```

Six months from now, "add matrix file" tells you nothing.
The good message tells you exactly what decision was made and why.

---

# Part 3: TypeScript and JavaScript

TypeScript is JavaScript with types. Before learning TypeScript,
you need to understand what JavaScript does and where TypeScript
adds to it. Every example here is runnable — open a terminal,
create a file, run it with `node`.

## Variables

JavaScript has three ways to declare a variable:

```javascript
// var — the old way. Never use it. Explained below.
var oldStyle = "avoid this";

// let — a variable whose value can change.
let score = 0;
score = 10;     // valid: score is now 10

// const — a variable whose binding cannot change.
const name = "MikeLab";
// name = "something else";   // ERROR: cannot reassign a const
```

**Why var is avoided:** `var` is "function scoped" — it leaks out
of if statements and for loops. `let` and `const` are "block scoped"
— they stay inside the `{}` where they were declared. Block scoping
prevents entire classes of bugs. Always use `const` unless the value
needs to change, then use `let`. Never use `var`.

**Create `variables.js` and run it:**

```javascript
const pi = 3.14159;
let radius = 5;

console.log("Pi is:", pi);
console.log("Radius is:", radius);

radius = 10;
console.log("New radius:", radius);

// Try to change pi — uncomment this to see the error:
// pi = 3;
```

```powershell
node variables.js
```

## Data Types

JavaScript has these basic types:

```javascript
// Number — all numbers are the same type (no int vs float)
const integer = 42;
const decimal = 3.14;
const scientific = 1.5e-3;     // 0.0015
const notANumber = NaN;        // result of invalid math: 0/0
const infinite = Infinity;     // result of: 1/0

// String — text
const single = 'hello';
const double = "world";
const template = `pi is ${pi}`;    // template literal: inserts variables

// Boolean — true or false
const isReady = true;
const isDone = false;

// null — intentionally empty
const nothing = null;

// undefined — a variable declared but not given a value
let notYetSet;
console.log(notYetSet);    // undefined
```

**Create `types.js` and run it:**

```javascript
const x = 10;
const y = 3;

console.log(x + y);       // 13    addition
console.log(x - y);       // 7     subtraction
console.log(x * y);       // 30    multiplication
console.log(x / y);       // 3.333...  division
console.log(x % y);       // 1     remainder (modulo)
console.log(x ** y);      // 1000  exponentiation (10 to the power 3)

// What NaN means in practice:
console.log(0 / 0);       // NaN
console.log(NaN + 1);     // NaN  — NaN is contagious

// Infinity:
console.log(1 / 0);       // Infinity
console.log(-1 / 0);      // -Infinity
```

## Arrays

An array is an ordered list of values.

```javascript
const numbers = [1, 2, 3, 4, 5];

// Accessing by index — JavaScript counts from 0, not 1
console.log(numbers[0]);      // 1  (first element)
console.log(numbers[4]);      // 5  (last element)
console.log(numbers.length);  // 5  (number of elements)
```

**Why zero-indexed?** Most programming languages start counting at 0.
The index is an offset from the start: element 0 is 0 positions from
the start, element 1 is 1 position from the start, and so on.
MATLAB counts from 1. This difference will matter later when we
translate MATLAB's A(1,1) to our Matrix.get(0,0).

**Create `arrays.js` and run it:**

```javascript
const data = [10, 20, 30, 40, 50];

// Reading elements
console.log(data[0]);           // 10
console.log(data[data.length - 1]);   // 50 (last element)

// Changing elements
data[2] = 99;
console.log(data);              // [10, 20, 99, 40, 50]

// Array methods
const doubled = data.map(x => x * 2);
console.log(doubled);           // [20, 40, 198, 80, 100]

const total = data.reduce((sum, x) => sum + x, 0);
console.log(total);             // 219
```

`data.map(x => x * 2)` — this uses an **arrow function**.
`x => x * 2` means: take x as input, return x * 2.
It is shorthand for `function(x) { return x * 2; }`.
`map` applies this function to every element and returns a new array.

`data.reduce((sum, x) => sum + x, 0)` — starts with sum = 0,
then for each element adds it to sum. Returns the final sum.

## Objects

An object is a collection of key-value pairs.

```javascript
const matrix = {
    rows: 2,
    cols: 2,
    data: [1, 2, 3, 4]
};

// Accessing properties
console.log(matrix.rows);       // 2
console.log(matrix["cols"]);    // 2  (bracket notation, same result)

// Adding a property
matrix.label = "A";
console.log(matrix.label);     // "A"
```

**Create `objects.js` and run it:**

```javascript
const point = {
    x: 3,
    y: 4
};

// Compute something using the object's properties
const distance = Math.sqrt(point.x ** 2 + point.y ** 2);
console.log("Distance from origin:", distance);   // 5

// Objects can contain functions
const vector = {
    x: 1,
    y: 2,
    length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
};

console.log("Vector length:", vector.length());   // 2.236...
```

`this` inside a method refers to the object the method belongs to.
`vector.length()` calls the function stored at `vector.length`.
`this.x` inside that function is `vector.x`.

## Functions

A function is a named, reusable piece of code.

```javascript
// Function declaration
function add(a, b) {
    return a + b;
}

// Function expression assigned to a const
const multiply = function(a, b) {
    return a * b;
};

// Arrow function (shorthand for simple functions)
const square = (x) => x * x;

// Arrow function with a body (when you need multiple lines)
const clamp = (value, min, max) => {
    if (value < min) return min;
    if (value > max) return max;
    return value;
};

console.log(add(3, 4));           // 7
console.log(multiply(3, 4));      // 12
console.log(square(5));           // 25
console.log(clamp(15, 0, 10));    // 10
```

**Create `functions.js` and run it:**

```javascript
function dotProduct(vectorA, vectorB) {
    // Check that vectors have the same length
    if (vectorA.length !== vectorB.length) {
        throw new Error(
            `Cannot compute dot product of vectors with different lengths: ` +
            `${vectorA.length} and ${vectorB.length}`
        );
    }

    let total = 0;
    for (let index = 0; index < vectorA.length; index++) {
        total += vectorA[index] * vectorB[index];
    }
    return total;
}

console.log(dotProduct([1, 2, 3], [4, 5, 6]));   // 1*4 + 2*5 + 3*6 = 32

// Uncomment to see the error:
// console.log(dotProduct([1, 2], [1, 2, 3]));
```

`throw new Error(message)` — this stops execution and produces an error.
When you call a function that might throw, you can catch the error
with try/catch (covered in a later lesson). For now, understand that
throwing is how a function signals "something is wrong".

The `for` loop:
- `let index = 0` — start at position 0
- `index < vectorA.length` — keep going while index is within bounds
- `index++` — increment index by 1 after each iteration

## Classes

A class is a blueprint for creating objects that share the same
structure and behaviour.

```javascript
class Rectangle {
    // The constructor runs when you write: new Rectangle(...)
    // It receives the arguments and sets up the object.
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    // Methods are functions that belong to the class
    area() {
        return this.width * this.height;
    }

    perimeter() {
        return 2 * (this.width + this.height);
    }

    // A static method belongs to the class itself, not instances
    // Call it as: Rectangle.square(5) not rect.square(5)
    static square(side) {
        return new Rectangle(side, side);
    }
}

const rect = new Rectangle(4, 6);
console.log(rect.area());         // 24
console.log(rect.perimeter());    // 20

const square = Rectangle.square(5);
console.log(square.area());       // 25
```

**Create `classes.js` and run it:**

```javascript
class Counter {
    constructor(start) {
        this.value = start;
        this.history = [start];
    }

    increment(amount) {
        this.value += amount;
        this.history.push(this.value);
        return this;    // returning this allows chaining: counter.increment(1).increment(2)
    }

    reset() {
        this.value = 0;
        this.history.push(0);
        return this;
    }

    report() {
        console.log("Current value:", this.value);
        console.log("History:", this.history);
    }
}

const counter = new Counter(10);
counter.increment(5).increment(3).increment(2);
counter.report();
// Current value: 20
// History: [10, 15, 18, 20]
```

## What TypeScript Adds

TypeScript is JavaScript with one addition: **types**.

A type tells TypeScript what kind of value a variable holds.
TypeScript checks that you use values consistently with their type —
at compile time, before the code runs.

**JavaScript (no types — errors only at runtime):**

```javascript
function add(a, b) {
    return a + b;
}

add(1, 2);          // 3  — correct
add("1", "2");      // "12" — string concatenation, probably wrong
add(1, "2");        // "12" — definitely wrong, no error thrown
```

JavaScript has no idea what `a` and `b` are supposed to be.
It will add anything to anything and silently produce a wrong result.

**TypeScript (types — errors at compile time):**

```typescript
function add(a: number, b: number): number {
    return a + b;
}

add(1, 2);          // 3  — correct
// add("1", "2");   // COMPILE ERROR: "1" is not a number
// add(1, "2");     // COMPILE ERROR: "2" is not a number
```

The `: number` after each parameter name is a **type annotation**.
It tells TypeScript: this parameter must be a number.
If you pass a string, TypeScript refuses to compile. The error
appears in your editor before you ever run the code.

The `: number` after the `)` is the **return type annotation**.
It tells TypeScript: this function must return a number.
If you accidentally write `return "hello"` inside it, TypeScript
catches that too.

**TypeScript is not a different language.** It compiles to JavaScript.
The types exist only during development — they are stripped out
when the code is compiled. What runs in Node.js and the browser
is plain JavaScript.

## Your First TypeScript File

Create `first.ts` (the .ts extension means TypeScript):

```typescript
// A type annotation: this variable must hold a number
const pi: number = 3.14159;

// TypeScript can also infer the type without you writing it
// const pi = 3.14159 — TypeScript knows this is a number from the value
const name: string = "MikeLab";
const isReady: boolean = true;

// A function with typed parameters and return type
function circleArea(radius: number): number {
    return pi * radius * radius;
}

// An array type: number[] means "array of numbers"
const measurements: number[] = [1.2, 3.4, 5.6];

// An interface: describes the shape of an object
interface Point {
    x: number;
    y: number;
}

// TypeScript checks that this object matches the Point interface
const origin: Point = { x: 0, y: 0 };

console.log("Area of circle with radius 5:", circleArea(5));
console.log("Measurements:", measurements);
console.log("Origin:", origin);
```

**Compile and run it:**

First install TypeScript globally if you have not already:

```powershell
npm install -g typescript
```

Now compile:

```powershell
tsc first.ts
```

`tsc` is the TypeScript compiler. It reads `first.ts` and produces
`first.js` — plain JavaScript that Node.js can run.

Run the compiled file:

```powershell
node first.js
```

**What tsc does:** it reads your TypeScript, checks all the types,
and if everything is consistent, produces equivalent JavaScript with
all type annotations removed. If there is a type error, it tells you
exactly which line and what the problem is — and refuses to produce
the JavaScript.

---

# Part 4: Setting Up MikeLab

Now that you understand the tools, set up the project.

## Initialise the Repository

```powershell
mkdir mikelab
cd mikelab
git init
```

`git init` — initialises a new git repository in the current folder.
It creates a hidden `.git` folder that git uses to track history.

Create a `.gitignore` file in the `mikelab` folder:

```
node_modules
dist
.turbo
*.js
*.d.ts
```

**What .gitignore does:** git will never track files or folders
that match these patterns.

**Why `node_modules` is ignored:** when you install packages,
npm/pnpm downloads thousands of files into `node_modules`.
These are not your code — they are other people's code that
your project uses. They can be reproduced by running `pnpm install`.
Committing them would add hundreds of thousands of files to your
repository and make it enormous.

**Why `dist` is ignored:** `dist` is where compiled JavaScript goes.
Like `node_modules`, it is generated from your source code and
does not need to be tracked. Anyone with your source can generate it.

**Why `*.js` is ignored:** for now, we are only writing TypeScript.
Any `.js` files are compiled output, not source code.

## Initialise the Project

```powershell
pnpm init
```

This creates `package.json`. Open it and look at it.
`package.json` is the manifest for your project — it describes
what your project is, what it depends on, and what commands
it supports.

It currently looks something like:

```json
{
  "name": "mikelab",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

Replace it with:

```json
{
  "name": "mikelab",
  "version": "0.0.1",
  "private": true,
  "description": "A MATLAB-compatible math engine for JavaScript and TypeScript"
}
```

**What each field means:**

`"name"` — the name of this package. For the root of a monorepo,
this is just a label — it will never be published.

`"version"` — the version number. We start at 0.0.1 meaning
"not yet released, early development".

`"private": true` — this tells npm: never publish this package.
The root of a monorepo is never published directly. Only the
packages inside `packages/` are published. Without this flag,
you could accidentally publish the root.

`"description"` — a human-readable description.

## Take Your First Commit

```powershell
git add .
git status
```

`git add .` — stages all files in the current directory.
The `.` means "everything here".

`git status` — shows which files are staged (green) and which
are modified but not staged (red). Read the output before committing.
You should see `.gitignore` and `package.json` staged.

```powershell
git commit -m "initialise MikeLab project with .gitignore and package.json"
```

`git commit` — takes a snapshot of all staged files.
`-m "message"` — provides the commit message inline.

This message says WHY this commit exists: we are initialising
the project. Six months from now you will look at this commit
and know it was the starting point.

---

# Connect the Pieces

What you set up today:

```
Node.js     — runs JavaScript outside the browser
pnpm        — installs packages and manages the monorepo
TypeScript  — adds types to JavaScript
VS Code     — your editor
Git         — records your history
```

These tools work together on every lesson from here:

```
You write TypeScript
     ↓
tsc compiles it to JavaScript
     ↓
node runs it
     ↓
git records that it works
```

In the next lesson you will create the three packages
(@mikelab/core, @mikelab/parser, @mikelab/ui) and write
the first real TypeScript — a tiny piece of the math engine
that compiles, runs, and has a passing test.

---

# What Breaks Without This

If you skip git setup and start writing code without committing,
the first time you break something you cannot get back to when
it worked. This has happened to every developer who skipped
version control. It is painful. Do not skip it.

If you use `var` instead of `let` and `const`, you will hit bugs
where variables leak out of loops and if statements in ways that
are almost impossible to debug. The code appears to work, then
does something inexplicable. Use `const` and `let`. Always.

If you write TypeScript without strict mode enabled (which we will
set up in Lesson 01), TypeScript catches fewer bugs. You lose
the main benefit of using TypeScript in the first place.

---

# Challenges

Do these yourself. No answers provided. The goal is to discover,
not to verify — if you are not sure your answer is right, run it
and find out.

**Challenge 1:**

Write a function called `matrixTrace` that takes a 2D array of
numbers and returns the sum of the diagonal entries (top-left
to bottom-right).

```javascript
// Example:
// matrixTrace([[1,2],[3,4]])  should return  1 + 4 = 5
// matrixTrace([[1,0,0],[0,2,0],[0,0,3]])  should return  1 + 2 + 3 = 6
```

Requirements:
- Use a `for` loop with an index variable
- Throw an error if the matrix is not square
- Write at least three `console.log` calls that verify it works

**Challenge 2:**

Write a class called `Stack`. A stack is a data structure where
you can only add to the top and remove from the top.
"Last in, first out" — like a stack of plates.

```javascript
const stack = new Stack();
stack.push(1);
stack.push(2);
stack.push(3);
console.log(stack.pop());    // 3
console.log(stack.pop());    // 2
console.log(stack.peek());   // 1 (look at top without removing)
console.log(stack.size);     // 1
```

Requirements:
- `push(value)` — add to the top
- `pop()` — remove and return the top value; throw if empty
- `peek()` — return the top value without removing it; throw if empty
- `size` — a getter that returns the number of items

**Challenge 3:**

This one has a TypeScript component. Create `types-challenge.ts`
and add type annotations to this code so that TypeScript accepts it:

```typescript
// Add type annotations everywhere a : type annotation belongs

function dotProduct(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
        throw new Error("Vectors must have the same length");
    }
    let total = 0;
    for (let index = 0; index < vectorA.length; index++) {
        total += vectorA[index] * vectorB[index];
    }
    return total;
}

interface MatrixDimensions {
    // Add the two fields this interface needs
}

function createZeroMatrix(dimensions) {
    const rows = [];
    for (let rowIndex = 0; rowIndex < dimensions.rows; rowIndex++) {
        const row = [];
        for (let colIndex = 0; colIndex < dimensions.cols; colIndex++) {
            row.push(0);
        }
        rows.push(row);
    }
    return rows;
}

console.log(dotProduct([1, 2, 3], [4, 5, 6]));
console.log(createZeroMatrix({ rows: 2, cols: 3 }));
```

Compile with `tsc types-challenge.ts` — it should compile with no errors.

---

# Definition of Done

Before moving to Lesson 01, verify every item:

```
□ node --version prints a version number
□ pnpm --version prints a version number
□ git --version prints a version number
□ VS Code is installed with ESLint, Prettier, and Error Lens
□ You ran all five JavaScript example files with node and saw output
□ You compiled and ran first.ts successfully
□ The mikelab folder exists with .gitignore and package.json
□ git log shows your first commit
□ You completed all three challenges and they run without errors
□ Challenge 3 compiles with tsc with no errors
```

**Your commit for this lesson:**

```powershell
git add .
git commit -m "lesson 00 complete: orientation, tools installed, first TypeScript compiled"
```
