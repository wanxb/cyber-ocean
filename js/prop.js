import { random, randomHsl } from './utils.js';

export class Prop {
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
