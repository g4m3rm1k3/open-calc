# Phase 13: Access Control & Trust Boundaries

## Overview

This phase adds **authentication and authorization**—controlling who can access what resources.

> **Security is not a feature. It's a requirement.**

---

## What You Will Build

- User entity and authentication
- Role-based access control (RBAC)
- Permission checks at service level
- Session management

---

## Security Model

### Trust Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│                    UNTRUSTED                                │
│  ┌─────────────┐                                            │
│  │   Browser   │                                            │
│  └──────┬──────┘                                            │
│         │                                                   │
├─────────│───────────── TRUST BOUNDARY ──────────────────────┤
│         │                                                   │
│         ▼                    TRUSTED                        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Web       │───▶│   Service   │───▶│  Repository │     │
│  │   Layer     │    │   Layer     │    │   Layer     │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                  │                               │
│         ▼                  ▼                               │
│  [Input Validation]  [Authorization]                       │
└─────────────────────────────────────────────────────────────┘
```

### Role Hierarchy

| Role | Permissions |
|------|-------------|
| **Viewer** | Read only |
| **Operator** | Read, create drafts |
| **Engineer** | Read, create, edit |
| **Approver** | Engineer + approve |
| **Admin** | All permissions |

---

## Tutorials in This Phase

| # | Tutorial | Duration |
|---|----------|----------|
| 1 | [Security Fundamentals](./01-security-fundamentals.md) | 30 min |
| 2 | [User Entity](./02-user-entity.md) | 45 min |
| 3 | [Password Hashing](./03-password-hashing.md) | 30 min |
| 4 | [Session Management](./04-session-management.md) | 45 min |
| 5 | [Authorization](./05-authorization.md) | 45 min |
| 6 | [Protecting Routes](./06-protected-routes.md) | 30 min |

---

## Security Invariants

| Invariant | Enforcement |
|-----------|-------------|
| Passwords never stored plain | bcrypt hashing |
| Sessions expire | Time-based expiration |
| All routes protected | Default deny |
| Permissions checked at service | Decorator pattern |

---

## Verification Checklist

- [ ] User registration working
- [ ] Login/logout working
- [ ] Sessions expire correctly
- [ ] Unauthorized access blocked
- [ ] Admin can manage users

---

## Next Phase

[Phase 14: Eventing & Observability →](../14-eventing-observability/README.md)
