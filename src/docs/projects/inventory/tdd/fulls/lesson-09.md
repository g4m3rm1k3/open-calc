# Lesson 9: Following Other Users

**What you will build**
A `follows` table where a member can follow another member — directional, and self-referencing: both sides of the relationship point back at the same `members` table. The problem we're solving: Lesson 8's `likes` connected two *different* tables (`posts` and `members`). Following connects `members` to itself, and unlike liking, direction matters — Ada following Grace is a completely different fact from Grace following Ada.

**What you need to know first**
Lesson 8 (junction tables, composite primary keys). NexusInventory's self-referencing `locations` table (adjacency list) from your earlier practice project — same underlying pattern, applied to a graph instead of a strict tree.

---

## Concept Unit: A Self-Referencing, Directed Junction Table

### The Problem

A junction table like `likes` has two *different* foreign keys, to two *different* tables — no ambiguity about which is which. A `follows` table needs two foreign keys that both point at `members`. If we just called both columns `member_id`, nothing would distinguish "the one doing the following" from "the one being followed" — and unlike NexusInventory's `locations` tree, where `parent_id` had one obvious meaning, here both roles are the *same kind of thing* (a member), just playing different parts in the relationship.

### The failing test

```python
def test_follow_and_list_following():
    response = client.post("/members/1/follow", json={"follower_id": 2})
    assert response.status_code == 201
    following = client.get("/members/2/following").json()
    assert following[0]["username"] == "ada"

def test_cannot_follow_self():
    response = client.post("/members/1/follow", json={"follower_id": 1})
    assert response.status_code == 422
```

Run it:

```bash
pytest tests/
```

```text
FAILED tests/test_api.py::test_follow_and_list_following
404 != 201
```

### Introduce the concept in isolation

Create `lab_self_ref.py`:

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row
conn.execute("CREATE TABLE people (id INTEGER PRIMARY KEY, name TEXT)")
conn.execute("""
    CREATE TABLE friendships (
        follower_id INTEGER,
        followed_id INTEGER,
        PRIMARY KEY (follower_id, followed_id),
        CHECK (follower_id != followed_id)
    )
""")
conn.execute("INSERT INTO people VALUES (1, 'Ada')")
conn.execute("INSERT INTO people VALUES (2, 'Grace')")
conn.execute("INSERT INTO friendships VALUES (2, 1)")  # Grace follows Ada

try:
    conn.execute("INSERT INTO friendships VALUES (1, 1)")  # Ada follows herself
except sqlite3.IntegrityError as e:
    print(f"Blocked self-follow: {e}")

# Who does Grace (id 2) follow?
rows = conn.execute("""
    SELECT people.name FROM friendships
    JOIN people ON friendships.followed_id = people.id
    WHERE friendships.follower_id = 2
""").fetchall()
print([row["name"] for row in rows])
```

Run it:

```bash
python lab_self_ref.py
```

Output:

```text
Blocked self-follow: CHECK constraint failed: follower_id != followed_id
['Ada']
```

*What this proves:* `people` is joined against `friendships`, but the *table being joined to itself in spirit* is captured entirely by column naming (`follower_id` vs. `followed_id`) and which one the `JOIN` and `WHERE` reference — there's no special SQL syntax for "self-referencing," just careful, role-based naming and a `CHECK` constraint that explicitly forbids the one case (following yourself) that would otherwise be structurally valid but nonsensical.

### Discard the throwaway example

Delete `lab_self_ref.py`. Build the real `follows` table.

### Project Change

* **Files affected:** `db.py`, `schemas.py`, `main.py`.
* **Change type:** Modify.

### The New Code

```python
# db.py — add inside init_db()
conn.execute("""
    CREATE TABLE IF NOT EXISTS follows (
        follower_id INTEGER NOT NULL,
        followed_id INTEGER NOT NULL,
        PRIMARY KEY (follower_id, followed_id),
        CHECK (follower_id != followed_id),
        FOREIGN KEY (follower_id) REFERENCES members(id),
        FOREIGN KEY (followed_id) REFERENCES members(id)
    )
""")
```

```python
# schemas.py — add
class FollowCreate(BaseModel):
    follower_id: int

class FollowedMember(BaseModel):
    id: int
    username: str
```

```python
# main.py — add
@app.post("/members/{member_id}/follow", status_code=201)
def follow_member(member_id: int, follow: FollowCreate):
    if follow.follower_id == member_id:
        raise HTTPException(status_code=422, detail="Cannot follow yourself")
    conn = get_connection()
    try:
        conn.execute(
            "INSERT INTO follows (follower_id, followed_id) VALUES (?, ?)",
            (follow.follower_id, member_id),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=409, detail="Already following")
    conn.close()
    return {"following": True}
```

### Mechanical walkthrough

1. `CHECK (follower_id != followed_id)`: (already-established `CHECK` pattern from Lesson 7, new condition). Structurally forbids a self-follow at the database layer.
2. `if follow.follower_id == member_id: raise HTTPException(422, ...)`: (first appearance of an application-level check *duplicating* a database constraint deliberately, rather than relying only on the `CHECK`). Notice why: the `CHECK` constraint alone would surface as a raw `sqlite3.IntegrityError`, not automatically a clean `422` — this is the same defense-in-depth idea from Lesson 7, but here the app-level check exists specifically to produce a better error message, while the `CHECK` remains the actual last line of defense against anything that bypasses the API.
3. `PRIMARY KEY (follower_id, followed_id)`: (already-established composite key from Lesson 8). One member can't follow the same member twice, but can follow many different members, and be followed by many different members — the same many-to-many shape as likes, just both sides drawn from the same table.

### CS Lens

**Directed graphs.** NexusInventory's `locations` table was a tree — every node has exactly one parent, forming a strict hierarchy with no cycles. `follows` has no such restriction: Ada can follow Grace, Grace can follow Ada, and both facts can be true at once, or neither. This is a general **directed graph** — nodes (members) connected by directional edges (follow relationships) — a strictly more flexible structure than a tree. Every tree is a directed graph with extra constraints (no cycles, exactly one parent); not every directed graph is a tree. Social networks, dependency graphs, and web links are all naturally this shape.

### SE Lens

**Role-based naming disambiguates self-reference.** `follower_id` and `followed_id`, rather than two generically-named `member_id` columns, is what makes this table's meaning readable at a glance, months later, without re-deriving it from the code that uses it. This matters more here than it did for `likes`' `post_id`/`member_id`, precisely *because* both sides here come from the same table — nothing else distinguishes them.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 16 items

tests/test_api.py ....F...........                                       [100%]
```

*Expected* — `/members/2/following` doesn't exist yet. That's next.

---

## Concept Unit: Querying a Directed Relationship Both Ways

### The Problem

`follows` records raw pairs, but "who does Grace follow" and "who follows Grace" are two different, equally valid questions about the same table — one filters on `follower_id`, the other on `followed_id`. We need both, and both need to return usable member data (usernames), not just raw ids.

### The New Code

```python
@app.get("/members/{member_id}/following", response_model=list[FollowedMember])
def list_following(member_id: int):
    conn = get_connection()
    rows = conn.execute("""
        SELECT members.id, members.username
        FROM follows
        JOIN members ON follows.followed_id = members.id
        WHERE follows.follower_id = ?
    """, (member_id,)).fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.get("/members/{member_id}/followers", response_model=list[FollowedMember])
def list_followers(member_id: int):
    conn = get_connection()
    rows = conn.execute("""
        SELECT members.id, members.username
        FROM follows
        JOIN members ON follows.follower_id = members.id
        WHERE follows.followed_id = ?
    """, (member_id,)).fetchall()
    conn.close()
    return [dict(row) for row in rows]
```

### Mechanical walkthrough

1. `list_following`: joins on `followed_id` (who this member follows), filters by `follower_id = ?` (this specific member as the one doing the following).
2. `list_followers`: the same join structure with the two roles swapped — joins on `follower_id`, filters by `followed_id = ?`. The two functions are near-mirror images of each other, which is itself informative: it's a direct, visible consequence of the relationship being symmetric in *structure* (same table, same shape) but not in *meaning* (direction matters).

### CS Lens

**In-edges vs. out-edges.** In graph terms, `list_following` computes a node's **out-edges** (where the arrows point away from this member), and `list_followers` computes its **in-edges** (where arrows point in). This exact distinction is why "who do I follow" and "who follows me" can have completely different answers even though they're queried from the same single table.

### SE Lens

**Near-duplicate code, named and left alone — for now.** These two functions are close to mirror images, similar to the update/delete duplication flagged back in Lesson 6. Both are being deliberately left as-is rather than abstracted, for the same reason: two instances of a pattern is a signal worth noting, not yet a mandate to generalize. Premature abstraction here would likely produce something more convoluted than just reading two short, near-identical functions side by side.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 16 items

tests/test_api.py ................                                       [100%]

============================== 16 passed in 0.16s ===============================
```

### Connecting sentence

We can now model everyone a member follows — but finding a specific member by name still means scrolling every row in `/members`, since nothing indexes on `username`. The next lesson is where searching stops being a toy problem.

---

## Closing

**Connect the pieces**
`POST /members/1/follow` with `follower_id: 2` inserts `(follower_id=2, followed_id=1)` into `follows`, after an explicit self-follow check and relying on the `CHECK` constraint as backup. `GET /members/2/following` then joins `follows` to `members` on `followed_id`, filtered to `follower_id=2` — returning exactly the row just inserted, by name instead of raw id.

**What breaks without this**
Without role-based column names (`follower_id`/`followed_id` instead of two generic `member_id` columns), every query against this table would require re-deriving, from context alone, which column means what — a mistake here silently reverses a relationship (recording "Ada follows Grace" as "Grace follows Ada") without any error at all, since both are equally valid rows as far as the database is concerned.

**Exercises**
1. Write a `test_list_followers` test mirroring `test_follow_and_list_following`, confirming `list_followers` returns the correct member from the opposite direction.
2. Add a `DELETE /members/{id}/follow` endpoint (unfollow), following the ownership-check patterns from Lesson 6.

**Definition of Done**
* [x] `follows` self-references `members` with role-based column names and a self-follow `CHECK`.
* [x] `/following` and `/followers` correctly query the same table from opposite directions.
* [x] Commit: `feat: directed follow relationships with in/out-edge queries`

---

## Context Snapshot (End of Lesson 9)

**2. Schema State (addition):**
- `follows (follower_id INTEGER NOT NULL, followed_id INTEGER NOT NULL, PRIMARY KEY (follower_id, followed_id), CHECK (follower_id != followed_id), FOREIGN KEY (follower_id) REFERENCES members(id), FOREIGN KEY (followed_id) REFERENCES members(id))`

**3. API Manifest (additions):**
- `POST /members/{member_id}/follow` → `{"following": true}`, `201`; `409` on duplicate, `422` on self-follow
- `GET /members/{member_id}/following` → `list[FollowedMember]`
- `GET /members/{member_id}/followers` → `list[FollowedMember]`

**5. Test State:** 16 tests, 16 passing.

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Self-referencing junction table | L9 | A junction table with both foreign keys pointing at the same table |
| Directed graph | L9 | Nodes connected by edges that have direction — a strictly more general structure than a tree |
| In-edges / out-edges | L9 | Relationships pointing into vs. out of a given node |
| Role-based column naming | L9 | Naming otherwise-identical-type columns by the role they play, to disambiguate self-reference |

**7. Lesson Completion State:**
- Completed: Lessons 1-9, Interludes A and C
- Next: Interlude B — Hash Maps From Scratch, then Lesson 10 (search)

**8. Current Architecture State:**
- HTTP Layer: 15 routes
- Business Logic: not introduced
- Data Access: `db.py`, first self-referencing directed graph
- ORM: not introduced
- Authentication: not introduced
