import type { PracticeChallenge } from './loader'

export const title = 'Type Narrowing (TypeScript)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'typescript-program',
        prompt: 'Write `function process(value: string | number | boolean): string` with THREE progressive checks: `typeof value === \'boolean\'` returns `\'YES\'`/`\'NO\'`; `typeof value === \'string\'` returns `value.toUpperCase()`; the final line (reached only once both earlier checks failed) returns `value.toFixed(2)`, safely narrowed to `number` by elimination. Call it with `true`, `\'abc\'`, and `3.14159`, printing each result.',
        starter: '',
        tests: `
assert output === 'YES\\nABC\\n3.14'
`,
        solution: `function process(value: string | number | boolean): string {
  if (typeof value === 'boolean') {
    return value ? 'YES' : 'NO'
  }
  if (typeof value === 'string') {
    return value.toUpperCase()
  }
  return value.toFixed(2)
}

console.log(process(true))
console.log(process('abc'))
console.log(process(3.14159))
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'typescript-program',
        prompt: 'Fix `process`: `const str = value as string` FORCES the type via an assertion instead of a real runtime check — `as` is erased entirely at compile time, so when `value` is actually a `number`, `str` is STILL that number at runtime, and `str.toUpperCase()` throws `TypeError: str.toUpperCase is not a function`. Replace the assertion with a genuine `if (typeof value === \'string\')` check, calling `.toUpperCase()` in that branch and `.toFixed(2)` otherwise.',
        starter: `function process(value: string | number): string {
  const str = value as string
  return str.toUpperCase()
}

console.log(process('abc'))
console.log(process(42))
`,
        tests: `
assert output === 'ABC\\n42.00'
`,
        solution: `function process(value: string | number): string {
  if (typeof value === 'string') {
    return value.toUpperCase()
  }
  return value.toFixed(2)
}

console.log(process('abc'))
console.log(process(42))
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'typescript-program',
        prompt: 'Write `interface Box { value: string | number }` and `resetIfLong(box: Box): void`, which sets `box.value = 0` if it\'s currently a string longer than 3 characters. Write `describe(box: Box): string` that, after narrowing `typeof box.value === \'string\'`, captures `const original = box.value` BEFORE calling `resetIfLong(box)` (which might mutate `box.value` to a number, invalidating the earlier narrowing) — then returns `original.toUpperCase()`, safely using the captured string instead of re-reading `box.value` after the call. Call it with `{ value: \'hi\' }` and `{ value: \'hello\' }`.',
        starter: '',
        tests: `
assert output === 'HI\\nHELLO'
`,
        solution: `interface Box {
  value: string | number
}

function resetIfLong(box: Box): void {
  if (typeof box.value === 'string' && box.value.length > 3) {
    box.value = 0
  }
}

function describe(box: Box): string {
  if (typeof box.value === 'string') {
    const original = box.value
    resetIfLong(box)
    return original.toUpperCase()
  }
  return \`number: \${box.value}\`
}

console.log(describe({ value: 'hi' }))
console.log(describe({ value: 'hello' }))
`,
      },
    ],
  },
]

export default challenges
