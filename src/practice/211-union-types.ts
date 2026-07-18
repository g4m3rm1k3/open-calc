import type { PracticeChallenge } from './loader'

export const title = 'Union Types (TypeScript)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'typescript-program',
        prompt: 'Write `function formatQuantity(qty: string | number): string` — if `typeof qty === \'number\'`, return `qty.toFixed(2)`; otherwise return `qty.trim()`. Call it with `5` and `\'  10 units  \'`, printing each result.',
        starter: '',
        tests: `
assert output === '5.00\\n10 units'
`,
        solution: `function formatQuantity(qty: string | number): string {
  if (typeof qty === 'number') {
    return qty.toFixed(2)
  } else {
    return qty.trim()
  }
}

console.log(formatQuantity(5))
console.log(formatQuantity('  10 units  '))
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'typescript-program',
        prompt: 'Fix `formatQuantity`: it calls `qty.toFixed(2)` UNCONDITIONALLY, with no `typeof` check narrowing the `string | number` union first — this crashes at RUNTIME with `TypeError: qty.toFixed is not a function` the moment it\'s called with a string, since `.toFixed` only exists on `number`. Add the `typeof qty === \'number\'` check, calling `.toFixed(2)` in that branch and `.trim()` in the `else` branch.',
        starter: `function formatQuantity(qty: string | number): string {
  return qty.toFixed(2)
}

console.log(formatQuantity(5))
console.log(formatQuantity('  10 units  '))
`,
        tests: `
assert output === '5.00\\n10 units'
`,
        solution: `function formatQuantity(qty: string | number): string {
  if (typeof qty === 'number') {
    return qty.toFixed(2)
  } else {
    return qty.trim()
  }
}

console.log(formatQuantity(5))
console.log(formatQuantity('  10 units  '))
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'typescript-program',
        prompt: 'Write `function describeValue(val: string | number | boolean): string` with THREE narrowing branches: `typeof val === \'string\'` returns `` `string: "${val}"` ``, `typeof val === \'number\'` returns `` `number: ${val.toFixed(1)}` ``, and the remaining `else` branch (boolean) returns `` `boolean: ${val ? \'yes\' : \'no\'}` ``. Call it with `\'hello\'`, `3.14159`, and `true`, printing each result.',
        starter: '',
        tests: `
assert output === 'string: "hello"\\nnumber: 3.1\\nboolean: yes'
`,
        solution: `function describeValue(val: string | number | boolean): string {
  if (typeof val === 'string') {
    return \`string: "\${val}"\`
  } else if (typeof val === 'number') {
    return \`number: \${val.toFixed(1)}\`
  } else {
    return \`boolean: \${val ? 'yes' : 'no'}\`
  }
}

console.log(describeValue('hello'))
console.log(describeValue(3.14159))
console.log(describeValue(true))
`,
      },
    ],
  },
]

export default challenges
