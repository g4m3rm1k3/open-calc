---
series: javascript-fundamentals
level: 4
title: Objects
lang: javascript
---

# Objects

An object groups related values under named properties. Without objects, a "user" is three separate variables: `userName`, `userAge`, `userEmail`. You cannot pass a user to a function without passing all three separately. Objects solve this by bundling related data into one thing with a name for each piece.

This lesson teaches how to create objects, read and write properties, use destructuring, and iterate over object entries.

## Creating Objects

An **object literal** uses curly braces with `key: value` pairs separated by commas:

```javascript
const person = {
  name: "Ada Lovelace",
  birthYear: 1815,
  occupation: "mathematician",
}

console.log(person)
console.log(person.name)
console.log(person.birthYear)
```

```text
{ name: 'Ada Lovelace', birthYear: 1815, occupation: 'mathematician' }
Ada Lovelace
1815
```

`{ key: value }` — an object literal. Each `key: value` pair is a **property**. Keys are strings (the quotes are optional when the key is a valid identifier). Values can be any type: string, number, boolean, array, even another object.

`person.name` — **dot notation**: accesses the property named `name` on `person`. Returns `undefined` if the property does not exist.

## Bracket Notation

Property names can also be accessed with `object["key"]` — useful when the key is stored in a variable or contains special characters:

```javascript
const config = {
  "max-retries": 3,
  timeout: 5000,
}

const setting = "timeout"

console.log(config["max-retries"])
console.log(config[setting])
```

```text
3
5000
```

`config["max-retries"]` — bracket notation is required when the key contains a hyphen (hyphens are not valid in identifiers). `config.max-retries` would be interpreted as `config.max` minus `retries` — a different expression entirely.

`config[setting]` — evaluates `setting` to get the string `"timeout"`, then looks up that property. This lets you look up properties dynamically at runtime.

## Modifying Objects

Objects are mutable — properties can be added, changed, or removed:

```javascript
const user = {
  name: "Linus Torvalds",
  role: "developer",
}

user.email = "linus@example.com"
user.role = "creator"
delete user.email

console.log(user)
```

```text
{ name: 'Linus Torvalds', role: 'creator' }
```

`user.email = "linus@example.com"` — adds a new property. Properties can be added to any object after creation.
`user.role = "creator"` — overwrites the existing `role` property.
`delete user.email` — removes the `email` property entirely.

Note: `user` is `const`, but the object's contents can still change. Same rule as arrays: `const` controls the binding, not the value's mutability.

## Destructuring

**Destructuring** extracts properties from an object into local variables in one step:

```javascript
const planet = {
  name: "Mars",
  distanceFromSun: 227.9,
  moons: 2,
}

const { name, moons } = planet
console.log(name)
console.log(moons)
```

```text
Mars
2
```

`const { name, moons } = planet` — creates two local variables, `name` and `moons`, each assigned the value of the matching property on `planet`. This is equivalent to:
```text
const name = planet.name
const moons = planet.moons
```

Destructuring is especially useful when receiving objects as function parameters:

```javascript
function describePlanet({ name, distanceFromSun, moons }) {
  return `${name}: ${distanceFromSun}M km from the Sun, ${moons} moon(s)`
}

const mars = { name: "Mars", distanceFromSun: 227.9, moons: 2 }
const earth = { name: "Earth", distanceFromSun: 149.6, moons: 1 }

console.log(describePlanet(mars))
console.log(describePlanet(earth))
```

```text
Mars: 227.9M km from the Sun, 2 moon(s)
Earth: 149.6M km from the Sun, 1 moon(s)
```

`{ name, distanceFromSun, moons }` as a parameter — the function receives an object and immediately destructures it. The caller passes one argument (the whole object) rather than three separate arguments.

## Iterating Object Entries

`Object.entries(object)` — returns an array of `[key, value]` pairs for every property:

```javascript
const scores = {
  ada: 95,
  grace: 88,
  linus: 72,
}

for (const [name, score] of Object.entries(scores)) {
  console.log(`${name}: ${score}`)
}
```

```text
ada: 95
grace: 88
linus: 72
```

`Object.entries(scores)` — returns `[["ada", 95], ["grace", 88], ["linus", 72]]`. Each entry is a two-element array.
`for (const [name, score] of ...)` — **array destructuring** inside the `for...of` loop: each two-element array is unpacked into `name` and `score`. Array destructuring uses position order (not property names).

**CS lens:** Objects in JavaScript are **hash maps** under the hood — the engine stores property names as keys in a hash table. Property lookup by name is O(1) on average. When you use an object as a store of named values (like `scores` above), you are using the hash map data structure.

## Challenge: count_words

Write a function `countWords(sentence)` that takes a string and returns an object where each key is a word and each value is how many times that word appears.

`countWords("the cat sat on the mat")` → `{ the: 2, cat: 1, sat: 1, on: 1, mat: 1 }`

`sentence.split(" ")` — splits the string into an array of words at each space (`.split(separator)` covered in Python Fundamentals Level 9; same method in JavaScript).

To check if a property exists: `object[key] === undefined` is true when the key has not been set yet.

```challenge
function countWords(sentence) {
  const counts = {}
  // TODO: fill counts
  return counts
}
```

```test
assert countWords("the cat sat").the === 1
assert countWords("the cat sat on the mat").the === 2
assert countWords("a a a").a === 3
assert Object.keys(countWords("one two")).length === 2
assert countWords("").hasOwnProperty !== undefined
```
