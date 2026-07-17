---
concept: 144-auth-vs-authz
name: Authentication vs Authorization
---

## Definition

Authentication (AuthN) verifies WHO a user is (logging in with a
password, a token, biometrics); authorization (AuthZ) determines WHAT
that already-verified user is allowed to do (permissions, roles, access
control) — two related but distinct questions.

## Problem

Confusing or conflating these two lets an app assume that once a user
proves who they are, they're automatically allowed to do anything — but a
logged-in regular user shouldn't necessarily be able to perform
admin-only actions. Keeping the two checks explicitly separate (verify
identity, THEN separately check permissions for the specific action)
prevents an authenticated-but-unauthorized user from doing something they
shouldn't.

## Execution

User submits username + password
↓
Authentication check: does this password match this username's stored
credentials? → yes, identity confirmed, session created
↓
User (now authenticated) requests to DELETE another user's account
↓
Authorization check: does THIS user's role/permissions allow deleting
OTHER users' accounts? → checked SEPARATELY from authentication
↓
If the authorization check fails (user is not an admin), the request is
rejected — even though authentication already succeeded

## Computer Science

These are genuinely separate concerns answering separate questions —
"who are you" versus "what are you allowed to do" — and conflating them
(assuming any authenticated user is automatically authorized for
everything) is a common source of privilege-escalation vulnerabilities,
where a legitimate but low-privileged user can perform actions meant to
be restricted to higher-privileged roles.

Tags: Access control, Privilege escalation, Roles and permissions

## Software Engineering

A typical implementation checks authentication once per request (via a
session or token) and then performs authorization checks PER ACTION or
PER RESOURCE — e.g., "is this specific user allowed to edit THIS specific
document" — since authorization often depends on the specific resource
being accessed, not just the user's general role.

Tags: Session management, Role-based access control, Per-resource permissions

## Common Mistakes

- Checking only authentication ("is this user logged in?") and skipping a separate authorization check ("is this SPECIFIC logged-in user allowed to do THIS SPECIFIC thing?") — this is how a regular authenticated user ends up able to trigger admin-only actions.
- Performing authorization checks only in the UI (hiding a button) without enforcing them on the server — a user can bypass a hidden UI element by calling the underlying API endpoint directly, so authorization must be enforced server-side regardless of what the UI shows.

## Exercises

- Explain the difference between "this request has a valid session token" (authentication) and "this user's role allows deleting other users' accounts" (authorization) using a concrete example beyond the one above.
- Identify a real feature (an admin panel, an "edit this document" button) that would be exploitable if only authentication were checked, without a separate authorization check for that specific action.

## javascript

```javascript
// Simulating the two SEPARATE checks -- authentication (who) and
// authorization (what they're allowed to do) -- as distinct steps.
const users = {
  alice: { password: 'secret123', role: 'admin' },
  bob: { password: 'hunter2', role: 'user' },
}

function authenticate(username, password) {
  const user = users[username]
  if (!user || user.password !== password) return { authenticated: false }
  return { authenticated: true, username, role: user.role }
}

function authorize(session, action) {
  if (!session.authenticated) return false
  if (action === 'delete-any-account') return session.role === 'admin'
  return true   // ordinary actions allowed for any authenticated user
}

const bobSession = authenticate('bob', 'hunter2')
console.log(bobSession.authenticated)                          // true -- bob IS who he claims to be
console.log(authorize(bobSession, 'delete-any-account'))        // false -- but he's NOT authorized for this action

const aliceSession = authenticate('alice', 'secret123')
console.log(authorize(aliceSession, 'delete-any-account'))      // true -- alice's admin role authorizes it
```
Walkthrough: `bobSession.authenticated` is `true` — bob's identity is
genuinely confirmed. But `authorize(bobSession, 'delete-any-account')`
still returns `false`, because authorization is checked SEPARATELY based
on his role, not just his authenticated status. Alice, with the `admin`
role, passes the same authorization check that correctly rejected bob.

## python

```python
users = {
    'alice': {'password': 'secret123', 'role': 'admin'},
    'bob': {'password': 'hunter2', 'role': 'user'},
}


def authenticate(username, password):
    user = users.get(username)
    if not user or user['password'] != password:
        return {'authenticated': False}
    return {'authenticated': True, 'username': username, 'role': user['role']}


def authorize(session, action):
    if not session['authenticated']:
        return False
    if action == 'delete-any-account':
        return session['role'] == 'admin'
    return True   # ordinary actions allowed for any authenticated user


bob_session = authenticate('bob', 'hunter2')
print(bob_session['authenticated'])                        # True -- bob IS who he claims to be
print(authorize(bob_session, 'delete-any-account'))         # False -- but he's NOT authorized for this action

alice_session = authenticate('alice', 'secret123')
print(authorize(alice_session, 'delete-any-account'))       # True -- alice's admin role authorizes it
```
Walkthrough: identical authentication-then-separate-authorization
mechanics as the JavaScript version — bob passes authentication but fails
the role-based authorization check, while alice's admin role passes it.
