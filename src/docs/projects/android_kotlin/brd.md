How does this look for a curriculum
Yes. You want the actual master curriculum, not another discussion about how we might structure it.
Below is the curriculum I'd use to take you from little/no Kotlin → competent Kotlin/Android developer with practical DSA, OOP, architecture, testing, and software-engineering skills, while building one increasingly sophisticated calculator.
The hierarchy is:
Stage → Slice → Lesson → Concepts → Practice → Ship
A slice is always a user-visible feature. A lesson may be pure learning, a throwaway exercise, or implementation work.
Master Curriculum: The 80/20 Android Calculator
STAGE 0 — Kotlin Foundations
Slice 0 — Console Calculator
Feature: A terminal calculator capable of +, -, \*, /.

Lesson 0.1 — Kotlin & Programming Mental Model
Concepts

Programs and instructions
Values
Types
Expressions
Statements
val
var
Type inference
Practice

Tiny Kotlin program
Print values
Change variables
Transferable skill: Reading basic Kotlin code.
Lesson 0.2 — Functions
Concepts

Function declaration
Parameters
Return values
Expression-bodied functions
Function naming
Practice

add()
subtract()
multiply()
divide()
Transferable skill: Breaking problems into reusable units.
Lesson 0.3 — Decisions
Concepts

Boolean expressions
if
else
when
Comparison operators
Practice

Choose calculator operation.
Lesson 0.4 — Collections
Concepts

List
MutableList
Map
Iteration
for
map
filter
Throwaway: Tiny contact/search program.
Why: Collections are fundamental to almost every application.
Lesson 0.5 — Nullability
Concepts

Nullable types
?
Safe calls
Elvis operator ?:
!!
Null as a design problem
Practice

Handle missing calculator input.
Transfer: Essential for consuming Android APIs and external data.
Lesson 0.6 — Classes & Objects
Concepts

Classes
Properties
Constructors
Methods
Objects
Practice

Create a Calculator class.
Lesson 0.7 — Interfaces & Polymorphism
Concepts

Interface
Implementation
Abstraction
Polymorphism
Composition vs inheritance
Throwaway: Payment system.

Payment
├── CreditCard
├── PayPal
└── Cash
Then apply the same concept to calculator operations.
Transfer: Extremely useful in Android architecture and unfamiliar codebases.
Lesson 0.8 — Data Classes & Enums
Concepts

data class
enum class
Equality
copy()
Practice

Represent calculator operations/state.
Lesson 0.9 — Lambdas
Concepts

Functions as values
Lambdas
Higher-order functions
Function references
Practice

Sort/filter collections.
Transfer: Critical for idiomatic Kotlin and Compose.
Lesson 0.10 — Idiomatic Kotlin
Concepts

Extension functions
Scope functions
let
apply
also
run
Goal: Read normal Kotlin without getting lost.
🟢 Ship Slice 0
A working console calculator.
STAGE 1 — Android Fundamentals
Slice 1 — The First Android Calculator
Feature: Basic calculator UI.
Lesson 1.1 — How Android Projects Work
Concepts

Android project
Module
Activity
Manifest
Gradle conceptually
Build/run cycle
Goal: Understand the project rather than memorizing configuration.
Lesson 1.2 — Jetpack Compose
Concepts

@Composable
Composition
Text
Button
Column
Row
Modifiers
Practice

Static calculator screen.
Lesson 1.3 — Layout
Concepts

Arrangement
Alignment
Weight
Spacing
Responsive UI
Build

Calculator keypad.
Lesson 1.4 — State
Concepts

State
remember
Recomposition
State-driven UI
Build

7 → display becomes 7
8 → display becomes 78
This is one of the most important Android lessons.
Lesson 1.5 — Events
Concepts

Callbacks
User events
Event handlers
Build

Buttons modify calculator state.
Lesson 1.6 — Connect UI to Domain Logic
Concepts

UI vs business logic
Separation of concerns
Keeping logic testable
Build

Connect console calculator logic to Android.
🟢 Ship Slice 1
A functioning Android basic calculator.
STAGE 2 — Testing & Better OOP
Slice 2 — Trustworthy Calculator
Feature: Calculator with tested mathematics and proper error handling.
Lesson 2.1 — Pure Functions
Concepts

Input/output
Side effects
Determinism
Testability
Lesson 2.2 — Unit Testing
Concepts

Tests
Assertions
Arrange/Act/Assert
Test cases
Tests

2 + 2 = 4
10 - 3 = 7
5 × 6 = 30
20 ÷ 4 = 5
Lesson 2.3 — TDD
Concepts

Red
↓
Green
↓
Refactor
Build a new operation using TDD.
Lesson 2.4 — Polymorphic Operations
Refactor:

Operation
├── Addition
├── Subtraction
├── Multiplication
└── Division
Concepts

Polymorphism
Interfaces
Composition
Encapsulation
Lesson 2.5 — Errors
Concepts

Exceptions
Invalid state
Domain errors
User-facing errors
Build

Division-by-zero handling.
🟢 Ship Slice 2
Reliable, tested calculator engine.
STAGE 3 — UI Engineering
Slice 3 — Beautiful Calculator
Feature: A polished calculator that feels like a real app.
Lesson 3.1 — Material Design
Color
Typography
Shapes
Theme
Lesson 3.2 — Reusable Composables
Components
Parameters
Reuse
API design
Lesson 3.3 — Modeling UI State
Create:

CalculatorState
Concepts

State modeling
Immutable state
Sealed classes
Lesson 3.4 — Animation
Transitions
Animated state
Motion
Lesson 3.5 — Accessibility
Touch targets
Content descriptions
Screen readers
Contrast
Lesson 3.6 — Haptics
Build

Button feedback.
🟢 Ship Slice 3
A polished basic calculator.
STAGE 4 — Architecture & Navigation
Slice 4 — Calculator Modes
Feature: Basic / Scientific / Matrix screens.
Lesson 4.1 — Navigation
Screens
Routes
Back stack
Navigation arguments
Lesson 4.2 — Why Architecture Exists
Use the growing calculator to discover:

Coupling
Cohesion
Responsibilities
Separation of concerns
Lesson 4.3 — ViewModel
Lifecycle
ViewModel
State ownership
Lesson 4.4 — MVVM
UI
↓
ViewModel
↓
Domain
Lesson 4.5 — Unidirectional Data Flow
State → UI
Event → ViewModel
🟢 Ship Slice 4
Multi-page calculator application.
STAGE 5 — DSA Through the Scientific Calculator
Slice 5 — Expression Parser
Feature:

3 + 5 \* (2 - 8)
returns:

-27
Lesson 5.1 — What Is Parsing?
Concepts

Tokens
Grammar
Operators
Precedence
Associativity
Lesson 5.2 — Big-O
Learn only:

O(1)
O(log n)
O(n)
O(n log n)
O(n²)
Goal: Estimate algorithm performance.
Lesson 5.3 — Stacks
Throwaway: Browser history.
Concepts

LIFO
Push
Pop
Peek
Then recognize why parsers need stacks.
Lesson 5.4 — Tokenization
Transform:

3 + 5 \* (2 - 8)
into tokens.
Lesson 5.5 — Queues
Concepts

FIFO
Processing sequences
Throwaway: Simple print-job queue.
Lesson 5.6 — Shunting-Yard
Concepts

Operator stack
Output queue
Precedence
Associativity
Build infix → postfix.
Lesson 5.7 — Trees
Concepts

Nodes
Parent/child
Tree traversal
Lesson 5.8 — Recursion
Throwaway: Directory-tree traversal.
Concepts

Base case
Recursive case
Call stack
Lesson 5.9 — AST
Build:

        +
       / \
      3   \*
         / \
        5   -
           / \
          2   8
Lesson 5.10 — Evaluation
AST → result.
Lesson 5.11 — Parser Testing
Test increasingly difficult expressions.
🟢 Ship Slice 5
Scientific expression calculator.
STAGE 6 — Scientific Mathematics
Slice 6 — Scientific Functions
Feature: sin, cos, sqrt, log, powers, constants.
Lesson 6.1 — Function Abstraction
Concepts

Function objects
Dispatch tables
Maps
Lesson 6.2 — Angle Modes
Degrees
Radians
Lesson 6.3 — Domain Errors
sqrt(-1)
log(0)
Lesson 6.4 — Floating Point
Concepts

Double
Precision
Representation
Approximate equality
Transfer: Games, graphics, finance, simulations.
🟢 Ship Slice 6
Real scientific calculator.
STAGE 7 — Persistence
Slice 7 — Calculation History
Feature: History survives app restarts.
Lesson 7.1 — Data Modeling
Create Calculation.

Lesson 7.2 — Databases
Concepts

Persistence
CRUD
Tables
Records
Lesson 7.3 — Room
Entity
DAO
Database
Lesson 7.4 — Repository
Understand why the rest of the application shouldn't care how storage works.

Lesson 7.5 — Coroutines
Concepts

suspend
Coroutine
Dispatcher
Structured concurrency
Lesson 7.6 — Flow
Database changes → UI changes.
🟢 Ship Slice 7
Persistent history.
STAGE 8 — Linear Algebra
Slice 8 — Matrix Calculator
Feature: Matrix creation and operations.
Lesson 8.1 — 2D Data
Nested collections
Indexing
Dimensions
Lesson 8.2 — Matrix API
Matrix
├── add
├── subtract
├── multiply
├── transpose
└── determinant
Lesson 8.3 — Algorithm Complexity
Understand why different algorithms have different costs.

Lesson 8.4 — Strategy Pattern
Only now.

MatrixOperation
├── Addition
├── Multiplication
└── Inverse
Lesson 8.5 — Factory Pattern
Only if dynamic matrix creation genuinely benefits from it.

Lesson 8.6 — Generics
Learn enough generic programming to design reusable components.

Lesson 8.7 — Mathematical Testing
Test invariants such as:

A × I = A
🟢 Ship Slice 8
Matrix calculator.
STAGE 9 — Graphing
Slice 9 — Equation Graph
Feature: Plot y = f(x).
Lesson 9.1 — Coordinate Systems
Cartesian coordinates
Screen coordinates
Transformations
Lesson 9.2 — Sampling
How to turn a mathematical function into pixels.

Lesson 9.3 — Canvas
Drawing
Paths
Rendering
Lesson 9.4 — Gestures
Drag
Pinch
Zoom
Lesson 9.5 — Rendering Performance
Understand:

What is expensive, and where is it happening?
🟢 Ship Slice 9
Interactive graphing calculator.
STAGE 10 — Concurrency & Performance
Slice 10 — Smooth Graphing
Feature: Expensive graph calculations don't freeze the UI.
Lesson 10.1 — Android Main Thread
Understand what the UI thread actually does.

Lesson 10.2 — Coroutines Deep Dive
suspend
Dispatchers
Structured concurrency
Lesson 10.3 — Cancellation
Old graph calculation should stop when input changes.

Lesson 10.4 — Profiling
CPU
Memory
Rendering
Bottlenecks
🟢 Ship Slice 10
Smooth graphing.
STAGE 11 — Learning APIs From Documentation
Slice 11 — Tilt-to-Pan
Feature: Tilt the phone to move around the graph.
Lesson 11.1 — How to Read API Documentation
This is a major transferable skill.
Learn to find:

Entry point
Types
Interfaces
Lifecycle
Callbacks
Required configuration
Cleanup
Examples
Deprecations
Lesson 11.2 — Sensor API
Throwaway: Tiny sensor viewer.
Why?
Because learning how to approach an unfamiliar API is more important than the sensor itself.
Lesson 11.3 — Sensor → Application State
Connect sensor values to graph movement.

Lesson 11.4 — Haptics API
Axis crossing → vibration.
🟢 Ship Slice 11
Hardware-enhanced graphing.
STAGE 12 — Dependency Injection
Slice 12 — Multiple Calculation Engines
Feature: Properly separated Basic, Scientific, Matrix, and Graph engines.
Lesson 12.1 — Dependency Problems
Experience manual construction becoming painful.

Lesson 12.2 — Constructor Injection
Lesson 12.3 — Interfaces as Boundaries
Lesson 12.4 — Hilt
Learn:

Injection
Modules
Providers
Components
Don't memorize Hilt.
Understand dependency injection.
🟢 Ship Slice 12
Properly decoupled calculator architecture.
STAGE 13 — Settings
Slice 13 — Calculator Settings
Feature:

Theme
Degrees/radians
Haptics
Precision
Graph preferences
Lessons
Preferences
Persistent settings
State synchronization
Configuration modeling
🟢 Ship Slice 13
Settings system.
STAGE 14 — Better History
Slice 14 — Searchable History
Feature: Search, filter, and sort calculations.
Lesson 14.1 — Searching
Linear search
Binary search concept
Lesson 14.2 — Sorting
Why sorting exists
Built-in sorting
Complexity
Lesson 14.3 — Hash Maps
Key/value lookup
Hashing conceptually
When maps are useful
Lesson 14.4 — Performance
Compare approaches.
🟢 Ship Slice 14
Searchable, sortable history.
STAGE 15 — Real Software Engineering
Slice 15 — Production Hardening
This is intentionally less flashy.
The feature is:

The app becomes maintainable and shippable.
Lesson 15.1 — Git
Commit
Branch
Merge
Pull request
Good commit messages
Lesson 15.2 — Refactoring
Take old code and improve it without changing behavior.

Lesson 15.3 — Coupling & Cohesion
Identify architectural problems in your own app.

Lesson 15.4 — SOLID
Now learn the useful portions because you've experienced the problems.

Lesson 15.5 — Testing Strategy
Understand:

Unit
Integration
UI
and when each is appropriate.

Lesson 15.6 — Test Doubles
Fake
Stub
Mock
Why they exist
Lesson 15.7 — CI
Push
 ↓
Build
 ↓
Test
 ↓
Report
🟢 Ship Slice 15
Production-quality codebase.
STAGE 16 — Final Product
Slice 16 — The Complete Calculator
Now we stop introducing major technologies.
We finish the thing.

Lesson 16.1 — UX Audit
Lesson 16.2 — Accessibility Audit
Lesson 16.3 — Performance Audit
Lesson 16.4 — Architecture Audit
Lesson 16.5 — Test Coverage Audit
Lesson 16.6 — Refactoring Pass
Lesson 16.7 — Release Build
Lesson 16.8 — Documentation
Lesson 16.9 — Final Code Review
What You Will Actually Learn
By the end, you've covered the practical 80/20 of:

Kotlin
Types
Functions
Collections
Nullability
Classes
Interfaces
Polymorphism
Data classes
Enums
Lambdas
Generics
Extensions
Scope functions
Coroutines
Flow
Idiomatic Kotlin
Android
Compose
State
UI architecture
Navigation
ViewModel
Lifecycle
Room
Coroutines
Flow
Canvas
Gestures
Sensors
Haptics
Dependency injection
Performance
Accessibility
Testing
OOP
Encapsulation
Abstraction
Polymorphism
Composition
Interfaces
Dependency inversion
SOLID
DSA
Arrays
Lists
Maps
Stacks
Queues
Trees
Recursion
Searching
Sorting
Big-O
Graph concepts
Algorithmic complexity
Software Engineering
TDD
Unit testing
Integration testing
UI testing
Git
Refactoring
Architecture
Coupling/cohesion
Dependency injection
Documentation
Debugging
Performance
CI
API literacy
The Most Important Part
We do not execute this as:

"Today is Lesson 5.3, therefore here's a 45-minute lecture on stacks."
Instead:

We're building the scientific calculator.
We discover that expressions need to be evaluated in a particular order.
We need a data structure that remembers things in reverse order.
Now you learn stacks.
And when we hit sensors:

We need to make the graph respond to the phone.
You've never used this Android API.
Now I teach you how to read the documentation and figure it out.
That's the distinction between this and a conventional course.
Our working contract
For every lesson, I'll give you:

Why we're learning it now
The minimum concept you need
A mental model
A small example
An exercise
How it applies to the calculator
What you should be able to explain afterward
A checkpoint before we continue
And for every slice, we'll have:

Goal
↓
Features
↓
Lessons
↓
Implementation
↓
Tests
↓
Refactor
↓
Ship
So this curriculum is now the map. We can start at Stage 0 → Slice 0 → Lesson 0.1, and work through it sequentially rather than jumping around.
