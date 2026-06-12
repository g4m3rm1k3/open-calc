/**
 * toolcheck.mjs
 * Checks which native language toolchains are installed on the host machine.
 * Used by GET /api/codelens/tools.
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const IS_WIN = process.platform === 'win32'

/**
 * Try to run `cmd versionFlag` and return { ok, version }.
 * Silently returns { ok: false, version: null } if not found.
 */
async function checkBinary(cmd, versionFlag = '--version') {
  try {
    const { stdout, stderr } = await execFileAsync(
      cmd,
      [versionFlag],
      { timeout: 5000, windowsHide: true },
    )
    const raw = (stdout || stderr || '').split('\n')[0].trim()
    // Extract a semver-ish version string
    const match = raw.match(/(\d+\.\d+[\.\d]*)/)
    return { ok: true, version: match ? match[1] : raw.slice(0, 40) }
  } catch {
    return { ok: false, version: null }
  }
}

export async function checkTools() {
  const [go, dlv, gpp, gcc, rustc, cargoRes] = await Promise.all([
    checkBinary('go',    'version'),
    checkBinary('dlv',   'version'),
    checkBinary(IS_WIN ? 'g++' : 'g++', '--version'),
    checkBinary('gcc',   '--version'),
    checkBinary('rustc', '--version'),
    checkBinary('cargo', '--version'),
  ])

  return {
    go,
    dlv,
    gpp: gpp.ok ? gpp : gcc, // g++ or gcc as fallback
    rustc,
    cargo: cargoRes,
  }
}
