import { openDB } from 'idb'

const DB_NAME = 'canvas-notes'
const DB_VERSION = 1

// Two stores, not one, because they change at very different rates and
// scopes: `sections` holds the notebook's structure (titles, ordering,
// which pages belong to which section) — small, rarely written, always
// read as a whole. `pages` holds each page's actual drawable content
// (canvasJSON, potentially large once Increment 6's pasted images are in
// the mix) — keyed by page id specifically so an autosave only ever
// rewrites the ONE page that actually changed, never the whole notebook.
let dbPromise = null
function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('sections', { keyPath: 'id' })
        db.createObjectStore('pages', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

export async function listSections() {
  const db = await getDB()
  const rows = await db.getAll('sections')
  return rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export async function putSection(section) {
  const db = await getDB()
  return db.put('sections', section)
}

export async function deleteSection(id) {
  const db = await getDB()
  return db.delete('sections', id)
}

export async function getPage(id) {
  const db = await getDB()
  return db.get('pages', id)
}

export async function putPage(id, canvasJSON) {
  const db = await getDB()
  return db.put('pages', { id, canvasJSON })
}

export async function deletePage(id) {
  const db = await getDB()
  return db.delete('pages', id)
}
