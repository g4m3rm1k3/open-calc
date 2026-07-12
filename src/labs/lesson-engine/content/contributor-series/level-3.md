---
series: contributor-series
level: 3
title: Reading Code You Didn't Write
lang: javascript
---

# Reading Code You Didn't Write

A survey of professional developers found they spend roughly 10x more time reading code than writing it. Every bug fix, feature addition, and code review starts with reading — understanding what exists before changing anything. Contributors to an unfamiliar codebase spend even more time reading.

The difference between a contributor who reads code well and one who doesn't is strategy. A poor reader opens random files and tries to absorb them from top to bottom. A good reader starts with structure, follows the entry points, and uses the tools available (`grep`, call graphs, git log) to build a mental map before reading individual files in depth.

By the end of this lesson you will have a systematic approach to orienting in an unfamiliar codebase, be able to find where a feature is implemented by tracing from the UI to the data, and know how to use `grep` and git history as navigation tools.

## Start with the big picture

```text
When you open an unfamiliar codebase, don't start reading files.
Start with the structure:

1. Read the README first
   → What does this project do? What's the stack?

2. Look at the top-level directory layout
   → Where is the source code? Where are tests? Scripts? Config?

3. Find the entry point
   → For a web app: usually src/main.tsx or src/App.tsx
   → For a Node app: usually src/index.ts or server.ts
   → For a library: usually src/index.ts

4. Follow the imports
   → The entry point imports other files. Those import others.
   → The import graph tells you the dependency structure.
```

## Following imports

```javascript
// Example: You want to know how the lesson engine renders a lesson.
// Start at the entry point: LessonEngineLab.tsx

// You see:
import { parseLesson } from '../../engine/lesson/parser'
import { executeCode } from '../../engine/lesson/executor'
import LessonView from '../../engine/lesson/LessonView'

// Now you know:
// - Lessons are parsed by: src/engine/lesson/parser.ts
// - Code is run by:        src/engine/lesson/executor.ts
// - Lessons are shown by:  src/engine/lesson/LessonView.tsx

// Open parser.ts. You see:
export function parseLesson(raw: string): ParsedLesson {
  // reads the frontmatter, splits into sections...
}

// Now you understand one layer deeper. Keep following imports until
// you've reached the level of detail you need.
```

```text
VS Code navigation shortcuts:
  Cmd+Click (Mac) / Ctrl+Click (Win) on any import → opens that file
  Cmd+P / Ctrl+P → fuzzy-search any file by name
  Cmd+Shift+F / Ctrl+Shift+F → search all files for a string
  F12 on a function call → jump to its definition
  Shift+F12 → find all uses of a function
```

**CS lens:** A codebase is a **call graph** — a graph where nodes are functions and edges are calls between them. When you read code top-down, you're traversing this graph from the entry point. You don't need to understand every node — just the path from where you are to where you're going. This is the same as navigating a city: you don't need to know every street, just the route from A to B.

## Reading a function without running it

```javascript
// You're reading this function and want to understand it without running it:
function openLesson(file: string, series: SeriesMeta) {
  const raw = LESSON_FILES[file]
  if (!raw) return
  setView({ kind: 'lesson', lesson: parseLesson(raw), series })
}

// Read it line by line:
// 1. Takes a 'file' (string path) and 'series' (SeriesMeta object)
// 2. Looks up the file in LESSON_FILES (a dictionary of file path → markdown string)
// 3. If not found, does nothing and returns
// 4. Otherwise, parses the markdown and sets the current view to show the lesson

// Questions to ask while reading:
//   What does this function receive? (parameters)
//   What does it produce? (return value or side effect)
//   What could go wrong? (the if(!raw) guard handles the not-found case)
//   What does it depend on? (LESSON_FILES, parseLesson, setView)
```

## Finding where to make a change

```text
Scenario: you want to add a new series to the lesson engine.
You don't know where to start.

Strategy:
1. Search for something you know exists:
   → Cmd+Shift+F → search for "python-fundamentals"
   → Results show: series.ts, LessonEngineLab.tsx, and lesson files
   
2. Open series.ts — you can see all existing series entries.
   Now you know: add your series here.

3. Open LessonEngineLab.tsx — you can see the imports and LESSON_FILES.
   Now you know: add your imports and entries here.

4. Look at one existing series as a template.
   Copy the pattern. Fill in your values.
```

**SE lens:** The most important skill in reading unfamiliar code is **pattern recognition** — noticing that "this file has the same shape as that other file I understand." When you read `series.ts` and see ten entries with the same structure, you don't need to understand how the engine works to know that your series should have the same structure. Templates and conventions reduce the cognitive load of contributing to a codebase significantly.

**Common mistakes:**
- Trying to understand everything before making any change — you don't need to understand the whole codebase to contribute a lesson. You need to understand the pattern for the specific thing you're adding.
- Reading bottom-up (start with utility functions) instead of top-down (start with the feature entry point) — entry points give you context; utilities without context are hard to interpret.

**Debug tip:** When you find a file but don't understand what uses it, right-click its name in VS Code → "Find All References." This shows every file that imports or calls it — giving you the context you need.

**Next:** How to write good educational content — the craft of teaching through code.

## Challenge: reading_code

Practice reading the import structure.

```javascript
// Given this import block from LessonEngineLab.tsx:
const importBlock = `
import { parseLesson } from '../../engine/lesson/parser'
import { executeCode } from '../../engine/lesson/executor'
import LessonView from '../../engine/lesson/LessonView'
import { SERIES } from './series'
`

const answers = {
  // What file handles parsing Markdown into a lesson object?
  parserFile: '',
  // What file handles running code?
  executorFile: '',
  // What file contains the SERIES array (all series metadata)?
  seriesFile: '',
  // What is the path prefix for the lesson engine's files (relative to LessonEngineLab.tsx)?
  enginePath: '',
}
```

```test
assert answers.parserFile.includes('parser')
assert answers.executorFile.includes('executor')
assert answers.seriesFile.includes('series')
assert answers.enginePath.includes('engine') || answers.enginePath.includes('lesson')
```
