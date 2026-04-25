import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { spawn } from 'node:child_process'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = !app.isPackaged
const backendPort = Number(process.env.OPEN_CALC_BACKEND_PORT ?? 4318)
const backendBaseUrl = `http://127.0.0.1:${backendPort}`
const updateManifestUrl = process.env.OPEN_CALC_UPDATE_MANIFEST_URL ?? ''

let mainWindow = null
let backendProcess = null

app.whenReady().then(async () => {
  await startBackend()
  await waitForBackend()
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('before-quit', () => {
  stopBackend()
})

ipcMain.handle('desktop:get-runtime-info', async () => ({
  isDesktop: true,
  isPackaged: app.isPackaged,
  version: app.getVersion(),
  backendBaseUrl,
  updateManifestUrl,
}))

ipcMain.handle('desktop:check-for-updates', async () => {
  if (!updateManifestUrl) {
    return { ok: false, reason: 'No update manifest URL configured' }
  }

  const response = await fetch(updateManifestUrl)
  if (!response.ok) {
    return { ok: false, reason: `Update manifest request failed with ${response.status}` }
  }

  const manifest = await response.json()
  const currentVersion = app.getVersion()
  return {
    ok: true,
    currentVersion,
    manifest,
    updateAvailable: isVersionNewer(manifest.version, currentVersion),
  }
})

ipcMain.handle('desktop:download-portable-update', async (_event, assetUrl) => {
  if (!assetUrl) {
    return { ok: false, reason: 'Missing asset URL' }
  }

  const response = await fetch(assetUrl)
  if (!response.ok) {
    return { ok: false, reason: `Download failed with ${response.status}` }
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  const downloadsDir = path.join(os.homedir(), 'Downloads')
  await fs.mkdir(downloadsDir, { recursive: true })
  const filename = path.basename(new URL(assetUrl).pathname)
  const outputPath = path.join(downloadsDir, filename)
  await fs.writeFile(outputPath, buffer)
  await shell.showItemInFolder(outputPath)

  return { ok: true, outputPath }
})

ipcMain.handle('desktop:open-external', async (_event, url) => {
  if (!url) return { ok: false }
  await shell.openExternal(url)
  return { ok: true }
})

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1480,
    height: 940,
    minWidth: 1100,
    minHeight: 720,
    show: false,
    backgroundColor: '#07111e',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.loadURL(backendBaseUrl)
}

async function startBackend() {
  const nodeExecutable = process.execPath
  const backendEntry = resolveBackendEntry()
  const distDir = resolveDesktopDistDir()
  const env = {
    ...process.env,
    OPEN_CALC_BACKEND_HOST: '127.0.0.1',
    OPEN_CALC_BACKEND_PORT: String(backendPort),
    OPEN_CALC_DIST_DIR: distDir,
    OPEN_CALC_RUNTIME_ROOT: resolveRuntimeRoot(),
  }

  backendProcess = spawn(nodeExecutable, [backendEntry], {
    cwd: resolveRuntimeRoot(),
    env,
    stdio: 'ignore',
    windowsHide: true,
  })

  backendProcess.on('exit', () => {
    backendProcess = null
  })
}

function stopBackend() {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill()
  }
}

async function waitForBackend(timeoutMs = 15000) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`${backendBaseUrl}/api/health`)
      if (response.ok) return
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
  }

  dialog.showErrorBox(
    'open-calc backend failed to start',
    'The desktop app could not start its local backend companion.'
  )
}

function resolveBackendEntry() {
  if (isDev) {
    return path.resolve(__dirname, '..', '..', 'backend', 'server.mjs')
  }
  return path.join(process.resourcesPath, 'backend', 'server.mjs')
}

function resolveDesktopDistDir() {
  if (isDev) {
    return path.resolve(__dirname, '..', '..', 'dist')
  }
  return path.join(process.resourcesPath, 'dist')
}

function resolveRuntimeRoot() {
  if (isDev) {
    return path.resolve(__dirname, '..', '..')
  }
  return process.resourcesPath
}

function isVersionNewer(candidate, current) {
  const candidateParts = String(candidate || '').split('.').map(Number)
  const currentParts = String(current || '').split('.').map(Number)
  const maxLength = Math.max(candidateParts.length, currentParts.length)

  for (let index = 0; index < maxLength; index += 1) {
    const candidateValue = candidateParts[index] || 0
    const currentValue = currentParts[index] || 0
    if (candidateValue > currentValue) return true
    if (candidateValue < currentValue) return false
  }

  return false
}
