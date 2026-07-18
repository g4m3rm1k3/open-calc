import type { PracticeChallenge } from './loader'

export const title = 'Utility Types (TypeScript)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'typescript-program',
        prompt: 'Write `interface Product { id: number; name: string; price: number }` and `function applyUpdate(product: Product, update: Partial<Product>): Product` returning `{ ...product, ...update }`. Apply an update changing only `price` to `12.99`, print the updated `price` and (unchanged) `name`. Write `type ProductSummary = Pick<Product, \'id\' | \'name\'>` and `summarize(product): ProductSummary` (destructure `id`/`name`), then print `` `${summary.id}: ${summary.name}` ``.',
        starter: '',
        tests: `
assert output === '12.99\\nWidget\\n1: Widget'
`,
        solution: `interface Product {
  id: number
  name: string
  price: number
}

function applyUpdate(product: Product, update: Partial<Product>): Product {
  return { ...product, ...update }
}

const original: Product = { id: 1, name: 'Widget', price: 9.99 }
const updated = applyUpdate(original, { price: 12.99 })
console.log(updated.price)
console.log(updated.name)

type ProductSummary = Pick<Product, 'id' | 'name'>

function summarize(product: Product): ProductSummary {
  const { id, name } = product
  return { id, name }
}

const summary = summarize(original)
console.log(\`\${summary.id}: \${summary.name}\`)
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'typescript-program',
        prompt: 'Fix `processConfig`: `Readonly<Config>` is a COMPILE-TIME-ONLY hint — it provides NO runtime protection, so `config.timeout = 0` silently succeeds, mutating the CALLER\'s actual `settings` object (since objects are passed by reference), leaving `settings.timeout` polluted afterward. Instead of assigning through the parameter, compute a local `const effectiveTimeout = 0` and print that, leaving `config` (and therefore the caller\'s `settings`) genuinely untouched.',
        starter: `interface Config {
  timeout: number
  retries: number
}

function processConfig(config: Readonly<Config>): void {
  console.log(\`before: timeout=\${config.timeout}\`)
  config.timeout = 0
  console.log(\`after: timeout=\${config.timeout}\`)
}

const settings: Config = { timeout: 30, retries: 3 }
processConfig(settings)
console.log(\`settings.timeout is now: \${settings.timeout}\`)
`,
        tests: `
assert output === 'before: timeout=30\\nafter: timeout=0\\nsettings.timeout is now: 30'
`,
        solution: `interface Config {
  timeout: number
  retries: number
}

function processConfig(config: Readonly<Config>): void {
  console.log(\`before: timeout=\${config.timeout}\`)
  const effectiveTimeout = 0
  console.log(\`after: timeout=\${effectiveTimeout}\`)
}

const settings: Config = { timeout: 30, retries: 3 }
processConfig(settings)
console.log(\`settings.timeout is now: \${settings.timeout}\`)
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'typescript-program',
        prompt: 'Using the same `Product` shape (`id`, `name`, `price`), write `toPreview(product): Pick<Product, \'id\' | \'name\'>` (destructure `id`/`name`) and `toPublic(product): Omit<Product, \'price\'>` (destructure OUT `price`, return the rest via `...rest`). Print `JSON.stringify(toPreview(p))`, `JSON.stringify(toPublic(p))`, and whether those two JSON strings are `===` equal — with exactly 3 fields total, picking 2 and omitting the 1 remaining produce the SAME resulting shape.',
        starter: '',
        tests: `
assert output === '{"id":1,"name":"Widget"}\\n{"id":1,"name":"Widget"}\\ntrue'
`,
        solution: `interface Product {
  id: number
  name: string
  price: number
}

type ProductPreview = Pick<Product, 'id' | 'name'>
type ProductWithoutPrice = Omit<Product, 'price'>

function toPreview(product: Product): ProductPreview {
  const { id, name } = product
  return { id, name }
}

function toPublic(product: Product): ProductWithoutPrice {
  const { price, ...rest } = product
  return rest
}

const p: Product = { id: 1, name: 'Widget', price: 9.99 }

console.log(JSON.stringify(toPreview(p)))
console.log(JSON.stringify(toPublic(p)))
console.log(JSON.stringify(toPreview(p)) === JSON.stringify(toPublic(p)))
`,
      },
    ],
  },
]

export default challenges
