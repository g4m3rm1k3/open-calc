export const CDN_LIBRARIES = [
  {
    id: "threejs",
    label: "Three.js",
    icon: "🧊",
    description: "3D WebGL graphics",
    category: "3D",
    type: "script",
    url: "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js",
  },
  {
    id: "gsap",
    label: "GSAP",
    icon: "🎞",
    description: "Pro animation toolkit",
    category: "Animation",
    type: "script",
    url: "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
  },
  {
    id: "animejs",
    label: "Anime.js",
    icon: "✨",
    description: "Lightweight animation",
    category: "Animation",
    type: "script",
    url: "https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js",
  },
  {
    id: "chartjs",
    label: "Chart.js",
    icon: "📊",
    description: "Beautiful charts",
    category: "Data",
    type: "script",
    url: "https://cdn.jsdelivr.net/npm/chart.js",
  },
  {
    id: "d3",
    label: "D3.js",
    icon: "📈",
    description: "Data-driven documents",
    category: "Data",
    type: "script",
    url: "https://cdn.jsdelivr.net/npm/d3@7",
  },
  {
    id: "p5",
    label: "p5.js",
    icon: "🎨",
    description: "Creative coding canvas",
    category: "Creative",
    type: "script",
    url: "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.3/p5.min.js",
  },
  {
    id: "matter",
    label: "Matter.js",
    icon: "⚙️",
    description: "2D physics engine",
    category: "Physics",
    type: "script",
    url: "https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js",
  },
  {
    id: "pixi",
    label: "PixiJS",
    icon: "🕹",
    description: "Fast 2D WebGL renderer",
    category: "2D",
    type: "script",
    url: "https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.3.2/pixi.min.js",
  },
  {
    id: "alpine",
    label: "Alpine.js",
    icon: "🗻",
    description: "Minimal reactive framework",
    category: "Framework",
    type: "script",
    url: "https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js",
  },
  {
    id: "tailwind",
    label: "Tailwind CSS",
    icon: "💨",
    description: "Utility-first CSS",
    category: "CSS",
    type: "stylesheet",
    url: "https://cdn.tailwindcss.com",
    scriptOverride: true, // Tailwind CDN is a script, not a stylesheet
  },
  {
    id: "bootstrap-css",
    label: "Bootstrap",
    icon: "🅱",
    description: "CSS component framework",
    category: "CSS",
    type: "stylesheet",
    url: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
  },
  {
    id: "bootstrap-js",
    label: "Bootstrap JS",
    icon: "🅱",
    description: "Bootstrap interactive JS",
    category: "CSS",
    type: "script",
    url: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js",
  },
];

export function resolveCdnTags(ids) {
  return ids
    .map((id) => CDN_LIBRARIES.find((l) => l.id === id))
    .filter(Boolean)
    .map((lib) => ({
      url: lib.url,
      // Tailwind CDN is served as a script even though it's "CSS"
      type: lib.scriptOverride ? "script" : lib.type,
    }));
}
