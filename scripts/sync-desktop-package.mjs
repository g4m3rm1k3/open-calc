import { promises as fs } from 'node:fs'
import path from 'node:path'

const rootPackagePath = path.resolve('package.json')
const desktopBasePackagePath = path.resolve('desktop', 'app', 'package.base.json')
const desktopPackagePath = path.resolve('desktop', 'app', 'package.json')

const rootPackage = JSON.parse(await fs.readFile(rootPackagePath, 'utf8'))
const desktopBasePackage = JSON.parse(await fs.readFile(desktopBasePackagePath, 'utf8'))

const desktopPackage = {
  ...desktopBasePackage,
  version: rootPackage.version,
}

await fs.writeFile(desktopPackagePath, `${JSON.stringify(desktopPackage, null, 2)}\n`, 'utf8')
