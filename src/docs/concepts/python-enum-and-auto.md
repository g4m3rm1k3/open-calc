# Concept: Python `Enum` and `auto()`

**What you'll understand by the end:** how to define a real, named set
of distinct constant values with `Enum`, how `auto()` assigns their
underlying numbers automatically, and why comparing enum members by
their **name** (identity) rather than their numeric value is the
correct, robust way to use one.

**Prerequisites:** `python-classes-instances.md`.

## Setup

Python 3, no packages needed (`enum` is standard library).

## The Problem

Some real values are naturally a small, fixed, named set of
possibilities — a token's kind, a status, a direction — not a number
or a string with no other structure. Using plain integers or strings
for this (`1` for "word," `2` for "comment") works, but loses real,
useful meaning: `1` alone tells a reader nothing, typos in a string
literal aren't caught by any tool, and there's no single, real place
listing every valid possibility.

## The Isolated Example

```python
from enum import Enum, auto


class TokenType(Enum):
    WORD = auto()
    COMMENT = auto()
    OTHER = auto()


print(TokenType.WORD)
print(TokenType.WORD.name, TokenType.WORD.value)
print(TokenType.COMMENT.value)
print(TokenType.OTHER.value)

t = TokenType.WORD
print("t == TokenType.WORD:", t == TokenType.WORD)
print("t == TokenType.COMMENT:", t == TokenType.COMMENT)
```

**Real output, run this session:**
```
TokenType.WORD
WORD 1
2
3
t == TokenType.WORD: True
t == TokenType.COMMENT: False
```

**What this proves:** `TokenType.WORD` prints as a real, self-
describing value (`TokenType.WORD`, not a bare `1`), and comparing `t
== TokenType.WORD` genuinely works as expected. `auto()` assigned real,
increasing integers (`1`, `2`, `3`) automatically — nothing in the
class body chose those numbers explicitly.

A real, concrete reason not to rely on the specific number `auto()`
picks:

```python
class TokenTypeV1(Enum):
    WORD = auto()
    COMMENT = auto()
    OTHER = auto()


class TokenTypeV2(Enum):
    COMMENT = auto()   # reordered -- COMMENT now comes first
    WORD = auto()
    OTHER = auto()


print("V1 WORD value:", TokenTypeV1.WORD.value)
print("V2 WORD value:", TokenTypeV2.WORD.value)
print("the numbers DIFFER purely because of reordering:", TokenTypeV1.WORD.value != TokenTypeV2.WORD.value)
```

**Real output, run this session:**
```
V1 WORD value: 1
V2 WORD value: 2
the numbers DIFFER purely because of reordering: True
```

**What this proves:** simply reordering the member declarations —
`COMMENT` written before `WORD` instead of after — changed `WORD`'s
real, underlying number from `1` to `2`, with no other code change at
all. Any real code comparing by the raw number (`t.value == 1`) would
silently break after this harmless-looking reordering; code comparing
by the named member (`t == TokenType.WORD`) is completely unaffected
either way.

## Mechanical Walkthrough

- `class TokenType(Enum):` defines a real, new type whose only valid
  instances are the specific, named members declared inside it — not an
  open-ended set of arbitrary integers.
- `WORD = auto()` — `auto()` is a real, special placeholder telling
  `Enum` to assign the next available integer automatically, starting
  at `1` by default, incrementing for each subsequent member in
  declaration order.
- Each member (`TokenType.WORD`) has both a `.name` (the real, declared
  identifier as a string, `"WORD"`) and a `.value` (the real, underlying
  data — here, whatever integer `auto()` assigned).
- Comparing two enum members with `==` compares **identity of the named
  member**, not their underlying numeric value in the abstract — in
  practice this means `TokenType.WORD == TokenType.WORD` is always
  `True` regardless of what number backs it, and `TokenType.WORD ==
  TokenType.COMMENT` is always `False`, even if some *other* enum
  happened to assign the same underlying number to a differently-named
  member.

## CS Lens

This is a real, language-level implementation of a **named, closed set
of constants** — sometimes called an enumerated type. It's a stronger
real guarantee than a bare integer or string constant: a function
typed to accept a `TokenType` can only ever receive one of the three
real, declared members — not an arbitrary, unvalidated integer that
happens to be `1`, `2`, or `3` by convention alone. `auto()` deliberately
keeps the *underlying* representation as an implementation detail,
encouraging code to work with the *named* member instead — a real,
common design goal: use a value's meaning, not its accidental
representation.

Also recognized in: enums in virtually every mainstream typed language
(Java, C#, TypeScript, Rust) — the identical underlying idea (a fixed,
named set of valid values) with different real syntax and different
levels of runtime enforcement per language.

## SE Lens

The real, practical payoff of `auto()` specifically: adding a new
member, or reordering existing ones, never requires manually
renumbering anything — a real, easy source of subtle bugs if numbers
were chosen by hand and a team member later inserts a value in the
middle without noticing the numbering convention. The real, matching
discipline this enables: never write code that depends on an enum
member's specific underlying number (`if t.value == 1:`) — always
compare against the named member itself (`if t == TokenType.WORD:`),
so `auto()`'s own freedom to reassign numbers on reordering never
becomes a real, silent bug.

## Connection

Builds on `python-classes-instances.md` — an `Enum` is itself a real
Python class, just one with special, restricted instance-creation
rules. Commonly paired with `python-dataclasses.md` in real code, the
same way this project's own `Token` dataclass carries a `TokenType`
field as one of its own attributes.

## Try It Yourself

1. Add a fourth member and confirm `auto()` continues the sequence
   correctly regardless of where in the class body it's inserted.
2. Try `TokenType.WORD == 1` (comparing directly against the raw
   integer, not another enum member) and observe the real, honest
   result — reasoning about why relying on this comparison would be a
   mistake even though it happens to work.
3. Look up `Enum`'s real `auto()` alternative — explicitly assigning
   string values instead (`WORD = "word"`) — and discuss a real,
   legitimate reason a project might prefer explicit string values over
   `auto()`'s integers (hint: think about what a member's value looks
   like if it's ever logged or serialized).

## A Second Real Facet: `Enum[name]` — Looking Up a Member by Its Own Name

`.name` (this file's own first facet) goes **member → string**. A real,
common need goes the other direction: given a **string** (read from a
config file, a serialized record), get back the real, matching enum
member.

```python
print("Capability.LIVE_TOOLING.name:", Capability.LIVE_TOOLING.name)
print('Capability["LIVE_TOOLING"]:', Capability["LIVE_TOOLING"])
print("round-trip equal:", Capability[Capability.LIVE_TOOLING.name] is Capability.LIVE_TOOLING)

try:
    Capability["NOT_REAL"]
except KeyError as e:
    print("KeyError for unknown name:", e)
```

**Real output, run this session:**
```
Capability.LIVE_TOOLING.name: LIVE_TOOLING
Capability["LIVE_TOOLING"]: Capability.LIVE_TOOLING
round-trip equal: True
KeyError for unknown name: 'NOT_REAL'
```

**What this proves:** `Capability["LIVE_TOOLING"]` genuinely returns
the real, same enum member as `Capability.LIVE_TOOLING` itself —
confirmed directly with `is` after a full round trip (member → `.name`
→ back to member). A name that was never actually declared on the
enum (`"NOT_REAL"`) correctly raises a real `KeyError`, not a silent
`None` or a made-up member.

**Mechanical note:** `Enum[name]` is real, built-in subscript syntax —
`Enum` itself supports `__getitem__`, treating the class like a
real, read-only mapping from each member's own declared name to the
member itself. This is exactly the real, complementary operation
`.name` needs for a full round trip through serialization: store
`member.name` (a plain string, safe for JSON/text), and later
reconstruct the real member via `EnumClass[stored_name]`.

### Try It Yourself (second facet)

1. Serialize a real enum member to JSON via `json.dumps({"capability":
   member.name})`, then parse it back and reconstruct the real member
   via `Capability[parsed["capability"]]` — confirming this is a real,
   complete, working round trip.
2. Compare `Enum[name]` (looks up by declared **name**) against
   `Enum(value)` (looks up by declared **value**, e.g. `TokenType(1)`)
   — confirming these are two genuinely different real lookup
   directions, and reasoning about which one a real config file
   (naming a capability by its readable name) versus a compact binary
   format (storing a plain integer) would each naturally want.
3. Catch the real `KeyError` from an unknown name and re-raise it as a
   clearer, more specific real error message naming the actual invalid
   string — connecting this to `fail-fast-validation.md`'s own real
   principle of failing with a diagnosable message at the true point
   of the mistake.
