# FOUNDATIONS — LAB-049 — SOLID: Open/Closed Principle

**Series:** FOUNDATIONS — Part IX: Software Engineering Principles
**Environment:** TypeScript playground
**Time:** 50–65 minutes.

---

## What You Will Build

A notification system that violates OCP (a switch-on-type that must be modified for every new type), a refactored version using polymorphism, and a demonstration that adding `PushNotification` requires zero changes to existing code. After this lab you will be able to identify the abstraction point that enables extension without modification.

---

## What You Need to Know First

**From LAB-017 (Interfaces):** The mechanism for OCP is an interface. The caller depends on the interface; new implementations are added without changing the caller.

**From LAB-048 (SRP):** OCP and SRP often work together — extracting responsibilities (SRP) creates the abstraction points that enable extension (OCP).

---

> **Quick Check — try to answer before reading:**
>
> 1. Bertrand Meyer's original OCP said modules should be "open for extension, closed for modification." What does "closed for modification" protect?
> 2. A `switch (notification.type)` that handles three notification types — what happens when you add a fourth?
> 3. Can an interface be "closed" when it already has concrete implementations?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — The OCP Violation: A Switch That Grows

```typescript
type NotificationType = 'email' | 'sms' | 'slack';

interface Notification {
  type: NotificationType;
  recipient: string;
  message: string;
}

// This function violates OCP — adding a new notification type requires modifying it:
function sendNotification(notification: Notification): void {
  switch (notification.type) {
    case 'email':
      console.log(`[Email] Sending "${notification.message}" to ${notification.recipient}`);
      break;
    case 'sms':
      console.log(`[SMS] Texting "${notification.message}" to ${notification.recipient}`);
      break;
    case 'slack':
      console.log(`[Slack] Posting "${notification.message}" to #${notification.recipient}`);
      break;
    // Every new channel requires adding a case here — this function is never "done"
    default:
      throw new Error(`Unknown notification type: ${notification.type}`);
  }
}
```

**The walkthrough — why this violates OCP:**

To add `PushNotification`, you must edit `sendNotification`. This means:
- The existing cases (email, SMS, Slack) are subject to regression — a typo in the new case could break them.
- The function has no stable contract — it changes every time a new requirement arrives.
- The function must be tested again after each addition.
- Every team that wants to add a channel must touch this shared function — multiple teams, one file, merge conflicts.

**The CS lens — the abstraction point:** The violation is the `notification.type` switch. It is a branching point that encodes knowledge of every existing implementation. Every new implementation requires extending this knowledge. The fix is to make the branching point an interface — let each implementation carry its own knowledge.

---

### Step 2 — The Fix: Polymorphism via Interface

```typescript
// The abstraction: what every notifier must be able to do
interface Notifier {
  send(recipient: string, message: string): void;
}

// Implementations — each is closed when written; system extends by adding new ones:
class EmailNotifier implements Notifier {
  send(recipient: string, message: string): void {
    console.log(`[Email] Sending "${message}" to ${recipient}`);
  }
}

class SMSNotifier implements Notifier {
  send(recipient: string, message: string): void {
    console.log(`[SMS] Texting "${message}" to ${recipient}`);
  }
}

class SlackNotifier implements Notifier {
  send(recipient: string, message: string): void {
    console.log(`[Slack] Posting "${message}" to #${recipient}`);
  }
}

// The caller — closed for modification; open for extension via new implementations:
function sendNotification(notifier: Notifier, recipient: string, message: string): void {
  notifier.send(recipient, message);
}

// Usage:
sendNotification(new EmailNotifier(), 'alice@example.com', 'Welcome!');
sendNotification(new SMSNotifier(), '+1-555-1234', 'Verification code: 123456');
```

---

### Step 3 — Adding a New Type Without Modifying Existing Code

```typescript
// Adding PushNotification — zero changes to EmailNotifier, SMSNotifier, SlackNotifier, or sendNotification:
class PushNotifier implements Notifier {
  constructor(private readonly deviceToken: string) {}

  send(recipient: string, message: string): void {
    console.log(`[Push] Sending "${message}" to device ${this.deviceToken} for ${recipient}`);
  }
}

// Works immediately with the existing sendNotification function:
sendNotification(new PushNotifier('device-abc-123'), 'Bob', 'You have a new message');
```

**The walkthrough:** `sendNotification` calls `notifier.send(...)`. The `notifier` parameter is typed as `Notifier`. `PushNotifier` implements `Notifier`. TypeScript verifies the interface is satisfied. `sendNotification` does not change — it never knew about `PushNotification` and never needs to.

**The SE lens — what was closed and what was open:**

| What | State |
|---|---|
| `Notifier` interface | Closed — callers depend on this |
| `sendNotification` function | Closed — does not change for new channels |
| `EmailNotifier`, `SMSNotifier`, `SlackNotifier` | Closed — existing implementations are not modified |
| Adding `PushNotifier` | Open — extension by adding new code |

"Closed" means the existing code is protected from modification when new behavior is added. Extension adds new files, not new `case` statements.

---

### Step 4 — A More Complex Example: Report Exporters

```typescript
interface ReportExporter {
  export(data: Record<string, unknown>[]): string;
}

class CsvExporter implements ReportExporter {
  export(data: Record<string, unknown>[]): string {
    if (!data.length) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
  }
}

class JsonExporter implements ReportExporter {
  export(data: Record<string, unknown>[]): string {
    return JSON.stringify(data, null, 2);
  }
}

class HtmlExporter implements ReportExporter {
  export(data: Record<string, unknown>[]): string {
    if (!data.length) return '<table></table>';
    const headers = Object.keys(data[0])
      .map(key => `<th>${key}</th>`).join('');
    const rows = data.map(row =>
      `<tr>${Object.values(row).map(val => `<td>${val}</td>`).join('')}</tr>`
    ).join('');
    return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  }
}

// The report generator is closed:
function generateReport(data: Record<string, unknown>[], exporter: ReportExporter): string {
  return exporter.export(data);
}

const salesData = [
  { product: 'Widget', quantity: 100, revenue: 1000 },
  { product: 'Gadget', quantity: 50,  revenue: 750 },
];

console.log(generateReport(salesData, new CsvExporter()));
console.log(generateReport(salesData, new JsonExporter()));
// Adding MarkdownExporter requires only a new class — no changes to generateReport
```

---

### Step 5 — OCP and the Strategy Pattern

OCP and the Strategy pattern (LAB-084) are two views of the same idea. Strategy is the design pattern; OCP is the principle it implements. When you select an algorithm at runtime by injecting a strategy object, you are applying OCP: the context is closed for modification; the algorithm is open for extension by adding new strategy classes.

---

## Connect the Pieces

- **Express/Koa middleware** is OCP: the framework's request processing pipeline is closed; you extend behavior by adding middleware functions.
- **VS Code's extension API** is OCP: the editor is closed; you extend it by publishing extensions.
- **TypeORM's database drivers:** the ORM is closed; new databases are supported by adding driver implementations.

---

## What Breaks Without This

**Regression risk in the switch:**

Adding `case 'push'` to the original `sendNotification` switch requires editing a function that already handles email, SMS, and Slack correctly. A copy-paste error (using `notification.recipient` where you meant `deviceToken`) silently works for push but could accidentally affect an adjacent case if the conditional logic is complex. The test suite for email must be re-run even though the email code did not change.

With OCP applied, `PushNotifier` is a new class with new tests. The email, SMS, and Slack tests run in isolation and are unaffected.

---

## Definition of Done

- [ ] Adding `PushNotifier` requires creating one new class — demonstrate that zero existing files change
- [ ] `sendNotification(new PushNotifier(...), ...)` works correctly
- [ ] TypeScript produces an error if `PushNotifier` is missing the `send` method
- [ ] You can explain what the "abstraction point" is and why it makes the function "closed"
- [ ] Write a unit test for `EmailNotifier.send` that runs independently of `sendNotification`

**Git commit:**

```
git add src/
git commit -m "LAB-049: OCP — switch-on-type refactored to Notifier interface; PushNotifier added with zero changes to existing code; polymorphism is the mechanism"
```

---

## Quick Check Answers

1. **"Closed for modification" protects existing, working code from being changed.** Every change to working code risks introducing a regression. Bugs introduced during modification are hard to find because the changed function worked before the change. OCP says: once a module works correctly, never touch it again for new requirements — add new code instead.
2. **You must edit the function — a modification that risks breaking existing cases.** The function is never stable. Every new notification type reopens the function to modification. This is precisely the "open for modification" smell that OCP identifies.
3. **Yes.** A stable interface with existing implementations is "closed" — you do not change the interface. The concrete implementations are also "closed" once they work. New behavior is added by creating new implementations of the same interface. The interface defines the extension point; additions occur by implementing it, not by modifying it.
