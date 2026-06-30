// Copies version, productName, and author from the root package.json into
// desktop/app/package.json so both stay in sync without manual edits.
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const rootPkg  = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'))
const deskPath = path.join(root, 'desktop/app/package.json')
const deskPkg  = JSON.parse(await fs.readFile(deskPath, 'utf8'))

const synced = {
  ...deskPkg,
  version:     rootPkg.version,
  productName: rootPkg.build?.productName ?? deskPkg.productName,
  description: rootPkg.description ?? deskPkg.description,
  author:      rootPkg.author ?? deskPkg.author,
  license:     rootPkg.license ?? deskPkg.license,
}

await fs.writeFile(deskPath, JSON.stringify(synced, null, 2) + '\n', 'utf8')
console.log(`desktop/app/package.json synced → version ${synced.version}`)
