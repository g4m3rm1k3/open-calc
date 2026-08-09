# Tutorial 3: Securing Routes

## Introduction

Apply security systematically across all routes.

---

## Part 1: Route Security Matrix

### 1.1 Parts Routes

| Route | Method | Permission Required |
|-------|--------|---------------------|
| `/parts/` | GET | VIEW_PART |
| `/parts/new` | GET | CREATE_PART |
| `/parts/` | POST | CREATE_PART |
| `/parts/<id>` | GET | VIEW_PART |
| `/parts/<id>/edit` | GET | EDIT_PART |
| `/parts/<id>/edit` | POST | EDIT_PART |
| `/parts/<id>/submit` | POST | SUBMIT_PART |
| `/parts/<id>/approve` | POST | APPROVE_PART |
| `/parts/<id>/reject` | POST | APPROVE_PART |

### 1.2 Machines Routes

| Route | Method | Permission Required |
|-------|--------|---------------------|
| `/machines/` | GET | VIEW_MACHINE |
| `/machines/new` | GET | CREATE_MACHINE |
| `/machines/` | POST | CREATE_MACHINE |

---

## Part 2: Apply Decorators

### 2.1 Update Parts Routes

```python
# src/partflow/web/routes/parts.py

from partflow.auth.decorators import require_permission, require_login
from partflow.auth.permissions import Action


@parts_bp.route('/')
@require_permission(Action.VIEW_PART)
def list_parts():
    ...


@parts_bp.route('/new')
@require_permission(Action.CREATE_PART)
def new_part():
    ...


@parts_bp.route('/', methods=['POST'])
@require_permission(Action.CREATE_PART)
def create_part():
    ...


@parts_bp.route('/<uuid:part_id>')
@require_permission(Action.VIEW_PART)
def detail(part_id):
    ...


@parts_bp.route('/<uuid:part_id>/edit')
@require_permission(Action.EDIT_PART)
def edit_part(part_id):
    # Additional check: user must have lock
    ...


@parts_bp.route('/<uuid:part_id>/submit', methods=['POST'])
@require_permission(Action.SUBMIT_PART)
def submit_for_review(part_id):
    ...


@parts_bp.route('/<uuid:part_id>/approve', methods=['POST'])
@require_permission(Action.APPROVE_PART)
def approve(part_id):
    # Additional check: approver != author
    ...
```

---

## Part 3: Resource-Level Authorization

### 3.1 Beyond Role Checks

Some checks need context:

| Check | Logic |
|-------|-------|
| Can only edit own draft | Part.owner == current_user |
| Approver ≠ author | Part.author != current_user |
| Must have lock | Lock.owner == current_user |

### 3.2 Service-Level Checks

```python
# In WorkflowService

def approve(self, part_id: UUID, approved_by: str) -> Part:
    part = self._get_part(part_id)
    
    # Business rule: approver cannot be author
    if part.created_by == approved_by:
        raise NotAuthorizedError(
            "Cannot approve your own Part"
        )
    
    part.approve()
    ...
```

---

## Part 4: Error Pages

### 4.1 403 Forbidden

```python
# In app.py

@app.errorhandler(403)
def forbidden(e):
    return render_template('errors/403.html'), 403
```

Create `templates/errors/403.html`:

```html
{% extends "base.html" %}

{% block title %}Access Denied{% endblock %}

{% block content %}
<div class="error-page">
    <h1>🚫 Access Denied</h1>
    <p>You don't have permission to access this resource.</p>
    <p>
        <a href="{{ url_for('index') }}">Return to Home</a>
    </p>
</div>
{% endblock %}
```

---

## Summary

### Security Layers

| Layer | What It Does |
|-------|--------------|
| Route decorator | Checks role/permission |
| Service logic | Checks business rules |
| Template hiding | Hides unauthorized UI |
| Error handler | Friendly 403 page |

---

## Next Tutorial

[Tutorial 4: Security Testing →](./04-security-testing.md)
