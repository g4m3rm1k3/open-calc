import type { PracticeChallenge } from './loader'

export const title = 'Mediator Pattern'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeDialog()` returning `{ notify(sender, event), submitEnabled }`, and `makeCheckbox(mediator)` returning `{ check() }`. Checking the checkbox must call `mediator.notify(\'checkbox\', \'checked\')`, which the dialog uses to enable `submitEnabled`.',
        starter: '',
        tests: `
const dialog = makeDialog()
const checkbox = makeCheckbox(dialog)
assert dialog.submitEnabled === false
assert (checkbox.check(), true)
assert dialog.submitEnabled === true
`,
        solution: `function makeDialog() {
  let submitEnabled = false
  return {
    notify(sender, event) {
      if (sender === 'checkbox' && event === 'checked') submitEnabled = true
    },
    get submitEnabled() { return submitEnabled },
  }
}
function makeCheckbox(mediator) {
  return { check() { mediator.notify('checkbox', 'checked') } }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Add `makeDropdown(mediator)` (a `{ select() }` that notifies `\'dropdown\'`/`\'selected\'`) and update `makeDialog` so `submitEnabled` is only `true` once BOTH the checkbox is checked AND the dropdown is selected — neither widget knows about the other, only the mediator does.',
        starter: 'function makeDialog() {\n  let checkboxChecked = false\n  return {\n    notify(sender, event) {\n      if (sender === \'checkbox\' && event === \'checked\') checkboxChecked = true\n      // TODO: submit should only be enabled once BOTH the checkbox is checked\n      // AND the dropdown is selected — track dropdown state too\n    },\n    get submitEnabled() { return checkboxChecked },\n  }\n}\nfunction makeCheckbox(mediator) {\n  return { check() { mediator.notify(\'checkbox\', \'checked\') } }\n}\nfunction makeDropdown(mediator) {\n  return { select() { mediator.notify(\'dropdown\', \'selected\') } }\n}',
        tests: `
const dialog = makeDialog()
const checkbox = makeCheckbox(dialog)
const dropdown = makeDropdown(dialog)
assert dialog.submitEnabled === false
assert (checkbox.check(), true)
assert dialog.submitEnabled === false
assert (dropdown.select(), true)
assert dialog.submitEnabled === true
`,
        solution: `function makeDialog() {
  let checkboxChecked = false
  let dropdownSelected = false
  return {
    notify(sender, event) {
      if (sender === 'checkbox' && event === 'checked') checkboxChecked = true
      if (sender === 'dropdown' && event === 'selected') dropdownSelected = true
    },
    get submitEnabled() { return checkboxChecked && dropdownSelected },
  }
}
function makeCheckbox(mediator) {
  return { check() { mediator.notify('checkbox', 'checked') } }
}
function makeDropdown(mediator) {
  return { select() { mediator.notify('dropdown', 'selected') } }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeChatRoom()` returning `{ register(user), send(senderName, message) }`. `send` must call `receive(senderName, message)` on every REGISTERED user EXCEPT the sender — users never reference each other directly, only the chat room (mediator) knows the full set of participants.',
        starter: '',
        tests: `
const room = makeChatRoom()
const received = []
const alice = { name: 'Alice', receive(from, msg) { received.push(\`Alice got from \${from}: \${msg}\`) } }
const bob = { name: 'Bob', receive(from, msg) { received.push(\`Bob got from \${from}: \${msg}\`) } }
assert (room.register(alice), true)
assert (room.register(bob), true)
assert (room.send('Alice', 'hello'), true)
assert JSON.stringify(received) === JSON.stringify(['Bob got from Alice: hello'])
`,
        solution: `function makeChatRoom() {
  const users = []
  return {
    register(user) { users.push(user) },
    send(senderName, message) {
      for (const user of users) {
        if (user.name !== senderName) user.receive(senderName, message)
      }
    },
  }
}`,
      },
    ],
  },
]

export default challenges
