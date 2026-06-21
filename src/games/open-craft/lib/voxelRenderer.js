// The WebGL rendering layer — replaces the old hand-rolled Canvas2D
// rasterizer (projectPoint/drawPolygon/drawVoxel). One THREE.InstancedMesh
// per block type (not per voxel) is the standard, necessary technique for
// voxel-world performance in WebGL: one draw call per block *type* instead
// of per *block* — this is what actually makes "bigger map" real, per the
// open-craft renderer-migration plan.
//
// Gameplay logic (world data, power-flow, physics, raycast) is untouched —
// this module only turns "which voxels are visible, what color/glow do
// they have right now" into GPU draw calls.
import * as THREE from 'three'
import { BLOCKS, WORLD_X, WORLD_Y, WORLD_Z } from './blocks.js'
import { resolveRenderedBlock } from './power.js'
import { getVisibleVoxels } from './visibleVoxels.js'

const MAX_INSTANCES_PER_TYPE = 20000
// Only blocks with significant emit get a real THREE.PointLight (capped
// count below) — most "glow" is just instance color, which is far cheaper
// than a real light per block and is what the old renderer did too (a
// radial gradient, not real illumination of neighbors).
const MAX_DYNAMIC_LIGHTS = 24
const LIGHT_EMIT_THRESHOLD = 0.5

const tmpMatrix = new THREE.Matrix4()
const tmpColor = new THREE.Color()
const tmpPos = new THREE.Vector3()

export function createVoxelRenderer(container) {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(70, container.clientWidth / container.clientHeight, 0.05, 200)
  const lookTarget = new THREE.Vector3()

  // antialias off and pixel ratio capped at 1: MSAA + full devicePixelRatio
  // (2-3 on most laptops/phones) multiply every pixel-shading cost across
  // ~20 InstancedMesh draw calls every frame — the single biggest GPU-cost
  // lever available here, and blocky voxel art doesn't need either.
  const renderer = new THREE.WebGLRenderer({ antialias: false })
  renderer.setPixelRatio(1)
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.shadowMap.enabled = false
  container.appendChild(renderer.domElement)

  // Lighting: ambient + a directional "sun" whose intensity follows the
  // existing daylight cycle, replacing the manual brightness multiply that
  // used to happen inside shadeColor() per polygon.
  const ambient = new THREE.AmbientLight(0xffffff, 0.5)
  const sun = new THREE.DirectionalLight(0xffffff, 1)
  sun.position.set(0.4, 1, 0.3)
  scene.add(ambient, sun)

  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const meshes = new Map() // blockId -> InstancedMesh
  // Reused across frames (cleared via .length = 0, not reallocated) to cut
  // per-frame GC churn — this Map/array-of-arrays used to be rebuilt from
  // scratch every frame on top of getVisibleVoxels()'s own ~1800-object
  // allocation, doubling avoidable garbage in the hot path.
  const byType = new Map() // blockId -> reused voxel array
  const powerCache = new Map()
  const dynamicLights = []
  for (let i = 0; i < MAX_DYNAMIC_LIGHTS; i += 1) {
    const light = new THREE.PointLight(0xffffff, 0, 6, 2)
    light.visible = false
    scene.add(light)
    dynamicLights.push(light)
  }

  function ensureMeshForBlock(blockId) {
    if (meshes.has(blockId)) return meshes.get(blockId)
    // Lambert (diffuse-only) instead of Standard (full PBR roughness/
    // metalness lighting model) — the old renderer's shading was a flat
    // brightness multiply, not real PBR, so Standard was paying for a
    // lighting quality this game never used, on every pixel of every block.
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff })
    const mesh = new THREE.InstancedMesh(geometry, material, MAX_INSTANCES_PER_TYPE)
    mesh.count = 0
    mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX_INSTANCES_PER_TYPE * 3), 3)
    mesh.frustumCulled = false
    scene.add(mesh)
    meshes.set(blockId, mesh)
    return mesh
  }

  function setSky(daylight) {
    const day = new THREE.Color(0x65b8ff)
    const night = new THREE.Color(0x05080b)
    scene.background = day.clone().lerp(night, 1 - Math.min(1, daylight / 0.9))
    sun.intensity = 0.25 + daylight * 1.1
    ambient.intensity = 0.35 + daylight * 0.35
  }

  /**
   * Called once per frame with the current world/camera/time state.
   * `visibleVoxels` is optional — pass the result of getVisibleVoxels() if
   * the caller already computed it this frame (avoids scanning twice).
   */
  function update(world, cam, daylight, t, visibleVoxels) {
    setSky(daylight)

    camera.position.set(cam.cx, cam.cy, cam.cz)
    // Point the camera at the same forward vector raycastVoxels() uses, via
    // plain lookAt(). (An earlier attempt built a custom basis matrix from
    // the original hand-rolled renderer's right/up/forward vectors, but
    // that triple has a determinant of -1 — it's a mirror image, not a
    // proper rotation — and quaternions can't represent a reflection, which
    // produced garbled/inconsistent camera orientation live. lookAt() is
    // always a valid proper rotation, so it's the correct primitive here.)
    // This makes the renderer's "screen right" the STANDARD 3D convention
    // (cross(forward, up)), which is the mirror of the original renderer's
    // hand-rolled "right" — that mismatch is corrected at the input layer
    // instead: the A/D strafe keys in OpenCraftStudio.jsx were swapped to
    // match this standard convention.
    const dirX = Math.cos(cam.pitch) * Math.sin(cam.yaw)
    const dirY = -Math.sin(cam.pitch)
    const dirZ = Math.cos(cam.pitch) * Math.cos(cam.yaw)
    lookTarget.set(cam.cx + dirX, cam.cy + dirY, cam.cz + dirZ)
    camera.up.set(0, 1, 0)
    camera.lookAt(lookTarget)

    const visible = visibleVoxels ?? getVisibleVoxels(world, cam)
    for (const list of byType.values()) list.length = 0
    for (const voxel of visible) {
      let list = byType.get(voxel.blockId)
      if (!list) {
        list = []
        byType.set(voxel.blockId, list)
      }
      list.push(voxel)
    }

    powerCache.clear()
    let lightIndex = 0

    for (const [blockId, list] of byType) {
      const mesh = ensureMeshForBlock(blockId)
      const count = Math.min(list.length, MAX_INSTANCES_PER_TYPE)
      for (let i = 0; i < count; i += 1) {
        const voxel = list[i]
        const rendered = resolveRenderedBlock(world, voxel.x, voxel.y, voxel.z, daylight, powerCache)
        tmpPos.set(voxel.x + 0.5, voxel.y + 0.5, voxel.z + 0.5)
        tmpMatrix.makeTranslation(tmpPos.x, tmpPos.y, tmpPos.z)
        mesh.setMatrixAt(i, tmpMatrix)
        const [r, g, b] = rendered.rgb
        tmpColor.setRGB(r / 255, g / 255, b / 255)
        mesh.setColorAt(i, tmpColor)

        if (rendered.emit > LIGHT_EMIT_THRESHOLD && lightIndex < MAX_DYNAMIC_LIGHTS) {
          const light = dynamicLights[lightIndex]
          light.visible = true
          light.position.copy(tmpPos)
          light.intensity = rendered.emit * 1.8
          light.color.setRGB(r / 255, g / 255, b / 255)
          lightIndex += 1
        }
      }
      mesh.count = count
      // Without this, three.js re-uploads the full MAX_INSTANCES_PER_TYPE
      // buffer to the GPU every frame for every block type present, even
      // when only a few hundred of the 20000 slots are actually used —
      // this was the main cause of the live "laggy" report. (updateRange
      // is a getter-only legacy alias in this three.js version; the
      // addUpdateRange/clearUpdateRanges pair is the current API.)
      mesh.instanceMatrix.clearUpdateRanges()
      mesh.instanceMatrix.addUpdateRange(0, count * 16)
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) {
        mesh.instanceColor.clearUpdateRanges()
        mesh.instanceColor.addUpdateRange(0, count * 3)
        mesh.instanceColor.needsUpdate = true
      }
    }
    // byType now persists across frames (entries cleared via .length = 0,
    // not deleted) so every block type ever seen gets mesh.count set above —
    // including 0 for types not visible this frame — making a separate
    // "hide unused meshes" pass unnecessary.
    for (let i = lightIndex; i < MAX_DYNAMIC_LIGHTS; i += 1) dynamicLights[i].visible = false

    renderer.render(scene, camera)
  }

  function resize(width, height) {
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }

  function dispose() {
    for (const mesh of meshes.values()) {
      mesh.geometry.dispose()
      mesh.material.dispose()
    }
    geometry.dispose()
    renderer.dispose()
    if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
  }

  return { update, resize, dispose, camera, dom: renderer.domElement }
}
