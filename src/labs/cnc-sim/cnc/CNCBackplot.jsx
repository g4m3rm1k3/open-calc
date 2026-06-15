import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";

export default function CNCBackplot({
  pathPoints = [],
  currentStep = 0,
  activeChannel = 0,
  isDark = true,
  width = "100%",
  height = "400px",
  toolDiameter = 10,
  toolLength = 75,
  toolLenCut = null,
  toolPosition = null,
  stockShape = "box",
  stockDimensions = { width: 100, height: 80, depth: 40 },
  stockOrigin = { x: 0, y: 0, z: 0 },
  showGrid = true,
  showTool = true,
  showStock = true,
  showCuts = true,
  stockSTLBuffer = null,
  // Fixture models: [{id, name, format, buffer, position:[x,y,z], rotation:[rx,ry,rz], scale:[sx,sy,sz], w, h, d}]
  fixtures = [],
  coordinateFrames = [],
  selectedFixtureId = null,
  onSelectFixture = null, // (id|null) => void
  onFixtureTransform = null, // (id, {pos, rot, scl}) => void
  transformMode = "translate", // 'translate' | 'rotate' | 'scale'
  snapGrid = 0, // 0 = off, otherwise mm increment
  facePickMode = false,
}) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const pathLayerRef = useRef(null);
  const stockLayerRef = useRef(null);
  const cutsLayerRef = useRef(null);
  const cutsGeoRef = useRef(null);
  const toolRef = useRef(null);
  const gridRef = useRef(null);
  const rafRef = useRef(null);
  // Fixture / transform refs
  const fixtureLayerRef = useRef(null);
  const coordinateFrameLayerRef = useRef(null);
  const transformControlsRef = useRef(null);
  const fixtureObjectsRef = useRef(new Map()); // id → THREE.Object3D
  const facePickModeRef = useRef(false);
  const onSelectFixtureRef = useRef(null);
  const onFixtureTransformRef = useRef(null);
  const pathFittedRef = useRef(false);
  const mountedRef = useRef(false);
  // Face-alignment overlay state (managed inside this component)
  const [pendingFace, setPendingFace] = useState(null);

  // Keep callback refs fresh so the bootstrap closure always has the latest values
  useEffect(() => {
    onSelectFixtureRef.current = onSelectFixture;
  }, [onSelectFixture]);
  useEffect(() => {
    onFixtureTransformRef.current = onFixtureTransform;
  }, [onFixtureTransform]);
  useEffect(() => {
    facePickModeRef.current = facePickMode;
  }, [facePickMode]);

  // Colors based on theme
  const colors = {
    bg: isDark ? 0x0f172a : 0xf1f5f9,
    grid: isDark ? 0x334155 : 0x94a3b8,
    gridAlt: isDark ? 0x1e293b : 0xcbd5e1,
    rapid: isDark ? 0xfacc15 : 0xd97706, // G00
    feed: isDark ? 0x38bdf8 : 0x2563eb, // G01/02/03
    stockFill: isDark ? 0x3b82f6 : 0x2563eb,
    stockEdge: isDark ? 0x93c5fd : 0x1d4ed8,
    channels: [0x63b8ff, 0x46d89f, 0xf0b44c, 0xb89cff],
  };

  // ── Bootstrap Three.js (once) ─────────────────────────────────────────────
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    mountedRef.current = true;

    const w = el.clientWidth || 700;
    const h = height.endsWith("%")
      ? el.clientHeight || 400
      : parseInt(height) || 400;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(colors.bg, 1);
    el.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(colors.bg, 0.0015);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 10000);
    camera.up.set(0, 0, 1);
    camera.position.set(300, -300, 400);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(100, 100, 300);
    scene.add(dir);

    const grid = new THREE.GridHelper(500, 50, colors.grid, colors.gridAlt);
    grid.rotation.x = Math.PI / 2;
    scene.add(grid);
    gridRef.current = grid;

    const pathLayer = new THREE.Group();
    scene.add(pathLayer);
    pathLayerRef.current = pathLayer;

    const stockLayer = new THREE.Group();
    scene.add(stockLayer);
    stockLayerRef.current = stockLayer;

    const cutsLayer = new THREE.Group();
    scene.add(cutsLayer);
    cutsLayerRef.current = cutsLayer;

    const toolGroup = new THREE.Group();
    scene.add(toolGroup);
    toolRef.current = toolGroup;

    const fixtureLayer = new THREE.Group();
    scene.add(fixtureLayer);
    fixtureLayerRef.current = fixtureLayer;

    const coordinateFrameLayer = new THREE.Group();
    scene.add(coordinateFrameLayer);
    coordinateFrameLayerRef.current = coordinateFrameLayer;

    // ── TransformControls ─────────────────────────────────────────────────
    const tc = new TransformControls(camera, renderer.domElement);
    tc.setMode("translate");
    // Disable orbit while dragging a gizmo handle
    tc.addEventListener("dragging-changed", (e) => {
      controls.enabled = !e.value;
    });
    tc.addEventListener("objectChange", () => {
      const obj = tc.object;
      if (!obj) return;
      let o = obj;
      while (o && !o.userData?.fixtureId) o = o.parent;
      const fxId = o?.userData?.fixtureId;
      if (fxId && onFixtureTransformRef.current) {
        onFixtureTransformRef.current(fxId, {
          pos: obj.position.toArray(),
          rot: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
          scl: obj.scale.toArray(),
        });
      }
    });
    scene.add(tc);
    transformControlsRef.current = tc;

    // ── Fixture click-to-select + face-pick ───────────────────────────────
    let _tcPointerDownThisClick = false;
    tc.addEventListener("mouseDown", () => {
      _tcPointerDownThisClick = true;
    });
    tc.addEventListener("mouseUp", () => {
      requestAnimationFrame(() => {
        _tcPointerDownThisClick = false;
      });
    });

    const handleClick = (event) => {
      if (!mountedRef.current || _tcPointerDownThisClick) return;
      const rect = el.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      const meshes = [];
      fixtureLayerRef.current?.traverse((o) => {
        if (o.isMesh) meshes.push(o);
      });
      const hits = raycaster.intersectObjects(meshes, false);

      const getFxId = (obj) => {
        let o = obj;
        while (o && !o.userData?.fixtureId) o = o.parent;
        return o?.userData?.fixtureId ?? null;
      };

      if (facePickModeRef.current) {
        if (hits.length && hits[0].face) {
          const hit = hits[0];
          const wn = hit.face.normal
            .clone()
            .transformDirection(hit.object.matrixWorld)
            .normalize();
          const fxId = getFxId(hit.object);
          if (fxId) {
            const obj3d = fixtureObjectsRef.current.get(fxId);
            setPendingFace({
              fixtureId: fxId,
              worldNormal: wn,
              object3d: obj3d,
            });
          }
        }
        return;
      }

      if (hits.length) {
        onSelectFixtureRef.current?.(getFxId(hits[0].object));
      } else {
        onSelectFixtureRef.current?.(null);
      }
    };
    el.addEventListener("click", handleClick);

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      try {
        controls.update();
        renderer.render(scene, camera);
      } catch (err) {
        // Stop the loop if rendering fails to avoid console/error floods.
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        mountedRef.current = false;
        console.error("CNCBackplot render loop stopped", err);
      }
    };
    animate();

    const doResize = () => {
      const nw = el.clientWidth;
      if (!nw) return; // still hidden
      const nh = height.endsWith("%")
        ? el.clientHeight || 400
        : parseInt(height) || 400;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    const ro = new ResizeObserver(doResize);
    ro.observe(el);

    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      el.removeEventListener("click", handleClick);
      controls.dispose();
      if (transformControlsRef.current) transformControlsRef.current.dispose();
      clearGroup(pathLayerRef.current);
      clearGroup(stockLayerRef.current);
      clearGroup(cutsLayerRef.current);
      clearGroup(toolRef.current);
      clearGroup(fixtureLayerRef.current);
      clearGroup(coordinateFrameLayerRef.current);
      if (gridRef.current) {
        gridRef.current.geometry?.dispose?.();
        gridRef.current.material?.dispose?.();
      }
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
      pathLayerRef.current = null;
      stockLayerRef.current = null;
      cutsLayerRef.current = null;
      toolRef.current = null;
      fixtureLayerRef.current = null;
      coordinateFrameLayerRef.current = null;
      transformControlsRef.current = null;
      gridRef.current = null;
      rafRef.current = null;
    };
  }, []);

  const clearGroup = (group) => {
    if (!group) return;
    while (group.children.length) {
      const child = group.children.pop();
      child?.traverse?.((node) => {
        if (node.geometry) node.geometry.dispose?.();
        if (node.material) {
          if (Array.isArray(node.material)) {
            node.material.forEach((m) => m?.dispose?.());
          } else {
            node.material.dispose?.();
          }
        }
      });
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m?.dispose?.());
        } else {
          child.material.dispose?.();
        }
      }
      group.remove(child);
    }
  };

  // Update background/fog when theme changes
  useEffect(() => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const currentGrid = gridRef.current;
    if (renderer) renderer.setClearColor(colors.bg);
    if (scene?.fog) scene.fog.color.setHex(colors.bg);
    if (scene && currentGrid) {
      scene.remove(currentGrid);
      currentGrid.geometry?.dispose?.();
      currentGrid.material?.dispose?.();
      const newGrid = new THREE.GridHelper(
        500,
        50,
        colors.grid,
        colors.gridAlt,
      );
      newGrid.rotation.x = Math.PI / 2;
      newGrid.visible = !!showGrid;
      scene.add(newGrid);
      gridRef.current = newGrid;
    }
  }, [isDark, showGrid]);

  useEffect(() => {
    if (!mountedRef.current) return;
    if (gridRef.current) gridRef.current.visible = !!showGrid;
  }, [showGrid]);

  useEffect(() => {
    if (!mountedRef.current) return;
    if (toolRef.current) toolRef.current.visible = !!showTool;
  }, [showTool]);

  useEffect(() => {
    const group = coordinateFrameLayerRef.current;
    if (!group) return;
    clearGroup(group);
    if (!coordinateFrames?.length) return;

    const makeLabel = (text, color) => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "700 24px JetBrains Mono, monospace";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(15, 23, 42, 0.78)";
      ctx.fillRect(0, 8, canvas.width, 48);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 9, canvas.width - 2, 46);
      ctx.fillStyle = color;
      ctx.fillText(text, 12, canvas.height / 2);
      const texture = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          depthWrite: false,
        }),
      );
      sprite.scale.set(42, 10.5, 1);
      return sprite;
    };

    coordinateFrames.forEach((frame) => {
      const root = new THREE.Group();
      const pos = frame.position || [0, 0, 0];
      const rot = frame.rotation || [0, 0, 0];
      root.position.set(pos[0] || 0, pos[1] || 0, pos[2] || 0);
      root.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);

      const size = frame.type === "machine" ? 42 : frame.active ? 36 : 28;
      const head = size * 0.18;
      const shaft = size * 0.08;
      root.add(
        new THREE.ArrowHelper(
          new THREE.Vector3(1, 0, 0),
          new THREE.Vector3(0, 0, 0),
          size,
          0xef4444,
          head,
          shaft,
        ),
      );
      root.add(
        new THREE.ArrowHelper(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(0, 0, 0),
          size,
          0x22c55e,
          head,
          shaft,
        ),
      );
      root.add(
        new THREE.ArrowHelper(
          new THREE.Vector3(0, 0, 1),
          new THREE.Vector3(0, 0, 0),
          size,
          0x38bdf8,
          head,
          shaft,
        ),
      );

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(size * 0.16, size * 0.012, 8, 32),
        new THREE.MeshBasicMaterial({
          color: frame.active ? 0xfacc15 : 0x94a3b8,
          transparent: true,
          opacity: frame.active ? 0.95 : 0.55,
        }),
      );
      ring.rotation.x = Math.PI / 2;
      root.add(ring);

      const labelColor = frame.active ? "#facc15" : "#cbd5e1";
      const label = makeLabel(frame.name || frame.id || "CS", labelColor);
      label.position.set(size * 0.42, size * 0.42, size * 0.42);
      root.add(label);

      group.add(root);
    });
  }, [coordinateFrames]);

  // ── Rebuild stock block ──────────────────────────────────────────────────
  useEffect(() => {
    const group = stockLayerRef.current;
    if (!group) return;
    clearGroup(group);
    if (!showStock) return;

    const ox = stockOrigin?.x ?? 0;
    const oy = stockOrigin?.y ?? 0;
    const oz = stockOrigin?.z ?? 0;
    const stockMat = new THREE.MeshPhongMaterial({
      color: colors.stockFill,
      transparent: true,
      // Ghost the stock when cut surface is active so the solid surface shows through
      opacity: showCuts ? 0.06 : isDark ? 0.22 : 0.18,
      shininess: 40,
    });

    let center = new THREE.Vector3(ox, oy, oz);
    let maxDim = 20;

    if (stockSTLBuffer) {
      // Custom STL stock shape — renders at bbox.min = stock origin
      try {
        const _ldr = new STLLoader();
        const stlGeo = _ldr.parse(stockSTLBuffer);
        stlGeo.computeBoundingBox();
        const { min, max } = stlGeo.boundingBox;
        stlGeo.translate(-min.x + ox, -min.y + oy, -min.z + oz);
        stlGeo.computeVertexNormals();
        group.add(new THREE.Mesh(stlGeo, stockMat));
        center = new THREE.Vector3(
          ox + (max.x - min.x) / 2,
          oy + (max.y - min.y) / 2,
          oz + (max.z - min.z) / 2,
        );
        maxDim = Math.max(max.x - min.x, max.y - min.y, max.z - min.z, 20);
      } catch (e) {
        console.warn("CNCBackplot: failed to parse stock STL", e);
      }
    } else if (stockShape === "cylinder") {
      const len = Math.max(stockDimensions?.length ?? 150, 0.1);
      const dia = Math.max(stockDimensions?.diameter ?? 80, 0.1);
      const radius = dia / 2;
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, len, 64, 1, false),
        stockMat,
      );
      // Three.js cylinder is Y-axis by default; rotate so axis aligns with X (lathe Z)
      mesh.rotation.z = Math.PI / 2;
      mesh.position.set(ox + len / 2, oy, oz + radius);
      group.add(mesh);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(
          new THREE.CylinderGeometry(radius, radius, len, 32),
        ),
        new THREE.LineBasicMaterial({ color: colors.stockEdge }),
      );
      edges.rotation.copy(mesh.rotation);
      edges.position.copy(mesh.position);
      group.add(edges);

      center = mesh.position.clone();
      maxDim = Math.max(len, dia, 20);
    } else {
      const w = Math.max(stockDimensions?.width ?? 100, 0.1);
      const h = Math.max(stockDimensions?.height ?? 80, 0.1);
      const d = Math.max(stockDimensions?.depth ?? 40, 0.1);
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), stockMat);
      mesh.position.set(ox + w / 2, oy + h / 2, oz + d / 2);
      group.add(mesh);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)),
        new THREE.LineBasicMaterial({ color: colors.stockEdge }),
      );
      edges.position.copy(mesh.position);
      group.add(edges);

      center = mesh.position.clone();
      maxDim = Math.max(w, h, d, 20);
    }

    if (!pathPoints.length && cameraRef.current && controlsRef.current) {
      const dist = maxDim * 2.2;
      cameraRef.current.position.set(
        center.x + dist * 0.7,
        center.y - dist,
        center.z + dist * 0.8,
      );
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
    }
  }, [
    stockShape,
    stockDimensions,
    stockOrigin,
    showStock,
    showCuts,
    stockSTLBuffer,
    isDark,
    pathPoints.length,
  ]);

  // ── Cut surface heightmap ─────────────────────────────────────────────────
  // Effect 1: Allocate the heightmap geometry whenever stock layout changes.
  // The vertex Z values start at stockTop and get lowered by Effect 2.
  const HMAP_N = 80;
  useEffect(() => {
    const group = cutsLayerRef.current;
    if (!group) return;
    clearGroup(group);
    cutsGeoRef.current = null; // clearGroup disposed the old geometry
    if (!showCuts || stockShape === "cylinder") return;

    const ox = stockOrigin?.x ?? 0;
    const oy = stockOrigin?.y ?? 0;
    const oz = stockOrigin?.z ?? 0;
    const sw = Math.max(stockDimensions?.width ?? 100, 1);
    const sh = Math.max(stockDimensions?.height ?? 80, 1);
    const sd = Math.max(stockDimensions?.depth ?? 40, 0.1);
    const stockTopZ = oz + sd;
    const NX = HMAP_N,
      NY = HMAP_N;

    const positions = new Float32Array(NX * NY * 3);
    const idxArr = [];
    for (let j = 0; j < NY; j++) {
      for (let i = 0; i < NX; i++) {
        const vi = j * NX + i;
        positions[vi * 3] = ox + i * (sw / (NX - 1));
        positions[vi * 3 + 1] = oy + j * (sh / (NY - 1));
        positions[vi * 3 + 2] = stockTopZ;
        if (i < NX - 1 && j < NY - 1) {
          const a = vi,
            b = vi + 1,
            c = vi + NX,
            d = vi + NX + 1;
          idxArr.push(a, b, d, a, d, c);
        }
      }
    }

    const posAttr = new THREE.BufferAttribute(positions, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", posAttr);
    geo.setIndex(idxArr);
    geo.computeVertexNormals();

    const mat = new THREE.MeshPhongMaterial({
      color: isDark ? 0xa8b8c4 : 0xd0c4a8, // machined aluminum / warm steel
      shininess: 140,
      specular: isDark ? 0x4a7a9b : 0x887860,
      side: THREE.FrontSide,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const cutsMesh = new THREE.Mesh(geo, mat);
    cutsMesh.visible = true; // always shown — represents the current stock top surface
    group.add(cutsMesh);
    cutsGeoRef.current = {
      geo,
      mesh: cutsMesh,
      NX,
      NY,
      ox,
      oy,
      sw,
      sh,
      stockTopZ,
      hmap: null,
      hmapStep: -1,
      hmapPathLen: -1,
    };
  }, [stockShape, stockDimensions, stockOrigin, showCuts, isDark]);

  // Effect 2: Update vertex Z heights for every feed point up to currentStep.
  // Interpolates along each segment so long G01 moves are fully carved, not just
  // their endpoints. Uses an incremental cache so forward playback only processes
  // new steps; backward scrub resets and recomputes from the start.
  useEffect(() => {
    const info = cutsGeoRef.current;
    if (!info || !showCuts) return;
    const { geo, mesh, NX, NY, ox, oy, sw, sh, stockTopZ } = info;
    const posAttr = geo.attributes.position;
    const toolR = Math.max(toolDiameter / 2, 0.5);
    const r2 = toolR * toolR;
    const cellW = sw / (NX - 1);
    const cellH = sh / (NY - 1);

    // Reset the cache when going backward or when a new path is loaded.
    if (
      !info.hmap ||
      pathPoints.length !== info.hmapPathLen ||
      currentStep < info.hmapStep
    ) {
      info.hmap = new Float32Array(NX * NY).fill(stockTopZ);
      info.hmapStep = -1;
      info.hmapPathLen = pathPoints.length;
    }
    const hmap = info.hmap;

    // Incrementally carve only the new segments since the last update.
    const startPi = Math.max(1, info.hmapStep + 1);
    const endPi = Math.min(currentStep + 1, pathPoints.length);
    for (let pi = startPi; pi < endPi; pi++) {
      const pt = pathPoints[pi];
      if (!pt || pt.motionMode === "G00") continue;

      // Interpolate from the previous path point to this one so every point
      // along the segment is carved, not just the endpoint.
      const prev = pathPoints[pi - 1] ?? pt;
      const ddx = pt.machineX - prev.machineX;
      const ddy = pt.machineY - prev.machineY;
      const ddz = pt.machineZ - prev.machineZ;
      const xyLen = Math.sqrt(ddx * ddx + ddy * ddy);
      const stepSize = Math.max(cellW * 0.8, toolR * 0.5);
      const nSteps = Math.max(1, Math.ceil(xyLen / stepSize));

      for (let s = 0; s <= nSteps; s++) {
        const t = s / nSteps;
        const px = prev.machineX + t * ddx - ox;
        const py = prev.machineY + t * ddy - oy;
        const tipZ = prev.machineZ + t * ddz;

        if (tipZ >= stockTopZ) continue;
        if (
          px + toolR < 0 ||
          px - toolR > sw ||
          py + toolR < 0 ||
          py - toolR > sh
        )
          continue;

        const xiMin = Math.max(0, Math.floor((px - toolR) / cellW));
        const xiMax = Math.min(NX - 1, Math.ceil((px + toolR) / cellW));
        const yiMin = Math.max(0, Math.floor((py - toolR) / cellH));
        const yiMax = Math.min(NY - 1, Math.ceil((py + toolR) / cellH));

        for (let xi = xiMin; xi <= xiMax; xi++) {
          for (let yi = yiMin; yi <= yiMax; yi++) {
            const dx = xi * cellW - px;
            const dy = yi * cellH - py;
            if (dx * dx + dy * dy <= r2) {
              const vi = yi * NX + xi;
              if (tipZ < hmap[vi]) hmap[vi] = tipZ;
            }
          }
        }
      }
    }
    info.hmapStep = currentStep;

    // Push updated Z values to the GPU buffer
    for (let vi = 0; vi < NX * NY; vi++) posAttr.setZ(vi, hmap[vi]);
    posAttr.needsUpdate = true;
    geo.computeVertexNormals();

    // Always show the surface — uncut areas sit at stockTopZ (flush with stock top),
    // cut areas drop below to reveal the machined surface.
    if (mesh) mesh.visible = true;
  }, [currentStep, pathPoints, toolDiameter, showCuts]);
  // ── Render fixture models (STL / OBJ / FBX / GLTF / DAE / PLY) ──────────────
  useEffect(() => {
    const group = fixtureLayerRef.current;
    if (!group) return;
    clearGroup(group);
    fixtureObjectsRef.current.clear();
    // Also detach TC — the attached object is being disposed
    transformControlsRef.current?.detach();
    if (!fixtures?.length) return;

    let cancelled = false;
    const stlLdr = new STLLoader();
    const objLdr = new OBJLoader();
    const fbxLdr = new FBXLoader();
    const gltfLdr = new GLTFLoader();
    const daeLdr = new ColladaLoader();
    const plyLdr = new PLYLoader();

    const mkMat = () =>
      new THREE.MeshPhongMaterial({
        color: isDark ? 0x4a5568 : 0x718096,
        transparent: true,
        opacity: 0.88,
        shininess: 80,
        side: THREE.DoubleSide,
      });
    const mkEdgeMat = () =>
      new THREE.LineBasicMaterial({
        color: isDark ? 0x94a3b8 : 0x475569,
      });

    const finalize = (obj3d, fx) => {
      if (cancelled) return;
      const pos = fx.position ?? [fx.x ?? 0, fx.y ?? 0, fx.z ?? 0];
      const rot = fx.rotation ?? [0, 0, 0];
      const scl = fx.scale ?? [1, 1, 1];
      obj3d.position.set(pos[0], pos[1], pos[2]);
      obj3d.rotation.set(rot[0], rot[1], rot[2]);
      obj3d.scale.set(scl[0], scl[1], scl[2]);
      obj3d.userData.fixtureId = fx.id;
      obj3d.traverse((o) => {
        o.userData.fixtureId = fx.id;
      });
      group.add(obj3d);
      fixtureObjectsRef.current.set(fx.id, obj3d);
    };

    fixtures.forEach((fx) => {
      if (!fx.buffer) {
        // Placeholder box
        const [w, h, d] = [fx.w ?? 60, fx.h ?? 50, fx.d ?? 25];
        const g = new THREE.Group();
        const boxGeo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(boxGeo, mkMat());
        mesh.position.set(w / 2, h / 2, d / 2);
        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(boxGeo),
          mkEdgeMat(),
        );
        edges.position.copy(mesh.position);
        g.add(mesh, edges);
        finalize(g, fx);
        return;
      }
      try {
        switch (fx.format) {
          case "stl": {
            const geo = stlLdr.parse(fx.buffer);
            geo.computeVertexNormals();
            const g = new THREE.Group();
            g.add(new THREE.Mesh(geo, mkMat()));
            finalize(g, fx);
            break;
          }
          case "ply": {
            const geo = plyLdr.parse(fx.buffer);
            geo.computeVertexNormals();
            const g = new THREE.Group();
            g.add(new THREE.Mesh(geo, mkMat()));
            finalize(g, fx);
            break;
          }
          case "obj": {
            const obj = objLdr.parse(new TextDecoder().decode(fx.buffer));
            obj.traverse((o) => {
              if (o.isMesh) o.material = mkMat();
            });
            finalize(obj, fx);
            break;
          }
          case "fbx": {
            const obj = fbxLdr.parse(fx.buffer, "");
            obj.traverse((o) => {
              if (o.isMesh) o.material = mkMat();
            });
            finalize(obj, fx);
            break;
          }
          case "gltf":
          case "glb": {
            gltfLdr.parse(
              fx.buffer,
              "",
              (gltf) => {
                if (cancelled) return;
                gltf.scene.traverse((o) => {
                  if (o.isMesh) o.material = mkMat();
                });
                finalize(gltf.scene, fx);
                // Re-attach TC if this was the selected fixture and it loaded async
                const tc = transformControlsRef.current;
                if (tc && fx.id === selectedFixtureId) {
                  const obj3d = fixtureObjectsRef.current.get(fx.id);
                  if (obj3d) tc.attach(obj3d);
                }
              },
              (err) => console.warn("CNCBackplot: GLTF load error", err),
            );
            break;
          }
          case "dae": {
            const result = daeLdr.parse(new TextDecoder().decode(fx.buffer));
            result.scene.traverse((o) => {
              if (o.isMesh) o.material = mkMat();
            });
            finalize(result.scene, fx);
            break;
          }
          default:
            console.warn("CNCBackplot: unknown fixture format", fx.format);
        }
      } catch (e) {
        console.warn("CNCBackplot: fixture load failed", fx.format, e);
        // Fallback box
        const g = new THREE.Group();
        g.add(
          new THREE.Mesh(
            new THREE.BoxGeometry(fx.w ?? 60, fx.h ?? 50, fx.d ?? 25),
            mkMat(),
          ),
        );
        finalize(g, fx);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [fixtures, isDark]); // selectedFixtureId attachment handled in next effect

  // ── Attach / detach TransformControls when selection changes ───────────────
  useEffect(() => {
    const tc = transformControlsRef.current;
    if (!tc) return;
    if (!selectedFixtureId) {
      tc.detach();
      return;
    }
    const obj = fixtureObjectsRef.current.get(selectedFixtureId);
    if (obj) tc.attach(obj);
    else tc.detach();
  }, [selectedFixtureId]);

  // ── TransformControls mode: translate / rotate / scale ─────────────────────
  useEffect(() => {
    const tc = transformControlsRef.current;
    if (tc) tc.setMode(transformMode);
  }, [transformMode]);

  // ── Grid snap ───────────────────────────────────────────────────────────
  useEffect(() => {
    const tc = transformControlsRef.current;
    if (!tc) return;
    tc.setTranslationSnap(snapGrid || null);
    tc.setRotationSnap(snapGrid ? Math.PI / 12 : null); // 15° increments
  }, [snapGrid]);
  // ── Rebuild path ──────────────────────────────────────────────────────────
  useEffect(() => {
    const group = pathLayerRef.current;
    const scene = sceneRef.current;
    if (!group || !scene) return;

    while (group.children.length) group.remove(group.children[0]);

    if (pathPoints.length < 2) {
      pathFittedRef.current = false;
      return;
    }

    // Group segments by motion mode + channel so multichannel traces stay distinct
    const segments = [];
    let currentSegment = {
      points: [
        new THREE.Vector3(
          pathPoints[0].machineX,
          pathPoints[0].machineY,
          pathPoints[0].machineZ,
        ),
      ],
      mode: pathPoints[0].motionMode || "G00",
      channelId: pathPoints[0].channelId ?? 0,
    };

    for (let i = 1; i < pathPoints.length; i++) {
      const pt = pathPoints[i];
      const v = new THREE.Vector3(pt.machineX, pt.machineY, pt.machineZ);
      const mode = pt.motionMode || "G00";
      const channelId = pt.channelId ?? 0;

      if (
        mode !== currentSegment.mode ||
        channelId !== currentSegment.channelId
      ) {
        segments.push(currentSegment);
        currentSegment = {
          points: [currentSegment.points[currentSegment.points.length - 1], v],
          mode,
          channelId,
        };
      } else {
        currentSegment.points.push(v);
      }
    }
    segments.push(currentSegment);

    segments.forEach((seg) => {
      const geo = new THREE.BufferGeometry().setFromPoints(seg.points);
      const channelColor =
        colors.channels[seg.channelId % colors.channels.length] || colors.feed;
      const color = seg.mode === "G00" ? colors.rapid : channelColor;
      const mat = new THREE.LineBasicMaterial({ color, linewidth: 2 });
      const line = new THREE.Line(geo, mat);
      group.add(line);
    });

    // Markers
    const startPt = pathPoints[0];
    const startGeo = new THREE.SphereGeometry(1.5, 8, 8);
    const startM = new THREE.Mesh(
      startGeo,
      new THREE.MeshBasicMaterial({ color: 0x22c55e }),
    );
    startM.position.set(startPt.machineX, startPt.machineY, startPt.machineZ);
    group.add(startM);

    // Fit camera to path bounds
    const bbox = new THREE.Box3().setFromObject(group);
    const size = bbox.getSize(new THREE.Vector3());
    const center = bbox.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 20);
    if (cameraRef.current && controlsRef.current) {
      const dist = maxDim * 1.8;
      cameraRef.current.position.set(
        center.x + dist * 0.7,
        center.y - dist,
        center.z + dist * 0.8,
      );
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
      pathFittedRef.current = true;
    }
  }, [pathPoints, isDark]);

  // Rebuild tool when dimensions change
  useEffect(() => {
    if (!toolRef.current) return;
    _buildTool(toolRef.current, toolDiameter / 2, toolLength, toolLenCut);
    // Fit camera to show full tool only when no path has been loaded
    if (!pathFittedRef.current && cameraRef.current && controlsRef.current) {
      const halfLen = toolLength / 2;
      const dist = toolLength * 3;
      cameraRef.current.position.set(dist * 0.7, -dist, halfLen + dist * 0.8);
      controlsRef.current.target.set(0, 0, halfLen);
      controlsRef.current.update();
    }
  }, [toolDiameter, toolLength, toolLenCut]);

  // Move tool
  useEffect(() => {
    if (!toolRef.current) return;
    if (
      toolPosition &&
      Number.isFinite(toolPosition.machineX) &&
      Number.isFinite(toolPosition.machineY) &&
      Number.isFinite(toolPosition.machineZ)
    ) {
      toolRef.current.position.set(
        toolPosition.machineX,
        toolPosition.machineY,
        toolPosition.machineZ,
      );
      return;
    }
    if (pathPoints.length === 0) return;
    const targetIndex = Math.min(currentStep, pathPoints.length - 1);
    let pt = pathPoints[targetIndex];
    const channelAtStep = pathPoints
      .slice(0, targetIndex + 1)
      .reverse()
      .find((p) => p.channelId === activeChannel);
    const fallback = [...pathPoints]
      .reverse()
      .find((p) => p.channelId === activeChannel);
    if (channelAtStep) {
      pt = channelAtStep;
    } else if ((pt?.channelId ?? activeChannel) !== activeChannel && fallback) {
      pt = fallback;
    }
    if (pt) toolRef.current.position.set(pt.machineX, pt.machineY, pt.machineZ);
  }, [currentStep, pathPoints, activeChannel, toolPosition]);

  return (
    <div
      className="relative border border-slate-700/30 rounded-xl overflow-hidden bg-slate-900 shadow-inner"
      style={{
        width,
        height,
        minHeight:
          typeof height === "number" ? height : parseInt(height) || 400,
      }}
    >
      <div ref={mountRef} className="w-full h-full" />

      {/* Face-alignment overlay — appears after user clicks a surface in face-pick mode */}
      {pendingFace && (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            background: "rgba(15,23,42,0.92)",
            border: "1px solid #334155",
            borderRadius: 8,
            padding: "10px 12px",
            zIndex: 20,
            minWidth: 180,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "#94a3b8",
              marginBottom: 6,
              fontWeight: 600,
            }}
          >
            Align picked face to…
          </div>
          {[
            {
              label: "Lay flat on table ↓",
              target: new THREE.Vector3(0, 0, -1),
            },
            { label: "Face up ↑", target: new THREE.Vector3(0, 0, 1) },
            { label: "+X right", target: new THREE.Vector3(1, 0, 0) },
            { label: "+Y front", target: new THREE.Vector3(0, 1, 0) },
          ].map(({ label, target }) => (
            <button
              key={label}
              style={{
                display: "block",
                width: "100%",
                marginBottom: 4,
                background: "#1e293b",
                border: "1px solid #334155",
                color: "#e2e8f0",
                borderRadius: 4,
                padding: "4px 8px",
                fontSize: 10,
                cursor: "pointer",
                textAlign: "left",
              }}
              onClick={() => {
                const { fixtureId, worldNormal, object3d } = pendingFace;
                if (!object3d) {
                  setPendingFace(null);
                  return;
                }
                // Rotate the object so worldNormal aligns with target
                const q = new THREE.Quaternion().setFromUnitVectors(
                  worldNormal.clone().normalize(),
                  target.clone().normalize(),
                );
                object3d.quaternion.premultiply(q);
                onFixtureTransformRef.current?.(fixtureId, {
                  pos: object3d.position.toArray(),
                  rot: [
                    object3d.rotation.x,
                    object3d.rotation.y,
                    object3d.rotation.z,
                  ],
                  scl: object3d.scale.toArray(),
                });
                setPendingFace(null);
              }}
            >
              {label}
            </button>
          ))}
          <button
            style={{
              display: "block",
              width: "100%",
              background: "#7f1d1d",
              border: "1px solid #991b1b",
              color: "#fca5a5",
              borderRadius: 4,
              padding: "4px 8px",
              fontSize: 10,
              cursor: "pointer",
            }}
            onClick={() => setPendingFace(null)}
          >
            Cancel
          </button>
        </div>
      )}

      {pathPoints.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 bg-slate-800/80 px-4 py-2 rounded-lg backdrop-blur-sm">
            Ready for Program Input
          </span>
        </div>
      )}
    </div>
  );
}

function _buildTool(group, radius, length, lenCut) {
  while (group.children.length) group.remove(group.children[0]);

  const r = Math.max(radius, 1.5);
  const len = Math.max(length, 20);
  // Flute (cutting) length — use lenCut if provided, else 30% of total length
  const fl = Math.max(lenCut != null ? lenCut : len * 0.3, r * 2);
  const nk = Math.min(fl * 0.12, r * 0.5); // neck taper height
  const sr = r * 0.88; // shank radius (slightly narrower than flutes)

  // ── Materials ─────────────────────────────────────────────────────────────
  const matFlute = new THREE.MeshPhongMaterial({
    color: 0xc8940c, // carbide gold
    emissive: 0x4a2200,
    shininess: 220,
    specular: 0xffd080,
    side: THREE.DoubleSide,
  });
  const matShank = new THREE.MeshPhongMaterial({
    color: 0x7a8fa6, // steel gray
    emissive: 0x0d1520,
    shininess: 80,
    side: THREE.DoubleSide,
  });

  // ── Flute body — LatheGeometry revolved around Z ───────────────────────────
  // Profile: (radius, height-from-tip). LatheGeometry revolves around Y;
  // we rotate +π/2 on X so Y→Z (tip at z=0, shank goes +Z).
  const fluteProfile = [
    new THREE.Vector2(r, 0), // tip edge
    new THREE.Vector2(r, fl), // top of flute zone
  ];
  const fluteMesh = new THREE.Mesh(
    new THREE.LatheGeometry(fluteProfile, 32),
    matFlute,
  );
  fluteMesh.rotation.x = Math.PI / 2;
  group.add(fluteMesh);

  // ── Neck taper + Shank — LatheGeometry ────────────────────────────────────
  const shankProfile = [
    new THREE.Vector2(r, fl), // join flute top
    new THREE.Vector2(sr, fl + nk), // neck taper
    new THREE.Vector2(sr, len), // shank top
  ];
  const shankMesh = new THREE.Mesh(
    new THREE.LatheGeometry(shankProfile, 24),
    matShank,
  );
  shankMesh.rotation.x = Math.PI / 2;
  group.add(shankMesh);

  // ── Tip face — red flat disc at z = 0 (the cutting face) ──────────────────
  const tipMesh = new THREE.Mesh(
    new THREE.CircleGeometry(r, 32),
    new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide }),
  );
  group.add(tipMesh);

  // ── Crosshair lines at tip — always-visible position indicator ─────────────
  const cx = r * 5;
  const mkLine = (ax, ay, az, bx, by, bz, color) => {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(ax, ay, az),
      new THREE.Vector3(bx, by, bz),
    ]);
    return new THREE.Line(geo, new THREE.LineBasicMaterial({ color }));
  };
  group.add(mkLine(-cx, 0, 0, cx, 0, 0, 0xef4444)); // X — red
  group.add(mkLine(0, -cx, 0, 0, cx, 0, 0x22c55e)); // Y — green
  group.add(mkLine(0, 0, -cx * 0.4, 0, 0, cx * 0.4, 0x38bdf8)); // Z — blue
}
