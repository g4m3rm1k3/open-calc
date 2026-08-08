# Backend Lesson 5 — Notifications, Wired Through the Event System

**Track:** Developer Social Network — Slice 5 (Backend)
**Depth:** Moderate — the interesting design work already happened in the Observer Pattern interlude; this lesson is mostly applying it and building the polling endpoint
**Goal:** A `Notification` model, an event handler that creates one whenever a comment is posted (using the interlude's `EventEmitter`), and a `GET /notifications` polling endpoint — all test-first.

---

## 0. Why polling, not a websocket, for now

True real-time push (websockets) is a heavier piece of infrastructure — a persistent connection per user, more complex error handling, more to reason about. **Polling** — the client periodically asking "anything new?" — is simpler, and for a notification bell that doesn't need sub-second delivery, entirely adequate. This is a deliberate, reasoned scope decision, not a placeholder apology: build the simple thing that fits the actual requirement, and revisit only if a real need for lower latency shows up later. Worth noticing this is the same judgment call as the Observer interlude's Section 4 — using the lightweight version of a pattern because the project's actual scale justifies it.

---

## 1. The Notification model

```python
# app/models.py (add)
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    user = relationship("User")
```

`is_read`, defaulting to `False` — tracks whether the user has seen it yet, needed for both the frontend's "unread count" badge and marking-as-read behavior (Challenge 3).

---

## 2. Wiring the event system for real

```python
# app/events.py
# (exactly the EventEmitter from the Observer Pattern interlude, unchanged)
```

```python
# app/notifications.py
from app.events import event_emitter
from app import models
from sqlalchemy.orm import Session


def handle_comment_created(post_id: int, comment_author: models.User, db: Session):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if post is None or post.author_id == comment_author.id:
        return

    notification = models.Notification(
        user_id=post.author_id,
        message=f"{comment_author.username} commented on your post"
    )
    db.add(notification)
    db.commit()


def register_notification_handlers():
    event_emitter.on("comment_created", handle_comment_created)
```

```python
# app/main.py (add)
from app.notifications import register_notification_handlers
register_notification_handlers()   # called once, at startup
```

```python
# app/routes/posts.py (modify create_comment to actually emit)
from app.events import event_emitter

@router.post("/posts/{post_id}/comments", response_model=schemas.CommentResponse, status_code=201)
def create_comment(post_id, comment_data, db=Depends(get_db), current_user=Depends(get_current_user)):
    # ... existing comment-creation logic from Backend Lesson 4 ...
    event_emitter.emit("comment_created", post_id=post_id, comment_author=current_user, db=db)
    return schemas.CommentResponse(...)   # unchanged from Backend Lesson 4
```

**Why `register_notification_handlers()` is a separate, explicitly-called function**, rather than the `.on(...)` call just sitting at the top of `notifications.py`: it makes the wiring step visible and intentional in `main.py` — anyone reading the app's startup sequence can see exactly what event handlers get registered, rather than that registration happening as a side effect buried inside an import statement somewhere.

---

## 3. Test-first

```python
# tests/test_notifications.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def create_user_and_get_token(username: str) -> str:
    client.post("/users", json={"username": username, "email": f"{username}@example.com", "password": "password123"})
    return client.post("/login", json={"username": username, "password": "password123"}).json()["access_token"]


def test_commenting_on_someone_elses_post_creates_a_notification():
    author_token = create_user_and_get_token("nadia")
    post_id = client.post("/posts", json={"content": "My post"},
                            headers={"Authorization": f"Bearer {author_token}"}).json()["id"]

    commenter_token = create_user_and_get_token("omar")
    client.post(f"/posts/{post_id}/comments", json={"content": "Nice post!"},
                 headers={"Authorization": f"Bearer {commenter_token}"})

    response = client.get("/notifications", headers={"Authorization": f"Bearer {author_token}"})
    data = response.json()

    assert len(data) == 1
    assert "omar" in data[0]["message"]


def test_commenting_on_your_own_post_does_not_notify_yourself():
    token = create_user_and_get_token("priya")
    post_id = client.post("/posts", json={"content": "My post"},
                            headers={"Authorization": f"Bearer {token}"}).json()["id"]

    client.post(f"/posts/{post_id}/comments", json={"content": "Self comment"},
                 headers={"Authorization": f"Bearer {token}"})

    response = client.get("/notifications", headers={"Authorization": f"Bearer {token}"})
    assert response.json() == []


def test_notifications_endpoint_requires_authentication():
    response = client.get("/notifications")
    assert response.status_code == 401


def test_only_returns_notifications_for_the_authenticated_user():
    token_a = create_user_and_get_token("quinn")
    post_id = client.post("/posts", json={"content": "Quinn's post"},
                            headers={"Authorization": f"Bearer {token_a}"}).json()["id"]

    token_b = create_user_and_get_token("rosa")
    client.post(f"/posts/{post_id}/comments", json={"content": "Hi Quinn"},
                 headers={"Authorization": f"Bearer {token_b}"})

    rosa_notifications = client.get("/notifications", headers={"Authorization": f"Bearer {token_b}"}).json()
    assert rosa_notifications == []   # rosa commented, she shouldn't see quinn's notification
```

Run these — red, since `/notifications` doesn't exist yet.

---

## 4. Green

```python
# app/schemas.py (add)
class NotificationResponse(BaseModel):
    id: int
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
```

```python
# app/routes/notifications.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.routes.auth import get_current_user
from app import models, schemas

router = APIRouter()


@router.get("/notifications", response_model=list[schemas.NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    notifications = db.query(models.Notification) \
        .filter(models.Notification.user_id == current_user.id) \
        .order_by(models.Notification.created_at.desc()) \
        .all()
    return notifications
```

```python
# app/main.py (add)
from app.routes import notifications
app.include_router(notifications.router)
```

Run the tests again — green. Notice how little new *code* this lesson actually needed: the hard design work (decoupling comment creation from notification logic) was already done in the interlude — this lesson mostly wires it together and exposes it over HTTP, which is a good sign the interlude's separation of concerns is paying off already.

---

## 5. Challenges before the frontend lesson

1. Write a failing test first for an unread-count endpoint: `GET /notifications/unread-count` should return `{"count": N}`, matching only notifications where `is_read` is `False`. Implement it.
2. Write a failing test first for marking a notification as read: `PATCH /notifications/{id}/read` should set `is_read` to `True`, and should return `404` (or `403`) if the notification doesn't belong to the requesting user. Implement it — think carefully about that ownership check specifically, since it's a real security boundary, not just a formality.
3. Following the Observer interlude's Challenge 1, register a *second* observer on `"comment_created"` — this time, one that increments a simple in-memory counter of "total comments created across the app" (doesn't need to be persisted). Confirm `create_comment` needed zero changes to support it.
4. The event handler currently commits its own `db.commit()` inside `handle_comment_created`, separate from the comment's own commit inside `create_comment`. This means if the notification's commit somehow failed, the comment itself would already be saved. Is this a real problem worth fixing at this project's current scale? Reason through it, referencing the Observer interlude's Section 4 scope discussion, rather than assuming "more transactional safety is always better" by default.

---

## What's next

The frontend lesson builds the notification bell, polling via `useEffect` on an interval, and introduces state lifting — sharing notification state between the bell (likely in a header, rendered everywhere) and wherever a full notification list gets displayed. Say the word when you're ready.
