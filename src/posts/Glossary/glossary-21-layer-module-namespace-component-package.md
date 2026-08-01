# Architecture Vocabulary: Layer, Module, Namespace, Component, Package

## What you will build

Five runnable programs — one per concept — in both Python and TypeScript,
showing what each architectural term means in practice: how Layers
organize a codebase by responsibility, how Modules group related code
into importable units, what Namespaces prevent, what a Component is, and
how Packages bundle code for distribution. By the end you'll understand
the vocabulary used to describe how large codebases are structured, and
recognize each concept when you see it in real projects.

## What you need to know first

This post assumes comfort with basic Python (variables, functions,
classes) and basic TypeScript orientation. No prior glossary posts are
required — this post stands fully alone.

## Setting up to run TypeScript

```
npx tsc filename.ts
node filename.js
```

---

## Concept 1: Layer

A **layer** is a logical separation of a codebase by responsibility. Code
in one layer only communicates with the layers directly adjacent to it.
The classic layered architecture has three layers:

- **Presentation layer** — handles input and output: HTTP requests, CLI
  commands, rendering to screen
- **Business logic layer** (also called the domain layer or service layer)
  — the rules and operations that make the application do what it does
- **Data layer** — storage and retrieval: databases, files, external APIs

The discipline is: the presentation layer calls the business layer; the
business layer calls the data layer. The data layer never calls upward.
The presentation layer never directly touches the data layer.

### Python

```python
# === Data Layer ===
class UserStore:
    def __init__(self):
        self._users = {
            1: {"id": 1, "username": "alice", "email": "alice@example.com"},
            2: {"id": 2, "username": "bob",   "email": "bob@example.com"},
        }

    def find_by_id(self, user_id):
        return self._users.get(user_id)

    def find_all(self):
        return list(self._users.values())

    def save(self, user):
        self._users[user["id"]] = user
        return user


# === Business Logic Layer ===
class UserService:
    def __init__(self, user_store):
        self._store = user_store

    def get_user(self, user_id):
        user = self._store.find_by_id(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
        return user

    def list_users(self):
        return self._store.find_all()

    def create_user(self, username, email):
        if not username or not email:
            raise ValueError("Username and email are required")
        if "@" not in email:
            raise ValueError(f"Invalid email: {email}")
        new_id = max(u["id"] for u in self._store.find_all()) + 1
        return self._store.save({"id": new_id, "username": username, "email": email})


# === Presentation Layer ===
class UserController:
    def __init__(self, user_service):
        self._service = user_service

    def handle_get_user(self, user_id):
        try:
            user = self._service.get_user(user_id)
            print(f"  200 OK: {user}")
        except ValueError as e:
            print(f"  404 Not Found: {e}")

    def handle_list_users(self):
        users = self._service.list_users()
        print(f"  200 OK: {len(users)} users")
        for user in users:
            print(f"    - {user['username']} ({user['email']})")

    def handle_create_user(self, username, email):
        try:
            user = self._service.create_user(username, email)
            print(f"  201 Created: {user}")
        except ValueError as e:
            print(f"  400 Bad Request: {e}")


# === Wiring (Composition Root) ===
store      = UserStore()
service    = UserService(store)
controller = UserController(service)

print("GET /users/1")
controller.handle_get_user(1)

print("\nGET /users/99")
controller.handle_get_user(99)

print("\nGET /users")
controller.handle_list_users()

print("\nPOST /users {username: carol, email: carol@example.com}")
controller.handle_create_user("carol", "carol@example.com")

print("\nPOST /users {username: bad, email: not-an-email}")
controller.handle_create_user("bad", "not-an-email")
```

```
GET /users/1
  200 OK: {'id': 1, 'username': 'alice', 'email': 'alice@example.com'}

GET /users/99
  404 Not Found: User 99 not found

GET /users
  200 OK: 2 users
    - alice (alice@example.com)
    - bob (bob@example.com)

POST /users {username: carol, email: carol@example.com}
  201 Created: {'id': 3, 'username': 'carol', 'email': 'carol@example.com'}

POST /users {username: bad, email: not-an-email}
  400 Bad Request: Invalid email: not-an-email
```

**Walkthrough:** Each layer has exactly one job. `UserStore` knows only
about storing and retrieving data — no validation, no HTTP concepts.
`UserService` knows only about business rules — no HTTP status codes, no
storage details. `UserController` knows only about HTTP — converts HTTP
requests into service calls and service results into HTTP responses.

**CS lens.** Layers are a form of **information hiding**: each layer
exposes an interface to the layer above it while hiding how it works.
`UserService` doesn't know whether `UserStore` is backed by a dictionary,
a SQL database, or a remote API — it only knows `UserStore` has
`find_by_id`, `find_all`, and `save`. This is the same principle as the
Repository pattern from Glossary 06, applied at the architectural level.

**SE lens.** The layered architecture is the foundation of most web
frameworks: Django (models → views → templates), Rails (models →
controllers → views), Spring (repositories → services → controllers).
The specific names differ but the structure is always the same: one layer
for data, one for business logic, one for presentation. The discipline
of not skipping layers — never having a controller directly query the
database — keeps each layer independently testable and replaceable.

**What breaks without this:** A controller that queries the database
directly is testing data access when you try to test request handling.
A service that formats HTML is business logic that depends on the
presentation format. Each violation makes the violated class harder to
test and harder to change.

### TypeScript

```typescript
interface User {
  id: number;
  username: string;
  email: string;
}

// === Data Layer ===
class UserStore {
  private users: Map<number, User> = new Map([
    [1, { id: 1, username: "alice", email: "alice@example.com" }],
    [2, { id: 2, username: "bob",   email: "bob@example.com"   }],
  ]);

  findById(userId: number): User | null {
    return this.users.get(userId) ?? null;
  }

  findAll(): User[] {
    return Array.from(this.users.values());
  }

  save(user: User): User {
    this.users.set(user.id, user);
    return user;
  }
}

// === Business Logic Layer ===
class UserService {
  constructor(private store: UserStore) {}

  getUser(userId: number): User {
    const user = this.store.findById(userId);
    if (!user) throw new Error(`User ${userId} not found`);
    return user;
  }

  listUsers(): User[] {
    return this.store.findAll();
  }

  createUser(username: string, email: string): User {
    if (!username || !email) throw new Error("Username and email are required");
    if (!email.includes("@"))  throw new Error(`Invalid email: ${email}`);
    const all   = this.store.findAll();
    const newId = Math.max(...all.map((u) => u.id)) + 1;
    return this.store.save({ id: newId, username, email });
  }
}

// === Presentation Layer ===
class UserController {
  constructor(private service: UserService) {}

  handleGetUser(userId: number): void {
    try {
      const user = this.service.getUser(userId);
      console.log(`  200 OK: ${JSON.stringify(user)}`);
    } catch (e) {
      if (e instanceof Error) console.log(`  404 Not Found: ${e.message}`);
    }
  }

  handleListUsers(): void {
    const users = this.service.listUsers();
    console.log(`  200 OK: ${users.length} users`);
    users.forEach((u) => console.log(`    - ${u.username} (${u.email})`));
  }

  handleCreateUser(username: string, email: string): void {
    try {
      const user = this.service.createUser(username, email);
      console.log(`  201 Created: ${JSON.stringify(user)}`);
    } catch (e) {
      if (e instanceof Error) console.log(`  400 Bad Request: ${e.message}`);
    }
  }
}

const store      = new UserStore();
const service    = new UserService(store);
const controller = new UserController(service);

console.log("GET /users/1");
controller.handleGetUser(1);

console.log("\nGET /users/99");
controller.handleGetUser(99);

console.log("\nGET /users");
controller.handleListUsers();

console.log("\nPOST /users {username: carol, email: carol@example.com}");
controller.handleCreateUser("carol", "carol@example.com");

console.log("\nPOST /users {username: bad, email: not-an-email}");
controller.handleCreateUser("bad", "not-an-email");
```

```
GET /users/1
  200 OK: {"id":1,"username":"alice","email":"alice@example.com"}

GET /users/99
  404 Not Found: User 99 not found

GET /users
  200 OK: 2 users
    - alice (alice@example.com)
    - bob (bob@example.com)

POST /users {username: carol, email: carol@example.com}
  201 Created: {"id":3,"username":"carol","email":"carol@example.com"}

POST /users {username: bad, email: not-an-email}
  400 Bad Request: Invalid email: not-an-email
```

---

## Concept 2: Module

A **module** is a file (or group of files) that groups related code and
controls what is visible to the outside world. A module has a public
interface (what it exports) and private internals (what it keeps to
itself). Other code imports from a module's public interface without
needing to know how the internals work.

### Python

```python
# In a real project this would be in a separate file: math_utils.py
# Simulating it here with a class namespace for demonstration

class MathUtils:
    """
    Module: math_utils
    Public interface: add, subtract, multiply, percentage_of
    Private (internal): _validate_numbers
    """

    @staticmethod
    def _validate_numbers(*args):
        for arg in args:
            if not isinstance(arg, (int, float)):
                raise TypeError(f"Expected a number, got {type(arg).__name__}")

    @staticmethod
    def add(a, b):
        MathUtils._validate_numbers(a, b)
        return a + b

    @staticmethod
    def subtract(a, b):
        MathUtils._validate_numbers(a, b)
        return a - b

    @staticmethod
    def multiply(a, b):
        MathUtils._validate_numbers(a, b)
        return a * b

    @staticmethod
    def percentage_of(value, percent):
        MathUtils._validate_numbers(value, percent)
        return value * (percent / 100)


print(MathUtils.add(10, 5))
print(MathUtils.subtract(10, 5))
print(MathUtils.multiply(10, 5))
print(MathUtils.percentage_of(200, 15))

try:
    MathUtils.add("ten", 5)
except TypeError as e:
    print(f"  Type error caught: {e}")
```

```
15
5
50
30.0
  Type error caught: Expected a number, got str
```

**Walkthrough:** In real Python projects, `MathUtils` would live in its
own file (`math_utils.py`) and be imported with `from math_utils import
MathUtils`. The `_validate_numbers` method is prefixed with `_` (the
convention for "private to this module"). The public interface — what other
code should use — is `add`, `subtract`, `multiply`, and `percentage_of`.
Internal helpers are hidden. This is the same encapsulation principle from
the Value Object and Entity posts: expose only what callers need, hide
everything else.

**CS lens.** A module's public interface is a **contract**: once other
code depends on `MathUtils.add`, changing its signature breaks those
callers. The private internals (`_validate_numbers`) can be changed freely
without breaking anything outside the module. This is the same distinction
as a class's `public` vs `private` members — applied at the file level
rather than the object level.

**SE lens.** Python's module system is the `import` mechanism: each `.py`
file is a module. `from math_utils import add` makes `add` available
directly; `import math_utils` makes the whole module available as
`math_utils.add`. TypeScript's module system uses `export` and `import`
keywords. Both enforce the public/private boundary: callers import only
what the module explicitly makes available.

### TypeScript

```typescript
// In a real project: math-utils.ts (exported items are the public interface)

function validateNumbers(...args: number[]): void {
  for (const arg of args) {
    if (typeof arg !== "number" || isNaN(arg)) {
      throw new TypeError(`Expected a number, got ${typeof arg}`);
    }
  }
}

export function add(a: number, b: number): number {
  validateNumbers(a, b);
  return a + b;
}

export function subtract(a: number, b: number): number {
  validateNumbers(a, b);
  return a - b;
}

export function multiply(a: number, b: number): number {
  validateNumbers(a, b);
  return a * b;
}

export function percentageOf(value: number, percent: number): number {
  validateNumbers(value, percent);
  return value * (percent / 100);
}

// Demonstration (in a real project, this would be in a separate file
// that imports from math-utils.ts)
console.log(add(10, 5));
console.log(subtract(10, 5));
console.log(multiply(10, 5));
console.log(percentageOf(200, 15));
```

**Walkthrough — new syntax.** `export function add(...)` — the `export`
keyword marks a function as part of the module's public interface. Without
`export`, a function is private to the file. `validateNumbers` has no
`export`, so it's file-private — other files can't import it. `typeof arg
!== "number"` — JavaScript's `typeof` operator returns a string describing
a value's type (`"number"`, `"string"`, `"boolean"`, `"object"`, etc.).
`isNaN(arg)` checks if a value is the special JavaScript `NaN` (Not a
Number) value — which has the peculiar property that `typeof NaN ===
"number"` (it's classified as a number type but is not a valid number),
so both checks are needed.

```
15
5
50
30
```

---

## Concept 3: Namespace

A **namespace** is a container for identifiers (variable names, function
names, class names) that prevents naming conflicts. Without namespaces,
two different modules that both define a function named `format` or
`parse` or `save` would conflict when used together.

### Python

```python
class DateUtils:
    @staticmethod
    def format(date_str):
        return f"Date: {date_str}"

    @staticmethod
    def parse(text):
        return {"year": 2026, "month": 7, "day": 15}


class CurrencyUtils:
    @staticmethod
    def format(amount):
        return f"${amount:,.2f}"

    @staticmethod
    def parse(text):
        return float(text.replace("$", "").replace(",", ""))


date     = DateUtils.format("2026-07-15")
currency = CurrencyUtils.format(1234567.89)

print(date)
print(currency)

parsed_date     = DateUtils.parse("2026-07-15")
parsed_currency = CurrencyUtils.parse("$1,234,567.89")

print(parsed_date)
print(parsed_currency)
```

```
Date: 2026-07-15
$1,234,567.89
{'year': 2026, 'month': 7, 'day': 15}
1234567.89
```

**Walkthrough:** Both `DateUtils` and `CurrencyUtils` have methods named
`format` and `parse` — functions that do entirely different things but
share the same name. Without namespaces, `from utils import format` would
be ambiguous — which `format`? With namespaces (`DateUtils.format`,
`CurrencyUtils.format`), both coexist without conflict. The class name is
the namespace.

**CS lens.** Naming conflicts are one of the oldest problems in software.
The solution is always some form of scoping: give each name a container
it belongs to, so the full name (container + name) is unique even when the
short name isn't. Python's module system is itself a namespacing mechanism:
`datetime.date` and `pandas.DataFrame` can coexist because they live in
different module namespaces. TypeScript's `namespace` keyword and module
system both serve this purpose.

### TypeScript

```typescript
namespace DateUtils {
  export function format(dateStr: string): string {
    return `Date: ${dateStr}`;
  }
  export function parse(text: string): { year: number; month: number; day: number } {
    return { year: 2026, month: 7, day: 15 };
  }
}

namespace CurrencyUtils {
  export function format(amount: number): string {
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  export function parse(text: string): number {
    return parseFloat(text.replace("$", "").replace(/,/g, ""));
  }
}

console.log(DateUtils.format("2026-07-15"));
console.log(CurrencyUtils.format(1234567.89));
console.log(DateUtils.parse("2026-07-15"));
console.log(CurrencyUtils.parse("$1,234,567.89"));
```

**Walkthrough — new syntax.** `namespace DateUtils { ... }` — TypeScript's
`namespace` keyword creates an explicit named scope. Functions inside must
be `export`ed to be accessible from outside. `toLocaleString("en-US", {
minimumFractionDigits: 2, maximumFractionDigits: 2 })` is JavaScript's
built-in number formatting with locale and options — here producing
US-style comma-separated thousands with exactly 2 decimal places.
`parseFloat(text.replace("$", "").replace(/,/g, ""))` strips the dollar
sign and all commas before converting to a number.

```
Date: 2026-07-15
$1,234,567.89
{ year: 2026, month: 7, day: 15 }
1234567.89
```

---

## Concept 4: Component

A **component** is a reusable, self-contained unit of functionality — more
than a single function, less than a full application. A component encapsulates
everything it needs: its logic, its state, and its interface to the outside
world. Components are designed to be used in multiple places without
modification — you configure them, you don't alter their internals.

Components are most visible in UI frameworks (React components, Vue
components), but the concept applies broadly: a `PaginationComponent`
that handles page navigation, a `ValidationComponent` that checks forms,
a `SearchComponent` that manages a search experience.

### Python

```python
class PaginationComponent:
    def __init__(self, items, page_size=10):
        self._items     = items
        self._page_size = page_size
        self._current   = 1

    @property
    def total_pages(self):
        return max(1, -(-len(self._items) // self._page_size))

    @property
    def current_page(self):
        return self._current

    def get_page(self):
        start = (self._current - 1) * self._page_size
        end   = start + self._page_size
        return self._items[start:end]

    def next_page(self):
        if self._current < self.total_pages:
            self._current += 1
        return self

    def prev_page(self):
        if self._current > 1:
            self._current -= 1
        return self

    def go_to(self, page):
        if 1 <= page <= self.total_pages:
            self._current = page
        return self

    def render(self):
        page_items = self.get_page()
        print(f"  Page {self._current}/{self.total_pages} "
              f"({len(self._items)} total items):")
        for item in page_items:
            print(f"    • {item}")
        nav = []
        if self._current > 1:             nav.append("[← Prev]")
        nav.append(f"[{self._current}]")
        if self._current < self.total_pages: nav.append("[Next →]")
        print(f"  Navigation: {' '.join(nav)}")


products = [f"Product {i:02d}" for i in range(1, 24)]
paginator = PaginationComponent(products, page_size=5)

paginator.render()
print()
paginator.next_page().render()
print()
paginator.go_to(5).render()
```

**Walkthrough — new syntax.** `-(-len(self._items) // self._page_size)` —
**ceiling division** without importing `math.ceil`: negating before integer
division and negating again gives the ceiling. For 23 items with page size
5: `-(-23 // 5)` = `-(- 5)` = `5` (because `-23 // 5 = -5` in Python's
floor division). `[f"Product {i:02d}" for i in range(1, 24)]` — the `:02d`
format specifier pads the number to at least 2 digits with a leading zero:
`"01"`, `"02"`, ..., `"23"`.

```
  Page 1/5 (23 total items):
    • Product 01
    • Product 02
    • Product 03
    • Product 04
    • Product 05
  Navigation: [1] [Next →]

  Page 2/5 (23 total items):
    • Product 06
    • Product 07
    • Product 08
    • Product 09
    • Product 10
  Navigation: [← Prev] [2] [Next →]

  Page 5/5 (23 total items):
    • Product 21
    • Product 22
    • Product 23
  Navigation: [← Prev] [5]
```

**CS lens.** A component is a specific application of **encapsulation**:
all the state needed to manage pagination (`_items`, `_page_size`,
`_current`) and all the behavior (`next_page`, `prev_page`, `get_page`,
`render`) live together, with a clean interface (the public methods) and
hidden internals. The same `PaginationComponent` can paginate any list —
users, orders, products — without modification.

**SE lens.** The component concept is central to modern frontend
development: React's function components, Vue's single-file components,
and Web Components are all implementations of the same idea — a
reusable, self-contained unit that manages its own state and renders its
own output. On the backend, "component" is used more loosely, but the
same principle applies: encapsulate a coherent piece of functionality
so it can be reused across contexts.

### TypeScript

```typescript
class PaginationComponent {
  private current = 1;

  constructor(
    private items: string[],
    private pageSize: number = 10
  ) {}

  get totalPages(): number {
    return Math.ceil(this.items.length / this.pageSize);
  }

  get currentPage(): number {
    return this.current;
  }

  getPage(): string[] {
    const start = (this.current - 1) * this.pageSize;
    return this.items.slice(start, start + this.pageSize);
  }

  nextPage(): this {
    if (this.current < this.totalPages) this.current++;
    return this;
  }

  prevPage(): this {
    if (this.current > 1) this.current--;
    return this;
  }

  goTo(page: number): this {
    if (page >= 1 && page <= this.totalPages) this.current = page;
    return this;
  }

  render(): void {
    const pageItems = this.getPage();
    console.log(`  Page ${this.current}/${this.totalPages} (${this.items.length} total items):`);
    pageItems.forEach((item) => console.log(`    • ${item}`));
    const nav: string[] = [];
    if (this.current > 1)              nav.push("[← Prev]");
    nav.push(`[${this.current}]`);
    if (this.current < this.totalPages) nav.push("[Next →]");
    console.log(`  Navigation: ${nav.join(" ")}`);
  }
}

const products = Array.from({ length: 23 }, (_, i) =>
  `Product ${String(i + 1).padStart(2, "0")}`
);

const paginator = new PaginationComponent(products, 5);

paginator.render();
console.log();
paginator.nextPage().render();
console.log();
paginator.goTo(5).render();
```

**Walkthrough — new syntax.** `Array.from({ length: 23 }, (_, i) => ...)` —
`Array.from` with a mapping function creates an array of 23 elements where
each element is produced by the mapping function; `_` is the element value
(unused — arrays created this way have `undefined` elements), `i` is the
index. `String(i + 1).padStart(2, "0")` converts the number to a string
and pads it to length 2 with leading zeros — `"1"` becomes `"01"`.
`return this` on `nextPage`, `prevPage`, and `goTo` returns the component
itself, enabling method chaining — the same fluent interface pattern from
Glossary 02's Builder.

```
  Page 1/5 (23 total items):
    • Product 01
    • Product 02
    • Product 03
    • Product 04
    • Product 05
  Navigation: [1] [Next →]

  Page 2/5 (23 total items):
    • Product 06
    • Product 07
    • Product 08
    • Product 09
    • Product 10
  Navigation: [← Prev] [2] [Next →]

  Page 5/5 (23 total items):
    • Product 21
    • Product 22
    • Product 23
  Navigation: [← Prev] [5]
```

---

## Concept 5: Package

A **package** is a collection of related modules distributed as a single
installable unit. You install a package; it provides one or more modules
you can import. In Python, packages are installed with `pip` and listed
in `requirements.txt` or `pyproject.toml`. In TypeScript/JavaScript,
packages are installed with `npm` and listed in `package.json`.

This concept is demonstrated differently from the others — there's no
runnable "package" example per se, because a package is a distribution
mechanism, not a runtime concept. Instead, this section shows what package
metadata looks like, and what using a package looks like from the consumer's
perspective.

### Python

```python
# What a package's structure looks like on disk:
#
# my_package/
#   __init__.py          <- makes this directory a Python package
#   core.py              <- one module
#   utils.py             <- another module
#   models/
#     __init__.py
#     user.py
#     order.py

# What pyproject.toml looks like (the modern Python package manifest):
pyproject_toml_example = """
[project]
name = "my-package"
version = "1.0.0"
description = "A sample package"
requires-python = ">=3.10"
dependencies = [
    "requests>=2.28.0",
    "pydantic>=2.0.0",
]
"""

# What importing from a package looks like:
# from my_package.core import MainClass
# from my_package.utils import helper_function
# from my_package.models.user import UserModel

# The key distinction: Module vs Package
# A MODULE is a single .py file: math_utils.py
# A PACKAGE is a directory with __init__.py: my_package/
# A package contains modules; you import from both the same way.

print("Package structure example (not executable — showing concepts):")
print(pyproject_toml_example)

# Simulating what a package's public API looks like after import:
class SimulatedPackageAPI:
    """Simulates what 'import my_package' would expose"""

    VERSION = "1.0.0"

    @staticmethod
    def process(data):
        return f"Processed: {data}"

    @staticmethod
    def validate(data):
        return bool(data)


pkg = SimulatedPackageAPI()
print(f"Package version: {SimulatedPackageAPI.VERSION}")
print(pkg.process("some data"))
print(f"Valid: {pkg.validate('data')}, Invalid: {pkg.validate('')}")
```

```
Package structure example (not executable — showing concepts):

[project]
name = "my-package"
version = "1.0.0"
description = "A sample package"
requires-python = ">=3.10"
dependencies = [
    "requests>=2.28.0",
    "pydantic>=2.0.0",
]

Package version: 1.0.0
Processed: some data
Valid: True, Invalid: False
```

**Walkthrough:** `__init__.py` is the file that makes a directory a Python
package — it can be empty, or it can define what `from my_package import
...` exposes. The `pyproject.toml` is the modern Python package manifest:
it declares the package name, version, and dependencies. When someone runs
`pip install my-package`, pip downloads the package and installs it so
`import my_package` works anywhere in that Python environment.

**CS lens — packages and dependency management.** A package declares its
own dependencies (`requests>=2.28.0`), which have their own dependencies.
`pip` and `npm` perform **dependency resolution**: finding versions of all
required packages that are mutually compatible. The **lock file**
(`requirements.txt` for pip, `package-lock.json` for npm) records the
exact resolved versions so every developer and every deployment gets
identical dependencies.

**SE lens.** The package ecosystem is one of the greatest productivity
multipliers in software development: instead of writing HTTP clients,
JSON parsers, and cryptographic algorithms from scratch, you install
packages. The trade-offs are real: every dependency is code you didn't
write and don't fully control, with its own bugs, security vulnerabilities,
and update cycles. Package hygiene — keeping dependencies current,
minimizing unnecessary dependencies, auditing for vulnerabilities — is a
real maintenance concern in production software.

---

## Connect the pieces

**Layer**, **Module**, **Namespace**, **Component**, and **Package** are
five answers to five different organizational questions:

- *How should I divide my codebase by responsibility?* → **Layer**
  (presentation / business logic / data)
- *How should I group related code into importable units?* → **Module**
  (one file, clear public interface)
- *How do I prevent naming conflicts between modules?* → **Namespace**
  (prefix identifiers with a container name)
- *How do I build a reusable self-contained unit of functionality?* →
  **Component** (encapsulates state, behavior, and rendering)
- *How do I distribute and consume reusable code across projects?* →
  **Package** (installable collection of modules with declared dependencies)

These concepts operate at different scales: a Package contains Modules;
Modules live in Layers; Namespaces prevent conflicts between Modules;
Components are the reusable building blocks within and across Layers.

## What breaks without these distinctions

Without Layers, business logic leaks into presentation code and data
access leaks into business logic — each class becomes harder to test and
change as it accumulates responsibilities that don't belong to it. Without
Modules with clear public interfaces, any internal detail of any file
becomes something other files can depend on — making refactoring risky
because any change might break an unknown caller. Without Namespaces,
name collisions between libraries and your own code produce hard-to-debug
behavior. Without thinking in Components, reusable UI or logic gets
duplicated rather than extracted.

## Definition of done

- [ ] You can name the three classic layers of a web application and
      describe what responsibility each owns.
- [ ] You can explain what a module's "public interface" means and why
      keeping internals private makes refactoring safer.
- [ ] You can explain what problem namespaces solve using the
      `DateUtils.format` / `CurrencyUtils.format` example.
- [ ] You can explain what makes a component "self-contained" — what it
      owns versus what it exposes.
- [ ] You can explain the difference between a module and a package.
- [ ] You've run all five examples in Python and TypeScript and confirmed
      matching output.
