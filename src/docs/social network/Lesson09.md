# Backend Lesson 4 — Comments, and Solving the N+1 Problem for Real

**Track:** Developer Social Network — Slice 4 (Backend)
**Depth:** Heavy on the N+1 problem specifically — this is one of the most common real-world backend performance bugs, and Backend Lesson 3 already showed you a hint of it
**Goal:** A `Comment` model nested under posts, a `/posts/{post_id}/comments` endpoint, and a hands-on demonstration of the N+1 query problem — created deliberately, observed, then fixed — so the fix means something rather than being a rule to memorize.

---

## 0. What N+1 actually means, named precisely

Backend Lesson 3, Challenge 2 hinted at this. Here's the full picture: if you fetch **N** posts, and then, for each one, run a *separate* query to get something related (like its comments), you've made **1** query to get the posts, plus **N** more queries — one per post. Total: **N+1** queries, when the *data* you actually needed could often be fetched in far fewer. For 20 posts, that's 21 queries where 2 would do. For 10,000 posts, that's 10,001 — a genuinely serious, real performance problem, and one of the single most common backend bugs in production systems, precisely because it's invisible in small-scale testing and only becomes obviously painful at real scale.

---

## 1. The Comment model

```python
# app/models.py (add)
class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    post = relationship("Post", backref="comments")
    author = relationship("User")
```

Same pattern as `Post`'s relationship to `User` (Backend Lesson 3) — `post = relationship(...)` gives you `some_comment.post`, and `backref="comments"` gives you `some_post.comments` for free, without a separate query written by hand.

---

## 2. Deliberately creating the N+1 problem, so you can see it

```python
# app/routes/posts.py - a DELIBERATELY BAD version, for demonstration only
@router.get("/posts/{post_id}/comments-slow")
def get_comments_slow(post_id: int, db: Session = Depends(get_db)):
    comments = db.query(models.Comment).filter(models.Comment.post_id == post_id).all()

    # This loop looks innocent - but watch what it actually does underneath
    result = []
    for comment in comments:
        result.append({
            "id": comment.id,
            "content": comment.content,
            "author_username": comment.author.username   # <-- THIS triggers a NEW query, every single time
        })
    return result
```

**Why `comment.author.username` is the actual problem, mechanically:** `comment.author` is a SQLAlchemy relationship (Section 1). By default, accessing it **lazily loads** — meaning SQLAlchemy doesn't fetch the related `User` until the exact moment your code asks for `.author`, and it fetches it with a brand-new, separate query each time. Loop over 50 comments, and this one innocent-looking line runs 50 separate database queries, invisibly, one per iteration.

**See it for yourself** — enable SQLAlchemy's query logging temporarily:

```python
# app/database.py - temporarily add echo=True to SEE every query as it runs
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, echo=True)
```

Call `/posts/{post_id}/comments-slow` on a post with several comments, and watch the console — you'll see one query to fetch the comments, followed by one additional `SELECT ... FROM users WHERE id = ...` *per comment*. This is Backend Lesson 3's Challenge 2, but now built and observed directly rather than left as an exercise.

---

## 3. The fix — `joinedload`, applied correctly this time

```python
# app/routes/posts.py - the FIXED version
from sqlalchemy.orm import joinedload

@router.get("/posts/{post_id}/comments", response_model=list[schemas.CommentResponse])
def get_comments(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")

    comments = db.query(models.Comment) \
        .filter(models.Comment.post_id == post_id) \
        .options(joinedload(models.Comment.author)) \
        .order_by(models.Comment.created_at.asc()) \
        .all()

    return [
        schemas.CommentResponse(
            id=c.id, content=c.content, post_id=c.post_id,
            author_username=c.author.username, created_at=c.created_at
        ) for c in comments
    ]
```

Same `joinedload` mechanism from Backend Lesson 3, applied here to comments' authors. Now the console shows exactly **one** query total — the author data is fetched via a SQL `JOIN`, as part of the same query that fetches the comments, instead of N additional round-trips to the database.

**Turn `echo=True` back off** once you've observed both versions — it's a debugging tool, not something to leave on in real use (it's noisy and has its own small performance cost).

---

## 4. Schemas and the create-comment endpoint

```python
# app/schemas.py (add)
class CommentCreate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: int
    content: str
    post_id: int
    author_username: str
    created_at: datetime

    class Config:
        from_attributes = True
```

```python
# app/routes/posts.py (add)
@router.post("/posts/{post_id}/comments", response_model=schemas.CommentResponse, status_code=201)
def create_comment(
    post_id: int,
    comment_data: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")

    new_comment = models.Comment(content=comment_data.content, post_id=post_id, author_id=current_user.id)
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return schemas.CommentResponse(
        id=new_comment.id, content=new_comment.content, post_id=new_comment.post_id,
        author_username=current_user.username, created_at=new_comment.created_at
    )
```

---

## 5. Test-first

```python
# tests/test_comments.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def create_user_and_get_token(username: str) -> str:
    client.post("/users", json={"username": username, "email": f"{username}@example.com", "password": "password123"})
    return client.post("/login", json={"username": username, "password": "password123"}).json()["access_token"]


def test_create_comment_requires_authentication():
    token = create_user_and_get_token("kim")
    post_response = client.post("/posts", json={"content": "A post"}, headers={"Authorization": f"Bearer {token}"})
    post_id = post_response.json()["id"]

    response = client.post(f"/posts/{post_id}/comments", json={"content": "A comment"})
    assert response.status_code == 401


def test_create_comment_on_nonexistent_post_returns_404():
    token = create_user_and_get_token("liu")
    response = client.post("/posts/999999/comments", json={"content": "orphan comment"},
                             headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 404


def test_get_comments_returns_them_oldest_first_with_author_names():
    token = create_user_and_get_token("mona")
    post_id = client.post("/posts", json={"content": "Discuss"},
                            headers={"Authorization": f"Bearer {token}"}).json()["id"]

    client.post(f"/posts/{post_id}/comments", json={"content": "First!"}, headers={"Authorization": f"Bearer {token}"})
    client.post(f"/posts/{post_id}/comments", json={"content": "Second!"}, headers={"Authorization": f"Bearer {token}"})

    response = client.get(f"/posts/{post_id}/comments")
    data = response.json()

    assert [c["content"] for c in data] == ["First!", "Second!"]
    assert all(c["author_username"] == "mona" for c in data)
```

Run these — red, since none of this exists yet. Implement Sections 1, 3 (the fixed version only — never ship the deliberately-slow one), and 4, then run again — green.

---

## 6. Challenges before the frontend lesson

1. With `echo=True` temporarily back on, hit the *fixed* `/posts/{post_id}/comments` endpoint on a post with 5 comments, and count the actual number of SQL queries logged. Confirm it's a small, constant number, not one that scales with comment count.
2. Write a failing test first for a case Section 4 doesn't currently handle: what should happen if `content` is an empty string? Decide what the *correct* behavior should be (reject it? allow it?) before writing the test, then implement whichever you decided.
3. `joinedload` fixes N+1 for a *known, single* relationship accessed inside a loop. Research (briefly) what `selectinload` does differently in SQLAlchemy, and when it might be preferred over `joinedload` — this isn't covered in this lesson, deliberately, as a first taste of reading real documentation to extend what you've learned.
4. In your own words, explain why the N+1 problem is specifically dangerous *because* it's invisible in small-scale testing (a handful of posts/comments in a dev database) but severe at real scale — tie this back to the Data Structures interlude's Big-O reasoning from Slice 3.

---

## What's next

Before the frontend lesson, the Hash Maps interlude covers where hash maps are actually earning their keep in this codebase already (and where Python dictionaries are one, under the hood) — then a UI/UX interlude on usability heuristics applied to the comment thread specifically — then the frontend lesson itself: nested component composition and optimistic UI updates. Say the word when you're ready.
