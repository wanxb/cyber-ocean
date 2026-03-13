import { random, randomHsl } from './utils.js';

const FISH_VARIANTS = ['clownfish', 'angelfish', 'tuna', 'pufferfish', 'reef'];

export class Creature {
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
