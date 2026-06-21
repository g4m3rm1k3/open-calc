// Determines which voxels actually need a GPU instance this frame: only
// blocks with at least one exposed face, within draw distance, and not
// behind the camera. Same culling strategy as the old Canvas2D renderer
// (kept identical for Phase A parity) — feeds the InstancedMesh rebuild
// instead of a per-voxel canvas draw call.
import { WORLD_X, WORLD_Y, WORLD_Z, inBounds, worldIndex } from './blocks.js'

const NEIGHBOR_OFFSETS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]

export function getVisibleVoxels(world, camera, drawDistance = 18) {
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
        for (const [dx, dy, dz] of NEIGHBOR_OFFSETS) {
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

  // The old Canvas2D renderer sorted back-to-front here to fake depth
  // (painter's algorithm). WebGL has a real depth buffer, so draw order
  // doesn't matter anymore — sorting was deliberately dropped, not missed.
  return voxels;
}
