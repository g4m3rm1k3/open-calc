# DRILL 7.1 — Layered Architecture From Scratch
## LAB-01: From Big Ball of Mud to Four Clean Layers

**Estimated time:** 75–105 minutes
**Standalone:** Yes. No prior drills required.
**You will build:** A tiny expense tracker — first as one tangled file, then refactored into Presentation, Application, Domain, and Infrastructure layers, each step revealing what the separation enables.

---

## Quick Check

Answer these before you start. Check your answers at the bottom.

1. What is the "dependency rule" in layered architecture — which direction are dependencies allowed to flow?
2. Why should the domain layer never import from the infrastructure layer?
3. What would break first if you tried to test your business logic while it lives in a Flask route?
4. If you change your database from SQLite to Postgres, which layers should change and which should not?

---

## The Concept Block

### What Layered Architecture Is

Every non-trivial application does three fundamentally different kinds of work:

**Presentation:** Receive a request (HTTP, CLI, GUI click). Format and return a response. This layer knows about HTTP status codes, JSON serialization, HTML templates. It knows nothing about your business.

**Application:** Orchestrate a use case — "add an expense," "get this month's total." This layer knows what steps happen in what order. It delegates to domain objects and repositories. It knows nothing about HTTP or SQL.

**Domain:** Express the business rules in pure Python. An `Expense` is valid if the amount is positive. The total for a category is the sum of all matching expenses. This layer knows nothing about databases, frameworks, or HTTP. It is the most important layer. It changes only when the business rules change.

**Infrastructure:** Implement the technical details — SQLite queries, HTTP clients, file I/O, email sending. This layer knows everything about the technology and nothing about the business.

### The Dependency Rule

The single rule that makes layered architecture work:

```
Presentation  →  Application  →  Domain
                 Infrastructure →  Domain
```

Each layer may only import from layers closer to the domain. The domain imports nothing from the other layers. Infrastructure imports from domain but nothing else imports from infrastructure except application.

Visually, dependencies point inward — toward the domain:

```
┌──────────────────────────────┐
│  Presentation (Flask routes) │
│  ┌────────────────────────┐  │
│  │  Application (Service) │  │
│  │  ┌──────────────────┐  │  │
│  │  │  Domain (pure)   │  │  │
│  │  └──────────────────┘  │  │
│  │  Infrastructure (SQL)  │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
         dependencies →
         point inward  →
```

### Why This Matters

**Testability:** The domain layer has no external dependencies. You can import it and run tests without starting a server, without a database, without network access. Tests are millisecond-fast and never flaky due to infrastructure.

**Replaceability:** The infrastructure layer can be swapped — SQLite to Postgres, JSON file to Redis — without touching a single line of domain or application logic. The swap is contained.

**Readability:** New developers can understand the business rules by reading only `domain/`. No Flask, no SQL, no noise. The rules are stated plainly.

### Constraints

- The domain layer must have zero imports of Flask, SQLAlchemy, sqlite3, requests, or any external library. Only stdlib types and your own domain classes.
- Infrastructure must not contain business logic — no validation, no calculations, no if-statements that express a rule.
- Application orchestrates; it does not decide. It calls domain objects to make decisions and repositories to persist results.
- The presentation layer must not calculate anything. It formats what it receives.

### Failure Modes

- **Domain reaches up to infrastructure:** You add `import sqlite3` to `expense.py` to check for duplicate expenses. Now you cannot test `Expense` without a database. The most common violation, always in a hurry.
- **Fat routes:** All logic stays in Flask routes "just for now." The route validates, calculates, queries, and formats. It never gets refactored. This is the big ball of mud — every file eventually looks like this.
- **Infrastructure leaks upward:** The repository returns a `sqlite3.Row` instead of an `Expense` dataclass. Now the application layer needs to know about SQLite rows. The boundary broke.
- **Application bypasses domain:** The service recalculates a total with inline arithmetic instead of calling `ExpenseCalculator`. Business logic is now split across two layers. When the rule changes you edit two places.

### Operational Reality

This is not a theoretical pattern. Every serious production codebase uses some form of this:

- **Django:** `models.py` is domain + infrastructure (mixed, which is why Django apps get tangled). Views are presentation. Forms are application-layer validation. The cleanest Django apps pull business logic out of models into a `services/` directory.
- **Spring Boot (Java):** `@Controller` → `@Service` → `@Repository` is literally this four-layer model, enforced by annotations.
- **FastAPI projects:** `routers/` → `services/` → `repositories/` → domain classes. You will write exactly this in the cadcam backend.
- **Clean Architecture and Hexagonal Architecture** are refinements of this principle with more formal naming (Entities, Use Cases, Interface Adapters, Frameworks & Drivers). Same idea.

### You Will See This Again In

- Every FastAPI lab in this series — the layer names will be familiar
- The cadcam-tauri project when the Python backend grows beyond one file
- Any interview about system design or "how would you structure this codebase"
- Django codebases in the wild — understanding why they get messy requires knowing what the clean version looks like
- The Repository Pattern drill (2.3) connects here — that drill is specifically about the Domain↔Infrastructure seam

---

## Setup

```
drills/7-architecture/7.1-layered-architecture/
  app_mudball.py        ← Step 1: everything in one file (the problem)
  domain/
    expense.py          ← Step 2: pure domain model and rules
  infrastructure/
    repository.py       ← Step 3: SQLite storage (all SQL lives here)
  application/
    expense_service.py  ← Step 4: orchestration (no HTTP, no SQL)
  presentation/
    routes.py           ← Step 5: Flask routes (no business logic)
  main.py               ← Step 6: wiring all layers together
```

Create the folder structure now. The subdirectories need `__init__.py` files so Python treats them as packages.

```
mkdir domain infrastructure application presentation
type nul > domain\__init__.py
type nul > infrastructure\__init__.py
type nul > application\__init__.py
type nul > presentation\__init__.py
```

You will need Flask and nothing else for this drill:
```
pip install flask
```

---

## Step 1 — The Big Ball of Mud

Read this carefully. Every problem we fix in later steps lives somewhere in this file. The comments point to each one.

Create `app_mudball.py`:

```python
# app_mudball.py
# THE WRONG VERSION — read every comment, then we refactor.
#
# This is a "big ball of mud": HTTP handling, business rules, and SQL
# are all fused in one place. It works. It is also a trap.
#
# Count how many separate concerns this file handles:
# 1. HTTP routing (Flask)
# 2. Request parsing (getting JSON from the request body)
# 3. Input validation (is the amount positive? is the category valid?)
# 4. Business calculations (what is the total for a category?)
# 5. Database connection management (sqlite3.connect)
# 6. SQL query writing (INSERT, SELECT)
# 7. Response formatting (jsonify)
#
# Seven concerns. One file. Every concern knows about every other concern.

import sqlite3
import json
from flask import Flask, request, jsonify

app = Flask(__name__)

# PROBLEM: Database path is hardcoded.
# Tests create the same file as production. Two tests running in parallel
# corrupt each other's data. There is no way to swap to Postgres.
DB_PATH = "expenses.db"

VALID_CATEGORIES = ["food", "transport", "utilities", "entertainment"]


def get_db():
    # PROBLEM: Connection management is global state scattered across
    # every route. There is no connection pooling, no transaction management.
    # Every call opens and closes independently — no way to run multiple
    # operations atomically.
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            amount   REAL    NOT NULL,
            category TEXT    NOT NULL,
            note     TEXT
        )
    """)
    conn.commit()
    return conn


@app.route("/expenses", methods=["POST"])
def add_expense():
    # PROBLEM: HTTP parsing, validation, SQL, and response formatting
    # are all in one block of code. You cannot test validation without
    # sending an HTTP request. You cannot test the SQL without validation
    # running first. Everything is coupled to everything.

    data = request.get_json()

    # Business rule: amount must be positive.
    # PROBLEM: This rule lives in an HTTP route. If you add a CLI interface
    # or a background job that also adds expenses, you copy this rule there too.
    # Now the rule exists in two places and drifts out of sync.
    amount = data.get("amount")
    if not isinstance(amount, (int, float)) or amount <= 0:
        return jsonify({"error": "amount must be a positive number"}), 400

    # Business rule: category must be from the allowed list.
    # Same problem — copied to every entry point.
    category = data.get("category", "").strip().lower()
    if category not in VALID_CATEGORIES:
        return jsonify({"error": f"category must be one of {VALID_CATEGORIES}"}), 400

    note = data.get("note", "").strip()

    # PROBLEM: SQL is written directly in the route handler.
    # Switching to Postgres means editing this route.
    # Adding logging around storage operations means editing this route.
    # Testing storage in isolation means faking HTTP requests.
    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO expenses (amount, category, note) VALUES (?, ?, ?)",
        (amount, category, note)
    )
    conn.commit()
    expense_id = cursor.lastrowid
    conn.close()

    return jsonify({"id": expense_id, "amount": amount, "category": category, "note": note}), 201


@app.route("/expenses", methods=["GET"])
def list_expenses():
    conn = get_db()
    rows = conn.execute("SELECT id, amount, category, note FROM expenses").fetchall()
    conn.close()

    # PROBLEM: Formatting a list of raw SQL rows into JSON happens here.
    # If you want to add a "total" field, you calculate it here, in the route.
    # If you want the same list from a CLI command, you duplicate this formatting.
    return jsonify([
        {"id": r["id"], "amount": r["amount"], "category": r["category"], "note": r["note"]}
        for r in rows
    ])


@app.route("/expenses/total", methods=["GET"])
def category_total():
    # Business rule: filter by category, sum the amounts.
    # PROBLEM: This calculation belongs to the domain, not to an HTTP route.
    # If this rule changes (exclude refunded expenses, cap at budget limit),
    # you find it only by knowing this URL exists.
    category = request.args.get("category", "").strip().lower()
    if category not in VALID_CATEGORIES:
        return jsonify({"error": f"category must be one of {VALID_CATEGORIES}"}), 400

    conn = get_db()
    row = conn.execute(
        "SELECT SUM(amount) as total FROM expenses WHERE category = ?",
        (category,)
    ).fetchone()
    conn.close()

    total = row["total"] or 0.0
    return jsonify({"category": category, "total": total})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
```

### SAVE AND TRY

Run the mudball app:
```
python app_mudball.py
```

Expected output (Flask dev server starting):
```
 * Serving Flask app 'app_mudball'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

In a second terminal, test it:
```
curl -s -X POST http://localhost:5000/expenses -H "Content-Type: application/json" -d "{\"amount\": 12.50, \"category\": \"food\", \"note\": \"lunch\"}"
```

Expected output:
```json
{"id":1,"amount":12.5,"category":"food","note":"lunch"}
```

```
curl -s http://localhost:5000/expenses
```

Expected output:
```json
[{"amount":12.5,"category":"food","id":1,"note":"lunch"}]
```

```
curl -s "http://localhost:5000/expenses/total?category=food"
```

Expected output:
```json
{"category":"food","total":12.5}
```

It works. Stop the server (Ctrl+C). Delete `expenses.db` before continuing.

**Now ask the hard questions:**

- "How do I test that the amount validation rejects zero without sending an HTTP request?" You cannot — the rule is inside the route.
- "How do I reuse the category total calculation in a scheduled report?" Copy it — it only exists as a SQL query inside a Flask function.
- "How do I run the same app against a test database?" Edit `DB_PATH` — and hope you remember to change it back.

These problems disappear when we refactor layer by layer.

---

## Step 2 — Extract the Domain Layer

The domain layer is pure Python. No Flask. No sqlite3. Just the concepts.

Create `domain/expense.py`:

```python
# domain/expense.py
# The domain layer: what an Expense IS and what rules govern it.
#
# This file has ZERO imports of Flask, SQLite, requests, or any framework.
# It can be imported anywhere — in a test, in a CLI, in a background job —
# without starting a server or connecting to a database.
#
# The domain layer is the most important layer. It is also the most stable.
# It changes only when the business rules change, not when you swap databases.

from dataclasses import dataclass, field
from typing import Optional


# The allowed categories are a business rule, not a Flask config.
# They live here so every entry point (HTTP, CLI, cron job) uses the same rule.
VALID_CATEGORIES = frozenset(["food", "transport", "utilities", "entertainment"])


@dataclass
class Expense:
    """
    A single expense entry.
    
    This is the domain model — the pure Python representation of the concept.
    It knows nothing about how it is stored or how it arrives (HTTP vs CLI).
    
    id is Optional because a new expense that hasn't been saved yet has no id.
    The infrastructure layer assigns the id and returns it.
    """
    amount: float
    category: str
    note: str = ""
    id: Optional[int] = None

    def __str__(self) -> str:
        tag = f"[{self.id}]" if self.id is not None else "[unsaved]"
        return f"{tag} {self.category} ${self.amount:.2f} — {self.note or 'no note'}"


class ExpenseValidator:
    """
    Business rules for what makes an expense valid.
    
    Validation is a domain concern — it expresses the rules of the system.
    It has nothing to do with how expenses arrive or where they're stored.
    Every entry point (HTTP route, CLI, test) uses this same validator.
    """

    @staticmethod
    def validate(amount: float, category: str) -> list[str]:
        """
        Return a list of error messages. Empty list means valid.
        
        Why return a list instead of raising immediately?
        The caller decides what to do with errors. The HTTP layer returns
        a 400 with JSON. The CLI prints them. The validator just finds them.
        """
        errors = []

        # Business rule: expenses must cost something.
        if not isinstance(amount, (int, float)) or amount <= 0:
            errors.append("amount must be a positive number")

        # Business rule: only approved spending categories are allowed.
        # This list is defined once, in the domain, not scattered in routes.
        if category.strip().lower() not in VALID_CATEGORIES:
            errors.append(f"category must be one of {sorted(VALID_CATEGORIES)}")

        return errors


class ExpenseCalculator:
    """
    Business calculations over a collection of expenses.
    
    These methods take plain Python lists — no database connections,
    no SQL queries. The domain layer defines WHAT to calculate.
    The infrastructure layer provides the data to calculate over.
    """

    @staticmethod
    def total_by_category(expenses: list[Expense], category: str) -> float:
        """
        Sum all expenses in the given category.
        
        This is a pure function: same input always produces same output.
        No side effects. Trivially testable — pass a list, check the result.
        """
        return sum(
            e.amount for e in expenses
            if e.category == category.strip().lower()
        )

    @staticmethod
    def grand_total(expenses: list[Expense]) -> float:
        """Sum all expenses regardless of category."""
        return sum(e.amount for e in expenses)
```

### SAVE AND TRY

Test the domain layer in pure isolation — no Flask, no SQLite:

```
python -c "
from domain.expense import Expense, ExpenseValidator, ExpenseCalculator

# Test the model
e = Expense(amount=12.50, category='food', note='lunch')
print(e)

# Test validation — valid case
errors = ExpenseValidator.validate(12.50, 'food')
print('Valid:', errors)

# Test validation — invalid cases
errors = ExpenseValidator.validate(-5, 'food')
print('Negative amount:', errors)

errors = ExpenseValidator.validate(10, 'coffee')
print('Bad category:', errors)

# Test the calculator
expenses = [
    Expense(1.00, 'food'),
    Expense(2.00, 'food'),
    Expense(5.00, 'transport'),
]
total = ExpenseCalculator.total_by_category(expenses, 'food')
print('Food total:', total)
"
```

Expected output:
```
[unsaved] food $12.50 — lunch
Valid: []
Negative amount: ['amount must be a positive number']
Bad category: ["category must be one of ['entertainment', 'food', 'transport', 'utilities']"]
Food total: 3.0
```

No server. No database. No Flask import. The domain layer runs standalone.

**Change something:** Try `ExpenseCalculator.grand_total(expenses)` — you get `8.0`. The calculator is a pure function. Swap the list for a different list and the result changes. This is what "no side effects" means.

---

## Step 3 — Extract the Infrastructure Layer

All SQLite code moves here. No business logic enters this file.

Create `infrastructure/repository.py`:

```python
# infrastructure/repository.py
# The infrastructure layer: SQLite implementation for expense storage.
#
# This file is ALLOWED to know about SQLite. That is its entire job.
# All SQL strings live here and nowhere else.
# No validation. No calculation. No business rules.
#
# The contract this class fulfills (what methods it must have) is defined
# by what the application layer expects. The application layer is the
# "customer" — it dictates the interface, infrastructure satisfies it.

import sqlite3
from typing import Optional

# Import ONLY from the domain — infrastructure depends on domain, nothing else.
from domain.expense import Expense


class ExpenseRepository:
    """
    Stores and retrieves Expense objects using SQLite.
    
    This class translates between the domain world (Expense objects)
    and the storage world (SQL rows). That translation is its core job.
    
    Swapping to Postgres means creating a PostgresExpenseRepository with
    the same method signatures. The application layer never changes.
    """

    def __init__(self, db_path: str = "expenses.db"):
        # db_path is injected — no hardcoded filename.
        # Pass ":memory:" in tests for an in-RAM database that vanishes
        # when the connection closes. No cleanup needed.
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row  # row["column"] instead of row[0]
        self._setup()

    def _setup(self) -> None:
        """Create the table if it doesn't exist. Storage concern, lives here."""
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS expenses (
                id       INTEGER PRIMARY KEY AUTOINCREMENT,
                amount   REAL    NOT NULL,
                category TEXT    NOT NULL,
                note     TEXT    DEFAULT ''
            )
        """)
        self.conn.commit()

    def add(self, expense: Expense) -> Expense:
        """
        Persist a new expense. Returns the expense with its id filled in.
        
        The domain object comes in without an id (unsaved).
        SQLite assigns the id via AUTOINCREMENT.
        We fill it in and return it so the caller knows the assigned id.
        """
        cursor = self.conn.execute(
            "INSERT INTO expenses (amount, category, note) VALUES (?, ?, ?)",
            (expense.amount, expense.category, expense.note)
        )
        self.conn.commit()
        # lastrowid: the id that SQLite assigned to the just-inserted row.
        expense.id = cursor.lastrowid
        return expense

    def get_all(self) -> list[Expense]:
        """
        Retrieve all expenses as domain objects.
        
        Key point: SQL rows do NOT escape this method.
        The caller gets a list[Expense] — clean domain objects.
        No caller ever handles a sqlite3.Row.
        """
        rows = self.conn.execute(
            "SELECT id, amount, category, note FROM expenses"
        ).fetchall()
        # Translate every row into a domain object before returning.
        # This translation — row → Expense — is the repository's core job.
        return [
            Expense(id=row["id"], amount=row["amount"],
                    category=row["category"], note=row["note"])
            for row in rows
        ]

    def get_by_category(self, category: str) -> list[Expense]:
        """Retrieve all expenses in a given category."""
        rows = self.conn.execute(
            "SELECT id, amount, category, note FROM expenses WHERE category = ?",
            (category,)
        ).fetchall()
        return [
            Expense(id=row["id"], amount=row["amount"],
                    category=row["category"], note=row["note"])
            for row in rows
        ]

    def close(self) -> None:
        """Explicit cleanup. In production, use a context manager or pooling."""
        self.conn.close()
```

### SAVE AND TRY

Test the repository in isolation — notice it imports only from `domain`, not from Flask:

```
python -c "
from domain.expense import Expense
from infrastructure.repository import ExpenseRepository

# ':memory:' = in-RAM SQLite, no file, gone when connection closes
repo = ExpenseRepository(':memory:')

e1 = repo.add(Expense(12.50, 'food', 'lunch'))
e2 = repo.add(Expense(3.00, 'transport', 'bus'))
e3 = repo.add(Expense(8.00, 'food', 'dinner'))

print('All expenses:')
for e in repo.get_all():
    print(' ', e)

print('Food expenses:')
for e in repo.get_by_category('food'):
    print(' ', e)
"
```

Expected output:
```
All expenses:
  [1] food $12.50 — lunch
  [2] transport $3.00 — bus
  [3] food $8.00 — dinner
Food expenses:
  [1] food $12.50 — lunch
  [3] food $8.00 — dinner
```

**Change something:** Replace `':memory:'` with `'test.db'` and run again. A file appears. Run a third time — the data accumulates across runs because the file persists. This is the difference between a test database (`:memory:`, always fresh) and a real database (file, persists). Delete `test.db` when done.

---

## Step 4 — Extract the Application Layer

The service orchestrates: it calls the validator, builds domain objects, calls the repository. It knows nothing about HTTP or SQL.

Create `application/expense_service.py`:

```python
# application/expense_service.py
# The application layer: orchestration of a use case.
#
# This file imports from domain and infrastructure — but NOT from Flask.
# It has no concept of HTTP requests, status codes, or JSON.
# It expresses "what happens when a user adds an expense" as a sequence
# of domain and repository calls, without caring how the user invoked it.
#
# Why this layer exists: the same use case might be invoked by
# an HTTP route, a CLI command, or a background job. All three
# would call the same service method. The service is the use case.

from domain.expense import Expense, ExpenseValidator, ExpenseCalculator
from infrastructure.repository import ExpenseRepository


class ExpenseService:
    """
    All use cases for the expense tracker.
    
    The repository is injected — this class does not create it.
    Tests inject an in-memory repository. Production injects a file-backed one.
    The service code is identical in both cases.
    """

    def __init__(self, repo: ExpenseRepository):
        # Type hint is the concrete class here for simplicity.
        # In a larger project, you'd define an abstract interface
        # and type-hint that — as in Drill 2.3.
        self.repo = repo

    def add_expense(self, amount: float, category: str, note: str = "") -> Expense:
        """
        Add a new expense after validating it.
        
        Raises ValueError with a human-readable message if validation fails.
        The presentation layer catches this and formats it as an HTTP 400.
        The CLI catches it and prints it. The service doesn't care which.
        
        Returns the saved Expense with its id filled in.
        """
        # Step 1: validate — a domain concern, called here.
        # The validator returns a list of errors. We raise on the first.
        # (Or collect them all and raise a single combined error — business decision.)
        category = category.strip().lower()
        errors = ExpenseValidator.validate(amount, category)
        if errors:
            # Join all errors into one message.
            # The presentation layer will present this to the user.
            raise ValueError("; ".join(errors))

        # Step 2: build the domain object.
        # The service constructs the Expense — not the route, not the repo.
        expense = Expense(amount=amount, category=category, note=note.strip())

        # Step 3: persist via the repository.
        # The service doesn't know if this goes to SQLite, Postgres, or a dict.
        saved = self.repo.add(expense)
        return saved

    def list_all(self) -> list[Expense]:
        """
        Return all expenses, sorted by amount descending.
        
        Sorting is a business decision — it lives here, not in the route
        and not in SQL (ORDER BY is infrastructure; sorting domain objects
        is application logic).
        """
        expenses = self.repo.get_all()
        return sorted(expenses, key=lambda e: e.amount, reverse=True)

    def category_total(self, category: str) -> float:
        """
        Return the total amount spent in a category.
        
        Step 1: validate the category (domain rule).
        Step 2: fetch the relevant expenses (infrastructure).
        Step 3: calculate the total (domain calculation).
        
        The three steps are cleanly separated — each in its proper layer.
        """
        category = category.strip().lower()
        errors = ExpenseValidator.validate(1.0, category)  # amount=1.0 to pass amount check
        if errors:
            # Filter to only category errors — we only care about the category here.
            category_errors = [e for e in errors if "category" in e]
            if category_errors:
                raise ValueError(category_errors[0])

        # Fetch from infrastructure.
        expenses = self.repo.get_by_category(category)
        # Calculate in domain.
        return ExpenseCalculator.total_by_category(expenses, category)
```

### SAVE AND TRY

Test the application layer — no Flask, no HTTP:

```
python -c "
from infrastructure.repository import ExpenseRepository
from application.expense_service import ExpenseService

repo = ExpenseRepository(':memory:')
svc = ExpenseService(repo)

# Add some expenses
svc.add_expense(12.50, 'food', 'lunch')
svc.add_expense(3.00, 'transport', 'bus')
svc.add_expense(8.00, 'food', 'dinner')
svc.add_expense(45.00, 'utilities', 'electric bill')

print('All expenses (sorted by amount):')
for e in svc.list_all():
    print(' ', e)

print()
print('Food total:', svc.category_total('food'))

# Test validation
try:
    svc.add_expense(-5, 'food')
except ValueError as err:
    print('Caught:', err)

try:
    svc.add_expense(10, 'coffee')
except ValueError as err:
    print('Caught:', err)
"
```

Expected output:
```
All expenses (sorted by amount):
  [4] utilities $45.00 — electric bill
  [1] food $12.50 — lunch
  [3] food $8.00 — dinner
  [2] transport $3.00 — bus

Food total: 20.5
Caught: amount must be a positive number
Caught: category must be one of ['entertainment', 'food', 'transport', 'utilities']
```

**Change something:** Remove the `.strip().lower()` call in `add_expense`. Try adding an expense with `category='FOOD'`. The validator will reject it. Put the strip/lower back and try again — it works. The service is the right place to normalize inputs before validation.

---

## Step 5 — The Presentation Layer

Flask routes become thin: parse the request, call the service, format the response. No business logic.

Create `presentation/routes.py`:

```python
# presentation/routes.py
# The presentation layer: HTTP interface to the application.
#
# Each route does exactly three things:
# 1. Parse the HTTP request (extract data from JSON body or query params)
# 2. Call the application service (one call per route, ideally)
# 3. Format the result as an HTTP response (jsonify + status code)
#
# No validation logic. No SQL. No calculations.
# The route is a translator: HTTP ↔ Python.

from flask import Blueprint, request, jsonify

# Import ONLY the application layer — never domain or infrastructure directly.
# The presentation layer's job is to translate HTTP into service calls.
from application.expense_service import ExpenseService

# Blueprint: Flask's way to organize routes into groups.
# The service is injected at Blueprint creation — presentation doesn't
# decide which database to use. That's the main module's job.
expenses_bp = Blueprint("expenses", __name__)
_service: ExpenseService = None  # set by init_routes()


def init_routes(service: ExpenseService) -> Blueprint:
    """
    Inject the service into this blueprint.
    
    Why a function instead of a global? Because the test can inject
    a service with an in-memory repository, and production injects
    a service with a real database. The routes are identical either way.
    """
    global _service
    _service = service
    return expenses_bp


@expenses_bp.route("/expenses", methods=["POST"])
def add_expense():
    """
    POST /expenses
    Body: {"amount": 12.50, "category": "food", "note": "lunch"}
    """
    data = request.get_json(silent=True) or {}

    # Parse: extract from the HTTP request. No logic — just extraction.
    amount = data.get("amount")
    category = data.get("category", "")
    note = data.get("note", "")

    try:
        # One call to the service. The route has no idea what happens inside.
        expense = _service.add_expense(amount, category, note)
    except ValueError as err:
        # Service raised a validation error.
        # The route's job: translate that into an HTTP 400.
        return jsonify({"error": str(err)}), 400

    # Format: translate the domain object into JSON.
    # The route decides the JSON shape — a presentation concern.
    return jsonify({
        "id": expense.id,
        "amount": expense.amount,
        "category": expense.category,
        "note": expense.note,
    }), 201


@expenses_bp.route("/expenses", methods=["GET"])
def list_expenses():
    """GET /expenses — returns all expenses sorted by amount."""
    expenses = _service.list_all()
    return jsonify([
        {
            "id": e.id,
            "amount": e.amount,
            "category": e.category,
            "note": e.note,
        }
        for e in expenses
    ])


@expenses_bp.route("/expenses/total", methods=["GET"])
def category_total():
    """GET /expenses/total?category=food"""
    category = request.args.get("category", "")

    try:
        total = _service.category_total(category)
    except ValueError as err:
        return jsonify({"error": str(err)}), 400

    return jsonify({"category": category.strip().lower(), "total": total})
```

### SAVE AND TRY

The presentation layer cannot be easily tested without a server, but we can verify the import graph. Run:

```
python -c "
import ast, sys

# Read the routes file and check what it imports.
# It should import Flask and application only — no sqlite3, no domain directly.
with open('presentation/routes.py') as f:
    tree = ast.parse(f.read())

imports = []
for node in ast.walk(tree):
    if isinstance(node, ast.Import):
        imports += [n.name for n in node.names]
    elif isinstance(node, ast.ImportFrom):
        imports.append(node.module)

print('Routes imports:', imports)
forbidden = [i for i in imports if 'sqlite3' in i or 'domain' in i]
print('Forbidden imports found:', forbidden if forbidden else 'none — good')
"
```

Expected output:
```
Routes imports: ['flask', 'application.expense_service']
Forbidden imports found: none — good
```

The route file imports Flask (presentation tool) and the application service. No SQLite, no domain classes directly. The layer boundary holds.

---

## Step 6 — Wire Everything Together

The main module is the only place that makes concrete decisions: which database file, which repository, which service.

Create `main.py`:

```python
# main.py
# The composition root: the only file that touches all layers.
#
# This is the single place where concrete choices are made:
# - Which database file?
# - Which repository implementation?
# - Which service gets which repository?
# - Which blueprint gets which service?
#
# Everything else is ignorant of these choices.
# If you change to Postgres, you change this file and create a
# PostgresExpenseRepository. The four layers are completely unchanged.

import os
from flask import Flask
from infrastructure.repository import ExpenseRepository
from application.expense_service import ExpenseService
from presentation.routes import init_routes


def create_app(db_path: str = None) -> Flask:
    """
    Application factory: creates and configures the Flask app.
    
    Accepting db_path as a parameter makes testing easy:
    - Production: create_app() — uses the env var or default
    - Tests: create_app(":memory:") — fresh in-memory DB every time
    
    This pattern is called the "application factory" and is standard
    in Flask. It appears in the Flask docs and every serious Flask project.
    """
    app = Flask(__name__)

    # Composition root: wire the layers together.
    # Read db_path from environment if not provided directly.
    # This is Factor III of the Twelve-Factor App — covered in Drill 7.2.
    if db_path is None:
        db_path = os.getenv("DB_PATH", "expenses.db")

    # Layer 3: Infrastructure
    repo = ExpenseRepository(db_path)

    # Layer 2: Application
    service = ExpenseService(repo)

    # Layer 1: Presentation — receives the service, knows nothing else
    blueprint = init_routes(service)
    app.register_blueprint(blueprint)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
```

### SAVE AND TRY

Run the refactored app:
```
python main.py
```

Expected output:
```
 * Serving Flask app 'main'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

Test exactly as before — the API is identical, but the internals are clean:
```
curl -s -X POST http://localhost:5000/expenses -H "Content-Type: application/json" -d "{\"amount\": 12.50, \"category\": \"food\", \"note\": \"lunch\"}"
```

Expected output:
```json
{"amount":12.5,"category":"food","id":1,"note":"lunch"}
```

```
curl -s -X POST http://localhost:5000/expenses -H "Content-Type: application/json" -d "{\"amount\": -5, \"category\": \"food\"}"
```

Expected output:
```json
{"error":"amount must be a positive number"}
```

```
curl -s "http://localhost:5000/expenses/total?category=food"
```

Expected output:
```json
{"category":"food","total":12.5}
```

Stop the server. Delete `expenses.db`.

**Change something:** Run the app with a different database path:
```
DB_PATH=mytest.db python main.py
```
The app now writes to `mytest.db` instead of `expenses.db`. No code changed — only an environment variable. This is one benefit of the composition root pattern: the concrete choice (which file) is isolated to one place and can be controlled externally.

---

## Step 7 — Verify the Dependency Direction

Check that the forbidden imports never appear in the wrong layers.

Run these four checks:

```
python -c "
import ast

def get_imports(path):
    with open(path) as f:
        tree = ast.parse(f.read())
    imports = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            imports += [n.name for n in node.names]
        elif isinstance(node, ast.ImportFrom) and node.module:
            imports.append(node.module)
    return imports

checks = [
    ('domain/expense.py',               ['flask', 'sqlite3', 'infrastructure', 'application']),
    ('infrastructure/repository.py',     ['flask', 'application', 'presentation']),
    ('application/expense_service.py',   ['flask', 'sqlite3', 'presentation']),
    ('presentation/routes.py',           ['sqlite3', 'domain', 'infrastructure']),
]

all_ok = True
for filepath, forbidden in checks:
    imports = get_imports(filepath)
    bad = [i for i in imports if any(f in i for f in forbidden)]
    if bad:
        print(f'VIOLATION in {filepath}: found {bad}')
        all_ok = False
    else:
        print(f'OK  {filepath}')

print()
print('Dependency check:', 'PASSED' if all_ok else 'FAILED — see violations above')
"
```

Expected output:
```
OK  domain/expense.py
OK  infrastructure/repository.py
OK  application/expense_service.py
OK  presentation/routes.py

Dependency check: PASSED
```

Every layer imports only from layers closer to the domain. The dependency rule holds.

---

## What You Just Built

| File | Layer | Imports from | Forbidden imports |
|------|-------|-------------|-----------------|
| `domain/expense.py` | Domain | stdlib only | infrastructure, application, presentation, Flask, sqlite3 |
| `infrastructure/repository.py` | Infrastructure | domain | application, presentation, Flask |
| `application/expense_service.py` | Application | domain, infrastructure | presentation, Flask, sqlite3 |
| `presentation/routes.py` | Presentation | application, Flask | domain directly, sqlite3 |
| `main.py` | Composition root | all layers | (allowed — this is the wiring point) |

**What refactoring each step enabled:**

- After Step 2 (domain extracted): Business rules can be unit-tested with `python -c` — no server, no database.
- After Step 3 (infrastructure extracted): Database can be swapped by replacing one class. `:memory:` enables test isolation.
- After Step 4 (application extracted): Use cases can be tested end-to-end without HTTP — call `svc.add_expense()` directly.
- After Step 5 (presentation extracted): Routes are so thin they barely need testing — all logic is tested in layers 2–4.

---

## Challenge

Below is a task manager big ball of mud — all logic in one Flask file. Refactor it into the same four-layer structure you built above.

**The starting code — `task_mudball.py`:**

```python
# task_mudball.py — ALL-IN-ONE task manager (the problem to fix)
import sqlite3
from flask import Flask, request, jsonify

app = Flask(__name__)
DB = "tasks.db"
STATUSES = ["todo", "in-progress", "done"]

def db():
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    c.execute("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, status TEXT DEFAULT 'todo', priority INTEGER DEFAULT 0)")
    c.commit()
    return c

@app.route("/tasks", methods=["POST"])
def create():
    d = request.get_json() or {}
    title = d.get("title", "").strip()
    if not title:
        return jsonify({"error": "title required"}), 400
    priority = d.get("priority", 0)
    if not isinstance(priority, int) or priority < 0 or priority > 5:
        return jsonify({"error": "priority must be 0–5"}), 400
    status = d.get("status", "todo")
    if status not in STATUSES:
        return jsonify({"error": f"status must be one of {STATUSES}"}), 400
    conn = db()
    cur = conn.execute("INSERT INTO tasks (title, status, priority) VALUES (?, ?, ?)", (title, status, priority))
    conn.commit()
    return jsonify({"id": cur.lastrowid, "title": title, "status": status, "priority": priority}), 201

@app.route("/tasks", methods=["GET"])
def list_tasks():
    conn = db()
    rows = conn.execute("SELECT id, title, status, priority FROM tasks ORDER BY priority DESC").fetchall()
    return jsonify([{"id": r["id"], "title": r["title"], "status": r["status"], "priority": r["priority"]} for r in rows])

@app.route("/tasks/<int:task_id>", methods=["PATCH"])
def update_status(task_id):
    d = request.get_json() or {}
    status = d.get("status", "")
    if status not in STATUSES:
        return jsonify({"error": f"status must be one of {STATUSES}"}), 400
    conn = db()
    result = conn.execute("UPDATE tasks SET status = ? WHERE id = ?", (status, task_id))
    conn.commit()
    if result.rowcount == 0:
        return jsonify({"error": "task not found"}), 404
    return jsonify({"id": task_id, "status": status})

if __name__ == "__main__":
    app.run(debug=True, port=5001)
```

**Requirements for your refactored version:**

1. Create `domain/task.py` — a `Task` dataclass with `id`, `title`, `status`, `priority`. A `TaskValidator` that validates title (non-empty), priority (0–5 integer), and status (from the allowed list). A `TaskSorter` with a `by_priority(tasks)` static method that returns tasks sorted highest priority first.

2. Create `infrastructure/task_repository.py` — a `TaskRepository` class that stores and retrieves `Task` objects from SQLite. All SQL lives here. Methods: `add(task) -> Task`, `get_all() -> list[Task]`, `update_status(task_id, status) -> bool`.

3. Create `application/task_service.py` — a `TaskService` that orchestrates: validates, calls repository, returns domain objects. Methods: `create_task(title, status, priority) -> Task`, `list_tasks() -> list[Task]` (sorted by priority), `update_task_status(task_id, status) -> Task`.

4. Create `presentation/task_routes.py` — thin Flask routes. Each route parses, calls the service, formats the response.

5. Wire it in `task_main.py` using the application factory pattern from `main.py`.

**Verification — your refactored version passes all three checks:**

(a) Run this — the domain layer must have zero forbidden imports:
```
python -c "
import ast
with open('domain/task.py') as f:
    tree = ast.parse(f.read())
imports = []
for node in ast.walk(tree):
    if isinstance(node, ast.ImportFrom) and node.module:
        imports.append(node.module)
    elif isinstance(node, ast.Import):
        imports += [n.name for n in node.names]
forbidden = [i for i in imports if any(x in i for x in ['flask','sqlite3','infrastructure','application'])]
print('Domain violations:', forbidden if forbidden else 'NONE — passed')
"
```

(b) Run this — domain tests must run without a server or database file:
```
python -c "
from domain.task import Task, TaskValidator, TaskSorter
tasks = [Task('A','todo',3), Task('B','todo',5), Task('C','done',1)]
sorted_tasks = TaskSorter.by_priority(tasks)
assert sorted_tasks[0].priority == 5, 'highest priority should be first'
print('Domain test: PASSED — no server, no database')
"
```

(c) Manually swap from SQLite to an in-memory dict: create `infrastructure/memory_task_repository.py` that stores tasks in `dict[int, Task]`. Change only `task_main.py` to use it. The service and routes must not change at all.

**When done:**

- Start `task_main.py` and hit all three endpoints with curl — they should behave identically to `task_mudball.py`
- Run check (a) — no domain violations
- Run check (b) — domain test passes
- Run check (c) — swapping the repository requires only one line change in `task_main.py`

**Stuck? Ask AI:**
> "My TaskService.list_tasks() calls TaskSorter but the import is from domain.task. The sort isn't working — tasks come back unsorted. Here's my TaskSorter implementation: [paste code]. What am I missing?"

---

## Quick Check Answers

1. **What is the "dependency rule" in layered architecture — which direction are dependencies allowed to flow?**
   Dependencies flow inward — toward the domain. Presentation may import from application. Application may import from domain and infrastructure. Infrastructure may import from domain. The domain imports from nothing. The key forbidden direction: domain must never import from infrastructure, application, or presentation.

2. **Why should the domain layer never import from the infrastructure layer?**
   If the domain imports from infrastructure (e.g., `import sqlite3`), you cannot test domain logic without a database. You cannot reuse the domain with a different storage backend. The most valuable layer — the one expressing your business rules — becomes coupled to the most replaceable layer. The rules should be expressible and testable in pure Python.

3. **What would break first if you tried to test your business logic while it lives in a Flask route?**
   You would need to send HTTP requests to test anything. A test for "what if amount is negative" would require: starting a Flask dev server, crafting an HTTP request with a JSON body, and parsing the response. If you want to run 100 validation tests, you need 100 HTTP round trips. The test suite becomes slow, fragile, and dependent on a running server.

4. **If you change your database from SQLite to Postgres, which layers should change and which should not?**
   Only the infrastructure layer changes — you create a `PostgresExpenseRepository` with the same method signatures, using `psycopg2` instead of `sqlite3`. The domain, application, and presentation layers have zero SQLite knowledge, so they have nothing to change. The composition root (`main.py`) changes one line — the class it instantiates.
