
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
mycanvas.height = 600 * scale;
mycanvas.style.width = "1000px";
mycanvas.style.height = "600px";
ctx.scale(scale, scale);

let score = 0;

function drawTips()
{
    ctx.clearRect(0, 0, 80, 50);

    ctx.font = "18px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "left";

    ctx.fillText("Time: " + seconds, 10, 20);
    ctx.fillText("Score: " + score, 10, 40);

}

function drawTypesOfTrash()
{
    ctx.clearRect(940, 0, 1000, 60);

    ctx.font = "18px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "left";

    ctx.fillText("A: 10", 940, 20);
    ctx.fillText("B: 20", 940, 40);
    ctx.fillText("C: 30", 940, 60);
}

function drawCanvas()
{
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

setInterval(drawCanvas, 200);
setInterval(decreaseTime, 1000);