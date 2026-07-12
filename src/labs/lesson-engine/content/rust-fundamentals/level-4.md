---
series: rust-fundamentals
level: 4
title: Traits and Generics
lang: javascript
---

# Traits and Generics

Code duplication is the enemy of maintainability, but abstraction comes with costs. Rust's traits and generics let you write code that works over many types while paying none of the runtime cost of interfaces in Java or Python's dynamic dispatch. A **trait** defines a set of methods a type must implement — a named capability. **Generics** let functions and types be parameterised by types, with trait bounds specifying what capabilities those types must have. The compiler generates specialised code for each concrete type used, eliminating dynamic dispatch entirely. By the end of this lesson you will understand how traits work as contracts, how generics enable zero-cost abstraction, and how this compares to inheritance.

## Traits — Defining Shared Behaviour

A trait is a named interface: a list of method signatures that a type agrees to implement.

```javascript
// In real Rust:
//   trait Area {
//     fn area(&self) -> f64;
//     fn description(&self) -> String {   // default implementation
//       format!("shape with area {:.2}", self.area())
//     }
//   }
//
//   struct Circle { radius: f64 }
//   impl Area for Circle {
//     fn area(&self) -> f64 { std::f64::consts::PI * self.radius * self.radius }
//   }

// We simulate traits using a trait registry:
function createTraitSystem() {
  const implementations = new Map()  // traitName → Map(typeName → methods)
  const typeRegistry   = new Map()  // typeName → object

  return {
    // defineTrait(name, requiredMethods, defaults)
    defineTrait(name, required, defaults = {}) {
      implementations.set(name, { required, defaults, impls: new Map() })
    },

    // implement(traitName, typeName, methods)
    implement(traitName, typeName, methods) {
      const trait = implementations.get(traitName)
      if (!trait) throw new Error(`unknown trait: ${traitName}`)
      for (const req of trait.required) {
        if (!(req in methods)) throw new Error(`${typeName} must implement ${req} for trait ${traitName}`)
      }
      // Merge: explicit methods override defaults
      trait.impls.set(typeName, { ...trait.defaults, ...methods })
    },

    // call(traitName, method, instance)
    call(traitName, method, instance) {
      const trait = implementations.get(traitName)
      if (!trait) throw new Error(`unknown trait: ${traitName}`)
      const impl = trait.impls.get(instance.type)
      if (!impl) throw new Error(`${instance.type} does not implement ${traitName}`)
      const fn_ = impl[method]
      if (!fn_) throw new Error(`${traitName} has no method ${method}`)
      return fn_(instance)
    },
  }
}

const traits = createTraitSystem()

traits.defineTrait('Area', ['area'], {
  description: obj => `shape with area ${traits.call('Area', 'area', obj).toFixed(2)}`
})

traits.implement('Area', 'Circle',    { area: s => Math.PI * s.radius * s.radius })
traits.implement('Area', 'Rectangle', { area: s => s.width * s.height })

const circle = { type: 'Circle', radius: 5 }
const rect   = { type: 'Rectangle', width: 4, height: 6 }

console.log('circle area:', traits.call('Area', 'area', circle).toFixed(4))
console.log('circle desc:', traits.call('Area', 'description', circle))
console.log('rect area:', traits.call('Area', 'area', rect))
console.log('rect desc:', traits.call('Area', 'description', rect))
```

```text
circle area: 78.5398
circle desc: shape with area 78.54
rect area: 24
rect desc: shape with area 24.00
```

**CS lens:** A trait is structurally similar to an interface in Java or a protocol in Swift. The key difference is that Rust traits are **implemented separately from the type definition** (`impl Trait for Type` is separate from `struct Type`). This means you can implement a trait from a library on a type from another library — something Java's interface system cannot do (the class must declare the interface at definition time).

## Generics — Parameterised Types

A generic function works over any type that satisfies a trait bound — and the compiler generates specialised code for each concrete type used.

```javascript
// In real Rust:
//   fn largest<T: PartialOrd>(list: &[T]) -> &T {
//     let mut largest = &list[0]
//     for item in list {
//       if item > largest { largest = item }
//     }
//     largest
//   }
//   // T must implement PartialOrd so we can use > on it

// In JavaScript we approximate by passing the comparison function:
function largest(list, compare) {
  if (list.length === 0) throw new Error('empty list')
  let result = list[0]
  for (let i = 1; i < list.length; i++) {
    if (compare(list[i], result) > 0) result = list[i]
  }
  return result
}

// Works for any type with a comparison function — generic in behaviour
const numbers = [3, 1, 4, 1, 5, 9, 2, 6]
const words   = ['banana', 'apple', 'cherry', 'date']

console.log('largest number:', largest(numbers, (a, b) => a - b))
console.log('largest word:',   largest(words,   (a, b) => a.localeCompare(b)))

// With trait bounds, Rust would write this as:
// fn largest_display<T: PartialOrd + Display>(list: &[T])
// Both PartialOrd (comparable) AND Display (printable) must be implemented
function largestWithBounds(list, traits) {
  const { compare, display } = traits
  const result = largest(list, compare)
  return `Largest: ${display(result)}`
}

console.log(largestWithBounds(numbers, {
  compare: (a, b) => a - b,
  display: n => n.toString(),
}))
```

```text
largest number: 9
largest word: date
Largest: 9
```

Execution trace for `largest([3,1,4,1,5,9,2,6], ...)`:
```text
result = 3
i=1: compare(1,3) = -2 → no update  → result = 3
i=2: compare(4,3) =  1 → update     → result = 4
i=3: compare(1,4) = -3 → no update  → result = 4
i=4: compare(5,4) =  1 → update     → result = 5
i=5: compare(9,5) =  4 → update     → result = 9
i=6: compare(2,9) = -7 → no update  → result = 9
i=7: compare(6,9) = -3 → no update  → result = 9
return 9
```

**CS lens:** Rust's generics use **monomorphisation**: the compiler generates a separate copy of the function for each concrete type. `largest::<i32>` and `largest::<f64>` are two separate functions in the compiled binary — each as fast as if written specifically for that type. Java uses **type erasure**: the generic type parameter is erased at compile time and replaced with `Object`. This means Java generics use dynamic dispatch and boxing at runtime. Rust gets the same expressiveness with zero runtime cost.

## Traits vs Inheritance

Rust has no class inheritance. Trait composition replaces the role inheritance plays in other languages:

```javascript
function demonstrateTraitComposition() {
  // Instead of:
  //   class Animal { makeSound() {} }
  //   class Dog extends Animal { makeSound() { return 'woof' } }
  //   class Cat extends Animal { makeSound() { return 'meow' } }

  // Rust uses: implement multiple traits independently
  const speaks = {
    Dog: { speak: () => 'woof' },
    Cat: { speak: () => 'meow' },
  }

  const eats = {
    Dog: { eat: food => `Dog eats ${food}` },
    Cat: { eat: food => `Cat eats ${food}` },
    Fish: { eat: food => `Fish eats ${food}` },
  }

  // A Fish cannot speak — it simply doesn't implement Speaks
  // This is impossible with inheritance: if Animal has speak(), every Animal must speak

  function printSpeaker(animalType) {
    const impl = speaks[animalType]
    if (!impl) { console.log(`${animalType} does not implement Speaks`); return }
    console.log(`${animalType} says: ${impl.speak()}`)
  }

  printSpeaker('Dog')
  printSpeaker('Cat')
  printSpeaker('Fish')  // Fish does not speak

  // Trait bounds let you require specific combinations:
  // fn feed_and_play<T: Eats + Plays>(animal: &T)
  // A Fish that eats but doesn't play cannot be fed_and_played
}

demonstrateTraitComposition()
```

```text
Dog says: woof
Cat says: meow
Fish does not implement Speaks
```

**SE lens:** The problem with deep inheritance hierarchies is the **fragile base class problem**: changing a base class can break all subclasses, and subclasses cannot refuse to inherit behaviour they don't need. Trait composition solves this: a type implements exactly the traits that apply to it, and nothing else. The **Interface Segregation Principle** (the I in SOLID) — "clients should not depend on interfaces they do not use" — is enforced by Rust's trait system at the type level.

## Challenge: trait_system

Implement a miniature trait registry.

`createTraitSystem()` — returns an object with:
- `.defineTrait(traitName, requiredMethods)` — registers a trait; `requiredMethods` is an array of method name strings
- `.implement(traitName, typeName, methods)` — registers an implementation; throws `'missing method: X'` if any required method is absent from `methods`
- `.call(traitName, methodName, instance)` — calls the method on the instance's type; `instance` has a `.type` property; throws `'not implemented'` if the type has no implementation for the trait

```challenge
function createTraitSystem() {
  return {
    defineTrait(traitName, requiredMethods) {},
    implement(traitName, typeName, methods) {},
    call(traitName, methodName, instance) { return null },
  }
}
```

```test
const ts = createTraitSystem()
ts.defineTrait('Greet', ['greet'])
ts.implement('Greet', 'English', { greet: inst => `Hello, ${inst.name}` })
ts.implement('Greet', 'Spanish', { greet: inst => `Hola, ${inst.name}` })
const en = { type: 'English', name: 'World' }
const es = { type: 'Spanish', name: 'Mundo' }
assert ts.call('Greet', 'greet', en) === 'Hello, World'
assert ts.call('Greet', 'greet', es) === 'Hola, Mundo'
let threw = false
try { ts.implement('Greet', 'Broken', {}) } catch (e) { threw = e.message.includes('missing method') }
assert threw === true
let threw2 = false
try { ts.call('Greet', 'greet', { type: 'French', name: 'Monde' }) } catch (e) { threw2 = true }
assert threw2 === true
```
