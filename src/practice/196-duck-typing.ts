import type { PracticeChallenge } from './loader'

export const title = 'Duck Typing (Python)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'python-program',
        prompt: 'Write two completely unrelated classes, `Dog` and `Robot`, each with a `speak(self)` method (`"Woof!"` and `"BEEP BOOP"` respectively). Write `make_it_speak(entity)` that simply calls `entity.speak()`, with NO type check anywhere. Call it with `Dog()` and `Robot()` and print each result — both work identically, since `make_it_speak` never checks either object\'s actual type.',
        starter: '',
        tests: `
assert output === 'Woof!\\nBEEP BOOP'
`,
        solution: `class Dog:
    def speak(self):
        return "Woof!"


class Robot:
    def speak(self):
        return "BEEP BOOP"


def make_it_speak(entity):
    return entity.speak()


print(make_it_speak(Dog()))
print(make_it_speak(Robot()))
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'python-program',
        prompt: 'Fix `make_it_speak`: it raises `TypeError` unless `entity` is specifically an instance of `Dog` — but `Robot` also has a perfectly working `speak()` method, so this `isinstance` check needlessly rejects a compatible object, defeating duck typing\'s whole flexibility benefit. Remove the `isinstance` check entirely and just call `entity.speak()` directly.',
        starter: `class Dog:
    def speak(self):
        return "Woof!"


class Robot:
    def speak(self):
        return "BEEP BOOP"


def make_it_speak(entity):
    if not isinstance(entity, Dog):
        raise TypeError("entity must be a Dog")
    return entity.speak()


print(make_it_speak(Robot()))
`,
        tests: `
assert output === 'BEEP BOOP'
`,
        solution: `class Dog:
    def speak(self):
        return "Woof!"


class Robot:
    def speak(self):
        return "BEEP BOOP"


def make_it_speak(entity):
    return entity.speak()


print(make_it_speak(Robot()))
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'python-program',
        prompt: 'Write `make_it_speak(entity)` using the "ask forgiveness, not permission" (EAFP) style: `try` calling `entity.speak()`, and `except AttributeError:` return `"(silent)"` instead. Call it with `Dog()` (has `speak()`), `object()` (a plain object, no `speak()`), and `42` (an int, no `speak()`), printing each result.',
        starter: '',
        tests: `
assert output === 'Woof!\\n(silent)\\n(silent)'
`,
        solution: `class Dog:
    def speak(self):
        return "Woof!"


def make_it_speak(entity):
    try:
        return entity.speak()
    except AttributeError:
        return "(silent)"


print(make_it_speak(Dog()))
print(make_it_speak(object()))
print(make_it_speak(42))
`,
      },
    ],
  },
]

export default challenges
