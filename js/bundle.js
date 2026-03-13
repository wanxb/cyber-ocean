// bundle.js — auto-generated 2026-03-13

// === utils.js ===
const random    = (min, max)          => Math.random() * (max - min) + min;
const lerp      = (start, end, amt)   => (1 - amt) * start + amt * end;
const randomHsl = (s = 60, l = 40)    => `hsl(${Math.random() * 360},${s}%,${l}%)`;

// === prop.js ===

class Prop {
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

// === creature.js ===

const FISH_VARIANTS = ['clownfish', 'angelfish', 'tuna', 'pufferfish', 'reef'];

class Creature {
    constructor(type) {
        this.type = type;
        this.initAttributes();
        // position will be set by the world (randomSpawn or resetPosition with dimensions)
    }

    initAttributes() {
        this.depth = random(0.3, 1);
        this.angle = 0;
        this.swimOffset = random(0, 100);
        
        switch (this.type) {
            case 'whale':
                this.length = random(170, 280);
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
                this.variant = FISH_VARIANTS[Math.floor(random(0, FISH_VARIANTS.length))];
                this.finShape = Math.random();
                break;
        }
        
        this.vx = this.speed * this.scale;
    }

    resetPosition(width, height) {
        // spawn just outside of the horizontal bounds using provided dimensions
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

        // horizontal flip based on velocity sign
        let direction = this.vx < 0 ? -1 : 1;
        // adjust origin so that body is centered regardless of direction
        // whale and large creatures have a longer front half, so offset by a quarter length
        // offset the drawing origin so the front of the body is roughly
        // centred at the true position.  using a quarter-length works well
        // for larger creatures and doesn't hurt smaller ones.
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
        let tailWag = Math.sin(globalTime * 8 + this.swimOffset) * (this.width * 0.35);
        let bodyHeight = this.width;

        if (this.variant === 'tuna') {
            bodyHeight *= 0.72;
        }
        if (this.variant === 'pufferfish') {
            bodyHeight *= 1.1;
        }

        let grad = ctx.createLinearGradient(-this.length * 0.4, 0, this.length * 0.4, 0);
        grad.addColorStop(0, this.color);
        grad.addColorStop(1, 'rgba(235,245,255,0.95)');
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.moveTo(-this.length * 0.45, 0);
        ctx.bezierCurveTo(
            -this.length * 0.15,
            -bodyHeight,
            this.length * 0.35,
            -bodyHeight * 0.75,
            this.length * 0.5,
            0
        );
        ctx.bezierCurveTo(
            this.length * 0.35,
            bodyHeight * 0.75,
            -this.length * 0.15,
            bodyHeight,
            -this.length * 0.45,
            0
        );
        ctx.fill();

        // Tail
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(-this.length * 0.42, 0);
        ctx.lineTo(-this.length * 0.68, -bodyHeight * 0.6 + tailWag);
        ctx.lineTo(-this.length * 0.58, 0 + tailWag * 0.2);
        ctx.lineTo(-this.length * 0.68, bodyHeight * 0.6 + tailWag);
        ctx.closePath();
        ctx.fill();

        // Dorsal and ventral fins
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.moveTo(-this.length * 0.05, -bodyHeight * 0.3);
        ctx.lineTo(this.length * 0.1, -bodyHeight * (0.9 + this.finShape * 0.2));
        ctx.lineTo(this.length * 0.2, -bodyHeight * 0.25);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, bodyHeight * 0.2);
        ctx.lineTo(this.length * 0.18, bodyHeight * 0.65);
        ctx.lineTo(this.length * 0.24, bodyHeight * 0.2);
        ctx.fill();

        // Variant details to improve fish identity.
        if (this.variant === 'clownfish') {
            ctx.fillStyle = 'rgba(255,255,255,0.92)';
            [0.14, -0.03, -0.18].forEach(band => {
                ctx.fillRect(this.length * band, -bodyHeight * 0.72, this.length * 0.06, bodyHeight * 1.44);
            });
        } else if (this.variant === 'angelfish') {
            ctx.fillStyle = 'rgba(245, 212, 90, 0.9)';
            ctx.beginPath();
            ctx.moveTo(-this.length * 0.05, -bodyHeight * 0.85);
            ctx.lineTo(this.length * 0.2, -bodyHeight * 1.45);
            ctx.lineTo(this.length * 0.25, -bodyHeight * 0.25);
            ctx.fill();
        } else if (this.variant === 'pufferfish') {
            ctx.strokeStyle = 'rgba(120,95,60,0.45)';
            for (let i = 0; i < 12; i++) {
                let sx = -this.length * 0.25 + i * (this.length * 0.06);
                let sy = Math.sin(i + this.swimOffset) * bodyHeight * 0.08;
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(sx, sy - bodyHeight * 0.18);
                ctx.stroke();
            }
        } else if (this.variant === 'tuna') {
            ctx.fillStyle = 'rgba(20, 40, 70, 0.38)';
            ctx.fillRect(-this.length * 0.2, -bodyHeight * 0.75, this.length * 0.6, bodyHeight * 0.45);
        }

        // Eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.length * 0.28, -bodyHeight * 0.18, this.length * 0.085, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f1a2e';
        ctx.beginPath();
        ctx.arc(this.length * 0.3, -bodyHeight * 0.18, this.length * 0.042, 0, Math.PI * 2);
        ctx.fill();
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
        let bodyWave = Math.sin(globalTime * 1.2 + this.swimOffset);
        let bodyLen = this.length * 0.86;
        let bodyH = this.width * 0.7;

        let grad = ctx.createLinearGradient(-bodyLen * 0.5, -bodyH, bodyLen * 0.5, bodyH);
        grad.addColorStop(0, '#2a3f52');
        grad.addColorStop(1, '#7f94a5');
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.moveTo(-bodyLen * 0.48, 0);
        ctx.bezierCurveTo(
            -bodyLen * 0.2,
            -bodyH,
            bodyLen * 0.45,
            -bodyH * 0.8,
            bodyLen * 0.52,
            0
        );
        ctx.bezierCurveTo(
            bodyLen * 0.45,
            bodyH * 0.8,
            -bodyLen * 0.2,
            bodyH,
            -bodyLen * 0.48,
            0
        );
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#51697d';
        ctx.beginPath();
        ctx.moveTo(-bodyLen * 0.48, bodyWave * 2);
        ctx.lineTo(-bodyLen * 0.72, -bodyH * 0.55 + bodyWave * 10);
        ctx.lineTo(-bodyLen * 0.58, -bodyH * 0.1 + bodyWave * 4);
        ctx.lineTo(-bodyLen * 0.72, bodyH * 0.55 + bodyWave * 10);
        ctx.lineTo(-bodyLen * 0.48, bodyWave * 2);
        ctx.fill();

        ctx.fillStyle = '#5f7486';
        ctx.beginPath();
        ctx.moveTo(-bodyLen * 0.02, -bodyH * 0.25);
        ctx.lineTo(bodyLen * 0.08, -bodyH * 0.95);
        ctx.lineTo(bodyLen * 0.2, -bodyH * 0.2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#f5f9ff';
        ctx.beginPath();
        ctx.arc(bodyLen * 0.28, -bodyH * 0.12, bodyH * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#102030';
        ctx.beginPath();
        ctx.arc(bodyLen * 0.3, -bodyH * 0.12, bodyH * 0.04, 0, Math.PI * 2);
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

// === submarine.js ===

const LINK = 'https://github.com/wanxb/cyber-ocean';

const submarine = {
    x: 0,
    y: 0,
    vx: 1.25,
    bobOffset: random(0, Math.PI * 2),
    bubbles: []
};

function initSubmarine(width, height) {
    submarine.x = width * 0.2;
    submarine.y = height * 0.2;
    submarine.vx = Math.random() > 0.5 ? 1.25 : -1.25;
    submarine.bubbles = [];
}

function updateSubmarine(width, globalTime) {
    submarine.x += submarine.vx;
    if (submarine.x < 90) { submarine.x = 90; submarine.vx = Math.abs(submarine.vx); }
    if (submarine.x > width - 90) { submarine.x = width - 90; submarine.vx = -Math.abs(submarine.vx); }
    submarine.y = (window.innerHeight * 0.2) + Math.sin(globalTime * 1.6 + submarine.bobOffset) * 12;

    if (Math.random() < 0.35) {
        submarine.bubbles.push({
            x: submarine.x - (submarine.vx >= 0 ? 84 : -84),
            y: submarine.y + random(-6, 6),
            r: random(1.5, 4.5),
            vy: random(-0.8, -1.6),
            vx: random(-0.3, 0.3),
            life: random(45, 80)
        });
    }
    submarine.bubbles = submarine.bubbles.filter(b => b.life > 0);
    submarine.bubbles.forEach(b => { b.x += b.vx; b.y += b.vy; b.life -= 1; });
}

function drawSubmarine(ctx, globalTime) {
    const facing = submarine.vx >= 0 ? 1 : -1;
    const propeller = Math.sin(globalTime * 20) * 8;

    // Headlight cone
    const noseX = submarine.x + (facing > 0 ? 72 : -72);
    const beamEndX = noseX + facing * 190;
    const beamGrad = ctx.createLinearGradient(noseX, submarine.y, beamEndX, submarine.y);
    beamGrad.addColorStop(0, 'rgba(255, 248, 220, 0.68)');
    beamGrad.addColorStop(1, 'rgba(255, 248, 220, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(noseX, submarine.y - 20);
    ctx.lineTo(beamEndX, submarine.y - 66);
    ctx.lineTo(beamEndX, submarine.y + 66);
    ctx.lineTo(noseX, submarine.y + 20);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.translate(submarine.x, submarine.y);
    ctx.scale(facing, 1);

    // Hull
    const bodyGrad = ctx.createLinearGradient(-74, 0, 74, 0);
    bodyGrad.addColorStop(0, '#f7a63f');
    bodyGrad.addColorStop(0.55, '#ffd767');
    bodyGrad.addColorStop(1, '#ffbb4f');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(-74, -24, 148, 48, 24);
    ctx.fill();

    // Nose cap
    ctx.fillStyle = '#ffd98b';
    ctx.beginPath();
    ctx.ellipse(74, 0, 16, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Conning tower + periscope
    ctx.fillStyle = '#f05f68';
    ctx.beginPath();
    ctx.roundRect(-10, -44, 38, 22, 9);
    ctx.fill();
    ctx.strokeStyle = '#fbe4a6';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(15, -44); ctx.lineTo(15, -60); ctx.lineTo(31, -60);
    ctx.stroke();

    // Portholes
    [-34, -2, 30].forEach(wx => {
        ctx.beginPath();
        ctx.arc(wx, 0, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#d9f6ff';
        ctx.fill();
        ctx.strokeStyle = 'rgba(40, 52, 75, 0.45)';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Rivets
    ctx.fillStyle = 'rgba(245, 154, 63, 0.95)';
    [-56, -42, -28, -14, 0, 14, 28, 42, 56].forEach(rx => {
        ctx.beginPath();
        ctx.arc(rx, 17, 2.1, 0, Math.PI * 2);
        ctx.fill();
    });

    // Side fin
    ctx.fillStyle = '#ff8a5d';
    ctx.beginPath();
    ctx.moveTo(-8, 24); ctx.lineTo(14, 24); ctx.lineTo(4, 38);
    ctx.closePath();
    ctx.fill();

    // Smile
    ctx.strokeStyle = 'rgba(40, 30, 70, 0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(43, 9, 9, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Propeller pod
    ctx.fillStyle = '#f05f68';
    ctx.beginPath();
    ctx.roundRect(-89, -13, 16, 26, 8);
    ctx.fill();

    // Propeller blades
    ctx.strokeStyle = '#d9ecff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-90, 0); ctx.lineTo(-106, propeller);
    ctx.moveTo(-90, 0); ctx.lineTo(-106, -propeller);
    ctx.stroke();

    // GitHub badge 鈥?on the conning tower face, hull-matching background
    // Tower occupies local x[-10,28] y[-44,-22]; badge sits centred on it
    const ghS = 19;
    const ghTX = 9;   // horizontally centred on tower
    const ghTY = -33; // vertically centred in tower
    ctx.beginPath();
    ctx.arc(ghTX, ghTY, ghS / 2 + 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#e05060';   // slightly brighter red, same family as tower
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.save();
    ctx.translate(ghTX - ghS / 2, ghTY - ghS / 2);
    ctx.scale(ghS / 24, ghS / 24);
    ctx.fillStyle = '#ffffff';
    ctx.fill(new Path2D('M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'));
    ctx.restore();

    ctx.restore();

    // Bubble trail
    submarine.bubbles.forEach(b => {
        ctx.fillStyle = `rgba(210, 240, 255, ${Math.max(0, b.life / 80) * 0.55})`;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
    });
}

function isHit(x, y) {
    return Math.abs(x - submarine.x) <= 106 && Math.abs(y - submarine.y) <= 62;
}

function openLink() {
    const a = document.createElement('a');
    a.href = LINK;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
}

// === world.js ===
/**
 * world.js 鈥?Scene initialisation.
 * Owns: entity list, prop list, spotlight, spawn logic.
 */

// 鈹€鈹€ Spotlight 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
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

// 鈹€鈹€ World state 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
let entities = [];
let props    = [];
const spotlight = new Spotlight();

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

function initWorld(width, height) {
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

function spawnAtClick(x, y, width, height) {
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

// === renderer.js ===
/**
 * renderer.js 鈥?Render loop and canvas drawing helpers.
 * Owns: animate(), drawBackground(), particle overlay.
 */

let globalTime = 0;
let _ctx, _width, _height;

function initRenderer(ctx, width, height) {
    _ctx    = ctx;
    _width  = width;
    _height = height;
}

function setSize(width, height) {
    _width  = width;
    _height = height;
}

function drawBackground() {
    const grad = _ctx.createLinearGradient(0, 0, 0, _height);
    grad.addColorStop(0,   '#00050d');
    grad.addColorStop(0.5, '#001828');
    grad.addColorStop(1,   '#002538');
    _ctx.fillStyle = grad;
    _ctx.fillRect(0, 0, _width, _height);
}

function drawOverlay() {
    // Radial vignette 鈥?edges dark, centre mostly clear
    const rad = _ctx.createRadialGradient(
        _width / 2, _height / 2, _height * 0.2,
        _width / 2, _height / 2, _height * 0.9
    );
    rad.addColorStop(0, 'rgba(0,4,12,0.05)');
    rad.addColorStop(1, 'rgba(0,2,6,0.72)');
    _ctx.fillStyle = rad;
    _ctx.fillRect(0, 0, _width, _height);

    // Floating particles
    _ctx.fillStyle = 'rgba(255,255,255,0.1)';
    for (let i = 0; i < 20; i++) {
        const dx = (Math.sin(globalTime * 0.5 + i) * _width + i * 100) % _width;
        const dy = (globalTime * 10 + i * 50) % _height;
        if (dx >= 0 && dy >= 0) _ctx.fillRect(dx, dy, 1, 1);
    }
}

function animate() {
    globalTime += 0.02;

    drawBackground();
    updateSubmarine(_width, globalTime);

    spotlight.update(entities, _width, globalTime);
    spotlight.draw(_ctx, _width, _height);

    drawSubmarine(_ctx, globalTime);

    props.forEach(p => p.draw(_ctx, globalTime));

    entities.sort((a, b) => a.depth - b.depth);
    entities.forEach(e => { e.update(globalTime, _width); e.draw(_ctx, globalTime); });

    drawOverlay();
    requestAnimationFrame(animate);
}

// === main.js ===
/**
 * main.js 鈥?Entry point.
 * Wires up canvas, resize, events, then starts the world.
 */

const canvas = document.getElementById('tankCanvas');
const ctx    = canvas.getContext('2d');

function applySize() {
    const w   = window.innerWidth;
    const h   = window.innerHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width        = Math.floor(w * dpr);
    canvas.height       = Math.floor(h * dpr);
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
}

// Boot
let { w, h } = applySize();
initRenderer(ctx, w, h);
initWorld(w, h);
initSubmarine(w, h);
animate();

// Resize
window.addEventListener('resize', () => {
    const size = applySize();
    setSize(size.w, size.h);
});

// Interaction
canvas.addEventListener('mousemove', e => {
    canvas.style.cursor = isHit(e.clientX, e.clientY) ? 'pointer' : 'default';
});
canvas.addEventListener('click', e => {
    if (isHit(e.clientX, e.clientY)) { openLink(); return; }
    spawnAtClick(e.clientX, e.clientY, window.innerWidth, window.innerHeight);
});

