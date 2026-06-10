# Drill 5.4 — gRPC and Protocol Buffers: Typed Contracts Between Services

**Standalone drill. No prerequisites except basic Python.**
**Time estimate:** 75–90 minutes
**Environment:** Python 3.8+ — `pip install grpcio grpcio-tools`
**What you will build:** A gRPC service defined in a `.proto` file, a generated Python server and client, then a streaming RPC that pushes data continuously. Contrast the wire format with JSON to see why Protocol Buffers are smaller and faster.
**What you will understand:** What Protobuf encoding actually is, why gRPC uses HTTP/2, what the four RPC types are, and when gRPC beats REST.

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. JSON sends field names as strings with every message. A message `{"user_id": 42, "name": "alice"}` repeats "user_id" and "name" every time. Protocol Buffers don't include field names. How do they identify fields?

2. REST over HTTP/1.1 requires a new TCP connection (or a connection pool) per request. gRPC uses HTTP/2. What does HTTP/2 provide that makes many simultaneous RPCs more efficient?

3. You define a Protobuf message with a field `string name = 1`. Later you need to add a `string email` field. You add it as `string email = 2`. An old client that doesn't know about field 2 receives the new message. What happens?

4. When would you use gRPC instead of REST? Name two concrete scenarios where gRPC's properties make it the better choice.

*(Answers at the bottom.)*

---

## The Concept: Protocol Buffers and gRPC

### Concept: Protocol Buffers — Binary Serialization with a Schema

**What it is:**
Protocol Buffers (Protobuf) is a binary serialization format. You define your data schema in a `.proto` file. A code generator (`protoc`) reads the `.proto` and generates typed serialization/deserialization code in your language. The wire format is compact binary, not human-readable text.

**The problem before:**
JSON serialization is convenient but has costs:
- Field names repeat with every message: `{"user_id": 42}` sends 7 bytes for the field name and 2 bytes for the value — 78% overhead
- No schema enforcement at compile time: a typo in a field name silently sends `null` instead of the value
- Parsing is slow: JSON parsers must handle arbitrary text, escape sequences, nested structures
- Types are weakly defined: `42` could be int or float, dates are strings with no enforced format

**The mechanism — field tagging:**
Protobuf assigns each field a number (the tag). On the wire, the format is: `(field_number << 3) | wire_type` followed by the value. For a message `{ user_id: 42, name: "alice" }`:

```
Field 1 (user_id), wire type 0 (varint): 0x08 0x2A
Field 2 (name), wire type 2 (length-delimited): 0x12 0x05 0x61 0x6C 0x69 0x63 0x65
```

Total: 9 bytes. The equivalent JSON `{"user_id":42,"name":"alice"}` is 26 bytes. The field names are gone — replaced by numbers that both sides agreed on in the `.proto` contract.

**VarInt encoding:**
Small integers are encoded in fewer bytes. The number 42 encodes as one byte (0x2A). The number 300 encodes as two bytes (0xAC 0x02). This is the `varint` wire type — each byte uses 7 bits for data and 1 bit to indicate "more bytes follow."

**Schema evolution:**
Adding a new field with a new number is backward-compatible — old code ignores unknown field numbers. Removing a field is safe (use `reserved` to prevent reuse of that field number). Changing a field's type or number is breaking.

**The `.proto` file:**
```protobuf
syntax = "proto3";

message User {
  int32 user_id = 1;
  string name = 2;
  string email = 3;
}
```

The numbers (1, 2, 3) are the field tags — they go on the wire, not the names.

---

### Concept: gRPC — RPC Framework Built on HTTP/2

**What it is:**
gRPC is a remote procedure call framework that uses Protocol Buffers for serialization and HTTP/2 for transport. You define service methods in a `.proto` file. `protoc` generates stub code — a server base class and a client stub. Your server implements the base class methods; clients call the stub as if calling a local function.

**The four RPC types:**
```
1. Unary:              client sends 1 request, server sends 1 response
   (like a function call)

2. Server streaming:   client sends 1 request, server streams N responses
   (like subscribing to a live feed)

3. Client streaming:   client streams N requests, server sends 1 response
   (like uploading a file in chunks)

4. Bidirectional:      both sides stream simultaneously
   (like a chat session or real-time game)
```

**Why HTTP/2:**
HTTP/1.1 handles one request per connection (without connection reuse tricks). Under high load, many parallel RPCs require many connections. HTTP/2 uses multiplexing: multiple logical streams share one TCP connection. An HTTP/2 frame includes a stream ID; 100 simultaneous RPCs share one connection with 100 stream IDs. This dramatically reduces TCP handshake overhead and connection pool pressure.

**Constraints:**
- `.proto` files define the contract — both client and server must use the same `.proto` (or compatible evolution)
- Browser support is limited — gRPC-Web is a separate protocol with a proxy translation layer
- Binary format is not human-readable — debugging requires tools like grpcurl or reflection
- Server streaming requires the connection to stay open for the duration of the stream

**Tradeoffs:**
- gRPC vs REST: gRPC has strict contracts (proto schema), lower wire overhead, native streaming, and generated client code. REST is more widely supported (any HTTP client), human-readable, and easier to debug with curl. For internal service-to-service calls: gRPC. For public APIs or browser clients: REST.
- gRPC vs GraphQL: GraphQL solves the over/under-fetching problem (flexible queries). gRPC solves the performance and contract problem. Both are better than naive REST for different reasons.

**Failure modes:**
- Proto field number collision: reusing a field number that was previously used for a different type corrupts deserialization. Always use `reserved` for removed fields.
- Forgetting to regenerate stubs after changing `.proto`: code compiles but sends wrong field tags
- Missing `servicer` registration: server starts but returns `UNIMPLEMENTED` for every call
- Large messages: Protobuf works best under 1MB — for large payloads, use streaming or store data elsewhere and send a reference

**Operational reality:**
gRPC is the dominant internal RPC protocol at Google, Uber, Netflix, and most large microservice architectures. The generated code gives you typed interfaces between services — a `UserService.GetUser(user_id=42)` call that fails at compile time if you pass the wrong type, versus a REST call that fails at runtime with a 400 Bad Request. The strict schema is both the main benefit and the main constraint.

**You will see this again in:**
Kubernetes API server communication, service mesh control planes (Envoy, Istio), gRPC gateway (REST-to-gRPC translation), PyTorch distributed training, TensorFlow Serving.

**Watch for:**
Run `python -m grpc_tools.protoc` AFTER editing your `.proto` file. The generated `_pb2.py` and `_pb2_grpc.py` files are what your code imports — if you change the `.proto` and forget to regenerate, your code uses the old schema.

---

## Step 1 — Define the Schema and Generate Code

Create `user_service.proto`:

```protobuf
syntax = "proto3";

package userservice;

// Unary RPC: get one user by ID
service UserService {
  rpc GetUser (GetUserRequest) returns (UserResponse);
  rpc CreateUser (CreateUserRequest) returns (UserResponse);
  rpc ListUsers (ListUsersRequest) returns (stream UserResponse);
}

message GetUserRequest {
  int32 user_id = 1;
}

message CreateUserRequest {
  string name = 1;
  string email = 2;
  int32 age = 3;
}

message ListUsersRequest {
  int32 limit = 1;  // 0 means no limit
}

message UserResponse {
  int32 user_id = 1;
  string name = 2;
  string email = 3;
  int32 age = 4;
  bool success = 5;
  string error = 6;  // empty string means no error
}
```

Generate the Python stubs:

```bash
python -m grpc_tools.protoc \
    -I. \
    --python_out=. \
    --grpc_python_out=. \
    user_service.proto
```

This creates two files:
- `user_service_pb2.py` — message classes (`GetUserRequest`, `UserResponse`, etc.)
- `user_service_pb2_grpc.py` — server base class and client stub

Inspect the generated wire format:

```python
# inspect_protobuf.py — compare Protobuf vs JSON size
import user_service_pb2
import json

user = user_service_pb2.UserResponse(
    user_id=42,
    name="alice",
    email="alice@example.com",
    age=30,
    success=True,
    error=""
)

protobuf_bytes = user.SerializeToString()
json_bytes = json.dumps({
    "user_id": 42,
    "name": "alice",
    "email": "alice@example.com",
    "age": 30,
    "success": True,
    "error": ""
}).encode()

print("=== Wire Format Comparison ===")
print(f"Protobuf:  {len(protobuf_bytes)} bytes")
print(f"JSON:      {len(json_bytes)} bytes")
print(f"Reduction: {(1 - len(protobuf_bytes)/len(json_bytes))*100:.0f}%")
print(f"\nProtobuf bytes (hex): {protobuf_bytes.hex()}")
print(f"\nRound-trip test:")
recovered = user_service_pb2.UserResponse.FromString(protobuf_bytes)
print(f"  user_id: {recovered.user_id}")
print(f"  name:    {recovered.name}")
print(f"  email:   {recovered.email}")
```

### SAVE AND TRY

```
python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. user_service.proto
python inspect_protobuf.py
```

Expected output:
```
=== Wire Format Comparison ===
Protobuf:  36 bytes
JSON:      79 bytes
Reduction: 54%

Protobuf bytes (hex): 082a120561...
Round-trip test:
  user_id: 42
  name:    alice
  email:   alice@example.com
```

**Change something:** Add a `string bio = 7` field to the proto with a long value (100+ characters). Regenerate and re-run. Watch the reduction percentage stay consistent regardless of string content length — strings are the same size in both formats (no per-field overhead for strings), but numeric fields are where Protobuf wins.

---

## Step 2 — Implement the Unary RPC Service

Create `server.py`:

```python
import grpc
from concurrent import futures
import user_service_pb2 as pb2
import user_service_pb2_grpc as pb2_grpc

# In-memory "database"
USERS = {
    1: {"name": "Alice", "email": "alice@example.com", "age": 30},
    2: {"name": "Bob",   "email": "bob@example.com",   "age": 25},
    3: {"name": "Carol", "email": "carol@example.com", "age": 35},
}
next_id = 4


class UserServiceServicer(pb2_grpc.UserServiceServicer):
    """Implement the service defined in user_service.proto."""

    def GetUser(self, request, context):
        user_id = request.user_id
        if user_id not in USERS:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details(f"User {user_id} not found")
            return pb2.UserResponse(success=False, error=f"User {user_id} not found")
        
        u = USERS[user_id]
        return pb2.UserResponse(
            user_id=user_id,
            name=u["name"],
            email=u["email"],
            age=u["age"],
            success=True,
        )

    def CreateUser(self, request, context):
        global next_id
        if not request.name or not request.email:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details("name and email are required")
            return pb2.UserResponse(success=False, error="name and email are required")
        
        user_id = next_id
        next_id += 1
        USERS[user_id] = {
            "name": request.name,
            "email": request.email,
            "age": request.age,
        }
        print(f"  Created user {user_id}: {request.name}")
        return pb2.UserResponse(
            user_id=user_id,
            name=request.name,
            email=request.email,
            age=request.age,
            success=True,
        )

    def ListUsers(self, request, context):
        # SERVER STREAMING: yield one response per user
        limit = request.limit if request.limit > 0 else len(USERS)
        count = 0
        for user_id, u in USERS.items():
            if count >= limit:
                break
            print(f"  Streaming user {user_id}: {u['name']}")
            yield pb2.UserResponse(
                user_id=user_id,
                name=u["name"],
                email=u["email"],
                age=u["age"],
                success=True,
            )
            count += 1


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    pb2_grpc.add_UserServiceServicer_to_server(UserServiceServicer(), server)
    server.add_insecure_port("[::]:50051")
    server.start()
    print("gRPC server listening on port 50051")
    server.wait_for_termination()


if __name__ == "__main__":
    serve()
```

Create `client.py`:

```python
import grpc
import user_service_pb2 as pb2
import user_service_pb2_grpc as pb2_grpc

def run():
    # Create a channel and stub
    with grpc.insecure_channel("localhost:50051") as channel:
        stub = pb2_grpc.UserServiceStub(channel)
        
        print("=== gRPC Client Demo ===\n")
        
        # Unary: get existing user
        print("1. GetUser(user_id=1):")
        response = stub.GetUser(pb2.GetUserRequest(user_id=1))
        print(f"   {response.name} <{response.email}> age={response.age}")
        
        # Unary: get nonexistent user
        print("\n2. GetUser(user_id=999):")
        try:
            response = stub.GetUser(pb2.GetUserRequest(user_id=999))
            print(f"   success={response.success}, error={response.error}")
        except grpc.RpcError as e:
            print(f"   gRPC error {e.code()}: {e.details()}")
        
        # Unary: create a new user
        print("\n3. CreateUser(name='Dave', email='dave@example.com', age=28):")
        response = stub.CreateUser(pb2.CreateUserRequest(
            name="Dave", email="dave@example.com", age=28
        ))
        print(f"   Created with user_id={response.user_id}")
        
        # Server streaming: list all users
        print("\n4. ListUsers(limit=0) — server streams all users:")
        for response in stub.ListUsers(pb2.ListUsersRequest(limit=0)):
            print(f"   [{response.user_id}] {response.name} <{response.email}>")

if __name__ == "__main__":
    run()
```

### SAVE AND TRY

Terminal 1:
```
python server.py
```

Terminal 2:
```
python client.py
```

Expected client output:
```
=== gRPC Client Demo ===

1. GetUser(user_id=1):
   Alice <alice@example.com> age=30

2. GetUser(user_id=999):
   gRPC error StatusCode.NOT_FOUND: User 999 not found

3. CreateUser(name='Dave', email='dave@example.com', age=28):
   Created with user_id=4

4. ListUsers(limit=0) — server streams all users:
   [1] Alice <alice@example.com>
   [2] Bob <bob@example.com>
   [3] Carol <carol@example.com>
   [4] Dave <dave@example.com>
```

Expected server output (while client runs):
```
gRPC server listening on port 50051
  Created user 4: Dave
  Streaming user 1: Alice
  Streaming user 2: Bob
  Streaming user 3: Carol
  Streaming user 4: Dave
```

**Change something:** In `client.py`, call `stub.GetUser(pb2.GetUserRequest(user_id=1))` but assign a field that doesn't exist: `response.nonexistent_field`. Python returns the default value (empty string or 0), not an error. Protobuf silently returns defaults for unknown fields — it does not raise `AttributeError`. This is by design: unknown fields in received messages get their zero value.

---

## Step 3 — Bidirectional Streaming and Metadata

Add to `user_service.proto`:

```protobuf
// Add to the UserService definition:
rpc Chat (stream ChatMessage) returns (stream ChatMessage);

message ChatMessage {
  string sender = 1;
  string text = 2;
  int64 timestamp = 3;
}
```

Regenerate: `python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. user_service.proto`

Add the bidirectional streaming handler to `server.py`:

```python
import time

def Chat(self, request_iterator, context):
    """Bidirectional streaming: echo messages back with a server prefix."""
    for message in request_iterator:
        print(f"  Chat from {message.sender}: {message.text}")
        # Server sends a response for each message received
        yield pb2.ChatMessage(
            sender="server",
            text=f"Echo: {message.text}",
            timestamp=int(time.time()),
        )
```

Add to `client.py`:

```python
import time

def send_messages():
    """Generator: yields messages to send to the server."""
    messages = ["hello server", "how are you?", "goodbye"]
    for msg in messages:
        yield pb2.ChatMessage(sender="client", text=msg, timestamp=int(time.time()))
        time.sleep(0.1)

# Add inside run():
print("\n5. Bidirectional Chat:")
for response in stub.Chat(send_messages()):
    print(f"   Server: {response.text}")
```

### SAVE AND TRY

Restart server, run client again. Expected additional output:
```
5. Bidirectional Chat:
   Server: Echo: hello server
   Server: Echo: how are you?
   Server: Echo: goodbye
```

The client sends three messages; the server echoes each one back. Both sides are streaming simultaneously over one HTTP/2 connection.

**Change something:** Add a `time.sleep(2)` in `send_messages()` between messages. The server receives each message as it arrives and responds immediately — you see the echo responses arrive 2 seconds apart. This demonstrates true streaming: the server does not buffer all client messages before responding.

---

## Challenge

**No solution provided. Requirements checklist only.**

Build a gRPC service for a task manager — define the proto schema and implement the full server and client.

**Requirements checklist:**

- [ ] `task_service.proto` defines a `TaskService` with these RPCs:
  - `CreateTask(CreateTaskRequest) returns (TaskResponse)` — create a task with title, description, priority (HIGH/MEDIUM/LOW enum)
  - `GetTask(GetTaskRequest) returns (TaskResponse)` — get one task by ID
  - `UpdateTaskStatus(UpdateStatusRequest) returns (TaskResponse)` — change status to PENDING/IN_PROGRESS/DONE (enum)
  - `ListTasks(ListTasksRequest) returns (stream TaskResponse)` — stream all tasks, optionally filtered by status
  - `WatchTask(GetTaskRequest) returns (stream TaskResponse)` — stream status updates for one task every 2 seconds (for live monitoring)
- [ ] Priority and Status are `enum` types in the proto
- [ ] `server.py` stores tasks in a Python dict (in-memory). `WatchTask` sends the current task state every 2 seconds until the client disconnects
- [ ] `client.py` demonstrates all five RPCs: creates 3 tasks, gets one, updates a status, lists all, then watches one for 10 seconds
- [ ] Error cases: `GetTask` with unknown ID returns `NOT_FOUND` status code; `UpdateTaskStatus` with unknown ID returns `NOT_FOUND`

**Starter proto:**
```protobuf
syntax = "proto3";

package taskservice;

enum Priority {
  PRIORITY_UNSPECIFIED = 0;
  LOW = 1;
  MEDIUM = 2;
  HIGH = 3;
}

enum Status {
  STATUS_UNSPECIFIED = 0;
  PENDING = 1;
  IN_PROGRESS = 2;
  DONE = 3;
}

service TaskService {
  // TODO: define the five RPCs
}

message Task {
  int32 task_id = 1;
  string title = 2;
  string description = 3;
  Priority priority = 4;
  Status status = 5;
}

// TODO: define request/response messages
```

**When you're done:**
- `python server.py` starts on port 50052
- `python client.py` creates 3 tasks, updates one to IN_PROGRESS, streams the list, watches a task for 10 seconds
- Creating a task returns the task with its assigned ID
- Listing tasks with `status=IN_PROGRESS` returns only in-progress tasks
- Watching a task and then updating its status via a second client shows the status change in the watch stream

**Stuck?** Ask AI: "In gRPC Python with proto3, how do I define an enum field in a message and use it in a service method? Show me the proto definition and the Python server code for reading and setting enum values on a message."

---

## Quick Check Answers

**1. How does Protobuf identify fields without names?**
Each field is assigned a number (tag) in the `.proto` definition. On the wire, the tag number is encoded as part of the field header, not the field name. Both the client and server have the same `.proto` file, so they both know "field tag 1 is `user_id`, field tag 2 is `name`." The name never travels on the wire — only the tag number and the value. This is why Protobuf messages are smaller: `{user_id: 42}` sends 2 bytes total (one byte for the field tag + wire type, one byte for the varint 42) instead of 14 bytes for `{"user_id":42}`.

**2. What HTTP/2 provides for gRPC:**
HTTP/2 uses multiplexing: multiple logical streams share one TCP connection, identified by stream IDs. In HTTP/1.1, 100 simultaneous gRPC calls would require 100 TCP connections (or complex connection pooling), each with its own TCP handshake, TLS negotiation, and connection state. With HTTP/2, all 100 calls share one connection with 100 stream IDs. This reduces connection overhead dramatically and eliminates the head-of-line blocking problem at the HTTP layer (though not at the TCP layer — that's solved by HTTP/3 with QUIC).

**3. Schema evolution with a new field:**
An old client that receives a message with field number 2 it doesn't know about simply ignores it. Proto3 guarantees forward and backward compatibility for field additions: unknown fields are preserved (or ignored, depending on the implementation) and missing fields get zero/default values. This is why field numbers must never be reused for a different type — an old client that interprets field number 2 as an int32 but the new schema put a string there would corrupt data.

**4. When to use gRPC instead of REST:**
(a) **Internal service-to-service communication** where both sides are in your control: gRPC's strict typed contract prevents interface drift between teams — if ServiceA changes a field name, ServiceB fails at compile time, not at 3am in production. (b) **High-throughput real-time data streams**: server streaming or bidirectional streaming with binary Protobuf is significantly more efficient than polling REST endpoints — a financial tick data service, a multiplayer game state sync, or a log aggregation pipeline. REST is better for public APIs consumed by browsers or third parties where human readability and standard HTTP tooling matter more than raw performance.
