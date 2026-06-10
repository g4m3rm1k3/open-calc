# DRILL 2.3 — The Repository Pattern In Practice
## LAB-01: From Coupled Code to Clean Architecture

**Estimated time:** 60–90 minutes
**Standalone:** Yes. No prior drills required.
**You will build:** A tiny contact book — first wrong, then right, then switched to a different backend without touching business logic.

---

## Quick Check

Answer these before you start. Check your answers at the bottom.

1. What is wrong with a service class that calls `sqlite3.connect()` directly?
2. What does "dependency injection" mean in plain English?
3. If you have 10 service classes and you switch from SQLite to Postgres, how many files change with the Repository pattern? Without it?
4. What is the Dependency Inversion Principle?

---

## The Concept Block

### What the Repository Pattern Is

Your app has two worlds:

**Business logic world:** "I want to save a contact. I want to find all contacts. I want to delete contact #5."

**Storage world:** "Open a connection. Write SQL. Handle the cursor. Close the connection. Deal with file paths."

Without the Repository pattern, these two worlds are tangled together. Your business logic knows that storage is SQLite. It imports `sqlite3`. It writes SQL strings. It handles cursors. If you ever want to swap to Postgres, you edit the same file that contains your business rules. If you ever want to test without a real database, you cannot — the database is baked in.

The Repository pattern draws a hard line between these worlds. The **interface** sits on that line. It says: "Here is what you can ask for. You may not care how it's done." The business logic only talks to the interface. The implementation — SQLite, Postgres, JSON, memory — lives behind the interface, completely isolated.

### The Interface Is a Contract

An interface (in Python, an abstract base class) says: "Any repository I accept must be able to do these things." The contract has no implementation. It is a promise.

```
ContactRepository (abstract)
  add(contact) → None
  get(id) → Contact | None
  get_all() → list[Contact]
  delete(id) → None
```

`SQLiteContactRepository` signs this contract. So does `JsonContactRepository`. So does `InMemoryContactRepository`. They are all interchangeable from the caller's perspective.

### Dependency Injection

The service does not create its own repository. It receives one. This is dependency injection — instead of hardcoding a dependency, you inject it from outside.

Without dependency injection:
```python
class ContactService:
    def __init__(self):
        self.repo = SQLiteContactRepository("contacts.db")  # HARDCODED
```

With dependency injection:
```python
class ContactService:
    def __init__(self, repo: ContactRepository):  # RECEIVED
        self.repo = repo
```

The second version is testable. You can pass any object that fulfills the contract. You can pass a fake. You can pass a different database. The service never knows the difference.

### The Dependency Inversion Principle

The D in SOLID. High-level modules (business logic) should not depend on low-level modules (SQLite). Both should depend on abstractions (the interface). The interface is owned by the business logic layer — the storage layer plugs into it, not the other way around.

### Constraints

- The abstract class must define the full contract. If a method is missing from an implementation, the error surfaces at instantiation, not at runtime when the method is called.
- The domain model (`Contact`) must not contain any storage details. No SQL. No file paths. No database IDs leaking into business fields.
- Every implementation must be fully substitutable — any method that works with `ContactRepository` must work identically with any concrete implementation.

### Failure Modes

- **Leaking storage details upward:** Returning a SQLAlchemy `Row` object from the repository instead of a proper `Contact` dataclass. Now your service code has to know how to handle database rows. The abstraction broke.
- **Too many methods on the interface:** If the interface has 30 methods, every test implementation must stub 30 methods. Keep interfaces small — the "Interface Segregation Principle."
- **The repository does business logic:** The repository's only job is storage. It should not validate that a contact's email is unique across a tenant, or calculate derived fields. That belongs in the service.
- **Injecting the wrong thing:** Passing a `SQLiteContactRepository` to code that expects a `JsonContactRepository` specifically. This happens when you type-hint the concrete class instead of the abstract interface. Always type-hint the interface.

### Operational Reality

In production systems, you will see this pattern everywhere:

- **Django:** The ORM's `Manager` class is a repository. `Contact.objects.filter(...)` is the interface.
- **Spring (Java):** `JpaRepository<Contact, Long>` is a generated repository interface.
- **FastAPI projects:** A `UserRepository` injected via `Depends(get_repository)`.
- **Testing:** `pytest` fixtures that inject an `InMemoryRepository` — no database spin-up, tests run in milliseconds.

The pattern appears in Domain-Driven Design as one of the core tactical patterns. Eric Evans calls the repository "a collection of domain objects." You ask for a contact the same way you'd ask a list for an item — the mechanics of retrieval are hidden.

### You Will See This Again In

- LAB-03 of this drill series (data access layers in FastAPI)
- Any project where you write tests that need to run fast
- Every serious Python backend: SQLAlchemy sessions wrapped in repositories, dependency injection via FastAPI's `Depends`
- The cadcam-tauri series when the Rust backend gets a storage layer
- Any interview question about SOLID principles or "how would you make this testable"

---

## Setup

```
drills/2-data-storage/2.3-repository-pattern/
  contacts_coupled.py      ← Step 1: the wrong version
  contact.py               ← Step 2: the domain model
  repository.py            ← Step 3: the abstract interface
  sqlite_repo.py           ← Step 4: SQLite implementation
  json_repo.py             ← Step 5: JSON implementation
  service.py               ← Step 6: business logic (clean)
  main.py                  ← Step 7: wiring it all together
```

Create the folder if it doesn't exist. All files go in the same directory for this drill.

---

## Step 1 — The Coupled Version (The Wrong Way, On Purpose)

First, see the problem. Build a version where the service does everything wrong. Read the coupling carefully. You will fix all of it.

Create `contacts_coupled.py`:

```python
# contacts_coupled.py
# THE WRONG VERSION — study this, then we fix it.
#
# The problem: ContactService knows too much.
# It knows we're using SQLite. It knows the file is named "contacts.db".
# It knows how to create tables, how to write SQL, how to handle cursors.
# Business logic and storage are fused together.

import sqlite3


class ContactService:
    """
    This service class is doing TWO jobs at once:
    1. Business logic (what the app wants to do with contacts)
    2. Storage logic (how contacts are saved to SQLite)
    
    This is the coupling we need to break.
    """

    def __init__(self):
        # PROBLEM: This class decides it's using SQLite, forever.
        # There is no way to test this without a real database file.
        # There is no way to swap to a different storage backend.
        self.conn = sqlite3.connect("contacts.db")
        self._setup()

    def _setup(self):
        # PROBLEM: Schema creation lives inside the business logic class.
        # Why should a ContactService know about SQL CREATE TABLE statements?
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL
            )
        """)
        self.conn.commit()

    def add_contact(self, name: str, email: str):
        # PROBLEM: SQL strings are embedded directly in business logic.
        # If the table name changes, you edit this file.
        # If you switch to Postgres, you edit this file.
        self.conn.execute(
            "INSERT INTO contacts (name, email) VALUES (?, ?)",
            (name, email)
        )
        self.conn.commit()
        print(f"Added contact: {name}")

    def get_all_contacts(self):
        # PROBLEM: Returns raw SQLite Row objects.
        # Callers have to know the Row API — they're coupled to SQLite too.
        cursor = self.conn.execute("SELECT id, name, email FROM contacts")
        return cursor.fetchall()

    def delete_contact(self, contact_id: int):
        self.conn.execute("DELETE FROM contacts WHERE id = ?", (contact_id,))
        self.conn.commit()
        print(f"Deleted contact #{contact_id}")


# --- Usage ---
if __name__ == "__main__":
    service = ContactService()
    service.add_contact("Alice", "alice@example.com")
    service.add_contact("Bob", "bob@example.com")

    contacts = service.get_all_contacts()
    for row in contacts:
        # PROBLEM: Callers use index notation on database rows.
        # row[0] is the id. row[1] is the name. row[2] is the email.
        # This breaks if the column order changes. No IDE autocomplete.
        print(f"  [{row[0]}] {row[1]} — {row[2]}")

    service.delete_contact(1)
```

### SAVE AND TRY

Run it:
```
python contacts_coupled.py
```

Expected output:
```
Added contact: Alice
Added contact: Bob
  [1] Alice — alice@example.com
  [2] Bob — bob@example.com
Deleted contact #1
```

A file `contacts.db` now exists in your directory.

**Now try to break it:**

Ask yourself: "How would I test `add_contact` without creating `contacts.db`?" The answer is: you cannot. The constructor calls `sqlite3.connect("contacts.db")` — the file is created the moment you instantiate the class.

Ask yourself: "How would I swap to a JSON file?" You would have to rewrite the entire class. Every SQL statement is your problem.

Ask yourself: "What does `get_all_contacts` return?" SQLite Row tuples. Not a Python object you defined. Not something with `.name` and `.email`. Index-based access, forever coupled to column order.

These are the problems the Repository pattern solves. Delete `contacts.db` before continuing.

```
del contacts.db
```

---

## Step 2 — The Domain Model

The domain model is the pure Python representation of a contact. No SQL. No files. Just the concept.

Create `contact.py`:

```python
# contact.py
# The domain model — what a Contact IS, not where it's stored.
#
# A dataclass is perfect here: it's a plain data container with no behavior
# beyond holding values. No SQL. No file paths. No database IDs in the
# business sense — id is Optional because a contact that hasn't been saved
# yet doesn't have one.

from dataclasses import dataclass
from typing import Optional


@dataclass
class Contact:
    """
    A contact in the system.
    
    This class has no knowledge of how it's stored.
    The same Contact object works whether it came from SQLite, a JSON file,
    or an in-memory dict. That's the point.
    """
    name: str
    email: str
    # id is None for a contact that hasn't been persisted yet.
    # After saving, the repository fills it in.
    id: Optional[int] = None

    def __str__(self) -> str:
        prefix = f"[{self.id}] " if self.id is not None else "[unsaved] "
        return f"{prefix}{self.name} — {self.email}"
```

### SAVE AND TRY

Test the model in isolation:
```
python -c "from contact import Contact; c = Contact('Alice', 'alice@example.com'); print(c)"
```

Expected output:
```
[unsaved] Alice — alice@example.com
```

Notice: no database, no file, no connection. A `Contact` is just a Python object. This is what "domain model" means — pure concept, no storage concerns.

**Change something:** Add `id=5` to the constructor call and rerun. The output changes to `[5] Alice — alice@example.com`. The model knows how to represent itself; it doesn't know where it lives.

---

## Step 3 — The Abstract Interface (The Contract)

This is the most important step. The interface is where the two worlds are formally separated.

Create `repository.py`:

```python
# repository.py
# The Repository interface — the contract between business logic and storage.
#
# abc = Abstract Base Classes. Python's built-in way to define interfaces.
# An abstract class cannot be instantiated directly. Any class that inherits
# from it MUST implement all abstractmethods — Python enforces this.
#
# Key insight: this file has ZERO imports of SQLite, JSON, or any storage tech.
# It only imports the domain model. It lives entirely in business logic land.

from abc import ABC, abstractmethod
from typing import Optional
from contact import Contact


class ContactRepository(ABC):
    """
    The contract that every storage backend must fulfill.
    
    Business logic imports THIS class — never SQLite, never JSON.
    Storage backends implement THIS class — they sign the contract.
    
    This is the seam. Cut here, and the two worlds come apart cleanly.
    """

    @abstractmethod
    def add(self, contact: Contact) -> Contact:
        """
        Persist a new contact. Returns the contact with its id filled in.
        
        Why return Contact instead of None?
        The caller needs to know the assigned id. The repository created it
        (auto-increment, UUID, whatever the backend uses). Returning the
        updated contact is how the business layer learns the id without
        knowing how ids are generated.
        """
        ...

    @abstractmethod
    def get(self, contact_id: int) -> Optional[Contact]:
        """
        Retrieve a single contact by id. Returns None if not found.
        
        Why Optional instead of raising an exception?
        "Not found" is a normal case, not an error. The caller decides
        what to do — raise an error, return a default, prompt the user.
        That decision belongs in business logic, not in the repository.
        """
        ...

    @abstractmethod
    def get_all(self) -> list[Contact]:
        """
        Retrieve all contacts. Returns an empty list if none exist.
        Never returns None — callers shouldn't have to guard against that.
        """
        ...

    @abstractmethod
    def delete(self, contact_id: int) -> bool:
        """
        Delete a contact by id. Returns True if deleted, False if not found.
        
        Why bool? The caller may want to know if the delete actually happened.
        "Delete a contact that doesn't exist" is different from "delete succeeded."
        """
        ...
```

### SAVE AND TRY

Try to instantiate the abstract class directly:
```
python -c "from repository import ContactRepository; r = ContactRepository()"
```

Expected output:
```
TypeError: Can't instantiate abstract class ContactRepository without an implementation for abstract methods 'add', 'delete', 'get', 'get_all'
```

This is the contract enforcing itself. Python refuses to let you use `ContactRepository` without implementing every method. This error happens at instantiation time — you find out immediately, not when you call the missing method at runtime.

---

## Step 4 — The SQLite Implementation

Now build the first concrete implementation. All SQLite code lives here and only here.

Create `sqlite_repo.py`:

```python
# sqlite_repo.py
# SQLite implementation of ContactRepository.
#
# This class is allowed to know about SQLite. That is its entire job.
# All SQL strings live here. All cursor handling lives here.
# No other file in the project needs to think about SQLite.

import sqlite3
from typing import Optional
from contact import Contact
from repository import ContactRepository


class SQLiteContactRepository(ContactRepository):
    """
    Stores contacts in a SQLite database file.
    
    Signs the ContactRepository contract — implements every abstract method.
    Python will refuse to instantiate this class if any method is missing.
    """

    def __init__(self, db_path: str = "contacts.db"):
        # The path is injected — no hardcoded filename.
        # Tests can pass ":memory:" for an in-RAM database that vanishes
        # when the connection closes. Production passes a real path.
        self.conn = sqlite3.connect(db_path)
        # Row factory: makes rows behave like dicts instead of tuples.
        # row["name"] instead of row[1]. Safer, clearer.
        self.conn.row_factory = sqlite3.Row
        self._setup()

    def _setup(self):
        # Schema creation belongs here — it's a storage concern.
        # The service never sees this.
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS contacts (
                id    INTEGER PRIMARY KEY AUTOINCREMENT,
                name  TEXT NOT NULL,
                email TEXT NOT NULL
            )
        """)
        self.conn.commit()

    def add(self, contact: Contact) -> Contact:
        cursor = self.conn.execute(
            "INSERT INTO contacts (name, email) VALUES (?, ?)",
            (contact.name, contact.email)
        )
        self.conn.commit()
        # Fill in the id that SQLite assigned (autoincrement).
        # The service doesn't know how ids are generated — it just gets one.
        contact.id = cursor.lastrowid
        return contact

    def get(self, contact_id: int) -> Optional[Contact]:
        cursor = self.conn.execute(
            "SELECT id, name, email FROM contacts WHERE id = ?",
            (contact_id,)
        )
        row = cursor.fetchone()
        if row is None:
            return None
        # Convert the database row into a domain object.
        # This translation is the repository's core job: raw storage → clean model.
        return Contact(id=row["id"], name=row["name"], email=row["email"])

    def get_all(self) -> list[Contact]:
        cursor = self.conn.execute("SELECT id, name, email FROM contacts")
        # List comprehension: translate every row into a Contact.
        # The caller gets a list of Contact objects. No SQL rows escape.
        return [
            Contact(id=row["id"], name=row["name"], email=row["email"])
            for row in cursor.fetchall()
        ]

    def delete(self, contact_id: int) -> bool:
        cursor = self.conn.execute(
            "DELETE FROM contacts WHERE id = ?",
            (contact_id,)
        )
        self.conn.commit()
        # rowcount is 0 if nothing was deleted (id didn't exist).
        # rowcount is 1 if the delete succeeded.
        return cursor.rowcount > 0

    def close(self):
        # Explicit cleanup. In production, use a context manager or
        # connection pooling. For this drill, explicit close is fine.
        self.conn.close()
```

### SAVE AND TRY

Test the SQLite repository in isolation — without any service:
```python
# Run this as a quick manual test — paste into python interpreter or save as test_sqlite.py
from contact import Contact
from sqlite_repo import SQLiteContactRepository

repo = SQLiteContactRepository(":memory:")  # in-memory — no file created

c1 = repo.add(Contact("Alice", "alice@example.com"))
c2 = repo.add(Contact("Bob", "bob@example.com"))

print(c1)       # [1] Alice — alice@example.com
print(c2)       # [2] Bob — bob@example.com

found = repo.get(1)
print(found)    # [1] Alice — alice@example.com

all_contacts = repo.get_all()
print(len(all_contacts))  # 2

deleted = repo.delete(1)
print(deleted)            # True

deleted_again = repo.delete(1)
print(deleted_again)      # False — already gone

print(len(repo.get_all()))  # 1
```

Save as `test_sqlite_repo.py` and run:
```
python test_sqlite_repo.py
```

Expected output:
```
[1] Alice — alice@example.com
[2] Bob — bob@example.com
[1] Alice — alice@example.com
2
True
False
1
```

**Notice:** `:memory:` as the db_path — SQLite's special path for an in-RAM database. No file. Clean up is automatic when the connection closes. This is the first hint that even the SQLite repository can be used in tests without file system side effects.

---

## Step 5 — The Service (Clean Business Logic)

Now build the service. It imports `ContactRepository` — the abstract interface. It never mentions SQLite.

Create `service.py`:

```python
# service.py
# Business logic for the contact book.
#
# This file contains ZERO storage code. No sqlite3. No open(). No json.
# It only knows about Contact objects and the ContactRepository interface.
# This is what "clean architecture" looks like in practice.

from contact import Contact
from repository import ContactRepository  # the INTERFACE, not any implementation


class ContactService:
    """
    All business rules for the contact book.
    
    The repository is injected — this class does not create it.
    Whoever creates a ContactService decides which backend to use.
    The service doesn't care and doesn't know.
    """

    def __init__(self, repo: ContactRepository):
        # Type hint is the ABSTRACT class, not any concrete implementation.
        # This is the signal: "I accept anything that fulfills this contract."
        self.repo = repo

    def add_contact(self, name: str, email: str) -> Contact:
        """
        Add a new contact after validating input.
        
        Validation is business logic — it lives here.
        How to save is storage logic — it lives in the repository.
        """
        # Business rule: names cannot be empty.
        # This rule has nothing to do with storage — it lives here.
        name = name.strip()
        if not name:
            raise ValueError("Contact name cannot be empty.")

        email = email.strip()
        if "@" not in email:
            raise ValueError(f"Invalid email address: {email!r}")

        # Build the domain object. No id yet — the repository will assign it.
        contact = Contact(name=name, email=email)
        # Delegate persistence to whatever repository was injected.
        saved = self.repo.add(contact)
        print(f"Added: {saved}")
        return saved

    def list_contacts(self) -> list[Contact]:
        """Return all contacts, sorted by name."""
        contacts = self.repo.get_all()
        # Sorting is business logic — where contacts are sorted doesn't matter.
        return sorted(contacts, key=lambda c: c.name.lower())

    def find_contact(self, contact_id: int) -> Contact:
        """
        Find a contact by id. Raises if not found.
        
        The repository returns None for "not found."
        The service converts that into a raised exception — a business decision.
        Callers of the service get a clear error, not a None they might forget to check.
        """
        contact = self.repo.get(contact_id)
        if contact is None:
            raise KeyError(f"No contact with id {contact_id}.")
        return contact

    def remove_contact(self, contact_id: int) -> None:
        """Remove a contact. Raises if the contact doesn't exist."""
        # First verify the contact exists — business rule.
        self.find_contact(contact_id)  # raises KeyError if missing
        deleted = self.repo.delete(contact_id)
        if deleted:
            print(f"Removed contact #{contact_id}.")

    def print_all(self) -> None:
        """Display all contacts — a utility method for demo purposes."""
        contacts = self.list_contacts()
        if not contacts:
            print("  (no contacts)")
            return
        for contact in contacts:
            print(f"  {contact}")
```

### SAVE AND TRY

Wire the service to the SQLite repository:
```
python -c "
from sqlite_repo import SQLiteContactRepository
from service import ContactService

repo = SQLiteContactRepository(':memory:')
svc = ContactService(repo)

svc.add_contact('Alice', 'alice@example.com')
svc.add_contact('Bob', 'bob@example.com')
svc.add_contact('Zara', 'zara@example.com')
svc.print_all()
"
```

Expected output:
```
Added: [1] Alice — alice@example.com
Added: [2] Bob — bob@example.com
Added: [3] Zara — zara@example.com
  [1] Alice — alice@example.com
  [2] Bob — bob@example.com
  [3] Zara — zara@example.com
```

Test validation — try adding a contact with bad data:
```
python -c "
from sqlite_repo import SQLiteContactRepository
from service import ContactService

repo = SQLiteContactRepository(':memory:')
svc = ContactService(repo)

try:
    svc.add_contact('', 'alice@example.com')
except ValueError as e:
    print(f'Caught: {e}')

try:
    svc.add_contact('Bob', 'not-an-email')
except ValueError as e:
    print(f'Caught: {e}')
"
```

Expected output:
```
Caught: Contact name cannot be empty.
Caught: Invalid email address: 'not-an-email'
```

---

## Step 6 — The JSON Implementation

Same interface. Different backend. The service code will not change at all.

Create `json_repo.py`:

```python
# json_repo.py
# JSON file implementation of ContactRepository.
#
# Entirely different storage mechanism — no SQL, no SQLite.
# From the service's perspective, this is IDENTICAL to SQLiteContactRepository.
# That's the entire point.

import json
from pathlib import Path
from typing import Optional
from contact import Contact
from repository import ContactRepository


class JsonContactRepository(ContactRepository):
    """
    Stores contacts as a JSON file.
    
    The file format is:
    {
        "next_id": 3,
        "contacts": {
            "1": {"id": 1, "name": "Alice", "email": "alice@example.com"},
            "2": {"id": 2, "name": "Bob", "email": "bob@example.com"}
        }
    }
    
    We manage our own id counter because JSON has no AUTOINCREMENT.
    SQLite did that for free. Here we do it ourselves.
    This is an implementation detail — the service never sees it.
    """

    def __init__(self, file_path: str = "contacts.json"):
        self.file_path = Path(file_path)
        # Load existing data or start fresh.
        self._data = self._load()

    def _load(self) -> dict:
        """Read the JSON file, or return a fresh empty structure."""
        if self.file_path.exists():
            with open(self.file_path, "r") as f:
                return json.load(f)
        # First run — nothing exists yet.
        return {"next_id": 1, "contacts": {}}

    def _save(self) -> None:
        """Write the current state to disk."""
        with open(self.file_path, "w") as f:
            # indent=2: human-readable. Easy to inspect with a text editor.
            json.dump(self._data, f, indent=2)

    def add(self, contact: Contact) -> Contact:
        # Assign our own id — we track next_id in the JSON file.
        new_id = self._data["next_id"]
        self._data["next_id"] += 1

        # Store as a dict in the JSON structure.
        # Key is a string because JSON keys must be strings.
        self._data["contacts"][str(new_id)] = {
            "id": new_id,
            "name": contact.name,
            "email": contact.email,
        }
        self._save()

        # Return the contact with its newly assigned id.
        contact.id = new_id
        return contact

    def get(self, contact_id: int) -> Optional[Contact]:
        # JSON keys are strings — convert the int id for lookup.
        data = self._data["contacts"].get(str(contact_id))
        if data is None:
            return None
        # Translate from dict to domain object — same as SQLite repo's job.
        return Contact(id=data["id"], name=data["name"], email=data["email"])

    def get_all(self) -> list[Contact]:
        return [
            Contact(id=d["id"], name=d["name"], email=d["email"])
            for d in self._data["contacts"].values()
        ]

    def delete(self, contact_id: int) -> bool:
        key = str(contact_id)
        if key not in self._data["contacts"]:
            return False
        del self._data["contacts"][key]
        self._save()
        return True
```

---

## Step 7 — The Swap

Now swap the backend. The service code does not change.

Create `main.py`:

```python
# main.py
# Wiring: choose a backend, inject it, run.
#
# This file is the only place that knows which backend is in use.
# Everything else is ignorant of the choice made here.

from sqlite_repo import SQLiteContactRepository
from json_repo import JsonContactRepository
from service import ContactService


def demo(service: ContactService, label: str) -> None:
    """Run the same operations against whatever backend is injected."""
    print(f"\n{'='*50}")
    print(f"  Backend: {label}")
    print(f"{'='*50}")

    service.add_contact("Alice", "alice@example.com")
    service.add_contact("Charlie", "charlie@example.com")
    service.add_contact("Bob", "bob@example.com")

    print("\nAll contacts (sorted by name):")
    service.print_all()

    print("\nFinding contact #1:")
    found = service.find_contact(1)
    print(f"  Found: {found}")

    print("\nRemoving contact #2:")
    service.remove_contact(2)

    print("\nAfter removal:")
    service.print_all()


# --- SQLite backend ---
sqlite_repo = SQLiteContactRepository(":memory:")
sqlite_service = ContactService(sqlite_repo)  # inject SQLite
demo(sqlite_service, "SQLite (in-memory)")

# --- JSON backend ---
# NOTICE: ContactService is instantiated identically.
# The ONLY difference is what repository is passed in.
# Every line of service.py is completely unchanged.
json_repo = JsonContactRepository("contacts_demo.json")
json_service = ContactService(json_repo)       # inject JSON
demo(json_service, "JSON file")

# Clean up the demo JSON file
import os
if os.path.exists("contacts_demo.json"):
    os.remove("contacts_demo.json")
```

### SAVE AND TRY

```
python main.py
```

Expected output:
```
==================================================
  Backend: SQLite (in-memory)
==================================================
Added: [1] Alice — alice@example.com
Added: [2] Charlie — charlie@example.com
Added: [3] Bob — bob@example.com

All contacts (sorted by name):
  [1] Alice — alice@example.com
  [3] Bob — bob@example.com
  [2] Charlie — charlie@example.com

Finding contact #1:
  Found: [1] Alice — alice@example.com

Removing contact #2:
  Removed contact #2.

After removal:
  [1] Alice — alice@example.com
  [3] Bob — bob@example.com

==================================================
  Backend: JSON file
==================================================
Added: [1] Alice — alice@example.com
Added: [2] Charlie — charlie@example.com
Added: [3] Bob — bob@example.com

All contacts (sorted by name):
  [1] Alice — alice@example.com
  [3] Bob — bob@example.com
  [2] Charlie — charlie@example.com

Finding contact #1:
  Found: [1] Alice — alice@example.com

Removing contact #2:
  Removed contact #2.

After removal:
  [1] Alice — alice@example.com
  [3] Bob — bob@example.com
```

Both backends produce identical behavior. The service code (`service.py`) was not touched. The business logic doesn't know or care which backend ran.

**Change something:** Open `main.py` and swap the backend for the second demo:
```python
# Try passing the SQLite repo to the second demo instead
demo(ContactService(SQLiteContactRepository(":memory:")), "SQLite again")
```

It still works. The backend is a runtime decision — you could read it from a config file or environment variable and swap without changing a single line of business logic.

---

## What You Just Built

| File | What it contains | Knows about storage? |
|------|-----------------|---------------------|
| `contact.py` | Domain model | No |
| `repository.py` | Contract / interface | No (only domain model) |
| `service.py` | Business logic | No |
| `sqlite_repo.py` | SQLite implementation | Yes — only here |
| `json_repo.py` | JSON implementation | Yes — only here |
| `main.py` | Wiring / composition root | Yes — makes the choice once |

The architecture has a clear seam. Cut at the interface. Everything above is independent of everything below.

---

## Challenge

Add an `InMemoryContactRepository` that stores contacts in a Python dict — no files, no SQLite. Then write tests for `ContactService` using only this in-memory backend.

**Requirements:**
- `InMemoryContactRepository` must fully implement `ContactRepository`
- Must store contacts in a plain Python dict (`dict[int, Contact]`)
- Must manage its own id counter (start at 1)
- Must pass ALL of the following test cases without any database file or SQLite

**Starter — `in_memory_repo.py`:**
```python
from typing import Optional
from contact import Contact
from repository import ContactRepository


class InMemoryContactRepository(ContactRepository):
    def __init__(self):
        self._store: dict[int, Contact] = {}
        self._next_id: int = 1

    def add(self, contact: Contact) -> Contact:
        # Your code here
        ...

    def get(self, contact_id: int) -> Optional[Contact]:
        # Your code here
        ...

    def get_all(self) -> list[Contact]:
        # Your code here
        ...

    def delete(self, contact_id: int) -> bool:
        # Your code here
        ...
```

**Test cases to make pass — `test_service.py`:**
```python
# Every test creates a fresh InMemoryContactRepository.
# No setup. No teardown. No files. No database connections.

import pytest
from in_memory_repo import InMemoryContactRepository
from service import ContactService


def make_service():
    """Fresh service with empty in-memory storage."""
    return ContactService(InMemoryContactRepository())


def test_add_contact_returns_contact_with_id():
    svc = make_service()
    contact = svc.add_contact("Alice", "alice@example.com")
    assert contact.id is not None
    assert contact.name == "Alice"
    assert contact.email == "alice@example.com"


def test_list_contacts_sorted_by_name():
    svc = make_service()
    svc.add_contact("Zara", "z@example.com")
    svc.add_contact("Alice", "a@example.com")
    svc.add_contact("Bob", "b@example.com")
    contacts = svc.list_contacts()
    names = [c.name for c in contacts]
    assert names == ["Alice", "Bob", "Zara"]


def test_find_contact_raises_for_missing_id():
    svc = make_service()
    with pytest.raises(KeyError):
        svc.find_contact(999)


def test_remove_contact_raises_for_missing_id():
    svc = make_service()
    with pytest.raises(KeyError):
        svc.remove_contact(999)


def test_add_contact_rejects_empty_name():
    svc = make_service()
    with pytest.raises(ValueError):
        svc.add_contact("", "alice@example.com")


def test_add_contact_rejects_invalid_email():
    svc = make_service()
    with pytest.raises(ValueError):
        svc.add_contact("Alice", "not-an-email")


def test_remove_contact_removes_it():
    svc = make_service()
    contact = svc.add_contact("Alice", "alice@example.com")
    svc.remove_contact(contact.id)
    with pytest.raises(KeyError):
        svc.find_contact(contact.id)


def test_multiple_contacts_get_unique_ids():
    svc = make_service()
    c1 = svc.add_contact("Alice", "a@example.com")
    c2 = svc.add_contact("Bob", "b@example.com")
    c3 = svc.add_contact("Charlie", "c@example.com")
    ids = {c1.id, c2.id, c3.id}
    assert len(ids) == 3  # all unique
```

**When done:**
- Run `pytest test_service.py -v` — all 8 tests should pass
- Run `pytest test_service.py --tb=short` — no tracebacks means all green
- Each test should complete in under 10ms — run `pytest test_service.py -v --durations=10`
- Verify: none of the test output mentions SQLite, JSON, or any file path

**Stuck? Ask AI:**
> "My InMemoryContactRepository.add() isn't returning a Contact with the id filled in. The test `test_add_contact_returns_contact_with_id` fails. Here's my implementation: [paste code]. What am I missing?"

---

## Quick Check Answers

1. **What is wrong with a service class that calls `sqlite3.connect()` directly?**
   The business logic is coupled to the storage technology. You cannot test it without a real database. You cannot swap storage backends without editing the business logic file. The two concerns — what the app does and how data is stored — are fused, making each harder to change independently.

2. **What does "dependency injection" mean in plain English?**
   Instead of a class creating the things it needs, those things are passed in from outside. The class declares "I need a repository" but doesn't decide which one. The caller decides and passes it in. This separates "what I need" from "where I get it."

3. **If you have 10 service classes and you switch from SQLite to Postgres, how many files change with the Repository pattern? Without it?**
   With the pattern: 1 file — you create a `PostgresContactRepository` and change the wiring in `main.py`. The 10 service files are untouched. Without it: potentially all 10 files, plus anywhere else that calls `sqlite3.connect()` directly.

4. **What is the Dependency Inversion Principle?**
   High-level modules (business logic) should not depend on low-level modules (SQLite, JSON). Both should depend on abstractions (the interface). Concretely: `ContactService` depends on `ContactRepository` (abstract). `SQLiteContactRepository` also depends on `ContactRepository` (it implements it). Neither depends on the other directly.
