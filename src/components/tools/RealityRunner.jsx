import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Phaser from "phaser";
import { ArrowLeft, RotateCcw, Target, Waves } from "lucide-react";

// ── World constants ────────────────────────────────────────────────────────────
const W        = 1600;
const H        = 900;
const GROUND_Y = H - 90;   // 810
const BALL_R   = 20;
const SHAFT_HW = 230;       // shaft half-width for fall/climb
const PB_HW    = 290;       // pinball half-width
const SHAFT_CX = W / 2;     // center X for fall/climb/pinball columns

// ── Scene list ─────────────────────────────────────────────────────────────────
const SCENES = [
  { id: "side",    title: "Side Scroll",  subtitle: "Run and jump — tune gravity and friction in real time." },
  { id: "fall",    title: "Free Fall",    subtitle: "Drop through the shaft, bounce off pads. KE = ½mv²." },
  { id: "climb",   title: "Upward Climb", subtitle: "Ride pads upward. Potential energy = mgh." },
  { id: "pinball", title: "Pinball",      subtitle: "2.5D table — Z/X flippers. Drain = back to run." },
];

const TUTORIALS = {
  elasticity: { title: "Euler: Coefficient of Restitution", body: "e = v_after / v_before. e=1 is perfectly elastic — no energy lost. e=0 means the ball sticks. Real rubber: ~0.85. Crank the slider and watch every surface return more speed." },
  blaster:    { title: "Euler: KE = ½mv²", body: "Double the speed → four times the energy. Your bolt traces x=v₀t, y=½gt² — a literal parabola. High shot power (>0.82) causes ricochet back at you." },
  crush:      { title: "Euler: F = ma", body: "Super gravity doubles g, doubling the downward force on everything including you. Impulse J=FΔt=mΔv is why landing fast enough crushes enemies. Every gain has a cost." },
  lightning:  { title: "Euler: Q = CV", body: "You discharged a rod like a capacitor. Q=CV: charge equals capacitance × voltage. Taller rods attract more charge — E=V/d is stronger at the sharp tip." },
  pi:         { title: "Euler: Pi signal located", body: "π≈3.14159 appears in your ball's arc, wave frequencies, electrical impedance, and probability distributions. The math gets more interesting from here." },
};

function fmt(v, d = 1) { return Number(v || 0).toFixed(d).replace(/\.?0+$/, "") || "0"; }

// ═══════════════════════════════════════════════════════════════════════════════
//  PHASER SCENE
//  Design: ALL physics bodies are invisible physics.add.image('px') objects.
//  ALL visuals are drawn each frame via worldGfx (Graphics). This avoids the
//  Shape-body offset bugs and gives full rendering control.
// ═══════════════════════════════════════════════════════════════════════════════
class GameScene extends Phaser.Scene {
  constructor() { super({ key: "GameScene" }); }

  create() {
    // ── Inject React refs ─────────────────────────────────────────────────────
    this.paramsRef  = this.registry.get("paramsRef");
    this.onScore    = this.registry.get("onScore")  || (() => {});
    this.onEnergy   = this.registry.get("onEnergy") || (() => {});
    this.onSceneCb  = this.registry.get("onScene")  || (() => {});
    this.onMsgCb    = this.registry.get("onMsg")    || (() => {});
    this.sceneId    = "side";

    // ── Keyboard input (Phaser-native, no React ref needed) ───────────────────
    this.keys = this.input.keyboard.addKeys({
      left:  Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      up:    Phaser.Input.Keyboard.KeyCodes.UP,
      down:  Phaser.Input.Keyboard.KeyCodes.DOWN,
      a:     Phaser.Input.Keyboard.KeyCodes.A,
      d:     Phaser.Input.Keyboard.KeyCodes.D,
      w:     Phaser.Input.Keyboard.KeyCodes.W,
      s:     Phaser.Input.Keyboard.KeyCodes.S,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });
    this._inp = { left: false, right: false, up: false, down: false, jumpQueued: false, superGravity: false };
    this.input.keyboard.on("keydown-SPACE", () => { this._inp.jumpQueued = true; });
    this.input.keyboard.on("keydown-UP",    () => { this._inp.jumpQueued = true; });
    this.input.keyboard.on("keydown-W",     () => { this._inp.jumpQueued = true; });
    this.input.keyboard.on("keydown-S",     () => { this._inp.superGravity = true; });
    this.input.keyboard.on("keyup-S",       () => { this._inp.superGravity = false; });

    // ── Generate 1×1 white pixel texture for all physics bodies ───────────────
    const pg = this.make.graphics({ add: false });
    pg.fillStyle(0xffffff, 1).fillRect(0, 0, 1, 1);
    pg.generateTexture("px", 1, 1);
    pg.destroy();

    // ── Player physics body (invisible, explicit size) ─────────────────────────
    // Use setSize(d,d,true) to center the body, then setCircle for round collisions
    this.player = this.physics.add.image(220, GROUND_Y - BALL_R, "px");
    this.player.setAlpha(0.01);
    // For a 1×1 "px" sprite, displayOriginX = 0.5.
    // setCircle(r, offsetX, offsetY): body.x = sprite.x + (offsetX - 0.5)
    // We want circle center = sprite center, so offsetX = -(r - 0.5) = -19.5
    this.player.body.setCircle(BALL_R, -(BALL_R - 0.5), -(BALL_R - 0.5));
    this.player.body.setMaxVelocity(900, 1800);
    this.player.body.setCollideWorldBounds(false);

    // ── Physics groups ────────────────────────────────────────────────────────
    // staticPlatforms: solid surfaces + bounce pads (use collider)
    // portalGroup / spikeGroup / waterGroup / pitGroup: overlap only (no solid block)
    this.staticPlatforms = this.physics.add.staticGroup();
    this.enemyGroup      = this.physics.add.group();
    this.collectGroup    = this.physics.add.group();
    this.portalGroup     = this.physics.add.staticGroup();
    this.spikeGroup      = this.physics.add.staticGroup();

    // ── Colliders / overlaps ──────────────────────────────────────────────────
    this.physics.add.collider(this.player, this.staticPlatforms,
      (pl, plat) => this._onPlatformCollide(pl, plat), null, this);
    this.physics.add.overlap(this.player, this.portalGroup,
      (pl, portal) => this._onPortal(portal), null, this);
    this.physics.add.overlap(this.player, this.spikeGroup,
      () => this._damagePlayer("Spike! Lower gravity or find a platform path."), null, this);
    this.physics.add.overlap(this.player, this.enemyGroup,
      (pl, e) => this._onEnemyHit(e), null, this);
    this.physics.add.overlap(this.player, this.collectGroup,
      (pl, c) => this._onCollect(c), null, this);

    // ── Visual layers ─────────────────────────────────────────────────────────
    this.worldGfx     = this.add.graphics();  // world-space visuals, redrawn each frame
    this.lightningGfx = this.add.graphics();  // separate so lightning can be on top

    // ── Data arrays (for rendering & custom logic) ────────────────────────────
    this.platData    = [];  // { body, cx, cy, w, h, color, type }
    this.enemyData   = [];  // { body, r, color, behavior, phase, ampY, baseY }
    this.collectData = [];  // { body, type }
    this.portalData  = [];  // { body, cx, cy, w, h, target }
    this.spikeData   = [];  // { x, y, w }
    this.waterData   = [];  // { x, y, w, h }
    this.pitData     = [];  // { x, w } — pitfall trigger zones
    this.rodData     = [];  // { x, y, id, charge }
    this.bumperData  = [];  // { x, y, r }
    this.flipperData = [];  // { body, side, cx, cy, w, h }

    // ── Game state ─────────────────────────────────────────────────────────────
    this.score        = 0;
    this.lives        = 3;
    this.energy       = 100;
    this.invuln       = 0;
    this.survivedSec  = 0;
    this.difficulty   = 1;
    this.unlocks      = { elasticity: false, blaster: false, crush: false };
    this.pendingTut   = null;
    this.alive        = true;
    this.furthestX    = 220;
    this.goalX        = 18000;
    this.shotCooldown = 0;
    this.flipL        = false;
    this.flipR        = false;
    this.reason       = "Start running — tune the physics sliders on the left.";

    // ── Platform spawn cursor ─────────────────────────────────────────────────
    this.platCursor    = { x: 320, y: GROUND_Y };
    this.nextSpawnX    = 320;
    this.nextSpawnY    = 300;   // for fall/climb scenes
    this.spawnGuard    = 2.0;   // seconds of protection against immediate re-transition

    // ── Lightning ─────────────────────────────────────────────────────────────
    this.lightningBolts = [];
    this.lightningTimer = 4;

    // ── Transition overlay ────────────────────────────────────────────────────
    this.transText = this.add.text(W / 2, H / 2, "", {
      fontSize: "34px", color: "#ffffff", fontFamily: "sans-serif",
      backgroundColor: "rgba(8,19,31,0.86)", padding: { x: 28, y: 16 },
    }).setScrollFactor(0).setOrigin(0.5).setAlpha(0).setDepth(30);
    this.transTtl = 0;

    // ── Camera: only follows X in side scroll (Y forced to 0) ─────────────────
    this.cameras.main.setBackgroundColor("#08101b");

    // ── Start first scene ─────────────────────────────────────────────────────
    this._setupScene(this.sceneId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  SCENE SETUP
  // ═══════════════════════════════════════════════════════════════════════════

  _clearScene() {
    this.staticPlatforms.clear(true, true);
    this.enemyGroup.clear(true, true);
    this.collectGroup.clear(true, true);
    this.portalGroup.clear(true, true);
    this.spikeGroup.clear(true, true);
    this.platData    = [];
    this.enemyData   = [];
    this.collectData = [];
    this.portalData  = [];
    this.spikeData   = [];
    this.waterData   = [];
    this.pitData     = [];
    this.rodData     = [];
    this.bumperData  = [];
    this.flipperData = [];
    this.lightningBolts = [];
  }

  _setupScene(id) {
    this.sceneId = id;
    this.transitioning = false;
    this.spawnGuard = 2.0;
    this._clearScene();
    this.cameras.main.stopFollow();

    if (id === "side")    this._setupSide();
    if (id === "fall")    this._setupFall();
    if (id === "climb")   this._setupClimb();
    if (id === "pinball") this._setupPinball();
  }

  _setupSide() {
    // Player starts at ground level, moving right
    this.player.body.reset(220, GROUND_Y - BALL_R);
    this.player.body.setVelocity(140, 0);

    // Spawn ground — tiled at 1600px each so static bodies aren't absurdly large
    for (let i = 0; i < 120; i++) {
      this._addSolidPlat(W * i + W / 2, GROUND_Y + 22, W, 44, 0x334155);
    }

    this.platCursor = { x: 320, y: GROUND_Y };
    this.nextSpawnX = 320;
    for (let i = 0; i < 14; i++) this._spawnSideChunk();

    // Camera: follow X only, lock Y
    this.cameras.main.startFollow(this.player, false, 0.1, 0);
    this.cameras.main.setLerp(0.1, 0);
    // Y will be forced to 0 in _updateSide each frame
  }

  _setupFall() {
    const cx = SHAFT_CX;
    this.player.body.reset(cx, 80);
    this.player.body.setVelocity(0, 260);
    this.nextSpawnY = 260;

    // Shaft walls (solid, tall)
    this._addSolidPlat(cx - SHAFT_HW - 12, H / 2, 24, H, 0x1e3a5f);
    this._addSolidPlat(cx + SHAFT_HW + 12, H / 2, 24, H, 0x1e3a5f);
    // Entry bounce pad
    this._addBounce(cx, 760, 200, 18);

    for (let i = 0; i < 8; i++) this._spawnFallChunk();

    this.cameras.main.startFollow(this.player, false, 0, 0.1);
    this.cameras.main.setFollowOffset(0, -H * 0.25);
  }

  _setupClimb() {
    const cx = SHAFT_CX;
    this.player.body.reset(cx, H - 180);
    this.player.body.setVelocity(0, -340);
    this.nextSpawnY = H - 380;

    // Shaft walls
    this._addSolidPlat(cx - SHAFT_HW - 12, H / 2, 24, H, 0x1e3a5f);
    this._addSolidPlat(cx + SHAFT_HW + 12, H / 2, 24, H, 0x1e3a5f);

    // Guaranteed bounce chain from bottom to top
    this._addBounce(cx, H - 200, 180, 18);
    this._addBounce(cx - 120, H - 400, 130, 18);
    this._addBounce(cx + 100, H - 580, 130, 18);
    this._addBounce(cx - 80,  H - 750, 130, 18);
    this._addBounce(cx,       280,     140, 18);
    // Exit portal at top
    this._addPortal(cx, 200, 120, 24, "side");

    for (let i = 0; i < 6; i++) this._spawnClimbChunk();

    this.cameras.main.startFollow(this.player, false, 0, 0.1);
    this.cameras.main.setFollowOffset(0, H * 0.3);
  }

  _setupPinball() {
    const cx = SHAFT_CX;
    this.player.body.reset(cx, 130);
    this.player.body.setVelocity(60, 320);

    // Walls + ceiling
    this._addSolidPlat(cx - PB_HW - 12, H / 2, 24, H, 0x1e3a5f);
    this._addSolidPlat(cx + PB_HW + 12, H / 2, 24, H, 0x1e3a5f);
    this._addSolidPlat(cx, 52, PB_HW * 2 + 24, 24, 0x1e3a5f);

    // Bumpers
    this.bumperData = [
      { x: cx - 80,  y: 260, r: 34 },
      { x: cx + 110, y: 390, r: 28 },
      { x: cx - 140, y: 480, r: 30 },
      { x: cx + 40,  y: 600, r: 32 },
    ];

    // Flippers (physics + data for rendering)
    this._addFlipper(cx - 120, H - 158, "left");
    this._addFlipper(cx + 120, H - 158, "right");

    // Exit portal + collectibles
    this._addPortal(cx, 96, 120, 24, "side");
    this._addCollectible(cx - 50, 340, "energy");
    this._addCollectible(cx + 70, 520, "energy");
    this._addCollectible(cx, 700, "life");

    this.cameras.main.setScroll(cx - W / 2, 0);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  SPAWNERS
  // ═══════════════════════════════════════════════════════════════════════════

  _spawnSideChunk() {
    const prev = this.platCursor;
    const TIERS = [GROUND_Y, GROUND_Y - 120, GROUND_Y - 240, GROUND_Y - 360];
    const MAX_JUMP_H = 148;
    const reachable = TIERS.filter(ty => ty >= prev.y || (prev.y - ty) <= MAX_JUMP_H);
    // Weighted pick — prefer going up
    const w = reachable.map(ty => {
      if (ty === GROUND_Y) return 0.08;
      if (ty === prev.y)   return 0.35;
      if (ty < prev.y)     return 0.42;
      return 0.15;
    });
    const tot = w.reduce((a, b) => a + b, 0);
    let r = Math.random() * tot;
    let nextY = reachable[reachable.length - 1];
    for (let i = 0; i < reachable.length; i++) { r -= w[i]; if (r <= 0) { nextY = reachable[i]; break; } }

    const maxGap = nextY < prev.y ? 215 : 260;
    const nextX  = prev.x + 55 + Math.random() * (maxGap - 55);
    const pw     = 90 + Math.random() * 80;
    const isPad  = nextY < GROUND_Y && Math.random() < 0.26;

    if (nextY < GROUND_Y) {
      if (isPad) this._addBounce(nextX + pw / 2, nextY, pw, 16);
      else       this._addSolidPlat(nextX + pw / 2, nextY, pw, 16, 0x475569);

      if (Math.random() < 0.50)
        this._addCollectible(nextX + pw * 0.45, nextY - 32, Math.random() < 0.65 ? "energy" : "life");
      if (Math.random() < 0.52 + this.difficulty * 0.04)
        this._addEnemy(nextX + pw * 0.5, nextY - 38);
      if (Math.random() < 0.09 && nextX > 800)
        this._addPortal(nextX + pw * 0.4, nextY - 30, 100, 22, Math.random() < 0.5 ? "fall" : "climb");
    }

    // Ground hazard between cursor and new platform
    const hzX = prev.x + 8, hzW = nextX - prev.x - 16;
    if (hzW > 70) {
      const roll = Math.random();
      if (roll < 0.20)       this._addSpikes(hzX, hzW);
      else if (roll < 0.42)  this._addBounce(hzX + hzW / 2, GROUND_Y - 18, Math.min(hzW * 0.6, 100), 18);
      else if (roll < 0.60)  this._addWater(hzX, Math.min(hzW * 0.85, 300));
      else if (roll < 0.78)  this._addPitfall(hzX, Math.min(hzW * 0.75, 280));
      if (Math.random() < 0.15) this._addLightningRod(hzX + Math.random() * Math.max(1, hzW - 20));
    }

    this.platCursor  = { x: nextX + pw, y: nextY };
    this.nextSpawnX  = nextX + pw + 55;
  }

  _spawnFallChunk() {
    const cx = SHAFT_CX, y = this.nextSpawnY + 180 + Math.random() * 260;
    const side = Math.random() < 0.5;
    this._addBounce(side ? cx - 90 : cx + 90, y, 180, 18);
    if (Math.random() < 0.5)
      this._addBounce(side ? cx + 80 : cx - 80, y + 220, 160, 18);
    if (Math.random() < 0.5)
      this._addEnemy(cx + (Math.random() - 0.5) * 280, y + 70);
    this._addCollectible(cx + (Math.random() - 0.5) * 180, y - 60, "energy");
    this.nextSpawnY = y + 240;
  }

  _spawnClimbChunk() {
    const cx = SHAFT_CX, y = this.nextSpawnY;
    const lx = cx - 130, rx = cx + 10;
    const side = Math.random() < 0.5;
    this._addBounce(side ? lx : rx, y, 130, 18);
    this._addBounce(side ? rx : lx, y - 190, 130, 18);
    if (Math.random() < 0.4) this._addEnemy(cx + (Math.random() - 0.5) * 220, y - 80);
    this._addCollectible(cx + (Math.random() - 0.5) * 120, y - 130, "energy");
    this.nextSpawnY = y - 290;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FACTORY HELPERS  — all physics bodies are invisible 'px' images
  // ═══════════════════════════════════════════════════════════════════════════

  _makePxBody(cx, cy, w, h, group) {
    // cx, cy = CENTER of hitbox (matches visual rendering)
    const body = group.create(cx, cy, "px");
    body.setScale(w, h);
    body.setAlpha(0.01);
    body.refreshBody();
    return body;
  }

  _addSolidPlat(cx, cy, w, h, color) {
    const body = this._makePxBody(cx, cy, w, h, this.staticPlatforms);
    body.platformType = "solid";
    this.platData.push({ body, cx, cy, w, h, color, type: "solid" });
    return body;
  }

  _addBounce(cx, cy, w, h) {
    const body = this._makePxBody(cx, cy, w, h, this.staticPlatforms);
    body.platformType = "pad";
    this.platData.push({ body, cx, cy, w, h, color: 0x22c55e, type: "pad" });
    return body;
  }

  _addSpikes(x, w) {
    // x = left edge, centered hitbox
    const body = this._makePxBody(x + w / 2, GROUND_Y - 14, w, 28, this.spikeGroup);
    this.spikeData.push({ x, y: GROUND_Y - 28, w });
    return body;
  }

  _addWater(x, w) {
    this.waterData.push({ x, y: GROUND_Y - 38, w, h: 54 });
    // Hop platforms over water
    const n = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < n; i++) {
      const px = x + (w / n) * i + w / (n * 2);
      const pw = 65 + Math.random() * 35;
      this._addSolidPlat(px, GROUND_Y - 130, pw, 16, 0x475569);
    }
    this._addCollectible(x + w / 2, GROUND_Y - 162, "energy");
  }

  _addPitfall(x, w) {
    this.pitData.push({ x, w });
    // Hop platforms over the pit
    const n = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < n; i++) {
      const px = x + (w / n) * i + w / (n * 2);
      const py = GROUND_Y - 108 - Math.random() * 30;
      const pw = 70 + Math.random() * 40;
      this._addSolidPlat(px, py, pw, 16, 0x475569);
      if (i === 1) this._addCollectible(px, py - 30, Math.random() < 0.6 ? "energy" : "life");
    }
  }

  _addPortal(cx, cy, w, h, target) {
    const body = this._makePxBody(cx, cy, w, h, this.portalGroup);
    body.portalTarget = target;
    this.portalData.push({ body, cx, cy, w, h, target });
    return body;
  }

  _addEnemy(x, y) {
    const r = 18 + Math.random() * 10;
    const body = this.physics.add.image(x, y, "px");
    body.setAlpha(0.01);
    body.body.setSize(r * 2, r * 2, true);
    body.body.setAllowGravity(false);
    body.body.setImmovable(true);
    body.body.setVelocityX((Math.random() < 0.5 ? 1 : -1) * (50 + Math.random() * 80));
    const behavior = ["hover", "patrol", "zigzag"][Math.floor(Math.random() * 3)];
    const ed = { body, r, color: 0xf87171, behavior, phase: Math.random() * Math.PI * 2, ampY: 18 + Math.random() * 28, baseY: y };
    this.enemyData.push(ed);
    this.enemyGroup.add(body);
    return body;
  }

  _addCollectible(x, y, type = "energy") {
    const r = 13;
    const body = this.physics.add.image(x, y, "px");
    body.setAlpha(0.01);
    body.body.setSize(r * 2, r * 2, true);
    body.body.setAllowGravity(false);
    body.body.setImmovable(true);
    body.collectType = type;
    this.collectData.push({ body, type, x, y });
    this.collectGroup.add(body);
    return body;
  }

  _addLightningRod(x) {
    const id = `rod-${x.toFixed(0)}-${Math.random()}`;
    this.rodData.push({ x, y: GROUND_Y - 100, id, charge: 0 });
  }

  _addFlipper(cx, cy, side) {
    const w = 150, h = 18;
    const body = this._makePxBody(cx, cy, w, h, this.staticPlatforms);
    body.platformType = "flipper";
    body.flipperSide = side;
    this.flipperData.push({ body, side, cx, cy, w, h });
    return body;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  COLLISION CALLBACKS
  // ═══════════════════════════════════════════════════════════════════════════

  _onPlatformCollide(pl, plat) {
    if (plat.platformType === "pad") {
      const params = this.paramsRef.current;
      if (pl.body.velocity.y > 0) {
        const bs = Math.max(280, Math.abs(pl.body.velocity.y) * Math.max(0.35, params.elasticity) + params.jumpSpeed * 0.55);
        pl.body.setVelocityY(-bs);
        this.reason = `Bounce pad! e=${fmt(params.elasticity, 2)} — v_after/v_before`;
      }
      return;
    }
    if (plat.platformType === "flipper") {
      const active = plat.flipperSide === "left" ? this.flipL : this.flipR;
      pl.body.setVelocityY(active ? -860 : -300);
      pl.body.setVelocityX(plat.flipperSide === "left" ? 300 : -300);
      this.score += 15;
      this.reason = "Flipper! τ=Iα — angular acceleration becomes linear launch.";
    }
  }

  _onPortal(portal) {
    if (this.transitioning || this.spawnGuard > 0) return;
    this._transitionTo(portal.portalTarget || "side");
  }

  _onEnemyHit(enemyBody) {
    if (this.invuln > 0) return;
    const params = this.paramsRef.current;
    const pl = this.player;
    if (params.superGravity && pl.body.velocity.y > 240) {
      enemyBody.destroy();
      this.enemyData = this.enemyData.filter(e => e.body !== enemyBody);
      pl.body.setVelocityY(-Math.abs(pl.body.velocity.y) * 0.25);
      this.score += 85;
      this.reason = "Crush! Super gravity converts mgh into impact force.";
    } else {
      const dir = pl.x > enemyBody.x ? 1 : -1;
      this._damagePlayer("Enemy impact! Impulse=FΔt.", dir * 900, -660);
    }
  }

  _onCollect(collectBody) {
    const cd = this.collectData.find(c => c.body === collectBody);
    if (!cd) return;
    collectBody.destroy();
    this.collectData = this.collectData.filter(c => c.body !== collectBody);
    if (cd.type === "life") {
      this.lives = Math.min(5, this.lives + 1);
      this.reason = "Life collected!";
    } else {
      this.energy = Math.min(100, this.energy + 24);
      this.reason = "Energy collected.";
    }
    this.score += 50;
    if (this.pendingTut) { this.onMsgCb(this.pendingTut); this.pendingTut = null; }
    this._checkUnlocks();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  GAME LOGIC
  // ═══════════════════════════════════════════════════════════════════════════

  _damagePlayer(msg, kx = -280, ky = -220) {
    if (this.invuln > 0 || !this.alive) return;
    this.invuln = 1.8;
    const hadEnergy = this.energy > 34;
    this.energy = Math.max(0, this.energy - 34);
    if (!hadEnergy) this.lives--;
    this.player.body.setVelocity(kx, ky);
    this.reason = msg + (hadEnergy ? " Energy lost." : " Life lost!");
    if (this.lives <= 0) { this.alive = false; }
  }

  _transitionTo(id) {
    if (this.transitioning) return;
    this.transitioning = true;
    const scn = SCENES.find(s => s.id === id) || SCENES[0];
    this.transText.setText(scn.title).setAlpha(1);
    this.transTtl = 0.9;
    this.time.delayedCall(900, () => this._setupScene(id));
  }

  _checkUnlocks() {
    if (!this.unlocks.elasticity && this.furthestX >= 1200) {
      this.unlocks.elasticity = true; this.pendingTut = TUTORIALS.elasticity;
    } else if (!this.unlocks.blaster && this.furthestX >= 2800) {
      this.unlocks.blaster = true; this.pendingTut = TUTORIALS.blaster;
    } else if (!this.unlocks.crush && this.furthestX >= 4600) {
      this.unlocks.crush = true; this.pendingTut = TUTORIALS.crush;
    }
  }

  _checkBumpers() {
    const pl = this.player;
    for (const b of this.bumperData) {
      const dx = pl.x - b.x, dy = pl.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < BALL_R + b.r && dist > 0) {
        const nx = dx / dist, ny = dy / dist;
        const spd = Math.max(520, Math.hypot(pl.body.velocity.x, pl.body.velocity.y) * 1.35);
        pl.body.setVelocity(nx * spd, ny * spd);
        pl.x = b.x + nx * (BALL_R + b.r + 2);
        pl.y = b.y + ny * (BALL_R + b.r + 2);
        this.score += 30;
        this.reason = "Bumper! Elastic collision — J=Δp.";
      }
    }
  }

  _tickLightning(dt) {
    this.lightningTimer -= dt;
    if (this.lightningTimer > 0) return;
    this.lightningTimer = 3 + Math.random() * 5;

    const px = this.player.x;
    // 35% chance to target a nearby rod
    let tx = Math.random() < 0.55 ? px + 80 + Math.random() * 420 : px - 80 - Math.random() * 320;
    if (Math.random() < 0.35 && this.rodData.length > 0) {
      const rod = this.rodData[Math.floor(Math.random() * this.rodData.length)];
      tx = rod.x;
      rod.charge = Math.min(3, rod.charge + 1);
    }

    // Build jagged bolt path
    const pts = [[tx, 0]];
    let bx = tx;
    for (let i = 1; i < 12; i++) {
      const t = i / 12;
      bx = tx + (Math.random() - 0.5) * 140 * Math.sin(t * Math.PI);
      pts.push([bx, GROUND_Y * t]);
    }
    pts.push([tx + (Math.random() - 0.5) * 20, GROUND_Y]);
    this.lightningBolts.push({ pts, ttl: 0.55, maxTtl: 0.55 });

    if (Math.abs(px - tx) < 50 && this.invuln <= 0)
      this._damagePlayer("Lightning strike! V≈300MV — Q=CV, grab a charged rod.", (Math.random() - 0.5) * 700, -540);

    // Rod pickup check
    for (const rod of this.rodData) {
      if (rod.charge <= 0) continue;
      const dx = this.player.x - rod.x, dy = this.player.y - rod.y;
      if (dx * dx + dy * dy < (BALL_R + 28) * (BALL_R + 28)) {
        this.energy = Math.min(100, this.energy + 28 * rod.charge);
        this.score += 40 * rod.charge;
        this.reason = `Rod discharged! Q=CV — ${rod.charge} charge unit${rod.charge > 1 ? "s" : ""} of energy.`;
        rod.charge = 0;
        if (!this.pendingTut) this.pendingTut = TUTORIALS.lightning;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  RENDER  — all visuals drawn here via worldGfx / lightningGfx
  // ═══════════════════════════════════════════════════════════════════════════

  _render() {
    const g = this.worldGfx;
    g.clear();

    // Ground (side scroll only — draw a floor strip)
    if (this.sceneId === "side") {
      g.fillStyle(0x334155, 0.88);
      // draw ground far left to far right
      g.fillRect(-200, GROUND_Y, this.player.x + W * 2, H - GROUND_Y + 60);

      // Pitfall voids punch holes
      for (const pit of this.pitData) {
        g.fillStyle(0x02040c, 1);
        g.fillRect(pit.x, GROUND_Y, pit.w, H - GROUND_Y + 60);
        g.lineStyle(1, 0x1e293b, 1);
        g.strokeRect(pit.x, GROUND_Y, pit.w, H - GROUND_Y + 60);
      }

      // Water sections
      for (const w2 of this.waterData) {
        g.fillStyle(0x38bdf8, 0.16);
        g.fillRoundedRect(w2.x, w2.y, w2.w, w2.h, 10);
        // animated wave line
        g.lineStyle(3, 0x7dd3fc, 0.9);
        g.beginPath();
        const t = this.time.now / 420;
        for (let i = 0; i <= 12; i++) {
          const wx = w2.x + 6 + ((w2.w - 12) * i) / 12;
          const wy = w2.y + 12 + Math.sin(t + (i / 12) * Math.PI * 2.5) * 7;
          i === 0 ? g.moveTo(wx, wy) : g.lineTo(wx, wy);
        }
        g.strokePath();
      }

      // Spikes
      for (const sp of this.spikeData) {
        g.fillStyle(0xfb7185, 0.9);
        const count = Math.max(2, Math.floor(sp.w / 18));
        const step = sp.w / count;
        for (let i = 0; i < count; i++) {
          const sx = sp.x + i * step;
          g.fillTriangle(sx, sp.y + 28, sx + step / 2, sp.y, sx + step, sp.y + 28);
        }
      }
    }

    // Shaft walls shading (fall/climb/pinball)
    if (this.sceneId !== "side") {
      const cx = SHAFT_CX;
      const hw = this.sceneId === "pinball" ? PB_HW : SHAFT_HW;
      g.fillStyle(0x0a1628, 0.7);
      g.fillRect(cx - hw - 24, -120, (hw + 24) * 2 + 48, H + 240);
      g.lineStyle(2, 0x1e3a5f, 0.8);
      g.strokeRect(cx - hw - 12, -120, hw * 2 + 24, H + 240);
    }

    // Platforms (solid + pad)
    for (const pd of this.platData) {
      if (pd.type === "pad") {
        g.fillStyle(0x22c55e, 0.85);
        g.fillRoundedRect(pd.cx - pd.w / 2, pd.cy - pd.h / 2, pd.w, pd.h, 6);
        g.lineStyle(2, 0x86efac, 0.6);
        g.strokeRoundedRect(pd.cx - pd.w / 2, pd.cy - pd.h / 2, pd.w, pd.h, 6);
      } else if (pd.color !== 0x1e3a5f) { // skip wall platforms (drawn above)
        g.fillStyle(pd.color || 0x475569, 0.9);
        g.fillRoundedRect(pd.cx - pd.w / 2, pd.cy - pd.h / 2, pd.w, pd.h, 5);
      }
    }

    // Portals
    for (const pd of this.portalData) {
      const col = pd.target === "side" ? 0x4ade80 : pd.target === "fall" ? 0x22d3ee : 0xc4b5fd;
      g.lineStyle(3, col, 1);
      g.fillStyle(col, 0.18);
      g.fillRoundedRect(pd.cx - pd.w / 2, pd.cy - pd.h / 2, pd.w, pd.h, 8);
      g.strokeRoundedRect(pd.cx - pd.w / 2, pd.cy - pd.h / 2, pd.w, pd.h, 8);
      // Label drawn as text separately (see create — not redrawn, stable)
    }

    // Lightning rods
    for (const rod of this.rodData) {
      const glow = rod.charge > 0;
      g.fillStyle(0x94a3b8, 1);
      g.fillRect(rod.x - 3, rod.y, 6, 100);       // pole
      g.fillStyle(glow ? 0xfbbf24 : 0x475569, 1);
      g.fillCircle(rod.x, rod.y, 10);              // ball tip
      if (glow) {
        g.lineStyle(2, 0xfde047, 0.8);
        g.strokeCircle(rod.x, rod.y, 14);
      }
    }

    // Bumpers (pinball)
    for (const b of this.bumperData) {
      g.fillStyle(0xfbbf24, 0.18);
      g.fillCircle(b.x, b.y, b.r + 7);
      g.fillStyle(0xfbbf24, 0.88);
      g.fillCircle(b.x, b.y, b.r);
      g.lineStyle(3, 0xfde68a, 1);
      g.strokeCircle(b.x, b.y, b.r);
    }

    // Flippers
    for (const fl of this.flipperData) {
      const active = fl.side === "left" ? this.flipL : this.flipR;
      const tilt = fl.side === "left" ? (active ? -26 : 12) : (active ? 26 : -12);
      g.fillStyle(active ? 0xfbbf24 : 0x94a3b8, 0.9);
      // Simple rotated rect approximation: draw as shifted rects
      // (Phaser Graphics doesn't support rotation on individual shapes, so we draw flat and rely on the tilt being minor)
      const lx = fl.cx - fl.w / 2, ly = fl.cy - fl.h / 2;
      g.fillRect(lx, ly, fl.w, fl.h);
    }

    // Pinball 2.5D decorative overlay
    if (this.sceneId === "pinball") {
      const cx = SHAFT_CX;
      // Draw table outline as a perspective trapezoid
      g.lineStyle(3, 0xfbbf24, 0.38);
      // top edge narrower, bottom wider — gives tilt illusion
      const tw = PB_HW * 2;
      g.strokeRect(cx - PB_HW, 64, tw, H - 90);
      // Score lane lines
      g.lineStyle(1, 0xfbbf24, 0.12);
      for (let i = 1; i < 4; i++) {
        g.lineBetween(cx - PB_HW, 64 + (H - 160) * i / 4, cx + PB_HW, 64 + (H - 160) * i / 4);
      }
      // Cannon label
      g.fillStyle(0x64748b, 0.8);
      g.fillRoundedRect(cx + PB_HW - 62, 70, 54, 26, 6);
    }

    // Collectibles
    for (const cd of this.collectData) {
      const col = cd.type === "life" ? 0xfb7185 : 0x4ade80;
      g.fillStyle(col, 0.18);
      g.fillCircle(cd.body.x, cd.body.y, 20);
      g.fillStyle(col, 1);
      g.fillCircle(cd.body.x, cd.body.y, 13);
    }

    // Enemies
    for (const ed of this.enemyData) {
      if (!ed.body.active) continue;
      g.fillStyle(0xf87171, 0.9);
      g.fillCircle(ed.body.x, ed.body.y, ed.r);
      g.lineStyle(2, 0xfecaca, 0.7);
      g.strokeCircle(ed.body.x, ed.body.y, ed.r);
    }

    // Player — bright cyan ball so it's clearly visible
    const px = this.player.x, py = this.player.y;
    const invulFlicker = this.invuln > 0 && Math.floor(this.time.now / 80) % 2 === 0;
    if (!invulFlicker) {
      g.fillStyle(0x3b82f6, 0.22);
      g.fillCircle(px, py, BALL_R + 8);
      g.fillStyle(0xf0f9ff, 1);
      g.fillCircle(px, py, BALL_R);
      g.lineStyle(3, 0x38bdf8, 1);
      g.strokeCircle(px, py, BALL_R);
      // Velocity direction dot
      const vx = this.player.body.velocity.x, vy = this.player.body.velocity.y;
      const spd = Math.hypot(vx, vy);
      if (spd > 40) {
        const scale = Math.min(BALL_R - 4, spd * 0.022);
        g.fillStyle(0x38bdf8, 0.85);
        g.fillCircle(px + (vx / spd) * (BALL_R - 6), py + (vy / spd) * (BALL_R - 6), scale);
      }
    }

    // Lightning
    const lg = this.lightningGfx;
    lg.clear();
    this.lightningBolts = this.lightningBolts.filter(b => b.ttl > 0);
    for (const bolt of this.lightningBolts) {
      const fade = bolt.ttl / bolt.maxTtl;
      const flicker = Math.floor(bolt.ttl * 24) % 2 === 0 ? 1 : 0.55;
      const a = fade * flicker;
      lg.lineStyle(18, 0x93c5fd, 0.32 * a);
      lg.beginPath();
      bolt.pts.forEach(([bx, by], i) => i === 0 ? lg.moveTo(bx, by) : lg.lineTo(bx, by));
      lg.strokePath();
      lg.lineStyle(4, 0xe0f2fe, a);
      lg.beginPath();
      bolt.pts.forEach(([bx, by], i) => i === 0 ? lg.moveTo(bx, by) : lg.lineTo(bx, by));
      lg.strokePath();
      lg.lineStyle(2, 0xffffff, a);
      lg.beginPath();
      bolt.pts.forEach(([bx, by], i) => i === 0 ? lg.moveTo(bx, by) : lg.lineTo(bx, by));
      lg.strokePath();
      // Strike flash
      const last = bolt.pts[bolt.pts.length - 1];
      lg.fillStyle(0xfde047, 0.65 * a);
      lg.fillCircle(last[0], last[1], 12);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  MAIN UPDATE LOOP
  // ═══════════════════════════════════════════════════════════════════════════

  update(time, delta) {
    if (!this.alive || this.transitioning) { this._render(); return; }
    const dt = Math.min(delta / 1000, 0.05);
    const params = this.paramsRef.current;
    // Update held-key axes each frame
    const k = this.keys;
    this._inp.left  = k.left.isDown  || k.a.isDown;
    this._inp.right = k.right.isDown || k.d.isDown;
    this._inp.up    = k.up.isDown    || k.w.isDown;
    this._inp.down  = k.down.isDown  || k.s.isDown;
    const input = this._inp;
    const pl     = this.player;

    // ── Apply live physics params ─────────────────────────────────────────────
    this.physics.world.gravity.y = params.gravity;
    // elasticity handled in bounce pad callback, drag = friction
    pl.body.setDragX(params.friction * 900);

    // ── Time / score ──────────────────────────────────────────────────────────
    this.survivedSec += dt;
    this.spawnGuard   = Math.max(0, this.spawnGuard - dt);
    this.difficulty   = 1 + this.survivedSec / 18;
    this.score       += dt * (100 + this.difficulty * 16);
    this.invuln       = Math.max(0, this.invuln - dt);
    this.furthestX    = Math.max(this.furthestX, pl.x);

    // ── Horizontal input ──────────────────────────────────────────────────────
    const horiz = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (params.mode === "velocity") {
      const target = horiz * (240 + params.controlGain * 210);
      const diff   = target - pl.body.velocity.x;
      const lerpF  = pl.body.blocked.down ? 10.5 : 4.5;
      pl.body.setVelocityX(pl.body.velocity.x + diff * lerpF * dt);
    } else {
      pl.body.setAccelerationX(horiz !== 0 ? horiz * params.controlGain * 760 : 0);
    }

    // ── Jump ──────────────────────────────────────────────────────────────────
    if (input.jumpQueued && pl.body.blocked.down) {
      pl.body.setVelocityY(-params.jumpSpeed);
      this.reason = `Jump! v₀ = ${fmt(params.jumpSpeed, 0)} px/s, max height ≈ ${fmt(params.jumpSpeed * params.jumpSpeed / (2 * params.gravity), 0)} px`;
    }
    input.jumpQueued = false;

    // ── Super gravity ─────────────────────────────────────────────────────────
    if (input.superGravity && this.unlocks.crush && this.energy >= 30) {
      pl.body.setVelocityY(pl.body.velocity.y + params.gravity * 1.35 * dt);
      this.energy = Math.max(0, this.energy - 8 * dt);
    }

    // ── Scene-specific updates ────────────────────────────────────────────────
    if      (this.sceneId === "side")    this._updateSide(dt, input);
    else if (this.sceneId === "fall")    this._updateFall(dt);
    else if (this.sceneId === "climb")   this._updateClimb(dt);
    else if (this.sceneId === "pinball") this._updatePinball(dt, input);

    // ── Enemy AI ──────────────────────────────────────────────────────────────
    for (const ed of this.enemyData) {
      if (!ed.body.active) continue;
      ed.phase += dt * 2.4;
      if (ed.behavior === "hover") {
        ed.body.y = ed.baseY + Math.sin(ed.phase) * ed.ampY;
      } else if (ed.behavior === "zigzag") {
        ed.body.body.setVelocityX(Math.sin(ed.phase * 1.35) * 120);
      }
    }

    // ── Pitfall check (side scroll) ───────────────────────────────────────────
    if (this.sceneId === "side") {
      for (const pit of this.pitData) {
        if (pl.x > pit.x && pl.x < pit.x + pit.w && pl.y > GROUND_Y + 100) {
          this._transitionTo("fall"); break;
        }
      }
    }

    // ── Water drag (side scroll) ──────────────────────────────────────────────
    if (this.sceneId === "side") {
      for (const wz of this.waterData) {
        if (pl.x > wz.x && pl.x < wz.x + wz.w && pl.y + BALL_R > wz.y && pl.y - BALL_R < wz.y + wz.h) {
          pl.body.setVelocityX(pl.body.velocity.x * 0.88);
          pl.body.setVelocityY(pl.body.velocity.y * 0.78);
          pl.body.blocked.down = true; // allow jump from water surface
          this.reason = "Water drag! F=bv — jump to a hop platform above.";
        }
      }
    }

    // ── Bumpers (pinball) ─────────────────────────────────────────────────────
    if (this.sceneId === "pinball") this._checkBumpers();

    // ── Lightning (side scroll) ───────────────────────────────────────────────
    if (this.sceneId === "side") this._tickLightning(dt);

    // ── Spawn new content ─────────────────────────────────────────────────────
    if (this.sceneId === "side" && pl.x + W * 1.4 > this.nextSpawnX) this._spawnSideChunk();
    if (this.sceneId === "fall"  && pl.y + H * 1.2 > this.nextSpawnY)  this._spawnFallChunk();
    if (this.sceneId === "climb" && pl.y - H * 0.9 < this.nextSpawnY)  this._spawnClimbChunk();

    // ── Goal ─────────────────────────────────────────────────────────────────
    if (this.furthestX >= this.goalX) {
      this.onMsgCb(TUTORIALS.pi || "π milestone!");
      this.goalX += 12000;
      this.score += 500;
    }

    // ── Transition text fade ──────────────────────────────────────────────────
    if (this.transTtl > 0) {
      this.transTtl -= dt;
      this.transText.setAlpha(Math.max(0, this.transTtl / 0.9));
    }

    // ── Bolt ttl ──────────────────────────────────────────────────────────────
    for (const b of this.lightningBolts) b.ttl -= dt;

    // ── Render ────────────────────────────────────────────────────────────────
    this._render();

    // ── Push stats to React (throttled via simple counter) ───────────────────
    this.onScore(Math.round(this.score));
    this.onEnergy(Math.round(this.energy));
    this.onSceneCb(this.sceneId);
    if (this.reason) { this.onMsgCb(this.reason); this.reason = ""; }
  }

  // ── Per-scene update helpers ─────────────────────────────────────────────────

  _updateSide(dt) {
    const pl = this.player;
    // Force camera Y to 0 — no vertical scroll in side scroll
    this.cameras.main.scrollY = 0;
    // Prevent player from going off left edge
    const camLeft = this.cameras.main.scrollX;
    if (pl.x < camLeft + BALL_R + 28) {
      pl.x = camLeft + BALL_R + 28;
      if (pl.body.velocity.x < 0) pl.body.setVelocityX(80);
    }
    // Fell below world
    if (this.spawnGuard <= 0 && pl.y > H + 120) this._transitionTo("fall");
  }

  _updateFall(dt) {
    const pl = this.player;
    const cx = SHAFT_CX;
    pl.x = Phaser.Math.Clamp(pl.x, cx - SHAFT_HW + BALL_R, cx + SHAFT_HW - BALL_R);
    // Wall bounce
    if (pl.x <= cx - SHAFT_HW + BALL_R + 2 || pl.x >= cx + SHAFT_HW - BALL_R - 2) {
      pl.body.setVelocityX(-pl.body.velocity.x * Math.max(0.25, this.paramsRef.current.elasticity));
    }
    // Exit at bottom
    if (this.spawnGuard <= 0 && pl.y > H - 60) {
      this.score += 220;
      this.energy = Math.min(100, this.energy + 18);
      this._transitionTo("side");
    }
  }

  _updateClimb(dt) {
    const pl = this.player;
    const cx = SHAFT_CX;
    pl.x = Phaser.Math.Clamp(pl.x, cx - SHAFT_HW + BALL_R, cx + SHAFT_HW - BALL_R);
    if (pl.x <= cx - SHAFT_HW + BALL_R + 2 || pl.x >= cx + SHAFT_HW - BALL_R - 2) {
      pl.body.setVelocityX(-pl.body.velocity.x * Math.max(0.25, this.paramsRef.current.elasticity));
    }
    // Danger floor
    if (pl.y > H - 78) {
      pl.body.setVelocityY(-Math.max(300, Math.abs(pl.body.velocity.y)));
      this.energy = Math.max(0, this.energy - 12);
      this.reason = "Danger floor! Use bounce pads — potential energy PE=mgh.";
    }
    // Exit at top
    if (this.spawnGuard <= 0 && pl.y < 68) {
      this.score += 260;
      this.energy = Math.min(100, this.energy + 24);
      this._transitionTo("side");
    }
  }

  _updatePinball(dt, input) {
    const pl = this.player;
    const cx = SHAFT_CX;
    pl.x = Phaser.Math.Clamp(pl.x, cx - PB_HW + BALL_R, cx + PB_HW - BALL_R);
    if (pl.x <= cx - PB_HW + BALL_R + 2 || pl.x >= cx + PB_HW - BALL_R - 2) {
      pl.body.setVelocityX(-pl.body.velocity.x * Math.max(0.5, this.paramsRef.current.elasticity));
    }
    if (pl.y < 68 + BALL_R) {
      pl.y = 68 + BALL_R;
      pl.body.setVelocityY(Math.abs(pl.body.velocity.y) * 0.65);
    }
    // Drain
    if (pl.y > H - 18) {
      this.energy = Math.max(0, this.energy - 20);
      this._transitionTo("side");
    }
    // Space = both flippers
    if (input.jumpQueued) {
      this.flipL = true; this.flipR = true;
      this.time.delayedCall(130, () => { this.flipL = false; this.flipR = false; });
    }
  }
}
// ─── React Component ────────────────────────────────────────────────────────
const C = {
  bg: "#0f172a", panel: "#1e293b", border: "#334155",
  teal: "#38bdf8", text: "#e2e8f0", sub: "#94a3b8",
  green: "#4ade80", yellow: "#fbbf24", red: "#f87171",
};

const SLIDER_DEFS = [
  { key: "gravity",     label: "Gravity",      min: 100,  max: 1800, step: 50,  unit: "m/s²", eq: "F=mg" },
  { key: "jumpSpeed",   label: "Jump Speed",   min: 150,  max: 900,  step: 25,  unit: "m/s",  eq: "v=gt" },
  { key: "elasticity",  label: "Elasticity",   min: 0.1,  max: 1.0,  step: 0.05,unit: "e",    eq: "e=v₂/v₁" },
  { key: "friction",    label: "Friction",     min: 0,    max: 1.0,  step: 0.05,unit: "μ",    eq: "f=μN" },
  { key: "controlGain", label: "Control Gain", min: 0.2,  max: 3.0,  step: 0.1, unit: "×",    eq: "a=Fnet/m" },
];

export default function RealityRunner() {
  const navigate = useNavigate();
  const mountRef  = useRef(null);
  const gameRef   = useRef(null);
  const paramsRef = useRef(null);

  const [params, setParams] = useState({
    gravity: 800, jumpSpeed: 480, elasticity: 0.65,
    friction: 0.12, controlGain: 1.0, motionMode: "side",
  });
  const [score, setScore]   = useState(0);
  const [energy, setEnergy] = useState(80);
  const [scene, setScene]   = useState("side");
  const [msg, setMsg]       = useState("");

  // keep paramsRef in sync — Phaser reads this every frame
  paramsRef.current = params;

  useEffect(() => {
    if (!mountRef.current) return;
    const pr = paramsRef;

    const config = {
      type: Phaser.AUTO,
      width: W,
      height: H,
      parent: mountRef.current,
      backgroundColor: "#0f172a",
      physics: {
        default: "arcade",
        arcade: { gravity: { y: params.gravity }, debug: false },
      },
      scene: [GameScene],
    };

    const game = new Phaser.Game(config);
    game.registry.set("paramsRef", pr);
    game.registry.set("onScore",  (v) => setScore(v));
    game.registry.set("onEnergy", (v) => setEnergy(v));
    game.registry.set("onScene",  (v) => setScene(v));
    game.registry.set("onMsg",    (v) => setMsg(v));
    gameRef.current = game;

    return () => { game.destroy(true); gameRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleParam = useCallback((key, val) => {
    setParams(prev => ({ ...prev, [key]: val }));
  }, []);

  const reset = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    const s = g.scene.getScene("GameScene");
    if (s) s.scene.restart();
    setScore(0); setEnergy(80); setScene("side"); setMsg("");
  }, []);

  const energyColor = energy > 60 ? C.green : energy > 25 ? C.yellow : C.red;

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, color: C.text, fontFamily: "monospace" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: C.panel, borderRight: `1px solid ${C.border}`, padding: "14px 12px", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", flexShrink: 0 }}>
        <button onClick={() => navigate("/games")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: C.sub, cursor: "pointer", fontSize: 13, padding: 0, marginBottom: 4 }}>
          <ArrowLeft size={14} /> Back
        </button>

        <div style={{ fontSize: 15, fontWeight: 700, color: C.teal, letterSpacing: 1 }}>REALITY RUNNER</div>
        <div style={{ fontSize: 11, color: C.sub }}>Physics Sandbox</div>

        {/* Status */}
        <div style={{ background: C.bg, borderRadius: 8, padding: "8px 10px", fontSize: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: C.sub }}>Score</span>
            <span style={{ color: C.teal }}>{score}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: C.sub }}>Scene</span>
            <span style={{ color: C.yellow, textTransform: "capitalize" }}>{scene}</span>
          </div>
          <div style={{ fontSize: 11, color: C.sub, marginBottom: 3 }}>Energy</div>
          <div style={{ background: C.border, borderRadius: 4, height: 8 }}>
            <div style={{ width: `${energy}%`, height: "100%", background: energyColor, borderRadius: 4, transition: "width 0.2s" }} />
          </div>
        </div>

        {/* Message */}
        {msg && (
          <div style={{ background: "#1e3a5f", border: `1px solid ${C.teal}`, borderRadius: 6, padding: "6px 9px", fontSize: 11, color: C.teal, lineHeight: 1.5 }}>
            {msg}
          </div>
        )}

        {/* Sliders */}
        {SLIDER_DEFS.map(({ key, label, min, max, step, unit, eq }) => (
          <div key={key} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
              <span style={{ color: C.sub }}>{label}</span>
              <span style={{ color: C.teal }}>{params[key]}{unit === "×" ? "×" : ""}</span>
            </div>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 1 }}>{eq}</div>
            <input type="range" min={min} max={max} step={step} value={params[key]}
              onChange={e => handleParam(key, parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: C.teal }} />
          </div>
        ))}

        {/* Motion Mode */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 11, color: C.sub }}>Motion Mode</div>
          {["side", "fall", "climb", "pinball"].map(m => (
            <button key={m} onClick={() => handleParam("motionMode", m)}
              style={{ padding: "4px 8px", borderRadius: 5, border: `1px solid ${params.motionMode === m ? C.teal : C.border}`, background: params.motionMode === m ? "#1e3a5f" : "transparent", color: params.motionMode === m ? C.teal : C.sub, fontSize: 12, cursor: "pointer", textTransform: "capitalize" }}>
              {m}
            </button>
          ))}
        </div>

        {/* Reset */}
        <button onClick={reset} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: "auto", padding: "8px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.sub, cursor: "pointer", fontSize: 12 }}>
          <RotateCcw size={13} /> Reset
        </button>

        <div style={{ fontSize: 10, color: "#475569", textAlign: "center" }}>
          WASD / Arrow keys<br />Space = jump
        </div>
      </div>

      {/* Game Canvas */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div ref={mountRef} style={{ width: W, height: H }} />
      </div>
    </div>
  );
}
