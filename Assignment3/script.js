
//page 1
let seconds = 60;
let typesOfTrash = 3;
let drawTimer, waveTimer, timeTimer;

//background music
let bgMusic = new Audio("./assets/audio/bg-music.mp3");

function startGame() {
    drawTimer = setInterval(draw, 200);
    waveTimer = setInterval(updateWave, 400);
    timeTimer = setInterval(decreaseTime, 1000);

    bgMusic.loop = true;
    bgMusic.volume = 0.5;
    bgMusic.play();
}

function start() {
    const setting = document.getElementById("setting");
    setting.classList.add('hidden');

    seconds = document.getElementById('duration').value;
    typesOfTrash = document.getElementById('trash-type').value;

    const canvas = document.getElementById("canvas");
    canvas.classList.remove('hidden');

    console.log("seconds=", seconds, "typesOfTrash", typesOfTrash);

    startGame();
}


//page 2
let myCanvas = document.getElementById("myCanvas")
let ctx = myCanvas.getContext('2d');
const scale = window.devicePixelRatio;
myCanvas.width = 1000 * scale;
myCanvas.height = 666 * scale;
myCanvas.style.width = "1000px";
myCanvas.style.height = "666px";
ctx.scale(scale, scale);

let balls = [];
let score = 0;
//background img
let waveUp = true;
let bgLoaded = false;
const bg1 = new Image();
bg1.src = "./assets/img/background1.png"; 
const bg2 = new Image();
bg2.src = "./assets/img/background2.png"; 
let bg = bg1;

bg1.onload = bg2.onload = () => {
  bgLoaded = true;
  console.log("bg1 Image loaded:", bg1.width, bg1.height);
  console.log("bg2 Image loaded:", bg2.width, bg2.height);
  console.log("canvas ", myCanvas.width, myCanvas.height);
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomHexColor() {
  const hex = Math.floor(Math.random() * 0xffffff).toString(16);
  return "#" + hex.padStart(6, "0");
}

function getSpeed(speed){
    switch (speed) {
        case 1:
            return 5;
        case 2:
            return 8;
        case 3:
            return 12;
        default:
            return 5;
    }
}

function getContrastColor(hex) {
  // 去掉 # 号
  hex = hex.replace("#", "");

  // 解析 RGB 分量
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // 计算亮度（YIQ公式）
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  // 返回黑或白
  return yiq >= 128 ? "#000000" : "#ffffff";
}

class Hemisphere {
  constructor() {
    this.radius = 20;
    this.x = parseInt(myCanvas.style.width);
    this.y = getRandomInt(310, parseInt(myCanvas.style.height) - this.radius);
    this.type = getRandomInt(1, 3);
    this.speed = getSpeed(this.type);
    this.color = getRandomHexColor();
  }

  update() {
    this.x -= this.speed;
  }

  draw() {
    const drawY = waveUp ? this.y - 5 : this.y;
    const drawRadius = waveUp ? this.radius - 5 : this.radius;

    ctx.beginPath();
    ctx.arc(this.x, drawY, drawRadius, Math.PI, 0);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();

    ctx.font = "12px Arial";
    ctx.fillStyle = getContrastColor(this.color);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const letter = String.fromCharCode(64 + this.type);
    ctx.fillText(letter, this.x, drawY - drawRadius / 2);
  }
}

function drawTips()
{
    ctx.font = "18px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "left";

    ctx.fillText("Time: " + seconds, 10, 20);
    ctx.fillText("Score: " + score, 10, 40);
}

function drawTypesOfTrash()
{
    ctx.font = "18px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "left";

    ctx.fillText("A: 10", 940, 20);
    if(typesOfTrash > 1) ctx.fillText("B: 20", 940, 40);
    if(typesOfTrash > 2) ctx.fillText("C: 30", 940, 60);
}

function drawBackground() {
  if (!bgLoaded) return;

    bg = waveUp ? bg2 : bg1;

  // 用逻辑宽高（CSS 宽高）
  const logicalWidth = parseInt(myCanvas.style.width);
  const logicalHeight = parseInt(myCanvas.style.height);

  // 计算缩放比例（基于逻辑坐标系）
  const scaleX = logicalWidth / bg.width;
  const scaleY = logicalHeight / bg.height;
  const scale = Math.min(scaleX, scaleY);

  const newWidth = bg.width * scale;
  const newHeight = bg.height * scale;

  const offsetX = (logicalWidth - newWidth) / 2;
  const offsetY = (logicalHeight - newHeight) / 2;

  ctx.drawImage(bg, offsetX, offsetY, newWidth, newHeight);
}

function updateElements() {
    for (let i = balls.length - 1; i >= 0; i--) {
        if (balls[i].x <= 0) {
            balls.splice(i, 1); // 删除当前元素
            console.log("Delete ball");
        } else {
            balls[i].update();  // 更新其状态
        }
    }
}

function draw()
{
    updateElements();
    drawCanvas();
}

function drawCanvas()
{
    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);

    drawBackground();
    drawTips();
    drawTypesOfTrash();

    for (let i = 0; i < balls.length; i++) {
        balls[i].draw();
    }
}

function stopGame() {
    clearInterval(drawTimer);
    clearInterval(waveTimer);
    clearInterval(timeTimer);
    
    bgMusic.pause();

    console.log("game over");
}

function decreaseTime()
{
    if (seconds <= 0) {
       stopGame();
    }
    else {
        if (seconds % 2 === 0) {
            const ball = new Hemisphere();
            balls.push(ball);

            console.log("new ball");
        }
    }

    seconds -= 1;
}

function updateWave()
{
    waveUp = !waveUp;
}
