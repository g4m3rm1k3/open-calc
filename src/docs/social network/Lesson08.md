# Frontend Lesson 3 — The Post Feed, `useEffect`, and Pagination

**Track:** Developer Social Network — Slice 3 (Frontend)
**Depth:** Heavy — `useEffect` is the second genuinely new React concept after `useState`/`useContext`, and it's one people commonly misuse before understanding what it's actually for
**Goal:** A post feed that loads data when it first appears on screen, renders a list of posts, and a "Load more" button that consumes the backend's `next_cursor` exactly as Backend Lesson 3 returns it.

---

## 0. The problem `useEffect` solves

Every component so far has been purely reactive to user *actions* — typing, clicking. But a post feed needs to fetch data the moment it *appears* on screen, with no user action triggering it. There's no `onClick` for "the component just rendered for the first time." `useEffect` is React's tool for exactly this: running code in response to a component appearing (or specific values changing), rather than in response to a user event.

---

## 1. `useEffect` — explained from zero

```typescript
import { useEffect, useState } from 'react';

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);   // cleanup - runs when the component disappears
  }, []);   // empty array = run this effect once, when the component first appears

  return <p>{time.toLocaleTimeString()}</p>;
}
```

Reading the pieces:
- **`useEffect(() => { ... }, [])`** — takes two arguments: a function to run, and a **dependency array**. This is genuinely the most important, most-often-misunderstood part.
- **`[]` (empty array)** — "run this effect exactly once, right after the component first renders, and never again automatically." This is the pattern used for "fetch data when this component appears."
- **The `return () => clearInterval(intervalId)` inside the effect** — an optional **cleanup function**. React calls this automatically when the component is removed from the screen (or before re-running the effect again, if the dependency array isn't empty). Here, it stops the timer so it doesn't keep running invisibly after the `Clock` component is gone — a real, easy-to-create bug (a "memory leak") if this cleanup were forgotten.

**What the dependency array actually controls, more precisely:**

```typescript
useEffect(() => {
  console.log(`Fetching data for user ${userId}`);
}, [userId]);   // re-run this effect any time `userId` changes
```

`[userId]` means "run this effect after the first render, AND again any time `userId`'s value changes between renders." An empty `[]` is really just a special case: "the effect depends on nothing, so it only ever needs to run once." Getting the dependency array right is the single most common source of real `useEffect` bugs — listing a value you actually read inside the effect, but leaving it out of the array, is a genuine, common mistake worth being deliberate about, not just something to memorize a rule for.

---

## 2. Test-first — the post feed

```typescript
// src/components/PostFeed.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PostFeed } from './PostFeed';

const samplePage1 = {
  posts: [
    { id: 2, content: 'Second post', author_id: 1, author_username: 'alice', created_at: '2026-01-02T00:00:00Z' },
    { id: 1, content: 'First post', author_id: 1, author_username: 'alice', created_at: '2026-01-01T00:00:00Z' },
  ],
  next_cursor: '2026-01-01T00:00:00Z',
};

const samplePage2 = {
  posts: [
    { id: 0, content: 'Oldest post', author_id: 1, author_username: 'alice', created_at: '2025-12-31T00:00:00Z' },
  ],
  next_cursor: null,
};

describe('PostFeed', () => {
  it('loads and displays posts on mount', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => samplePage1,
    });

    render(<PostFeed />);

    await waitFor(() => {
      expect(screen.getByText('Second post')).toBeInTheDocument();
      expect(screen.getByText('First post')).toBeInTheDocument();
    });
  });

  it('shows a Load More button only when next_cursor is present', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => samplePage1 });

    render(<PostFeed />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /load more/i })).toBeInTheDocument();
    });
  });

  it('fetches the next page using next_cursor when Load More is clicked', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => samplePage1 })
      .mockResolvedValueOnce({ ok: true, json: async () => samplePage2 });
    global.fetch = mockFetch;

    const user = userEvent.setup();
    render(<PostFeed />);

    await waitFor(() => screen.getByRole('button', { name: /load more/i }));
    await user.click(screen.getByRole('button', { name: /load more/i }));

    await waitFor(() => {
      expect(screen.getByText('Oldest post')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenLastCalledWith(
      expect.stringContaining('cursor=2026-01-01T00%3A00%3A00Z')
    );
  });

  it('hides Load More once next_cursor becomes null', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => samplePage1 })
      .mockResolvedValueOnce({ ok: true, json: async () => samplePage2 });
    global.fetch = mockFetch;

    const user = userEvent.setup();
    render(<PostFeed />);

    await waitFor(() => screen.getByRole('button', { name: /load more/i }));
    await user.click(screen.getByRole('button', { name: /load more/i }));

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();
    });
  });
});
```

**`mockResolvedValueOnce(...)` chained twice** — configures the mock to return `samplePage1` on the *first* call and `samplePage2` on the *second*, simulating the two real, sequential API calls "Load More" would trigger.

**`waitFor(() => { ... })`** — wraps assertions that need to wait for something asynchronous (here, the effect's fetch call resolving) to complete before checking. This is necessary because `useEffect`'s data fetch happens *after* the initial render, not during it — the test needs to give React a chance to finish that async work before checking the resulting DOM.

**`screen.queryByRole(...)` vs. `getByRole(...)`** — `queryBy` returns `null` if nothing matches, instead of throwing an error like `getBy` does. This matters specifically when *asserting something is absent* — you can't use `getBy` to check "this doesn't exist," since it would throw before your assertion even runs.

Run this now — fails, `PostFeed` doesn't exist yet. Red.

---

## 3. Green — the post feed component

```typescript
// src/types/Post.ts
export interface Post {
  id: number;
  content: string;
  author_id: number;
  author_username: string;
  created_at: string;
}

export interface PaginatedPostsResponse {
  posts: Post[];
  next_cursor: string | null;
}
```

```typescript
// src/components/PostFeed.tsx
import { useState, useEffect } from 'react';
import { Post, PaginatedPostsResponse } from '../types/Post';

async function fetchPosts(cursor: string | null): Promise<PaginatedPostsResponse> {
  const url = cursor
    ? `http://localhost:8000/posts?cursor=${encodeURIComponent(cursor)}`
    : 'http://localhost:8000/posts';

  const response = await fetch(url);
  return response.json();
}

export function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    fetchPosts(null).then((data) => {
      setPosts(data.posts);
      setNextCursor(data.next_cursor);
      setHasLoadedOnce(true);
    });
  }, []);   // empty array: fetch the FIRST page exactly once, when PostFeed first appears

  const handleLoadMore = async () => {
    const data = await fetchPosts(nextCursor);
    setPosts((existingPosts) => [...existingPosts, ...data.posts]);
    setNextCursor(data.next_cursor);
  };

  if (!hasLoadedOnce) {
    return <p>Loading posts...</p>;
  }

  return (
    <div>
      {posts.map((post) => (
        <article key={post.id}>
          <p>{post.content}</p>
          <p>— {post.author_username}</p>
        </article>
      ))}

      {nextCursor !== null && (
        <button onClick={handleLoadMore}>Load More</button>
      )}
    </div>
  );
}
```

Reading the key new pieces:
- **`fetchPosts` as a separate function outside the component** — deliberately not defined inline inside `PostFeed`, since it doesn't need any of the component's state or props; keeping it separate makes it independently readable and reusable (and, not coincidentally, easier to test in isolation later).
- **`key={post.id}`** — every element produced by `.map()` in React needs a `key` prop: a stable, unique identifier React uses to track which rendered item is which across re-renders (e.g., knowing which specific post to update or remove without re-rendering every other one). Using `post.id` (a real, stable identifier) is correct; using the array index instead is a common mistake that causes subtle bugs once items get added, removed, or reordered.
- **`setPosts((existingPosts) => [...existingPosts, ...data.posts])`** — this is the **functional update** form of a state setter: instead of `setPosts(posts.concat(data.posts))` (which uses whatever `posts` was at the time this function was *defined*), passing a function receives the *actual current* state value at the moment the update runs. This matters for correctness in cases involving async code, exactly like this one. `[...existingPosts, ...data.posts]` uses the **spread operator** (`...`) — unpacking each array's individual elements into a new combined array, rather than nesting one array inside another.
- **`{nextCursor !== null && (<button>...</button>)}`** — the same conditional-rendering pattern from Frontend Lesson 2, Section 4, now controlling whether "Load More" appears at all — directly wired to the backend's `next_cursor` being `null` or not.

Run the tests again — green.

---

## 4. Challenges before Slice 4

1. Write a failing test first: verify that clicking "Load More" twice in a row (with three total pages of mock data) correctly accumulates *all three* pages' posts in the rendered list, not just the most recent page. Then confirm the existing implementation handles it, or fix it if not.
2. Right now, if the initial fetch (inside `useEffect`) fails (e.g., the network is down), nothing happens — no error message, no retry. Write a test for this failure case first, then implement a reasonable error state.
3. Explain, in your own words, why the empty dependency array `[]` in `useEffect(() => {...}, [])` is what prevents the initial post-fetch from running again on every single re-render of `PostFeed` (e.g., every time `handleLoadMore` updates state). Walk through what *would* happen if the array were left out entirely (not even empty — genuinely omitted).
4. `handleLoadMore` doesn't use the functional-update pattern for `setNextCursor`, only for `setPosts`. Is that a problem, or is it fine here? Reason through whether `setNextCursor(data.next_cursor)` could ever read a stale value the way the unprotected version of `setPosts` could — tie your answer to Section 3's explanation of why the functional form matters.

---

## What's next

Slice 4 adds comments — nested relationships and the N+1 query problem (previewed in Backend Lesson 3, Challenge 2) on the backend, and nested component composition plus optimistic UI updates on the frontend, alongside the Hash Maps interlude and the first UI/UX interlude. Say the word when you're ready.
