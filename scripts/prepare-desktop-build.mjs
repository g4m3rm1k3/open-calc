import { promises as fs } from 'node:fs'
import path from 'node:path'

const rootDir = path.resolve()
const stagingDir = path.join(rootDir, 'desktop', 'staging')
const stagingAppDir = path.join(stagingDir, 'app')
const rootPackagePath = path.join(rootDir, 'package.json')
const desktopPackagePath = path.join(rootDir, 'desktop', 'app', 'package.json')
const electronPackagePath = path.join(rootDir, 'node_modules', 'electron', 'package.json')

await fs.rm(stagingDir, { recursive: true, force: true })
await fs.mkdir(stagingAppDir, { recursive: true })

await copyIntoStage('desktop/app/main.mjs', 'app/main.mjs')
await copyIntoStage('desktop/app/preload.mjs', 'app/preload.mjs')
await copyIntoStage('desktop/app/package.json', 'app/package.json')
await copyIntoStage('dist', 'dist')

const rootPackage = JSON.parse(await fs.readFile(rootPackagePath, 'utf8'))
const desktopPackage = JSON.parse(await fs.readFile(desktopPackagePath, 'utf8'))
const electronPackage = JSON.parse(await fs.readFile(electronPackagePath, 'utf8'))

const builderPackage = {
  name: desktopPackage.name,
  version: rootPackage.version,
  description: desktopPackage.description,
  private: true,
  build: {
    appId: 'org.opencalc.desktop',
    productName: 'open-calc',
    electronVersion: electronPackage.version,
    npmRebuild: false,
    nodeGypRebuild: false,
    compression: 'normal',
    directories: {
      app: 'app',
      output: 'release',
    },
    files: ['**/*'],
    extraResources: [
      {
        from: 'dist',
        to: 'dist',
      },
    ],
    win: {
      target: [
        {
          target: 'portable',
          arch: ['x64'],
        },
      ],
    },
  },
}

await fs.writeFile(
  path.join(stagingDir, 'package.json'),
  `${JSON.stringify(builderPackage, null, 2)}\n`,
  'utf8'
)

async function copyIntoStage(fromRelative, toRelative) {
  await fs.cp(path.join(rootDir, fromRelative), path.join(stagingDir, toRelative), { recursive: true })
}
