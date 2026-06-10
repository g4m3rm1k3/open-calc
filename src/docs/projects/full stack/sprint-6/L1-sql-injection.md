# Sprint 6 · Lesson 1 — SQL injection: the vulnerability and the defence

## What you will build

By the end of this lesson, you understand exactly how SQL injection works (by exploiting string concatenation in queries), why SQLAlchemy's parameterised queries prevent it, and how Pydantic provides a second line of defence. You will see the attack execute, see the parameterised defence prevent it, and add a test that verifies injection attempts fail harmlessly.

---

## What you need to know first

- Sprint 3 L2: Raw SQL syntax, `WHERE` clauses, string quoting.
- Sprint 3 L3: SQLAlchemy ORM, `db.query().filter().first()`.
- Sprint 2 L2: Pydantic `BaseModel`, field validation.

---

## The lesson

---

### 1. What SQL injection is

**The problem:** If your application builds SQL queries by concatenating user-supplied strings, an attacker can close your query early and append their own SQL. This is not a hypothetical threat — SQL injection is on the OWASP Top 10 list and has caused some of the most consequential data breaches in history.

**How it happens:** Imagine a login check written with string concatenation (do not write this):

```python
# VULNERABLE - never write this
username = request_body["username"]
query = f"SELECT * FROM users WHERE username = '{username}'"
db.execute(query)
```

A legitimate username: `alice`. The query becomes:
```sql
SELECT * FROM users WHERE username = 'alice'
```

An attacker provides: `alice' OR '1'='1`

The query becomes:
```sql
SELECT * FROM users WHERE username = 'alice' OR '1'='1'
```

`'1'='1'` is always true. The `WHERE` clause evaluates to `TRUE` for every row. The query returns every user in the database. The attacker bypasses the username check entirely.

Worse: `alice'; DROP TABLE users; --`

The query becomes:
```sql
SELECT * FROM users WHERE username = 'alice'; DROP TABLE users; --'
```

The `;` ends the SELECT statement. `DROP TABLE users` runs next. `--` comments out the trailing quote. The users table is gone.

**Run this safely in psql to see the mechanics (no DROP, just explore):**

```sql
-- Create a test scenario
CREATE TABLE injection_demo (username TEXT);
INSERT INTO injection_demo VALUES ('alice'), ('bob');

-- The safe query
SELECT * FROM injection_demo WHERE username = 'alice';
-- Returns: alice

-- What the injected query looks like
SELECT * FROM injection_demo WHERE username = 'alice' OR '1'='1';
-- Returns: alice, bob (all rows)

-- Clean up
DROP TABLE injection_demo;
```

**CS lens — the category error: code/data confusion.** SQL injection is a category error: data (the username) is interpreted as code (SQL syntax). This happens whenever a program builds executable syntax by concatenating data. The same category error underlies: shell injection (filenames interpreted as shell commands), XSS (user data interpreted as HTML/JavaScript), and command injection. The root cause is always the same: the program fails to maintain the boundary between "this is data" and "this is executable code."

**SE lens — OWASP Top 10 as an industry audit.** The OWASP Top 10 is a list of the most common and critical web application security risks, updated every few years. Injection (including SQL injection) is consistently in the top 3. It is not a theoretical concern — in 2009, Heartland Payment Systems lost 134 million credit card numbers to SQL injection; in 2014, a major retail chain lost 70 million customer records the same way. The defence is well-understood and cheap to implement. There is no excuse for vulnerable code in production.

---

### 2. Why SQLAlchemy prevents injection

**The protection:** SQLAlchemy never builds SQL queries by concatenating strings. It uses **parameterised queries** (also called prepared statements). In a parameterised query, the SQL template and the values are sent to the database separately. The database engine handles them separately — values can never become part of the SQL syntax.

Your existing code:
```python
user = db.query(UserModel).filter(UserModel.username == user_data.username).first()
```

SQLAlchemy compiles this to:
```sql
SELECT users.id, users.username, users.hashed_password
FROM users
WHERE users.username = $1
```

And sends `user_data.username` as the value for `$1` — separately from the SQL string. If `user_data.username` is `alice' OR '1'='1`, the database receives:

```
SQL:    SELECT ... FROM users WHERE users.username = $1
Value:  alice' OR '1'='1
```

The database looks for a user with the literal username `alice' OR '1'='1` (including the quotes and SQL keywords). It finds none. It returns no rows. The injection string is data — it is never parsed as SQL.

**Verify this with SQLAlchemy's echo mode:** Enable `echo=True` on the engine temporarily:

```python
engine = create_engine(DATABASE_URL, echo=True)
```

Run a request. The console shows the SQL SQLAlchemy sends and the parameters separately:

```
INFO sqlalchemy.engine.Engine SELECT users.username ... WHERE users.username = %(username_1)s
INFO sqlalchemy.engine.Engine [generated in 0.00014s] {'username_1': 'alice'}
```

The `%(username_1)s` is a parameter placeholder. The value `'alice'` is listed separately. They are never concatenated.

**What about raw SQL?** If you use `db.execute(text("SELECT ... WHERE username = :name"), {"name": username})` — SQLAlchemy's `text()` construct — this is still parameterised. The `:name` is a named parameter, not string interpolation. SQLAlchemy sends the parameter separately.

**Never write this:**
```python
db.execute(text(f"SELECT * FROM users WHERE username = '{username}'"))
```

This breaks out of SQLAlchemy's parameterisation by doing the concatenation yourself before passing to `text()`. The protection is bypassed.

**CS lens — the database as a separate trust boundary.** When the database receives a parameterised query, it parses the SQL template once and then substitutes parameter values. The parsing happens before substitution — so parameter values cannot change the parsed structure. This is enforced by the database engine, not the application code. Even a buggy application that passes a malicious value as a parameter cannot inject SQL — the database's parser has already decided the query structure.

**SE lens — ORM as accidental security.** SQLAlchemy's parameterisation is not primarily a security feature — it is a performance feature (the database can cache compiled query plans). Security is a side effect. This is a recurring pattern in software: building the right abstraction (ORM over string concatenation) gives you performance, type safety, maintainability, AND security. When you reach for string concatenation to "simplify" a query, you lose all four simultaneously.

**What breaks without this:** If a developer adds a search endpoint that accepts a query string and builds a `LIKE` clause with f-string interpolation: `f"WHERE title LIKE '%{search_term}%'"` — the application is vulnerable, even though all other queries use the ORM. A single vulnerable endpoint is enough for an attacker. Code review must check every place that constructs SQL.

---

### 3. Pydantic as the second defence line

**The problem:** Parameterisation is the primary defence. But Pydantic provides a second, independent layer: it validates and rejects malformed input before it even reaches the database layer.

Your `UserCreate` model:

```python
class UserCreate(BaseModel):
    username: str
    password: str
```

A basic injection attempt: `"username": "alice' OR '1'='1"` — Pydantic accepts this because it is a valid string. Parameterisation handles it.

But Pydantic can enforce stricter validation to reject injection-like strings at the boundary:

```python
from pydantic import BaseModel, field_validator
import re

class UserCreate(BaseModel):
    username: str
    password: str

    @field_validator('username')
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Username must contain only letters, numbers, underscores, and hyphens')
        return v
```

Now `"alice' OR '1'='1"` fails Pydantic validation at the HTTP boundary — 422, before the database is involved at all.

**The allowlist principle:** The validator uses an allowlist (only allow `[a-zA-Z0-9_-]`) rather than a denylist (reject strings containing `'`, `;`, `--`). Denylists are always incomplete — attackers use encodings, Unicode variations, and other tricks to bypass them. An allowlist defines exactly what is valid; anything not matching is rejected. The allowlist approach cannot be bypassed by encoding tricks because the encoding is decoded before validation.

**Add the validator and a test:**

Add `@field_validator('username')` to `UserCreate` as shown above.

Add to `backend/tests/test_auth.py`:

```python
def test_register_rejects_username_with_special_chars(client: TestClient):
    # Arrange: username with SQL injection characters
    response = client.post("/auth/register", json={
        "username": "alice' OR '1'='1",
        "password": "anypassword"
    })

    # Assert: Pydantic rejects the username at the HTTP boundary
    assert response.status_code == 422

def test_register_accepts_valid_username_formats(client: TestClient):
    # Arrange
    valid_usernames = ["alice", "bob_smith", "user-123", "Admin99"]
    for username in valid_usernames:
        response = client.post("/auth/register", json={
            "username": username,
            "password": "testpass"
        })
        # Assert: valid usernames are accepted
        assert response.status_code == 201
```

**Walkthrough — `@field_validator`:**

`@field_validator('username')` — Pydantic V2's validator decorator. The argument names the field to validate.

`@classmethod` — required for Pydantic V2 field validators. The validator receives the class (`cls`) and the field value (`v`).

`re.match(r'^[a-zA-Z0-9_-]+$', v)` — anchored regex. `^` matches the start; `$` matches the end. The character class `[a-zA-Z0-9_-]` allows letters, numbers, underscores, and hyphens. `+` requires at least one character. If the regex does not match (any other character present), `raise ValueError(...)`.

`raise ValueError('...')` — Pydantic catches `ValueError` raised in validators and wraps it in a `ValidationError`, which FastAPI converts to a 422 response.

**CS lens — defence in depth.** Using both parameterised queries AND Pydantic validation is **defence in depth**: two independent layers, each sufficient to prevent injection on its own. If parameterisation is somehow bypassed (unlikely with SQLAlchemy, but possible with raw SQL), Pydantic catches it. If a developer bypasses Pydantic validation (also unlikely), parameterisation catches it. Two independent defences are exponentially harder to defeat than one.

**SE lens — validation errors at the boundary vs. database errors.** Without Pydantic validation, an injection string reaches the database layer and is handled by parameterisation. The user receives a 401 (login failed) or 422 (if the type is wrong). With Pydantic validation, the string is rejected at the HTTP boundary with a clear error message. The second approach is better: it fails fast (the database is never involved), provides clearer error messages, and reduces database load. Validate at the boundary.

**Real-world connection:** Every major SaaS platform validates input at the API boundary before it reaches the database. This is not special security code — it is standard input handling. Pydantic makes this free: the validator runs automatically on every request with no additional code in route handlers.

---

## Connect the pieces

SQL injection is the oldest and most consistently dangerous web vulnerability. Your application is protected by two layers: SQLAlchemy's parameterised queries (primary) and Pydantic field validators (secondary). The test suite now includes injection attempt tests that verify both layers hold.

Lesson 2 covers IDOR (Insecure Direct Object Reference): what happens when a user accesses another user's data by guessing IDs.

---

## What breaks without this

**Allowlist validator removing a needed character:** If usernames need to support `@` for email-based logins, the validator `[a-zA-Z0-9_-]` rejects them. Fix: expand the allowlist: `[a-zA-Z0-9_.@-]`. The lesson is: define your allowlist based on real business requirements, not a minimal security requirement.

---

## Definition of done

- [ ] You can explain the mechanics of SQL injection using a specific example
- [ ] You can explain why parameterised queries prevent injection at the database level
- [ ] `UserCreate.username` has a `@field_validator` that rejects special characters
- [ ] `test_register_rejects_username_with_special_chars` passes (422 on injection attempt)
- [ ] `test_register_accepts_valid_username_formats` passes (valid usernames work)
- [ ] You can explain the difference between allowlist and denylist validation and why allowlist is better
- [ ] You can explain what "defence in depth" means in this context

**Git commit:**

```
git add backend/models.py backend/tests/test_auth.py
git commit -m "Add SQL injection defence: username allowlist validator in Pydantic, injection tests verifying parameterised queries"
```
