# Episoded 2

## Building a feature with state, logic, and flow

### 1. State

State is the data your feature works with.

Example state for a todo app:

```py
todos = []
```

Each todo is a record:

```py
{"id": 1, "text": "Buy milk", "done": False}
```

State is the foundation. Every feature begins by defining the shape of the data.

---

### 2. Logic

Logic is the transformation applied to the state.

Feature: add a todo.

Mechanical definition:

```py
def add_todo(todos, text):
    new_id = len(todos) + 1
    todo = {"id": new_id, "text": text, "done": False}
    return todos + [todo]
```

This function builds a new todo and returns a new list.  
It uses only its inputs.  
It produces a clear output.

---

### 3. Flow

Flow is how the feature is used inside the program.

```py
todos = []
todos = add_todo(todos, "Buy milk")
todos = add_todo(todos, "Study")
```

Flow connects state and logic.  
This is how real applications grow.

---

### 4. Second feature

Feature: mark a todo as done.

Mechanical definition:

```py
def mark_done(todos, id):
    updated = []
    for todo in todos:
        if todo["id"] == id:
            updated.append({"id": todo["id"], "text": todo["text"], "done": True})
        else:
            updated.append(todo)
    return updated
```

This function transforms one record while keeping the rest unchanged.

---

### 5. Combined usage

```py
todos = []
todos = add_todo(todos, "Buy milk")
todos = add_todo(todos, "Study")
todos = mark_done(todos, 1)
for todo in todos:
    print(todo)
```

Final state:

```py
[
  {"id": 1, "text": "Buy milk", "done": True},
  {"id": 2, "text": "Study", "done": False}
]
```

This is a complete feature:  
state → logic → flow → combined behavior.

---
