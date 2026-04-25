import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const version = process.argv[2]
const assetPathArg = process.argv[3]
const releaseBaseUrl = process.argv[4]

if (!version || !assetPathArg || !releaseBaseUrl) {
  console.error('Usage: node scripts/build-github-release-manifest.mjs <version> <assetPath> <releaseBaseUrl>')
  process.exit(1)
}

const assetPath = path.resolve(assetPathArg)
const fileBuffer = await fs.readFile(assetPath)
const stat = await fs.stat(assetPath)
const sha256 = createHash('sha256').update(fileBuffer).digest('hex')
const filename = path.basename(assetPath)
const releaseTag = `v${version}`

const manifest = {
  channel: 'stable',
  version,
  publishedAt: new Date().toISOString(),
  notesUrl: `${releaseBaseUrl}/tag/${releaseTag}`,
  assets: {
    windowsPortableZip: {
      url: `${releaseBaseUrl}/download/${releaseTag}/${filename}`,
      sha256,
      size: stat.size,
    },
  },
}

process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`)
