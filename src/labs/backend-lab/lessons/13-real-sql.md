# Backend Lab — Lesson 13 — Real SQL

## What You Will Build

`usersRepository`, rewritten to speak real SQL directly — plus a real
**SQL console**, a new tab in the Postman panel, that queries the exact
same database your code writes to, so you can verify what your code
actually persisted, by hand, in the same language a real database
administrator would use.

---

## What You Need to Know First

Lesson 11's `usersRepository`. Lesson 9's honest naming of `db` as this
lab's own convention, not a language feature.

---

## Step 1 — An Honest Reveal

Every `db.getAllUsers()` and `db.insertUser(name)` call, since lesson 9,
has *already* been running on a real SQLite database the whole time —
compiled to WebAssembly, running for real, in your browser tab. Lesson
9's promise (real storage, not just an array) was true from the start;
it was only ever wrapped behind two convenience names so the *idea* of
persistence could be taught before the *syntax* of SQL was needed.

**SE lens — why the reveal waited until now.** Introducing raw SQL
syntax back in lesson 9 would have meant teaching two big, unrelated
things at once: what persistence *is* (lesson 9's actual job) and how to
*write SQL* (this lesson's actual job). Keeping `db.getAllUsers()`/`db.insertUser()`
as a stand-in let lesson 9 stay focused. Nothing about this lesson
undoes any earlier one — `usersRepository`'s external shape
(`findAll`/`insert`) doesn't have to change even now; only what's
*written inside it* does.

---

## Step 2 — Meet `db.query`, and the Table That Already Exists

```javascript
var rows = db.query("SELECT * FROM users");
```

**CS lens — a table, and the statement that created it, disclosed
honestly.** Every row `db.getAllUsers()` has ever returned lives in a
real SQL **table** named `users`, created once, before your code ever
ran, by this exact statement:

```sql
CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)
```

`CREATE TABLE` defines a table's shape — its **columns** and each
column's **type** (`INTEGER`, `TEXT`). `PRIMARY KEY` marks `id` as the
column that uniquely identifies each row — the same **identity** concept
lesson 9 named for why an id exists at all, now backed by a real
database constraint instead of just a convention. `AUTOINCREMENT` is the
real mechanism behind every id `db.insertUser` has ever handed back —
the same auto-incrementing behavior lesson 9 already named, now shown as
the actual SQL feature that produces it. `NOT NULL` refuses to store a
row missing a name at all — a second, database-level safety net,
underneath whatever validation `usersService` already performs.

**PL lens — `db.query(sql, params)`, the general primitive this lesson
actually teaches.** Unlike `getAllUsers`/`insertUser` (two fixed,
pre-built questions), `db.query` accepts *any* SQL text and runs it,
returning whatever rows come back (an empty array for a statement that
doesn't produce rows, like an `INSERT`). This is the real, general
mechanism `getAllUsers`/`insertUser` were always built out of underneath
— worth using directly now that SQL itself is the point of the lesson.

---

## Step 3 — Rewrite the Repository in Real SQL

```javascript
var usersRepository = {
  findAll: function (filters) {
    return db.query("SELECT id, name FROM users ORDER BY id");
  },
  insert: function (name) {
    db.query("INSERT INTO users (name) VALUES (?)", [name]);
    var idRows = db.query("SELECT last_insert_rowid() AS id");
    return { id: idRows[0].id, name: name };
  },
};
```

Send the exact same requests lesson 11 verified — identical results.
`usersService`, `usersController`, the router: none of them changed even
slightly, exactly as lesson 9 and lesson 12 both promised.

**Walkthrough — `?`, a placeholder for a real, bound value — not text
concatenation.** `"INSERT INTO users (name) VALUES (?)"` doesn't contain
`name`'s actual value at all — `?` is a **placeholder**, and `[name]` is
the real value bound into that placeholder's position, kept completely
separate from the SQL text itself until the database applies it. This
matters far more than it looks like it should — covered concretely next.

**Walkthrough — `last_insert_rowid()`, asking the database what it just
did.** After an `INSERT`, nothing about the insert statement itself
returns the new row's id. `last_insert_rowid()` is a real, standard
SQLite function: "tell me the id the most recent insert on this
connection produced." `idRows[0].id` reads it off the one-row result
`db.query` returns for that follow-up question.

---

## Step 4 — Why the Placeholder Isn't Optional

```javascript
// NEVER do this — shown once, to see exactly why not
var name = request.query.name;
var sql = "SELECT * FROM users WHERE name = '" + name + "'";
var rows = db.query(sql);
```

Send `GET /users?name=Priya` — correctly returns just Priya. Now send
`GET /users?name=x' OR '1'='1` — this returns **every user**, not zero,
even though no one is actually named `x' OR '1'='1`.

**Security lens — SQL injection, the exact vulnerability lesson 5
promised this lesson would make real.** The query that actually ran was
`SELECT * FROM users WHERE name = 'x' OR '1'='1'` — the attacker's input
didn't just fill in a name, it **changed the meaning of the SQL
statement itself**, turning a specific lookup into "match everyone,"
because `'1'='1'` is always true. This is called **SQL injection**: user
input, concatenated directly into SQL text, is interpreted by the
database as *code*, not just data — exactly the same category of
problem lesson 5 named for HTML (XSS), now shown for real, with a real
database, producing a real, wrong result. The fix is Step 3's version:
`db.query("... WHERE name = ?", [name])` — the placeholder guarantees
`name` is always treated as one single data value, never as SQL syntax,
no matter what characters it contains. **Never build a SQL string by
concatenating user input into it — always use a placeholder.**

---

## Step 5 — Verify Directly, With the SQL Console

The Postman panel now has a fourth tab, **SQL** — a real console running
against the exact same database `db.query` reaches. Create a user
through a normal `POST /users` request, then switch to the SQL tab and
run:

```sql
SELECT * FROM users;
```

The row you just created through your own JavaScript code is right
there — the same table, the same data, queried two completely different
ways.

**Connect to the real world.** This is precisely the relationship
between an application and a database administrator's tools in any real
company: the application inserts and reads data through code; a DBA (or
the application's own developers, debugging something) can always query
the exact same database directly, by hand, in raw SQL, to verify what's
actually stored — exactly what this tab lets you do here.

---

## Connect the Pieces

```
usersRepository.insert(name)
      |
      v
db.query("INSERT INTO users (name) VALUES (?)", [name])
      |
      v
the real, shared SQLite database  <-----  SQL console tab queries this
      |                                    exact same instance directly
      v
db.query("SELECT ...") / usersRepository.findAll(...)
```

---

## What Breaks Without This

**Building SQL by string concatenation, anywhere user input is
involved**: demonstrated above — a single quote character in otherwise
ordinary input can change what the database actually does, silently,
with no error and no crash, just a wrong (and potentially
security-critical) result.

**Forgetting the table already exists and trying to `CREATE TABLE users`
again in student code**: SQLite would throw a real "table users already
exists" error — this lab's own `CREATE TABLE`, run once before your code
ever executes, has already claimed that name.

---

## Definition of Done

- [ ] `usersRepository.findAll`/`.insert`, rewritten with `db.query`, behave identically to lesson 11's version
- [ ] The SQL console tab, running `SELECT * FROM users;`, shows a user created through a normal `POST /users` request
- [ ] You can explain what a placeholder (`?`) is and why it's different from concatenating a value into a SQL string
- [ ] You can reproduce the SQL injection example and explain, in your own words, why it returns every user
- [ ] You can explain what `PRIMARY KEY`, `AUTOINCREMENT`, and `NOT NULL` each guarantee about the `users` table
- [ ] You can explain what `last_insert_rowid()` is for and why an `INSERT` statement alone doesn't return it

---

*Next: every route this project has built is open to anyone — nothing
checks who's making a request before acting on it. Authentication is
next: real passwords, real hashing, and a real way to know who's asking.*
