#!/usr/bin/env node
/**
 * migrate-family-b.mjs
 * Transforms Family B lessons (export default + object hook + intuition + viz, no code blocks)
 * into the new export const lesson = { sections: [{ blocks: [] }] } format.
 *
 * Usage:
 *   node scripts/migrate-family-b.mjs src/content/ocean-1          # whole directory
 *   node scripts/migrate-family-b.mjs src/content/ocean-1/ocean-001-the-water.js  # single file
 *
 * Output goes to src/content/lessons/{course}/{N}-{chapter}/{NNN}-{slug}.js
 * Original files are NOT deleted until you're happy.
 */

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import vm from 'vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Load a lesson file by evaluating it in a sandbox ─────────────────────────

function loadLesson(filePath) {
  let src = fs.readFileSync(filePath, 'utf8');

  // Pattern: export const lesson = { ... }
  src = src.replace(/^\s*export\s+const\s+lesson\s*=\s*/m, '__lesson = ');

  // Pattern: export default { ... } (inline object)
  src = src.replace(/^\s*export\s+default\s+\{/, '__lesson = {');

  // Pattern: const foo = { ... }; export default foo  (variable ref at end)
  const varRef = src.match(/export\s+default\s+(\w+)\s*;?\s*$/m);
  if (varRef) {
    const v = varRef[1];
    src = src.replace(/export\s+default\s+\w+\s*;?\s*$/m, `__lesson = ${v}`);
  }

  // Strip any remaining export keywords (safety net)
  src = src.replace(/^export\s+/gm, '');

  const sandbox = { __lesson: null };
  try {
    vm.runInNewContext(src, sandbox);
  } catch (e) {
    console.error(`  ✗ Could not parse ${path.basename(filePath)}: ${e.message}`);
    return null;
  }
  return sandbox.__lesson;
}

// ── Serialise a value back to JS source ──────────────────────────────────────

function serialize(val, indent = 0) {
  const pad  = '  '.repeat(indent);
  const pad1 = '  '.repeat(indent + 1);

  if (val === null)      return 'null';
  if (val === undefined) return 'undefined';

  if (typeof val === 'string') {
    // Use backtick for multi-line strings, single-quotes for short ones
    if (val.includes('\n') || val.length > 80) {
      const escaped = val.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
      return '`' + escaped + '`';
    }
    return JSON.stringify(val);
  }

  if (typeof val === 'number' || typeof val === 'boolean') return String(val);

  if (Array.isArray(val)) {
    if (val.length === 0) return '[]';
    const items = val.map(v => pad1 + serialize(v, indent + 1));
    return '[\n' + items.join(',\n') + ',\n' + pad + ']';
  }

  if (typeof val === 'object') {
    const entries = Object.entries(val).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return '{}';
    const lines = entries.map(([k, v]) => {
      const key = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
      return pad1 + key + ': ' + serialize(v, indent + 1);
    });
    return '{\n' + lines.join(',\n') + ',\n' + pad + '}';
  }

  return String(val);
}

// ── Fields to drop (derived from folder structure or not used by renderer) ────

const DROP_FIELDS = new Set([
  'chapter', 'order', 'aliases', 'timeToComplete', 'coreConcept',
  'prerequisites', 'nextLesson', 'semantics',
]);

// ── Build blocks from intuition ───────────────────────────────────────────────
// Places items in this order within one section:
//   prose paragraphs → callouts → visualizations
// The user can then go in and reorder blocks however they like.

function intuitionToBlocks(intuition) {
  const blocks = [];

  // Prose
  for (const text of intuition.prose ?? []) {
    blocks.push({ type: 'prose', text });
  }

  // Callouts
  for (const c of intuition.callouts ?? []) {
    blocks.push({
      type:    'callout',
      variant: c.type ?? 'insight',
      title:   c.title,
      body:    c.body,
    });
  }

  // Inline visualizations (inside intuition)
  for (const v of intuition.visualizations ?? []) {
    const block = { type: 'viz', id: v.id };
    if (v.title)        block.title   = v.title;
    if (v.caption)      block.caption = v.caption;
    if (v.mathBridge)   block.caption = v.mathBridge; // mathBridge → caption
    if (v.props)        block.props   = v.props;
    if (v.initialProps) block.props   = v.initialProps;
    blocks.push(block);
  }

  return blocks;
}

// ── Top-level visualizations (if lesson has them outside intuition) ───────────

function topLevelVizToSection(vizArr) {
  if (!vizArr?.length) return null;
  const blocks = vizArr.map(v => {
    const block = { type: 'viz', id: v.id };
    if (v.title)      block.title   = v.title;
    if (v.caption)    block.caption = v.caption;
    if (v.mathBridge) block.caption = v.mathBridge;
    if (v.props)      block.props   = v.props;
    return block;
  });
  return { blocks };
}

// ── Transform one lesson object → new format ──────────────────────────────────

function transform(lesson) {
  const out = {};

  // Identity fields — copy directly
  for (const f of ['id', 'slug', 'title', 'subtitle', 'tags']) {
    if (lesson[f] !== undefined) out[f] = lesson[f];
  }

  // Merge aliases into tags
  if (lesson.aliases) {
    const extra = lesson.aliases.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
    out.tags = [...new Set([...(out.tags ?? []), ...extra])];
  }

  // Hook — normalise string → object
  if (lesson.hook) {
    if (typeof lesson.hook === 'string') {
      out.hook = { question: lesson.hook };
    } else {
      out.hook = lesson.hook;
    }
  }

  // Sections — built from intuition
  const sections = [];

  if (lesson.intuition) {
    const blocks = intuitionToBlocks(lesson.intuition);
    if (blocks.length) sections.push({ blocks });
  }

  // mentalModel — becomes its own section
  if (lesson.mentalModel?.length) {
    sections.push({
      heading: 'Key ideas',
      blocks: lesson.mentalModel.map(text => ({ type: 'prose', text })),
    });
  }

  // applications / walkthroughs / discovery / story — each becomes a section
  for (const [field, heading] of [
    ['applications',  'Applications'],
    ['walkthroughs',  'Walkthroughs'],
    ['discovery',     'Exploration'],
    ['story',         'Context'],
  ]) {
    const val = lesson[field];
    if (!val) continue;
    const prose = Array.isArray(val) ? val : val.prose ?? [String(val)];
    sections.push({
      heading,
      blocks: prose.map(text => ({ type: 'prose', text })),
    });
  }

  // Top-level visualizations
  const topViz = topLevelVizToSection(lesson.visualizations);
  if (topViz) sections.push(topViz);

  if (sections.length) out.sections = sections;

  // Examples, challenges, quiz, definitions, crossRefs — copy directly
  for (const f of ['examples', 'challenges', 'quiz', 'definitions', 'crossRefs']) {
    if (lesson[f]?.length) out[f] = lesson[f];
  }

  return out;
}

// ── Derive output path ────────────────────────────────────────────────────────
// Input:  src/content/ocean-1/ocean-001-the-water.js
// Output: src/content/lessons/ocean-1/1-ocean-1/001-the-water.js

function deriveOutputPath(inputPath, courseDir) {
  const courseName = path.basename(courseDir);
  const filename   = path.basename(inputPath);

  // Extract the 3-digit lesson number from anywhere in the filename
  // handles: sim1-001-slug.js, ocean-001-slug.js, 001-slug.js
  const numMatch = filename.match(/(?:^|-)(\d{3})-(.+)\.js$/);

  let outFile;
  if (numMatch) {
    const num  = numMatch[1];
    const slug = numMatch[2];
    outFile = `${num}-${slug}.js`;
  } else {
    outFile = filename; // fallback: keep name
  }

  const outDir = path.join(ROOT, 'src/content/lessons', courseName, `1-${courseName}`);
  return path.join(outDir, outFile);
}

// ── Generate the output file text ─────────────────────────────────────────────

function generateSource(lesson) {
  return `export const lesson = ${serialize(lesson, 0)}\n`;
}

// ── Process one file ──────────────────────────────────────────────────────────

function processFile(inputPath, courseDir) {
  const raw = loadLesson(inputPath);
  if (!raw) return false;

  const transformed = transform(raw);
  const source      = generateSource(transformed);
  const outputPath  = deriveOutputPath(inputPath, courseDir);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, source);
  console.log(`  ✓ ${path.relative(ROOT, inputPath)}`);
  console.log(`    → ${path.relative(ROOT, outputPath)}`);
  return true;
}

// ── Entry point ───────────────────────────────────────────────────────────────

const target = process.argv[2];
if (!target) {
  console.error('Usage: node scripts/migrate-family-b.mjs <file-or-directory>');
  process.exit(1);
}

const absTarget = path.resolve(ROOT, target);

if (fs.statSync(absTarget).isDirectory()) {
  const courseDir = absTarget;
  const files = fs.readdirSync(courseDir)
    .filter(f => f.endsWith('.js') && f !== 'index.js')
    .map(f => path.join(courseDir, f));

  console.log(`\nMigrating ${files.length} files from ${path.basename(courseDir)}...\n`);
  let ok = 0;
  for (const f of files) {
    if (processFile(f, courseDir)) ok++;
  }
  console.log(`\nDone: ${ok}/${files.length} files migrated.`);
} else {
  const courseDir = path.dirname(absTarget);
  processFile(absTarget, courseDir);
}
