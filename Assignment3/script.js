document.addEventListener("DOMContentLoaded", function () {
    console.log("ready");
    load();
});

//page 1
let seconds = 60;
let typesOfTrash = 3;
let waveTimer, timeTimer;

function start() {
    if (loaded) {
        const setting = document.getElementById("setting");
        setting.classList.add('hidden');

        seconds = document.getElementById('duration').value;
        typesOfTrash = document.getElementById('trash-type').value;

        const canvas = document.getElementById("canvas");
        canvas.classList.remove('hidden');

        console.log("seconds=", seconds, "typesOfTrash", typesOfTrash);

        startGame();
    }
    else {
        console.log("please wait");
    }
}


//page 2
let myCanvas;
let ctx;
let balls = [];
let score = 0;
//background img
let waveUp = true;
const bg1 = new Image();
const bg2 = new Image();
const bgMusic = new Audio("./assets/audio/bg-music.mp3");
const characterSpriteSheet = new Image();
let bg;
// game objects
let character;
let animationId;
// set this to the number of elements you want to load before initalising
const awaitLoadCount = 5;
let loadCount = 0;
// time tracking
let lastTimeStamp = 0;
let tick = 0;
//load result
let Loaded = false;    

// call this function after each loadable element has finished loading.
// Once all elements are loaded, loadCount threshold will be met to init.
function load() {
    loadCount++;
    console.log("load " + loadCount);
    if (loadCount >= awaitLoadCount) {
        loaded = true;
    }
}

loadGame();

function startGame() {
    initGame();

    waveTimer = setInterval(updateWave, 400);
    timeTimer = setInterval(decreaseTime, 1000);

    bgMusic.play();
}

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
            return 0.1;
        case 2:
            return 0.2;
        case 3:
            return 0.3;
        default:
            return 0.1;
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

function stopGame() {
    clearInterval(waveTimer);
    clearInterval(timeTimer);
    
    bgMusic.pause();

    cancelAnimationFrame(animationId);

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

function loadGame()
{
    characterSpriteSheet.src = "./assets/img/front.png";
    characterSpriteSheet.onload = load;

    // Background image
    bg1.src = "./assets/img/background1.png";
    bg1.onload = load;
    bg2.src = "./assets/img/background2.png"; 
    bg2.onload = load;

    bgMusic.loop = true;
    bgMusic.volume = 0.5;
    bgMusic.addEventListener("canplaythrough", function () {
        console.log("load music ok");
        load(); // 你的初始化函数
    });
}

function initGame() {
    console.log("init");
    myCanvas = document.getElementById('myCanvas');
    ctx = myCanvas.getContext('2d');
    const scale = window.devicePixelRatio;
    myCanvas.width = 1000 * scale;
    myCanvas.height = 666 * scale;
    myCanvas.style.width = "1000px";
    myCanvas.style.height = "666px";
    ctx.scale(scale, scale);

    character = Character(
        characterSpriteSheet,
        [64, 64],

        [ // main character set
            [ // walk up track
                [0, 0], [64, 0], [128, 0] 
            ],
            [ // walk down track 
                [0, 0], [64, 0], [128, 0]
            ],
            [ // walk left track
                [0, 0], [64, 0], [128, 0]
            ],
            [ // walk right track 
                [0, 0], [64, 0], [128, 0]
            ],
        ],
        scale // Sprite scaling factor
    );
    character.init();

    // Event listeners
    document.addEventListener('keydown', doKeyDown);
    document.addEventListener('keyup', doKeyUp);

    window.requestAnimationFrame(run);
}

// Game loop function
function run(timeStamp) {
    tick = (timeStamp - lastTimeStamp);
    lastTimeStamp = timeStamp;

    updateElements(tick);
    drawCanvas();

    animationId = window.requestAnimationFrame(run);
}

function updateBalls()
{
     for (let i = balls.length - 1; i >= 0; i--) {
        if (balls[i].x <= 0) {
            balls.splice(i, 1); // 删除当前元素
            console.log("Delete ball");
        } else {
            balls[i].update();  // 更新其状态
        }
    }
}

function updateElements(tick) {
    character.update(tick);
    updateBalls();
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

function drawCanvas() {
    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);

    drawBackground();
    drawTips();
    drawTypesOfTrash();

    for (let i = 0; i < balls.length; i++) {
        balls[i].draw();
    }

    character.draw(ctx);
}


//handle keys
function doKeyDown(e) {
    e.preventDefault();
    if (character != undefined) {
        character.doKeyInput(e.key, true);
    }
}

function doKeyUp(e) {
    e.preventDefault();
    if (character != undefined) {
        character.doKeyInput(e.key, false);
    }
}


// Create and return a new Character object.
// Param: spritesheet = Image object
// Param: spriteSize = Array of 2 numbers [width, height]
// Param: spriteFrames = 3D array[Tracks[Frames[Frame X, Y]]]
// Param: spriteScale = Number to scale sprite size -> canvas size
function Character(spritesheet, spriteSize, spriteFrames, spriteScale) {
    return {
        spriteSheet: spritesheet,       // image containing the sprites
        spriteFrameSize: spriteSize,    // dimensions of the sprites in the spritesheet
        spriteFrames: spriteFrames,     // 3d array. X = animation track, Y = animation frame, Z = X & Y of frame
        spriteScale: spriteScale,       // amount to scale sprites by (numbers except 1 will be linearly interpolated)
        spriteCanvasSize: spriteSize,   // Calculated size after scale. temp value set, overwritten in init

        animationTrack: 0,              // current animation frame set to use
        animationFrame: 0,              // current frame in animation to draw
        frameTime: 125,                 // milliseconds to wait between animation frame updates
        timeSinceLastFrame: 0,          // track time since the last frame update was performed
        lastAction: "",                 // Last user input action performed

        position: [0, 400],               // position of the character (X, Y)
        direction: [0, 0],              // X and Y axis movement amount
        velocity: 0.2,                   // rate of position change for each axis

        // Initialise variables that cannot be calculated during
        // object creation.
        init() {
            console.log("character init");
            // Apply scale multiplier to sprite frame dimensions
            this.spriteCanvasSize = [
                this.spriteFrameSize[0] * this.spriteScale,
                this.spriteFrameSize[1] * this.spriteScale
            ];
        },

        // Handle actions for the character to perform.
        // param: action = string of action name.
        action(action) {
            console.log(`action: ${action}. Animation Frame ${this.animationFrame}`);

            if (action === this.lastAction) {
                return;
            }

            switch (action) {
                case "moveLeft":
                    this.animationTrack = 2;
                    this.animationFrame = 0;
                    this.direction[0] = - this.velocity;
                    break;
                case "moveRight":
                    this.animationTrack = 3;
                    this.animationFrame = 0;
                    this.direction[0] = this.velocity;
                    break;
                case "moveUp":
                    this.animationTrack = 0;
                    this.animationFrame = 0;
                    this.direction[1] = - this.velocity;
                    break;
                case "moveDown":
                    this.animationTrack = 1;
                    this.animationFrame = 0;
                    this.direction[1] = this.velocity;
                    break;
                case "noMoveHorizontal":
                    this.direction[0] = 0;
                    this.animationFrame = 0;
                    break;
                case "noMoveVertical":
                    this.direction[1] = 0;
                    this.animationFrame = 0;
                    break;
                default:
                    this.direction = [0, 0];
                    break;
            }

            this.lastAction = action;
        },

        update(tick) {
            // increase time keeper by last update delta
            this.timeSinceLastFrame += tick;
            // check if time since last frame meets threshold for new frame
            if (this.timeSinceLastFrame >= this.frameTime) {
                // reset frame time keeper
                this.timeSinceLastFrame = 0;

                // update frame to next frame on the track. 
                // Modulo wraps the frames from last frame to first.
                if (this.direction[0] != 0 || this.direction[1] != 0) {
                    this.animationFrame = (this.animationFrame + 1) % this.spriteFrames[this.animationTrack].length;
                }
            }

            // Calculate how much movement to perform based on how long
            // it has been since the last position update.
            const bottom = parseInt(myCanvas.style.height) - this.spriteFrameSize[1] * this.spriteScale;
            const right = parseInt(myCanvas.style.width) - this.spriteFrameSize[0] * this.spriteScale;
            this.position[0] += this.direction[0] * tick;
            if(this.position[0] <= 0) this.position[0] = 0;
            if(this.position[0] >= right) this.position[0] = right;
            this.position[1] += this.direction[1] * tick;
            if(this.position[1] <= 200) this.position[1] = 200;
            if(this.position[1] >= bottom) this.position[1] = bottom;
        },

        // Draw character elements using the passed context (canvas).
        // Param: context = canvas 2D context.
        draw(context) {
            context.drawImage(
                this.spriteSheet,
                this.spriteFrames[this.animationTrack][this.animationFrame][0],
                this.spriteFrames[this.animationTrack][this.animationFrame][1],
                this.spriteFrameSize[0],
                this.spriteFrameSize[1],
                this.position[0],
                this.position[1],
                this.spriteCanvasSize[0],
                this.spriteCanvasSize[1]
            );
        },

        // Handle input from keyboard for the character.
        // Param: e = event key string.
        // Param: isKeyDown = boolean, true = key pressed, false = key released
        doKeyInput(e, isKeydown = true) {
            switch (e) {
                case "w":
                    if (isKeydown) this.action("moveUp");
                    else this.action("noMoveVertical");
                    break;
                case "a":
                    if (isKeydown) this.action("moveLeft");
                    else this.action("noMoveHorizontal");
                    break;
                case "s":
                    if (isKeydown) this.action("moveDown");
                    else this.action("noMoveVertical");
                    break;
                case "d":
                    if (isKeydown) this.action("moveRight");
                    else this.action("noMoveHorizontal");
                    break;
                default:
                    if (!isKeydown) this.action("stop");
                    break;
            }
        }
    };
}
