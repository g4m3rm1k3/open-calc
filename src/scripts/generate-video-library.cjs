const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const seedPath = path.join(ROOT, 'reports', 'video-library-seed.json');
const outDir = path.join(ROOT, 'src', 'content', 'videos');
const outPath = path.join(outDir, 'videoLibrary.generated.js');

function toKeywords(text = '') {
  const stop = new Set(['the', 'and', 'for', 'with', 'from', 'into', 'that', 'this', 'your', 'how', 'why', 'are', 'all', 'part', 'review']);
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => w.length > 2)
    .filter((w) => !stop.has(w));
}

function run() {
  if (!fs.existsSync(seedPath)) {
    throw new Error(`Seed file not found: ${seedPath}`);
  }

  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  const cleaned = seed.map((v, idx) => ({
    id: v.id || `vid-${idx + 1}`,
    title: v.title || null,
    url: v.url,
    source: v.source || 'unknown',
    tags: Array.isArray(v.tags) ? v.tags : [],
    keywords: Array.from(new Set([...(Array.isArray(v.tags) ? v.tags : []), ...toKeywords(v.title)])),
  })).filter((v) => !!v.url);

  const moduleText = `// AUTO-GENERATED. Do not hand edit.\n// Source: reports/video-library-seed.json\n\nexport const VIDEO_LIBRARY = ${JSON.stringify(cleaned, null, 2)}\n`;

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, moduleText);

  console.log(`Wrote ${outPath}`);
  console.log(`Videos: ${cleaned.length}`);
}

run();
