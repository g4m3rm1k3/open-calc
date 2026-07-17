---
concept: 141-csrf
name: Cross-Site Request Forgery (CSRF)
---

## Definition

CSRF (Cross-Site Request Forgery) is an attack where a malicious site
tricks a victim's browser into sending an authenticated request to a
DIFFERENT site the victim is already logged into, performing an action
the victim never intended.

## Problem

Browsers automatically attach a site's cookies (including session/auth
cookies) to any request sent to that site, REGARDLESS of which page or
site triggered the request. If evil.com embeds a form that submits a
request to bank.com, and the victim is currently logged into bank.com,
that request goes out WITH the victim's valid session cookie attached —
bank.com has no way to tell it wasn't the victim intentionally clicking a
button on its own site.

## Execution

Victim logs into bank.com — browser stores bank.com's session cookie
↓
Victim visits evil.com in another tab (without logging out of bank.com)
↓
evil.com contains a hidden auto-submitting form targeting
`bank.com/transfer`
↓
Browser submits this form to bank.com — and automatically attaches the
victim's bank.com session cookie, since cookies are attached based on the
TARGET domain, not which page triggered the request
↓
bank.com sees a validly-authenticated request and processes the transfer
— with no way to distinguish this from the victim intentionally clicking
"transfer" on bank.com's own page

## Computer Science

CSRF exploits the fact that authentication via cookies alone only proves
WHO is making a request, not that the request was intentionally initiated
by that user on the legitimate site — defending against it requires an
additional signal (a CSRF token) that only the legitimate site's own
pages could have included, which a malicious third-party site has no way
to obtain.

Tags: Same-origin policy, Cookies, Trust boundaries, CSRF tokens

## Software Engineering

The standard defense is a CSRF token — a random, unpredictable value the
server embeds in its own forms/pages, which must be included in any
state-changing request; a request without the correct current token is
rejected, since an attacker's page on a different origin can't read the
token off the legitimate page (blocked by the same-origin policy) and has
no way to guess it.

Tags: CSRF tokens, SameSite cookies, State-changing requests

## Common Mistakes

- Treating "the user has a valid session cookie" as sufficient proof the CURRENT request is something the user actually intended — CSRF specifically exploits the gap between "authenticated" and "intentionally initiated."
- Only protecting login/authentication endpoints, while leaving other state-changing actions (transfers, password changes, account deletion) unprotected — any endpoint that changes state based on a cookie-authenticated request is a potential CSRF target.

## Exercises

- Explain why a request that changes state using a simple link click is especially vulnerable to CSRF — what's easier for an attacker to trigger than a form submission requiring extra steps?
- Trace through why a CSRF token embedded in the legitimate site's own form defeats the attack, even though the attacker's forged form can still be submitted with the victim's cookies attached.

## javascript

```javascript
// Simulating a CSRF-token check directly, since a real cross-origin
// request requires an actual browser and two real domains.
class Server {
  #csrfToken = 'a1b2c3-legit-token'
  #balance = 1000

  renderTransferForm() {
    // the legitimate page embeds the current token -- an attacker's page never sees this
    return { token: this.#csrfToken }
  }

  transfer(amount, providedToken) {
    if (providedToken !== this.#csrfToken) {
      return { ok: false, reason: 'invalid or missing CSRF token' }
    }
    this.#balance -= amount
    return { ok: true, balance: this.#balance }
  }
}

const server = new Server()

// Attacker's forged request: cookie would be attached automatically by the
// browser, but the attacker has no way to know the current CSRF token
console.log(server.transfer(500, 'guessed-token'))   // { ok: false, reason: 'invalid or missing CSRF token' }

// Legitimate request: the real page read the token from renderTransferForm() first
const { token } = server.renderTransferForm()
console.log(server.transfer(500, token))   // { ok: true, balance: 500 }
```
Walkthrough: the attacker's forged request supplies a guessed token that
doesn't match the server's real one, so `transfer` rejects it before
touching the balance — even though, in a real browser, the victim's
session cookie WOULD have been attached automatically. The legitimate
request only succeeds because it first read the actual current token via
`renderTransferForm()`, something only the real site's own page can do.

## python

```python
class Server:
    def __init__(self):
        self._csrf_token = 'a1b2c3-legit-token'
        self._balance = 1000

    def render_transfer_form(self):
        return {'token': self._csrf_token}

    def transfer(self, amount, provided_token):
        if provided_token != self._csrf_token:
            return {'ok': False, 'reason': 'invalid or missing CSRF token'}
        self._balance -= amount
        return {'ok': True, 'balance': self._balance}


server = Server()

# Attacker's forged request: cookie would be attached automatically by the
# browser, but the attacker has no way to know the current CSRF token
print(server.transfer(500, 'guessed-token'))   # {'ok': False, 'reason': 'invalid or missing CSRF token'}

# Legitimate request: the real page read the token from render_transfer_form() first
token = server.render_transfer_form()['token']
print(server.transfer(500, token))   # {'ok': True, 'balance': 500}
```
Walkthrough: identical token-verification mechanics as the JavaScript
version — the forged request is rejected outright since it can't supply
the real token, while the legitimate request succeeds because it
obtained the actual token first.
