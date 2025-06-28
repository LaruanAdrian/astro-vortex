const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

const player = {
  x: 50,
  y: 0,
  width: 0,
  height: 0,
  speed: 3
};

let baseScale = 0.4;

// --- FIRE RATE CONTROL ---
const FIRE_RATE     = 300;   // ms between shots
let   lastFireTime = 0;

// --- BULLET IMAGE SETUP ---
const bulletImage = new Image();
bulletImage.src   = 'assets/bullets.png';

const bulletScale  = 0.2;    // 50% of ship’s dynamic scale
let   bulletWidth  = 0;
let   bulletHeight = 0;
const bulletSpeed  = 7;
let   bullets      = [];
const MAX_LIFETIME = 5000;   // ms before a bullet auto-expires

// Booster flame animation settings
const boosterSprite     = new Image();
boosterSprite.src       = 'assets/booster.png';
const boosterFrameWidth = 152;
const boosterFrameHeight= 98;
const boosterTotalFrames= 5;
let   boosterFrameIndex = 0;
let   boosterFrameTimer = 0;
const boosterFrameDelay = 3;

// Load images
const bgImage   = new Image();
bgImage.src     = 'assets/background.jpg';

const spaceship = new Image();
spaceship.src   = 'assets/spaceship.png';

let   bgX      = 0;
const bgSpeed  = 1;

const keys = {};
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  keys[k] = true;

  // FIRE BULLET (with cool-down)
  if (k === 'o') {
    const now = performance.now();
    if (now - lastFireTime >= FIRE_RATE) {
    bullets.push({
  x: player.x + player.width - 10,
  y: player.y + player.height / 2 - bulletHeight / 2 +10,
  createdAt: now
});

      lastFireTime = now;
    }
  }
});
window.addEventListener('keyup',   e => keys[e.key.toLowerCase()] = false);

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  // ship scaling
  let dynamicScale = baseScale * (canvas.width / 1920);
  dynamicScale = Math.min(baseScale, Math.max(0.1, dynamicScale));

  player.width  = spaceship.width  * dynamicScale;
  player.height = spaceship.height * dynamicScale;
  player.y      = canvas.height/2 - player.height/2;
  player.x      = Math.min(player.x, canvas.width - player.width);

  // bullet scaling
  bulletWidth  = bulletImage.width  * dynamicScale * bulletScale;
  bulletHeight = bulletImage.height * dynamicScale * bulletScale;
}

window.addEventListener('resize', () => {
  if (spaceship.complete && spaceship.width > 0) {
    resizeCanvas();
  }
});

function update() {
  // background scroll
  bgX = (bgX - bgSpeed) % -canvas.width;

  // player movement
  if ((keys['arrowup']||keys['w'])    && player.y > 0)                         player.y -= player.speed;
  if ((keys['arrowdown']||keys['s'])  && player.y < canvas.height-player.height) player.y += player.speed;
  if ((keys['arrowleft']||keys['a'])  && player.x > 0)                         player.x -= player.speed;
  if ((keys['arrowright']||keys['d']) && player.x < canvas.width-player.width)  player.x += player.speed;

  // booster animation
  const moving = keys['arrowup']||keys['w']||keys['arrowdown']||keys['s']||
                 keys['arrowleft']||keys['a']||keys['arrowright']||keys['d'];
  if (moving) {
    boosterFrameTimer++;
    if (boosterFrameTimer >= boosterFrameDelay) {
      boosterFrameIndex = (boosterFrameIndex + 1) % boosterTotalFrames;
      boosterFrameTimer = 0;
    }
  }

  // move bullets
  bullets.forEach(b => b.x += bulletSpeed);

  // cull bullets: off-screen OR older than MAX_LIFETIME
  const now = performance.now();
  const survivors = [];
  bullets.forEach(b => {
    const offScreen = b.x >= canvas.width + bulletWidth;
    const tooOld    = (now - b.createdAt) >= MAX_LIFETIME;
    if (!(offScreen || tooOld)) {
      survivors.push(b);
    }
  });
  bullets = survivors;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw background twice for scrolling
  ctx.drawImage(bgImage, bgX, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImage, bgX + canvas.width, 0, canvas.width, canvas.height);

  // draw booster behind ship if moving
  const moving = keys['arrowup']||keys['w']||keys['arrowdown']||keys['s']||
                 keys['arrowleft']||keys['a']||keys['arrowright']||keys['d'];
  if (moving) {
    const sx     = boosterFrameIndex * boosterFrameWidth;
    const scaleF = player.height / spaceship.height;
    const w      = boosterFrameWidth * scaleF;
    const h      = boosterFrameHeight* scaleF;
    const bx     = player.x - w + 50;
    const by     = player.y + player.height/2 - h/2.4;
    ctx.drawImage(
      boosterSprite,
      sx, 0, boosterFrameWidth, boosterFrameHeight,
      bx, by, w, h
    );
  }

  // draw ship
  ctx.drawImage(spaceship, player.x, player.y, player.width, player.height);

  // draw bullets
  bullets.forEach(b => {
    ctx.drawImage(bulletImage, b.x, b.y, bulletWidth, bulletHeight);
  });
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// WAIT FOR ALL IMAGES: bg, ship, booster, bullet
let imagesLoaded = 0;
function onImageLoad() {
  imagesLoaded++;
  if (imagesLoaded === 4) {
    resizeCanvas();
    gameLoop();
  }
}
bgImage.onload       = onImageLoad;
spaceship.onload     = onImageLoad;
boosterSprite.onload = onImageLoad;
bulletImage.onload   = onImageLoad;
