import { useCallback, useEffect, useRef, useState } from "react";
import * as Phaser from "phaser";
import { ArrowLeft, Lock, RotateCcw, Unlock, Zap } from "lucide-react";

/* ════════════════════════════════════════════════════════════════════════
   WORLD CONSTANTS
   Single continuous world. No scene swapping — pits and pinball chambers
   are zones embedded directly in the ground, entered/exited by position.
   ════════════════════════════════════════════════════════════════════════ */
const W = 1600;
const H = 900;
const GROUND_Y = H - 90; // 810
const BALL_R = 18;

const PIT_DEPTH = 560;       // how far below GROUND_Y a pit floor sits
const PIT_FLOOR_Y = GROUND_Y + PIT_DEPTH;

const PIN_W = 520;           // pinball chamber interior width
const PIN_TOP = 120;         // pinball chamber ceiling (world Y)

const ABILITY_MILESTONES = {
  bounce: 0,      // bounce pads always active — they're the starter toy
  superJump: 1400,
  crush: 3200,
  pinballGate: 5200,
};

function fmt(v, d = 1) {
  return Number(v || 0).toFixed(d).replace(/\.?0+$/, "") || "0";
}
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

const TUTORIALS = {
  bounce: "Bounce pad: e (elasticity) sets how much speed you keep — e=1 is a perfect bounce, e=0 is a dead stop.",
  superJump: "Ability unlocked: Power Jump (key J). Costs energy, multiplies your jump speed — v0 = jumpSpeed × boost.",
  crush: "Ability unlocked: Ground Pound (key K). Falling fast enough to break armored squares: impulse breaks armor.",
  pit: "Free fall! Horizontal walls reflect you (vx flips ×e). Ride the chain of pads back up — or just enjoy the drop.",
  pinball: "Pinball chamber. Z = left flipper, X = right flipper. Bumpers fling you out fast: J = m·Δv.",
  rod: "Lightning rod charged. Walk into it to discharge: Q = C·V — stored charge becomes energy + a short jump boost.",
};

/* ════════════════════════════════════════════════════════════════════════
   PHASER SCENE
   ════════════════════════════════════════════════════════════════════════ */
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  create() {
    this.paramsRef = this.registry.get("paramsRef");
    this.onScore = this.registry.get("onScore") || (() => {});
    this.onEnergy = this.registry.get("onEnergy") || (() => {});
    this.onAbility = this.registry.get("onAbility") || (() => {});
    this.onMsg = this.registry.get("onMsg") || (() => {});
    this.onDead = this.registry.get("onDead") || (() => {});

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
    this.enemyGroup = this.physics.add.group();
    this.collectGroup = this.physics.add.group();
    this.rodGroup = this.physics.add.group();

    this.physics.add.collider(this.player, this.solidGroup);
    this.physics.add.collider(this.player, this.padGroup, (pl, pad) => this._onPad(pad), null, this);
    this.physics.add.collider(this.player, this.flipperGroup, (pl, fl) => this._onFlipper(fl), null, this);
    this.physics.add.overlap(this.player, this.spikeGroup, () => this._damage("Spike hit."), null, this);
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
    this._recentPinball = false;

    /* ---- ground cursor / procedural generation state ---- */
    this.cursorX = 360;
    this.nextSpawnX = 900;

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

  _addEnemy(x, y, shape) {
    const r = shape === "square" ? 24 : shape === "triangle" ? 22 : 20;
    const body = this.physics.add.image(x, y, "px");
    body.setAlpha(0.01);
    body.body.setSize(r * 2, r * 2, true);
    body.body.setAllowGravity(false);
    body.body.setImmovable(true);
    const armored = shape === "square";
    const ed = {
      body, shape, r, baseY: y, phase: Math.random() * Math.PI * 2,
      hp: armored ? 2 : 1, armored, dir: Math.random() < 0.5 ? 1 : -1,
    };
    if (shape === "triangle") body.body.setVelocityX(ed.dir * 90);
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
    // Sealed floor — guarantees the ball always lands on something
    this._addSolid(cx, PIT_FLOOR_Y + 20, w, 40, 0x1e293b, "ground");
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

  /** One chunk of normal side-scroll terrain: a few floating platforms, maybe an enemy, maybe a rod. */
  _buildRunChunk(startX) {
    let x = startX;
    const segments = 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < segments; i += 1) {
      const gap = 70 + Math.random() * 140;
      x += gap;
      const tierRoll = Math.random();
      const y = tierRoll < 0.5 ? GROUND_Y : tierRoll < 0.8 ? GROUND_Y - 130 : GROUND_Y - 250;
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
      if (Math.random() < 0.16 && y === GROUND_Y) {
        this._addSpike(x + 20, Math.min(pw - 60, 90));
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
      this._groundStrip(this.cursorX, x);
      const endX = this._buildRunChunk(x);
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
    } else if (pl.body.velocity.y > 0) {
      pl.body.setVelocityY(-260);
    }
  }

  _onEnemy(enemyBody) {
    if (this.invuln > 0) return;
    const ed = this.enemyData.find((e) => e.body === enemyBody);
    if (!ed) return;
    const pl = this.player;
    const params = this.paramsRef.current;
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
      } else {
        pl.body.setVelocityY(-420);
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
    } else {
      this.energy = Math.min(100, this.energy + 22);
      this.reason = "Energy collected.";
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
    if (this.lives <= 0) {
      this.alive = false;
      this.onDead({ score: Math.round(this.score) });
    }
  }

  _checkUnlocks() {
    if (!this.abilities.superJump && this.furthestX >= ABILITY_MILESTONES.superJump) {
      this.abilities.superJump = true;
      this.reason = TUTORIALS.superJump;
      this.onAbility("superJump");
    } else if (!this.abilities.crush && this.furthestX >= ABILITY_MILESTONES.crush) {
      this.abilities.crush = true;
      this.reason = TUTORIALS.crush;
      this.onAbility("crush");
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
    const left = k.left.isDown || k.a.isDown;
    const right = k.right.isDown || k.d.isDown;

    this.physics.world.gravity.y = params.gravity;
    pl.body.setDragX(params.friction * 900);

    this.furthestX = Math.max(this.furthestX, pl.x);
    this.score += dt * 60;
    this.invuln = Math.max(0, this.invuln - dt);
    this.powerJumpTtl = Math.max(0, this.powerJumpTtl - dt);
    this._poundActive = false;

    // Horizontal control
    const horiz = (right ? 1 : 0) - (left ? 1 : 0);
    const target = horiz * (230 + params.controlGain * 220);
    const onGround = pl.body.blocked.down;
    const lerpF = onGround ? 11 : 4.5;
    pl.body.setVelocityX(pl.body.velocity.x + (target - pl.body.velocity.x) * Math.min(1, lerpF * dt));

    // Jump
    if (this._jumpQueued && onGround) {
      pl.body.setVelocityY(-params.jumpSpeed);
      this.reason = `Jump — v0=${fmt(params.jumpSpeed, 0)} px/s, peak height ≈ ${fmt((params.jumpSpeed * params.jumpSpeed) / (2 * params.gravity), 0)} px`;
    }
    this._jumpQueued = false;

    // Power jump (ability-gated)
    if (this._powerJumpQueued && this.abilities.superJump && onGround && this.energy >= 18) {
      pl.body.setVelocityY(-params.jumpSpeed * 1.65);
      this.energy = Math.max(0, this.energy - 18);
      this.reason = "Power Jump! 1.65x launch velocity.";
    }
    this._powerJumpQueued = false;

    // Ground pound (ability-gated) — drives the ball down fast, flagged for one frame
    if (this._poundQueued && this.abilities.crush && !onGround) {
      pl.body.setVelocityY(Math.max(pl.body.velocity.y, params.gravity * 0.5));
      this._poundActive = true;
      this.reason = "Ground Pound engaged — break armored enemies on landing.";
    }
    if (this.keys.k.isDown && this.abilities.crush && !onGround) {
      this._poundActive = true;
    }
    this._poundQueued = false;

    // Determine current zone (pit / pinball / open run) by X position
    this.inPit = this.pitZones.some((z) => pl.x > z.x1 + 10 && pl.x < z.x2 - 10);
    this.inPinball = this.pinballZones.some((z) => pl.x > z.x1 + 10 && pl.x < z.x2 - 10);

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
      this.flipL = this.keys.z.isDown;
      this.flipR = this.keys.x.isDown;
    }

    // Enemy behavior
    for (const ed of this.enemyData) {
      if (!ed.body.active) continue;
      ed.phase += dt * 2.2;
      if (ed.shape === "circle") {
        ed.body.y = ed.baseY + Math.sin(ed.phase) * 26;
      } else if (ed.shape === "triangle") {
        if (ed.body.body.blocked.left || ed.body.body.velocity.x < -400) ed.dir = 1;
        if (ed.body.body.blocked.right || ed.body.body.velocity.x > 400) ed.dir = -1;
      }
    }

    // Lightning (only in open run zones)
    this._tickLightning(dt);

    // Fell into a never-ending abyss (shouldn't happen given sealed floors, but a safety net)
    if (pl.y > PIT_FLOOR_Y + 400) {
      pl.body.reset(pl.x, GROUND_Y - 200);
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
  }
}

/* ════════════════════════════════════════════════════════════════════════
   REACT COMPONENT
   ════════════════════════════════════════════════════════════════════════ */
const C = {
  bg: "#0b1422", panel: "#16202f", border: "#2a3a50",
  teal: "#38bdf8", text: "#e6eef7", sub: "#8fa3bb",
  green: "#4ade80", yellow: "#fbbf24", red: "#f87171",
};

const BASE_SLIDERS = [
  { key: "gravity", label: "Gravity", min: 300, max: 1600, step: 25, eq: "F = mg" },
  { key: "jumpSpeed", label: "Jump Speed", min: 250, max: 800, step: 10, eq: "v\u2080 = \u221A(2gh)" },
];
const UNLOCKED_SLIDERS = {
  superJump: { key: "controlGain", label: "Control Gain", min: 0.3, max: 2.6, step: 0.1, eq: "a = F/m" },
  crush: { key: "elasticity", label: "Elasticity", min: 0.15, max: 1.0, step: 0.05, eq: "e = v\u2082/v\u2081" },
};

export default function RealityRunner() {
  const mountRef = useRef(null);
  const gameRef = useRef(null);
  const paramsRef = useRef(null);

  const [params, setParams] = useState({
    gravity: 760, jumpSpeed: 480, elasticity: 0.62, friction: 0.1, controlGain: 1.0,
  });
  const [score, setScore] = useState(0);
  const [energy, setEnergy] = useState(90);
  const [msg, setMsg] = useState("");
  const [abilities, setAbilities] = useState({ superJump: false, crush: false });
  const [dead, setDead] = useState(null);
  const [runId, setRunId] = useState(0);

  paramsRef.current = params;

  useEffect(() => {
    if (!mountRef.current) return;
    const pr = paramsRef;

    const config = {
      type: Phaser.AUTO,
      width: W,
      height: H,
      parent: mountRef.current,
      backgroundColor: "#0b1422",
      physics: { default: "arcade", arcade: { gravity: { y: params.gravity }, debug: false } },
      scene: [GameScene],
    };

    const game = new Phaser.Game(config);
    game.registry.set("paramsRef", pr);
    game.registry.set("onScore", (v) => setScore(v));
    game.registry.set("onEnergy", (v) => setEnergy(v));
    game.registry.set("onAbility", (key) => setAbilities((prev) => ({ ...prev, [key]: true })));
    game.registry.set("onMsg", (v) => setMsg(v));
    game.registry.set("onDead", (info) => setDead(info));
    gameRef.current = game;

    return () => { game.destroy(true); gameRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  const handleParam = useCallback((key, val) => {
    setParams((prev) => ({ ...prev, [key]: val }));
  }, []);

  const reset = useCallback(() => {
    setScore(0);
    setEnergy(90);
    setMsg("");
    setAbilities({ superJump: false, crush: false });
    setDead(null);
    setRunId((id) => id + 1);
  }, []);

  const energyColor = energy > 60 ? C.green : energy > 25 ? C.yellow : C.red;
  const visibleSliders = [
    ...BASE_SLIDERS,
    ...(abilities.superJump ? [UNLOCKED_SLIDERS.superJump] : []),
    ...(abilities.crush ? [UNLOCKED_SLIDERS.crush] : []),
  ];

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, color: C.text, fontFamily: "ui-monospace, monospace" }}>
      {/* Sidebar */}
      <div style={{ width: 240, background: C.panel, borderRight: `1px solid ${C.border}`, padding: "14px 14px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.sub, fontSize: 13 }}>
          <ArrowLeft size={14} />
          <span>Reality Runner</span>
        </div>
        <div style={{ fontSize: 11, color: C.sub }}>Physics Sandbox · Side-scroll</div>

        <div style={{ background: C.bg, borderRadius: 10, padding: "10px 12px", fontSize: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: C.sub }}>Score</span>
            <span style={{ color: C.teal, fontWeight: 700 }}>{score}</span>
          </div>
          <div style={{ fontSize: 11, color: C.sub, marginBottom: 4 }}>Energy</div>
          <div style={{ background: C.border, borderRadius: 5, height: 9 }}>
            <div style={{ width: `${energy}%`, height: "100%", background: energyColor, borderRadius: 5, transition: "width 0.2s" }} />
          </div>
        </div>

        {msg && (
          <div style={{ background: "#142840", border: `1px solid ${C.teal}55`, borderRadius: 8, padding: "8px 10px", fontSize: 11.5, color: C.teal, lineHeight: 1.5 }}>
            {msg}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visibleSliders.map(({ key, label, min, max, step, eq }) => (
            <div key={key} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
                <span style={{ color: C.sub }}>{label}</span>
                <span style={{ color: C.teal }}>{fmt(params[key], 2)}</span>
              </div>
              <div style={{ fontSize: 10, color: "#5b7290" }}>{eq}</div>
              <input
                type="range" min={min} max={max} step={step} value={params[key]}
                onChange={(e) => handleParam(key, parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: C.teal }}
              />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 11, color: C.sub }}>Abilities</div>
          {[
            { key: "superJump", label: "Power Jump (J)" },
            { key: "crush", label: "Ground Pound (K)" },
          ].map((a) => (
            <div key={a.key} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: abilities[a.key] ? C.green : C.sub, padding: "5px 8px", borderRadius: 7, border: `1px solid ${abilities[a.key] ? C.green + "55" : C.border}` }}>
              {abilities[a.key] ? <Unlock size={13} /> : <Lock size={13} />}
              {a.label}
            </div>
          ))}
        </div>

        <button
          onClick={reset}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: "auto", padding: "9px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.sub, cursor: "pointer", fontSize: 12.5 }}
        >
          <RotateCcw size={13} /> Reset run
        </button>

        <div style={{ fontSize: 10.5, color: "#5b7290", lineHeight: 1.6 }}>
          ←/→ or A/D — move<br />
          Space / Up / W — jump<br />
          J — power jump (unlocked)<br />
          K — ground pound (unlocked)<br />
          Z / X — pinball flippers
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
        <div ref={mountRef} style={{ width: W, height: H }} />

        {dead && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(8,14,24,0.82)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: "28px 36px", textAlign: "center" }}>
              <div style={{ fontSize: 13, color: C.sub, letterSpacing: 1, marginBottom: 6 }}>RUN OVER</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: C.teal, marginBottom: 18 }}>{dead.score} pts</div>
              <button
                onClick={reset}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, border: "none", background: C.teal, color: "#06121f", fontWeight: 700, cursor: "pointer", fontSize: 14 }}
              >
                <Zap size={15} /> Run again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}