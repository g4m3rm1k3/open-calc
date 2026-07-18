import type { PracticeChallenge } from './loader'

export const title = 'Duck Typing (Ruby)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'ruby-program',
        prompt: 'Write `class Positive` with `def self.===(other); other.is_a?(Numeric) && other > 0; end`. Write `describe(value)` using `case value` with `when Positive`, `when Numeric`, `when String`, and an `else` — call it with `5`, `-3`, and `"hi"`, printing each result. Since `case/when` calls `===` on each clause, `Positive` participates exactly like a built-in class would.',
        starter: '',
        tests: `
assert output === '5 is positive\\n-3 is zero or negative\\nhi is a string'
`,
        solution: `class Positive
  def self.===(other)
    other.is_a?(Numeric) && other > 0
  end
end

def describe(value)
  case value
  when Positive
    "#{value} is positive"
  when Numeric
    "#{value} is zero or negative"
  when String
    "#{value} is a string"
  else
    "something else"
  end
end

puts describe(5)
puts describe(-3)
puts describe("hi")
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'ruby-program',
        prompt: 'Fix `EvenNumber`: it defines `self.==`, but `case/when` specifically calls `===`, NOT `==` — so `when EvenNumber` falls back to the DEFAULT class-membership check (Ruby\'s default `Module#===`), which is `false` for the plain integer `4` (it isn\'t literally an instance of the `EvenNumber` class), incorrectly landing in `else`. Change `def self.==` to `def self.===`.',
        starter: `class EvenNumber
  def self.==(other)
    other.is_a?(Integer) && other.even?
  end
end

def describe(value)
  case value
  when EvenNumber
    "#{value} is even"
  else
    "not matched by EvenNumber"
  end
end

puts describe(4)
`,
        tests: `
assert output === '4 is even'
`,
        solution: `class EvenNumber
  def self.===(other)
    other.is_a?(Integer) && other.even?
  end
end

def describe(value)
  case value
  when EvenNumber
    "#{value} is even"
  else
    "not matched by EvenNumber"
  end
end

puts describe(4)
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'ruby-program',
        prompt: "Write two unrelated classes, `Duck` and `Person`, each with a `quack` method. Write `make_it_quack(entity)` using the IDIOMATIC `entity.respond_to?(:quack)` capability check (not `is_a?`) — calling `entity.quack` if it responds, otherwise returning `\"#{entity.class} can't quack\"`. Call it with `Duck.new`, `Person.new`, and `42` (an Integer, which has no `quack` method).",
        starter: '',
        tests: `
assert output === "Quack!\\nI'm quacking like a duck!\\nInteger can't quack"
`,
        solution: `class Duck
  def quack
    "Quack!"
  end
end

class Person
  def quack
    "I'm quacking like a duck!"
  end
end

def make_it_quack(entity)
  if entity.respond_to?(:quack)
    entity.quack
  else
    "#{entity.class} can't quack"
  end
end

puts make_it_quack(Duck.new)
puts make_it_quack(Person.new)
puts make_it_quack(42)
`,
      },
    ],
  },
]

export default challenges
