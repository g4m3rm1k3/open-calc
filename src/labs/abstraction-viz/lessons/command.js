export default {
  id: 'command',
  title: 'Command Pattern',
  tag: 'Design Pattern',
  steps: [
    {
      title: 'The problem — hard-coded action calls',
      semanticEvent: 'DefineClass',
      code:
`class TextEditor {
  constructor() {
    this.content = ''
  }

  insert(text) {
    this.content += text
  }

  delete(count) {
    this.content = this.content.slice(0, -count)
  }
}

const editor = new TextEditor()
editor.insert('Hello')
editor.insert(', world')
console.log(editor.content)
editor.delete(6)
console.log(editor.content)`,
      explanation: [
        '`TextEditor` exposes two direct operations: `insert` and `delete`. The problem this step reveals: **direct calls leave no history**. Once `delete(6)` runs and removes ` world` from `Hello, world`, that action is gone — no record of what changed, no way to reverse it. The Command pattern solves this by turning each operation into an object that knows how to undo itself.',
        'CS — The editor works but has no history. Once `delete` runs, the text is gone — there is no way to undo it. The Command pattern solves this by turning each operation into an object. Instead of calling `editor.delete(6)` directly, you create a `DeleteCommand(6)` object that holds the action and its inverse. The invoker (a history stack) can replay or reverse commands at any time.',
        'SE — Undo/redo is the canonical Command pattern use case. VS Code\'s edit history, Figma\'s undo stack, and Google Docs\' revision history all implement Command. Beyond editors, database transactions are commands (execute + rollback), browser history is a command stack (navigate = push, back = pop + undo), and network request retries wrap the original request as a command that can be replayed.',
        'Without this: without the Command pattern, implementing undo requires storing the entire editor state before every operation — a snapshot approach. For large documents, every edit copies megabytes of text. Commands store only the operation (what changed and how to reverse it), not the entire state. The memory cost is proportional to the number of edits, not the document size.',
      ],
      active: [
        { startLine: 1,  endLine: 12, color: 'indigo',  label: 'TextEditor — operations called directly' },
        { startLine: 15, endLine: 20, color: 'emerald', label: 'no history — delete cannot be undone' },
      ],
      connections: [],
    },
    {
      title: 'Command interface — execute and undo',
      semanticEvent: 'DefineClass',
      code:
`class TextEditor {
  constructor() {
    this.content = ''
  }

  insert(text) {
    this.content += text
  }

  delete(count) {
    this.content = this.content.slice(0, -count)
  }
}

class InsertCommand {
  constructor(editor, text) {
    this.editor = editor
    this.text   = text
  }

  execute() {
    this.editor.insert(this.text)
  }

  undo() {
    this.editor.delete(this.text.length)
  }
}

const editor = new TextEditor()
const cmd = new InsertCommand(editor, 'Hello')
cmd.execute()
console.log(editor.content)
cmd.undo()
console.log(editor.content)`,
      explanation: [
        '`InsertCommand` encapsulates the **execute → undo relationship**: it stores both the action (`editor.insert(this.text)`) and its exact inverse (`editor.delete(this.text.length)`). The command object carries everything needed to reverse what it did. The caller no longer needs to remember what was inserted — the command remembers for itself.',
        'CS — Each command encapsulates: the receiver (the editor), the action (`insert`), the arguments (`text`), and the inverse (`delete` with the same length). Storing `this.text` in the command object is what makes the undo possible — the command remembers exactly what it did. This is the Command object pattern: action + receiver + arguments + inverse = one self-contained unit.',
        'SE — Redux actions are commands: `{ type: \'INSERT_TEXT\', payload: \'Hello\' }` is the command, and the reducer applies it. Redux DevTools\'s time-travel debugging replays commands forward and backward. Event sourcing stores every state change as a command — you can reconstruct any past state by replaying the command log from the beginning.',
        'Without this: without `undo()` on the command object, undo logic lives in the caller — whoever called `insert` must remember what was inserted and call `delete` with the right length. If the caller is a button handler that\'s already returned, the information is gone. The command object carries its own undo logic, making undo automatic.',
      ],
      active: [
        { startLine: 15, endLine: 27, color: 'violet',  label: 'InsertCommand — execute + undo in one object' },
        { startLine: 31, endLine: 35, color: 'emerald', label: 'execute → Hello; undo → empty string' },
      ],
      connections: [{ fromLine: 25, toLine: 10, color: 'violet', label: 'undo calls delete with text.length', type: 'calls' }],
    },
    {
      title: 'DeleteCommand — undo restores the deleted text',
      semanticEvent: 'DefineClass',
      code:
`class TextEditor {
  constructor() {
    this.content = ''
  }

  insert(text) {
    this.content += text
  }

  delete(count) {
    this.content = this.content.slice(0, -count)
  }
}

class InsertCommand {
  constructor(editor, text) {
    this.editor = editor
    this.text   = text
  }

  execute() {
    this.editor.insert(this.text)
  }

  undo() {
    this.editor.delete(this.text.length)
  }
}

class DeleteCommand {
  constructor(editor, count) {
    this.editor  = editor
    this.count   = count
    this.deleted = ''
  }

  execute() {
    this.deleted = this.editor.content.slice(-this.count)
    this.editor.delete(this.count)
  }

  undo() {
    this.editor.insert(this.deleted)
  }
}

const editor = new TextEditor()
const cmd = new InsertCommand(editor, 'Hello')
cmd.execute()
console.log(editor.content)
cmd.undo()
console.log(editor.content)

editor.insert('Hello, world')
const del = new DeleteCommand(editor, 6)
del.execute()
console.log(editor.content)
del.undo()
console.log(editor.content)`,
      explanation: [
        '`DeleteCommand` reveals a key pattern in undo design: **the execute step must save what it destroys**. Line 39 captures `content.slice(-count)` into `this.deleted` before removing those characters. After `execute()`, `Hello, world` → `Hello,`. After `undo()`, `Hello,` → `Hello, world`. The command stores only the affected slice — the minimum information needed for reversal.',
        'CS — `DeleteCommand` is an example of where the forward operation and the undo differ structurally: insert is the inverse of delete and delete is the inverse of insert, but delete\'s undo requires knowing WHAT was deleted, not just HOW MANY characters. `this.deleted` is populated lazily — on `execute()`, not in the constructor. The command is not yet \'used\' until executed.',
        'SE — This is the fundamental difference between Command and simple function calls: the command object survives after execution and carries the information needed to reverse itself. Git\'s commit/revert, database transaction rollback logs, and Redux\'s `@@INIT` + action replay all save "what happened" so they can reconstruct "what was before".',
        'Without this: without capturing `this.deleted` during execute, the undo has no information. The deleted text is gone — removed from the editor. You\'d need to store the entire editor state before the delete, which is expensive for large documents. The command captures only the affected slice — the minimum information needed for reversal.',
      ],
      active: [
        { startLine: 30, endLine: 44, color: 'indigo',  label: 'DeleteCommand — captures deleted text in execute()' },
        { startLine: 39, endLine: 39, color: 'violet',  label: 'this.deleted = slice — save what will be removed' },
        { startLine: 56, endLine: 59, color: 'emerald', label: 'execute removes; undo restores exactly' },
      ],
      connections: [{ fromLine: 43, toLine: 6, color: 'violet', label: 'undo inserts saved text back', type: 'calls' }],
    },
    {
      title: 'History — undo and redo stack',
      semanticEvent: 'DefineClass',
      code:
`class TextEditor {
  constructor() {
    this.content = ''
  }
  insert(text) { this.content += text }
  delete(count) { this.content = this.content.slice(0, -count) }
}

class InsertCommand {
  constructor(editor, text) { this.editor = editor; this.text = text; }
  execute() { this.editor.insert(this.text) }
  undo()    { this.editor.delete(this.text.length) }
}

class DeleteCommand {
  constructor(editor, count) { this.editor = editor; this.count = count; this.deleted = '' }
  execute() { this.deleted = this.editor.content.slice(-this.count); this.editor.delete(this.count) }
  undo()    { this.editor.insert(this.deleted) }
}

class History {
  constructor() {
    this.undoStack = []
    this.redoStack = []
  }

  execute(command) {
    command.execute()
    this.undoStack.push(command)
    this.redoStack = []
  }

  undo() {
    if (this.undoStack.length === 0) return
    const cmd = this.undoStack.pop()
    cmd.undo()
    this.redoStack.push(cmd)
  }

  redo() {
    if (this.redoStack.length === 0) return
    const cmd = this.redoStack.pop()
    cmd.execute()
    this.undoStack.push(cmd)
  }
}

const editor  = new TextEditor()
const history = new History()

history.execute(new InsertCommand(editor, 'Hello'))
history.execute(new InsertCommand(editor, ', world'))
console.log(editor.content)

history.undo()
console.log(editor.content)

history.undo()
console.log(editor.content)

history.redo()
console.log(editor.content)`,
      explanation: [
        '`History` establishes the **past/future symmetry** using two stacks: `undoStack` (past executed commands) and `redoStack` (commands that were undone and can be re-applied). A new `execute()` clears `redoStack` — branching history invalidates the old future. Undo moves a command from past to future; redo moves it back. This symmetry is why Ctrl+Z and Ctrl+Shift+Z always stay in sync.',
        'CS — Two stacks implement a linear undo/redo history. The `undoStack` is the past; the `redoStack` is the future. Executing a new command (`history.execute(...)`) clears the redoStack — the new action branches history, making the previous "future" unreachable. This is why every editor clears redo on a new action: you cannot redo what happened in an alternate timeline.',
        'SE — VS Code\'s `vscode.workspace.applyEdit()` is a command that goes through the workspace\'s history manager. Monaco Editor\'s `IUndoRedoService` manages the undo/redo stack for all text models. Figma\'s revision history is a persistent command log — they can replay your entire session. Git\'s `git revert` is undo; `git cherry-pick` is selective redo.',
        'Without this: without `redoStack = []` on execute, new edits after an undo would redo old changes instead of the new ones. The undo/redo invariant is: redo is only valid when no new commands have been executed since the last undo. Clearing `redoStack` enforces this invariant at the point of insertion.',
      ],
      active: [
        { startLine: 22, endLine: 46, color: 'indigo',  label: 'History — undo + redo stacks' },
        { startLine: 30, endLine: 30, color: 'violet',  label: 'redoStack cleared on new execute' },
        { startLine: 56, endLine: 65, color: 'emerald', label: 'full undo/redo sequence demonstrated' },
      ],
      connections: [{ fromLine: 34, toLine: 35, color: 'violet', label: 'undo pops undoStack, pushes redoStack', type: 'writes' }],
    },
    {
      title: 'Macro command — batch multiple commands as one',
      semanticEvent: 'DefineClass',
      code:
`class TextEditor {
  constructor() {
    this.content = ''
  }
  insert(text) { this.content += text }
  delete(count) { this.content = this.content.slice(0, -count) }
}

class InsertCommand {
  constructor(editor, text) { this.editor = editor; this.text = text; }
  execute() { this.editor.insert(this.text) }
  undo()    { this.editor.delete(this.text.length) }
}

class DeleteCommand {
  constructor(editor, count) { this.editor = editor; this.count = count; this.deleted = '' }
  execute() { this.deleted = this.editor.content.slice(-this.count); this.editor.delete(this.count) }
  undo()    { this.editor.insert(this.deleted) }
}

class History {
  constructor() { this.undoStack = []; this.redoStack = [] }
  execute(command) { command.execute(); this.undoStack.push(command); this.redoStack = [] }
  undo() {
    if (this.undoStack.length === 0) return
    const cmd = this.undoStack.pop(); cmd.undo(); this.redoStack.push(cmd)
  }
  redo() {
    if (this.redoStack.length === 0) return
    const cmd = this.redoStack.pop(); cmd.execute(); this.undoStack.push(cmd)
  }
}

class MacroCommand {
  constructor(commands) {
    this.commands = commands
  }

  execute() {
    this.commands.forEach(function(cmd) { cmd.execute() })
  }

  undo() {
    var cmds = this.commands.slice().reverse()
    cmds.forEach(function(cmd) { cmd.undo() })
  }
}

const editor  = new TextEditor()
const history = new History()

history.execute(new InsertCommand(editor, 'Hello'))
history.execute(new InsertCommand(editor, ', world'))
console.log(editor.content)

history.undo()
console.log(editor.content)

history.undo()
console.log(editor.content)

history.redo()
console.log(editor.content)

const macro = new MacroCommand([
  new InsertCommand(editor, ' — '),
  new InsertCommand(editor, 'goodbye!'),
])
history.execute(macro)
console.log(editor.content)
history.undo()
console.log(editor.content)`,
      explanation: [
        '`MacroCommand` establishes the **composite command relationship**: an object that holds an array of commands and exposes the same `execute`/`undo` interface as a single command. `History` cannot distinguish it from a leaf command. A single `history.undo()` reverses both inserts atomically — in reverse order — because `undo()` processes the array in reverse.',
        'CS — `MacroCommand` is the Composite pattern applied to Command: a command that contains other commands. The composite has the same interface (`execute`, `undo`) as a leaf command, so `History` does not know or care whether it is storing a simple command or a macro. The tree of commands is transparent to the invoker.',
        'SE — Batch operations in database clients use macro commands: a migration that drops a column and adds two new ones is a macro — three DDL commands wrapped as one transaction. SQL `BEGIN...COMMIT` is a macro command. Redux\'s `batch()` utility wraps multiple `dispatch` calls as a single macro to suppress intermediate re-renders. Figma\'s "group" action is a macro that moves multiple items as one undoable step.',
        'Without this: without the macro, two separate `history.execute(cmd)` calls would create two undo steps. The user would need to press Ctrl+Z twice to undo the combined action. The macro collapses them into one undo step — matching the user\'s mental model of "I did one thing" (added a signature line).',
      ],
      active: [
        { startLine: 35, endLine: 47, color: 'violet',  label: 'MacroCommand — batch commands, undo in reverse' },
        { startLine: 63, endLine: 66, color: 'indigo',  label: 'two inserts wrapped as one macro command' },
        { startLine: 67, endLine: 70, color: 'emerald', label: 'one undo reverses both inserts atomically' },
      ],
      connections: [{ fromLine: 44, toLine: 41, color: 'violet', label: 'undo reverses in reverse order', type: 'calls' }],
    },
  ],
}
