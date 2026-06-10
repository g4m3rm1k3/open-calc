# Drill 4.6 — Repository + Service Layer: The Architecture Pair

**Standalone drill. No prerequisites except basic Python and SQLite.**
**Time estimate:** 75–90 minutes
**Pattern category:** Non-GoF (Fowler's PoEAA — Patterns of Enterprise Application Architecture)
**What you will build:** A tiny inventory management system — first built wrong (business logic calling the database directly), then refactored into Service Layer + Repository, then the backend swapped in one file
**What you will understand:** Why Repository and Service Layer work as a pair, how they enforce the dependency direction, and why this architecture makes testing trivial

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. Your `add_product()` function contains: validation logic, a price calculation, and a `cursor.execute("INSERT INTO products...")`. Which of these three belongs in a Service Layer and which belongs in a Repository?

2. The Repository pattern says: "the service never imports `sqlite3`, `pymongo`, or any storage technology." Why is this valuable when your storage technology needs to change?

3. You want to test the business rule "price cannot be negative" without touching a database. With the Repository pattern, how would you do this?

4. "The Repository hides the storage technology. The Service hides the business logic from the presentation layer." What does the presentation layer (your Flask routes, your CLI) become when both are in place?

*(Answers at the bottom.)*

---

## The Concept: Repository + Service Layer

### Concept: Repository Pattern

**What it is:**
The Repository mediates between the domain (business objects) and the data mapping layer (database). It provides a collection-like interface for accessing domain objects — the caller thinks it's working with an in-memory collection, not a database.

**The problem — data access mixed with business logic:**

```python
# WRONG: business logic and SQL in the same function
def add_product(name: str, price: float, stock: int) -> None:
    if price < 0:
        raise ValueError("Price cannot be negative")   # business rule
    if not name.strip():
        raise ValueError("Name cannot be empty")       # business rule

    conn = sqlite3.connect("inventory.db")             # infrastructure
    cursor = conn.execute(
        "INSERT INTO products (name, price, stock) VALUES (?,?,?)",
        (name, price, stock)                           # infrastructure
    )
    conn.commit()
    conn.close()
```

To test the price validation rule, you need a live database. To switch from SQLite to PostgreSQL, you touch the same function that contains your business rules.

**The solution:**

```python
# Service: owns business rules, knows nothing about storage technology
class ProductService:
    def __init__(self, repo: ProductRepository):
        self._repo = repo   # injected — could be SQLite, PostgreSQL, or in-memory

    def add_product(self, name: str, price: float, stock: int) -> Product:
        if price < 0:
            raise ValueError("Price cannot be negative")   # business rule — only here
        if not name.strip():
            raise ValueError("Name cannot be empty")
        return self._repo.add(Product(name=name, price=price, stock=stock))

# Repository: owns SQL, knows nothing about business rules
class SQLiteProductRepository(ProductRepository):
    def add(self, product: Product) -> Product:
        # SQL here, no business logic
        ...
```

**What it hides:**
The Repository hides all persistence technology details. The Service never sees SQL, MongoDB queries, or file I/O. The invariant: every database operation that the Service performs must go through the Repository interface — the Service can never bypass it.

**Canonical example:**
A librarian and a card catalogue. The librarian (Service) decides which books are needed, checks availability rules, and makes reservations. The card catalogue (Repository) is consulted to find books by title or author — it abstracts the physical location of books in the stacks. The librarian does not know or care which shelf a book is on. Changing the shelving system (NoSQL → relational) requires only updating the catalogue, not re-training the librarian.

**Constraints:**
- The Repository must provide a stable interface even when the underlying storage changes
- Generic repository methods (`get_all`, `get_by_id`, `add`, `update`, `delete`) should match the domain's needs — not expose raw query capabilities
- The Repository should not return database-specific types — it returns domain objects (plain Python dataclasses or classes)
- Aggregates: in DDD, a repository is responsible for one aggregate root (e.g., `OrderRepository` returns complete `Order` objects with their lines — never naked line items)

**Failure modes:**
- Repository leaks the abstraction: `repo.execute_raw_sql("SELECT ...")` — the Service now depends on SQL, defeating the purpose
- Repository becomes a "God Object" with 40 custom query methods — the domain is leaking into the data layer
- Service bypasses the repository for "quick" queries — creates two code paths for the same data

**Operational reality:**
This architecture is used in: Django projects (service modules calling ORM managers), Flask projects (service classes calling SQLAlchemy models), FastAPI projects (services calling repositories), Spring Boot (Java), Rails (ActiveRecord as a combined repository/model). Every serious backend codebase you encounter uses some form of this separation, even if not explicitly named.

**You will see this again in:**
Every backend framework. The pattern is the foundation for Clean Architecture, Hexagonal Architecture (Ports and Adapters), and DDD application layers. Understanding it explains why "fat models" cause problems and why the Rails "model does everything" approach breaks down at scale.

**Watch for:**
The Service Layer is not a repository. The Service contains business logic — it orchestrates domain objects and calls repositories. A service that just delegates `product_repo.get_all()` to the caller is a useless pass-through. If there is no business logic in the service, the service should not exist.

---

## Step 1 — The Wrong Way (Feel the Coupling)

Create `inventory_bad.py`:

```python
# inventory_bad.py — everything mixed together (the wrong way)
# Business logic, validation, and SQL in the same functions.
# This is the PROBLEM. Feel why it's wrong before fixing it.
import sqlite3

DB_PATH = "inventory_bad.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY, name TEXT NOT NULL,
            price REAL NOT NULL, stock INTEGER NOT NULL
        )
    """)
    conn.commit()
    conn.close()

def add_product(name: str, price: float, stock: int) -> dict:
    """Add a product. Business rules + SQL mixed together."""
    # Business rules
    if price < 0:
        raise ValueError(f"Price cannot be negative: {price}")
    if stock < 0:
        raise ValueError(f"Stock cannot be negative: {stock}")
    if not name.strip():
        raise ValueError("Name cannot be empty")

    # SQL — in the same function as the business rules
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.execute(
        "INSERT INTO products (name, price, stock) VALUES (?,?,?)",
        (name.strip(), price, stock)
    )
    conn.commit()
    product_id = cursor.lastrowid
    conn.close()
    return {"id": product_id, "name": name, "price": price, "stock": stock}

def restock(product_id: int, quantity: int) -> dict:
    """Restock a product. Business rule: quantity must be positive."""
    if quantity <= 0:
        raise ValueError(f"Restock quantity must be positive: {quantity}")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.execute(
        "UPDATE products SET stock = stock + ? WHERE id = ?",
        (quantity, product_id)
    )
    if cursor.rowcount == 0:
        conn.close()
        raise ValueError(f"Product {product_id} not found")
    conn.commit()

    product = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    conn.close()
    return {"id": product[0], "name": product[1], "price": product[2], "stock": product[3]}

def get_all() -> list:
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute("SELECT * FROM products ORDER BY name").fetchall()
    conn.close()
    return [{"id": r[0], "name": r[1], "price": r[2], "stock": r[3]} for r in rows]


if __name__ == "__main__":
    init_db()
    add_product("Widget", 9.99, 100)
    add_product("Gadget", 24.99, 50)
    restock(1, 25)
    for p in get_all():
        print(p)
    print("\nProblem: to test 'price cannot be negative', you need a real database.")
    print("Problem: to switch to PostgreSQL, you edit functions containing business rules.")
```

### SAVE AND TRY

```bash
python inventory_bad.py
```

**Expected output:**
```
{'id': 1, 'name': 'Widget', 'price': 9.99, 'stock': 125}
{'id': 2, 'name': 'Gadget', 'price': 24.99, 'stock': 50}

Problem: to test 'price cannot be negative', you need a real database.
Problem: to switch to PostgreSQL, you edit functions containing business rules.
```

---

## Step 2 — The Correct Architecture

Create `inventory.py`:

```python
# inventory.py — Repository + Service Layer architecture
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
import sqlite3
import copy

# ── Domain object ──────────────────────────────────────────────────────────────

@dataclass
class Product:
    name:  str
    price: float
    stock: int
    id:    int = field(default=0)   # 0 = not yet persisted

    def is_persisted(self) -> bool:
        return self.id > 0


# ── Repository interface (the contract) ───────────────────────────────────────

class ProductRepository(ABC):
    """
    The interface the Service depends on.
    Contains only what the application needs — no raw SQL, no query language.
    The Service imports THIS interface, never a concrete implementation.
    """

    @abstractmethod
    def add(self, product: Product) -> Product:
        """Persist a new product. Returns the product with its assigned id."""
        ...

    @abstractmethod
    def get_by_id(self, product_id: int) -> Product | None:
        """Return the product with this id, or None if not found."""
        ...

    @abstractmethod
    def get_all(self) -> list[Product]:
        """Return all products, sorted by name."""
        ...

    @abstractmethod
    def update(self, product: Product) -> Product:
        """Save changes to an existing product. Returns the updated product."""
        ...


# ── SQLite implementation ─────────────────────────────────────────────────────

class SQLiteProductRepository(ProductRepository):
    """
    SQLite implementation of ProductRepository.
    Contains ALL SQL. Zero business logic.
    To switch to PostgreSQL: create PostgreSQLProductRepository with the same interface.
    """

    def __init__(self, db_path: str):
        self._db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self._db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS products (
                    id INTEGER PRIMARY KEY, name TEXT NOT NULL,
                    price REAL NOT NULL, stock INTEGER NOT NULL
                )
            """)

    def _row_to_product(self, row) -> Product:
        """Convert a database row to a Product domain object."""
        return Product(id=row[0], name=row[1], price=row[2], stock=row[3])

    def add(self, product: Product) -> Product:
        with sqlite3.connect(self._db_path) as conn:
            cursor = conn.execute(
                "INSERT INTO products (name, price, stock) VALUES (?,?,?)",
                (product.name, product.price, product.stock)
            )
        return Product(id=cursor.lastrowid, name=product.name,
                       price=product.price, stock=product.stock)

    def get_by_id(self, product_id: int) -> Product | None:
        with sqlite3.connect(self._db_path) as conn:
            row = conn.execute(
                "SELECT * FROM products WHERE id = ?", (product_id,)
            ).fetchone()
        return self._row_to_product(row) if row else None

    def get_all(self) -> list[Product]:
        with sqlite3.connect(self._db_path) as conn:
            rows = conn.execute("SELECT * FROM products ORDER BY name").fetchall()
        return [self._row_to_product(r) for r in rows]

    def update(self, product: Product) -> Product:
        with sqlite3.connect(self._db_path) as conn:
            conn.execute(
                "UPDATE products SET name=?, price=?, stock=? WHERE id=?",
                (product.name, product.price, product.stock, product.id)
            )
        return product


# ── In-memory implementation (for testing) ───────────────────────────────────

class InMemoryProductRepository(ProductRepository):
    """
    In-memory implementation. No disk, no database.
    Used in tests — instantiate, run service methods, assert state.
    Tests are millisecond-fast and require zero teardown.
    """

    def __init__(self):
        self._products: dict[int, Product] = {}
        self._next_id = 1

    def add(self, product: Product) -> Product:
        saved = copy.copy(product)
        saved.id = self._next_id
        self._next_id += 1
        self._products[saved.id] = saved
        return saved

    def get_by_id(self, product_id: int) -> Product | None:
        return copy.copy(self._products.get(product_id))

    def get_all(self) -> list[Product]:
        return sorted(self._products.values(), key=lambda p: p.name)

    def update(self, product: Product) -> Product:
        if product.id not in self._products:
            raise ValueError(f"Product {product.id} not found")
        self._products[product.id] = copy.copy(product)
        return product


# ── Service Layer ─────────────────────────────────────────────────────────────

class ProductService:
    """
    Contains ALL business logic. Zero SQL. Zero storage technology.
    Receives a ProductRepository at construction — does not create it.
    To test: inject InMemoryProductRepository.
    In production: inject SQLiteProductRepository (or PostgreSQL, etc).
    """

    def __init__(self, repo: ProductRepository):
        self._repo = repo   # the only dependency — an interface, not a concrete class

    def add_product(self, name: str, price: float, stock: int) -> Product:
        """Business rule: name must not be empty, price and stock must be non-negative."""
        name = name.strip()
        if not name:
            raise ValueError("Product name cannot be empty")
        if price < 0:
            raise ValueError(f"Price cannot be negative: {price}")
        if stock < 0:
            raise ValueError(f"Initial stock cannot be negative: {stock}")

        return self._repo.add(Product(name=name, price=price, stock=stock))

    def restock(self, product_id: int, quantity: int) -> Product:
        """Business rule: restock quantity must be positive."""
        if quantity <= 0:
            raise ValueError(f"Restock quantity must be positive: {quantity}")

        product = self._repo.get_by_id(product_id)
        if product is None:
            raise ValueError(f"Product {product_id} not found")

        product.stock += quantity
        return self._repo.update(product)

    def apply_discount(self, product_id: int, percent: float) -> Product:
        """Business rule: discount must be between 0% and 100%."""
        if not 0 < percent <= 100:
            raise ValueError(f"Discount must be between 0 and 100 percent: {percent}")

        product = self._repo.get_by_id(product_id)
        if product is None:
            raise ValueError(f"Product {product_id} not found")

        product.price = round(product.price * (1 - percent / 100), 2)
        return self._repo.update(product)

    def get_all_products(self) -> list[Product]:
        return self._repo.get_all()
```

### SAVE AND TRY

```bash
python -c "
from inventory import SQLiteProductRepository, ProductService

repo    = SQLiteProductRepository('inventory.db')
service = ProductService(repo)

w = service.add_product('Widget', 9.99, 100)
g = service.add_product('Gadget', 24.99, 50)

service.restock(w.id, 25)
service.apply_discount(g.id, 10)

for p in service.get_all_products():
    print(f'{p.id}. {p.name}: \${p.price} ({p.stock} in stock)')
"
```

**Expected output:**
```
2. Gadget: $22.49 (50 in stock)
1. Widget: $9.99 (125 in stock)
```

---

## Step 3 — Tests With No Database

Create `test_inventory.py`:

```python
# test_inventory.py — tests using InMemoryProductRepository
# No database. No files. Millisecond-fast.
import pytest
from inventory import InMemoryProductRepository, ProductService

def make_service():
    """Helper: fresh in-memory service for each test."""
    return ProductService(InMemoryProductRepository())

def test_add_product_returns_product_with_id():
    service = make_service()
    product = service.add_product("Widget", 9.99, 100)
    assert product.id > 0           # repository assigned an id
    assert product.name == "Widget"
    assert product.price == 9.99

def test_add_product_rejects_negative_price():
    service = make_service()
    with pytest.raises(ValueError, match="negative"):
        service.add_product("Widget", -1.00, 100)

def test_add_product_rejects_empty_name():
    service = make_service()
    with pytest.raises(ValueError, match="empty"):
        service.add_product("   ", 9.99, 100)

def test_restock_increases_stock():
    service = make_service()
    product = service.add_product("Widget", 9.99, 100)
    updated = service.restock(product.id, 50)
    assert updated.stock == 150

def test_restock_rejects_zero_quantity():
    service = make_service()
    product = service.add_product("Widget", 9.99, 100)
    with pytest.raises(ValueError, match="positive"):
        service.restock(product.id, 0)

def test_apply_discount_reduces_price():
    service = make_service()
    product = service.add_product("Gadget", 24.99, 50)
    discounted = service.apply_discount(product.id, 10)   # 10% off
    assert discounted.price == pytest.approx(22.49, rel=0.01)

def test_apply_discount_rejects_over_100_percent():
    service = make_service()
    product = service.add_product("Gadget", 24.99, 50)
    with pytest.raises(ValueError):
        service.apply_discount(product.id, 110)
```

### SAVE AND TRY

```bash
pip install pytest
pytest test_inventory.py -v
```

**Expected output:**
```
test_inventory.py::test_add_product_returns_product_with_id PASSED
test_inventory.py::test_add_product_rejects_negative_price PASSED
test_inventory.py::test_add_product_rejects_empty_name PASSED
test_inventory.py::test_restock_increases_stock PASSED
test_inventory.py::test_restock_rejects_zero_quantity PASSED
test_inventory.py::test_apply_discount_reduces_price PASSED
test_inventory.py::test_apply_discount_rejects_over_100_percent PASSED

7 passed in 0.04s
```

Seven business rule tests. Zero database connections. 0.04 seconds. No cleanup needed between tests. This is what testable architecture looks like.

**Change something:** Swap `InMemoryProductRepository` for `SQLiteProductRepository('test.db')` in `make_service()`. The same tests pass — but now they use a real database. The test code is identical. This is the abstraction working.

---

## Challenge

**No solution provided. Requirements checklist only.**

Add a `LowStockAlert` feature: when stock drops below a threshold, an `AlertService` is notified. The `ProductService` should call the alert service but never know how alerts are delivered.

**Requirements checklist:**

- [ ] `AlertService` interface has one method: `alert(product: Product, message: str) -> None`
- [ ] `InMemoryAlertService` stores alerts in a list — `service.alerts` returns the full list
- [ ] `LoggingAlertService` prints the alert to stdout — used in production
- [ ] `ProductService` accepts an optional `alert_service: AlertService = None` parameter
- [ ] When `restock` would leave stock below `LOW_STOCK_THRESHOLD = 10`, the ProductService calls `alert_service.alert(product, "Low stock: ...")`
- [ ] Tests use `InMemoryAlertService` to verify alerts were sent — no stdout inspection needed
- [ ] `ProductService` never imports `InMemoryAlertService` or `LoggingAlertService`

**Starter:**
```python
class AlertService(ABC):
    @abstractmethod
    def alert(self, product: Product, message: str) -> None: ...

class InMemoryAlertService(AlertService):
    def __init__(self):
        self.alerts = []   # list of (product, message) tuples
    def alert(self, product: Product, message: str) -> None:
        self.alerts.append((product, message))
```

**When you're done:** `test_low_stock_alert()` creates a product with 5 units, calls `restock(id, 0)` (which would fail) then calls a method that reduces stock, and asserts `alert_service.alerts` has one entry. The `ProductService` code never mentions `InMemoryAlertService` or `LoggingAlertService`.

**Stuck?** Ask AI: "I want my ProductService to call an AlertService when stock is low, but ProductService should not know the concrete AlertService type. I'm injecting the AlertService at construction. How do I make it optional so the service still works when no alert service is provided?"

---

## Quick Check Answers

**1. Which belongs in Service Layer and which in Repository?**
The price validation and price calculation belong in the Service Layer — they are business rules that are true regardless of how data is stored. The SQL INSERT belongs in the Repository — it is an implementation detail of how data is persisted. The Service Layer should be testable without a database, which means it must not contain any database code. If you find database code in a service, move it to the repository.

**2. Why is it valuable that the service never imports storage technology?**
When the storage technology changes (SQLite → PostgreSQL, PostgreSQL → MongoDB, MongoDB → an external API), you only need to write a new Repository implementation. The Service Layer, its business rules, and all its tests remain completely unchanged. Without this separation, changing storage technology means rewriting functions that contain both your business rules and your database code — simultaneously testing the new storage AND risking regressions in the business logic.

**3. How do you test "price cannot be negative" without a database?**
Create an `InMemoryProductRepository`, inject it into `ProductService`, and call `service.add_product("Widget", -1.00, 100)`. The test asserts that `ValueError` is raised. No database is involved, no files are created, no network connections are made. The test runs in under 1 millisecond and never needs cleanup. This is only possible because `ProductService` depends on the `ProductRepository` interface, not on SQLite — you can substitute the in-memory version at test time.

**4. What does the presentation layer become?**
Thin. The presentation layer (CLI, Flask routes, FastAPI endpoints) becomes responsible only for: receiving input (from stdin, HTTP request), calling the appropriate service method, and formatting the output (to stdout, HTTP response). It contains no business logic and no database code — those belong to the service and repository respectively. A Flask route becomes 5-10 lines: parse request, call service, return JSON. This is the correct size for a presentation layer.
