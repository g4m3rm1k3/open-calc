# Frontend Client — Lesson 03 — Displaying a List

## What You Will Build

Every article Conduit returns — not just the first one — appears on the page, each
with its own title and author. `fetchArticles()` from lesson 02 already returns all
of them; this lesson is entirely about the code that turns an array of unknown length
into real elements on the page.

When you finish, reloading the page shows a stack of real articles, five by default —
change the `limit` query parameter in `src/api.ts` and the page grows or shrinks
automatically, with no other code changes.

---

## What You Need to Know First

Lesson 02 built `src/api.ts` (exporting `fetchArticles` and the `Article` interface)
and `src/main.ts` (which rendered `articles[0]` — only the first article — into two
hardcoded elements found by `id`, using `textContent`). This lesson assumes both
files exist exactly as lesson 02 left them.

---

## Concept: Why `id` Does Not Scale to a List

Lesson 02's `renderArticle` function found its target elements with
`document.getElementById("article-title")`. An `id` must be unique across the entire
page — that uniqueness is precisely what makes `getElementById` reliable. It also
means this approach fundamentally cannot render five articles: there is no way to
have five elements all with the id `"article-title"`.

This is not a bug in lesson 02's code — it was the correct, smallest solution to
"show one article." It simply cannot be *extended* to "show several"; it has to be
*replaced* with an approach that creates new elements at runtime, one per article,
each independent of a fixed `id`. That is what this lesson builds.

---

## Step 1 — Replace the Hardcoded Article in `index.html`

**The problem:** `index.html` currently has one `<article>` block with fixed ids.
There is no way to know in advance how many articles the API will return, so the
HTML cannot hardcode one block per article — it needs a single container that
JavaScript fills at runtime.

```html
<body>
  <h1>Frontend Client</h1>
  <div id="article-list">Loading…</div>
  <script type="module" src="/src/main.ts"></script>
</body>
```

**Walkthrough:** `<div id="article-list">` is a single, generic container — a `<div>`
carries no meaning of its own beyond "a generic block," which is exactly right here:
the meaningful structure (each individual `<article>`) will be created by JavaScript,
one per real article, and inserted inside this container. The placeholder text
`Loading…` is shown until the fetch completes, exactly as in lesson 02 — still
communicating "something is happening" rather than showing a blank page.

---

## Step 2 — Build One Article Element at a Time

**The problem:** For each article in the array, an `<article>` element containing a
title and author needs to be created and added to the page — not found by `id`,
since none exists yet.

Replace `src/main.ts`:

```typescript
import { fetchArticles, type Article } from "./api.ts";

function createArticleElement(article: Article): HTMLElement {
  const container = document.createElement("article");

  const titleElement = document.createElement("h2");
  titleElement.textContent = article.title;

  const authorElement = document.createElement("p");
  authorElement.textContent = `by ${article.author.username}`;

  container.appendChild(titleElement);
  container.appendChild(authorElement);

  return container;
}
```

**Walkthrough:** `document.createElement("article")` creates a brand-new DOM element
— an `<article>` tag — that exists only in memory so far; it is not yet part of the
visible page. This is different from `getElementById`, which *finds* an element
already in the HTML. `createElement` *makes* one.

`titleElement.textContent = article.title` sets the new `<h2>`'s text exactly the
same way lesson 02 did — the security reasoning from lesson 02 applies identically
here: this is real, other-user-authored data, so `textContent` (not `innerHTML`) is
still the only acceptable choice, now happening once per article instead of once
total.

`container.appendChild(titleElement)` inserts `titleElement` as the last child of
`container`, inside the in-memory element tree. Neither `container` nor its children
are visible on the page yet — nothing has been added to the real, rendered DOM. The
function returns `container` so that whatever calls it decides *where* to put it.

**SE lens — this function has exactly one job.** `createArticleElement` takes one
article and returns one element. It does not know how many articles exist, where on
the page it will end up, or how it got its data. This is the same single-responsibility
discipline from lesson 02's `renderArticle`, adjusted to the new shape the problem
now requires: build one thing, correctly, and let something else worry about the
rest.

---

## Step 3 — Render Every Article

**The problem:** `createArticleElement` builds one element. Something needs to call
it once per article and attach every result to the page.

```typescript
import { fetchArticles, type Article } from "./api.ts";

function createArticleElement(article: Article): HTMLElement {
  const container = document.createElement("article");

  const titleElement = document.createElement("h2");
  titleElement.textContent = article.title;

  const authorElement = document.createElement("p");
  authorElement.textContent = `by ${article.author.username}`;

  container.appendChild(titleElement);
  container.appendChild(authorElement);

  return container;
}

async function main(): Promise<void> {
  const listElement = document.getElementById("article-list");
  if (!listElement) return;

  try {
    const articles = await fetchArticles();

    listElement.textContent = "";
    for (const article of articles) {
      listElement.appendChild(createArticleElement(article));
    }
  } catch (error) {
    console.error("Could not load articles:", error);
    listElement.textContent = "Something went wrong loading articles.";
  }
}

main();
```

Save and reload. Every article Conduit returned now appears on the page, in order.

**Walkthrough:** `listElement.textContent = ""` clears the "Loading…" placeholder by
replacing the container's entire contents with an empty string, immediately before
real content replaces it — without this line, "Loading…" would remain on the page,
sitting above the real articles.

`for (const article of articles)` is a **`for...of` loop** — it iterates over every
element of an array (or any other *iterable*, a JavaScript concept for "something
that can be stepped through one item at a time") in order, binding each one in turn
to `article` inside the loop body. This is different from a classic index-based loop
— `for (let i = 0; i < articles.length; i++)` — which manually tracks a numeric index
and reads `articles[i]` on every pass. `for...of` is preferred whenever you do not
actually need the index (as here): it reads as "for each article in articles," which
is literally the operation being performed, with no opportunity to get the loop
bounds wrong.

`listElement.appendChild(createArticleElement(article))` calls the function from
Step 2 for the current article, then immediately attaches the returned element as
the last child of `listElement` — this is the moment each article actually becomes
visible on the real page; everything before this line built elements only in memory.

**Error handling revisited:** The `catch` block now also updates the page —
`listElement.textContent = "Something went wrong loading articles."` — not just the
console. Lesson 01 and 02's error handling only helped *you*, reading the console
while developing. A real user does not have the console open; if the network fails
for them, they need to see *something* explaining that, not a page stuck forever on
"Loading…" or one that silently shows nothing.

**CS lens — building the DOM incrementally vs. all at once:** Each call to
`appendChild` triggers the browser to potentially recompute layout — the position and
size of everything on the page (this is the *layout* step from lesson 01's browser
rendering pipeline). For five articles, this cost is invisible. For a genuinely large
list — thousands of items — appending one at a time in a loop can become slow enough
to notice, because the browser may re-layout after every single insertion. The fix,
used in real applications, is to build all the new elements inside an in-memory
container first (a `DocumentFragment`, a lightweight container with no visual
representation of its own) and insert it into the real page once, triggering only one
layout pass. This project's article counts are small enough that it does not matter
yet — the concept is worth naming now, because lesson 12's pagination will make the
list large enough for it to become a real, measurable decision.

---

## Concept: Query Parameters, Revisited

Lesson 01 introduced `?limit=5` as a query parameter without dwelling on it. Now that
every returned article actually renders, its effect is directly visible: open
`src/api.ts`, change `ARTICLES_URL` to end in `?limit=2`, save, and reload — exactly
two articles render. Change it to `?limit=20` — up to twenty render (or fewer, if
Conduit does not have twenty articles to return). This is the API's way of letting a
client control how much data comes back in a single request, without needing a
separate endpoint for "get 2" versus "get 20." Lesson 12 will use a second query
parameter, `offset`, alongside `limit` to implement real pagination — fetching page 2
by asking for articles starting *after* the ones already shown.

---

## Connect the Pieces

```
src/api.ts      Unchanged since lesson 02 — fetchArticles() already returned every article
src/main.ts     createArticleElement() builds one <article>; main() loops and appends all of them
index.html      #article-list replaces the single hardcoded <article> block
```

Nothing in `api.ts` needed to change — this is the first real payoff of lesson 02's
separation between fetching and rendering. The data layer already had everything
this lesson needed; only the rendering layer had to grow.

---

## What Breaks Without This

**Without clearing `listElement.textContent = ""` first:** Remove that line, keep
everything else. Reload the page twice in a row without a full refresh — for
instance, if a future lesson calls `main()` again in response to a button click. The
old "Loading…" text (or a previous render) is never removed, so new articles get
appended *after* stale content instead of replacing it. On a single page load this
is invisible; the moment anything re-renders this container more than once, it
becomes an obviously broken, growing list of duplicated and stale content.

**Without the `for...of` loop (calling `createArticleElement` only once, as in lesson
02):** The page shows exactly one article no matter how many `fetchArticles()`
actually returned — the same limitation lesson 02 already had, now silently ignoring
real data instead of fixing the underlying cause.

---

## Definition of Done

- [ ] The page shows every article returned by `fetchArticles()`, not just the first
- [ ] Changing `?limit=` in `src/api.ts` changes how many articles render, with no other code changes
- [ ] The "Loading…" placeholder disappears the moment real articles render
- [ ] A network failure shows a real message on the page, not just in the console
- [ ] You can explain why `getElementById` cannot be used to render a list of unknown length
- [ ] You can explain the difference between `document.createElement` and `document.getElementById`
- [ ] You can explain what a `for...of` loop does and when you would choose it over an index-based `for` loop
- [ ] You can explain why `listElement.textContent = ""` must run before the loop, not after
- [ ] Run:
      ```
      git add index.html src/main.ts
      git commit -m "Render every article returned by the API as its own element, not just the first"
      ```

---

*Next: Lesson 04 — Components. `createArticleElement` and `main` both work — but
`createArticleElement` is starting to do several small jobs inside one function body.
This lesson extracts it into something you can name, reason about, and reuse on its
own — the first real component in this project, discovered because the current code
has started to feel harder to read, not because you were told components exist.*
