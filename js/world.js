/**
 * world.js — Scene initialisation.
 * Owns: entity list, prop list, spotlight, spawn logic.
 */
import { random, lerp } from './utils.js';
import { Prop } from './prop.js';
import { Creature } from './creature.js';

// ── Spotlight ───────────────────────────────────────────────────────────────
class Spotlight {
    constructor() {
        this.x = 0;
        this.angle = Math.PI / 2;
        this.target = null;
        this.color = `rgba(200, 255, 255, ${0.22 + Math.random() * 0.10})`;
    }

    findTarget(entities, width) {
        const candidates = entities
            .filter(e => e.scale > 0.6 && e.x > -100 && e.x < width + 100)
            .sort((a, b) => b.scale - a.scale);
        this.target = candidates[0] || null;
    }

    update(entities, width, globalTime) {
        if (globalTime % 100 < 1 || !this.target) this.findTarget(entities, width);

        if (this.target) {
            const dx = this.target.x - width / 2;
            const dy = this.target.y + 200;
            this.x = lerp(this.x, this.target.x, 0.02);
            this.angle = lerp(this.angle, Math.atan2(dy, dx), 0.03);
        } else {
            this.x = lerp(this.x, width / 2 + Math.sin(globalTime * 0.5) * (width / 3), 0.02);
            this.angle = lerp(this.angle, Math.PI / 2 + Math.sin(globalTime * 0.5) * 0.2, 0.03);
        }
    }

    draw(ctx, width, height) {
        ctx.save();
        const srcX = width / 2;
        const srcY = -200;
        const len = height * 1.5;
        const endX = srcX + Math.cos(this.angle) * len;
        const endY = srcY + Math.sin(this.angle) * len;

        const grad = ctx.createLinearGradient(srcX, srcY, endX, endY);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(0.1, this.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(srcX - 10, srcY);
        ctx.lineTo(endX - 300, endY);
        ctx.lineTo(endX + 300, endY);
        ctx.lineTo(srcX + 10, srcY);
        ctx.fill();
        ctx.restore();
    }
}

// ── World state ──────────────────────────────────────────────────────────────
export let entities = [];
export let props    = [];
export const spotlight = new Spotlight();

const MAX_ENTITIES = 140;
const PROP_TYPES   = ['seaweed', 'coral', 'kelp', 'anemone', 'clam', 'rock', 'starfish'];

function spawnProp(width, height) {
    const r = Math.random();
    const type =
        r < 0.28 ? PROP_TYPES[0] :
        r < 0.46 ? PROP_TYPES[1] :
        r < 0.60 ? PROP_TYPES[2] :
        r < 0.70 ? PROP_TYPES[3] :
        r < 0.78 ? PROP_TYPES[4] :
        r < 0.88 ? PROP_TYPES[5] :
                   PROP_TYPES[6];
    return type;
}

function addEntity(creature) {
    if (entities.length >= MAX_ENTITIES) entities.shift();
    entities.push(creature);
}

function spawn(type, width, height) {
    const c = new Creature(type);
    c.randomSpawn(width, height);
    addEntity(c);
}

export function initWorld(width, height) {
    entities = [];
    props    = [];

    // Props
    for (let x = 0; x < width; x += random(22, 65)) {
        props.push(new Prop(x, spawnProp(width, height), height));
    }

    // Creatures
    spawn('whale', width, height);
    if (width > 1000) spawn('whale', width, height);
    for (let i = 0; i < 4;  i++) spawn('shark',    width, height);
    for (let i = 0; i < 3;  i++) spawn('turtle',   width, height);
    for (let i = 0; i < 36; i++) spawn('fish',     width, height);
    for (let i = 0; i < 20; i++) spawn(Math.random() < 0.5 ? 'jellyfish' : 'seahorse', width, height);
}

export function spawnAtClick(x, y, width, height) {
    const types = ['whale', 'shark', 'turtle', 'jellyfish', 'seahorse'];
    const type  = types[Math.floor(Math.random() * types.length)];
    const c     = new Creature(type);
    c.x     = x;
    c.y     = y;
    c.depth = 0.9;
    c.scale = c.depth * (type === 'whale' ? 1.5 : 1);
    c.vx    = c.speed * c.scale * (Math.random() > 0.5 ? 1 : -1);
    addEntity(c);
}
