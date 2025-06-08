const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player ship object
const player = {
  x: 50,
  y: canvas.height / 2 - 25,
  width: 40,
  height: 40,
  color: 'cyan',
  speed: 5
};

// Key tracking
const keys = {};

window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

function update() {
  if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
  if (keys['ArrowDown'] && player.y < canvas.height - player.height) player.y += player.speed;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
