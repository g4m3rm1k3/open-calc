# Frontend Client — Lesson 12 — Pagination

## What You Will Build

A "Load More" button appears beneath the article list whenever more articles exist
than have been shown. Clicking it fetches and appends the next page, without
disturbing what is already on screen, and disappears once every article has been
loaded.

---

## What You Need to Know First

Lesson 11 left `fetchArticles(tag?: string): Promise<Article[]>` in `src/api.ts`,
and `src/main.ts` rendering a search box plus a results container, guarded against
stale responses by a module-level `latestRequestId` counter.

---

## Concept: `limit` and `offset`, Finally Used for Real

Lesson 03 introduced `?limit=` without dwelling on it. Conduit's article-list
endpoint also accepts `?offset=`: "skip this many results before starting." Together,
`limit` and `offset` implement **offset-based pagination** — the most common
pagination strategy on the web. Page one is `limit=5&offset=0`. Page two is
`limit=5&offset=5`. Page three is `limit=5&offset=10`, and so on: each page's offset
is the total number of items already seen.

The response also carries `articlesCount` — the *total* number of articles matching
the current filter, regardless of `limit`. Comparing how many you have loaded so far
against this total is what tells you whether a "Load More" button should still be
visible at all.

---

## Step 1 — Change `fetchArticles` to Return a Page, Not Just an Array

**The problem:** `fetchArticles` currently returns only `Article[]`, discarding
`articlesCount` — information pagination cannot work without.

Update `src/api.ts`:

```typescript
export interface ArticlesPage {
  articles: Article[];
  articlesCount: number;
}

export const ARTICLES_PAGE_SIZE = 5;

export async function fetchArticles(tag?: string, offset = 0): Promise<ArticlesPage> {
  const params = new URLSearchParams({
    limit: String(ARTICLES_PAGE_SIZE),
    offset: String(offset),
  });
  if (tag) {
    params.set("tag", tag);
  }

  const response = await fetch(`${API_BASE_URL}/articles?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data: ArticlesPage = await response.json();
  return data;
}
```

**Walkthrough:** This is a **breaking change** to `fetchArticles`'s return type —
every place that called it expecting a plain array now needs updating, which Step 3
does. Real APIs and real internal functions both evolve this way: a function's
contract changes because the feature built on top of it genuinely needs more
information than it used to, and every caller is updated deliberately, in the same
change, rather than left silently broken.

`offset = 0` is a **default parameter value** — if a caller omits the second
argument entirely (as every call before this lesson did, and as the very first page
load still does), `offset` is `0` automatically, with no need for an `if` check
inside the function body. `ARTICLES_PAGE_SIZE` is exported as a named constant rather
than left as the literal `5` inside this function alone, because Step 3's pagination
logic on the `main.ts` side needs to agree on exactly how many articles one page
contains — one shared source of truth, the same reasoning as `API_BASE_URL` since
lesson 06.

`ArticlesPage` (renamed from the private `ArticlesResponse` this project has used
internally since lesson 02) is now exported, because it describes something real
callers need to reason about directly: not just "an array of articles," but "one
page of articles, plus how many exist in total."

---

## Step 2 — Rebuild the List Page Around Pages, Not One Fetch

**The problem:** The list page needs to remember which page it is on, request the
next one on demand, and know when to stop offering more.

Rewrite the list-rendering portion of `src/main.ts`:

```typescript
import { fetchArticles, ARTICLES_PAGE_SIZE } from "./api.ts";
import { createSearchBox } from "./components/SearchBox.ts";
import { createArticleElement } from "./components/ArticleCard.ts";

async function renderArticleListPage(appElement: HTMLElement): Promise<void> {
  appElement.textContent = "";

  const resultsElement = document.createElement("div");
  const loadMoreButton = document.createElement("button");
  loadMoreButton.textContent = "Load More";
  loadMoreButton.style.display = "none";

  let requestId = 0;
  let currentTag = "";
  let offset = 0;

  async function loadPage(reset: boolean): Promise<void> {
    const thisRequestId = ++requestId;
    if (reset) {
      offset = 0;
      resultsElement.textContent = "Loading…";
    }

    try {
      const page = await fetchArticles(currentTag || undefined, offset);
      if (thisRequestId !== requestId) return;

      if (reset) {
        resultsElement.textContent = "";
      }
      for (const article of page.articles) {
        resultsElement.appendChild(createArticleElement(article));
      }

      offset += page.articles.length;
      loadMoreButton.style.display = offset < page.articlesCount ? "block" : "none";
    } catch (error) {
      if (thisRequestId !== requestId) return;
      console.error("Could not load articles:", error);
      if (reset) resultsElement.textContent = "Something went wrong loading articles.";
    }
  }

  const searchBox = createSearchBox((tag) => {
    currentTag = tag;
    loadPage(true);
  });

  loadMoreButton.addEventListener("click", () => loadPage(false));

  appElement.appendChild(searchBox);
  appElement.appendChild(resultsElement);
  appElement.appendChild(loadMoreButton);

  await loadPage(true);
}
```

Save and reload. Five articles show, and — if Conduit has more than five matching
the current filter — a "Load More" button appears beneath them. Clicking it appends
the next five without touching what is already there.

**Walkthrough:** `requestId`, `currentTag`, and `offset` are declared *inside*
`renderArticleListPage`, not at module scope the way lesson 11's `latestRequestId`
was. `loadPage`, `searchBox`'s callback, and `loadMoreButton`'s click handler are all
**closures** over these three variables — each one can read and update them, and
they persist across calls for as long as this particular list page is on screen.
This is a meaningful improvement over lesson 11's module-level counter: navigating
away from the list (to a detail view, say) and back creates an entirely fresh set of
these variables, with no leftover state from the previous visit bleeding into the
new one. State that only matters to one page should live inside that page, not in
the module shared by everything.

`loadPage(reset: boolean)` does two different jobs depending on its argument: `reset
= true` (a new search, or the page's first load) clears `offset` back to `0` and
wipes the results container before rendering; `reset = false` ("Load More" clicked)
leaves both alone, so new articles are appended after the existing ones instead of
replacing them. The `thisRequestId !== requestId` check is exactly lesson 11's
stale-response guard, unchanged in principle, only now scoped to this page's own
closure instead of the whole module.

`loadMoreButton.style.display = offset < page.articlesCount ? "block" : "none"`
decides visibility after every successful load: if the number of articles loaded so
far (`offset`, which this function keeps incrementing by however many arrived) is
still less than the total that exist (`page.articlesCount`), more remain, so the
button stays visible; otherwise, everything has been loaded, and hiding the button
communicates that clearly instead of leaving a button that would return an empty
page if clicked.

---

## Concept: Why Appending, Not Re-Rendering, Matters Here

Notice `loadPage(false)` never clears `resultsElement`. If it did — clearing and then
re-rendering *all* articles seen so far, old and new together, every time "Load
More" was clicked — the visible result would look identical, but at a real cost: by
the tenth "Load More" click, each click would be re-fetching and re-building fifty
elements instead of appending five new ones. Appending only what is new is the
efficient version of the exact same feature, and it is also the version that avoids
losing anything already scrolled to or interacted with (like an expanded reply,
in a feature this project does not have yet, but a real application likely would).

---

## Connect the Pieces

```
src/api.ts        ArticlesPage (exported), ARTICLES_PAGE_SIZE (exported), fetchArticles(tag?, offset?)
src/main.ts        renderArticleListPage now owns its own requestId/currentTag/offset via closures
```

`createSearchBox` and `createArticleElement` needed no changes at all — pagination
and search-triggered-reset both live entirely in how `main.ts` orchestrates calls to
`fetchArticles`, exactly where that responsibility already belonged.

---

## What Breaks Without This

**Without resetting `offset = 0` on a new search:** Search for `"javascript"` after
having already clicked "Load More" once on the unfiltered list (`offset` now at
`10`). The next request becomes `?tag=javascript&offset=10` — skipping the first ten
JavaScript-tagged articles that may not even exist, potentially returning an empty
page for a tag that actually has plenty of matches, for a reason nothing on screen
would explain.

**Without hiding "Load More" once exhausted:** Clicking it again requests
`offset=15` when only 12 articles exist in total. Conduit returns an empty
`articles` array, and the loop that appends elements simply does nothing — not
broken, but confusing: the button remains, clickable, apparently doing nothing,
forever.

---

## Definition of Done

- [ ] "Load More" appears only when more articles exist than are currently shown
- [ ] Clicking it appends the next page without re-rendering or losing what is already visible
- [ ] Starting a new search resets pagination back to the first page
- [ ] "Load More" disappears once every matching article has been loaded
- [ ] You can explain what offset-based pagination is and how `limit`/`offset` together select a page
- [ ] You can explain why `requestId`, `currentTag`, and `offset` now live inside `renderArticleListPage` instead of at module scope
- [ ] You can explain the difference in behaviour between `loadPage(true)` and `loadPage(false)`
- [ ] You can explain why appending new elements is preferable to re-rendering the whole list on every "Load More" click
- [ ] Run:
      ```
      git add src/api.ts src/main.ts
      git commit -m "Add Load More pagination using limit/offset, scoped to each list page instance"
      ```

---

*Next: Lesson 13 — Notifications. A toast appears confirming an action succeeded or
failed — publishing an article, logging in, favoriting a post. This is the first
standalone service in this project: a piece of functionality with no UI of its own
sitting inside a component, callable from anywhere.*
