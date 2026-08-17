# Full-Stack Playground Curriculum

The curriculum below is organized around **software problems and relationships between concepts**, not technologies.

The code is independent per lesson. The understanding compounds.

---

# 1. Shared Playground

```text
fullstack-playground/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js
├── src/
│   ├── shared/
│   │   ├── db/
│   │   ├── http/
│   │   ├── testing/
│   │   └── ui/
│   │
│   ├── app/
│   │   └── Playground.tsx
│   │
│   └── lessons/
│       ├── 001/
│       ├── 002/
│       ├── 003/
│       └── ...
│
├── scripts/
│   ├── run-lesson.ts
│   └── reset-lesson.ts
│
└── README.md
```

### Shared code rule

`src/shared/` contains only **playground infrastructure**, never lesson solutions.

Lessons may import:

```text
src/shared/...
```

Lessons may never import:

```text
src/lessons/017/...
```

Each lesson owns its:

```text
web/
api/
data/
tests/
```

as needed.

A lesson can therefore be deleted completely without breaking another lesson.

---

# 2. Lesson Contract

Every lesson has:

```text
src/lessons/NNN-name/
├── README.md
├── web/          # if UI is required
├── api/          # if server is required
├── data/         # if lesson owns data
└── tests/        # if useful
```

`README.md` contains:

```text
Problem
What you are building
Concept relationship
Starting state
Steps
Experiments
Break it
Challenge
Questions
Mastery checkpoint
```

The agent generating an individual lesson must **not simply hand the learner finished code**. It teaches the learner through the construction.

---

# 3. Curriculum

## Phase 1 — A Program Becomes a System

The first lessons establish the fundamental relationship:

```text
data → computation → observable result
```

and then:

```text
user → browser → program
```

---

## Lesson 001 — Make a Number Change

**Problem:** A user needs to adjust the quantity of an item.

**Build:**

```text
src/lessons/001-counter/
├── README.md
└── web/
    └── Counter.tsx
```

**Relationship:**

```text
user action
 ↓
event
 ↓
function
 ↓
value changes
 ↓
rendered output changes
```

**Learn through the problem:**

* values
* variables
* functions
* events
* React component
* JSX
* state
* rendering

**Experiment:** Change state with `+1`, `-1`, reset, then deliberately mutate the wrong value.

**Challenge:** Build a quantity selector with minimum `1` and maximum `20`.

**Mastery:** Explain why changing a normal variable doesn't cause React to render again, while state does.

---

## Lesson 002 — Turn Data Into a UI

**Problem:** A customer needs to see their three recent invoices.

```text
src/lessons/002-invoice-list/
└── web/
    └── InvoiceList.tsx
```

Data:

```text
INV-1042 — Acme Design — $1,240.00 — Paid
INV-1043 — Northstar Labs — $860.00 — Due
INV-1044 — Cedar Studio — $2,100.00 — Overdue
```

**Relationship:**

```text
data
 ↓
array
 ↓
mapping
 ↓
component
 ↓
rendered UI
```

Learn:

* arrays
* objects
* mapping
* props
* TypeScript object shapes
* component boundaries

**Break:** Remove a field and observe what TypeScript catches.

**Challenge:** Add filtering by invoice status.

---

## Lesson 003 — One UI, Many States

**Problem:** An order screen doesn't always have an order.

```text
src/lessons/003-order-states/
└── web/
    └── OrderStatus.tsx
```

**Relationship:**

```text
application state
 ↓
possible states
 ↓
conditional rendering
 ↓
different UI
```

States:

```text
loading
success
empty
error
```

Use a discriminated union.

```ts
type OrderState =
  | { status: "loading" }
  | { status: "success"; order: Order }
  | { status: "empty" }
  | { status: "error"; message: string };
```

**Experiment:** Add an impossible state and see why the union helps.

**Mastery:** Explain why representing states explicitly is safer than a collection of unrelated booleans.

---

# Phase 2 — The Browser Meets a Server

Now the central relationship becomes:

```text
React
 ↓
HTTP
 ↓
server
 ↓
HTTP
 ↓
React
```

---

## Lesson 004 — Ask a Server a Question

**Problem:** The UI needs today's warehouse status.

```text
src/lessons/004-first-request/
├── web/
│   └── WarehouseStatus.tsx
└── api/
    └── server.ts
```

API:

```text
GET /warehouse/status
```

Response:

```json
{
  "openOrders": 18,
  "shipmentsToday": 42
}
```

**Relationship:**

```text
React
 ↓
fetch
 ↓
HTTP GET
 ↓
Express route
 ↓
JSON
 ↓
HTTP response
 ↓
React state
 ↓
UI
```

Learn:

* Node process
* Express server
* route
* HTTP request
* response
* JSON
* `fetch`
* async/await

**Break:** Return invalid JSON.

**Challenge:** Add `/warehouse/alerts`.

---

## Lesson 005 — A Request Has a Shape

**Problem:** The server needs to know which customer is being requested.

```text
GET /customers/cus_1042
```

```text
src/lessons/005-path-parameters/
├── web/
└── api/
    └── server.ts
```

**Relationship:**

```text
React
 ↓
URL
 ↓
path parameter
 ↓
Express route
 ↓
lookup
 ↓
response
```

Learn:

* URL structure
* route parameters
* TypeScript function parameters
* lookup
* `404`

**Experiment:** Request an unknown customer.

---

## Lesson 006 — The Browser Sends Information

**Problem:** A user submits a shipping address.

```text
src/lessons/006-form-post/
├── web/
│   └── ShippingForm.tsx
└── api/
    └── server.ts
```

**Relationship:**

```text
input
 ↓
React state
 ↓
form submit
 ↓
JSON
 ↓
HTTP POST
 ↓
Express request body
 ↓
response
 ↓
React
```

Learn:

* controlled inputs
* form events
* POST
* request body
* JSON serialization
* JSON parsing
* async request state

**Challenge:** Add phone number.

---

## Lesson 007 — The Server Can Say No

**Problem:** A shipping order cannot be created without a postal code.

Same basic structure, new independent implementation.

**Relationship:**

```text
client input
 ↓
server receives data
 ↓
validation
 ↓
400 response
 ↓
client displays error
```

Learn:

* HTTP status codes
* server-side validation
* structured errors
* client/server responsibility

**Break:** Remove client validation and prove the server still protects itself.

---

## Lesson 008 — TypeScript Doesn't Validate Reality

**Problem:** Someone bypasses the React application and sends:

```json
{
  "name": 42,
  "postalCode": ["Boston"]
}
```

**Relationship:**

```text
unknown network data
 ↓
runtime
 ↓
validation
 ↓
trusted application data
 ↓
TypeScript representation
```

Learn the critical boundary:

```text
TypeScript types ≠ runtime validation
```

Build a small validation function.

**Challenge:** Return field-specific errors.

---

# Phase 3 — Data Crosses Boundaries

---

## Lesson 009 — Query Parameters Are Data Too

**Problem:** Search customers by name.

```text
GET /customers?search=cedar
```

**Relationship:**

```text
React search input
 ↓
state
 ↓
URL query parameter
 ↓
HTTP
 ↓
Express parsing
 ↓
filter
 ↓
response
 ↓
results UI
```

Learn:

* query strings
* URL encoding
* request parsing
* filtering
* loading state

**Challenge:** Add `status=active`.

---

## Lesson 010 — The URL Can Represent UI State

**Problem:** A search should survive refresh and be shareable.

```text
/search?query=cedar
```

**Relationship:**

```text
UI state
 ↕
URL
 ↕
HTTP request
```

Learn why URLs aren't merely navigation.

**Challenge:** Share a filtered result through a copied URL.

---

## Lesson 011 — Separate Unknown Data From Known Data

**Problem:** An external API returns data that doesn't match your internal shape.

```text
external API
 ↓
unknown response
 ↓
validation/translation
 ↓
internal Product
 ↓
React
```

Learn:

* API boundaries
* DTO-like structures
* transformation
* TypeScript types
* runtime trust

**Challenge:** Rename external fields without leaking the external API shape into React.

---

## Lesson 012 — Errors Cross the Network

**Problem:** The API can fail in several different ways.

```text
validation error
not found
unauthorized
server failure
```

Build a consistent response structure.

**Relationship:**

```text
server failure
 ↓
HTTP status
 ↓
JSON error
 ↓
fetch
 ↓
application state
 ↓
UI
```

Learn:

* error contracts
* status codes
* error narrowing
* UI error states

---

# Phase 4 — Persistence

Now:

```text
React
 ↓
HTTP
 ↓
Express
 ↓
database
 ↓
Express
 ↓
HTTP
 ↓
React
```

---

## Lesson 013 — Data Should Survive Restarting

**Problem:** A customer added through the API disappears when the server restarts.

Introduce SQLite.

```text
src/lessons/013-persistence/
├── web/
├── api/
│   ├── server.ts
│   └── db.ts
└── data/
    └── app.sqlite
```

**Relationship:**

```text
HTTP
 ↓
server
 ↓
database
 ↓
persistent data
```

Learn:

* persistence
* table
* row
* SQL
* INSERT
* SELECT

---

## Lesson 014 — An ID Gives Data Identity

**Problem:** Two customers have the same name.

```text
customer
 ├── id
 ├── name
 └── email
```

**Relationship:**

```text
real-world entity
 ↓
database row
 ↓
stable identity
 ↓
URL/API
```

Learn:

* primary keys
* IDs
* identity
* path parameters
* lookup

---

## Lesson 015 — Customers Have Orders

**Problem:** One customer can have many orders.

Tables:

```text
customers
orders
```

Relationship:

```text
customer
   1
   |
   |
   N
 orders
```

Build:

```text
GET /customers/:id/orders
```

Learn:

* foreign keys
* one-to-many
* relationships
* SQL filtering

---

## Lesson 016 — Joining Two Kinds of Information

**Problem:** The UI needs:

```text
Alice — Order #1042 — $1,240
Alice — Order #1051 — $400
```

**Relationship:**

```text
two tables
 ↓
relationship
 ↓
JOIN
 ↓
API representation
 ↓
React list
```

Learn SQL joins **because the UI requires related information**.

---

## Lesson 017 — What Does "Delete" Mean?

**Problem:** A customer asks to remove an order.

Explore:

```text
DELETE
```

and the consequences for related data.

**Relationship:**

```text
user action
 ↓
authorization question
 ↓
database operation
 ↓
relationship constraints
 ↓
response
```

Introduce foreign-key constraints.

---

## Lesson 018 — The Database Can Protect You

**Problem:** Your API accidentally tries to insert an order for a nonexistent customer.

Let the database reject it.

Learn:

* constraints
* application validation
* database validation
* defense in depth

Critical relationship:

```text
application rules
 +
database rules
```

---

# Phase 5 — Real Application State

---

## Lesson 019 — Loading Is Not Nothing

**Problem:** A search takes 1.5 seconds.

Simulate latency.

```text
React
 ↓
loading
 ↓
request
 ↓
response
 ↓
success/error
```

Learn:

* asynchronous state
* loading state
* race awareness
* user experience

---

## Lesson 020 — Two Requests Can Finish in the Wrong Order

**Problem:** User searches:

```text
ce
```

then immediately:

```text
cedar
```

The older request finishes last.

**Relationship:**

```text
user actions
 ↓
concurrent requests
 ↓
responses
 ↓
state ownership
```

Explore request cancellation or stale-response protection.

This is where concurrency stops being theoretical.

---

## Lesson 021 — Don't Put Everything in State

**Problem:** A product screen stores:

```text
products
filteredProducts
productCount
searchTerm
```

and values get out of sync.

Learn:

```text
source state
 ↓
derived value
 ↓
render
```

Explore derived state.

---

## Lesson 022 — Components Need Boundaries

**Problem:** A customer page becomes one 400-line component.

Break it into:

```text
CustomerPage
 ├── CustomerHeader
 ├── OrderList
 ├── OrderRow
 └── EmptyState
```

**Relationship:**

```text
UI responsibility
 ↓
component boundary
 ↓
props
 ↓
composition
```

Learn component design through an actual maintenance problem.

---

## Lesson 023 — Two Components Need the Same State

**Problem:** A filter controls both a list and a result summary.

```text
CustomerPage
 ├── Filter
 ├── OrderList
 └── ResultSummary
```

Move ownership upward.

Learn:

* lifting state
* props
* one source of truth
* data flow

---

# Phase 6 — Authentication

---

## Lesson 024 — Who Is Making This Request?

Build:

```text
src/lessons/024-login/
├── web/
│   ├── Login.tsx
│   └── Account.tsx
└── api/
    ├── server.ts
    ├── users.ts
    └── auth.ts
```

Flow:

```text
login form
 ↓
POST /login
 ↓
find user
 ↓
verify password
 ↓
establish session
 ↓
cookie
```

Learn:

* password hashing concept
* authentication
* sessions
* cookies
* identity

---

## Lesson 025 — The Browser Automatically Carries Something

**Problem:** After login, `/me` needs to know who you are.

```text
GET /me
 ↓
Cookie
 ↓
session lookup
 ↓
user
```

Explore:

* `Set-Cookie`
* browser cookie behavior
* request cookies
* HttpOnly
* SameSite
* Secure

**Break:** Remove the cookie and watch authentication disappear.

---

## Lesson 026 — Authentication Is Not Authorization

**Problem:** Alice is logged in but tries to access Bob's document.

```text
Alice
 ↓
authenticated
 ↓
GET /documents/bob-123
 ↓
ownership check
 ↓
403
```

Learn:

```text
Authentication = who are you?

Authorization = may you do this?
```

This distinction is learned through the failure.

---

## Lesson 027 — Never Trust the ID in the URL

**Problem:**

```text
GET /documents/doc-123
```

doesn't mean the current user owns `doc-123`.

Build ownership checks.

**Relationship:**

```text
authenticated identity
 +
requested resource
 ↓
authorization decision
```

---

## Lesson 028 — Roles Are Another Authorization Relationship

Users:

```text
Alice — member
Bob   — manager
Sara  — admin
```

Build:

```text
GET /admin/reports
```

Learn roles and permissions.

Then deliberately make the UI hide the button while the API still rejects unauthorized users.

This teaches:

> UI hiding is not security.

---

# Phase 7 — Forms Become Real

---

## Lesson 029 — Server Errors Belong to the Form

Build a registration form.

Server returns:

```json
{
  "fields": {
    "email": "Already registered",
    "password": "Too short"
  }
}
```

**Relationship:**

```text
React form
 ↓
API
 ↓
validation
 ↓
structured error
 ↓
React field state
```

Learn the API/UI error contract.

---

## Lesson 030 — Validation Has Layers

Registration requires:

```text
browser validation
 ↓
API validation
 ↓
database constraint
```

Deliberately bypass each layer.

Understand why no single layer is sufficient.

---

## Lesson 031 — Partial Updates

Build an account settings screen.

Compare:

```text
PUT
PATCH
```

with a real profile.

Learn:

```text
UI changes one field
 ↓
partial data
 ↓
API semantics
 ↓
database update
```

---

# Phase 8 — Search, Pagination, Data Shape

---

## Lesson 032 — Search a Real Dataset

Create 50 products.

```text
React search
 ↓
query parameter
 ↓
Express
 ↓
SQL WHERE
 ↓
results
```

Introduce:

* parameterized queries
* SQL injection
* indexes conceptually

Break it intentionally with unsafe SQL, then fix it.

---

## Lesson 033 — You Cannot Return Everything

Create enough records that returning all results becomes undesirable.

Build pagination.

```text
?page=2&pageSize=20
```

Relationship:

```text
UI page
 ↓
URL
 ↓
API
 ↓
SQL LIMIT/OFFSET
 ↓
metadata
 ↓
UI
```

---

## Lesson 034 — Pagination Is More Than LIMIT/OFFSET

Return:

```json
{
  "items": [],
  "page": 2,
  "pageSize": 20,
  "total": 147
}
```

Teach the relationship between:

```text
database result
 ↓
API contract
 ↓
navigation state
 ↓
UI
```

Then discuss cursor pagination conceptually.

---

# Phase 9 — Files and External Systems

---

## Lesson 035 — Upload a File

```text
src/lessons/035-file-upload/
├── web/
│   └── Upload.tsx
└── api/
    ├── server.ts
    └── uploads.ts
```

Relationship:

```text
browser File
 ↓
FormData
 ↓
multipart HTTP
 ↓
Express
 ↓
filesystem
 ↓
metadata
 ↓
response
 ↓
React
```

---

## Lesson 036 — File Metadata Is Data

Store:

```text
id
originalName
storedName
mimeType
size
uploadedBy
createdAt
```

Learn why the file itself and its database metadata are different concerns.

---

## Lesson 037 — Talk to Another API

Build a weather-style external service adapter using a public API.

```text
React
 ↓
your Express API
 ↓
external API
 ↓
transform
 ↓
your API contract
 ↓
React
```

Secrets remain server-side.

Learn:

* external API
* environment variables
* timeout
* error translation
* data transformation

---

## Lesson 038 — Webhooks Are Inbound Events

Build a fake payment provider.

```text
external system
 ↓
POST /webhooks/payment
 ↓
Express
 ↓
validate event
 ↓
update database
```

Then replay the webhook twice.

Discover idempotency.

---

# Phase 10 — Reliability

---

## Lesson 039 — Don't Assume Requests Succeed

Build a notification sender that randomly fails.

Explore:

```text
timeout
failure
retry
success
```

Learn:

* failure as normal behavior
* timeout
* retry
* backoff conceptually

---

## Lesson 040 — Duplicate Requests

Create:

```text
POST /orders
```

and simulate the browser sending it twice.

Discover duplicate orders.

Introduce idempotency keys.

```text
request
 ↓
idempotency key
 ↓
database
 ↓
already processed?
```

---

## Lesson 041 — Two Things Must Change Together

Build a transfer:

```text
Alice: $100
Bob:   $50
```

Transfer `$20`.

Break the operation halfway through.

Without a transaction:

```text
Alice = $80
Bob = $50
```

With a transaction:

```text
both change
or
neither changes
```

This teaches transactions through necessity.

---

## Lesson 042 — Background Work

A report takes 20 seconds.

Don't make the browser wait.

```text
React
 ↓
POST /reports
 ↓
server creates job
 ↓
202 Accepted
 ↓
background work
 ↓
status
 ↓
React polls
```

Learn:

* jobs
* asynchronous work
* HTTP `202`
* eventual completion
* polling

---

# Phase 11 — Realtime

---

## Lesson 043 — Polling Is Not Realtime

Build a notification counter.

First:

```text
React
 ↓
GET /notifications
 ↓
wait
 ↓
GET again
```

Then replace it with WebSocket communication.

Understand why the communication model changes.

---

## Lesson 044 — Server Push

Build:

```text
notification server
 ↓
WebSocket
 ↓
React
```

Send:

```text
"New order received"
```

Learn:

* persistent connection
* messages
* connection lifecycle
* reconnect considerations
* server/client responsibilities

---

# Phase 12 — Security as Systems Thinking

---

## Lesson 045 — The Browser Is Not Trusted

Take a previously simple API idea and attack it directly.

Try:

```text
wrong types
missing fields
extra fields
unexpected IDs
oversized values
unexpected content
```

Build the server-side boundary.

This consolidates:

```text
untrusted input
 ↓
runtime validation
 ↓
trusted internal data
```

---

## Lesson 046 — XSS Is a Data-to-Code Problem

Build a comment system.

User submits:

```html
<script>...</script>
```

Explore safe rendering versus interpreting content as HTML.

Relationship:

```text
user data
 ↓
storage
 ↓
API
 ↓
React
 ↓
HTML
```

Understand where code/data boundaries matter.

---

## Lesson 047 — CSRF and Cookies

Build cookie-authenticated state-changing requests.

Understand why:

```text
cookie automatically sent
```

creates a different threat model from manually supplied authorization data.

Explore SameSite and CSRF protection conceptually.

---

## Lesson 048 — CORS Is Not Authentication

Create:

```text
frontend origin
backend origin
```

and observe browser restrictions.

Learn:

```text
browser security policy
 ≠
API authorization
```

Then deliberately configure CORS too broadly.

---

# Phase 13 — Testing

---

## Lesson 049 — Test the Rule, Not the Implementation

Build a shipping-cost function.

Test:

```text
under 5kg
over 5kg
international
invalid weight
```

Learn what a unit test actually protects.

---

## Lesson 050 — Test an API Boundary

Build an independent order API and test:

```text
POST valid order → 201
POST invalid order → 400
GET missing order → 404
unauthenticated → 401
wrong owner → 403
```

Relationship:

```text
HTTP contract
 ↓
test
 ↓
server behavior
```

---

## Lesson 051 — Database Integration Test

Build:

```text
create customer
 ↓
create order
 ↓
query customer orders
 ↓
assert result
```

Use a test database.

Learn why an integration test is different from a unit test.

---

## Lesson 052 — Test the UI's Behavior

Build a login UI test.

Test:

```text
user enters credentials
 ↓
submits
 ↓
loading
 ↓
success
 ↓
account appears
```

Then test failure.

Focus on observable behavior rather than component internals.

---

# Phase 14 — Architecture Emerges From Problems

---

## Lesson 053 — The Route Is Doing Too Much

Start with:

```text
POST /orders
```

where one Express handler does:

```text
validation
authentication
business logic
SQL
response formatting
```

It works.

Then requirements change.

Refactor into boundaries:

```text
route
 ↓
service
 ↓
repository
 ↓
database
```

Learn **why** separation exists rather than memorizing a folder architecture.

---

## Lesson 054 — Data Shapes Change at Boundaries

Build:

```text
database row
 ↓
domain object
 ↓
API response
 ↓
React view model
```

They should not automatically be identical.

Learn when duplication of types is useful.

---

## Lesson 055 — One Module Should Not Know Everything

Create a small project-management experiment.

Initially:

```text
projects.ts
```

contains everything.

Refactor based on responsibilities:

```text
projects/
├── routes.ts
├── service.ts
├── repository.ts
└── types.ts
```

The lesson is not "use this architecture."

The lesson is:

> **What pressure causes a boundary to become useful?**

---

## Lesson 056 — Configuration Is Different From Code

Build an API that needs:

```text
database URL
session secret
external API key
port
```

Separate:

```text
configuration
secrets
code
environment
```

Understand why secrets don't belong in source control.

---

# Phase 15 — Performance and Scale

---

## Lesson 057 — Find the Slow Part

Build an intentionally slow product list.

Use:

```text
browser timing
network timing
server timing
database timing
```

Find where the time actually went.

This teaches performance as diagnosis, not folklore.

---

## Lesson 058 — Indexes Exist Because Queries Have Costs

Create a sufficiently large table.

Compare a query with and without an appropriate index.

Understand:

```text
query
 ↓
database execution
 ↓
work
 ↓
index
 ↓
less work
```

---

## Lesson 059 — Caching Changes Correctness

Cache product information.

Then update the product.

Observe stale data.

Learn:

```text
performance
 ↓
cache
 ↓
staleness
 ↓
invalidation
```

The important lesson is that caching is not simply "make it faster."

---

# Phase 16 — Software Is Built From Requirements

---

## Lesson 060 — Turn Requirements Into Data and Behavior

Given:

> Employees can create projects and assign members.

The learner must derive:

```text
entities
relationships
operations
permissions
```

Produce:

```text
Employee
Project
ProjectMember
```

and API operations.

No framework-specific solution is initially provided.

---

## Lesson 061 — Requirements Contain Hidden Security Rules

Given:

> A project member can edit project documents, but only project owners can delete the project.

Derive:

```text
authentication
 ↓
membership
 ↓
role
 ↓
authorization
 ↓
resource operation
```

Implement the experiment.

---

## Lesson 062 — Requirements Contain Hidden State Machines

Build an order:

```text
draft
 ↓
submitted
 ↓
paid
 ↓
shipped
 ↓
delivered
```

Prevent:

```text
delivered → draft
```

Learn:

* state machines
* valid transitions
* discriminated unions
* database constraints
* business rules

---

# Phase 17 — Integration Thinking

---

## Lesson 063 — Build a Small Project Workspace

Independent experiment:

```text
users
projects
documents
```

Users can:

* create projects
* invite members
* upload documents
* search documents

The learner designs the relationships.

This combines:

```text
React
HTTP
Express
TypeScript
SQL
authentication
authorization
files
search
```

but remains one small independent experiment.

---

## Lesson 064 — Add Notifications

Extend the **same lesson experiment**, not another lesson's code:

```text
project invitation
 ↓
notification
 ↓
database
 ↓
API
 ↓
React
```

Then optionally make notifications realtime.

---

## Lesson 065 — Make Failure Explicit

Take the project experiment and identify:

```text
database failure
file failure
authorization failure
network failure
validation failure
concurrent update
```

Design the behavior for each.

This is an important transition from:

> "I can make the happy path work"

to:

> "I can design software."

---

# Phase 18 — Synthesis

These are deliberately less prescriptive.

---

## Lesson 066 — Build From a Blank Requirement

Requirement:

> A small company needs a customer portal where customers can view invoices, download invoice PDFs, and see payment status.

The learner must determine:

```text
UI
API
data model
authentication
authorization
file handling
status representation
errors
testing
```

The agent evaluates the reasoning, not merely the finished application.

---

## Lesson 067 — Build a Searchable Document System

Requirement:

> Users can upload documents, search them by filename, filter by owner, and download them.

Required reasoning:

```text
browser File
 ↓
multipart
 ↓
server
 ↓
storage
 ↓
metadata
 ↓
database
 ↓
query
 ↓
authorization
 ↓
download
```

---

## Lesson 068 — Build an Event-Driven System

Requirement:

> When an order is created, an audit record should be stored and the user's notification count should update.

Learner decides:

```text
synchronous?
background job?
event?
database transaction?
WebSocket?
```

The lesson evaluates architectural reasoning.

---

## Lesson 069 — Build a Small SaaS Feature

Requirement:

> Teams can create projects. Project owners invite members. Members create tasks. Owners can archive projects. Members cannot access another team's projects.

The learner must derive:

```text
identity
teams
membership
roles
projects
tasks
authorization
database relationships
API
React state
```

---

## Lesson 070 — Debug an Unfamiliar System

Give the learner an intentionally unfamiliar small application.

No tutorial.

Provide:

```text
symptom:
"Creating an order sometimes displays the wrong customer."
```

The learner must:

```text
reproduce
 ↓
inspect browser
 ↓
inspect HTTP
 ↓
inspect server
 ↓
inspect database
 ↓
identify boundary
 ↓
form hypothesis
 ↓
test hypothesis
 ↓
fix
 ↓
write regression test
```

This is one of the most important lessons in the curriculum.

---

# Phase 19 — Final Engineering Problems

---

## Lesson 071 — Read Documentation to Solve a Problem

Give a requirement involving an unfamiliar library/API.

The learner is explicitly expected to Google.

They must document:

```text
What problem does this library solve?
What API do I need?
What data goes in?
What comes out?
What are the important constraints?
```

Then implement only what is necessary.

The lesson teaches **using documentation**, not memorizing libraries.

---

## Lesson 072 — Replace a Piece of the Stack

Take a small experiment and replace one implementation.

For example:

```text
SQLite
```

with another SQL database.

The learner identifies what should remain unchanged:

```text
React
API contract
business rules
domain concepts
```

and what changes:

```text
database connection
queries
configuration
```

This teaches abstraction through necessity.

---

## Lesson 073 — Design Before Coding

Give:

> "Users need to share documents with other users."

Before coding, produce:

```text
entities
relationships
permissions
API operations
failure cases
security boundaries
UI states
```

Only then implement.

---

## Lesson 074 — Find the Boundary

Give a deliberately ambiguous requirement:

> "Only managers can approve expenses."

The learner must ask:

```text
Who is a manager?
Where is that information stored?
Who authenticates the request?
Where is authorization checked?
What does approval change?
Can approval happen twice?
What happens concurrently?
```

This teaches requirements analysis.

---

## Lesson 075 — Design for Failure

Requirement:

> "Send an email whenever an invoice is paid."

Learner must reason through:

```text
payment succeeds
email fails

payment succeeds
request times out

webhook repeats

email provider is unavailable

server crashes after payment but before email

email sends twice
```

Then design the system.

---

# Final Challenge Set

The curriculum ends with independent projects—not one giant application.

Each is a fresh playground experiment.

---

## Lesson 076 — Build a Customer Portal

Required:

```text
authentication
authorization
customers
invoices
pagination
search
errors
tests
```

No step-by-step implementation.

---

## Lesson 077 — Build a File Workspace

Required:

```text
authentication
ownership
upload
metadata
download
search
permissions
```

---

## Lesson 078 — Build a Team Project System

Required:

```text
users
teams
membership
roles
projects
tasks
authorization
database relationships
React state
API
testing
```

---

## Lesson 079 — Build an External-Service Integration

Requirement:

> Your application receives external events and updates local data.

Must reason about:

```text
webhooks
validation
idempotency
database
errors
retries
security
```

---

## Lesson 080 — Build a Realtime Dashboard

Requirement:

> Several users should see operational events as they happen.

Must reason about:

```text
initial HTTP state
 ↓
WebSocket
 ↓
events
 ↓
React state
 ↓
reconnection
 ↓
authorization
```

---

# Final Lesson — 081: The Software Problem

No predefined application.

The learner receives only:

> **"Build something useful."**

The requirements must be supplied as a short real-world brief.

The learner must independently determine:

```text
What are the entities?

What data exists?

Who owns it?

What relationships exist?

What happens in the browser?

What state exists?

What crosses HTTP?

What belongs on the server?

What needs runtime validation?

What needs TypeScript?

What belongs in the database?

What constraints belong in the database?

Who is authenticated?

Who is authorized?

What happens when things fail?

What should be synchronous?

What should be asynchronous?

What needs testing?

Where are the module boundaries?

What should be looked up rather than memorized?
```

The implementation is secondary.

The final assessment is whether the learner can **reason through the system**.

---

# Concept Relationship Map

The curriculum repeatedly traverses these relationships:

```text
                         USER
                           │
                           ↓
                        BROWSER
                           │
              ┌────────────┼────────────┐
              ↓            ↓            ↓
            EVENT        URL         FILE
              │            │            │
              ↓            ↓            ↓
           REACT         HTTP       FormData
              │            │            │
              └────────────┼────────────┘
                           ↓
                        EXPRESS
                           │
              ┌────────────┼────────────┐
              ↓            ↓            ↓
        VALIDATION      AUTH          BUSINESS
              │            │           LOGIC
              │            │            │
              └────────────┼────────────┘
                           ↓
                       DATABASE
                           │
              ┌────────────┼────────────┐
              ↓            ↓            ↓
         IDENTITY      RELATIONS    CONSTRAINTS
              │            │            │
              └────────────┼────────────┘
                           ↓
                       RESPONSE
                           │
                           ↓
                         REACT
                           │
                           ↓
                           UI
```

And around the entire system:

```text
                 ┌──────────────────────┐
                 │       SECURITY       │
                 │                      │
                 │ trust boundaries     │
                 │ authentication       │
                 │ authorization        │
                 │ validation           │
                 │ secrets              │
                 │ XSS / CSRF / CORS    │
                 └──────────────────────┘

                 ┌──────────────────────┐
                 │     ENGINEERING      │
                 │                      │
                 │ requirements         │
                 │ debugging            │
                 │ testing              │
                 │ logging              │
                 │ architecture        │
                 │ failure handling     │
                 └──────────────────────┘
```

TypeScript is **not another layer beside these**.

It appears wherever the program needs to reason precisely about data:

```text
UI data
 ↓
function contract
 ↓
HTTP data
 ↓
validated data
 ↓
domain data
 ↓
database result
 ↓
API response
 ↓
UI data
```

---

# Coverage Matrix

| Concept                    | First meaningful encounter | Revisited                   |
| -------------------------- | -------------------------: | --------------------------- |
| Values/functions           |                        001 | throughout                  |
| React state                |                        001 | 003, 006, 019–023           |
| Objects/arrays             |                        002 | throughout                  |
| TypeScript object shapes   |                        002 | 008, 011, 054               |
| Unions/state modeling      |                        003 | 062                         |
| HTTP                       |                        004 | throughout                  |
| Express routes             |                        004 | throughout                  |
| JSON                       |                        004 | throughout                  |
| Async/await                |                        004 | 019, 020, 039               |
| Path parameters            |                        005 | 027                         |
| Forms                      |                        006 | 029–031                     |
| POST/request bodies        |                        006 | throughout                  |
| Runtime validation         |                        008 | 030, 045                    |
| Compile/runtime boundary   |                        008 | 011, 045                    |
| Query parameters           |                        009 | 032–034                     |
| URLs as state              |                        010 | 033                         |
| API contracts              |                        011 | 012, 054                    |
| Error handling             |                        012 | 019, 039, 065               |
| Persistence                |                        013 | throughout database lessons |
| IDs                        |                        014 | 027, 054                    |
| Relationships              |                        015 | 016, 060, 069               |
| SQL joins                  |                        016 | 060+                        |
| Constraints                |                        018 | 041, 062                    |
| Derived state              |                        021 | throughout React            |
| Components/props           |                        022 | 023, 055                    |
| State ownership            |                        023 | later React work            |
| Authentication             |                        024 | 025–028, 069                |
| Cookies                    |                        025 | 047                         |
| Authorization              |                        026 | 027, 028, 061               |
| Ownership                  |                        027 | 069                         |
| Roles                      |                        028 | 061                         |
| Form/API errors            |                        029 | 065                         |
| Layered validation         |                        030 | 045                         |
| PUT/PATCH                  |                        031 | API design                  |
| Search                     |                        032 | 033, 067                    |
| Pagination                 |                        033 | 034, 076                    |
| File uploads               |                        035 | 067                         |
| External APIs              |                        037 | 071, 079                    |
| Webhooks                   |                        038 | 079                         |
| Idempotency                |                        038 | 040, 079                    |
| Retries/timeouts           |                        039 | 075                         |
| Transactions               |                        041 | 065, 079                    |
| Background jobs            |                        042 | 068, 075                    |
| WebSockets                 |                    043–044 | 068, 080                    |
| XSS                        |                        046 | security reasoning          |
| CSRF                       |                        047 | security reasoning          |
| CORS                       |                        048 | 037, 071                    |
| Unit testing               |                        049 | 065                         |
| API testing                |                        050 | 076+                        |
| Integration testing        |                        051 | 076+                        |
| UI testing                 |                        052 | 076+                        |
| Architecture               |                    053–056 | 060–081                     |
| Configuration              |                        056 | 037, 071                    |
| Performance                |                    057–059 | 067+                        |
| Requirements decomposition |                        060 | 073–081                     |
| State machines             |                        062 | final challenges            |
| Debugging                  |                   057, 070 | 071–081                     |
| Documentation/Google       |                        071 | final challenges            |
| Data modeling              |                   060, 073 | 076–081                     |
| Failure design             |                   065, 075 | 079–081                     |

---

# The resulting mental model

The learner should eventually stop seeing:

```text
React
TypeScript
Express
SQL
```

as four separate things.

Instead:

```text
                    SOFTWARE PROBLEM
                           │
                           ↓
                        DATA
                           │
                  ┌────────┴────────┐
                  ↓                 ↓
                UI              SERVER
                  │                 │
                React           Express
                  │                 │
                  └────── HTTP ─────┘
                           │
                           ↓
                       DATA BOUNDARY
                           │
                    validation/types
                           │
                           ↓
                       DOMAIN LOGIC
                           │
                           ↓
                       DATABASE
                           │
                    ┌──────┴──────┐
                    ↓             ↓
                identity       state
                    │             │
                    └──────┬──────┘
                           ↓
                       SECURITY
                           │
                           ↓
                     failure handling
                           │
                           ↓
                       TESTING
```

That is the thing the curriculum is ultimately teaching: **how a software system works as a collection of connected boundaries, data, behavior, and responsibilities**.

The frameworks are simply the concrete machinery through which those relationships are experienced.
