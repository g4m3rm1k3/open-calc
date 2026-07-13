---
series: react-fundamentals
level: 1
title: useState and Event Handling
lang: javascript
---

# useState and Event Handling

React components can be stateless (they always render the same output for the same props) or stateful (they can change their output over time in response to user interactions). The `useState` hook is React's mechanism for adding state to a function component.

Before hooks (introduced in React 16.8, 2019), state could only live in class components. Hooks let function components have the same capabilities. By the end of this lesson you will understand what `useState` returns, the rules for calling hooks, and how React batches state updates.

## useState: adding state to a component

```javascript
import { useState } from 'react'

function Counter() {
  // useState(initialValue) returns [currentValue, setterFunction]
  const [count, setCount] = useState(0)
  // count: the current value (starts at 0)
  // setCount: the function to update it (calling it triggers a re-render)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  )
}
```

```text
WHAT HAPPENS WHEN setCount IS CALLED:

  1. React schedules a re-render of this component.
  2. React calls the Counter function again.
  3. useState(0) is called again — but React remembers the previous count value.
     It returns the NEW count value, not 0.
  4. The component returns new JSX with the updated count.
  5. React diffs the new JSX against the previous render.
  6. React updates only the changed parts of the DOM (<p>Count: 6</p>).
  
  KEY INSIGHT: every re-render calls the component function from scratch.
  useState doesn't reset to 0 because React keeps state outside the function,
  associated with the component's position in the tree.
  The initial value (0) is only used on the FIRST render.
```

**CS lens:** `useState` is a form of **persistent state outside the function**. Normally, local variables in a function are created on call and destroyed on return. `useState` stores its value in React's internal "fiber" data structure, keyed to the component's position in the component tree. When the component re-renders, React retrieves the stored value. This is why hooks must be called in the same order on every render — React identifies each hook call by its position in the call sequence, not by name. Calling a hook inside an `if` statement changes the position count and confuses React's hook tracking.

## Multiple state variables

```javascript
function Form() {
  // Multiple useState calls — each is independent
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]       = useState(null)
  
  function handleSubmit(event) {
    event.preventDefault()  // prevents browser from submitting the form and reloading the page
    
    if (!name.trim() || !email.includes('@')) {
      setError('Name and valid email are required.')
      return
    }
    
    // On success: update submitted state
    setError(null)
    setSubmitted(true)
  }
  
  if (submitted) {
    return <p>Thanks, {name}! We'll contact you at {email}.</p>
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}
      <input
        type="text"
        value={name}
        onChange={event => setName(event.target.value)}
        placeholder="Name"
      />
      <input
        type="email"
        value={email}
        onChange={event => setEmail(event.target.value)}
        placeholder="Email"
      />
      <button type="submit">Submit</button>
    </form>
  )
}
```

```text
CONTROLLED INPUTS:
  <input value={name} onChange={e => setName(e.target.value)} />
  
  This is a "controlled" input: React owns the value.
  The input's displayed text comes from `name` (React state).
  Every keystroke calls onChange → setName → re-render → input shows new value.
  
  Why controlled inputs:
  → The input's current value is always in React state — accessible anywhere
  → You can validate or transform the value before storing it
  → You can clear the input programmatically: setName('')
  → The form and the state are always in sync
  
  UNCONTROLLED inputs (without value prop):
  → The DOM owns the value
  → You read it with a ref (ref.current.value)
  → Harder to validate in real time, harder to sync with other state
  → Use for file inputs (which React can't control) and rare performance cases

event.preventDefault():
  Forms default to submitting via HTTP POST and reloading the page.
  In a React SPA (Single Page Application): you don't want a page reload.
  event.preventDefault() stops the browser's default form submission behaviour.
  Then you handle the submission in JavaScript: validate, send to API, update state.
```

## Functional state updates

When new state depends on old state, use the functional form of the setter:

```javascript
function Counter() {
  const [count, setCount] = useState(0)
  
  // WRONG: stale closure bug
  function handleTripleClick() {
    setCount(count + 1)  // uses the value of `count` captured at render time
    setCount(count + 1)  // same value — these don't accumulate!
    setCount(count + 1)  // result: count + 1, not count + 3
  }
  
  // CORRECT: functional update — React passes the latest value as prevCount
  function handleTripleClickCorrect() {
    setCount(prevCount => prevCount + 1)  // React queues: +1
    setCount(prevCount => prevCount + 1)  // React queues: +1 on top of previous +1
    setCount(prevCount => prevCount + 1)  // React queues: +1 on top of that
    // Result: count + 3 ✓
  }
  
  return (
    <button onClick={handleTripleClickCorrect}>Triple ({count})</button>
  )
}
```

```text
WHY STALE CLOSURES HAPPEN:

  When the component renders, every function inside captures the current values
  of its outer variables (including state). This is a JavaScript closure.
  
  handleTripleClick() was created during render when count = 5.
  All three setCount(count + 1) calls see count = 5.
  All three schedule a state update to 6.
  After all three run, count becomes 6, not 8.
  
  Functional updates fix this: React passes the state's CURRENT value
  (after all queued updates) as prevCount, bypassing the stale closure.
  
  RULE: whenever new state depends on old state, use the functional form:
    ✓ setCount(prev => prev + 1)
    ✗ setCount(count + 1)  — unless count is the only update in this handler
```

## Event handling

React's event system wraps native DOM events in **synthetic events** — a cross-browser abstraction with the same interface on all browsers.

```javascript
function EventExamples() {
  function handleClick(event) {
    // event is a React SyntheticEvent — same properties as native DOM events:
    // event.target     — the element that was clicked
    // event.currentTarget — the element the listener is attached to
    // event.preventDefault() — prevent default behaviour
    // event.stopPropagation() — stop the event bubbling up to parent elements
    console.log('Clicked:', event.target.textContent)
  }
  
  function handleKeyDown(event) {
    // event.key: the key name ('Enter', 'Escape', 'ArrowUp', 'a', '1', ...)
    if (event.key === 'Enter') {
      // handle Enter key
    }
    if (event.key === 'Escape') {
      // handle Escape key — e.g., close a modal
    }
  }
  
  function handleChange(event) {
    // for inputs: event.target.value is the new value
    const newValue = event.target.value
    // for checkboxes: event.target.checked is the boolean
    const isChecked = event.target.checked
  }
  
  return (
    <div onClick={handleClick}>
      <input onKeyDown={handleKeyDown} onChange={handleChange} />
    </div>
  )
}
```

```text
EVENT BUBBLING:
  Events bubble up the DOM: a click on a <button> inside a <div> triggers
  the <button>'s onClick AND the <div>'s onClick.
  
  To stop bubbling: event.stopPropagation()
  
  EVENT DELEGATION (how React uses it internally):
    Instead of attaching event listeners to every element,
    React attaches ONE listener to the root element.
    When any event fires, it bubbles up to the root.
    React looks at event.target to determine which element was clicked.
    This is much more efficient than per-element listeners.
    This is the same pattern taught in the browser-apis series.
```

**SE lens:** Controlled inputs enforce the **single source of truth** principle: the form's current value is always in React state, never duplicated between DOM and state. Without controlled inputs, the DOM has the input's value and your state has something (possibly stale). Two sources of truth diverge over time. With controlled inputs, state is the only truth; the DOM reflects it. This is why React's approach leads to fewer bugs in forms: there's no way for the DOM and the state to get out of sync, because the DOM never owns the value.

**Common mistakes:**
- Calling the setter with the current state value and expecting re-render — `setCount(count)` where `count` is already the current value doesn't trigger a re-render. React uses `Object.is` to compare old and new state; identical values are skipped.
- Mutating state directly — `user.name = 'Alice'; setUser(user)` — this mutates the existing object. React's `Object.is` check will see the same object reference and may skip the re-render. Always create new objects: `setUser({ ...user, name: 'Alice' })`.
- Forgetting `event.preventDefault()` on form submit — without it, the browser performs a full page reload on form submit, resetting all React state and losing the SPA context.

**Debug tip:** When a state update isn't triggering a re-render: check whether you mutated state directly (which doesn't trigger re-render) vs creating a new value. Add `console.log('rendering', count)` at the top of the component — if you see it log on every keystroke, re-renders are working. If the UI shows a stale value, the issue is the stale closure pattern: you're reading a captured variable instead of the latest state.

## Challenge: useCounterState

Implement counter state logic (without React — pure state transition functions).

```challenge
function createCounterState(initial = 0) {
  // Returns a state manager object that mimics React's useState for a counter:
  //   .getCount()        → current count value
  //   .increment()       → count + 1
  //   .decrement()       → count - 1
  //   .reset()           → back to initial value
  //   .incrementBy(n)    → count + n (using functional update pattern)
  //   .tripleIncrement()  → count + 3 (must use functional update internally:
  //                         call a "functional setter" 3 times with prevCount => prevCount + 1)
  //
  // The functional update pattern:
  //   internally store and expose: update(fn) where fn receives current count and returns new count
  //   tripleIncrement must call update 3 times: update(p => p+1), update(p => p+1), update(p => p+1)
  //   Each update sees the result of the previous update (not a stale value).
}
```

```test
const counter = createCounterState(0)
assert counter.getCount() === 0

counter.increment()
counter.increment()
counter.increment()
assert counter.getCount() === 3

counter.decrement()
assert counter.getCount() === 2

counter.reset()
assert counter.getCount() === 0

counter.incrementBy(5)
assert counter.getCount() === 5

// tripleIncrement must correctly add 3, not 1 (the stale closure bug is avoided)
counter.tripleIncrement()
assert counter.getCount() === 8
```
