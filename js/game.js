const canvas = document.getElementById( 'game' );
const ctx = canvas.getContext( '2d' );
const overlay = document.getElementById( 'overlay' );
const overlayMessage = document.getElementById( 'overlay-message' );
const restartBtn = document.getElementById( 'restart-btn' );

const CANVAS_W = 800;
const CANVAS_H = 600;

const ROWS = 6;
const COLS = 10;
const BLOCK_W = 78;
const BLOCK_H = 24;
const BLOCK_GAP = 2;
const BLOCK_MARGIN_X = 1;
const BLOCK_TOP = 48;

const blockColors = [ 'red', 'yellow', 'cyan', 'magenta', 'hotpink', 'green' ]; // una por fila

const state = {
  score: 0,
  lives: 3,
  status: 'ready', // 'ready' | 'playing' | 'won' | 'lost'
};

const paddle = {
  x: 320,
  y: 560,
  w: 162,
  h: 14,
};

const ball = {
  x: 400,
  y: 546,
  w: 16,
  h: 16,
  vx: 0,
  vy: 0,
  attached: true,
};

const PADDLE_SPEED = 8;
const BALL_SPEED = 6;
const keys = { left: false, right: false };

let blocks = []; // blocks[row][col] = { x, y, w, h, color } | null

// Explosiones activas (animación visual, no afecta colisión)
let explosions = []; // [{ x, y, w, h, color, startTime }]

function spawnExplosion( block ) {
  explosions.push( {
    x: block.x,
    y: block.y,
    w: block.w,
    h: block.h,
    color: block.color,
    startTime: performance.now(),
  } );
}

function updateExplosions( now ) {
  explosions = explosions.filter( ( explosion ) => {
    const frameIndex = Math.floor( ( now - explosion.startTime ) / ( EXPLOSION_DURATION / 4 ) );
    return frameIndex <= 3;
  } );
}

function buildBlocks() {
  blocks = [];
  for ( let row = 0; row < ROWS; row++ ) {
    const rowBlocks = [];
    for ( let col = 0; col < COLS; col++ ) {
      rowBlocks.push( {
        x: BLOCK_MARGIN_X + col * ( BLOCK_W + BLOCK_GAP ),
        y: BLOCK_TOP + row * ( BLOCK_H + BLOCK_GAP ),
        w: BLOCK_W,
        h: BLOCK_H,
        color: blockColors[ row ],
      } );
    }
    blocks.push( rowBlocks );
  }
}

function drawBlocks() {
  for ( let row = 0; row < ROWS; row++ ) {
    for ( let col = 0; col < COLS; col++ ) {
      const block = blocks[ row ][ col ];
      if ( !block ) continue;
      drawSprite( ctx, `block_${ block.color }`, block.x, block.y, block.w, block.h );
    }
  }
}

function drawPaddle() {
  drawSprite( ctx, 'paddle', paddle.x, paddle.y, paddle.w, paddle.h );
}

function drawBall() {
  drawSprite( ctx, 'ball', ball.x, ball.y, ball.w, ball.h );
}

function drawHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = '16px monospace';
  ctx.fillText( `Score: ${ state.score }`, 10, 22 );

  const iconSize = 16;
  const iconGap = 6;
  for ( let i = 0; i < state.lives; i++ ) {
    const x = CANVAS_W - 10 - ( i + 1 ) * iconSize - i * iconGap;
    drawSprite( ctx, 'ball', x, 14, iconSize, iconSize );
  }
}

function showOverlay( message ) {
  overlayMessage.textContent = message;
  overlay.classList.remove( 'hidden' );
}

function hideOverlay() {
  overlay.classList.add( 'hidden' );
}

function loseLife() {
  state.lives -= 1;
  if ( state.lives <= 0 ) {
    state.status = 'lost';
    showOverlay( 'Perdiste' );
    return;
  }
  state.status = 'ready';
  ball.attached = true;
  ball.vx = 0;
  ball.vy = 0;
  attachBallToPaddle();
}

function draw() {
  ctx.clearRect( 0, 0, CANVAS_W, CANVAS_H );
  drawBlocks();
  drawPaddle();
  drawBall();
  drawHUD();
}

function clampPaddle() {
  if ( paddle.x < 0 ) paddle.x = 0;
  if ( paddle.x + paddle.w > CANVAS_W ) paddle.x = CANVAS_W - paddle.w;
}

function movePaddleTo( canvasX ) {
  paddle.x = canvasX - paddle.w / 2;
  clampPaddle();
}

function canvasXFromClientX( clientX ) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = CANVAS_W / rect.width;
  return ( clientX - rect.left ) * scaleX;
}

function attachBallToPaddle() {
  ball.x = paddle.x + paddle.w / 2 - ball.w / 2;
  ball.y = paddle.y - ball.h;
}

function launchBall() {
  if ( state.status !== 'ready' ) return;
  state.status = 'playing';
  ball.attached = false;
  ball.vx = BALL_SPEED * 0.6;
  ball.vy = -BALL_SPEED;
}

function resetGame() {
  state.score = 0;
  state.lives = 3;
  state.status = 'ready';
  ball.attached = true;
  ball.vx = 0;
  ball.vy = 0;
  buildBlocks();
  attachBallToPaddle();
  hideOverlay();
}

window.addEventListener( 'keydown', ( e ) => {
  if ( e.key === 'ArrowLeft' ) keys.left = true;
  if ( e.key === 'ArrowRight' ) keys.right = true;
  if ( e.key === ' ' ) {
    e.preventDefault();
    launchBall();
  }
  if ( e.key === 'Enter' && ( state.status === 'won' || state.status === 'lost' ) ) {
    resetGame();
  }
} );

window.addEventListener( 'keyup', ( e ) => {
  if ( e.key === 'ArrowLeft' ) keys.left = false;
  if ( e.key === 'ArrowRight' ) keys.right = false;
} );

canvas.addEventListener( 'mousemove', ( e ) => {
  movePaddleTo( canvasXFromClientX( e.clientX ) );
} );

canvas.addEventListener( 'touchmove', ( e ) => {
  e.preventDefault();
  movePaddleTo( canvasXFromClientX( e.touches[ 0 ].clientX ) );
}, { passive: false } );

canvas.addEventListener( 'click', () => {
  launchBall();
} );

restartBtn.addEventListener( 'click', () => {
  resetGame();
} );

canvas.addEventListener( 'touchstart', ( e ) => {
  movePaddleTo( canvasXFromClientX( e.touches[ 0 ].clientX ) );
  launchBall();
}, { passive: false } );

function updateBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  if ( ball.y > CANVAS_H ) {
    loseLife();
    return;
  }

  if ( ball.x <= 0 ) {
    ball.x = 0;
    ball.vx *= -1;
  } else if ( ball.x + ball.w >= CANVAS_W ) {
    ball.x = CANVAS_W - ball.w;
    ball.vx *= -1;
  }

  if ( ball.y <= 0 ) {
    ball.y = 0;
    ball.vy *= -1;
  }

  const hitsPaddle = ball.vy > 0 &&
    ball.y + ball.h >= paddle.y &&
    ball.y + ball.h <= paddle.y + paddle.h &&
    ball.x + ball.w >= paddle.x &&
    ball.x <= paddle.x + paddle.w;

  if ( hitsPaddle ) {
    ball.y = paddle.y - ball.h;
    ball.vy *= -1;
  }

  checkBlockCollision();
}

function checkBlockCollision() {
  for ( let row = 0; row < ROWS; row++ ) {
    for ( let col = 0; col < COLS; col++ ) {
      const block = blocks[ row ][ col ];
      if ( !block ) continue;

      const overlaps = ball.x < block.x + block.w &&
        ball.x + ball.w > block.x &&
        ball.y < block.y + block.h &&
        ball.y + ball.h > block.y;

      if ( overlaps ) {
        spawnExplosion( block );
        blocks[ row ][ col ] = null;
        state.score += 10;
        ball.vy *= -1;
        checkWin();
        return;
      }
    }
  }
}

function allBlocksDestroyed() {
  return blocks.every( ( row ) => row.every( ( block ) => block === null ) );
}

function checkWin() {
  if ( !allBlocksDestroyed() ) return;
  state.status = 'won';
  showOverlay( 'Ganaste' );
}

function update() {
  if ( keys.left ) paddle.x -= PADDLE_SPEED;
  if ( keys.right ) paddle.x += PADDLE_SPEED;
  clampPaddle();

  if ( state.status === 'ready' ) {
    attachBallToPaddle();
  } else if ( state.status === 'playing' ) {
    updateBall();
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame( loop );
}

buildBlocks();
loadSpritesheet( () => {
  loop();
} );
