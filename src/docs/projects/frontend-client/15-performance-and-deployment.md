# Frontend Client — Lesson 15 — Performance and Deployment

## What You Will Build

A production build of the project, measured and trimmed, published to a real public
URL. This is the last lesson, and the first time this project is something you can
actually send a link to — a stranger opening it needs no dev server, no `npm
install`, nothing except a browser.

---

## What You Need to Know First

Every lesson so far has run through `npm run dev` — Vite's development server, which
compiles TypeScript on the fly and reloads instantly on every save. This lesson uses
Vite differently: to produce the final, optimised files a browser actually receives
in the real world.

---

## Step 1 — Move the API URL to an Environment Variable

**The problem:** `API_BASE_URL` has been hardcoded inside `src/api.ts` since lesson
06. A real project frequently needs different values for different environments —
a local test backend during development, a production API once deployed — without
editing source code to switch between them.

Create a file named `.env` in the project root:

```
VITE_API_BASE_URL=https://api.realworld.show/api
```

Update `src/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

Restart `npm run dev` (environment variables are only read when the dev server
starts). The project behaves identically — this step changes *where* the value
lives, not what it is.

**Walkthrough:** `import.meta.env` is Vite's built-in mechanism for exposing
environment variables to your code, replaced with their literal values at build
time. Vite only exposes variables whose name starts with `VITE_` to code that runs
in the browser — this is a deliberate security boundary: an environment variable
holding something genuinely secret (an API key never meant to be public) can live
in `.env` without the `VITE_` prefix, and Vite will simply never include it in
anything sent to a browser, no matter how it is referenced. `VITE_API_BASE_URL` is
not a secret — it is a public API's public URL — so exposing it is correct and safe
here; the prefix rule exists for the case where that would not be true.

**SE lens — why this matters even for a solo project.** A URL baked directly into
source code means switching environments requires editing and recommitting code — a
real risk of accidentally deploying with a development URL still in place, or
committing an internal staging URL that should not be public. An environment
variable makes "which backend am I talking to" a deployment-time decision, entirely
separate from the code itself, which is why virtually every real production
application manages configuration exactly this way — this is one instance of the
"twelve-factor app" methodology's principle that configuration should live in the
environment, not in the code.

---

## Step 2 — Split Rarely-Used Code Out of the Initial Bundle

**The problem:** Every visitor to this project downloads the login form, the
registration form, and the new-article form's code — even an anonymous visitor who
only ever reads articles and never opens any of them.

Update `renderAuthPage` and `renderNewArticlePage` in `src/main.ts` — both gain an
`await import(...)` and, as a direct result, both become `async` for the first time:

```typescript
async function renderAuthPage(appElement: HTMLElement, mode: "login" | "register"): Promise<void> {
  const { createAuthForm } = await import("./components/AuthForm.ts");

  appElement.textContent = "";
  appElement.appendChild(
    createAuthForm(mode, (user) => {
      setToken(user.token);
      renderNavBar();
      location.hash = "#/";
    }),
  );
}

async function renderNewArticlePage(appElement: HTMLElement): Promise<void> {
  if (!isLoggedIn()) {
    location.hash = "#/login";
    return;
  }

  const { createNewArticleForm } = await import("./components/NewArticleForm.ts");

  appElement.textContent = "";
  appElement.appendChild(
    createNewArticleForm((article) => {
      location.hash = `#/articles/${article.slug}`;
    }),
  );
}
```

`renderRoute` itself needs only one change — each of these two calls now needs an
`await`, since both functions return a `Promise` for the first time:

```typescript
async function renderRoute(): Promise<void> {
  const appElement = document.getElementById("app");
  if (!appElement) return;

  const route = parseRoute(location.hash);

  if (route.name === "detail") {
    await renderArticleDetailPage(appElement, route.slug);
  } else if (route.name === "login" || route.name === "register") {
    await renderAuthPage(appElement, route.name);
  } else if (route.name === "new") {
    await renderNewArticlePage(appElement);
  } else {
    await renderArticleListPage(appElement);
  }
}
```

**Walkthrough:** `import { createAuthForm } from "./components/AuthForm.ts"` at the
top of a file is a **static import** — every static import is resolved and bundled
in up front, whether or not the code path that uses it ever actually runs for a
given visitor. `await import("./components/AuthForm.ts")` is a **dynamic import** —
a function call, not a top-of-file declaration, returning a `Promise` that resolves
to the module's exports. Critically, a dynamic import tells the bundler "this module
does not need to be in the same file as everything else — split it into its own
separate file, and only fetch that file the moment this line of code actually runs."

**CS lens — why bundle size is a real performance metric, not an abstraction.**
Every kilobyte of JavaScript sent to a browser must be downloaded, then *parsed*,
then *executed*, all before the page the code belongs to becomes interactive — on a
slow connection or an underpowered device, this is real, perceptible time a user
spends staring at an unresponsive page. Code that most visitors never need — a login
form for someone only browsing — is exactly the kind of code that benefits most from
being deferred: it costs nothing to anyone who never visits `#/login`, and costs only
one small additional file fetch to anyone who does. **Code splitting** is the general
technique this demonstrates: breaking one large bundle into several smaller ones,
loaded on demand rather than all at once.

---

## Step 3 — Build for Production

**The problem:** `npm run dev` compiles TypeScript on demand, unminified, with
detailed error messages and source maps meant for *you* to debug quickly — none of
which a real visitor's browser should have to download.

```
npm run build
```

**Walkthrough:** This runs the `build` script Vite's scaffold wrote into
`package.json` back in lesson 01. It performs several transformations at once:
**bundling** — combining the project's many TypeScript files into a small number of
JavaScript files, so a browser makes far fewer network requests than one per source
file; **minification** — stripping comments and whitespace and shortening variable
names (a minified `renderArticleListPage` might become a single letter internally),
since a human never reads this file, only a browser executes it; and **tree-shaking**
— detecting and removing any exported code that nothing in the project actually
imports, so unused code never ships at all.

The terminal prints a summary of every generated file and its size, both raw and
**gzip**-compressed (the compression virtually every web server applies
automatically before sending a file, and the number that actually matters for
real-world download time). The output lands in a new `dist/` folder — add `dist` to
`.gitignore` if it is not there already: like `node_modules`, it is fully
reproducible from source by running `npm run build` again, so committing it adds
files with no new information.

---

## Step 4 — Preview the Production Build Locally

**The problem:** `dist/` is a folder of static files, not something `npm run dev`
serves — you need to confirm it actually works before publishing it anywhere.

```
npm run preview
```

**Walkthrough:** This starts a small local server — deliberately *not* the dev
server — that serves the files in `dist/` exactly as a real static host would: no
hot reloading, no on-the-fly TypeScript compilation, just the final, built output.
Open the URL it prints and click through the whole project: register, log in,
publish an article, favorite one, search by tag, paginate. This is your last chance
to catch anything that only breaks in the production build and not in development —
a real, occasionally different environment, worth testing deliberately rather than
assuming it behaves identically to `npm run dev`.

---

## Step 5 — Deploy to a Static Host

**The problem:** `dist/` needs to be reachable by a URL, not just your own machine.

Because this project has no server of its own — every request it makes goes
directly from the browser to Conduit — the entire built application is just static
files: HTML, CSS, and JavaScript. Any **static hosting** service — a host whose only
job is serving files exactly as they are, with no server-side code execution of its
own — can serve it. Popular options with a genuinely free tier for a project like
this include GitHub Pages, Netlify, Vercel, and Cloudflare Pages; the exact steps
differ slightly between them and are best followed from each service's own current
documentation rather than fixed instructions here, since hosting UIs change over
time. The concept does not: build the project (`npm run build`), then upload or
connect the `dist/` folder to the chosen host.

**Concept — why hash-based routing was the right call for exactly this moment.**
Lesson 06 chose `#/articles/:slug`-style routing over real path-based URLs
(`/articles/:slug` without the `#`) without fully explaining why until now: a static
host only ever receives a request for the *path* portion of a URL — the fragment
(everything from `#` onward) is never sent to the server at all, by definition. A
visitor loading `yoursite.com/#/articles/how-to-learn-javascript-efficiently`
causes the server to receive a request for `yoursite.com/` and nothing more; your
own JavaScript, once loaded, reads the fragment and renders the right view entirely
client-side. A path-based router, by contrast, would require the static host to be
specifically configured to redirect every unknown path back to `index.html` — some
hosts support this easily, some do not, and getting it wrong means a direct link to
an article, or a page refresh on one, returns a real `404 Not Found` from the host
itself, before your JavaScript ever runs. This project's hash-based routing sidesteps
that entire category of deployment problem, for free, as a direct consequence of a
decision made nine lessons ago.

---

## Connect the Pieces

```
.env                    VITE_API_BASE_URL — configuration, separated from code
src/main.ts             Dynamic import() splits auth/new-article code out of the main bundle
dist/                   The final, built, minified output — what actually gets deployed
```

Every lesson before this one built a feature. This lesson is the only one that
touches no feature at all — it exists entirely to make everything already built
reach a real user, on a real device, over a real (possibly slow) connection, as
efficiently as this project reasonably can.

---

## What Breaks Without This

**Without moving to `dist/`'s built output (deploying the raw source files
instead):** A static host receiving your uncompiled `.ts` files would serve them as
plain text — browsers cannot execute TypeScript directly, at all. The page would
load a blank white screen, and the browser's console would show a syntax or MIME-type
error, since `.ts` is not valid JavaScript a `<script>` tag can run.

**Without hash-based routing (had this project used real paths without server
configuration):** Sharing a direct link to a specific article works fine from
within the app (clicking a link never leaves the page) but fails the moment someone
opens that exact URL fresh, or refreshes the page while on it — the static host
looks for a real file or folder at that path, finds nothing, and returns a genuine
404, with the application's own JavaScript never given the chance to run at all.

---

## Definition of Done

- [ ] `API_BASE_URL` is read from `import.meta.env.VITE_API_BASE_URL`, defined in `.env`
- [ ] `#/login`, `#/register`, and `#/new` load their component code via dynamic `import()`
- [ ] `npm run build` completes with no errors and produces a `dist/` folder
- [ ] `npm run preview` serves a fully working copy of the project from that build
- [ ] The project is live at a real, public URL, reachable from a device that has never run `npm install`
- [ ] Opening a direct link to an article's detail view, or refreshing on one, works correctly on the deployed site
- [ ] You can explain the difference between bundling, minification, and tree-shaking
- [ ] You can explain what a dynamic `import()` does differently from a static `import` statement, and why it matters for bundle size
- [ ] You can explain why this project's hash-based routing needed no special static-host configuration to deploy correctly
- [ ] Run:
      ```
      git add .env src/api.ts src/main.ts .gitignore
      git commit -m "Externalise configuration, code-split rarely-used routes, and prepare for production deployment"
      ```

---

*This is the last lesson in the written curriculum so far. The project now reads,
searches, paginates, authenticates, writes, and caches against a real production
API, and is live on the public internet. From here, the same process that built
every feature in this project — notice a real gap, build the smallest working piece
that closes it, name the concept it embodies, connect it to what already exists —
is exactly how you would keep extending it: editing articles, following other users,
an activity feed, image uploads. Nothing about the shape of the work changes; only
the feature does.*
