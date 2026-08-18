# Clojure-Inspired Lisp → Python

## Full Vertical Curriculum

### Curriculum Goal

Build a complete, extensible Lisp language inspired by Clojure that compiles to Python and can transparently use the Python ecosystem.

The curriculum simultaneously teaches:

* Python beyond the fundamentals
* Clojure/Lisp semantics
* lexical analysis
* parsing
* AST design
* interpreters
* environments and lexical scope
* closures
* compiler construction
* intermediate representations
* AST transformation
* semantic analysis
* runtime design
* Python's `ast` system
* Python execution machinery
* Python introspection
* generic Python interoperability
* Python modules and packages
* `pip`-installed third-party libraries
* macros
* modules and namespaces
* compiler diagnostics
* testing and differential testing
* packaging
* language tooling

The project is **one continuously growing language**.

No phase is a disconnected prerequisite course.

Every capability follows:

```text
CONCEPT
   ↓
IMPLEMENTATION
   ↓
LANGUAGE FEATURE
   ↓
VISIBLE CHECKPOINT
   ↓
TEST
   ↓
WORKING LANGUAGE
```

---

# 0. Project Definition

## 0.1 Define the Language

Establish the initial language specification.

### Initial values

```text
nil
boolean
integer
float
string
keyword
symbol
```

### Initial collections

```text
list
vector
map
set
```

### Initial special forms

```text
def
let
if
do
fn
quote
```

### Initial functions

```text
+
-
*
/
=
<
>
<=
>=
```

### Initial goals

The language must eventually support:

```text
REPL
source files
modules
functions
closures
macros
Python imports
Python function calls
Python object construction
Python method calls
Python attributes
Python exceptions
Python iteration
third-party Python packages
compilation to .py
```

### Checkpoint

Produce a written language specification containing:

```text
syntax
values
special forms
evaluation rules
scope rules
Python interoperability rules
module rules
error rules
```

No compiler implementation yet.

---

# 1. Language Shell

## Capability 1.1 — Executable Project

Learn:

* Python project structure
* `pyproject.toml`
* packages
* modules
* virtual environments
* command-line entry points
* dependency installation
* test organization

Build:

```text
yourlang/
    pyproject.toml
    src/
        yourlang/
    tests/
```

### Checkpoint

Run:

```text
yourlang
```

and receive:

```text
YourLang REPL
>
```

---

## Capability 1.2 — REPL

Learn:

* standard input/output
* loops around user input
* exceptions
* command dispatch
* interactive program state

Build:

```text
>
```

with:

```text
:help
:quit
```

### Checkpoint

The REPL accepts input and produces results.

---

# 2. Values and Evaluation

## Capability 2.1 — Literal Values

Implement:

```clojure
42
3.14
"hello"
true
false
nil
```

Learn:

* Python primitive types
* `None`
* booleans
* numeric types
* strings
* type inspection

### Checkpoint

```text
> 42
42

> "hello"
"hello"

> true
true
```

---

## Capability 2.2 — Symbols

Implement:

```clojure
foo
bar
some-name
```

Learn:

* identifiers
* symbols as data
* symbol objects
* equality
* hashing

### Checkpoint

```text
> foo

Symbol("foo")
```

---

## Capability 2.3 — Lists

Implement:

```clojure
(+ 1 2)
```

Learn:

* recursive data structures
* Python lists
* recursion
* tree structure

### Checkpoint

```text
(+ 1 2)
```

is represented internally as:

```text
List
├── Symbol(+)
├── 1
└── 2
```

---

# 3. Reader and Parser

## Capability 3.1 — Character Scanner

Learn:

* iteration
* character classification
* state machines
* generators

Implement a scanner over source text.

### Checkpoint

```clojure
(+ 10 20)
```

produces:

```text
LPAREN
SYMBOL(+)
NUMBER(10)
NUMBER(20)
RPAREN
```

---

## Capability 3.2 — Token Types

Implement:

```text
LPAREN
RPAREN
LBRACKET
RBRACKET
LBRACE
RBRACE
NUMBER
STRING
SYMBOL
KEYWORD
QUOTE
```

Learn:

* `Enum`
* token objects
* source positions

### Checkpoint

Every token contains:

```text
type
value
line
column
```

---

## Capability 3.3 — Recursive Reader

Implement:

```text
lists
vectors
maps
sets
```

Learn:

* recursive descent parsing
* recursive algorithms
* stack behavior
* syntax errors

### Checkpoint

```clojure
(+ 1 [2 3])
```

produces nested reader data.

---

## Capability 3.4 — Strings

Implement:

```clojure
"hello"
"hello\nworld"
"quote: \""
```

Learn:

* escaping
* string parsing
* Unicode
* error handling

### Checkpoint

Malformed strings generate source-aware errors.

---

## Capability 3.5 — Syntax Errors

Implement:

```text
unexpected )
unclosed (
unclosed [
unclosed {
invalid number
invalid string
```

### Checkpoint

Errors contain:

```text
filename
line
column
message
```

---

# 4. Language AST

## Capability 4.1 — AST Node Model

Implement:

```text
LiteralNode
SymbolNode
CallNode
```

Learn:

* dataclasses
* object composition
* tree structures
* type annotations

### Checkpoint

```clojure
(+ 1 2)
```

becomes:

```text
CallNode
├── SymbolNode("+")
├── LiteralNode(1)
└── LiteralNode(2)
```

---

## Capability 4.2 — AST Conversion

Create:

```text
Reader data
    ↓
Language AST
```

The reader no longer directly drives evaluation.

### Checkpoint

Every valid program can be inspected as an AST.

---

## Capability 4.3 — AST Visitor

Implement:

```text
visit()
walk()
transform()
```

Learn:

* visitor pattern
* recursion over trees
* tree transformation
* Python protocols/interfaces

### Checkpoint

Implement an AST printer without modifying the AST itself.

---

# 5. Interpreter

## Capability 5.1 — Environment

Implement:

```text
Environment
    bindings
    parent
```

Learn:

* dictionaries
* object composition
* lexical environments
* lookup

### Checkpoint

```clojure
(def x 10)
x
```

returns:

```text
10
```

---

## Capability 5.2 — Arithmetic

Implement:

```clojure
(+ 1 2)
(- 5 2)
(* 3 4)
(/ 10 2)
```

### Checkpoint

Nested expressions work:

```clojure
(+ 10 (* 2 5))
```

→

```text
20
```

---

## Capability 5.3 — Comparisons

Implement:

```clojure
=
<
>
<=
>=
```

### Checkpoint

```clojure
(> 10 5)
```

→

```text
true
```

---

## Capability 5.4 — `def`

Implement:

```clojure
(def x 10)
```

Learn:

* mutation of environments
* top-level bindings
* evaluation order

### Checkpoint

```clojure
(def x 10)
(+ x 5)
```

→

```text
15
```

---

# 6. Expressions and Control Flow

## Capability 6.1 — `if`

Implement:

```clojure
(if condition
    then
    else)
```

Learn:

* conditional evaluation
* truthiness
* expression-oriented control flow

### Checkpoint

```clojure
(if (> 10 5)
    "yes"
    "no")
```

→

```text
"yes"
```

---

## Capability 6.2 — `do`

Implement:

```clojure
(do
  expression-1
  expression-2
  expression-3)
```

### Checkpoint

Only the final expression becomes the result.

---

## Capability 6.3 — `let`

Implement:

```clojure
(let [x 10
      y 20]
  (+ x y))
```

Learn:

* nested environments
* lexical scope
* binding lifetime

### Checkpoint

Bindings disappear after the `let`.

---

## Capability 6.4 — Nested Scope

Test:

```clojure
(def x 10)

(let [x 20]
  x)
```

→

```text
20
```

while:

```clojure
x
```

remains:

```text
10
```

---

# 7. Functions

## Capability 7.1 — Function Values

Implement:

```clojure
(fn [x]
  (* x x))
```

Learn:

* Python functions as objects
* callables
* closures
* function objects

### Checkpoint

```clojure
((fn [x] (* x x)) 5)
```

→

```text
25
```

---

## Capability 7.2 — Named Functions

Implement:

```clojure
(defn square [x]
  (* x x))
```

### Checkpoint

```clojure
(square 5)
```

→

```text
25
```

---

## Capability 7.3 — Multiple Arguments

Support:

```clojure
(defn add [x y]
  (+ x y))
```

---

## Capability 7.4 — Variadic Arguments

Implement:

```clojure
(defn sum [& xs]
  ...)
```

Learn:

* `*args`
* argument binding
* sequence handling

---

## Capability 7.5 — Closures

Implement:

```clojure
(defn make-adder [x]
  (fn [y]
    (+ x y)))
```

### Checkpoint

```clojure
(def add10 (make-adder 10))
(add10 5)
```

→

```text
15
```

---

# 8. Functions as a Language Feature

## Capability 8.1 — First-Class Functions

Functions can:

```text
be assigned
be passed
be returned
be stored in collections
```

---

## Capability 8.2 — `map`

Implement:

```clojure
(map square [1 2 3 4])
```

---

## Capability 8.3 — `filter`

Implement:

```clojure
(filter positive? xs)
```

---

## Capability 8.4 — `reduce`

Implement:

```clojure
(reduce + [1 2 3 4])
```

---

## Capability 8.5 — Function Composition

Implement enough functionality to build higher-order programs.

### Checkpoint

Build a small functional data-processing program entirely in the interpreter.

---

# 9. Collections

## Capability 9.1 — Vectors

Implement:

```clojure
[1 2 3]
```

Operations:

```text
first
rest
nth
count
conj
```

---

## Capability 9.2 — Maps

Implement:

```clojure
{:name "Alice"
 :age 30}
```

Operations:

```text
get
assoc
dissoc
contains?
```

---

## Capability 9.3 — Keywords

Implement:

```clojure
:name
:age
```

---

## Capability 9.4 — Sets

Implement:

```clojure
#{1 2 3}
```

---

## Capability 9.5 — Collection Interoperability

Define which language collections map directly to:

```text
Python list
Python tuple
Python dict
Python set
```

### Checkpoint

Build a small data-processing application using collections and higher-order functions.

---

# 10. Testing Infrastructure

Testing begins here and continues through the entire curriculum.

## Capability 10.1 — Unit Tests

Test:

```text
reader
parser
AST
environment
evaluator
runtime
compiler
```

---

## Capability 10.2 — Language Tests

Every language feature gets source-level tests.

Example:

```clojure
(+ 2 3)
```

Expected:

```text
5
```

---

## Capability 10.3 — Snapshot Tests

Snapshot:

```text
tokens
reader output
AST
generated Python
```

---

## Capability 10.4 — Differential Testing

Run:

```text
Lisp source
   ↓
Interpreter → result A

Lisp source
   ↓
Compiler → Python → result B
```

Compare:

```text
A == B
```

### Checkpoint

A growing test suite protects interpreter/compiler semantic equivalence.

---

# 11. Python AST Backend

Now begin compilation.

## Capability 11.1 — Python `ast`

Learn:

```text
ast.Module
ast.Constant
ast.Name
ast.Call
ast.Assign
ast.FunctionDef
ast.Return
ast.If
ast.BinOp
```

---

## Capability 11.2 — Generate Python AST

Compile:

```clojure
(+ 1 2)
```

to a Python AST equivalent to:

```python
1 + 2
```

---

## Capability 11.3 — `ast.unparse`

Convert:

```text
Python AST
```

to:

```text
Python source
```

### Checkpoint

The compiler displays:

```text
Lisp
↓
Lisp AST
↓
Python AST
↓
Python source
```

---

# 12. Compiling Values and Calls

## Capability 12.1 — Literals

Compile:

```clojure
42
"hello"
true
nil
```

---

## Capability 12.2 — Names

Compile:

```clojure
x
```

to:

```python
x
```

---

## Capability 12.3 — Function Calls

Compile:

```clojure
(foo 1 2)
```

to:

```python
foo(1, 2)
```

---

## Capability 12.4 — Arithmetic

Compile:

```clojure
(+ x 10)
```

to Python AST.

---

## Capability 12.5 — Definitions

Compile:

```clojure
(def x 10)
```

to:

```python
x = 10
```

### Checkpoint

The compiler can produce executable Python for basic programs.

---

# 13. Compiling Control Flow

## Capability 13.1 — `if`

Learn the distinction between:

```text
expression
statement
```

Compile value-producing `if` expressions using Python expressions where appropriate.

---

## Capability 13.2 — `do`

Lower sequential expressions into Python statements/expressions.

---

## Capability 13.3 — `let`

Lower lexical bindings into Python local variables.

---

## Capability 13.4 — Nested Expressions

Handle:

```clojure
(def x
  (let [y 10]
    (if (> y 5)
        (* y 2)
        0)))
```

### Checkpoint

Complex nested expression programs compile and execute correctly.

---

# 14. Name Resolution and Mangling

## Capability 14.1 — Language Names

Support names such as:

```clojure
my-name
valid?
```

---

## Capability 14.2 — Python Names

Implement deterministic name mangling.

Example:

```text
my-name → my_name
valid?  → valid_q
```

---

## Capability 14.3 — Name Resolution

Resolve:

```text
local
closure
module
global
runtime
Python
```

names.

### Checkpoint

Generated Python identifiers are always valid and deterministic.

---

# 15. Runtime Architecture

Move language semantics out of the compiler.

Create:

```text
yourlang/
    runtime/
        core.py
        collections.py
        functions.py
        errors.py
```

## Capability 15.1 — Runtime Functions

Implement:

```text
map
filter
reduce
range
println
sequence operations
```

---

## Capability 15.2 — Runtime Values

Define:

```text
nil
keywords
symbols
language functions
```

---

## Capability 15.3 — Runtime Errors

Create language-specific exceptions.

### Checkpoint

Generated Python imports the runtime rather than embedding every language implementation detail.

---

# 16. Python Object Model

This is the beginning of the generic bridge.

## Capability 16.1 — Python Modules

Implement:

```clojure
(import math)
```

---

## Capability 16.2 — Python Functions

Support:

```clojure
(math.sqrt 25)
```

---

## Capability 16.3 — Python Classes

Support:

```clojure
(SomeClass. arg1 arg2)
```

---

## Capability 16.4 — Attributes

Support:

```clojure
(.name object)
```

---

## Capability 16.5 — Methods

Support:

```clojure
(.show window)
```

or equivalent language syntax.

---

## Capability 16.6 — Indexing

Support:

```clojure
(get obj key)
```

or equivalent syntax.

---

## Capability 16.7 — Python Iteration

Make Python iterables usable by language constructs.

### Checkpoint

Use an arbitrary Python standard-library class without implementing a custom adapter.

---

# 17. Generic Python Interoperability

The bridge must operate through generic Python mechanisms.

Learn:

* `getattr`
* `setattr`
* `hasattr`
* `callable`
* `isinstance`
* `type`
* `inspect`
* `importlib`
* descriptors
* Python's object model

Implement:

```text
module resolution
attribute resolution
function invocation
method invocation
constructor invocation
argument conversion
return-value wrapping
iteration
exceptions
```

### Core architectural rule

The compiler must **not know about individual Python libraries**.

It knows how to perform:

```text
import
resolve
get attribute
call
construct
index
iterate
catch exception
```

It does not know what:

```text
numpy
requests
PySide6
pandas
Pillow
```

are.

### Checkpoint

Use several unrelated Python packages without modifying the language implementation.

---

# 18. Python Values ↔ Language Values

Define the boundary between:

```text
Lisp values
```

and:

```text
Python values
```

Determine how to handle:

```text
None
bool
int
float
str
list
tuple
dict
set
function
object
exception
iterator
generator
```

### Checkpoint

A Python function can receive language values and return values usable by the language.

---

# 19. Python Exceptions

Implement:

```clojure
(try
  ...
  (catch Exception e
    ...))
```

Learn:

* Python exception hierarchy
* exception objects
* stack traces
* `try`
* `except`
* `finally`

### Checkpoint

A Python library exception can be caught by language code.

---

# 20. Python Package Ecosystem

## Capability 20.1 — Python Environment

Use:

```text
venv
pip
pyproject.toml
```

---

## Capability 20.2 — Standard Library

Use:

```clojure
(import pathlib)
(import json)
(import datetime)
(import sqlite3)
```

---

## Capability 20.3 — Third-Party Package

Install:

```text
requests
```

and use it.

---

## Capability 20.4 — Numerical Package

Install:

```text
numpy
```

and use it.

---

## Capability 20.5 — GUI Package

Install:

```text
PySide6
```

and use it.

### Critical Checkpoint

Install a package the compiler has never seen before.

Use it successfully.

**No compiler modification is permitted.**

This validates the generic bridge architecture.

---

# 21. Modules and Namespaces

## Capability 21.1 — Language Modules

Compile:

```text
math.clj
```

to:

```text
math.py
```

---

## Capability 21.2 — Namespace Declaration

Implement:

```clojure
(ns myapp.core)
```

---

## Capability 21.3 — Language Imports

Implement:

```clojure
(require myapp.math)
```

---

## Capability 21.4 — Aliases

Support:

```clojure
(require [some.module :as m])
```

---

## Capability 21.5 — Public/Private Definitions

Define visibility semantics.

### Checkpoint

Compile and run a multi-file application.

---

# 22. Macro System

Only introduce macros after the reader, AST, evaluator, functions, environments, and compiler are established.

## Capability 22.1 — Quote

Implement:

```clojure
'(+ 1 2)
```

as data.

---

## Capability 22.2 — Quoted Structures

Manipulate code as data.

---

## Capability 22.3 — Unquote

Implement macro construction mechanisms.

---

## Capability 22.4 — Macro Definitions

Implement:

```clojure
(defmacro ...)
```

---

## Capability 22.5 — Macro Expansion

Add:

```text
source
↓
reader
↓
macro expansion
↓
AST
```

### Checkpoint

Display:

```text
ORIGINAL SOURCE
↓
EXPANDED SOURCE
↓
AST
↓
PYTHON
```

---

# 23. Compiler Pipeline

The compiler now becomes a collection of explicit passes.

Implement:

```text
Source
 ↓
Tokens
 ↓
Reader
 ↓
Language AST
 ↓
Macro Expansion
 ↓
Name Resolution
 ↓
Semantic Analysis
 ↓
Lowering
 ↓
Python AST
 ↓
Python Source
```

## Capability 23.1 — Pass Interface

Each pass accepts an input representation and produces an output representation.

---

## Capability 23.2 — Name Resolution Pass

Resolve:

```text
local variables
globals
closures
modules
runtime symbols
Python symbols
```

---

## Capability 23.3 — Semantic Analysis

Detect:

```text
invalid bindings
invalid argument counts
invalid special forms
invalid syntax/semantics
```

---

## Capability 23.4 — Lowering

Transform complex language constructs into simpler internal constructs.

### Checkpoint

Each compiler pass can be inspected independently.

---

# 24. Intermediate Representation

Introduce an IR only when the language has enough complexity to justify it.

Define:

```text
IRLiteral
IRLoad
IRStore
IRCall
IRBranch
IRFunction
IRReturn
```

Lower:

```text
Language AST
```

into:

```text
IR
```

and then:

```text
IR
↓
Python AST
```

### Checkpoint

A program can be inspected at:

```text
Language AST
↓
Expanded AST
↓
Resolved AST
↓
IR
↓
Python AST
↓
Python
```

---

# 25. Advanced Python Semantics

Implement features that expose semantic differences between Lisp and Python.

## Capability 25.1 — Multiple Return Values

Determine language semantics and Python representation.

---

## Capability 25.2 — Keyword Arguments

Support:

```clojure
(foo :name "Bob")
```

or the chosen equivalent.

---

## Capability 25.3 — Default Arguments

Compile:

```clojure
(fn [x y 10]
  ...)
```

according to the language specification.

---

## Capability 25.4 — Variadic Functions

Map language variadic functions to Python `*args`.

---

## Capability 25.5 — Keyword Variadics

Map language keyword arguments to Python `**kwargs`.

---

## Capability 25.6 — Generators

Compile language sequence producers to Python generators.

Learn:

```text
yield
generator objects
lazy evaluation
iteration protocols
```

---

## Capability 25.7 — `with`

Map resource-management semantics to Python context managers.

---

## Capability 25.8 — Async

Eventually support:

```text
async
await
```

and Python async libraries.

### Checkpoint

Use an asynchronous third-party Python API from the language.

---

# 26. Classes

## Capability 26.1 — Language Classes

Define the language's class model.

---

## Capability 26.2 — Compilation to Python Classes

Generate:

```python
class ...
```

---

## Capability 26.3 — Methods

Compile language methods.

---

## Capability 26.4 — Construction

Support language-level object construction.

---

## Capability 26.5 — Python Class Interoperability

Instantiate and manipulate arbitrary Python classes.

### Checkpoint

Create a language class and subclass/use a Python class where the semantics permit it.

---

# 27. Tooling

## Capability 27.1 — Compiler CLI

Support:

```text
yourlang run file.clj
yourlang compile file.clj
yourlang repl
yourlang inspect file.clj
```

---

## Capability 27.2 — Diagnostics

Implement structured diagnostics:

```text
error
warning
info
```

with:

```text
file
line
column
source span
message
```

---

## Capability 27.3 — Stack Traces

Map generated Python failures back toward language source locations.

---

## Capability 27.4 — Formatter

Build a formatter based on the parsed structure.

---

## Capability 27.5 — Linter

Detect language-level problems without executing the program.

---

# 28. Compiler Testing

## Capability 28.1 — Unit Tests

Test every compiler component independently.

---

## Capability 28.2 — Integration Tests

Test:

```text
source → result
```

---

## Capability 28.3 — Golden Tests

Store expected:

```text
AST
IR
Python
```

---

## Capability 28.4 — Differential Tests

Compare:

```text
interpreter result
```

against:

```text
compiled result
```

---

## Capability 28.5 — Fuzz Testing

Generate valid/invalid syntax and test:

```text
reader
parser
compiler
runtime
```

---

## Capability 28.6 — Regression Suite

Every discovered compiler bug becomes a permanent test.

### Checkpoint

The language can evolve without silently breaking existing semantics.

---

# 29. Packaging the Language

Package the compiler as a normal Python project.

Implement:

```text
pyproject.toml
build configuration
dependencies
CLI entry points
runtime package
compiler package
```

Support:

```bash
pip install yourlang
```

Then:

```bash
yourlang program.clj
```

---

# 30. Real Application

The final curriculum project is not another toy language demonstration.

Build a real application entirely in the new language.

The application must contain:

```text
multiple language modules
Python third-party dependencies
Python standard library usage
persistent data
functions
closures
error handling
file I/O
configuration
logging
tests
packaging
```

A particularly appropriate final application is a production-style tooling application using packages such as:

```text
PySide6
sqlite3
pathlib
json
requests
logging
```

The language itself should not contain special support for those libraries.

They are simply Python packages consumed through the generic bridge.

---

# Final Validation Project

The curriculum is complete only when the following works.

## Language

```clojure
(ns app.core)

(defn process [items]
  (map
    (fn [x]
      (* x 2))
    items))
```

## Python standard library

```clojure
(import pathlib)
(import json)
```

## Third-party package

```clojure
(import requests)
```

## Python objects

```clojure
(def response
  (requests.get url))

(.status_code response)
```

## Python classes

```clojure
(import PySide6.QtWidgets :as QtWidgets)

(def app
  (QtWidgets.QApplication.))
```

## Multiple language modules

```text
app/
    core.clj
    data.clj
    ui.clj
    config.clj
```

## Compiler pipeline

The program can be inspected as:

```text
SOURCE
 ↓
TOKENS
 ↓
READER
 ↓
AST
 ↓
MACRO EXPANSION
 ↓
RESOLUTION
 ↓
IR
 ↓
PYTHON AST
 ↓
PYTHON
 ↓
EXECUTION
```

## Testing

The same language program can be run through:

```text
interpreter
compiler
```

and both must produce equivalent results where the language semantics permit comparison.

---

# Curriculum Completion Criteria

The curriculum is complete when you can independently:

### Python

* design multi-module Python packages
* use dataclasses and protocols
* use iterators and generators
* understand closures
* use decorators appropriately
* work with exceptions
* use context managers
* use introspection
* use `ast`
* use `compile`, `exec`, and controlled evaluation mechanisms
* work with modules and import machinery
* package and distribute Python software
* write substantial Python without relying on basic tutorials

### Language Implementation

* design syntax
* implement a lexer/reader
* implement a parser
* design ASTs
* implement an evaluator
* implement environments
* implement lexical scope
* implement closures
* implement macros
* perform semantic analysis
* design compiler passes
* design an IR
* perform tree transformations
* generate Python ASTs
* generate executable Python
* maintain source locations
* produce compiler diagnostics

### Runtime

* define language semantics
* separate compiler responsibilities from runtime responsibilities
* implement language primitives
* represent language values
* handle language exceptions
* implement collection operations
* implement function behavior

### Python Interoperability

* import arbitrary Python modules
* resolve arbitrary Python attributes
* call arbitrary Python functions
* instantiate arbitrary Python classes
* call arbitrary Python methods
* access arbitrary Python objects
* iterate Python objects
* handle Python exceptions
* pass values between the two runtimes
* use packages installed through `pip`

### Software Engineering

* structure a real compiler project
* maintain a regression suite
* use unit, integration, snapshot, and differential tests
* debug compiler passes independently
* package the language
* build CLI tooling
* maintain backwards compatibility
* extend the language without rewriting the compiler

---

# Permanent Project Architecture

The final project should evolve toward:

```text
yourlang/
│
├── pyproject.toml
│
├── src/
│   └── yourlang/
│       │
│       ├── cli/
│       │
│       ├── lexer/
│       │
│       ├── reader/
│       │
│       ├── ast/
│       │
│       ├── macros/
│       │
│       ├── resolver/
│       │
│       ├── analyzer/
│       │
│       ├── ir/
│       │
│       ├── compiler/
│       │
│       ├── python/
│       │
│       ├── interop/
│       │
│       ├── runtime/
│       │
│       └── repl/
│
└── tests/
    │
    ├── lexer/
    ├── reader/
    ├── ast/
    ├── evaluator/
    ├── macros/
    ├── compiler/
    ├── runtime/
    ├── interop/
    ├── integration/
    └── regression/
```

The important part is that **this structure is not introduced on day one**.

It grows with the curriculum.

Early:

```text
yourlang/
    reader.py
    evaluator.py
    repl.py
```

Later:

```text
reader/
ast/
compiler/
runtime/
interop/
```

Later still:

```text
resolver/
analyzer/
ir/
macros/
python/
```

The architecture therefore becomes something you **discover and construct**, rather than something you are handed as an enormous framework.

---

# The Core Rule for the Entire Curriculum

Every new concept must answer three questions:

```text
1. What concept am I learning?
2. What part of the language requires it?
3. What can the language do now that it could not do before?
```

And every capability ends with an observable checkpoint:

```text
SOURCE
   ↓
TOKENS
   ↓
AST
   ↓
INTERPRETER RESULT
   ↓
COMPILER OUTPUT
   ↓
PYTHON RESULT
   ↓
TEST
```

The project therefore never becomes merely **"a compiler you're studying."**

It becomes a progressively more capable programming language that you are simultaneously:

* designing,
* implementing,
* testing,
* compiling,
* using,
* and extending.

By the final stage, adding a new language feature should itself be a learned skill: **define the semantics → represent it → evaluate it → compile it → test interpreter/compiler equivalence → expose it to users → add it to the language specification.**
