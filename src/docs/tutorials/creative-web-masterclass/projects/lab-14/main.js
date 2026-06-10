const canvas = document.querySelector('#main-canvas');
const ctx = canvas.getContext('2d');

function drawGrid() {
  const SPACING = 60;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += SPACING) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += SPACING) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  drawGrid();

  ctx.fillStyle = '#6c63ff';
  ctx.fillRect(cx - 200, cy - 120, 120, 80);

  ctx.strokeStyle = '#ff6b6b';
  ctx.lineWidth = 3;
  ctx.strokeRect(cx - 60, cy - 120, 120, 80);

  ctx.fillStyle = '#4ecdc4';
  ctx.beginPath();
  ctx.arc(cx + 120, cy - 80, 50, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 250, cy);
  ctx.lineTo(cx + 250, cy);
  ctx.stroke();

  ctx.font = 'bold 22px system-ui';
  ctx.fillStyle = '#e8e8f0';
  ctx.textAlign = 'center';
  ctx.fillText('Canvas 2D Drawing API', cx, cy + 60);

  ctx.font = '14px system-ui';
  ctx.fillStyle = '#7070a0';
  ctx.fillText(canvas.width + ' × ' + canvas.height + ' px', cx, cy + 90);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
