import { createServer } from 'node:http'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const args = new Set(process.argv.slice(2))
const host = args.has('--host-lan') ? '0.0.0.0' : (readOption('--host') ?? process.env.OPEN_CALC_BACKEND_HOST ?? '127.0.0.1')
const port = Number(readOption('--port') ?? process.env.OPEN_CALC_BACKEND_PORT ?? 4318)
const runtimeRoot = path.resolve(process.env.OPEN_CALC_RUNTIME_ROOT ?? process.cwd())
const distDir = path.resolve(process.env.OPEN_CALC_DIST_DIR ?? path.join(runtimeRoot, 'dist'))
const dataDir = resolveDataDir()
const overridesDir = path.join(dataDir, 'overrides', 'lessons')
const docsDir = path.join(dataDir, 'docs')
const userDocsDir = path.join(docsDir, 'user')
const docOverridesDir = path.join(docsDir, 'overrides')
const configPath = path.join(dataDir, 'config.json')
const updateCachePath = path.join(dataDir, 'cache', 'update-manifest.json')

await ensureDirectory(path.dirname(configPath))
await ensureDirectory(path.dirname(updateCachePath))
await ensureDirectory(overridesDir)
await ensureDirectory(userDocsDir)
await ensureDirectory(docOverridesDir)

const config = await loadConfig()

const server = createServer(async (request, response) => {
  try {
    applyCors(response)

    if (request.method === 'OPTIONS') {
      response.writeHead(204)
      response.end()
      return
    }

    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? `${host}:${port}`}`)

    if (request.method === 'GET' && url.pathname === '/api/health') {
      return json(response, 200, {
        ok: true,
        host,
        port,
        dataDir,
        distAvailable: await exists(distDir),
      })
    }

    if (request.method === 'GET' && url.pathname === '/api/config') {
      return json(response, 200, {
        host,
        port,
        dataDir,
        overridesDir,
        distDir,
        config,
      })
    }

    if (request.method === 'GET' && url.pathname === '/api/overrides') {
      return json(response, 200, {
        overrides: await listOverrideKeys(),
      })
    }

    if (url.pathname === '/api/lesson-override') {
      return handleLessonOverride(request, response, url)
    }

    if (request.method === 'GET' && url.pathname === '/api/docs') {
      return handleDocsIndex(response)
    }

    if (url.pathname === '/api/docs/user') {
      return handleUserDocs(request, response, url)
    }

    if (url.pathname === '/api/docs/override') {
      return handleDocOverrides(request, response, url)
    }

    if (request.method === 'POST' && url.pathname === '/api/docs/share/import') {
      return handleDocShareImport(request, response)
    }

    if (request.method === 'GET' && url.pathname === '/api/docs/share/export') {
      return handleDocShareExport(response, url)
    }

    if (request.method === 'POST' && url.pathname === '/api/update/check') {
      return handleUpdateCheck(response)
    }

    if (request.method === 'GET') {
      const staticServed = await tryServeStatic(url.pathname, response)
      if (staticServed) {
        return
      }
    }

    json(response, 404, { error: 'Not found' })
  } catch (error) {
    json(response, 500, {
      error: 'Internal server error',
      detail: error instanceof Error ? error.message : String(error),
    })
  }
})

server.listen(port, host, () => {
  console.log(`[open-calc backend] listening on http://${host}:${port}`)
  console.log(`[open-calc backend] data dir: ${dataDir}`)
  console.log(`[open-calc backend] lesson overrides: ${overridesDir}`)
})

async function handleLessonOverride(request, response, url) {
  const lessonKey = url.searchParams.get('key')
  if (!lessonKey) {
    return json(response, 400, { error: 'Missing key query parameter' })
  }

  const overridePath = resolveOverridePath(lessonKey)

  if (request.method === 'GET') {
    const override = await readJsonIfExists(overridePath)
    return json(response, 200, {
      key: lessonKey,
      override,
      source: override ? 'local-override' : 'built-in',
    })
  }

  if (request.method === 'PUT') {
    const payload = await readJsonBody(request)
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return json(response, 400, { error: 'Override body must be a JSON object' })
    }

    await ensureDirectory(path.dirname(overridePath))
    await fs.writeFile(overridePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
    return json(response, 200, {
      ok: true,
      key: lessonKey,
      path: overridePath,
    })
  }

  if (request.method === 'DELETE') {
    await fs.rm(overridePath, { force: true })
    return json(response, 200, { ok: true, key: lessonKey })
  }

  return json(response, 405, { error: 'Method not allowed' })
}

async function handleUpdateCheck(response) {
  if (!config.updateManifestUrl) {
    const cached = await readJsonIfExists(updateCachePath)
    return json(response, 200, {
      updateManifestUrl: null,
      cached,
      checkedAt: new Date().toISOString(),
    })
  }

  const manifestResponse = await fetch(config.updateManifestUrl)
  if (!manifestResponse.ok) {
    return json(response, manifestResponse.status, {
      error: 'Failed to fetch update manifest',
      status: manifestResponse.status,
    })
  }

  const manifest = await manifestResponse.json()
  const payload = {
    checkedAt: new Date().toISOString(),
    updateManifestUrl: config.updateManifestUrl,
    manifest,
  }
  await fs.writeFile(updateCachePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  return json(response, 200, payload)
}

async function handleDocsIndex(response) {
  return json(response, 200, {
    backendAvailable: true,
    userDocs: await listUserDocs(),
    overrideDocs: await listDocOverrides(),
  })
}

async function handleUserDocs(request, response, url) {
  const id = url.searchParams.get('id')

  if (request.method === 'GET') {
    if (!id) {
      return json(response, 200, { docs: await listUserDocs() })
    }
    const doc = await readJsonIfExists(resolveUserDocPath(id))
    if (!doc) {
      return json(response, 404, { error: 'Document not found' })
    }
    return json(response, 200, { doc })
  }

  if (request.method === 'POST') {
    const payload = await readJsonBody(request)
    const idValue = slugify(payload?.name || 'document') || randomId()
    const doc = normalizeUserDoc({
      id: `${idValue}-${randomId(6)}`,
      name: payload?.name || 'Untitled',
      content: payload?.content || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    await writeJson(resolveUserDocPath(doc.id), doc)
    return json(response, 201, { doc })
  }

  if (!id) {
    return json(response, 400, { error: 'Missing id query parameter' })
  }

  if (request.method === 'PUT') {
    const payload = await readJsonBody(request)
    const existing = await readJsonIfExists(resolveUserDocPath(id))
    const now = new Date().toISOString()
    const doc = normalizeUserDoc({
      ...(existing || { id, createdAt: now }),
      ...payload,
      id,
      updatedAt: now,
    })
    await writeJson(resolveUserDocPath(id), doc)
    return json(response, 200, { doc })
  }

  if (request.method === 'DELETE') {
    await fs.rm(resolveUserDocPath(id), { force: true })
    return json(response, 200, { ok: true, id })
  }

  return json(response, 405, { error: 'Method not allowed' })
}

async function handleDocOverrides(request, response, url) {
  const docPath = url.searchParams.get('path')
  if (!docPath) {
    return json(response, 400, { error: 'Missing path query parameter' })
  }

  const overridePath = resolveDocOverridePath(docPath)

  if (request.method === 'GET') {
    const doc = await readJsonIfExists(overridePath)
    return json(response, 200, {
      path: docPath,
      doc,
    })
  }

  if (request.method === 'PUT') {
    const payload = await readJsonBody(request)
    const existing = await readJsonIfExists(overridePath)
    const now = new Date().toISOString()
    const doc = normalizeOverrideDoc({
      ...(existing || { path: docPath, createdAt: now }),
      ...payload,
      path: docPath,
      updatedAt: now,
    })
    await writeJson(overridePath, doc)
    return json(response, 200, { doc })
  }

  if (request.method === 'DELETE') {
    await fs.rm(overridePath, { force: true })
    return json(response, 200, { ok: true, path: docPath })
  }

  return json(response, 405, { error: 'Method not allowed' })
}

async function handleDocShareExport(response, url) {
  const type = url.searchParams.get('type')
  if (type === 'user') {
    const id = url.searchParams.get('id')
    if (!id) return json(response, 400, { error: 'Missing id query parameter' })
    const doc = await readJsonIfExists(resolveUserDocPath(id))
    if (!doc) return json(response, 404, { error: 'Document not found' })
    return json(response, 200, buildSharePack('user', doc))
  }
  if (type === 'override') {
    const docPath = url.searchParams.get('path')
    if (!docPath) return json(response, 400, { error: 'Missing path query parameter' })
    const doc = await readJsonIfExists(resolveDocOverridePath(docPath))
    if (!doc) return json(response, 404, { error: 'Override not found' })
    return json(response, 200, buildSharePack('override', doc))
  }
  return json(response, 400, { error: 'Unknown share export type' })
}

async function handleDocShareImport(request, response) {
  const payload = await readJsonBody(request)
  if (!payload || payload.kind !== 'open-calc-doc-share' || !payload.doc || !payload.docType) {
    return json(response, 400, { error: 'Invalid share pack' })
  }

  const now = new Date().toISOString()
  if (payload.docType === 'user') {
    const imported = normalizeUserDoc({
      ...payload.doc,
      id: `${slugify(payload.doc.name || 'shared-doc') || 'shared-doc'}-${randomId(6)}`,
      importedFromShare: true,
      createdAt: now,
      updatedAt: now,
    })
    await writeJson(resolveUserDocPath(imported.id), imported)
    return json(response, 201, { imported })
  }

  if (payload.docType === 'override') {
    const imported = normalizeOverrideDoc({
      ...payload.doc,
      createdAt: payload.doc.createdAt || now,
      updatedAt: now,
      importedFromShare: true,
    })
    await writeJson(resolveDocOverridePath(imported.path), imported)
    return json(response, 201, { imported })
  }

  return json(response, 400, { error: 'Unsupported share docType' })
}

async function tryServeStatic(pathname, response) {
  const frontendEnabled = config.serveFrontend !== false
  if (!frontendEnabled || !(await exists(distDir))) {
    return false
  }

  const requestedPath = pathname === '/' ? '/index.html' : pathname
  const normalizedPath = requestedPath.startsWith('/') ? requestedPath.slice(1) : requestedPath
  const resolvedPath = safeJoin(distDir, normalizedPath)
  if (!resolvedPath) {
    json(response, 400, { error: 'Invalid static path' })
    return true
  }

  let filePath = resolvedPath
  if (!(await exists(filePath))) {
    filePath = path.join(distDir, 'index.html')
    if (!(await exists(filePath))) {
      return false
    }
  }

  const content = await fs.readFile(filePath)
  response.writeHead(200, {
    'Content-Type': mimeType(path.extname(filePath)),
    'Cache-Control': 'no-cache',
  })
  response.end(content)
  return true
}

async function loadConfig() {
  const defaults = {
    serveFrontend: true,
    updateManifestUrl: '',
  }
  const existing = await readJsonIfExists(configPath)
  if (existing) {
    return { ...defaults, ...existing }
  }
  await fs.writeFile(configPath, `${JSON.stringify(defaults, null, 2)}\n`, 'utf8')
  return defaults
}

async function listOverrideKeys() {
  const results = []
  await walkOverrides(overridesDir, results)
  return results.sort()
}

async function listUserDocs() {
  const docs = []
  const entries = await fs.readdir(userDocsDir, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue
    const doc = await readJsonIfExists(path.join(userDocsDir, entry.name))
    if (doc) docs.push(normalizeUserDoc(doc))
  }
  return docs.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
}

async function listDocOverrides() {
  const docs = []
  const entries = await fs.readdir(docOverridesDir, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue
    const doc = await readJsonIfExists(path.join(docOverridesDir, entry.name))
    if (doc) docs.push(normalizeOverrideDoc(doc))
  }
  return docs.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
}

async function walkOverrides(currentDir, results) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name)
    if (entry.isDirectory()) {
      await walkOverrides(fullPath, results)
      continue
    }
    if (!entry.isFile() || !entry.name.endsWith('.json')) {
      continue
    }
    const relativePath = path.relative(overridesDir, fullPath)
    results.push(relativePath.replaceAll('\\', '/').replace(/\.json$/i, ''))
  }
}

function resolveOverridePath(lessonKey) {
  const normalizedKey = lessonKey.replaceAll('\\', '/').replace(/^\/+/, '')
  const resolved = safeJoin(overridesDir, `${normalizedKey}.json`)
  if (!resolved) {
    throw new Error(`Invalid override key: ${lessonKey}`)
  }
  return resolved
}

function resolveUserDocPath(id) {
  const safeId = slugify(id)
  const resolved = safeJoin(userDocsDir, `${safeId}.json`)
  if (!resolved) {
    throw new Error(`Invalid user doc id: ${id}`)
  }
  return resolved
}

function resolveDocOverridePath(docPath) {
  const safeName = Buffer.from(docPath).toString('base64url')
  const resolved = safeJoin(docOverridesDir, `${safeName}.json`)
  if (!resolved) {
    throw new Error(`Invalid doc override path: ${docPath}`)
  }
  return resolved
}

function resolveDataDir() {
  const envDir = process.env.OPEN_CALC_DATA_DIR
  if (envDir) {
    return path.resolve(envDir)
  }
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA ?? path.join(os.homedir(), 'AppData', 'Roaming'), 'open-calc')
  }
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'open-calc')
  }
  return path.join(process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), '.config'), 'open-calc')
}

function safeJoin(root, unsafeRelativePath) {
  const resolved = path.resolve(root, unsafeRelativePath)
  const rootWithSep = `${path.resolve(root)}${path.sep}`
  if (resolved === path.resolve(root) || resolved.startsWith(rootWithSep)) {
    return resolved
  }
  return null
}

function readOption(flag) {
  const index = process.argv.indexOf(flag)
  if (index === -1) return null
  return process.argv[index + 1] ?? null
}

async function readJsonBody(request) {
  const body = await readBody(request)
  if (!body) return null
  return JSON.parse(body)
}

async function readBody(request) {
  const chunks = []
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks).toString('utf8')
}

async function readJsonIfExists(filePath) {
  if (!(await exists(filePath))) {
    return null
  }
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

async function exists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function ensureDirectory(dirPath) {
  await fs.mkdir(dirPath, { recursive: true })
}

async function writeJson(filePath, payload) {
  await ensureDirectory(path.dirname(filePath))
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
}

function normalizeUserDoc(doc) {
  return {
    id: String(doc.id),
    source: 'user',
    name: doc.name || 'Untitled',
    content: doc.content || '',
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || new Date().toISOString(),
    importedFromShare: Boolean(doc.importedFromShare),
  }
}

function normalizeOverrideDoc(doc) {
  return {
    source: 'override',
    path: String(doc.path),
    name: doc.name || path.basename(String(doc.path)).replace(/\.md$/i, ''),
    content: doc.content || '',
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || new Date().toISOString(),
    importedFromShare: Boolean(doc.importedFromShare),
  }
}

function buildSharePack(docType, doc) {
  return {
    kind: 'open-calc-doc-share',
    version: 1,
    docType,
    exportedAt: new Date().toISOString(),
    doc,
  }
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function randomId(length = 10) {
  return Math.random().toString(36).slice(2, 2 + length)
}

function applyCors(response) {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function json(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-cache',
  })
  response.end(`${JSON.stringify(payload, null, 2)}\n`)
}

function mimeType(extension) {
  switch (extension.toLowerCase()) {
    case '.html':
      return 'text/html; charset=utf-8'
    case '.js':
      return 'application/javascript; charset=utf-8'
    case '.css':
      return 'text/css; charset=utf-8'
    case '.json':
      return 'application/json; charset=utf-8'
    case '.svg':
      return 'image/svg+xml'
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.ico':
      return 'image/x-icon'
    default:
      return 'application/octet-stream'
  }
}
