// Renderer-agnostic world data: block definitions, world generation, the
// STEM lesson library, missions, and starting inventory. None of this
// knows or cares how blocks get drawn — extracted unchanged from the old
// Canvas2D OpenCraftStudio.jsx as part of the WebGL migration (see
// buildplan/plan: open-craft renderer migration).

export const WORLD_X = 256;
export const WORLD_Y = 16;
export const WORLD_Z = 256;
export const EYE_HEIGHT = 1.62;
export const SPAWN_POINT = { cx: 24, cy: 6 + EYE_HEIGHT, cz: 8, yaw: 0.4, pitch: 0.15, vy: 0, vx: 0, vz: 0 };

export function worldIndex(x, y, z) {
  return (y * WORLD_X * WORLD_Z + z * WORLD_X + x) | 0;
}

export function inBounds(x, y, z) {
  return x >= 0 && x < WORLD_X && y >= 0 && y < WORLD_Y && z >= 0 && z < WORLD_Z;
}

export const BLOCKS = {
  0: { name: "Air", rgb: [0, 0, 0], emit: 0, density: 1, hard: 0, cat: "gas", note: "Nitrogen and oxygen mix. Pressure and temperature connect through PV = nRT." },
  1: { name: "Bedrock", rgb: [50, 50, 55], emit: 0, density: 3200, hard: 10, cat: "mineral", note: "Dense support layer. Think compressive strength and deep crust pressure." },
  2: { name: "Stone", rgb: [120, 118, 115], emit: 0, density: 2700, hard: 7, cat: "mineral", note: "Silicate-rich rock. Strong in compression, weaker in tension." },
  3: { name: "Dirt", rgb: [134, 95, 60], emit: 0, density: 1600, hard: 1, cat: "mineral", note: "Loose aggregate of minerals and organics. Great for talking about porosity." },
  4: { name: "Grass", rgb: [72, 148, 58], emit: 0, density: 1200, hard: 1, cat: "organic", note: "Photosynthesis stores solar energy as chemical energy." },
  5: { name: "Sand", rgb: [214, 196, 130], emit: 0, density: 1600, hard: 2, cat: "mineral", note: "Granular material. Stability depends on friction and angle of repose." },
  6: { name: "Gravel", rgb: [135, 128, 122], emit: 0, density: 1680, hard: 2, cat: "mineral", note: "Large grains pack with voids between them, changing drainage and strength." },
  7: { name: "Wood", rgb: [145, 100, 52], emit: 0, density: 600, hard: 2, cat: "organic", note: "Cellulose fibers give wood directional strength and useful energy density." },
  8: { name: "Leaf", rgb: [38, 118, 38], emit: 0, density: 300, hard: 0, cat: "organic", note: "Leaf surfaces trade light capture, gas exchange, and water loss." },
  9: { name: "Iron Ore", rgb: [135, 92, 82], emit: 0, density: 7874, hard: 6, cat: "metal", note: "Iron is dense, magnetic, and central to structural engineering." },
  10: { name: "Gold Ore", rgb: [200, 170, 40], emit: 0.2, density: 19300, hard: 2, cat: "metal", note: "Gold is dense, corrosion-resistant, and a strong electrical contact material." },
  11: { name: "Diamond", rgb: [180, 242, 255], emit: 0.4, density: 3515, hard: 10, cat: "mineral", note: "Diamond is carbon in a tetrahedral lattice, maximizing hardness." },
  12: { name: "Uranium", rgb: [55, 225, 18], emit: 1.0, density: 19100, hard: 6, cat: "nuclear", note: "Fission converts tiny mass differences into huge energy releases." },
  13: { name: "Lava", rgb: [248, 88, 8], emit: 1.0, density: 3100, hard: 0, cat: "liquid", note: "Molten rock radiates heat and changes viscosity as it cools." },
  14: { name: "Ice", rgb: [198, 232, 255], emit: 0, density: 917, hard: 1, cat: "solid", note: "Low-friction surface. Ice teaches why tiny coefficients of friction make stopping hard.", traction: 0.16, drag: 1.4, jump: 7.2, bounce: 0.02 },
  15: { name: "Glass", rgb: [162, 222, 238], emit: 0.1, density: 2500, hard: 5, cat: "mineral", note: "Amorphous solids behave differently from crystals because they lack long-range order." },
  16: { name: "Copper", rgb: [184, 112, 52], emit: 0, density: 8960, hard: 3, cat: "metal", note: "Copper is a benchmark conductor for circuits, motors, and heat transfer." },
  17: { name: "Coal", rgb: [44, 38, 38], emit: 0, density: 1400, hard: 3, cat: "organic", note: "Carbon-rich fuel stores chemical energy from ancient biomass." },
  18: { name: "Plasma", rgb: [242, 105, 255], emit: 1.0, density: 0.001, hard: 0, cat: "plasma", note: "Ionized gas responds strongly to electric and magnetic fields." },
  19: { name: "Antimatter", rgb: [200, 0, 255], emit: 1.0, density: 0.001, hard: 0, cat: "exotic", note: "Matter-antimatter annihilation is a dramatic way to teach E = mc^2." },
  20: { name: "Obsidian", rgb: [22, 16, 40], emit: 0, density: 2600, hard: 7, cat: "mineral", note: "Rapid cooling creates volcanic glass instead of orderly crystals." },
  21: { name: "Water", rgb: [45, 105, 210], emit: 0, density: 1000, hard: 0, cat: "liquid", note: "High specific heat makes water critical for climate and thermal management.", traction: 0.42, drag: 5.2, jump: 6.2, bounce: 0.04 },
  22: { name: "Rubber", rgb: [46, 46, 52], emit: 0, density: 1100, hard: 2, cat: "solid", note: "High-friction elastic surface. Rubber grips better and returns more energy on impact.", traction: 1.25, drag: 16, jump: 9.2, bounce: 0.38 },
  23: { name: "Slime", rgb: [88, 210, 110], emit: 0.06, density: 1050, hard: 0, cat: "liquid", note: "Viscoelastic goo. Slime damps motion sideways but can bounce energy back vertically.", traction: 0.5, drag: 8.5, jump: 7.6, bounce: 0.62 },
  24: { name: "Teflon", rgb: [210, 222, 230], emit: 0, density: 2200, hard: 2, cat: "solid", note: "Extremely low-friction polymer. PTFE shows why slippery materials resist sticking and sliding losses.", traction: 0.09, drag: 0.9, jump: 7.0, bounce: 0.01 },
  25: { name: "Copper Wire", rgb: [201, 124, 68], emit: 0, density: 8940, hard: 2, cat: "metal", note: "Conductor block for simple circuits. Carry power from switches, solar, batteries, or reactors.", conductsPower: true, inventoryKey: "wire", limitedCount: 24 },
  26: { name: "Lamp", rgb: [246, 228, 164], emit: 0.02, density: 1500, hard: 1, cat: "solid", note: "Needs power to shine brightly. Great for showing circuits and energy transfer.", powerConsumer: "lamp", inventoryKey: "lamp", limitedCount: 8 },
  27: { name: "Switch", rgb: [116, 145, 168], emit: 0, density: 1800, hard: 2, cat: "solid", note: "Interactive control block. Toggle it on and off to open or break a circuit.", toggleTo: 28, inventoryKey: "switch", limitedCount: 4 },
  28: { name: "Switch (On)", rgb: [102, 223, 170], emit: 0.14, density: 1800, hard: 2, cat: "solid", note: "Closed circuit switch. This block acts as a local power source.", toggleTo: 27, powerSource: "switch", inventoryKey: "switch", hiddenInPalette: true, limitedCount: 4 },
  29: { name: "Battery", rgb: [112, 206, 255], emit: 0.16, density: 2200, hard: 2, cat: "solid", note: "Stored electrical energy. Think of it as limited portable power for circuits.", powerSource: "battery", inventoryKey: "battery", limitedCount: 4 },
  30: { name: "Reactor", rgb: [120, 255, 126], emit: 0.95, density: 4000, hard: 5, cat: "nuclear", note: "Compact nuclear source block. Massive energy density makes it ideal for teaching power generation.", powerSource: "always", inventoryKey: "reactor", limitedCount: 2 },
  31: { name: "Solar Panel", rgb: [69, 142, 255], emit: 0.08, density: 2100, hard: 2, cat: "solid", note: "Provides electricity only when the sun is up. Great for renewable-energy builds.", powerSource: "day", inventoryKey: "solar", limitedCount: 6 },
};

export const blockApi = {
  nextId: 22,
  register(definition) {
    const id = definition.id || this.nextId++;
    BLOCKS[id] = {
      emit: 0,
      density: 1000,
      hard: 5,
      cat: "custom",
      note: "User-defined STEM block.",
      ...definition,
      custom: true,
    };
    return id;
  },
};

if (typeof window !== "undefined") {
  window.BLOCK_API = blockApi;
}

export const STEM_LESSONS = {
  nuclear: {
    title: "Nuclear Energy and Mass Defect",
    body: "Heavy nuclei can release enormous energy when they split because a tiny amount of mass becomes energy. That is why uranium glows in OpenCraft and why reactors need careful shielding and control.",
    formulas: ["E = m c^2", "U-235 + n -> fission products + energy", "Tiny mass loss -> huge energy output"],
  },
  exotic: {
    title: "Antimatter and Total Conversion",
    body: "Antimatter is the extreme version of stored energy. When matter and antimatter meet, nearly all of the mass can become radiation, which makes it a memorable way to teach energy density.",
    formulas: ["e+ + e- -> gamma + gamma", "Energy density scales with mass", "1 gram of mass stores enormous energy"],
  },
  metal: {
    title: "Conductivity and Free Electrons",
    body: "Metals conduct because some electrons move freely through the lattice. Copper wire, batteries, and switches make that idea visible by turning a circuit into light.",
    formulas: ["Current depends on charge flow", "Conductivity tracks electron mobility", "Power = voltage x current"],
  },
  liquid: {
    title: "Flow, Pressure, and Heat Transfer",
    body: "Liquids change shape under small shear forces, which makes them useful for cooling, transport, and fluid power. Water, lava, and slime all flow differently because viscosity and elasticity change how momentum dissipates.",
    formulas: ["Pressure rises with depth", "Flow depends on velocity and cross-section", "Thermal storage depends on specific heat"],
  },
  plasma: {
    title: "Plasma as an Ionized Fluid",
    body: "Plasma is matter energetic enough that electrons detach from atoms. That makes it conductive and sensitive to magnetic fields, which is why it appears in stars, lightning, and fusion research.",
    formulas: ["Ionization changes electrical behavior", "Charged particles curve in magnetic fields", "Hotter systems can cross into plasma state"],
  },
  mineral: {
    title: "Crystals, Glasses, and Strength",
    body: "Mineral properties come from both chemistry and structure. Diamond, obsidian, sand, and stone are all made from a small set of elements but behave very differently because their internal structure changes.",
    formulas: ["Structure influences hardness", "Compression and tension behave differently", "Cooling rate changes crystal growth"],
  },
  organic: {
    title: "Stored Solar Energy in Matter",
    body: "Organic matter often stores energy originally captured from sunlight. Wood, leaves, and coal help connect chemistry, biology, and thermodynamics in one system.",
    formulas: ["Photosynthesis stores chemical energy", "Combustion releases bond energy", "Fuel value depends on composition"],
  },
  gas: {
    title: "Gas Pressure and Molecular Motion",
    body: "Gases fill their container because particles move constantly and collide with everything around them. Pressure is not a mysterious force: it is just many tiny impacts over time.",
    formulas: ["PV = nRT", "Temperature tracks kinetic energy", "Lower volume means more collisions per area"],
  },
  solid: {
    title: "Solids, Phases, and Density Anomalies",
    body: "Solids usually pack more tightly than liquids, but ice breaks that rule. Rubber and Teflon add another lesson: microscopic surface structure changes friction, bounce, and grip in ways you can feel while moving.",
    formulas: ["Density = mass / volume", "Friction force = mu N", "Microscopic geometry shapes bulk properties"],
  },
};

export const MISSIONS = [
  {
    id: "probe-three",
    title: "Probe Three Material Families",
    detail: "Use the Science Probe on at least three different STEM categories.",
    isDone: (progress) => progress.probedCategories.size >= 3,
  },
  {
    id: "probe-reactive",
    title: "Find a High-Energy Block",
    detail: "Probe Uranium, Plasma, or Antimatter to unlock the energy lesson.",
    isDone: (progress) =>
      progress.probedCategories.has("nuclear") ||
      progress.probedCategories.has("plasma") ||
      progress.probedCategories.has("exotic"),
  },
  {
    id: "light-build",
    title: "Place an Emissive Block",
    detail: "Build with a glowing block and notice how energy-rich materials stand out.",
    isDone: (progress) => progress.placedEmissive > 0,
  },
  {
    id: "custom-block",
    title: "Design a Custom STEM Block",
    detail: "Create your own block in the builder and add a science note.",
    isDone: (progress) => progress.customBlocks > 0,
  },
  {
    id: "tool-experiment",
    title: "Run a Physics Tool",
    detail: "Try the gravity gun, anti-gravity lift, or antimatter tool.",
    isDone: (progress) => progress.toolUses > 0,
  },
  {
    id: "power-up",
    title: "Light a Circuit",
    detail: "Power at least one lamp with a switch, solar panel, battery, or reactor.",
    isDone: (progress) => progress.poweredLamps > 0,
  },
];

export const INITIAL_INVENTORY = {
  wire: 24,
  lamp: 8,
  switch: 4,
  battery: 4,
  reactor: 2,
  solar: 6,
};

export function buildWorld() {
  const world = new Uint8Array(WORLD_X * WORLD_Y * WORLD_Z);
  const set = (x, y, z, block) => {
    if (inBounds(x, y, z)) world[worldIndex(x, y, z)] = block;
  };

  const featureLimitX = 48;
  const featureLimitZ = 48;

  for (let x = 0; x < WORLD_X; x += 1) {
    for (let z = 0; z < WORLD_Z; z += 1) {
      set(x, 0, z, 1);
      set(x, 1, z, 2);
      set(x, 2, z, 2);
      set(x, 3, z, 3);
      set(x, 4, z, 3);
      set(x, 5, z, 4);
    }
  }

  for (let x = 30; x < Math.min(42, featureLimitX); x += 1) for (let z = 30; z < Math.min(42, featureLimitZ); z += 1) {
    set(x, 5, z, 5);
    set(x, 4, z, 6);
  }
  for (let x = 4; x < Math.min(16, featureLimitX); x += 1) for (let z = 32; z < Math.min(44, featureLimitZ); z += 1) set(x, 5, z, 14);

  const ore = (x, z, block) => {
    set(x, 2, z, block);
    set(x, 1, z, block);
  };
  ore(8, 8, 9);
  ore(9, 8, 9);
  ore(8, 9, 9);
  ore(20, 10, 10);
  ore(21, 10, 10);
  ore(14, 22, 11);
  ore(15, 22, 11);
  ore(14, 23, 11);
  ore(38, 14, 17);
  ore(39, 14, 17);
  ore(38, 15, 17);
  set(28, 2, 36, 16);
  set(29, 2, 36, 16);

  [[10, 8], [38, 10], [10, 38], [38, 38]].forEach(([tx, tz]) => {
    for (let y = 0; y < 4; y += 1) set(tx, 6 + y, tz, 7);
    for (let dx = -2; dx <= 2; dx += 1) {
      for (let dz = -2; dz <= 2; dz += 1) {
        for (let dy = 0; dy <= 2; dy += 1) {
          if (Math.abs(dx) + Math.abs(dz) + dy < 4 && !(dx === 0 && dz === 0 && dy === 0)) {
            set(tx + dx, 9 + dy, tz + dz, 8);
          }
        }
      }
    }
  });

  for (let y = 6; y < 12; y += 1) set(24, y, 24, 12);
  set(23, 6, 24, 12);
  set(25, 6, 24, 12);
  set(24, 6, 23, 12);
  set(24, 6, 25, 12);

  set(12, 6, 12, 18);
  set(12, 7, 12, 18);
  set(12, 8, 12, 19);

  const gx = 36;
  const gz = 12;
  const radius = 4;
  const gy = 6;
  for (let dx = -radius; dx <= radius; dx += 1) {
    for (let dz = -radius; dz <= radius; dz += 1) {
      for (let dy = 0; dy <= radius; dy += 1) {
        const dist2 = dx * dx + dz * dz + dy * dy;
        if (dist2 <= radius * radius && dist2 >= (radius - 1) * (radius - 1)) {
          set(gx + dx, gy + dy, gz + dz, 10);
        }
      }
    }
  }

  for (let x = 18; x < 28; x += 1) for (let y = 6; y < 9; y += 1) {
    set(x, y, 18, 20);
    set(x, y, 26, 20);
  }
  for (let z = 18; z < 27; z += 1) for (let y = 6; y < 9; y += 1) {
    set(18, y, z, 20);
    set(28, y, z, 20);
  }
  for (let x = 18; x < 29; x += 1) for (let z = 18; z < 27; z += 1) set(x, 9, z, 20);
  set(23, 6, 18, 0);
  set(23, 7, 18, 0);
  set(24, 6, 18, 0);
  set(24, 7, 18, 0);

  for (let x = 40; x < 46; x += 1) for (let z = 40; z < 46; z += 1) {
    set(x, 5, z, 13);
    set(x, 4, z, 20);
  }

  for (let x = 4; x < 10; x += 1) for (let z = 8; z < 14; z += 1) set(x, 5, z, 21);
  for (let y = 6; y < 14; y += 1) {
    set(44, y, 8, 15);
    set(44, y, 9, 15);
  }

  for (let x = 52; x < 68; x += 1) for (let z = 10; z < 18; z += 1) set(x, 5, z, 22);
  for (let x = 70; x < 82; x += 1) for (let z = 22; z < 30; z += 1) set(x, 5, z, 23);
  for (let x = 54; x < 70; x += 1) for (let z = 34; z < 42; z += 1) set(x, 5, z, 24);

  set(31, 6, 12, 27);
  set(32, 6, 12, 25);
  set(33, 6, 12, 25);
  set(34, 6, 12, 26);
  set(37, 6, 12, 31);
  set(37, 6, 13, 25);
  set(37, 6, 14, 26);
  set(41, 6, 12, 29);
  set(41, 6, 13, 25);
  set(41, 6, 14, 26);

  return world;
}
