import type { PracticeChallenge } from './loader'

export const title = 'Template Literals / String Interpolation'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `greet(name, age)` returning `"Hello, {name}! You are {age} years old."` using a template literal, with `name` and `age` interpolated.',
        starter: '',
        tests: `
assert greet('Alice', 30) === 'Hello, Alice! You are 30 years old.'
`,
        solution: `function greet(name, age) {
  return \`Hello, \${name}! You are \${age} years old.\`
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `formatReceipt(items)`, where each item is `{ name, price }`. Return a string with one `"Name: $price"` line per item (price to 2 decimals), followed by a `"Total: $total"` line, all joined with newlines.',
        starter: 'function formatReceipt(items) {\n  // TODO: return a string with one "Name: $price" line per item (price to 2 decimals),\n  // followed by a "Total: $total" line, all joined with newlines\n  return \'\'\n}',
        tests: `
const items = [{name:'Apple', price:1.5}, {name:'Bread', price:2.25}]
assert formatReceipt(items) === 'Apple: $1.50\\nBread: $2.25\\nTotal: $3.75'
`,
        solution: `function formatReceipt(items) {
  const lines = items.map(item => \`\${item.name}: $\${item.price.toFixed(2)}\`)
  const total = items.reduce((sum, item) => sum + item.price, 0)
  lines.push(\`Total: $\${total.toFixed(2)}\`)
  return lines.join('\\n')
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `pluralize(count, noun)` returning `"{count} {noun}"`, appending an `"s"` to `noun` unless `count` is exactly `1` — using a ternary expression directly inside the template literal, not a separate if-statement.',
        starter: '',
        tests: `
assert pluralize(1, 'apple') === '1 apple'
assert pluralize(3, 'apple') === '3 apples'
assert pluralize(0, 'cat') === '0 cats'
`,
        solution: `function pluralize(count, noun) {
  return \`\${count} \${noun}\${count === 1 ? '' : 's'}\`
}`,
      },
    ],
  },
]

export default challenges
