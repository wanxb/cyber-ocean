export const random    = (min, max)          => Math.random() * (max - min) + min;
export const lerp      = (start, end, amt)   => (1 - amt) * start + amt * end;
export const randomHsl = (s = 60, l = 40)    => `hsl(${Math.random() * 360},${s}%,${l}%)`;
