import { createServer } from 'node:http'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const args = new Set(process.argv.slice(2))
const host = args.has('--host-lan') ? '0.0.0.0' : (readOption('--host') ?? process.env.OPEN_CALC_BACKEND_HOST ?? '127.0.0.1')
const port = Number(readOption('--port') ?? process.env.OPEN_CALC_BACKEND_PORT ?? 4318)
const repoRoot = path.resolve(process.cwd())
const distDir = path.join(repoRoot, 'dist')
const dataDir = resolveDataDir()
const overridesDir = path.join(dataDir, 'overrides', 'lessons')
const configPath = path.join(dataDir, 'config.json')
const updateCachePath = path.join(dataDir, 'cache', 'update-manifest.json')

await ensureDirectory(path.dirname(configPath))
await ensureDirectory(path.dirname(updateCachePath))
await ensureDirectory(overridesDir)

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
