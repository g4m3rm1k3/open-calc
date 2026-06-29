#!/usr/bin/env node
// Verifies that lessonToState() -> buildLessonObject() is lossless across
// every real lesson file when NO edits are made — i.e. opening a lesson in
// the Lesson Builder and immediately saving must not change anything.
//
// This can't dynamically import() lesson files directly: many pull in JSX
// and asset (.svg) imports that plain Node can't resolve outside Vite (see
// build-lesson-ids.mjs's note on the same problem). Instead it parses each
// file's AST and evaluates the literal parts of the exported object directly
// — everything literal (strings, numbers, arrays, nested objects) becomes a
// real JS value; anything that requires module resolution (imports, JSX,
// function calls) becomes a stable "opaque" marker that preserves identity
// across the round trip, mirroring the __importRef convention
// lessonSerializer.js itself already uses for the same boundary.
//
// Run: node scripts/check-lesson-roundtrip.mjs

import { parse } from '@babel/parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { lessonToState } from '../src/components/lesson-builder/builderUtils.js';
import { buildLessonObject } from '../src/components/lesson-builder/lessonSerializer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
let opaqueCounter = 0;

function evalNode(node) {
  switch (node.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return node.value;
    case 'NullLiteral':
      return null;
    case 'TemplateLiteral':
      if (node.expressions.length === 0) return node.quasis.map(q => q.value.cooked).join('');
      return { __opaque: true, _id: opaqueCounter++, _kind: 'TemplateLiteral' };
    case 'ArrayExpression':
      return node.elements.map(el => (el === null ? null : evalNode(el)));
    case 'ObjectExpression': {
      const obj = {};
      for (const prop of node.properties) {
        if (prop.type === 'SpreadElement') { obj.__hasSpread = true; continue; }
        if (prop.computed) { obj[`__computed_${opaqueCounter++}`] = evalNode(prop.value); continue; }
        const key = prop.key.type === 'Identifier' ? prop.key.name : prop.key.value;
        obj[key] = prop.value ? evalNode(prop.value) : evalNode(prop.body);
      }
      return obj;
    }
    default:
      return { __opaque: true, _id: opaqueCounter++, _kind: node.type };
  }
}

function getTopLevelObject(code) {
  const ast = parse(code, { sourceType: 'module', plugins: ['jsx'] });
  const consts = new Map();
  let defaultExportObj = null;
  let defaultExportName = null;
  for (const node of ast.program.body) {
    if (node.type === 'VariableDeclaration') {
      for (const decl of node.declarations) {
        if (decl.id?.type === 'Identifier' && decl.init?.type === 'ObjectExpression') consts.set(decl.id.name, decl.init);
      }
    }
    if (node.type === 'ExportDefaultDeclaration') {
      if (node.declaration.type === 'ObjectExpression') defaultExportObj = node.declaration;
      else if (node.declaration.type === 'Identifier') defaultExportName = node.declaration.name;
    }
  }
  const targetObj = defaultExportObj || (defaultExportName && consts.get(defaultExportName)) || [...consts.values()][0];
  return targetObj ? evalNode(targetObj) : null;
}

// Known-safe diffs this check can't fully verify or that are intentional —
// documented here instead of silently filtered, so it's clear why a real
// lesson file showing one of these is NOT a bug:
//
//  - *.blocks[].src — image identifiers resolve through a real import
//    statement; this harness can't execute that, only the AST parses it as
//    an opaque reference. The real serializer (lessonSerializer.js's
//    collectImports/fmtValue) does resolve it correctly.
//  - intuition/rigor .visualizations (whole field, when .blocks is present)
//    — intentional: blocks[] mode supersedes the legacy prose/visualizations
//    shape by design (see the comment in lessonSerializer.js).
//  - *.visualizations[].props when the original was `{}` — explicitly-empty
//    and "field absent" are equivalent; the empty object gets cleaned up.
//  - *.visualizations[].id when ADDED as `undefined` — never reaches the
//    actual saved file: serializeLesson()'s fmtValue() filters out
//    `undefined`/`null` values before generating source text.
function isKnownSafe(pathStr, issue) {
  if (/\.blocks\[\d+\]\.src$/.test(pathStr)) return true;
  if (/\.visualizations$/.test(pathStr) && issue.actual === '<MISSING — field was dropped>') return true;
  if (/\.visualizations\[\d+\]\.props$/.test(pathStr) && issue.actual === '<MISSING — field was dropped>') return true;
  if (/\.visualizations\[\d+\]\.id$/.test(pathStr) && issue.actual?.startsWith('<ADDED: undefined')) return true;
  return false;
}

function diff(original, result, pathStr = '') {
  const issues = [];
  if (original && original.__opaque) {
    if (!result || result._id !== original._id) {
      issues.push({ path: pathStr, expected: `<opaque ${original._kind} #${original._id}>`, actual: result && result.__opaque ? `<opaque ${result._kind} #${result._id}>` : JSON.stringify(result) });
    }
    return issues;
  }
  if (Array.isArray(original)) {
    if (!Array.isArray(result)) return [{ path: pathStr, expected: `array(len=${original.length})`, actual: JSON.stringify(result) }];
    if (original.length !== result.length) issues.push({ path: pathStr, expected: `array(len=${original.length})`, actual: `array(len=${result.length})` });
    const n = Math.max(original.length, result.length);
    for (let i = 0; i < n; i++) issues.push(...diff(original[i], result[i], `${pathStr}[${i}]`));
    return issues;
  }
  if (original && typeof original === 'object') {
    if (!result || typeof result !== 'object') return [{ path: pathStr, expected: 'object', actual: JSON.stringify(result) }];
    const keys = new Set([...Object.keys(original), ...Object.keys(result)]);
    for (const k of keys) {
      if (k === '__hasSpread') continue;
      const inOrig = k in original;
      const inResult = k in result;
      if (inOrig && !inResult) issues.push({ path: `${pathStr}.${k}`, expected: '<present>', actual: '<MISSING — field was dropped>' });
      else if (!inOrig && inResult) issues.push({ path: `${pathStr}.${k}`, expected: '<absent>', actual: `<ADDED: ${String(JSON.stringify(result[k])).slice(0, 80)}>` });
      else issues.push(...diff(original[k], result[k], `${pathStr}.${k}`));
    }
    return issues;
  }
  if (original !== result) issues.push({ path: pathStr, expected: JSON.stringify(original), actual: JSON.stringify(result) });
  return issues;
}

function isDir(p) { try { return fs.statSync(p).isDirectory(); } catch { return false; } }

function discoverLessons() {
  const coursesDir = path.resolve(root, 'src/courses');
  const files = [];
  for (const courseId of fs.readdirSync(coursesDir).filter(n => isDir(path.join(coursesDir, n))).sort()) {
    const courseDir = path.join(coursesDir, courseId);
    const chapterDirs = fs.readdirSync(courseDir).filter(n => /^\d+-.+$/.test(n) && isDir(path.join(courseDir, n)));
    for (const chapterDir of chapterDirs) {
      const lessonFiles = fs.readdirSync(path.join(courseDir, chapterDir)).filter(f => /^\d+-.+\.js$/.test(f));
      for (const lessonFile of lessonFiles) files.push({ chapterDir, filePath: path.join(courseDir, chapterDir, lessonFile), lessonFile });
    }
  }
  return files;
}

const lessons = discoverLessons();
console.log(`Checking ${lessons.length} lesson files for lossless round-trip...\n`);

let okCount = 0;
let realFailCount = 0;
const failuresByPath = new Map();

for (const { chapterDir, filePath, lessonFile } of lessons) {
  const code = fs.readFileSync(filePath, 'utf-8');
  let original;
  try {
    original = getTopLevelObject(code);
  } catch (e) {
    console.log('PARSE ERROR', filePath, e.message);
    continue;
  }
  if (!original) continue;

  const slug = lessonFile.replace(/^\d+-/, '').replace(/\.js$/, '');
  let result;
  try {
    const state = lessonToState(original, chapterDir, slug, code);
    result = buildLessonObject(state);
  } catch (e) {
    console.log('RUNTIME ERROR', filePath, e.message);
    continue;
  }

  const issues = diff(original, result).filter(issue => !isKnownSafe(issue.path, issue));
  if (issues.length === 0) {
    okCount++;
  } else {
    realFailCount++;
    for (const issue of issues) {
      const key = issue.path.replace(/\[\d+\]/g, '[]');
      if (!failuresByPath.has(key)) failuresByPath.set(key, { count: 0, examples: [] });
      const entry = failuresByPath.get(key);
      entry.count++;
      if (entry.examples.length < 3) entry.examples.push({ file: path.relative(root, filePath), ...issue });
    }
  }
}

console.log(`OK: ${okCount}   FAILED (unexplained): ${realFailCount}\n`);
if (failuresByPath.size > 0) {
  console.log('=== UNEXPLAINED ROUND-TRIP DIFFERENCES, GROUPED BY FIELD PATH ===');
  for (const [key, { count, examples }] of [...failuresByPath.entries()].sort((a, b) => b[1].count - a[1].count)) {
    console.log(`\n${key}  (${count} lessons)`);
    for (const ex of examples) {
      console.log(`  ${ex.file}`);
      console.log(`    expected: ${ex.expected}`);
      console.log(`    actual:   ${ex.actual}`);
    }
  }
  process.exitCode = 1;
}
