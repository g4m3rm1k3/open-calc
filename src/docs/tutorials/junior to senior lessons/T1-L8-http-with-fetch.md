# Junior to Senior — T1·L8 — HTTP with fetch

**Prerequisites:** T1·L7 (Async/Await and Promises). You can write async code.
This lesson covers making HTTP requests — the foundation for connecting the
TypeScript frontend to any backend.

**What this lab adds:**
- The `fetch` API — making GET, POST, PATCH, DELETE requests
- HTTP status codes — what each range means
- Two distinct error types: network failure vs non-200 status
- Typing API responses with TypeScript interfaces
- HTTP headers — Content-Type, Authorization

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `fetch` returns a Promise. If the server returns a 404, does the Promise reject?
> 2. What is the difference between `response.json()` and `JSON.parse(response.body)`?
> 3. A POST request sends `{ name: 'Alice' }` to the server. What two headers
>    must be set for the server to receive it correctly?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A contact API client that demonstrates every HTTP method:

```
$ npx ts-node http-client.ts

--- GET: Fetch all contacts ---
Fetched 3 contacts:
  1: Alice <alice@example.com>
  2: Bob <bob@example.com>
  3: Carol <carol@example.com>

--- POST: Create a contact ---
Created: Dave (id: 4)

--- PATCH: Update a contact ---
Updated Alice's email to alice-new@example.com

--- DELETE: Remove a contact ---
Deleted contact 4

--- Error Handling ---
404 Not Found: Contact 999 does not exist
Network error: Failed to fetch (server not running)
```

---

### Concept: The `fetch` API

**What it is:** `fetch(url, options?)` is the standard browser and Node.js (v18+)
API for making HTTP requests. It returns a `Promise<Response>` — the Promise
resolves when the response headers arrive, regardless of the HTTP status code.

**The two-step pattern:**

```ts
// Step 1: get the Response object (headers, status, etc.):
const response = await fetch('https://api.example.com/contacts');

// Step 2: read the response body (this is also async):
const data = await response.json();  // or .text(), .blob(), .arrayBuffer()
```

**What it hides:** `fetch` hides the HTTP connection management, TCP socket
lifecycle, and response streaming. You make one call and get back a promise
that resolves to a structured response.

**Canonical example:** `fetch` is like ordering a package online.
The first `await` (waiting for the Response) is the delivery notification —
you know the package arrived. The second `await` (reading the body) is
actually opening the package. Both steps are required to get the contents.

**You will see this again in:** Every API call in every web application.
React Query, Axios, and every HTTP library wrap `fetch` under the hood.
Understanding raw `fetch` means you understand all of them.

**Watch for:** `fetch` does NOT reject on HTTP error status codes (404, 500, etc.).
It only rejects on network-level failures (server unreachable, DNS failure, CORS
rejection). You must manually check `response.ok` or `response.status`.

---

## Step 1 — Set Up a Mock API Server

For this lesson, use JSONPlaceholder — a free fake REST API for testing.
It has `/users` and `/posts` endpoints that simulate real API behaviour.

Create `http-client.ts`:

```ts
const API_BASE = 'https://jsonplaceholder.typicode.com';

// ── Types matching the JSONPlaceholder API ────────────────────────────

interface User {
  id:       number;
  name:     string;
  email:    string;
  username: string;
}

interface CreateUserRequest {
  name:     string;
  email:    string;
  username: string;
}

// ── Core fetch helper ─────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json', // tells server: body is JSON
      'Accept':       'application/json', // tells server: send JSON back
    },
    ...options,
  });

  // fetch does NOT throw on 4xx/5xx — must check manually:
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  return response.json() as Promise<T>;
}
```

### SAVE AND TRY

```bash
npx ts-node http-client.ts
```

Expected: no output — the helper is defined but not called yet.

**Change something:** Call `apiFetch<User[]>('/users')` and log the result.
Expected: an array of 10 user objects from JSONPlaceholder.

---

### Concept: HTTP Methods and Status Codes

**HTTP methods — what each one means:**

| Method | Meaning | Has body? |
|---|---|---|
| GET | Read a resource | No |
| POST | Create a new resource | Yes |
| PUT | Replace a resource entirely | Yes |
| PATCH | Update part of a resource | Yes |
| DELETE | Remove a resource | No (usually) |

**Status code ranges:**

| Range | Meaning | Examples |
|---|---|---|
| 2xx | Success | 200 OK, 201 Created, 204 No Content |
| 3xx | Redirect | 301 Moved Permanently, 304 Not Modified |
| 4xx | Client error | 400 Bad Request, 401 Unauthorized, 404 Not Found |
| 5xx | Server error | 500 Internal Server Error, 503 Service Unavailable |

**The two error types:**

1. **Network failure** — `fetch` rejects the Promise entirely. The server
   was not reached. The `catch` block receives the error.

2. **HTTP error status (4xx, 5xx)** — `fetch` resolves with a Response object
   whose `response.ok === false`. The Promise is not rejected. You must check
   `response.ok` manually.

**Canonical example:** Network failure is the phone call not connecting.
HTTP 404 is the call connecting and someone saying "wrong number."
Both are failures, but only the first crashes your call — the second requires
you to listen to the answer.

**Smallest possible example:**
```ts
try {
  const response = await fetch(url);

  if (!response.ok) {
    // Server responded — but with an error:
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const data = await response.json();
} catch (error) {
  if (error instanceof TypeError) {
    console.error('Network failure:', error.message);
  } else {
    console.error('HTTP error:', error);
  }
}
```

**You will see this again in:** Every API client. React Query, Axios, and every
abstraction layer still ultimately check `response.ok` (or equivalent).

---

## Step 2 — GET: Fetch All Contacts

```ts
async function getContacts(): Promise<User[]> {
  return apiFetch<User[]>('/users');
}

async function getContact(id: number): Promise<User> {
  return apiFetch<User>(`/users/${id}`);
}

// ── Main function ─────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('--- GET: Fetch all contacts ---');

  const contacts = await getContacts();
  console.log(`Fetched ${contacts.length} contacts:`);
  contacts.slice(0, 3).forEach(c => {
    console.log(`  ${c.id}: ${c.name} <${c.email}>`);
  });
}

main().catch(console.error);
```

### SAVE AND TRY

```bash
npx ts-node http-client.ts
```

Expected:
```
--- GET: Fetch all contacts ---
Fetched 10 contacts:
  1: Leanne Graham <Sincere@april.biz>
  2: Ervin Howell <Shanna@melissa.tv>
  3: Clementine Bauch <Nathan@yesenia.net>
```

**Change something:** Change `/users` to `/users?_limit=3` — JSONPlaceholder
supports query parameters. Expected: only 3 contacts returned.

---

### Concept: Sending Data — POST and PATCH

**What it is:** POST and PATCH send data to the server in the request body.
The body must be serialised (converted to a string) and the `Content-Type`
header must tell the server how to parse it.

```ts
await fetch('/contacts', {
  method:  'POST',
  headers: { 'Content-Type': 'application/json' },
  body:    JSON.stringify({ name: 'Alice', email: 'alice@example.com' }),
});
```

**The `Content-Type` header:**
- `application/json` — body is JSON (most common)
- `application/x-www-form-urlencoded` — body is HTML form data
- `multipart/form-data` — body is file upload data

**POST vs PATCH:**
- POST: creates a new resource. Server assigns the ID. Returns 201 Created.
- PATCH: updates part of an existing resource. Returns 200 OK.
- PUT: replaces the entire resource. Returns 200 OK.

**What it hides:** `JSON.stringify` hides the serialisation step. Without it,
`body: { name: 'Alice' }` sends the string `'[object Object]'` — the default
JavaScript string representation of an object.

**Watch for:** Missing `Content-Type: application/json` causes the server to
interpret the body as plain text, not as JSON. The data arrives unparsed.

---

## Step 3 — POST and PATCH Requests

```ts
async function createContact(data: CreateUserRequest): Promise<User> {
  return apiFetch<User>('/users', {
    method: 'POST',
    body:   JSON.stringify(data),  // convert object to JSON string
  });
}

async function updateContact(id: number, updates: Partial<Pick<User, 'name' | 'email'>>): Promise<User> {
  return apiFetch<User>(`/users/${id}`, {
    method: 'PATCH',
    body:   JSON.stringify(updates),
  });
}

// Add to main():
console.log('\n--- POST: Create a contact ---');
const newContact = await createContact({
  name:     'Dave',
  email:    'dave@example.com',
  username: 'dave123',
});
console.log(`Created: ${newContact.name} (id: ${newContact.id})`);

console.log('\n--- PATCH: Update a contact ---');
const updated = await updateContact(1, { email: 'alice-new@example.com' });
console.log(`Updated ${updated.name}'s email to ${updated.email}`);
```

### SAVE AND TRY

```bash
npx ts-node http-client.ts
```

Expected new output:
```
--- POST: Create a contact ---
Created: Dave (id: 101)

--- PATCH: Update a contact ---
Updated Leanne Graham's email to alice-new@example.com
```

*(JSONPlaceholder simulates these — it does not actually store them. The
response looks like a created/updated resource but nothing persists.)*

**Change something:** Remove `JSON.stringify` from the POST body —
`body: data as any`. Run. The server still returns a 201, but the body
may be empty or wrong because the server received `[object Object]`.

---

## Step 4 — DELETE and Error Handling

```ts
async function deleteContact(id: number): Promise<void> {
  // DELETE returns 200 with empty body on JSONPlaceholder:
  await apiFetch<Record<string, never>>(`/users/${id}`, {
    method: 'DELETE',
  });
}

// Add to main():
console.log('\n--- DELETE: Remove a contact ---');
await deleteContact(4);
console.log('Deleted contact 4');

console.log('\n--- Error Handling ---');

// Test 404:
try {
  await getContact(999);
} catch (error) {
  console.log('404 Not Found:', error instanceof Error ? error.message : error);
}

// Test network failure (connect to nothing):
try {
  await fetch('http://localhost:9999/contacts'); // nothing listening here
} catch (error) {
  if (error instanceof TypeError) {
    console.log('Network error:', error.message);
  }
}
```

### SAVE AND TRY

```bash
npx ts-node http-client.ts
```

Expected:
```
--- DELETE: Remove a contact ---
Deleted contact 4

--- Error Handling ---
404 Not Found: HTTP 404: {}
Network error: fetch failed
```

**Change something:** What happens if you do NOT check `response.ok` in
`apiFetch` and the server returns 404? Try removing the `if (!response.ok)`
check, request `/users/999`, and call `.json()` on the response. JSONPlaceholder
returns an empty object `{}` on 404, so it appears to succeed with empty data —
a silent failure. This is why checking `response.ok` is mandatory.

---

## 🎯 Challenge: Typed API Client

**You know:** GET, POST, PATCH, DELETE, error handling, response typing.

**Task:** Write a typed `ContactsAPI` class that wraps all four methods.
The class should have a configurable base URL and optional auth token.
All methods must be type-safe — no `any`.

```ts
const api = new ContactsAPI('https://jsonplaceholder.typicode.com', 'my-token');

const contacts = await api.getAll();           // User[]
const one      = await api.getById(1);         // User
const created  = await api.create({ name: 'Dave', email: 'dave@e.com', username: 'd' });
const updated  = await api.update(1, { email: 'new@e.com' });
await api.remove(1);
```

**Requirements:**
- Constructor takes `baseUrl: string` and optional `authToken?: string`
- If `authToken` is provided, include `Authorization: Bearer <token>` header on every request
- Each method has a typed return type — no `Promise<unknown>`
- A single private `request<T>` method handles the common logic (URL building, headers, error checking)

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
class ContactsAPI {
  constructor(
    private readonly baseUrl: string,
    private readonly authToken?: string,
  ) {}

  private async request<T>(
    path: string,
    options?: RequestInit,
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept':       'application/json',
    };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: { ...headers, ...(options?.headers as Record<string, string>) },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T; // no body for DELETE/204 responses
    }

    return response.json() as Promise<T>;
  }

  getAll(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  getById(id: number): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  create(data: CreateUserRequest): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body:   JSON.stringify(data),
    });
  }

  update(id: number, updates: Partial<Pick<User, 'name' | 'email'>>): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PATCH',
      body:   JSON.stringify(updates),
    });
  }

  remove(id: number): Promise<void> {
    return this.request<void>(`/users/${id}`, { method: 'DELETE' });
  }
}
```

**Key insight:** The `request<T>` private method is the Adapter pattern applied
to HTTP — it handles all the common concerns (headers, auth, error checking,
body parsing) in one place. Each public method is a thin wrapper that provides
the correct path, method, and type parameter. Adding a new endpoint is two lines.
Changing the auth scheme means changing one line in `request<T>`.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| `fetch` resolves on 404 | No try/catch, log `response.ok` on 404 URL | `false` — no rejection |
| `fetch` rejects on network fail | Fetch unreachable host | `TypeError: fetch failed` |
| POST requires JSON header | POST without `Content-Type` | Server receives `[object Object]` |
| Two `await` steps | Log after first await, before `.json()` | Response object visible |
| PATCH vs PUT | Both update — PATCH partial, PUT full replace | Different body requirements |
| Auth header format | Inspect request headers | `Authorization: Bearer <token>` |

---

## Quick Check Answers

**1. Does `fetch` reject on a 404?**

No. `fetch` only rejects when there is a network-level failure — the server
was not reached at all (DNS failure, connection refused, CORS rejection).
A 404 means the server was reached and responded with "not found." The Promise
resolves with a Response object where `response.ok === false` and
`response.status === 404`. You must check `response.ok` manually. This
surprises many developers who expect `fetch` to work like jQuery's `$.ajax`
(which did throw on 4xx/5xx). The fix: always check `response.ok` before
calling `response.json()`.

**2. `response.json()` vs `JSON.parse(response.body)`?**

`response.json()` is the correct way. It reads the response body as a stream
and parses it as JSON, returning a Promise. `response.body` is a `ReadableStream`
— it does not have a `toString()` method that gives you the JSON text.
`JSON.parse(response.body)` would give `JSON.parse('[object ReadableStream]')` —
a syntax error. The pattern is always: `await response.json()` (not await the
parse, await the read-and-parse operation together).

**3. What two headers are required for a POST with a JSON body?**

1. `Content-Type: application/json` — tells the server the body is JSON so
   it parses it correctly. Without this, the server may treat the body as plain
   text and not deserialise it.
2. `Accept: application/json` — tells the server you want JSON back. Without
   this, some servers return HTML or XML by default.
   The `Content-Type` header is strictly required; `Accept` is strongly recommended.
