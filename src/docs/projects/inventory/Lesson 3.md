# Lesson 3: The Data Validation Boundary

**What you will build**
You will build a strict validation layer using Pydantic to filter and shape raw incoming dictionaries into guaranteed, type-safe Python objects. The problem we are solving is the "garbage in, garbage out" vulnerability: our database is strict, but if our Python application passes bad data to it, the application will crash with raw SQL errors. We must catch and format data *before* it enters our core logic.

**What you need to know first**
From Lesson 1: SQLite `STRICT` mode. This lesson introduces entirely new concepts for validation.

**The Pipeline**
`Client Request → [ Pydantic (Validation) ] → SQLAlchemy (ORM) → SQLite (Storage)`

This lesson touches the **Pydantic (Validation)** stage.
If a client sends `{"name": "Zone A", "region": "ne"}`, Pydantic will intercept it, coerce `"ne"` to the uppercase `"NE"`, validate the string lengths, and produce a secure object. Only then is it passed to SQLAlchemy (future lesson) and finally stored as `"NE"` in the SQLite database we built in Lesson 1.

---

## Concept Unit: Runtime Validation with BaseModel

### The Problem

Standard Python type hints (like `name: str`) are completely ignored when the program actually runs. If an API request sends a dictionary like `{"name": 123}`, Python will happily process it as an integer until a downstream function crashes. We need a way to enforce types at the exact moment data enters our system.

### Introduce the concept in isolation

Create `lab_basemodel.py` to see Pydantic enforce types at runtime. We will test it against a sequence of three different inputs: perfect data, coercible data, and invalid data.

```python
from pydantic import BaseModel, ValidationError

class SimpleLocation(BaseModel):
    name: str
    is_active: bool

print("--- Test 1: Perfect Data ---")
loc1 = SimpleLocation(name="Warehouse A", is_active=True)
print(repr(loc1))

print("\n--- Test 2: Coercible Data ---")
# Pydantic will convert the string "true" to a boolean True
loc2 = SimpleLocation(name="Warehouse B", is_active="true") 
print(repr(loc2))

print("\n--- Test 3: Invalid Data ---")
try:
    loc3 = SimpleLocation(name=["Not", "a", "string"], is_active=True)
except ValidationError as e:
    print("Validation failed successfully!")
    print(e.json(indent=2))

```

Run it:

```bash
python lab_basemodel.py

```

Output:

```text
--- Test 1: Perfect Data ---
SimpleLocation(name='Warehouse A', is_active=True)

--- Test 2: Coercible Data ---
SimpleLocation(name='Warehouse B', is_active=True)

--- Test 3: Invalid Data ---
Validation failed successfully!
[
  {
    "type": "string_type",
    "loc": [
      "name"
    ],
    "msg": "Input should be a valid string",
    "input": [
      "Not",
      "a",
      "string"
    ]
  }
]

```

*What this proves:* `BaseModel` doesn't just hint at types; it actively constructs an object. It attempts to gracefully convert (coerce) close matches (like `"true"` to `True`), but throws a highly detailed, machine-readable `ValidationError` when the shape is fundamentally wrong.

### Discard the throwaway example

Delete `lab_basemodel.py`. We will now define our real NexusInventory models.

### Project Change

We will create a central file to define the incoming data shapes for our API.

* **Files affected:** Create a new file `nexus/schemas.py`.
* **Change type:** Add.
* **Location:** Brand-new file.
* **Dependencies:** Requires installing the `pydantic` package.

### The New Code

```python
from pydantic import BaseModel

class LocationCreate(BaseModel):
    name: str
    region: str
    parent_id: int | None = None

```

### The Updated Project

Because this is a brand-new file, the code block above represents the entirety of `nexus/schemas.py`. This model represents the exact payload we expect when a client wants to create a new location.

### Mechanical walkthrough

1. `from pydantic import BaseModel`: (First appearance). Imports the core class from the Pydantic library that enables validation.
2. `class LocationCreate(BaseModel):`: (First appearance). Defines a new Python class that inherits from Pydantic's `BaseModel`.
3. `name: str`: (First appearance). Standard Python type hint. Because it inherits from `BaseModel`, Pydantic reads this hint and enforces that `name` must be a string.
4. `region: str`: Enforces that `region` must be a string.
5. `parent_id`: The property name mapping to our database's `parent_id` column.
6. `: int | None`: (First appearance). The modern Python union type syntax. It means this value can be an integer, OR it can be `None` (null).
7. `= None`: (First appearance). Assigns a default value. If the client omits the `parent_id` key from their JSON payload, Pydantic will not throw an error; it will automatically fill it with `None`.

### CS Lens

**"Parse, don't validate."** This is a famous software engineering concept. Validation usually means writing `if type(data) != str: raise Error` and leaving the data as a raw dictionary. *Parsing* means consuming the dictionary and returning a completely new, structurally guaranteed object (`LocationCreate`). Once the data becomes a Pydantic object, downstream functions never have to check if `name` is a string. The object's mere existence proves it.

### SE Lens

Why use a separate class named `LocationCreate` instead of just a `Location` class? **Separation of Concerns (Read vs. Write models).** When creating a location, the database generates the `id`. Therefore, `id` shouldn't be in the creation payload. If we share one `Location` schema for both creating and reading, we either have to make `id` optional (which is a lie, a read location *always* has an id), or write complex logic to ignore it. Having distinct `*Create`, `*Update`, and `*Read` schemas prevents API vulnerabilities like users trying to set their own IDs.

### Commands needed to make this unit real

You must install Pydantic into your Python environment.

```bash
pip install pydantic

```

### One sentence connecting this unit to what came immediately before.

We have guaranteed the data types, but a string of 10,000 spaces is still technically a valid `str`, which would silently ruin our database.

---

## Concept Unit: Constraining Values with Field

### The Problem

Primitive types are too broad. The `skus` table we built in Lesson 2 requires a `sku_id` string, but business rules dictate that a SKU ID must be between 5 and 12 characters, and it cannot contain spaces. `str` allows spaces and infinite lengths.

### Introduce the concept in isolation

Create `lab_field.py` to see how to constrain a basic type.

```python
from pydantic import BaseModel, Field, ValidationError

class Hardware(BaseModel):
    # Must be exactly 3 uppercase letters followed by 3 numbers
    part_number: str = Field(pattern=r"^[A-Z]{3}\d{3}$")

print("--- Test 1: Valid ---")
print(repr(Hardware(part_number="BOL123")))

print("\n--- Test 2: Invalid Pattern ---")
try:
    Hardware(part_number="bolt123")
except ValidationError as e:
    print(e.errors()[0]["msg"])

```

Run it:

```bash
python lab_field.py

```

Output:

```text
--- Test 1: Valid ---
Hardware(part_number='BOL123')

--- Test 2: Invalid Pattern ---
String should match pattern '^[A-Z]{3}\d{3}$'

```

*What this proves:* Pydantic's `Field` function attaches metadata to the type hint. The runtime engine reads this metadata to apply complex rules—like Regular Expressions (Regex)—before allowing the object to instantiate.

### Discard the throwaway example

Delete `lab_field.py`. We will now create the SKU schema for our project.

### Project Change

We will add a new `SKUCreate` model to our schemas file, heavily constraining the product data.

* **Files affected:** `nexus/schemas.py`.
* **Change type:** Add.
* **Location:** At the bottom of the file, after `LocationCreate`.

### The New Code

```python
from pydantic import Field

class SKUCreate(BaseModel):
    sku_id: str = Field(min_length=3, max_length=20, pattern=r"^[A-Z0-9\-]+$")
    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)

```

### The Updated Project

Here is the fully reconstructed `nexus/schemas.py` showing both models and the new import.

```python
from pydantic import BaseModel, Field

class LocationCreate(BaseModel):
    name: str
    region: str
    parent_id: int | None = None

# ← new: The SKU schema with constrained fields
class SKUCreate(BaseModel):
    sku_id: str = Field(min_length=3, max_length=20, pattern=r"^[A-Z0-9\-]+$")
    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)

```

The `SKUCreate` model now ensures that any product identifier is strict uppercase, numbers, and hyphens, preventing messy inputs from reaching the database.

### Mechanical walkthrough

1. `from pydantic import Field`: (First appearance). Imports the `Field` function.
2. `sku_id: str`: (Already established syntax). The type hint.
3. `= Field(...)`: (First appearance). Assigns the result of the `Field` function as the default value of the attribute. Pydantic intercepts this internally to attach validation rules.
4. `min_length=3, max_length=20`: (First appearance). Keyword arguments instructing Pydantic to reject the string if its length falls outside this bound.
5. `pattern=r"^[A-Z0-9\-]+$"`: (First appearance). Applies a Regular Expression. The `^` means start of string, `[A-Z0-9\-]+` means one or more uppercase letters, digits, or hyphens, and `$` means end of string. The `r` prefix in Python denotes a "raw string," preventing Python from misinterpreting escape characters like `\`.
6. `description: str | None = Field(default=None, max_length=500)`: (First appearance). Combines a default value (`default=None`) with a validation constraint (`max_length=500`). We must use `default=` inside `Field` because we have already occupied the assignment operator `=` with the `Field` call itself.

### CS Lens

**Fail-Fast Iteration.** By pushing constraints like string length into the schema boundary, the application "fails fast." If a user uploads a SKU with a 10,000-character name, the request is rejected immediately at the API gate. If we didn't do this, the massive string would be allocated in memory, passed through ORM layers, and only rejected when the SQLite engine finally realized the data was bad, wasting CPU cycles and memory.

### SE Lens

Why use `Field` max lengths instead of just setting `VARCHAR(100)` in the SQLite database? **Error Message Ergonomics.** If SQLite rejects a string for being too long, it throws a generic `IntegrityError` which is difficult to map back to a user-friendly API response (like "Your SKU name must be under 100 characters"). Pydantic generates precise, field-specific JSON error messages out of the box, saving you from writing custom exception-parsing logic.

### Commands needed to make this unit real

No new terminal commands; this is structural application code.

### One sentence connecting this unit to what came immediately before.

`Field` handles length and regex, but it cannot perform Python logic, like checking if a region code exists in a specific master list or automatically forcing a lowercase input to uppercase.

---

## Concept Unit: Programmatic Coercion with Validators

### The Problem

In `LocationCreate`, the `region` field is just a string. If a user inputs `"ne"` but our system standardizes on `"NE"`, `Field(pattern="^[A-Z]+$")` will just crash and reject the payload. Instead of punishing the user, we want to intercept `"ne"`, silently uppercase it to `"NE"`, check it against allowed regions, and then accept it.

### Introduce the concept in isolation

Create `lab_validator.py` to see Pydantic run custom Python logic during object creation.

```python
from pydantic import BaseModel, field_validator

class Payload(BaseModel):
    tag: str
    
    @field_validator("tag")
    @classmethod
    def strip_whitespace_and_upper(cls, v: str) -> str:
        print(f"Intercepted raw value: '{v}'")
        return v.strip().upper()

# Passing dirty data with spaces and lowercase
clean_payload = Payload(tag="   urgent   ")
print(f"Final object: {repr(clean_payload)}")

```

Run it:

```bash
python lab_validator.py

```

Output:

```text
Intercepted raw value: '   urgent   '
Final object: Payload(tag='URGENT')

```

*What this proves:* The `@field_validator` decorator hooks into the instantiation process. It catches the raw input (`v`), runs whatever Python code we write, and whatever we `return` becomes the final, permanent value in the object.

### Discard the throwaway example

Delete `lab_validator.py`. We will implement a region standardizer.

### Project Change

We will add a custom validator to the `LocationCreate` model to coerce the `region` code.

* **Files affected:** `nexus/schemas.py`.
* **Change type:** Modify.
* **Location:** Inside the `LocationCreate` class definition.

### The New Code

```python
from pydantic import field_validator

    @field_validator("region")
    @classmethod
    def standardize_region(cls, v: str) -> str:
        v_upper = v.strip().upper()
        allowed = {"NE", "NW", "SE", "SW", "WC"}
        if v_upper not in allowed:
            raise ValueError(f"Region must be one of {allowed}")
        return v_upper

```

### The Updated Project

Here is the `nexus/schemas.py` file with the validator integrated into the `LocationCreate` model.

```python
from pydantic import BaseModel, Field, field_validator

class LocationCreate(BaseModel):
    name: str
    region: str
    parent_id: int | None = None

    # ← new: Custom validator hooking into the "region" field
    @field_validator("region")
    @classmethod
    def standardize_region(cls, v: str) -> str:
        v_upper = v.strip().upper()
        allowed = {"NE", "NW", "SE", "SW", "WC"}
        if v_upper not in allowed:
            raise ValueError(f"Region must be one of {allowed}")
        return v_upper

class SKUCreate(BaseModel):
    sku_id: str = Field(min_length=3, max_length=20, pattern=r"^[A-Z0-9\-]+$")
    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)

```

The model now actively cleans up human error (whitespace, casing) and enforces a strict business rule constraint (the allowed set of regions) before the object is created.

### Mechanical walkthrough

1. `from pydantic import field_validator`: (First appearance). Imports the decorator required to define a validation hook.
2. `@field_validator("region")`: (First appearance). A Python decorator. It tells Pydantic: "When you are validating the `region` field, pause and pass the value through the function directly below this."
3. `@classmethod`: (First appearance). A built-in Python decorator. Pydantic validators must be class methods because they run *before* the object is actually fully instantiated. There is no `self` yet.
4. `def standardize_region(cls, v: str) -> str:`: (First appearance). The function definition. `cls` represents the `LocationCreate` class itself. `v` is the raw value intercepted from the input.
5. `v_upper = v.strip().upper()`: Standard Python string methods to remove leading/trailing spaces and convert to uppercase.
6. `allowed = {"NE", "NW", "SE", "SW", "WC"}`: (First appearance). Defines a Python Set containing our valid regions. Sets are optimized for fast `in` lookups.
7. `if v_upper not in allowed:`: Checks if the cleaned string is valid.
8. `raise ValueError(...)`: (First appearance). If the logic fails, we raise a standard Python error. Pydantic catches this `ValueError` internally and automatically converts it into a properly formatted `ValidationError` JSON response for the client.
9. `return v_upper`: The vital final step. Whatever is returned here permanently overwrites the original value in the model.

### CS Lens

**Data Sanitization vs. Validation.** Validation is passive: "Is this correct? Yes/No." Sanitization (or coercion) is active: "This is slightly wrong, but I can safely reformat it to be correct." Our `@field_validator` does both. It sanitizes the casing, and then it validates against the `allowed` set. Doing this at the system edge guarantees that the inner core of the application never has to deal with `.strip()` or `.lower()` edge cases.

### SE Lens

Why hardcode the `allowed` regions into the schema instead of looking them up in the database? **Boundary Purity.** Pydantic schemas should ideally be pure functions: data goes in, data comes out, with no side effects. If a validator makes a network call to the database to check if a region exists, the validation layer becomes coupled to the storage layer. If the database goes down, your validation logic crashes. We prefer to validate the *shape* in Pydantic, and validate the *relational existence* (Foreign Keys) in SQLAlchemy/SQLite.

### Commands needed to make this unit real

No commands needed; the schemas are ready.

### One sentence connecting this unit to what came immediately before.

With our schemas fully capable of rejecting bad shapes and coercing fuzzy strings, we are ready to build the bridge that translates these Pydantic objects into SQLAlchemy rows.

---

## Closing

**Connect the pieces**
Imagine the API receives a JSON payload: `{"name": "Aisle 4", "region": " ne ", "parent_id": 2}`. It is routed to `LocationCreate`. First, Pydantic checks `BaseModel` types: name is `str`, region is `str`, parent_id is `int`. Second, the `@field_validator` triggers on `" ne "`, stripping the spaces and uppercasing it to `"NE"`, then verifying `"NE"` is in the allowed set. The final, pure object `LocationCreate(name='Aisle 4', region='NE', parent_id=2)` is constructed. This precise object will eventually be handed directly to our SQLite engine, ensuring our `locations` table never stores dirty strings.

**What breaks without this**
Let's intentionally break our constraints. Open `nexus/schemas.py` and change the validator's return statement to `return None`.

```python
        if v_upper not in allowed:
            raise ValueError(f"Region must be one of {allowed}")
        return None # <-- Intentionally broken

```

If you instantiate `LocationCreate(name="X", region="NE")`, the validator will return `None`. But the `region` field is explicitly typed as `str`! Pydantic will actually crash with a *second* validation error immediately after the hook finishes, screaming that the validator returned `None` instead of a string. (Change it back to `return v_upper`).

**Exercises**

1. Create a `test.py` file and instantiate `SKUCreate(sku_id="bad sku", name="A")`. Look at the exact error message Pydantic throws.
2. Add a new `description` validator to `SKUCreate` that automatically capitalizes the first letter of the description if it is provided. (Hint: check if `v` is `None` first, then use `v.capitalize()`).

**Definition of Done**

* [x] Pydantic is installed.
* [x] `schemas.py` is created with `LocationCreate` and `SKUCreate` models.
* [x] Complex regex and length boundaries are enforced via `Field`.
* [x] Active data sanitization is hooked up via `@field_validator`.
* [x] You can commit these changes with the message: `feat: add strict pydantic schemas for locations and skus`.