import { lerp } from './utils.js';

export class Spotlight {
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
        // 寻找最大的生物
        let candidates = entities.filter(e => 
            e.scale > 0.6 && 
            e.x > -100 && e.x < width + 100 // 稍微放宽范围
        );
        candidates.sort((a, b) => b.scale - a.scale);
        
        if (candidates.length > 0) {
            // 避免所有灯都照同一个
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
            // 巡逻模式
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
