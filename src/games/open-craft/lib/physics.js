// Player movement/collision math against the voxel grid — pure data, no
// rendering. Extracted unchanged for the WebGL migration.
import { BLOCKS, EYE_HEIGHT, WORLD_Y, inBounds, worldIndex } from './blocks.js'

export function isPlayerOccupyingBlock(camera, x, y, z) {
  const bodyMinY = Math.floor(camera.cy - EYE_HEIGHT + 0.05);
  const bodyMaxY = Math.floor(camera.cy - 0.1);
  return Math.floor(camera.cx) === x && Math.floor(camera.cz) === z && y >= bodyMinY && y <= bodyMaxY;
}

export function getSurfaceBlock(world, x, y, z) {
  if (!inBounds(x, y, z)) return null;
  return BLOCKS[world[worldIndex(x, y, z)]] || null;
}

export function getSurfaceProperties(world, camera) {
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

export function isBodyBlocked(world, cx, cy, cz, radius = 0.28) {
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
