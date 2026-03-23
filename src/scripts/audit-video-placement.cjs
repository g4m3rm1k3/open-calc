const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONTENT_ROOT = path.join(ROOT, 'src', 'content');
const OUT_DIR = path.join(ROOT, 'reports');
const OUT_FILE = path.join(OUT_DIR, 'video-audit.json');
const OUT_SEED_LIBRARY = path.join(OUT_DIR, 'video-library-seed.json');

function listFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'enhancers') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFiles(full));
      continue;
    }
    if (!entry.name.endsWith('.js')) continue;
    if (entry.name === 'index.js') continue;
    out.push(full);
  }
  return out;
}

function inferSource(title = '', url = '') {
  const t = `${title} ${url}`.toLowerCase();
  if (/3blue1brown|essence of calculus|\b3b1b\b/.test(t)) return '3blue1brown';
  if (/\btr-\d+\b|dennis\s*f\.?\s*davis/.test(t)) return 'dennis-f-davis';
  if (/calculus i|kimberly|kim\b/.test(t)) return 'calc-i-kim';
  return 'unknown';
}

function isLikelyTrigVideo(title = '', url = '') {
  const t = `${title} ${url}`.toLowerCase();
  return /(\btr-\d+\b|trig|trigon|sine|cosine|tangent|unit circle|polar|radian|law of sines|law of cosines|inverse trig)/.test(t);
}

function isTrigLesson(lessonTitle = '', lessonSlug = '', file = '') {
  const t = `${lessonTitle} ${lessonSlug} ${file}`.toLowerCase();
  return /(trig|trigon|sine|cosine|tangent|polar|unit-circle|unit circle|inverse-trig|solving-triangles|angles-foundations|triangle-geometry|trig-ratios|trig-graphs|identities-proofs|precalc-3)/.test(t);
}

function pushVideo(records, context, kind, payload) {
  if (!payload || typeof payload !== 'object') return;

  if (kind === 'VideoEmbed') {
    records.push({
      ...context,
      component: 'VideoEmbed',
      videoTitle: payload.title || null,
      url: payload.url || null,
      source: inferSource(payload.title, payload.url),
      likelyTrigVideo: isLikelyTrigVideo(payload.title, payload.url),
    });
    return;
  }

  if (kind === 'VideoCarousel') {
    const videos = Array.isArray(payload.videos) ? payload.videos : [];
    if (!videos.length) {
      records.push({
        ...context,
        component: 'VideoCarousel',
        videoTitle: payload.title || null,
        url: null,
        source: inferSource(payload.title, ''),
        likelyTrigVideo: isLikelyTrigVideo(payload.title, ''),
      });
      return;
    }

    for (const v of videos) {
      records.push({
        ...context,
        component: 'VideoCarousel',
        videoTitle: v?.title || null,
        url: v?.url || null,
        source: inferSource(v?.title, v?.url),
        likelyTrigVideo: isLikelyTrigVideo(v?.title, v?.url),
      });
    }
  }
}

function scanSection(records, lessonCtx, sectionName, sectionObj) {
  if (!sectionObj || typeof sectionObj !== 'object') return;

  const sectionContext = { ...lessonCtx, section: sectionName };

  const blocks = Array.isArray(sectionObj.blocks) ? sectionObj.blocks : [];
  for (const block of blocks) {
    if (!block || typeof block !== 'object') continue;
    if (block.type !== 'viz') continue;

    if (block.id === 'VideoEmbed') {
      pushVideo(records, sectionContext, 'VideoEmbed', {
        title: block.title,
        url: block?.props?.url,
      });
    }

    if (block.id === 'VideoCarousel') {
      pushVideo(records, sectionContext, 'VideoCarousel', {
        title: block.title,
        videos: block?.props?.videos,
      });
    }
  }

  const visualizations = Array.isArray(sectionObj.visualizations) ? sectionObj.visualizations : [];
  for (const viz of visualizations) {
    if (!viz || typeof viz !== 'object') continue;

    if (viz.id === 'VideoEmbed') {
      pushVideo(records, sectionContext, 'VideoEmbed', {
        title: viz.title,
        url: viz?.props?.url,
      });
    }

    if (viz.id === 'VideoCarousel') {
      pushVideo(records, sectionContext, 'VideoCarousel', {
        title: viz.title,
        videos: viz?.props?.videos,
      });
    }
  }
}

function run() {
  const files = listFiles(CONTENT_ROOT);
  const records = [];

  for (const filePath of files) {
    const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');

    let mod;
    try {
      mod = require(filePath);
    } catch {
      continue;
    }

    const lesson = mod?.default;
    if (!lesson || typeof lesson !== 'object') continue;

    const lessonCtx = {
      file: rel,
      lessonId: lesson.id ?? null,
      lessonSlug: lesson.slug ?? null,
      lessonTitle: lesson.title ?? null,
      chapter: lesson.chapter ?? null,
    };

    scanSection(records, lessonCtx, 'intuition', lesson.intuition);
    scanSection(records, lessonCtx, 'math', lesson.math);
    scanSection(records, lessonCtx, 'rigor', lesson.rigor);
  }

  const misplacements = records.filter((r) => {
    if (!r.likelyTrigVideo) return false;
    return String(r.chapter) !== 'precalc-3';
  });

  const suspectMisplacements = misplacements.filter((r) => {
    return !isTrigLesson(r.lessonTitle, r.lessonSlug, r.file);
  });

  const seedMap = new Map();
  for (const r of records) {
    if (!r.url) continue;
    if (!seedMap.has(r.url)) {
      const tags = [];
      if (r.likelyTrigVideo) tags.push('trig');
      if (String(r.chapter) === 'precalc-3') tags.push('precalc-3');
      if (/limit|derivative|integral|series/.test(`${r.lessonTitle} ${r.lessonSlug}`.toLowerCase())) tags.push('calculus');

      seedMap.set(r.url, {
        id: `vid-${seedMap.size + 1}`,
        title: r.videoTitle,
        url: r.url,
        source: r.source,
        tags,
        firstSeenIn: {
          file: r.file,
          lessonSlug: r.lessonSlug,
          lessonTitle: r.lessonTitle,
          chapter: r.chapter,
          section: r.section,
        },
      });
    }
  }

  const seedLibrary = Array.from(seedMap.values());

  const byChapter = {};
  for (const r of records) {
    const k = String(r.chapter);
    byChapter[k] = (byChapter[k] || 0) + 1;
  }

  const bySource = {};
  for (const r of records) {
    bySource[r.source] = (bySource[r.source] || 0) + 1;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(
    OUT_FILE,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalVideos: records.length,
        byChapter,
        bySource,
        likelyTrigVideosOutsidePrecalc3: misplacements.length,
        suspectLikelyTrigVideosOutsidePrecalc3: suspectMisplacements.length,
        records,
        misplacements,
        suspectMisplacements,
      },
      null,
      2
    )
  );

  fs.writeFileSync(OUT_SEED_LIBRARY, JSON.stringify(seedLibrary, null, 2));

  console.log(`Wrote ${OUT_FILE}`);
  console.log(`Wrote ${OUT_SEED_LIBRARY}`);
  console.log(`Total videos: ${records.length}`);
  console.log(`Likely trig videos outside precalc-3: ${misplacements.length}`);
  console.log(`Suspect trig videos outside trig lessons: ${suspectMisplacements.length}`);
}

run();
