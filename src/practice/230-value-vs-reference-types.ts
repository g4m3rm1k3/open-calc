import type { PracticeChallenge } from './loader'

export const title = 'Value vs Reference Types (Swift)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'swift-program',
        prompt: 'Write `struct SizeStruct { var width: Int }` and `class SizeClass { var width: Int; init(width: Int) { self.width = width } }`. Create `var a = SizeStruct(width: 10)`, `var b = a`, set `b.width = 500`, print both widths (independent — `a` unaffected). Create `let c = SizeClass(width: 10)`, `let d = c`, set `d.width = 500`, print both widths (SAME underlying object — both `500`).',
        starter: '',
        tests: `
assert output === 'a.width: 10, b.width: 500\\nc.width: 500, d.width: 500'
`,
        solution: `struct SizeStruct {
    var width: Int
}

class SizeClass {
    var width: Int
    init(width: Int) { self.width = width }
}

var a = SizeStruct(width: 10)
var b = a
b.width = 500
print("a.width: \\(a.width), b.width: \\(b.width)")

let c = SizeClass(width: 10)
let d = c
d.width = 500
print("c.width: \\(c.width), d.width: \\(d.width)")
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'swift-program',
        prompt: 'Fix `increment`: it takes `counter: Counter` BY VALUE, so mutating `localCopy` (a copy of a copy) never touches the caller\'s original struct — `myCounter.count` stays `0`. Change the parameter to `_ counter: inout Counter`, mutate `counter.count` directly (no local copy needed), and call it with `increment(&myCounter)` — `inout` is Swift\'s explicit mechanism for letting a function genuinely mutate the caller\'s struct.',
        starter: `struct Counter {
    var count: Int
}

func incrementBroken(_ counter: Counter) {
    var localCopy = counter
    localCopy.count += 1
}

var myCounter = Counter(count: 0)
incrementBroken(myCounter)
print(myCounter.count)
`,
        tests: `
assert output === '1'
`,
        solution: `struct Counter {
    var count: Int
}

func increment(_ counter: inout Counter) {
    counter.count += 1
}

var myCounter = Counter(count: 0)
increment(&myCounter)
print(myCounter.count)
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'swift-program',
        prompt: 'Write `class Engine { var horsepower: Int; init(horsepower: Int) { self.horsepower = horsepower } }` and `struct Car { var model: String; var engine: Engine }` — a VALUE type containing a REFERENCE-typed property. Create `car1` and `var car2 = car1` (a struct copy). Set `car2.model = "Coupe"` (only `car2` changes — `model` is a genuinely independent copy) and `car2.engine.horsepower = 500` (BOTH `car1.engine` and `car2.engine` change — copying the struct only copied the REFERENCE to the same `Engine`, not a new one). Print both cars\' `model`s, then both `engine.horsepower`s.',
        starter: '',
        tests: `
assert output === 'car1.model: Roadster, car2.model: Coupe\\ncar1.engine.horsepower: 500, car2.engine.horsepower: 500'
`,
        solution: `class Engine {
    var horsepower: Int
    init(horsepower: Int) { self.horsepower = horsepower }
}

struct Car {
    var model: String
    var engine: Engine
}

let engine1 = Engine(horsepower: 300)
var car1 = Car(model: "Roadster", engine: engine1)
var car2 = car1

car2.model = "Coupe"
car2.engine.horsepower = 500

print("car1.model: \\(car1.model), car2.model: \\(car2.model)")
print("car1.engine.horsepower: \\(car1.engine.horsepower), car2.engine.horsepower: \\(car2.engine.horsepower)")
`,
      },
    ],
  },
]

export default challenges
