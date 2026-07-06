# Frontend Client — Lesson 02 — Rendering Real Data

## What You Will Build

The console log from lesson 01 is replaced with real content on the real page: the
title of a real article, fetched live from Conduit, and the name of the real person
who wrote it. This is the first thing in this project a normal user — not a developer
with the console open — would actually see and understand.

When you finish, the page shows something like:

```
How to Learn JavaScript Efficiently
by johndoe
```

Reload the page a few times. If Conduit's data changes, so does your page — instantly,
with no code changes on your part. You are not looking at a screenshot or a mockup;
you are looking at a live view onto someone else's server.

---

## What You Need to Know First

Lesson 01 built a project that fetches real articles from
`https://api.realworld.show/api/articles` and logs them to the console, using an
`async` function called `loadArticles`, wrapped in `try`/`catch` for error handling.
If any of those terms — `async`, `await`, `Promise`, `try`/`catch` — are unfamiliar,
read lesson 01 first; this lesson does not re-explain them.

---

## Concept: Why One File Is No Longer Enough

Lesson 01 kept everything in `src/main.ts` on purpose — one file, one job: prove the
network call works. That file now needs a second, different job: take the data that
arrives and put it on the page. These are genuinely different concerns. Fetching data
does not care what the page looks like. Rendering the page does not care whether the
data came from this particular API, a different API, or a test file. Keeping them in
one file works when the file is five lines long; it stops working the moment either
side grows, because a change to *how data is fetched* now risks accidentally breaking
*how it's displayed*, just by being in the same place.

**SE lens — this is the beginning of separation of concerns as separate files, not
just separate functions.** Lesson 01 already separated the *fetching* logic into its
own function, `loadArticles`. This lesson takes the next real step: separating it
into its own *file*, because a file boundary is a stronger form of the same
principle — it makes the boundary visible to anyone browsing the project, not just
anyone reading this one file closely.

---

## Step 1 — Create `src/api.ts`

**The problem:** The fetch logic needs a new home, separate from whatever will render
it.

Create a new file, `src/api.ts`:

```typescript
const ARTICLES_URL = "https://api.realworld.show/api/articles?limit=5";

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

interface ArticlesResponse {
  articles: Article[];
  articlesCount: number;
}

export async function fetchArticles(): Promise<Article[]> {
  const response = await fetch(ARTICLES_URL);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data: ArticlesResponse = await response.json();
  return data.articles;
}
```

**Walkthrough:** This is almost the same fetch logic from lesson 01, reshaped into a
function that *returns* data instead of logging it, so that whatever calls it decides
what to do with the result. The `try`/`catch` from lesson 01 is intentionally not
here — it moves to wherever this function is *called*, which is where a decision
about what to do on failure (log it? show a message?) actually belongs. A function
named `fetchArticles` that fetches articles should not also decide how failure is
displayed; that would make it useful only in the one situation this file's author
imagined.

**CS/type lens — three new `interface` declarations:** An **interface** is a
TypeScript construct that describes the *shape* of an object — which properties it
has, and what type each one is — without describing any behaviour. It exists purely
for the type checker; it produces no JavaScript at all once compiled.

Before this lesson, `response.json()` returned a value TypeScript could only call
`any` — a type meaning "I have no idea what this is; do not check it for me." `any`
is dangerous precisely because it opts out of type checking entirely: a typo like
`article.tital` instead of `article.title` would not be caught until the program ran
and produced `undefined`, or worse, silently rendered nothing with no error at all.

`interface Article { title: string; ... }` tells TypeScript exactly what an article
object should contain. Now `article.tital` is a compile error — caught before the
code ever runs, in your editor, the moment you type it. This is the entire value of a
static type system: turning a class of bug that would otherwise only appear at
runtime, possibly in front of a real user, into an error you see immediately while
writing the code.

Three interfaces exist here for three different reasons. `Author` describes the
nested `author` object each article contains — its own interface because it is a
genuinely separate shape, reused independently in later lessons (a comment's author
has this same shape). `Article` describes one article, and includes `author: Author`
— a property whose type is itself another interface, showing that interfaces can
nest exactly the way the real JSON does. `ArticlesResponse` describes the *entire*
response body — not just the array, but the wrapper object Conduit actually returns,
with `articlesCount` alongside it. It is not exported (no `export` keyword) because
nothing outside this file needs to know about the wrapper shape — only the array of
articles inside it matters to the rest of the project. This is **encapsulation**: a
type (or any piece of code) that is not exported is a private implementation detail
of the module, free to change without affecting anything else, because nothing else
can be depending on it.

**Why `favorited` and `favoritesCount` exist as fields, unused right now:** They are
part of the real API response — TypeScript's `interface` should describe the real
shape of the data, not just the parts a given lesson currently uses. Lesson 08 will
use them directly. Leaving them out now and adding them later would mean touching
this interface repeatedly instead of once.

---

## Step 2 — Understand `export` and `import`

**The problem:** `src/api.ts` now defines things `src/main.ts` needs to use. Files do
not automatically share code — a connection between them must be declared explicitly.

`export` (seen three times above, on `Author`, `Article`, and `fetchArticles`) marks
a name as part of this file's **public surface** — the part of the module other files
are allowed to depend on. Everything not marked `export` (like `ArticlesResponse`)
is private to this file.

**SE lens — every import is a dependency declaration, and every module is a
contract.** A module's exports are a promise to every file that imports them: "this
name will exist, with this shape." Changing an exported interface's shape is a
*breaking change* — every file that imports it may now be wrong. Changing something
private is free, because by definition nothing else could have been relying on it.
Minimising what you export, and being deliberate about it, minimises the surface
area you have to keep stable over time. This is the same reason production libraries
like React only export a small, curated set of functions from thousands of lines of
internal code.

In the next step, `src/main.ts` will write:

```typescript
import { fetchArticles, type Article } from "./api.ts";
```

This is an **import statement** — a dependency declaration with three parts, always
worth stating explicitly the first time you see one in a file: **What module is this
from, and what is that module's job?** `./api.ts` — the `./` means "a file in this
same folder," `api.ts` is the file just written, whose job is fetching and typing
article data. **What specifically is imported?** `fetchArticles` (a function) and
`Article` (a type). **Why these and not the whole module?** `main.ts` needs to call
`fetchArticles` and needs to describe the shape of what it returns — nothing else in
`api.ts` is relevant to it. Importing only what is needed keeps the dependency
explicit and easy to audit: reading the top of a file tells you everything it relies
on.

The `type` keyword in `type Article` marks this specific import as a **type-only
import** — it exists purely for TypeScript's compiler and produces no JavaScript at
all once compiled, unlike `fetchArticles`, which is a real function that must exist
at runtime. Being explicit about which imports are types and which are real values
helps both readers and tooling understand what actually needs to run versus what
only needs to type-check.

---

## Step 3 — Add Real Elements to `index.html`

**The problem:** There is nowhere on the page yet for rendered data to go.

Update the `<body>` of `index.html`:

```html
<body>
  <h1>Frontend Client</h1>
  <article>
    <h2 id="article-title">Loading…</h2>
    <p id="article-author"></p>
  </article>
  <script type="module" src="/src/main.ts"></script>
</body>
```

Reload the page. It now shows "Loading…" — real, visible, and honest about the fact
that nothing has arrived yet. This one word is doing real work: without it, the page
would briefly show nothing at all while the network request is in flight, which
looks broken rather than in-progress.

**Walkthrough:** `<article>` is a semantic HTML element meaning "a self-contained
piece of content" — a blog post, a news story, a forum post. Using it instead of a
generic `<div>` communicates *meaning*, not just structure: screen readers announce
it as an article, and browser extensions like reader mode use it to identify the
main content of a page. `id="article-title"` and `id="article-author"` are how
`main.ts` will find these exact elements in the next step — an `id` must be unique on
the page, which is exactly what makes `document.getElementById` reliable.

---

## Step 4 — Render the First Article

**The problem:** Data needs to move from `fetchArticles()`'s return value onto these
two elements.

Replace `src/main.ts` entirely:

```typescript
import { fetchArticles, type Article } from "./api.ts";

function renderArticle(article: Article): void {
  const titleElement = document.getElementById("article-title");
  const authorElement = document.getElementById("article-author");

  if (titleElement) {
    titleElement.textContent = article.title;
  }

  if (authorElement) {
    authorElement.textContent = `by ${article.author.username}`;
  }
}

async function main(): Promise<void> {
  try {
    const articles = await fetchArticles();
    renderArticle(articles[0]);
  } catch (error) {
    console.error("Could not load articles:", error);
  }
}

main();
```

Save and reload. The page now shows a real article's title and a real author's
username, fetched live.

**Walkthrough:** `document.getElementById("article-title")` searches the **DOM**
(Document Object Model — the browser's live, in-memory tree representation of the
HTML page; every tag in the HTML became one node in this tree when the page loaded)
for the single element whose `id` attribute equals `"article-title"`, returning it,
or `null` if no such element exists. TypeScript knows this can return `null` — its
type is `HTMLElement | null` — which is why the `if (titleElement)` check exists: it
is not a stylistic choice, it is TypeScript refusing to let you call
`.textContent = ...` on a value that might not exist, forcing you to handle that case
before proceeding. This is `strictNullChecks`, part of the `"strict": true` setting
in the `tsconfig.json` Vite generated for you in lesson 01 — without it, TypeScript
would let this line through, and it would crash at runtime with `Cannot set
properties of null` the moment an `id` is misspelled.

`titleElement.textContent = article.title` sets the element's text content directly.
`renderArticle` takes an `Article` (the interface from `api.ts`) as its only
parameter — its job is exactly "given one article, put it on the page," nothing more,
nothing about fetching or error handling.

`articles[0]` reads the first element of the array `fetchArticles()` returned —
`[0]` is **array indexing**: arrays are zero-indexed, meaning the first element is at
position `0`, the second at `1`, and so on.

`main()` is the new top-level entry point, replacing `loadArticles` from lesson 01:
fetch, then render, wrapped in the same `try`/`catch` shape from lesson 01 — now
living at the call site instead of inside the fetch function itself, exactly as
planned in Step 1.

---

## Concept: `textContent` vs `innerHTML` — a Security Boundary, Not a Style Choice

**The problem this section explains:** There are two ways to put text into an
element, and choosing the wrong one is a real, exploitable vulnerability the moment
you render content someone else typed.

`element.textContent = value` sets the element's contents as **plain text**, no
matter what characters `value` contains. If `value` contains `<script>` or `<b>`,
those characters appear on the page literally, as visible text — they are never
interpreted as HTML.

`element.innerHTML = value` does the opposite: it parses `value` *as HTML* and
inserts the result. If `value` contains `<script>alert('hacked')</script>`, the
browser creates and runs that script.

**Name the threat:** This is **XSS** — Cross-Site Scripting. It happens when
attacker-controlled text is inserted into a page as HTML instead of as plain text,
letting the attacker's own script run inside your page, in your users' browsers, with
access to anything your page's JavaScript can access — reading page content,
submitting forms as the user, or stealing session tokens.

**Why this is not hypothetical here:** `article.title` and `article.author.username`
are not values you typed. They come from Conduit's database, where *any registered
user* can create an article with any title they want, including one containing
`<img src=x onerror="alert('hacked')">`. If lesson 04's `renderArticle` used
`innerHTML` instead of `textContent`, opening this page would execute that string as
HTML the instant it rendered — no login required, no special action from the victim,
just viewing the page. This is precisely why `textContent` was used above, from the
very first line that ever wrote API data into the DOM: not as a precaution to add
later, but as the correct default from the first moment untrusted content touches
the page.

**The rule for the rest of this project:** `innerHTML` is only ever acceptable for
strings your own code fully constructs with no user-supplied data mixed in
unescaped. Any time a real API's string value is being inserted, `textContent` (or an
equivalent DOM API that treats content as text, not markup) is the default, and using
`innerHTML` instead requires a specific, stated reason.

---

## Connect the Pieces

```
src/api.ts      Fetches articles from Conduit and defines their shape (Article, Author)
src/main.ts     Renders one article's title and author onto the real page
index.html      Now contains real target elements: #article-title, #article-author
```

`fetchArticles` and the `Article` interface, both defined in `src/api.ts`, are what
every future lesson imports from this file — lesson 03's list rendering, lesson 06's
detail view, and lesson 08's favorite button all start from this exact same function
and this exact same type. `renderArticle`, defined in `src/main.ts`, is the function
lesson 04 will extract into its own file once a second component joins it.

---

## What Breaks Without This

**Without the `null` check on `getElementById`'s result:** Misspell an `id` in
`index.html` — change `article-title` to `article-titel`. Remove the `if
(titleElement)` guard and call `titleElement.textContent = article.title` directly.
TypeScript would refuse to compile this without the check (`strictNullChecks` catches
it at compile time) — but if you silence that with `titleElement!.textContent = ...`
(the `!` tells TypeScript "trust me, this is not null"), reload the page: it crashes
with `Uncaught TypeError: Cannot set properties of null (setting 'textContent')`,
and nothing on the page renders at all, with no indication of which `id` was wrong
unless you read the stack trace carefully.

**Without `export` on `Article`:** Remove `export` from `interface Article` in
`api.ts`. The `import { fetchArticles, type Article } from "./api.ts"` line in
`main.ts` now fails to compile: TypeScript reports that `Article` is not exported
from that module. This is the type system protecting the module boundary — it is
impossible to accidentally depend on something its author did not intend to share.

---

## Definition of Done

- [ ] The page shows a real article title and "by `<username>`", not a console log
- [ ] Reloading the page while the network is briefly disconnected shows the
      "Loading…" placeholder text, then a clear console error, not a blank page
- [ ] `src/api.ts` exports `fetchArticles`, `Article`, and `Author`; `ArticlesResponse` is not exported
- [ ] You can explain what an `interface` is and what problem it solves compared to `any`
- [ ] You can explain what `export` and `import` do and why `main.ts` only imports two names, not the whole file
- [ ] You can explain the difference between `textContent` and `innerHTML`, and why this project defaults to `textContent`
- [ ] You can explain what XSS is and construct (in words) a real article title that would exploit `innerHTML` here
- [ ] You can explain why `document.getElementById` can return `null` and what `strictNullChecks` does about it
- [ ] Run:
      ```
      git add src/api.ts src/main.ts index.html
      git commit -m "Render the first real article on the page; separate fetching (api.ts) from rendering (main.ts)"
      ```

---

*Next: Lesson 03 — Displaying a List. `articles[0]` becomes every article Conduit
returned. The loop that makes this possible is the first time this project iterates
over real data of unknown length — and the first hint of the repetition that lesson
04 will notice and fix.*
