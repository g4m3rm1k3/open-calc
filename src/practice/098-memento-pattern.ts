import type { PracticeChallenge } from './loader'

export const title = 'Memento Pattern'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeEditor()` returning `{ setText(t), getText(), save(), restore(memento) }`. `save()` returns a snapshot of the current text; `restore(memento)` resets the text back to what it was when that memento was saved.',
        starter: '',
        tests: `
const editor = makeEditor()
assert (editor.setText('Hello'), true)
const saved = editor.save()
assert (editor.setText('Hello World'), true)
assert editor.getText() === 'Hello World'
assert (editor.restore(saved), true)
assert editor.getText() === 'Hello'
`,
        solution: `function makeEditor() {
  let text = ''
  return {
    setText(t) { text = t },
    getText() { return text },
    save() { return { text } },
    restore(memento) { text = memento.text },
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
        prompt: 'Fix `makeListEditor()`\'s `save()` so it stores a genuine COPY of `items`, not a reference to the same array — otherwise later mutations (like `push`) silently corrupt the already-saved memento too.',
        starter: 'function makeListEditor() {\n  let items = []\n  return {\n    setItems(arr) { items = [...arr] },\n    getItems() { return items },\n    push(x) { items.push(x) },\n    // TODO: save() must return a memento holding a COPY of items, not a\n    // reference to the same array — otherwise later mutations corrupt the saved snapshot\n    save() { return { items: items } },\n    restore(memento) { items = [...memento.items] },\n  }\n}',
        tests: `
const editor = makeListEditor()
assert (editor.setItems(['a','b']), true)
const saved = editor.save()
assert (editor.push('c'), true)
assert JSON.stringify(editor.getItems()) === JSON.stringify(['a','b','c'])
assert JSON.stringify(saved.items) === JSON.stringify(['a','b'])
assert (editor.restore(saved), true)
assert JSON.stringify(editor.getItems()) === JSON.stringify(['a','b'])
`,
        solution: `function makeListEditor() {
  let items = []
  return {
    setItems(arr) { items = [...arr] },
    getItems() { return items },
    push(x) { items.push(x) },
    save() { return { items: [...items] } },
    restore(memento) { items = [...memento.items] },
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
        prompt: 'Write `makeEditor()` (same as level 1) and `makeHistory()` returning `{ save(originator), undo(originator) }`. `save` pushes `originator.save()` onto an internal stack; `undo` pops the MOST RECENT memento off that stack and calls `originator.restore(memento)` with it.',
        starter: '',
        tests: `
const editor = makeEditor()
const history = makeHistory()
assert (editor.setText('A'), true)
assert (history.save(editor), true)
assert (editor.setText('B'), true)
assert (history.save(editor), true)
assert (editor.setText('C'), true)
assert editor.getText() === 'C'
assert (history.undo(editor), true)
assert editor.getText() === 'B'
assert (history.undo(editor), true)
assert editor.getText() === 'A'
`,
        solution: `function makeEditor() {
  let text = ''
  return {
    setText(t) { text = t },
    getText() { return text },
    save() { return { text } },
    restore(memento) { text = memento.text },
  }
}
function makeHistory() {
  const mementos = []
  return {
    save(originator) { mementos.push(originator.save()) },
    undo(originator) {
      const memento = mementos.pop()
      if (memento) originator.restore(memento)
    },
  }
}`,
      },
    ],
  },
]

export default challenges
