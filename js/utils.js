// utility functions used across the project
export function random(min, max) {
    return Math.random() * (max - min) + min;
}

export function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

export function randomHsl() {
    return `hsl(${Math.random() * 360}, 70%, 60%)`;
}
