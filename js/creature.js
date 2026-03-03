import { random, randomHsl } from './utils.js';

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
        // no internal translation; centering handled by outer draw()
        let grad = ctx.createLinearGradient(-this.length/4, -this.width, -this.length/4, this.width);
        grad.addColorStop(0, '#2c3e50'); grad.addColorStop(1, '#bdc3c7');
        ctx.fillStyle = grad;

        ctx.beginPath();
        // draw a rounded body with nose at +this.length/4 and tail at -this.length/4
        ctx.arc(0, 0, this.width/1.2, Math.PI/2, -Math.PI/2);
        ctx.lineTo(-this.length/2, -this.width/4 + bodyWave * 10);
        ctx.lineTo(-this.length/2, this.width/4 + bodyWave * 10);
        ctx.closePath();
        ctx.fill();

        // tail fin
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
