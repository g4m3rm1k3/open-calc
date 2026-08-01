# FOUNDATIONS — LAB-048 — SOLID: Single Responsibility Principle

**Series:** FOUNDATIONS — Part IX: Software Engineering Principles
**Environment:** Browser DevTools console or TypeScript playground
**Time:** 50–65 minutes.

---

## What You Will Build

A `UserManager` class that violates SRP (it does too many things), an extraction of each responsibility into its own class, and a demonstration that a change to one extracted class does not affect the others. After this lab you will be able to identify SRP violations and articulate precisely why they are dangerous.

---

## What You Need to Know First

**From LAB-012–018 (OOP):** You understand classes, encapsulation, and the idea that a class bundles state and behavior. SRP constrains that bundle: each class should have one reason to change.

**From LAB-010 (Modules):** SRP applies at the module level too — each file should have one responsibility. A class per file is idiomatic in many languages.

---

> **Quick Check — try to answer before reading:**
>
> 1. Robert Martin defines SRP as "a class should have one reason to change." What determines what counts as a "reason"?
> 2. If two responsibilities always change together, are they actually one responsibility or two?
> 3. What is the practical cost of violating SRP? Name a concrete scenario.
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — The Violation: A Class That Does Everything

```typescript
class UserManager {
  private users: { id: number; name: string; email: string; password: string }[] = [];

  // Responsibility 1: User data management
  addUser(name: string, email: string, password: string): number {
    const id = Date.now();
    this.users.push({ id, name, email, password });
    return id;
  }

  getUserById(id: number) {
    return this.users.find(user => user.id === id);
  }

  // Responsibility 2: Email communication
  sendWelcomeEmail(userId: number): void {
    const user = this.getUserById(userId);
    if (!user) return;
    // Imagine: call to SMTP server here
    console.log(`Sending welcome email to ${user.email}...`);
  }

  sendPasswordResetEmail(userId: number): void {
    const user = this.getUserById(userId);
    if (!user) return;
    const resetToken = Math.random().toString(36);
    console.log(`Sending reset token ${resetToken} to ${user.email}...`);
  }

  // Responsibility 3: Validation
  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  validatePassword(password: string): boolean {
    return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  }

  // Responsibility 4: Audit logging
  logUserCreation(userId: number): void {
    const user = this.getUserById(userId);
    console.log(`[AUDIT] ${new Date().toISOString()} — User created: ${user?.name} (${userId})`);
  }

  logPasswordReset(userId: number): void {
    console.log(`[AUDIT] ${new Date().toISOString()} — Password reset requested for user ${userId}`);
  }
}
```

**The analysis — four reasons to change:**

1. **User data management:** the data structure changes (add a `role` field, change `id` type) → edit this class
2. **Email communication:** the email provider changes (switch from SMTP to SendGrid) → edit this class
3. **Validation rules:** the password policy tightens (require symbols) → edit this class
4. **Audit logging:** the log format changes (add a request ID) → edit this class

Any of these changes affects a class that the other three consumers depend on. A change to email logic can accidentally break user data management if a merge conflict or refactoring error introduces a bug.

**The SE lens — coupling and fragility:** A class with multiple responsibilities is coupled to multiple external forces. Any change to any of those forces requires modifying the class. Multiple teams may need to modify the same class simultaneously, creating merge conflicts. Tests for one responsibility break when a different responsibility changes.

---

### Step 2 — Extract Each Responsibility

```typescript
// Responsibility 1: User data — one reason to change: storage/structure
class UserRepository {
  private readonly users: Map<number, { id: number; name: string; email: string; password: string }> = new Map();

  add(name: string, email: string, password: string): number {
    const id = Date.now();
    this.users.set(id, { id, name, email, password });
    return id;
  }

  findById(id: number) {
    return this.users.get(id) ?? null;
  }
}

// Responsibility 2: Email — one reason to change: email provider or template
class EmailService {
  sendWelcome(email: string, name: string): void {
    console.log(`[Email] Sending welcome to ${name} at ${email}`);
  }

  sendPasswordReset(email: string, resetToken: string): void {
    console.log(`[Email] Sending reset token to ${email}: ${resetToken}`);
  }
}

// Responsibility 3: Validation — one reason to change: business rules
class UserValidator {
  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  validatePassword(password: string): boolean {
    return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  }
}

// Responsibility 4: Audit — one reason to change: log format or destination
class AuditLogger {
  log(event: string, details: Record<string, unknown>): void {
    console.log(`[AUDIT] ${new Date().toISOString()} — ${event}`, JSON.stringify(details));
  }
}
```

---

### Step 3 — Compose into a Coordinator

The extracted classes are composed by a thin coordinator that orchestrates a use case:

```typescript
class UserRegistrationService {
  constructor(
    private readonly repository: UserRepository,
    private readonly emailService: EmailService,
    private readonly validator: UserValidator,
    private readonly auditLogger: AuditLogger,
  ) {}

  registerUser(name: string, email: string, password: string): number | null {
    if (!this.validator.validateEmail(email)) {
      throw new Error(`Invalid email: ${email}`);
    }
    if (!this.validator.validatePassword(password)) {
      throw new Error('Password does not meet requirements');
    }

    const userId = this.repository.add(name, email, password);
    this.emailService.sendWelcome(email, name);
    this.auditLogger.log('user.registered', { userId, name, email });

    return userId;
  }
}

// Wire up:
const registrationService = new UserRegistrationService(
  new UserRepository(),
  new EmailService(),
  new UserValidator(),
  new AuditLogger(),
);

const id = registrationService.registerUser('Alice', 'alice@example.com', 'Password123');
console.log(`Registered user with ID: ${id}`);
```

**The walkthrough — why this is better:**

- Change the email provider: edit only `EmailService`. `UserRepository`, `UserValidator`, `AuditLogger`, and `UserRegistrationService` are unaffected.
- Change the password rules: edit only `UserValidator`. Nothing else changes.
- Change the log format: edit only `AuditLogger`.
- Change the data storage from in-memory to a real database: edit only `UserRepository`.

Each class has exactly one reason to change. Teams can work on each class independently. Tests for each class are isolated.

**The CS lens — cohesion:** SRP maximises cohesion — the degree to which the contents of a module belong together. High cohesion means every method in the class relates to the same concern. Low cohesion (like the original `UserManager`) means the methods are in the same file by accident, not because they belong together.

---

### Step 4 — SRP at the Function Level

SRP applies to functions too. A function with more than one responsibility is harder to name (its name either omits something or becomes a conjunction: "validateAndSave"):

```typescript
// Violates SRP at the function level:
function validateAndSaveUser(name: string, email: string, password: string): number {
  // validation + storage — two responsibilities
  if (!email.includes('@')) throw new Error('bad email');
  const id = Date.now();
  users.set(id, { name, email, password });
  return id;
}

// Single responsibility — compose at the call site:
function validateUser(name: string, email: string, password: string): void {
  if (!email.includes('@')) throw new Error('bad email');
}

function saveUser(name: string, email: string, password: string): number {
  const id = Date.now();
  users.set(id, { name, email, password });
  return id;
}
```

**The naming rule:** If you cannot name a function without a conjunction ("and", "or", "then"), it has more than one responsibility.

---

## Connect the Pieces

- **Unix philosophy:** each program does one thing well. `grep` finds patterns; `awk` transforms; `sort` sorts. The pipeline composes them. SRP is Unix philosophy applied to classes.
- **Django's separation** of models, views, forms, and serializers is SRP enforced by the framework structure.
- **Microservices architecture** takes SRP to the service level: each service owns one business capability.

---

## What Breaks Without This

**The testing problem:**

Testing `UserManager.sendWelcomeEmail` requires the user data to be set up, the SMTP connection to be mocked, and the audit logger to be captured — three unrelated concerns mixed in one test. When the email test fails, it might be because of a data bug, not an email bug.

With `EmailService` isolated, its test takes only an email address and a name — no repository, no logger. The test is fast, focused, and its failures are unambiguous.

---

## Definition of Done

- [ ] `UserRegistrationService` composes four single-responsibility classes
- [ ] Changing `AuditLogger`'s format requires touching only `AuditLogger` — not `UserRepository` or `EmailService`
- [ ] You can name each extracted class without a conjunction
- [ ] You can explain what "one reason to change" means in terms of the actors (teams, requirements) that drive change
- [ ] Write a test for `UserValidator.validateEmail` that requires zero setup — no repository, no email service

**Git commit:**

```
git add src/
git commit -m "LAB-048: SRP — UserManager with four responsibilities extracted into four cohesive classes; each has exactly one reason to change"
```

---

## Quick Check Answers

1. **The actor (stakeholder) driving the change determines the reason.** If the marketing team controls email templates and the engineering team controls validation, those are two different actors — two different reasons. If only one actor (the engineering team) ever changes both, they might be one reason. Robert Martin's formulation: "a class should be responsible to one, and only one, actor."
2. **If they always change together for the same reason, they may be one responsibility.** If changing one always requires changing the other, and they are always driven by the same stakeholder requirement, keeping them together does not create the SRP problem. Forced separation would just create unnecessary coupling between two classes that cannot change independently anyway.
3. **A merge conflict.** Developer A changes the email logic; Developer B changes the password validation logic. Both edit `UserManager.ts`. The merge conflict forces manual resolution of unrelated changes. The longer the class, the more frequent the conflicts and the more likely the resolution introduces a bug.
