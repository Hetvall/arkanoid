const canvas = document.getElementById( 'game' );
const ctx = canvas.getContext( '2d' );

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
const keys = { left: false, right: false };

let blocks = []; // blocks[row][col] = { x, y, w, h, color } | null

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

function draw() {
  ctx.clearRect( 0, 0, CANVAS_W, CANVAS_H );
  drawBlocks();
  drawPaddle();
  drawBall();
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

window.addEventListener( 'keydown', ( e ) => {
  if ( e.key === 'ArrowLeft' ) keys.left = true;
  if ( e.key === 'ArrowRight' ) keys.right = true;
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

function update() {
  if ( keys.left ) paddle.x -= PADDLE_SPEED;
  if ( keys.right ) paddle.x += PADDLE_SPEED;
  clampPaddle();
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
