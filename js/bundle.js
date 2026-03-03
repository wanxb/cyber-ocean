// @ts-nocheck
// bundle.js - single-file version for environments without module support
// This file is generated manually by concatenating the source modules.

// ---- utils.js ----
function random(min, max) {
    return Math.random() * (max - min) + min;
}

function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

function randomHsl() {
    return `hsl(${Math.random() * 360}, 70%, 60%)`;
}

// ---- prop.js ----
class Prop {
    constructor(x, type, heightRef) {
        this.x = x;
        this.y = heightRef;
        this.type = type;
        this.size = random(0.5, 1.5);
        this.color = randomHsl();
        this.segments = Math.floor(random(5, 10));
        this.height = random(50, 200) * this.size;
        
        this.coralNodes = [];
        if (type === 'coral') {
            let count = random(5, 10);
            for(let i=0; i<count; i++) {
                this.coralNodes.push({
                    ox: random(-20, 20) * this.size,
                    oy: -random(10, 60) * this.size,
                    r: random(5, 15) * this.size
                });
            }
        }
    }

    draw(ctx, globalTime) {
        ctx.save();
        ctx.translate(this.x, this.y);

        if (this.type === 'seaweed') {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            let cx = 0;
            let segH = this.height / this.segments;
            for (let i = 0; i < this.segments; i++) {
                let sway = Math.sin(globalTime * 1.5 + this.x * 0.01 + i) * (i * 1.5);
                let ny = -(i + 1) * segH;
                let nx = sway;
                ctx.quadraticCurveTo(cx, ny + segH/2, nx, ny);
                cx = nx;
            }
            ctx.strokeStyle = `rgba(50, 150, 100, 0.6)`;
            ctx.lineWidth = 8 * this.size;
            ctx.lineCap = 'round';
            ctx.stroke();
        } else if (this.type === 'coral') {
            ctx.fillStyle = this.color;
            this.coralNodes.forEach(node => {
                ctx.beginPath();
                ctx.arc(node.ox, node.oy, node.r, 0, Math.PI*2);
                ctx.fill();
            });
        }
        ctx.restore();
    }
}

// ---- spotlight.js ----
class Spotlight {
    constructor(id) {
        this.id = id;
        this.x = 0;
        this.angle = Math.PI / 2;
        this.target = null;
        this.widthTop = 10;
        this.widthBottom = 300;
        this.color = `rgba(200, 255, 255, ${0.08 + Math.random() * 0.05})`;
    }

    findTarget(entities, width) {
        let candidates = entities.filter(e => 
            e.scale > 0.6 && 
            e.x > -100 && e.x < width + 100
        );
        candidates.sort((a, b) => b.scale - a.scale);
        
        if (candidates.length > 0) {
            let index = this.id % Math.min(candidates.length, 3);
            this.target = candidates[index];
        } else {
            this.target = null;
        }
    }

    update(entities, width, globalTime) {
        if (globalTime % 100 < 1 || !this.target) this.findTarget(entities, width);

        let targetX = width / 2;
        let targetAngle = Math.PI / 2;

        if (this.target) {
            targetX = this.target.x;
            let dx = this.target.x - (width / 2 + (this.id - 1) * 200);
            let dy = this.target.y + 200;
            targetAngle = Math.atan2(dy, dx);
        } else {
            targetX = width/2 + Math.sin(globalTime * 0.5 + this.id) * (width/3);
            targetAngle = Math.PI / 2 + Math.sin(globalTime * 0.5) * 0.2;
        }

        this.x = lerp(this.x, targetX, 0.02);
        this.angle = lerp(this.angle, targetAngle, 0.03);
    }

    draw(ctx, width, height) {
        ctx.save();
        let sourceX = width / 2 + (this.id - 1) * 300; 
        let sourceY = -200; 
        let length = height * 1.5;
        let endX = sourceX + Math.cos(this.angle) * length;
        let endY = sourceY + Math.sin(this.angle) * length;

        let grad = ctx.createLinearGradient(sourceX, sourceY, endX, endY);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.1, this.color);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(sourceX - this.widthTop, sourceY);
        ctx.lineTo(endX - this.widthBottom, endY);
        ctx.lineTo(endX + this.widthBottom, endY);
        ctx.lineTo(sourceX + this.widthTop, sourceY);
        ctx.fill();
        ctx.restore();
    }
}

// ---- creature.js ----
class Creature {
    constructor(type) {
        this.type = type;
        this.initAttributes();
    }

    initAttributes() {
        this.depth = random(0.3, 1);
        this.angle = 0;
        this.swimOffset = random(0, 100);
        
        switch (this.type) {
            case 'whale':
                this.length = random(200, 350);
                this.width = this.length * 0.3;
                this.speed = random(0.3, 0.6);
                this.color = '#34495e';
                this.depth = random(0.2, 0.6);
                this.scale = this.depth * 1.5;
                break;
            case 'shark':
                this.length = random(100, 180);
                this.width = this.length * 0.25;
                this.speed = random(1.5, 2.5);
                this.color = '#90a4ae';
                this.scale = this.depth;
                break;
            case 'turtle':
                this.length = random(60, 90);
                this.width = this.length * 0.6;
                this.speed = random(0.5, 1.0);
                this.color = '#5d4037';
                this.scale = this.depth;
                break;
            case 'jellyfish':
                this.length = random(30, 50);
                this.width = this.length * 0.5;
                this.speed = random(0.5, 1.5);
                this.color = randomHsl();
                this.scale = this.depth;
                break;
            case 'seahorse':
                this.length = random(40, 60);
                this.width = this.length * 0.4;
                this.speed = random(0.5, 1);
                this.color = randomHsl();
                this.scale = this.depth;
                break;
            default: // fish
                this.length = random(20, 60);
                this.width = this.length * random(0.2, 0.5);
                this.speed = random(1, 3.5);
                this.color = randomHsl();
                this.scale = this.depth;
                this.finShape = Math.random();
                break;
        }
        
        this.vx = this.speed * this.scale;
    }

    resetPosition(width, height) {
        if (typeof width === 'undefined' || typeof height === 'undefined') {
            console.warn('resetPosition requires width and height');
            return;
        }
        this.y = random(height * 0.1, height * 0.9);
        if (Math.random() < 0.5) {
            this.vx = Math.abs(this.vx);
            this.x = -200;
        } else {
            this.vx = -Math.abs(this.vx);
            this.x = width + 200;
        }
    }

    randomSpawn(width, height) {
        this.x = random(0, width);
        this.y = random(height * 0.1, height * 0.9);
        if (Math.random() < 0.5) this.vx *= -1;
    }

    update(globalTime, width) {
        this.x += this.vx;
        let waveFreq = this.type === 'whale' ? 0.5 : 2.0;
        let waveAmp = this.type === 'whale' ? 0.2 : 0.5;
        this.y += Math.sin(globalTime * waveFreq + this.swimOffset) * waveAmp;

        const margin = 400 * this.scale;
        if (this.vx > 0 && this.x > width + margin) this.x = -margin;
        if (this.vx < 0 && this.x < -margin) this.x = width + margin;
    }

    draw(ctx, globalTime) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = Math.max(0.3, this.depth);

        let direction = this.vx < 0 ? -1 : 1;
        let xOffset = -this.length / 4 * direction;
        ctx.translate(xOffset, 0);
        ctx.scale(direction * this.scale, this.scale);

        switch (this.type) {
            case 'whale': this.drawWhale(ctx, globalTime); break;
            case 'shark': this.drawShark(ctx, globalTime); break;
            case 'turtle': this.drawTurtle(ctx, globalTime); break;
            case 'jellyfish': this.drawJellyfish(ctx, globalTime); break;
            case 'seahorse': this.drawSeahorse(ctx, globalTime); break;
            default: this.drawFish(ctx, globalTime); break;
        }
        ctx.restore();
    }

    drawFish(ctx, globalTime) {
        let tailWag = Math.sin(globalTime * 8 + this.swimOffset) * (this.width * 0.3);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(-this.length/2, 0);
        ctx.quadraticCurveTo(0, -this.width, this.length/2, 0);
        ctx.quadraticCurveTo(0, this.width, -this.length/2, 0);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-this.length/2 + 5, 0);
        ctx.lineTo(-this.length/2 - this.length/4, -this.width/2 + tailWag);
        ctx.lineTo(-this.length/2 - this.length/4, this.width/2 + tailWag);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.beginPath(); ctx.arc(this.length/3, -this.width/5, this.length/12, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath(); ctx.arc(this.length/3 + 1, -this.width/5, this.length/24, 0, Math.PI*2); ctx.fill();
    }

    drawShark(ctx, globalTime) {
        let tailWag = Math.sin(globalTime * 4 + this.swimOffset) * 10;
        ctx.fillStyle = '#b0bec5';
        ctx.beginPath();
        ctx.moveTo(this.length/2, 0);
        ctx.bezierCurveTo(this.length/4, -this.width, -this.length/2, -this.width/2, -this.length/2, 0);
        ctx.bezierCurveTo(-this.length/2, this.width/2, this.length/4, this.width/2, this.length/2, 0);
        ctx.fill();
        ctx.fillStyle = '#eceff1';
        ctx.beginPath();
        ctx.moveTo(this.length/2, 0);
        ctx.quadraticCurveTo(0, this.width/2, -this.length/2, 0);
        ctx.fill();
        ctx.fillStyle = '#78909c';
        ctx.beginPath();
        ctx.moveTo(-this.length/2 + 10, 0);
        ctx.lineTo(-this.length, -this.width + tailWag);
        ctx.lineTo(-this.length * 0.8, 0 + tailWag);
        ctx.lineTo(-this.length, this.width + tailWag);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, -this.width/3);
        ctx.lineTo(-this.length/6, -this.width * 1.2);
        ctx.lineTo(this.length/6, -this.width/3);
        ctx.fill();
    }

    drawWhale(ctx, globalTime) {
        let bodyWave = Math.sin(globalTime * 1.5 + this.swimOffset);
        let grad = ctx.createLinearGradient(-this.length/4, -this.width, -this.length/4, this.width);
        grad.addColorStop(0, '#2c3e50'); grad.addColorStop(1, '#bdc3c7');
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.arc(0, 0, this.width/1.2, Math.PI/2, -Math.PI/2);
        ctx.lineTo(-this.length/2, -this.width/4 + bodyWave * 10);
        ctx.lineTo(-this.length/2, this.width/4 + bodyWave * 10);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-this.length/2, bodyWave * 10);
        ctx.lineTo(-this.length/2 - 40, bodyWave * 30 - 20);
        ctx.lineTo(-this.length/2 - 10, bodyWave * 10);
        ctx.lineTo(-this.length/2 - 40, bodyWave * 30 + 20);
        ctx.fill();
    }

    drawTurtle(ctx, globalTime) {
        let paddle = Math.sin(globalTime * 3 + this.swimOffset);
        ctx.fillStyle = '#795548';
        ctx.beginPath(); ctx.ellipse(-20, 10, 10, 5, paddle - 0.5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(10, 15, 20, 8, -paddle + 0.5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#3e2723';
        ctx.beginPath(); ctx.arc(0, 0, this.length/2, Math.PI, 0); ctx.lineTo(0, 10); ctx.fill();
        ctx.fillStyle = '#795548';
        ctx.beginPath(); ctx.arc(this.length/2, 5, 12, 0, Math.PI*2); ctx.fill();
    }

    drawJellyfish(ctx, globalTime) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.width, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            let tx = -this.width + (i * this.width * 0.4);
            ctx.beginPath();
            ctx.moveTo(tx, 0);
            ctx.lineTo(tx, this.width + Math.sin(globalTime * 3 + i) * 10);
            ctx.stroke();
        }
    }

    drawSeahorse(ctx, globalTime) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        // head and neck curve
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-this.length/8, -this.length/6,
                          -this.length/4, this.length/8,
                          0, this.length/2);
        // belly curve
        ctx.bezierCurveTo(this.length/16, this.length/3,
                          this.length/8, this.length/2,
                          this.length/16, this.length * 0.75);
        ctx.stroke();
        // eye
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(-this.length/32, -this.length/20, this.length/20, 0, Math.PI*2);
        ctx.fill();
        // more detailed spiral tail
        let tailStartY = this.length * 0.75;
        let coils = 3;
        let maxR = this.length/8;
        for (let i = 0; i < coils; i++) {
            ctx.beginPath();
            ctx.arc(0, tailStartY, maxR * (1 - i / coils), 0, Math.PI*1.5);
            tailStartY += maxR * 0.3;
            ctx.stroke();
        }
    }
}

// ---- main.js ----
const canvas = document.getElementById('tankCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let entities = [];
let props = [];
let spotlights = [];
let globalTime = 0;

function initWorld() {
    width = window.innerWidth;
    height = window.innerHeight;

    entities = [];
    props = [];
    spotlights = [];

    for (let i = 0; i < width; i += random(30, 80)) {
        let type = Math.random() > 0.7 ? 'coral' : 'seaweed';
        props.push(new Prop(i, type, height));
    }

    let whale = new Creature('whale'); whale.randomSpawn(width, height); entities.push(whale);
    if (width > 1000) { let w2 = new Creature('whale'); w2.randomSpawn(width, height); entities.push(w2); }

    for (let i = 0; i < 4; i++) { let s = new Creature('shark'); s.randomSpawn(width, height); entities.push(s); }
    for (let i = 0; i < 3; i++) { let t = new Creature('turtle'); t.randomSpawn(width, height); entities.push(t); }
    for (let i = 0; i < 20; i++) { let f = new Creature('fish'); f.randomSpawn(width, height); entities.push(f); }
    for (let i = 0; i < 20; i++) { 
        let type = Math.random() < 0.5 ? 'jellyfish' : 'seahorse';
        let c = new Creature(type);
        c.randomSpawn(width, height);
        entities.push(c);
    }

    spotlights.push(new Spotlight(1));
    spotlights.push(new Spotlight(2));
    spotlights.push(new Spotlight(3));
}

function drawBackground() {
    let grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#000000');
    grad.addColorStop(0.5, '#001020');
    grad.addColorStop(1, '#002030');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
}

function animate() {
    globalTime += 0.02;
    drawBackground();

    spotlights.forEach(light => {
        light.update(entities, width, globalTime);
        light.draw(ctx, width, height);
    });

    props.forEach(prop => prop.draw(ctx, globalTime));

    entities.sort((a, b) => a.depth - b.depth);
    entities.forEach(e => {
        e.update(globalTime, width);
        e.draw(ctx, globalTime);
    });

    let rad = ctx.createRadialGradient(width/2, height/2, height/3, width/2, height/2, height * 0.8);
    rad.addColorStop(0, 'rgba(0,10,20,0)');
    rad.addColorStop(1, 'rgba(0,5,10,0.8)');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for(let i=0; i<20; i++) {
        let dx = (Math.sin(globalTime * 0.5 + i) * width + i * 100) % width;
        let dy = (globalTime * 10 + i * 50) % height;
        if(dx >= 0 && dy >=0) ctx.fillRect(dx, dy, 1, 1);
    }

    requestAnimationFrame(animate);
}

function handleResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

handleResize();
initWorld();
window.addEventListener('resize', handleResize);
canvas.addEventListener('click', (e) => {
    let types = ['whale', 'shark', 'turtle', 'jellyfish', 'seahorse'];
    let type = types[Math.floor(Math.random() * types.length)];
    let c = new Creature(type);
    c.x = e.clientX;
    c.y = e.clientY;
    c.depth = 0.9;
    c.scale = c.depth * (type === 'whale' ? 1.5 : 1);
    c.vx = c.speed * c.scale * (Math.random() > 0.5 ? 1 : -1);
    entities.push(c);
});

animate();
