# Interlude — Domain-Driven Design II: Aggregates and Bounded Contexts

**Track:** Developer Social Network — Slice 6 (Domain-Driven Design, applied to existing code)
**Depth:** Heavy — the last major conceptual thread of the series, and it directly explains *why* the architecture interlude's service boundaries fell where they did
**Goal:** Understand aggregates and bounded contexts precisely enough to identify the real domain boundaries already implicit in `User`, `Post`, `Comment`, and `Notification` — and reason about what would need to change if this project grew into a larger system.

---

## 0. Reconnecting to Domain-Driven Design I

Slice 1's DDD interlude covered entities vs. value objects, using `User` as the example. This lesson goes one level up: not "what is one thing," but "how do related things group together, and where are the real seams between different parts of the domain." The architecture interlude just built separate services for `User` and `Post` — this lesson explains *why* that boundary is the right one, in domain terms, not just implementation convenience.

---

## 1. Aggregates — a consistency boundary, not just "related objects"

An **aggregate** is a cluster of related objects treated as a single unit *for the purpose of data changes* — with one object designated the **aggregate root**, which is the only thing outside code is allowed to reference directly. Everything else inside the aggregate is only ever reached *through* the root.

**Is `Post` + its `Comment`s one aggregate, with `Post` as the root?** Reasoning through it, not just asserting an answer: a comment cannot exist without a post (`post_id` is required, Backend Lesson 4) — its existence is entirely dependent on the post. This dependency is the actual signal for aggregate membership: **an aggregate boundary usually follows genuine existence-dependency and consistency requirements, not just "these tables have a foreign key between them."**

**Contrast: is `User` + their `Post`s one aggregate?** A post depends on its author existing, but a *user's* existence and validity don't depend on having any posts at all — a brand-new user with zero posts is completely valid on its own. This asymmetry is exactly why `User` and `Post` ended up as **separate services** in the architecture interlude, not one combined "UserWithPosts" service — the aggregate boundary and the service boundary line up, because they're describing the same real domain insight from two different angles (data consistency, and code organization).

---

## 2. What the aggregate root actually enforces, concretely

```python
# app/services/post_service.py
class PostService:
    def __init__(self, post_repository, comment_repository):
        self.post_repository = post_repository
        self.comment_repository = comment_repository

    def add_comment(self, post_id: int, author_id: int, content: str):
        post = self.post_repository.find_by_id(post_id)
        if post is None:
            raise PostNotFoundError(post_id)

        # The rule lives HERE, at the aggregate root's service - not scattered elsewhere
        if len(content.strip()) == 0:
            raise EmptyCommentError()

        comment = models.Comment(post_id=post_id, author_id=author_id, content=content)
        return self.comment_repository.save(comment)
```

**The actual point:** business rules about comments (can't be empty, must belong to an existing post) are enforced *through* `PostService` — the aggregate root's service — rather than allowing something to reach into a `CommentRepository` directly and create a comment bypassing those rules. This is what "aggregate root as the only entry point" means in practice: it's not a restriction for its own sake, it's how you guarantee the *whole cluster* stays in a genuinely valid state, every time, through one enforced path rather than trusting every caller to remember the rules independently.

---

## 3. Bounded contexts — where the *language itself* starts to differ

A **bounded context** is a boundary within which a specific model and vocabulary apply consistently — and outside of which, the *same word* might mean something genuinely different. This is a bigger-picture idea than aggregates, usually relevant once a system has multiple distinct subdomains.

**A concrete, honest example using this project:** right now, "notification" means one simple thing — a row with a message and a read flag. But imagine this app grew a real "Settings" area where users configure notification *preferences* (email vs. in-app, frequency, muting specific post threads). At that point, "notification" starts meaning two different things in two different parts of the system: the **event/delivery** meaning (Slice 5's `Notification` model — a fact that happened) and a **preferences/configuration** meaning (a user's settings about what they want to be notified about) — genuinely different concepts that happen to share a name. **A bounded context boundary would say: these are two separate models, in two separate contexts, and the word "notification" is allowed to mean something different in each, without that being a naming conflict.**

**Why this matters, concretely, rather than as abstract theory:** without recognizing this boundary, you'd likely end up bolting preference fields directly onto the existing `Notification` model — even though a notification-that-happened and a notification-preference-configuration have completely different lifecycles, different owners in the code, and different reasons to change. Recognizing the bounded-context split *before* that tangle happens is the actual, practical value DDD is offering here — not a naming exercise, a way of noticing a real design fork before code gets tangled around ignoring it.

---

## 4. Mapping this project's actual bounded contexts, honestly

At this project's current size, being honest rather than over-formalizing: there's really **one bounded context** so far — a single, coherent "social network" domain where `User`, `Post`, `Comment`, and `Notification` all share consistent meaning and interact directly. That's completely fine, and expected, for a project this size. The value of this lesson isn't declaring multiple bounded contexts that don't genuinely exist yet — it's recognizing the **seam** in Section 3's example, so that *if* the app grows in that direction, the split happens deliberately instead of by accident, after the tangle has already formed.

**A genuine second bounded context this project could grow into:** an "Analytics" or "Admin Reporting" area, if ever added, would likely want its own read-optimized models of the same underlying data (e.g., "posts per user per week," pre-aggregated) — a legitimately different context, with different consistency requirements (approximate, eventually-consistent numbers are often fine for analytics, in a way they're never fine for "did this comment actually get saved").

---

## 5. Challenges

1. Apply Section 2's pattern for real: refactor `create_comment` (currently a standalone route function, even after the architecture interlude if you only did Challenge 1 there for `Post` creation, not comments) to go through `PostService.add_comment`, enforcing the "post must exist" and "content can't be empty" rules at the aggregate root, the way Section 2 describes. Write a `FakePostRepository` + `FakeCommentRepository` unit test for it.
2. Is `Notification` its own aggregate (root = itself, no dependent child objects), or does it belong inside some other aggregate? Reason through Section 1's existence-dependency test explicitly, rather than guessing.
3. Section 3 described a hypothetical "Settings" bounded context. Sketch, in words only, what a `NotificationPreference` model might look like, and explain specifically why it should NOT be added as extra columns on the existing `Notification` model — tie your answer to the "different lifecycle, different reason to change" reasoning.
4. Revisit Domain-Driven Design I's original question about `User`: is `Email` a value object or does it deserve to be its own entity, now that you've seen the aggregate/bounded-context framing? Would your answer from Slice 1 change at all with this fuller picture, or does it hold up?

---

## Slice 6 complete

The architecture interlude separated business logic from HTTP and SQL; this interlude explained *why* those particular boundaries were the right ones to draw, in real domain terms rather than arbitrary code organization. Between the two, you now have actual vocabulary and judgment for a question that comes up in every real, growing codebase: where do the seams go, and why there specifically.

## What's next

Slice 7 shifts to the frontend specifically — a real accessibility audit of the app built so far, a design-system consistency pass, and mapping actual user flows end to end. Say the word when you're ready.
