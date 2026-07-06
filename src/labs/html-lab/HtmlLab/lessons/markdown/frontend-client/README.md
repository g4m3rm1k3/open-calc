# The Frontend Client — A Real UI for a Real API

## What You Will Build

A complete browser-based frontend for [Conduit](https://api.realworld.show/redoc),
a live, publicly-hosted implementation of the **RealWorld** API spec — a real,
production-shaped backend that models a social blogging platform: articles, authors,
comments, tags, favorites (likes), and JWT authentication. RealWorld is an open-source
project maintained specifically so learners can build real frontends against a real,
stable backend instead of a toy API invented for a tutorial. You are not pretending.

No React. No Angular. No framework at all. Just TypeScript, HTML, and CSS, and the
browser APIs every framework is eventually built on top of — `fetch`, the DOM,
`localStorage`, hash-based routing. By the end, you will understand what a framework
is actually doing for you, because you will have done it yourself first.

By the end you will:
- Fetch real data from a live REST API and understand exactly what happens on the wire
- Render that data into HTML without a templating library
- Discover *why* components exist by feeling the pain of not having them
- Build a growing component tree: articles, comments, authors, forms
- Implement client-side routing, search, and pagination
- Log in with a real authentication flow (JWT) and make authenticated requests
- Create, like, and comment on real articles on a real server
- Cache data, handle loading and error states, and ship something deployable

## Lesson Standard

Every lesson in this project must meet the [Lesson Contract](../LESSON_CONTRACT.md).
Read it before writing or reviewing a lesson.

## Why a Real Backend Instead of a Fake One

Most tutorials invent a pretend API — a hardcoded array of objects dressed up to look
like a server response. That teaches rendering, but it quietly skips everything that
makes frontend work actually hard: network latency, HTTP status codes, CORS,
authentication tokens, malformed responses, and data you do not control because
someone else's user typed it.

Conduit is real. `https://api.realworld.show/api` is a live server, hosted by a third
party, running one of dozens of open-source RealWorld backend implementations. It
returns real JSON, enforces a real authentication flow, and — because other people's
data lives there — forces you to confront a real security question the first time you
render someone else's article title. If this particular hosted instance ever goes
down, the fix is to point `API_BASE_URL` at any other RealWorld-compatible backend
(the spec is stable and dozens of implementations exist), or self-host the reference
Node/Express implementation. The lessons do not change — only one constant does.

## How the Lessons Are Ordered

The rule inherited from the Lesson Contract: never build invisible infrastructure.
A data model is not built before there is a screen to show it on. A components
folder is not created until there are two real components that need one. The
component tree, the routing, and the service layer all *emerge* from a specific
moment of pain — duplicated code, a second concern appearing, a feature that needs
to survive a page reload — rather than being introduced because "you'll need this
eventually." Every lesson ends with something you can reload the page and use.

## Lessons

| # | Title | You Can See | SE | CS | Web & Data |
|---|---|---|---|---|---|
| 01 | Connecting to a Real API | The browser console prints real article data fetched live from a production server | Isolating network access from rendering logic — even before there are two files | The event loop, `Promise`, `async`/`await`, non-blocking I/O | HTTP requests, JSON, REST, CORS, status codes |
| 02 | Rendering Real Data | The page shows a real article's title and author, no longer just the console | `textContent` vs `innerHTML` as a security boundary, not a style choice | Typing an untyped API response with a TypeScript `interface` | XSS, why user-generated content is dangerous by default |
| 03 | Displaying a List | Every real article from the API appears on the page | One function per article, called in a loop — the natural shape once more than one item exists | Iteration, `for...of`, building real DOM elements (not HTML strings) in a loop | Pagination parameters (`limit`, `offset`) introduced conceptually |
| 04 | Components | Each article now shows its tags as pills — and the function that builds them gets a name: component | Naming the pattern already in the code: a component takes data in, returns an element, and does not place itself | Functions as the smallest unit of reuse, parameterization | None new |
| 05 | A Second Component | Each article now shows its author's name and avatar, in its own function, in its own file | The moment a project earns a `components/` folder — because there are two, not because there might be | Composition — one render function calling another | None new |
| 06 | Article Detail & Routing | Clicking an article's title shows its full body on its own "page" | Client-side routing as a mapping from URL to view, single responsibility per page | The `hashchange` event, the browser's back/forward stack | Client-side vs server-side routing, why no full page reload |
| 07 | Comments | Real comments for the article appear beneath it | A growing component tree: `Article → CommentList → Comment` | Nested rendering, a second network request per view | A second real endpoint, response shape variation |
| 08 | Likes | Clicking the heart calls the real server — and gets a real `401 Unauthorized`, because the API correctly refuses to know who is liking what | Wiring a feature before its dependency exists, and reading the failure honestly | Mutating server state with `POST`, idempotency, HTTP status codes as information | `POST` vs `GET`, what `401` means, why this exact failure is the reason lesson 09 exists |
| 09 | Authentication | A login form; the "New Article" button only appears once logged in | Sessions without a framework, protecting UI based on state | JWT structure, storing a token, attaching it to requests | `Authorization` headers, what a JWT actually contains |
| 10 | Creating a Post | Submitting a form creates a real, permanent article on the server | Forms as structured input, optimistic vs confirmed state | Client-side validation vs server-side validation | `POST` with a JSON body, `Content-Type` |
| 11 | Search and Tags | Typing in a search box filters articles by tag, with a loading state | Debouncing as a response to a real performance problem | Timers, cancelling stale requests (race conditions) | Query parameters, race conditions in async UI |
| 12 | Pagination | A "Load More" button fetches and appends the next page of articles | Append-only state, incremental rendering | Offset-based pagination | `limit`/`offset` used for real this time |
| 13 | Notifications | A toast appears confirming an action succeeded or failed | The first standalone service — `NotificationService` — with no UI of its own | The observer pattern | None new |
| 14 | Caching | Revisiting an article you already opened shows it instantly, no network call | A cache as a map with an eviction question | Memoization, cache invalidation | Why caching is "one of the two hard problems" |
| 15 | Performance and Deployment | The built site loads fast and is live on a public URL | Production build vs dev server, code splitting | Bundling, minification | Deployment, static hosting, environment variables |

Only lessons 01 and 02 are written so far. The table above is the committed shape of
the rest — it will be refined as each lesson is actually written, the same way the
calculator and OpenMAT curricula were.

## Definition of Done (whole project)

- Every lesson's checklist is satisfied before the next lesson begins
- The client can read, search, and paginate real articles from the live API
- A user can register, log in, and stay logged in across a page reload
- A logged-in user can create an article, comment, and favorite a real article on the server
- No `innerHTML` is ever assigned a raw API string — every insertion point is named and justified
- You can explain, without looking anything up, why this project has no framework and
  what a framework like React would have done instead of the code you wrote by hand
