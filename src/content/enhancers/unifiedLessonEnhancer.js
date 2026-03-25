import { pickTopicMissionPack } from './topicMissionPlaybook.js';
import { getVideosForLesson, formatAsVisualization } from '../videos/VideoProvider.js';

const REAL_WORLD_LIBRARY = {
  limits: 'In control systems and robotics, limits model what happens as sensor lag shrinks toward zero so engineers can stabilize feedback loops.',
  continuity: 'In manufacturing and 3D printing, continuity means tiny knob adjustments do not cause sudden jumps in output geometry.',
  derivatives: 'In driving analytics, derivatives convert position logs into speed and acceleration so teams can detect harsh braking and optimize routes.',
  'chain rule': 'In machine learning backpropagation, each layer contributes a local rate and the total sensitivity is the product of rates along the network.',
  trigonometric: 'In signal processing, trig derivatives describe phase and frequency changes in audio, radar, and communication waveforms.',
  implicit: 'In navigation and robotics, implicit curves model constraints like safe-distance boundaries where slope must be inferred indirectly.',
  optimization: 'In operations and business, optimization selects prices, dimensions, or schedules that maximize gain or minimize cost under constraints.',
  integrals: 'In medicine and engineering, integrals accumulate dosage, flow, and energy over time rather than at single instants.',
  series: 'In graphics and simulation, series approximations let systems compute expensive functions quickly with controlled error bounds.',
  vectors: 'In physics engines and game development, vectors encode direction and magnitude for motion, forces, and camera orientation.',
  probability: 'In risk analysis and forecasting, probability models uncertainty in outcomes such as failures, demand surges, or queue delays.',
  default: 'This concept appears in real systems where variables depend on each other across time, and calculus/discrete structure predicts how small changes propagate.',
};

function inferTopicKey(lesson) {
  const text = `${lesson.title ?? ''} ${lesson.subtitle ?? ''} ${(lesson.tags ?? []).join(' ')}`.toLowerCase();
  const keys = Object.keys(REAL_WORLD_LIBRARY).filter((k) => k !== 'default');
  const hit = keys.find((k) => text.includes(k));
  return hit ?? 'default';
}

function hasCallout(callouts, title) {
  return (callouts ?? []).some((c) => (c?.title ?? '').trim().toLowerCase() === title.trim().toLowerCase());
}

function ensureArray(value) {
  return Array.isArray(value) ? [...value] : [];
}

/**
 * Filter out legacy VideoEmbed and VideoCarousel objects from the content blocks.
 * This is a safety measure to ensure only the Unified Player (Tutorial Hub) is used.
 */
function filterLegacyVideos(data) {
  if (Array.isArray(data)) {
    return data
      .filter((item) => {
        if (item && typeof item === 'object') {
          const id = item.id || (item.props && item.props.id);
          if (id === 'VideoEmbed' || id === 'VideoCarousel') return false;
        }
        return true;
      })
      .map(filterLegacyVideos);
  } else if (data !== null && typeof data === 'object') {
    const newData = {};
    for (const key in data) {
      newData[key] = filterLegacyVideos(data[key]);
    }
    return newData;
  }
  return data;
}

function ensureSection(section) {
  if (!section) return { prose: [], callouts: [] };
  return {
    ...section,
    prose: ensureArray(section.prose),
    callouts: ensureArray(section.callouts),
  };
}

function addConnectorCallouts(intuition, math, rigor, topicMessage) {
  const nextMathTitle = 'Bridge: Visual -> Formula';
  if (!hasCallout(intuition.callouts, nextMathTitle)) {
    intuition.callouts.push({
      type: 'insight',
      title: nextMathTitle,
      body: 'Use the visual model to name the changing quantities first, then map each quantity to a symbol before applying formulas.',
    });
  }

  const nextRigorTitle = 'Bridge: Formula -> Proof Logic';
  if (!hasCallout(math.callouts, nextRigorTitle)) {
    math.callouts.push({
      type: 'strategy',
      title: nextRigorTitle,
      body: 'Ask two questions: what assumptions make this formula legal, and what breaks if one assumption fails?',
    });
  }

  const backToRealityTitle = 'Bridge: Proof -> Real World';
  if (!hasCallout(rigor.callouts, backToRealityTitle)) {
    rigor.callouts.push({
      type: 'real-world',
      title: backToRealityTitle,
      body: topicMessage,
    });
  }
}

function ensureHook(lesson, topicMessage) {
  const hook = {
    ...(lesson.hook ?? {}),
  };

  if (!hook.question || !String(hook.question).trim()) {
    hook.question = `Why does ${lesson.title ?? 'this concept'} matter when solving real problems?`;
  }

  if (!hook.realWorldContext || !String(hook.realWorldContext).trim()) {
    hook.realWorldContext = topicMessage;
  }

  return hook;
}

export function enhanceExamples(examples, lessonId) {
  const safeExamples = ensureArray(examples);
  return safeExamples.map((example) => {
    const steps = ensureArray(example.steps);
    
    // Inject Videos into Example
    const videos = getVideosForLesson(lessonId, 'examples', example.id);
    const viz = formatAsVisualization(videos, lessonId);
    const visualizations = ensureArray(example.visualizations);
    if (viz) {
      visualizations.unshift(viz);
    }

    const enhancedExample = {
      ...example,
      visualizations,
    };

    if (steps.length === 0) return enhancedExample;

    return {
      ...enhancedExample,
      steps: steps.map((step) => {
        if (!step?.expression) return step;
        if (step.strategy || step.strategyTitle || step.checkpoint) return step;
        return {
          ...step,
          strategyTitle: 'Intent',
          strategy: step.annotation ?? 'Identify the structural purpose of this move before computing.',
          checkpoint: 'State why this move is valid before continuing.',
        };
      }),
    };
  });
}

export function enhanceLessonForUnifiedLearning(lesson) {
  if (!lesson) return lesson;

  const topicKey = inferTopicKey(lesson);
  const topicMessage = REAL_WORLD_LIBRARY[topicKey] ?? REAL_WORLD_LIBRARY.default;
  const missionPack = pickTopicMissionPack(lesson);

  const intuition = ensureSection(lesson.intuition);
  const math = ensureSection(lesson.math);
  const rigor = ensureSection(lesson.rigor);
  const hook = ensureHook(lesson, topicMessage);

  // Inject Videos
  const sections = ['hook', 'intuition', 'math', 'rigor'];
  const dataMap = { hook, intuition, math, rigor };

  sections.forEach((s) => {
    const videos = getVideosForLesson(lesson.id, s);
    const viz = formatAsVisualization(videos, lesson.id);
    if (viz) {
      if (!dataMap[s].visualizations) dataMap[s].visualizations = [];
      dataMap[s].visualizations.unshift(viz); // Add to the front
    }
  });

  addConnectorCallouts(intuition, math, rigor, topicMessage);

  return filterLegacyVideos({
    ...lesson,
    hook,
    intuition,
    math,
    rigor,
    examples: enhanceExamples(lesson.examples, lesson.id),
    unifiedMissionPack: {
      ...missionPack,
      realWorldExample: missionPack.realWorldExample ?? topicMessage,
    },
  });
}
