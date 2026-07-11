---
series: python-fundamentals
level: 34
title: JSON
lang: python
---

JSON (JavaScript Object Notation) is the universal format for sending structured data between programs. When your code talks to a web API — fetching weather data, posting a payment, reading a user profile — the data almost always arrives as JSON. Python's `json` module converts JSON text into Python objects and back.

## What JSON Is

JSON is plain text with a rigid structure. It maps to Python types exactly:

```text
JSON type        Python type     Example
──────────────────────────────────────────────────
object           dict            {"name": "Ada"}
array            list            [1, 2, 3]
string           str             "hello"
number           int or float    42, 3.14
boolean          bool            true → True
null             NoneType        null → None
```

JSON uses double quotes exclusively — single quotes are not valid JSON. JSON booleans are lowercase (`true`, `false`); Python booleans are capitalised (`True`, `False`). The `json` module translates between them automatically.

## json.loads() — Parsing JSON Text into Python

`json.loads(string)` — **loads** JSON from a **string** and returns the equivalent Python object. The `s` in `loads` stands for "string":

```python
import json

response_text = '{"name": "Ada Lovelace", "birth_year": 1815, "active": true}'

person = json.loads(response_text)

print(type(person))
print(person["name"])
print(person["birth_year"])
print(person["active"])
```

```text
<class 'dict'>
Ada Lovelace
1815
True
```

`json.loads` returns a Python dict here because the top-level JSON value is an object. If the top-level value were a JSON array, `loads` would return a list. The return type depends entirely on the JSON, not on `loads` itself.

`json.loads` raises `json.JSONDecodeError` if the string is not valid JSON: missing quotes, single quotes, trailing commas, or any other deviation from the JSON specification.

**CS lens:** `json.loads` is a **parser** — it reads a sequence of characters and builds a tree of Python objects that represent the structure. Parsing is how all languages process external formats: JSON, HTML, SQL, CSV. Every parser has the same shape: read text, validate the grammar, produce a data structure.

## json.dumps() — Serialising Python into JSON Text

`json.dumps(object)` — **dumps** a Python object to a JSON **string**. Inverse of `loads`:

```python
import json

user_record = {
    "username": "grace_h",
    "score": 9500,
    "premium": False,
    "tags": ["admin", "beta"],
}

json_text = json.dumps(user_record)
print(json_text)
print(type(json_text))
```

```text
{"username": "grace_h", "score": 9500, "premium": false, "tags": ["admin", "beta"]}
<class 'str'>
```

`json.dumps` returns a `str`. Notice `False` became `false` — the module handles the Python↔JSON boolean translation automatically.

`json.dumps(obj, indent=2)` adds indentation for human-readable output:

```python
import json

config = {"host": "localhost", "port": 8080, "debug": True}
print(json.dumps(config, indent=2))
```

```text
{
  "host": "localhost",
  "port": 8080,
  "debug": true
}
```

## Working with Nested JSON

JSON objects and arrays nest arbitrarily. Navigate nested structures with chained indexing:

```python
import json

api_response = '''
{
  "status": "ok",
  "results": [
    {"city": "Cape Town", "temp_c": 22},
    {"city": "Nairobi",   "temp_c": 28},
    {"city": "Oslo",      "temp_c": 5}
  ]
}
'''

data = json.loads(api_response)

print(data["status"])
print(data["results"][1]["city"])

for result in data["results"]:
    print(f"{result['city']}: {result['temp_c']}°C")
```

```text
ok
Nairobi
Cape Town: 22°C
Nairobi: 28°C
Oslo: 5°C
```

`data["results"]` returns the list. `data["results"][1]` returns the second dict. `data["results"][1]["city"]` returns the string `"Nairobi"`. Each `[]` descends one level into the structure.

**Enable Debug and step through this.** Inspect `data` in the variables panel to see the full nested structure Python built from the JSON string.

**SE lens:** Real API responses are deeply nested. Always read the API documentation to know the structure before writing code that navigates it. If the structure changes between API versions, every line of `data["key1"]["key2"]` navigation breaks. In production, validate the structure with a schema library or at minimum check that expected keys exist with `.get()` before accessing them.

## Challenge: extract_names

Write a function `extract_names(json_text)` that parses a JSON string containing a list of person objects and returns a sorted list of the names of people whose `"active"` field is `True`.

Each person object has the shape: `{"name": "...", "active": true}` or `{"name": "...", "active": false}`.

`json.loads(json_text)` — parses the JSON string into a Python list.

```challenge
def extract_names(json_text):
    import json
    pass
```

```test
data = '[{"name": "Ada", "active": true}, {"name": "Grace", "active": false}, {"name": "Linus", "active": true}]'
assert extract_names(data) == ["Ada", "Linus"]
assert extract_names("[]") == []
assert extract_names('[{"name": "Alan", "active": false}]') == []
assert extract_names('[{"name": "Z", "active": true}, {"name": "A", "active": true}]') == ["A", "Z"]
assert extract_names('[{"name": "Only", "active": true}]') == ["Only"]
```
