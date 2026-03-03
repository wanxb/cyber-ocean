import { random } from './utils.js';
import { Spotlight } from './spotlight.js';
import { Prop } from './prop.js';
import { Creature } from './creature.js';

const canvas = document.getElementById('tankCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let entities = [];
let props = [];
let spotlights = [];
let globalTime = 0;

// ---------------- 初始化与循环 ----------------

function initWorld() {
    width = window.innerWidth;
    height = window.innerHeight;

    entities = [];
    props = [];
    spotlights = [];

    // 1. 造景
    for (let i = 0; i < width; i += random(30, 80)) {
        let type = Math.random() > 0.7 ? 'coral' : 'seaweed';
        props.push(new Prop(i, type, height));
    }

    // 2. 生物
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

    // 3. 灯光
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

    // 装饰性覆盖层
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

// 程序入口
handleResize();
initWorld();
window.addEventListener('resize', handleResize);
canvas.addEventListener('click', (e) => {
    let types = ['whale', 'shark', 'turtle', 'jellyfish', 'seahorse'];
    let type = types[Math.floor(Math.random() * types.length)];
    let c = new Creature(type);
    // position manually at click
    c.x = e.clientX;
    c.y = e.clientY;
    // put new creatures near surface
    c.depth = 0.9;
    c.scale = c.depth * (type === 'whale' ? 1.5 : 1);
    c.vx = c.speed * c.scale * (Math.random() > 0.5 ? 1 : -1);
    entities.push(c);
});

animate();
