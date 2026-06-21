// Real power-flow simulation — a 6-directional graph traversal over the
// voxel grid, with cycle detection. This is pure data/graph logic with no
// idea how blocks get drawn, so it survives the WebGL migration unchanged.
// Verified working before this extraction (switch/solar/battery -> wire ->
// lamp circuits genuinely light up based on this computation, not cosmetics).
import { BLOCKS, inBounds, worldIndex } from './blocks.js'

export function getDaylight(t) {
  const cycle = (t % 180) / 180;
  const angle = cycle * Math.PI * 2;
  return Math.max(0.12, 0.18 + Math.max(0, Math.sin(angle - Math.PI / 2)) * 0.92);
}

export function isDirectPowerSource(block, daylight) {
  if (!block) return false;
  if (block.powerSource === "always" || block.powerSource === "switch" || block.powerSource === "battery") return true;
  if (block.powerSource === "day") return daylight > 0.55;
  return false;
}

export function canCarryPower(block) {
  return Boolean(block?.conductsPower || block?.powerConsumer || block?.powerSource);
}

function powerKey(x, y, z) {
  return `${x},${y},${z}`;
}

export function isBlockPowered(world, x, y, z, daylight, cache, visiting = new Set(), depth = 0) {
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

/**
 * Resolves the rendered appearance (color + emission + label) of a block
 * given its current power state. Renderer-agnostic — returns plain data
 * (rgb array, emit float, name/note strings), not draw calls. Used by the
 * Three.js layer to set instance color and decide which blocks need a
 * light source.
 *
 * NOTE on the depth-limit silent-fail bug from the prior audit: if a
 * circuit chain exceeds depth 48, isBlockPowered() returns false with no
 * warning. Real bug, not fixed in this extraction (Phase A is migration-
 * only, parity with current behavior) — tracked for Phase B.
 */
export function resolveRenderedBlock(world, x, y, z, daylight, cache) {
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
