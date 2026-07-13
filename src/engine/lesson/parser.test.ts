import { describe, it, expect } from 'vitest'
import { parseLesson } from './parser'

describe('parseLesson — frontmatter', () => {
  it('extracts series, level, title, lang', () => {
    const md = `---
series: dsa-python
level: 1
title: Two Pointers
lang: python
---

Intro text.

## Step One

Body.
`
    const lesson = parseLesson(md)
    expect(lesson.series).toBe('dsa-python')
    expect(lesson.level).toBe(1)
    expect(lesson.title).toBe('Two Pointers')
    expect(lesson.lang).toBe('python')
  })

  it('defaults series to "unknown", level to 0, lang to python when missing', () => {
    const md = `# Untitled\n\nSome intro.\n`
    const lesson = parseLesson(md)
    expect(lesson.series).toBe('unknown')
    expect(lesson.level).toBe(0)
    expect(lesson.lang).toBe('python')
  })

  it('falls back to the first # heading when frontmatter has no title', () => {
    const md = `---
series: x
level: 0
lang: python
---

# Heading As Title

## Step

Body.
`
    expect(parseLesson(md).title).toBe('Heading As Title')
  })
})

describe('parseLesson — steps and intro merging', () => {
  it('merges intro prose into the first step instead of creating a thin intro-only step', () => {
    const md = `---
series: x
level: 0
lang: python
---

# Title

This is the intro paragraph.

## First Step

Step body.
`
    const lesson = parseLesson(md)
    expect(lesson.steps).toHaveLength(1)
    expect(lesson.steps[0].prose).toContain('This is the intro paragraph.')
    expect(lesson.steps[0].prose).toContain('Step body.')
  })

  it('creates one step per ## header, stripping the "## " prefix from the title', () => {
    const md = `---
series: x
level: 0
lang: python
---

## Step A

A.

## Step B

B.
`
    const lesson = parseLesson(md)
    expect(lesson.steps.map(s => s.title)).toEqual(['Step A', 'Step B'])
  })
})

describe('parseLesson — fence extraction', () => {
  it('extracts a runnable python fence as an example, not into prose', () => {
    const md = `---
series: x
level: 0
lang: python
---

## Step

Some prose.

\`\`\`python
print("hi")
\`\`\`

More prose.
`
    const lesson = parseLesson(md)
    const step = lesson.steps[0]
    expect(step.examples).toHaveLength(1)
    expect(step.examples[0].lang).toBe('python')
    expect(step.examples[0].code).toBe('print("hi")')
    expect(step.prose).not.toContain('print("hi")')
    expect(step.prose).toContain('Some prose.')
    expect(step.prose).toContain('More prose.')
  })

  it('leaves a text fence embedded in prose for markdown rendering (no Run button)', () => {
    const md = `---
series: x
level: 0
lang: python
---

## Step

\`\`\`text
left=0 -> 'a'
\`\`\`
`
    const lesson = parseLesson(md)
    const step = lesson.steps[0]
    expect(step.examples).toHaveLength(0)
    expect(step.prose).toContain("left=0 -> 'a'")
  })

  it('extracts a challenge fence and a test fence into their dedicated fields', () => {
    const md = `---
series: x
level: 0
lang: python
---

## Challenge: add

\`\`\`python
def add(a, b):
    return a + b
\`\`\`

\`\`\`challenge
def add(a, b):
    pass
\`\`\`

\`\`\`test
assert add(1, 2) == 3
assert add(0, 0) == 0
\`\`\`
`
    const lesson = parseLesson(md)
    const step = lesson.steps[0]
    expect(step.challenge).not.toBeNull()
    expect(step.challenge?.code).toBe('def add(a, b):\n    pass')
    expect(step.tests).toContain('assert add(1, 2) == 3')
    // the python example before the challenge fence stays a normal example
    expect(step.examples).toHaveLength(1)
  })
})

describe('parseLesson — challenge language inference', () => {
  it('infers the challenge language from the preceding runnable fence', () => {
    const md = `---
series: x
level: 0
lang: python
---

## Step

\`\`\`javascript
console.log('demo')
\`\`\`

\`\`\`challenge
function demo() {}
\`\`\`

\`\`\`test
assert typeof demo === 'function'
\`\`\`
`
    const lesson = parseLesson(md)
    expect(lesson.steps[0].challenge?.lang).toBe('javascript')
  })

  it('falls back to the lesson meta.lang when the preceding fence is html/text (context, not language)', () => {
    const md = `---
series: css-fundamentals
level: 0
lang: css
---

## Challenge: style it

\`\`\`html
<div id="target"></div>
\`\`\`

\`\`\`challenge
/* your CSS here */
\`\`\`

\`\`\`test
assert getComputedStyle(document.querySelector('#target')).color === 'red'
\`\`\`
`
    const lesson = parseLesson(md)
    expect(lesson.steps[0].challenge?.lang).toBe('css')
  })

  it('an explicit second token on the ```challenge fence overrides inference entirely', () => {
    // This is the fix for the git-version-control / git-advanced / contributor-series
    // bug: a JS scenario-quiz challenge sitting right after a ```bash context example
    // used to inherit 'bash' as its language and silently break grading. Authors can
    // now write ```challenge javascript to make the language explicit instead of
    // relying on whatever fence happens to precede it.
    const md = `---
series: git-version-control
level: 1
lang: bash
---

## Challenge: commit_message

\`\`\`bash
git commit -m "fix"
\`\`\`

\`\`\`challenge javascript
const messages = { good1: '' }
\`\`\`

\`\`\`test
assert messages.good1.length > 0
\`\`\`
`
    const lesson = parseLesson(md)
    expect(lesson.steps[0].challenge?.lang).toBe('javascript')
  })

  it('REGRESSION (sql-fundamentals bug): a language-tagged fence used in place of ```challenge is NOT picked up as the challenge', () => {
    // This reproduces the exact authoring mistake found in all 8 sql-fundamentals
    // lessons: the editable block was fenced ```sql instead of ```challenge. The
    // parser has no way to distinguish "this sql fence is the editable answer" from
    // "this sql fence is a read-only example" — only the literal `challenge` tag does
    // that. This test documents the current (broken) behavior so a future change to
    // the parser's fence handling can't silently reintroduce or hide this failure mode.
    const md = `---
series: sql-fundamentals
level: 1
lang: sql
---

## Challenge: select_where

\`\`\`sql
-- Your SELECT statement:
\`\`\`

\`\`\`test
var q = code.trim().toLowerCase()
assert q.startsWith('select')
\`\`\`
`
    const lesson = parseLesson(md)
    const step = lesson.steps[0]
    // The mis-tagged fence became a display-only example, not the challenge.
    expect(step.challenge).toBeNull()
    expect(step.examples.some(e => e.lang === 'sql')).toBe(true)
    // Downstream (ChallengeStep.tsx), a null challenge means: lang defaults to
    // 'python', starter code defaults to '', and Run Tests executes the Python
    // harness against an empty string — this is why the SQL series is broken.
  })
})

describe('parseLesson — lens extraction', () => {
  it('extracts CS lens and SE lens paragraphs out of prose into lesson.lenses', () => {
    const md = `---
series: x
level: 0
lang: python
---

## Step

Regular prose.

**CS lens:** algorithmic point.

**SE lens:** engineering point.
`
    const lesson = parseLesson(md)
    const step = lesson.steps[0]
    expect(step.lenses?.cs).toBe('algorithmic point.')
    expect(step.lenses?.se).toBe('engineering point.')
    expect(step.prose).not.toContain('CS lens')
    expect(step.prose).not.toContain('SE lens')
  })
})
