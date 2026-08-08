# Frontend Lesson 6 — Accessibility Audit, Design Consistency, and User Flows

**Track:** Developer Social Network — Slice 7
**Depth:** Heavy on judgment and process, light on new syntax — this is an audit of code you already wrote, not a new feature
**Goal:** Actually audit the app built across Slices 1-5 for accessibility gaps, inconsistencies, and unclear user flows — applying the UI/UX interlude's heuristics for real, against real code, rather than reading about them in the abstract a second time.

---

## 0. Why an audit lesson, not a new feature lesson

Every earlier lesson built something new. This one deliberately doesn't — it goes back over `SignupForm`, `LoginForm`, `PostFeed`, `CommentThread`, and `NotificationBell` with a critical eye, using the UI/UX interlude's framework for real, against your own actual code, rather than a hypothetical example. This is closer to what real frontend work looks like day to day than any single feature lesson: most UI work is refining and fixing existing screens, not building new ones from a blank page.

---

## 1. A real accessibility audit — using a browser tool, not just reading code

Install and run **axe DevTools** (a free browser extension) or use Chrome's built-in **Lighthouse** accessibility audit (DevTools → Lighthouse tab → Accessibility category) against the running app. This is the actual practice worth building: automated tools catch a meaningful chunk of real accessibility issues (missing labels, poor color contrast, missing alt text) without requiring manual expertise for every check.

**Run it against each of these screens and record what it flags:**
- The signup form (Frontend Lesson 1)
- The login form (Frontend Lesson 2)
- The post feed with a few posts loaded (Frontend Lesson 3)
- A post with several comments (Frontend Lesson 4)

**What you're likely to find, and why, tied back to earlier lessons:**

- **Likely clean:** form labels, since Frontend Lessons 1-2 used real `<label htmlFor="...">` from the start (UI/UX interlude, Section 3, named this decision after the fact). This is worth confirming rather than assuming — a tool catching zero issues where you expected zero is a genuine, useful confirmation, not a wasted check.
- **Likely flagged:** the `NotificationBell`'s badge (Frontend Lesson 5) — `<span data-testid="unread-badge">{unreadCount}</span>` has no accessible label explaining *what* the number represents to a screen reader user; it just announces a bare number with no context.
- **Likely flagged:** color contrast, if any styling was added ad hoc without checking contrast ratios — worth checking explicitly rather than assuming default styles are fine.

**Fixing the notification badge, concretely:**

```typescript
// Before
{unreadCount > 0 && (
  <span data-testid="unread-badge">{unreadCount}</span>
)}

// After
{unreadCount > 0 && (
  <span data-testid="unread-badge" aria-label={`${unreadCount} unread notifications`}>
    {unreadCount}
  </span>
)}
```

**`aria-label`** — an ARIA attribute that provides an accessible name for an element, used specifically here because the *visible* text (just a number) doesn't convey enough meaning on its own for a screen reader user; `aria-label` supplies the fuller context ("5 unread notifications") without changing what sighted users see.

---

## 2. A design-system consistency pass

Go through every button across the app (Sign Up, Log In, Post Comment, Load More) and every form input, and check for genuine, unjustified inconsistency — not stylistic perfectionism, but real inconsistency that would confuse a user (the UI/UX interlude's "consistency and standards" heuristic, applied for real this time).

**A concrete thing to actually check:** do all primary action buttons (Sign Up, Log In, Post Comment) share the same visual treatment, or did each get built with slightly different, unintentional styling because they were written in separate lessons? If they differ with no real reason, that's worth fixing — genuinely, not just as an exercise:

```typescript
// src/components/PrimaryButton.tsx - extracting a shared, consistent button
interface PrimaryButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: () => void;
}

export function PrimaryButton({ children, type = 'button', disabled = false, onClick }: PrimaryButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="primary-button"
    >
      {children}
    </button>
  );
}
```

**Why extract this now, rather than earlier:** doing this in Frontend Lesson 1, before there were multiple buttons to compare, would have been premature — you'd be guessing at a shared shape before real usage revealed what actually needed to be shared. Extracting a shared component now, once several real buttons exist and their genuine commonalities (and differences) are visible, is a better-informed decision — the same "don't refactor before you have enough real examples" instinct as Backend Lesson 1, Section 9's refactor discussion.

**`children: React.ReactNode`** — the TypeScript type for "whatever JSX gets nested inside this component" (Frontend Lesson 2's `AuthProvider` used the same type for the same reason) — letting `PrimaryButton` wrap arbitrary content ("Sign Up," "Log In," or even an icon) rather than being locked to a single hardcoded label.

---

## 3. Mapping real user flows

A **user flow** is the actual sequence of screens/actions a real person takes to accomplish something — worth mapping explicitly rather than assuming the pieces connect sensibly just because each screen works in isolation.

**Map the "new user posts their first comment" flow, step by step, using what's actually built:**

1. Land on the app → see the post feed (`PostFeed`, no auth required to view — confirm this is actually true by checking `GET /posts`'s route in Backend Lesson 3: no `Depends(get_current_user)` there, so yes)
2. Click something to comment → **redirected to sign up, since there's no account yet**
3. Complete `SignupForm` → **then what?** Does the user land back on the post they wanted to comment on, or somewhere generic?
4. Log in (if signup doesn't auto-login) → **then what?**
5. Finally reach `CommentForm` and submit

**The real gap this mapping surfaces:** nothing built across Slices 1-5 actually handles step 3/4's "return the user to where they were trying to go" — `SignupForm`'s `onSubmitSuccess` prop (Frontend Lesson 1) just signals success generically, with no memory of *what the user was originally trying to do*. This is a genuine, real gap that wouldn't show up testing each component in isolation — it only becomes visible by walking the actual multi-step flow a real user would take, which is the entire point of this exercise.

---

## 4. Fixing the flow gap — a small, real feature

```typescript
// src/context/AuthContext.tsx (add)
interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  redirectAfterAuth: string | null;
  setRedirectAfterAuth: (path: string | null) => void;
}
```

A small addition: when `ProtectedRoute` (Frontend Lesson 2) redirects an unauthenticated user away from an action they were trying to take, it records *where they were trying to go*, so the signup/login flow can send them back there afterward instead of dropping them somewhere generic:

```typescript
// src/components/ProtectedRoute.tsx (modify)
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token, setRedirectAfterAuth } = useAuth();
  const location = useLocation();   // react-router-dom hook: current URL path

  if (token === null) {
    setRedirectAfterAuth(location.pathname);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

This is a small, concrete example of Section 3's audit actually producing real, justified new work — not busywork, a fix for a genuine gap the flow-mapping exercise surfaced that unit-testing each component in isolation never would have caught.

---

## 5. Challenges

1. Actually run an accessibility audit tool against your own running app (not hypothetically — install one and use it). Record every issue it flags, and for each one, decide: fix it now, or explicitly defer it with a stated reason (the same "not everything needs immediate action" judgment from the UI/UX interlude's Section 2, Decision 3 area).
2. Extract at least one more shared component beyond `PrimaryButton` (Section 2) — look for real, repeated patterns across your own `SignupForm`, `LoginForm`, and `CommentForm` (a text input + label pairing is a strong candidate) and consolidate it, confirming existing tests still pass afterward.
3. Map a second real user flow end to end, the way Section 3 mapped the first-comment flow: "an existing logged-in user checks their notifications and navigates to the post that triggered one." Does everything built so far actually support clicking a notification and landing on the relevant post, or is that another real gap?
4. Implement Section 4's `redirectAfterAuth` fully — update `SignupForm` and `LoginForm` to redirect to the stored path (or `/` if none) after a successful auth, and write a test confirming the redirect actually happens correctly.

---

## What's next

The final lesson: a SOLID-principles audit of the codebase — applied retroactively to code you've already written, the same audit-not-new-feature spirit as this lesson — closing with the full-stack capstone and a short architecture-decision-record writeup. Say the word when you're ready.
