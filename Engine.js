const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let x = 100;
let y = 100;

let LEFT, UP, RIGHT, DOWN;
let friction = 0.1;
const BALLZ = []

//Resizable canvas

function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas()

//Moving

function keyControl(b){
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
    
    if(LEFT){
        b.acc_x = -b.acceleration;
    }
    if(UP){
        b.acc_y = -b.acceleration;
    }
    if(RIGHT){
        b.acc_x = b.acceleration;
    }
    if(DOWN){
        b.acc_y = b.acceleration;
    }
    if(!UP && !DOWN){
        b.acc_y = 0;
    }
    if(!RIGHT && !LEFT){
        b.acc_x = 0
    }

    b.vel_x += b.acc_x;
    b.vel_y += b.acc_y;

    b.vel_x *= 1-friction;
    b.vel_y *= 1-friction;

    b.x += b.vel_x;
    b.y += b.vel_y;
}

//ball

class Ball{
    constructor(x, y, r){
        this.x = x;
        this.y = y;
        this.r = r;
        this.vel_x = 0;
        this.vel_y = 0;
        this.acc_x = 0;
        this.acc_y = 0;
        this.acceleration = 1;
        this.player = false
        BALLZ.push(this)
    }

    drawBall(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
        ctx.strokeStyle = 'black';
        ctx.stroke();
        ctx.fillStyle = 'red';
        ctx.fill()
    }
    
    display(){
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.acc_x * 100, this.y + this.acc_y * 100);
        ctx. strokeStyle = "green";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.vel_x * 10, this.y + this.vel_y * 10);
        ctx. strokeStyle = "blue";
        ctx.stroke();
    }
}

//Animate

function animate(){
    ctx.clearRect(0,0, canvas.clientWidth, canvas.clientHeight);
    BALLZ.forEach((b) => {
        b.drawBall();
        b.display()
        if(b.player){
            keyControl(b)
        }
    })
    requestAnimationFrame(animate)
}

let Ball1 = new Ball(200,200,30);
Ball1.player = true;

requestAnimationFrame(animate)