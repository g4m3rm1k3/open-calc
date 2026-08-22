# The 80/20 Multi-Language Engineering Curriculum

## Lesson-by-Lesson Master Curriculum

### Curriculum rule

Every lesson follows:

**Build → encounter a problem → introduce the concept → implement it → run it → inspect what changed → commit**

No finished programs are presented for explanation afterward.

A lesson may be short or long. A lesson is complete when the learner has actually built and run the increment.

Porting an existing project to another language is intentional. The architecture remains recognizable so the language differences become visible.

---

# PHASE 0 — ENGINEERING WORKFLOW

These are woven into the later lessons, but the first project establishes the workflow.

## Git

### Lesson 0.1 — Create the first repository

Build the smallest runnable project and make the first commit.

**Teach**

* repository
* working tree
* staging
* commit
* meaningful commit message

**Engineering idea:** a project has recoverable history from its first line.

### Lesson 0.2 — Make a feature branch

Create a branch for a small change, implement it, and return to the main branch.

**Teach**

* branch
* checkout/switch
* isolated work

### Lesson 0.3 — Merge a feature

Merge the branch back into the main line.

**Teach**

* merge
* fast-forward vs merge commit

### Lesson 0.4 — Cause and resolve a real conflict

Two branches modify the same code.

**Teach**

* conflict markers
* deciding which changes survive
* testing after resolution

### Lesson 0.5 — Rebase

Create a situation where rebasing has an actual reason.

**Teach**

* replaying commits
* rebase vs merge
* why history changes

### Lesson 0.6 — Bisect a real bug

Introduce a bug, make several commits, and use `git bisect` to locate it.

**Teach**

* binary search through history
* commits as debugging evidence

---

# PHASE 1 — C# / OBJECTS BEGIN

## Running project: `Service`

The project begins as a tiny executable and gradually becomes a small service architecture.

### Lesson 1.1 — Make the program do one useful thing

Create the executable and produce one observable result.

**Teach**

* project structure
* entry point
* build/run cycle

No abstract OOP lecture.

### Lesson 1.2 — The first class

The program now needs something that represents a distinct responsibility.

Create the first `Service` class.

**Teach**

* class
* object
* instance
* method
* constructor

### Lesson 1.3 — Give the object state

The service now needs information that persists between method calls.

**Teach**

* fields
* object state
* instance members

### Lesson 1.4 — Encapsulate the state

External code should no longer manipulate the service's internals directly.

**Teach**

* access modifiers
* encapsulation
* properties

### Lesson 1.5 — Separate responsibilities

The service now does two unrelated jobs.

Extract one responsibility into another class.

**Teach**

* composition
* "has-a"
* responsibility boundaries

### Lesson 1.6 — Give the service a dependency

The service needs another object to perform part of its work.

Pass the dependency into the constructor.

**Teach**

* dependency
* constructor injection
* dependency inversion as a practical problem

### Lesson 1.7 — The dependency needs multiple implementations

The application now needs two ways to perform the same operation.

**Teach**

* interface
* implementation
* polymorphism

### Lesson 1.8 — Swap implementations

Replace one implementation with another without changing `Service`.

**Teach**

* programming against an abstraction
* loose coupling
* why the interface exists

### Lesson 1.9 — Introduce a generic operation

The service now has the same algorithm over different data types.

**Teach**

* generic type parameter
* generic method/class
* why generics exist

### Lesson 1.10 — Handle failure

The service encounters an operation that can fail.

**Teach**

* exceptions
* throwing
* catching
* deciding where failure belongs

### Lesson 1.11 — Make the operation asynchronous

The service now performs work that should not block the caller.

**Teach**

* `Task`
* `async`
* `await`
* asynchronous control flow

### Lesson 1.12 — Refactor the architecture

Review the actual system now built.

**Teach**

* dependency graph
* interface vs implementation
* composition vs inheritance
* why each abstraction exists

**Milestone:** You can read and build a small C# object-oriented system rather than merely recognize C# syntax.

---

# PHASE 2 — JAVA / SAME ARCHITECTURE, DIFFERENT RUNTIME

The C# `Service` is now deliberately ported.

The architecture stays approximately the same.

## Java

### Lesson 2.1 — Recreate the executable

Build the smallest Java version.

**Teach**

* project/build structure
* JVM
* entry point

### Lesson 2.2 — Port the C# class

Rebuild `Service` in Java.

**Teach**

* Java class syntax
* objects
* methods
* constructors

### Lesson 2.3 — Port encapsulated state

Move the C# object's state model into Java.

**Teach**

* fields
* access modifiers
* getters/setters
* Java's approach to properties

### Lesson 2.4 — Port composition

Rebuild the C# dependency relationship.

**Teach**

* object references
* composition
* constructor injection

### Lesson 2.5 — Port the interface

Recreate the abstraction.

**Teach**

* Java interfaces
* implementation
* polymorphism

### Lesson 2.6 — Compare C# and Java generics

Port the generic operation.

**Teach**

* Java generic syntax
* type parameters
* similarities and differences

### Lesson 2.7 — Port failure handling

Recreate the failure path.

**Teach**

* exceptions
* checked vs unchecked exceptions
* `try/catch`
* Java's philosophy of exceptions

### Lesson 2.8 — Collections appear naturally

The service now needs to handle multiple objects.

**Teach**

* `List`
* `Map`
* iteration
* collection interfaces

### Lesson 2.9 — References become explicit

Investigate what Java variables containing objects actually represent.

**Teach**

* primitive vs reference types
* references
* object identity
* JVM-managed lifetime

### Lesson 2.10 — Compare the runtimes

Stop coding briefly and inspect what actually changed.

**Compare**

* C# CLR vs Java JVM
* garbage collection
* object references
* properties vs methods
* interfaces
* generics
* exceptions

**Milestone:** Same architecture, different managed runtime.

---

# PHASE 3 — KOTLIN / SAME ARCHITECTURE, LESS CEREMONY

Port the Java implementation again.

### Lesson 3.1 — Rebuild the Java entry point in Kotlin

**Teach**

* Kotlin program structure
* `fun`
* `val`
* `var`

### Lesson 3.2 — Port `Service`

**Teach**

* Kotlin classes
* constructors
* member functions

### Lesson 3.3 — Replace Java boilerplate

The Java model contains repetitive getters/setters.

**Teach**

* properties
* concise syntax

### Lesson 3.4 — Replace the Java data holder

**Teach**

* `data class`
* generated behavior
* value-oriented data

### Lesson 3.5 — Break the program with `null`

Introduce a real nullable value.

**Teach**

* nullable types
* `?`
* safe calls
* Elvis operator

### Lesson 3.6 — Make the interface Kotlin

**Teach**

* interfaces
* implementations
* type inference

### Lesson 3.7 — Add an extension function

A useful operation doesn't belong inside the original class.

**Teach**

* extension functions
* why they aren't traditional inheritance

### Lesson 3.8 — Compare all three

Build a side-by-side comparison:

**C# → Java → Kotlin**

Focus on:

* classes
* interfaces
* properties
* generics
* nullability
* constructors
* type inference
* runtime

**Milestone:** You can recognize the architecture independent of language ceremony.

---

# PHASE 4 — C++ / THE OBJECT STOPS BEING HIDDEN

This is not another OOP course.

The same `Service` is rebuilt specifically to expose lifetime and value semantics.

### Lesson 4.1 — Build the smallest C++ program

**Teach**

* compilation
* executable
* source/header distinction when needed

### Lesson 4.2 — Create the first class

Port `Service`.

**Teach**

* C++ class
* object construction
* member functions

### Lesson 4.3 — Put an object on the stack

Create and destroy a service in a scope.

**Teach**

* automatic storage
* scope
* deterministic destruction

### Lesson 4.4 — Watch the destructor run

Add observable destruction behavior.

**Teach**

* destructor
* object lifetime
* RAII

### Lesson 4.5 — Resource ownership

Give a class responsibility for a resource.

**Teach**

* resource acquisition
* RAII
* ownership as a class responsibility

### Lesson 4.6 — Value semantics

Copy the object.

**Teach**

* copy constructor
* copy assignment
* independent object state

### Lesson 4.7 — Deliberately create a copy bug

Make copying expensive or unsafe.

**Teach**

* shallow vs deep copying
* why ownership makes copying meaningful

### Lesson 4.8 — Move the object

Change the program so the resource can transfer instead of duplicate.

**Teach**

* move constructor
* move assignment
* rvalue references at the level needed to understand the behavior

### Lesson 4.9 — `unique_ptr`

Replace manual ownership logic.

**Teach**

* exclusive ownership
* RAII through smart pointers

### Lesson 4.10 — `shared_ptr`

Create a situation where shared ownership is genuinely required.

**Teach**

* shared ownership
* reference counting
* why `shared_ptr` is not the default answer

### Lesson 4.11 — Const correctness

A service should inspect something without modifying it.

**Teach**

* `const`
* const member functions
* references to const

### Lesson 4.12 — Stack vs heap

Now compare the different storage/lifetime situations directly.

**Teach**

* automatic storage
* dynamic storage
* ownership
* lifetime

### Lesson 4.13 — Rebuild the service cleanly

Remove unnecessary complexity and apply RAII correctly.

**Milestone:** The learner understands why C++ requires explicit reasoning about lifetime, ownership, copying, and moving.

---

# PHASE 5 — HTML/CSS / UI ENGINEERING

This is not a beginner HTML/CSS course.

The goal is to build the UI boundary for `Data`.

### Lesson 5.1 — Build the document shell

Create the static page structure.

**Teach**

* semantic structure
* document hierarchy

### Lesson 5.2 — Make the data visible

Create the first representation of `Data`.

**Teach**

* visual hierarchy
* meaningful markup

### Lesson 5.3 — Establish layout

Introduce the layout mechanism only because the page now needs one.

**Teach**

* flexbox/grid as required
* layout constraints

### Lesson 5.4 — Build the data list

Represent multiple records.

**Teach**

* repeated UI structure
* spacing
* alignment

### Lesson 5.5 — Build a detail view

A selected record needs a different visual representation.

**Teach**

* composition
* reusable visual regions

### Lesson 5.6 — Responsive behavior

The layout breaks at a different viewport.

**Teach**

* media queries
* responsive constraints

### Lesson 5.7 — Visual state

Represent loading, empty, error, and populated states visually.

**Teach**

* UI states
* state-specific presentation

### Lesson 5.8 — Prepare the shell for JavaScript

Identify which parts will eventually become dynamic.

**Milestone:** Static UI can represent the application's data states before JavaScript exists.

---

# PHASE 6 — JAVASCRIPT / BEHAVIOR

### Lesson 6.1 — Make one UI element respond

**Teach**

* DOM selection
* event listeners
* event handlers

### Lesson 6.2 — Move data into JavaScript

Represent one `Data` record.

**Teach**

* objects
* arrays
* object access

### Lesson 6.3 — Render data

Generate the UI from the data.

**Teach**

* data → DOM
* rendering as transformation

### Lesson 6.4 — Extract a function

The rendering logic is becoming difficult to manage.

**Teach**

* functions as abstractions
* parameters
* return values

### Lesson 6.5 — Create a closure

A function needs to retain access to surrounding state.

**Teach**

* lexical scope
* closure

### Lesson 6.6 — Handle user state

The selected record needs to survive between events.

**Teach**

* mutable state
* closure-based state

### Lesson 6.7 — Fetch real data

The UI now needs the backend.

**Teach**

* HTTP request
* `fetch`
* JSON

### Lesson 6.8 — Handle asynchronous results

**Teach**

* Promise
* `async`
* `await`
* asynchronous control flow

### Lesson 6.9 — Handle loading and failure

**Teach**

* pending
* success
* failure
* asynchronous state

### Lesson 6.10 — Split the program into modules

The script is becoming too large.

**Teach**

* ES modules
* imports
* exports
* module boundaries

### Lesson 6.11 — Investigate `this`

Create a situation where method context matters.

**Teach**

* `this`
* call-site behavior
* arrow functions

### Lesson 6.12 — Compare JavaScript with C#/Java

Focus on:

* dynamic vs static typing
* objects
* functions
* closures
* modules
* async model

**Milestone:** The learner can build and reason about a small browser application without a framework.

---

# PHASE 7 — TYPESCRIPT / MAKE THE MODEL EXPLICIT

Port the known JavaScript program rather than inventing a new one.

### Lesson 7.1 — Add the first type

Type one known value.

**Teach**

* annotations
* inference

### Lesson 7.2 — Type the `Data` model

**Teach**

* object types
* optional properties

### Lesson 7.3 — Type functions

**Teach**

* parameter types
* return types

### Lesson 7.4 — Type the API response

**Teach**

* interfaces/types
* boundary typing

### Lesson 7.5 — Let TypeScript catch a real bug

Introduce an intentional mismatch.

**Teach**

* compile-time checking
* why static typing matters

### Lesson 7.6 — Union types

The UI can have several legitimate states.

**Teach**

* union types
* representing alternatives

### Lesson 7.7 — Narrow the union

**Teach**

* type guards
* control-flow narrowing

### Lesson 7.8 — Generic function

The code performs the same transformation over multiple types.

**Teach**

* generics
* constraints when necessary

### Lesson 7.9 — Type the asynchronous path

**Teach**

* Promise types
* API boundaries

### Lesson 7.10 — Compare JS and TS

The important question:

**What does the type system allow us to know before running the program?**

**Milestone:** TypeScript is understood as JavaScript plus a static type system, not as an unrelated language.

---

# PHASE 8 — REACT

React is introduced only after the learner has already built rendering manually.

That makes the abstraction meaningful.

### Lesson 8.1 — Replace manual rendering with a component

**Teach**

* component
* JSX
* render function

### Lesson 8.2 — Pass data through props

**Teach**

* props
* component boundaries

### Lesson 8.3 — Make state explicit

The selected record needs to change.

**Teach**

* state
* state update
* rerender

### Lesson 8.4 — Compare React with the JavaScript version

Explicitly inspect:

```text
imperative DOM updates
vs
state → render → UI
```

### Lesson 8.5 — Split the UI

**Teach**

* component composition
* parent/child relationship

### Lesson 8.6 — Render collections

**Teach**

* mapping data to components
* stable keys

### Lesson 8.7 — Fetch the real data

**Teach**

* effect/data-fetch boundary
* asynchronous state

### Lesson 8.8 — Loading/error/success state

**Teach**

* explicit UI state modeling

### Lesson 8.9 — Lift state

Two components need the same state.

**Teach**

* lifting state
* state ownership

### Lesson 8.10 — Build the complete `Data` UI

Connect:

```text
SQL
 ↓
backend API
 ↓
JSON
 ↓
TypeScript
 ↓
React state
 ↓
components
```

### Lesson 8.11 — Compare OOP and reactive organization

Explicitly contrast:

```text
OOP:
object owns state
method changes state
UI responds

React:
state changes
render function derives UI
```

**Milestone:** The learner understands React as a different program organization model, not merely a collection of JSX syntax.

---

# PHASE 9 — SQL / THE DATA ROUND TRIP

SQL is taught against the actual `Data` model.

### Lesson 9.1 — Create the first table

Map one object model to a relational table.

**Teach**

* table
* row
* column
* primary key

### Lesson 9.2 — Insert data

**Teach**

* `INSERT`

### Lesson 9.3 — Retrieve data

**Teach**

* `SELECT`
* filtering
* ordering

### Lesson 9.4 — Update and delete

**Teach**

* `UPDATE`
* `DELETE`

### Lesson 9.5 — Connect related data

The object model now contains a relationship.

**Teach**

* foreign key
* relationship modeling

### Lesson 9.6 — Join the tables

**Teach**

* `JOIN`
* relational composition

### Lesson 9.7 — Aggregate the data

The application needs a summary.

**Teach**

* `COUNT`
* `SUM`
* `AVG`
* `GROUP BY`

### Lesson 9.8 — Add an index

A real query now needs to become faster.

**Teach**

* index
* lookup vs scan
* why indexes exist

### Lesson 9.9 — Transaction

Two changes must succeed or fail together.

**Teach**

* transaction
* commit
* rollback
* atomicity

### Lesson 9.10 — Map SQL results back into application data

**Teach**

* row → model
* DTO
* impedance mismatch

### Lesson 9.11 — Complete the round trip

Build:

```text
Object
 ↓
Table
 ↓
SQL
 ↓
DTO
 ↓
API
 ↓
TypeScript
 ↓
React
```

**Milestone:** SQL is understood as the relational half of an application architecture.

---

# PHASE 10 — ANDROID / KOTLIN APPLIED

Kotlin is already known.

Now the framework introduces the new problems.

### Lesson 10.1 — Create the Android application

**Teach**

* Android project
* application lifecycle boundary

### Lesson 10.2 — Create `MainActivity`

**Teach**

* Activity
* lifecycle entry point

### Lesson 10.3 — Put the first screen on the device

**Teach**

* UI tree
* event interaction

### Lesson 10.4 — Observe lifecycle changes

Rotate/leave/re-enter the application.

**Teach**

* Activity lifecycle
* why UI state cannot simply live wherever convenient

### Lesson 10.5 — Introduce the Repository

The Activity is doing data work it shouldn't own.

**Teach**

* Repository
* separation of concerns

### Lesson 10.6 — Introduce the ViewModel

The screen needs state that survives lifecycle events.

**Teach**

* ViewModel
* state ownership

### Lesson 10.7 — Add coroutines

The Repository performs asynchronous work.

**Teach**

* coroutine
* suspension
* structured concurrency

### Lesson 10.8 — Connect Repository → ViewModel → Activity

**Teach**

* architecture boundary
* observable state

### Lesson 10.9 — Persist the `Data`

Connect the application to local storage.

**Teach**

* persistence boundary
* data lifecycle

### Lesson 10.10 — Complete the small Android application

Review:

```text
Activity
 ↓
ViewModel
 ↓
Repository
 ↓
Data
```

**Milestone:** Kotlin is now being used in a real framework with lifecycle and architecture constraints.

---

# PHASE 11 — GO / STRUCTURAL ABSTRACTION + CONCURRENCY

The `Service` architecture returns.

This time it is deliberately expressed without traditional inheritance.

### Lesson 11.1 — Build the smallest Go program

**Teach**

* package
* `main`
* compilation/run

### Lesson 11.2 — Port the service behavior

**Teach**

* functions
* structs

### Lesson 11.3 — Put behavior around the struct

**Teach**

* methods
* receiver

### Lesson 11.4 — Port the interface

**Teach**

* Go interfaces
* implicit implementation

### Lesson 11.5 — Compare Go with C#

Ask:

**Where did the explicit implementation declaration go?**

This is the important lesson.

### Lesson 11.6 — Handle failure without exceptions

Cause a real operation to fail.

**Teach**

* error values
* multiple return values
* explicit error propagation

### Lesson 11.7 — Start background work

The service now needs concurrent work.

**Teach**

* goroutine

### Lesson 11.8 — Communicate between concurrent operations

**Teach**

* channels
* send/receive

### Lesson 11.9 — Coordinate goroutines

**Teach**

* synchronization
* waiting
* avoiding premature program exit

### Lesson 11.10 — Create a race/problem

Give concurrent code a shared-state problem.

**Teach**

* race
* shared mutable state
* why communication matters

### Lesson 11.11 — Rework the design

Use channels or appropriate synchronization to make the design safe.

### Lesson 11.12 — Compare concurrency models

Build the conceptual chain:

```text
C# async/await
Kotlin coroutines
JavaScript event loop
Go goroutines/channels
```

**Milestone:** Concurrency is now a recurring concept rather than four unrelated APIs.

---

# PHASE 12 — RUST / OWNERSHIP + TYPE-ENFORCED INVARIANTS

Port the Go service.

The learner already knows what the program is supposed to do.

Now Rust makes them reason about ownership.

### Lesson 12.1 — Build the smallest Rust program

**Teach**

* Cargo
* crate
* `main`

### Lesson 12.2 — Port simple data

**Teach**

* structs
* fields
* functions

### Lesson 12.3 — Give the struct behavior

**Teach**

* `impl`
* methods

### Lesson 12.4 — Move a value

Pass ownership into another function.

**Teach**

* ownership
* move

### Lesson 12.5 — Try to use the moved value

Let the compiler reject it.

**Teach**

* why the compiler error exists
* ownership transfer

### Lesson 12.6 — Borrow instead

The function needs to inspect rather than own.

**Teach**

* references
* borrowing

### Lesson 12.7 — Mutable borrowing

The function needs to modify the value.

**Teach**

* `&mut`
* borrowing rules

### Lesson 12.8 — Trigger conflicting borrows

**Teach**

* aliasing
* mutable vs immutable borrowing

### Lesson 12.9 — `Option`

A value may legitimately not exist.

**Teach**

* `Option`
* `Some`
* `None`
* pattern matching

### Lesson 12.10 — `Result`

The service operation can fail.

**Teach**

* `Result`
* `Ok`
* `Err`
* explicit error propagation

### Lesson 12.11 — `enum` as data modeling

The application has several legitimate states.

**Teach**

* enums
* pattern matching
* exhaustive handling

### Lesson 12.12 — Traits

The service needs an abstraction.

**Teach**

* traits
* implementations
* generic constraints

### Lesson 12.13 — Port the Go interface

Compare:

```text
Go:
implicit interface satisfaction

Rust:
trait implementation
```

### Lesson 12.14 — The lifetime problem

Create a struct containing a reference.

Construct a situation where the referenced object could die too early.

**Teach**

* lifetime relationship
* dangling reference prevention

### Lesson 12.15 — Lifetime annotation

Add the annotation necessary to express the relationship.

**Teach**

* lifetime parameter
* annotation as a relationship, not a timer

### Lesson 12.16 — Port concurrent behavior

Bring the Go concurrent operation into Rust.

**Teach**

* threads
* ownership across thread boundaries
* compiler-enforced safety

### Lesson 12.17 — Complete the Rust service

Review:

```text
ownership
 ↓
borrowing
 ↓
lifetimes
 ↓
Result/Option
 ↓
traits
 ↓
concurrency
 ↓
compiler-enforced invariants
```

### Lesson 12.18 — Compare C++ and Rust

The central comparison:

```text
C++:
programmer is responsible for lifetime correctness

Rust:
type system/compiler enforces many lifetime and ownership rules
```

**Milestone:** The learner can explain not only how Rust works, but why its restrictions exist.

---

# PHASE 13 — CLOSURE / SCHEME / REJECT THE OBJECT

This phase intentionally breaks the accumulated mental model.

No large application.

## Functional utility library

### Lesson 13.1 — The smallest expression

**Teach**

* expressions
* evaluation

### Lesson 13.2 — Define a function

**Teach**

* functions
* parameters
* return values

### Lesson 13.3 — Functions as values

Pass a function to another function.

**Teach**

* higher-order functions

### Lesson 13.4 — Transform a collection

Replace an imperative loop with a transformation.

**Teach**

* map
* transformation

### Lesson 13.5 — Select data

**Teach**

* filtering
* predicates

### Lesson 13.6 — Reduce data

**Teach**

* fold/reduce
* accumulation without explicit mutable loop state

### Lesson 13.7 — Recursion

Replace an iterative problem with recursive decomposition.

**Teach**

* recursive definition
* base case
* recursive case

### Lesson 13.8 — Immutable data

Modify a data structure without mutating the original.

**Teach**

* immutability
* persistent data model

### Lesson 13.9 — Compose transformations

Build a pipeline of functions.

**Teach**

* composition
* pipeline thinking

### Lesson 13.10 — State deliberately

Introduce state only because the problem genuinely requires it.

**Teach**

* pure vs stateful computation

### Lesson 13.11 — Build the utility library

Combine the functions into a small reusable library.

### Lesson 13.12 — Look backward

Compare the same kinds of operations in:

```text
C#
Java
Kotlin
C++
JavaScript
TypeScript
Go
Rust
Clojure/Scheme
```

Identify where functional ideas were already present.

**Milestone:** Functional programming is understood as a different organizing model, not merely a collection of `map`/`filter` tricks.

---

# PHASE 14 — CROSS-LANGUAGE ENGINEERING

This phase is not another language course.

It tests whether the curriculum actually worked.

### Lesson 14.1 — Read the same architecture in C#

Trace `Service`.

### Lesson 14.2 — Read the Java port

Identify what changed and what didn't.

### Lesson 14.3 — Read the Kotlin port

Identify what Kotlin eliminated.

### Lesson 14.4 — Read the C++ version

Identify lifetime and value semantics.

### Lesson 14.5 — Read the Go version

Identify structural interfaces and concurrency.

### Lesson 14.6 — Read the Rust version

Identify ownership, borrowing, traits, and error modeling.

### Lesson 14.7 — Compare the data chain

Trace:

```text
C#/Go object
 ↓
SQL
 ↓
DTO
 ↓
API
 ↓
TypeScript
 ↓
React
```

### Lesson 14.8 — Compare program organization

Trace:

```text
OOP
 ↓
imperative JavaScript
 ↓
React reactive rendering
 ↓
functional transformations
```

### Lesson 14.9 — Debug an unfamiliar language

Take a deliberately broken small program in one of the completed languages.

**Goal:** solve the problem without being given the relevant language feature first.

### Lesson 14.10 — Build a small feature from scratch

Add a feature to one of the existing projects without following a lesson.

**Goal:** demonstrate independent construction.

### Lesson 14.11 — Port a feature

Implement the same feature in a second language.

**Goal:** demonstrate abstraction transfer.

### Lesson 14.12 — Final engineering comparison

Answer through actual code, not memorized definitions:

* What is an object?
* What is ownership?
* What is a type?
* What is an interface?
* What is a trait?
* What is a function?
* What is state?
* How does concurrency work?
* How does data move from database to UI?
* What does each language hide?
* What does each language force you to confront?

---

# FINAL COMPETENCY GATE

The curriculum is complete when the learner can independently do all of the following:

## Read

* Follow unfamiliar control flow.
* Identify data ownership.
* Identify abstraction boundaries.
* Follow asynchronous/concurrent execution.
* Trace data from persistence to UI.

## Build

* Add a small feature without copying an existing implementation.
* Create an appropriate abstraction when the problem requires one.
* Choose composition over unnecessary inheritance.
* Model data appropriately for the language.
* Connect application code to persistence and APIs.

## Debug

* Reproduce a failure.
* Form a hypothesis.
* Inspect the relevant state.
* Use language tooling.
* Fix the underlying cause rather than the symptom.
* Use Git history when appropriate.

## Compare

Given the same problem, explain how:

* C# approaches it.
* Java approaches it.
* Kotlin changes the Java approach.
* C++ exposes lifetime/value semantics.
* Go changes the abstraction model and concurrency model.
* Rust enforces ownership and invariants.
* JavaScript models asynchronous behavior.
* TypeScript adds static reasoning.
* React organizes UI around state and rendering.
* SQL represents the relational side of the data.
* Clojure/Scheme removes object-centered organization.

## Transfer

The final test is not:

> "Can I recite the syntax?"

It is:

> **Given a problem I have never seen before, can I recognize the underlying engineering problem, select an appropriate abstraction, and express it in the language I'm using?**

That is the actual target of the curriculum.

---

# Approximate Lesson Count

| Area                       | Lessons |
| -------------------------- | ------: |
| Git                        |       6 |
| C#                         |      12 |
| Java                       |      10 |
| Kotlin                     |       8 |
| C++                        |      13 |
| HTML/CSS                   |       8 |
| JavaScript                 |      12 |
| TypeScript                 |      10 |
| React                      |      11 |
| SQL                        |      11 |
| Android                    |      10 |
| Go                         |      12 |
| Rust                       |      18 |
| Clojure/Scheme             |      12 |
| Cross-language engineering |      12 |
| **Total**                  | **163** |

This is intentionally **not 163 equal-sized lessons**.

A lesson might be a 20-minute concept/build increment or a multi-session engineering problem. The lesson boundary means **one meaningful new capability**, not a fixed amount of code.

The curriculum therefore gives you a **163-lesson map**, while the actual teaching remains incremental:

**one lesson → one runnable change → one reason for the next concept → commit → next lesson.**
