# Part 1: Building a Real Express Backend
## A Software Engineering Masterclass — From Scripts to Architecture

> **What we're building**: A Todo API with Express + TypeScript.  
> **Why todos?** The domain is trivial. That means every pattern we add exists purely to solve an *engineering* problem — not a business one. You'll see the reason for each decision clearly.

---

## The Problem With "Scripted" Code

Before we write anything, let's understand what we're escaping from. Here's how a beginner writes a server:

```typescript
// ❌ THE SCRIPTED WAY — everything in one place
import express from 'express'
import fs from 'fs'

const app = express()
app.use(express.json())

app.get('/todos', (req, res) => {
  // Reading from a file directly in the route handler
  const data = fs.readFileSync('todos.json', 'utf-8')
  const todos = JSON.parse(data)
  res.json(todos)
})

app.post('/todos', (req, res) => {
  const data = fs.readFileSync('todos.json', 'utf-8')
  const todos = JSON.parse(data)
  // Validation mixed with storage mixed with response
  if (!req.body.title) {
    return res.status(400).json({ error: 'Title required' })
  }
  const newTodo = { id: Date.now(), title: req.body.title, done: false }
  todos.push(newTodo)
  fs.writeFileSync('todos.json', JSON.stringify(todos))
  res.json(newTodo)
})

app.listen(3000)
```

**What's wrong with this?** Nothing, if you never need to:
- Swap the file for a real database
- Test the validation logic without starting the server
- Reuse the "create todo" logic anywhere else
- Have another developer read it in 6 months

Every problem above has the same root cause: **this code does too many things in one place.** The route handler knows about HTTP requests, validation rules, *and* how data is stored. These are three separate concerns tangled together.

This is called **tight coupling**. It's the #1 thing that separates scripts from software.

---

## The Architecture We're Building

```
src/
  types/
    todo.ts          ← What a Todo IS (shared contracts)
  repositories/
    todoRepository.ts ← How todos are STORED (the only file that touches data)
  services/
    todoService.ts   ← Business rules (what is ALLOWED)
  routes/
    todoRoutes.ts    ← HTTP concerns only (what URL maps to what)
  app.ts             ← Assembly (wiring everything together)
  server.ts          ← Entry point (starting the engine)
```

Each folder answers a different question. If you know what question you need to answer, you know where to look. This is called **separation of concerns**.

---

## Step 1: Define Your Contracts First

**Pattern: Interface-First Design**

Before writing any logic, define the *shape* of your data. In TypeScript, this is an `interface`. Think of it as a contract: anyone who handles a Todo must respect this shape.

```typescript
// src/types/todo.ts

// An interface is a pure description. No logic. No code. Just shape.
// This file answers: "What IS a Todo in this system?"
export interface Todo {
  id: string       // We use string, not number — UUIDs are better for databases
  title: string
  completed: boolean
  createdAt: Date
}

// A separate type for creation — notice: no id, no createdAt.
// The USER provides these fields. The SYSTEM provides the rest.
// This distinction matters. Never let the client set an ID.
export interface CreateTodoInput {
  title: string
}

// For updates, every field is optional — the user may only want to change one thing.
// The `Partial<>` utility type does this automatically.
export type UpdateTodoInput = Partial<Pick<Todo, 'title' | 'completed'>>
//                                         ↑
//                    Pick selects ONLY these fields from Todo.
//                    Partial makes them all optional.
//                    Together: { title?: string, completed?: boolean }
```

**Why this matters**: Every other file in the system imports from `types/todo.ts`. If you change what a Todo is, TypeScript will show you *every single place* that breaks. Without this, you'd discover breaks at runtime — on your users' screens.

---

## Step 2: The Repository Pattern

**Pattern: Repository**

The repository is the *only* place in your codebase that knows where data lives. Routes don't know. Services don't know. Only the repository knows.

**Why?** Imagine you start with a JSON file, then switch to PostgreSQL, then to MongoDB. With the repository pattern, you change *one file*. Without it, you hunt through every route handler.

```typescript
// src/repositories/todoRepository.ts
import { v4 as uuidv4 } from 'uuid'  // npm install uuid @types/uuid
import { Todo, CreateTodoInput, UpdateTodoInput } from '../types/todo'

// We store todos in memory for now. This is the ONLY line you'd change
// to swap in a real database. Everything else stays the same.
const store = new Map<string, Todo>()
//            ↑
// Map is better than an array for lookups by ID.
// map.get('abc') is O(1). Finding in an array is O(n).

// Notice: these are plain functions, not a class.
// We'll discuss classes vs modules later. For now, a module with
// exported functions is simpler and perfectly valid.

export function findAll(): Todo[] {
  // Map.values() gives us an iterator. Array.from converts it to an array.
  return Array.from(store.values())
}

export function findById(id: string): Todo | undefined {
  // Returns undefined if not found — NOT null, NOT an error.
  // The service layer decides what "not found" means to the business.
  return store.get(id)
}

export function create(input: CreateTodoInput): Todo {
  const todo: Todo = {
    id: uuidv4(),           // The repository assigns the ID — not the caller
    title: input.title,
    completed: false,       // New todos are never completed
    createdAt: new Date()   // The repository knows when things are stored
  }
  store.set(todo.id, todo)
  return todo
}

export function update(id: string, input: UpdateTodoInput): Todo | undefined {
  const existing = store.get(id)
  if (!existing) return undefined  // Return undefined, don't throw — let the caller decide

  // Spread operator: copy all fields of existing, then overwrite with input fields.
  // This is immutable-style update — we create a NEW object, not mutate the old one.
  const updated: Todo = { ...existing, ...input }
  store.set(id, updated)
  return updated
}

export function remove(id: string): boolean {
  // Returns true if deleted, false if it didn't exist.
  // Booleans for existence-checks are clean.
  return store.delete(id)
}
```

**The key insight**: This file has zero knowledge of HTTP. No `req`, no `res`, no status codes. It only speaks the language of Todos. This is called a **pure data layer**.

---

## Step 3: The Service Layer

**Pattern: Service Layer (Business Logic)**

The service layer sits between routes and the repository. It answers: *"Given what we know about this domain, is this operation allowed?"*

This is where business rules live. Some examples:
- "You can't create a todo with an empty title"
- "You can't complete a todo that's already completed"
- "Users can only see their own todos"

```typescript
// src/services/todoService.ts
import * as todoRepository from '../repositories/todoRepository'
import { Todo, CreateTodoInput, UpdateTodoInput } from '../types/todo'

// We define our own error types. This lets the route handler know
// WHY something failed — not just that it failed.
export class NotFoundError extends Error {
  constructor(id: string) {
    super(`Todo with id "${id}" not found`)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// The service functions call the repository. They add the "is this allowed?" layer.

export function getAllTodos(): Todo[] {
  // No business rules here — just delegate.
  // Simple cases are fine to be thin.
  return todoRepository.findAll()
}

export function getTodoById(id: string): Todo {
  const todo = todoRepository.findById(id)
  // The repository returns undefined. The service turns it into a meaningful error.
  if (!todo) throw new NotFoundError(id)
  return todo
}

export function createTodo(input: CreateTodoInput): Todo {
  // Business rule: title must not be empty or just whitespace
  const trimmed = input.title.trim()
  if (!trimmed) {
    throw new ValidationError('Title cannot be empty')
  }
  // We pass the cleaned input to the repository — not the raw user input.
  // Never trust user input. Always sanitize before storing.
  return todoRepository.create({ title: trimmed })
}

export function updateTodo(id: string, input: UpdateTodoInput): Todo {
  // Business rule: if a title is being updated, it can't be empty
  if (input.title !== undefined && !input.title.trim()) {
    throw new ValidationError('Title cannot be empty')
  }
  const updated = todoRepository.update(id, input)
  if (!updated) throw new NotFoundError(id)
  return updated
}

export function deleteTodo(id: string): void {
  const deleted = todoRepository.remove(id)
  if (!deleted) throw new NotFoundError(id)
  // Returns void — the caller just needs to know it succeeded.
}
```

**The key insight**: The service throws *typed errors* (`NotFoundError`, `ValidationError`). The route handler catches them and maps them to HTTP status codes. That mapping is an HTTP concern — it belongs in the routes, not here.

---

## Step 4: The Routes

**Pattern: Thin Controllers**

Routes are "thin" — they do almost no work themselves. Their job is:
1. Parse the HTTP request
2. Call the service
3. Handle errors → HTTP status codes
4. Return the HTTP response

```typescript
// src/routes/todoRoutes.ts
import { Router, Request, Response } from 'express'
import * as todoService from '../services/todoService'

// Router is a mini-Express app. We define routes on it, then
// mount it in app.ts. This lets us namespace routes easily: /api/todos
const router = Router()

// ─── Helper: Error Handler ──────────────────────────────────────
// This is the key pattern: one function translates service errors to HTTP.
// We write it ONCE. All route handlers use it.
// This is the DRY principle: Don't Repeat Yourself.
function handleError(err: unknown, res: Response): void {
  if (err instanceof todoService.ValidationError) {
    res.status(400).json({ error: err.message })
    return
  }
  if (err instanceof todoService.NotFoundError) {
    res.status(404).json({ error: err.message })
    return
  }
  // Unknown errors — log them (don't expose internals to the client)
  console.error('Unexpected error:', err)
  res.status(500).json({ error: 'Internal server error' })
}

// ─── GET /todos ─────────────────────────────────────────────────
router.get('/', (_req: Request, res: Response) => {
  // No try/catch needed — getAllTodos can't fail
  const todos = todoService.getAllTodos()
  res.json(todos)
})

// ─── GET /todos/:id ──────────────────────────────────────────────
router.get('/:id', (req: Request, res: Response) => {
  try {
    const todo = todoService.getTodoById(req.params.id)
    res.json(todo)
  } catch (err) {
    handleError(err, res)
  }
})

// ─── POST /todos ─────────────────────────────────────────────────
router.post('/', (req: Request, res: Response) => {
  try {
    const todo = todoService.createTodo(req.body)
    // 201 Created — not 200 OK. There's a semantic difference.
    // 200 = "here is what you asked for"
    // 201 = "I created something new for you"
    res.status(201).json(todo)
  } catch (err) {
    handleError(err, res)
  }
})

// ─── PATCH /todos/:id ────────────────────────────────────────────
// PATCH = partial update. PUT = replace the whole thing.
// Use PATCH when the client only sends the fields they want to change.
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const todo = todoService.updateTodo(req.params.id, req.body)
    res.json(todo)
  } catch (err) {
    handleError(err, res)
  }
})

// ─── DELETE /todos/:id ───────────────────────────────────────────
router.delete('/:id', (req: Request, res: Response) => {
  try {
    todoService.deleteTodo(req.params.id)
    // 204 No Content — success, but nothing to return.
    // Never send a body with 204.
    res.status(204).send()
  } catch (err) {
    handleError(err, res)
  }
})

export default router
```

---

## Step 5: Wiring It Together

**Pattern: Composition Root**

The `app.ts` file is the **composition root** — the one place where you assemble all the pieces. Nothing is wired together anywhere else. If you want to know how the system connects, you look here.

```typescript
// src/app.ts
import express, { Application } from 'express'
import cors from 'cors'                // npm install cors @types/cors
import todoRoutes from './routes/todoRoutes'

// We export `app` separately from starting the server.
// WHY? So tests can import `app` without binding to a port.
// This is a critical pattern for testable code.
export function createApp(): Application {
  const app = express()

  // ─── Middleware ──────────────────────────────────────────────
  // Middleware runs BEFORE your route handlers.
  // Think of it as a pipeline: Request → middleware1 → middleware2 → route handler

  app.use(express.json())  // Parse JSON bodies. Without this, req.body is undefined.
  app.use(cors())          // Allow requests from your React frontend (different port)

  // ─── Routes ──────────────────────────────────────────────────
  // We "mount" the router at /api/todos.
  // Every route defined in todoRoutes.ts is now prefixed with /api/todos.
  // GET /  in todoRoutes.ts  →  becomes  GET /api/todos
  // GET /:id in todoRoutes.ts →  becomes  GET /api/todos/:id
  app.use('/api/todos', todoRoutes)

  // ─── 404 Handler ─────────────────────────────────────────────
  // Any request that reaches here didn't match any route.
  // The order matters: this must come AFTER all routes.
  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' })
  })

  return app
}
```

```typescript
// src/server.ts — The entry point. Starts the engine.
import { createApp } from './app'

const PORT = process.env.PORT || 3001
// Environment variables for config — never hardcode ports or secrets.

const app = createApp()
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
```

---

## Step 6: Package Setup

```json
// package.json
{
  "name": "todo-api",
  "scripts": {
    "dev": "ts-node-dev --respawn src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/uuid": "^9.0.7",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.0.0"
  }
}
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,           // ← Turn this on. It forces you to handle undefined/null.
    "esModuleInterop": true
  }
}
```

---

## Patterns Recap: What You Just Learned

| Pattern | File | The Problem It Solves |
|---|---|---|
| **Interface-first** | `types/todo.ts` | Every team member agrees on data shape. TypeScript enforces it. |
| **Repository** | `repositories/todoRepository.ts` | Swap the database without touching routes or services. |
| **Service Layer** | `services/todoService.ts` | Business rules in one place. Not scattered across routes. |
| **Thin Controllers** | `routes/todoRoutes.ts` | Routes don't make decisions. They delegate and respond. |
| **Typed Errors** | `services/todoService.ts` | Callers know *why* something failed. Map to HTTP in one place. |
| **Composition Root** | `app.ts` | Wiring lives in one file. Easy to understand the whole system. |
| **Export app separately** | `app.ts` vs `server.ts` | Tests can import app without starting the server. |

---

## The "Drift" Problem, Explained

You mentioned getting "drift" when building along. Here's why it happens and how to fight it:

**Drift happens when:** An agent generates code that works, but you don't understand *why* a piece is where it is. Later, when you try to add something, you put it in the wrong place because the mental model never formed.

**The fix:** Before writing any code in a file, ask: *"What question does this file answer?"*

- `types/todo.ts` → "What IS a Todo?"
- `repositories/` → "Where and how is it STORED?"  
- `services/` → "What are we ALLOWED to do with it?"
- `routes/` → "How does HTTP map to those operations?"
- `app.ts` → "How do all the pieces CONNECT?"

If you're ever unsure where code belongs, trace the question it answers back to one of these. If it doesn't fit cleanly — that's often a signal you need a new layer.

---

## What's Next in Part 2

In Part 2, we'll build the **React frontend** with the same discipline:

- `types/` — same contracts, shared with backend in a real monorepo
- `api/` — one file that handles all HTTP calls (your frontend's "repository")
- `hooks/` — custom hooks as your frontend's "service layer"
- `components/` — purely visual, receive props, fire callbacks, know nothing about data

You'll see the exact same separation of concerns, just in a different context. Once the pattern is in your head, you'll see it everywhere.