# Lesson 11: Organizing Posts With Hashtags

**What you will build**
Parsing `#hashtags` out of post content, storing each unique tag exactly once in its own table, and linking posts to tags many-to-many. The problem we're solving: hashtags are *embedded* in free text, not a field a user fills in separately — we have to extract structured data (a list of tags) from unstructured data (a sentence) before we can store or query it relationally at all.

**What you need to know first**
Lesson 8 (junction tables, composite keys). Lesson 3 (normalization).

---

## Concept Unit: Parsing Hashtags From Text

### The Problem

`"Loving #python and #FastAPI today"` is just a string as far as `posts.content` is concerned — nothing about it is structured. Before any hashtag can be stored as its own row, we need to reliably pull `python` and `fastapi` out of that sentence, ignoring the rest.

### The failing test

```python
def test_post_hashtags_extracted_and_normalized():
    post = client.post("/posts", json={"author_id": 1, "content": "Loving #python and #FastAPI today"}).json()
    response = client.get(f"/posts/{post['id']}/hashtags")
    assert response.status_code == 200
    tags = response.json()
    assert sorted(tags) == ["fastapi", "python"]
```

Run it:

```bash
pytest tests/
```

```text
FAILED tests/test_api.py::test_post_hashtags_extracted_and_normalized
404 != 200
```

### Introduce the concept in isolation

Create `lab_parse.py`:

```python
import re

text = "Loving #python and #FastAPI today, also #python again"
matches = re.findall(r"#(\w+)", text)
print(matches)

normalized = sorted(set(tag.lower() for tag in matches))
print(normalized)
```

Run it:

```bash
python lab_parse.py
```

Output:

```text
['python', 'FastAPI', 'python']
['fastapi', 'python']
```

*What this proves:* `re.findall(r"#(\w+)", text)` is a **regular expression** — a small, separate pattern-matching language embedded in a string — that scans the whole text and pulls out every substring matching the pattern "a `#` followed by one or more word characters," returning just the captured part (inside the parentheses), not the `#` itself. `set(...)` then removes the duplicate `python`, and `.lower()` ensures `python` and `FastAPI` don't end up treated as two different tags just because of capitalization.

### Explain the mechanism

A regular expression pattern is matched character by character against the text, using rules baked into the pattern itself: `#` matches a literal `#`; `\w+` matches "one or more letters, digits, or underscores." `re.findall` doesn't understand English or hashtags conceptually — it's mechanically scanning for places where the text matches this exact shape, nothing more and nothing less. This is why `#python!` would extract `python` (the `!` isn't a word character, so matching stops there) but `#3d-printing` would only extract `3d` (the `-` breaks the match too) — worth testing deliberately, not assuming.

### Discard the throwaway example

Delete `lab_parse.py`. Wire real extraction into post creation.

### Project Change

* **Files affected:** `main.py`.
* **Change type:** Modify (add a helper function; call it during post creation).

### The New Code

```python
import re

def extract_hashtags(content: str) -> list[str]:
    matches = re.findall(r"#(\w+)", content)
    return sorted(set(tag.lower() for tag in matches))
```

### Mechanical walkthrough

1. `extract_hashtags` is deliberately a plain function with no database access — it takes a string, returns a list of strings, nothing else. This is worth naming explicitly: it's easy to test in complete isolation (call it with a string, check the list it returns) without touching the database at all, unlike almost every other function so far in this project.

### CS Lens

**Regular expressions as a small formal language.** `\w+`, `#`, and the parentheses in `r"#(\w+)"` aren't Python syntax — they're a separate mini-language for describing text patterns, interpreted by the `re` module at runtime. Under the hood, a regex is compiled into a state machine that consumes the input character by character, tracking whether the text-so-far still could match the pattern — the same fundamental idea as a much simpler version of how NexusInventory's `MATCH` operator identifies word boundaries in FTS5.

### SE Lens

**Pure functions are the easiest code in this entire project to test and trust.** `extract_hashtags` takes an input, returns an output, touches no database, no network, no global state — call it a thousand times with the same string and get the identical result every time. Contrast this with almost every route function so far, which all depend on database state. Pulling parsing logic out into a small, pure function like this — rather than mixing regex directly into a route handler — is a deliberate design choice that pays off the moment you want to test edge cases (like the `#3d-printing` case above) without spinning up the whole app.

### Commands needed

```bash
pytest tests/
```

```text
FAILED — /posts/{id}/hashtags still doesn't exist; extract_hashtags alone doesn't satisfy the test yet.
```

*Expected* — parsing is only half the problem. The other half is storing and querying the result relationally, which is next.

---

## Concept Unit: Normalized Storage for Hashtags

### The Problem

We could store hashtags as a flat text column on `posts` (`"python,fastapi"`), but that's the same mistake Lesson 3 avoided with `bios` — mixing two concepts into one column, unable to query "all posts tagged `python`" without string-parsing every row every time. We want each unique tag stored exactly once, and posts linked to tags the same way posts were linked to likers in Lesson 8.

### Introduce the concept in isolation

Create `lab_get_or_create.py`:

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE tags (id INTEGER PRIMARY KEY, name TEXT UNIQUE)")

def get_or_create_tag(conn, name):
    row = conn.execute("SELECT id FROM tags WHERE name = ?", (name,)).fetchone()
    if row:
        return row[0]
    cursor = conn.execute("INSERT INTO tags (name) VALUES (?)", (name,))
    return cursor.lastrowid

id1 = get_or_create_tag(conn, "python")
id2 = get_or_create_tag(conn, "python")  # same tag, requested again
print(id1, id2, id1 == id2)
print(conn.execute("SELECT * FROM tags").fetchall())
```

Run it:

```bash
python lab_get_or_create.py
```

Output:

```text
1 1 True
[(1, 'python')]
```

*What this proves:* asking for `"python"` twice returns the same row both times — `tags` never grows a duplicate entry for the same name, because we check for it first. `UNIQUE` on `name` backs this up structurally, the same role `PRIMARY KEY` played for Lesson 8's likes.

### An honest limitation of this pattern

This `get_or_create_tag` has the exact race-condition weakness Lesson 8's SE Lens warned about: if two requests call it with `"python"` at nearly the same instant, both could pass the `SELECT` check (finding nothing) before either finishes its `INSERT`, and the second `INSERT` would then fail against the `UNIQUE` constraint — correctly preventing a duplicate, but as an unhandled error rather than a clean fallback. The fix is the same idea as Lesson 8's `INSERT OR IGNORE` pattern: attempt the insert first, ignore a `UNIQUE` failure, then always `SELECT` to get the id either way. We'll use that safer version in the real code below.

### Discard the throwaway example

Delete `lab_get_or_create.py`. Build the real `hashtags` table and junction table.

### Project Change

* **Files affected:** `db.py`, `main.py`.
* **Change type:** Modify.

### The New Code

```python
# db.py — add inside init_db()
conn.execute("""
    CREATE TABLE IF NOT EXISTS hashtags (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
    )
""")
conn.execute("""
    CREATE TABLE IF NOT EXISTS post_hashtags (
        post_id INTEGER NOT NULL,
        hashtag_id INTEGER NOT NULL,
        PRIMARY KEY (post_id, hashtag_id),
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (hashtag_id) REFERENCES hashtags(id)
    )
""")
```

```python
# main.py — helper and integration into create_post
def get_or_create_hashtag_id(conn, name: str) -> int:
    conn.execute("INSERT OR IGNORE INTO hashtags (name) VALUES (?)", (name,))
    row = conn.execute("SELECT id FROM hashtags WHERE name = ?", (name,)).fetchone()
    return row["id"]

@app.post("/posts", response_model=PostRead, status_code=201)
def create_post(post: PostCreate):
    conn = get_connection()
    cursor = conn.execute(
        "INSERT INTO posts (author_id, content) VALUES (?, ?)",
        (post.author_id, post.content),
    )
    new_post_id = cursor.lastrowid

    for tag_name in extract_hashtags(post.content):
        hashtag_id = get_or_create_hashtag_id(conn, tag_name)
        conn.execute(
            "INSERT OR IGNORE INTO post_hashtags (post_id, hashtag_id) VALUES (?, ?)",
            (new_post_id, hashtag_id),
        )

    conn.commit()
    conn.close()
    return {"id": new_post_id, "author_id": post.author_id, "content": post.content}

@app.get("/posts/{post_id}/hashtags", response_model=list[str])
def get_post_hashtags(post_id: int):
    conn = get_connection()
    rows = conn.execute("""
        SELECT hashtags.name
        FROM post_hashtags
        JOIN hashtags ON post_hashtags.hashtag_id = hashtags.id
        WHERE post_hashtags.post_id = ?
    """, (post_id,)).fetchall()
    conn.close()
    return [row["name"] for row in rows]
```

### Mechanical walkthrough

1. `INSERT OR IGNORE INTO hashtags (name) VALUES (?)` followed unconditionally by a `SELECT`: (already-established `INSERT OR IGNORE` from Lesson 2, applied here as the race-safe get-or-create pattern named above). Whether the tag already existed or was just created, the following `SELECT` always finds it — this closes the race-condition window the isolated version had.
2. `post_hashtags`: (already-established junction table shape from Lesson 8, third occurrence now — likes, and this).
3. `create_post` now performs one `INSERT` (the post) plus, per hashtag, a get-or-create and a junction insert, all before one shared `conn.commit()` — every part of creating a post and its tags succeeds or fails together, the same atomicity principle from Lesson 8, applied here without an explicit `BEGIN` because SQLite's default connection behavior already treats this whole sequence as one implicit transaction until `commit()`.
4. `response_model=list[str]`: (first appearance of a response model that's a list of plain strings, not objects) — a reminder that `response_model` validates *any* shape, not just custom classes.

### CS Lens

**Normalization at scale.** Lesson 3 normalized one one-to-one relationship (`bios`). This is the same principle — one fact stored in exactly one place — applied to something referenced from *many* posts: `"python"` exists as exactly one row in `hashtags` regardless of how many thousands of posts eventually reference it, linked each time through `post_hashtags` rather than duplicated as text.

### SE Lens

**Recognizing a pattern across three occurrences (likes, follows, hashtags) is when it's earned generalization, not before.** Junction tables have now appeared three times, and get-or-create-style logic once. This is a legitimate point to consider extracting a shared helper — worth naming here explicitly, and worth returning to during Lesson 16's Repository layer, rather than generalizing prematurely back when there was only one example.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 18 items

tests/test_api.py ..................                                     [100%]

============================== 18 passed in 0.18s ===============================
```

### Connecting sentence

Tags are now stored and queryable in one direction — a post's tags. The next lesson goes the other way: given a tag, find every post that has it, which is the actual "browse by hashtag" feature and needs its own indexed query.

---

## Closing

**Connect the pieces**
Creating a post now does three things in one implicit transaction: insert the post, extract and normalize any `#hashtags` from its content via a pure parsing function, and get-or-create each tag before linking it through `post_hashtags`. `GET /posts/{id}/hashtags` reverses this, joining back through the junction table to list a post's tag names.

**What breaks without this**
Without normalizing case (`.lower()`), `#Python` and `#python` would silently become two unrelated tags — a post tagged `#Python` would never show up under a search or browse for `python`, with no error anywhere to reveal why.

**Exercises**
1. Create a post with `"#Python #PYTHON #python"` and confirm `/posts/{id}/hashtags` returns exactly one tag, `["python"]"` — proving both the `set()` dedup in `extract_hashtags` and the `UNIQUE` constraint are both doing real work, not just one of them.
2. Write `test_extract_hashtags_ignores_punctuation` directly against `extract_hashtags` (no HTTP call at all) covering a case like `"#3d-printing is cool"`, and confirm what it actually extracts.

**Definition of Done**
* [x] `extract_hashtags` is a pure, independently testable function.
* [x] Hashtags are normalized (case) and deduplicated, stored once each in `hashtags`.
* [x] `post_hashtags` links posts to tags many-to-many, race-safe via `INSERT OR IGNORE` + `SELECT`.
* [x] Commit: `feat: hashtag parsing and normalized many-to-many tagging`

---

## Context Snapshot (End of Lesson 11)

**2. Schema State (additions):**
- `hashtags (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE)`
- `post_hashtags (post_id INTEGER NOT NULL, hashtag_id INTEGER NOT NULL, PRIMARY KEY (post_id, hashtag_id), FOREIGN KEY (post_id) REFERENCES posts(id), FOREIGN KEY (hashtag_id) REFERENCES hashtags(id))`

**3. API Manifest (addition):** `GET /posts/{post_id}/hashtags` → `list[str]`. `POST /posts` now also extracts and links hashtags.

**5. Test State:** 18 tests, 18 passing.

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Regular expression (regex) | L11 | A small pattern-matching language for text, compiled into a state machine |
| Pure function | L11 | Same input always produces same output, no side effects — easy to test in isolation |
| Get-or-create (race-safe) | L11 | `INSERT OR IGNORE` then unconditional `SELECT`, avoiding the check-then-act race window |
| Normalization at scale | L11 | One shared fact stored once, referenced by many, via a junction table |

**7. Lesson Completion State:**
- Completed: Lessons 1-11, Interludes A, B, C
- Next: Lesson 12 — Searching Posts by Tags (multi-table JOINs, `EXPLAIN QUERY PLAN`)

**8. Current Architecture State:**
- HTTP Layer: 17 routes
- Business Logic: `extract_hashtags` — first pure, non-database function
- Data Access: `db.py`, third junction table
- ORM: not introduced
- Authentication: not introduced
