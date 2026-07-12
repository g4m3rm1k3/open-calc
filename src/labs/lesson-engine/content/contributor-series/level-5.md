---
series: contributor-series
level: 5
title: Understanding Components
lang: javascript
---

# Understanding Components

You don't need to know React to contribute a lesson — lessons are Markdown files. But when you look at the lesson engine source code, you'll see files like `LessonCard.tsx`, `CellsBlock.tsx`, `CodeCell.tsx`. Understanding what these are and how they relate to each other lets you read the codebase without getting lost.

A component is a function that takes data (props) and returns UI. The lesson engine is a tree of these functions: `LessonPage` renders `CellsBlock`, which renders `CodeCell`, which renders the Monaco editor. Each component owns one piece of the UI.

By the end of this lesson you will understand what a React component is, how props flow from parent to child, and how to read the lesson engine component tree to understand which file controls which part of the UI you see.

## What a component is

```javascript
// A React component is a function that returns UI.
// The function takes 'props' (data passed in from the parent).
// It returns JSX — HTML-like syntax that React renders to the DOM.

function LessonCard({ title, level, isDone }) {
  return (
    <div className="card">
      <span className="level">Level {level}</span>
      <h2 className="title">{title}</h2>
      {isDone && <span className="badge">✓ Complete</span>}
    </div>
  )
}

// Usage:
// <LessonCard title="Variables" level={0} isDone={true} />
// <LessonCard title="Functions" level={1} isDone={false} />
```

```text
Key ideas:
  Props:    data passed INTO the component (like arguments to a function)
  JSX:      the HTML-like return value (compiled to JavaScript by Vite)
  {}:       curly braces in JSX = "run JavaScript here"
  &&:       conditional rendering — if isDone is true, show the badge

React components are just functions. The only special thing:
  - Function name starts with uppercase (LessonCard, not lessonCard)
  - Returns JSX (HTML-like syntax), not a plain value
```

**CS lens:** A React component is a **pure function** from props to UI — given the same props, it always returns the same JSX. This is the key design principle: UI as a function of data. When data changes, React re-calls the function and re-renders. This is fundamentally different from "imperatively updating the DOM" (finding an element and changing it). Instead: describe what the UI should look like for any given data, and React handles the DOM updates.

## How the lesson engine uses components

```javascript
// The lesson engine has three main views:
// 1. Series list — shows all available series
// 2. Level list — shows all levels in a series
// 3. Lesson view — shows one lesson

// This is managed with a 'view' state variable in LessonEngineLab.tsx:
const [view, setView] = useState({ kind: 'series-list' })

// When the user clicks a series:
setView({ kind: 'level-list', series: selectedSeries })

// When the user clicks a level:
setView({ kind: 'lesson', lesson: parsedLesson, series: currentSeries })

// The component renders different UI based on view.kind:
if (view.kind === 'series-list') return <SeriesListView ... />
if (view.kind === 'level-list')  return <LevelListView ... />
if (view.kind === 'lesson')      return <LessonView ... />
```

```text
This pattern is called a "state machine UI" or "view switcher."
The 'view' variable is the state. The component renders based on state.
No page navigation — the URL doesn't change — just the state variable.

This is why when you click "← Series" inside a lesson, the URL doesn't change:
setView({ kind: 'series-list' }) is called, React re-renders the series list.
```

## Reading component files

```javascript
// When you open a component file, look for these sections in order:

// 1. Imports at the top
import { useState } from 'react'
import { parseLesson } from '../../engine/lesson/parser'

// 2. Type definitions (TypeScript interfaces)
interface Props {
  onBack?: () => void
}

// 3. The component function
export default function LessonEngineLab({ onBack }: Props) {
  // State variables
  const [view, setView] = useState(...)
  
  // Event handlers / helper functions
  function openLesson(file, series) { ... }
  
  // The JSX return (what gets rendered)
  return (
    <div>...</div>
  )
}

// 4. Sub-components at the bottom
function SeriesListView({ ui, onSelectSeries }) { ... }
function LevelListView({ ui, series, ... }) { ... }
```

**SE lens:** Components let you build UI the same way you build a program — by breaking complexity into small, named, reusable pieces. `SeriesListView`, `LevelListView`, and `LessonView` are each under 50 lines. If they were all one function, the file would be 500 lines of tangled logic. The component boundary also determines what data a piece of UI needs — the props interface is a contract: "give me this data and I'll render this UI."

**Common mistakes:**
- Thinking JSX is HTML — it looks like HTML but it's JavaScript. `class` becomes `className`, `for` becomes `htmlFor`, event names are camelCase (`onClick`, not `onclick`).
- Confusing components and files — one file can contain multiple components. `LessonEngineLab.tsx` exports the main component (`LessonEngineLab`) and also contains three sub-components (`SeriesListView`, `LevelListView`).

**Debug tip:** The React DevTools browser extension (free, add it to Chrome or Firefox) lets you inspect any component on the page — see its props, state, and where it is in the component tree. This is the most useful tool for understanding a React codebase while it's running.

**Next:** The theming system — how colours and styles work across the entire app.

## Challenge: component_concepts

Answer questions about React components.

```challenge
const answers = {
  // What is the name for the data passed into a React component?
  dataPassedIn: '',
  // What does JSX use instead of 'class' for CSS class names?
  classAttribute: '',
  // True or false: a React component must return exactly one HTML element
  mustReturnOneElement: true,
  // What pattern does the lesson engine use to switch between series list,
  // level list, and lesson view?
  viewPattern: '',
}
```

```test
assert answers.dataPassedIn.toLowerCase() === 'props'
assert answers.classAttribute === 'className'
assert answers.mustReturnOneElement === false
assert answers.viewPattern.length > 5
```
