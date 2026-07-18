import type { PracticeChallenge } from './loader'

export const title = 'Guard Statements (Swift)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'swift-program',
        prompt: 'Write `processAge(_ age: Int?) -> String` using `guard let unwrapped = age else { return "no age given" }`, then `return "age is \\(unwrapped)"` with no extra nesting. Call it with `25` and `nil`.',
        starter: '',
        tests: `
assert output === 'age is 25\\nno age given'
`,
        solution: `func processAge(_ age: Int?) -> String {
    guard let unwrapped = age else {
        return "no age given"
    }
    return "age is \\(unwrapped)"
}

print(processAge(25))
print(processAge(nil))
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'swift-program',
        prompt: 'Fix `processAge`: its `guard`\'s `else` block only calls `print(...)` — it never exits the scope (no `return`/`throw`/`break`/`continue`), which is a COMPILE ERROR ("\'guard\' body must not fall through"), since Swift requires a failed `guard` to always exit. Add `return "unknown"` after the `print` call inside the `else` block.',
        starter: `func processAge(_ age: Int?) -> String {
    guard let unwrapped = age else {
        print("no age given")
    }
    return "age is \\(unwrapped)"
}

print(processAge(25))
print(processAge(nil))
`,
        tests: `
assert output === 'age is 25\\nno age given\\nunknown'
`,
        solution: `func processAge(_ age: Int?) -> String {
    guard let unwrapped = age else {
        print("no age given")
        return "unknown"
    }
    return "age is \\(unwrapped)"
}

print(processAge(25))
print(processAge(nil))
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'swift-program',
        prompt: 'Write `struct User { var name: String?; var age: Int?; var email: String? }`. Write `describeUser(_ user: User) -> String` using THREE CHAINED `guard let` statements (one for `name`, one for `age`, one for `email` — each `else` returning a distinct `"missing ..."` message) — a FLAT sequence with no nesting, unlike the equivalent chain of nested `if let`s. Call it with a fully-populated `User`, one missing only `email`, and one missing everything.',
        starter: '',
        tests: `
assert output === 'Alice, 30, alice@x.com\\nmissing email\\nmissing name'
`,
        solution: `struct User {
    var name: String?
    var age: Int?
    var email: String?
}

func describeUser(_ user: User) -> String {
    guard let name = user.name else {
        return "missing name"
    }
    guard let age = user.age else {
        return "missing age"
    }
    guard let email = user.email else {
        return "missing email"
    }
    return "\\(name), \\(age), \\(email)"
}

let complete = User(name: "Alice", age: 30, email: "alice@x.com")
let missingEmail = User(name: "Bob", age: 25, email: nil)
let missingAll = User(name: nil, age: nil, email: nil)

print(describeUser(complete))
print(describeUser(missingEmail))
print(describeUser(missingAll))
`,
      },
    ],
  },
]

export default challenges
