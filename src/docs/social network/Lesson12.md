# Frontend Lesson 4 — Comment Thread: Nested Components and Optimistic Updates

**Track:** Developer Social Network — Slice 4 (Frontend)
**Depth:** Heavy — optimistic updates are a genuinely new pattern, and component composition done deliberately (not just "components calling components") is worth real attention
**Goal:** A comment thread nested under each post, composed from small, focused components, with an optimistic-update submit flow — implementing exactly the UI/UX interlude's Decisions 1-3, built test-first.

---

## 0. What "optimistic" means here, precisely

Every fetch so far has followed the same shape: send a request, *wait*, then update the UI once the response comes back. An **optimistic update** flips that order for actions very likely to succeed: update the UI *immediately*, assuming success, then quietly confirm (or roll back) once the real response arrives. The UI/UX interlude's Decision 2 already justified why — it makes the interface feel instantly responsive, which matters a lot for something as low-stakes and frequent as posting a comment.

---

## 1. Component composition — breaking the thread into focused pieces

Rather than one large `CommentThread` component doing everything, this lesson deliberately splits it into three:

```
CommentThread          <- owns the list of comments + the "add comment" state
  └── CommentList         <- just renders a list of CommentItem
        └── CommentItem      <- renders ONE comment
  └── CommentForm          <- the input + submit button
```

**Why split it this way, not arbitrarily:** each component has exactly one clear job. `CommentItem` doesn't know anything about fetching or submitting — it just displays a comment it's handed. `CommentForm` doesn't know how comments get displayed — it just collects input and reports "submit this." This separation means each piece is independently readable, testable, and reusable — directly the same "separation of concerns" idea Backend Lesson 1's models-vs-schemas split introduced, now applied to frontend components instead of backend data shapes.

---

## 2. Test-first — `CommentItem`, the simplest piece first

```typescript
// src/components/CommentItem.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CommentItem } from './CommentItem';

describe('CommentItem', () => {
  it('displays the comment content and author', () => {
    const comment = {
      id: 1,
      content: 'Great post!',
      post_id: 1,
      author_username: 'alice',
      created_at: '2026-01-01T00:00:00Z',
    };

    render(<CommentItem comment={comment} />);

    expect(screen.getByText('Great post!')).toBeInTheDocument();
    expect(screen.getByText(/alice/)).toBeInTheDocument();
  });

  it('shows a pending indicator for optimistically-added comments', () => {
    const pendingComment = {
      id: -1,   // a temporary, client-side-only id, explained in Section 4
      content: 'Just posted this',
      post_id: 1,
      author_username: 'me',
      created_at: '2026-01-01T00:00:00Z',
      isPending: true,
    };

    render(<CommentItem comment={pendingComment} />);
    expect(screen.getByText(/posting/i)).toBeInTheDocument();
  });
});
```

Run this — red, `CommentItem` doesn't exist. Green next:

```typescript
// src/types/Comment.ts
export interface Comment {
  id: number;
  content: string;
  post_id: number;
  author_username: string;
  created_at: string;
  isPending?: boolean;   // optional - only true for optimistic, not-yet-confirmed comments
}
```

```typescript
// src/components/CommentItem.tsx
import { Comment } from '../types/Comment';

interface CommentItemProps {
  comment: Comment;
}

export function CommentItem({ comment }: CommentItemProps) {
  return (
    <div>
      <p>{comment.content}</p>
      <p>
        — {comment.author_username}
        {comment.isPending && <span> (posting...)</span>}
      </p>
    </div>
  );
}
```

**`isPending?: boolean`** — the `?` marks this property as **optional** in the TypeScript interface; a `Comment` can exist with or without it. This is the actual mechanism that lets one shared type represent both "a real, confirmed comment from the server" and "a comment that's been optimistically added but not yet confirmed" (Section 4).

---

## 3. Test-first — `CommentForm`, applying the UI/UX interlude's decisions directly

```typescript
// src/components/CommentForm.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CommentForm } from './CommentForm';

describe('CommentForm', () => {
  it('disables the submit button when the textarea is empty', () => {
    render(<CommentForm onSubmit={() => {}} />);
    expect(screen.getByRole('button', { name: /post comment/i })).toBeDisabled();
  });

  it('enables the submit button once text is entered', async () => {
    const user = userEvent.setup();
    render(<CommentForm onSubmit={() => {}} />);

    await user.type(screen.getByLabelText(/comment/i), 'A thought');
    expect(screen.getByRole('button', { name: /post comment/i })).toBeEnabled();
  });

  it('calls onSubmit with the content and clears the field', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CommentForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(/comment/i), 'A thought');
    await user.click(screen.getByRole('button', { name: /post comment/i }));

    expect(handleSubmit).toHaveBeenCalledWith('A thought');
    expect(screen.getByLabelText(/comment/i)).toHaveValue('');
  });
});
```

Run this — red. Green:

```typescript
// src/components/CommentForm.tsx
import { useState } from 'react';

interface CommentFormProps {
  onSubmit: (content: string) => void;
}

export function CommentForm({ onSubmit }: CommentFormProps) {
  const [content, setContent] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(content);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="comment-input">Comment</label>
      <textarea
        id="comment-input"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button type="submit" disabled={content.trim().length === 0}>
        Post Comment
      </button>
    </form>
  );
}
```

**`disabled={content.trim().length === 0}`** — implements the UI/UX interlude's Decision 3 directly: the button is disabled whenever the trimmed content is empty (so whitespace-only input doesn't count as "has content"), rather than allowing submission and showing an error afterward.

**Notice `CommentForm` doesn't call `fetch` at all** — it only calls `onSubmit(content)`, a prop, and lets whoever renders it (`CommentThread`, Section 4) decide what actually happens with that content. This is deliberate: `CommentForm` stays focused purely on "collect input, report it," with zero knowledge of the API — the same "one clear job per component" principle from Section 1.

---

## 4. Test-first — `CommentThread`, where the optimistic update actually happens

```typescript
// src/components/CommentThread.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CommentThread } from './CommentThread';

const existingComments = [
  { id: 1, content: 'First!', post_id: 1, author_username: 'alice', created_at: '2026-01-01T00:00:00Z' },
];

describe('CommentThread', () => {
  it('loads and displays existing comments', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => existingComments });

    render(<CommentThread postId={1} />);

    await waitFor(() => {
      expect(screen.getByText('First!')).toBeInTheDocument();
    });
  });

  it('optimistically shows a new comment immediately, before the server responds', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => existingComments })   // initial load
      .mockImplementationOnce(() => new Promise(() => {}));   // submit request that NEVER resolves (simulates "still loading")
    global.fetch = mockFetch;

    const user = userEvent.setup();
    render(<CommentThread postId={1} />);

    await waitFor(() => screen.getByText('First!'));

    await user.type(screen.getByLabelText(/comment/i), 'My new comment');
    await user.click(screen.getByRole('button', { name: /post comment/i }));

    // The new comment should appear IMMEDIATELY, even though the "server" request above never resolves
    expect(screen.getByText('My new comment')).toBeInTheDocument();
    expect(screen.getByText(/posting/i)).toBeInTheDocument();
  });

  it('replaces the optimistic comment with the real one once the server confirms', async () => {
    const confirmedComment = { id: 42, content: 'My new comment', post_id: 1, author_username: 'me', created_at: '2026-01-02T00:00:00Z' };
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => existingComments })
      .mockResolvedValueOnce({ ok: true, json: async () => confirmedComment });
    global.fetch = mockFetch;

    const user = userEvent.setup();
    render(<CommentThread postId={1} />);

    await waitFor(() => screen.getByText('First!'));
    await user.type(screen.getByLabelText(/comment/i), 'My new comment');
    await user.click(screen.getByRole('button', { name: /post comment/i }));

    await waitFor(() => {
      expect(screen.queryByText(/posting/i)).not.toBeInTheDocument();
    });
  });
});
```

**`mockImplementationOnce(() => new Promise(() => {}))`** — creates a Promise that deliberately never resolves, simulating "the server hasn't responded yet." This is what makes it possible to test "does the optimistic comment appear *before* the server confirms" — if it only appeared after confirmation, this test would hang forever waiting for something that's never coming, and `expect(screen.getByText(...))` would fail immediately instead, correctly catching a non-optimistic implementation.

Run these — red. Green:

```typescript
// src/components/CommentThread.tsx
import { useState, useEffect } from 'react';
import { Comment } from '../types/Comment';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';

interface CommentThreadProps {
  postId: number;
}

export function CommentThread({ postId }: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    fetch(`http://localhost:8000/posts/${postId}/comments`)
      .then((response) => response.json())
      .then((data: Comment[]) => setComments(data));
  }, [postId]);   // re-fetch if postId ever changes - not empty [], since this depends on a prop

  const handleSubmit = async (content: string) => {
    const temporaryId = -Date.now();   // a negative, unlikely-to-collide temporary id
    const optimisticComment: Comment = {
      id: temporaryId,
      content,
      post_id: postId,
      author_username: 'me',
      created_at: new Date().toISOString(),
      isPending: true,
    };

    // Update the UI FIRST, before the network call - this is the actual optimistic update
    setComments((existing) => [...existing, optimisticComment]);

    const response = await fetch(`http://localhost:8000/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    const confirmedComment: Comment = await response.json();

    // Replace the temporary optimistic comment with the real, server-confirmed one
    setComments((existing) =>
      existing.map((c) => (c.id === temporaryId ? confirmedComment : c))
    );
  };

  return (
    <div>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
      <CommentForm onSubmit={handleSubmit} />
    </div>
  );
}
```

Reading the key new piece: **`setComments((existing) => existing.map((c) => (c.id === temporaryId ? confirmedComment : c)))`** — this is the "quietly confirm" half of the optimistic update. `.map()` walks every existing comment; for the one matching the temporary ID, it substitutes the real, server-returned comment (with a real `id`, no `isPending`); every other comment passes through unchanged. This is what makes the "(posting...)" indicator disappear once the real response arrives — the optimistic comment object, `isPending` and all, is fully replaced, not just edited in place.

Run the tests again — green.

---

## 5. What this lesson deliberately doesn't handle yet

If the server request fails entirely (network error, `500` response), this implementation currently leaves the optimistic comment sitting there forever, still marked "(posting...)" — a real gap, left as Challenge 2 below rather than solved here, since building the failure/rollback path yourself, now that the success path is solid and tested, is a better exercise than reading it pre-built.

---

## 6. Challenges before Slice 5

1. Write a failing test first: verify that submitting a comment while the previous one is still pending doesn't let a second optimistic comment with a *colliding* temporary ID get created. (Hint: think about what `-Date.now()` guarantees, and whether it's actually airtight if two submissions happen in the same millisecond.)
2. Write a failing test first for the failure case flagged in Section 5: if the POST request fails, the optimistic comment should be removed (or marked as failed) rather than staying stuck as "(posting...)" forever. Implement the fix.
3. `CommentThread`'s `useEffect` dependency array is `[postId]`, not `[]`. Explain, in your own words, a real scenario in this app where `postId` could actually change while `CommentThread` stays mounted — and why the empty-array version from Frontend Lesson 3 would have been wrong here specifically.
4. Revisit the UI/UX interlude's Challenge 1 (the "Load More" button's missing loading state). Now that you've built a real pending-state pattern here (`isPending`), would you make a different recommendation than you did before building this lesson? Reasoning that changes with more experience is a real, good sign — not a contradiction to smooth over.

---

## What's next

Slice 5 adds notifications — polling on the backend, state lifting on the frontend — alongside the Memory Model interlude (stack vs. heap) and the Observer Pattern interlude, since notifications are the natural home for that pattern. Say the word when you're ready.
