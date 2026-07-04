# Episode 3

## Building a feature with full lifecycle, deeper logic, and multi‑step behavior

### 1. State

A user profile:

```js
{"id": 1, "name": "Michael", "email": "m@example.com", "verified": False}
```

A list of profiles:

```python
users = []
```

This is the raw state your feature will operate on.

---

### 2. Creation logic

Feature: create a new user with validation and normalization.

Validation rules:

- name is a non-empty string  
- email contains “@”  
- email is lowercased  
- id is assigned automatically  

Mechanical definition:

```python
def create_user(users, name, email):
    if name == "":
        return {"error": "name empty"}

    if "@" not in email:
        return {"error": "email invalid"}

    normalized_email = email.lower()
    new_id = len(users) + 1

    user = {
        "id": new_id,
        "name": name,
        "email": normalized_email,
        "verified": False
    }

    return {"ok": users + [user]}
```

This function performs validation, normalization, and creation.

---

### 3. Retrieval logic

Feature: find a user by id.

Mechanical definition:

```python
def get_user(users, id):
    for user in users:
        if user["id"] == id:
            return {"ok": user}
    return {"error": "user missing"}
```

This function extracts a single record from the list.

---

### 4. Update logic

Feature: update a user’s email with validation and normalization.

```python
def update_email(users, id, new_email):
    if "@" not in new_email:
        return {"error": "email invalid"}

    normalized = new_email.lower()
    updated = []

    found = False

    for user in users:
        if user["id"] == id:
            found = True
            updated.append({
                "id": user["id"],
                "name": user["name"],
                "email": normalized,
                "verified": user["verified"]
            })
        else:
            updated.append(user)

    if found:
        return {"ok": updated}
    else:
        return {"error": "user missing"}
```

This function transforms one record while preserving the rest.

---

### 5. Derived state

Feature: count verified users.

```python
def count_verified(users):
    count = 0
    for user in users:
        if user["verified"]:
            count = count + 1
    return count
```

Derived state is computed from raw state.

---

### 6. Transformation rule

Feature: verify a user.

```python
def verify_user(users, id):
    updated = []
    found = False

    for user in users:
        if user["id"] == id:
            found = True
            updated.append({
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "verified": True
            })
        else:
            updated.append(user)

    if found:
        return {"ok": updated}
    else:
        return {"error": "user missing"}
```

This rule changes a single field in a single record.

---

### 7. Flow

```python
users = []

result = create_user(users, "Michael", "M@Example.com")
if "ok" in result:
    users = result["ok"]

result = create_user(users, "Alice", "alice@example.com")
if "ok" in result:
    users = result["ok"]

result = update_email(users, 1, "michael@newmail.com")
if "ok" in result:
    users = result["ok"]

result = verify_user(users, 2)
if "ok" in result:
    users = result["ok"]

verified_count = count_verified(users)
```

This flow performs creation, update, verification, and derived-state computation.

---

### 8. Final state

```json
[
  {"id": 1, "name": "Michael", "email": "michael@newmail.com", "verified": False},
  {"id": 2, "name": "Alice", "email": "alice@example.com", "verified": True}
]
```

Derived state:

```python
verified_count = 1
```

This is a complete feature lifecycle:

- creation  
- retrieval  
- update  
- transformation  
- derived state  
- flow  
- final state  

---
