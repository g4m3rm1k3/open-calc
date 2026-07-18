import type { PracticeChallenge } from './loader'

export const title = 'Mixins (Ruby)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'ruby-program',
        prompt: 'Write `module Describable` with `def describe; "This is #{title}"; end`. Write `class Book` with `include Describable`, `attr_accessor :title`, and a constructor. Create `novel = Book.new("Dune")`, print `novel.describe` — a method defined entirely in the module, not `Book` itself. Print `Book.ancestors.include?(Describable)`.',
        starter: '',
        tests: `
assert output === 'This is Dune\\ntrue'
`,
        solution: `module Describable
  def describe
    "This is #{title}"
  end
end

class Book
  include Describable
  attr_accessor :title

  def initialize(title)
    @title = title
  end
end

novel = Book.new("Dune")
puts novel.describe

puts Book.ancestors.include?(Describable)
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'ruby-program',
        prompt: 'Fix `Account`: both `Basic` and `Premium` define `rate`, and the intent is for `Premium` (the more specific tier) to take precedence — but `include Premium` then `include Basic` means `Basic` is included LAST, so IT wins (Ruby resolves the LAST-included module first), giving the wrong `"basic rate: 5%"`. Swap the order to `include Basic` then `include Premium`, so `Premium` is included last and correctly takes precedence.',
        starter: `module Basic
  def rate
    "basic rate: 5%"
  end
end

module Premium
  def rate
    "premium rate: 15%"
  end
end

class Account
  include Premium
  include Basic
end

acc = Account.new
puts acc.rate
`,
        tests: `
assert output === 'premium rate: 15%'
`,
        solution: `module Basic
  def rate
    "basic rate: 5%"
  end
end

module Premium
  def rate
    "premium rate: 15%"
  end
end

class Account
  include Basic
  include Premium
end

acc = Account.new
puts acc.rate
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'ruby-program',
        prompt: 'Write `class Money` that `include`s `Comparable` and implements ONLY `<=>(other)` (comparing `.amount`) — this single method is enough to gain `<`, `>`, `==`, and sortability for free. Create `a = Money.new(10)` and `b = Money.new(20)`. Print `a < b`, `a > b`, `a == Money.new(10)`, and `[b, a].sort.map(&:amount).inspect`.',
        starter: '',
        tests: `
assert output === 'true\\nfalse\\ntrue\\n[10, 20]'
`,
        solution: `class Money
  include Comparable
  attr_accessor :amount

  def initialize(amount)
    @amount = amount
  end

  def <=>(other)
    amount <=> other.amount
  end
end

a = Money.new(10)
b = Money.new(20)

puts a < b
puts a > b
puts a == Money.new(10)
puts [b, a].sort.map(&:amount).inspect
`,
      },
    ],
  },
]

export default challenges
