---
concept: 039-source-code
name: Source Code
---

## Definition

Source code is the human-readable text a program is written in — the actual
file a programmer edits — before it's translated into a form the computer can
execute directly.

## Problem

Computers execute machine code, not text a person can read and reason about.
Source code is the layer that lets a human write, read, and change a program's
logic, with a separate translation step (compiling or interpreting) bridging the
gap to what the machine actually runs.

## Execution

Source code is written as plain text in files
↓
A compiler reads the whole file (or an interpreter reads it as it goes) and
checks it against the language's grammar
↓
Valid source code is translated into a lower-level form — machine code,
bytecode, or an in-memory representation to execute directly
↓
Only that translated form actually runs — the original source text itself is
never executed

## Computer Science

Source code's structure is defined by a formal grammar — the same kind of rules
a parser uses to decide whether an expression is well-formed. A syntax error
means the source text doesn't match that grammar at all, before the program's
actual logic is even considered.

Tags: Grammar, Parsing, Syntax vs semantics

## Software Engineering

Source code is what gets versioned in Git, reviewed in a pull request, and read
by the next person who maintains it — it's the actual artifact software
engineering practices are built around, since compiled or translated output is
regenerated from it and normally isn't tracked directly.

Tags: Version control, Code review, Build artifacts

## Common Mistakes

- Editing a compiled or translated output file directly instead of the source — those changes get silently overwritten the next time the source is rebuilt.
- Assuming source code and the running program are the same thing — a syntax error prevents source code from ever becoming a running program at all.

## Exercises

- In the Python example, imagine removing the closing parenthesis from `print(...)` — reason about why nothing would run at all, not even a partial result, since the whole file fails to parse first.
- In Java, compare how much more surrounding structure the source code needs before it's considered valid, compared to Python's version doing the same thing.

## javascript

```javascript
function greet(name) {
  return `Hello, ${name}!`
}
console.log(greet('Alex'))
```
Walkthrough: this text — line breaks, indentation, the `function` keyword — is
the source code. Nothing here runs directly; it's translated (by the JS engine
parsing and compiling it internally) before any instruction actually executes.

## python

```python
def greet(name):
    return f'Hello, {name}!'

print(greet('Alex'))
```
Walkthrough: same idea in Python's syntax — this exact text is what a teammate
would read in a code review, and it's also exactly what Python's interpreter
parses before running anything.

## java

```java
static String greet(String name) {
    return "Hello, " + name + "!";
}

System.out.println(greet("Alex"));
```
Walkthrough: Java's source requires more structural punctuation — semicolons,
explicit types — but it's still just text, read and translated the same way as
the other examples before anything runs.

## cpp

```cpp
std::string greet(std::string name) {
    return "Hello, " + name + "!";
}

std::cout << greet("Alex") << std::endl;
```
Walkthrough: same text-first idea — this file is compiled ahead of time into a
binary, and that binary, not this source text, is what actually runs when the
program is launched.

## rust

```rust
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

println!("{}", greet("Alex"));
```
Walkthrough: same shape again — `&str` and `->` are Rust-specific syntax, but
this is still source text, compiled ahead of time, exactly like the C++ example.
