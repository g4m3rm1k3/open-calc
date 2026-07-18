import type { PracticeChallenge } from './loader'

export const title = 'Blocks, Procs, and Lambdas (Ruby)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'ruby-program',
        prompt: 'Use `.each { |x| puts x }` on `[10, 20, 30]`. Create `double = Proc.new { |x| x * 2 }` and `double_lambda = lambda { |x| x * 2 }`, print both `.call(4)`. In a `begin`/`rescue ArgumentError`, call `double_lambda.call(4, 9)` (too many args — lambdas are STRICT) and print a message when it raises. Finally, call `Proc.new { |x, y| [x, y] }.call(7)` (a Proc, called with only ONE arg when TWO are expected — silently fills the missing one with `nil` instead of raising) and print its `.inspect`.',
        starter: '',
        tests: `
assert output === '10\\n20\\n30\\n8\\n8\\nlambda rejected extra argument\\n[7, nil]'
`,
        solution: `[10, 20, 30].each { |x| puts x }

double = Proc.new { |x| x * 2 }
puts double.call(4)

double_lambda = lambda { |x| x * 2 }
puts double_lambda.call(4)

begin
  double_lambda.call(4, 9)
rescue ArgumentError => e
  puts "lambda rejected extra argument"
end

proc_result = Proc.new { |x, y| [x, y] }.call(7)
puts proc_result.inspect
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'ruby-program',
        prompt: 'Fix `checker`: it\'s a top-level `Proc.new { |n| return n if n.even? }` — a `return` inside a Proc tries to return from its ENCLOSING METHOD, but there IS no enclosing method here (it\'s top-level code), so calling it raises `LocalJumpError: unexpected return`. Change `Proc.new` to `lambda`, whose `return` behaves like an ordinary function return instead of trying to escape an enclosing scope.',
        starter: `checker = Proc.new { |n| return n if n.even? }
result = checker.call(4)
puts result
`,
        tests: `
assert output === '4'
`,
        solution: `checker = lambda { |n| return n if n.even? }
result = checker.call(4)
puts result
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'ruby-program',
        prompt: 'Build `operations`, an array of THREE lambdas (`+1`, `*2`, `-3`). Starting from `value = 5`, loop over `operations` with `.each do |op| value = op.call(value) end`, applying each in sequence, then print the final `value`. Separately, create `increment = lambda { |x| x + 1 }` and call it TWICE on different arguments (`10` then `100`), printing each result — demonstrating a lambda can be stored and REUSED across multiple, unrelated calls, unlike a plain block.',
        starter: '',
        tests: `
assert output === '9\\n11\\n101'
`,
        solution: `operations = [
  lambda { |x| x + 1 },
  lambda { |x| x * 2 },
  lambda { |x| x - 3 }
]

value = 5
operations.each do |op|
  value = op.call(value)
end
puts value

increment = lambda { |x| x + 1 }
puts increment.call(10)
puts increment.call(100)
`,
      },
    ],
  },
]

export default challenges
