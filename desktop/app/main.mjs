import { app, BrowserWindow, dialog, ipcMain, shell, protocol, net } from 'electron'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = !app.isPackaged
const updateManifestUrl = process.env.OPEN_CALC_UPDATE_MANIFEST_URL ?? ''

// Register custom scheme before app is ready — required by Electron
protocol.registerSchemesAsPrivileged([
  { scheme: 'opencalc', privileges: { secure: true, standard: true, supportFetchAPI: true, corsEnabled: true } },
])

// Give the V8 heap room to breathe without letting it consume all RAM.
// WebLLM and Pyodide are both memory-heavy; 4 GB is a safe ceiling on
// most modern machines while still leaving headroom for the OS.
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=4096')

// Some integrated GPUs fail on certain D3D/Vulkan paths. Letting Electron
// pick the best available renderer avoids hard GPU crashes on low-end PCs.
app.commandLine.appendSwitch('ignore-gpu-blocklist')
app.commandLine.appendSwitch('enable-gpu-rasterization')

let mainWindow = null

app.whenReady().then(() => {
  // Serve the built dist/ through a custom scheme so file:// security
  // restrictions never apply, regardless of where the portable exe extracts.
  protocol.handle('opencalc', (request) => {
    const url = new URL(request.url)
    // Strip leading slash so path.join works correctly on Windows
    const relative = url.pathname.replace(/^\//, '')
    const filePath = path.join(resolveDistDir(), relative || 'index.html')
    return net.fetch(`file:///${filePath.replace(/\\/g, '/')}`)
  })

  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

ipcMain.handle('desktop:get-runtime-info', async () => ({
  isDesktop: true,
  isPackaged: app.isPackaged,
  version: app.getVersion(),
  updateManifestUrl,
}))

ipcMain.handle('desktop:check-for-updates', async () => {
  if (!updateManifestUrl) return { ok: false, reason: 'No update manifest URL configured' }
  try {
    const response = await fetch(updateManifestUrl)
    if (!response.ok) return { ok: false, reason: `Manifest request failed: ${response.status}` }
    const manifest = await response.json()
    const currentVersion = app.getVersion()
    return { ok: true, currentVersion, manifest, updateAvailable: isVersionNewer(manifest.version, currentVersion) }
  } catch (e) {
    return { ok: false, reason: String(e) }
  }
})

ipcMain.handle('desktop:download-portable-update', async (_event, assetUrl) => {
  if (!assetUrl) return { ok: false, reason: 'Missing asset URL' }
  try {
    const response = await fetch(assetUrl)
    if (!response.ok) return { ok: false, reason: `Download failed: ${response.status}` }
    const buffer = Buffer.from(await response.arrayBuffer())
    const downloadsDir = path.join(os.homedir(), 'Downloads')
    await fs.mkdir(downloadsDir, { recursive: true })
    const filename = path.basename(new URL(assetUrl).pathname)
    const outputPath = path.join(downloadsDir, filename)
    await fs.writeFile(outputPath, buffer)
    await shell.showItemInFolder(outputPath)
    return { ok: true, outputPath }
  } catch (e) {
    return { ok: false, reason: String(e) }
  }
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
      // Allow WebAssembly (needed by Pyodide) and WebGL (Three.js / D3)
      webSecurity: true,
    },
  })

  mainWindow.once('ready-to-show', () => mainWindow?.show())

  // If the renderer process crashes (OOM, GPU fault, etc.) show a recovery
  // dialog rather than silently leaving the user with a blank window.
  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    if (details.reason === 'clean-exit') return
    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: 'error',
      title: 'OpenCalc stopped responding',
      message: 'The app ran into a problem and needs to restart.',
      detail: `Reason: ${details.reason}\n\nTip: if this keeps happening, try closing other apps to free up memory — the AI Tutor and Python sandbox are memory-intensive features.`,
      buttons: ['Restart', 'Quit'],
      defaultId: 0,
    })
    if (choice === 0) {
      app.relaunch()
    }
    app.quit()
  })

  // Catch a frozen (but not yet crashed) renderer and offer to restart.
  mainWindow.on('unresponsive', () => {
    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: 'warning',
      title: 'OpenCalc is not responding',
      message: 'The app is not responding. This can happen when loading large AI models or running heavy Python computations.',
      buttons: ['Wait', 'Restart'],
      defaultId: 0,
    })
    if (choice === 1) {
      app.relaunch()
      app.quit()
    }
  })

  if (isDev) {
    const devPort = process.env.VITE_PORT ?? 5173
    mainWindow.loadURL(`http://localhost:${devPort}`)
  } else {
    mainWindow.loadURL('opencalc://app/index.html')
  }
}

function resolveDistDir() {
  if (isDev) return path.resolve(__dirname, '..', '..', 'dist')
  return path.join(process.resourcesPath, 'dist')
}

function isVersionNewer(candidate, current) {
  const a = String(candidate || '').split('.').map(Number)
  const b = String(current || '').split('.').map(Number)
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] || 0) > (b[i] || 0)) return true
    if ((a[i] || 0) < (b[i] || 0)) return false
  }
  return false
}
