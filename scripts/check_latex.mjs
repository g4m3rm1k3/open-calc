/**
 * LaTeX Validation Script
 *
 * Imports every content module, walks the data structures, extracts all LaTeX
 * expressions, and tries to render each one with KaTeX. Reports failures with
 * file name, object path, and error message.
 *
 * Usage:
 *   node scripts/check_latex.mjs
 *   node scripts/check_latex.mjs physics          # filter by path substring
 *   node scripts/check_latex.mjs --formulas-only  # only check formula.expression fields
 */

import katex from 'katex';
import { readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';

const args = process.argv.slice(2);
const filterStr = args.find(a => !a.startsWith('--')) || '';
const formulasOnly = args.includes('--formulas-only');

// ── File walker ───────────────────────────────────────────────────────────────

function walkDir(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...walkDir(full));
    else if (entry.endsWith('.js')) files.push(full);
  }
  return files;
}

// ── LaTeX extractor ───────────────────────────────────────────────────────────

/**
 * Extract all LaTeX expressions from a string value.
 * Returns array of { expr, mode: 'inline'|'block', source: 'delimited'|'bare' }
 */
function extractFromString(str) {
  const results = [];
  const seen = new Set();

  function add(expr, mode) {
    expr = expr.trim();
    if (!expr || seen.has(expr)) return;
    seen.add(expr);
    results.push({ expr, mode });
  }

  // \[...\] block math (also handles \\[...\\] double-backslash encoding in template literals)
  const blockRe = /\\\[([\s\S]+?)\\\]/g;
  let m;
  while ((m = blockRe.exec(str)) !== null) {
    let content = m[1].trim();
    // Strip trailing \ artifact from \\[...\\] encoding (first \ of \\] ends up in content)
    if (content.endsWith('\\')) content = content.slice(0, -1).trim();
    // Skip regex/code patterns that happen to use \[...\] syntax
    if (/\\d\{|\\w\{|\\s\{|\\W\{/.test(content)) continue;
    add(content, 'block');
  }

  // $$...$$ block math (common in prose strings even though parseProse misses it)
  const ddRe = /\$\$([\s\S]+?)\$\$/g;
  while ((m = ddRe.exec(str)) !== null) add(m[1], 'block');

  // \(...\) inline math
  const inlineRe = /\\\(([\s\S]+?)\\\)/g;
  while ((m = inlineRe.exec(str)) !== null) add(m[1], 'inline');

  // $...$ inline math — treat \$ as escaped dollar (not a delimiter) inside the content
  const sdRe = /\$((?:[^\$\n\\]|\\[^\n]){1,300})\$/g;
  while ((m = sdRe.exec(str)) !== null) {
    const candidate = m[1].trim();
    // Skip \$ currency-escape splits (content is just a backslash or ends with bare \)
    if (candidate === '\\' || candidate.endsWith('\\')) continue;
    if (/[\\^_{}\[\]|]|\\[a-z]/.test(candidate)) add(candidate, 'inline');
  }

  return results;
}

// ── Object walker ─────────────────────────────────────────────────────────────

/**
 * Walk a lesson object tree and collect all LaTeX to validate.
 * Each result: { expr, mode, path, source }
 */
function collectAll(val, path = '') {
  const all = [];

  if (typeof val === 'string') {
    // Check for Unicode math chars in positions that should be LaTeX
    const unicodeMath = detectUnicodeMath(val);
    if (unicodeMath) all.push({ type: 'unicode-warn', chars: unicodeMath, path });

    if (!formulasOnly) {
      for (const e of extractFromString(val)) {
        all.push({ type: 'latex', ...e, path });
      }
    }
  } else if (Array.isArray(val)) {
    val.forEach((v, i) => all.push(...collectAll(v, `${path}[${i}]`)));
  } else if (val && typeof val === 'object') {
    // formula.expression fields are raw LaTeX (no delimiters)
    if (typeof val.expression === 'string') {
      const expr = val.expression;
      // Skip G-code / CNC macro expressions (contain #N variable syntax but no LaTeX backslash commands)
      const hasCncVar = /#\d+/.test(expr);
      const hasLatex = expr.includes('\\');
      const looksLikeCnc = hasCncVar && !hasLatex;
      if (!looksLikeCnc) {
        all.push({ type: 'latex', expr, mode: 'block', path: `${path}.expression`, source: 'formula' });
      }
    }
    // Skip code fields — Python/JS/CNC source strings, not LaTeX
    const CODE_KEYS = new Set(['code', 'startCode', 'initialCode', 'solution', 'solutionCode', 'initialFiles']);
    for (const [k, v] of Object.entries(val)) {
      if (k === 'expression') continue;
      if (CODE_KEYS.has(k)) continue;
      // Skip file-path keys (e.g. "/home/user/main.cpp" as a key in initialFiles)
      if (typeof k === 'string' && k.includes('/')) continue;
      all.push(...collectAll(v, `${path}.${k}`));
    }
  }

  return all;
}

// ── Unicode math detector ─────────────────────────────────────────────────────

const UNICODE_MATH = {
  '≥': '\\geq', '≤': '\\leq', '≠': '\\neq', '≈': '\\approx',
  '→': '\\to', '←': '\\leftarrow', '↔': '\\leftrightarrow',
  '∈': '\\in', '∉': '\\notin', '⊂': '\\subset', '⊆': '\\subseteq',
  '∞': '\\infty', '√': '\\sqrt', '∑': '\\sum', '∏': '\\prod', '∫': '\\int',
  '×': '\\times', '÷': '\\div', '±': '\\pm',
  'α': '\\alpha', 'β': '\\beta', 'γ': '\\gamma', 'δ': '\\delta',
  'ε': '\\epsilon', 'θ': '\\theta', 'λ': '\\lambda', 'μ': '\\mu',
  'π': '\\pi', 'σ': '\\sigma', 'φ': '\\phi', 'ω': '\\omega',
  'Δ': '\\Delta', 'Σ': '\\Sigma', 'Π': '\\Pi', 'Ω': '\\Omega',
};

function detectUnicodeMath(str) {
  // Only flag unicode inside math delimiters, or bare in a formula expression
  const mathRe = /\$\$[\s\S]+?\$\$|\$[^\$\n]+\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)/g;
  const hits = [];
  let m;
  while ((m = mathRe.exec(str)) !== null) {
    const inner = m[0];
    for (const [ch, cmd] of Object.entries(UNICODE_MATH)) {
      if (inner.includes(ch)) hits.push({ ch, cmd, context: inner.slice(0, 60) });
    }
  }
  return hits.length ? hits : null;
}

// ── KaTeX renderer ────────────────────────────────────────────────────────────

function tryRender(expr, mode) {
  try {
    katex.renderToString(expr, {
      displayMode: mode === 'block',
      throwOnError: true,
      strict: false,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message.split('\n')[0] };
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

const contentDir = resolve(process.cwd(), 'src/content');
const allFiles = walkDir(contentDir).filter(f => !filterStr || f.includes(filterStr));

console.log(`\nChecking ${allFiles.length} files${filterStr ? ` matching "${filterStr}"` : ''}...\n`);

let totalChecked = 0;
let totalErrors = 0;
let totalWarnings = 0;
let filesWithIssues = 0;

for (const file of allFiles) {
  let mod;
  try {
    mod = await import(pathToFileURL(file).href);
  } catch (e) {
    console.error(`  IMPORT ERROR: ${file.replace(contentDir + '/', '')}: ${e.message}`);
    continue;
  }

  const lesson = mod.default;
  if (!lesson) continue;

  const items = collectAll(lesson);
  const errors = [];
  const warnings = [];

  for (const item of items) {
    if (item.type === 'unicode-warn') {
      for (const hit of item.chars) {
        warnings.push({ path: item.path, ...hit });
      }
      continue;
    }

    totalChecked++;
    const result = tryRender(item.expr, item.mode);
    if (!result.ok) {
      totalErrors++;
      errors.push({ ...item, error: result.error });
    }
  }

  if (errors.length || warnings.length) {
    filesWithIssues++;
    const shortName = file.replace(contentDir + '/', '');
    console.log(`\x1b[1m📄 ${shortName}\x1b[0m`);

    for (const e of errors) {
      totalErrors; // already counted above
      const preview = e.expr.replace(/\n/g, '↵').slice(0, 90);
      console.log(`  \x1b[31m✗\x1b[0m [${e.mode}] ${e.path}`);
      console.log(`     expr: ${preview}`);
      console.log(`     err:  ${e.error}`);
    }

    for (const w of warnings) {
      totalWarnings++;
      console.log(`  \x1b[33m⚠\x1b[0m  unicode "${w.ch}" should be "${w.cmd}" in: ${w.context.replace(/\n/g, ' ')}`);
    }
  }
}

console.log('\n' + '─'.repeat(60));
if (totalErrors === 0 && totalWarnings === 0) {
  console.log(`\x1b[32m✅  All ${totalChecked} expressions valid\x1b[0m`);
} else {
  if (totalErrors > 0)   console.log(`\x1b[31m❌  ${totalErrors} LaTeX errors in ${totalChecked} expressions\x1b[0m`);
  if (totalWarnings > 0) console.log(`\x1b[33m⚠   ${totalWarnings} Unicode-in-math warnings\x1b[0m`);
  console.log(`    ${filesWithIssues} of ${allFiles.length} files affected`);
}
console.log();
