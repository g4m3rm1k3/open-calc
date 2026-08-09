# Tutorial 2: Role-Based Access Control

## Introduction

RBAC (Role-Based Access Control) grants permissions based on user roles, not individual users.

---

## Part 1: Permission Model

### 1.1 Actions

```python
# src/partflow/auth/permissions.py
"""Permission definitions."""

from enum import Enum, auto


class Action(Enum):
    """Actions that can be performed."""
    # Part actions
    VIEW_PART = auto()
    CREATE_PART = auto()
    EDIT_PART = auto()
    DELETE_PART = auto()
    SUBMIT_PART = auto()
    APPROVE_PART = auto()
    OBSOLETE_PART = auto()
    
    # Machine actions
    VIEW_MACHINE = auto()
    CREATE_MACHINE = auto()
    EDIT_MACHINE = auto()
    
    # Admin actions
    MANAGE_USERS = auto()
    VIEW_AUDIT_LOG = auto()
```

### 1.2 Role Permissions

```python
from partflow.domain.entities.user import Role

ROLE_PERMISSIONS = {
    Role.VIEWER: {
        Action.VIEW_PART,
        Action.VIEW_MACHINE,
    },
    Role.ENGINEER: {
        Action.VIEW_PART,
        Action.CREATE_PART,
        Action.EDIT_PART,
        Action.SUBMIT_PART,
        Action.VIEW_MACHINE,
    },
    Role.APPROVER: {
        Action.VIEW_PART,
        Action.CREATE_PART,
        Action.EDIT_PART,
        Action.SUBMIT_PART,
        Action.APPROVE_PART,
        Action.VIEW_MACHINE,
        Action.VIEW_AUDIT_LOG,
    },
    Role.ADMIN: {
        # All actions
        *Action,
    },
}


def user_can(user: User, action: Action) -> bool:
    """Check if user has permission for action."""
    for role in user.roles:
        if action in ROLE_PERMISSIONS.get(role, set()):
            return True
    return False
```

---

## Part 2: Permission Decorators

### 2.1 Route Protection

```python
# src/partflow/auth/decorators.py
"""Authorization decorators."""

from functools import wraps
from flask import abort, flash, redirect, url_for
from flask_login import current_user

from partflow.auth.permissions import Action, user_can


def require_login(f):
    """Require user to be logged in."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not current_user.is_authenticated:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated


def require_permission(action: Action):
    """Require user to have specific permission."""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not current_user.is_authenticated:
                return redirect(url_for('auth.login'))
            
            if not user_can(current_user, action):
                flash('You do not have permission for this action.', 'error')
                abort(403)
            
            return f(*args, **kwargs)
        return decorated
    return decorator


def require_any_role(*roles: Role):
    """Require user to have any of the specified roles."""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not current_user.is_authenticated:
                return redirect(url_for('auth.login'))
            
            if not current_user.has_any_role(*roles):
                abort(403)
            
            return f(*args, **kwargs)
        return decorated
    return decorator
```

### 2.2 Usage in Routes

```python
from partflow.auth.decorators import require_permission
from partflow.auth.permissions import Action


@parts_bp.route('/new')
@require_permission(Action.CREATE_PART)
def new_part():
    return render_template('parts/new.html')


@parts_bp.route('/<uuid:part_id>/approve', methods=['POST'])
@require_permission(Action.APPROVE_PART)
def approve(part_id):
    # Only approvers and admins can approve
    ...
```

---

## Part 3: Template Helpers

### 3.1 Permission Checks in Templates

```python
# Register in app context
@app.context_processor
def inject_permissions():
    """Make permission checks available in templates."""
    from partflow.auth.permissions import Action, user_can
    
    def can(action_name):
        if not current_user.is_authenticated:
            return False
        action = Action[action_name]
        return user_can(current_user, action)
    
    return {'can': can}
```

### 3.2 Template Usage

```html
{% if can('CREATE_PART') %}
    <a href="{{ url_for('parts.new_part') }}" class="btn">New Part</a>
{% endif %}

{% if can('APPROVE_PART') and part.status.value == 'review' %}
    <button class="btn btn-success">Approve</button>
{% endif %}
```

---

## Summary

### RBAC Components

| Component | Purpose |
|-----------|---------|
| Roles | Group of permissions |
| Actions | Specific operations |
| Permission map | Role → Actions |
| Decorators | Enforce on routes |
| Template helpers | Show/hide UI elements |

---

## Next Tutorial

[Tutorial 3: Securing Routes →](./03-securing-routes.md)
