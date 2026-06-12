# Lesson 08 — State Management From First Principles

## What You Will Build

Connect the code editor to a lesson. Display a lesson prompt above the editor — the
problem statement the user is solving. Track what the user has typed in the editor.
Show a character count that updates as they type. This requires understanding how state
flows through a React application and how to share it between components.

---

## What You Need to Know First

- Lesson 02: `useState`, the reactive model
- Lesson 03: Component tree, props, callbacks
- Lesson 07: Monaco editor, `useRef`

---

## The Lesson

### Step 1 — State as the Source of Truth

The fundamental React model is this:

```
UI = f(state)
```

The UI is a pure function of state. Given the same state, the UI is always identical.
Change the state, and React re-renders the UI to match. This is the **declarative model**:
you describe the desired UI for each state, and React handles the updates.

**Derived state vs stored state:** Some values can be computed from other state. Storing
them separately causes consistency bugs.

```typescript
// Wrong: storing derived state separately
const [text, setText] = useState('')
const [charCount, setCharCount] = useState(0)  // derived from text length

// Right: derive charCount from text
const [text, setText] = useState('')
const charCount = text.length  // derived, never stored
```

If you store `charCount` separately, you must remember to update it every time `text`
changes. Forget once, and they diverge. The rule: never store what you can compute.

### Step 2 — The Prop Drilling Problem

When state needs to reach deeply nested components, passing it through every intermediate
component becomes painful.

```
App (owns currentLesson)
└── LessonsScreen
    └── LessonCard
        └── LessonPrompt  ← needs currentLesson.prompt
            └── CodeEditor  ← needs currentLesson.starterCode
```

Passing `currentLesson` through `LessonsScreen` and `LessonCard` even though neither
uses it is **prop drilling** — data tunnelling through layers that do not need it. Each
intermediate component must declare and pass the prop, even if it is irrelevant to it.

Prop drilling causes two problems:
1. Every intermediate component becomes coupled to data it does not use
2. Adding a new field to `currentLesson` requires updating every intermediate component

### Step 3 — `useReducer` for Complex State

When state has multiple related pieces that update together, `useReducer` is cleaner
than multiple `useState` calls.

A **reducer** is a function: `(currentState, action) => newState`. It takes the current
state and a description of what happened (an action), and returns the new state. The
concept comes from functional programming — it is the same pattern as `Array.reduce`.

```typescript
import { useReducer } from 'react'

interface LessonState {
  readonly currentCode: string
  readonly hasEdited: boolean
  readonly submitCount: number
}

type LessonAction =
  | { type: 'CODE_CHANGED'; newCode: string }
  | { type: 'LESSON_RESET'; starterCode: string }
  | { type: 'CODE_SUBMITTED' }

function lessonReducer(state: LessonState, action: LessonAction): LessonState {
  switch (action.type) {
    case 'CODE_CHANGED':
      return { ...state, currentCode: action.newCode, hasEdited: true }
    case 'LESSON_RESET':
      return { currentCode: action.starterCode, hasEdited: false, submitCount: 0 }
    case 'CODE_SUBMITTED':
      return { ...state, submitCount: state.submitCount + 1 }
  }
}
```

**The discriminated union type:**
`type LessonAction` is a **discriminated union** — a union of object types where each
type has a unique `type` field. TypeScript uses the `type` field to narrow which variant
you are in. Inside `case 'CODE_CHANGED'`, TypeScript knows `action.newCode` exists.
Inside `case 'LESSON_RESET'`, TypeScript knows `action.starterCode` exists.

**Using `useReducer`:**
```typescript
const [state, dispatch] = useReducer(lessonReducer, {
  currentCode: lesson.starterCode,
  hasEdited: false,
  submitCount: 0,
})

// To update state:
dispatch({ type: 'CODE_CHANGED', newCode: newValue })
```

`dispatch` sends an action to the reducer. The reducer produces a new state. React
re-renders with the new state. No direct mutation — always through the reducer.

**Why `useReducer` over multiple `useState`?**
When state updates are related (`currentCode` and `hasEdited` always change together),
a reducer makes the relationship explicit. You cannot accidentally update one without
the other. The reducer is also pure — given the same state and action, it always returns
the same new state — making it easy to test without React.

**CS lens — the Redux pattern:** `useReducer` implements the same pattern as the Redux
library (a popular state management library). The principle: state lives in one place,
changes go through a single dispatch function, the reducer is pure. This makes state
changes predictable and debuggable — you can replay actions to reproduce any bug.

### Step 4 — `useContext` for Shared State

When multiple components need the same state, the **Context API** avoids prop drilling.
A context is a named value that any descendant component can read without it being
passed explicitly through every intermediate.

**Creating a lesson context:**

Create `src/context/LessonContext.tsx`:

```typescript
import { createContext, useContext, useReducer, type ReactNode } from 'react'

interface Lesson {
  readonly id: string
  readonly title: string
  readonly prompt: string
  readonly starterCode: string
}

interface LessonContextValue {
  readonly currentLesson: Lesson | null
  readonly currentCode: string
  readonly hasEdited: boolean
  readonly setCurrentLesson: (lesson: Lesson) => void
  readonly updateCode: (code: string) => void
  readonly resetLesson: () => void
}

const LessonContext = createContext<LessonContextValue | null>(null)
```

**`createContext<T>(defaultValue)` explained:**
`createContext` creates a React context — a named slot in the component tree that holds
a value. The type argument `<LessonContextValue | null>` tells TypeScript what type of
value this context holds. The `null` default is used when a component reads the context
outside of a provider (a programming error we catch below).

**The provider component:**

```typescript
interface LessonProviderProps {
  readonly children: ReactNode
}

export function LessonProvider({ children }: LessonProviderProps) {
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [currentCode, setCurrentCode] = useState('')
  const [hasEdited, setHasEdited] = useState(false)

  function updateCode(newCode: string) {
    setCurrentCode(newCode)
    setHasEdited(true)
  }

  function resetLesson() {
    if (currentLesson !== null) {
      setCurrentCode(currentLesson.starterCode)
      setHasEdited(false)
    }
  }

  const contextValue: LessonContextValue = {
    currentLesson,
    currentCode,
    hasEdited,
    setCurrentLesson,
    updateCode,
    resetLesson,
  }

  return (
    <LessonContext.Provider value={contextValue}>
      {children}
    </LessonContext.Provider>
  )
}
```

**`LessonContext.Provider` explained:**
`Provider` is a component attached to every context object. Any component inside the
Provider's subtree can read the context value. Components outside the Provider read
the default value (`null`).

**The custom hook pattern:**

```typescript
export function useLessonContext(): LessonContextValue {
  const context = useContext(LessonContext)
  if (context === null) {
    throw new Error('useLessonContext must be used inside a LessonProvider')
  }
  return context
}
```

`useContext(LessonContext)` reads the nearest `LessonContext.Provider`'s value. The
null check is critical: if a component calls `useLessonContext()` outside the Provider,
the error message tells the developer exactly what went wrong and how to fix it. Without
the check, the component would crash with `TypeError: Cannot read properties of null`
— unhelpful.

**SE lens — the single source of truth:** Every piece of state lives in exactly one place.
The lesson state lives in `LessonProvider`. Every component that needs it reads from
one source. No copies, no synchronisation bugs.

### Step 5 — `useEffect` for Side Effects

A **side effect** is anything that reaches outside React's render cycle: API calls, timers,
subscriptions, DOM mutations. `useEffect` is how you run side effects after a render.

```typescript
import { useEffect } from 'react'

function LessonScreen({ lessonId }: { lessonId: string }) {
  const { setCurrentLesson } = useLessonContext()

  useEffect(() => {
    // This runs after the component renders, not during
    const lesson = LESSONS.find(l => l.id === lessonId)
    if (lesson !== undefined) {
      setCurrentLesson(lesson)
    }
  }, [lessonId, setCurrentLesson])  // dependency array

  // ...
}
```

**The dependency array:**
`useEffect` runs after every render by default. To control when it runs:
- `[]` (empty array) — run once after the first render only
- `[lessonId]` — run after the first render, and again whenever `lessonId` changes
- No array — run after every render

When `lessonId` changes (the user navigated to a different lesson), the effect runs again
and updates `currentLesson`. This is the pattern for loading data in response to navigation.

**What happens without the dependency array:**
`useEffect(() => { ... })` (no second argument) runs after every render. If the effect
itself causes a re-render (by calling `setCurrentLesson`), the component re-renders,
the effect runs again, re-render, infinite loop. The dependency array prevents this.

**SE lens — the separation of concerns:** `useEffect` separates concerns: the component
function describes what to render; effects handle the consequences of rendering (API calls,
subscriptions). If rendering had side effects, it would be impossible to reason about
when those effects ran.

### Step 6 — The Complete Lesson Screen

Wrap the app in the provider, then use the context in the screen:

In `App.tsx`, add `LessonProvider` around the navigation:

```typescript
import { LessonProvider } from './src/context/LessonContext'

export default function App() {
  return (
    <NavigationContainer>
      <LessonProvider>
        <TabNavigator />
      </LessonProvider>
    </NavigationContainer>
  )
}
```

In `LessonsScreen.tsx`:
```typescript
import { Text, View, ScrollView, StyleSheet } from 'react-native'
import { useLessonContext } from '../context/LessonContext'
import { CodeEditor } from '../components/CodeEditor'
import { colors, spacing, typography } from '../theme'

const SAMPLE_LESSON = {
  id: '01',
  title: 'Hello, World',
  prompt: 'Write a function that returns the string "Hello, World" and log it to the console.',
  starterCode: `function helloWorld() {\n  // Write your solution here\n}\n\nconsole.log(helloWorld())\n`,
}

export function LessonsScreen() {
  const { currentLesson, currentCode, updateCode, setCurrentLesson } = useLessonContext()

  // Load the sample lesson if none is loaded
  if (currentLesson === null) {
    setCurrentLesson(SAMPLE_LESSON)
  }

  const charCount = currentCode.length  // derived, not stored

  return (
    <ScrollView style={styles.container}>
      {currentLesson !== null && (
        <>
          <Text style={styles.title}>{currentLesson.title}</Text>
          <Text style={styles.prompt}>{currentLesson.prompt}</Text>
        </>
      )}
      <CodeEditor
        defaultValue={currentLesson?.starterCode ?? ''}
        language="javascript"
        height={200}
      />
      <Text style={styles.charCount}>{charCount} characters</Text>
    </ScrollView>
  )
}
```

**`<>` and `</>` — React fragments:**
`<>...</>` is a React fragment — a wrapper that lets you return multiple adjacent elements
without wrapping them in a `<View>`. Fragments do not create an extra DOM node.

**`currentLesson?.starterCode ?? ''`:**
`?.` is **optional chaining** — if `currentLesson` is `null`, the expression short-circuits
and returns `undefined` instead of throwing a TypeError. `??` is the **nullish coalescing
operator** — returns the right side if the left side is `null` or `undefined`. Together:
"give me `currentLesson.starterCode`, or empty string if currentLesson is null."

---

## Connect the Pieces

`LessonProvider` is the first instance of the **context pattern** in this app. In
Lesson 17, an `AuthContext` will provide user authentication state to every screen.
In Lesson 22, a `ProgressContext` will provide lesson completion data. Each context
follows the same structure: `createContext` → `Provider` → custom hook.

The `useReducer` pattern is the foundation of the Redux library, which large teams use
for predictable state management. React Query (introduced in Lesson 16) manages server
state in a similar way: dispatch a query, the reducer handles loading/error/success
transitions, components read the current state.

Unidirectional data flow — data flows down via props and context, events flow up via
callbacks — is the React philosophy. This is the same philosophy as functional programming:
pure transformations on data, no hidden state changes. Lesson 33 (functional programming
concepts) will formalise this.

---

## What Breaks Without This

Without the dependency array in `useEffect`, loading a lesson causes an infinite loop:
load lesson → `setCurrentLesson` → re-render → `useEffect` runs again → `setCurrentLesson`
again → re-render → ... The app freezes. The dependency array is not optional.

Without the null check in `useLessonContext`, calling it outside the provider crashes
with `TypeError: Cannot read properties of null (reading 'currentLesson')` — pointing
at a line inside the hook, not at the component that was called in the wrong place.
The explicit error message makes debugging minutes instead of hours.

---

## Definition of Done

- [ ] The Lessons screen shows a lesson title, prompt, and the Monaco editor pre-filled with starter code
- [ ] A character count below the editor updates as you type (without a page reload)
- [ ] The character count is derived from the code string, not stored separately
- [ ] `LessonProvider` wraps the navigator in `App.tsx`
- [ ] `useLessonContext()` called outside `LessonProvider` throws a clear error message
- [ ] You can answer: what is derived state and why is it never stored separately?
- [ ] You can answer: what does the dependency array of `useEffect` do?
- [ ] You can answer: what problem does `useContext` solve that prop drilling does not?
- [ ] You can answer: what is a discriminated union type and why is it used for `LessonAction`?
- [ ] `git commit` with a message explaining why — "Add LessonContext, connect editor to lesson prompt and starter code"
