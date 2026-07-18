import type { PracticeChallenge } from './loader'

export const title = 'Prototypal Inheritance (JavaScript)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript-program',
        prompt: 'Create `vehicle = { describe() { return \'a generic vehicle\' } }`. Create `car = Object.create(vehicle)` and print `car.describe()` (found via the prototype chain). Add `car.honk = function() { return \'Beep!\' }` directly to `car`, print `car.honk()`. Create a SEPARATE `truck = Object.create(vehicle)` and print `typeof truck.honk` (never affected by `car`\'s own property). Reassign `vehicle.describe`, then print `car.describe()` again — it resolves fresh, reflecting the change.',
        starter: '',
        tests: `
assert output === 'a generic vehicle\\nBeep!\\nundefined\\nan updated vehicle'
`,
        solution: `const vehicle = {
  describe() { return 'a generic vehicle' }
}

const car = Object.create(vehicle)
console.log(car.describe())

car.honk = function() { return 'Beep!' }
console.log(car.honk())

const truck = Object.create(vehicle)
console.log(typeof truck.honk)

vehicle.describe = function() { return 'an updated vehicle' }
console.log(car.describe())
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript-program',
        prompt: 'Fix `main`: `dog.__proto__.speak = ...` reassigns `speak` on `animal` — the SHARED prototype `dog` AND `cat` both link to — so `cat` incorrectly starts barking too. The intent was to customize only `dog`. Change it to `dog.speak = function() { return \'Woof!\' }`, adding an OWN property directly to `dog` instead of mutating the shared prototype.',
        starter: `const animal = {
  speak() { return 'some sound' }
}

const dog = Object.create(animal)
const cat = Object.create(animal)

dog.__proto__.speak = function() { return 'Woof!' }

console.log(dog.speak())
console.log(cat.speak())
`,
        tests: `
assert output === 'Woof!\\nsome sound'
`,
        solution: `const animal = {
  speak() { return 'some sound' }
}

const dog = Object.create(animal)
const cat = Object.create(animal)

dog.speak = function() { return 'Woof!' }

console.log(dog.speak())
console.log(cat.speak())
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript-program',
        prompt: 'Write `class Animal { speak() { return \'some sound\' } }` and `class Dog extends Animal {}` (no override). Create `rex = new Dog()`, print `rex.speak()`. Reassign `Animal.prototype.speak` to a new function, print `rex.speak()` again — it reflects the change immediately, since `class`/`extends` is built on the SAME prototype-chain lookup as `Object.create`. Print `rex instanceof Animal` and `Object.getPrototypeOf(Dog.prototype) === Animal.prototype` — both `true`, confirming `extends` literally links the two prototypes.',
        starter: '',
        tests: `
assert output === 'some sound\\na NEW sound\\ntrue\\ntrue'
`,
        solution: `class Animal {
  speak() { return 'some sound' }
}

class Dog extends Animal {
}

const rex = new Dog()
console.log(rex.speak())

Animal.prototype.speak = function() { return 'a NEW sound' }
console.log(rex.speak())

console.log(rex instanceof Animal)
console.log(Object.getPrototypeOf(Dog.prototype) === Animal.prototype)
`,
      },
    ],
  },
]

export default challenges
