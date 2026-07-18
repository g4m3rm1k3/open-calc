import type { PracticeChallenge } from './loader'

export const title = 'Optionals (Swift)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'swift-program',
        prompt: 'Declare `var city: String? = "Paris"`. Use `if let unwrapped = city` to print `unwrapped.count`. Print `city?.count ?? -1`. Reassign `city = nil` and print `city?.count ?? -1` again — safely falling back to `-1` via the nil-coalescing operator, with no crash.',
        starter: '',
        tests: `
assert output === '5\\n5\\n-1'
`,
        solution: `var city: String? = "Paris"

if let unwrapped = city {
    print(unwrapped.count)
}

print(city?.count ?? -1)

city = nil
print(city?.count ?? -1)
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'swift-program',
        prompt: 'Fix `findLength`: `value!.count` FORCE-unwraps `value` without any certainty it isn\'t `nil` — calling `findLength(of: nil)` crashes with `Fatal error: Unexpectedly found nil while unwrapping an Optional value`. Replace it with `value?.count ?? 0`, safely returning `0` when `value` is `nil` instead of crashing.',
        starter: `func findLength(of value: String?) -> Int {
    return value!.count
}

print(findLength(of: "hello"))
print(findLength(of: nil))
`,
        tests: `
assert output === '5\\n0'
`,
        solution: `func findLength(of value: String?) -> Int {
    return value?.count ?? 0
}

print(findLength(of: "hello"))
print(findLength(of: nil))
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'swift-program',
        prompt: 'Write `struct Address { var city: String }` and `struct Person { var address: Address? }`. Create `alice` (with an `Address`) and `bob` (with `address: nil`). Print `alice.address?.city ?? "unknown"` and `bob.address?.city ?? "unknown"` — optional chaining (`?.`) safely returns `nil` through the WHOLE chain if any link is `nil`, without crashing. Build `let people = [alice, bob]` and `let cities = people.map { $0.address?.city ?? "unknown" }`, then print `cities`.',
        starter: '',
        tests: `
assert output === 'Boston\\nunknown\\n["Boston", "unknown"]'
`,
        solution: `struct Address {
    var city: String
}

struct Person {
    var address: Address?
}

let alice = Person(address: Address(city: "Boston"))
let bob = Person(address: nil)

print(alice.address?.city ?? "unknown")
print(bob.address?.city ?? "unknown")

let people = [alice, bob]
let cities = people.map { $0.address?.city ?? "unknown" }
print(cities)
`,
      },
    ],
  },
]

export default challenges
