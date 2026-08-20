# Taught Concepts Log

Flat, append-only log of every term, construct, and object/method already
introduced somewhere in this curriculum. This is bookkeeping only — per
the Lesson Schema's Repetition Rule, a reappearing concept still gets
full, real treatment in every lesson that reuses it. This file exists
solely so that the new-vs-reappearing judgment call (needed to decide how
a lesson's code splits into Concept Units, per the Recursive Concept
Extraction Rule) never requires opening an old lesson file.

Format: `- concept — introduced Lesson N.M`

Append to this file at the end of every lesson. Do not remove or edit
past entries except to fix an error.

---

## Series 1 — Python Application Foundations

- `class` keyword — introduced Lesson 1.1
- instance — introduced Lesson 1.1
- `pass` statement — introduced Lesson 1.1
- `self` — introduced Lesson 1.1
- instance attribute — introduced Lesson 1.1
- method — introduced Lesson 1.1
- `is` (identity operator) — introduced Lesson 1.1
- `==` default (identity-based) equality — introduced Lesson 1.1
- implicit inheritance from `object` — introduced Lesson 1.1
- dunder method — introduced Lesson 1.1
- `__init__` (constructor) — introduced Lesson 1.1
- `object` (built-in base class) — introduced Lesson 1.1
- `__bases__` — introduced Lesson 1.1
- `type()` builtin — introduced Lesson 1.1
- `AttributeError` — introduced Lesson 1.1
- `Asset.__init__` — introduced Lesson 1.1
- `Asset.describe` — introduced Lesson 1.1
- `return` keyword — introduced Lesson 1.1
- `bool` (boolean type/literal) — introduced Lesson 1.2
- default attribute value (not from a constructor parameter) — introduced Lesson 1.2
- state-changing method (mutator) — introduced Lesson 1.2
- invariant — introduced Lesson 1.2
- guard clause — introduced Lesson 1.2
- `if` conditional — introduced Lesson 1.2 (added to assumed baseline scope)
- `Asset.mark_retired` — introduced Lesson 1.2
- class attribute — introduced Lesson 1.3
- mutable / immutable — introduced Lesson 1.3
- attribute shadowing — introduced Lesson 1.3
- attribute lookup (instance-then-class fallback) — introduced Lesson 1.3
- `__dict__` — introduced Lesson 1.3
- `list` literal (`[]`) / `.append()` — introduced Lesson 1.3 (added to assumed baseline scope)
- mutable-class-attribute trap — introduced Lesson 1.3 (Lab, throwaway — no project code)
- composition — introduced Lesson 1.4
- HAS-A relationship — introduced Lesson 1.4
- `Owner.__init__` — introduced Lesson 1.4
- `Asset.__init__` — owner param — introduced Lesson 1.4 (Asset.__init__ itself first introduced 1.1)
- subclass / parent class (base class) — introduced Lesson 1.5 (Support, throwaway — no project code)
- IS-A relationship — introduced Lesson 1.5 (throwaway)
- overriding — introduced Lesson 1.5 (throwaway)
- `super()` — introduced Lesson 1.5 (throwaway)
- `for` loop / `in` (iteration) — introduced Lesson 1.6 (added to assumed baseline scope, same as `if` in 1.2 and list literals/`.append()` in 1.3 — general Python fluency below the level of classes, not re-taught)
- Python `import` statement — introduced Lesson 1.6 (added to assumed baseline scope — the mechanism itself is general Python fluency; its first real appearance connecting two project files, via `from owner import Owner`, is the lesson's own new architectural fact, not the syntax)
- type annotation (parameter position) — introduced Lesson 1.6
- return type annotation (`->`) — introduced Lesson 1.6
- `__annotations__` — introduced Lesson 1.6
- `NameError` — introduced Lesson 1.6
- `None` as a type (inside `Union`/`Optional`, distinct from `None` the value) — introduced Lesson 1.6
- `Union` (`typing.Union`) — introduced Lesson 1.6
- `Optional` (`typing.Optional`) — introduced Lesson 1.6
- generic type annotation (`list[X]`) — introduced Lesson 1.6, explicitly distinguished from `[]`/`.append()`'s own runtime list-building (Lesson 1.3)
- `bool` as a type name in annotation position — introduced Lesson 1.6 (value form introduced Lesson 1.2)
- `Owner.__init__` / `Asset.__init__` / `Asset.describe` / `Asset.mark_retired` — parameter and return annotations added Lesson 1.6 (methods themselves introduced 1.1/1.2/1.4)
- `find_by_serial` (free function, first non-method function in this project) — introduced Lesson 1.6

## Series 2 — PySide6: Desktop Application Development

_(empty)_

## Series 3 — SQL and Persistence

_(empty)_

## Series 4 — Desktop + Database Integration

_(empty)_

## Series 5 — HTTP and APIs

_(empty)_

## Series 6 — FastAPI

_(empty)_

## Series 7 — Full Application Integration

_(empty)_

## Series 8 — Professional Software Engineering

_(empty)_

## Series 9 — Deployment

_(empty)_
