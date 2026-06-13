# FOUNDATIONS — LAB-063 — Integration Testing

**Series:** FOUNDATIONS — Part X: Testing
**Environment:** Node.js with better-sqlite3 (or browser with sql.js for a no-install option)
**Time:** 45–60 minutes.

---

## What You Will Build

An integration test that inserts a record into a real SQLite database, reads it back through the production query function, and asserts the values match. You will also see the exact category of bug that unit tests with stubs cannot catch but integration tests can. After this lab you will understand where integration tests sit in the test pyramid and when they are necessary.

---

## What You Need to Know First

**From LAB-062 (Test Doubles):** Unit tests use doubles to avoid real dependencies. Integration tests deliberately use real dependencies to catch the bugs that doubles hide.

**From LAB-114 (SQL — Queries and Joins):** You will use basic SQL INSERT and SELECT statements. This lesson introduces SQL at first contact if you have not done LAB-114 yet.

---

> **Quick Check — try to answer before reading:**
>
> 1. What is the specific class of bug that a unit test with an in-memory stub database cannot catch?
> 2. Why does an integration test run slower than a unit test?
> 3. What does "real dependencies" mean in an integration test?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — SQLite and SQL at First Contact

**SQLite** is an embedded database engine — it runs inside the application process, stores data in a single file (or in memory), and requires no separate server. It is widely used in mobile apps, embedded systems, and tests.

**SQL** — Structured Query Language — is a declarative language for querying relational data. A relational database stores data in tables (rows and columns). The four basic SQL operations are:

- `CREATE TABLE name (column type, ...)` — define the table structure
- `INSERT INTO table (columns) VALUES (values)` — add a row
- `SELECT columns FROM table WHERE condition` — retrieve rows
- `DELETE FROM table WHERE condition` — remove rows

For this lesson, we use SQLite in-memory mode (`:memory:`) — the database exists only for the duration of the test and is destroyed when the process ends.

---

### Step 2 — The Production Code Under Test

```typescript
// userRepository.ts — production code that talks to the real database

interface User {
  id: number;
  name: string;
  email: string;
}

interface DatabaseConnection {
  run(sql: string, params?: unknown[]): void;
  get(sql: string, params?: unknown[]): unknown;
  all(sql: string, params?: unknown[]): unknown[];
}

class UserRepository {
  private readonly db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  createTable(): void {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id    INTEGER PRIMARY KEY AUTOINCREMENT,
        name  TEXT    NOT NULL,
        email TEXT    NOT NULL UNIQUE
      )
    `);
  }

  saveUser(name: string, email: string): void {
    // Parameterized query — the ? placeholders are filled by the params array.
    // This prevents SQL injection: the database engine treats the params as data,
    // not as SQL syntax, even if they contain SQL characters like ' or ;
    this.db.run(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );
  }

  findByEmail(email: string): User | null {
    const row = this.db.get(
      'SELECT id, name, email FROM users WHERE email = ?',
      [email]
    ) as User | undefined;
    return row ?? null;
  }
}
```

**The walkthrough of the SQL:**

`CREATE TABLE IF NOT EXISTS users (...)` — creates the `users` table if it does not already exist. `INTEGER PRIMARY KEY AUTOINCREMENT` means the `id` column is an integer, is the primary key (every row has a unique id), and its value is assigned automatically (1, 2, 3, …). `TEXT NOT NULL` means the column stores text and cannot be left empty. `UNIQUE` means no two rows can have the same email.

`INSERT INTO users (name, email) VALUES (?, ?)` — adds a row. The `?` placeholders are parameterized — the actual values are passed separately as `[name, email]`. The database engine substitutes them safely. If `name` contained SQL syntax like `'; DROP TABLE users;`, the parameterized query treats it as literal text, not SQL — this is how SQL injection is prevented.

`SELECT id, name, email FROM users WHERE email = ?` — retrieves the row where `email` matches. `?` is parameterized for the same safety reason.

---

### Step 3 — The Integration Test

```typescript
// userRepository.integration.test.ts

// In a real project you would import better-sqlite3 here.
// For this lesson, we simulate a minimal SQLite-like interface so
// the lesson is self-contained. Replace with real SQLite for real projects.

class SimpleInMemoryDb implements DatabaseConnection {
  private tables: Map<string, unknown[]> = new Map();
  private nextId: number = 1;

  run(sql: string, params: unknown[] = []): void {
    // A minimal SQL interpreter sufficient for this lesson's tests.
    // A real integration test would use actual SQLite here.
    if (sql.trim().toUpperCase().startsWith('CREATE TABLE')) {
      const tableMatch = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        if (!this.tables.has(tableName)) {
          this.tables.set(tableName, []);
        }
      }
    } else if (sql.trim().toUpperCase().startsWith('INSERT INTO users')) {
      const rows = this.tables.get('users') ?? [];
      rows.push({ id: this.nextId++, name: params[0], email: params[1] });
      this.tables.set('users', rows);
    }
  }

  get(sql: string, params: unknown[] = []): unknown {
    if (sql.includes('WHERE email = ?')) {
      const rows = (this.tables.get('users') ?? []) as Array<{ email: string }>;
      return rows.find(row => row.email === params[0]) ?? undefined;
    }
    return undefined;
  }

  all(_sql: string, _params: unknown[] = []): unknown[] {
    return [];
  }
}

function assertEqual<T>(actual: T, expected: T, name: string): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`FAIL: ${name}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`);
  }
  console.log(`PASS: ${name}`);
}

// Integration Test 1: save a user and read it back
function test_saveAndRetrieveUser(): void {
  // Arrange — fresh database for this test:
  const db         = new SimpleInMemoryDb();
  const repository = new UserRepository(db);
  repository.createTable();

  // Act — use production code to save:
  repository.saveUser('Alice', 'alice@example.com');

  // Assert — use production code to retrieve:
  const foundUser = repository.findByEmail('alice@example.com');

  assertEqual(foundUser?.name,  'Alice',             'retrieved user has correct name');
  assertEqual(foundUser?.email, 'alice@example.com', 'retrieved user has correct email');
  if (!foundUser?.id) {
    throw new Error('FAIL: retrieved user should have an auto-assigned id');
  }
  console.log('PASS: retrieved user has an auto-assigned id');
}

// Integration Test 2: missing user returns null
function test_findByEmail_missingUserReturnsNull(): void {
  const db         = new SimpleInMemoryDb();
  const repository = new UserRepository(db);
  repository.createTable();

  const result = repository.findByEmail('nobody@example.com');
  assertEqual(result, null, 'findByEmail returns null for unknown email');
}

test_saveAndRetrieveUser();
test_findByEmail_missingUserReturnsNull();
```

**The walkthrough:** Each test creates a fresh `SimpleInMemoryDb` (equivalent to a fresh SQLite `:memory:` database) and a `UserRepository` using that database. The test calls `saveUser` and then `findByEmail` — both are production code paths, not test helpers. The assertion is on the returned user object, verifying its fields match what was inserted.

**The CS lens — what an integration test actually tests.** The integration test tests the whole path: the TypeScript code constructs a SQL string with parameterized values, the database engine executes that SQL, and the result travels back through the TypeScript mapping layer. A unit test with a stub database skips all of that — it only tests the TypeScript logic, not the SQL.

**The SE lens — the schema mismatch bug.** The classic integration test bug: a developer renames the `email` column to `email_address` in the database schema. A unit test with a stub still passes — the stub does not check SQL column names. An integration test fails immediately with a SQL error pointing to the column name mismatch.

---

### Step 4 — What Unit Tests Cannot Catch

```typescript
// Unit test with a stub — this test PASSES even with a SQL column name bug:
const fakeRepository = {
  saveUser(_name: string, _email: string): void {
    // stub — ignores the SQL completely
  },
  findByEmail(_email: string): User | null {
    return { id: 1, name: 'Alice', email: 'alice@example.com' };  // hardcoded
  }
};

// This test would pass even if the SQL said "SELECT name, email_address FROM..."
// because the stub returns a hardcoded object without touching any SQL.
```

**The walkthrough:** The stub always returns `{ id: 1, name: 'Alice', email: '...' }` regardless of what SQL the production code generates. A column rename from `email` to `email_address` in the production code would not cause this test to fail. Only the integration test — running real SQL against a real database — catches that error.

---

## Connect the Pieces

- **Real SQLite** in Node.js: `npm install better-sqlite3`. The API is synchronous. `const db = new Database(':memory:')` creates an in-memory database. `db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run('Alice', 'alice@example.com')` executes the parameterized query.
- **Integration tests and transaction rollback.** In real test suites, each integration test runs inside a database transaction that is rolled back after the test. This clears all test data without re-creating the schema, making tests fast and independent.
- **Docker in CI/CD.** Integration tests in production projects spin up a real database as a Docker container (LAB-123) on CI, run the test suite against it, then discard the container. This keeps the CI environment consistent.

---

## What Breaks Without This

**The production schema mismatch:**

A developer renames a column in a migration, updates the ORM model, runs unit tests (all pass — stubs return hardcoded data), and ships to production. The first request hits the endpoint, the ORM generates `SELECT ... email_address FROM users`, the database says `column email_address does not exist`, and every user-facing page returns a 500 error.

An integration test running the same query against the real schema would have caught this before the code left the developer's machine.

---

## Definition of Done

- [ ] `UserRepository` connects to a real (or realistic in-memory) database and uses parameterized queries
- [ ] Integration test saves a user and retrieves them, asserting `name`, `email`, and `id` fields
- [ ] A second integration test verifies `findByEmail` returns `null` for a nonexistent user
- [ ] You can explain in one sentence what class of bug the unit stub test cannot catch
- [ ] SQL injection is prevented by parameterized queries — you can explain why

**Git commit:**

```
git add src/
git commit -m "LAB-063: Integration testing — UserRepository saves and retrieves through real SQL; schema mismatch bug shown that unit stub tests miss"
```

---

## Quick Check Answers

1. **A unit test with an in-memory stub cannot catch schema mismatches** — situations where the SQL the production code generates does not match the actual database schema (wrong column names, wrong table names, wrong data types). The stub returns hardcoded data, bypassing the SQL layer entirely.
2. **An integration test runs slower because it uses real dependencies** — a real database engine (even in-memory SQLite) has startup time, SQL parsing, query planning, and disk I/O (or memory allocation) that stub objects do not. This is why integration tests are fewer in number than unit tests.
3. **"Real dependencies" means the test uses the actual implementation of the dependency** — not a stub, fake, or mock. For a database test, the real dependency is the actual SQLite engine, running real SQL, with real constraint checking. For an HTTP test, the real dependency is an actual HTTP server running on a real port.
