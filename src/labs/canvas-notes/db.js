import { openDB } from 'idb'

const DB_NAME = 'canvas-notes'
const DB_VERSION = 1

// Two stores, not one, because they change at very different rates and
// scopes: `sections` holds the notebook's structure (titles, ordering,
// which pages belong to which section) — small, rarely written, always
// read as a whole. `pages` holds each page's actual drawable content
// (canvasJSON, potentially large once pasted images are in the mix) —
// keyed by page id specifically so an autosave only ever rewrites the
// ONE page that actually changed, never the whole notebook.
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

// Export the entire notebook as a plain-JS object — the caller can
// JSON.stringify it and offer it for download as a .json backup.
export async function exportAll() {
  const db = await getDB()
  const sections = await db.getAll('sections')
  const pages = await db.getAll('pages')
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    sections,
    pages,
  }
}

// Replace the entire notebook contents with the data object returned by
// exportAll (or a compatible structure). Clears both stores first so
// that pages whose ids don't appear in the imported data don't linger.
export async function importAll(data) {
  if (!data || !Array.isArray(data.sections)) throw new Error('Invalid notebook file')
  const db = await getDB()
  const tx = db.transaction(['sections', 'pages'], 'readwrite')
  await tx.objectStore('sections').clear()
  await tx.objectStore('pages').clear()
  for (const s of data.sections ?? []) await tx.objectStore('sections').put(s)
  for (const p of data.pages ?? []) await tx.objectStore('pages').put(p)
  await tx.done
}
