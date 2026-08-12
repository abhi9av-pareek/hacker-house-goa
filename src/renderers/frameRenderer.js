/**
 * Frame renderer — square 1:1 output, suitable for X profile pictures.
 * Photo is the hero; HH Goa branding frames it without covering the face.
 *
 * Templates:
 *   'classic'  — original dark forest + acid yellow (default)
 *   'neon'     — near-black base, electric neon borders + glow
 *   'minimal'  — ultra-clean, thin single border, no grid
 *   'vintage'  — muted warm tones, grain texture, print aesthetic
 */
import {
  COLORS,
  drawGrid,
  drawCornerMarks,
  drawCrosshair,
  drawImageCover,
  withClipRect,
  drawWordmark,
  drawMetaTag,
  drawHashtag,
  drawText,
  drawRule,
  drawPhotoVignette,
} from './primitives.js';
import { applyStamp } from './stamps.js';

const W = 1080;
const H = 1080;
const DPR = 2; // Retina output

// ── Template palettes ──────────────────────────────────────────────────────

const TEMPLATES = {
  classic: {
    bg: '#0d1a10',
    bgAlt: '#111c14',
    accent: '#e2f542',
    accentPink: '#e8368f',
    white: '#f4f0e8',
    muted: '#7a9e82',
    line: 'rgba(226,245,66,0.18)',
    dark: '#050c07',
    ringColor: '#e2f542',
    showGrid: true,
    scanlines: true,
  },
  neon: {
    bg: '#050a0f',
    bgAlt: '#08111a',
    accent: '#00f5ff',
    accentPink: '#ff2d78',
    white: '#e8f4ff',
    muted: '#4a7a9b',
    line: 'rgba(0,245,255,0.18)',
    dark: '#000509',
    ringColor: '#00f5ff',
    showGrid: true,
    scanlines: true,
    glow: true,
  },
  minimal: {
    bg: '#0a0a0a',
    bgAlt: '#111111',
    accent: '#ffffff',
    accentPink: '#e8368f',
    white: '#ffffff',
    muted: '#666666',
    line: 'rgba(255,255,255,0.12)',
    dark: '#000000',
    ringColor: '#ffffff',
    showGrid: false,
    scanlines: false,
  },
  vintage: {
    bg: '#1a1208',
    bgAlt: '#221a0a',
    accent: '#f0c040',
    accentPink: '#c0522a',
    white: '#f5ead5',
    muted: '#8a7055',
    line: 'rgba(240,192,64,0.2)',
    dark: '#0a0800',
    ringColor: '#f0c040',
    showGrid: true,
    scanlines: false,
    grain: true,
  },
};

function drawNeonGlow(ctx, cx, cy, radius, color) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 28;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawGrain(ctx, W, H) {
  ctx.save();
  ctx.globalAlpha = 0.06;
  for (let i = 0; i < W * H * 0.004; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const s = Math.random() * 2 + 0.5;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)';
    ctx.fillRect(x, y, s, s);
  }
  ctx.restore();
}

export function renderFrame(canvas, { image, adjust = {}, template = 'classic', stamp = null }) {
  canvas.width = W * DPR;
  canvas.height = H * DPR;

  const ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);

  const T = TEMPLATES[template] || TEMPLATES.classic;

  // ── Background ──────────────────────────────────────────────────────────
  ctx.fillStyle = T.bg;
  ctx.fillRect(0, 0, W, H);
  if (T.showGrid) drawGrid(ctx, W, H, 0.045, T.accent);

  // ── Photo — circular clipped ─────────────────────────────────────────────
  const cx = W / 2;
  const cy = H / 2;
  const radius = 390;

  if (T.glow) drawNeonGlow(ctx, cx, cy, radius + 24, T.accent);

  if (image) {
    withClipRect(ctx, cx - radius, cy - radius, radius * 2, radius * 2, radius, (c) => {
      drawImageCover(c, image, cx - radius, cy - radius, radius * 2, radius * 2, adjust);
    });
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();
    drawPhotoVignette(ctx, cx - radius, cy - radius, radius * 2, radius * 2, 'bottom', T.bg);
    ctx.restore();
  } else {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = T.bgAlt;
    ctx.fill();
    ctx.restore();
  }

  // ── Circular border — triple ring ────────────────────────────────────────
  ctx.save();
  if (T.glow) {
    ctx.shadowColor = T.accent;
    ctx.shadowBlur = 16;
  }
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 8, 0, Math.PI * 2);
  ctx.strokeStyle = T.ringColor;
  ctx.lineWidth = template === 'minimal' ? 1.5 : 3;
  ctx.stroke();
  ctx.shadowBlur = 0;

  if (template !== 'minimal') {
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 16, 0, Math.PI * 2);
    ctx.strokeStyle = T.line;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 24, 0, Math.PI * 2);
    ctx.strokeStyle = T.accent.replace(')', ',0.3)').replace('rgb', 'rgba');
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 12]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();

  // ── Corner registration marks ─────────────────────────────────────────────
  const pad = 40;
  drawCornerMarks(ctx, pad, pad, W - pad * 2, H - pad * 2, T.accent, 42, 2.5);

  // ── Crosshairs ───────────────────────────────────────────────────────────
  if (template !== 'minimal') {
    drawCrosshair(ctx, cx, pad + 22, 10, T.accent, 0.6);
    drawCrosshair(ctx, cx, H - pad - 22, 10, T.accent, 0.6);
    drawCrosshair(ctx, pad + 22, cy, 10, T.accent, 0.6);
    drawCrosshair(ctx, W - pad - 22, cy, 10, T.accent, 0.6);
  }

  // ── Wordmark — top left ───────────────────────────────────────────────────
  drawWordmarkColored(ctx, 52, 48, 0.72, T);

  // ── Meta tag — top right ──────────────────────────────────────────────────
  drawMetaTagColored(ctx, W - 52, 64, 0.82, T);

  // ── Bottom band ───────────────────────────────────────────────────────────
  drawRule(ctx, pad, H - 120, W - pad * 2, T.line, 1);

  drawText(ctx, 'LESS NOISE.', 52, H - 108, {
    font: `700 18px "Space Mono", monospace`,
    fill: T.muted,
    align: 'left',
    baseline: 'top',
  });
  drawText(ctx, 'MORE SIGNAL.', 52, H - 83, {
    font: `800 18px "Space Mono", monospace`,
    fill: T.white,
    align: 'left',
    baseline: 'top',
  });

  drawText(ctx, 'FRAME-01', W - 52, H - 108, {
    font: `700 14px "Space Mono", monospace`,
    fill: T.muted,
    align: 'right',
    baseline: 'top',
  });

  drawText(ctx, '#FrameInGoa', W - 52, H - 85, {
    font: `800 20px "Space Grotesk", Arial, sans-serif`,
    fill: T.accentPink,
    align: 'right',
    baseline: 'top',
  });

  // ── Vintage grain ──────────────────────────────────────────────────────
  if (T.grain) drawGrain(ctx, W, H);

  // ── Scan line texture ──────────────────────────────────────────────────
  if (T.scanlines) {
    for (let y = 0; y < H; y += 3) {
      ctx.fillStyle = 'rgba(0,0,0,0.04)';
      ctx.fillRect(0, y, W, 1);
    }
  }

  // ── Stamp overlay ─────────────────────────────────────────────────────
  if (stamp) applyStamp(ctx, W, H, stamp);
}

// ── Colored helpers ────────────────────────────────────────────────────────

function drawWordmarkColored(ctx, x, y, scale, T) {
  const S = scale;
  drawText(ctx, 'HH', x, y, {
    font: `900 ${Math.round(90 * S)}px "Space Grotesk", Arial Black, sans-serif`,
    fill: T.white,
    align: 'left',
    baseline: 'top',
  });
  drawText(ctx, 'GOA', x, y + Math.round(84 * S), {
    font: `900 ${Math.round(90 * S)}px "Space Grotesk", Arial Black, sans-serif`,
    fill: T.accent,
    align: 'left',
    baseline: 'top',
  });
  drawText(ctx, '2026', x + Math.round(4 * S), y + Math.round(170 * S), {
    font: `700 ${Math.round(26 * S)}px "Space Mono", monospace`,
    fill: T.muted,
    align: 'left',
    baseline: 'top',
  });
}

function drawMetaTagColored(ctx, x, y, scale, T) {
  const S = scale;
  drawText(ctx, 'GOA, INDIA', x, y, {
    font: `700 ${Math.round(20 * S)}px "Space Mono", monospace`,
    fill: T.muted,
    align: 'right',
    baseline: 'top',
  });
  drawText(ctx, '28–31 OCT 2026', x, y + Math.round(30 * S), {
    font: `700 ${Math.round(20 * S)}px "Space Mono", monospace`,
    fill: T.accent,
    align: 'right',
    baseline: 'top',
  });
}
