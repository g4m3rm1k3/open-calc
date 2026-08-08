# Frontend Lesson 5 — Notification Bell, Polling, and State Lifting

**Track:** Developer Social Network — Slice 5 (Frontend)
**Depth:** Heavy on state lifting specifically — it's a genuine design decision, not just new syntax, and it closes out the "where does shared state live" question that Context (Frontend Lesson 2) only partly answered
**Goal:** A notification bell showing an unread count, polling the backend on an interval, with its state lifted to a shared location so both a header bell icon and a full notification list can use the same data without duplicating fetch logic.

---

## 0. The state-lifting question, named precisely

The notification bell needs to live in the app's header (visible on every page). A full notification list page also needs the same data. If each fetched independently, you'd have two separate, potentially out-of-sync copies of "the current notifications" — mark one as read in the list, and the header bell wouldn't know. **State lifting** means moving shared state *up* to the nearest common ancestor of everything that needs it, so there's exactly one source of truth, passed down (or provided via Context) to whoever needs to read or update it.

**Why not just put everything in `AuthContext` (Frontend Lesson 2)?** Because auth state and notification state are conceptually different concerns, with different lifecycles and different reasons to change — mixing them into one context would make both harder to reason about independently. This lesson creates a *second*, separate context specifically for notifications — the same pattern as `AuthContext`, applied to a different, unrelated piece of shared state. Recognizing "this is the same pattern, applied again" rather than treating each context as a one-off is worth noticing.

---

## 1. `NotificationContext` — the same pattern as `AuthContext`, deliberately

```typescript
// src/context/NotificationContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  refresh: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const POLL_INTERVAL_MS = 15000;   // check for new notifications every 15 seconds

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { token } = useAuth();

  const fetchNotifications = async () => {
    if (token === null) return;   // not logged in - nothing to fetch

    const response = await fetch('http://localhost:8000/notifications', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const data: Notification[] = await response.json();
      setNotifications(data);
    }
  };

  useEffect(() => {
    fetchNotifications();   // fetch immediately when logged in

    const intervalId = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);   // cleanup - stop polling if this unmounts, or token changes
  }, [token]);   // re-run (and restart polling) whenever the logged-in user changes

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, refresh: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
```

Reading the pieces genuinely new here:

**`setInterval(fetchNotifications, POLL_INTERVAL_MS)` inside `useEffect`** — this is the polling mechanism itself: `setInterval` schedules `fetchNotifications` to run repeatedly, every `POLL_INTERVAL_MS` milliseconds, for as long as the interval keeps running. Combined with the cleanup function (`return () => clearInterval(intervalId)`), this means polling automatically starts when the provider mounts (or `token` changes) and automatically stops when it's no longer needed — the same cleanup pattern the earlier `useEffect` primer's `Clock` example demonstrated, now doing real, meaningful work instead of a toy example.

**Why `[token]` as the dependency array, not `[]`:** if `token` changes (user logs out, or a different user logs in), the polling needs to restart, fetching *that* user's notifications instead of continuing to poll for the previous user (or continuing to poll at all, if `token` becomes `null`). The cleanup function guarantees the *old* interval is stopped before a new one potentially starts — without it, logging out and back in as a different user could leave multiple overlapping polling intervals running simultaneously, a real, subtle bug.

**`unreadCount = notifications.filter((n) => !n.is_read).length`** — computed fresh on every render directly from `notifications`, rather than stored as its own separate piece of state. This is a deliberate choice: `unreadCount` is entirely *derived* from `notifications` — storing it separately would create two things that need to stay in sync, an unnecessary duplication (and a potential source of the exact "state can drift out of sync" problem Section 0 opened with, just recreated one level deeper if done carelessly).

---

## 2. Wiring the provider — nested inside `AuthProvider`, deliberately

```typescript
// src/App.tsx
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        {/* rest of the app */}
      </NotificationProvider>
    </AuthProvider>
  );
}
```

**Why `NotificationProvider` nests *inside* `AuthProvider`, not the other way around, or side by side:** `NotificationProvider` calls `useAuth()` internally (Section 1), which requires being rendered somewhere inside an `AuthProvider`. This nesting order is a direct, structural consequence of that dependency — worth noticing as cause and effect, not an arbitrary ordering convention.

---

## 3. Test-first — the notification bell

```typescript
// src/components/NotificationBell.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import { NotificationBell } from './NotificationBell';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <AuthProvider>
      <NotificationProvider>{ui}</NotificationProvider>
    </AuthProvider>
  );
}

describe('NotificationBell', () => {
  it('shows no badge when there are zero unread notifications', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });

    renderWithProviders(<NotificationBell />);

    await waitFor(() => {
      expect(screen.queryByTestId('unread-badge')).not.toBeInTheDocument();
    });
  });

  it('shows the unread count when there are unread notifications', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { id: 1, message: 'A', is_read: false, created_at: '2026-01-01T00:00:00Z' },
        { id: 2, message: 'B', is_read: false, created_at: '2026-01-01T00:00:00Z' },
        { id: 3, message: 'C', is_read: true, created_at: '2026-01-01T00:00:00Z' },
      ],
    });

    renderWithProviders(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByTestId('unread-badge')).toHaveTextContent('2');
    });
  });
});
```

**`screen.getByTestId('unread-badge')` / `data-testid`** — a new query type, worth explaining: `getByRole` and `getByLabelText` (used in every earlier lesson) work well when an element has natural, meaningful text or a semantic role. A small numeric badge often doesn't have obvious accessible text to query by, so `data-testid` is an explicit, test-only marker added purely to make an element findable in tests — a reasonable, common fallback specifically for cases like this, not a replacement for the more semantic queries used everywhere else.

Run this — red, `NotificationBell` doesn't exist yet.

---

## 4. Green

```typescript
// src/components/NotificationBell.tsx
import { useNotifications } from '../context/NotificationContext';

export function NotificationBell() {
  const { unreadCount } = useNotifications();

  return (
    <div>
      <span>🔔</span>
      {unreadCount > 0 && (
        <span data-testid="unread-badge">{unreadCount}</span>
      )}
    </div>
  );
}
```

Notice how small this component is — nearly all the real logic (fetching, polling, computing the count) lives in `NotificationContext`, and `NotificationBell` just *reads* `unreadCount` and renders accordingly. This is the actual payoff of state lifting: the component that *displays* notifications is completely decoupled from the logic that *fetches and manages* them — the same "one clear job per piece" principle from Frontend Lesson 4's component composition, applied here to state management instead of UI structure.

Run the tests again — green.

---

## 5. Challenges before Slice 6

1. Write a failing test first: render `NotificationBell` wrapped in providers where the mocked `fetch` simulates the poll interval firing *again* with a *new* notification (you'll need Vitest's fake timers — research `vi.useFakeTimers()` briefly) — confirm the badge count updates after the simulated interval fires, not just on initial load.
2. Build a `NotificationList` component (full list, not just the bell) that also uses `useNotifications()` — confirm it shows the *same* data as `NotificationBell` without making any additional fetch calls of its own, proving the shared-context approach actually avoids duplicate fetching.
3. Add a `markAsRead` function to `NotificationContext`, calling Backend Lesson 5, Challenge 2's `PATCH /notifications/{id}/read` endpoint, and update local state optimistically (Frontend Lesson 4's pattern) rather than waiting for a full re-fetch. Test it.
4. `POLL_INTERVAL_MS` is hardcoded at `15000`. Is 15 seconds a good choice? Reason through the real tradeoff (server load / staleness of data) rather than treating it as an arbitrary number — this is the same kind of judgment call as the UI/UX interlude's Decision 3, just for a timing parameter instead of a UI element.

---

## Slice 5 complete

Notifications, built through the Observer pattern (decoupling "a comment happened" from "notify someone"), the memory model explaining exactly why spread-based state updates matter, and now polling plus state lifting tying it all together on the frontend, with one shared source of truth instead of duplicated fetch logic.

## What's next

Slice 6 steps back from features entirely: refactoring the app's structure toward clean/hexagonal architecture, and a deeper Domain-Driven Design pass — aggregates and bounded contexts, applied by actually reorganizing code you've already written rather than starting something new. Say the word when you're ready.
