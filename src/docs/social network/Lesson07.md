# Backend Lesson 3 — The Posts Model and Cursor Pagination

**Track:** Developer Social Network — Slice 3 (Backend)
**Depth:** Heavy on the relationship/pagination mechanics, light on new ceremony — the test-first rhythm is now familiar from Lessons 1-2
**Goal:** A `Post` model linked to `User` via a foreign key, and a cursor-paginated `GET /posts` endpoint implementing the exact approach the Data Structures interlude justified — all test-first.

---

## 0. What's genuinely new here

Two things this lesson introduces for the first time: a **foreign key relationship** between two tables (a post belongs to a user), and a **query parameter**-driven endpoint (pagination controlled by what's in the URL, not the request body). Everything else — the test-first rhythm, Pydantic schemas, dependency injection — is now familiar from Lessons 1-2, applied to new data.

---

## 1. The Post model — with a foreign key

```python
# app/models.py (add to the existing file)
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    author = relationship("User", backref="posts")
```

- **`ForeignKey("users.id")`** — this is the database-enforced link: `author_id` must always match a real, existing row in the `users` table. The database itself rejects an attempt to create a post with an `author_id` that doesn't correspond to any real user — a genuine data-integrity guarantee, not something the application code has to remember to check.
- **`relationship("User", backref="posts")`** — this is SQLAlchemy's ORM convenience layer, separate from the actual foreign key column: it lets you write `some_post.author` in Python to get the actual `User` object (not just the raw `author_id` number), and — because of `backref="posts"` — it also automatically gives you `some_user.posts`, a list of that user's posts, without writing a separate query for it.
- **`index=True` on `author_id` and `created_at`** — directly applying the previous interlude's reasoning: `created_at` is indexed because cursor pagination filters and sorts by it constantly; `author_id` is indexed because "get all posts by this user" (a future feature) will filter by it too.
- **`Text` instead of `String`** — a practical detail: `Text` doesn't impose the same length constraints some databases apply to `String`/`VARCHAR` by default, a sensible choice for post content that could be long.

---

## 2. Pydantic schemas for posts

```python
# app/schemas.py (add)
class PostCreate(BaseModel):
    content: str


class PostResponse(BaseModel):
    id: int
    content: str
    author_id: int
    author_username: str
    created_at: datetime

    class Config:
        from_attributes = True


class PaginatedPostsResponse(BaseModel):
    posts: list[PostResponse]
    next_cursor: str | None   # null when there are no more posts to fetch
```

**`author_username` on `PostResponse`, even though it's not a direct column on `Post`** — a deliberate API design choice: a post feed almost always needs to display who wrote each post, and requiring the frontend to make a *separate* request per post just to learn the author's username would be wasteful and slow. Including it directly means the backend does one efficient join (Section 4) instead of the frontend doing many small requests — worth noticing as a real API design decision, not an accident of what happened to be easy to add.

**`next_cursor: str | None`** — this is what makes cursor pagination usable from the client side: each response tells the client exactly what cursor to send for the *next* page, so the client never needs to construct cursor values itself.

---

## 3. Test-first

```python
# tests/test_posts.py
# (same TestSessionLocal / override_get_db / fixture setup pattern as prior test files)
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def create_user_and_get_token(username: str) -> str:
    client.post("/users", json={"username": username, "email": f"{username}@example.com", "password": "password123"})
    response = client.post("/login", json={"username": username, "password": "password123"})
    return response.json()["access_token"]


def test_create_post_requires_authentication():
    response = client.post("/posts", json={"content": "Hello, world!"})
    assert response.status_code == 401


def test_create_post_succeeds_when_authenticated():
    token = create_user_and_get_token("greta")
    response = client.post(
        "/posts",
        json={"content": "My first post"},
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 201
    data = response.json()
    assert data["content"] == "My first post"
    assert data["author_username"] == "greta"


def test_get_posts_returns_most_recent_first():
    token = create_user_and_get_token("harold")
    for i in range(3):
        client.post("/posts", json={"content": f"Post number {i}"},
                     headers={"Authorization": f"Bearer {token}"})

    response = client.get("/posts")

    assert response.status_code == 200
    data = response.json()
    contents = [post["content"] for post in data["posts"]]
    assert contents == ["Post number 2", "Post number 1", "Post number 0"]   # newest first


def test_get_posts_respects_page_size_and_provides_next_cursor():
    token = create_user_and_get_token("iris")
    for i in range(5):
        client.post("/posts", json={"content": f"Iris post {i}"},
                     headers={"Authorization": f"Bearer {token}"})

    response = client.get("/posts?page_size=2")
    data = response.json()

    assert len(data["posts"]) == 2
    assert data["next_cursor"] is not None


def test_get_posts_cursor_advances_correctly():
    token = create_user_and_get_token("jamal")
    for i in range(5):
        client.post("/posts", json={"content": f"Jamal post {i}"},
                     headers={"Authorization": f"Bearer {token}"})

    first_page = client.get("/posts?page_size=2").json()
    second_page = client.get(f"/posts?page_size=2&cursor={first_page['next_cursor']}").json()

    first_page_ids = {post["id"] for post in first_page["posts"]}
    second_page_ids = {post["id"] for post in second_page["posts"]}
    assert first_page_ids.isdisjoint(second_page_ids)   # no overlap between pages
```

Run this now — fails, since none of this exists yet. Red.

**`{post["id"] for post in first_page["posts"]}`** — this is a **set comprehension**, the same comprehension pattern from the earlier Python-idioms primer, just building a `set` (an unordered collection with no duplicates) instead of a list. `.isdisjoint(...)` checks that two sets share zero elements in common — a clean, direct way to verify "these two pages don't overlap" without writing a manual loop.

---

## 4. Green — the Posts endpoints

```python
# app/routes/posts.py
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.routes.auth import get_current_user
from app import models, schemas

router = APIRouter()


@router.post("/posts", response_model=schemas.PostResponse, status_code=201)
def create_post(
    post_data: schemas.PostCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_post = models.Post(content=post_data.content, author_id=current_user.id)
    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return schemas.PostResponse(
        id=new_post.id,
        content=new_post.content,
        author_id=new_post.author_id,
        author_username=current_user.username,
        created_at=new_post.created_at
    )


@router.get("/posts", response_model=schemas.PaginatedPostsResponse)
def get_posts(
    cursor: str | None = Query(default=None),
    page_size: int = Query(default=20, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(models.Post).options(joinedload(models.Post.author)) \
        .order_by(models.Post.created_at.desc())

    if cursor is not None:
        cursor_datetime = datetime.fromisoformat(cursor)
        query = query.filter(models.Post.created_at < cursor_datetime)

    posts = query.limit(page_size + 1).all()   # fetch ONE extra, to know if there's a next page

    has_more = len(posts) > page_size
    posts = posts[:page_size]

    next_cursor = posts[-1].created_at.isoformat() if has_more and posts else None

    return schemas.PaginatedPostsResponse(
        posts=[
            schemas.PostResponse(
                id=p.id, content=p.content, author_id=p.author_id,
                author_username=p.author.username, created_at=p.created_at
            ) for p in posts
        ],
        next_cursor=next_cursor
    )
```

Reading the key new pieces:
- **`Query(default=None)` / `Query(default=20, le=100)`** — declares these as *query parameters* (the `?cursor=...&page_size=...` part of the URL), not request body fields, with `le=100` enforcing a real, server-side maximum page size — preventing a client from requesting an absurdly large page and defeating the whole point of pagination.
- **`joinedload(models.Post.author)`** — this tells SQLAlchemy to fetch each post's author in the *same* database query (a SQL `JOIN`), rather than issuing a separate query per post to look up `post.author`. Without this, looping over posts and accessing `.author.username` for each one would silently trigger one extra database query *per post* — this is a direct, concrete instance of the N+1 query problem, previewed here and covered properly as its own topic in Slice 4.
- **`query.limit(page_size + 1)`, then trimming to `page_size`** — a clean, standard trick for knowing whether a "next page" exists: fetch one more row than you'll actually return; if that extra row came back, you know there's more data, without a separate `COUNT(*)` query (which would itself cost real time on a large table — directly connecting back to Section 1's Big-O reasoning).

Register the router:

```python
# app/main.py (add)
from app.routes import posts
app.include_router(posts.router)
```

Run the tests again — green.

---

## 5. Challenges before the frontend lesson

1. Write a failing test first: verify that `GET /posts?page_size=150` gets rejected (since the interlude's Section 3 argued for a server-enforced maximum) — check what FastAPI's `le=100` constraint actually returns as a status code, and assert on that.
2. Temporarily remove `joinedload(models.Post.author)` from `get_posts`, and — using SQLAlchemy's query logging (`echo=True` on the engine, or a debugger) — confirm you can actually observe the extra per-post queries this creates. This is the N+1 problem, made visible with your own eyes before Slice 4 names it formally.
3. `test_get_posts_cursor_advances_correctly` checks the two pages don't overlap, but doesn't check they're in the *correct combined order*. Write an additional assertion (or new test) verifying that concatenating both pages' post IDs, in order, matches what a single request for all 5 posts would return in order.
4. In your own words, explain why `next_cursor` is built from `created_at` (a timestamp) rather than from the post's `id` — is there a real reason to prefer one over the other here, or would `id` work equally well? Reason through an edge case (e.g., what if two posts have the exact same `created_at`) before deciding.

---

## What's next

The frontend lesson builds the post feed — list rendering, `useEffect` (fetching data when a component first appears), and pagination UI that consumes `next_cursor` exactly as this backend returns it. Say the word when you're ready.
