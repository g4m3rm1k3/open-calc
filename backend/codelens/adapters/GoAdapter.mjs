/**
 * GoAdapter.mjs
 * DAP adapter for Go using Delve (dlv dap).
 *
 * Prerequisites: go, dlv  (go install github.com/go-delve/delve/cmd/dlv@latest)
 * dlv dap communicates via stdio DAP — no compilation step needed,
 * dlv compiles the source itself in debug mode.
 */
import path from 'node:path'
import { promises as fs } from 'node:fs'

export const GoAdapter = {
  lang: 'go',
  ext: '.go',

  /**
   * Write the user's code and a go.mod, return { filePath, command, args }.
   * DAPSession.run() calls this before spawning the child.
   */
  async setup(tmpDir, code) {
    const filePath = path.join(tmpDir, 'main.go')
    await fs.writeFile(filePath, code, 'utf8')

    // Write a minimal go.mod so dlv can treat the dir as a module
    const goMod = 'module codelens_scratch\n\ngo 1.21\n'
    await fs.writeFile(path.join(tmpDir, 'go.mod'), goMod, 'utf8')

    return {
      filePath,
      command: 'dlv',
      args: ['dap', '--listen=:0', '--log=false'],
    }
  },

  /**
   * Build the DAP 'launch' request body for Go.
   */
  buildLaunchArgs(tmpDir, _sourceFile) {
    return {
      request: 'launch',
      mode: 'debug',
      program: tmpDir,
      stopOnEntry: true,
      hideSystemGoroutines: true,
      logDest: 'stderr',
      // Capture stdout/stderr from the target program
      outputMode: 'remote',
    }
  },
}
