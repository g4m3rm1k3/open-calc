# Frontend Client — Lesson 06 — Article Detail and Routing

## What You Will Build

Clicking an article's title shows that article's full body on its own view — the URL
changes to something like `#/articles/how-to-learn-javascript-efficiently`, the
article list disappears, and the full text appears in its place, with a link back.
None of this reloads the page. This is the first time the project has more than one
"page," and the first time the URL itself becomes part of the application's state.

---

## What You Need to Know First

Lesson 05 left the project with `src/api.ts` (data), `src/components/` containing
`TagList.ts`, `AuthorByline.ts`, and `ArticleCard.ts` (presentation), and `src/main.ts`
containing only `main()`, which fetches articles and appends `ArticleCard` elements
into `#article-list`.

---

## Concept: What the List Endpoint Does Not Give You

Conduit's article-list endpoint, the one `fetchArticles()` already calls, returns
enough to render a card — title, author, tags — but deliberately not everything: it
omits each article's full `body` text, because sending the complete text of every
article on the page just to show a list of titles would waste bandwidth on data
nobody is looking at yet. The **single-article endpoint**,
`GET /api/articles/:slug`, returns one article by its slug, including `body`. This is
an extremely common real-world API pattern: a *list* endpoint returns a lightweight
summary of many things; a *detail* endpoint returns everything about one specific
thing. You will see this shape in almost every REST API you use professionally.

A **slug** is a URL-safe, human-readable text identifier — `how-to-learn-javascript-
efficiently` — generated from a title, used in place of a numeric database ID so the
URL itself communicates what it points to. Every article's `slug` field has been in
the `Article` interface since lesson 02; this lesson is the first time it is used
for anything.

---

## Step 1 — Add a Base URL Constant and a Second Fetch Function

**The problem:** `src/api.ts` needs a second endpoint. Its full domain,
`https://api.realworld.show/api`, has been hardcoded inside `ARTICLES_URL` since
lesson 01 — writing it a second time for the new endpoint would mean the same string
exists twice, exactly the kind of duplication CSS custom properties solve for colours:
one source of truth, one place to change it.

Update `src/api.ts`:

```typescript
const API_BASE_URL = "https://api.realworld.show/api";

export interface Author {
  username: string;
  bio: string | null;
  image: string;
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  tagList: string[];
  favorited: boolean;
  favoritesCount: number;
  author: Author;
}

export interface ArticleDetail extends Article {
  body: string;
}

interface ArticlesResponse {
  articles: Article[];
  articlesCount: number;
}

interface ArticleDetailResponse {
  article: ArticleDetail;
}

export async function fetchArticles(): Promise<Article[]> {
  const response = await fetch(`${API_BASE_URL}/articles?limit=5`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data: ArticlesResponse = await response.json();
  return data.articles;
}

export async function fetchArticleBySlug(slug: string): Promise<ArticleDetail> {
  const response = await fetch(`${API_BASE_URL}/articles/${slug}`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data: ArticleDetailResponse = await response.json();
  return data.article;
}
```

**Walkthrough:** `interface ArticleDetail extends Article { body: string; }` uses
TypeScript's **interface extension**: `ArticleDetail` has every property `Article`
has — `slug`, `title`, `tagList`, and the rest — *plus* `body`. This is not just
convenient; it documents a real relationship in the API itself: the detail endpoint's
response is a strict superset of the list endpoint's, and `extends` says so directly
in the type, instead of maintaining two unrelated interfaces that happen to overlap
by coincidence.

`fetchArticleBySlug(slug: string)` builds its URL with a template literal,
`` `${API_BASE_URL}/articles/${slug}` `` — the same string-interpolation syntax from
lesson 01, now embedding a function parameter instead of a fixed value. Conduit
generates slugs that are already URL-safe (lowercase letters, digits, and hyphens
only), so this value can be inserted directly. If a value inserted into a URL this
way could contain characters like spaces or `&` — anything not fully in your
control — it should be passed through `encodeURIComponent()` first, which converts
unsafe characters into their percent-encoded equivalents. This particular call does
not need it, but the rule is worth keeping: only skip it when you are certain of
where the value came from.

---

## Step 2 — Make Article Titles Link to Their Detail View

**The problem:** Nothing lets you get to a detail view yet. An article's title, in
the list, should become a link.

Update `src/components/ArticleCard.ts`:

```typescript
import type { Article } from "../api.ts";
import { createAuthorByline } from "./AuthorByline.ts";
import { createTagList } from "./TagList.ts";

export function createArticleElement(article: Article): HTMLElement {
  const container = document.createElement("article");

  const titleLink = document.createElement("a");
  titleLink.href = `#/articles/${article.slug}`;
  titleLink.textContent = article.title;

  const titleElement = document.createElement("h2");
  titleElement.appendChild(titleLink);

  container.appendChild(createAuthorByline(article.author));
  container.appendChild(titleElement);
  container.appendChild(createTagList(article.tagList));

  return container;
}
```

Save and reload. Titles are now clickable links. Clicking one changes the URL in the
address bar but shows a blank or unchanged page — expected, since nothing reads that
URL yet.

**Walkthrough:** `<a href="#/articles/...">` is an anchor element whose `href` starts
with `#`. A `#` in a URL introduces the **fragment identifier** (also called the
"hash") — historically used to jump to a named location within the same page (like a
table of contents link). Critically, changing only the fragment identifier — by
clicking a link like this one, or by JavaScript setting `location.hash` directly —
never sends a new request to the server and never reloads the page. The browser
updates the visible URL and fires a `hashchange` event, which is exactly the hook
the next step uses to notice the URL changed and react to it.

**Concept — client-side vs. server-side routing.** A traditional website has
**server-side routing**: every link points to a different URL path (not just a
fragment), and clicking it sends a fresh HTTP request; the server sends back a whole
new HTML page, and the browser discards the old one entirely and reloads from
scratch. This project instead implements **client-side routing**: the entire page —
`index.html`, `main.ts`, and everything it has loaded — stays loaded the whole time;
only the fragment changes, and JavaScript decides what to show based on it. A web
application built this way, where navigation never triggers a full page reload, is
called a **single-page application (SPA)**. The trade-off: the very first page load
still has to download the whole application up front (addressed properly in lesson
15), but every navigation after that is instant, because there is no server
round-trip involved in changing the view.

---

## Step 3 — Build a Minimal Router

**The problem:** Something needs to read the current URL fragment, decide which view
it corresponds to, and render that view — every time the fragment changes.

Rewrite `src/main.ts`:

```typescript
import { fetchArticles, fetchArticleBySlug } from "./api.ts";
import { createArticleElement } from "./components/ArticleCard.ts";

type Route = { name: "list" } | { name: "detail"; slug: string };

const DETAIL_ROUTE_PREFIX = "#/articles/";

function parseRoute(hash: string): Route {
  if (hash.startsWith(DETAIL_ROUTE_PREFIX)) {
    const slug = hash.slice(DETAIL_ROUTE_PREFIX.length);
    return { name: "detail", slug };
  }
  return { name: "list" };
}

async function renderArticleListPage(appElement: HTMLElement): Promise<void> {
  try {
    const articles = await fetchArticles();

    appElement.textContent = "";
    for (const article of articles) {
      appElement.appendChild(createArticleElement(article));
    }
  } catch (error) {
    console.error("Could not load articles:", error);
    appElement.textContent = "Something went wrong loading articles.";
  }
}

async function renderArticleDetailPage(appElement: HTMLElement, slug: string): Promise<void> {
  try {
    const article = await fetchArticleBySlug(slug);

    appElement.textContent = "";

    const backLink = document.createElement("a");
    backLink.href = "#/";
    backLink.textContent = "← Back to articles";

    const titleElement = document.createElement("h1");
    titleElement.textContent = article.title;

    const bodyElement = document.createElement("p");
    bodyElement.textContent = article.body;

    appElement.appendChild(backLink);
    appElement.appendChild(titleElement);
    appElement.appendChild(bodyElement);
  } catch (error) {
    console.error("Could not load article:", error);
    appElement.textContent = "Something went wrong loading this article.";
  }
}

async function renderRoute(): Promise<void> {
  const appElement = document.getElementById("app");
  if (!appElement) return;

  const route = parseRoute(location.hash);

  if (route.name === "detail") {
    await renderArticleDetailPage(appElement, route.slug);
  } else {
    await renderArticleListPage(appElement);
  }
}

window.addEventListener("hashchange", renderRoute);
renderRoute();
```

Update `index.html`'s body to give the router one shared mount point:

```html
<body>
  <h1>Frontend Client</h1>
  <div id="app">Loading…</div>
  <script type="module" src="/src/main.ts"></script>
</body>
```

Save and reload. The article list appears as before. Click a title: the URL changes,
the list disappears, and the full article body appears with a working back link.

**Walkthrough — the `Route` type:** `type Route = { name: "list" } | { name: "detail";
slug: string }` is a **discriminated union** — a type that can be one of several
distinct object shapes, each identified by a shared field (here, `name`) holding a
specific string value. `parseRoute` always returns one of exactly these two shapes,
so any code handling a `Route` can be certain there is no third possibility to worry
about.

`hash.startsWith(DETAIL_ROUTE_PREFIX)` checks whether the string begins with
`"#/articles/"`. `hash.slice(DETAIL_ROUTE_PREFIX.length)` returns everything *after*
that prefix — `.slice(start)` returns a new string beginning at index `start` through
the end. Together: "if the hash looks like an article detail link, extract the slug
from it."

**CS lens — type narrowing.** Inside `if (route.name === "detail")`, TypeScript
knows, from that single comparison, that `route` must be the `{ name: "detail";
slug: string }` branch of the union — accessing `route.slug` on the next line
compiles without any additional check or cast. This is called **type narrowing**:
the type checker uses the *shape* of your conditional logic to shrink a broader type
down to a more specific one, automatically, based on code you would have written
anyway to make the right decision at runtime.

`window.addEventListener("hashchange", renderRoute)` registers `renderRoute` to run
every time the fragment changes — this is what makes clicking an article title
actually re-render the page without a reload. `renderRoute()` is also called once,
directly, immediately after — this is necessary because `hashchange` only fires on a
*change*; it never fires for the URL the page already had when it first loaded, so
without this explicit call, opening a link that already points to a detail view
(a bookmark, or a page refresh) would show nothing until the URL changed again.

**SE lens — one router, two full pages.** `renderArticleListPage` and
`renderArticleDetailPage` are each a **page** — a full, self-contained view, as
opposed to a **component**, which is a piece embedded inside a page. The distinction
matters: a component (like `ArticleCard`) does not know or care what else is on the
page around it; a page owns the entire visible area and decides what appears inside
it, including which components to use. `renderRoute` does not know how either page
works internally — it only knows how to decide *which* page applies, based on the
URL. This is the same separation-of-concerns discipline from every earlier lesson,
applied one level higher: routing decides *what*, pages decide *how*.

---

## Concept: What This Does Not Do Yet, Honestly

Conduit's `body` field is Markdown-formatted text — notice the real article's body
contains `## Start with the Fundamentals`, meant to render as a heading, not literal
text with two hash characters in front of it. `bodyElement.textContent = article.body`
displays it as plain text, hash characters and all, correctly and safely, but not
beautifully. Turning Markdown into real HTML requires a Markdown parser — a real
technique used constantly in production, but out of scope for this lesson. It is not
skipped by accident: any Markdown-to-HTML conversion must be done by a library that
itself escapes any raw HTML the Markdown might contain, or the exact XSS risk from
lesson 02 reappears through a different door. Rendering it as safe plain text now is
the correct, honest choice until that tool is deliberately added.

Also worth naming honestly: navigating back to the list re-fetches everything from
the network every time — there is no memory of what was already loaded. Lesson 14,
Caching, exists specifically to fix this.

---

## Connect the Pieces

```
src/api.ts                         fetchArticleBySlug() added alongside fetchArticles()
src/components/ArticleCard.ts      Title is now a link to #/articles/:slug
src/main.ts                        Now a router: parseRoute() + two full pages + the
                                    hashchange listener that ties the URL to what renders
index.html                         One shared mount point, #app, replacing #article-list
```

`createArticleElement`, `createAuthorByline`, and `createTagList` are untouched by
this lesson except for the one link added inside `ArticleCard.ts` — the payoff of
lesson 05's extraction: routing was added without touching two of the three
components at all.

---

## What Breaks Without This

**Without the explicit `renderRoute()` call after registering the listener:** Paste
a detail URL like `http://localhost:5173/#/articles/how-to-learn-javascript-
efficiently` directly into the address bar and load it fresh. The page stays on
"Loading…" forever, because `hashchange` never fires for a URL the page arrived with
— only for URLs that change *after* the page has already loaded once.

**Without `type Route` as a discriminated union (using two loose, unrelated
variables instead):** Nothing stops a bug where a "detail" route is checked in one
place but a `slug` is read without confirming the route is actually a detail route
in another. The union type, combined with the `if (route.name === "detail")` check,
makes that specific mistake a compile error instead of a runtime one — TypeScript
refuses to compile `route.slug` outside the narrowed branch, because on the `"list"`
branch, that property does not exist.

---

## Definition of Done

- [ ] Clicking an article's title shows its full body on its own view, with no page reload
- [ ] The back link returns to the article list
- [ ] Loading a detail URL directly (pasted into the address bar, then refreshed) shows the correct article, not a blank "Loading…"
- [ ] `src/api.ts` exports `fetchArticleBySlug` and `ArticleDetail`, which extends `Article`
- [ ] You can explain what a slug is and why an API might use one instead of a numeric ID
- [ ] You can explain the difference between the list endpoint and the detail endpoint, and why an API would split them that way
- [ ] You can explain what a fragment identifier (`#...`) is and why changing it does not reload the page
- [ ] You can explain the difference between client-side and server-side routing, and what SPA stands for
- [ ] You can explain what a discriminated union is and how `route.name === "detail"` narrows `route`'s type
- [ ] You can explain why `renderRoute()` must be called once manually, in addition to being registered for `hashchange`
- [ ] Run:
      ```
      git add src/api.ts src/main.ts src/components/ArticleCard.ts index.html
      git commit -m "Add an article detail view with hash-based client-side routing"
      ```

---

*Next: Lesson 07 — Comments. The detail view grows a real comment list, fetched from
Conduit's comments endpoint — the component tree's first real branch:
`ArticleDetailPage → CommentList → Comment`, with `Comment` reusing `AuthorByline`
exactly as it already exists, unmodified.*
