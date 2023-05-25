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
        b.acc.x = -b.acceleration;
    }
    if(UP){
        b.acc.y = -b.acceleration;
    }
    if(RIGHT){
        b.acc.x = b.acceleration;
    }
    if(DOWN){
        b.acc.y = b.acceleration;
    }
    if(!UP && !DOWN){
        b.acc.y = 0;
    }
    if(!RIGHT && !LEFT){
        b.acc.x = 0
    }

    b.vel = b.vel.add(b.acc);
    b.vel = b.vel.mult(1-friction);
    b.pos = b.pos.add(b.vel)
}

//Vectors

class Vector{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }

    add(v){
        return new Vector(this.x + v.x, this.y + v.y);
    }

    subtr(v){
        return new Vector(this.x - v.x, this.y - v.y);
    }

    mag(){
        return Math.sqrt(this.x**2 + this.y**2)
    }

    mult(n){
        return new Vector(this.x * n, this.y * n);
    }

    normal(){
        return  new Vector(-this.y, this.x).unit()
    }

    unit(){
        if(this.mag() === 0){
            return new Vector(0,0);
        }else{
            return new Vector(this.x/this.mag(), this.y/this.mag());
        }
    }

    static dot(v1, v2){
        return v1.x * v2.x + v1.y * v2.y
    }

    drawVec(start_x, start_y, n, color){
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(start_x + this.x * n, start_y + this.y * n);
        ctx. strokeStyle = color;
        ctx.stroke();
    }
}

//ball

class Ball{
    constructor(x, y, r){
        this.pos = new Vector(x,y);
        this.r = r;
        this.vel = new Vector(0,0);
        this.acc = new Vector(0,0);
        this.acceleration = 1;
        this.player = false
        BALLZ.push(this)
    }

    drawBall(){
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2*Math.PI);
        ctx.strokeStyle = 'red';
        ctx.stroke();
        ctx.fillStyle = 'red';
        ctx.fill()
    }
    
    display(){
        this.vel.drawVec(500, 400, 10, 'green');
        this.acc.unit().drawVec(500, 400, 50, 'blue');
        this.acc.normal().drawVec(500, 400, 50, 'black');

        ctx.beginPath();
        ctx.arc(500, 400, 50, 0, 2*Math.PI);
        ctx.strokeStyle = 'black';
        ctx.stroke();
    }
}
//Colision

function round(number, precision){
    let factor = 10**precision;
    return Math.round(number * factor) / facto;
}

function coll_det_bb(b1, b2){
    if(b1.r + b2.r >= b2.pos.subtr(b1.pos).mag()){
        return true;
    }else{
        return false;
    }
}

function pen_res_bb(b1,b2){
    let dist = b1.pos.subtr(b2.pos);
    let pen_depth = b1.r + b2.r - dist.mag();
    let pen_res = dist.unit().mult(pen_depth/2);
    b1.pos = b1.pos.add(pen_res);
    b2.pos = b2.pos.add(pen_res.mult(-1));
}

//Animate

function animate(){
    ctx.clearRect(0,0, canvas.clientWidth, canvas.clientHeight);
    BALLZ.forEach((b, index) => {
        b.drawBall(); 
        if(b.player){
            keyControl(b)
        }
        for(let i = index + 1; i < BALLZ.length; i++){
            if(coll_det_bb(BALLZ[index], BALLZ[i])){
                pen_res_bb(BALLZ[index], BALLZ[i]);
            }
        }

        b.display()
    })

    
    requestAnimationFrame(animate)
}

let Ball1 = new Ball(200,200,30);
let Ball2 = new Ball(300,300,40);
let Ball3 = new Ball(100,200, 20);
let Ball4 = new Ball(340,200,30);
let Ball5 = new Ball(300,400,40);
let Ball6 = new Ball(150,90, 20);
let Ball7 = new Ball(400,270,30);
let Ball8 = new Ball(200,300,40);
let Ball9 = new Ball(100,400, 20);
Ball1.player = true;

requestAnimationFrame(animate)