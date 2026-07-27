# Lesson 15: Protecting My Account

**What you will build**
Every mutating endpoint migrated to real, `Depends()`-verified identity, plus a `role` column enabling role-based access control — a second, different kind of authorization from Lesson 6's ownership checks. The problem we're solving: Lesson 14 closed the identity-spoofing gap for one endpoint. This lesson finishes that rollout, then adds a permission model that ownership checks alone can't express — a moderator who needs to act on content they don't own.

**What you need to know first**
Lesson 14 (`Depends(get_current_member)`, JWTs). Lesson 6 (ownership-based authorization).

---

## Concept Unit: Finishing the Authentication Migration

### The Problem

`update_post`, `delete_post`, `like_post`, and `follow_member` all still accept a client-supplied id (`editor_id`, `member_id`, `follower_id`) instead of using `get_current_member`, the exact gap Lesson 14 named as its own exercise. One example, done carefully, generalizes cleanly to the rest — this is the same pattern applied four more times, not four new ideas.

### The failing test

```python
def test_cannot_spoof_editor_id_anymore():
    token = client.post("/login", json={"username": "carol", "password": "hunter2000"}).json()["access_token"]
    post = client.post(
        "/posts", json={"content": "mine"}, headers={"Authorization": f"Bearer {token}"}
    ).json()

    # Old-style spoofed request should no longer work at all
    spoofed = client.put(f"/posts/{post['id']}", json={"editor_id": 999, "content": "hijacked"})
    assert spoofed.status_code in (401, 422)

    real = client.put(
        f"/posts/{post['id']}",
        json={"content": "edited"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert real.status_code == 200
```

Run it:

```bash
pytest tests/
```

```text
FAILED — update_post still accepts editor_id, spoofed request incorrectly succeeds.
```

### The New Code

```python
# schemas.py — PostUpdate loses editor_id
class PostUpdate(BaseModel):
    content: str = Field(min_length=1)
```

```python
# main.py — update_post, migrated
@app.put("/posts/{post_id}", response_model=PostRead)
def update_post(post_id: int, update: PostUpdate, current_member: dict = Depends(get_current_member)):
    conn = get_connection()
    row = conn.execute("SELECT author_id FROM posts WHERE id = ?", (post_id,)).fetchone()
    if row is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Post not found")
    if row["author_id"] != current_member["id"]:
        conn.close()
        raise HTTPException(status_code=403, detail="Not the author of this post")

    conn.execute("UPDATE posts SET content = ? WHERE id = ?", (update.content, post_id))
    conn.commit()
    conn.close()
    return {"id": post_id, "author_id": current_member["id"], "content": update.content}
```

### Mechanical walkthrough

1. Only two things changed from Lesson 6's version: `editor_id` disappears from `PostUpdate` entirely (Lesson 14's "remove the thing that needs checking" principle), and every comparison now uses `current_member["id"]`, sourced from the verified `Depends()` dependency instead of the request body. The ownership-check *logic itself* — existence before ownership, `404` before `403` — is completely unchanged; only *where the identity comes from* changed, exactly as Lesson 6 predicted it would.

### Connecting sentence

`delete_post`, `like_post`, and `follow_member` follow this identical migration — replace their client-supplied id parameter with `current_member: dict = Depends(get_current_member)`, use `current_member["id"]` wherever the old id was used, and drop the now-unnecessary field from their request schemas. Treat this as this lesson's first hands-on exercise rather than a fifth repetition of the same walkthrough — the value now is in doing it yourself, not reading it done a fifth time.

---

## Concept Unit: Roles, and a Second Kind of Authorization

### The Problem

Ownership-based authorization ("only the author can edit their post") can't express "a moderator should be able to remove any post, even one they didn't write." That's not an ownership question at all — it's a question of what *kind* of member someone is, independent of who owns what.

### The failing test

```python
def test_admin_can_delete_any_post():
    author_token = client.post("/login", json={"username": "carol", "password": "hunter2000"}).json()["access_token"]
    post = client.post(
        "/posts", json={"content": "will be moderated"},
        headers={"Authorization": f"Bearer {author_token}"},
    ).json()

    admin_token = client.post("/login", json={"username": "admin_user", "password": "adminpass123"}).json()["access_token"]
    response = client.delete(f"/posts/{post['id']}", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 204
```

### Introduce the concept in isolation

Create `lab_rbac.py`:

```python
def can_delete(actor_role: str, actor_id: int, resource_owner_id: int) -> bool:
    if actor_role == "admin":
        return True
    return actor_id == resource_owner_id

print(can_delete("member", 1, 1))   # own post
print(can_delete("member", 2, 1))   # someone else's post
print(can_delete("admin", 2, 1))    # admin, someone else's post
```

Run it:

```bash
python lab_rbac.py
```

Output:

```text
True
False
True
```

*What this proves:* authorization can be **either** "you own this" **or** "your role grants this regardless of ownership" — two independent conditions, combined with `or`. Neither condition alone captures the real policy; the combination does.

### Discard the throwaway example

Delete `lab_rbac.py`. Add a real `role` column and apply this exact logic.

### Project Change

* **Files affected:** `db.py`, `main.py`.
* **Change type:** Modify.

### The New Code

```python
# db.py — modify members table to add role
conn.execute("""
    CREATE TABLE IF NOT EXISTS members (
        id INTEGER PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'member'
    )
""")
```

```python
# main.py — delete_post, gains role-based override
@app.delete("/posts/{post_id}", status_code=204)
def delete_post(post_id: int, current_member: dict = Depends(get_current_member)):
    conn = get_connection()
    row = conn.execute("SELECT author_id FROM posts WHERE id = ?", (post_id,)).fetchone()
    if row is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Post not found")

    is_owner = row["author_id"] == current_member["id"]
    is_admin = current_member["role"] == "admin"
    if not (is_owner or is_admin):
        conn.close()
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    conn.execute("DELETE FROM posts WHERE id = ?", (post_id,))
    conn.commit()
    conn.close()
```

### Mechanical walkthrough

1. `role TEXT NOT NULL DEFAULT 'member'`: (already-established `DEFAULT` pattern from Lesson 5). Every new account is the lowest-privilege role automatically — becoming an admin requires a deliberate, separate action (not built in this lesson: a real system would restrict *who* can promote a member to admin, itself an authorization question worth naming even though it's out of scope here).
2. `get_current_member` (from Lesson 14) already `SELECT`s `*`-equivalent columns from `members` by id — `role` is automatically included in `current_member` once the column exists, with no change needed to `get_current_member` itself.
3. `is_owner or is_admin`: (already-established from the isolation example). Two independently-computed booleans, combined explicitly — deliberately not collapsed into one nested `if`, so each condition's meaning stays readable on its own.

### CS Lens

**RBAC (Role-Based Access Control) as a distinct authorization model from ownership-based checks.** Lesson 6 implemented one specific, narrow rule: "the actor must equal the resource's owner." RBAC generalizes differently: permissions attach to a *role* (`admin`, `member`), not to a specific relationship between an actor and a specific resource. Real systems very often combine both, exactly as this lesson does — a role can grant blanket permissions, while ownership grants narrower, resource-specific ones.

### SE Lens

**Principle of least privilege.** `DEFAULT 'member'` means every account starts with the minimum capability needed, and elevated access (`admin`) must be explicitly and deliberately granted — never the accidental default. Getting this default backwards (defaulting to elevated access, restricting explicitly) is a common, serious real-world security mistake; the direction of the default is itself a security decision, not an arbitrary choice.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 23 items

tests/test_api.py .......................                                [100%]

============================== 23 passed in 0.24s ===============================
```

### Connecting sentence

Every write path is now genuinely authenticated and correctly authorized. Phase 5 is complete — the next phase steps back from features entirely and restructures how this growing pile of near-duplicated database code is organized, starting with the Repository pattern flagged repeatedly since Lesson 6.

---

## Closing

**Connect the pieces**
Every mutating route now receives `current_member` via `Depends(get_current_member)` — a verified identity, never a client claim. `delete_post` combines two independent authorization checks (ownership, from Lesson 6; role, new this lesson) with `or`, matching the real policy neither check alone could express.

**What breaks without this**
Without the `role` check, promoting *any* member to a moderation capability would be impossible without either giving them the literal `author_id` of every post they might need to moderate (nonsensical) or weakening the ownership check for everyone (a security regression). RBAC is what makes "some people can do more than others, independent of what they personally own" expressible at all.

**Exercises**
1. Complete the migration for `like_post` and `follow_member`, following `update_post`'s pattern exactly.
2. Add a `require_admin` dependency (following `get_current_member`'s shape, but additionally checking `role == "admin"` and raising `403` otherwise) and use it to protect a new `DELETE /members/{id}` account-removal endpoint, admin-only, no ownership exception at all.

**Definition of Done**
* [x] Every mutating endpoint from Lessons 4-9 authenticated via `Depends(get_current_member)`, no client-supplied identity remaining.
* [x] `role` column added, defaulting to least privilege.
* [x] `delete_post` correctly combines ownership and role-based authorization.
* [x] Commit: `feat: complete auth migration and add role-based access control`

---

## Context Snapshot (End of Lesson 15)

**2. Schema State (addition):** `members.role TEXT NOT NULL DEFAULT 'member'`.

**3. API Manifest:** All mutating routes now require `Authorization: Bearer <token>`; no endpoint accepts a client-supplied identity field.

**5. Test State:** 23 tests, 23 passing.

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| RBAC (Role-Based Access Control) | L15 | Permissions attached to a role, distinct from ownership-based rules |
| Combined authorization (ownership OR role) | L15 | Two independent conditions, either sufficient, expressing a real-world policy neither covers alone |
| Principle of least privilege | L15 | Default to minimum access; elevated access must be explicitly granted, never the accidental default |

**7. Lesson Completion State:**
- Completed: Lessons 1-15, Interludes A, B, C — **Phase 5 complete**
- Next: Lesson 16 — Repository/Service Layers, Dependency Inversion (Phase 6 begins), then Interlude D — Memory: GC vs. Manual

**8. Current Architecture State:**
- HTTP Layer: 20 routes, fully authenticated
- Business Logic: `extract_hashtags`, `create_access_token`, `get_current_member`
- Data Access: unchanged structurally, but every route now sources identity from `Depends()`, never the request body
- ORM: not introduced
- Authentication: complete for all mutating routes; RBAC layered on top of ownership checks
