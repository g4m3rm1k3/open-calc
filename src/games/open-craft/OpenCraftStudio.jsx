import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  WORLD_X, WORLD_Y, WORLD_Z, EYE_HEIGHT, SPAWN_POINT,
  worldIndex, inBounds, BLOCKS, blockApi, STEM_LESSONS, MISSIONS, INITIAL_INVENTORY, buildWorld,
} from "./lib/blocks.js";
import { isPlayerOccupyingBlock, getSurfaceProperties, isBodyBlocked } from "./lib/physics.js";
import { raycastVoxels } from "./lib/raycast.js";
import { resolveRenderedBlock, getDaylight } from "./lib/power.js";
import { getVisibleVoxels } from "./lib/visibleVoxels.js";
import { createVoxelRenderer } from "./lib/voxelRenderer.js";
import { useViewportSize } from "./hooks/useViewportSize.js";

const FONT_BODY = "system-ui, sans-serif";
const FONT_MONO = "'Courier New', monospace";
const FONT_HEAD = "'Arial Black', Impact, sans-serif";

export default function OpenCraftStudio() {
  const navigate = useNavigate();
  const worldRef = useRef(buildWorld());
  const canvasRef = useRef(null);
  const glHostRef = useRef(null);
  const rendererRef = useRef(null);
  const targetInfoRef = useRef(null);
  const coordsRef = useRef(null);
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
    if (canvasRef.current) canvasRef.current.style.cursor = pointerLocked ? "none" : "crosshair";
  }, [pointerLocked]);

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

  const exitOpenCraft = useCallback(() => {
    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }
    navigate("/games");
  }, [navigate]);

  useEffect(() => {
    if (!glHostRef.current) return undefined;
    const instance = createVoxelRenderer(glHostRef.current);
    rendererRef.current = instance;
    canvasRef.current = instance.dom;
    instance.dom.style.position = "absolute";
    instance.dom.style.inset = "0";
    instance.dom.style.width = "100%";
    instance.dom.style.height = "100%";
    instance.dom.style.display = "block";
    return () => {
      instance.dispose();
      rendererRef.current = null;
      canvasRef.current = null;
    };
  }, []);

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
        // Negated: the renderer's standard (proper-rotation) camera convention
        // makes increasing yaw turn left, not right — see voxelRenderer.js.
        cameraRef.current.yaw -= dx * 0.0035;
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
      cameraRef.current.yaw -= dx * 0.005;
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
    rendererRef.current?.resize(viewport.width, viewport.height);

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
      // A/D directions are swapped from the original hand-rolled renderer's
      // convention: that renderer's screen-right was cos(yaw),-sin(yaw),
      // but a standard (proper-rotation) 3D camera's screen-right is the
      // exact opposite, cross(forward,up) = -cos(yaw),sin(yaw). Verified by
      // hand (matrix determinant) rather than guessed — see voxelRenderer.js.
      if (keys.a || keys.arrowleft) {
        moveX += cosY;
        moveZ -= sinY;
      }
      if (keys.d || keys.arrowright) {
        moveX -= cosY;
        moveZ += sinY;
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

      // Unstuck safety net: this game's per-axis voxel collision (unchanged
      // gameplay physics, not new) can wedge the player inside non-cube
      // structures — tree leaf clusters, ore veins, the hollow dome's shell
      // — where solid blocks exist both above and below the current spot,
      // pinning movement in every direction. Auto-detect actually being
      // embedded in solid geometry and nudge upward until free, instead of
      // a full collision-system rewrite.
      if (isBodyBlocked(world, camera.cx, camera.cy, camera.cz)) {
        camera.cy += 6 * dt;
        camera.vy = 0;
      }

      targetRef.current = raycastVoxels(world, camera.cx, camera.cy, camera.cz, camera.yaw, camera.pitch);
      const target = targetRef.current;

      // Single visibility scan shared between lamp-mission tracking and the
      // renderer (previously scanned twice per frame — once here, once again
      // inside rendererRef.update() — doubling a per-frame allocation of
      // ~1800 voxel objects, a real GC-pressure cost on top of the render).
      const visibleVoxelsThisFrame = getVisibleVoxels(world, camera);
      let litLampSeenThisFrame = false;
      for (const voxel of visibleVoxelsThisFrame) {
        const rendered = resolveRenderedBlock(world, voxel.x, voxel.y, voxel.z, daylight, powerCache);
        if (rendered?.powerConsumer === "lamp" && rendered.emit > 0.5) {
          litLampSeenThisFrame = true;
          break;
        }
      }
      if (litLampSeenThisFrame && !poweredLampSeenRef.current) {
        poweredLampSeenRef.current = true;
        registerProgress((current) => ({ ...current, poweredLamps: current.poweredLamps + 1 }));
      }

      rendererRef.current?.update(world, camera, daylight, t, visibleVoxelsThisFrame);

      if (coordsRef.current) {
        coordsRef.current.textContent = `${camera.cx.toFixed(1)}, ${camera.cy.toFixed(1)}, ${camera.cz.toFixed(1)}`;
      }

      if (targetInfoRef.current) {
        const block = target ? resolveRenderedBlock(world, target.bx, target.by, target.bz, daylight, powerCache) : null;
        if (block) {
          const [r, g, b] = block.rgb;
          targetInfoRef.current.style.display = "grid";
          targetInfoRef.current.style.borderColor = `rgb(${r},${g},${b})`;
          targetInfoRef.current.querySelector("[data-name]").style.color = `rgb(${r},${g},${b})`;
          targetInfoRef.current.querySelector("[data-name]").textContent = block.name.toUpperCase();
          targetInfoRef.current.querySelector("[data-stats]").textContent = `rho=${block.density} kg/m^3  hard=${block.hard}  type=${block.cat}`;
          targetInfoRef.current.querySelector("[data-note]").textContent = block.note;
        } else {
          targetInfoRef.current.style.display = "none";
        }
      }

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
          <button onClick={exitOpenCraft} style={{ ...styles.button, padding: "11px 14px", fontWeight: 700 }}>
            Close
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
            <div ref={glHostRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />

            <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 28, height: 28, pointerEvents: "none" }}>
              <div style={{ position: "absolute", left: 0, top: "50%", width: 28, height: 3, marginTop: -1.5, background: "rgba(0,0,0,0.7)" }} />
              <div style={{ position: "absolute", left: "50%", top: 0, width: 3, height: 28, marginLeft: -1.5, background: "rgba(0,0,0,0.7)" }} />
              <div style={{ position: "absolute", left: 1, top: "50%", width: 26, height: 1.5, marginTop: -0.75, background: "rgba(255,255,255,0.92)" }} />
              <div style={{ position: "absolute", left: "50%", top: 1, width: 1.5, height: 26, marginLeft: -0.75, background: "rgba(255,255,255,0.92)" }} />
              <div style={{ position: "absolute", left: "50%", top: "50%", width: 2, height: 2, marginLeft: -1, marginTop: -1, background: "rgba(255,255,255,0.92)" }} />
            </div>

            <div
              ref={targetInfoRef}
              style={{ display: "none", position: "absolute", left: "50%", bottom: 92, transform: "translateX(-50%)", width: 290, padding: "8px 14px", borderRadius: 10, background: "rgba(0,0,0,0.72)", border: "1.5px solid transparent", textAlign: "center", pointerEvents: "none" }}
            >
              <div data-name style={{ fontFamily: FONT_HEAD, fontSize: 13, fontWeight: 800 }} />
              <div data-stats style={{ fontFamily: FONT_MONO, fontSize: 9, color: "rgba(255,255,255,0.56)", marginTop: 4 }} />
              <div data-note style={{ fontFamily: FONT_MONO, fontSize: 9, color: "rgba(255,255,255,0.56)" }} />
            </div>

            <div style={{ position: "absolute", left: 12, top: 12, padding: "6px 10px", borderRadius: 8, background: "rgba(0,0,0,0.5)", pointerEvents: "none" }}>
              <div ref={coordsRef} style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#4ade80" }} />
              <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: "rgba(255,255,255,0.42)" }}>
                {pointerLocked ? "WASD move  mouse look  Esc unlock" : "Click world to lock mouse"}
              </div>
            </div>

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
