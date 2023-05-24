const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let x = 100;
let y = 100;

let LEFT, UP, RIGHT, DOWN;

//Resizable canvas

function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas()

//Moving

canvas.addEventListener('keydown', function(e){
    if(e.keyCode === 65){
        LEFT = true;
    }
    if(e.keyCode === 87){
        UP = true;
    }
    if(e.keyCode === 68){
        RIGHT = true;
    }
    if(e.keyCode === 83){
        DOWN = true;
    }
})

canvas.addEventListener('keyup', function(e){
    if(e.keyCode === 65){
        LEFT = false;
    }
    if(e.keyCode === 87){
        UP = false;
    }
    if(e.keyCode === 68){
        RIGHT = false;
    }
    if(e.keyCode === 83){
        DOWN = false;
    }
})

function move(){
    if(LEFT){
        x--;
    }
    if(UP){
        y--;
    }
    if(RIGHT){
        x++;
    }
    if(DOWN){
        y++;
    }
}

//ball

function drawBall(x,y,r){
    ctx.beginPath();
    ctx.arc(x,y,r, 0, 2*Math.PI);
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.fillStyle = 'red';
    ctx.fill()
}



//Animate

function animate(){
    ctx.clearRect(0,0, canvas.clientWidth, canvas.clientHeight);
    move();
    drawBall(x, y, 20);
    requestAnimationFrame(animate)
}

requestAnimationFrame(animate)