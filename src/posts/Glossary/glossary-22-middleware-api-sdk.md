# Architecture Vocabulary II: Middleware, API, SDK

## What you will build

Three runnable programs — one per concept — in both Python and TypeScript,
showing what middleware is and how it works as a pipeline of handlers
around a request, what an API is and how to design one clearly, and what
distinguishes an SDK from a raw API. By the end you'll understand why
web frameworks are built around middleware, why API design is a discipline
in its own right, and what an SDK actually saves you from doing.

## What you need to know first

This post assumes comfort with basic Python (variables, functions,
classes) and basic TypeScript orientation. The middleware section connects
to the Chain of Responsibility pattern from Glossary 10 and the Pipeline
from Glossary 10 — both connections are named where they appear.

## Setting up to run TypeScript

```
npx tsc filename.ts
node filename.js
```

---

## Concept 1: Middleware

**Middleware** is code that sits between a request and a response,
processing the request before it reaches the final handler and/or
processing the response before it's sent back. Multiple middleware
functions form a chain — each one can inspect or modify the request,
decide whether to pass it along to the next middleware, and optionally
transform the response on the way back out.

You've already seen this structure under two different names in this
series: the **Chain of Responsibility** pattern (Glossary 10) is the
same idea at the object level, and the **Pipeline** (Glossary 10) is
the same idea for data transformation. Middleware applies both to HTTP
request handling — the most common context where you'll encounter the
term.

### Python

```python
class Request:
    def __init__(self, method, path, headers=None, body=None):
        self.method  = method
        self.path    = path
        self.headers = headers or {}
        self.body    = body
        self.user    = None
        self.start_time = None


class Response:
    def __init__(self, status=200, body=""):
        self.status = status
        self.body   = body

    def __str__(self):
        return f"Response({self.status}: {self.body})"
```

**Walkthrough:** `Request` and `Response` are simple data containers —
the same Context pattern from Glossary 09: a shared object that flows
through a multi-step pipeline, accumulating information as it goes.
`request.user = None` will be populated by an authentication middleware.
`request.start_time = None` will be populated by a logging middleware.

```python
import time


def logging_middleware(request, next_handler):
    request.start_time = time.perf_counter()
    print(f"  [Logger] → {request.method} {request.path}")

    response = next_handler(request)

    elapsed = (time.perf_counter() - request.start_time) * 1000
    print(f"  [Logger] ← {response.status} ({elapsed:.1f}ms)")
    return response


def auth_middleware(request, next_handler):
    token = request.headers.get("Authorization", "")
    if token == "Bearer valid-token":
        request.user = "alice"
        print(f"  [Auth] Authenticated as {request.user}")
        return next_handler(request)
    else:
        print(f"  [Auth] Unauthorized")
        return Response(401, "Unauthorized")


def cors_middleware(request, next_handler):
    response = next_handler(request)
    response.headers = getattr(response, "headers", {})
    response.headers["Access-Control-Allow-Origin"] = "*"
    print(f"  [CORS] Added CORS headers")
    return response
```

**Walkthrough:** Each middleware function takes `request` and
`next_handler`. `next_handler` is the next middleware (or the final
route handler) in the chain — a **callback** (Glossary 03) that the
current middleware calls when it wants to continue processing.
`logging_middleware` wraps the whole chain: it records the start time,
calls `next_handler` to run everything after it, then logs the result.
`auth_middleware` makes a decision: if the token is valid, it enriches
`request.user` and continues the chain; if not, it short-circuits and
returns a `401` directly, without calling `next_handler` at all — exactly
the Chain of Responsibility behavior from Glossary 10.

```python
class App:
    def __init__(self):
        self._middleware = []
        self._routes = {}

    def use(self, middleware):
        self._middleware.append(middleware)
        return self

    def route(self, path, handler):
        self._routes[path] = handler
        return self

    def handle(self, request):
        def route_handler(req):
            handler = self._routes.get(req.path)
            if handler:
                return handler(req)
            return Response(404, f"Not Found: {req.path}")

        chain = route_handler
        for middleware in reversed(self._middleware):
            outer = middleware
            inner = chain
            chain = lambda req, o=outer, i=inner: o(req, i)

        return chain(request)
```

**Walkthrough — new syntax.** The `chain` construction is the key
mechanism — and the `o=outer, i=inner` default-argument capture is a
Python-specific pattern worth explaining directly. When building the
middleware chain in the loop, `outer` and `inner` change on each
iteration. If the lambda simply closed over `outer` and `inner` directly,
all lambdas in the chain would share the same variables and would all
point to the final iteration's values — the same closure-variable-capture
bug mentioned in Glossary 19. The `o=outer, i=inner` trick captures the
*current* values of `outer` and `inner` as default argument values,
which are evaluated once at definition time rather than at call time.
`reversed(self._middleware)` wraps middleware in reverse order so the
first middleware registered runs outermost (first to see the request,
last to see the response).

```python
app = App()
app.use(logging_middleware)
app.use(auth_middleware)
app.use(cors_middleware)

app.route("/hello", lambda req: Response(200, f"Hello, {req.user}!"))
app.route("/public", lambda req: Response(200, "Public content"))

print("=== Authenticated request ===")
req1 = Request("GET", "/hello", {"Authorization": "Bearer valid-token"})
print(app.handle(req1))

print("\n=== Unauthenticated request ===")
req2 = Request("GET", "/hello")
print(app.handle(req2))

print("\n=== Unknown route ===")
req3 = Request("GET", "/unknown", {"Authorization": "Bearer valid-token"})
print(app.handle(req3))
```

```
=== Authenticated request ===
  [Logger] → GET /hello
  [Auth] Authenticated as alice
  [CORS] Added CORS headers
  [Logger] ← 200 (0.1ms)
Response(200: Hello, alice!)

=== Unauthenticated request ===
  [Logger] → GET /hello
  [Auth] Unauthorized
  [Logger] ← 401 (0.1ms)
Response(401: Unauthorized)

=== Unknown route ===
  [Logger] → GET /unknown
  [Auth] Authenticated as alice
  [CORS] Added CORS headers
  [Logger] ← 404 (0.1ms)
Response(404: Not Found: /unknown)
```

**Walkthrough:** The logging middleware wraps everything — its output
appears first and last. The auth middleware runs next: on the
authenticated request it continues the chain; on the unauthenticated
one it short-circuits, returning `401` directly, so CORS never runs
(the response for a rejected request doesn't need CORS headers). The
route handler runs last: it finds the matching route or returns 404.

**CS lens.** This is the Chain of Responsibility (Glossary 10) applied
to HTTP requests: each middleware either handles the request (possibly
modifying it), passes it to the next middleware, or short-circuits.
The difference from the Glossary 10 chain: middleware doesn't "claim"
the request and stop the chain — it wraps the chain, so it sees both
the request going in and the response coming out. This bidirectional
wrapping is what makes logging middleware possible: it can record what
happened *after* the rest of the chain has run.

**SE lens.** Every web framework uses middleware: Express's
`app.use(middleware)`, Django's `MIDDLEWARE` setting, ASP.NET Core's
`app.Use(...)`. The middleware pattern is what makes cross-cutting
concerns (authentication, logging, CORS, rate limiting, compression)
composable: each concern is one middleware function, and the stack is
assembled at startup. Business logic routes never need to know about
logging or authentication — the middleware handles those before the
route even runs.

### TypeScript

```typescript
interface TsRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: string;
  user?: string;
  startTime?: number;
}

interface TsResponse {
  status: number;
  body: string;
  headers?: Record<string, string>;
}

type NextHandler = (req: TsRequest) => TsResponse;
type Middleware  = (req: TsRequest, next: NextHandler) => TsResponse;

function loggingMiddleware(request: TsRequest, next: NextHandler): TsResponse {
  request.startTime = Date.now();
  console.log(`  [Logger] → ${request.method} ${request.path}`);
  const response = next(request);
  const elapsed  = Date.now() - (request.startTime ?? 0);
  console.log(`  [Logger] ← ${response.status} (${elapsed}ms)`);
  return response;
}

function authMiddleware(request: TsRequest, next: NextHandler): TsResponse {
  const token = request.headers["Authorization"] ?? "";
  if (token === "Bearer valid-token") {
    request.user = "alice";
    console.log(`  [Auth] Authenticated as ${request.user}`);
    return next(request);
  }
  console.log("  [Auth] Unauthorized");
  return { status: 401, body: "Unauthorized" };
}

function corsMiddleware(request: TsRequest, next: NextHandler): TsResponse {
  const response = next(request);
  console.log("  [CORS] Added CORS headers");
  return { ...response, headers: { ...(response.headers ?? {}), "Access-Control-Allow-Origin": "*" } };
}

class TsApp {
  private middlewareStack: Middleware[] = [];
  private routes: Record<string, (req: TsRequest) => TsResponse> = {};

  use(middleware: Middleware): this {
    this.middlewareStack.push(middleware);
    return this;
  }

  route(path: string, handler: (req: TsRequest) => TsResponse): this {
    this.routes[path] = handler;
    return this;
  }

  handle(request: TsRequest): TsResponse {
    const routeHandler: NextHandler = (req) => {
      const handler = this.routes[req.path];
      return handler ? handler(req) : { status: 404, body: `Not Found: ${req.path}` };
    };

    const chain = [...this.middlewareStack].reverse().reduce(
      (next, mw) => (req: TsRequest) => mw(req, next),
      routeHandler
    );

    return chain(request);
  }
}

const app = new TsApp();
app.use(loggingMiddleware);
app.use(authMiddleware);
app.use(corsMiddleware);

app.route("/hello",  (req) => ({ status: 200, body: `Hello, ${req.user}!` }));
app.route("/public", (_)   => ({ status: 200, body: "Public content"       }));

console.log("=== Authenticated request ===");
const req1: TsRequest = { method: "GET", path: "/hello", headers: { Authorization: "Bearer valid-token" } };
const res1 = app.handle(req1);
console.log(`Response(${res1.status}: ${res1.body})`);

console.log("\n=== Unauthenticated request ===");
const req2: TsRequest = { method: "GET", path: "/hello", headers: {} };
const res2 = app.handle(req2);
console.log(`Response(${res2.status}: ${res2.body})`);

console.log("\n=== Unknown route ===");
const req3: TsRequest = { method: "GET", path: "/unknown", headers: { Authorization: "Bearer valid-token" } };
const res3 = app.handle(req3);
console.log(`Response(${res3.status}: ${res3.body})`);
```

**Walkthrough — new syntax.** `{ ...response, headers: { ... } }` uses the
**object spread operator**: `...response` copies all properties of
`response` into a new object, and the additional `headers` property
overwrites the copied one — a concise way to produce a modified copy of
an object without mutating the original. `[...this.middlewareStack].reverse().reduce(...)` builds the chain: starting from the route handler,
each middleware wraps it in reverse order. `(req: TsRequest) => mw(req,
next)` is an arrow function creating a new handler that calls the current
middleware with the accumulated `next`. This is the same chain-building
logic as the Python version, expressed more concisely using `.reduce()`.

```
=== Authenticated request ===
  [Logger] → GET /hello
  [Auth] Authenticated as alice
  [CORS] Added CORS headers
  [Logger] ← 200 (0ms)
Response(200: Hello, alice!)

=== Unauthenticated request ===
  [Logger] → GET /hello
  [Auth] Unauthorized
  [Logger] ← 401 (0ms)
Response(401: Unauthorized)

=== Unknown route ===
  [Logger] → GET /unknown
  [Auth] Authenticated as alice
  [CORS] Added CORS headers
  [Logger] ← 404 (0ms)
Response(404: Not Found: /unknown)
```

---

## Concept 2: API

An **API** (Application Programming Interface) is the public interface
through which one piece of software communicates with another. It defines
what operations are available, what inputs they accept, and what outputs
they return — without exposing implementation details.

Every `interface` you've seen in this series is an API at the class level.
"API" in everyday usage usually means an HTTP API — a set of URLs, HTTP
methods, request formats, and response formats that a service exposes
to clients.

### Python

```python
class ProductAPI:
    """
    API Contract:
      GET  /products          → list all products
      GET  /products/{id}     → get one product
      POST /products          → create a product
      PUT  /products/{id}     → update a product
    """

    def __init__(self):
        self._products = {
            1: {"id": 1, "name": "Widget",  "price": 9.99,  "stock": 100},
            2: {"id": 2, "name": "Gadget",  "price": 24.99, "stock": 50},
            3: {"id": 3, "name": "Doohickey","price": 4.99, "stock": 200},
        }

    def list_products(self, min_price=None, max_price=None):
        products = list(self._products.values())
        if min_price is not None:
            products = [p for p in products if p["price"] >= min_price]
        if max_price is not None:
            products = [p for p in products if p["price"] <= max_price]
        return {"status": 200, "data": products, "count": len(products)}

    def get_product(self, product_id):
        product = self._products.get(product_id)
        if not product:
            return {"status": 404, "error": f"Product {product_id} not found"}
        return {"status": 200, "data": product}

    def create_product(self, name, price, stock=0):
        if not name:
            return {"status": 400, "error": "name is required"}
        if price < 0:
            return {"status": 400, "error": "price must be non-negative"}
        new_id = max(self._products.keys()) + 1
        product = {"id": new_id, "name": name, "price": price, "stock": stock}
        self._products[new_id] = product
        return {"status": 201, "data": product}

    def update_product(self, product_id, **updates):
        if product_id not in self._products:
            return {"status": 404, "error": f"Product {product_id} not found"}
        allowed = {"name", "price", "stock"}
        invalid = set(updates.keys()) - allowed
        if invalid:
            return {"status": 400, "error": f"Invalid fields: {invalid}"}
        self._products[product_id].update(updates)
        return {"status": 200, "data": self._products[product_id]}


api = ProductAPI()

print("List all:")
result = api.list_products()
print(f"  {result['status']} — {result['count']} products")

print("\nFilter by price:")
result = api.list_products(min_price=5.00, max_price=15.00)
for p in result["data"]:
    print(f"  {p['name']}: ${p['price']}")

print("\nGet one:")
print(f"  {api.get_product(2)}")
print(f"  {api.get_product(99)}")

print("\nCreate:")
print(f"  {api.create_product('Thingamajig', 14.99, stock=75)}")
print(f"  {api.create_product('', 5.00)}")

print("\nUpdate:")
print(f"  {api.update_product(1, price=11.99, stock=80)}")
print(f"  {api.update_product(1, color='red')}")
```

**Walkthrough — new syntax.** `def update_product(self, product_id,
**updates)` — `**updates` is the **keyword argument variadic parameter**,
collecting any number of keyword arguments into a dictionary. Calling
`api.update_product(1, price=11.99, stock=80)` produces `updates =
{"price": 11.99, "stock": 80}`. `set(updates.keys()) - allowed` is
**set difference**: the set of provided field names minus the set of
allowed field names, giving the set of invalid field names — an empty
set if all fields are valid. `self._products[product_id].update(updates)`
calls Python's built-in dictionary `.update()` method, which merges
`updates` into the existing dictionary, overwriting matching keys.

```
List all:
  200 — 3 products

Filter by price:
  Widget: $9.99

Get one:
  {'status': 200, 'data': {'id': 2, 'name': 'Gadget', 'price': 24.99, 'stock': 50}}
  {'status': 404, 'error': 'Product 99 not found'}

Create:
  {'status': 201, 'data': {'id': 4, 'name': 'Thingamajig', 'price': 14.99, 'stock': 75}}
  {'status': 400, 'error': 'name is required'}

Update:
  {'status': 200, 'data': {'id': 1, 'name': 'Widget', 'price': 11.99, 'stock': 80}}
  {'status': 400, 'error': "Invalid fields: {'color'}"}
```

**CS lens.** An API is an abstraction boundary: the client knows the
API contract (what endpoints exist, what they accept, what they return)
but nothing about the implementation behind it. The `ProductAPI` class
could store products in memory (as here), in a database, or in a remote
service — the API contract is identical regardless. This is the same
principle as the Repository pattern (Glossary 06) and the Facade
pattern (Glossary 01): hide implementation details behind a stable
interface.

**SE lens.** Good API design is a discipline: APIs should be consistent
(the same patterns used throughout), predictable (similar operations
behave similarly), versioned (changes don't silently break existing
clients), and documented (the contract is written down, not just
implied). REST (Representational State Transfer) is the dominant
convention for HTTP APIs: resources are nouns (products, users, orders);
HTTP methods express verbs (GET to read, POST to create, PUT/PATCH to
update, DELETE to remove); status codes communicate outcome (200 OK,
201 Created, 400 Bad Request, 404 Not Found, 401 Unauthorized).

### TypeScript

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface ApiResponse<T> {
  status: number;
  data?: T;
  error?: string;
  count?: number;
}

class ProductAPI {
  private products: Map<number, Product> = new Map([
    [1, { id: 1, name: "Widget",    price: 9.99,  stock: 100 }],
    [2, { id: 2, name: "Gadget",    price: 24.99, stock: 50  }],
    [3, { id: 3, name: "Doohickey", price: 4.99,  stock: 200 }],
  ]);

  listProducts(minPrice?: number, maxPrice?: number): ApiResponse<Product[]> {
    let products = Array.from(this.products.values());
    if (minPrice !== undefined) products = products.filter((p) => p.price >= minPrice);
    if (maxPrice !== undefined) products = products.filter((p) => p.price <= maxPrice);
    return { status: 200, data: products, count: products.length };
  }

  getProduct(productId: number): ApiResponse<Product> {
    const product = this.products.get(productId);
    if (!product) return { status: 404, error: `Product ${productId} not found` };
    return { status: 200, data: product };
  }

  createProduct(name: string, price: number, stock = 0): ApiResponse<Product> {
    if (!name)    return { status: 400, error: "name is required" };
    if (price < 0) return { status: 400, error: "price must be non-negative" };
    const newId   = Math.max(...Array.from(this.products.keys())) + 1;
    const product = { id: newId, name, price, stock };
    this.products.set(newId, product);
    return { status: 201, data: product };
  }

  updateProduct(productId: number, updates: Partial<Omit<Product, "id">>): ApiResponse<Product> {
    const product = this.products.get(productId);
    if (!product) return { status: 404, error: `Product ${productId} not found` };
    const updated = { ...product, ...updates };
    this.products.set(productId, updated);
    return { status: 200, data: updated };
  }
}

const api = new ProductAPI();

console.log("List all:");
const all = api.listProducts();
console.log(`  ${all.status} — ${all.count} products`);

console.log("\nFilter by price:");
const filtered = api.listProducts(5.00, 15.00);
filtered.data?.forEach((p) => console.log(`  ${p.name}: $${p.price}`));

console.log("\nGet one:");
console.log(`  ${JSON.stringify(api.getProduct(2))}`);
console.log(`  ${JSON.stringify(api.getProduct(99))}`);

console.log("\nCreate:");
console.log(`  ${JSON.stringify(api.createProduct("Thingamajig", 14.99, 75))}`);
console.log(`  ${JSON.stringify(api.createProduct("", 5.00))}`);

console.log("\nUpdate:");
console.log(`  ${JSON.stringify(api.updateProduct(1, { price: 11.99, stock: 80 }))}`);
```

**Walkthrough — new syntax.** `ApiResponse<T>` is a generic interface —
the `<T>` allows `data` to be typed precisely (`Product`, `Product[]`,
etc.) rather than `unknown`. `Partial<Omit<Product, "id">>` introduces
two TypeScript utility types: `Omit<Product, "id">` produces a type
identical to `Product` but without the `id` field; `Partial<...>` makes
every field optional. Together: the `updates` parameter can contain any
subset of Product's non-id fields — the compiler catches any field that
doesn't exist on `Product`, preventing typos like `{ colour: "red" }`.
`minPrice !== undefined` — checking for `undefined` specifically (rather
than just `!minPrice`) handles the case where `minPrice` is `0`, which
is falsy but a valid price filter.

```
List all:
  200 — 3 products

Filter by price:
  Widget: $9.99

Get one:
  {"status":200,"data":{"id":2,"name":"Gadget","price":24.99,"stock":50}}
  {"status":404,"error":"Product 99 not found"}

Create:
  {"status":201,"data":{"id":4,"name":"Thingamajig","price":14.99,"stock":75}}
  {"status":400,"error":"name is required"}

Update:
  {"status":200,"data":{"id":1,"name":"Widget","price":11.99,"stock":80}}
```

---

## Concept 3: SDK

An **SDK** (Software Development Kit) is a set of tools, libraries, and
documentation that makes it easier to build against an API. Where a raw
API requires you to construct HTTP requests, handle authentication
headers, parse responses, and manage errors yourself — an SDK wraps all
of that, giving you a higher-level interface in your own language.

### Python

```python
import json


class RawApiClient:
    """Simulates calling a raw HTTP API — you handle everything."""

    def get_product(self, product_id, api_key):
        # In reality: requests.get(f"https://api.example.com/products/{product_id}",
        #             headers={"Authorization": f"Bearer {api_key}"})
        print(f"  [Raw] GET /products/{product_id} with Bearer {api_key}")
        raw_response = '{"status": 200, "data": {"id": 1, "name": "Widget", "price": 9.99}}'
        parsed = json.loads(raw_response)
        if parsed["status"] != 200:
            raise Exception(f"API error: {parsed.get('error')}")
        return parsed["data"]


class ProductSDK:
    """SDK — wraps the raw API with a clean, language-native interface."""

    def __init__(self, api_key):
        self._api_key = api_key
        self._base_url = "https://api.example.com"
        self._raw = RawApiClient()

    def _call(self, method, path, data=None):
        print(f"  [SDK] {method} {path}")
        raw_response = '{"status": 200, "data": {"id": 1, "name": "Widget", "price": 9.99, "stock": 100}}'
        parsed = json.loads(raw_response)
        if parsed["status"] >= 400:
            raise SDKError(parsed.get("error", "Unknown error"), parsed["status"])
        return parsed.get("data")

    def get_product(self, product_id):
        return self._call("GET", f"/products/{product_id}")

    def list_products(self, min_price=None, max_price=None):
        params = {}
        if min_price is not None: params["min_price"] = min_price
        if max_price is not None: params["max_price"] = max_price
        return self._call("GET", "/products")

    def create_product(self, name, price, stock=0):
        return self._call("POST", "/products", {"name": name, "price": price, "stock": stock})


class SDKError(Exception):
    def __init__(self, message, status_code):
        super().__init__(message)
        self.status_code = status_code


print("=== Raw API usage (you handle everything) ===")
raw = RawApiClient()
try:
    product = raw.get_product(1, "my-secret-key")
    print(f"  Got: {product}")
except Exception as e:
    print(f"  Error: {e}")

print("\n=== SDK usage (clean, language-native) ===")
sdk = ProductSDK(api_key="my-secret-key")
product = sdk.get_product(1)
print(f"  Got: {product}")

products = sdk.list_products(min_price=5.00)
print(f"  Listed: {products}")
```

```
=== Raw API usage (you handle everything) ===
  [Raw] GET /products/1 with Bearer my-secret-key
  Got: {'id': 1, 'name': 'Widget', 'price': 9.99}

=== SDK usage (clean, language-native) ===
  [SDK] GET /products/1
  Got: {'id': 1, 'name': 'Widget', 'price': 9.99, 'stock': 100}
  [SDK] GET /products
  Listed: {'id': 1, 'name': 'Widget', 'price': 9.99, 'stock': 100}
```

**Walkthrough:** The raw client requires the caller to pass the API key
explicitly every call, know the URL format, parse JSON, and check status
codes. The SDK hides all of that: you call `sdk.get_product(1)`, and the
SDK handles authentication, URL construction, response parsing, and error
wrapping. An SDK is an application of the Facade pattern (Glossary 01)
at the API boundary: a simpler interface over a more complex underlying
system.

**CS lens.** The difference between an API and an SDK: an API is a
*contract* (what operations exist, what they accept and return); an SDK
is an *implementation* that fulfills that contract in a specific
language, adding convenience, error handling, and idiomatic patterns on
top. A single API often has SDKs for multiple languages — the Stripe
payment API, for example, has official SDKs for Python, JavaScript,
Ruby, Java, Go, and others. Each SDK wraps the same HTTP API but provides
an interface natural to its language.

**SE lens.** When consuming a third-party service, always prefer the SDK
over the raw API if one is available: it handles authentication,
retry logic, rate limiting, response parsing, and error normalization —
concerns that are tedious and error-prone to implement yourself and that
the service provider has already solved correctly. When building a
service you expect others to consume, publishing an SDK alongside the
API dramatically lowers the barrier to adoption.

### TypeScript

```typescript
class SDKError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = "SDKError";
  }
}

interface ProductData {
  id: number;
  name: string;
  price: number;
  stock: number;
}

class ProductSDK {
  constructor(private apiKey: string) {}

  private call(method: string, path: string): ProductData {
    console.log(`  [SDK] ${method} ${path}`);
    const fakeResponse = { status: 200, data: { id: 1, name: "Widget", price: 9.99, stock: 100 } };
    if (fakeResponse.status >= 400) throw new SDKError("API Error", fakeResponse.status);
    return fakeResponse.data;
  }

  getProduct(productId: number): ProductData {
    return this.call("GET", `/products/${productId}`);
  }

  listProducts(minPrice?: number, maxPrice?: number): ProductData {
    const params = new URLSearchParams();
    if (minPrice !== undefined) params.set("min_price", String(minPrice));
    if (maxPrice !== undefined) params.set("max_price", String(maxPrice));
    return this.call("GET", `/products?${params}`);
  }

  createProduct(name: string, price: number, stock = 0): ProductData {
    return this.call("POST", "/products");
  }
}

const sdk = new ProductSDK("my-secret-key");

console.log("=== SDK usage ===");
const product = sdk.getProduct(1);
console.log(`  Got: ${JSON.stringify(product)}`);

const products = sdk.listProducts(5.00);
console.log(`  Listed: ${JSON.stringify(products)}`);
```

**Walkthrough — new syntax.** `class SDKError extends Error` — extending
the built-in `Error` class creates a custom error type. `super(message)`
calls `Error`'s constructor. `this.name = "SDKError"` sets the error's
name property so stack traces and `instanceof` checks identify it
correctly. `new URLSearchParams()` is a built-in JavaScript class for
building URL query strings: `.set(key, value)` adds a parameter;
`.toString()` (called implicitly when embedded in a template literal)
produces `"min_price=5"` — cleaner than manual string concatenation.

```
=== SDK usage ===
  [SDK] GET /products/1
  Got: {"id":1,"name":"Widget","price":9.99,"stock":100}
  [SDK] GET /products?min_price=5
  Listed: {"id":1,"name":"Widget","price":9.99,"stock":100}
```

---

## Connect the pieces

**Middleware**, **API**, and **SDK** operate at three different points in
the request lifecycle.

**Middleware** is inside a service — the pipeline of processing that
wraps every incoming request before it reaches the handler and every
outgoing response before it leaves. It's the place for cross-cutting
concerns: logging, authentication, CORS, rate limiting.

**API** is the boundary between services — the contract that defines
what one service exposes to others. It specifies operations, inputs,
outputs, and error conditions, hiding all implementation details behind
a stable surface.

**SDK** is on the consumer side of that boundary — a language-native
library that wraps the raw API to make consumption easy, idiomatic, and
safe. It's a Facade (Glossary 01) over the API, handling the mechanical
details so callers can focus on what they want to do rather than how to
call it.

All three reflect the same underlying architectural principle: boundaries
should be explicit, stable, and well-defined, with implementation details
hidden on each side.

## What breaks without these patterns

Without middleware, cross-cutting concerns (authentication, logging)
must be duplicated in every route handler — or worse, forgotten in some.
Without a clear API contract, clients are forced to reverse-engineer
implementation details that the server is free to change at any time.
Without an SDK, every team consuming an API must independently implement
authentication, retry logic, error handling, and response parsing —
getting some of it wrong every time.

## Definition of done

- [ ] You can explain what middleware does and why the logging middleware
      sees both the incoming request and the outgoing response.
- [ ] You can explain why auth middleware can short-circuit the chain
      (return early without calling `next`) while logging middleware
      cannot.
- [ ] You can explain what REST conventions are, using the Product API
      as an example (which HTTP method for which operation, which status
      codes for which outcomes).
- [ ] You can explain the difference between an API and an SDK in your
      own words — what the SDK adds on top of the raw API.
- [ ] You've run all three examples in Python and TypeScript and confirmed
      matching output.
- [ ] You can explain what `Partial<Omit<Product, "id">>` means in
      TypeScript and what it prevents.
