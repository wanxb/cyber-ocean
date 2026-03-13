/**
 * main.js — Entry point.
 * Wires up canvas, resize, events, then starts the world.
 */
import { initWorld, spawnAtClick } from './world.js';
import { initSubmarine, isHit, openLink } from './submarine.js';
import { initRenderer, setSize, animate } from './renderer.js';

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
