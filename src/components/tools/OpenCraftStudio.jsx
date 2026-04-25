import { useState, useRef, useEffect, useCallback, useMemo } from "react";

const FONT_BODY = "system-ui, sans-serif";
const FONT_MONO = "'Courier New', monospace";
const FONT_HEAD = "'Arial Black', Impact, sans-serif";

const WORLD_X = 256;
const WORLD_Y = 16;
const WORLD_Z = 256;
const EYE_HEIGHT = 1.62;
const SPAWN_POINT = { cx: 24, cy: 6 + EYE_HEIGHT, cz: 8, yaw: 0.4, pitch: 0.15, vy: 0, vx: 0, vz: 0 };

function worldIndex(x, y, z) {
  return (y * WORLD_X * WORLD_Z + z * WORLD_X + x) | 0;
}

function inBounds(x, y, z) {
  return x >= 0 && x < WORLD_X && y >= 0 && y < WORLD_Y && z >= 0 && z < WORLD_Z;
}

const BLOCKS = {
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

const blockApi = {
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

const STEM_LESSONS = {
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

const MISSIONS = [
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

const INITIAL_INVENTORY = {
  wire: 24,
  lamp: 8,
  switch: 4,
  battery: 4,
  reactor: 2,
  solar: 6,
};

function buildWorld() {
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

function projectPoint(camera, width, height, x, y, z) {
  const dx = x - camera.cx;
  const dy = y - camera.cy;
  const dz = z - camera.cz;

  const cosY = Math.cos(camera.yaw);
  const sinY = Math.sin(camera.yaw);
  const rx = dx * cosY - dz * sinY;
  const rz = dx * sinY + dz * cosY;

  const cosP = Math.cos(-camera.pitch);
  const sinP = Math.sin(-camera.pitch);
  const ry = dy * cosP - rz * sinP;
  const depth = dy * sinP + rz * cosP;

  if (depth < 0.05) return null;
  const focal = Math.max(280, width * 0.58);
  return {
    sx: width / 2 + (rx / depth) * focal,
    sy: height / 2 - (ry / depth) * focal,
    z: depth,
  };
}

function drawPolygon(ctx, points, fill, stroke, lineWidth) {
  if (!points || points.length < 3) return false;
  ctx.beginPath();
  ctx.moveTo(points[0].sx, points[0].sy);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i].sx, points[i].sy);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  return true;
}

function shadeColor(r, g, b, factor, emit, t, distance, ambient = 1) {
  const pulse = emit > 0 ? 0.88 + 0.12 * Math.sin(t * 3) : 1;
  const fog = Math.max(0, 1 - (distance / 18) ** 2);
  const mix = factor * pulse * ambient * (0.15 + 0.85 * fog);
  return `rgb(${Math.min(255, (r * mix) | 0)},${Math.min(255, (g * mix) | 0)},${Math.min(255, (b * mix) | 0)})`;
}

function getDaylight(t) {
  const cycle = (t % 180) / 180;
  const angle = cycle * Math.PI * 2;
  return Math.max(0.12, 0.18 + Math.max(0, Math.sin(angle - Math.PI / 2)) * 0.92);
}

function isDirectPowerSource(block, daylight) {
  if (!block) return false;
  if (block.powerSource === "always" || block.powerSource === "switch" || block.powerSource === "battery") return true;
  if (block.powerSource === "day") return daylight > 0.55;
  return false;
}

function canCarryPower(block) {
  return Boolean(block?.conductsPower || block?.powerConsumer || block?.powerSource);
}

function powerKey(x, y, z) {
  return `${x},${y},${z}`;
}

function isBlockPowered(world, x, y, z, daylight, cache, visiting = new Set(), depth = 0) {
  if (!inBounds(x, y, z)) return false;
  const key = powerKey(x, y, z);
  if (cache.has(key)) return cache.get(key);
  if (visiting.has(key) || depth > 48) return false;
  const block = BLOCKS[world[worldIndex(x, y, z)]];
  if (!block || !canCarryPower(block)) {
    cache.set(key, false);
    return false;
  }
  if (isDirectPowerSource(block, daylight)) {
    cache.set(key, true);
    return true;
  }

  visiting.add(key);
  let powered = false;
  for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) {
    const nx = x + dx;
    const ny = y + dy;
    const nz = z + dz;
    if (!inBounds(nx, ny, nz)) continue;
    const neighbor = BLOCKS[world[worldIndex(nx, ny, nz)]];
    if (!neighbor || !canCarryPower(neighbor)) continue;
    if (isBlockPowered(world, nx, ny, nz, daylight, cache, visiting, depth + 1)) {
      powered = true;
      break;
    }
  }
  visiting.delete(key);
  cache.set(key, powered);
  return powered;
}

function resolveRenderedBlock(world, x, y, z, daylight, cache) {
  const blockId = world[worldIndex(x, y, z)];
  const block = BLOCKS[blockId];
  if (!block) return null;
  const powered = isBlockPowered(world, x, y, z, daylight, cache);

  if (blockId === 25) {
    return {
      ...block,
      emit: powered ? 0.18 : 0,
      rgb: powered ? [255, 174, 88] : block.rgb,
      note: powered ? "Copper wire is energized and carrying current." : block.note,
    };
  }
  if (blockId === 26) {
    return {
      ...block,
      name: powered ? "Lamp (On)" : "Lamp",
      emit: powered ? Math.max(block.emit, 0.95) : 0.02,
      rgb: powered ? [255, 238, 160] : block.rgb,
      note: powered ? "The lamp is lit because the circuit is complete." : block.note,
    };
  }
  if (blockId === 31) {
    return {
      ...block,
      emit: daylight > 0.55 ? 0.24 : 0.02,
      note: daylight > 0.55 ? "Solar panel is generating electricity in daylight." : "Solar panel is idle because there is not enough sunlight.",
    };
  }
  return block;
}

function hasNeighbor(world, x, y, z) {
  return inBounds(x, y, z) && Boolean(world[worldIndex(x, y, z)]);
}

function drawVoxel(ctx, world, camera, width, height, x, y, z, blockId, isTarget, t, daylight, powerCache) {
  const block = resolveRenderedBlock(world, x, y, z, daylight, powerCache);
  if (!blockId || !block) return null;
  if (Math.floor(camera.cx) === x && Math.floor(camera.cy) === y && Math.floor(camera.cz) === z) {
    return null;
  }
  const [r, g, b] = block.rgb;

  const relativeX = camera.cx - (x + 0.5);
  const relativeY = camera.cy - (y + 0.5);
  const relativeZ = camera.cz - (z + 0.5);

  const visibleFaces = [
    { show: relativeX > 0, corners: [1, 5, 7, 3], shade: hasNeighbor(world, x + 1, y, z) ? 0.66 : 0.82 },
    { show: relativeX < 0, corners: [4, 0, 2, 6], shade: hasNeighbor(world, x - 1, y, z) ? 0.56 : 0.68 },
    { show: relativeY > 0, corners: [2, 3, 7, 6], shade: hasNeighbor(world, x, y + 1, z) ? 0.84 : 1.1 },
    { show: relativeY < 0, corners: [0, 4, 5, 1], shade: hasNeighbor(world, x, y - 1, z) ? 0.42 : 0.55 },
    { show: relativeZ > 0, corners: [4, 5, 7, 6], shade: hasNeighbor(world, x, y, z + 1) ? 0.72 : 0.9 },
    { show: relativeZ < 0, corners: [1, 0, 2, 3], shade: hasNeighbor(world, x, y, z - 1) ? 0.61 : 0.75 },
  ];

  const corners = [];
  for (let i = 0; i < 8; i += 1) {
    corners.push(projectPoint(camera, width, height, x + (i & 1), y + ((i >> 1) & 1), z + ((i >> 2) & 1)));
  }
  const center = projectPoint(camera, width, height, x + 0.5, y + 0.5, z + 0.5);
  if (!center) return null;

  const edge = isTarget ? "rgba(255,245,115,0.98)" : "rgba(0,0,0,0.35)";
  const edgeWidth = isTarget ? 2 : 0.7;
  let drew = false;

  for (const face of visibleFaces) {
    if (!face.show) continue;
    const points = face.corners.map((index) => corners[index]);
    if (points.some((point) => !point)) continue;
    drawPolygon(ctx, points, shadeColor(r, g, b, face.shade, block.emit, t, center.z, 0.45 + daylight * 0.75), edge, edgeWidth);
    drew = true;
  }

  if (block.emit > 0 && center) {
    const pulse = 0.3 + 0.1 * Math.sin(t * 3);
    const radius = Math.max(5, 40 / center.z);
    const gradient = ctx.createRadialGradient(center.sx, center.sy, 0, center.sx, center.sy, radius);
    gradient.addColorStop(0, `rgba(${r},${g},${b},${pulse})`);
    gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(center.sx, center.sy, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  return drew ? center.z : null;
}

function getVisibleVoxels(world, camera) {
  const drawDistance = 18;
  const minX = Math.max(0, Math.floor(camera.cx - drawDistance));
  const maxX = Math.min(WORLD_X - 1, Math.floor(camera.cx + drawDistance));
  const minZ = Math.max(0, Math.floor(camera.cz - drawDistance));
  const maxZ = Math.min(WORLD_Z - 1, Math.floor(camera.cz + drawDistance));
  const voxels = [];
  const forwardX = Math.sin(camera.yaw);
  const forwardZ = Math.cos(camera.yaw);

  for (let x = minX; x <= maxX; x += 1) {
    for (let z = minZ; z <= maxZ; z += 1) {
      for (let y = 0; y < WORLD_Y; y += 1) {
        const blockId = world[worldIndex(x, y, z)];
        if (!blockId) continue;

        let exposed = false;
        for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) {
          const nx = x + dx;
          const ny = y + dy;
          const nz = z + dz;
          if (!inBounds(nx, ny, nz) || !world[worldIndex(nx, ny, nz)]) {
            exposed = true;
            break;
          }
        }
        if (!exposed) continue;

        const dx = x + 0.5 - camera.cx;
        const dy = y + 0.5 - camera.cy;
        const dz = z + 0.5 - camera.cz;
        const dist2 = dx * dx + dy * dy + dz * dz;
        const dot = dx * forwardX + dz * forwardZ;
        if (dot < -1.5 && dist2 > 4) continue;
        voxels.push({ x, y, z, blockId, dist2 });
      }
    }
  }

  voxels.sort((a, b) => b.dist2 - a.dist2);
  return voxels;
}

function raycast(world, cx, cy, cz, yaw, pitch, maxDistance = 12) {
  const dirX = Math.cos(pitch) * Math.sin(yaw);
  const dirY = -Math.sin(pitch);
  const dirZ = Math.cos(pitch) * Math.cos(yaw);

  let mapX = Math.floor(cx);
  let mapY = Math.floor(cy);
  let mapZ = Math.floor(cz);

  const stepX = dirX > 0 ? 1 : -1;
  const stepY = dirY > 0 ? 1 : -1;
  const stepZ = dirZ > 0 ? 1 : -1;
  const deltaX = Math.abs(dirX) < 1e-9 ? 1e30 : Math.abs(1 / dirX);
  const deltaY = Math.abs(dirY) < 1e-9 ? 1e30 : Math.abs(1 / dirY);
  const deltaZ = Math.abs(dirZ) < 1e-9 ? 1e30 : Math.abs(1 / dirZ);
  let maxX = dirX > 0 ? (mapX + 1 - cx) * deltaX : (cx - mapX) * deltaX;
  let maxY = dirY > 0 ? (mapY + 1 - cy) * deltaY : (cy - mapY) * deltaY;
  let maxZ = dirZ > 0 ? (mapZ + 1 - cz) * deltaZ : (cz - mapZ) * deltaZ;
  let placeX = 0;
  let placeY = 0;
  let placeZ = 0;
  const startedInsideSolid = inBounds(mapX, mapY, mapZ) && Boolean(world[worldIndex(mapX, mapY, mapZ)]);

  for (let i = 0; i < 100; i += 1) {
    if (!inBounds(mapX, mapY, mapZ)) break;
    const blockId = world[worldIndex(mapX, mapY, mapZ)];
    if (blockId && !(startedInsideSolid && i === 0)) {
      return {
        bx: mapX,
        by: mapY,
        bz: mapZ,
        blockId,
        pbx: mapX + placeX,
        pby: mapY + placeY,
        pbz: mapZ + placeZ,
      };
    }
    if (maxX < maxY && maxX < maxZ) {
      placeX = -stepX;
      placeY = 0;
      placeZ = 0;
      mapX += stepX;
      maxX += deltaX;
    } else if (maxY < maxZ) {
      placeX = 0;
      placeY = -stepY;
      placeZ = 0;
      mapY += stepY;
      maxY += deltaY;
    } else {
      placeX = 0;
      placeY = 0;
      placeZ = -stepZ;
      mapZ += stepZ;
      maxZ += deltaZ;
    }
    if (Math.min(maxX, maxY, maxZ) > maxDistance) break;
  }
  return null;
}

function isPlayerOccupyingBlock(camera, x, y, z) {
  const bodyMinY = Math.floor(camera.cy - EYE_HEIGHT + 0.05);
  const bodyMaxY = Math.floor(camera.cy - 0.1);
  return Math.floor(camera.cx) === x && Math.floor(camera.cz) === z && y >= bodyMinY && y <= bodyMaxY;
}

function getSurfaceBlock(world, x, y, z) {
  if (!inBounds(x, y, z)) return null;
  return BLOCKS[world[worldIndex(x, y, z)]] || null;
}

function getSurfaceProperties(world, camera) {
  const underX = Math.floor(camera.cx);
  const underZ = Math.floor(camera.cz);
  const underY = Math.max(0, Math.floor(camera.cy - EYE_HEIGHT - 0.08));
  const surface = getSurfaceBlock(world, underX, underY, underZ);
  return {
    surface,
    traction: surface?.traction ?? 0.85,
    drag: surface?.drag ?? 10,
    jump: surface?.jump ?? 8,
    bounce: surface?.bounce ?? 0.06,
  };
}

function isColumnBlocked(world, x, cy, z) {
  if (!inBounds(x, 0, z)) return false;
  const bodyMinY = Math.max(0, Math.floor(cy - EYE_HEIGHT + 0.05));
  const bodyMaxY = Math.min(WORLD_Y - 1, Math.floor(cy - 0.1));
  for (let y = bodyMinY; y <= bodyMaxY; y += 1) {
    if (world[worldIndex(x, y, z)]) return true;
  }
  return false;
}

function isBodyBlocked(world, cx, cy, cz, radius = 0.28) {
  const offsets = [
    [0, 0],
    [radius, 0],
    [-radius, 0],
    [0, radius],
    [0, -radius],
    [radius * 0.72, radius * 0.72],
    [-radius * 0.72, radius * 0.72],
    [radius * 0.72, -radius * 0.72],
    [-radius * 0.72, -radius * 0.72],
  ];
  return offsets.some(([dx, dz]) => isColumnBlocked(world, Math.floor(cx + dx), cy, Math.floor(cz + dz)));
}

function useViewportSize(ref) {
  const [size, setSize] = useState({ width: 960, height: 640 });

  useEffect(() => {
    if (!ref.current) return undefined;
    const node = ref.current;
    const update = () => {
      const rect = node.getBoundingClientRect();
      setSize({
        width: Math.max(420, Math.floor(rect.width)),
        height: Math.max(420, Math.floor(rect.height)),
      });
    };
    update();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    observer?.observe(node);
    window.addEventListener("resize", update);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [ref]);

  return size;
}

export default function OpenCraftStudio() {
  const worldRef = useRef(buildWorld());
  const canvasRef = useRef(null);
  const viewportRef = useRef(null);
  const pointerLockedRef = useRef(false);
  const keysRef = useRef({});
  const leftToolRef = useRef("place");
  const rightToolRef = useRef("erase");
  const selectedBlockRef = useRef(4);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);
  const startTimeRef = useRef(0);
  const mouseRef = useRef({ down: false, startX: 0, startY: 0, x: 0, y: 0, moved: false });
  const cameraRef = useRef({ ...SPAWN_POINT });
  const targetRef = useRef(null);
  const poweredLampSeenRef = useRef(false);

  const viewport = useViewportSize(viewportRef);

  const [selectedBlock, setSelectedBlock] = useState(4);
  const [leftTool, setLeftTool] = useState("place");
  const [rightTool, setRightTool] = useState("erase");
  const [showTools, setShowTools] = useState(false);
  const [activePanel, setActivePanel] = useState("missions");
  const [stemInfo, setStemInfo] = useState(null);
  const [notification, setNotification] = useState("");
  const [showQuickStart, setShowQuickStart] = useState(true);
  const [hotbarPage, setHotbarPage] = useState(0);
  const [comparison, setComparison] = useState(null);
  const [pointerLocked, setPointerLocked] = useState(false);
  const [builder, setBuilder] = useState({
    name: "Conductive Foam",
    color: "#ff8b3d",
    density: "240",
    hard: "2",
    emit: "0.15",
    note: "Low-density custom block. Try comparing it to copper and glass.",
    cat: "custom",
  });
  const [progress, setProgress] = useState({
    probedCategories: new Set(),
    customBlocks: 0,
    placedEmissive: 0,
    toolUses: 0,
    poweredLamps: 0,
    probedBlocks: [],
  });
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [forcedTick, setForcedTick] = useState(0);

  const notify = useCallback((message, duration = 2400) => {
    setNotification(message);
    window.clearTimeout(notify._timer);
    notify._timer = window.setTimeout(() => setNotification(""), duration);
  }, []);

  const missions = useMemo(() => MISSIONS.map((mission) => ({ ...mission, done: mission.isDone(progress) })), [progress]);
  const completedMissionCount = missions.filter((mission) => mission.done).length;

  const allBlocks = useMemo(() => Object.entries(BLOCKS).filter(([, value]) => value.name !== "Air" && !value.hiddenInPalette), [forcedTick]);
  const categories = useMemo(() => [...new Set(allBlocks.map(([, block]) => block.cat))], [allBlocks]);
  const hotbarBlocks = useMemo(() => {
    const pageSize = 10;
    return allBlocks.slice(hotbarPage * pageSize, hotbarPage * pageSize + pageSize);
  }, [allBlocks, hotbarPage]);
  const hotbarPageCount = Math.max(1, Math.ceil(allBlocks.length / 10));

  const cycleSelectedBlock = useCallback((delta) => {
    if (!allBlocks.length) return;
    const currentIndex = Math.max(0, allBlocks.findIndex(([id]) => Number(id) === selectedBlockRef.current));
    const nextIndex = (currentIndex + delta + allBlocks.length) % allBlocks.length;
    const nextId = Number(allBlocks[nextIndex][0]);
    setSelectedBlock(nextId);
  }, [allBlocks]);

  useEffect(() => {
    const selectedIndex = allBlocks.findIndex(([id]) => Number(id) === selectedBlock);
    if (selectedIndex < 0) return;
    const targetPage = Math.floor(selectedIndex / 10);
    if (targetPage !== hotbarPage) {
      setHotbarPage(targetPage);
    }
  }, [allBlocks, selectedBlock, hotbarPage]);

  useEffect(() => {
    leftToolRef.current = leftTool;
  }, [leftTool]);

  useEffect(() => {
    rightToolRef.current = rightTool;
  }, [rightTool]);

  useEffect(() => {
    selectedBlockRef.current = selectedBlock;
  }, [selectedBlock]);

  const registerProgress = useCallback((updater) => {
    setProgress((current) => {
      const next = updater(current);
      return {
        ...next,
        probedCategories: next.probedCategories instanceof Set ? next.probedCategories : new Set(next.probedCategories),
      };
    });
  }, []);

  const resetWorld = useCallback(() => {
    worldRef.current = buildWorld();
    cameraRef.current = { ...SPAWN_POINT };
    targetRef.current = null;
    poweredLampSeenRef.current = false;
    setStemInfo(null);
    setComparison(null);
    setShowQuickStart(true);
    setProgress((current) => ({
      probedCategories: new Set(),
      customBlocks: current.customBlocks,
      placedEmissive: 0,
      toolUses: 0,
      poweredLamps: 0,
      probedBlocks: [],
    }));
    setInventory(INITIAL_INVENTORY);
    notify("OpenCraft world reset.");
  }, [notify]);

  const applyTool = useCallback((toolId, target, world) => {
    if (!target || !world) return;
    const activeSelectedBlock = selectedBlockRef.current;
    if (toolId === "place") {
      const { pbx, pby, pbz } = target;
      const selected = BLOCKS[activeSelectedBlock];
      const inventoryKey = selected?.inventoryKey;
      if (inventoryKey && (inventory[inventoryKey] ?? 0) <= 0) {
        notify(`Out of ${selected?.name || "tech blocks"}. Mine one back or reset the world.`);
        return;
      }
      if (
        inBounds(pbx, pby, pbz) &&
        !world[worldIndex(pbx, pby, pbz)] &&
        !isPlayerOccupyingBlock(cameraRef.current, pbx, pby, pbz)
      ) {
        world[worldIndex(pbx, pby, pbz)] = activeSelectedBlock;
        const placed = BLOCKS[activeSelectedBlock];
        if (inventoryKey) {
          setInventory((current) => ({ ...current, [inventoryKey]: Math.max(0, (current[inventoryKey] ?? 0) - 1) }));
        }
        if (placed?.emit > 0) {
          registerProgress((current) => ({ ...current, placedEmissive: current.placedEmissive + 1 }));
        }
        notify(`Placed ${placed?.name || "block"}.`);
      }
      return;
    }
    if (toolId === "erase") {
      const removedBlock = BLOCKS[target.blockId];
      world[worldIndex(target.bx, target.by, target.bz)] = 0;
      if (removedBlock?.inventoryKey) {
        setInventory((current) => ({ ...current, [removedBlock.inventoryKey]: (current[removedBlock.inventoryKey] ?? 0) + 1 }));
      }
      notify(`Removed ${removedBlock?.name || "block"}.`);
      return;
    }
    if (toolId === "probe") {
      const block = BLOCKS[target.blockId];
      if (!block) return;
      setShowQuickStart(false);
      setComparison((previous) => {
        if (!previous?.right || previous.right.name !== block.name) {
          return previous?.left && previous.left.name !== block.name
            ? { left: previous.left, right: block }
            : previous?.left?.name === block.name
              ? previous
              : { left: block, right: null };
        }
        return previous;
      });
      registerProgress((current) => {
        const nextCategories = new Set(current.probedCategories);
        nextCategories.add(block.cat);
        const nextBlocks = current.probedBlocks.includes(block.name)
          ? current.probedBlocks
          : [...current.probedBlocks, block.name];
        return { ...current, probedCategories: nextCategories, probedBlocks: nextBlocks };
      });
      setStemInfo({
        lesson: STEM_LESSONS[block.cat] || STEM_LESSONS.mineral,
        block,
      });
      setActivePanel("science");
      notify(`Probed ${block.name}. STEM lesson unlocked.`);
      return;
    }
    if (toolId === "antimatter") {
      let removed = 0;
      for (let dx = -1; dx <= 1; dx += 1) {
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dz = -1; dz <= 1; dz += 1) {
            if (dx * dx + dy * dy + dz * dz > 2) continue;
            const nx = target.bx + dx;
            const ny = target.by + dy;
            const nz = target.bz + dz;
            if (!inBounds(nx, ny, nz)) continue;
            if (world[worldIndex(nx, ny, nz)]) {
              world[worldIndex(nx, ny, nz)] = 0;
              removed += 1;
            }
          }
        }
      }
      registerProgress((current) => ({ ...current, toolUses: current.toolUses + 1 }));
      notify(`Antimatter pulse removed ${removed} nearby blocks.`);
      return;
    }
    if (toolId === "antigravity") {
      const blockId = world[worldIndex(target.bx, target.by, target.bz)];
      const ny = Math.min(WORLD_Y - 1, target.by + 3);
      if (blockId && !world[worldIndex(target.bx, ny, target.bz)]) {
        world[worldIndex(target.bx, target.by, target.bz)] = 0;
        world[worldIndex(target.bx, ny, target.bz)] = blockId;
        registerProgress((current) => ({ ...current, toolUses: current.toolUses + 1 }));
        notify("Anti-gravity lift applied.");
      }
      return;
    }
    if (toolId === "gravity") {
      const blockId = world[worldIndex(target.bx, target.by, target.bz)];
      if (!blockId) return;
      let lowest = target.by - 1;
      while (lowest > 0 && !world[worldIndex(target.bx, lowest, target.bz)]) lowest -= 1;
      if (lowest + 1 < target.by) {
        world[worldIndex(target.bx, target.by, target.bz)] = 0;
        world[worldIndex(target.bx, lowest + 1, target.bz)] = blockId;
        registerProgress((current) => ({ ...current, toolUses: current.toolUses + 1 }));
        notify("Gravity gun dropped the block.");
      }
      return;
    }
    if (toolId === "toggle") {
      const block = BLOCKS[target.blockId];
      if (block?.toggleTo) {
        world[worldIndex(target.bx, target.by, target.bz)] = block.toggleTo;
        notify(`${BLOCKS[block.toggleTo]?.name || "Block"} toggled.`);
      }
    }
  }, [notify, registerProgress, inventory]);

  const registerCustomBlock = useCallback(() => {
    const hex = builder.color;
    const id = blockApi.register({
      name: builder.name,
      rgb: [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)],
      emit: parseFloat(builder.emit) || 0,
      density: parseFloat(builder.density) || 1000,
      hard: parseFloat(builder.hard) || 5,
      note: builder.note,
      cat: builder.cat,
    });
    setSelectedBlock(id);
    setForcedTick((value) => value + 1);
    registerProgress((current) => ({ ...current, customBlocks: current.customBlocks + 1 }));
    notify(`Registered ${builder.name} as block #${id}.`);
  }, [builder, notify, registerProgress]);

  useEffect(() => {
    const down = (event) => {
      if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA" || event.target.tagName === "SELECT") return;
      const key = event.key.toLowerCase();
      if (event.key === " ") event.preventDefault();
      keysRef.current[key] = true;
    };
    const up = (event) => {
      keysRef.current[event.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const onPointerLockChange = () => {
      const locked = document.pointerLockElement === canvas;
      pointerLockedRef.current = locked;
      setPointerLocked(locked);
      if (!locked) {
        mouseRef.current.down = false;
      }
    };
    const onDown = (event) => {
      if (event.target !== canvas) return;
      if (!pointerLockedRef.current) {
        canvas.requestPointerLock?.();
        event.preventDefault();
        return;
      }
      mouseRef.current = {
        down: true,
        startX: event.clientX,
        startY: event.clientY,
        x: event.clientX,
        y: event.clientY,
        moved: false,
      };
      event.preventDefault();
    };
    const onMove = (event) => {
      if (pointerLockedRef.current) {
        const dx = event.movementX || 0;
        const dy = event.movementY || 0;
        if (!dx && !dy) return;
        cameraRef.current.yaw += dx * 0.0035;
        cameraRef.current.pitch = Math.max(-1.1, Math.min(1.1, cameraRef.current.pitch + dy * 0.0028));
        mouseRef.current.moved = true;
        return;
      }
      if (!mouseRef.current.down) return;
      const dx = event.clientX - mouseRef.current.x;
      const dy = event.clientY - mouseRef.current.y;
      if (Math.abs(event.clientX - mouseRef.current.startX) > 3 || Math.abs(event.clientY - mouseRef.current.startY) > 3) {
        mouseRef.current.moved = true;
      }
      mouseRef.current.x = event.clientX;
      mouseRef.current.y = event.clientY;
      cameraRef.current.yaw += dx * 0.005;
      cameraRef.current.pitch = Math.max(-1.1, Math.min(1.1, cameraRef.current.pitch + dy * 0.004));
    };
    const onUp = () => {
      mouseRef.current.down = false;
    };
    document.addEventListener("pointerlockchange", onPointerLockChange);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const onMouseDown = (event) => {
      if (event.target !== canvas) return;
      if (!pointerLockedRef.current) {
        canvas.requestPointerLock?.();
        event.preventDefault();
        return;
      }
      const toolId = event.button === 2 ? rightToolRef.current : leftToolRef.current;
      applyTool(toolId, targetRef.current, worldRef.current);
      mouseRef.current.moved = false;
      event.preventDefault();
    };
    const onRightClick = (event) => {
      event.preventDefault();
    };
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("contextmenu", onRightClick);
    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("contextmenu", onRightClick);
    };
  }, [applyTool]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const onWheel = (event) => {
      if (document.pointerLockElement !== canvas) return;
      event.preventDefault();
      cycleSelectedBlock(event.deltaY > 0 ? 1 : -1);
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [cycleSelectedBlock]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderFrame = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const dt = Math.min(0.05, (timestamp - lastTimeRef.current) / 1000 || 0);
      lastTimeRef.current = timestamp;
      const t = (timestamp - startTimeRef.current) / 1000;
      const camera = cameraRef.current;
      const world = worldRef.current;
      const keys = keysRef.current;
      const daylight = getDaylight(t);
      const powerCache = new Map();

      const speed = keys.shift ? 10 : 5;
      const surfaceProps = getSurfaceProperties(world, camera);
      const sinY = Math.sin(camera.yaw);
      const cosY = Math.cos(camera.yaw);
      let moveX = 0;
      let moveZ = 0;
      if (keys.w || keys.arrowup) {
        moveX += sinY;
        moveZ += cosY;
      }
      if (keys.s || keys.arrowdown) {
        moveX -= sinY;
        moveZ -= cosY;
      }
      if (keys.a || keys.arrowleft) {
        moveX -= cosY;
        moveZ += sinY;
      }
      if (keys.d || keys.arrowright) {
        moveX += cosY;
        moveZ -= sinY;
      }
      if (moveX || moveZ) {
        const length = Math.hypot(moveX, moveZ);
        const accel = speed * (5 + surfaceProps.traction * 8);
        camera.vx += (moveX / length) * accel * dt;
        camera.vz += (moveZ / length) * accel * dt;
      }

      const horizontalDrag = Math.max(0.25, surfaceProps.drag);
      const dragFactor = Math.exp(-horizontalDrag * dt);
      camera.vx *= dragFactor;
      camera.vz *= dragFactor;

      const nextX = Math.max(0.6, Math.min(WORLD_X - 0.6, camera.cx + camera.vx * dt));
      const nextZ = Math.max(0.6, Math.min(WORLD_Z - 0.6, camera.cz + camera.vz * dt));
      if (!isBodyBlocked(world, nextX, camera.cy, camera.cz)) {
        camera.cx = nextX;
      } else {
        camera.vx = 0;
      }
      if (!isBodyBlocked(world, camera.cx, camera.cy, nextZ)) {
        camera.cz = nextZ;
      } else {
        camera.vz = 0;
      }

      const gravity = 22;
      if (keys.f || keys.c) {
        camera.vy = 0;
        if (keys.f) camera.cy += 5 * dt;
        if (keys.c) camera.cy -= 5 * dt;
      } else {
        camera.vy = (camera.vy || 0) - gravity * dt;
        const step = Math.sign(camera.vy) * Math.min(Math.abs(camera.vy * dt), 0.4);
        camera.cy += step;
      }

      const footX = Math.floor(camera.cx);
      const footZ = Math.floor(camera.cz);
      const feetY = camera.cy - EYE_HEIGHT;
      let topSolid = -1;
      for (let y = Math.min(WORLD_Y - 1, Math.floor(feetY) + 2); y >= 0; y -= 1) {
        if (world[worldIndex(footX, y, footZ)]) {
          topSolid = y;
          break;
        }
      }
      const groundLevel = topSolid + 1 + EYE_HEIGHT;
      const onGround = camera.cy <= groundLevel + 0.05 && camera.cy >= groundLevel - 0.5;
      if (onGround) {
        const impactSpeed = Math.abs(camera.vy || 0);
        camera.cy = groundLevel;
        if (camera.vy < 0) {
          camera.vy = impactSpeed > 6 ? impactSpeed * surfaceProps.bounce : 0;
        }
        if (keys[" "]) camera.vy = surfaceProps.jump;
      }
      const headY = Math.floor(camera.cy + 0.1);
      if (headY < WORLD_Y && world[worldIndex(footX, headY, footZ)] && camera.vy > 0) camera.vy = 0;
      camera.cy = Math.max(EYE_HEIGHT + 0.1, Math.min(WORLD_Y - 0.3, camera.cy));

      targetRef.current = raycast(world, camera.cx, camera.cy, camera.cz, camera.yaw, camera.pitch);

      const ctx = canvas.getContext("2d");
      const width = viewport.width;
      const height = viewport.height;

      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, daylight > 0.45 ? "#65b8ff" : "#081224");
      sky.addColorStop(0.35, daylight > 0.45 ? "#7dd1ff" : "#10203a");
      sky.addColorStop(0.68, daylight > 0.45 ? "#f6b070" : "#0b121d");
      sky.addColorStop(1, daylight > 0.45 ? "#192228" : "#05080b");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      const celestialAngle = ((t % 180) / 180) * Math.PI * 2 - Math.PI / 2;
      const sunX = width * 0.5 + Math.cos(celestialAngle) * width * 0.34;
      const sunY = height * 0.72 - Math.sin(celestialAngle) * height * 0.5;
      const moonX = width * 0.5 + Math.cos(celestialAngle + Math.PI) * width * 0.34;
      const moonY = height * 0.72 - Math.sin(celestialAngle + Math.PI) * height * 0.5;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 68);
      sunGlow.addColorStop(0, `rgba(255,236,158,${0.22 + daylight * 0.25})`);
      sunGlow.addColorStop(1, "rgba(255,236,158,0)");
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 68, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255,244,183,${0.25 + daylight * 0.75})`;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(220,232,255,${0.28 + (1 - daylight) * 0.72})`;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 14, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 80; i += 1) {
        const brightness = (0.08 + 0.5 * (Math.sin(i * 137.5 + t * 0.5) * 0.5 + 0.5)) * (1 - daylight);
        ctx.fillStyle = `rgba(255,255,255,${brightness})`;
        ctx.fillRect((Math.sin(i * 137.5) * 0.5 + 0.5) * width, (Math.cos(i * 97.3) * 0.5 + 0.5) * height * 0.5, 1, 1);
      }

      const groundPlane = [[0, 0, 0], [WORLD_X, 0, 0], [WORLD_X, 0, WORLD_Z], [0, 0, WORLD_Z]]
        .map(([x, y, z]) => projectPoint(camera, width, height, x, y, z))
        .filter(Boolean);
      if (groundPlane.length === 4) {
        ctx.fillStyle = daylight > 0.45 ? "#36503a" : "#091109";
        ctx.beginPath();
        ctx.moveTo(groundPlane[0].sx, groundPlane[0].sy);
        groundPlane.slice(1).forEach((point) => ctx.lineTo(point.sx, point.sy));
        ctx.closePath();
        ctx.fill();
      }

      let litLampSeenThisFrame = false;
      const voxels = getVisibleVoxels(world, camera);
      const target = targetRef.current;
      for (const voxel of voxels) {
        const isTarget = target && target.bx === voxel.x && target.by === voxel.y && target.bz === voxel.z;
        const rendered = resolveRenderedBlock(world, voxel.x, voxel.y, voxel.z, daylight, powerCache);
        if (rendered?.powerConsumer === "lamp" && rendered.emit > 0.5) {
          litLampSeenThisFrame = true;
        }
        drawVoxel(ctx, world, camera, width, height, voxel.x, voxel.y, voxel.z, voxel.blockId, isTarget, t, daylight, powerCache);
      }
      if (litLampSeenThisFrame && !poweredLampSeenRef.current) {
        poweredLampSeenRef.current = true;
        registerProgress((current) => ({ ...current, poweredLamps: current.poweredLamps + 1 }));
      }

      const centerX = width / 2;
      const centerY = height / 2;
      ctx.strokeStyle = "rgba(0,0,0,0.7)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX - 14, centerY);
      ctx.lineTo(centerX + 14, centerY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 14);
      ctx.lineTo(centerX, centerY + 14);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.92)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX - 13, centerY);
      ctx.lineTo(centerX + 13, centerY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 13);
      ctx.lineTo(centerX, centerY + 13);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fillRect(centerX - 1, centerY - 1, 2, 2);

      if (target) {
        const block = resolveRenderedBlock(world, target.bx, target.by, target.bz, daylight, powerCache);
        if (block) {
          const [r, g, b] = block.rgb;
          ctx.fillStyle = "rgba(0,0,0,0.72)";
          ctx.beginPath();
          ctx.roundRect(centerX - 145, height - 146, 290, 54, 10);
          ctx.fill();
          ctx.strokeStyle = `rgb(${r},${g},${b})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.font = `bold 13px ${FONT_HEAD}`;
          ctx.textAlign = "center";
          ctx.fillText(block.name.toUpperCase(), centerX, height - 123);
          ctx.fillStyle = "rgba(255,255,255,0.56)";
          ctx.font = `9px ${FONT_MONO}`;
          ctx.fillText(`rho=${block.density} kg/m^3  hard=${block.hard}  type=${block.cat}`, centerX, height - 109);
          ctx.fillText(block.note, centerX, height - 95);
        }
      }

      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(12, 12, 178, 34);
      ctx.fillStyle = "#4ade80";
      ctx.font = `10px ${FONT_MONO}`;
      ctx.textAlign = "left";
      ctx.fillText(`${camera.cx.toFixed(1)}, ${camera.cy.toFixed(1)}, ${camera.cz.toFixed(1)}`, 18, 26);
      ctx.fillStyle = "rgba(255,255,255,0.42)";
      ctx.font = `9px ${FONT_MONO}`;
      ctx.fillText(pointerLockedRef.current ? "WASD move  mouse look  Esc unlock" : "Click world to lock mouse", 18, 39);

      animationRef.current = window.requestAnimationFrame(renderFrame);
    };

    animationRef.current = window.requestAnimationFrame(renderFrame);
    return () => {
      window.cancelAnimationFrame(animationRef.current);
    };
  }, [viewport, notify, applyTool, registerProgress]);

  const styles = {
    frame: {
      height: "100%",
      display: "grid",
      gridTemplateRows: "68px minmax(0,1fr)",
      background: "linear-gradient(180deg, #07111d 0%, #08101a 45%, #06090f 100%)",
      color: "#e5fff1",
      fontFamily: FONT_BODY,
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "0 18px",
      borderBottom: "1px solid rgba(75,120,140,0.26)",
      background: "linear-gradient(180deg, rgba(9,22,36,0.96) 0%, rgba(7,14,24,0.96) 100%)",
      boxShadow: "0 12px 28px rgba(0,0,0,0.28)",
    },
    shell: {
      minHeight: 0,
      display: "grid",
      gridTemplateColumns: "minmax(0,1fr) 370px",
      gap: 16,
      padding: 16,
    },
    panel: {
      background: "linear-gradient(180deg, rgba(8,17,28,0.94) 0%, rgba(7,13,22,0.94) 100%)",
      border: "1px solid rgba(90,138,155,0.24)",
      borderRadius: 18,
      boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
      overflow: "hidden",
      minHeight: 0,
    },
    metricCard: {
      borderRadius: 14,
      border: "1px solid rgba(92,146,161,0.22)",
      background: "linear-gradient(180deg, rgba(11,23,35,0.9) 0%, rgba(10,18,29,0.9) 100%)",
      padding: "10px 12px",
    },
    button: {
      borderRadius: 12,
      border: "1px solid rgba(96,146,162,0.22)",
      background: "linear-gradient(180deg, rgba(16,31,47,0.95) 0%, rgba(12,24,38,0.95) 100%)",
      color: "#d6fff0",
      cursor: "pointer",
    },
    activeButton: {
      background: "linear-gradient(180deg, rgba(34,197,94,0.28) 0%, rgba(15,118,110,0.2) 100%)",
      border: "1px solid rgba(74,222,128,0.45)",
      color: "#9bf6b5",
    },
  };

  const toolButtons = [
    { id: "place", label: "Place", icon: "P", hint: "Add a selected block to the world." },
    { id: "erase", label: "Erase", icon: "X", hint: "Remove the targeted block." },
    { id: "probe", label: "Probe", icon: "?", hint: "Inspect a block and open the matching STEM lesson." },
    { id: "toggle", label: "Toggle", icon: "S", hint: "Flip switches on and off to open or close a circuit." },
    { id: "antimatter", label: "Antimatter", icon: "E", hint: "Teach energy density with a dramatic blast." },
    { id: "antigravity", label: "Lift", icon: "U", hint: "Move a block upward to explore force ideas." },
    { id: "gravity", label: "Drop", icon: "D", hint: "Let gravity settle a block to the surface." },
  ];

  const selectedBlockInfo = BLOCKS[selectedBlock];
  const target = targetRef.current;
  const selectedInventoryCount = selectedBlockInfo?.inventoryKey ? inventory[selectedBlockInfo.inventoryKey] ?? 0 : null;

  return (
    <div style={styles.frame}>
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: "linear-gradient(135deg, #20d7a6 0%, #2f7cf7 100%)", display: "grid", placeItems: "center", fontWeight: 900, color: "#04111b" }}>
            OC
          </div>
          <div>
            <div style={{ fontFamily: FONT_HEAD, letterSpacing: "0.14em", fontSize: 18, color: "#bfffe0" }}>OPENCRAFT</div>
            <div style={{ color: "rgba(215,255,241,0.62)", fontSize: 12 }}>Voxel sandbox for STEM intuition: materials, energy, density, and experimentation.</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
          <div style={styles.metricCard}>
            <div style={{ fontSize: 11, color: "rgba(211,255,239,0.62)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Missions</div>
            <div style={{ fontFamily: FONT_HEAD, fontSize: 18, color: "#98f5b7" }}>{completedMissionCount}/{missions.length}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={{ fontSize: 11, color: "rgba(211,255,239,0.62)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Probed</div>
            <div style={{ fontFamily: FONT_HEAD, fontSize: 18, color: "#8ae7ff" }}>{progress.probedCategories.size} categories</div>
          </div>
          <button onClick={resetWorld} style={{ ...styles.button, padding: "11px 14px", fontWeight: 700 }}>
            Reset World
          </button>
        </div>
      </div>

      <div style={styles.shell}>
        <div style={{ ...styles.panel, display: "grid", gridTemplateRows: "auto minmax(0,1fr)", minWidth: 0 }}>
          <div style={{ borderBottom: "1px solid rgba(90,138,155,0.2)", padding: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ color: "#7fdcf0", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800 }}>Use the world to learn</div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
              {toolButtons.map((button) => (
                <button
                  key={button.id}
                  onClick={() => setLeftTool(button.id)}
                  style={{
                    ...styles.button,
                    ...(leftTool === button.id ? styles.activeButton : null),
                    padding: "9px 12px",
                    minWidth: 96,
                    textAlign: "left",
                  }}
                  title={button.hint}
                >
                  <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: "0.08em" }}>TOOL</div>
                  <div style={{ fontWeight: 800 }}>{button.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div ref={viewportRef} style={{ position: "relative", minHeight: 0 }}>
            <canvas
              ref={canvasRef}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", cursor: pointerLocked ? "none" : "crosshair", imageRendering: "pixelated" }}
            />

            {notification ? (
              <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", padding: "8px 18px", borderRadius: 12, background: "rgba(0,0,0,0.82)", border: "1px solid rgba(74,222,128,0.4)", color: "#7cf6a1", fontSize: 12, pointerEvents: "none" }}>
                {notification}
              </div>
            ) : null}

            {showQuickStart ? (
              <div style={{ position: "absolute", top: 18, left: 18, width: 320, padding: 14, borderRadius: 16, background: "rgba(7,16,27,0.86)", border: "1px solid rgba(92,146,161,0.24)", backdropFilter: "blur(12px)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                  <div style={{ color: "#9be8ff", fontFamily: FONT_HEAD, fontSize: 12, letterSpacing: "0.08em" }}>STEM QUICK START</div>
                  <button onClick={() => setShowQuickStart(false)} style={{ ...styles.button, padding: "4px 8px", fontSize: 11 }}>Hide</button>
                </div>
              <div style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(227,255,246,0.82)" }}>
                  1. Click the world to lock the mouse like a real first-person game.
                  <br />
                  2. Left and right click can use different tools.
                  <br />
                  3. Use the mouse wheel while locked to scroll the hotbar.
                  <br />
                  4. Probe a glowing block to unlock a lesson.
                  <br />
                  5. Test ice, rubber, slime, and teflon to feel friction and bounce differences.
                </div>
              </div>
            ) : null}

            <div style={{ position: "absolute", right: 18, top: 18, display: "grid", gap: 8 }}>
              {["iso", "north", "top"].map((view) => (
                <button
                  key={view}
                  onClick={() => {
                    if (view === "iso") {
                      cameraRef.current.yaw = 0.4;
                      cameraRef.current.pitch = 0.15;
                    } else if (view === "north") {
                      cameraRef.current.yaw = 0;
                      cameraRef.current.pitch = 0.05;
                    } else {
                      cameraRef.current.yaw = 0;
                      cameraRef.current.pitch = -1.05;
                    }
                  }}
                  style={{ ...styles.button, width: 64, padding: "8px 0", fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}
                >
                  {view}
                </button>
              ))}
            </div>

            <div style={{ position: "absolute", left: "50%", bottom: 18, transform: "translateX(-50%)", display: "flex", gap: 6, padding: 8, borderRadius: 16, background: "rgba(0,0,0,0.68)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <button
                onClick={() => setHotbarPage((page) => (page - 1 + hotbarPageCount) % hotbarPageCount)}
                style={{ width: 34, height: 46, borderRadius: 12, border: "2px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.45)", color: "#dffef0", cursor: "pointer", fontWeight: 900 }}
              >
                {"<"}
              </button>
              {hotbarBlocks.map(([id, block]) => {
                const active = Number(id) === selectedBlock;
                const count = block.inventoryKey ? inventory[block.inventoryKey] ?? 0 : null;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedBlock(Number(id))}
                    title={`${block.name}: ${block.note}`}
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      border: active ? "2px solid rgba(255,255,255,0.95)" : "2px solid rgba(255,255,255,0.15)",
                      background: active ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.45)",
                      display: "grid",
                      placeItems: "center",
                      cursor: "pointer",
                      boxShadow: block.emit > 0 ? `0 0 ${block.emit * 14}px rgba(${block.rgb.join(",")},0.9)` : "none",
                      position: "relative",
                    }}
                  >
                    <div style={{ width: 26, height: 26, borderRadius: 8, background: `rgb(${block.rgb.join(",")})` }} />
                    {count !== null ? (
                      <div style={{ position: "absolute", right: 4, bottom: 2, fontSize: 10, fontWeight: 800, color: "#fdf7d2", textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}>
                        {count}
                      </div>
                    ) : null}
                  </button>
                );
              })}
              <button
                onClick={() => setHotbarPage((page) => (page + 1) % hotbarPageCount)}
                style={{ width: 34, height: 46, borderRadius: 12, border: "2px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.45)", color: "#dffef0", cursor: "pointer", fontWeight: 900 }}
              >
                {">"}
              </button>
            </div>

            <div style={{ position: "absolute", left: "50%", bottom: 78, transform: "translateX(-50%)", color: "rgba(230,255,244,0.62)", fontSize: 11, padding: "4px 12px", borderRadius: 999, background: "rgba(0,0,0,0.44)", border: "1px solid rgba(255,255,255,0.08)" }}>
              Hotbar {hotbarPage + 1}/{hotbarPageCount} • wheel while locked to cycle blocks
            </div>

            <div style={{ position: "absolute", left: 18, bottom: 18, display: "flex", gap: 8 }}>
              {[
                { axis: "X", color: "#f87171" },
                { axis: "Y", color: "#6ee7b7" },
                { axis: "Z", color: "#60a5fa" },
              ].map((item) => (
                <div key={item.axis} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${item.color}44`, background: "rgba(255,255,255,0.82)", color: item.color, display: "grid", placeItems: "center", fontFamily: FONT_HEAD, fontSize: 13 }}>
                  {item.axis}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ ...styles.panel, display: "grid", gridTemplateRows: "auto auto minmax(0,1fr)", minHeight: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: "1px solid rgba(90,138,155,0.2)" }}>
            {[
              ["missions", "Missions"],
              ["blocks", "Blocks"],
              ["builder", "Builder"],
              ["science", "Science"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActivePanel(id)}
                style={{
                  padding: "14px 8px",
                  background: activePanel === id ? "rgba(34,197,94,0.12)" : "transparent",
                  color: activePanel === id ? "#9cf6b8" : "rgba(230,255,244,0.62)",
                  border: "none",
                  borderBottom: activePanel === id ? "2px solid rgba(74,222,128,0.8)" : "2px solid transparent",
                  fontWeight: 800,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  fontSize: 11,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ padding: 16, borderBottom: "1px solid rgba(90,138,155,0.18)" }}>
            <div style={{ ...styles.metricCard, display: "grid", gap: 6 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(217,255,243,0.56)" }}>Mouse Actions</div>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "grid", gridTemplateColumns: "88px 1fr", gap: 10, alignItems: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#8ae7ff", textTransform: "uppercase", letterSpacing: "0.08em" }}>Left click</div>
                  <select
                    value={leftTool}
                    onChange={(event) => setLeftTool(event.target.value)}
                    style={{ borderRadius: 10, border: "1px solid rgba(90,138,155,0.25)", background: "rgba(6,11,20,0.9)", color: "#e4fff2", padding: "10px 12px", fontFamily: FONT_BODY, outline: "none" }}
                  >
                    {toolButtons.map((button) => (
                      <option key={`left-${button.id}`} value={button.id}>{button.label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "88px 1fr", gap: 10, alignItems: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#f9c97f", textTransform: "uppercase", letterSpacing: "0.08em" }}>Right click</div>
                  <select
                    value={rightTool}
                    onChange={(event) => setRightTool(event.target.value)}
                    style={{ borderRadius: 10, border: "1px solid rgba(90,138,155,0.25)", background: "rgba(6,11,20,0.9)", color: "#e4fff2", padding: "10px 12px", fontFamily: FONT_BODY, outline: "none" }}
                  >
                    {toolButtons.map((button) => (
                      <option key={`right-${button.id}`} value={button.id}>{button.label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ color: "rgba(230,255,244,0.64)", fontSize: 12, lineHeight: 1.55 }}>
                  Left: {toolButtons.find((item) => item.id === leftTool)?.hint}
                  <br />
                  Right: {toolButtons.find((item) => item.id === rightTool)?.hint}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ color: "rgba(230,255,244,0.64)", fontSize: 12 }}>
                  Locked mouse mode uses these bindings directly in the world.
                </div>
                <button onClick={() => setShowTools((open) => !open)} style={{ ...styles.button, padding: "10px 12px", fontWeight: 700 }}>
                  Tool Menu
                </button>
              </div>
            </div>

            {showTools ? (
              <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                {toolButtons.map((button) => (
                  <button
                    key={button.id}
                    onClick={() => {
                      setLeftTool(button.id);
                      setShowTools(false);
                    }}
                    style={{
                      ...styles.button,
                      ...(leftTool === button.id ? styles.activeButton : null),
                      padding: "11px 12px",
                      display: "grid",
                      gridTemplateColumns: "40px 1fr",
                      gap: 10,
                      textAlign: "left",
                    }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.06)", display: "grid", placeItems: "center", fontFamily: FONT_HEAD, fontSize: 16 }}>
                      {button.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800 }}>{button.label}</div>
                      <div style={{ fontSize: 12, color: "rgba(230,255,244,0.66)" }}>{button.hint}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div style={{ minHeight: 0, overflowY: "auto", padding: 16 }}>
            {activePanel === "missions" ? (
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ fontFamily: FONT_HEAD, letterSpacing: "0.08em", color: "#9be8ff", fontSize: 12 }}>GUIDED STEM MISSIONS</div>
                {missions.map((mission) => (
                  <div key={mission.id} style={{ ...styles.metricCard, borderColor: mission.done ? "rgba(74,222,128,0.38)" : "rgba(92,146,161,0.22)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 999, background: mission.done ? "rgba(74,222,128,0.18)" : "rgba(255,255,255,0.06)", border: mission.done ? "1px solid rgba(74,222,128,0.45)" : "1px solid rgba(255,255,255,0.12)", display: "grid", placeItems: "center", color: mission.done ? "#86efac" : "#9cb3bc", fontWeight: 900 }}>
                        {mission.done ? "Y" : mission.id === "probe-three" ? "1" : mission.id === "probe-reactive" ? "2" : mission.id === "light-build" ? "3" : mission.id === "custom-block" ? "4" : "5"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: mission.done ? "#b6ffd0" : "#e6fff4" }}>{mission.title}</div>
                        <div style={{ fontSize: 12, color: "rgba(230,255,244,0.62)", lineHeight: 1.5 }}>{mission.detail}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ ...styles.metricCard }}>
                  <div style={{ fontWeight: 800, color: "#9cf6b8", marginBottom: 6 }}>Why this teaches well</div>
                  <div style={{ fontSize: 13, color: "rgba(230,255,244,0.72)", lineHeight: 1.6 }}>
                    OpenCraft turns abstract material science into actions: probe, place, compare, and experiment. That makes density, energy, conductivity, and phase behavior feel concrete instead of memorized.
                  </div>
                </div>
              </div>
            ) : null}

            {activePanel === "blocks" ? (
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ fontFamily: FONT_HEAD, letterSpacing: "0.08em", color: "#9be8ff", fontSize: 12 }}>BLOCK LIBRARY</div>
                {categories.map((category) => (
                  <div key={category}>
                    <div style={{ marginBottom: 8, color: "rgba(222,255,247,0.56)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>{category}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 8 }}>
                      {allBlocks.filter(([, block]) => block.cat === category).map(([id, block]) => {
                        const active = Number(id) === selectedBlock;
                        const count = block.inventoryKey ? inventory[block.inventoryKey] ?? 0 : null;
                        return (
                          <button
                            key={id}
                            onClick={() => setSelectedBlock(Number(id))}
                            title={`${block.name}: ${block.note}`}
                            style={{
                              ...styles.button,
                              ...(active ? styles.activeButton : null),
                              padding: 8,
                              display: "grid",
                              gap: 6,
                              placeItems: "center",
                            }}
                          >
                            <div style={{ width: 24, height: 24, borderRadius: 8, background: `rgb(${block.rgb.join(",")})`, boxShadow: block.emit > 0 ? `0 0 ${block.emit * 10}px rgba(${block.rgb.join(",")},0.8)` : "none" }} />
                            <div style={{ fontSize: 11, fontWeight: 700 }}>{block.name}</div>
                            {count !== null ? <div style={{ fontSize: 11, color: "#f7e7a7" }}>x{count}</div> : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {selectedBlockInfo ? (
                  <div style={{ ...styles.metricCard, borderColor: `rgba(${selectedBlockInfo.rgb.join(",")},0.45)` }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: `rgb(${selectedBlockInfo.rgb.join(",")})`, boxShadow: selectedBlockInfo.emit > 0 ? `0 0 14px rgba(${selectedBlockInfo.rgb.join(",")},0.75)` : "none" }} />
                      <div>
                        <div style={{ fontWeight: 800, color: `rgb(${selectedBlockInfo.rgb.join(",")})` }}>{selectedBlockInfo.name}</div>
                        <div style={{ fontSize: 12, color: "rgba(230,255,244,0.64)" }}>rho={selectedBlockInfo.density} kg/m^3, hard={selectedBlockInfo.hard}, cat={selectedBlockInfo.cat}</div>
                        {selectedInventoryCount !== null ? (
                          <div style={{ fontSize: 12, color: "#f8e7a5" }}>inventory={selectedInventoryCount}</div>
                        ) : null}
                        {(selectedBlockInfo.traction || selectedBlockInfo.drag || selectedBlockInfo.bounce) ? (
                          <div style={{ fontSize: 12, color: "rgba(154,231,255,0.8)" }}>
                            traction={selectedBlockInfo.traction ?? 0.85} drag={selectedBlockInfo.drag ?? 10} bounce={selectedBlockInfo.bounce ?? 0.06}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: "rgba(230,255,244,0.76)" }}>{selectedBlockInfo.note}</div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {activePanel === "builder" ? (
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ fontFamily: FONT_HEAD, letterSpacing: "0.08em", color: "#9be8ff", fontSize: 12 }}>CUSTOM BLOCK LAB</div>
                {[
                  ["name", "Name"],
                  ["note", "Science note"],
                ].map(([field, label]) => (
                  <label key={field} style={{ display: "grid", gap: 5 }}>
                    <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(222,255,247,0.56)" }}>{label}</span>
                    <input
                      value={builder[field]}
                      onChange={(event) => setBuilder((current) => ({ ...current, [field]: event.target.value }))}
                      style={{ borderRadius: 10, border: "1px solid rgba(90,138,155,0.25)", background: "rgba(6,11,20,0.9)", color: "#e4fff2", padding: "10px 12px", fontFamily: FONT_BODY, outline: "none" }}
                    />
                  </label>
                ))}
                <label style={{ display: "grid", gap: 5 }}>
                  <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(222,255,247,0.56)" }}>Color</span>
                  <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 10, alignItems: "center" }}>
                    <input type="color" value={builder.color} onChange={(event) => setBuilder((current) => ({ ...current, color: event.target.value }))} style={{ width: 60, height: 40, padding: 0, border: "1px solid rgba(90,138,155,0.25)", borderRadius: 10, background: "transparent" }} />
                    <div style={{ height: 40, borderRadius: 12, background: builder.color }} />
                  </div>
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[
                    ["density", "Density"],
                    ["hard", "Hardness"],
                    ["emit", "Emission"],
                  ].map(([field, label]) => (
                    <label key={field} style={{ display: "grid", gap: 5 }}>
                      <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(222,255,247,0.56)" }}>{label}</span>
                      <input
                        type="number"
                        value={builder[field]}
                        onChange={(event) => setBuilder((current) => ({ ...current, [field]: event.target.value }))}
                        style={{ borderRadius: 10, border: "1px solid rgba(90,138,155,0.25)", background: "rgba(6,11,20,0.9)", color: "#e4fff2", padding: "10px 12px", fontFamily: FONT_BODY, outline: "none" }}
                      />
                    </label>
                  ))}
                </div>
                <label style={{ display: "grid", gap: 5 }}>
                  <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(222,255,247,0.56)" }}>Category</span>
                  <select value={builder.cat} onChange={(event) => setBuilder((current) => ({ ...current, cat: event.target.value }))} style={{ borderRadius: 10, border: "1px solid rgba(90,138,155,0.25)", background: "rgba(6,11,20,0.9)", color: "#e4fff2", padding: "10px 12px", fontFamily: FONT_BODY, outline: "none" }}>
                    {["custom", "metal", "mineral", "organic", "liquid", "gas", "plasma", "nuclear", "exotic", "solid"].map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <button onClick={registerCustomBlock} style={{ ...styles.button, ...styles.activeButton, padding: "12px 14px", fontWeight: 800 }}>
                  Register Block and Equip It
                </button>
                <div style={{ ...styles.metricCard, fontSize: 12, lineHeight: 1.65, color: "rgba(230,255,244,0.7)" }}>
                  Teaching idea: build a custom block for a classroom topic like "Aerogel", "Battery Cell", or "Composite Panel", then write the exact science note you want students to remember.
                </div>
              </div>
            ) : null}

            {activePanel === "science" ? (
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ fontFamily: FONT_HEAD, letterSpacing: "0.08em", color: "#9be8ff", fontSize: 12 }}>SCIENCE PANEL</div>
                {comparison?.left ? (
                  <div style={{ ...styles.metricCard }}>
                    <div style={{ fontWeight: 800, color: "#9cf6b8", marginBottom: 8 }}>Block comparison</div>
                    <div style={{ display: "grid", gridTemplateColumns: comparison.right ? "1fr 1fr" : "1fr", gap: 10 }}>
                      {[comparison.left, comparison.right].filter(Boolean).map((block) => (
                        <div key={block.name} style={{ borderRadius: 12, padding: 10, background: "rgba(255,255,255,0.04)", border: `1px solid rgba(${block.rgb.join(",")},0.35)` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <div style={{ width: 22, height: 22, borderRadius: 7, background: `rgb(${block.rgb.join(",")})` }} />
                            <div style={{ fontWeight: 800, color: `rgb(${block.rgb.join(",")})` }}>{block.name}</div>
                          </div>
                          <div style={{ fontSize: 12, lineHeight: 1.7, color: "rgba(230,255,244,0.78)" }}>
                            Density: {block.density} kg/m^3
                            <br />
                            Hardness: {block.hard}
                            <br />
                            Category: {block.cat}
                            <br />
                            {block.note}
                          </div>
                        </div>
                      ))}
                    </div>
                    {comparison.right ? (
                      <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.7, color: "rgba(230,255,244,0.74)" }}>
                        You just compared <strong>{comparison.left.name}</strong> and <strong>{comparison.right.name}</strong>. Use the density, hardness, and category differences to explain why materials can be heavier, tougher, brighter, or more conductive for completely different structural reasons.
                      </div>
                    ) : (
                      <div style={{ marginTop: 10, fontSize: 12, color: "rgba(230,255,244,0.56)" }}>
                        Probe one more block to turn this into a side-by-side comparison.
                      </div>
                    )}
                  </div>
                ) : null}
                {stemInfo ? (
                  <>
                    {stemInfo.block ? (
                      <div style={{ ...styles.metricCard, borderColor: `rgba(${stemInfo.block.rgb.join(",")},0.45)` }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <div style={{ width: 32, height: 32, borderRadius: 10, background: `rgb(${stemInfo.block.rgb.join(",")})` }} />
                          <div>
                            <div style={{ fontWeight: 800, color: `rgb(${stemInfo.block.rgb.join(",")})` }}>{stemInfo.block.name}</div>
                            <div style={{ fontSize: 12, color: "rgba(230,255,244,0.62)" }}>Category: {stemInfo.block.cat}</div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                    <div style={{ ...styles.metricCard }}>
                      <div style={{ fontFamily: FONT_HEAD, color: "#98f5b7", fontSize: 16, marginBottom: 8 }}>{stemInfo.lesson.title}</div>
                      <div style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(230,255,244,0.8)", marginBottom: 10 }}>{stemInfo.lesson.body}</div>
                      <div style={{ display: "grid", gap: 6 }}>
                        {stemInfo.lesson.formulas.map((formula) => (
                          <div key={formula} style={{ borderLeft: "3px solid rgba(74,222,128,0.7)", paddingLeft: 8, fontFamily: FONT_MONO, fontSize: 12, color: "#9cf6b8" }}>
                            {formula}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ ...styles.metricCard, fontSize: 13, lineHeight: 1.7, color: "rgba(230,255,244,0.76)" }}>
                    Use the Science Probe tool on any block in the world. OpenCraft will map the material to a short lesson so the sandbox becomes a teachable STEM lab instead of just a game.
                  </div>
                )}

                <div style={{ ...styles.metricCard }}>
                  <div style={{ fontWeight: 800, color: "#9cf6b8", marginBottom: 8 }}>Recent discoveries</div>
                  {progress.probedBlocks.length ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {progress.probedBlocks.map((name) => (
                        <div key={name} style={{ padding: "7px 10px", borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 12 }}>
                          {name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: "rgba(230,255,244,0.56)" }}>No probes yet. Start with Uranium, Copper, Ice, Rubber, or Slime.</div>
                  )}
                </div>

                {target ? (
                  <div style={{ ...styles.metricCard }}>
                    <div style={{ fontWeight: 800, color: "#9cf6b8", marginBottom: 6 }}>Current target</div>
                    <div style={{ fontSize: 13, color: "rgba(230,255,244,0.78)", lineHeight: 1.6 }}>
                      {BLOCKS[target.blockId]?.name} at ({target.bx}, {target.by}, {target.bz})
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
