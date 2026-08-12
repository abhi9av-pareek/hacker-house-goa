/**
 * Builder ID renderer — editorial poster/ID card layout.
 * 1080×1350 (4:5 — ideal for X / Instagram).
 *
 * Templates: 'classic' | 'neon' | 'minimal' | 'vintage'
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
  drawText,
  drawRule,
  drawPhotoVignette,
  drawAccentBar,
  drawHashtag,
} from './primitives.js';
import { applyStamp } from './stamps.js';

const W = 1080;
const H = 1350;
const DPR = 2;

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
    showGrid: true,
    scanlines: false,
    grain: true,
  },
};

function drawGrain(ctx, W, H) {
  ctx.save();
  ctx.globalAlpha = 0.06;
  for (let i = 0; i < W * H * 0.003; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const s = Math.random() * 2 + 0.5;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)';
    ctx.fillRect(x, y, s, s);
  }
  ctx.restore();
}

export function renderBuilderId(canvas, { image, name, role, builderClass, adjust = {}, template = 'classic', stamp = null }) {
  canvas.width = W * DPR;
  canvas.height = H * DPR;

  const ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);

  const T = TEMPLATES[template] || TEMPLATES.classic;

  const displayName = (name || 'YOUR NAME').toUpperCase();
  const displayRole = (role || 'BUILDER').toUpperCase();
  const displayClass = (builderClass?.title || 'THE BUILDER').toUpperCase();
  const classCode = builderClass?.code || 'BL-42';

  // ── Background ──────────────────────────────────────────────────────────
  ctx.fillStyle = T.bg;
  ctx.fillRect(0, 0, W, H);
  if (T.showGrid) drawGrid(ctx, W, H, 0.04, T.accent);

  // ── Header band ─────────────────────────────────────────────────────────
  const headerH = 220;
  ctx.fillStyle = T.bgAlt;
  ctx.fillRect(0, 0, W, headerH);
  drawRule(ctx, 0, headerH, W, T.line, 1);

  drawWordmarkColored(ctx, 56, 38, 0.8, T);
  drawMetaTagColored(ctx, W - 56, 58, 0.88, T);

  // Signal indicator
  if (T.glow) {
    ctx.save();
    ctx.shadowColor = T.accent;
    ctx.shadowBlur = 12;
    drawText(ctx, '● SIGNAL: ACTIVE', W - 56, 140, {
      font: `700 15px "Space Mono", monospace`,
      fill: T.accent,
      align: 'right',
      baseline: 'top',
      alpha: 1,
    });
    ctx.restore();
  } else {
    drawText(ctx, '● SIGNAL: ACTIVE', W - 56, 140, {
      font: `700 15px "Space Mono", monospace`,
      fill: T.accent,
      align: 'right',
      baseline: 'top',
      alpha: 0.8,
    });
  }

  // ── Photo panel ──────────────────────────────────────────────────────────
  const photoX = 52;
  const photoY = headerH + 30;
  const photoW = W - 104;
  const photoH = 540;
  const photoR = template === 'minimal' ? 2 : 10;

  if (T.glow) {
    ctx.save();
    ctx.shadowColor = T.accent;
    ctx.shadowBlur = 30;
    ctx.strokeStyle = T.accent;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, photoR);
    ctx.stroke();
    ctx.restore();
  }

  if (image) {
    withClipRect(ctx, photoX, photoY, photoW, photoH, photoR, (c) => {
      drawImageCover(c, image, photoX, photoY, photoW, photoH, adjust);
    });
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, photoR);
    ctx.clip();
    drawPhotoVignette(ctx, photoX, photoY, photoW, photoH, 'bottom', T.bg);
    ctx.restore();
  } else {
    ctx.fillStyle = T.bgAlt;
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, photoR);
    ctx.fill();
  }

  drawCornerMarks(ctx, photoX, photoY, photoW, photoH, T.accent, 32, 2);

  // ── Name block ───────────────────────────────────────────────────────────
  const infoY = photoY + photoH + 30;

  drawText(ctx, 'BUILDER NAME', 56, infoY, {
    font: `700 13px "Space Mono", monospace`,
    fill: T.muted,
    align: 'left',
    baseline: 'top',
  });

  let nameFontSize = 64;
  ctx.font = `900 ${nameFontSize}px "Space Grotesk", Arial Black, sans-serif`;
  while (ctx.measureText(displayName).width > W - 112 && nameFontSize > 28) {
    nameFontSize -= 2;
    ctx.font = `900 ${nameFontSize}px "Space Grotesk", Arial Black, sans-serif`;
  }

  if (T.glow) {
    ctx.save();
    ctx.shadowColor = T.accent;
    ctx.shadowBlur = 20;
    drawText(ctx, displayName, 56, infoY + 24, {
      font: `900 ${nameFontSize}px "Space Grotesk", Arial Black, sans-serif`,
      fill: T.white,
      align: 'left',
      baseline: 'top',
    });
    ctx.restore();
  } else {
    drawText(ctx, displayName, 56, infoY + 24, {
      font: `900 ${nameFontSize}px "Space Grotesk", Arial Black, sans-serif`,
      fill: T.white,
      align: 'left',
      baseline: 'top',
    });
  }

  // ── Role / Stack ──────────────────────────────────────────────────────────
  const roleY = infoY + 24 + nameFontSize + 8;
  drawRule(ctx, 56, roleY, W - 112, T.line, 1);

  drawText(ctx, 'STACK · ROLE', 56, roleY + 14, {
    font: `700 13px "Space Mono", monospace`,
    fill: T.muted,
    align: 'left',
    baseline: 'top',
  });

  let roleFontSize = 32;
  ctx.font = `700 ${roleFontSize}px "Space Mono", monospace`;
  while (ctx.measureText(displayRole).width > W - 112 && roleFontSize > 14) {
    roleFontSize -= 1;
    ctx.font = `700 ${roleFontSize}px "Space Mono", monospace`;
  }

  drawText(ctx, displayRole, 56, roleY + 36, {
    font: `700 ${roleFontSize}px "Space Mono", monospace`,
    fill: T.white,
    align: 'left',
    baseline: 'top',
  });

  // ── Builder class bar ─────────────────────────────────────────────────────
  const barY = roleY + 36 + roleFontSize + 28;
  const barH = 80;

  ctx.fillStyle = T.accent;
  ctx.fillRect(0, barY, W, barH);

  if (T.glow) {
    ctx.save();
    ctx.shadowColor = T.accent;
    ctx.shadowBlur = 24;
    ctx.fillStyle = T.accent;
    ctx.fillRect(0, barY, W, barH);
    ctx.restore();
  }

  drawText(ctx, 'BUILDER CLASS', 56, barY + barH / 2 - 22, {
    font: `700 13px "Space Mono", monospace`,
    fill: T.dark,
    align: 'left',
    baseline: 'top',
    alpha: 0.7,
  });

  let classFontSize = 30;
  ctx.font = `900 ${classFontSize}px "Space Grotesk", Arial Black, sans-serif`;
  while (ctx.measureText(displayClass).width > W - 200 && classFontSize > 14) {
    classFontSize -= 1;
    ctx.font = `900 ${classFontSize}px "Space Grotesk", Arial Black, sans-serif`;
  }

  drawText(ctx, displayClass, 56, barY + barH / 2 - 2, {
    font: `900 ${classFontSize}px "Space Grotesk", Arial Black, sans-serif`,
    fill: T.dark,
    align: 'left',
    baseline: 'top',
  });

  drawText(ctx, classCode, W - 56, barY + barH / 2, {
    font: `800 24px "Space Mono", monospace`,
    fill: T.dark,
    align: 'right',
    baseline: 'middle',
    alpha: 0.55,
  });

  // ── Footer metadata ───────────────────────────────────────────────────────
  const footerY = barY + barH + 20;

  drawText(ctx, 'HACKER HOUSE · GOA 2026', 56, footerY, {
    font: `700 15px "Space Mono", monospace`,
    fill: T.muted,
    align: 'left',
    baseline: 'top',
  });

  drawText(ctx, 'STATUS: LOCKED IN', 56, footerY + 28, {
    font: `700 15px "Space Mono", monospace`,
    fill: T.accent,
    align: 'left',
    baseline: 'top',
    alpha: 0.6,
  });

  drawText(ctx, 'MODE: SHIPPING', 56, footerY + 56, {
    font: `700 15px "Space Mono", monospace`,
    fill: T.accent,
    align: 'left',
    baseline: 'top',
    alpha: 0.6,
  });

  drawText(ctx, '#FrameInGoa', W - 56, footerY, {
    font: `800 20px "Space Grotesk", Arial, sans-serif`,
    fill: T.accentPink,
    align: 'right',
    baseline: 'top',
  });

  drawText(ctx, `SN: HHG-26-${classCode}`, W - 56, footerY + 28, {
    font: `700 13px "Space Mono", monospace`,
    fill: T.muted,
    align: 'right',
    baseline: 'top',
  });

  // Bottom accent line
  drawRule(ctx, 0, H - 6, W, T.accent, 6);

  // ── Grain / scanlines ─────────────────────────────────────────────────────
  if (T.grain) drawGrain(ctx, W, H);
  if (T.scanlines) {
    for (let y = 0; y < H; y += 3) {
      ctx.fillStyle = 'rgba(0,0,0,0.03)';
      ctx.fillRect(0, y, W, 1);
    }
  }

  // ── Stamp overlay ─────────────────────────────────────────────────────────
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
