const KEY = 'oc-notebook-lab'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') } catch { return {} }
}
function save(db) {
  localStorage.setItem(KEY, JSON.stringify(db))
}

export function listNotebooks() {
  const db = load()
  return Object.values(db).sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getNotebook(id) {
  return load()[id] ?? null
}

export function saveNotebook(notebook) {
  const db = load()
  db[notebook.id] = { ...notebook, updatedAt: Date.now() }
  save(db)
  return db[notebook.id]
}

export function deleteNotebook(id) {
  const db = load()
  delete db[id]
  save(db)
}

export function createNotebook(name = 'Untitled Notebook') {
  const id = `nb-${Date.now()}`
  const nb = {
    id,
    name,
    cells: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  saveNotebook(nb)
  return nb
}
