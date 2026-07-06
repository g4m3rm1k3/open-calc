# Frontend Client — Lesson 07 — Comments

## What You Will Build

The article detail view grows real comments, fetched from Conduit's own comments
endpoint, each showing its real author's avatar and username — reusing
`AuthorByline` exactly as it already exists, with no changes to that file at all.
This is the first real branch in this project's component tree:

```
ArticleDetailPage
  └── CommentList
        └── Comment (× however many exist)
              └── AuthorByline (reused, unmodified, from lesson 05)
```

---

## What You Need to Know First

Lesson 06 left `renderArticleDetailPage` in `src/main.ts` fetching one article by
slug and rendering its title and body directly. `src/components/AuthorByline.ts`
exports `createAuthorByline(author: Author): HTMLElement`, unchanged since lesson 05.

---

## Concept: A Second Real Endpoint, A Slightly Different Shape

Conduit exposes `GET /api/articles/:slug/comments`, returning every comment on that
article:

```json
{
  "comments": [
    {
      "id": 1,
      "createdAt": "2026-07-06T00:48:02.794Z",
      "updatedAt": "2026-07-06T00:48:02.794Z",
      "body": "Great article! I've been struggling with JavaScript concepts...",
      "author": { "username": "janesmith", "bio": "...", "image": "...", "following": false }
    }
  ]
}
```

Notice the shape: a wrapper object with one array field (`comments`, not `articles`
this time), where each comment has its own `author` — the exact same `Author` shape
already defined in `api.ts`. This is not a coincidence: RESTful APIs frequently reuse
the same sub-resource shape (here, "an author") across different top-level resources,
because the underlying data really is the same kind of thing wherever it appears.

---

## Step 1 — Add Comments to `api.ts`

**The problem:** A new resource — comments — needs a type and a fetch function, in
the same pattern every previous resource has followed.

Add to `src/api.ts`:

```typescript
export interface Comment {
  id: number;
  createdAt: string;
  body: string;
  author: Author;
}

interface CommentsResponse {
  comments: Comment[];
}

export async function fetchCommentsBySlug(slug: string): Promise<Comment[]> {
  const response = await fetch(`${API_BASE_URL}/articles/${slug}/comments`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data: CommentsResponse = await response.json();
  return data.comments;
}
```

**Walkthrough:** `Comment` reuses `Author` as the type of its `author` field, the
same way `Article` already did — the same interface, defined once, describing the
same shape wherever it genuinely recurs in the API. `id: number` is new: Conduit
identifies comments by a numeric ID rather than a slug, because comments have no
need for a human-readable URL of their own — nobody links directly to "comment #1".
`fetchCommentsBySlug` follows the exact same three-line shape as `fetchArticleBySlug`:
build the URL, check `response.ok`, parse and return. This repetition is not
accidental — it is what makes the data layer predictable: once you understand one
`fetch*` function in `api.ts`, you understand the shape of all of them.

---

## Step 2 — Build the `Comment` Component

**The problem:** One comment needs to be turned into an element: an author byline
and the comment's text.

Create `src/components/Comment.ts`:

```typescript
import type { Comment } from "../api.ts";
import { createAuthorByline } from "./AuthorByline.ts";

export function createCommentElement(comment: Comment): HTMLElement {
  const container = document.createElement("div");
  container.className = "comment";

  const bodyElement = document.createElement("p");
  bodyElement.textContent = comment.body;

  container.appendChild(createAuthorByline(comment.author));
  container.appendChild(bodyElement);

  return container;
}
```

**Walkthrough:** `createAuthorByline(comment.author)` is called with no changes
whatsoever to `AuthorByline.ts` — it does not know, and does not need to know,
whether the `Author` it was handed belongs to an article or a comment. This is the
direct payoff of lesson 05's decision to parameterize `createAuthorByline` around
`Author` specifically, rather than around `Article`: a component built around the
smallest shape it actually needs works anywhere that shape appears, including places
its author never anticipated when writing it.

**The Aha moment — naming the connection explicitly.** This is the same
`createAuthorByline` from lesson 05, reused here exactly as it was written for
articles. The reason it works without modification is the same reason `createTagList`
was written to accept `string[]` instead of `Article` back in lesson 04: designing a
component's inputs around the data it actually needs, not the object it happened to
first appear on, is what makes reuse actually happen later instead of remaining a
nice idea.

---

## Step 3 — Build the `CommentList` Component

**The problem:** A single article has many comments (or zero). Something needs to
turn an array of them into a list on the page — the same "one function per item,
called in a loop" pattern from lesson 03's article list.

Create `src/components/CommentList.ts`:

```typescript
import type { Comment } from "../api.ts";
import { createCommentElement } from "./Comment.ts";

export function createCommentList(comments: Comment[]): HTMLElement {
  const listElement = document.createElement("div");
  listElement.className = "comment-list";

  if (comments.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "No comments yet.";
    listElement.appendChild(emptyMessage);
    return listElement;
  }

  for (const comment of comments) {
    listElement.appendChild(createCommentElement(comment));
  }

  return listElement;
}
```

**Walkthrough:** `comments.length === 0` checks for the empty case *before* the
loop — an array with zero elements would simply cause the `for...of` loop to run zero
times, producing a container with nothing inside it and no explanation. Explicitly
handling "there is nothing here" and saying so is a real, deliberate UI decision: a
silently empty box looks like a bug; a box that says "No comments yet." looks
correct, because it is.

**SE lens — this is the same repetition-handling shape as `renderArticleListPage`
from lesson 06,** applied one level down the component tree: fetch or receive a
collection, decide what to show when it's empty, otherwise build one element per
item in a loop. Naming this pattern once here means recognising it immediately the
next few times it appears in this project — it will.

---

## Step 4 — Fetch Comments Alongside the Article

**The problem:** `renderArticleDetailPage` currently only fetches the article. It
needs the comments too — and there is no reason to wait for one request to finish
before starting the other, since neither depends on the other's result.

Update `renderArticleDetailPage` in `src/main.ts`:

```typescript
import { fetchArticles, fetchArticleBySlug, fetchCommentsBySlug } from "./api.ts";
import { createArticleElement } from "./components/ArticleCard.ts";
import { createCommentList } from "./components/CommentList.ts";

// ... parseRoute, renderArticleListPage unchanged ...

async function renderArticleDetailPage(appElement: HTMLElement, slug: string): Promise<void> {
  try {
    const [article, comments] = await Promise.all([
      fetchArticleBySlug(slug),
      fetchCommentsBySlug(slug),
    ]);

    appElement.textContent = "";

    const backLink = document.createElement("a");
    backLink.href = "#/";
    backLink.textContent = "← Back to articles";

    const titleElement = document.createElement("h1");
    titleElement.textContent = article.title;

    const bodyElement = document.createElement("p");
    bodyElement.textContent = article.body;

    const commentsHeading = document.createElement("h2");
    commentsHeading.textContent = "Comments";

    appElement.appendChild(backLink);
    appElement.appendChild(titleElement);
    appElement.appendChild(bodyElement);
    appElement.appendChild(commentsHeading);
    appElement.appendChild(createCommentList(comments));
  } catch (error) {
    console.error("Could not load article:", error);
    appElement.textContent = "Something went wrong loading this article.";
  }
}
```

Save and reload, then open an article. Real comments now appear beneath the body,
each with a real avatar and username.

**Walkthrough:** `Promise.all([fetchArticleBySlug(slug), fetchCommentsBySlug(slug)])`
starts *both* requests immediately, without waiting for either to finish first, and
returns a single `Promise` that resolves once *both* have completed — with an array
containing both results, in the same order they were passed in. `const [article,
comments] = await Promise.all([...])` uses **array destructuring** to unpack that
two-element array directly into two named variables in one line — equivalent to
writing `const results = await Promise.all([...]); const article = results[0]; const
comments = results[1];`, just more direct to read.

**CS lens — concurrency vs. sequence.** Writing `const article = await
fetchArticleBySlug(slug); const comments = await fetchCommentsBySlug(slug);` would
also work — but it means the comments request does not even *start* until the
article request has fully finished. If each request takes 200 milliseconds, that
version takes roughly 400 milliseconds total; `Promise.all` runs them at the same
time, so the total time is roughly however long the *slower* of the two takes — about
200 milliseconds. This only works because the two requests are genuinely
independent: comments do not need the article's data to be fetched, and vice versa.
The moment one request's input depends on another's output, they must run in
sequence, `await`ed one after the other — `Promise.all` is specifically for the case
where they do not.

---

## Connect the Pieces

```
src/api.ts                         fetchCommentsBySlug() and Comment added
src/components/Comment.ts          One comment: reuses AuthorByline unmodified
src/components/CommentList.ts      Many comments, or an explicit "No comments yet."
src/main.ts                        renderArticleDetailPage fetches article + comments concurrently
```

The component tree now has a real branch two levels deep. `AuthorByline` has been
used, unmodified, in three different places since it was written: an article card
(lesson 05), and now a comment (this lesson) — twice within a single comment list.

---

## What Breaks Without This

**Without the empty-comments check in `createCommentList`:** An article with no
comments yet renders an empty `<div class="comment-list">` with nothing visibly
inside it — indistinguishable, to a user, from the comments having failed to load at
all. There is no error, but there is also no confirmation that the feature is
working correctly.

**Without `Promise.all` (fetching sequentially instead):** Nothing breaks — the page
still ends up showing the right thing. The only cost is speed: every article view
now takes as long as both requests combined instead of as long as the slower one
alone, a real, measurable difference once this project is deployed and requests take
longer than they do to a fast local test server.

---

## Definition of Done

- [ ] Every article's detail view shows its real comments below the body
- [ ] An article with zero comments shows "No comments yet." instead of an empty space
- [ ] Each comment shows its author's real avatar and username, via the unmodified `AuthorByline` component
- [ ] The article and its comments are fetched concurrently, not sequentially
- [ ] You can explain why `Comment.author` reuses the `Author` interface instead of defining its own
- [ ] You can explain why `createAuthorByline` needed no changes to work inside a comment
- [ ] You can explain what `Promise.all` does and when it is safe to use instead of sequential `await`s
- [ ] You can explain what array destructuring does in `const [article, comments] = ...`
- [ ] Run:
      ```
      git add src/api.ts src/components/Comment.ts src/components/CommentList.ts src/main.ts
      git commit -m "Fetch and render real comments alongside each article, concurrently with the article itself"
      ```

---

*Next: Lesson 08 — Likes. A heart button appears on every article. Clicking it calls
the real API — and receives a real `401 Unauthorized`, because Conduit correctly
refuses to record a favorite from someone it cannot identify. That failure is not a
bug to fix in this lesson; it is the reason lesson 09 exists.*
