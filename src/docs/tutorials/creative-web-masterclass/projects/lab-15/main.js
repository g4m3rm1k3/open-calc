const canvas = document.querySelector('#main-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

const PARTICLE_COUNT = 200;
const particles = [];

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const speedTier = Math.random();
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: -(speedTier * 2 + 0.3),
    radius: speedTier * 2.5 + 0.5,
    alpha: speedTier * 0.6 + 0.1,
    hue: Math.random() * 60 + 220
  });
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(function (p) {
    p.x += p.vx;
    p.y += p.vy;

    if (p.y < -p.radius) {
      p.y = canvas.height + p.radius;
      p.x = Math.random() * canvas.width;
    }
    if (p.x < -p.radius) { p.x = canvas.width + p.radius; }
    if (p.x > canvas.width + p.radius) { p.x = -p.radius; }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'hsla(' + p.hue + ', 70%, 65%, ' + p.alpha + ')';
    ctx.fill();
  });

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
