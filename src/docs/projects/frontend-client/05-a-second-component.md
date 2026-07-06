# Frontend Client — Lesson 05 — A Second Component

## What You Will Build

Each article grows a real author byline: the author's avatar image next to their
username. That is the visible feature. The structural change is bigger: this lesson
moves every component built so far out of `main.ts` and into a new `src/components/`
folder — the first time this project's file structure changes because the code
genuinely needs it, not because folders are "how projects are supposed to look."

When you finish, every article shows:

```
[avatar image]  johndoe
How to Learn JavaScript Efficiently
[beginners] [javascript] [programming] [webdev]
```

---

## What You Need to Know First

Lesson 04 left `src/main.ts` containing three functions: `createTagList(tags:
string[])`, `createArticleElement(article: Article)`, and `main()`. `createArticleElement`
calls `createTagList`. `src/api.ts` is unchanged since lesson 02, still exporting
`fetchArticles`, `Article`, and `Author` (whose `image` field has not been used yet).

---

## Step 1 — Build the Byline Inline First

**The problem:** As in lesson 04, the fastest way to see whether this feature is
right is to build it in place, even knowing it will move.

Extend `createArticleElement` in `src/main.ts`:

```typescript
function createArticleElement(article: Article): HTMLElement {
  const container = document.createElement("article");

  const byline = document.createElement("div");
  byline.className = "byline";

  const avatarElement = document.createElement("img");
  avatarElement.src = article.author.image;
  avatarElement.alt = `${article.author.username}'s avatar`;
  avatarElement.className = "avatar";

  const usernameElement = document.createElement("span");
  usernameElement.textContent = article.author.username;

  byline.appendChild(avatarElement);
  byline.appendChild(usernameElement);

  const titleElement = document.createElement("h2");
  titleElement.textContent = article.title;

  container.appendChild(byline);
  container.appendChild(titleElement);
  container.appendChild(createTagList(article.tagList));

  return container;
}
```

Add to `src/style.css`:

```css
.byline {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
```

Save and reload. Every article now shows a round avatar next to the author's
username, above the title.

**Walkthrough:** `document.createElement("img")` creates an `<img>` element — an
element type that has appeared for the first time in this lesson. `avatarElement.src
= article.author.image` sets the URL the browser fetches the image from — `Author.image`,
defined in `api.ts` since lesson 02, is a real URL Conduit returned. `avatarElement.alt
= ...` sets the **alt text** — a text description of the image, read aloud by screen
readers for users who cannot see images, and shown in place of the image if it fails
to load. Every `<img>` in this project sets `alt` from this point on; an image with
no `alt` attribute is invisible to a screen reader user in a way nothing else on the
page compensates for.

`object-fit: cover` is a CSS property controlling how an image fills a box whose
*aspect ratio* (width-to-height proportion) does not match the image's own —
`cover` scales the image to fill the box completely, cropping any overflow, rather
than stretching or squashing it out of proportion. `border-radius: 50%` on a square
element (32px by 32px here) produces a perfect circle — a rounded avatar, the same
convention nearly every social platform uses.

**Concept — loading an image is not subject to CORS the way `fetch` is.** Lesson 01
explained that `fetch`ing data from a different origin requires the server's explicit
permission via an `access-control-allow-origin` header, or the browser blocks your
JavaScript from reading the response. Setting `<img src="...">` to a cross-origin URL
works with no such header required — the browser displays the image regardless. The
difference is what each operation actually needs: `fetch` hands your JavaScript the
raw response to *read*, which is exactly the capability CORS exists to gate; an
`<img>` tag only asks the browser to *display* pixels, never handing the raw image
bytes to your JavaScript at all. This is why images, stylesheets, and scripts have
loaded across domains since the beginning of the web, while `fetch`-based
cross-origin data access needed a permission system added later, once JavaScript
could actually read what came back.

---

## Step 2 — Extract `createAuthorByline`

**The problem:** Exactly the same reasoning as lesson 04's `createTagList`: this
byline — an avatar next to a name — is not specific to articles. Lesson 07's comment
list shows the same shape for whoever wrote each comment.

```typescript
function createAuthorByline(author: Author): HTMLElement {
  const byline = document.createElement("div");
  byline.className = "byline";

  const avatarElement = document.createElement("img");
  avatarElement.src = author.image;
  avatarElement.alt = `${author.username}'s avatar`;
  avatarElement.className = "avatar";

  const usernameElement = document.createElement("span");
  usernameElement.textContent = author.username;

  byline.appendChild(avatarElement);
  byline.appendChild(usernameElement);

  return byline;
}

function createArticleElement(article: Article): HTMLElement {
  const container = document.createElement("article");

  const titleElement = document.createElement("h2");
  titleElement.textContent = article.title;

  container.appendChild(createAuthorByline(article.author));
  container.appendChild(titleElement);
  container.appendChild(createTagList(article.tagList));

  return container;
}
```

**Walkthrough:** `createAuthorByline` takes an `Author` — the interface `api.ts`
already exported since lesson 02 for exactly this reason — not an `Article`, for the
same reasoning as lesson 04's `createTagList` taking `string[]` instead of `Article`:
the function's parameter should be the smallest, most specific shape it actually
needs, so it works anywhere an `Author` exists, article or otherwise.

`createArticleElement` now reads as a short, honest summary of what an article card
actually contains: a byline, a title, and a tag list — three components composed
together, none of which know about the other two.

---

## Step 3 — Give Components Their Own Folder

**The problem:** `main.ts` now contains three components (`createAuthorByline`,
`createTagList`, `createArticleElement`) plus `main()` itself. This is the moment —
not before — where a `components/` folder earns its place: there are genuinely two
independent, reusable pieces of UI (three, counting `createArticleElement` itself,
which is now a composition of the other two) that have nothing to do with fetching
data or bootstrapping the page.

Create three new files:

**`src/components/TagList.ts`:**

```typescript
export function createTagList(tags: string[]): HTMLElement {
  const tagsElement = document.createElement("div");

  for (const tag of tags) {
    const tagElement = document.createElement("span");
    tagElement.textContent = tag;
    tagElement.className = "tag-pill";
    tagsElement.appendChild(tagElement);
  }

  return tagsElement;
}
```

**`src/components/AuthorByline.ts`:**

```typescript
import type { Author } from "../api.ts";

export function createAuthorByline(author: Author): HTMLElement {
  const byline = document.createElement("div");
  byline.className = "byline";

  const avatarElement = document.createElement("img");
  avatarElement.src = author.image;
  avatarElement.alt = `${author.username}'s avatar`;
  avatarElement.className = "avatar";

  const usernameElement = document.createElement("span");
  usernameElement.textContent = author.username;

  byline.appendChild(avatarElement);
  byline.appendChild(usernameElement);

  return byline;
}
```

**`src/components/ArticleCard.ts`:**

```typescript
import type { Article } from "../api.ts";
import { createAuthorByline } from "./AuthorByline.ts";
import { createTagList } from "./TagList.ts";

export function createArticleElement(article: Article): HTMLElement {
  const container = document.createElement("article");

  const titleElement = document.createElement("h2");
  titleElement.textContent = article.title;

  container.appendChild(createAuthorByline(article.author));
  container.appendChild(titleElement);
  container.appendChild(createTagList(article.tagList));

  return container;
}
```

And reduce `src/main.ts` to only what is actually its job — fetching and mounting:

```typescript
import { fetchArticles } from "./api.ts";
import { createArticleElement } from "./components/ArticleCard.ts";

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

Save and reload. The page is visually identical to Step 2 — again, a structural
change with no behaviour change is the sign it was done correctly.

**Walkthrough — the new import paths:** `import type { Author } from "../api.ts"` —
`../` means "go up one folder from here" (`src/components/`) to reach `src/api.ts`.
`import { createAuthorByline } from "./AuthorByline.ts"` inside `ArticleCard.ts` uses
`./` because both files now live in the same `src/components/` folder.

**Why PascalCase filenames (`ArticleCard.ts`, not `articleCard.ts` or
`article-card.ts`):** This project adopts the naming convention used by nearly every
component-based framework: a file that exports one primary component is named after
that component, in PascalCase (each word capitalised, no separators) — `ArticleCard.ts`
exports `createArticleElement`, `AuthorByline.ts` exports `createAuthorByline`. This
is a convention, not a technical requirement — TypeScript does not care what a file
is named — but consistent naming means anyone opening this project's file tree
already knows, before opening a single file, that `src/components/` contains
independent, reusable pieces of UI, and nothing else.

**SE lens — why `main.ts` shrinking is the actual goal.** `main.ts`'s job, now that
`api.ts` owns fetching and `components/` owns rendering, is *orchestration*: call the
data layer, hand results to the rendering layer, wire the two together, and handle
the case where either fails. A file whose job is orchestration should be short and
easy to read top to bottom — if `main.ts` were still 60 lines long containing three
components' worth of DOM-building logic, finding "where does the page actually get
built" would require reading past everything else first. Every lesson from here
should leave `main.ts` doing less, not more, as each new capability moves to the file
whose job it actually is.

---

## Connect the Pieces

```
src/api.ts                       Fetches and types data — unchanged since lesson 02
src/components/TagList.ts        Component: a list of string pills (lesson 04)
src/components/AuthorByline.ts   Component: an avatar + username (this lesson)
src/components/ArticleCard.ts    Component: composes the two above plus a title
src/main.ts                      Orchestration only: fetch, then render, then handle failure
```

This is now a real three-layer structure: data (`api.ts`), presentation
(`components/`), and orchestration (`main.ts`). Lesson 06 adds a fourth layer —
routing — that decides *which* orchestration runs, based on the URL.

---

## What Breaks Without This

**Without extracting into `components/`:** Nothing breaks functionally — the code
from Step 2 runs identically. What breaks is *navigability*: by lesson 10, `main.ts`
would contain a login form component, an article form component, a comment list
component, a byline component, a tag list component, and an article card component,
all mixed with the actual fetch/render orchestration. Finding any one piece means
reading past all the others. The folder structure is not required for the code to
run — it is required for a human (including future you) to keep understanding the
project as it grows.

**Without `export` on `createTagList`, `createAuthorByline`, or `createArticleElement`:**
Exactly as in lesson 02 — remove `export` from any of them, and every file importing
it fails to compile, because TypeScript enforces that only exported names cross a
module boundary.

---

## Definition of Done

- [ ] Every article shows an author avatar and username above the title
- [ ] `src/components/` contains `TagList.ts`, `AuthorByline.ts`, and `ArticleCard.ts`, each exporting exactly one component function
- [ ] `src/main.ts` contains only `main()` — no DOM-building logic beyond calling components and appending their results
- [ ] The page's visible output is unchanged from Step 2 after the file reorganisation
- [ ] Every `<img>` in the project has a meaningful `alt` attribute
- [ ] You can explain why `<img src="...">` works cross-origin without a CORS header, while `fetch` does not
- [ ] You can explain why `main.ts` shrinking, not growing, is the goal of this lesson
- [ ] You can explain the difference between `./` and `../` in an import path
- [ ] Run:
      ```
      git add src/components src/main.ts src/style.css index.html
      git commit -m "Add author bylines; move components into src/components/ now that there are two of them"
      ```

---

*Next: Lesson 06 — Article Detail & Routing. Clicking an article's title shows its
full body on its own view, without a full page reload. This is the first time the
URL itself becomes part of the application's state, and the first component this
project builds that is not embedded inside another one — it is a full page.*
