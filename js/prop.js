import { random, randomHsl } from './utils.js';

export class Prop {
    constructor(x, type, heightRef) {
        this.x = x;
        this.y = heightRef;
        this.type = type;
        this.size = random(0.6, 1.6);
        this.color = randomHsl();
        this.color2 = randomHsl();
        this.segments = Math.floor(random(5, 10));
        this.height = random(50, 200) * this.size;
        this.phase = random(0, Math.PI * 2);

        // seaweed: fat rounded blades
        this.blades = [];
        if (type === 'seaweed') {
            const count = Math.floor(random(2, 5));
            for (let i = 0; i < count; i++) {
                this.blades.push({
                    ox: random(-10, 10) * this.size,
                    h: random(60, 160) * this.size,
                    segs: Math.floor(random(5, 9)),
                    bend: random(0.7, 1.4),
                    hue: Math.floor(random(110, 165))
                });
            }
        }

        // branching coral tree
        this.branches = [];
        if (type === 'coral') {
            this._buildCoral(0, 0, -1, random(55, 90) * this.size, 0, 4);
        }

        // kelp fronds
        this.fronds = [];
        if (type === 'kelp') {
            const count = Math.floor(random(3, 7));
            for (let i = 0; i < count; i++) {
                this.fronds.push({
                    offset: random(-14, 14) * this.size,
                    h: random(100, 240) * this.size,
                    bend: random(0.5, 1.3),
                    hue: Math.floor(random(110, 155))
                });
            }
        }

        // anemone petals
        this.petals = [];
        if (type === 'anemone') {
            const count = Math.floor(random(10, 18));
            for (let i = 0; i < count; i++) {
                this.petals.push({
                    angle: (Math.PI / count) * i + random(-0.15, 0.15),
                    len: random(20, 42) * this.size,
                    phase: random(0, Math.PI * 2),
                    hue: Math.floor(random(270, 360))
                });
            }
        }

        // clam
        this.hasPearl = Math.random() < 0.3;

        // rock cluster
        this.rocks = [];
        if (type === 'rock') {
            const count = Math.floor(random(2, 5));
            for (let i = 0; i < count; i++) {
                this.rocks.push({
                    ox: random(-28, 28) * this.size,
                    oy: random(-6, 4) * this.size,
                    rx: random(14, 34) * this.size,
                    ry: random(10, 22) * this.size,
                    rot: random(-0.4, 0.4),
                    lightness: Math.floor(random(22, 40))
                });
            }
        }

        // starfish
        this.starRot = random(0, Math.PI * 2);
    }

    // Recursive branch builder for coral
    _buildCoral(x, y, angle, len, depth, maxDepth) {
        if (depth > maxDepth || len < 5) return;
        const ex = x + Math.cos(angle - Math.PI / 2) * len;
        const ey = y + Math.sin(angle - Math.PI / 2) * len;
        this.branches.push({ x1: x, y1: y, x2: ex, y2: ey, depth, w: Math.max(1.5, (maxDepth - depth + 1) * 2.2 * this.size) });
        const spread = random(0.3, 0.65);
        this._buildCoral(ex, ey, angle - spread, len * random(0.6, 0.78), depth + 1, maxDepth);
        this._buildCoral(ex, ey, angle + spread, len * random(0.6, 0.78), depth + 1, maxDepth);
    }

    draw(ctx, globalTime) {
        ctx.save();
        ctx.translate(this.x, this.y);

        if (this.type === 'seaweed') {
            this.blades.forEach((blade) => {
                const sway = Math.sin(globalTime * 1.4 + this.x * 0.012 + blade.ox) * 14 * blade.bend;
                ctx.beginPath();
                ctx.moveTo(blade.ox, 0);
                const segH = blade.h / blade.segs;
                let cx = blade.ox;
                for (let i = 0; i < blade.segs; i++) {
                    const s = Math.sin(globalTime * 1.4 + this.x * 0.012 + i + blade.ox * 0.05) * (i * 2.2) * blade.bend;
                    const ny = -(i + 1) * segH;
                    const nx = blade.ox + s;
                    ctx.quadraticCurveTo(cx, ny + segH * 0.55, nx, ny);
                    cx = nx;
                }
                ctx.strokeStyle = `hsla(${blade.hue}, 55%, 28%, 0.88)`;
                ctx.lineWidth = 11 * this.size;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();
                // lighter midrib
                ctx.beginPath();
                ctx.moveTo(blade.ox, 0);
                cx = blade.ox;
                for (let i = 0; i < blade.segs; i++) {
                    const s = Math.sin(globalTime * 1.4 + this.x * 0.012 + i + blade.ox * 0.05) * (i * 2.2) * blade.bend;
                    const ny = -(i + 1) * segH;
                    const nx = blade.ox + s;
                    ctx.quadraticCurveTo(cx, ny + segH * 0.55, nx, ny);
                    cx = nx;
                }
                ctx.strokeStyle = `hsla(${blade.hue + 20}, 60%, 44%, 0.50)`;
                ctx.lineWidth = 3.5 * this.size;
                ctx.stroke();
            });

        } else if (this.type === 'coral') {
            // draw in two passes: thick base first then tips with bright color
            const hue = parseInt(this.color.match(/\d+/)[0]);
            this.branches.forEach((b) => {
                const t = b.depth / 4;
                ctx.strokeStyle = `hsla(${hue + t * 40}, 72%, ${22 + t * 16}%, 0.92)`;
                ctx.lineWidth = b.w;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(b.x1, b.y1);
                ctx.lineTo(b.x2, b.y2);
                ctx.stroke();
            });
            // tiny glowing tip dots
            this.branches.forEach((b) => {
                if (b.depth >= 4) {
                    ctx.fillStyle = `hsla(${hue + 60}, 80%, 60%, 0.85)`;
                    ctx.beginPath();
                    ctx.arc(b.x2, b.y2, 3.5 * this.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

        } else if (this.type === 'kelp') {
            this.fronds.forEach((frond, idx) => {
                const sway = Math.sin(globalTime * (1.0 + idx * 0.04) + this.x * 0.012 + this.phase) * 18 * frond.bend;
                ctx.beginPath();
                ctx.moveTo(frond.offset, 0);
                ctx.bezierCurveTo(
                    frond.offset + sway * 0.25, -frond.h * 0.32,
                    frond.offset + sway * 0.85, -frond.h * 0.75,
                    frond.offset + sway * 0.7, -frond.h
                );
                ctx.strokeStyle = `hsla(${frond.hue}, 50%, 22%, 0.88)`;
                ctx.lineWidth = 7 * this.size;
                ctx.lineCap = 'round';
                ctx.stroke();
                // leaf bumps along stipe
                for (let s = 0.25; s < 1.0; s += 0.28) {
                    const lx = frond.offset + sway * s * 0.7;
                    const ly = -frond.h * s;
                    const side = (idx % 2 === 0 ? 1 : -1);
                    ctx.beginPath();
                    ctx.ellipse(lx + side * 10 * this.size, ly, 9 * this.size, 4 * this.size, -0.4 * side, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${frond.hue + 18}, 55%, 30%, 0.70)`;
                    ctx.fill();
                }
            });

        } else if (this.type === 'anemone') {
            // fat base body
            const hue = parseInt(this.color.match(/\d+/)[0]);
            ctx.fillStyle = `hsla(${hue}, 55%, 28%, 0.88)`;
            ctx.beginPath();
            ctx.ellipse(0, -5 * this.size, 16 * this.size, 10 * this.size, 0, 0, Math.PI * 2);
            ctx.fill();
            // tentacles radiating upward in a semicircle
            this.petals.forEach((p, idx) => {
                const wiggle = Math.sin(globalTime * 2.6 + p.phase + idx * 0.22) * 5 * this.size;
                const ex = Math.cos(p.angle) * p.len + wiggle;
                const ey = -Math.abs(Math.sin(p.angle) * p.len) - 5 * this.size;
                ctx.beginPath();
                ctx.moveTo(0, -5 * this.size);
                ctx.quadraticCurveTo(ex * 0.45 + wiggle * 0.3, ey * 0.5, ex, ey);
                ctx.strokeStyle = `hsla(${p.hue}, 65%, 48%, 0.82)`;
                ctx.lineWidth = 3 * this.size;
                ctx.lineCap = 'round';
                ctx.stroke();
                // tiny bulb tip
                ctx.fillStyle = `hsla(${p.hue + 30}, 75%, 58%, 0.85)`;
                ctx.beginPath();
                ctx.arc(ex, ey, 3 * this.size, 0, Math.PI * 2);
                ctx.fill();
            });

        } else if (this.type === 'clam') {
            const open = 0.55 + Math.sin(globalTime * 1.6 + this.phase) * 0.22;
            const hue = parseInt(this.color.match(/\d+/)[0]);
            // lower shell
            ctx.fillStyle = `hsla(${hue}, 40%, 34%, 0.92)`;
            ctx.beginPath();
            ctx.ellipse(0, 0, 20 * this.size, 8 * this.size, 0, Math.PI, Math.PI * 2);
            ctx.fill();
            // shell ridges
            for (let r = 0.3; r <= 1.0; r += 0.35) {
                ctx.beginPath();
                ctx.ellipse(0, 0, 20 * this.size * r, 8 * this.size * r, 0, Math.PI, Math.PI * 2);
                ctx.strokeStyle = `hsla(${hue + 20}, 42%, 46%, 0.45)`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
            // upper shell
            ctx.fillStyle = `hsla(${hue + 15}, 42%, 40%, 0.92)`;
            ctx.beginPath();
            ctx.ellipse(0, -2 * this.size, 20 * this.size, 8 * this.size * open, 0, 0, Math.PI);
            ctx.fill();
            // pearl
            if (this.hasPearl) {
                const pGrad = ctx.createRadialGradient(-3 * this.size, -5 * this.size, 1, 0, -3 * this.size, 7 * this.size);
                pGrad.addColorStop(0, 'rgba(255,255,255,0.95)');
                pGrad.addColorStop(0.5, 'rgba(220,210,235,0.9)');
                pGrad.addColorStop(1, 'rgba(180,170,210,0.7)');
                ctx.fillStyle = pGrad;
                ctx.beginPath();
                ctx.arc(0, -3 * this.size, 5.5 * this.size, 0, Math.PI * 2);
                ctx.fill();
            }

        } else if (this.type === 'rock') {
            this.rocks.forEach((r) => {
                ctx.save();
                ctx.translate(r.ox, r.oy);
                ctx.rotate(r.rot);
                const rGrad = ctx.createRadialGradient(-r.rx * 0.3, -r.ry * 0.4, 2, 0, 0, r.rx);
                rGrad.addColorStop(0, `hsl(210, 12%, ${r.lightness + 14}%)`);
                rGrad.addColorStop(1, `hsl(215, 10%, ${r.lightness}%)`);
                ctx.fillStyle = rGrad;
                ctx.beginPath();
                ctx.ellipse(0, 0, r.rx, r.ry, 0, 0, Math.PI * 2);
                ctx.fill();
                // mossy highlight line
                ctx.strokeStyle = 'rgba(80,160,90,0.28)';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.ellipse(0, -r.ry * 0.35, r.rx * 0.7, r.ry * 0.25, 0, Math.PI, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            });

        } else if (this.type === 'starfish') {
            const hue = parseInt(this.color.match(/\d+/)[0]);
            const wobble = Math.sin(globalTime * 0.9 + this.phase) * 0.04;
            const armLen = 18 * this.size;
            const innerR = 7 * this.size;
            ctx.save();
            ctx.rotate(this.starRot + wobble);
            ctx.fillStyle = `hsla(${hue}, 62%, 36%, 0.90)`;
            ctx.beginPath();
            for (let i = 0; i < 10; i++) {
                const r = i % 2 === 0 ? armLen : innerR;
                const a = (Math.PI * 2 / 10) * i - Math.PI / 2;
                i === 0 ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
            }
            ctx.closePath();
            ctx.fill();
            // center dot
            ctx.fillStyle = `hsla(${hue + 25}, 70%, 50%, 0.92)`;
            ctx.beginPath();
            ctx.arc(0, 0, 4.5 * this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        ctx.restore();
    }
}
