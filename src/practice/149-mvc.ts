import type { PracticeChallenge } from './loader'

export const title = 'MVC (Model-View-Controller)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `CounterModel` (tracks `#count`, `increment()`, `get value()`), `CounterView` (`render(value)` formats `"Count is: {value}"`), and `CounterController` (`handleIncrementClick()` tells the Model to update, then tells the View to render the Model\'s new value).',
        starter: '',
        tests: `
const controller = new CounterController(new CounterModel(), new CounterView())
assert controller.handleIncrementClick() === 'Count is: 1'
assert controller.handleIncrementClick() === 'Count is: 2'
`,
        solution: `class CounterModel {
  #count = 0
  increment() { this.#count += 1 }
  get value() { return this.#count }
}
class CounterView {
  render(value) { return \`Count is: \${value}\` }
}
class CounterController {
  constructor(model, view) {
    this.model = model
    this.view = view
  }
  handleIncrementClick() {
    this.model.increment()
    return this.view.render(this.model.value)
  }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `CLIView.render(value)` returning `\'> count=\' + value`. Swap it into the SAME `CounterController`/`CounterModel` used before — a well-separated MVC design lets the View change completely with ZERO changes to the Model.',
        starter: 'class CounterModel {\n  #count = 0\n  increment() { this.#count += 1 }\n  get value() { return this.#count }\n}\nclass CLIView {\n  // TODO: render(value) must return \'> count=\' + value\n  render(value) { return String(value) }\n}\nclass CounterController {\n  constructor(model, view) {\n    this.model = model\n    this.view = view\n  }\n  handleIncrementClick() {\n    this.model.increment()\n    return this.view.render(this.model.value)\n  }\n}',
        tests: `
const model = new CounterModel()
const cliController = new CounterController(model, new CLIView())
assert cliController.handleIncrementClick() === '> count=1'
`,
        solution: `class CounterModel {
  #count = 0
  increment() { this.#count += 1 }
  get value() { return this.#count }
}
class CLIView {
  render(value) { return '> count=' + value }
}
class CounterController {
  constructor(model, view) {
    this.model = model
    this.view = view
  }
  handleIncrementClick() {
    this.model.increment()
    return this.view.render(this.model.value)
  }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `TodoModel` (`add(item)`, `get items()`), `ListView` (renders items joined by `\', \'`), `CountView` (renders `"{n} items"`), and `TodoController` (`addItem(item)` updates the Model once, then returns an array of EVERY view\'s render of the Model\'s current items) — one Model driving multiple independent Views simultaneously.',
        starter: '',
        tests: `
const model = new TodoModel()
const controller = new TodoController(model, [new ListView(), new CountView()])
const result = controller.addItem('milk')
assert JSON.stringify(result) === JSON.stringify(['milk','1 items'])
const result2 = controller.addItem('eggs')
assert JSON.stringify(result2) === JSON.stringify(['milk, eggs','2 items'])
`,
        solution: `class TodoModel {
  #items = []
  add(item) { this.#items.push(item) }
  get items() { return [...this.#items] }
}
class ListView {
  render(items) { return items.join(', ') }
}
class CountView {
  render(items) { return items.length + ' items' }
}
class TodoController {
  constructor(model, views) {
    this.model = model
    this.views = views
  }
  addItem(item) {
    this.model.add(item)
    return this.views.map(view => view.render(this.model.items))
  }
}`,
      },
    ],
  },
]

export default challenges
