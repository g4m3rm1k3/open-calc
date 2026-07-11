---
series: javascript-fundamentals
level: 0
title: Values & Variables
lang: javascript
---

# Values & Variables

Every JavaScript program manipulates **values** — pieces of data. You store a value in a **variable** so you can name it, reuse it, and give it meaning. Without variables, every computation has to happen in one expression with no memory between steps. With variables, you build programs that reason step by step.

This lesson teaches what JavaScript values are, how to store them in variables, and how JavaScript evaluates an expression to produce a result.

## Values and Their Types

JavaScript has six primitive value types. Each type stores a fundamentally different kind of data:

```text
"Ada Lovelace"   → string   — text, zero or more characters
42               → number   — integer or decimal
3.14             → number   — same type; JS has one number type
true             → boolean  — only two values: true or false
false            → boolean
null             → null     — intentional absence of a value
undefined        → undefined — value not yet assigned
```

`typeof value` — returns the type of a value as a string. This is how you ask JavaScript "what kind of thing is this?"

```javascript
console.log(typeof "Ada Lovelace")
console.log(typeof 42)
console.log(typeof 3.14)
console.log(typeof true)
console.log(typeof null)
console.log(typeof undefined)
```

```text
string
number
number
boolean
object
undefined
```

One surprise: `typeof null` returns `"object"`. This is a historical bug in JavaScript — `null` is not an object, but the bug has been in the language since 1995 and cannot be fixed without breaking existing programs. `null` means "intentionally no value."

`console.log(value)` — prints `value` to the console. `console` is the browser's (or Node's) logging interface. `log` is a method on it. This is JavaScript's equivalent of Python's `print()`.

**CS lens:** Types exist because the computer stores different kinds of data differently in memory. A string is a sequence of character codes. A number is a 64-bit floating-point value (IEEE 754 double precision). Knowing the type tells the runtime how to interpret the bits.

## let — Declaring a Variable

A variable is a named container for a value. `let` creates a new variable:

```javascript
let language = "JavaScript"
let year = 1995
let isPopular = true

console.log(language)
console.log(year)
console.log(isPopular)
```

```text
JavaScript
1995
true
```

`let name = value` — three things happen in order:
1. JavaScript creates a new binding named `name` in the current scope
2. It evaluates the expression on the right of `=`
3. It stores the result in `name`

`language`, `year`, `isPopular` — **identifiers**: names you choose for variables. They must start with a letter, `_`, or `$`. They cannot be keywords like `let`, `const`, or `function`.

**Enable Debug and step through this.** Watch each variable appear in the variables panel as its `let` line executes. Before that line runs, the variable does not exist.

## const — A Variable That Cannot Be Reassigned

`const` declares a variable that is bound once and cannot be rebound to a different value:

```javascript
const pi = 3.14159
const greeting = "Hello"

console.log(pi)
console.log(greeting)
```

```text
3.14159
Hello
```

`const` means "this name will always refer to this value." If you try `pi = 3` later, JavaScript throws `TypeError: Assignment to constant variable.`

Use `const` by default. Use `let` only when you know the variable needs to change. This is not a rule about the value being immutable — it is a rule about the binding. `const list = []` is fine; the list can grow, but `list` will always point to the same list.

**SE lens:** Using `const` by default communicates intent. When a reader sees `const`, they know the binding will not change. When they see `let`, they look for where it changes. This reduces the mental load of reading code.

## Operators and Expressions

An **expression** is any piece of code that evaluates to a value. `2 + 3` is an expression. It evaluates to `5`. `"Hello, " + name` is an expression. It evaluates to a string.

```javascript
const width = 8
const height = 5
const area = width * height
const perimeter = 2 * (width + height)
const diagonal = Math.sqrt(width * width + height * height)

console.log(area)
console.log(perimeter)
console.log(diagonal)
```

```text
40
26
9.433981132056603
```

Operators used here:
- `*` — multiplication. `8 * 5` → `40`.
- `+` — addition when both operands are numbers. `8 + 5` → `13`.
- `(` `)` — grouping. `(width + height)` evaluates first, then the result is multiplied by `2`.
- `Math.sqrt(value)` — returns the square root of `value`. `Math` is a built-in object; `sqrt` is a method on it. Covered fully when we reach objects and the standard library.

**Evaluation order:** JavaScript evaluates operators in precedence order, highest first:
```text
1. Parentheses  ( )     evaluated first
2. Multiplication *     left to right
3. Addition +           left to right
```

So `2 * (width + height)` → `2 * (8 + 5)` → `2 * 13` → `26`.

## String Operators

`+` with strings **concatenates** — joins them into one. The type of the operands determines what `+` does:

```javascript
const firstName = "Ada"
const lastName = "Lovelace"
const fullName = firstName + " " + lastName
const birth = 1815

console.log(fullName)
console.log("Born: " + birth)
console.log(typeof ("Born: " + birth))
```

```text
Ada Lovelace
Born: 1815
string
```

`"Born: " + birth` — one operand is a string, one is a number. JavaScript converts `birth` to `"1815"` automatically and concatenates. This automatic conversion is called **type coercion**. It produces a string.

**CS lens:** Type coercion is one of JavaScript's most misunderstood features. The rule for `+`: if either operand is a string, convert the other to a string and concatenate. This is why `"1" + 2` gives `"12"` not `3`. The rule is consistent, but it surprises people who expect numeric addition.

## Template Literals

A **template literal** is a string that can embed expressions directly. Use backticks instead of quotes:

```javascript
const name = "Grace Hopper"
const year = 1906
const language = "COBOL"

console.log(`${name} was born in ${year}.`)
console.log(`She created ${language}, a language used by millions.`)
console.log(`Name length: ${name.length} characters`)
```

```text
Grace Hopper was born in 1906.
She created COBOL, a language used by millions.
Name length: 12 characters
```

`` `text ${expression} text` `` — the backtick (`` ` ``) opens a template literal. `${...}` is an **interpolation slot** — JavaScript evaluates the expression inside and converts the result to a string. Template literals are cleaner than `+` concatenation for any string with more than one inserted value.

`name.length` — every string has a `length` property that returns the number of characters. `"Grace Hopper".length` → `12`.

## Challenge: describe_person

Write a function `describePerson(name, birthYear, role)` that returns a single sentence describing the person.

`describePerson("Alan Turing", 1912, "mathematician")` → `"Alan Turing (1912) was a mathematician."`

Use a template literal. The format is: name, space, opening parenthesis, birth year, closing parenthesis, ` was a `, role, period.

A function in JavaScript is declared with `function name(parameters) { body }` — this is introduced fully in Level 1. For now, fill in the template literal inside the starter code body.

`return expression` — sends the expression's value back to the caller. Required for the tests to see your result.

```challenge
function describePerson(name, birthYear, role) {
  // TODO: return a template literal
}
```

```test
assert describePerson("Alan Turing", 1912, "mathematician") === "Alan Turing (1912) was a mathematician."
assert describePerson("Ada Lovelace", 1815, "programmer") === "Ada Lovelace (1815) was a programmer."
assert describePerson("Grace Hopper", 1906, "engineer") === "Grace Hopper (1906) was an engineer." || describePerson("Grace Hopper", 1906, "engineer") === "Grace Hopper (1906) was a engineer."
assert describePerson("Linus Torvalds", 1969, "developer") === "Linus Torvalds (1969) was a developer."
assert typeof describePerson("X", 2000, "y") === "string"
```
