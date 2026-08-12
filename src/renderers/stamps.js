/**
 * Stamp / badge overlay primitives for HH Goa 2026 renderers.
 * Draws a rotated "rubber stamp" style text badge anywhere on the canvas.
 */

import { COLORS } from './primitives.js';

/**
 * Draw a rotated stamp badge.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx — center X in canvas units
 * @param {number} cy — center Y in canvas units
 * @param {string} text — stamp label (e.g. "SHIPPING")
 * @param {object} opts
 */
export function drawStamp(ctx, cx, cy, text, {
  size = 200,          // bounding box size
  rotate = -18,        // degrees
  color = COLORS.accentPink,
  opacity = 0.88,
  emoji = '',
} = {}) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(cx, cy);
  ctx.rotate((rotate * Math.PI) / 180);

  const pad = size * 0.14;
  const w = size;
  const h = size * 0.42;
  const r = h * 0.15;

  // Outer rectangle border (double stroke for stamp feel)
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.034;
  ctx.lineCap = 'square';
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, r);
  ctx.stroke();

  // Inner inset border
  const inset = size * 0.045;
  ctx.lineWidth = size * 0.018;
  ctx.beginPath();
  ctx.roundRect(-w / 2 + inset, -h / 2 + inset, w - inset * 2, h - inset * 2, r * 0.5);
  ctx.stroke();

  // Text
  const fontSize = size * 0.185;
  ctx.font = `900 ${fontSize}px "Space Grotesk", Arial Black, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji ? `${emoji} ${text}` : text, 0, 0);

  // Grunge dots (texture effect)
  ctx.globalAlpha = opacity * 0.12;
  for (let i = 0; i < 28; i++) {
    const gx = (Math.random() - 0.5) * w * 0.9;
    const gy = (Math.random() - 0.5) * h * 0.8;
    const gr = Math.random() * size * 0.018 + size * 0.006;
    ctx.beginPath();
    ctx.arc(gx, gy, gr, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Map stamp ID to display config.
 */
export const STAMPS = {
  shipping: { text: 'SHIPPING', emoji: '🚀', rotate: -14, color: '#e2f542' },
  building: { text: 'BUILDING', emoji: '⚡', rotate: -18, color: '#e8368f' },
  hacking:  { text: 'HACKING',  emoji: '🛠', rotate: -16, color: '#e2f542' },
  vibing:   { text: 'VIBING',   emoji: '🌊', rotate: -12, color: '#60efff' },
  lockedin: { text: 'LOCKED IN', emoji: '🔒', rotate: -20, color: '#e2f542' },
};

/**
 * Place a stamp in the bottom-left area of the canvas.
 */
export function applyStamp(ctx, W, H, stampId) {
  if (!stampId || !STAMPS[stampId]) return;
  const cfg = STAMPS[stampId];
  const size = Math.min(W, H) * 0.26;
  // Bottom-left quadrant with slight inset
  const cx = W * 0.14 + size * 0.4;
  const cy = H * 0.86 - size * 0.1;
  drawStamp(ctx, cx, cy, cfg.text, {
    size,
    rotate: cfg.rotate,
    color: cfg.color,
    emoji: cfg.emoji,
    opacity: 0.9,
  });
}
