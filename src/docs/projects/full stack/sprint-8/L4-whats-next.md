# Sprint 8 · Lesson 4 — What's next

## Where you are now

You built a complete production full-stack application from scratch:

| Sprint | What you built |
|--------|----------------|
| 1 | React + FastAPI development environment, HTTP request/response, CORS |
| 2 | Python data structures, Pydantic validation, CRUD API, React UI |
| 3 | Docker, PostgreSQL, SQLAlchemy ORM, Alembic migrations |
| 4 | bcrypt password hashing, JWT authentication, protected endpoints, React auth |
| 5 | pytest with real database, edge case tests, React Testing Library, GitHub Actions CI |
| 6 | SQL injection prevention, IDOR, XSS/CORS/security headers, rate limiting, secrets management |
| 7 | Repository pattern, service layer, domain exceptions, SOLID principles |
| 8 | Multi-stage Dockerfiles, Nginx reverse proxy, VPS deployment, structured logging, Sentry |

This is not a toy. It has authentication, authorisation, automated tests, a deployment pipeline, and production observability. Every concept is industry-standard and appears in production systems at scale.

This lesson maps the territory you have not yet covered — not to overwhelm you, but to give you landmarks. Each topic below is a coherent area of study. Pick one based on what problem you are trying to solve.

---

## Async task processing: Celery + Redis

**The problem:** Some operations are too slow to do during a request. Sending an email, generating a PDF report, processing an uploaded image, running a machine learning inference — these take seconds or minutes. The user should not wait at an HTTP connection for that long.

**The solution:** A **message queue** and **background workers**.

When a work order is created, instead of sending the confirmation email in the route handler:

```python
# Instead of this (blocks the response for ~3 seconds):
email_service.send_confirmation(user.email, order)
return new_order

# Do this (returns immediately, email sent in background):
celery_app.send_task('tasks.send_confirmation_email', args=[user.email, order.id])
return new_order
```

**Celery** is a Python task queue. **Redis** is an in-memory data store used as the message broker: route handlers write task messages to Redis; Celery workers read from Redis and execute the tasks.

**The architecture:**

```
FastAPI → Redis (task queue) → Celery Worker(s) → email/PDF/ML
```

Multiple Celery workers can process tasks in parallel. Tasks can be retried on failure. Failed tasks appear in Celery's monitoring UI (Flower). This architecture handles any operation that should not block an HTTP response.

**Where to start:** `celery[redis]` package, `celery.Celery` app instance, `@celery_app.task` decorator, `docker compose` Redis service.

---

## Real-time communication: WebSockets

**The problem:** HTTP is request-response — the client always initiates. For a chat application, a live dashboard, or collaborative editing, the server needs to push data to the client without waiting for a request.

**WebSockets** provide a persistent bidirectional connection. The HTTP handshake upgrades to a WebSocket connection; after that, either side can send messages at any time.

```python
from fastapi import WebSocket

@app.websocket("/ws/orders")
async def orders_websocket(websocket: WebSocket, db: Session = Depends(get_db)):
    await websocket.accept()
    try:
        while True:
            # Wait for client message (or timeout)
            data = await websocket.receive_text()
            # Or push server-side updates:
            orders = repo.get_all_for_user(current_user.id)
            await websocket.send_json([o.dict() for o in orders])
    except WebSocketDisconnect:
        pass
```

**React side:**

```typescript
const ws = new WebSocket('wss://workorders.yourdomain.com/ws/orders')
ws.onmessage = (event) => setOrders(JSON.parse(event.data))
```

**Where to start:** FastAPI's WebSocket documentation, `WebSocketDisconnect` exception handling, broadcasting to multiple connections (requires a broadcast mechanism — Redis pub/sub or a connection manager).

---

## Alternative API paradigm: GraphQL

**The problem:** REST APIs have fixed response shapes. If the frontend needs `id`, `title`, and `username` (from a join), it might need two REST calls (get order, then get user) or one REST call that returns all fields (over-fetching). For complex data requirements, this is inefficient.

**GraphQL** is a query language for APIs. Clients specify exactly what data they need; the server returns exactly that.

```graphql
query {
  orders(userId: 7) {
    id
    title
    owner {
      username
    }
  }
}
```

Returns only `id`, `title`, and `owner.username` — no other fields. One request, regardless of how many relationships are traversed.

**Strawberry** is the leading FastAPI-compatible GraphQL library:

```python
import strawberry
from strawberry.fastapi import GraphQLRouter

@strawberry.type
class WorkOrderType:
    id: int
    title: str

@strawberry.type
class Query:
    @strawberry.field
    def orders(self) -> list[WorkOrderType]:
        return db.query(WorkOrderModel).all()

schema = strawberry.Schema(query=Query)
graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")
```

**When to use REST vs. GraphQL:** REST is simpler, well-understood, and the right choice for most CRUD APIs. GraphQL shines when: frontend teams need flexible data fetching, the data graph is complex and deeply nested, or multiple client types (web, mobile, third-party) need different subsets of the same data.

**Where to start:** Strawberry documentation, the N+1 problem (and how DataLoader solves it), GraphQL subscriptions for real-time data.

---

## Microservices

**The problem:** At scale, a single monolith (one Python process handling everything) has bottlenecks: the entire application must be deployed together, scaled together, and fails together.

**Microservices** split the application into small, independently deployable services. The work order application might split into:

```
auth-service       → handles registration, login, token issuance
orders-service     → CRUD for work orders
notifications-service → emails, Slack messages
```

Each service is a separate FastAPI application, Docker container, and deployment unit. Services communicate via HTTP (synchronous) or message queues (asynchronous).

**The cost:** Microservices introduce distributed system complexity: network failures between services, eventual consistency, distributed tracing, separate deployment pipelines, and inter-service authentication. The general advice: start as a monolith, extract services when a specific scaling or team boundary demands it. The layered architecture from Sprint 7 makes extraction easier — the service layer becomes the extraction boundary.

**Where to start:** Domain-driven design (finding service boundaries), gRPC (typed, high-performance inter-service communication), Kubernetes (orchestrating many services), OpenTelemetry (distributed tracing).

---

## Kubernetes

**The problem:** `docker compose` manages containers on one server. When traffic grows past what one server can handle, you need to run multiple servers, automatically add servers when traffic spikes, and roll out deployments without downtime.

**Kubernetes** orchestrates containers across a cluster of servers. You describe the desired state ("run 3 replicas of the backend, each with 512MB RAM"); Kubernetes ensures that state is maintained. If a container crashes, Kubernetes replaces it. If a server fails, Kubernetes reschedules its containers on healthy servers.

Key concepts:
- **Pod:** one or more containers that share a network namespace
- **Deployment:** manages a set of identical pods, handles rolling updates
- **Service:** a stable network endpoint for a set of pods
- **Ingress:** routes external traffic to services (replaces Nginx in Kubernetes)
- **ConfigMap/Secret:** manage configuration and secrets

**Where to start:** `minikube` for local Kubernetes, `kubectl` CLI, writing a Deployment manifest for the FastAPI backend, understanding the difference between a Service and an Ingress.

---

## What you actually need next

Most developers who finish this curriculum should focus on:

**1. Build more things.** Pick a project that interests you — something real enough to need authentication, a database, and a frontend. Apply what you learned. The second full-stack application is where the concepts solidify.

**2. Deepen Python.** Generators, context managers, async/await internals, `__dunder__` methods, metaclasses, typing module, pytest fixtures. These are the tools that make you fast in Python.

**3. Deepen TypeScript/React.** Generics, conditional types, React Query (server state management), Next.js (server-side rendering), Suspense, concurrent mode. The frontend ecosystem moves fast — the fundamentals from Sprint 1-4 are stable, but the patterns evolve.

**4. SQL and database design.** Entity-relationship modelling, normal forms, indexes and query plans, transactions and isolation levels, `EXPLAIN ANALYZE`. A developer who understands SQL design decisions is valuable on any team.

**5. System design.** How to design a URL shortener, a rate limiter, a notification system, a search engine. System design practice builds the vocabulary and mental models for architecting large systems.

---

## The arc

You started with "how do I run Python" and ended with "how do I deploy a production application." The path:

```
Environment → Server → Frontend → Connect them
→ Data structures → Validation → CRUD → React UI
→ Docker → SQL → ORM → Migrations
→ Auth → JWT → Protected endpoints → React auth
→ Tests → Edge cases → Frontend tests → CI
→ SQL injection → IDOR → XSS → Rate limiting
→ Architecture → Repository → Service → SOLID
→ Containers → Deploy → Logging → Observability
```

Each lesson was a rung. You climbed 32 rungs. The top of this ladder is the bottom of the next one. That is how the field works.

---

## Definition of done

- [ ] You can explain what Celery solves and give a concrete use case from this application
- [ ] You can explain when you would choose WebSockets over HTTP polling
- [ ] You can explain the tradeoff between microservices and a monolith, and when to extract
- [ ] You know what your next learning focus is and why

No git commit for this lesson — it is a map, not code.
