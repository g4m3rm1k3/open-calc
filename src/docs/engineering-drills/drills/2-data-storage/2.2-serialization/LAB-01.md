# DRILL 2.2 — Serialization: What Happens When Data Crosses a Boundary

**Series:** Engineering Drills — Data Storage  
**Concept:** In-memory objects (Python dicts, class instances) exist only in RAM. To move data across any boundary — disk, network, process — it must be converted to bytes. That conversion is serialization. The reverse is deserialization. The format you choose determines what types survive, how much space it takes, and what breaks when your schema changes.  
**App:** A game save system that must work across three schema versions. Each version change breaks something. You fix each break.  
**Time:** 90–120 minutes

---

## Quick Check

Answer these before reading. Check your answers at the bottom.

1. You serialize a Python `datetime` object with `json.dumps`. What do you get back when you call `json.loads` on that output?
2. What is forward compatibility? What is backward compatibility? Which one matters for reading old save files?
3. A Protobuf field named `score` is field number 1. You rename it to `points`. Is this a breaking change? Why?
4. If JSON is "lossy," what exactly does it lose?

---

## Concept Block

### What It Is

**Serialization** is the process of converting in-memory data into a sequence of bytes that can be stored or transmitted. **Deserialization** is the reverse. Every time you save a file, send an HTTP request, or write to a database, your data has been serialized. Every time you read that file, receive a response, or query that database, your data has been deserialized.

The "boundary" is any place where in-memory Python objects cannot go directly:

- Disk: a file handle receives `bytes`, not a Python `dict`
- Network: a socket sends `bytes`, not a Python `list`
- Another process: shared memory aside, processes cannot share Python objects

### The Problem Before

The common beginner mistake: treating serialization as an implementation detail that just works. It does work — until:

- You save a `datetime` as JSON, load it back, and get a `str` instead of `datetime`. Downstream code calls `.strftime()` and crashes with `AttributeError: 'str' object has no attribute 'strftime'`.
- You add a new field in version 2, load a version 1 save file, and get `KeyError: 'achievements'`.
- You rename `score` to `points` in version 3, load a version 2 file, and get `None` where `0` was expected — silently wrong.

Silent data corruption is worse than a crash. At least a crash is visible.

### The Solution

1. **Know what your format preserves.** JSON is text and handles strings, numbers, booleans, null, arrays, and objects. Nothing else. Any other type needs explicit conversion.
2. **Always include a version field.** Put `"version": 1` in every saved file. Use it on load to dispatch to the right migration function.
3. **Handle missing fields with defaults on load, not on save.** Saves should write what they know. Loads should supply defaults for what's missing.
4. **Never silently drop unknown fields.** Store them in a catch-all `extra` dict so old code can round-trip data it doesn't understand.

### What It Hides

`json.dumps` and `json.loads` make serialization look trivial. The actual contract is that `json.loads(json.dumps(x)) == x` only holds when `x` contains only JSON-native types. For everything else, you are silently wrong. The disguise is particularly dangerous because there is no exception — `datetime` serializes as a string without complaint, and `json.loads` gives you that string back, also without complaint. The bug surfaces later, somewhere completely unrelated.

### Canonical Example

```python
import json
from datetime import datetime

game_state = {
    "player": "Alice",
    "score": 1500,
    "last_played": datetime(2024, 3, 15, 14, 30),  # datetime object
    "unlocked": {1, 2, 3},                          # Python set
}

# This raises TypeError: Object of type datetime is not JSON serializable
# json.dumps(game_state)

# Even if you convert datetime to string first:
game_state["last_played"] = "2024-03-15T14:30:00"
data = json.dumps(game_state)
loaded = json.loads(data)

# loaded["last_played"] is now a str, not a datetime.
# The type information is lost. Python has no way to know
# that "2024-03-15T14:30:00" was meant to be a datetime.
print(type(loaded["last_played"]))  # <class 'str'>
```

### Failure Modes

- **Silent type downgrade:** `datetime` → `str`, `bytes` → crash, `set` → crash, `tuple` → `list`. All happen without warning unless you test with realistic data types.
- **KeyError on schema evolution:** Adding a field to the save format and loading an old file that doesn't have it.
- **Renamed field data loss:** You rename `score` to `points`. Old saves have `score` set to 1500. New load code reads `points`, gets `None`, defaults to 0. Player loses 1500 points. Silent.
- **Version field missing:** You add versioning in v2, but old v1 files have no version field. Your version-check code crashes on `KeyError: 'version'`.
- **Encoding mismatch:** JSON is UTF-8. Binary formats may be little-endian or big-endian. Mixing platforms requires explicit handling.

### Operational Reality

- FastAPI uses Pydantic for serialization. Pydantic models define the schema and handle validation. When you return a model from a route, Pydantic calls `.model_dump()` internally, then `json.dumps`. The schema is the source of truth.
- SQLAlchemy returns model instances (Python objects). To serialize them for an API, you must convert them. The "N+1 query" problem often surfaces here because lazy-loading triggers during serialization.
- Celery (task queue) serializes task arguments with JSON by default. Passing a `datetime` argument to a Celery task silently converts it to a string. Many Celery bugs are serialization bugs.
- MessagePack is the binary JSON. Same structure (maps, arrays, strings, numbers), but encoded in compact binary. Typical 20–40% smaller than JSON.
- Protobuf uses field numbers, not names. Field 1 is field 1 whether you call it `score` or `points`. Renaming fields in Protobuf is always safe. Changing types (e.g., int to string) is not.

### You Will See This Again In

- FastAPI: `response_model=` on a route decorator tells FastAPI which Pydantic model to use for output serialization.
- SQLAlchemy: `to_dict()` helper methods you write on models are serialization code.
- Redis: `redis.set(key, json.dumps(value))` and `json.loads(redis.get(key))` is the standard pattern. Same concepts, different boundary.
- WebSockets: every message sent is bytes. Every receive is bytes. You serialize on send, deserialize on receive.
- Celery: task signatures are serialized. The `task_serializer` setting controls the format.

### Watch For

- `json.loads` returns `dict` for JSON objects — but the key type is always `str`. If your original dict had integer keys (`{1: "a"}`), they become strings (`{"1": "a"}`) after a round-trip. This is a common source of `KeyError` bugs.
- `null` in JSON becomes `None` in Python. `None` serializes to `null`. This round-trips correctly. The danger is using `None` in your Python code to mean "not present" when the JSON also uses `null` to mean "explicitly set to nothing." Two different meanings, one representation.
- Schema migrations that work in one direction. Always test: save v1, load with v3. And: save v3, try to load with v1 (old code reading new data). The second scenario matters for rolling deployments.

---

## Step 1 — JSON Serialization Basics

Create a project directory:

```
engineering-drills/drills/2-data-storage/2.2-serialization/
    game_v1.py
    game_v2.py
    game_v3.py
    serialization_limits.py
    msgpack_demo.py
    migration.py
```

Start with `game_v1.py` — the simplest version of our game save system:

```python
# game_v1.py — Version 1 of the game save system.
#
# Schema v1: {version, name, score, level}
# All types are JSON-native. No issues yet.
# We're building something that works before breaking it.

import json
import os
from datetime import datetime

SAVE_FILE = "save_v1.json"

def create_save_v1(name: str, score: int, level: int) -> dict:
    """Create a v1 game state dict.
    
    WHY include 'version': without it, loading code has no way to know
    what schema to expect. Version 1 files will exist even after we
    release version 2 and 3. We need to handle them.
    """
    return {
        "version": 1,       # Schema version — always include this
        "name": name,
        "score": score,
        "level": level,
        # We also record when this save was made.
        # NOTE: we'll store as ISO string — JSON has no datetime type.
        "saved_at": datetime.now().isoformat(),
    }

def save_game(state: dict, filepath: str) -> None:
    """Serialize game state to a JSON file.
    
    WHY indent=2: human-readable saves are debuggable. You can open
    the file in a text editor and verify it's correct.
    In production, you'd use indent=None (compact) to save space.
    """
    with open(filepath, "w", encoding="utf-8") as f:
        # WHY ensure_ascii=False: allows non-ASCII characters in names
        # (e.g., player named "André"). Default True would escape them.
        json.dump(state, f, indent=2, ensure_ascii=False)
    print(f"Saved to {filepath} ({os.path.getsize(filepath)} bytes)")

def load_game(filepath: str) -> dict:
    """Deserialize a JSON save file into a dict.
    
    WHY encoding="utf-8": always specify encoding explicitly.
    Default encoding varies by platform (Windows uses cp1252 by default).
    Explicit is safer.
    """
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

def display_save(state: dict) -> None:
    """Pretty-print a game state."""
    print(f"  Player: {state['name']}")
    print(f"  Score:  {state['score']}")
    print(f"  Level:  {state['level']}")
    print(f"  Saved:  {state['saved_at']}")
    print(f"  Type of 'saved_at': {type(state['saved_at']).__name__}")

# --- demonstration ---
if __name__ == "__main__":
    print("=== Game Save System v1 ===\n")

    # Create and save
    state = create_save_v1("Alice", score=1500, level=7)
    save_game(state, SAVE_FILE)

    # Load and display
    print("\nLoading save file...")
    loaded = load_game(SAVE_FILE)
    display_save(loaded)

    # Show the raw JSON
    print("\nRaw file contents:")
    with open(SAVE_FILE, "r") as f:
        print(f.read())

    # Demonstrate round-trip fidelity
    print("Round-trip check:")
    print(f"  score before save: {state['score']} ({type(state['score']).__name__})")
    print(f"  score after load:  {loaded['score']} ({type(loaded['score']).__name__})")
    print(f"  saved_at before:   type={type(state['saved_at']).__name__}")
    print(f"  saved_at after:    type={type(loaded['saved_at']).__name__}")
    print("\nNote: saved_at is already a string (isoformat()). No type is lost.")
    print("The loss would appear if we stored a raw datetime object.")
```

### SAVE AND TRY

```
python game_v1.py
```

Expected output:

```
=== Game Save System v1 ===

Saved to save_v1.json (113 bytes)

Loading save file...
  Player: Alice
  Score:  1500
  Level:  7
  Saved:  2024-03-15T14:30:00.123456
  Type of 'saved_at': str

Round-trip check:
  score before save: 1500 (int)
  score after load:  1500 (int)
  saved_at before:   type=str
  saved_at after:    type=str

Note: saved_at is already a string (isoformat()). No type is lost.
The loss would appear if we stored a raw datetime object.
```

**Terminal test:** Open `save_v1.json` in a text editor. Confirm the JSON is readable. Change Alice's score to 9999 directly in the file, then run `python -c "import game_v1; import json; d=json.load(open('save_v1.json')); game_v1.display_save(d)"`. Confirm it reads the edited score. This is why human-readable saves are useful — you can fix corrupted saves by hand.

**Change something:** Try `json.dumps({"key": (1, 2, 3)})`. Then `json.loads` the result and check the type. A Python `tuple` becomes a JSON array and comes back as a `list`. The types don't round-trip.

---

## Step 2 — What JSON Loses

Create `serialization_limits.py` to systematically demonstrate JSON's type gaps:

```python
# serialization_limits.py — Demonstrate exactly what JSON cannot represent.
#
# WHY know the limits: "it didn't crash" does not mean "it worked correctly."
# JSON silently converts types. You need to know which conversions happen.

import json
from datetime import datetime, date

print("=== JSON Type Fidelity Test ===\n")

# Test each type and show what survives the round-trip
test_cases = [
    ("int",      42),
    ("float",    3.14),
    ("str",      "hello"),
    ("bool",     True),
    ("None",     None),
    ("list",     [1, 2, 3]),
    ("tuple",    (1, 2, 3)),   # ← converts to list
    ("dict",     {"a": 1}),
    ("int keys", {1: "a", 2: "b"}),  # ← keys become strings
]

print(f"{'Type':<12} {'Before':<20} {'After':<20} {'Same type?'}")
print("-" * 65)

for label, value in test_cases:
    try:
        serialized = json.dumps(value)
        loaded = json.loads(serialized)
        same_type = type(value) == type(loaded)
        marker = "OK" if same_type else "CHANGED"
        print(f"{label:<12} {str(value):<20} {str(loaded):<20} {marker}")
    except TypeError as e:
        print(f"{label:<12} {str(value):<20} {'FAILS: ' + str(e)[:20]:<20} ERROR")

print()
print("Types that FAIL entirely (raise TypeError):")
failing = [
    ("datetime",  datetime.now()),
    ("date",      date.today()),
    ("bytes",     b"hello"),
    ("set",       {1, 2, 3}),
    ("complex",   1+2j),
]

for label, value in failing:
    try:
        json.dumps(value)
        print(f"  {label}: serializes OK (unexpected)")
    except TypeError as e:
        print(f"  {label}: {e}")

print()
print("=== The datetime Problem in Context ===\n")

# This is the most common real-world serialization bug.
# datetime is everywhere in web apps: created_at, updated_at, expires_at.

game_state = {
    "name": "Alice",
    "last_played": datetime.now(),  # raw datetime object
}

print("Attempting json.dumps() with raw datetime object:")
try:
    json.dumps(game_state)
except TypeError as e:
    print(f"  TypeError: {e}")

print("\nCorrect approach: convert to ISO string before serializing")
game_state_safe = {
    "name": "Alice",
    "last_played": datetime.now().isoformat(),  # string, not datetime
}
serialized = json.dumps(game_state_safe)
loaded = json.loads(serialized)

print(f"  Saved type:  {type(game_state_safe['last_played']).__name__}")
print(f"  Loaded type: {type(loaded['last_played']).__name__}")
print(f"  Value:       {loaded['last_played']}")
print()
print("To get a datetime back, you must explicitly parse it:")
dt = datetime.fromisoformat(loaded["last_played"])
print(f"  datetime.fromisoformat(loaded['last_played']) = {dt}")
print(f"  Type: {type(dt).__name__}")

print()
print("=== Bytes: The Invisible Wall ===\n")
# bytes is common: image thumbnails, hashed passwords, cryptographic tokens
binary_data = b"\x00\x01\x02\xff\xfe"
print(f"Attempting to serialize bytes: {binary_data!r}")
try:
    json.dumps({"data": binary_data})
except TypeError as e:
    print(f"  TypeError: {e}")

print("  Solution: encode as base64 string")
import base64
encoded = base64.b64encode(binary_data).decode("ascii")
serialized = json.dumps({"data": encoded})
loaded_encoded = json.loads(serialized)
recovered = base64.b64decode(loaded_encoded["data"])
print(f"  Encoded: '{encoded}'")
print(f"  Recovered: {recovered!r}")
print(f"  Round-trip correct: {recovered == binary_data}")
```

### SAVE AND TRY

```
python serialization_limits.py
```

Expected output:

```
=== JSON Type Fidelity Test ===

Type         Before               After                Same type?
-----------------------------------------------------------------
int          42                   42                   OK
float        3.14                 3.14                 OK
str          hello                hello                OK
bool         True                 True                 OK
None         None                 None                 OK
list         [1, 2, 3]            [1, 2, 3]            OK
tuple        (1, 2, 3)            [1, 2, 3]            CHANGED
dict         {'a': 1}             {'a': 1}             OK
int keys     {1: 'a', 2: 'b'}    {'1': 'a', '2': 'b'} CHANGED

Types that FAIL entirely (raise TypeError):
  datetime: Object of type datetime is not JSON serializable
  date: Object of type date is not JSON serializable
  bytes: Object of type bytes is not JSON serializable
  set: Object of type set is not JSON serializable
  complex: Object of type complex is not JSON serializable

=== The datetime Problem in Context ===

Attempting json.dumps() with raw datetime object:
  TypeError: Object of type datetime is not JSON serializable

Correct approach: convert to ISO string before serializing
  Saved type:  str
  Loaded type: str
  Value:       2024-03-15T14:30:00.123456

To get a datetime back, you must explicitly parse it:
  datetime.fromisoformat(loaded['last_played']) = 2024-03-15 14:30:00.123456
  Type: datetime

=== Bytes: The Invisible Wall ===

Attempting to serialize bytes: b'\x00\x01\x02\xff\xfe'
  TypeError: Object of type bytes is not JSON serializable
  Solution: encode as base64 string
  Encoded: 'AAEC//4='
  Recovered: b'\x00\x01\x02\xff\xfe'
  Round-trip correct: True
```

**Change something:** Try `json.dumps({1: "a", 2: "b"})` then `json.loads` it. Try to access `loaded[1]` (integer key). You'll get `KeyError`. Try `loaded["1"]` (string key). This works. JSON objects always have string keys. If you use integer keys in your data model, you must convert them back explicitly after loading.

---

## Step 3 — Custom Serializer for Non-JSON Types

Create `game_v1.py` additions — add a `CustomEncoder` class that handles the types JSON cannot:

```python
# custom_serializer.py — Handle non-JSON types gracefully.
#
# WHY a custom encoder: we don't want to scatter datetime.isoformat()
# calls throughout our codebase. One encoder handles all conversions
# in one place. When we add a new type, we add one elif here.

import json
from datetime import datetime, date
from enum import Enum

class GameEncoder(json.JSONEncoder):
    """Custom JSON encoder that handles types json module cannot.
    
    WHY subclass JSONEncoder: the json module calls default() for any
    object it doesn't know how to serialize. We override it to handle
    our specific types before falling through to the parent's error.
    
    Usage: json.dumps(data, cls=GameEncoder)
    """
    def default(self, obj):
        # WHY check most specific types first
        if isinstance(obj, datetime):
            # WHY include type tag: when we load this, we need to know
            # it was a datetime, not just a string that happens to look
            # like a datetime. The __type__ key is our type hint.
            return {"__type__": "datetime", "value": obj.isoformat()}

        if isinstance(obj, date):
            return {"__type__": "date", "value": obj.isoformat()}

        if isinstance(obj, bytes):
            import base64
            return {"__type__": "bytes", "value": base64.b64encode(obj).decode("ascii")}

        if isinstance(obj, set):
            # WHY list(sorted(...)): sets are unordered. Converting to
            # a sorted list makes output deterministic. If we used list(obj),
            # the same set could serialize to different JSON on different runs,
            # making file comparison and testing unreliable.
            return {"__type__": "set", "value": sorted(list(obj))}

        if isinstance(obj, Enum):
            return {"__type__": "enum", "class": type(obj).__name__, "value": obj.value}

        # Fall through to parent — will raise TypeError for unknown types
        return super().default(obj)

def game_loads(s: str) -> dict:
    """Deserialize JSON with type reconstruction.
    
    WHY object_hook: json.loads calls object_hook for every JSON object
    (dict) it encounters. We inspect each dict for our __type__ tag
    and convert it back to the original Python type.
    """
    def reconstruct(obj: dict):
        if "__type__" not in obj:
            return obj  # Regular dict, no conversion needed

        t = obj["__type__"]
        if t == "datetime":
            return datetime.fromisoformat(obj["value"])
        if t == "date":
            return date.fromisoformat(obj["value"])
        if t == "bytes":
            import base64
            return base64.b64decode(obj["value"])
        if t == "set":
            return set(obj["value"])
        # Unknown __type__: return as-is rather than crash
        return obj

    return json.loads(s, object_hook=reconstruct)

# --- demonstration ---
if __name__ == "__main__":
    from datetime import datetime

    state = {
        "version": 1,
        "name": "Alice",
        "score": 1500,
        "last_played": datetime(2024, 3, 15, 14, 30),  # raw datetime
        "inventory": {1, 5, 12},                        # set of item IDs
        "thumbnail": b"\x89PNG\r\n",                    # bytes (first 6 of PNG header)
    }

    print("=== Custom Serializer Demo ===\n")
    print("Original types:")
    for k, v in state.items():
        print(f"  {k}: {type(v).__name__} = {v!r}")

    # Serialize with our custom encoder
    serialized = json.dumps(state, cls=GameEncoder, indent=2)
    print("\nSerialized JSON:")
    print(serialized)

    # Deserialize with type reconstruction
    loaded = game_loads(serialized)
    print("\nLoaded types:")
    for k, v in loaded.items():
        print(f"  {k}: {type(v).__name__} = {v!r}")

    # Verify round-trip
    print("\nRound-trip verification:")
    print(f"  last_played is datetime: {isinstance(loaded['last_played'], datetime)}")
    print(f"  inventory is set:        {isinstance(loaded['inventory'], set)}")
    print(f"  thumbnail is bytes:      {isinstance(loaded['thumbnail'], bytes)}")
    print(f"  thumbnail correct:       {loaded['thumbnail'] == state['thumbnail']}")
```

### SAVE AND TRY

```
python custom_serializer.py
```

Expected output:

```
=== Custom Serializer Demo ===

Original types:
  version: int = 1
  name: str = 'Alice'
  score: int = 1500
  last_played: datetime = datetime.datetime(2024, 3, 15, 14, 30)
  inventory: set = {1, 5, 12}
  thumbnail: bytes = b'\x89PNG\r\n'

Serialized JSON:
{
  "version": 1,
  "name": "Alice",
  "score": 1500,
  "last_played": {
    "__type__": "datetime",
    "value": "2024-03-15T14:30:00"
  },
  "inventory": {
    "__type__": "set",
    "value": [1, 5, 12]
  },
  "thumbnail": {
    "__type__": "bytes",
    "value": "iVBORw0K"
  }
}

Loaded types:
  version: int = 1
  name: str = 'Alice'
  score: int = 1500
  last_played: datetime = datetime.datetime(2024, 3, 15, 14, 30)
  inventory: set = {1, 5, 12}
  thumbnail: bytes = b'\x89PNG\r\n'

Round-trip verification:
  last_played is datetime: True
  inventory is set:        True
  thumbnail is bytes:      True
  thumbnail correct:       True
```

**Terminal test:** Add a Python `complex` number (`1+2j`) to the `state` dict. Run the script. The `GameEncoder.default()` method will fall through to `super().default()` which raises `TypeError`. Add a handler for `complex` that stores it as `{"__type__": "complex", "real": obj.real, "imag": obj.imag}`.

**Change something:** Remove the `sorted()` from the `set` conversion. Run the script multiple times. You may see the set elements in different orders. This makes your saved files different on every run even if the data is the same — a problem for version control and file comparison.

---

## Step 4 — Schema Evolution: Save v1, Load with v2 Code

Create `game_v2.py` — adds `achievements` list:

```python
# game_v2.py — Version 2 adds an achievements list.
#
# WHY this matters: v1 save files exist on players' machines.
# When they upgrade to v2, the game must load their old saves.
# The new 'achievements' field doesn't exist in v1 files.
# Without a migration strategy, loading v1 with v2 code crashes.

import json
import os

SAVE_FILE_V1 = "save_v1.json"
SAVE_FILE_V2 = "save_v2.json"

def create_save_v2(name: str, score: int, level: int,
                   achievements: list[str] | None = None) -> dict:
    """Create a v2 game state.
    
    WHY default None then convert: callers can omit achievements
    and get an empty list. This is better than achievements=[]
    as a default argument (mutable default argument trap in Python).
    """
    return {
        "version": 2,
        "name": name,
        "score": score,
        "level": level,
        "achievements": achievements if achievements is not None else [],
    }

def load_any_version(filepath: str) -> dict:
    """Load a save file and migrate it to the current schema.
    
    This is the key pattern: load the raw dict, check the version,
    run migration functions until we reach the current version.
    The result is always a v2 dict, regardless of input version.
    
    WHY version-to-version migrations (not version-to-latest):
    Each migration function is simple and testable. migrate_v1_to_v2
    only has to know about v1 and v2. If we later add v3, we don't
    rewrite the v1→v2 migration — we add a v2→v3 migration.
    Chain: v1 → v2 → v3 handles all combinations.
    """
    with open(filepath, "r", encoding="utf-8") as f:
        raw = json.load(f)

    # WHY .get("version", 1): if there's no version field, assume v1.
    # Some v1 files may predate the version field.
    version = raw.get("version", 1)

    print(f"  Loaded file with version: {version}")

    # Run migrations in sequence
    if version < 2:
        raw = migrate_v1_to_v2(raw)

    return raw

def migrate_v1_to_v2(state: dict) -> dict:
    """Upgrade a v1 save dict to v2 schema.
    
    Strategy: add missing fields with sensible defaults.
    Never remove fields — unknown fields are kept in case they're needed.
    
    WHY copy: don't mutate the input. The caller may still need
    the original. In practice this also makes testing cleaner.
    """
    print("  Migrating v1 → v2...")
    migrated = dict(state)  # Shallow copy is fine for flat dicts

    # Add the new 'achievements' field with an empty list default.
    # WHY not raise an error: old saves simply never had achievements.
    # An empty list is the correct representation of "earned nothing yet."
    migrated["achievements"] = []

    # Update the version field
    migrated["version"] = 2

    print(f"  Added 'achievements': [] (default for migrated v1 saves)")
    return migrated

def display_v2(state: dict) -> None:
    print(f"  Version:      {state['version']}")
    print(f"  Player:       {state['name']}")
    print(f"  Score:        {state['score']}")
    print(f"  Level:        {state['level']}")
    print(f"  Achievements: {state['achievements']}")

# --- demonstration ---
if __name__ == "__main__":
    print("=== Schema Evolution Demo: v1 → v2 ===\n")

    # Create a v1 save file if it doesn't exist
    if not os.path.exists(SAVE_FILE_V1):
        v1_state = {"version": 1, "name": "Alice", "score": 1500, "level": 7}
        with open(SAVE_FILE_V1, "w") as f:
            json.dump(v1_state, f, indent=2)
        print(f"Created {SAVE_FILE_V1} (simulating an old save file)\n")

    # Show what happens if we naively load v1 and access 'achievements'
    print("WHAT BREAKS without migration:")
    with open(SAVE_FILE_V1) as f:
        naive_load = json.load(f)
    try:
        print(f"  naive_load['achievements'] = {naive_load['achievements']}")
    except KeyError as e:
        print(f"  KeyError: {e}")
        print("  This is the bug. Old saves crash new code.\n")

    # Load with migration
    print("WITH migration:")
    state_v2 = load_any_version(SAVE_FILE_V1)
    display_v2(state_v2)

    # Save a v2 file
    state = create_save_v2("Bob", score=2200, level=10,
                           achievements=["First Blood", "Speed Runner"])
    with open(SAVE_FILE_V2, "w") as f:
        json.dump(state, f, indent=2)
    print(f"\nCreated {SAVE_FILE_V2}")

    # Load the v2 file (no migration needed)
    print("\nLoading v2 file (no migration needed):")
    state_v2_direct = load_any_version(SAVE_FILE_V2)
    display_v2(state_v2_direct)
```

### SAVE AND TRY

Run `game_v1.py` first to create `save_v1.json`, then:

```
python game_v2.py
```

Expected output:

```
=== Schema Evolution Demo: v1 → v2 ===

WHAT BREAKS without migration:
  KeyError: 'achievements'
  This is the bug. Old saves crash new code.

WITH migration:
  Loaded file with version: 1
  Migrating v1 → v2...
  Added 'achievements': [] (default for migrated v1 saves)
  Version:      2
  Player:       Alice
  Score:        1500
  Level:        7
  Achievements: []

Created save_v2.json

Loading v2 file (no migration needed):
  Loaded file with version: 2
  Version:      2
  Player:       Bob
  Score:        2200
  Level:        10
  Achievements: ['First Blood', 'Speed Runner']
```

**Change something:** In `migrate_v1_to_v2`, instead of defaulting achievements to `[]`, try defaulting to `["Veteran Player"]` (a special achievement for people who played v1). This demonstrates that migrations can do more than just fill defaults — they can apply business logic.

---

## Step 5 — Renaming a Field: The Silent Data Loss Bug

Create `game_v3.py` — renames `score` to `points`:

```python
# game_v3.py — Version 3 renames 'score' to 'points'.
#
# This is the most dangerous schema change. There is no crash.
# The old field ('score') is silently ignored. The new field ('points')
# gets its default value (0 or None). The player loses their score.
# It looks like it works. It doesn't.

import json
import os

SAVE_FILE_V1 = "save_v1.json"
SAVE_FILE_V2 = "save_v2.json"
SAVE_FILE_V3 = "save_v3.json"

def create_save_v3(name: str, points: int, level: int,
                   achievements: list[str] | None = None) -> dict:
    """v3 schema: score is renamed to points."""
    return {
        "version": 3,
        "name": name,
        "points": points,   # ← was 'score'
        "level": level,
        "achievements": achievements if achievements is not None else [],
    }

def migrate_v1_to_v2(state: dict) -> dict:
    """Same as before — chain migration works across multiple hops."""
    migrated = dict(state)
    migrated["achievements"] = migrated.get("achievements", [])
    migrated["version"] = 2
    return migrated

def migrate_v2_to_v3(state: dict) -> dict:
    """Upgrade v2 → v3: rename 'score' to 'points'.
    
    WHY pop with default: if 'score' is missing (shouldn't happen
    in v2, but defensive programming), default to 0 rather than crash.
    
    WHY delete 'score': after migration, the v3 schema has 'points'.
    Keeping 'score' around would confuse loading code that checks
    which version of the schema is active.
    """
    print("  Migrating v2 → v3...")
    migrated = dict(state)

    # Copy 'score' into 'points', then remove 'score'
    # WHY pop: we want to move the value, not copy it.
    # Leaving 'score' in the dict could confuse code that loads
    # a "v3" file and finds both 'score' and 'points'.
    score_value = migrated.pop("score", 0)  # Remove 'score', default 0 if missing
    migrated["points"] = score_value         # Create 'points' with same value

    migrated["version"] = 3
    print(f"  Renamed 'score'={score_value} to 'points'={migrated['points']}")
    return migrated

def load_any_version(filepath: str) -> dict:
    """Load and migrate any version to v3.
    
    Chain: v1 → v2 → v3. Each step is independent.
    Adding v4 later means only adding migrate_v3_to_v4() here.
    """
    with open(filepath, "r", encoding="utf-8") as f:
        raw = json.load(f)

    version = raw.get("version", 1)
    print(f"  Loaded file with version: {version}")

    if version < 2:
        raw = migrate_v1_to_v2(raw)
    if version < 3:
        raw = migrate_v2_to_v3(raw)

    return raw

def display_v3(state: dict) -> None:
    print(f"  Version:      {state['version']}")
    print(f"  Player:       {state['name']}")
    print(f"  Points:       {state['points']}")      # ← new field name
    print(f"  Level:        {state['level']}")
    print(f"  Achievements: {state['achievements']}")

# --- demonstration ---
if __name__ == "__main__":
    print("=== Schema Evolution Demo: v2 → v3 (rename field) ===\n")

    # First: show the silent corruption without migration
    print("WHAT BREAKS without migration (naively load v2 with v3 code):")
    if not os.path.exists(SAVE_FILE_V2):
        with open(SAVE_FILE_V2, "w") as f:
            json.dump({"version": 2, "name": "Bob", "score": 2200,
                       "level": 10, "achievements": ["First Blood"]}, f)

    with open(SAVE_FILE_V2) as f:
        naive = json.load(f)

    # Simulate v3 code that naively reads 'points' from a v2 file
    player_points = naive.get("points", 0)  # Default 0, but 'points' doesn't exist
    print(f"  naive.get('points', 0) = {player_points}")
    print(f"  Player's actual score in file: {naive.get('score', 'N/A')}")
    print(f"  Result: player loses 2200 points. No exception raised. Silent bug.\n")

    # Now: correct migration
    print("WITH migration chain (v1 → v2 → v3):")
    print("\nLoading v1 file:")
    s1 = load_any_version(SAVE_FILE_V1)
    display_v3(s1)

    print("\nLoading v2 file:")
    s2 = load_any_version(SAVE_FILE_V2)
    display_v3(s2)

    # Create and load a v3 file
    state = create_save_v3("Carol", points=3100, level=15,
                            achievements=["Perfectionist"])
    with open(SAVE_FILE_V3, "w") as f:
        json.dump(state, f, indent=2)

    print("\nLoading v3 file (no migration):")
    s3 = load_any_version(SAVE_FILE_V3)
    display_v3(s3)
```

### SAVE AND TRY

```
python game_v3.py
```

Expected output:

```
=== Schema Evolution Demo: v2 → v3 (rename field) ===

WHAT BREAKS without migration (naively load v2 with v3 code):
  naive.get('points', 0) = 0
  Player's actual score in file: 2200
  Result: player loses 2200 points. No exception raised. Silent bug.

WITH migration chain (v1 → v2 → v3):

Loading v1 file:
  Loaded file with version: 1
  Migrating v1 → v2...
  Migrating v2 → v3...
  Renamed 'score'=1500 to 'points'=1500
  Version:      3
  Player:       Alice
  Points:       1500
  Level:        7
  Achievements: []

Loading v2 file:
  Loaded file with version: 2
  Migrating v2 → v3...
  Renamed 'score'=2200 to 'points'=2200
  Version:      3
  Player:       Bob
  Points:       2200
  Level:        10
  Achievements: ['First Blood']

Loading v3 file (no migration):
  Loaded file with version: 3
  Version:      3
  Player:       Carol
  Points:       3100
  Level:        15
  Achievements: ['Perfectionist']
```

**Terminal test:** Open `save_v2.json` directly and manually remove the `"score"` field (simulating a file that was partially written/corrupted). Run `game_v3.py` again. The migration uses `migrated.pop("score", 0)` — the `0` default means it handles the missing field without crashing. The player gets 0 points instead of the corrupted save crashing the game.

**Change something:** Add a migration that normalizes the `name` field — strip leading/trailing whitespace, title-case it. A save file with `"name": "  alice  "` should come out as `"Alice"` after migration. Migrations are the right place for data cleaning.

---

## Step 6 — MessagePack: Binary Serialization

Install msgpack: `pip install msgpack`

Create `msgpack_demo.py`:

```python
# msgpack_demo.py — Binary serialization vs JSON.
#
# WHY MessagePack: same conceptual structure as JSON (maps, arrays,
# strings, numbers, booleans, null) but encoded as compact binary.
# No parsing of human-readable text. Smaller. Faster to encode/decode.
#
# WHY not always use binary: binary is not human-readable.
# You can't open a .msgpack file in a text editor and read it.
# Debugging is harder. For game saves, JSON is often better.
# For high-throughput APIs or caches, MessagePack wins.

import json
import msgpack
import time
import os

# Build a realistic game state to compare sizes
def make_game_state(num_items: int = 100) -> dict:
    """Create a game state with enough data to show size differences."""
    return {
        "version": 3,
        "name": "Alice Wonderland",
        "points": 1500,
        "level": 7,
        "achievements": [f"achievement_{i}" for i in range(20)],
        "inventory": {
            f"item_{i}": {"quantity": i % 5 + 1, "rarity": i % 3}
            for i in range(num_items)
        },
        "settings": {
            "sound_volume": 0.75,
            "music_volume": 0.50,
            "fullscreen": True,
            "resolution": [1920, 1080],
        },
    }

state = make_game_state(100)

print("=== JSON vs MessagePack Size and Speed ===\n")

# --- JSON ---
json_bytes = json.dumps(state).encode("utf-8")
json_size = len(json_bytes)

# --- MessagePack ---
# WHY use_bin_type=True: tells msgpack to encode Python bytes as
# MessagePack binary (bin type) rather than raw bytes (str type).
# This ensures bytes round-trip correctly.
msgpack_bytes = msgpack.dumps(state, use_bin_type=True)
msgpack_size = len(msgpack_bytes)

print(f"Data size comparison (100 inventory items, 20 achievements):")
print(f"  JSON:       {json_size:,} bytes")
print(f"  MessagePack: {msgpack_size:,} bytes")
print(f"  Reduction:   {100 * (1 - msgpack_size/json_size):.1f}%")

# --- Speed comparison ---
ITERATIONS = 1000

start = time.perf_counter()
for _ in range(ITERATIONS):
    json.dumps(state).encode("utf-8")
json_encode_ms = (time.perf_counter() - start) / ITERATIONS * 1000

start = time.perf_counter()
for _ in range(ITERATIONS):
    json.loads(json_bytes.decode("utf-8"))
json_decode_ms = (time.perf_counter() - start) / ITERATIONS * 1000

start = time.perf_counter()
for _ in range(ITERATIONS):
    msgpack.dumps(state, use_bin_type=True)
mp_encode_ms = (time.perf_counter() - start) / ITERATIONS * 1000

start = time.perf_counter()
for _ in range(ITERATIONS):
    msgpack.loads(msgpack_bytes, raw=False)
mp_decode_ms = (time.perf_counter() - start) / ITERATIONS * 1000

print(f"\nSpeed comparison ({ITERATIONS} iterations each):")
print(f"  JSON encode:        {json_encode_ms:.3f}ms per call")
print(f"  MessagePack encode: {mp_encode_ms:.3f}ms per call")
print(f"  JSON decode:        {json_decode_ms:.3f}ms per call")
print(f"  MessagePack decode: {mp_decode_ms:.3f}ms per call")

# --- Type fidelity ---
print(f"\nType fidelity (what MessagePack preserves that JSON loses):")

test_data = {
    "an_int": 42,
    "a_float": 3.14,
    "a_string": "hello",
    "a_bool": True,
    "a_none": None,
    "bytes_data": b"\x00\x01\x02",  # ← JSON cannot handle this
}

mp_serialized = msgpack.dumps(test_data, use_bin_type=True)
mp_loaded = msgpack.loads(mp_serialized, raw=False)

print(f"  {'Field':<15} {'Before type':<15} {'After type':<15} {'Match?'}")
print(f"  {'-'*55}")
for k, v in test_data.items():
    after = mp_loaded[k]
    match = type(v) == type(after) and v == after
    print(f"  {k:<15} {type(v).__name__:<15} {type(after).__name__:<15} {'OK' if match else 'CHANGED'}")

print(f"\nNote: MessagePack preserves bytes natively.")
print(f"JSON requires base64 encoding — adds ~33% overhead for binary data.")

print(f"\nWhen to use each:")
print(f"  JSON:        human-readable saves, config files, APIs needing debuggability")
print(f"  MessagePack: caches (Redis), inter-service calls, high-throughput logging")
print(f"  Protobuf:    strongly-typed schemas, cross-language, largest codebases")
```

### SAVE AND TRY

```
pip install msgpack
python msgpack_demo.py
```

Expected output (sizes/speeds vary):

```
=== JSON vs MessagePack Size and Speed ===

Data size comparison (100 inventory items, 20 achievements):
  JSON:        5,842 bytes
  MessagePack: 3,891 bytes
  Reduction:   33.4%

Speed comparison (1000 iterations each):
  JSON encode:        0.412ms per call
  MessagePack encode: 0.187ms per call
  JSON decode:        0.523ms per call
  MessagePack decode: 0.201ms per call

Type fidelity (what MessagePack preserves that JSON loses):
  Field           Before type     After type      Match?
  -------------------------------------------------------
  an_int          int             int             OK
  a_float         float           float           OK
  a_string        str             str             OK
  a_bool          bool            bool            OK
  a_none          NoneType        NoneType        OK
  bytes_data      bytes           bytes           OK

Note: MessagePack preserves bytes natively.
JSON requires base64 encoding — adds ~33% overhead for binary data.

When to use each:
  JSON:        human-readable saves, config files, APIs needing debuggability
  MessagePack: caches (Redis), inter-service calls, high-throughput logging
  Protobuf:    strongly-typed schemas, cross-language, largest codebases
```

**Change something:** Increase `num_items` to 1000 in `make_game_state()`. The size difference and speed difference both become more pronounced at larger data sizes. The `33%` reduction remains roughly constant because MessagePack's advantage is structural overhead (field name repetition) not compression.

---

## Challenge — Versioned Configuration File System

No solution is provided. Build it from scratch.

### Requirements

Build a `config_manager.py` module for a fictional text editor app. Handle three schema versions:

- **v1:** `{theme: str, font_size: int}`
- **v2:** Adds `{shortcuts: dict}` — keyboard shortcut overrides like `{"save": "Ctrl+S"}`
- **v3:** Replaces `font_size: int` with `typography: {size: int, family: str}`. The field `font_size` no longer exists.

### Starter Code

```python
# config_manager.py — Starter (fill in the blanks)
import json
import os

CURRENT_VERSION = 3

def create_config_v1(theme: str, font_size: int) -> dict:
    return {"version": 1, "theme": theme, "font_size": font_size}

def create_config_v2(theme: str, font_size: int, shortcuts: dict) -> dict:
    return {"version": 2, "theme": theme, "font_size": font_size,
            "shortcuts": shortcuts}

def create_config_v3(theme: str, typography: dict, shortcuts: dict) -> dict:
    # typography = {"size": int, "family": str}
    return {"version": 3, "theme": theme, "typography": typography,
            "shortcuts": shortcuts}

def migrate_v1_to_v2(config: dict) -> dict:
    """Add shortcuts field."""
    pass  # Your implementation here

def migrate_v2_to_v3(config: dict) -> dict:
    """Convert font_size → typography dict."""
    # HINT: Use the font_size value for typography["size"]
    # Use a default font family (e.g., "monospace")
    pass  # Your implementation here

def load_config(filepath: str) -> dict:
    """Load and migrate any version to current."""
    pass  # Your implementation here

def save_config(config: dict, filepath: str) -> None:
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)

# --- Test (write this as a test, not just a demo) ---
def test_migration():
    """Test that v1 loads correctly with v3 code."""
    # Save v1
    v1 = create_config_v1("dark", 14)
    save_config(v1, "test_config_v1.json")

    # Load with v3 code
    loaded = load_config("test_config_v1.json")

    # Verify
    assert loaded["version"] == 3, f"Expected version 3, got {loaded['version']}"
    assert loaded["theme"] == "dark", "Theme should be preserved"
    assert "font_size" not in loaded, "font_size should be gone in v3"
    assert loaded["typography"]["size"] == 14, "font_size should migrate to typography.size"
    assert loaded["typography"]["family"] == "monospace", "Default family should be monospace"
    assert loaded["shortcuts"] == {}, "Default shortcuts should be empty dict"

    print("All assertions passed.")
    os.remove("test_config_v1.json")

if __name__ == "__main__":
    test_migration()
```

### When Done

- `test_migration()` runs without assertion errors.
- `load_config` handles v1, v2, and v3 files.
- `migrate_v2_to_v3` copies `font_size` into `typography.size`, sets `typography.family` to `"monospace"`, and removes `font_size` from the result.
- If a v2 config has a non-standard `font_size` value like 18, the migrated v3 config has `typography = {"size": 18, "family": "monospace"}`.
- Loading a v3 config runs no migrations (no print output from migration functions).

**Stuck? Ask AI:** "I'm building a migration chain for a versioned JSON config file. I have three versions and need to chain migration functions so loading any version produces the latest version. My migrations are `migrate_v1_to_v2(config)` and `migrate_v2_to_v3(config)`. How should the `load_config` function dispatch to the right migrations without running unnecessary ones?"

---

## Quick Check Answers

1. **A string.** `json.dumps(datetime.now())` raises `TypeError` — but if you call `.isoformat()` first and store the string, `json.loads` gives you that string back. There is no datetime type in JSON. You must explicitly call `datetime.fromisoformat()` to convert it back. The round-trip is lossy unless you write explicit conversion code.

2. **Forward compatibility:** new code can read old data (old save files load in new code). **Backward compatibility:** old code can read new data (v1 game can load a v2 save). For loading old save files, you need **forward compatibility** — your new code handles data written by old code. The migration chain (`v1 → v2 → v3`) provides forward compatibility.

3. **Not a breaking change in Protobuf.** Protobuf uses field numbers (`field 1`) not field names in the wire format. Renaming `score` to `points` in the `.proto` file changes the source code name but not the binary encoding. Old code writes field 1, new code reads field 1 and calls it `points`. No incompatibility. This is one of Protobuf's key advantages over JSON and MessagePack for long-lived schemas.

4. **JSON loses:** `datetime` (becomes string), `bytes` (crashes), `set` (crashes), `tuple` (becomes list), integer keys (become string keys), `complex` (crashes), `Enum` (crashes unless you implement `default()`). It also loses ordering guarantees (modern Python dicts preserve insertion order, but the JSON spec does not require it). The most common practical losses are `datetime`, `bytes`, and `set`.
