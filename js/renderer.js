/**
 * renderer.js — Render loop and canvas drawing helpers.
 * Owns: animate(), drawBackground(), particle overlay.
 */
import { entities, props, spotlight } from './world.js';
import { updateSubmarine, drawSubmarine } from './submarine.js';

export let globalTime = 0;
let _ctx, _width, _height;

export function initRenderer(ctx, width, height) {
    _ctx    = ctx;
    _width  = width;
    _height = height;
}

export function setSize(width, height) {
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
    // Radial vignette — edges dark, centre mostly clear
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

export function animate() {
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
