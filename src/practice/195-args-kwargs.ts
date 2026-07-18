import type { PracticeChallenge } from './loader'

export const title = '*args and **kwargs (Python)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'python-program',
        prompt: 'Write `multiply_all(*args)` returning the product of every positional argument (starting from `1`, multiplying each in a loop). Call it with `(2, 3, 4)` then `(1, 2, 3, 4, 5)`, printing each result. Write `describe(**kwargs)` returning a `", "`-joined string of `"key=value"` pairs from `kwargs.items()`. Call it with `describe(color="red", size="large")` and print the result.',
        starter: '',
        tests: `
assert output === '24\\n120\\ncolor=red, size=large'
`,
        solution: `def multiply_all(*args):
    result = 1
    for n in args:
        result *= n
    return result


print(multiply_all(2, 3, 4))
print(multiply_all(1, 2, 3, 4, 5))


def describe(**kwargs):
    parts = [f"{key}={value}" for key, value in kwargs.items()]
    return ", ".join(parts)


print(describe(color="red", size="large"))
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'python-program',
        prompt: 'Fix `build_profile`: its signature is `(**info, name)` — a regular parameter (`name`) after `**info` is a SyntaxError, since `**kwargs` must always come LAST in a function signature. Reorder it to `(name, **info)`, and update the call to pass `"Alice"` positionally first, followed by the keyword arguments.',
        starter: `def build_profile(**info, name):
    return f"{name}: {info}"


print(build_profile(city="NYC", zip="10001", name="Alice"))
`,
        tests: `
assert output === "Alice: {'city': 'NYC', 'zip': '10001'}"
`,
        solution: `def build_profile(name, **info):
    return f"{name}: {info}"


print(build_profile("Alice", city="NYC", zip="10001"))
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'python-program',
        prompt: 'Write `make_point(x, y, z)` returning `f"({x}, {y}, {z})"`. Create `coords = [1, 2, 3]` and call `make_point(*coords)`, UNPACKING the list into individual positional arguments at the call site, and print the result. Write `configure(theme, font_size)` returning `f"theme={theme}, font_size={font_size}"`. Create `settings = {"theme": "dark", "font_size": 14}` and call `configure(**settings)`, unpacking the dict into keyword arguments, and print the result.',
        starter: '',
        tests: `
assert output === '(1, 2, 3)\\ntheme=dark, font_size=14'
`,
        solution: `def make_point(x, y, z):
    return f"({x}, {y}, {z})"


coords = [1, 2, 3]
print(make_point(*coords))


def configure(theme, font_size):
    return f"theme={theme}, font_size={font_size}"


settings = {"theme": "dark", "font_size": 14}
print(configure(**settings))
`,
      },
    ],
  },
]

export default challenges
