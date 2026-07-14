---
concept: 016-map-dictionary
name: Map / Dictionary
---

## Definition

A map (dictionary) stores key-value pairs and looks up a value directly by its
key, without scanning through the other entries to find it.

## Problem

Finding a specific item in an array by some property (searching for the user
whose `id` is `42`) means checking every element, one at a time, until a match is
found — slower as the collection grows. A map with `id` as the key finds that
entry directly.

## Computer Science

A map is typically implemented as a **hash table**: the key is run through a hash
function producing a number, which determines where in memory the value is
stored. This is why lookup, insertion, and deletion are all O(1) on average — the
hash tells you almost exactly where to look, rather than requiring a search.

Tags: Hash table, Hash function, O(1) average lookup

## Software Engineering

Reach for a map whenever the natural way to describe your data is "look this up
by X" — a user by ID, a config value by name, a word's count in a document. Using
an array and scanning it linearly for the same purpose works, but gets slower as
the data grows, where a map's lookup speed stays roughly constant.

Tags: Data structure selection, Lookup performance, Caching

## Common Mistakes

- Using an object/dict where keys come from untrusted user input without checking for dangerous key names (in JavaScript specifically, `__proto__` as a key can cause real security issues on plain objects — `Map` doesn't have this problem).
- Assuming map iteration order is meaningless — modern JavaScript objects and Python 3.7+ dicts both preserve insertion order, a real guarantee, not an implementation detail to avoid relying on.

## Exercises

- In the JavaScript example, try `.get('phone')` for a key that was never set and observe what comes back.
- In Python, use `.get('phone', 'not set')` with a default value instead of `[]` access, and compare the behavior when the key is missing.

## javascript

```javascript
const ages = new Map()
ages.set('Alice', 30)
ages.set('Bob', 25)
console.log(ages.get('Alice'))   // 30
console.log(ages.has('Carol'))   // false
```
Walkthrough: `Map` is JavaScript's dedicated map type (distinct from a plain
object literal, which can also serve this purpose but has some edge cases a real
`Map` avoids). `.get(key)` looks up by key directly; `.has(key)` checks existence
without triggering a lookup that might be confused with a legitimately-stored
`undefined` value.

## python

```python
ages = {'Alice': 30, 'Bob': 25}
print(ages['Alice'])          # 30
print('Carol' in ages)        # False
print(ages.get('Carol', 0))   # 0 — default value if key is missing
```
Walkthrough: Python's dict *is* its map type — no separate class needed the way
JavaScript has both plain objects and `Map`. `.get(key, default)` returns the
default instead of raising an error when the key is missing, where `ages['Carol']`
directly would raise a `KeyError`.

## java

```java
import java.util.Map;
import java.util.HashMap;

Map<String, Integer> ages = new HashMap<>();
ages.put("Alice", 30);
ages.put("Bob", 25);
System.out.println(ages.get("Alice"));         // 30
System.out.println(ages.containsKey("Carol")); // false
```
Walkthrough: `HashMap` is Java's standard hash-table-backed map. `Map<String, Integer>`
declares the key and value types explicitly, consistent with Java's static typing
— attempting to `.put()` a value of the wrong type fails to compile, something
neither JavaScript's `Map` nor Python's dict checks at all.
