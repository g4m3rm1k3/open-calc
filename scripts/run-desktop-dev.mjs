import { spawn } from 'node:child_process'

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const electronExecutable = process.platform === 'win32'
  ? '.\\node_modules\\.bin\\electron.cmd'
  : './node_modules/.bin/electron'

const devProcess = spawn(npmCmd, ['run', 'dev'], {
  stdio: 'inherit',
})

const electronProcess = spawn(electronExecutable, ['desktop/app'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    OPEN_CALC_UPDATE_MANIFEST_URL: process.env.OPEN_CALC_UPDATE_MANIFEST_URL ?? '',
  },
})

const shutdown = () => {
  if (!devProcess.killed) devProcess.kill()
  if (!electronProcess.killed) electronProcess.kill()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

electronProcess.on('exit', (code) => {
  shutdown()
  process.exit(code ?? 0)
})
