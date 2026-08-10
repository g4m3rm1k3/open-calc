# Concept: The Repository Pattern

**What you'll understand by the end:** how to hide a data store's real access details behind a small set of named, intention-revealing functions, so the rest of an application never has to know or care what's actually storing the data.

**Prerequisites:** `adapter-pattern.md`.

## Setup

No install needed — any language works. The isolated example uses Python.

## The Problem

Code that needs to read or write data — a route handler, a piece of business logic — shouldn't need to know *how* that data is actually stored: which specific SQL to run, which specific file format, which specific in-memory structure. Scattering raw queries or storage details directly throughout an application's business logic couples every one of those call sites to a specific storage mechanism, making it hard to test that logic in isolation and hard to change storage strategies later without touching many, scattered places.

## The Isolated Example

```python
class ToolRepository:
    def __init__(self, tools=None):
        self._tools = tools or []

    def all(self):
        return list(self._tools)

    def find_by_name(self, name):
        return next((t for t in self._tools if t["name"] == name), None)

    def add(self, tool):
        self._tools.append(tool)


def describe_inventory(repo):
    tools = repo.all()
    return f"{len(tools)} tool(s) on hand"


repo = ToolRepository()
repo.add({"name": "end_mill_4fl", "diameter_mm": 10})
repo.add({"name": "drill_hss", "diameter_mm": 6})

print(describe_inventory(repo))
print(repo.find_by_name("drill_hss"))
```

**Real output:**
```
2 tool(s) on hand
{'name': 'drill_hss', 'diameter_mm': 6}
```

**What this proves:** `describe_inventory` never touches `_tools` directly, never knows it's a plain Python list, and would work completely unchanged if `ToolRepository` were rewritten tomorrow to query a real SQL database instead — its entire dependency is the repository's small, named method contract (`.all()`, `.find_by_name()`, `.add()`), never the storage mechanism behind it.

## Mechanical Walkthrough

- A **repository** exposes a small, focused set of methods expressing real, domain-meaningful operations ("find a tool by name," "get all tools," "add a tool") rather than a general-purpose query interface — it speaks the application's own vocabulary, not a database's.
- Everything about *how* data is actually stored and retrieved — a raw SQL query, an ORM call, a plain in-memory list, as here — lives entirely inside the repository's own implementation, never leaking out to its callers.
- Swapping the storage mechanism underneath a repository (moving from an in-memory list to a real database, or from one database to another) requires changing only the repository's own internals — every consumer, having depended only on the method names and their meanings, needs zero changes.
- A repository is commonly backed by a real ORM's own query API internally (see `orm-query-builder-select-where.md`) — the repository pattern and an ORM aren't competitors; the repository is a thin, purpose-named layer *on top of* whatever the actual data-access mechanism is, hiding even the ORM's own API from the rest of the application if desired.

## Execution Trace

Two real adds, then two real reads, traced against the real output above:

- repo = ToolRepository()  → self._tools = [] (the `or []` default applies)

- repo.add({"name": "end_mill_4fl", "diameter_mm": 10})
  → self._tools.append(...) → _tools = [end_mill_4fl]

- repo.add({"name": "drill_hss", "diameter_mm": 6})
  → self._tools.append(...) → _tools = [end_mill_4fl, drill_hss]

- describe_inventory(repo):
  tools = repo.all() → list(self._tools) → a real copy, [end_mill_4fl, drill_hss]
  return f"{len(tools)} tool(s) on hand" → "2 tool(s) on hand"

- repo.find_by_name("drill_hss"):
  next((t for t in self._tools if t["name"] == "drill_hss"), None)
    check end_mill_4fl: name == "drill_hss"? No
    check drill_hss:    name == "drill_hss"? Yes → return this dict immediately
  → {"name": "drill_hss", "diameter_mm": 6}

`describe_inventory` never once reaches into `_tools` itself — every
value it works with came back through `repo.all()`, a named method. If
`ToolRepository` were rewritten tomorrow to query a real database
instead of a list, `describe_inventory`'s own code, and this exact
trace's shape, would be unchanged.

## CS Lens

This is a specific, named application of the same **adapter** idea (`adapter-pattern.md`) — translating a general, richer interface (however data actually gets stored and queried) into a small, purpose-fit one (the specific operations an application's own logic actually needs) — with the repository pattern specifically scoped to data access, using domain vocabulary (`find_by_name`, not `execute_query`) rather than storage vocabulary.

Also recognized in: Domain-Driven Design's own formal definition of a repository (one of its named building blocks, described as providing "the illusion of an in-memory collection" of domain objects), and nearly every real, larger backend codebase's own data-access layer, regardless of whether it's formally named "repository" — the pattern recurs even where the name doesn't.

## SE Lens

The real, concrete payoff shows up specifically when testing business logic that depends on data: a repository's real implementation can be swapped for an in-memory fake (exactly like `ToolRepository(tools=[...])` above, pre-loaded with known test data) with zero real database involved at all — `describe_inventory` can be tested completely, quickly, and deterministically, entirely independent of whether a real database is even running. This is the same payoff `pure-functions-testability.md` and `stub-placeholder-pattern.md` describe from different angles, applied specifically to the data-access layer of a real application.

## Connection

Builds on `adapter-pattern.md`. Directly relevant wherever a set of functions already provides a clean, named interface over real storage — a project's own data-access functions (however currently implemented — a plain in-memory list, raw SQL, an ORM) are already informally a repository the moment their callers only ever depend on the functions' names and meanings, not their internals.

## Try It Yourself

1. Write a second, real `find_by_name` test using a `ToolRepository` pre-loaded with known fake data (via its constructor), and confirm `describe_inventory` and `find_by_name` both work correctly with zero real storage involved — direct, hands-on proof of the testing payoff above.
2. Add a method to `ToolRepository` that doesn't fit its narrow, tool-specific vocabulary (a generic `run_raw_query(sql)` escape hatch) and reason about why adding this defeats the pattern's whole purpose — every caller using it would once again be coupled to the underlying storage mechanism's own query language.
3. Sketch (without necessarily implementing it) what a second, real `ToolRepository` backed by an actual SQL database would need to implement to satisfy the identical `.all()`/`.find_by_name()`/`.add()` contract the in-memory version already does — confirming `describe_inventory` genuinely wouldn't need to change at all to work against either one.
