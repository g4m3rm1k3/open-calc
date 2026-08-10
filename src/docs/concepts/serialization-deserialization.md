# Concept: Serialization / Deserialization

**What you'll understand by the end:** how an in-memory data structure becomes text that can cross a network or be saved to a file, and back again.

**Prerequisites:** none.

## Setup

Python 3, no packages needed — `json` is part of the standard library.

## The Problem

A program's data lives in memory as language-specific structures (a Python `dict`, a Java object, whatever). Sending that data to another program — over a network, or through a file — requires converting it into a format neither program's memory layout constrains, that both sides know how to read.

## The Isolated Example

```python
import json

machine = {"status": "idle", "position": {"x": 0.0, "y": 0.0}}

text = json.dumps(machine)
print(repr(text))
print(type(text))

restored = json.loads(text)
print(restored)
print(type(restored))
```

**Real output:**
```
'{"status": "idle", "position": {"x": 0.0, "y": 0.0}}'
<class 'str'>
{'status': 'idle', 'position': {'x': 0.0, 'y': 0.0}}
<class 'dict'>
```

**What this proves:** `json.dumps` turned a real Python `dict` into a plain `str` — bytes that could be written to a file or sent over a network, with no Python-specific meaning left in them. `json.loads` performed the exact reverse, producing a `dict` indistinguishable from the original.

## Mechanical Walkthrough

- `json.dumps(value)` — **serialization**: converts a Python value (dict, list, string, number, bool, `None`) into a JSON-formatted string.
- `json.loads(text)` — **deserialization**: the reverse, parsing JSON text back into the equivalent Python structure.
- The round trip (`dumps` then `loads`) reproduces an equal, but not identical, object — a new `dict` with the same contents, not the original object in memory.

## CS Lens

**Serialization**: converting an in-memory structure into a portable format. **Deserialization**: the reverse. JSON specifically represents a fixed set of types (objects, arrays, strings, numbers, booleans, `null`) as text — any language with a JSON library can read text another language's JSON library wrote, because the format carries no language-specific information.

Also recognized in: literally every API on the internet, saving a game's state to a file, Protocol Buffers/MessagePack (binary alternatives optimized for size/speed over readability), and database row-to-object mapping (an ORM sits at exactly this boundary, translating between SQL rows and language-native objects).

## SE Lens

The alternative — Python's own `pickle` module — can serialize almost any Python object, including ones JSON can't represent, but the result is Python-specific binary data no other language can read, and deserializing untrusted pickled data is a real, known code-execution risk (`pickle.loads` can be made to run arbitrary code embedded in the data). JSON trades some expressiveness (no dates, no custom classes, without extra work) for being a safe, universal, human-readable interchange format — the right tradeoff for anything crossing a network to an untrusted or cross-language client.

## Connection

`flask-implicit-dict-to-json.md` builds directly on this — it's a specific web framework performing exactly the `dumps` half of this automatically on a route's return value.

## Try It Yourself

1. Try `json.dumps` on a Python `set` (e.g. `{1, 2, 3}`) or a `datetime` object. Read the real error — JSON has no native representation for either, which is exactly the "less expressive than pickle" tradeoff named above.
2. Write a value to a real file with `json.dump(machine, open("out.json", "w"))` (note: `dump`, not `dumps`), then read it back with `json.load(open("out.json"))`. Confirm the round trip through an actual file, not just a string, produces an equal structure.
3. Deliberately corrupt a JSON string (delete one closing brace) and call `json.loads` on it. Read the real `JSONDecodeError` and note what information it gives you about *where* the malformed text is.
