---
series: go-fundamentals
level: 2
title: Error Handling and Packages
lang: javascript
---

# Error Handling and Packages

Go has no exceptions. Functions that can fail return an error as their last return value — the caller is forced to decide what to do with it. This is not a limitation; it is a design: **explicit is better than implicit**. Every call site where an error is possible is a visible decision point in the code. Go packages are also designed for clarity: uppercase names are exported (part of the public API), lowercase names are unexported (internal). By the end of this lesson you will understand how Go's error model works, how to wrap errors to preserve context, and how Go's visibility rules create clean module boundaries.

## Errors Are Values

In Go, the `error` type is an interface with one method: `Error() string`. Any type that has an `Error() string` method is an `error`.

```javascript
// In real Go:
//   type error interface { Error() string }
//   func divide(a, b float64) (float64, error) {
//     if b == 0 { return 0, errors.New("division by zero") }
//     return a / b, nil
//   }
//   result, err := divide(10, 0)
//   if err != nil { fmt.Println("error:", err) }

// Simulating Go's multi-return + error pattern in JavaScript:
function goError(message) {
  return { Error: () => message, isError: true }
}

const noError = null  // Go's nil

function divide(a, b) {
  if (b === 0) return [0, goError('division by zero')]
  return [a / b, noError]
}

function parsePosInt(str) {
  const n = parseInt(str, 10)
  if (isNaN(n)) return [0, goError(`strconv: cannot parse "${str}" as integer`)]
  if (n <= 0)   return [0, goError(`value must be positive, got ${n}`)]
  return [n, noError]
}

// The Go pattern: check err immediately after every call
const [result, err] = divide(10, 2)
if (err !== noError) {
  console.log('error:', err.Error())
} else {
  console.log('result:', result)
}

const [zero, err2] = divide(5, 0)
if (err2 !== noError) {
  console.log('error:', err2.Error())
}

const [n, err3] = parsePosInt('abc')
if (err3 !== noError) {
  console.log('parse error:', err3.Error())
}
```

```text
result: 5
error: division by zero
parse error: strconv: cannot parse "abc" as integer
```

Execution trace for `divide(5, 0)`:
```text
b === 0 → true
return [0, goError('division by zero')]
  → [0, { Error: () => 'division by zero' }]
caller: err !== null → true → print 'division by zero'
```

**CS lens:** In most languages, errors are handled by exceptions — a separate control flow mechanism that can be caught at any level up the call stack. The cost: any function can throw, the type of the exception is not in the signature, and callers may forget to catch. Go's `(value, error)` return type puts failure in the type signature. If you forget to check the error, you still have a `[value, error]` pair — you just chose not to use `error`. The compiler will warn if you ignore a return value entirely.

## Error Wrapping — Preserving Context

Returning a bare error often loses context: "connection refused" doesn't tell you which operation failed, which server, or which line of code was involved.

```javascript
// In real Go:
//   return fmt.Errorf("connectDB: %w", err)
//   // wraps err with context, readable as "connectDB: original error"
//   // errors.Unwrap(wrappedErr) retrieves the original

function wrapError(context, err) {
  const message = `${context}: ${err.Error()}`
  return {
    Error: () => message,
    Unwrap: () => err,
    isError: true,
  }
}

function errors_Is(err, target) {
  // Walk the error chain looking for target
  let current = err
  while (current !== null && current !== undefined) {
    if (current === target) return true
    if (current.Error && target.Error && current.Error() === target.Error()) return true
    current = current.Unwrap ? current.Unwrap() : null
  }
  return false
}

function unwrapAll(err) {
  const chain = []
  let current = err
  while (current) {
    chain.push(current.Error())
    current = current.Unwrap ? current.Unwrap() : null
  }
  return chain
}

// Simulate a chain of calls: each layer wraps the error with its context
const rootErr = goError('connection refused')
const dbErr   = wrapError('connectDB', rootErr)
const apiErr  = wrapError('handleRequest', dbErr)

console.log('full error:', apiErr.Error())
console.log('is root error?', errors_Is(apiErr, rootErr))
console.log('error chain:', unwrapAll(apiErr))
```

```text
full error: handleRequest: connectDB: connection refused
error: handleRequest: connectDB: connection refused
is root error?: true
error chain: [ 'handleRequest: connectDB: connection refused', 'connectDB: connection refused', 'connection refused' ]
```

Execution trace — reading the error chain:
```text
apiErr.Error() → 'handleRequest: connectDB: connection refused'
  Unwrap() → dbErr.Error() → 'connectDB: connection refused'
    Unwrap() → rootErr.Error() → 'connection refused'
      Unwrap() → null (root cause, no more wrapping)
```

**SE lens:** Error wrapping is how you build **structured error chains** — the production-ready replacement for stack traces. A well-wrapped error tells you: what operation failed (layer by layer), in what context, with what root cause. `errors.Is(err, target)` lets callers check for specific error types without checking string contents — the wrapping preserves identity.

## Package Visibility — Uppercase Exports

Go's visibility system is simpler than any other language's: **uppercase first letter = exported (public); lowercase = unexported (package-private)**.

```javascript
// In real Go:
//   package mypackage
//
//   type Server struct {           // exported: other packages can use Server
//     host string                  // unexported: only this package sees host
//     Port int                     // exported: other packages can set Port
//   }
//
//   func NewServer(host string, port int) *Server {  // exported constructor
//     return &Server{host: host, Port: port}          // accesses unexported field
//   }
//
//   func (s *Server) Start() error {  // exported method
//     return s.start()               // calls unexported helper
//   }
//   func (s *Server) start() error { ... }  // unexported: not in public API

// Simulation: what's exported vs unexported in a package
function simulatePackageVisibility() {
  // "mypackage" internals (what the package sees)
  const internalState = { connectionCount: 0 }  // unexported

  function internalValidate(host) {             // unexported
    return host.length > 0
  }

  // The exported API (what other packages see)
  return {
    // NewServer — exported: constructors are PascalCase in Go
    NewServer(host, port) {
      if (!internalValidate(host)) throw goError('host cannot be empty')
      return {
        Port: port,                    // exported: PascalCase
        _host: host,                   // unexported in Go: lowercase
        _connections: 0,               // unexported in Go: lowercase
        // Start — exported method
        Start() {
          internalState.connectionCount = 0
          return [true, noError]
        },
        // Stats — exported
        Stats() {
          return { port: this.Port, connections: this._connections }
        },
      }
    },
    // Version — exported constant
    Version: '1.0.0',
  }
}

const mypackage = simulatePackageVisibility()
console.log('package version:', mypackage.Version)

const [server, err] = (() => {
  try { return [mypackage.NewServer('localhost', 8080), noError] }
  catch (e) { return [null, e] }
})()

if (err) {
  console.log('error:', err.Error())
} else {
  const [ok] = server.Start()
  console.log('server started:', ok)
  console.log('stats:', server.Stats())
}
```

```text
package version: 1.0.0
server started: true
stats: { port: 8080, connections: 0 }
```

**SE lens:** Go's visibility is enforced at the package level by the compiler — not at the file level (unlike C++ `private`). The rule is universal and mechanical: you can determine visibility by looking at the first letter. This reduces cognitive load: you never have to look up an access modifier. The tradeoff is granularity — you cannot make a field accessible within a directory but not outside, only package-internal or exported.

## Common Mistakes

```javascript
function showCommonMistakes() {
  // MISTAKE 1: Ignoring errors
  // _, err := doSomething()
  // fmt.Println("done")   // forgot to check err — Go will warn but not error
  // FIX: always: if err != nil { return ..., err }
  console.log('mistake 1: always check err immediately, never skip')

  // MISTAKE 2: Returning errors without wrapping
  // return err   // loses the calling context
  // FIX: return fmt.Errorf("doSomething: %w", err)
  console.log('mistake 2: wrap errors with context at every call boundary')

  // MISTAKE 3: Using panic for normal errors
  // panic("something went wrong")  // crashes the program
  // FIX: return an error value; reserve panic for programmer mistakes (like nil pointer)
  console.log('mistake 3: panic is for programming errors, not user/network errors')
}

showCommonMistakes()
```

```text
mistake 1: always check err immediately, never skip
mistake 2: wrap errors with context at every call boundary
mistake 3: panic is for programming errors, not user/network errors
```

## Challenge: error_chain

Implement an error chain builder and inspector.

`createErrorChain()` — returns an object with:
- `.wrap(context, err)` — wraps `err` with a context string; returns a new error object with `.message()` returning `"context: original.message()"`
- `.unwrapAll(err)` — returns an array of all error messages from outermost to root
- `.is(err, target)` — returns `true` if `target` appears anywhere in `err`'s chain
- `.rootCause(err)` — returns the innermost error (the one with no further unwrapping)

An "error" here is an object with `.message()` returning a string and optionally `.unwrap()` returning the wrapped error or `null`.

```challenge
function createErrorChain() {
  return {
    wrap(context, err) {
      return { message: () => `${context}: ${err.message()}`, unwrap: () => err }
    },
    unwrapAll(err) { return [] },
    is(err, target) { return false },
    rootCause(err) { return null },
  }
}
```

```test
const chain = createErrorChain()
const root = { message: () => 'connection refused', unwrap: () => null }
const db   = chain.wrap('connectDB', root)
const api  = chain.wrap('handleRequest', db)
assert api.message() === 'handleRequest: connectDB: connection refused'
const all = chain.unwrapAll(api)
assert all.length === 3 && all[2] === 'connection refused'
assert chain.is(api, root) === true && chain.is(api, db) === true
assert chain.rootCause(api).message() === 'connection refused'
```
