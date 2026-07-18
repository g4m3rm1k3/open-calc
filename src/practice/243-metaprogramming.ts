import type { PracticeChallenge } from './loader'

export const title = 'Metaprogramming (Ruby)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'ruby-program',
        prompt: 'In `class Config`, loop over `[\'host\', \'port\']` and use `define_method` twice per attribute — a getter (`instance_variable_get`) and a setter (`instance_variable_set`) — generating four methods from ONE loop instead of writing them by hand. Set and print `c.host`/`c.port`. Write `class Phantom` with `method_missing(name, *args)` returning a descriptive string, and call an undefined method on it, printing the result.',
        starter: '',
        tests: `
assert output === 'localhost\\n8080\\nyou called do_something with [1, 2], but I have no such method'
`,
        solution: `class Config
  ['host', 'port'].each do |attr|
    define_method(attr) { instance_variable_get("@#{attr}") }
    define_method("#{attr}=") { |val| instance_variable_set("@#{attr}", val) }
  end
end

c = Config.new
c.host = "localhost"
c.port = 8080
puts c.host
puts c.port

class Phantom
  def method_missing(name, *args)
    "you called #{name} with #{args.inspect}, but I have no such method"
  end
end

ph = Phantom.new
puts ph.do_something(1, 2)
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'ruby-program',
        prompt: 'Fix `Ghost`: it overrides `method_missing` to handle any `ghost_*` call, but does NOT override `respond_to_missing?` — so `g.respond_to?(:ghost_greet)` incorrectly returns `false`, even though `g.ghost_greet` would actually work via `method_missing`. Add `def respond_to_missing?(name, include_private = false); name.to_s.start_with?("ghost_") || super; end`, so `.respond_to?` accurately reports which phantom methods the object handles.',
        starter: `class Ghost
  def method_missing(name, *args)
    if name.to_s.start_with?("ghost_")
      "phantom response for #{name}"
    else
      super
    end
  end
end

g = Ghost.new

if g.respond_to?(:ghost_greet)
  puts g.ghost_greet
else
  puts "does not respond to ghost_greet"
end
`,
        tests: `
assert output === 'phantom response for ghost_greet'
`,
        solution: `class Ghost
  def method_missing(name, *args)
    if name.to_s.start_with?("ghost_")
      "phantom response for #{name}"
    else
      super
    end
  end

  def respond_to_missing?(name, include_private = false)
    name.to_s.start_with?("ghost_") || super
  end
end

g = Ghost.new

if g.respond_to?(:ghost_greet)
  puts g.ghost_greet
else
  puts "does not respond to ghost_greet"
end
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'ruby-program',
        prompt: 'In `class Calculator`, define `OPERATIONS = { double: 2, triple: 3, quadruple: 4 }`, then loop over it with `OPERATIONS.each do |name, factor|` calling `define_method(name) { |x| x * factor }` — generating THREE distinct methods, each closing over its own `factor`, from one data-driven loop. Call `calc.double(5)`, `.triple(5)`, `.quadruple(5)`, printing each. Finally print `Calculator.instance_methods(false).sort.inspect` — confirming exactly those three methods were actually generated.',
        starter: '',
        tests: `
assert output === '10\\n15\\n20\\n[:double, :quadruple, :triple]'
`,
        solution: `class Calculator
  OPERATIONS = { double: 2, triple: 3, quadruple: 4 }

  OPERATIONS.each do |name, factor|
    define_method(name) { |x| x * factor }
  end
end

calc = Calculator.new
puts calc.double(5)
puts calc.triple(5)
puts calc.quadruple(5)

puts Calculator.instance_methods(false).sort.inspect
`,
      },
    ],
  },
]

export default challenges
