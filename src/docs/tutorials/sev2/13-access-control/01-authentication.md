# Tutorial 1: Authentication Concepts

## Introduction

Before implementing access control, we must understand **authentication** (who you are) vs **authorization** (what you can do).

---

## Part 1: Auth Fundamentals

### 1.1 Authentication vs Authorization

| Concept | Question | Example |
|---------|----------|---------|
| **Authentication** | Who are you? | Login with username/password |
| **Authorization** | What can you do? | Can you approve Parts? |

### 1.2 Session-Based Auth

```
┌────────┐     1. Login      ┌────────┐
│ Browser│─────────────────▶│ Server │
│        │                   │        │
│        │◀─────────────────│        │
└────────┘  2. Session ID    └────────┘
     │                            │
     │ 3. Request + Session ID    │
     │───────────────────────────▶│
     │                            │
     │     4. Response            │
     │◀───────────────────────────│
```

---

## Part 2: User Model

### 2.1 User Entity

```python
# src/partflow/domain/entities/user.py
"""User entity for authentication."""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Set
from uuid import UUID


class Role(Enum):
    """User roles in the system."""
    VIEWER = "viewer"      # Read-only access
    ENGINEER = "engineer"  # Create and edit Parts
    APPROVER = "approver"  # Review and approve
    ADMIN = "admin"        # Full access


@dataclass
class User:
    """A system user.
    
    Users have one or more roles that determine permissions.
    """
    id: UUID
    username: str
    email: str
    roles: Set[Role] = field(default_factory=lambda: {Role.VIEWER})
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    
    def has_role(self, role: Role) -> bool:
        """Check if user has specific role."""
        return role in self.roles
    
    def has_any_role(self, *roles: Role) -> bool:
        """Check if user has any of the specified roles."""
        return any(role in self.roles for role in roles)
    
    @property
    def is_admin(self) -> bool:
        return Role.ADMIN in self.roles
    
    @property
    def can_approve(self) -> bool:
        return self.has_any_role(Role.APPROVER, Role.ADMIN)
    
    @property
    def can_edit(self) -> bool:
        return self.has_any_role(Role.ENGINEER, Role.APPROVER, Role.ADMIN)
```

---

## Part 3: Password Handling

### 3.1 NEVER Store Plain Passwords

```python
# src/partflow/auth/password.py
"""Password hashing utilities."""

import hashlib
import secrets
from typing import Tuple


def hash_password(password: str) -> Tuple[str, str]:
    """Hash password with salt.
    
    Returns:
        Tuple of (hash, salt)
    """
    salt = secrets.token_hex(32)
    hash_value = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000,  # iterations
    ).hex()
    return hash_value, salt


def verify_password(password: str, hash_value: str, salt: str) -> bool:
    """Verify password against stored hash."""
    check_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000,
    ).hex()
    return secrets.compare_digest(check_hash, hash_value)
```

---

## Part 4: Session Management

### 4.1 Flask Session Setup

```python
# In app.py
app.secret_key = config.SECRET_KEY  # MUST be set

# Using Flask-Login (recommended)
from flask_login import LoginManager

login_manager = LoginManager()
login_manager.init_app(app)


@login_manager.user_loader
def load_user(user_id):
    deps = get_deps()
    return deps.user_repo.find_by_id(UUID(user_id))
```

### 4.2 Login Route

```python
from flask_login import login_user, logout_user, current_user

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = deps.user_service.authenticate(username, password)
        if user:
            login_user(user)
            return redirect(url_for('index'))
        
        flash('Invalid credentials', 'error')
    
    return render_template('auth/login.html')
```

---

## Summary

### Key Concepts

| Concept | Purpose |
|---------|---------|
| Authentication | Verify identity |
| Authorization | Check permissions |
| Hashing | Secure password storage |
| Sessions | Maintain logged-in state |
| Roles | Group permissions |

---

## Next Tutorial

[Tutorial 2: Role-Based Access →](./02-role-based-access.md)
