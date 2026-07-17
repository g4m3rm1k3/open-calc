# Lesson 4: SQL Injection

Today we study **code and data sharing one channel** — the specific mechanical flaw that
lets a stranger's text become a stranger's *command*. Our case study is a login check
against a real database, and one nine-character string that logs you in as someone else
without ever knowing their password.

This is the injection lesson Lesson 1 was preparing you for. If Lesson 1's ending felt
like a cliffhanger — "this becomes dangerous once the interpreter can execute code" — this
is that interpreter.

## What you will learn

You'll build a working login check against a real SQL database, break it with a classic
injection payload, understand *exactly* why the database can't tell your code from an
attacker's data, and fix it with the single technique that eliminates this entire
vulnerability class — not a filter, not a blocklist, a structural fix.

## What you need to know first

Lesson 1 (Trust Boundaries): today's vulnerability is that exact pattern — untrusted
input reaching an interpreter with no checkpoint — with a database engine standing in for
`os.system`. Lesson 2 (CIA Triad): you'll see this attack break confidentiality (reading
data) and, briefly, understand why it can just as easily break integrity (changing or
deleting data). No prior SQL knowledge assumed — every SQL construct is explained at
first use, same as any other syntax in this course.

---

## The problem

**SQL** (Structured Query Language) is the language most databases use for reading and
writing data. A query like `SELECT * FROM users WHERE username = 'ada'` asks the database
for every row in the `users` table where the `username` column equals `ada`. Real
applications build these queries dynamically — the `'ada'` part is usually a variable,
not a literal typed by the programmer.

Here is the entire vulnerability in one sentence: **if you build that query by
concatenating a string, the database receives one single string and has no way to know
which characters were written by you, the programmer, and which characters were typed by
whoever is using your program.** To the database, code and data are made of the exact same
material — text — and once they're concatenated together, that distinction is gone
forever. This is Lesson 1's trust boundary problem, except the interpreter on the other
side isn't `print` — it's an engine that can read, change, or delete every row in your
database.

## The lab: a login check with a database behind it

**Disposable host.** A `users` table with two rows, built with Python's built-in
`sqlite3` module — no installation required, it ships with Python.

### Step 1 — a login check that concatenates

```python
import sqlite3

connection = sqlite3.connect(":memory:")
cursor = connection.cursor()
cursor.execute("CREATE TABLE users (username TEXT, password TEXT)")
cursor.execute("INSERT INTO users VALUES ('ada', 'hunter2')")
cursor.execute("INSERT INTO users VALUES ('grace', 'compiler1')")
connection.commit()

def check_login(username, password):
    query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'"
    print(query)
    cursor.execute(query)
    return cursor.fetchone() is not None

print(check_login("ada", "hunter2"))
print(check_login("ada", "wrongpassword"))
```

**New constructs.** `sqlite3.connect(":memory:")` opens a database that exists only in
memory for the life of this program — nothing is written to disk, which makes it perfect
for a disposable lab. A `cursor` is the object you use to run SQL statements and read
their results — think of it as the pen you use to write queries and the eyes you use to
read what comes back. `cursor.execute(sql_string)` sends `sql_string` to the database
engine to be parsed and run. `CREATE TABLE users (username TEXT, password TEXT)` defines a
table with two text columns. `INSERT INTO users VALUES (...)` adds a row.
`cursor.fetchone()` retrieves one matching row from the most recent query, or `None` if
there were no matches — `fetchone() is not None` is therefore `True` exactly when the
query found at least one row.

Run it, typing the correct password:

```
SELECT * FROM users WHERE username = 'ada' AND password = 'hunter2'
True
SELECT * FROM users WHERE username = 'ada' AND password = 'wrongpassword'
False
```

**Walkthrough.** `check_login` builds one long string by gluing the literal SQL text
together with whatever `username` and `password` hold, using `+`. The printed `query` line
shows you exactly what gets sent to the database — this is the same string concatenation
from Lesson 1's `greet` function, just building SQL instead of a greeting. With correct
credentials, the resulting query correctly matches Ada's row. With a wrong password, it
matches nothing, so `fetchone()` returns `None`, and the function correctly returns
`False`. So far, this looks completely correct — which is exactly what makes this bug
dangerous: it works perfectly for every well-behaved input.

**CS lens.** SQL is a language with its own **grammar** — its own rules for what counts
as the start of a string, the end of a string, a comment, a statement boundary. When
`check_login` concatenates `username` directly into the query text, it is trusting that
whatever the caller supplies will only ever *fill in a value* and never *alter the
grammar*. Nothing enforces that trust. The database engine has no idea that `'` + `ada` +
`'` was assembled from three separate pieces with different levels of trust — by the time
`cursor.execute` sees it, it's one indivisible string, and the engine parses it exactly
the way it parses any other query: by the grammar rules of SQL, applied uniformly to
every character in front of it.

**SE lens.** `check_login` has taken on a hidden second responsibility it was never
designed for: not just "check credentials," but "safely turn arbitrary user text into
valid SQL syntax" — a much harder problem that nothing in this function actually solves.
This is the identical shape as `greet` in Lesson 1: a function whose real job (formatting)
quietly became "handle untrusted input safely" without anyone deciding that on purpose.

### Step 2 — the payload

Try this username, with any password:

```python
print(check_login("ada' --", "anything"))
```

Run it:

```
SELECT * FROM users WHERE username = 'ada' --' AND password = 'anything'
True
```

**Logged in as Ada. No password required.**

**Execution trace** of how the database parses this string, character by character, once
it leaves Python and enters the SQL engine:

```
'SELECT * FROM users WHERE username = '  → SQL keywords and column name, parsed normally
'ada'                                     → parsed as a string literal (opening ' ... closing ')
' --'                                     → the ' closes what the engine now reads as the
                                            *next* string, but -- is SQL's comment marker:
                                            "ignore everything from here to the end of the line"
' AND password = 'anything''             → still on the same line → treated as a comment,
                                            discarded entirely, never evaluated
```

Effective query, as the engine actually sees it after removing the comment:

```
SELECT * FROM users WHERE username = 'ada' --' AND password = 'anything'
```

is parsed as though it were simply:

```
SELECT * FROM users WHERE username = 'ada'
```

**Walkthrough.** The two characters `--` are not data to SQL. They are a piece of SQL
grammar — the start of a comment — and the engine has no way to know that, from the
program's point of view, they arrived embedded inside a value the programmer intended to
be "just a username." The moment `username` reached `cursor.execute`, it stopped being
"data typed into a login form" and became "characters in a SQL program," indistinguishable
from the characters the programmer wrote. The `AND password = '...'` clause — the entire
check that was supposed to require a correct password — was silently deleted from the
query the engine actually ran.

**Security lens.** This attack breaks **confidentiality and authentication at once**: it
lets an attacker authenticate as Ada without knowing Ada's password, which means every
piece of data Ada is authorized to see is now reachable. And this is one of the *mild*
payloads. A username of `x'; DROP TABLE users; --` sent to a database that allows
multiple statements per call would delete the entire `users` table — an **integrity** and
**availability** attack in the same input field. The property broken depends entirely on
what the attacker chooses to write; the vulnerability that makes all of it possible is the
exact same missing checkpoint, whichever property gets hit.

### Step 3 — the fix: parameterized queries

```python
def check_login_safe(username, password):
    query = "SELECT * FROM users WHERE username = ? AND password = ?"
    cursor.execute(query, (username, password))
    return cursor.fetchone() is not None

print(check_login_safe("ada", "hunter2"))
print(check_login_safe("ada' --", "anything"))
print(check_login_safe("' OR '1'='1", "' OR '1'='1"))
```

**New construct: placeholders and a tuple argument.** The `?` characters in the query
string are **placeholders** — they mark "a value goes here" without saying what the value
is yet. `cursor.execute(query, (username, password))` passes the placeholder values as a
**tuple** (an ordered, fixed-size group of values written with parentheses) *separately*
from the query text, as a second argument, instead of splicing them into the string at
all.

Run it:

```
True
False
False
```

Every attempt to break authentication now simply fails to match — including the classic
`' OR '1'='1` payload, which would make the `WHERE` clause always true if it were
concatenated into the query text, but here is just an unusual (and wrong) password.

**Walkthrough.** `check_login_safe` sends the database engine two separate things: a query
*template* that contains no user data at all, and a tuple of *values* to slot into that
template. The database engine parses the template first — establishing, once and for all,
"this is a comparison against the `username` column, this is a comparison against the
`password` column" — and only afterward inserts `username` and `password` as literal
values into those exact slots. A `'` or a `--` inside `username` is placed into the
`username` slot as three ordinary characters with no special meaning, because by the time
those characters arrive, the engine has already finished parsing the *shape* of the query.
There is no longer any string for a payload to "break out" of, because the value was never
part of the string being parsed as SQL in the first place.

**CS lens.** This is the same fix, at the database layer, as compilers and interpreters
use everywhere they must run untrusted input: **separating code from data at the parser
level**, not trying to filter dangerous characters out of the data after the fact. A
placeholder isn't a smarter version of string concatenation — it's a structurally
different channel. The query's grammar is fixed before any user-supplied value is ever
considered. This is also called a **prepared statement**.

**Security lens.** This is the correct fix for injection, full stop — not "escape quotes,"
not "block the word `DROP`," not a blocklist of dangerous characters (Lesson 1's weaker
alternative to an allow-list, and here it's weaker still — there is no complete list of
"dangerous" SQL syntax to block). Parameterization doesn't need to know what an attack
looks like, because it never gives an attacker's text a chance to be interpreted as
grammar in the first place. This is the single most effective and most tested defense in
this course, and it generalizes directly: Lesson 5 (Command Injection) and Lesson 6 (XSS)
are the identical fix — separate code from data — applied to a shell and a browser's HTML
parser instead of a SQL engine.

---

## Incremental practice

Before trusting your understanding of this on a real, complex query, try `check_login_safe`
against this short escalating sequence — each one changing exactly one thing about the
payload:

1. `check_login_safe("ada", "hunter2")` — correct credentials, should return `True`
2. `check_login_safe("ada'", "hunter2")` — a single stray quote, no comment syntax
3. `check_login_safe("ada' --", "hunter2")` — the working Step-2 payload against the
   *safe* function
4. `check_login_safe("' OR '1'='1' --", "anything")` — the classic "always true" payload
5. `check_login_safe("", "")` — empty strings, a case attackers often try first

Run all five. Every one returns `False` except the first. If you understand *why* case 3
returns `False` here when the identical string returned `True` in Step 2, you've
understood the lesson — the difference isn't the input, it's the channel it traveled
through to reach the database.

---

## Connect the pieces

This is Lesson 1's trust boundary, made concrete: `username` crosses from an untrusted
source into `check_login`, and Step 1 has no checkpoint marking that crossing — exactly
the invisible-crossing shape from `greet` in Lesson 1. `check_login_safe`'s placeholders
are that checkpoint, implemented not as a hand-written allow-list (Lesson 1's
`sanitize_name`) but as a guarantee built into the database driver itself: the safest
checkpoints are the ones that make the vulnerable pattern structurally impossible to
write, rather than merely possible to write correctly.

## What breaks without this

Take Step 1's `check_login` and give it a username designed not to log in, but to read
data it was never asked for:

```python
print(check_login("nobody' UNION SELECT username, password FROM users --", "x"))
```

`UNION SELECT` combines the results of two queries into one. This payload asks the
database to return every username and password in the table, disguised as a login
attempt — and because `check_login` only ever reports `True`/`False` here, a real
attacker would adapt this same shape (a technique called **blind SQL injection**) to
extract data one bit at a time by asking yes/no questions the application *does* answer
distinctly, rather than reading a printed query. The mechanism is identical to what you
just built; only the goal changed from "log in as someone else" to "read the entire
table."

## Recognition

```
Today: SQL Injection (code and data sharing one channel, then separated by
parameterization)

Also recognized in: NoSQL injection (the identical pattern against MongoDB-style
query documents), LDAP injection (against directory-service queries), XML/XPath
injection, command injection (Lesson 5 — the same pattern against a shell), log
injection (attacker-controlled text written into logs that a log-parsing tool
later treats as structured data), and template injection (user input evaluated as
template syntax rather than displayed as text). Every one of these is "an
interpreter received a string built by concatenating trusted code with untrusted
data," fixed the same way: give the data its own channel.
```

## Definition of done

- [ ] You ran Steps 1 through 3 and reproduced the outputs shown, including the
      unauthenticated login in Step 2
- [ ] You ran the five-payload incremental practice sequence against
      `check_login_safe` and confirmed only the correct credentials return `True`
- [ ] You can explain, using the words "grammar" and "channel," why parameterized
      queries fix this and a blocklist of dangerous characters would not
- [ ] You can explain what the `--` payload actually does to the query the database
      receives, without looking back at the execution trace
- [ ] `git add .` and `git commit -m "Lesson 4: SQL injection — string concatenation vs
      parameterized queries"` in your `security-labs/` folder

**Next:** Lesson 5 — Command Injection, where the exact same missing-checkpoint pattern
meets the operating system's shell instead of a database — and where the fix looks
different on the surface (no `?` placeholders) but is provably the same idea underneath.
