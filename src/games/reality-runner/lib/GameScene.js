import * as Phaser from "phaser";
import { playTone } from "../../shared/audio.js";
import {
  W, H, GROUND_Y, BALL_R, PIT_DEPTH, PIT_FLOOR_Y, PIN_W, PIN_TOP,
  ABILITY_MILESTONES, TUTORIALS, fmt, clamp,
} from "./constants.js";

/* ════════════════════════════════════════════════════════════════════════
   GameScene — the whole game lives in this one Phaser.Scene. No sprites:
   every physics body uses the same 1×1 white "px" texture (built in create()
   below) and is drawn manually each frame in _render() from plain data
   arrays (platData, enemyData, collectData, rodData, bumperData,
   flipperData). That's why adding something new always touches at least
   two places — once to create the physics body/data entry, once to draw it.

   Read top to bottom:
     create()              — one-time setup: input, player body, physics
                              groups + collision rules, then builds the
                              starting stretch of world.
     WORLD CONSTRUCTION    — the _addX / _buildX methods. Each _addX creates a
                              physics body AND pushes a matching entry into
                              a data array. The _buildX methods assemble several
                              _add* calls into a pit / pinball chamber / run
                              chunk. _extendWorld() is the master generator,
                              called from update() whenever the player gets
                              close to the edge of what's been built so far.
     COLLISION CALLBACKS   — _onX methods, wired up once in create() via
                              physics.add.collider/overlap. Phaser calls
                              these automatically when the player's body
                              touches the matching group.
     GAME LOGIC            — helpers used by update() that aren't simple
                              collision responses (damage/lives, ability
                              unlocks, bumper math, the lightning timer).
     RENDER                — _render(), redraws everything every frame from
                              the data arrays. No persistent sprites to keep
                              in sync — clear and redraw is simpler here
                              given how dynamic the world is.
     MAIN UPDATE           — update(time, delta), Phaser's per-frame hook.
                              Reads input, applies movement, runs the safety
                              nets, then calls _extendWorld()/_render().

   ── Adding something new (the common case) ──────────────────────────────
   A new HAZARD or PICKUP (no custom physics behavior, just touch-and-react):
     1. Write `_addThing(x, ...)` next to the other _add* methods — create
        a physics body in the right group (or a new staticGroup if it needs
        its own collision response), push a {cx,cy,w,h,...} entry to
        `this.platData` (or its own data array if it needs per-instance
        state like the rods' `charge`).
     2. Call it from `_buildRunChunk` (or `_extendWorld`) with some random
        chance, the same way spikes/water/rods are rolled today.
     3. Add a branch in `_render()`'s platData loop (or its own loop) to
        draw it — everything is hand-drawn Graphics calls, no asset files.
     4. If touching it should DO something, register an overlap/collider in
        create() pointing at an `_onThing` method, following the existing
        _onPad/_onRod/etc. pattern.

   A new ENEMY SHAPE: extend the `shape` switch in `_addEnemy` (hp/armored),
   add its movement pattern in update()'s "Enemy behavior" loop, and add a
   draw branch in `_render()`'s enemy loop.
   ════════════════════════════════════════════════════════════════════════ */
export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  create() {
    this.paramsRef = this.registry.get("paramsRef");
    this.touchRef = this.registry.get("touchRef");
    this.audioCtxRef = this.registry.get("audioCtxRef");
    this.onScore = this.registry.get("onScore") || (() => {});
    this.onEnergy = this.registry.get("onEnergy") || (() => {});
    this.onAbility = this.registry.get("onAbility") || (() => {});
    this.onMsg = this.registry.get("onMsg") || (() => {});
    this.onDead = this.registry.get("onDead") || (() => {});
    this.onZone = this.registry.get("onZone") || (() => {});
    this._sfx = (opts) => playTone(this.audioCtxRef?.current, opts);
    this._lastZoneSignal = null;

    /* ---- input ---- */
    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      j: Phaser.Input.Keyboard.KeyCodes.J,
      k: Phaser.Input.Keyboard.KeyCodes.K,
      z: Phaser.Input.Keyboard.KeyCodes.Z,
      x: Phaser.Input.Keyboard.KeyCodes.X,
    });
    this._jumpQueued = false;
    this._powerJumpQueued = false;
    this._poundQueued = false;
    const queueJump = () => { this._jumpQueued = true; };
    this.input.keyboard.on("keydown-SPACE", queueJump);
    this.input.keyboard.on("keydown-UP", queueJump);
    this.input.keyboard.on("keydown-W", queueJump);
    this.input.keyboard.on("keydown-J", () => { this._powerJumpQueued = true; });
    this.input.keyboard.on("keydown-K", () => { this._poundQueued = true; });

    /* ---- 1×1 texture used for every physics body (invisible; we draw manually) ---- */
    const pg = this.make.graphics({ add: false });
    pg.fillStyle(0xffffff, 1).fillRect(0, 0, 1, 1);
    pg.generateTexture("px", 1, 1);
    pg.destroy();

    /* ---- player ---- */
    this.player = this.physics.add.image(220, GROUND_Y - BALL_R, "px");
    this.player.setAlpha(0.01);
    this.player.body.setCircle(BALL_R, -(BALL_R - 0.5), -(BALL_R - 0.5));
    this.player.body.setMaxVelocity(1100, 2000);
    this.player.body.setCollideWorldBounds(false);
    this.player.body.setAllowGravity(true);

    /* ---- groups ---- */
    this.solidGroup = this.physics.add.staticGroup();   // ground, walls, normal platforms
    this.padGroup = this.physics.add.staticGroup();      // bounce pads (own collider, different response)
    this.flipperGroup = this.physics.add.staticGroup();  // pinball flippers
    this.spikeGroup = this.physics.add.staticGroup();    // hazards (overlap only)
    this.waterGroup = this.physics.add.staticGroup();    // slows you down, doesn't damage (overlap only)
    this.enemyGroup = this.physics.add.group();
    this.collectGroup = this.physics.add.group();
    this.rodGroup = this.physics.add.group();

    this.physics.add.collider(this.player, this.solidGroup);
    this.physics.add.collider(this.player, this.padGroup, (pl, pad) => this._onPad(pad), null, this);
    this.physics.add.collider(this.player, this.flipperGroup, (pl, fl) => this._onFlipper(fl), null, this);
    this.physics.add.overlap(this.player, this.spikeGroup, () => this._damage("Spike hit."), null, this);
    // Sets a flag read (and reset) once per frame in update() — see _inWater handling there.
    this.physics.add.overlap(this.player, this.waterGroup, () => { this.inWater = true; }, null, this);
    this.physics.add.overlap(this.player, this.enemyGroup, (pl, e) => this._onEnemy(e), null, this);
    this.physics.add.overlap(this.player, this.collectGroup, (pl, c) => this._onCollect(c), null, this);
    this.physics.add.overlap(this.player, this.rodGroup, (pl, r) => this._onRod(r), null, this);

    /* ---- render layers ---- */
    this.worldGfx = this.add.graphics();
    this.fxGfx = this.add.graphics();
    this.fxGfx.strikeFlashTtl = 0;
    this.fxGfx.strikeX = 0;

    /* ---- data registries (parallel to physics bodies, used for drawing/logic) ---- */
    this.platData = [];      // {body,cx,cy,w,h,color,kind}
    this.enemyData = [];     // {body,shape,r,hp,phase,baseY,armored}
    this.collectData = [];   // {body,type}
    this.rodData = [];       // {body,x,y,charge}
    this.bumperData = [];    // {x,y,r}
    this.flipperData = [];   // {body,side,cx,cy,w,h,baseAngle}
    this.pitZones = [];      // {x1,x2}
    this.pinballZones = [];  // {x1,x2,cx}

    /* ---- state ---- */
    this.score = 0;
    this.lives = 3;
    this.energy = 90;
    this.invuln = 0;
    this.alive = true;
    this.survivedDist = 0;
    this.furthestX = 220;
    this.flipL = false;
    this.flipR = false;
    this.powerJumpTtl = 0;
    this.abilities = { superJump: false, crush: false };
    this.lightningTimer = 5;
    this.lightningWarn = null; // {x, ttl}
    this.reason = "Run right. Hold J to charge nothing yet — find an ability first.";
    this.inPit = false;
    this.inPinball = false;
    this.inWater = false;
    this._recentPinball = false;

    /* ---- ground cursor / procedural generation state ---- */
    this.cursorX = 360;
    this.nextSpawnX = 900;
    this.lastScoreX = 220; // distance-based scoring tracks furthest right reached

    this.cameras.main.setBackgroundColor("#0a1320");
    this.cameras.main.startFollow(this.player, false, 0.12, 0.06);
    this.cameras.main.setFollowOffset(0, -40);
    this.cameras.main.setDeadzone(140, 220);

    this._buildWorld();
  }

  /* ══════════════════════════════════════════════════════════════════════
     WORLD CONSTRUCTION — flat ground with embedded pit + pinball pockets.
     Every pocket is hand-shaped to guarantee a way out (no orphaned content).
     ══════════════════════════════════════════════════════════════════════ */

  _addSolid(cx, cy, w, h, color = 0x334155, kind = "solid") {
    const body = this.solidGroup.create(cx, cy, "px");
    body.setScale(w, h).setAlpha(0.01).refreshBody();
    this.platData.push({ cx, cy, w, h, color, kind });
    return body;
  }

  _addPad(cx, cy, w, h = 18) {
    const body = this.padGroup.create(cx, cy, "px");
    body.setScale(w, h).setAlpha(0.01).refreshBody();
    this.platData.push({ cx, cy, w, h, color: 0x22c55e, kind: "pad" });
    return body;
  }

  _addFlipper(cx, cy, side) {
    const w = 150, h = 20;
    const body = this.flipperGroup.create(cx, cy, "px");
    body.setScale(w, h).setAlpha(0.01).refreshBody();
    const fd = { body, side, cx, cy, w, h };
    this.flipperData.push(fd);
    return fd;
  }

  _addSpike(x, w) {
    const body = this.spikeGroup.create(x + w / 2, GROUND_Y - 14, "px");
    body.setScale(w, 26).setAlpha(0.01).refreshBody();
    this.platData.push({ cx: x + w / 2, cy: GROUND_Y - 14, w, h: 26, color: 0xfb7185, kind: "spike" });
    return body;
  }

  /** A shallow pool sitting on top of the (already solid) ground — overlap
   *  only, no damage, just drags your horizontal speed down while you're in it. */
  _addWater(x, w) {
    const body = this.waterGroup.create(x + w / 2, GROUND_Y - 15, "px");
    body.setScale(w, 30).setAlpha(0.01).refreshBody();
    this.platData.push({ cx: x + w / 2, cy: GROUND_Y - 15, w, h: 30, color: 0x2dd4ff, kind: "water" });
    return body;
  }

  _addEnemy(x, y, shape) {
    const r = shape === "square" ? 24 : shape === "triangle" ? 22 : 20;
    const body = this.physics.add.image(x, y, "px");
    body.setAlpha(0.01);
    body.body.setSize(r * 2, r * 2, true);
    body.body.setAllowGravity(false);
    body.body.setImmovable(true);
    const armored = shape === "square";
    const ed = {
      body, shape, r, baseX: x, baseY: y, phase: Math.random() * Math.PI * 2,
      hp: armored ? 2 : 1, armored, dir: Math.random() < 0.5 ? 1 : -1,
    };
    this.enemyData.push(ed);
    this.enemyGroup.add(body);
    return ed;
  }

  _addCollectible(x, y, type) {
    const r = 13;
    const body = this.physics.add.image(x, y, "px");
    body.setAlpha(0.01);
    body.body.setSize(r * 2, r * 2, true);
    body.body.setAllowGravity(false);
    body.body.setImmovable(true);
    this.collectData.push({ body, type });
    this.collectGroup.add(body);
    return body;
  }

  _addRod(x) {
    const y = GROUND_Y - 56;
    const body = this.physics.add.image(x, y, "px");
    body.setAlpha(0.01);
    body.body.setSize(28, 28, true);
    body.body.setAllowGravity(false);
    body.body.setImmovable(true);
    const rd = { body, x, y, charge: 0 };
    this.rodData.push(rd);
    this.rodGroup.add(body);
    return rd;
  }

  /** Flat ground strip from x1 to x2 at GROUND_Y. */
  _groundStrip(x1, x2) {
    if (x2 <= x1) return;
    const w = x2 - x1;
    this._addSolid(x1 + w / 2, GROUND_Y + 22, w, 44, 0x334155, "ground");
  }

  /** A self-contained free-fall pit: walled pocket, bounce-pad chain to climb out, sealed floor. */
  _buildPit(x1, x2) {
    const w = x2 - x1;
    const cx = x1 + w / 2;
    // Side walls of the pit (so the ball can't fall sideways out of it)
    this._addSolid(x1, GROUND_Y + PIT_DEPTH / 2, 16, PIT_DEPTH + 60, 0x1e3a5f, "wall");
    this._addSolid(x2, GROUND_Y + PIT_DEPTH / 2, 16, PIT_DEPTH + 60, 0x1e3a5f, "wall");
    // Sealed floor — guarantees the ball always lands on something. Thick
    // enough that a max-speed fall (capped at 2000px/s, up to 100px/frame at
    // the clamped 0.05s worst-case step) can't tunnel through it in one
    // step — a thin 40px floor here let the ball punch straight through and
    // fall into the "abyss" safety net, which then dropped it right back
    // into the same pit, repeating indefinitely.
    this._addSolid(cx, PIT_FLOOR_Y + 90, w, 180, 0x1e293b, "ground");
    // Guaranteed bounce-pad chain, alternating sides, that reaches back to GROUND_Y
    const steps = 4;
    for (let i = 0; i < steps; i += 1) {
      const t = i / (steps - 1);
      const y = PIT_FLOOR_Y - 70 - t * (PIT_DEPTH - 140);
      const side = i % 2 === 0 ? -1 : 1;
      const px = cx + side * (w / 2 - 70);
      this._addPad(px, y, Math.min(150, w - 60));
      if (i === 1) this._addCollectible(cx, y - 90, "energy");
    }
    this.pitZones.push({ x1, x2 });
  }

  /**
   * A self-contained pinball chamber. Entered at ground level from the left,
   * exited at ground level on the right — both side walls are partial,
   * leaving a ground-level gap so the chamber never blocks forward progress.
   * Bumpers and flippers fill the interior; an entry pad launches the ball
   * up into play.
   */
  _buildPinball(x1) {
    const cx = x1 + PIN_W / 2;
    const x2 = x1 + PIN_W;
    const wallH = GROUND_Y - PIN_TOP;
    const entranceH = 120;
    const upperWallH = wallH - entranceH;
    // Both side walls leave the bottom `entranceH` open as a walk-through gap
    this._addSolid(x1, PIN_TOP + upperWallH / 2, 16, upperWallH, 0x1e3a5f, "wall");
    this._addSolid(x2, PIN_TOP + upperWallH / 2, 16, upperWallH, 0x1e3a5f, "wall");
    // Ceiling
    this._addSolid(cx, PIN_TOP - 10, PIN_W + 16, 20, 0x1e3a5f, "wall");
    // Floor continues straight through
    this._addSolid(cx, GROUND_Y + 22, PIN_W, 44, 0x334155, "ground");
    // Launch pad just inside the entrance sends the ball up into play
    this._addPad(x1 + 90, GROUND_Y, 110, 18);

    this.bumperData.push(
      { x: cx - 110, y: PIN_TOP + 140, r: 34 },
      { x: cx + 120, y: PIN_TOP + 260, r: 30 },
      { x: cx - 90, y: PIN_TOP + 390, r: 30 },
      { x: cx + 60, y: PIN_TOP + 510, r: 32 },
    );

    this._addFlipper(cx - 120, GROUND_Y - 70, "left");
    this._addFlipper(cx + 120, GROUND_Y - 70, "right");

    this._addCollectible(cx - 60, PIN_TOP + 210, "energy");
    this._addCollectible(cx + 70, PIN_TOP + 370, "energy");
    this._addCollectible(cx, PIN_TOP + 490, "life");

    this.pinballZones.push({ x1, x2, cx });
    return x2;
  }

  /** One chunk of normal side-scroll terrain: ground is now always solid
   *  underneath (see _extendWorld), so elevated platforms are an optional
   *  bonus route rather than a replacement for the floor — far fewer of
   *  them than before, on purpose. */
  _buildRunChunk(startX) {
    let x = startX;
    const segments = 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < segments; i += 1) {
      const gap = 70 + Math.random() * 140;
      x += gap;
      const tierRoll = Math.random();
      const y = tierRoll < 0.68 ? GROUND_Y : tierRoll < 0.9 ? GROUND_Y - 130 : GROUND_Y - 250;
      const pw = 110 + Math.random() * 90;

      if (y < GROUND_Y) {
        if (Math.random() < 0.3) this._addPad(x + pw / 2, y, pw);
        else this._addSolid(x + pw / 2, y, pw, 18, 0x475569, "plat");
      }

      if (Math.random() < 0.45) {
        const shapeRoll = Math.random();
        const dist = this.furthestX;
        let shape = "triangle";
        if (dist > ABILITY_MILESTONES.crush && shapeRoll < 0.32) shape = "square";
        else if (shapeRoll < 0.6) shape = "circle";
        this._addEnemy(x + pw * 0.5, y - 36, shape);
      }
      if (Math.random() < 0.3) {
        this._addCollectible(x + pw * 0.4, y - 50, Math.random() < 0.7 ? "energy" : "life");
      }
      if (y === GROUND_Y) {
        // Ground-level hazard roll: spike (instant hit) or a shallow water
        // pool (no damage, just slows you down while you wade through it).
        const hazardRoll = Math.random();
        if (hazardRoll < 0.12) this._addSpike(x + 20, Math.min(pw - 60, 90));
        else if (hazardRoll < 0.24) this._addWater(x, Math.min(pw + 50, 170));
      }
      if (Math.random() < 0.1) {
        this._addRod(x + pw * 0.6);
      }
      x += pw;
    }
    return x + 80;
  }

  /** Master generator: extends the world to the right of the player as needed. */
  _extendWorld() {
    let x = this.nextSpawnX;
    // Decide what comes next: mostly normal run, occasionally a pit or pinball pocket.
    const roll = Math.random();
    if (this.furthestX > 900 && roll < 0.16) {
      const pitW = 260 + Math.random() * 120;
      this._groundStrip(this.cursorX, x);
      this._buildPit(x, x + pitW);
      this.cursorX = x + pitW;
      x = x + pitW + 60;
    } else if (
      this.furthestX > ABILITY_MILESTONES.pinballGate &&
      roll < 0.30 &&
      this.furthestX > (this._pinballCooldownX || 0)
    ) {
      this._groundStrip(this.cursorX, x);
      const endX = this._buildPinball(x);
      this.cursorX = endX;
      x = endX + 80;
      this._recentPinball = true;
      this._pinballCooldownX = this.furthestX + 2400;
    } else {
      // Build the chunk FIRST, then lay ground under the whole thing — the
      // chunk's own segments span x..endX, and that span was never getting
      // a ground strip at all (only the gap *before* it was). Most segments
      // (the "ground tier" roll) placed nothing solid, assuming ground was
      // already there. It wasn't, so falling anywhere in a normal run chunk
      // meant falling forever — no floor, no safety net, nothing.
      const endX = this._buildRunChunk(x);
      this._groundStrip(this.cursorX, endX);
      this.cursorX = endX;
      x = endX;
    }
    this.nextSpawnX = x + 200;
  }

  _buildWorld() {
    this._groundStrip(-400, 360);
    this.cursorX = 360;
    this.nextSpawnX = 900;
    for (let i = 0; i < 6; i += 1) this._extendWorld();
  }

  /* ══════════════════════════════════════════════════════════════════════
     COLLISION CALLBACKS
     ══════════════════════════════════════════════════════════════════════ */

  _onPad(padBody) {
    const pl = this.player;
    if (pl.body.velocity.y <= 0) return;
    const params = this.paramsRef.current;
    const speed = Math.max(300, Math.abs(pl.body.velocity.y) * Math.max(0.35, params.elasticity) + params.jumpSpeed * 0.5);
    pl.body.setVelocityY(-speed);
    this.score += 10;
    this.reason = `Pad bounce — e=${fmt(params.elasticity, 2)} kept ${fmt(params.elasticity * 100, 0)}% of your speed.`;
    this._sfx({ freq: 220, dur: 0.12, type: "triangle", gain: 0.16, slideTo: 440 });
  }

  _onFlipper(flBody) {
    const fd = this.flipperData.find((f) => f.body === flBody);
    if (!fd) return;
    const active = fd.side === "left" ? this.flipL : this.flipR;
    const pl = this.player;
    if (active) {
      pl.body.setVelocityY(-820);
      pl.body.setVelocityX(fd.side === "left" ? 360 : -360);
      this.score += 15;
      this.reason = "Flipper launch! Angular motion converted to a linear shot.";
      this._sfx({ freq: 500, dur: 0.1, type: "square", gain: 0.14, slideTo: 900 });
    } else if (pl.body.velocity.y > 0) {
      pl.body.setVelocityY(-260);
    }
  }

  _onEnemy(enemyBody) {
    if (this.invuln > 0) return;
    const ed = this.enemyData.find((e) => e.body === enemyBody);
    if (!ed) return;
    const pl = this.player;
    const stomping = pl.body.velocity.y > 220 && pl.y < enemyBody.y - 6;
    const pounding = this._poundActive && pl.body.velocity.y > 380;

    if (ed.armored && !pounding) {
      // Armored squares only fall to a ground pound — bumping them otherwise hurts you
      this._damage("Armored enemy — needs Ground Pound (K) to break.");
      return;
    }

    if (stomping || pounding) {
      ed.hp -= pounding ? 2 : 1;
      if (ed.hp <= 0) {
        enemyBody.destroy();
        this.enemyData = this.enemyData.filter((e) => e !== ed);
        this.score += ed.armored ? 80 : 35;
        pl.body.setVelocityY(-Math.max(380, Math.abs(pl.body.velocity.y) * 0.5));
        this.reason = pounding ? "Ground Pound shattered the armor!" : "Stomped an enemy.";
        this._sfx({ freq: 320, dur: 0.14, type: "sawtooth", gain: 0.13, slideTo: 90 });
      } else {
        pl.body.setVelocityY(-420);
        this._sfx({ freq: 280, dur: 0.08, type: "square", gain: 0.1 });
      }
    } else {
      const dir = pl.x > enemyBody.x ? 1 : -1;
      this._damage("Enemy collision.", dir * 520, -480);
    }
  }

  _onCollect(body) {
    const cd = this.collectData.find((c) => c.body === body);
    if (!cd) return;
    body.destroy();
    this.collectData = this.collectData.filter((c) => c !== cd);
    if (cd.type === "life") {
      this.lives = Math.min(5, this.lives + 1);
      this.reason = "Life collected!";
      this._sfx({ freq: 660, dur: 0.18, type: "sine", gain: 0.16 });
      this._sfx({ freq: 990, dur: 0.16, type: "sine", gain: 0.12 });
    } else {
      this.energy = Math.min(100, this.energy + 22);
      this.reason = "Energy collected.";
      this._sfx({ freq: 720, dur: 0.1, type: "sine", gain: 0.14 });
    }
    this.score += 40;
  }

  _onRod(body) {
    const rd = this.rodData.find((r) => r.body === body);
    if (!rd || rd.charge <= 0) return;
    this.energy = Math.min(100, this.energy + 26 * rd.charge);
    this.powerJumpTtl = Math.max(this.powerJumpTtl, 1.6);
    this.score += 50 * rd.charge;
    this.reason = TUTORIALS.rod;
    rd.charge = 0;
    this._sfx({ freq: 200, dur: 0.2, type: "sawtooth", gain: 0.16, slideTo: 1000 });
  }

  /* ══════════════════════════════════════════════════════════════════════
     GAME LOGIC
     ══════════════════════════════════════════════════════════════════════ */

  _damage(msg, kx = -260, ky = -200) {
    if (this.invuln > 0 || !this.alive) return;
    this.invuln = 1.6;
    const hadEnergy = this.energy > 30;
    this.energy = Math.max(0, this.energy - 30);
    if (!hadEnergy) this.lives -= 1;
    this.player.body.setVelocity(kx, ky);
    this.reason = msg + (hadEnergy ? " Energy lost." : " Life lost!");
    this._sfx({ freq: 160, dur: 0.16, type: "sawtooth", gain: 0.18, slideTo: 60 });
    if (this.lives <= 0) {
      this.alive = false;
      this._sfx({ freq: 300, dur: 0.5, type: "sawtooth", gain: 0.18, slideTo: 40 });
      this.onDead({ score: Math.round(this.score) });
    }
  }

  _checkUnlocks() {
    if (!this.abilities.superJump && this.furthestX >= ABILITY_MILESTONES.superJump) {
      this.abilities.superJump = true;
      this.reason = TUTORIALS.superJump;
      this.onAbility("superJump");
      this._sfx({ freq: 440, dur: 0.12, type: "sine", gain: 0.16 });
      this._sfx({ freq: 660, dur: 0.18, type: "sine", gain: 0.14 });
    } else if (!this.abilities.crush && this.furthestX >= ABILITY_MILESTONES.crush) {
      this.abilities.crush = true;
      this.reason = TUTORIALS.crush;
      this.onAbility("crush");
      this._sfx({ freq: 440, dur: 0.12, type: "sine", gain: 0.16 });
      this._sfx({ freq: 660, dur: 0.18, type: "sine", gain: 0.14 });
    }
  }

  _checkBumpers() {
    const pl = this.player;
    for (const b of this.bumperData) {
      const dx = pl.x - b.x, dy = pl.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = BALL_R + b.r;
      if (dist < minDist && dist > 0.001) {
        const nx = dx / dist, ny = dy / dist;
        const spd = Math.max(540, Math.hypot(pl.body.velocity.x, pl.body.velocity.y) * 1.3);
        pl.body.setVelocity(nx * spd, ny * spd);
        pl.x = b.x + nx * (minDist + 2);
        pl.y = b.y + ny * (minDist + 2);
        this.score += 25;
        this.reason = "Bumper — elastic collision, momentum redirected.";
        this._sfx({ freq: 700, dur: 0.08, type: "square", gain: 0.13, slideTo: 1100 });
      }
    }
  }

  _tickLightning(dt) {
    // Only strikes while the player is out in the open run (not inside a pit/pinball pocket)
    if (this.inPit || this.inPinball) return;

    if (this.lightningWarn) {
      this.lightningWarn.ttl -= dt;
      if (this.lightningWarn.ttl <= 0) {
        const tx = this.lightningWarn.x;
        // Charge the nearest rod if one is close to the strike
        let nearestRod = null, nearestDist = 130;
        for (const rod of this.rodData) {
          const d = Math.abs(rod.x - tx);
          if (d < nearestDist) { nearestDist = d; nearestRod = rod; }
        }
        if (nearestRod) {
          nearestRod.charge = Math.min(3, nearestRod.charge + 1);
          this.reason = "Rod charged! Q=CV — walk into it to discharge.";
        }
        this.fxGfx.strikeFlashTtl = 0.25;
        this.fxGfx.strikeX = tx;
        this._sfx({ freq: 1200, dur: 0.06, type: "sawtooth", gain: 0.15, slideTo: 80 });
        if (Math.abs(this.player.x - tx) < 70 && this.invuln <= 0) {
          this._damage("Lightning strike — stand clear of charging rods.", (Math.random() - 0.5) * 600, -480);
        }
        this.lightningWarn = null;
      }
      return;
    }

    this.lightningTimer -= dt;
    if (this.lightningTimer > 0) return;
    this.lightningTimer = 4.5 + Math.random() * 4;

    // Prefer targeting near a rod so charging feels purposeful
    let tx;
    if (this.rodData.length > 0 && Math.random() < 0.7) {
      const candidates = this.rodData.filter((r) => r.x > this.player.x - 200 && r.x < this.player.x + 900);
      const rod = candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : this.rodData[0];
      tx = rod.x;
    } else {
      tx = this.player.x + 200 + Math.random() * 500;
    }
    this.lightningWarn = { x: tx, ttl: 1.0 };
  }

  /* ══════════════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════════════ */

  _render() {
    const g = this.worldGfx;
    g.clear();
    const camLeft = this.cameras.main.scrollX - 100;
    const camRight = camLeft + W + 200;

    for (const pd of this.platData) {
      if (pd.cx + pd.w / 2 < camLeft || pd.cx - pd.w / 2 > camRight) continue;
      if (pd.kind === "pad") {
        g.fillStyle(0x22c55e, 0.85);
        g.fillRoundedRect(pd.cx - pd.w / 2, pd.cy - pd.h / 2, pd.w, pd.h, 6);
        g.lineStyle(2, 0x86efac, 0.7);
        g.strokeRoundedRect(pd.cx - pd.w / 2, pd.cy - pd.h / 2, pd.w, pd.h, 6);
      } else if (pd.kind === "spike") {
        g.fillStyle(0xfb7185, 0.92);
        const count = Math.max(2, Math.floor(pd.w / 16));
        const step = pd.w / count;
        const baseX = pd.cx - pd.w / 2;
        const topY = pd.cy - pd.h / 2;
        for (let i = 0; i < count; i += 1) {
          const sx = baseX + i * step;
          g.fillTriangle(sx, topY + pd.h, sx + step / 2, topY, sx + step, topY + pd.h);
        }
      } else if (pd.kind === "water") {
        g.fillStyle(0x2dd4ff, 0.32);
        g.fillRect(pd.cx - pd.w / 2, pd.cy - pd.h / 2, pd.w, pd.h);
        g.lineStyle(2, 0x7ce8ff, 0.6);
        const waveY = pd.cy - pd.h / 2;
        const wiggle = Math.sin(this.time.now / 250 + pd.cx) * 3;
        g.lineBetween(pd.cx - pd.w / 2, waveY + wiggle, pd.cx + pd.w / 2, waveY - wiggle);
      } else if (pd.kind === "wall") {
        g.fillStyle(0x14233b, 0.92);
        g.fillRect(pd.cx - pd.w / 2, pd.cy - pd.h / 2, pd.w, pd.h);
        g.lineStyle(1.5, 0x2c4a72, 0.8);
        g.strokeRect(pd.cx - pd.w / 2, pd.cy - pd.h / 2, pd.w, pd.h);
      } else if (pd.kind === "ground") {
        g.fillStyle(pd.color, 0.92);
        g.fillRect(pd.cx - pd.w / 2, pd.cy - pd.h / 2, pd.w, pd.h);
      } else {
        g.fillStyle(pd.color, 0.92);
        g.fillRoundedRect(pd.cx - pd.w / 2, pd.cy - pd.h / 2, pd.w, pd.h, 5);
      }
    }

    // Bumpers
    for (const b of this.bumperData) {
      if (b.x < camLeft || b.x > camRight) continue;
      g.fillStyle(0xfbbf24, 0.18);
      g.fillCircle(b.x, b.y, b.r + 8);
      g.fillStyle(0xfbbf24, 0.9);
      g.fillCircle(b.x, b.y, b.r);
      g.lineStyle(3, 0xfde68a, 1);
      g.strokeCircle(b.x, b.y, b.r);
    }

    // Flippers (tilt drawn as a simple angled fill via 4-point poly)
    for (const fd of this.flipperData) {
      const active = fd.side === "left" ? this.flipL : this.flipR;
      const tilt = (fd.side === "left" ? -1 : 1) * (active ? 0.42 : 0.16);
      const hw = fd.w / 2, hh = fd.h / 2;
      const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
      const pts = [
        [-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh],
      ].map(([px, py]) => [fd.cx + px * cosT - py * sinT, fd.cy + px * sinT + py * cosT]);
      g.fillStyle(active ? 0xfbbf24 : 0x94a3b8, 0.92);
      g.beginPath();
      g.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i += 1) g.lineTo(pts[i][0], pts[i][1]);
      g.closePath();
      g.fillPath();
    }

    // Rods
    for (const rd of this.rodData) {
      if (rd.x < camLeft || rd.x > camRight) continue;
      const glow = rd.charge > 0;
      g.fillStyle(0x94a3b8, 1);
      g.fillRect(rd.x - 3, rd.y - 4, 6, 96);
      g.fillStyle(glow ? 0xfbbf24 : 0x475569, 1);
      g.fillCircle(rd.x, rd.y - 6, 11);
      if (glow) {
        g.lineStyle(2, 0xfde047, 0.85);
        g.strokeCircle(rd.x, rd.y - 6, 15 + Math.sin(this.time.now / 120) * 2);
        for (let c = 0; c < rd.charge; c += 1) {
          g.fillStyle(0xfde047, 1);
          g.fillCircle(rd.x - 14 + c * 14, rd.y - 28, 3.5);
        }
      }
    }

    // Collectibles
    for (const cd of this.collectData) {
      if (cd.body.x < camLeft || cd.body.x > camRight) continue;
      const col = cd.type === "life" ? 0xfb7185 : 0x4ade80;
      g.fillStyle(col, 0.2);
      g.fillCircle(cd.body.x, cd.body.y, 20);
      g.fillStyle(col, 1);
      g.fillCircle(cd.body.x, cd.body.y, 12);
    }

    // Enemies — drawn as actual geometry shapes
    for (const ed of this.enemyData) {
      if (!ed.body.active) continue;
      const x = ed.body.x, y = ed.body.y, r = ed.r;
      const baseCol = ed.armored ? 0x94a3b8 : 0xf87171;
      const strokeCol = ed.armored ? 0xe2e8f0 : 0xfecaca;
      g.fillStyle(baseCol, 0.92);
      g.lineStyle(2.5, strokeCol, 0.85);
      if (ed.shape === "square") {
        g.fillRect(x - r, y - r, r * 2, r * 2);
        g.strokeRect(x - r, y - r, r * 2, r * 2);
        if (ed.hp > 1) {
          g.lineStyle(2, 0x1e293b, 0.7);
          g.strokeRect(x - r + 5, y - r + 5, r * 2 - 10, r * 2 - 10);
        }
      } else if (ed.shape === "triangle") {
        g.fillTriangle(x, y - r, x - r, y + r, x + r, y + r);
        g.strokeTriangle(x, y - r, x - r, y + r, x + r, y + r);
      } else {
        g.fillCircle(x, y, r);
        g.strokeCircle(x, y, r);
      }
    }

    // Player
    const px = this.player.x, py = this.player.y;
    const flicker = this.invuln > 0 && Math.floor(this.time.now / 80) % 2 === 0;
    if (!flicker) {
      const boosted = this.powerJumpTtl > 0;
      g.fillStyle(boosted ? 0xfbbf24 : 0x3b82f6, 0.22);
      g.fillCircle(px, py, BALL_R + 8);
      g.fillStyle(0xf0f9ff, 1);
      g.fillCircle(px, py, BALL_R);
      g.lineStyle(3, boosted ? 0xfbbf24 : 0x38bdf8, 1);
      g.strokeCircle(px, py, BALL_R);
    }

    // Pit / pinball zone tint (helps the player read where they are)
    if (this.inPit) {
      g.fillStyle(0x0ea5e9, 0.04);
      g.fillRect(camLeft, GROUND_Y, camRight - camLeft, PIT_DEPTH + 80);
    }

    // Lightning warning + flash
    const fx = this.fxGfx;
    fx.clear();
    if (this.lightningWarn) {
      const a = 0.35 + 0.35 * Math.sin(this.time.now / 60);
      fx.lineStyle(3, 0xfde047, a);
      fx.lineBetween(this.lightningWarn.x, 0, this.lightningWarn.x, GROUND_Y);
      fx.fillStyle(0xfde047, a * 0.5);
      fx.fillCircle(this.lightningWarn.x, 40, 10);
    }
    if (fx.strikeFlashTtl > 0) {
      fx.strikeFlashTtl -= 1 / 60;
      const a = Math.max(0, fx.strikeFlashTtl / 0.25);
      fx.lineStyle(10, 0xe0f2fe, a * 0.7);
      fx.lineBetween(fx.strikeX, 0, fx.strikeX, GROUND_Y);
      fx.lineStyle(3, 0xffffff, a);
      fx.lineBetween(fx.strikeX, 0, fx.strikeX, GROUND_Y);
      fx.fillStyle(0xfde047, a * 0.6);
      fx.fillCircle(fx.strikeX, GROUND_Y, 14);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
     MAIN UPDATE
     ══════════════════════════════════════════════════════════════════════ */

  update(time, delta) {
    if (!this.alive) { this._render(); return; }
    const dt = Math.min(delta / 1000, 0.05);
    const params = this.paramsRef.current;
    const pl = this.player;

    const k = this.keys;
    const touch = this.touchRef?.current;
    const left = k.left.isDown || k.a.isDown || (touch && touch.left);
    const right = k.right.isDown || k.d.isDown || (touch && touch.right);
    if (touch) {
      if (touch.jumpQueued) { this._jumpQueued = true; touch.jumpQueued = false; }
      if (touch.powerJumpQueued) { this._powerJumpQueued = true; touch.powerJumpQueued = false; }
      if (touch.poundQueued) { this._poundQueued = true; touch.poundQueued = false; }
    }

    this.physics.world.gravity.y = params.gravity;
    pl.body.setDragX(params.friction * 900);

    this.furthestX = Math.max(this.furthestX, pl.x);
    // Score tracks forward progress, not survival time — it used to be
    // `score += dt*60` unconditionally, which meant standing still (or even
    // just leaving the tab open) made the score climb forever with zero
    // player input. Now it only grows when you push past your previous
    // furthest point.
    const newGround = Math.max(0, pl.x - this.lastScoreX);
    this.score += newGround * 0.4;
    this.lastScoreX = Math.max(this.lastScoreX, pl.x);
    this.invuln = Math.max(0, this.invuln - dt);
    this.powerJumpTtl = Math.max(0, this.powerJumpTtl - dt);
    this._poundActive = false;

    // Horizontal control — water (overlap-only, set by the scene's overlap
    // callback each time it fires) drags your speed down while you're in it.
    const waterSlow = this.inWater ? 0.45 : 1;
    const horiz = (right ? 1 : 0) - (left ? 1 : 0);
    const target = horiz * (230 + params.controlGain * 220) * waterSlow;
    const onGround = pl.body.blocked.down;
    const lerpF = onGround ? 11 : 4.5;
    pl.body.setVelocityX(pl.body.velocity.x + (target - pl.body.velocity.x) * Math.min(1, lerpF * dt));

    // Jump
    if (this._jumpQueued && onGround) {
      pl.body.setVelocityY(-params.jumpSpeed);
      this.reason = `Jump — v0=${fmt(params.jumpSpeed, 0)} px/s, peak height ≈ ${fmt((params.jumpSpeed * params.jumpSpeed) / (2 * params.gravity), 0)} px`;
      this._sfx({ freq: 380, dur: 0.08, type: "sine", gain: 0.08, slideTo: 520 });
    }
    this._jumpQueued = false;

    // Power jump (ability-gated)
    if (this._powerJumpQueued && this.abilities.superJump && onGround && this.energy >= 18) {
      pl.body.setVelocityY(-params.jumpSpeed * 1.65);
      this.energy = Math.max(0, this.energy - 18);
      this.reason = "Power Jump! 1.65x launch velocity.";
      this._sfx({ freq: 300, dur: 0.16, type: "sawtooth", gain: 0.14, slideTo: 800 });
    }
    this._powerJumpQueued = false;

    // Ground pound (ability-gated) — drives the ball down fast, flagged for one frame
    if (this._poundQueued && this.abilities.crush && !onGround) {
      pl.body.setVelocityY(Math.max(pl.body.velocity.y, params.gravity * 0.5));
      this._poundActive = true;
      this.reason = "Ground Pound engaged — break armored enemies on landing.";
      this._sfx({ freq: 200, dur: 0.1, type: "square", gain: 0.12, slideTo: 80 });
    }
    if ((this.keys.k.isDown || (touch && touch.poundHeld)) && this.abilities.crush && !onGround) {
      this._poundActive = true;
    }
    this._poundQueued = false;

    // Determine current zone (pit / pinball / open run) by X position
    this.inPit = this.pitZones.some((z) => pl.x > z.x1 + 10 && pl.x < z.x2 - 10);
    this.inPinball = this.pinballZones.some((z) => pl.x > z.x1 + 10 && pl.x < z.x2 - 10);
    if (this.inPinball !== this._lastZoneSignal) {
      this._lastZoneSignal = this.inPinball;
      this.onZone(this.inPinball);
    }

    if (this.inPit) {
      // Side walls already collide via solidGroup; just clamp as a safety net
      pl.x = clamp(pl.x, -2000, 100000);
    }

    if (this.inPinball) {
      // Only clamp while airborne above the entrance gap — at ground level the
      // gap is the walk-through path in and out, so it must stay open.
      const aboveEntrance = pl.y < GROUND_Y - 130;
      if (aboveEntrance) {
        const zone = this.pinballZones.find((z) => pl.x > z.x1 && pl.x < z.x2);
        if (zone) {
          if (pl.x < zone.x1 + BALL_R + 20) pl.x = zone.x1 + BALL_R + 20;
          if (pl.x > zone.x2 - BALL_R - 20) pl.x = zone.x2 - BALL_R - 20;
        }
      }
      this._checkBumpers();
      this.flipL = this.keys.z.isDown || (touch && touch.flipL);
      this.flipR = this.keys.x.isDown || (touch && touch.flipR);
    }

    // Enemy behavior — each shape now reads as a distinct threat type.
    for (const ed of this.enemyData) {
      if (!ed.body.active) continue;
      ed.phase += dt * 2.2;
      if (ed.shape === "circle") {
        // Floats — simple vertical bob.
        ed.body.y = ed.baseY + Math.sin(ed.phase) * 26;
      } else if (ed.shape === "triangle") {
        // Flies — sweeps through the air. (Its old behavior tried to patrol
        // the ground via velocity + a `body.blocked.left/right` direction
        // flip, but triangles were never collider-registered against walls,
        // so that check could never actually fire — it just drifted in its
        // initial direction forever. This replaces that dead code.)
        ed.body.x = ed.baseX + Math.sin(ed.phase * 0.6) * 80;
        ed.body.y = ed.baseY + Math.sin(ed.phase * 1.4) * 50 - 40;
      } else if (ed.shape === "square") {
        // Stomps — a heavy rhythmic hop, telegraphing impact instead of
        // sitting completely inert until ground-pounded.
        ed.body.y = ed.baseY - Math.max(0, Math.sin(ed.phase * 0.9)) * 34;
      }
    }

    // Lightning (only in open run zones)
    this._tickLightning(dt);

    // Fell into a never-ending abyss (shouldn't happen given the now much
    // thicker sealed floors, but a safety net) — must also escape the pit
    // horizontally, not just reset height. Resetting only Y left the player
    // at the same X, still inside the pit, so they fell straight through
    // again next frame — a repeating, unrecoverable death spiral.
    // Outside a pit the threshold is much tighter — there's no legitimate
    // reason to ever be 300px below the ground, so don't make the player
    // free-fall for a long time before catching them ("respawn over a
    // point" quickly, not after an undignified plunge).
    const fallLimit = this.inPit ? PIT_FLOOR_Y + 400 : GROUND_Y + 300;
    if (pl.y > fallLimit) {
      const zone = this.pitZones.find((z) => pl.x > z.x1 - 40 && pl.x < z.x2 + 40);
      const safeX = zone ? zone.x1 - 60 : pl.x;
      pl.body.reset(safeX, GROUND_Y - 200);
      pl.body.setVelocity(0, 0);
      this._damage("Fell through the floor — repositioned.", 0, 0);
    }

    this._checkUnlocks();

    // World generation
    if (pl.x + W * 1.3 > this.nextSpawnX) this._extendWorld();

    this._render();

    this.onScore(Math.round(this.score));
    this.onEnergy(Math.round(this.energy));
    if (this.reason) { this.onMsg(this.reason); this.reason = ""; }
    // Cleared here, not at the top of the frame — the overlap callback that
    // sets it true fires during the physics step between this update() and
    // the next one, so it needs to survive until next frame's read.
    this.inWater = false;
  }
}
