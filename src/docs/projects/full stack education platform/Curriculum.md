# Full-Stack Software Engineering Curriculum

## Build a Cross-Platform Coding Education App

**Stack:** TypeScript · React · Expo · Electron · Node.js · PostgreSQL · Prisma · Auth.js  
**Targets:** Web · iOS · Android · Desktop  
**Duration:** ~40 lessons across 8 phases

This document is the lesson plan. Every lesson entry states:

- What visible thing you build
- What CS concepts it teaches explicitly
- What SE concepts it teaches explicitly
- What tooling/environment concepts it teaches
- What security concepts it teaches (where relevant)

Nothing is implicit. If it appears in a lesson, it is taught in that lesson.

---

## How to read this plan

Each lesson has a **Build** (what you make and run), a **CS** column (computer science concepts taught), and an **SE** column (software engineering principles taught). Every concept listed must be explained from first principles at the moment it appears — not assumed, not referenced to prior knowledge you may not have.

The lessons are sequenced so that **something is always visible and runnable**. No lesson builds invisible infrastructure. No lesson says "this will make sense later."

---

## Phase 1 — The Foundation (Lessons 01–06)

### You go from nothing to a styled, navigable app running in your browser and on your phone simultaneously.

---

### Lesson 01 — Your First Screen, Your First Commit

**Build:** One screen with a heading and a button, visible in a web browser. Nothing more.

**What you install and configure:**

- Node.js and npm — what they are, what the difference between a runtime and a package manager is, what happens when you run `npm install`
- Expo CLI — what it does, why `npx` runs it without installing globally
- TypeScript — what a type system is, why JavaScript alone is insufficient for large projects, what the compiler does
- Git — what version control is, what a commit is, what a commit message communicates (why, not what), the three states of a file (modified / staged / committed), `.gitignore` and why `node_modules` is never committed
- `package.json` — what it is, what `dependencies` vs `devDependencies` means, what semantic versioning (`^1.0.0`) means
- `package-lock.json` — what it records, why it is committed, why you never hand-edit it

**CS concepts taught:**

- What a program is: source code → compiler/interpreter → execution
- What a runtime is (Node.js executes JavaScript outside the browser)
- What a type system is: a set of rules the compiler enforces before your code runs, catching a class of errors that would otherwise only appear at runtime
- What static vs dynamic typing means

**SE concepts taught:**

- Separation of concerns: why the package manager, the compiler, the runtime, and the editor are four separate tools with four separate responsibilities
- Version control as a professional practice: why every change is recorded, why commit messages explain intent not content
- Dependency management: why you declare what your project needs rather than copying code manually

**Tooling taught:**

- `npx create-expo-app` — every argument explained
- `npm run start` — what Expo's dev server does, what hot reload means
- `git init`, `git add`, `git commit` — every flag explained
- The terminal itself: what a shell is, what a working directory is, what a path is

**Visible result:** One screen. A heading. A button. Runs in Chrome at `localhost:8081`.

---

### Lesson 02 — TypeScript From First Principles

**Build:** Add a counter to your screen. Button increments it. The count is displayed.

**CS concepts taught:**

- Variables: what they are in memory (a named location that holds a value)
- Types: `string`, `number`, `boolean` — what each can hold and what it cannot
- Functions: what a function is (a named, reusable block of code), parameters vs arguments, return values
- The call stack: what happens in memory when a function is called, what "stack frame" means, what a stack overflow is
- Primitive vs reference types: why `let a = 5; let b = a; b = 10` does not change `a`, but objects behave differently

**SE concepts taught:**

- Naming: why `incrementCounter` is better than `inc`, why names are documentation
- Single responsibility: why your counter logic should be separate from your display logic — even at this small scale
- Immutability: why modifying data in place causes bugs that are hard to trace

**TypeScript taught (define at use):**

- Type annotations: `const count: number = 0`
- Type inference: when TypeScript can figure out the type without you stating it
- `const` vs `let` vs `var`: what each does, why `var` is never used in modern TypeScript, why `const` is the default choice
- Arrow functions: `() => {}` syntax explained fully
- Template literals: `` `Count: ${count}` `` — what they are, how interpolation works

**Visible result:** A counter on screen. Click the button, the number goes up.

---

### Lesson 03 — React From First Principles

**Build:** Break your single-file app into components. A `Header` component, a `Counter` component, a `Button` component.

**CS concepts taught:**

- The tree data structure: what a tree is (nodes with parent/child relationships), why the UI is modeled as a tree, what the DOM tree is
- Recursion through UI: how React renders a component tree by recursively rendering each node
- The virtual DOM: what problem it solves (repainting the whole screen is expensive), how React diffs the virtual and real DOM, what reconciliation means

**SE concepts taught:**

- Component-based architecture: what a component is (a self-contained unit of UI with its own data and appearance), why this is better than one large file
- Separation of concerns: each component owns its own appearance and behavior
- Encapsulation: a component's internal state is not visible to other components unless explicitly passed out
- The single responsibility principle: a `Button` component renders a button and handles its press — it does not know what the button does in the app
- Composability: how small components combine into larger ones, why this scales

**React taught (define at use):**

- JSX: what it is (JavaScript that looks like HTML), why it exists, what the compiler turns it into
- Props: how data flows from parent to child, why props are read-only
- State with `useState`: what state is (data that, when changed, causes the component to re-render), what the `[value, setter]` pattern means, why you use the setter instead of mutating directly
- The component lifecycle in brief: mount, update, unmount — what each means
- `export` and `import`: what a module is, what exporting means, named vs default exports

**Visible result:** Same counter app, now built from three separate components. Identical appearance, better structure.

---

### Lesson 04 — Styling From First Principles

**Build:** Style your app. A proper layout with a navigation bar, a content area, and a footer. Mobile-responsive.

**CS concepts taught:**

- The box model: every element is a rectangle — content, padding, border, margin. This is a layout algorithm, not just a style rule.
- The cascade: how CSS decides which rule wins when two rules apply to the same element — specificity, source order, inheritance
- Flexbox as an algorithm: the main axis, the cross axis, how `justify-content` and `align-items` work geometrically, what `flex: 1` means mathematically

**SE concepts taught:**

- Design tokens: why you define colors and spacing as named constants rather than hardcoding `#3B82F6` everywhere — the same principle as named constants in code
- The open/closed principle applied to styling: a design token system lets you change the entire app's color scheme by changing one value, not hundreds
- Separation of concerns: why styles live separately from logic

**Styling taught (define at use):**

- NativeWind / Tailwind: what a utility-first CSS framework is, why `className="flex items-center p-4"` is better than writing custom CSS for every element
- Responsive design: what a breakpoint is, what `sm:` `md:` `lg:` prefixes mean, why mobile-first matters
- The `StyleSheet` API in React Native: why React Native doesn't use CSS directly, how styles are objects not strings

**Tooling taught:**

- What NativeWind is, how to install and configure it, what its `tailwind.config.js` controls
- The `app.json` / `app.config.ts` file in Expo: what it configures, every field touched

**Visible result:** A properly laid out, styled app. Looks designed, not default.

---

### Lesson 05 — Navigation From First Principles

**Build:** Add three screens — Home, Lessons, Profile. A tab bar at the bottom switches between them.

**CS concepts taught:**

- The stack data structure: what a stack is (last in, first out), how navigation history is literally a stack — push a screen, pop a screen
- State machines: navigation is a finite state machine — a finite set of screens, defined transitions between them, only one active at a time. What a finite state machine is, why it is the correct model for navigation.
- Routing: what a route is (a mapping from a name or URL to a screen), why routes are declared rather than hardcoded

**SE concepts taught:**

- Separation of concerns: navigation logic lives in one place, screen content in another
- The declarative vs imperative distinction: you declare what screens exist and how they connect — you don't write code that manually swaps components
- Loose coupling: screens don't know about each other, they only know about the navigator

**React Navigation taught (define at use):**

- What React Navigation is, why it exists (Expo doesn't have built-in navigation)
- `Stack.Navigator` vs `Tab.Navigator`: what each is, when to use which
- `useNavigation` hook: what a hook is (a function that gives a component access to React features), what this specific hook returns
- Screen parameters: how to pass data from one screen to another, why you type them

**Visible result:** Three tabs. Tapping switches screens with animation. Works on web and phone.

---

### Lesson 06 — Running on Mobile and Desktop

**Build:** Run the exact same codebase on your phone via Expo Go, and wrap it in Electron so it opens as a desktop app.

**CS concepts taught:**

- Compilation targets: the same TypeScript source compiles to different output depending on the target (browser JS, React Native native modules, Electron main process). What a compilation target is.
- The renderer process model: Electron runs two processes — the main process (Node.js, accesses the filesystem) and the renderer process (a browser, runs your React app). What inter-process communication (IPC) is, why the two processes are separated (security).
- Abstraction layers: React Native is an abstraction over iOS UIKit and Android Views. Write once, the abstraction translates to native code. What an abstraction layer is, what it costs (performance), what it buys (portability).

**SE concepts taught:**

- Write once run anywhere (WORA): the principle, its limits, where it breaks down
- Platform abstraction: why React Native components (`View`, `Text`) map to different native elements on each platform
- The principle of least privilege (introduced): Electron's main process has full system access; the renderer should not. Why you minimize what each process can do.

**Tooling taught:**

- Expo Go: what it is, how it works (your phone connects to Expo's dev server over your local network), what QR scanning does
- Electron: what it is (Chromium + Node.js bundled as a desktop app), how to add it to an Expo project, what `main.js` and `preload.js` do
- The `electron-builder` tool: what it produces (a `.dmg`, `.exe`, `.AppImage`)

**Visible result:** The app runs identically in Chrome, on your phone, and as a standalone desktop window.

---

## Phase 2 — The Code Editor (Lessons 07–10)

### You add the core feature: a code editor where users type and edit code.

---

### Lesson 07 — Integrating a Complex Third-Party Library

**Build:** Drop Monaco Editor (the VS Code editor) into your Lessons screen.

**CS concepts taught:**

- What a text editor is computationally: a buffer (a data structure holding the text), a cursor (a position in the buffer), a renderer (draws the visible text)
- What syntax highlighting is: the editor tokenizes the code (same concept as a lexer) and assigns colors to token types
- Event-driven programming: the editor fires events (`onChange`, `onMount`) when things happen. What an event is, what an event handler is, what the event loop is.
- The event loop (introduced): JavaScript is single-threaded. The event loop processes one event at a time. Why this means long-running code blocks the UI.

**SE concepts taught:**

- Integration vs implementation: knowing when to use a library rather than build it yourself. The decision criteria: complexity, maintenance cost, time.
- The adapter pattern: wrapping Monaco in a `CodeEditor` component so the rest of your app doesn't depend on Monaco directly — if you swap Monaco for another editor, you change one file.
- API surface design: your `CodeEditor` component exposes only what callers need (`value`, `onChange`, `language`). Internal Monaco details are hidden.

**Library integration taught:**

- How to read library documentation
- What `@monaco-editor/react` is, what it wraps
- How to handle a library that only works in the browser (Monaco cannot run in Node.js — why, and how to handle it in a universal app)
- Lazy loading: what it is, why Monaco is large enough to warrant it, how `React.lazy()` and `Suspense` work

**Visible result:** A real code editor on screen. Syntax highlighting. Line numbers. Works like VS Code.

---

### Lesson 08 — State Management From First Principles

**Build:** Connect the editor to a lesson. Display a lesson prompt above the editor. Track what the user has typed.

**CS concepts taught:**

- State as the source of truth: the UI is a function of state. `UI = f(state)`. This is the fundamental React model.
- Derived state vs stored state: some values should be computed from other state, not stored separately. Why storing derived state causes inconsistency bugs.
- The prop drilling problem: when state needs to reach deeply nested components, passing it through every intermediate component becomes painful. What the problem looks like, why it happens.

**SE concepts taught:**

- The single source of truth principle: one place owns each piece of data. Every component that needs it reads from that place. No copies.
- Lifting state up: when two components need the same state, move it to their common ancestor. The pattern, why it works, its limits.
- Unidirectional data flow: data flows down (via props), events flow up (via callbacks). Why this makes bugs easier to trace than bidirectional binding.

**React taught:**

- `useReducer`: what a reducer is (a function that takes current state and an action, returns new state), why it is better than `useState` for complex state, the connection to the Redux pattern
- `useContext`: what the Context API is, how to create a context, how to consume it, when to use it vs prop drilling vs a state library
- `useEffect`: what a side effect is (anything that reaches outside React's render cycle — timers, API calls, subscriptions), how `useEffect` runs after render, the dependency array

**Visible result:** A lesson screen with a title, a description, a code editor pre-filled with starter code, and a character count that updates as you type.

---

### Lesson 09 — Running User Code Safely

**Build:** Add a Run button. User's code executes. Output appears in a panel below the editor.

**This is the most security-critical lesson in the curriculum.**

**CS concepts taught:**

- Execution environments: code needs an environment to run in — a JavaScript engine, a set of available APIs, a security sandbox. What "environment" means here.
- The sandbox: an isolated execution context where code runs with restricted access. What restrictions mean technically (no `window`, no `fetch`, no `localStorage`).
- The iframe as a sandbox: what an iframe is (an embedded browsing context), how `sandbox` attribute restricts it, what `allow-scripts` permits and what it still prevents
- Serialization: to send code to an iframe, you serialize it (convert to a string) and post it as a message. What serialization is, what `JSON.stringify` does and cannot do.
- The message passing model: the parent and iframe communicate via `postMessage`. What message passing is, why it is used instead of shared memory (isolation).

**Security concepts taught (required by contract):**

- **Code injection:** when user-provided code is executed by your application, the user can run anything — delete files, exfiltrate data, crash the process. This is not hypothetical.
- **The same-origin policy:** what it is (browsers prevent pages from different origins reading each other's data), why it matters for iframes, what `origin` means (scheme + domain + port).
- **What the `sandbox` attribute prevents:** no form submission, no top-level navigation, no access to parent's cookies or localStorage, no plugins. Each restriction explained.
- **What can still go wrong:** an infinite loop in user code freezes the iframe. Shown, explained, and handled with a timeout and iframe reload.
- **Why `eval()` is dangerous:** `eval(userCode)` runs in your app's full context. The iframe approach is used instead. The difference explained concretely.

**SE concepts taught:**

- Defence in depth: multiple layers of protection rather than one. Sandbox + timeout + origin check.
- Fail safe defaults: the default is denial. Permissions are granted explicitly, not assumed.

**Visible result:** Run button executes code. `console.log("hello")` appears in the output panel. An infinite loop is caught and reported after a timeout.

---

### Lesson 10 — Test-Driven Development From First Principles

**Build:** Write tests for your sandbox runner and your state reducer. No new visible feature — but this is the first lesson where you learn to verify your code.

**Wait — this lesson produces no new visible feature. How does it satisfy the agile rule?**

The contract requires visible, runnable output. Tests produce visible output: a test runner in your terminal showing green checkmarks and red failures. That is the visible output of this lesson. The student runs `npm test` and sees results. That counts.

**CS concepts taught:**

- What a test is: code that calls your code and asserts the output matches what you expect
- The assertion: a boolean check that throws if false. `expect(result).toBe(5)` — what `toBe` does, what happens when it fails
- Test isolation: each test must be independent. Why shared state between tests causes false positives and false negatives.
- Mocking: replacing a real dependency (an API call, the iframe) with a fake one that you control. What a mock is, why it is needed, what it tests.

**SE concepts taught:**

- Why tests exist: not to prove code works, but to define what "works" means and catch regressions (when a future change breaks something that used to work)
- TDD (test-driven development): write the test first, watch it fail, write the code that makes it pass. Why the failing test first matters.
- The testing pyramid: unit tests (fast, isolated, many) vs integration tests (slower, test multiple parts together) vs end-to-end tests (slowest, test the whole app). Where each belongs.
- Refactoring: changing code structure without changing behavior, with tests as the safety net

**Tooling taught:**

- Vitest: what it is, how it differs from Jest, why it is used with Expo/Vite projects
- `describe` / `it` / `expect`: what each does
- `npm test` and the watch mode: what it does, how to read failure output, how to read a stack trace in test output

**Visible result:** `npm test` runs and shows passing tests. Break one function deliberately — watch the test go red.

---

## Phase 3 — The Backend (Lessons 11–16)

### You build a server, a database, and an API. Lessons and user progress are stored and retrieved.

---

### Lesson 11 — Servers and HTTP From First Principles

**Build:** A Node.js + Express server with one route: `GET /api/health` returns `{ status: "ok" }`. Call it from your app.

**CS concepts taught:**

- The client-server model: two programs, one requests (client), one responds (server). What a request and response are.
- HTTP: a text protocol. A request has a method (GET, POST, PUT, DELETE), a path, headers, and optionally a body. A response has a status code, headers, and a body. What each part is.
- TCP/IP (introduced at the right level): HTTP runs over TCP. TCP guarantees delivery and order. IP routes packets. You don't need the full network stack — you need to know why `localhost:3000` works.
- Status codes: 200 (ok), 201 (created), 400 (bad request — your fault), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (server error — my fault). Not a list — an explanation of the categories.
- JSON: what it is (JavaScript Object Notation — a text format for structured data), what it can and cannot represent, why it is the standard for web APIs

**SE concepts taught:**

- Separation of concerns: the frontend and backend are separate programs that communicate over a defined interface (the API). Neither knows how the other works internally.
- API design: an API is a contract. What you expose is a promise to every caller. Changing it breaks them.
- The request/response cycle: stateless by design — each request carries everything the server needs. Why statelessness enables horizontal scaling.

**Tooling taught:**

- Express: what it is (a minimal Node.js framework for routing HTTP requests), what middleware is (a function that runs on every request), how `app.get('/path', handler)` works
- `cors`: what Cross-Origin Resource Sharing is, why your browser blocks requests from `localhost:8081` to `localhost:3000` by default, what the CORS headers do
- `nodemon`: what it does (restarts the server when files change), why you use it in development

**Visible result:** `curl localhost:3000/api/health` returns JSON. Your app fetches it and displays the status on screen.

---

### Lesson 12 — Databases and SQL From First Principles

**Build:** Create a PostgreSQL database. Create a `lessons` table. Seed it with three lessons. Fetch them from your API and display them in the app.

**CS concepts taught:**

- What a database is: persistent storage that outlives any single program run. The filesystem is also persistent storage — why a database instead?
- The relational model: data organized into tables (relations). Rows are records. Columns are attributes. A primary key uniquely identifies each row.
- SQL: a declarative language. You describe what you want, not how to get it. `SELECT * FROM lessons WHERE difficulty = 'beginner'` — what each clause does.
- Indexes: a data structure (typically a B-tree) that makes lookups fast. Without an index, finding one row requires scanning every row. With an index, it is O(log n). What a B-tree is at a conceptual level.
- ACID properties: Atomicity, Consistency, Isolation, Durability. What each means. Why they matter. What happens without them.

**SE concepts taught:**

- The repository pattern: your API route should not write raw SQL. A repository module wraps the database and exposes clean functions like `getLessons()` and `getLessonById(id)`. Why — if you switch databases, you change one file.
- Migrations: why you never edit a database schema by hand in production. A migration is a versioned, reversible change to the schema. The same principle as version control for code.
- Environment configuration: database credentials are never hardcoded. They live in `.env` files that are in `.gitignore`. Why — a hardcoded password in a git repository is a permanent security breach.

**Security taught:**

- **SQL injection:** the most common database attack. `SELECT * FROM users WHERE name = '${userInput}'` — if `userInput` is `'; DROP TABLE users; --`, the database executes it. Shown concretely with the attack input.
- **Parameterized queries:** `SELECT * FROM users WHERE name = $1` with `[userInput]` as a separate argument. The database driver treats `$1` as data, never as SQL. This is how SQL injection is prevented. Why this works at the protocol level.

**Tooling taught:**

- PostgreSQL: what it is, how to install it, how to connect with `psql`
- Prisma: what an ORM is (Object-Relational Mapper — translates between your TypeScript objects and SQL tables), what `prisma/schema.prisma` is, what `prisma migrate dev` does
- `.env` files and `dotenv`: what they are, how they work, why they are in `.gitignore`

**Visible result:** Three real lessons in a database, displayed in your app from a real API call.

---

### Lesson 13 — Data Modeling From First Principles

**Build:** Add `users` and `progress` tables. Model the relationship between a user and their lesson progress.

**CS concepts taught:**

- Relational data modeling: entities (things), attributes (properties of things), relationships (how things relate). Entity-relationship diagrams — what they communicate.
- Foreign keys: a column that references the primary key of another table. What referential integrity means (you cannot have a `progress` row for a `user_id` that doesn't exist).
- Join operations: `INNER JOIN`, `LEFT JOIN` — what they do geometrically (set intersection vs left set preservation), when to use each
- Normalization: why you don't store a user's name in the `progress` table. First, second, third normal form — at a practical level, not a theoretical one.
- Many-to-many relationships: a user can complete many lessons; a lesson can be completed by many users. How a junction table resolves this.

**SE concepts taught:**

- Data modeling is design: the schema is an architectural decision. Wrong models cause pain for the life of the project.
- The cost of schema changes: changing a table in production requires a migration, data transformation, and coordination. Why you think hard about the model before building on it.
- Separation of concerns in data: each table owns one concept. `users` does not store lesson content. `lessons` does not store user progress.

**Visible result:** Profile screen shows the user's completed lessons and percentage progress through the curriculum.

---

### Lesson 14 — Building a Real API

**Build:** Full CRUD API for lessons. `GET /lessons`, `GET /lessons/:id`, `POST /lessons`, `PUT /lessons/:id`, `DELETE /lessons/:id`.

**CS concepts taught:**

- REST (Representational State Transfer): an architectural style for APIs. Resources (nouns) + HTTP methods (verbs). Why `GET /lessons/5` is better design than `POST /getLessonById` with a body.
- Idempotency: a `GET` request can be repeated without side effects. A `POST` creates a new resource each time. A `PUT` applied twice produces the same result as applied once. Why this matters for network reliability.
- The request lifecycle: request arrives → middleware runs (logging, auth check, body parsing) → route handler runs → database query → response sent. Tracing one request through the whole stack.

**SE concepts taught:**

- Input validation: never trust data from the client. Every field in a `POST` body is validated before it touches the database. What happens without validation (corrupt data, crashes, security vulnerabilities).
- Error handling: what happens when the database is down? When a record doesn't exist? When validation fails? Each case returns the correct HTTP status code and a useful error message.
- The middleware chain: Express middleware is a pipeline. Each function either handles the request or passes it to the next function. The chain pattern — what it is, why it is composable.

**Security taught:**

- **Input validation as security:** an unvalidated `POST` body can contain unexpected fields that overwrite data they shouldn't. Show the attack, show the fix.
- **Rate limiting:** an API without rate limiting can be hammered with thousands of requests per second. What rate limiting is, how to add it with `express-rate-limit`.

**Visible result:** You can create, read, update, and delete lessons via API calls. Test every endpoint with a tool like Bruno or curl.

---

### Lesson 15 — Error Handling From First Principles

**Build:** Add proper error handling to your entire API. Every error returns structured JSON with a code and message. Add error boundaries in the frontend.

**CS concepts taught:**

- Exceptions vs error values: two strategies for handling failure. Exceptions (`throw` / `try-catch`) interrupt the call stack. Error values (returning `{ error: "..." }`) are explicit. The tradeoffs.
- The call stack and exceptions: when you `throw`, JavaScript unwinds the call stack looking for a `catch`. What "unwind" means. What happens if there is no `catch` (the process crashes or the promise rejects).
- Error propagation: an error that happens in a database query needs to reach the HTTP response. How it travels through the layers.

**SE concepts taught:**

- Fail fast: detect errors as early as possible, as close to their source as possible. An error caught in the database layer is easier to debug than one caught in the HTTP layer.
- Structured errors: every error has a type, a message, and enough context to debug it. Not just `Error: something went wrong`.
- The error boundary pattern in React: a component that catches errors in its subtree and shows a fallback UI instead of a blank screen.
- Logging: what a log is, why you log errors (a user sees a blank screen; you need to know why), what structured logging means (`{ level: "error", message: "...", timestamp: "..." }`).

**Visible result:** Break something deliberately. A structured error message appears in the app. Check the server logs. You can trace exactly what went wrong and where.

---

### Lesson 16 — Connecting Frontend to Backend (Fetching Data)

**Build:** Replace all hardcoded data in your app with real API calls. Loading states. Error states. Refresh on pull.

**CS concepts taught:**

- Asynchronous programming: some operations take time (network requests, file reads). Asynchronous code starts the operation and continues running rather than waiting. What the event loop does with async operations.
- Promises: the object that represents a future value. `.then()`, `.catch()`, `.finally()`. What the promise states are (pending, fulfilled, rejected).
- `async/await`: syntactic sugar over promises. `await` pauses the current function until the promise resolves — but does not block the event loop. Why this is better than nested `.then()` calls.
- Race conditions: two async operations start, and the second one completes first. What happens to your UI. How to prevent it with abort controllers.

**SE concepts taught:**

- Loading, error, and success states: every async operation has three outcomes. Every UI must handle all three. Not just the happy path.
- Optimistic updates: update the UI before the server confirms. Revert if the server fails. Why this feels faster. What can go wrong.
- Caching: why you don't fetch the same data on every render. What a stale-while-revalidate strategy is.

**Library taught:**

- TanStack Query (React Query): what it is, what problems it solves (caching, background refetch, loading/error states), what `useQuery` and `useMutation` do

**Visible result:** The whole app runs on real data. Pull to refresh on mobile. Skeleton loaders while data loads. Error messages when the server is down.

---

## Phase 4 — Authentication (Lessons 17–20)

### Users can sign up, log in, and have their own progress.

---

### Lesson 17 — Authentication From First Principles

**Build:** Sign up and log in with email and password. A logged-in user sees their name.

**CS concepts taught:**

- Hashing vs encryption: encryption is reversible; hashing is not. A password must be hashed, not encrypted — if your database is stolen, the attacker cannot recover passwords from hashes.
- What bcrypt does: slow hashing by design. Why slow is good for passwords (makes brute-force attacks take years instead of seconds). What a salt is (random data added before hashing so two identical passwords produce different hashes).
- Tokens and sessions: two ways to remember a logged-in user. A session stores state on the server; a cookie holds a session ID. A JWT stores state in the token itself; the server holds no state.
- JWT (JSON Web Token): a base64-encoded, signed JSON object. What the three parts are (header, payload, signature). What signing means. Why the server can verify a JWT without storing it.

**SE concepts taught:**

- Never store plaintext passwords — this is not a best practice, it is an absolute rule
- The trust boundary: your server trusts the database. It does not trust the client. Every request from the client is verified.
- Stateless authentication (JWT): why stateless auth enables horizontal scaling (any server can verify any token)

**Security taught:**

- **Password hashing with bcrypt:** shown and explained, not just referenced
- **JWT secret management:** the secret used to sign JWTs must never be in source code. In `.env`. Why — anyone who has the secret can forge tokens for any user.
- **Token expiry:** why tokens expire. What happens when a token expires. Refresh tokens.
- **HTTPS:** why auth over HTTP is insecure (tokens sent in plaintext, interceptable). What TLS does. Why you always use HTTPS in production.

**Visible result:** Sign up form. Log in form. Logged-in state persists across page reloads (token in `localStorage` — and why this has security implications, taught here).

---

### Lesson 18 — Authorization From First Principles

**Build:** Protect API routes. A user can only see their own progress. An admin can see everything.

**CS concepts taught:**

- Authentication vs authorization: authentication is "who are you?" Authorization is "what are you allowed to do?" These are separate problems with separate solutions.
- Role-based access control (RBAC): users have roles (user, admin). Roles have permissions. A permission check says "does this role allow this action on this resource?"
- Middleware as a guard: an auth middleware function checks the JWT before the route handler runs. The route handler never runs if auth fails. The pipeline pattern applied to security.

**SE concepts taught:**

- The principle of least privilege: give each user the minimum permissions they need. An ordinary user should not be able to access admin routes even if they construct the right URL.
- Defence in depth: authorization checked at the API layer and the database query layer. If one check is bypassed, the other catches it.

**Security taught:**

- **Insecure direct object reference (IDOR):** `GET /api/progress/42` — what prevents user A from accessing user B's progress record #42 by guessing the ID? Show the attack. Show the fix (check `userId` in the query).
- **The confused deputy problem:** your server acts on behalf of users. If it does not verify which user it is acting for, an attacker can make it act on their behalf for another user's data.

**Visible result:** Log in as two different users. Each sees only their own progress. Admin account sees all users.

---

### Lesson 19 — OAuth and "Login with Google"

**Build:** Add Google OAuth login. User clicks "Continue with Google," authenticates with Google, and is logged into your app.

**CS concepts taught:**

- OAuth 2.0: an authorization framework (not an authentication protocol, though it is used for both). The roles: resource owner (the user), client (your app), authorization server (Google), resource server (Google's API).
- The OAuth flow: redirect to Google → user grants permission → Google redirects back with a code → your server exchanges the code for tokens → you use the tokens to get user info. Each step explained.
- The state parameter: a random value your app generates and verifies after the redirect. Why — prevents CSRF attacks on the OAuth flow.
- PKCE (Proof Key for Code Exchange): how mobile apps do OAuth safely without a client secret.

**Security taught:**

- **Why you never implement OAuth yourself:** the flow has subtle security requirements. A library that has been audited and used in production at scale is better than a bespoke implementation.
- **The redirect URI validation:** Google only redirects to URLs you register in advance. Why — an attacker cannot steal the auth code by changing the redirect.
- **Storing OAuth tokens:** access tokens are short-lived. Refresh tokens are long-lived. Neither should be in `localStorage` on the frontend (vulnerable to XSS). HttpOnly cookies instead.

**Tooling taught:**

- Auth.js (NextAuth): what it is, what it handles for you, what you still need to configure
- Google Cloud Console: registering an OAuth application, getting client ID and secret, setting redirect URIs

**Visible result:** "Continue with Google" button. Clicking it takes you to Google's login page. Completing it logs you into your app with your Google profile picture and name.

---

### Lesson 20 — Sessions, Cookies, and Persistence

**Build:** Make auth persistent. User stays logged in after closing the browser tab. Implement "remember me."

**CS concepts taught:**

- Cookies: small pieces of data the browser stores and automatically sends with every request to the originating domain. What `Set-Cookie` does. What the cookie attributes mean.
- `HttpOnly`: the browser cannot read this cookie with JavaScript. Why this matters for XSS.
- `Secure`: the browser only sends this cookie over HTTPS. Why this matters for network interception.
- `SameSite`: controls when the browser sends the cookie on cross-site requests. `Strict`, `Lax`, `None` explained. The CSRF attack that `SameSite=Lax` prevents.
- Session storage: the server stores session data keyed by a session ID. The cookie holds only the session ID. What Redis is (an in-memory key-value store used for session storage at scale).

**Security taught:**

- **CSRF (Cross-Site Request Forgery):** an attacker's page makes a request to your API using the victim's cookies. The request appears legitimate because the cookies are automatically sent. Show the attack. Show how `SameSite=Lax` prevents it. Show how a CSRF token provides additional protection.
- **Session fixation:** an attacker sets a known session ID before login. After login, the server uses that session ID. The attacker is now logged in as the victim. Prevention: always regenerate the session ID on login.
- **Token storage tradeoffs:** `localStorage` (vulnerable to XSS but simple) vs `HttpOnly` cookies (not readable by JS, prevents XSS token theft, but requires CSRF protection). The actual tradeoff, not a simplistic rule.

**Visible result:** Log in with "remember me." Close the browser. Reopen. Still logged in. Inspect the cookies in browser DevTools and see exactly what is stored.

---

## Phase 5 — Real Features (Lessons 21–26)

### The app does something real: lessons, progress tracking, a code editor that validates submissions.

---

### Lesson 21 — The Lesson Engine

**Build:** A lesson has a prompt, starter code, expected output, and hints. The engine checks the user's code output against the expected output and marks the lesson complete.

**CS concepts taught:**

- String comparison: why `"hello\n" !== "hello"` — whitespace normalization in output comparison
- Diffing algorithms: how to show what is different between expected and actual output. What a diff is (the minimum set of changes to transform one string into another). The connection to git diff.
- Determinism: the expected output of a lesson must be deterministic. Why random numbers in expected output would break the checker.

**SE concepts taught:**

- The specification as code: the expected output is a precise, machine-checkable specification. This is what tests are — a precise specification.
- Separation of concerns: the lesson content (what to teach) is separate from the engine (how to check it). Adding a new lesson requires no changes to the engine.
- The data-driven approach: instead of writing code for each lesson, you define lessons as data and write one engine that handles all of them.

**Visible result:** Complete a lesson. The engine compares your output to the expected output. Green checkmark or diff showing what is wrong.

---

### Lesson 22 — Progress and Streaks

**Build:** Track daily progress. Show a streak counter (days in a row with activity). Persist to the database.

**CS concepts taught:**

- Date arithmetic: what a Unix timestamp is (seconds since 1 January 1970 UTC), why dates are stored as timestamps not strings, timezone arithmetic pitfalls
- The streak algorithm: compare today's date with the last activity date. If consecutive, increment. If not, reset. Edge cases: same day activity (don't increment), timezone midnight edge case.
- Caching invalidation: the streak needs to recalculate at midnight. What a cache is. Why stale caches cause bugs. How to invalidate on a schedule.

**SE concepts taught:**

- Edge case analysis: the streak algorithm has four cases (first ever activity, same day, consecutive day, broken streak). Identify them all before writing code.
- The business logic layer: streak calculation is a business rule. It lives in its own module, not in the route handler. Why — it can be tested without a database or an HTTP request.

**Visible result:** A streak counter on the profile screen. Use the app two days in a row and watch it increment.

---

### Lesson 23 — Search and Filtering

**Build:** Search lessons by title. Filter by difficulty. Sort by completion status.

**CS concepts taught:**

- Search algorithms: linear scan (O(n), simple), index lookup (O(log n), requires preparation). When each is appropriate.
- Full-text search: what it is (indexing individual words, not whole strings), how PostgreSQL's `tsvector` and `tsquery` work, why `LIKE '%query%'` is a full table scan
- Filtering as predicate composition: each filter is a boolean function. Combining filters is composing predicates with AND/OR. What a predicate is.
- Debouncing: a search input that fires an API request on every keystroke hammers the server. Debouncing delays the request until the user stops typing. What debouncing is algorithmically (a timer that resets on each event).

**SE concepts taught:**

- Query building: constructing SQL queries dynamically from user input. Why string concatenation is dangerous (SQL injection). How Prisma's query builder prevents it.
- Performance: a search over 10 lessons needs no optimization. A search over 10,000 needs an index. State what n is in the actual use case.

**Visible result:** Type in the search box. Results filter in real time. No results state is handled gracefully.

---

### Lesson 24 — File Upload and Storage

**Build:** Let users upload a profile picture. Store it. Display it.

**CS concepts taught:**

- Binary data: files are bytes, not text. What base64 encoding is (representing binary data as text using 64 printable characters), why it is used, what the size cost is (33% larger).
- Multipart form data: how the browser sends files to a server. What `Content-Type: multipart/form-data` means. How the server parses it.
- Object storage vs filesystem: why you don't store uploaded files on the server's filesystem (the server can be replaced, scaled, or crash). Object storage (S3-compatible) persists independently of any server.
- CDN (Content Delivery Network): what it is (geographically distributed servers that cache static files), why profile pictures are served from a CDN rather than your API server.

**Security taught:**

- **File upload vulnerabilities:** accepting any file type allows an attacker to upload a `.php` script and execute it on your server. Validate file type by MIME type and magic bytes, not just extension.
- **File size limits:** without a limit, an attacker uploads a 10GB file. Show how to set and enforce limits.
- **Stored XSS via SVG:** SVG files can contain JavaScript. A user uploads a malicious SVG; another user views it; the script runs. Why you only accept JPEG/PNG for profile pictures, or sanitize SVGs.

**Visible result:** Upload a profile picture. It appears in your profile. Reload the page — it persists.

---

### Lesson 25 — Real-Time Features with WebSockets

**Build:** Live cursor showing how many users are currently on a lesson. Notifications when a lesson is updated.

**CS concepts taught:**

- The limitations of HTTP polling: to check for updates, the client asks the server every N seconds. This is wasteful and introduces latency equal to the poll interval.
- WebSockets: a persistent, bidirectional connection between client and server. How the WebSocket handshake upgrades an HTTP connection. What frames are.
- The publish/subscribe pattern: a server broadcasts an event; all subscribed clients receive it. What pub/sub is, where it appears (Redis pub/sub, message queues, event buses).
- Concurrency: multiple WebSocket connections are handled concurrently. What concurrency means in a single-threaded Node.js context (the event loop handles many connections, not threads).

**SE concepts taught:**

- The right tool for the job: polling vs WebSockets vs Server-Sent Events. When each is appropriate. WebSockets are not always the answer.
- Connection management: clients disconnect. The server must handle disconnect events. Reconnection with exponential backoff — what it is and why random jitter is added.

**Visible result:** Open the app on two browser tabs. The lesson screen shows "2 users viewing this lesson." Close one tab — it drops to 1 in real time.

---

### Lesson 26 — Performance and Optimization

**Build:** Profile the app. Find the slowest operations. Fix them.

**CS concepts taught:**

- Time complexity in practice: a slow query is not slow because of its algorithm — it is slow because it scans 100,000 rows without an index. Add the index. It is now O(log n).
- The React rendering model: a component re-renders when its state or props change. A parent re-rendering causes all children to re-render. What unnecessary re-renders cost.
- Memoization: caching the result of a pure function so it is not recomputed if the inputs have not changed. `useMemo` and `useCallback` — what they do, when they help, when they add complexity without benefit.
- The 60fps budget: each frame must complete in 16.6ms. JavaScript that takes longer causes visible jank. What the browser rendering pipeline is (JavaScript → Style → Layout → Paint → Composite).

**SE concepts taught:**

- Measure before optimizing: premature optimization is the root of much complexity. Profile first. Fix what is actually slow.
- The profiler as a tool: Chrome DevTools Performance tab, React DevTools Profiler, `EXPLAIN ANALYZE` in PostgreSQL — each explained and used.
- The cost of abstraction: every library, every layer, every abstraction adds overhead. Know what you are paying.

**Visible result:** Before and after comparison. The app is measurably faster. You have the profiling data to prove it.

---

## Phase 6 — Mobile and Desktop (Lessons 27–31)

### The web app becomes a real mobile app and a real desktop app.

---

### Lesson 27 — React Native Deep Dive

**Build:** Make the mobile experience feel native — gesture-based dismissal, haptic feedback, native share sheet.

**CS concepts taught:**

- The React Native bridge (legacy) and JSI (new architecture): how JavaScript communicates with native iOS/Android code. What serialization costs. What the new architecture improves.
- Gesture recognition: a swipe is a sequence of touch events. What the gesture recognizer does (tracks touch start, move, end; calculates velocity and direction). Why gesture conflicts happen (scrolling vs swipe-to-dismiss).
- Haptic feedback: a hardware API. The phone's vibration motor fires a specific pattern. What the API exposes (impact, notification, selection).

**SE concepts taught:**

- Platform-specific code: some things cannot be abstracted. `Platform.OS === 'ios'` lets you branch. `Component.ios.tsx` and `Component.android.tsx` let you provide full platform-specific implementations. When each approach is appropriate.
- The adapter pattern again: native APIs are wrapped in JavaScript modules. The adapter translates between the JS interface your code calls and the native API it runs on.

**Visible result:** The app feels native on mobile. Swipe down to dismiss a modal. Tap a button, feel the haptic tap back.

---

### Lesson 28 — Push Notifications

**Build:** Send a push notification when a new lesson is published. Users who have the app installed receive it even when the app is closed.

**CS concepts taught:**

- The push notification architecture: your server sends a notification to Apple's APNs or Google's FCM. They deliver it to the device. You never communicate directly with the device.
- Device tokens: a unique identifier for a device + app combination. What they are, why they change (app reinstall, OS update), how to keep them current.
- Background execution: the OS wakes the app briefly to handle a notification. What background execution limits are (strict on iOS, more permissive on Android).

**Security taught:**

- **Notification spoofing:** anyone can claim to send notifications from your app if your server credentials leak. Store APNs/FCM credentials as environment variables, never in source code.
- **User permission:** you must request permission before sending notifications. What the permission model is, why users distrust apps that ask immediately.

**Tooling taught:**

- Expo Push Notification service: what it abstracts (APNs + FCM under one API), its limitations (not for high-volume production without direct APNs/FCM integration)
- EAS (Expo Application Services): what it does, why you need it for push notifications

**Visible result:** Publish a new lesson from the admin panel. Receive a push notification on your phone within seconds.

---

### Lesson 29 — Electron Deep Dive

**Build:** Add desktop-specific features — a native menu bar, keyboard shortcuts, system tray icon, offline capability.

**CS concepts taught:**

- The Electron process model revisited: main process vs renderer process. Inter-process communication (IPC) with `ipcMain` and `ipcRenderer`. Why the renderer cannot access Node.js APIs directly (security isolation).
- The preload script: a script that runs in the renderer context but has access to Node.js. It is the bridge between the two processes. What `contextBridge.exposeInMainWorld` does and why it is the safe way to expose APIs.
- Offline capability and service workers: the browser caches assets and API responses. A service worker intercepts network requests and can serve from cache when offline. What a service worker is, how its lifecycle works (install, activate, fetch).

**Security taught:**

- **The `nodeIntegration: false` default:** if enabled, any JavaScript in the renderer can call `require('fs')` and read or delete files. This is why it is disabled by default. An XSS vulnerability in a web app is serious; in Electron with `nodeIntegration: true`, it is catastrophic (full filesystem access).
- **Content Security Policy in Electron:** what a CSP is (a header that tells the browser which scripts, styles, and resources are allowed to load), why it prevents XSS, how to configure it.

**Visible result:** The desktop app has a native menu bar with keyboard shortcuts. Works offline. A system tray icon shows notification count.

---

### Lesson 30 — App Store Deployment

**Build:** Build a production iOS and Android app. Submit to TestFlight and the Google Play internal track.

**CS concepts taught:**

- Code signing: a cryptographic signature that proves the app came from you and has not been tampered with. What a certificate is (a public key signed by a trusted authority), what a provisioning profile is (a list of devices and capabilities the app is allowed to use).
- The build pipeline: source code → bundler (Metro) → native build tools (Xcode, Gradle) → signed binary → app store submission. Each step.
- App bundles vs APKs: what the difference is, why bundles are preferred (the app store delivers only the code needed for the specific device).

**Tooling taught:**

- EAS Build: what it does (builds your app on Expo's servers so you don't need Xcode on your machine)
- EAS Submit: automated submission to both app stores
- `app.json` fields for production: `bundleIdentifier`, `versionCode`, `buildNumber` — what each controls and why

**Visible result:** A TestFlight link you can send to anyone with an iPhone. They can install and use your app.

---

### Lesson 31 — Web Deployment

**Build:** Deploy the frontend to Vercel. Deploy the backend to Railway. Configure a custom domain. Set up HTTPS.

**CS concepts taught:**

- DNS (Domain Name System): what it is (a distributed database mapping domain names to IP addresses), what an A record is, what a CNAME is, why DNS changes propagate slowly (TTL — Time To Live)
- TLS/HTTPS: what TLS is (Transport Layer Security — encrypts traffic between client and server), how certificate authorities work, what Let's Encrypt is (a free certificate authority that automates certificate issuance)
- CDN and edge deployment: Vercel deploys your frontend to servers in 30+ cities. A user in Tokyo gets the app from a Tokyo server, not from a US one. What edge computing is.

**SE concepts taught:**

- The twelve-factor app: a methodology for building apps that are easy to deploy and scale. Environment config in environment variables, stateless processes, logs as event streams.
- CI/CD (Continuous Integration / Continuous Deployment): every push to `main` runs your tests. If they pass, the app deploys automatically. What the pipeline looks like, why it reduces deployment risk.
- Blue-green deployment: running two production environments, switching traffic from one to the other during deployment. Why it enables zero-downtime deploys.

**Tooling taught:**

- Vercel: what it does, how it connects to GitHub, what preview deployments are
- Railway: what it is, how to deploy a Node.js + PostgreSQL app, environment variable management
- GitHub Actions: what CI/CD pipeline configuration looks like, what a workflow file is

**Visible result:** Your app is live at `yourapp.com`. HTTPS. Real users can sign up and use it.

---

## Phase 7 — Advanced Computer Science (Lessons 32–37)

### The app is working. Now you understand what is happening underneath it.

---

### Lesson 32 — Algorithms and Data Structures in Your App

**Build:** Optimize the lesson search with a trie. Implement an LRU cache for API responses.

**CS concepts taught:**

- The trie (prefix tree): a tree data structure for storing strings where each node represents one character. Prefix search is O(k) where k is the query length, not O(n) over the dataset.
- LRU (Least Recently Used) cache: a cache that evicts the least recently accessed item when full. The data structure: a hash map for O(1) lookup + a doubly linked list for O(1) eviction. Why both structures are needed.
- Hash maps revisited: what a hash function is, what a collision is, how separate chaining and open addressing resolve collisions, why hash maps are O(1) average but O(n) worst case.
- Amortized analysis: a dynamic array doubles when full, copying all elements. A single insert is O(n). But over n inserts, the average is O(1). What amortized means.

**SE concepts taught:**

- Data structure selection: the right data structure depends on your access patterns. A trie is better for prefix search; a hash map is better for exact lookup. Know your access patterns before choosing.
- The tradeoff between time and space: the LRU cache uses memory to avoid computation. Explicit statement of the tradeoff.

**Visible result:** Search is noticeably faster. The LRU cache hit rate is visible in the server logs.

---

### Lesson 33 — Functional Programming Concepts

**Build:** Refactor the lesson filtering and transformation code using functional programming patterns.

**CS concepts taught:**

- Pure functions: a function is pure if it has no side effects and always returns the same output for the same input. Why pure functions are easier to test, reason about, and compose.
- Higher-order functions: functions that take functions as arguments or return functions. `map`, `filter`, `reduce` — what each does algorithmically, not just what methods to call.
- Function composition: `f(g(x))` — applying functions in sequence. What the pipe and compose patterns are. How they replace nested function calls.
- Immutability: instead of mutating an array, return a new array. Why immutability makes state changes explicit and traceable.
- Closures: a function that captures variables from its surrounding scope. What a closure is (a function + the environment it was created in), why they exist, where they cause memory leaks.

**SE concepts taught:**

- Declarative vs imperative: `lessons.filter(isComplete).map(toTitle)` declares what you want. A `for` loop with an `if` says how to do it. Why declarative code is easier to read and reason about.
- The transformation pipeline: data flows through a series of pure transformations. Each step is testable in isolation.

**Visible result:** The same behavior, cleaner code. The diff between the old and new implementation shows the reduction in complexity.

---

### Lesson 34 — Design Patterns in Your Codebase

**Build:** Identify and name five design patterns already in your code. Implement two new ones.

**CS concepts taught:**

- What a design pattern is: a reusable solution to a commonly occurring problem. Not a library, not an algorithm — a template for structure.
- Patterns identified in the existing codebase:
  - **Observer** (React state + useEffect watching state changes)
  - **Adapter** (the CodeEditor component wrapping Monaco)
  - **Repository** (the database access layer)
  - **Middleware chain** (Express middleware pipeline)
  - **Facade** (Auth.js hiding the complexity of OAuth)
- New patterns implemented:
  - **Strategy** (different code validation strategies for different lesson types — implement as swappable modules)
  - **Command** (each user action — complete lesson, reset progress — as a command object that can be logged, undone, and replayed)

**SE concepts taught:**

- Pattern recognition: seeing the pattern in code you already wrote. The pattern was there whether you named it or not.
- The vocabulary of design: being able to say "this is a strategy pattern" in a code review communicates in one word what would otherwise take a paragraph.
- Over-engineering: design patterns have costs (complexity, indirection). They are only justified when the problem they solve is present. Applied where not needed, they make code worse.

**Visible result:** A `patterns.md` document in the repository cataloguing the patterns in the codebase, with code references. This becomes part of your portfolio's documentation.

---

### Lesson 35 — Networking and the Internet

**Build:** Add a network status indicator. Handle offline gracefully. Show latency.

**CS concepts taught:**

- The TCP/IP stack at practical depth: IP addresses, ports, the three-way handshake (SYN, SYN-ACK, ACK), what latency is (round-trip time), what bandwidth is (throughput), why they are different.
- DNS resolution: your browser looks up `api.yourapp.com` → queries a recursive resolver → queries root nameservers → queries TLD nameserver → queries your authoritative nameserver → gets an IP address. Each step.
- HTTP/2 vs HTTP/1.1: HTTP/1.1 sends one request per connection. HTTP/2 multiplexes many requests over one connection. What head-of-line blocking is and why HTTP/2 solves it.
- The network as an unreliable medium: packets can be lost, reordered, or delayed. TCP handles this — but adds latency for the retransmission.

**SE concepts taught:**

- Defensive networking: assume the network will fail. Design for it. Every network call has a timeout, a retry strategy, and a fallback.
- Exponential backoff with jitter: when a request fails, wait before retrying. Wait longer each time. Add random jitter so all clients don't retry simultaneously (the thundering herd problem).

**Visible result:** Go offline. The app shows a banner and serves cached content. Come back online. The app syncs automatically.

---

### Lesson 36 — Memory Management and Performance

**Build:** Find and fix three memory leaks in the app. Reduce the JavaScript bundle size by 30%.

**CS concepts taught:**

- The heap and garbage collection: JavaScript allocates objects on the heap. The garbage collector reclaims memory when objects are no longer reachable. What "reachable" means (any path from a root object to the allocated object).
- Memory leaks: objects that remain reachable but are no longer needed. Common causes: forgotten event listeners, closures holding large objects, setInterval with no clearInterval.
- Reference counting vs mark-and-sweep: two garbage collection strategies. Why reference counting cannot collect circular references. How mark-and-sweep traces reachability.
- Tree shaking: dead code elimination. The bundler analyzes which exports are imported and removes the rest. What makes code tree-shakeable (ES module syntax, pure functions without side effects).

**SE concepts taught:**

- The memory profiler: Chrome DevTools Memory tab. How to take a heap snapshot, how to find detached DOM nodes, how to compare snapshots to find leaks.
- Bundle analysis: `webpack-bundle-analyzer` or the Expo equivalent. Every library has a size cost. Visualizing it makes the cost concrete.

**Visible result:** Memory usage in DevTools drops after fixing leaks. Bundle size before and after, measured and documented.

---

### Lesson 37 — Concurrency and the Event Loop

**Build:** Add a background task that generates lesson recommendations without blocking the UI. Implement a job queue.

**CS concepts taught:**

- The JavaScript event loop in full detail: the call stack, the microtask queue (Promises), the macrotask queue (setTimeout, setInterval, I/O). The order of execution. Why `Promise.resolve().then()` runs before `setTimeout(fn, 0)`.
- Web Workers: true parallelism in the browser. A Web Worker runs in a separate thread with its own call stack and event loop. How to communicate with it (message passing, same as the iframe model from Lesson 09).
- The job queue: a list of tasks to be processed. Producer adds tasks; worker takes and processes them. What backpressure is (the queue fills faster than the worker processes it).
- Race conditions: two concurrent operations both read a value, both modify it, both write it back. The second write clobbers the first. What a race condition is. How database transactions prevent it (locking).

**SE concepts taught:**

- Async as a first-class design concern: async is not something you add after the fact. It is a design decision made at the beginning.
- Idempotent jobs: a job that can be safely run twice produces the same result as running it once. Why idempotency is required for retryable jobs.

**Visible result:** Lesson recommendations update in the background while you use the app. The UI never freezes.

---

## Phase 8 — Professional Practice (Lessons 38–40)

### You learn how software is built on teams, how to maintain it, and how to present it.

---

### Lesson 38 — Code Review and Documentation

**Build:** Write a `README.md`, an `ARCHITECTURE.md`, and inline documentation for every public function.

**What this teaches:**

- **Code review:** what reviewers look for (correctness, clarity, security, conventions), how to review your own code before submitting, the question to ask: "would I understand this in six months?"
- **README structure:** what belongs in a README (what the project does, how to run it, how to deploy it, how to contribute). What does not belong (how it works internally — that is `ARCHITECTURE.md`).
- **Architecture documentation:** how to communicate system design in prose and diagrams. The C4 model (Context, Containers, Components, Code) — a standard for software architecture diagrams.
- **JSDoc / TSDoc:** how to document a function's parameters, return type, and behavior in a way that appears in editor tooltips.
- **The public/private distinction as documentation obligation:** public API functions must be documented. Private implementation details do not need to be.

**Visible result:** A repository that a stranger could clone, run, and contribute to without asking you any questions.

---

### Lesson 39 — Monitoring, Logging, and Observability

**Build:** Add structured logging. Set up error tracking (Sentry). Add uptime monitoring.

**CS concepts taught:**

- Structured logging: logs are not prose — they are data. `{ level: "error", message: "DB query failed", queryDuration: 1203, userId: "42", timestamp: "..." }` can be queried and aggregated. Unstructured logs cannot.
- Distributed tracing: a request passes through your frontend, your API, your database. A trace ID follows it through every layer. When something goes wrong, the trace shows exactly where.
- Percentile metrics: p50 (median), p95, p99 latency. Why the mean hides tail latency. A p99 of 2000ms means 1 in 100 users waits 2 seconds — even if the mean is 200ms.

**SE concepts taught:**

- Observability: you cannot fix what you cannot see. Logging, metrics, and tracing are not optional — they are how you know your production app is working.
- Alerting: when p99 latency exceeds a threshold, you want to know before users complain. What an alert is, what a runbook is (a document explaining how to respond to a specific alert).
- The cost of logging: logging everything is expensive (storage, processing). Log what you need to debug problems. Not everything.

**Visible result:** An error in production shows up in Sentry with the full stack trace, the user's ID, and the request that caused it. You can fix it without a user reporting it.

---

### Lesson 40 — Your Portfolio and What Comes Next

**Build:** Deploy a portfolio site that features this project. Record a demo video. Write a case study.

**What this teaches:**

- **The case study structure:** problem, approach, technical decisions, tradeoffs, what you would do differently. This is what interviewers read.
- **How to talk about technical work:** "I built auth" is meaningless. "I implemented JWT-based authentication with HttpOnly cookie storage and CSRF protection, then added OAuth with Google because 60% of beta users dropped off on the registration form" is a story.
- **The technical interview:** what interviewers are actually assessing (can you reason about tradeoffs? do you understand what your code does? can you communicate clearly?), how to answer "tell me about a technical challenge you faced."
- **What to study next:** based on what you have built, the natural next directions (distributed systems, compiler design, ML engineering, infrastructure) and what each requires.

**Visible result:** A live portfolio site. A 5-minute demo video. A case study document. These three things, for this one project, are enough to apply to junior and mid-level software engineering roles.

---

## CS Concept Index

Every concept taught across all lessons, for reference:

**Data Structures:** Array, Hash map, Linked list, Tree (DOM, AST, Trie), Stack, Queue, B-tree (index), Doubly linked list (LRU)

**Algorithms:** Linear search, Binary search (B-tree), Debounce, Diff algorithm, LRU eviction, Streak calculation, Tree traversal

**Computer Science Foundations:** Types and type systems, The call stack, The heap, Garbage collection, Memory management, The event loop, Concurrency, Parallelism (Web Workers), Recursion, Memoization, Closures, Higher-order functions, Pure functions, Immutability, State machines (navigation, OAuth flow)

**Systems:** Client-server model, HTTP protocol, TCP/IP, DNS, TLS/HTTPS, WebSockets, Push notifications, CDN, The browser rendering pipeline, The JavaScript engine, Compilation targets, The Electron process model, The React Native bridge

**Databases:** Relational model, SQL, Indexes, ACID, Joins, Normalization, Migrations, Transactions, Full-text search

**Security:** XSS, CSRF, SQL injection, IDOR, Code injection, Session fixation, Password hashing, JWT, OAuth 2.0, PKCE, Content Security Policy, File upload vulnerabilities, The principle of least privilege, Defence in depth

---

## SE Principle Index

Every software engineering principle taught across all lessons:

Separation of concerns · Single responsibility principle · Open/closed principle · Dependency inversion · Encapsulation · Composition over inheritance · Single source of truth · Unidirectional data flow · Declarative vs imperative · Fail fast · Fail safe defaults · Defence in depth · Principle of least privilege · The adapter pattern · The repository pattern · The strategy pattern · The command pattern · The observer pattern · The middleware chain · The facade pattern · The factory pattern · API design as a contract · Version control as professional practice · Test-driven development · The testing pyramid · Code review practice · Documentation as a first-class artifact · Measure before optimizing · The twelve-factor app · CI/CD · Observability

---

## What you can do when this is done

- Build any web, mobile, or desktop app — you have done all of it
- Explain how authentication works at every level of the stack
- Explain how a database processes a query
- Explain why your UI re-renders and how to prevent unnecessary re-renders
- Debug any error — you know which tool reveals which class of error
- Write code that another developer can read, test, and maintain
- Talk about your work in technical interviews with precision and depth
- Apply for junior and mid-level software engineering roles with a portfolio piece that demonstrates full-stack, cross-platform, production-grade engineering

The app you built is the proof. The concepts you learned are the understanding behind it.
