const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let x = 100;
let y = 100;

let LEFT, UP, RIGHT, DOWN;
let friction = 0.05;


const BALLZ = []
const WALLZ = []

//Resizable canvas

function resizeCanvas(){
    canvas.width = window.innerWidth ;
    canvas.height = window.innerHeight ;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas()

//Moving

function userInput(){
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

//Matrix

class Matrix{
    constructor(rows, cols){
        this.rows = rows;
        this.cols = cols;
        this.data = [];

        for(let i = 0; i< this.rows; i++){
            this.data[i] = [];
            for(let j = 0; j< this.cols; j++){
                this.data[i][j] = 0
            }
        }
    }

    multiplyVec(vec){
        let result = new Vector(0,0);
        result.x = this.data[0][0] * vec.x + this.data[0][1] * vec.y;
        result.y = this.data[1][0] * vec.x + this.data[1][1] * vec.y;
        return result
    }
    
}

//ball

class Ball{
    constructor(x, y, r, m){
        this.pos = new Vector(x,y);
        this.r = r;
        this.m = m;
        if(this.m === 0){
            this.inv_m = 0;
        }else{
            this.inv_m = 1 / this.m;
        }
        this.vel = new Vector(0,0);
        this.acc = new Vector(0,0);
        this.elasticity = 1;
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
        this.vel.drawVec(this.pos.x, this.pos.y, 10, 'green');
        ctx.fillStyle = "black";
        ctx.fillText("m = " + this.m, this.pos.x - 10, this.pos.y - 5);
        ctx.fillText("e = " + this.elasticity, this.pos.x - 10, this.pos.y + 5);

    }

    keyControl(){
        if(LEFT){
            this.acc.x = -this.acceleration;
        }
        if(UP){
            this.acc.y = -this.acceleration;
        }
        if(RIGHT){
            this.acc.x = this.acceleration;
        }
        if(DOWN){
            this.acc.y = this.acceleration;
        }
        if(!UP && !DOWN){
            this.acc.y = 0;
        }
        if(!RIGHT && !LEFT){
            this.acc.x = 0
        }
    }

    reposition(){
        this.acc = this.acc.unit().mult(this.acceleration);
        this.vel = this.vel.add(this.acc);
        this.vel = this.vel.mult(1-friction);
        this.pos = this.pos.add(this.vel)
        
    }
}

class Wall{
    constructor(x1, y1, x2, y2){
        this.start = new Vector(x1,y1);
        this.end = new Vector(x2,y2);
        this.center = this.start.add(this.end).mult(0.5);
        this.length = this.end.subtr(this.start).mag();
        this.refStart = new Vector(x1,y1);
        this.refEnd = new Vector(x1,y1);
        this.refUnit = this.end.subtr(this.start).unit();
        this.angVel = 0;
        this.angle = 0;
        WALLZ.push(this);
    }

    drawWall(){
        let rotMat = rotMx(this.angle)
        let newDir = rotMat.multiplyVec(this.refUnit);
        this.start = this.center.add(newDir.mult(-this.length/2));
        this.end = this.center.add(newDir.mult(this.length/2));
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.strokeStyle = 'black';
        ctx.stroke();
    }

    wallUnit(){
        return this.end.subtr(this.start).unit();
    }

    keyControl(){
        if(LEFT){
            this.angVel = -0.1;
        }
        if(RIGHT){
            this.angVel = 0.1
        }
    }

    reposition(){
        this.angle += this.angVel;
        this.angVel *= 0.99
    }
}

//Collision

//Ball to Ball

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
    let pen_res = dist.unit().mult(pen_depth / (b1.inv_m + b2.inv_m));
    b1.pos = b1.pos.add(pen_res.mult(b1.inv_m));
    b2.pos = b2.pos.add(pen_res.mult(-b2.inv_m));
}

function coll_res_bb(b1,b2){
    let normal = b1.pos.subtr(b2.pos).unit();
    let relVel = b1.vel.subtr(b2.vel);
    let sepVel = Vector.dot(relVel, normal)
    let new_sepVel = -sepVel * Math.min(b1.elasticity, b2.elasticity);

    let vsep_diff = new_sepVel - sepVel;
    let impulse = vsep_diff / (b1.inv_m + b2.inv_m);
    let impulseVec = normal.mult(impulse)

    

    b1.vel = b1.vel.add(impulseVec.mult(b1.inv_m));
    b2.vel = b2.vel.add(impulseVec.mult(-b2.inv_m))
}

//Ball to Wall

function closestPointBW(b1,w1){
    let ballToWallStart = w1.start.subtr(b1.pos);
    if(Vector.dot(w1.wallUnit() , ballToWallStart) > 0){
        return w1.start
    }

    let wallEndToBall = b1.pos.subtr(w1.end);
    if(Vector.dot(w1.wallUnit(), wallEndToBall) > 0){
        return w1.end;
    }

    let closestDist = Vector.dot(w1.wallUnit(), ballToWallStart);
    let closestVect = w1.wallUnit().mult(closestDist);
    return w1.start.subtr(closestVect)
}

function coll_det_BW(b1,w1){
    let ballToClosest = closestPointBW(b1,w1).subtr(b1.pos);
    if(ballToClosest.mag() <= b1.r){
        return true
    }
}

function pen_res_BW(b1, w1){
    let penVect = b1.pos.subtr(closestPointBW(b1,w1));
    b1.pos = b1.pos.add(penVect.unit().mult(b1.r - penVect.mag()))
}

function coll_res_BW(b1,w1){
    let normal = b1.pos.subtr(closestPointBW(b1,w1)).unit();
    let sepVel = Vector.dot(b1.vel, normal);
    let new_sepVel = -sepVel * b1.elasticity;
    let vsep_diff = sepVel - new_sepVel;
    b1.vel = b1.vel.add(normal.mult(-vsep_diff));
}

//Auxilliar Functions

function round(number, precision){
    let factor = 10**precision;
    return Math.round(number * factor) / factor;
}

function randInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rotMx(angle){
    let mx = new Matrix(2,2);
    mx.data[0][0] = Math.cos(angle);
    mx.data[0][1] = -Math.sin(angle);
    mx.data[1][0] = Math.sin(angle);
    mx.data[1][1] = Math.cos(angle);
    return mx;
}

//Animate

function animate(){
    ctx.clearRect(0,0, canvas.clientWidth, canvas.clientHeight);
    userInput()
    BALLZ.forEach((b, index) => {
        b.drawBall(); 
        if(b.player){
            b.keyControl()
        }
        WALLZ.forEach((w) => {
            if(coll_det_BW(BALLZ[index], w)){
                pen_res_BW(BALLZ[index], w);
                coll_res_BW(BALLZ[index], w);
            }
        })

        for(let i = index + 1; i < BALLZ.length; i++){
            if(coll_det_bb(BALLZ[index], BALLZ[i])){
                pen_res_bb(BALLZ[index], BALLZ[i]);
                coll_res_bb(BALLZ[index], BALLZ[i]);
            }
        }

        
        b.display()
        b.reposition()
    })

    WALLZ.forEach((w) => {
        w.drawWall();
        //w.keyControl();
        w.reposition()
    })

    requestAnimationFrame(animate)
}

let Wall1 = new Wall(200,300, 400,300);
let Wall2 = new Wall(400,600, 700,300);

for( let i = 0; i < 30; i++){
    let newBall = new Ball(randInt(100,window.innerWidth),randInt(100,window.innerHeight),randInt(20,50),randInt(1,10))
    newBall.elasticity = randInt(0,10) / 10
}

//Edge Canvas
let edge1 = new Wall(0, 0, canvas.clientWidth, 0);
let edge2 = new Wall(canvas.clientWidth, 0, canvas.clientWidth, canvas.clientHeight);
let edge3 = new Wall(canvas.clientWidth, canvas.clientHeight, 0, canvas.clientHeight);
let edge4 = new Wall(0,canvas.clientHeight,0,0);

BALLZ[0].player = true

requestAnimationFrame(animate)