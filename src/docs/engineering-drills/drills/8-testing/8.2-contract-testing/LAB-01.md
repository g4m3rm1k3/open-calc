# Drill 8.2 — Contract Testing: Verifying the Interface, Not the Implementation

**Standalone drill. Prerequisite: basic pytest.**
**Time estimate:** 60–75 minutes
**Environment:** Python 3.8+ — `pip install pytest requests`
**What you will build:** A consumer contract test for a User API, a provider verification that the API satisfies the contract, and a demonstration of what contract violation looks like — and why it's caught before deployment instead of in production.
**What you will understand:** What a contract is, the difference between consumer-driven and provider-driven contracts, and why mocking in integration tests is dangerous.

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. Service A mocks Service B in its tests. Service B changes its response format. Service A's tests still pass. Service A deploys. What happens?

2. What is the difference between a contract test and an integration test? Both test that two services work together. What does each check, and which is faster?

3. "Consumer-driven contract testing" — who defines the contract, the consumer (caller) or the provider (service being called)? Why is this the better direction?

4. A contract says `GET /users/{id}` returns `{id: int, name: string}`. The provider adds a new optional field `email: string`. Does this break the contract?

*(Answers at the bottom.)*

---

## The Concept: Contract Testing

### Concept: The Interface Agreement Between Services

**What it is:**
A contract is an agreement between two services about the shape and behavior of their communication: what requests the consumer will send, and what responses the provider will return. Contract testing verifies that both sides honor this agreement — independently, without requiring both services to run simultaneously.

**The problem without contracts:**
In a microservices architecture, Team A builds a User service. Team B builds an Order service that calls it. Team B mocks the User service in its tests:
```python
# test_orders.py (Team B)
@mock.patch("services.user_service.get_user")
def test_create_order(mock_get_user):
    mock_get_user.return_value = {"id": 1, "name": "Alice"}
    result = create_order(user_id=1, items=["book"])
    assert result["user_name"] == "Alice"
```

Team A refactors the User service and renames `name` to `full_name`. Their tests pass. Team B's tests also pass (they mock the old response). Both deploy. In production, Team B's order service crashes because `response["name"]` raises `KeyError`.

**The mechanism — consumer-driven contracts:**
1. Team B (consumer) writes a contract: "I will call `GET /users/1` and expect a response with at least `{id: int, name: string}`"
2. The contract is stored in a shared location (Pact Broker, git, S3)
3. Team A (provider) runs a "provider verification" that replays the consumer's requests against the real provider and checks the responses match the contract
4. If Team A renames `name` to `full_name`, the provider verification fails → they know they broke Team B before deploying

**Consumer-driven vs provider-driven:**
Consumer-driven: the consumer defines what it needs. The provider verifies it delivers those needs. This is better because: the consumer knows exactly what fields it uses (not all fields the provider returns), and the contract represents real usage rather than the provider's assumptions about what consumers need.

**What the contract contains:**
- The HTTP method and path
- Required request headers or body shape
- The minimum required response fields and their types
- Status codes (200, 404, etc.)
- NOT: the exact response (provider can add new fields), timing, or internal implementation

**Pact — the standard tool:**
Pact is the industry-standard contract testing library (Python: `pact-python`). This drill implements the concept manually to show the mechanism. In production, use Pact with a Pact Broker for sharing contracts between teams.

**Constraints:**
- Contract tests only check the interface — they don't check business logic or behavior correctness
- Consumer-driven contracts require the consumer to specify exactly what it needs — teams must collaborate on the contract format
- Adding new optional fields to a response is backward-compatible. Removing or renaming required fields is a breaking change.
- Contract tests run fast: no test environment needed, no running services during consumer verification (only during provider verification)

**Tradeoffs:**
- Contract testing vs integration testing: integration tests require both services running, are slow, and are fragile to environment issues. Contract tests are fast, require only one service at a time, and are robust. But integration tests verify actual behavior; contracts verify interface shape.
- Contract testing vs E2E testing: E2E tests verify the entire system but are slow and expensive to maintain. Contracts catch interface breaks early, cheaply.

**Failure modes:**
- Contract too strict: including optional response fields makes every provider refactor break the contract. Only include fields the consumer actually uses.
- Contract too loose: not specifying types allows `{id: "abc"}` to pass when `{id: 123}` is expected.
- Not running provider verification in CI: contracts are useless if the provider never runs them. The provider must run verification on every PR.
- One-way contracts: consumer writes contract but provider never verifies it — team communication failure.

**Operational reality:**
Pact is used by Netflix, Atlassian, and many companies with microservices. The Pact Broker stores contracts and shows which consumer versions have been verified by which provider versions. "Can I deploy?" becomes a binary question answered by the Broker.

**You will see this again in:**
Any microservices architecture where teams work independently. FastAPI apps with multiple consumers, frontend/backend API contracts, mobile app/backend API contracts.

**Watch for:**
The difference between "the provider should return exactly `{id: 1, name: "Alice"}`" (too strict — version-coupled) and "the provider should return a JSON object containing at least `id` (int) and `name` (string)" (correct — forward-compatible). Contracts define the minimum required, not the exact response.

---

## Step 1 — Write the Consumer Contract

Create `user_service_mock.py` — a fake user service for the consumer side:

```python
# user_service_mock.py — what the consumer expects the user service to provide
from flask import Flask, jsonify

app = Flask(__name__)

# This is what the consumer's contract says should be returned
MOCK_USERS = {
    1: {"id": 1, "name": "Alice", "email": "alice@example.com"},
    2: {"id": 2, "name": "Bob",   "email": "bob@example.com"},
}

@app.route("/users/<int:user_id>")
def get_user(user_id):
    if user_id not in MOCK_USERS:
        return jsonify({"error": "not found"}), 404
    return jsonify(MOCK_USERS[user_id])

@app.route("/users")
def list_users():
    return jsonify(list(MOCK_USERS.values()))

if __name__ == "__main__":
    app.run(port=5001)
```

Create `order_service.py` — the consumer that calls the user service:

```python
# order_service.py — consumer that calls the user service
import requests
from typing import Optional

class OrderService:
    def __init__(self, user_service_url: str):
        self.user_service_url = user_service_url
    
    def create_order(self, user_id: int, items: list[str]) -> dict:
        """Create an order for a user. Calls user service to validate user exists."""
        # This is the interaction the consumer contract tests
        response = requests.get(f"{self.user_service_url}/users/{user_id}", timeout=5)
        
        if response.status_code == 404:
            raise ValueError(f"User {user_id} not found")
        
        response.raise_for_status()
        user = response.json()
        
        # Consumer ONLY uses these fields — this defines the contract
        user_name = user["name"]      # REQUIRED by consumer
        # user["email"] — consumer does NOT use this, so it's not in the contract
        
        return {
            "order_id": f"ORD-{user_id}-{len(items)}",
            "user_id": user_id,
            "user_name": user_name,
            "items": items,
            "status": "pending",
        }
    
    def get_all_users_for_report(self) -> list[dict]:
        """Get all users. Contract: response is a list of objects with id and name."""
        response = requests.get(f"{self.user_service_url}/users", timeout=5)
        response.raise_for_status()
        return response.json()
```

Create `contract_consumer.py` — defines the contract the consumer needs:

```python
# contract_consumer.py — what the ORDER SERVICE (consumer) needs from the USER SERVICE (provider)
import json

def define_contract() -> dict:
    """
    Define the consumer's contract: what interactions it will have and what it needs.
    In production, this would be a Pact file.
    """
    return {
        "consumer": "order_service",
        "provider": "user_service",
        "interactions": [
            {
                "description": "get existing user",
                "request": {
                    "method": "GET",
                    "path": "/users/1",
                },
                "response": {
                    "status": 200,
                    "body": {
                        # Consumer ONLY requires these fields (minimum contract)
                        "id": {"type": "integer", "required": True},
                        "name": {"type": "string", "required": True},
                        # "email" is NOT in the contract — consumer doesn't use it
                    }
                }
            },
            {
                "description": "get nonexistent user returns 404",
                "request": {
                    "method": "GET",
                    "path": "/users/9999",
                },
                "response": {
                    "status": 404,
                    "body": {
                        "error": {"type": "string", "required": True},
                    }
                }
            },
            {
                "description": "list users returns array of user objects",
                "request": {
                    "method": "GET",
                    "path": "/users",
                },
                "response": {
                    "status": 200,
                    "body_type": "array",
                    "item_fields": {
                        "id": {"type": "integer", "required": True},
                        "name": {"type": "string", "required": True},
                    }
                }
            }
        ]
    }

def validate_response_against_contract(response_body: dict, expected_fields: dict) -> list[str]:
    """Check that response contains all required fields of the correct type."""
    errors = []
    type_map = {"integer": int, "string": str, "boolean": bool, "number": (int, float)}
    
    for field_name, field_spec in expected_fields.items():
        if field_spec.get("required") and field_name not in response_body:
            errors.append(f"Required field '{field_name}' missing from response")
            continue
        
        if field_name in response_body:
            expected_type = type_map.get(field_spec["type"], str)
            actual_value = response_body[field_name]
            if not isinstance(actual_value, expected_type):
                errors.append(
                    f"Field '{field_name}': expected {field_spec['type']}, "
                    f"got {type(actual_value).__name__} ({actual_value!r})"
                )
    
    return errors

if __name__ == "__main__":
    contract = define_contract()
    print("Consumer contract defined:")
    print(json.dumps(contract, indent=2))
```

### SAVE AND TRY

```
python contract_consumer.py
```

This outputs the contract in a structured format. In production (using Pact), this would be serialized to a `.json` file and shared with the provider team.

---

## Step 2 — Consumer Tests Against the Mock

Create `test_order_service.py`:

```python
# test_order_service.py — consumer tests using a mock user service
import pytest
import threading
from flask import Flask, jsonify
from order_service import OrderService
from contract_consumer import validate_response_against_contract, define_contract

# ── Start a mock server representing the contract ─────────────────────────────
mock_app = Flask("mock_user_service")

# What the consumer expects the provider to return
@mock_app.route("/users/1")
def mock_get_user_1():
    return jsonify({"id": 1, "name": "Alice", "email": "alice@example.com"})

@mock_app.route("/users/9999")
def mock_get_user_not_found():
    return jsonify({"error": "not found"}), 404

@mock_app.route("/users")
def mock_list_users():
    return jsonify([
        {"id": 1, "name": "Alice"},
        {"id": 2, "name": "Bob"},
    ])

@pytest.fixture(scope="session", autouse=True)
def mock_server():
    t = threading.Thread(
        target=lambda: mock_app.run(port=5099, use_reloader=False),
        daemon=True
    )
    t.start()
    import time; time.sleep(0.5)  # wait for server to start


# ── Consumer tests ────────────────────────────────────────────────────────────

@pytest.fixture
def order_svc():
    return OrderService("http://localhost:5099")


def test_create_order_success(order_svc):
    """Consumer test: create order when user exists."""
    order = order_svc.create_order(user_id=1, items=["book", "pen"])
    assert order["user_name"] == "Alice"
    assert order["items"] == ["book", "pen"]
    assert "order_id" in order

def test_create_order_user_not_found(order_svc):
    """Consumer test: ValueError when user doesn't exist."""
    with pytest.raises(ValueError, match="User 9999 not found"):
        order_svc.create_order(user_id=9999, items=["book"])

def test_list_users(order_svc):
    """Consumer test: list users returns user objects with required fields."""
    users = order_svc.get_all_users_for_report()
    assert len(users) >= 1
    for user in users:
        assert "id" in user
        assert "name" in user
        assert isinstance(user["id"], int)
        assert isinstance(user["name"], str)


# ── Contract validation tests ─────────────────────────────────────────────────

def test_mock_satisfies_contract_get_user():
    """Verify that our mock response satisfies the contract we defined."""
    import requests
    response = requests.get("http://localhost:5099/users/1")
    assert response.status_code == 200
    
    contract = define_contract()
    interaction = next(i for i in contract["interactions"] if i["description"] == "get existing user")
    expected_fields = interaction["response"]["body"]
    
    errors = validate_response_against_contract(response.json(), expected_fields)
    assert not errors, f"Mock doesn't satisfy contract: {errors}"

def test_mock_404_satisfies_contract():
    """Verify that our 404 mock response satisfies the contract."""
    import requests
    response = requests.get("http://localhost:5099/users/9999")
    assert response.status_code == 404
    
    contract = define_contract()
    interaction = next(i for i in contract["interactions"] 
                      if i["description"] == "get nonexistent user returns 404")
    expected_fields = interaction["response"]["body"]
    
    errors = validate_response_against_contract(response.json(), expected_fields)
    assert not errors, f"Mock 404 doesn't satisfy contract: {errors}"
```

### SAVE AND TRY

```
python -m pytest test_order_service.py -v
```

Expected output:
```
test_order_service.py::test_create_order_success PASSED
test_order_service.py::test_create_order_user_not_found PASSED
test_order_service.py::test_list_users PASSED
test_order_service.py::test_mock_satisfies_contract_get_user PASSED
test_order_service.py::test_mock_404_satisfies_contract PASSED
```

**Change something:** In `mock_get_user_1`, remove the `"name"` field from the response. Run the tests. `test_mock_satisfies_contract_get_user` fails with: `Mock doesn't satisfy contract: ["Required field 'name' missing from response"]`. This is what happens when the provider breaks the contract.

---

## Step 3 — Provider Verification: Catch the Breaking Change

Create `user_service_real.py` — the "real" provider:

```python
# user_service_real.py — actual user service (provider)
from flask import Flask, jsonify
app = Flask("real_user_service")

USERS = {
    1: {"id": 1, "name": "Alice", "email": "alice@example.com"},
    2: {"id": 2, "name": "Bob",   "email": "bob@example.com"},
}

@app.route("/users/<int:user_id>")
def get_user(user_id):
    if user_id not in USERS:
        return jsonify({"error": "not found"}), 404
    return jsonify(USERS[user_id])

@app.route("/users")
def list_users():
    return jsonify(list(USERS.values()))

if __name__ == "__main__":
    app.run(port=5002)
```

Create `test_provider_verification.py` — the provider verifies the consumer's contract:

```python
# test_provider_verification.py
# Provider runs this to verify it satisfies all consumer contracts.
import pytest
import threading
import requests
from user_service_real import app as real_app
from contract_consumer import define_contract, validate_response_against_contract

@pytest.fixture(scope="session", autouse=True)
def real_server():
    t = threading.Thread(
        target=lambda: real_app.run(port=5002, use_reloader=False),
        daemon=True
    )
    t.start()
    import time; time.sleep(0.5)

BASE = "http://localhost:5002"

class TestProviderSatisfiesOrderServiceContract:
    """
    Provider verification: replay each consumer interaction against the real provider
    and verify the response matches the contract.
    
    The ORDER SERVICE (consumer) defined this contract.
    The USER SERVICE (provider) runs these tests.
    If any fail, the provider must not deploy — it would break the consumer.
    """
    
    def test_get_existing_user(self):
        response = requests.get(f"{BASE}/users/1")
        assert response.status_code == 200
        
        contract = define_contract()
        interaction = next(i for i in contract["interactions"] 
                          if i["description"] == "get existing user")
        
        errors = validate_response_against_contract(
            response.json(), 
            interaction["response"]["body"]
        )
        assert not errors, f"Provider broke contract for 'get existing user': {errors}"
    
    def test_get_nonexistent_user(self):
        response = requests.get(f"{BASE}/users/9999")
        assert response.status_code == 404
        
        contract = define_contract()
        interaction = next(i for i in contract["interactions"] 
                          if i["description"] == "get nonexistent user returns 404")
        
        errors = validate_response_against_contract(
            response.json(),
            interaction["response"]["body"]
        )
        assert not errors, f"Provider broke contract for '404': {errors}"
    
    def test_list_users(self):
        response = requests.get(f"{BASE}/users")
        assert response.status_code == 200
        users = response.json()
        assert isinstance(users, list)
        
        contract = define_contract()
        interaction = next(i for i in contract["interactions"]
                          if i["description"] == "list users returns array of user objects")
        
        for user in users:
            errors = validate_response_against_contract(user, interaction["item_fields"])
            assert not errors, f"User in list broke contract: {errors} for {user}"


# ── Now simulate a breaking change ──────────────────────────────────────────

def test_breaking_change_detected():
    """
    Demonstrate: provider team renames 'name' to 'full_name'.
    Provider verification catches this before deployment.
    """
    # Simulated "new" provider response with breaking change
    new_response = {
        "id": 1,
        "full_name": "Alice Smith",  # renamed from "name" — breaking change!
        "email": "alice@example.com",
    }
    
    contract = define_contract()
    interaction = next(i for i in contract["interactions"] 
                      if i["description"] == "get existing user")
    
    errors = validate_response_against_contract(new_response, interaction["response"]["body"])
    
    # Provider verification FAILS — breaking change detected
    assert errors, "Should have detected the breaking change"
    assert any("'name' missing" in e for e in errors), f"Expected name field error, got: {errors}"
    print(f"\nBreaking change detected before deployment:")
    for e in errors:
        print(f"  CONTRACT VIOLATION: {e}")
    print("Provider must fix or negotiate contract update with consumer.")
```

### SAVE AND TRY

```
python -m pytest test_provider_verification.py -v
```

Expected output:
```
test_provider_verification.py::TestProviderSatisfiesOrderServiceContract::test_get_existing_user PASSED
test_provider_verification.py::TestProviderSatisfiesOrderServiceContract::test_get_nonexistent_user PASSED
test_provider_verification.py::TestProviderSatisfiesOrderServiceContract::test_list_users PASSED
test_provider_verification.py::test_breaking_change_detected PASSED

Breaking change detected before deployment:
  CONTRACT VIOLATION: Required field 'name' missing from response
Provider must fix or negotiate contract update with consumer.
```

The real provider passes all contract tests (current version is correct). `test_breaking_change_detected` shows what happens when the provider introduces a renaming — the contract catches it.

**Change something:** Modify `user_service_real.py` to rename `name` to `full_name` in the `USERS` dict and the route response. Run `test_provider_verification.py` — `test_get_existing_user` now fails with a contract violation. This is the deployment gate: the provider knows before deploying that they would break the consumer.

---

## Challenge

**No solution provided. Requirements checklist only.**

Build a full contract testing workflow for a product catalog service and a search service that depends on it.

**Requirements checklist:**

- [ ] `ProductService` (provider) with endpoints: `GET /products/{id}` → `{id, name, price, category}`, `GET /products?category=X` → list of product summaries
- [ ] `SearchService` (consumer) calls `ProductService.get_product(id)` to enrich search results. It only uses `id`, `name`, and `price`.
- [ ] Consumer contract file `contracts/search_service_to_product_service.json` containing all interactions the SearchService has with ProductService
- [ ] Consumer tests in `test_search_service.py` that run against a mock ProductService matching the contract
- [ ] Provider verification in `test_product_service_contract.py` that replays the consumer contract against the real ProductService
- [ ] Simulate a backward-compatible change: add `description: string` field to product response. Provider verification still passes.
- [ ] Simulate a breaking change: rename `price` to `unit_price`. Provider verification fails with a clear error.
- [ ] A `CHANGELOG.md` with entries for the compatible change (minor, no consumer action needed) and the breaking change (major, consumer must update)

**Starter:**
```python
# contract file structure
CONTRACT = {
    "consumer": "search_service",
    "provider": "product_service",
    "version": "1.0.0",
    "interactions": [
        {
            "description": "get existing product",
            "request": {"method": "GET", "path": "/products/1"},
            "response": {
                "status": 200,
                "minimum_fields": {
                    "id": int,
                    "name": str,
                    "price": (int, float),
                }
            }
        }
    ]
}
```

**When you're done:**
```
python -m pytest test_search_service.py -v        # consumer tests pass
python -m pytest test_product_service_contract.py -v  # provider verification passes

# Apply backward-compatible change:
python -m pytest test_product_service_contract.py -v  # still passes

# Apply breaking change:
python -m pytest test_product_service_contract.py -v  
# FAIL: CONTRACT VIOLATION: Required field 'price' missing (renamed to 'unit_price')
```

**Stuck?** Ask AI: "How do I implement contract testing between two Python microservices without using the Pact library? I want to: (1) define a contract as a Python dict or JSON, (2) have the consumer test against a mock that matches the contract, (3) have the provider replay each interaction from the contract against the real service. Show me the pattern for verifying that a real HTTP response contains the minimum required fields specified in the contract."

---

## Quick Check Answers

**1. Service A mocks Service B, B changes, A's tests still pass:**
Service A deploys and fails in production. The mock in Service A's tests is decoupled from Service B's real implementation — they can diverge without any test failing. When Service A calls the real Service B in production, it gets `full_name` instead of `name`, raises `KeyError`, and crashes. This is the fundamental problem contract testing solves: mocks don't track real API changes.

**2. Contract test vs integration test:**
Integration tests: both services running in a test environment, real HTTP calls, testing actual behavior (does the right business outcome happen?). Slow, flaky, environment-dependent. Contract tests: one service at a time (consumer tests against a mock, provider verifies against the contract). Fast, reliable, no full environment needed. Contract tests check: "does the interface shape match?" Integration tests check: "does the combined behavior produce the right result?" You need both — contracts for interface safety, integration for behavior correctness.

**3. Consumer-driven vs provider-driven:**
Consumer-driven is better. The consumer knows exactly which fields it uses from a response — it doesn't need all the fields the provider returns. Consumer-driven contracts are minimal: only what the consumer actually needs. Provider-driven contracts often include all fields, making every addition a breaking change and coupling the consumer to the provider's internal structure. Consumer-driven means: "here's what I need from you"; provider-driven means: "here's everything I return; make sure you handle it all."

**4. Adding an optional field — does it break the contract:**
No, adding a new optional field is backward-compatible. Consumer contracts define the minimum required fields. A consumer that expects `{id, name}` can receive `{id, name, email}` and ignore the `email` — no code change needed. Breaking changes are: removing a required field, renaming a required field, changing a field's type (e.g., `id` from int to string), or changing status codes.
