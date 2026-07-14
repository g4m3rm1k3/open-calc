---
concept: 043-keywords
name: Keywords
---

## Definition

A keyword is a word reserved by a language's grammar for a specific, fixed
purpose — like `if`, `return`, or `class` — that can't be used as an identifier
because the parser already assigns it a special meaning.

## Problem

A parser needs an unambiguous way to tell "this word means take this specific
action" apart from "this word is just a name the programmer chose." Reserving
certain words as keywords, and forbidding their use as identifiers, is how that
ambiguity gets resolved.

## Computer Science

A keyword is recognized during lexing — the very first stage of parsing, before
the code's structure is even analyzed — which is why using one as a variable
name (`let class = 5`) fails immediately as a syntax error rather than some
later, subtler issue.

Tags: Lexical analysis, Reserved words, Grammar

## Software Engineering

Keyword sets differ across languages and even across versions of the same
language — a perfectly valid identifier in one language can be a reserved
keyword in another, which matters when porting code or naming things that might
collide with a future language version.

Tags: Language evolution, Portability, Reserved word conflicts

## Common Mistakes

- Trying to use a keyword as a variable name (`let class = 'Math'`) and being confused by the resulting syntax error — the parser rejected it before ever considering what value was intended.
- Assuming a word that's a keyword in one language is safe to use as an identifier in another — `interface` is a keyword in Java and TypeScript but not in Python.

## Exercises

- In the JavaScript example, reason about what would happen if the variable were renamed to `const` — the parser would reject it before running anything.
- Compare the Java and Python examples — which words are keywords in one but perfectly valid identifiers in the other?

## javascript

```javascript
if (true) {
  const result = 'keywords like if, const, and true are reserved'
  console.log(result)
}
```
Walkthrough: `if`, `const`, and `true` are all keywords here — each has a fixed
meaning to the parser. None of them could be used as the name of the variable
`result` instead; the parser would reject it immediately.

## python

```python
if True:
    result = 'keywords like if, def, and True are reserved'
    print(result)
```
Walkthrough: same idea — `if` and `True` are Python keywords. Notice Python's
`True` is capitalized while JavaScript's `true` isn't — keyword spelling isn't
universal even for the same concept.

## java

```java
if (true) {
    String result = "keywords like if, class, and true are reserved";
    System.out.println(result);
}
```
Walkthrough: `if`, `true`, and `class` are all reserved in Java — none of them
could be reused as a variable name in this same scope.

## cpp

```cpp
if (true) {
    std::string result = "keywords like if, class, and true are reserved";
    std::cout << result << std::endl;
}
```
Walkthrough: same reserved words as Java's example — C++ and Java share a lot of
keyword vocabulary since both descend from C's syntax.

## rust

```rust
if true {
    let result = "keywords like if, let, and true are reserved";
    println!("{}", result);
}
```
Walkthrough: `if`, `let`, and `true` are Rust keywords — notably `let` itself,
used constantly for every variable declaration, is one of them.
