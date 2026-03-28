// strip-video-embeds.mjs
// Removes all VideoEmbed visualization entries from every content lesson file.
// VideoEmbed entries live in visualizations arrays like:
//   { id: 'VideoEmbed', title: '...', props: { url: '...' } }
// Safe to re-run. Reports counts per file.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.resolve(__dirname, '../src/content');

// Recursively find all .js files (excluding index.js and registry files)
function findLessonFiles(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findLessonFiles(full, results);
    } else if (
      entry.isFile() &&
      entry.name.endsWith('.js') &&
      !['index.js', 'algebraRegistry.js', 'courses.js', 'learningPaths.js', 'reference-data.js'].includes(entry.name)
    ) {
      results.push(full);
    }
  }
  return results;
}

// Remove VideoEmbed object blocks from source text.
// Strategy: use a state machine to find and extract { id: 'VideoEmbed', ... } object literals.
function stripVideoEmbeds(src) {
  let result = '';
  let i = 0;
  let removedCount = 0;

  while (i < src.length) {
    // Look for the pattern:  {  (whitespace)  id:  (whitespace)  'VideoEmbed'
    const marker = src.indexOf("id: 'VideoEmbed'", i);
    if (marker === -1) {
      result += src.slice(i);
      break;
    }

    // Walk backwards to find the opening { of this object
    let openBrace = marker - 1;
    while (openBrace >= 0 && /\s/.test(src[openBrace])) openBrace--;
    if (src[openBrace] !== '{') {
      // Not a plain object literal start — skip this occurrence
      result += src.slice(i, marker + 1);
      i = marker + 1;
      continue;
    }

    // Also check for "id: \"VideoEmbed\"" (double quotes)
    // (handled by a second pass below)

    // Walk forward from openBrace to find the matching closing }
    let depth = 1;
    let j = openBrace + 1;
    while (j < src.length && depth > 0) {
      if (src[j] === '{') depth++;
      else if (src[j] === '}') depth--;
      j++;
    }
    // j now points just past the closing }

    // Capture what came before the opening brace — keep everything up to but not including
    // the { character, then eat any trailing comma and newline
    const before = src.slice(i, openBrace);
    result += before;

    // Skip the entire object + optional trailing comma + whitespace/newline
    let after = j;
    while (after < src.length && src[after] === ',') after++;
    // eat the newline after the comma too
    if (after < src.length && src[after] === '\n') after++;
    else if (after < src.length && src[after] === '\r' && src[after + 1] === '\n') after += 2;

    i = after;
    removedCount++;
  }

  // Second pass: handle double-quote variant  id: "VideoEmbed"
  let result2 = '';
  let i2 = 0;
  while (i2 < result.length) {
    const marker2 = result.indexOf('id: "VideoEmbed"', i2);
    if (marker2 === -1) {
      result2 += result.slice(i2);
      break;
    }
    let openBrace2 = marker2 - 1;
    while (openBrace2 >= 0 && /\s/.test(result[openBrace2])) openBrace2--;
    if (result[openBrace2] !== '{') {
      result2 += result.slice(i2, marker2 + 1);
      i2 = marker2 + 1;
      continue;
    }
    let depth2 = 1;
    let j2 = openBrace2 + 1;
    while (j2 < result.length && depth2 > 0) {
      if (result[j2] === '{') depth2++;
      else if (result[j2] === '}') depth2--;
      j2++;
    }
    const before2 = result.slice(i2, openBrace2);
    result2 += before2;
    let after2 = j2;
    while (after2 < result.length && result[after2] === ',') after2++;
    if (after2 < result.length && result[after2] === '\n') after2++;
    else if (after2 < result.length && result[after2] === '\r' && result[after2 + 1] === '\n') after2 += 2;
    i2 = after2;
    removedCount++;
  }

  return { cleaned: result2, count: removedCount };
}

// Also strip previewVisualizationId if it points to VideoEmbed
function stripVideoPreview(src) {
  // previewVisualizationId: 'VideoEmbed' or "VideoEmbed"
  return src
    .replace(/previewVisualizationId:\s*['"]VideoEmbed['"]\s*,?\s*\n?/g, '')
    .replace(/previewVisualizationId:\s*['"]VideoEmbed['"]\s*,?\s*\r\n?/g, '');
}

const files = findLessonFiles(contentDir);
let totalRemoved = 0;
let filesChanged = 0;

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  if (!original.includes("VideoEmbed")) continue;

  const { cleaned, count } = stripVideoEmbeds(original);
  const final = stripVideoPreview(cleaned);

  if (final !== original) {
    fs.writeFileSync(file, final, 'utf8');
    const rel = path.relative(contentDir, file);
    console.log(`  ✅ ${rel} — removed ${count} VideoEmbed entry/entries`);
    totalRemoved += count;
    filesChanged++;
  }
}

console.log(`\n✅ Done: removed ${totalRemoved} VideoEmbed entries across ${filesChanged} files.`);
