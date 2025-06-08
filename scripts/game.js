const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
  x: 50,
  y: 0,
  width: 0,
  height: 0,
  speed: 2
};

let baseScale = 0.4;

// Booster flame animation settings
const boosterSprite = new Image();
boosterSprite.src = 'assets/booster.png'; // Your booster spritesheet
const boosterFrameWidth = 152;     // Set this based on your sprite image
const boosterFrameHeight = 98;
const boosterTotalFrames = 5;
let boosterFrameIndex = 0;
let boosterFrameTimer = 0;
const boosterFrameDelay = 3;

// Load images
const bgImage = new Image();
bgImage.src = 'assets/background.jpg';

const spaceship = new Image();
spaceship.src = 'assets/spaceship.png';

let bgX = 0;
const bgSpeed = 1;

const keys = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let dynamicScale = baseScale * (canvas.width / 1920);
  if (dynamicScale > baseScale) dynamicScale = baseScale;
  if (dynamicScale < 0.1) dynamicScale = 0.1;

  player.width = spaceship.width * dynamicScale;
  player.height = spaceship.height * dynamicScale;
  player.y = canvas.height / 2 - player.height / 2;

  if (player.x > canvas.width - player.width) {
    player.x = canvas.width - player.width;
  }
}

window.addEventListener('resize', () => {
  if (spaceship.complete && spaceship.width > 0) {
    resizeCanvas();
  }
});

function update() {
  bgX -= bgSpeed;
  if (bgX <= -canvas.width) {
    bgX = 0;
  }

  const moving =
    (keys['arrowup'] || keys['w']) ||
    (keys['arrowdown'] || keys['s']) ||
    (keys['arrowleft'] || keys['a']) ||
    (keys['arrowright'] || keys['d']);

  if ((keys['arrowup'] || keys['w']) && player.y > 0) {
    player.y -= player.speed;
  }
  if ((keys['arrowdown'] || keys['s']) && player.y < canvas.height - player.height) {
    player.y += player.speed;
  }
  if ((keys['arrowleft'] || keys['a']) && player.x > 0) {
    player.x -= player.speed;
  }
  if ((keys['arrowright'] || keys['d']) && player.x < canvas.width - player.width) {
    player.x += player.speed;
  }

  // Booster animation
  if (moving) {
    boosterFrameTimer++;
    if (boosterFrameTimer >= boosterFrameDelay) {
      boosterFrameIndex = (boosterFrameIndex + 1) % boosterTotalFrames;
      boosterFrameTimer = 0;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background scrolling
  ctx.drawImage(bgImage, bgX, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImage, bgX + canvas.width, 0, canvas.width, canvas.height);

  const moving =
    (keys['arrowup'] || keys['w']) ||
    (keys['arrowdown'] || keys['s']) ||
    (keys['arrowleft'] || keys['a']) ||
    (keys['arrowright'] || keys['d']);

  if (moving) {
    const sourceX = boosterFrameIndex * boosterFrameWidth;
    const sourceY = 0;

    const scaleFactor = player.height / spaceship.height;
    const boosterDrawWidth = boosterFrameWidth * scaleFactor;
    const boosterDrawHeight = boosterFrameHeight * scaleFactor;

    const boosterX = player.x - boosterDrawWidth + 36;
    const boosterY = player.y + player.height / 2 - boosterDrawHeight / 2;

    ctx.drawImage(
      boosterSprite,
      sourceX, sourceY,
      boosterFrameWidth, boosterFrameHeight,
      boosterX, boosterY,
      boosterDrawWidth, boosterDrawHeight
    );
  }

  // Player spaceship
  ctx.drawImage(spaceship, player.x, player.y, player.width, player.height);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Wait for all images to load
let imagesLoaded = 0;
function onImageLoad() {
  imagesLoaded++;
  if (imagesLoaded === 3) {
    resizeCanvas();
    gameLoop();
  }
}

bgImage.onload = onImageLoad;
spaceship.onload = onImageLoad;
boosterSprite.onload = onImageLoad;
