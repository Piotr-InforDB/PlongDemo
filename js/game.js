$(document).on('keydown', interact)

const dom = {
  body: $('body'),
  playground: $('.playground'),
  settings: $('.settings'),
}
const icons = {
  plant: `<i class="fa-solid fa-seedling"></i>`,
}
const display = {
  x: Number(_ls('display_x', 25)),
  y: Number(_ls('display_y', 15)),
  middle_x: null,
  middle_y: null,
}
const resolution = {
  y: Number(_ls('resolution_y', 750)),
  x: Number(_ls('resolution_x', 1250)),
  shifted_y: JSON.parse(_ls('shifted_y', 'false')),
  shifted_x: JSON.parse(_ls('shifted_x', 'false')),
}
const paddles = {
  height: null,
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
  speed: 5,
}

//Logic
function init(){
  initSettings();
  initPlants()
  initResolution();
  resetGame();
  visualize();
}
function resetGame(){
  displayMessage('Press SPACE to start the game!');
  dom.settings.removeClass('d-none');
  game.on = false;

  display.middle_y = Math.ceil(display.y / 2);
  display.middle_x = Math.ceil(display.x / 2);
  
  paddles.offset = Math.ceil(display.y / 10);
  paddles.height = paddles.offset * 2 + 1;
  paddles.left = display.middle_y;
  paddles.right = display.middle_y;
  
  ball.x = display.middle_x;
  ball.y = display.middle_y;

  if(!game.interval){ game.interval = setInterval(interval, 1000 / game.speed) };
}
function interval(){
  if(!game.on){ return; }
  
  moveBall();
}

//Message
function displayMessage(message){
  dom.body.append(`<div class="game-message" >${message}</div>`)
}
function clearMessage(){
  $('.game-message').remove();
}

//Interaction
function interact(e){
  if(e.keyCode === 32){
    clearMessage();
    dom.settings.addClass('d-none');
    game.on = true;
  }

  if(!game.on){ return; }
  movePaddle(e);
}
function movePaddle(e){
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
  if(ball.x === 1 || ball.x === display.x){
    markPlant(ball.x, ball.y, 'danger');
    resetGame();
    return;
  }
  if(ball.direction === null){
    ball.direction = ([0, 45, 135, 180, 225, 315])[Math.round(Math.random() * 6) - 1];
  }

  //Bounce top && Bottom
  if (ball.y === 1 || ball.y === display.y) {
    ball.direction = 360 - ball.direction;
  }
  
  //Bounce sides
  let bounce_y;
  if(ball.x === 2){
    bounce_y = (ball.y >= (paddles.left - paddles.offset) && ball.y <= (paddles.left + paddles.offset)) ? paddles.left : false;
  }
  else if(ball.x === display.x - 1){
    bounce_y = (ball.y >= (paddles.right - paddles.offset) && ball.y <= (paddles.right + paddles.offset)) ? paddles.right : false;
  }
  
  //Bounce
  if(bounce_y){
    const left_side = ball.x === 2;

    let bottom = bounce_y - paddles.offset;
    let top = bounce_y + paddles.offset;
    let ball_y = ball.y;

    //Normalize the range;
    ball_y += -bottom;
    top += -bottom;

    const bounce_spot_ratio = ball_y / top;

    if(bounce_spot_ratio < .33){
      ball.direction = left_side ? 315 : 225;
    }
    else if(bounce_spot_ratio > .66){
      ball.direction = left_side ? 45 : 135;
    }
    else{
      ball.direction = left_side ? 0 : 180;
    }

  }

  const angle = ball.direction * (Math.PI / 180);
  ball.x = Math.round(ball.x + Math.cos(angle));
  ball.y = Math.round(ball.y + Math.sin(angle));
  visualize();
}

//Display
function initResolution(){
  let {x, y, shifted_x, shifted_y} = resolution;



  if(shifted_x){
    const offset = resolution.x / display.x / 2;
    $('[data-row]').each((index, element) => {
      if(index % 2){ return true; }
      $(element).css({transform: `translateX(${offset}px)`})
    });
  }
  if(shifted_y){
    const offset = resolution.y / display.y / 2;
    for(let index = 1; index <= x; index++){
      if(index % 2){ continue; }
      $(`[data-x=${index}]`).css({transform: `translateY(${offset}px)`})
    }
  }

  console.log(y)
  console.log(x)

  dom.playground.css({
    width: `${x}px`,
    height: `${y}px`
  })

}

//Plants
function initPlants(){
  dom.playground.empty();
  for(let y = 1; y <= display.y; y++){
    dom.playground.append(`<div data-row data-y="${y}" class="d-flex justify-content-around" ></div>`)
    for(let x = 1; x <= display.x; x++){
      $(`[data-row][data-y=${y}]`).append(`<div data-y="${y}" data-x="${x}" class="plant" >${icons.plant}</div>`)
    }

  }
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
function setPlant(x, y, state){
  $(`.plant[data-x=${x}][data-y=${y}]`).addClass('active');
}
function markPlant(x, y, color){
  $(`.plant[data-x=${x}][data-y=${y}]`).addClass(`text-${color}`);
}
function resetPlants(){
  $(`.plant.text-danger`).removeClass('text-danger');
  $(`.plant.active`).removeClass('active');
}

//Settings
function initSettings(){
  $('[name=display_y]').val(display.y);
  $('[name=display_x]').val(display.x);
  $('[name=resolution_y]').val(resolution.y);
  $('[name=resolution_x]').val(resolution.x);
  $('[name=shifted_x]').prop('checked', resolution.shifted_x);
  $('[name=shifted_y]').prop('checked', resolution.shifted_y);
}
function saveSettings(){
  $('input').each(function(){
    const input = $(this);
    let value = this.value;

    if(input.attr('type') === 'checkbox'){
      value = input.prop('checked');
    }

    localStorage.setItem(input.attr('name'), value);

  });

  window.location.reload();

}

init();

