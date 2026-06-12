# Lesson 15 — Error Handling From First Principles

## What You Will Build

Add proper error handling to the entire API. Every error returns structured JSON with
a `code` and `message`. Add error boundaries in the React app. Break something
deliberately — a structured error message appears in the app, the server logs show
exactly what went wrong, and you can trace it from screen to log to database.

---

## What You Need to Know First

- Lesson 11: Express, middleware, the request lifecycle
- Lesson 14: The full CRUD API, route handlers

---

## The Lesson

### Step 1 — Exceptions vs Error Values

Two fundamental strategies for handling failure:

**Exceptions** (`throw` / `try-catch`):
```typescript
function divide(numerator: number, denominator: number): number {
  if (denominator === 0) throw new Error('Division by zero')
  return numerator / denominator
}

try {
  const result = divide(10, 0)
} catch (error) {
  console.error('Failed:', error.message)
}
```

**Error values** (returning the error as data):
```typescript
function divide(numerator: number, denominator: number): { value: number } | { error: string } {
  if (denominator === 0) return { error: 'Division by zero' }
  return { value: numerator / denominator }
}

const result = divide(10, 0)
if ('error' in result) {
  console.error('Failed:', result.error)
} else {
  console.log(result.value)
}
```

**The call stack and exceptions:** When you `throw`, JavaScript **unwinds the call stack**
— it exits each function in the call stack until it finds a `try-catch` block or reaches
the top. "Unwind" means: the current stack frame is removed, the previous frame is
restored, looking for a catch block; the previous frame is removed, the one before it
is restored; and so on, until a catch is found.

If no `catch` is found:
- In Node.js: the process crashes with an unhandled exception error
- In a Promise: the Promise rejects; if `.catch()` is missing, it becomes an unhandled
  rejection warning
- In an `async` function: the returned Promise rejects

**Which strategy to use:**
- Use exceptions for unexpected failures (the database is down, a library throws, a
  programming error)
- Use error values for expected failures that callers must handle (not found, validation
  failed, unauthenticated)
- The lesson completion check returns `null` for "not found" — that is an error value
- `prisma.lesson.findUnique` throws if the database is unreachable — that is an exception

**SE lens — fail fast:** Detect errors as early as possible, as close to their source
as possible. An error from the database that reaches the HTTP response without being
caught is harder to debug than one caught at the database call site.

### Step 2 — Structured Errors

**Unstructured error:** `Error: something went wrong`

The developer cannot query logs for this error. Every error that is "something went wrong"
looks identical in logs.

**Structured error:**
```typescript
interface AppError {
  readonly code: string       // machine-readable: 'LESSON_NOT_FOUND', 'VALIDATION_FAILED'
  readonly message: string    // human-readable: 'No lesson with id 42 exists'
  readonly statusCode: number // HTTP status to send
}
```

With a structured error, you can:
- Query logs for all `LESSON_NOT_FOUND` errors in the last hour
- Alert when `DATABASE_CONNECTION_FAILED` rate exceeds a threshold
- Tell the client exactly what went wrong without revealing internals

Create `server/src/errors.ts`:

```typescript
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const Errors = {
  notFound: (resource: string) =>
    new AppError('NOT_FOUND', `${resource} not found`, 404),

  validationFailed: (details: unknown) =>
    new AppError('VALIDATION_FAILED', 'Request validation failed', 400),

  unauthorized: () =>
    new AppError('UNAUTHORIZED', 'Authentication required', 401),

  forbidden: () =>
    new AppError('FORBIDDEN', 'Not permitted', 403),

  internal: (message: string) =>
    new AppError('INTERNAL_ERROR', message, 500),
} as const
```

**`class AppError extends Error`:**
`class` is a TypeScript/JavaScript syntax for defining an object blueprint with methods
and a constructor. `extends Error` makes `AppError` a subclass of the built-in `Error`
class — it inherits `.message`, `.name`, and `.stack`. `public readonly code` in the
constructor is TypeScript shorthand for: declare a `code` property, accept it as a
constructor argument, assign it automatically.

**Why extend `Error`?** Extending `Error` means `instanceof AppError` and `instanceof Error`
are both true. The global error handler (below) can check `error instanceof AppError` to
identify structured errors vs unexpected crashes.

### Step 3 — The Global Error Handler

Express has a special error-handling middleware with four parameters: `(error, req, res, next)`.
Any middleware or route handler that calls `next(error)` or throws (in an async context)
reaches this handler.

```typescript
import type { Request, Response, NextFunction } from 'express'
import { AppError } from './errors'

export function globalErrorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    return next(error)
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    })
    return
  }

  // Unexpected error — log it, send a generic message
  console.error('Unhandled error:', {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    path: req.path,
    method: req.method,
  })

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  })
}
```

**Why `if (res.headersSent) return next(error)`:**
If the response headers have already been sent (the route handler sent a partial response
before failing), calling `res.status(...).json(...)` would throw a "Can't set headers after
they are sent" error. Passing to `next` allows Express to handle it gracefully.

**`console.error` with structured data:**
Logging `{ message, stack, path, method }` as a structured object makes this log queryable.
A log aggregation service (Sentry, Datadog, Splunk) can extract `message` as a field and
alert on error patterns.

**Register the handler in `index.ts`:**
```typescript
// AFTER all routes — Express identifies error handlers by their four parameters
app.use(globalErrorHandler)
```

**Update route handlers to use `AppError`:**
```typescript
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params['id'] ?? '', 10)
    if (isNaN(id)) throw Errors.notFound('lesson')

    const lesson = await getLessonById(id)
    if (lesson === null) throw Errors.notFound('Lesson')

    res.json(lesson)
  } catch (error) {
    next(error)  // pass to globalErrorHandler
  }
})
```

`next(error)` passes the error to Express's error handling pipeline. The global error
handler receives it, identifies the type, and sends the appropriate response.

### Step 4 — Async Error Propagation

In `async` route handlers, uncaught `await` rejections do not reach `next(error)` without
explicit handling in older Express versions. The solution: wrap async handlers:

```typescript
function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
```

`Promise.resolve(fn(...)).catch(next)` — if the async function throws, `.catch(next)` passes
the error to `next`, which reaches the global error handler. Express 5 (in preview) handles
this automatically. With Express 4, wrap every async handler with `asyncHandler`.

### Step 5 — Error Boundaries in React

In React, if a component throws during rendering, the error propagates up the component
tree until it is caught. Without an error boundary, the entire app unmounts and shows
a blank screen.

An **error boundary** is a class component (not a function component — class components
are required here because only they can implement `componentDidCatch`) that catches errors
in its subtree and shows a fallback UI.

Create `src/components/ErrorBoundary.tsx`:

```typescript
import { Component, type ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors, spacing, typography } from '../theme'

interface ErrorBoundaryProps {
  readonly children: ReactNode
  readonly fallback?: ReactNode
}

interface ErrorBoundaryState {
  readonly hasError: boolean
  readonly errorMessage: string
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error: unknown): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : 'Something went wrong',
    }
  }

  componentDidCatch(error: unknown, info: { componentStack: string }) {
    console.error('React error boundary caught:', error, info.componentStack)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <View style={styles.container}>
          <Text style={styles.heading}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.errorMessage}</Text>
        </View>
      )
    }
    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  heading: { fontSize: typography.sizeLg, fontWeight: typography.weightBold, color: colors.error, marginBottom: spacing.sm },
  message: { fontSize: typography.sizeMd, color: colors.textSecondary, textAlign: 'center' },
})
```

**`class` components vs function components:** React class components predate hooks.
They are required for error boundaries because `componentDidCatch` is a class lifecycle
method with no hook equivalent. In all other cases, prefer function components with hooks.

**`static getDerivedStateFromError`:** A static method that React calls when a child
component throws. It returns the new state — setting `hasError: true` makes the
`render` method show the fallback UI.

**`componentDidCatch`:** Called with the error and component stack information. This is
the right place to log the error to a monitoring service (Lesson 39).

**Wrap the app in error boundaries:**
```typescript
<ErrorBoundary>
  <LessonProvider>
    <TabNavigator />
  </LessonProvider>
</ErrorBoundary>
```

### Step 6 — Structured Logging

**What logging is:** A record of what happened in a running system. Without logs, when
a user reports "the app crashed," you have no way to know what caused it.

**Structured vs unstructured logging:**
```typescript
// Unstructured: hard to parse and query
console.log('User 42 completed lesson 5 at 2024-01-15')

// Structured: queryable
console.log(JSON.stringify({
  level: 'info',
  event: 'lesson_completed',
  userId: 42,
  lessonId: 5,
  timestamp: new Date().toISOString(),
}))
```

Structured logs can be sent to a log aggregation service and queried:
"Show all `lesson_completed` events for user 42 in the last hour."

---

## Connect the Pieces

The global error handler introduced here is the **facade pattern**: a single entry point
for all error handling. Every route handler passes errors to `next(error)`; the facade
decides what response to send. This is the same role that `LessonProvider` plays for
state: a single place where all state lives, so every component reads from one source.

In Lesson 39 (monitoring), the `console.error` calls in the error handler and the error
boundary will be replaced with Sentry calls — production error tracking that captures
the full context (user ID, request, stack trace) and alerts you before users report.

The `AppError` with a `statusCode` is identical in concept to HTTP status codes: a machine-readable
code (for logging and routing decisions) paired with a human-readable message (for displaying
to users or developers). This separation is the same principle as the CS lens / SE lens
separation in this curriculum.

---

## What Breaks Without This

Without the global error handler, an unhandled `async` rejection in a route handler
silently returns a hung request or a generic "Internal Server Error" HTML page from
Express's default handler. The client receives HTML when it expects JSON, and trying
to `JSON.parse` the response throws. The app shows a blank screen with no indication
of what went wrong.

Without error boundaries, a render error in `LessonsScreen` unmounts the entire app.
The tab bar disappears. The user sees a blank white screen. Reloading is the only option.
With an error boundary wrapping each screen, only the broken screen shows a fallback —
the rest of the app continues to work.

---

## Definition of Done

- [ ] All route handlers pass errors to `next(error)` rather than handling them locally
- [ ] The global error handler returns `{ error: { code, message } }` JSON for all errors
- [ ] Requesting `/api/lessons/999` returns `404 { "error": { "code": "NOT_FOUND", "message": "Lesson not found" } }`
- [ ] A database error returns `500` with `"INTERNAL_ERROR"` code (not the database error message)
- [ ] The React app has an `ErrorBoundary` wrapping the tab navigator
- [ ] Breaking a component deliberately shows the error boundary fallback, not a blank screen
- [ ] You can answer: what is exception unwinding and what happens when no catch is found?
- [ ] You can answer: why does `console.error({ level, event, userId })` beat `console.error("User did something")`?
- [ ] You can answer: what is the difference between an `AppError` and an unexpected error?
- [ ] `git commit` with a message explaining why — "Add global error handler, structured errors, and React error boundaries"
