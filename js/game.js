$(document).on('keydown', movePaddle)

const dom = {
  body: $('body'),
}
const icons = {
  plant: `<i class="fa-solid fa-seedling"></i>`,
}
const display = {
  x: 51,
  y: 21,
  middle_x: null,
  middle_y: null,
}
const paddles = {
  offset: null,
  left: null,
  right: null,
}
const ball = {
  x: null,
  y: null,
  direction: null,
}
const game = {
  on: false,
  interval: null,
  speed: 15,
}

function init(){
  dom.body.empty();
  for(let y = 1; y <= display.y; y++){
    dom.body.append(`<div data-row data-y="${y}" class="d-flex justify-content-between" ></div>`)
    for(let x = 1; x <= display.x; x++){
      $(`[data-row][data-y=${y}]`).append(`<div data-y="${y}" data-x="${x}" class="plant" >${icons.plant}</div>`)
    }
    
  }
}
function resetGame(){
  game.on = false;
  
  display.middle_y = Math.ceil(display.y / 2);
  display.middle_x = Math.ceil(display.x / 2);
  
  paddles.offset = Math.ceil(display.y / 25);
  paddles.left = display.middle_y;
  paddles.right = display.middle_y;
  
  ball.x = display.middle_x;
  ball.y = display.middle_y;
 
  if(!game.interval){ game.interval = setInterval(interval, 1000 / game.speed); }
}
function visualize(){
  const {left, right, offset} = paddles;

  resetPlants();
  
  //Set paddles
  for(let y = left - offset; y <= left + offset; y++){
    setPlant(1, y);
  }
  for(let y = right - offset; y <= right + offset; y++){
    setPlant(display.x, y);
  }
  
  //Set ball
  setPlant(ball.x, ball.y);
}
function interval(){
  if(!game.on){ return; }
  
  moveBall();
}

function movePaddle(e){
  game.on = true;
  
  const { offset } = paddles;
  const target = {
    paddle: null,
    increment: null,
  }
  
  if(e.key == 'ArrowUp'){
    target.paddle = 'right';
    target.increment = -1;
  }
  if(e.key == 'ArrowDown'){
    target.paddle = 'right';
    target.increment = 1;
  }
  if(e.key == 'w'){
    target.paddle = 'left';
    target.increment = -1;
  }
  if(e.key == 's'){
    target.paddle = 'left';
    target.increment = 1;
  }
  
  const new_x = paddles[target.paddle] + target.increment;
  const overflows = new_x - offset < 1 || new_x + offset > display.y;
  if(!overflows){
    paddles[target.paddle] += target.increment;
  }
  
  visualize();
}
function moveBall(){
  if(!ball.direction){ ball.direction = ([0, 45, 135, 180, 225, 315])[Math.round(Math.random() * 6) - 1]; }
  
  //Bounce top && Bottom
  if (ball.y === 1 || ball.y === display.y) {
    ball.direction = 360 - ball.direction;
  }
  
  //Bounce sides
  let bounce;
  if(ball.x === 2){
    bounce = ball.y >= (paddles.left - paddles.offset) && ball.y <= (paddles.left + paddles.offset);
    if(!bounce){ resetGame(); }
  }
  else if(ball.x === display.x - 1){
    bounce = ball.y >= (paddles.right - paddles.offset) && ball.y <= (paddles.right + paddles.offset);
    if(!bounce){ resetGame(); }
  }
  
  //Bounce
  if(bounce){ ball.direction += 180; }
  
  const angle = ball.direction * (Math.PI / 180);
  ball.x = Math.round(ball.x + Math.cos(angle));
  ball.y = Math.round(ball.y + Math.sin(angle));
  visualize();
}

function setPlant(x, y, state){
  $(`.plant[data-x=${x}][data-y=${y}]`).addClass('active');
}
function resetPlants(){
  $(`.plant`).removeClass('active');
}

init()
resetGame();
visualize();

