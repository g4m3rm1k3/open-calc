import type { PracticeChallenge } from './loader'

export const title = 'Template Method Pattern'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write a base class `Recipe` with `prepare()` calling `gatherIngredients()`, `cook()`, `serve()` in that FIXED order, with `gatherIngredients`/`serve` defined once on the base class. Write `PastaRecipe extends Recipe`, overriding only `cook()` to return `\'Boil pasta\'`.',
        starter: '',
        tests: `
const pasta = new PastaRecipe()
assert JSON.stringify(pasta.prepare()) === JSON.stringify(['Gather ingredients','Boil pasta','Serve'])
`,
        solution: `class Recipe {
  prepare() {
    const steps = []
    steps.push(this.gatherIngredients())
    steps.push(this.cook())
    steps.push(this.serve())
    return steps
  }
  gatherIngredients() { return 'Gather ingredients' }
  serve() { return 'Serve' }
}
class PastaRecipe extends Recipe {
  cook() { return 'Boil pasta' }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `SaladRecipe extends Recipe`, overriding ONLY `cook()` to return `\'Toss vegetables\'` — do not touch `prepare()`, which must keep calling the same three steps in the same fixed order for every recipe subclass.',
        starter: 'class Recipe {\n  prepare() {\n    const steps = []\n    steps.push(this.gatherIngredients())\n    steps.push(this.cook())\n    steps.push(this.serve())\n    return steps\n  }\n  gatherIngredients() { return \'Gather ingredients\' }\n  serve() { return \'Serve\' }\n}\nclass PastaRecipe extends Recipe {\n  cook() { return \'Boil pasta\' }\n}\nclass SaladRecipe extends Recipe {\n  // TODO: override cook() to return \'Toss vegetables\' — do NOT override prepare()\n}',
        tests: `
const pasta = new PastaRecipe()
const salad = new SaladRecipe()
assert JSON.stringify(pasta.prepare()) === JSON.stringify(['Gather ingredients','Boil pasta','Serve'])
assert JSON.stringify(salad.prepare()) === JSON.stringify(['Gather ingredients','Toss vegetables','Serve'])
`,
        solution: `class Recipe {
  prepare() {
    const steps = []
    steps.push(this.gatherIngredients())
    steps.push(this.cook())
    steps.push(this.serve())
    return steps
  }
  gatherIngredients() { return 'Gather ingredients' }
  serve() { return 'Serve' }
}
class PastaRecipe extends Recipe {
  cook() { return 'Boil pasta' }
}
class SaladRecipe extends Recipe {
  cook() { return 'Toss vegetables' }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `Recipe` with an OPTIONAL hook step `garnish()` (defaults to returning `null`, meaning "skip this step") alongside the required `cook()` step. `prepare()` must include every step\'s result EXCEPT `null` ones. Write `PlainPasta` (overrides only `cook`) and `FancyPasta` (overrides both `cook` and `garnish`).',
        starter: '',
        tests: `
assert JSON.stringify(new PlainPasta().prepare()) === JSON.stringify(['Gather ingredients','Boil pasta','Serve'])
assert JSON.stringify(new FancyPasta().prepare()) === JSON.stringify(['Gather ingredients','Boil pasta','Add parsley','Serve'])
`,
        solution: `class Recipe {
  prepare() {
    const steps = [this.gatherIngredients(), this.cook(), this.garnish(), this.serve()]
    return steps.filter(s => s !== null)
  }
  gatherIngredients() { return 'Gather ingredients' }
  garnish() { return null }
  serve() { return 'Serve' }
}
class PlainPasta extends Recipe {
  cook() { return 'Boil pasta' }
}
class FancyPasta extends Recipe {
  cook() { return 'Boil pasta' }
  garnish() { return 'Add parsley' }
}`,
      },
    ],
  },
]

export default challenges
