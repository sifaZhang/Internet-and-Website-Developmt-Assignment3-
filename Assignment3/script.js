
//page 1
let seconds = 60;
let typesOfTrash = 3;

function start()
{
    const setting = document.getElementById("setting");
    setting.classList.add('hidden');

    seconds = document.getElementById('duration').value;
    typesOfTrash = document.getElementById('trash-type').value;

    const canvas = document.getElementById("canvas");
    canvas.classList.remove('hidden');

    console.log("seconds=", seconds, "typesOfTrash", typesOfTrash);
}


//page 2
let mycanvas = document.getElementById("myCanvas")
let ctx = mycanvas.getContext('2d');
const scale = window.devicePixelRatio;
mycanvas.width = 1000 * scale;
mycanvas.height = 666 * scale;
mycanvas.style.width = "1000px";
mycanvas.style.height = "666px";
ctx.scale(scale, scale);

let score = 0;

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
  console.log("canvas ", mycanvas.width, mycanvas.height);
};


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

  // 用逻辑宽高（CSS 宽高）
  const logicalWidth = parseInt(mycanvas.style.width);
  const logicalHeight = parseInt(mycanvas.style.height);

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

function drawCanvas()
{
    ctx.clearRect(0, 0, mycanvas.width, mycanvas.height);

    drawBackground();
    drawTips();
    drawTypesOfTrash();
}

function decreaseTime()
{
    seconds -= 1;

    if(seconds == 0)
    {
        console.log("game over");
    }
}

function updateWave()
{
    bg = (bg === bg1) ? bg2 : bg1;

    //change ball size
}

setInterval(drawCanvas, 200);
setInterval(updateWave, 500);
setInterval(decreaseTime, 1000);