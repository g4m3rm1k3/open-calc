// Voxel-grid DDA raycast — pure math against the Uint8Array world, used for
// block targeting/placement. Kept exactly as before rather than switching
// to Three.js's mesh-based Raycaster: this is already correct, doesn't
// care how blocks are drawn, and avoids any float-precision mismatch
// between mesh-instance hits and grid coordinates. Real risk reduction for
// the renderer migration — gameplay-critical logic doesn't change at all.
import { inBounds, worldIndex } from './blocks.js'

export function raycastVoxels(world, cx, cy, cz, yaw, pitch, maxDistance = 12) {
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
