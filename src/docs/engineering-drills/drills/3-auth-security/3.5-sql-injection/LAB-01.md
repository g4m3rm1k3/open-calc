# Drill 3.5 — SQL Injection: The Attack and the Fix

**Standalone drill. No prerequisites except basic Python.**
**Time estimate:** 60–75 minutes
**Environment:** Python 3.8+ with sqlite3 (built-in) and Flask — `pip install flask`
**What you will build:** A vulnerable login form — demonstrate three attacks, then fix each with parameterized queries. The attack runs before the fix is shown.
**What you will understand:** How SQL injection works, why string concatenation in queries is always dangerous, and why parameterized queries are the only correct fix

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. Your login query is: `f"SELECT * FROM users WHERE username='{username}'"`. A user enters `' OR '1'='1` as the username. Write out the complete SQL that reaches the database. What does it return?

2. What is the difference between input validation ("only allow alphanumeric characters") and parameterized queries as defenses against SQL injection? Which one is sufficient on its own?

3. An ORM like SQLAlchemy writes SQL for you. Does that mean your code is automatically safe from SQL injection? When is it not?

4. A second-order SQL injection is stored in the database and executed later — not on initial insertion. How does this bypass "I sanitized the input when I stored it" defenses?

*(Answers at the bottom.)*

---

## The Concept: How SQL Injection Works

### Concept: SQL Injection

**What it is:**
SQL injection occurs when user-supplied input is interpreted as SQL code rather than as data. The attacker's input changes the structure of the SQL query — adding conditions, adding statements, or commenting out parts of the original query.

**The problem — string concatenation:**

```python
# VULNERABLE — never do this
username = request.form["username"]
query = f"SELECT * FROM users WHERE username='{username}'"
cursor.execute(query)
```

When `username` is `alice`, the query is:
```sql
SELECT * FROM users WHERE username='alice'
```

When `username` is `' OR '1'='1`:
```sql
SELECT * FROM users WHERE username='' OR '1'='1'
```

`'1'='1'` is always true. The WHERE clause now matches every row. The attacker is logged in without a valid password.

**Three attack types to demonstrate:**

1. **Authentication bypass:** `' OR '1'='1` — always-true condition
2. **Data extraction:** `' UNION SELECT username, password, null FROM users --` — steal all users
3. **Data destruction:** `'; DROP TABLE users; --` — delete the table

**The solution — parameterized queries:**

```python
# CORRECT — parameterized query
cursor.execute(
    "SELECT * FROM users WHERE username = ?",
    (username,)   # the tuple is passed separately — never interpolated into the SQL
)
```

The `?` is a placeholder. The database driver sends the SQL template and the parameters separately. The database engine applies the parameters as data, never as code. The injection string `' OR '1'='1` is treated as a literal username to search for — not as SQL syntax.

**What it hides:**
The database driver's parameter binding. You never see the escaping or type-safe serialization that happens internally. The invariant the driver protects: parameters are always treated as data, regardless of their contents.

**Canonical example:**
A form with two fields: Name and Email. If the Name field is not sanitized, an attacker enters `Robert'); DROP TABLE Students; --`. The school's database runs `INSERT INTO Students VALUES('Robert'); DROP TABLE Students; --')` and loses all student records. (This is the "Little Bobby Tables" XKCD comic — it happens in real databases.)

**Constraints:**
- ORMs (SQLAlchemy, Django ORM) use parameterized queries for normal operations — but raw SQL via `text()`, `execute()`, or `raw_query()` can still be vulnerable if you build the string yourself
- Stored procedures are not immune — if the procedure builds dynamic SQL with string concatenation internally, it can be injected
- Parameterized queries prevent injection in WHERE clauses, but you cannot parameterize table names or column names — dynamic table names require a whitelist

**Failure modes:**
- Developer "sanitizes" input by removing single quotes — attackers use double quotes, Unicode, URL encoding, or hex encoding to bypass
- ORM used correctly for queries, but one `raw_query(f"... WHERE id={user_id}")` — that one line is the vulnerability
- Second-order injection: store `admin'--` as a username (safely), then use it in a later query that builds SQL from stored data
- NoSQL injection: MongoDB's `{$where: "...JavaScript..."}` is equally vulnerable — parameterization needed there too

**Operational reality:**
SQL injection has been in OWASP Top 10 since the list began. It is the most common and most exploited web vulnerability. The 2011 LinkedIn breach (117 million passwords), the 2008 Heartland Payment Systems breach (130 million credit cards), and countless others exploited SQL injection. The fix is trivially simple — parameterized queries. The tragedy is that it keeps happening because developers use string formatting for convenience.

**You will see this again in:**
Every backend that touches a database — Flask, Django, FastAPI, Express, Rails. The pattern is the same in every language: use parameterized queries (or a safe ORM) and never build SQL strings from user input.

**Watch for:**
Any SQL that contains an f-string, `.format()`, `%` formatting, or `+` concatenation with user-controlled data is potentially vulnerable. The test: can a user make the SQL do something you did not intend? If yes, you have an injection vulnerability.

---

## Step 1 — Build the Vulnerable App

Create `vulnerable_app.py`:

```python
# vulnerable_app.py — a login system with SQL injection vulnerabilities
# RUN THIS ONLY LOCALLY — never deploy vulnerable code
import sqlite3
from flask import Flask, request, jsonify

app = Flask(__name__)

# ── Database setup ─────────────────────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect("vulnerable.db")
    conn.row_factory = sqlite3.Row  # rows behave like dicts: row["username"]
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id       INTEGER PRIMARY KEY,
            username TEXT    NOT NULL UNIQUE,
            password TEXT    NOT NULL,
            role     TEXT    NOT NULL DEFAULT 'user'
        )
    """)
    # Seed some users
    conn.executemany("INSERT OR IGNORE INTO users (username, password, role) VALUES (?,?,?)", [
        ("alice",  "password123", "user"),
        ("bob",    "secret456",   "user"),
        ("admin",  "admin_pass",  "admin"),
    ])
    conn.commit()
    conn.close()


# ── VULNERABLE login endpoint ─────────────────────────────────────────────────

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "")
    password = data.get("password", "")

    conn = get_db()

    # ⚠️  VULNERABLE: string interpolation — NEVER DO THIS
    query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
    print(f"\n[VULNERABLE QUERY]: {query}")   # print the actual SQL so we can see the injection

    try:
        cursor = conn.execute(query)
        user = cursor.fetchone()
    except sqlite3.OperationalError as e:
        conn.close()
        return jsonify({"error": f"Database error: {e}"}), 500

    conn.close()

    if user:
        return jsonify({"success": True, "username": user["username"], "role": user["role"]})
    else:
        return jsonify({"success": False, "error": "Invalid credentials"}), 401


if __name__ == "__main__":
    init_db()
    print("Starting VULNERABLE app — for educational demonstration only")
    print("Never deploy this code.\n")
    app.run(port=5001, debug=False)
```

### SAVE AND TRY

Start the vulnerable server:
```bash
python vulnerable_app.py
```

In a second terminal, test a legitimate login:
```bash
curl -s -X POST http://localhost:5001/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "password123"}'
```

**Expected output:**
```json
{"success": true, "username": "alice", "role": "user"}
```

**Watch the server terminal** — it prints the actual SQL query. This is the key teaching tool.

**Change something:** Send a wrong password:
```bash
curl -s -X POST http://localhost:5001/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "wrong"}'
```
Expected: `{"error": "Invalid credentials"}`. The query logged shows `password='wrong'` — no match.

---

## Step 2 — The Attacks

**Attack 1: Authentication bypass**

```bash
curl -s -X POST http://localhost:5001/login \
  -H "Content-Type: application/json" \
  -d '{"username": "'"'"' OR '"'"'1'"'"'='"'"'1", "password": "anything"}'
```

Or use Python for clarity:
```python
import requests

# Authentication bypass — no valid password needed
response = requests.post("http://localhost:5001/login", json={
    "username": "' OR '1'='1",    # SQL injection payload
    "password": "anything"
})
print("Attack 1 result:", response.json())
```

**Expected output:**
```json
{"success": true, "username": "alice", "role": "user"}
```

Watch the server terminal — it logs:
```
[VULNERABLE QUERY]: SELECT * FROM users WHERE username='' OR '1'='1' AND password='anything'
```

`'1'='1'` is always true. The query returns the first user in the table. The attacker is logged in as alice without knowing her password.

**Attack 2: Data extraction with UNION**

```python
response = requests.post("http://localhost:5001/login", json={
    "username": "' UNION SELECT id, username, password, role FROM users --",
    "password": "anything"
})
print("Attack 2 result:", response.json())
```

**Expected output:** The attacker receives a valid user response containing data from the users table — specifically the first row returned by the UNION, which includes usernames and passwords from the entire table. The `--` comments out the rest of the original query.

**Attack 3: Database modification**

```python
# Note: sqlite3 by default doesn't allow multiple statements in execute()
# This attack works in MySQL and PostgreSQL — shown conceptually here
response = requests.post("http://localhost:5001/login", json={
    "username": "admin'; UPDATE users SET role='admin' WHERE username='bob'; --",
    "password": "anything"
})
print("Attack 3 result:", response.json())
# Even if the UPDATE doesn't execute due to sqlite3 restrictions,
# check the database: bob's role may now be 'admin'
```

### SAVE AND TRY (the attacks)

Run all three attacks and watch the server terminal. The key insight: the server is printing the actual SQL that ran. In production, a developer using an ORM would never see this SQL — the injection happens invisibly.

**Verify the damage:**
```bash
python -c "
import sqlite3
conn = sqlite3.connect('vulnerable.db')
rows = conn.execute('SELECT * FROM users').fetchall()
for row in rows:
    print(dict(row))
"
```

**Change something:** Modify the username to `' OR role='admin' --`. What user does the server return?

---

## Step 3 — The Fix: Parameterized Queries

Create `secure_app.py`:

```python
# secure_app.py — the same app, fixed with parameterized queries
import sqlite3
from flask import Flask, request, jsonify

app = Flask(__name__)

def get_db():
    conn = sqlite3.connect("secure.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'user'
        )
    """)
    conn.executemany("INSERT OR IGNORE INTO users (username, password, role) VALUES (?,?,?)", [
        ("alice", "password123", "user"),
        ("bob",   "secret456",   "user"),
        ("admin", "admin_pass",  "admin"),
    ])
    conn.commit()
    conn.close()


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "")
    password = data.get("password", "")

    conn = get_db()

    # ✅ SECURE: parameterized query — ? placeholders, parameters passed separately
    cursor = conn.execute(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        (username, password)
        # The database driver sends the SQL template and the parameters separately.
        # The database treats the parameters as DATA, never as CODE.
        # ' OR '1'='1 is searched as a literal username — it matches nothing.
    )
    user = cursor.fetchone()
    conn.close()

    # Log what the query would look like — notice there is no f-string
    print(f"\n[SECURE QUERY]: SELECT * FROM users WHERE username = ? AND password = ?")
    print(f"[PARAMETERS]:   ({repr(username)}, {repr(password)})")

    if user:
        return jsonify({"success": True, "username": user["username"], "role": user["role"]})
    else:
        return jsonify({"success": False, "error": "Invalid credentials"}), 401


if __name__ == "__main__":
    init_db()
    print("Starting SECURE app\n")
    app.run(port=5002, debug=False)
```

### SAVE AND TRY

Start the secure server:
```bash
python secure_app.py
```

Try all three attacks against port 5002:
```bash
# Attack 1: authentication bypass
curl -s -X POST http://localhost:5002/login \
  -H "Content-Type: application/json" \
  -d '{"username": "'"'"' OR '"'"'1'"'"'='"'"'1", "password": "anything"}'
```

**Expected output:** `{"error": "Invalid credentials"}` — the attack fails.

Watch the server terminal: `[PARAMETERS]: ("' OR '1'='1", 'anything')` — the injection string is treated as a literal username. No user has the username `' OR '1'='1`, so the query returns nothing.

```bash
# Attack 2: UNION data extraction
python -c "
import requests
r = requests.post('http://localhost:5002/login', json={
    'username': \"' UNION SELECT id, username, password, role FROM users --\",
    'password': 'anything'
})
print(r.json())
"
```

**Expected:** `{"error": "Invalid credentials"}` — the UNION is treated as a literal username.

**Change something:** Try a legitimate login on port 5002 with `alice`/`password123`. It still works — only malicious inputs are blocked. Verify the secure.db database is unchanged after running all three attacks.

---

## Challenge

**No solution provided. Requirements checklist only.**

Find and fix the SQL injection vulnerabilities in the provided inventory management script below. Each vulnerability is a different type.

**Provided vulnerable script:**
```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price REAL, stock INTEGER)")
conn.executemany("INSERT INTO products VALUES (?,?,?,?)", [
    (1, "Widget", 9.99, 100),
    (2, "Gadget", 24.99, 50),
    (3, "Doohickey", 4.99, 200),
])
conn.commit()

# Vulnerability 1: Search by name
def search_products(search_term):
    query = "SELECT * FROM products WHERE name LIKE '%" + search_term + "%'"
    return conn.execute(query).fetchall()

# Vulnerability 2: Get product by ID from URL parameter
def get_product(product_id: str):
    query = f"SELECT * FROM products WHERE id = {product_id}"
    return conn.execute(query).fetchone()

# Vulnerability 3: Update stock (stored, executed later)
def update_stock(product_name: str, new_stock: int):
    # product_name came from user input and was stored in a config table earlier
    query = f"UPDATE products SET stock = {new_stock} WHERE name = '{product_name}'"
    conn.execute(query)
    conn.commit()
```

**Requirements checklist:**

- [ ] All three functions use parameterized queries — no f-strings, no `+` concatenation, no `%` formatting with user input
- [ ] `search_products("Widget")` still returns the Widget row (functionality unchanged)
- [ ] `search_products("' OR '1'='1")` returns zero rows (injection blocked)
- [ ] `get_product("1")` returns the Widget (legitimate use works)
- [ ] `get_product("1 OR 1=1")` raises an error or returns nothing (injection blocked)
- [ ] `update_stock("Widget", 150)` updates the stock correctly
- [ ] `update_stock("Widget'; UPDATE products SET price=0 WHERE '1'='1", 150)` does NOT update all prices

**When you're done:** All three functions produce the correct results for legitimate inputs and produce no results (or raise errors) for injection strings. Run `SELECT * FROM products` after each injection attempt — the data should be unchanged.

**Stuck?** Ask AI: "In Python's sqlite3 module, how do I use a parameterized query with the LIKE operator? I want `WHERE name LIKE '%?%'` but that doesn't work — the `?` inside string quotes is not recognized as a parameter placeholder."

---

## Quick Check Answers

**1. What SQL reaches the database with `' OR '1'='1` as the username?**
`SELECT * FROM users WHERE username='' OR '1'='1' AND password='...'`. The single quote closes the `username='` string. Then `OR '1'='1'` is appended as additional SQL — and `'1'='1'` is always true. Due to SQL operator precedence (AND binds tighter than OR), this evaluates as `username='' OR ('1'='1' AND password='...')`. Since `'1'='1'` is true, this entire expression is true for every row where the password matches — but in many implementations the OR short-circuits and returns the first row regardless. The attacker gains access without knowing any valid password.

**2. Input validation vs parameterized queries — which is sufficient?**
Neither alone is fully sufficient, but parameterized queries are the essential fix — input validation is a defense-in-depth addition, not a replacement. Input validation that blocks single quotes can be bypassed with alternative encodings, double quotes, hex notation, or attacks that don't require quotes (like numeric injection: `WHERE id=1 OR 1=1`). Parameterized queries make injection structurally impossible — the database engine never sees the parameter as code. Use both: validate inputs to catch obvious garbage early, and use parameterized queries to ensure nothing slips through.

**3. Is an ORM automatically safe from SQL injection?**
For standard ORM operations (`.filter()`, `.get()`, `.create()`), yes — ORMs use parameterized queries internally. But `raw_query()`, `text()`, `execute()`, or any method that accepts a raw SQL string is only safe if you use parameterization there too. `User.objects.raw(f"SELECT * FROM users WHERE username='{username}'")` in Django is vulnerable despite using an ORM. The rule: never build a SQL string from user input, regardless of whether you're using an ORM or raw SQL.

**4. How does second-order SQL injection bypass input sanitization on storage?**
The attacker stores a safe-looking username like `admin'--`. When stored, this is handled safely — no injection on insert. But later, if another part of the application builds SQL from stored data: `query = f"SELECT * FROM logs WHERE username='{stored_username}'"`, the retrieved `admin'--` is injected into the new query. The single quote closes the string and `--` comments out the rest — a new injection in a different context. Defense: parameterize queries that read from the database too, not just queries that accept user input directly.
