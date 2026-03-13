import { random } from './utils.js';

const LINK = 'https://github.com/wanxb/cyber-ocean';

export const submarine = {
    x: 0,
    y: 0,
    vx: 1.25,
    bobOffset: random(0, Math.PI * 2),
    bubbles: []
};

export function initSubmarine(width, height) {
    submarine.x = width * 0.2;
    submarine.y = height * 0.2;
    submarine.vx = Math.random() > 0.5 ? 1.25 : -1.25;
    submarine.bubbles = [];
}

export function updateSubmarine(width, globalTime) {
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

export function drawSubmarine(ctx, globalTime) {
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

    // GitHub badge — on the conning tower face, hull-matching background
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

export function isHit(x, y) {
    return Math.abs(x - submarine.x) <= 106 && Math.abs(y - submarine.y) <= 62;
}

export function openLink() {
    const a = document.createElement('a');
    a.href = LINK;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
}
