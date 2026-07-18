import type { PracticeChallenge } from './loader'

export const title = 'Type System (Julia)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'julia-program',
        prompt: 'Declare `abstract type Vehicle end`. Declare `struct Car <: Vehicle` and `struct Motorcycle <: Vehicle`, each with a `wheels::Int` field. Write `describe(v::Vehicle) = "some vehicle"` (works for ANY concrete subtype) and separate `wheelCount` methods per concrete type (multiple dispatch). Print `describe(Car(4))`, `wheelCount(Car(4))`, `wheelCount(Motorcycle(2))`, and `Car <: Vehicle`.',
        starter: '',
        tests: `
assert output === 'some vehicle\\n4\\n2\\ntrue'
`,
        solution: `abstract type Vehicle end

struct Car <: Vehicle
    wheels::Int
end

struct Motorcycle <: Vehicle
    wheels::Int
end

describe(v::Vehicle) = "some vehicle"
wheelCount(c::Car) = c.wheels
wheelCount(m::Motorcycle) = m.wheels

println(describe(Car(4)))
println(wheelCount(Car(4)))
println(wheelCount(Motorcycle(2)))
println(Car <: Vehicle)
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'julia-program',
        prompt: 'Fix `describe`: it\'s annotated `v::Car` — an overly SPECIFIC concrete type — even though its logic (`"some vehicle"`) works identically for any `Vehicle`. Calling `describe(Motorcycle(2))` then fails with `MethodError: no method matching describe(::Motorcycle)`, since `Motorcycle` is a DIFFERENT concrete subtype. Change the annotation to the abstract `v::Vehicle`, so it works for every current (and future) concrete subtype.',
        starter: `abstract type Vehicle end

struct Car <: Vehicle
    wheels::Int
end

struct Motorcycle <: Vehicle
    wheels::Int
end

describe(v::Car) = "some vehicle"

println(describe(Motorcycle(2)))
`,
        tests: `
assert output === 'some vehicle'
`,
        solution: `abstract type Vehicle end

struct Car <: Vehicle
    wheels::Int
end

struct Motorcycle <: Vehicle
    wheels::Int
end

describe(v::Vehicle) = "some vehicle"

println(describe(Motorcycle(2)))
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'julia-program',
        prompt: 'Declare `abstract type Vehicle end` and `struct Car <: Vehicle`. Write `describe(v::Vehicle) = "some vehicle"` and call `describe(Car(4))`. THEN, WITHOUT modifying `describe` at all, declare a BRAND NEW `struct Truck <: Vehicle` and call `describe(Truck(6))` — it works automatically, since `describe` was written against the abstract type. Print both `describe` calls, then `Truck <: Vehicle` and `Car <: Vehicle`.',
        starter: '',
        tests: `
assert output === 'some vehicle\\nsome vehicle\\ntrue\\ntrue'
`,
        solution: `abstract type Vehicle end

struct Car <: Vehicle
    wheels::Int
end

describe(v::Vehicle) = "some vehicle"

println(describe(Car(4)))

struct Truck <: Vehicle
    wheels::Int
end

println(describe(Truck(6)))
println(Truck <: Vehicle)
println(Car <: Vehicle)
`,
      },
    ],
  },
]

export default challenges
