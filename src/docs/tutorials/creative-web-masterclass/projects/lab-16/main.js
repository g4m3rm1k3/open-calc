const canvas = document.querySelector('#main-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

let mouseX = 0;
let mouseY = 0;
let mouseOnCanvas = false;

canvas.addEventListener('mousemove', function (event) {
  const rect = canvas.getBoundingClientRect();
  mouseX = event.clientX - rect.left;
  mouseY = event.clientY - rect.top;
  mouseOnCanvas = true;
});

canvas.addEventListener('mouseleave', function () {
  mouseOnCanvas = false;
});

const PARTICLE_COUNT = 200;
const INFLUENCE_RADIUS = 120;
const PUSH_STRENGTH = 6;
const particles = [];

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const speedTier = Math.random();
  const baseVx = (Math.random() - 0.5) * 0.5;
  const baseVy = -(speedTier * 2 + 0.3);
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: baseVx,
    vy: baseVy,
    baseVx: baseVx,
    baseVy: baseVy,
    radius: speedTier * 2.5 + 0.5,
    alpha: speedTier * 0.6 + 0.1,
    hue: Math.random() * 60 + 220
  });
}

canvas.addEventListener('click', function (event) {
  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;
  const BLAST_RADIUS = 200;
  const BLAST_STRENGTH = 20;
  particles.forEach(function (p) {
    const dx = p.x - clickX;
    const dy = p.y - clickY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < BLAST_RADIUS && dist > 0) {
      const force = (1 - dist / BLAST_RADIUS) * BLAST_STRENGTH;
      p.vx += (dx / dist) * force;
      p.vy += (dy / dist) * force;
    }
  });
});

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(function (p) {
    if (mouseOnCanvas) {
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const distSq = dx * dx + dy * dy;
      const radiusSq = INFLUENCE_RADIUS * INFLUENCE_RADIUS;
      if (distSq < radiusSq && distSq > 0) {
        const dist = Math.sqrt(distSq);
        const force = (1 - dist / INFLUENCE_RADIUS) * PUSH_STRENGTH;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }
    }

    p.vx = p.vx * 0.92 + p.baseVx * 0.08;
    p.vy = p.vy * 0.92 + p.baseVy * 0.08;

    p.x += p.vx;
    p.y += p.vy;

    if (p.y < -p.radius) { p.y = canvas.height + p.radius; p.x = Math.random() * canvas.width; }
    if (p.x < -p.radius) { p.x = canvas.width + p.radius; }
    if (p.x > canvas.width + p.radius) { p.x = -p.radius; }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'hsla(' + p.hue + ', 70%, 65%, ' + p.alpha + ')';
    ctx.fill();
  });

  if (mouseOnCanvas) {
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, INFLUENCE_RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(108, 99, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(108, 99, 255, 0.8)';
    ctx.fill();
  }

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
